import { readyDatabase } from '$lib/server/db';
import { listEditors, listOrders } from '$lib/server/repository';
export const load = async ({ locals }) => { const database = await readyDatabase(locals.tenant); return { editors: await listEditors(database, true), orders: await listOrders(database) }; };
