import { readyDatabase } from '$lib/server/db';
import { listInvoices, listOrders } from '$lib/server/repository';
export const load = async ({ platform }) => { const database=await readyDatabase(platform); return { orders: await listOrders(database), invoices: await listInvoices(database) }; };
