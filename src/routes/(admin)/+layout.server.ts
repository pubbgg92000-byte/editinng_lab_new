import { readyDatabase } from '$lib/server/db';
import { getSettings, listActivity, listCustomers, listEditors, listOrders } from '$lib/server/repository';
export const load = async ({ platform }) => {
	const database = await readyDatabase(platform);
	const [settings, customers, editors, orders, activity] = await Promise.all([getSettings(database), listCustomers(database), listEditors(database), listOrders(database), listActivity(database)]);
	const notifications = activity.slice(0, 12).map((item) => {
		let path = '/dashboard';
		if (item.entityType === 'order') path = `/orders/${item.entityId}`;
		else if (item.entityType === 'invoice') path = `/invoices/${item.entityId}`;
		else if (item.entityType === 'customer') path = '/customers';
		else if (item.entityType === 'editor') path = '/editors';
		else if (item.entityType === 'task') { const orderId = orders.find((order) => order.tasks.some((task) => task.id === item.entityId))?.id; path = orderId ? `/orders/${orderId}` : '/orders'; }
		else if (item.entityType === 'payment') { const orderId = orders.find((order) => order.payments?.some((payment) => payment.id === item.entityId))?.id; path = orderId ? `/orders/${orderId}` : '/orders'; }
		return { ...item, path };
	});
	return { settings, customers, editors, orders, notifications };
};
