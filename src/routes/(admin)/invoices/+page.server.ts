// Loads the invoice register together with matching order/customer information.
import { readyDatabase } from '$lib/server/db';
import { listInvoices, listOrders } from '$lib/server/repository';
export const load = async ({ locals }) => { const database=await readyDatabase(locals.tenant); return { orders: await listOrders(database), invoices: await listInvoices(database) }; };
