// Loads workflow summary counts and the active production queue.
import { readyDatabase } from '$lib/server/db';
import { getDashboardData } from '$lib/server/repository';
export const load = async ({ locals }) => ({ ...(await getDashboardData(await readyDatabase(locals.tenant))), currentDateIso: new Date().toISOString() });
