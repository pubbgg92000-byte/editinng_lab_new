import { readyDatabase } from '$lib/server/db';
import { countArchivedOrders, getOrderQueueCounts, listOrderEvents, listOrdersPage } from '$lib/server/repository';

export const load = async ({ platform, url }) => {
	const database = await readyDatabase(platform);
	const filters = {
		query: String(url.searchParams.get('q') || '').trim(),
		status: String(url.searchParams.get('status') || '').trim(),
		event: String(url.searchParams.get('event') || '').trim(),
		archived: url.searchParams.get('archived') === 'true'
	};
	const [result, eventOptions, archivedCount, queueCounts] = await Promise.all([
		listOrdersPage(database, { page: Number(url.searchParams.get('page') || 1), pageSize: 25, ...filters }),
		listOrderEvents(database),
		countArchivedOrders(database),
		getOrderQueueCounts(database)
	]);
	return { ...result, filters, eventOptions, archivedCount, queueCounts };
};
