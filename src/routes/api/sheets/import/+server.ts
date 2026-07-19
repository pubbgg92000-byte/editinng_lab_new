// Imports recognized historical order rows from the tenant's configured Sheet.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { flushSheetSync, importHistoricalOrders, reconcileEditorsFromSheet } from '$lib/server/googleSheets';

export const POST = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const [result, editorResult] = await Promise.all([importHistoricalOrders(database, locals.tenant!), reconcileEditorsFromSheet(database, locals.tenant!)]);
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, ...result, ...editorResult });
};
