import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { archiveOrder, getOrder, listOrderActivity, permanentlyDeleteOrder, restoreOrder, updateOrder } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const GET = async ({ params, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	const order = await getOrder(database, params.id);
	return order ? json({ order, activity: await listOrderActivity(database, params.id) }) : json({ error: 'Order not found' }, { status: 404 });
};

export const PATCH = async ({ params, request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	const input = await request.json();
	const allowedStatuses = ['Historical', 'Received', 'Assigned', 'Editing', 'Waiting Review', 'Revision', 'Ready Delivery', 'Delivered', 'Stopped', 'Completed'];
	if (input.status && !allowedStatuses.includes(input.status)) return json({ error: 'Unknown order status.' }, { status: 400 });
	if (input.status === 'Delivered') {
		const currentOrder = await getOrder(database, params.id);
		if (!currentOrder) return json({ error: 'Order not found.' }, { status: 404 });
		if (currentOrder.priceSet === false) return json({ error: 'Set the final total before marking this order as delivered.' }, { status: 409 });
		const balance = Math.max(0, currentOrder.price - currentOrder.discount - currentOrder.paid);
		if (balance > 0.009) return json({ error: `Collect the remaining balance of ₹${balance.toLocaleString('en-IN')} before marking this order as delivered.` }, { status: 409 });
		const hasDigitalOutput = currentOrder.tasks.some((task) => !task.archived && task.status === 'Completed' && Boolean(task.outputLink?.trim()));
		const deliveryMethod = input.deliveryMethod === 'offline' ? 'offline' : input.deliveryMethod === 'digital' ? 'digital' : currentOrder.deliveryMethod;
		if (!hasDigitalOutput && deliveryMethod !== 'offline') return json({ error: 'Add a completed task output link, or choose physical/offline delivery before marking this order delivered.' }, { status: 409 });
		if (deliveryMethod === 'digital' && !hasDigitalOutput) return json({ error: 'Digital delivery requires a completed task output link.' }, { status: 409 });
		input.deliveryMethod = deliveryMethod || (hasDigitalOutput ? 'digital' : '');
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
	await flushSheetSync(database);
	return json({ ok: true, order });
};

export const POST = async ({ params, request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	const database = await readyDatabase(platform);
	if (input.action === 'restore') {
		const order = await restoreOrder(database, params.id);
		if (!order) return json({ error: 'Archived order not found.' }, { status: 404 });
		const sync = await flushSheetSync(database);
		return json({ ok: true, order, sync });
	}
	if (input.action === 'delete-permanently') {
		const deleted = await permanentlyDeleteOrder(database, params.id);
		if (!deleted) return json({ error: 'Only an archived order can be permanently deleted.' }, { status: 409 });
		const sync = await flushSheetSync(database);
		return json({ ok: true, deleted, sync });
	}
	return json({ error: 'Unknown action.' }, { status: 400 });
};

export const DELETE = async ({ params, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	const order = await archiveOrder(database, params.id);
	if (!order) return json({ error: 'Order not found or already archived.' }, { status: 404 });
	const sync = await flushSheetSync(database);
	return json({ ok: true, order, sync });
};
