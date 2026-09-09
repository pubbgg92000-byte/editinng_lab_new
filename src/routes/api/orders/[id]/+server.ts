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
	const order = await getOrder(database, params.id);
	return order ? json({ order, activity: await listOrderActivity(database, params.id) }) : json({ error: 'Order not found' }, { status: 404 });
};

export const PATCH = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const input = await request.json();
	const configuration = await getTenantConfiguration(database, locals.tenant!);
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
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, order });
};

export const POST = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
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
