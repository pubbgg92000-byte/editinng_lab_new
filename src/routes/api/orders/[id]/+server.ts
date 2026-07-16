import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getOrder, listOrderActivity, updateOrder } from '$lib/server/repository';
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
	const order = await updateOrder(database, params.id, await request.json());
	if (!order) return json({ error: 'Order not found' }, { status: 404 });
	await flushSheetSync(database);
	return json({ ok: true, order });
};
