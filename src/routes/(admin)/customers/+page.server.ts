import { readyDatabase } from '$lib/server/db';
import { listCustomers, listOrders } from '$lib/server/repository';
export const load = async ({ locals }) => { const database = await readyDatabase(locals.tenant); return { customers: await listCustomers(database, true), orders: await listOrders(database) }; };
