import { readyDatabase } from '$lib/server/db';
import { listCustomers, listOrders } from '$lib/server/repository';
export const load = async ({ platform }) => { const database = await readyDatabase(platform); return { customers: await listCustomers(database, true), orders: await listOrders(database) }; };
