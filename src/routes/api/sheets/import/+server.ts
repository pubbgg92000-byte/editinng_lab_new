import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { flushSheetSync, importHistoricalOrders } from '$lib/server/googleSheets';

export const POST = async ({ cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	const result = await importHistoricalOrders(database);
	await flushSheetSync(database);
	return json({ ok: true, ...result });
};
