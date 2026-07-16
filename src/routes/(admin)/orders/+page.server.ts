import { readyDatabase } from '$lib/server/db';
import { listOrders } from '$lib/server/repository';
export const load = async ({ platform }) => ({ orders: await listOrders(await readyDatabase(platform)) });
