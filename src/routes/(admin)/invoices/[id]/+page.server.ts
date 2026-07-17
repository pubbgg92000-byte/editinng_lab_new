import { error } from '@sveltejs/kit';
import { readyDatabase } from '$lib/server/db';
import { getInvoice, getOrder, getSettings, listActivity, listCustomers } from '$lib/server/repository';

export const load = async ({ params, locals }) => {
	const database = await readyDatabase(locals.tenant);
	const invoice = await getInvoice(database, params.id);
	if (!invoice) error(404, 'Invoice not found');
	const order = await getOrder(database, invoice.orderId);
	const [settings, customers] = await Promise.all([getSettings(database), listCustomers(database, true)]);
	return { invoice, order, customer: customers.find((item) => item.id === order?.customerId) || null, settings, activity: await listActivity(database, 'invoice', invoice.id) };
};
