import { readyDatabase } from '$lib/server/db';
import { getSettings, listCustomers, listEditors, listNotifications, listOrderSearchIndex, syncQueueStatus } from '$lib/server/repository';
import { getDatabaseStorageUsage } from '$lib/server/maintenance';
export const load = async ({ platform }) => {
	const database = await readyDatabase(platform);
	const [settings, customers, editors, orders, notifications, storage, sheetSync] = await Promise.all([
		getSettings(database), listCustomers(database), listEditors(database), listOrderSearchIndex(database), listNotifications(database), getDatabaseStorageUsage(database), syncQueueStatus(database)
	]);
	return { settings, customers, editors, orders, notifications, storage, sheetSync };
};
