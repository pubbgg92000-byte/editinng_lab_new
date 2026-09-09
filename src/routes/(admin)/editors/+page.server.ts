// Loads editor profiles, assigned work, and historical records for the directory.
import { readyDatabase } from '$lib/server/db';
import { listEditors, listOrders } from '$lib/server/repository';
import { getTenantConfiguration } from '$lib/server/configuration';
export const load = async ({ locals }) => {
	const database = await readyDatabase(locals.tenant);
	const [editors, orders, configuration] = await Promise.all([
		listEditors(database, true),
		listOrders(database),
		getTenantConfiguration(database, locals.tenant!)
	]);
	return { editors, orders, configuration };
};
