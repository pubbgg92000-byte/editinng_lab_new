import { error } from '@sveltejs/kit';
import { readyDatabase } from '$lib/server/db';
import { getOrder, listCustomers, listEditors, listOrderActivity } from '$lib/server/repository';
export const load = async ({ params, locals }) => {
	const database = await readyDatabase(locals.tenant);
	const order = await getOrder(database, params.id);
	if (!order) error(404, 'Order not found');
	return { order, editors: await listEditors(database), customers: await listCustomers(database), activity: await listOrderActivity(database, params.id) };
};
