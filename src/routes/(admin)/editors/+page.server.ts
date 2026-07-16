import { readyDatabase } from '$lib/server/db';
import { listEditors, listOrders } from '$lib/server/repository';
export const load = async ({ platform }) => { const database = await readyDatabase(platform); return { editors: await listEditors(database, true), orders: await listOrders(database) }; };
