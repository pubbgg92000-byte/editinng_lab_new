// Loads shared client-shell search data, notifications, theme, and storage status.
import { readyDatabase } from '$lib/server/db';
import { getSettings, listCustomers, listEditors, listNotifications, listOrderSearchIndex, syncQueueStatus } from '$lib/server/repository';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability } from '$lib/capabilities';
import { getDatabaseStorageUsage } from '$lib/server/maintenance';
export const load = async ({ locals }) => {
	const database = await readyDatabase(locals.tenant);
	const [settings, configuration] = await Promise.all([getSettings(database), getTenantConfiguration(database, locals.tenant!)]);
	const [customers, editors, orders, notifications, storage, sheetSync] = await Promise.all([
		listCustomers(database),
		hasCapability(configuration.effectiveCapabilities, 'work.staff') ? listEditors(database) : Promise.resolve([]),
		listOrderSearchIndex(database),
		hasCapability(configuration.effectiveCapabilities, 'work.staff') ? listNotifications(database) : Promise.resolve([]),
		getDatabaseStorageUsage(database),
		syncQueueStatus(database)
	]);
	return { settings, configuration, customers, editors, orders, notifications, storage, sheetSync };
};
