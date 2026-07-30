// Loads the complete order workspace: tasks, editors, customer, invoices, and activity.
import { error } from '@sveltejs/kit';
import { readyDatabase } from '$lib/server/db';
import { getOrder, listCustomers, listDeviceOptions, listEditors, listOrderActivity, listOrdersForCustomer } from '$lib/server/repository';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability } from '$lib/capabilities';
export const load = async ({ params, locals }) => {
	const database = await readyDatabase(locals.tenant);
	const configuration = await getTenantConfiguration(database, locals.tenant!);
	const order = await getOrder(database, params.id);
	if (!order) error(404, 'Order not found');
	const [editors, customers, activity, customerOrders, devices] = await Promise.all([
		hasCapability(configuration.effectiveCapabilities, 'work.staff') ? listEditors(database) : Promise.resolve([]),
		listCustomers(database),
		listOrderActivity(database, params.id),
		order.customerId ? listOrdersForCustomer(database, order.customerId) : Promise.resolve([]),
		hasCapability(configuration.effectiveCapabilities, 'work.assignedAssets') ? listDeviceOptions(database) : Promise.resolve([])
	]);
	return { order, editors, customers, activity, customerOrders, devices, configuration };
};
