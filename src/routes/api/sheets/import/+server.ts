// Imports recognized historical order rows from the tenant's configured Sheet.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { flushSheetSync, importHistoricalOrders, reconcileEditorsFromSheet } from '$lib/server/googleSheets';

export const POST = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	// Sync first so the Editors tab is current, reconcile before the import adds new outbox rows, then import.
	await flushSheetSync(database, locals.tenant!);
	const editorResult = await reconcileEditorsFromSheet(database, locals.tenant!);
	const result = await importHistoricalOrders(database, locals.tenant!);
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, ...result, ...editorResult });
};
