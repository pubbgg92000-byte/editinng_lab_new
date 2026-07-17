import { readyDatabase } from '$lib/server/db';
import { getSettings, syncQueueStatus } from '$lib/server/repository';
export const load = async ({ locals }) => { const database = await readyDatabase(locals.tenant); return { settings: await getSettings(database), sync: await syncQueueStatus(database) }; };
