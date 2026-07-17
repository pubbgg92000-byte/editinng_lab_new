import { readyDatabase } from '$lib/server/db';
import { getDashboardData } from '$lib/server/repository';
export const load = async ({ platform }) => ({ ...(await getDashboardData(await readyDatabase(platform))), currentDateIso: new Date().toISOString() });
