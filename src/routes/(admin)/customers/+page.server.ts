import { readyDatabase } from '$lib/server/db';
import { listCustomers, listInvoices, listOrders } from '$lib/server/repository';
export const load = async ({ locals }) => {
	const database = await readyDatabase(locals.tenant);
	const [customers, orders, invoices] = await Promise.all([listCustomers(database, true), listOrders(database), listInvoices(database)]);
	return { customers, orders, invoices };
};
