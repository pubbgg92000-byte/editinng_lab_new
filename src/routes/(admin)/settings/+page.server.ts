import { readyDatabase } from '$lib/server/db';
import { getSettings, syncQueueStatus } from '$lib/server/repository';
export const load = async ({ platform }) => { const database = await readyDatabase(platform); return { settings: await getSettings(database), sync: await syncQueueStatus(database) }; };
