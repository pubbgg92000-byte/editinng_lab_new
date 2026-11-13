// Order record API: edit, archive, restore, permanent delete, delivery, and flags.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { archiveOrder, getOrder, listOrderActivity, permanentlyDeleteOrder, restoreOrder, updateOrder } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability, validateCustomValues } from '$lib/capabilities';

export const GET = async ({ params, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const [order, activity] = await Promise.all([getOrder(database, params.id), listOrderActivity(database, params.id)]);
	return order ? json({ order, activity }) : json({ error: 'Order not found' }, { status: 404 });
};

export const PATCH = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const input = await request.json().catch(() => null);
	if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ error: 'Invalid request body.' }, { status: 400 });
	// Server-owned fields: derived from payments, imports, notifications, or the delivery flow.
	for (const key of ['id', 'serial', 'historical', 'paid', 'initialAdvance', 'advanceSet', 'payments', 'tasks', 'archived', 'createdAt', 'customerNotifiedAt']) delete input[key];
	if (input.status !== 'Delivered') delete input.deliveredAt;
	// Validate every numeric field on its own so a discount- or progress-only update can't store NaN.
	for (const key of ['price', 'discount', 'progress']) {
		if (input[key] === undefined) continue;
		const value = Number(input[key]);
		if (!Number.isFinite(value) || value < 0 || (key === 'progress' && value > 100)) return json({ error: key === 'progress' ? 'Progress must be between 0 and 100.' : 'Total and discount must be valid positive amounts.' }, { status: 400 });
		input[key] = value;
	}
	if (input.priceSet !== undefined) input.priceSet = Boolean(input.priceSet);
	if (input.important !== undefined) input.important = Boolean(input.important);
	const configuration = await getTenantConfiguration(database, locals.tenant!);
	if (input.customerId !== undefined && input.customerId !== null) {
		const customer = await database.prepare('SELECT id FROM customers WHERE id = ? AND archived_at IS NULL').bind(String(input.customerId)).first();
		if (!customer) return json({ error: 'Choose an active customer.' }, { status: 400 });
	}
	try {
		if (input.customFields !== undefined) {
			if (hasCapability(configuration.effectiveCapabilities, 'customFields')) input.customFields = validateCustomValues(configuration.profile, 'order', input.customFields);
			else delete input.customFields;
		}
	} catch (cause) { return json({ error: cause instanceof Error ? cause.message : 'Custom fields are invalid.' }, { status: 400 }); }
	const allowedStatuses = ['Historical', 'Received', 'Assigned', 'Editing', 'Waiting Review', 'Revision', 'Ready Delivery', 'Delivered', 'Stopped', 'Completed'];
	if (input.status && !allowedStatuses.includes(input.status)) return json({ error: 'Unknown order status.' }, { status: 400 });
	if (input.status === 'Delivered') {
		if (!hasCapability(configuration.effectiveCapabilities, 'workflow.delivery')) return json({ error: 'Delivery is not available for this workspace.' }, { status: 403 });
		const currentOrder = await getOrder(database, params.id);
		if (!currentOrder) return json({ error: 'Order not found.' }, { status: 404 });
		const hasDigitalOutput = currentOrder.tasks.some((task) => !task.archived && task.status === 'Completed' && Boolean(task.outputLink?.trim()));
		const deliveryMethod = input.deliveryMethod === 'offline' ? 'offline' : input.deliveryMethod === 'digital' ? 'digital' : currentOrder.deliveryMethod;
		input.deliveryMethod = deliveryMethod || (hasDigitalOutput ? 'digital' : 'offline');
		input.deliveredAt = input.deliveredAt || new Date().toISOString();
	}
	if (input.price !== undefined) {
		const price = Number(input.price);
		const discount = Number(input.discount || 0);
		if (!Number.isFinite(price) || price < 0 || !Number.isFinite(discount) || discount < 0) return json({ error: 'Total and discount must be valid positive amounts.' }, { status: 400 });
		if (discount > price) return json({ error: 'Discount cannot be greater than the total amount.' }, { status: 400 });
		input.priceSet = true;
	}
	let order;
	try { order = await updateOrder(database, params.id, input); }
	catch (cause) { return json({ error: cause instanceof Error ? cause.message : 'Unable to update order.' }, { status: 400 }); }
	if (!order) return json({ error: 'Order not found' }, { status: 404 });
	flushSheetSync(database, locals.tenant!).catch(() => {});
	return json({ ok: true, order });
};

export const POST = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json().catch(() => ({}));
	const database = await readyDatabase(locals.tenant);
	if (input.action === 'restore') {
		const order = await restoreOrder(database, params.id);
		if (!order) return json({ error: 'Archived order not found.' }, { status: 404 });
		const sync = await flushSheetSync(database, locals.tenant!);
		return json({ ok: true, order, sync });
	}
	if (input.action === 'delete-permanently') {
		const deleted = await permanentlyDeleteOrder(database, params.id);
		if (!deleted) return json({ error: 'Only an archived order can be permanently deleted.' }, { status: 409 });
		const sync = await flushSheetSync(database, locals.tenant!);
		return json({ ok: true, deleted, sync });
	}
	return json({ error: 'Unknown action.' }, { status: 400 });
};

export const DELETE = async ({ params, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const order = await archiveOrder(database, params.id);
	if (!order) return json({ error: 'Order not found or already archived.' }, { status: 404 });
	const sync = await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, order, sync });
};
