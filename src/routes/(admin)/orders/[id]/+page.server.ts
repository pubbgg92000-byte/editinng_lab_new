import { error } from '@sveltejs/kit';
import { readyDatabase } from '$lib/server/db';
import { getOrder, listCustomers, listEditors, listOrderActivity, listOrdersForCustomer } from '$lib/server/repository';
export const load = async ({ params, locals }) => {
	const database = await readyDatabase(locals.tenant);
	const order = await getOrder(database, params.id);
	if (!order) error(404, 'Order not found');
	const [editors, customers, activity, customerOrders] = await Promise.all([
		listEditors(database), listCustomers(database), listOrderActivity(database, params.id),
		order.customerId ? listOrdersForCustomer(database, order.customerId) : Promise.resolve([])
	]);
	return { order, editors, customers, activity, customerOrders };
};
