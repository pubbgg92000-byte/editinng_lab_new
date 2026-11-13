// Imports recognized historical order rows from the tenant's configured Sheet.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { flushSheetSync, importHistoricalOrders, reconcileEditorsFromSheet } from '$lib/server/googleSheets';

export const POST = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const database = await readyDatabase(locals.tenant);
		// Sync first so the Editors tab is current, reconcile before the import adds new outbox rows, then import.
		await flushSheetSync(database, locals.tenant!);
		const editorResult = await reconcileEditorsFromSheet(database, locals.tenant!);
		const result = await importHistoricalOrders(database, locals.tenant!);
		await flushSheetSync(database, locals.tenant!);
		// Keep both warnings: the reconcile result would otherwise overwrite the import's skipped-row warning.
		const warning = [(result as { warning?: string }).warning, (editorResult as { warning?: string }).warning].filter(Boolean).join(' ');
		return json({ ok: true, ...result, ...editorResult, ...(warning ? { warning } : {}) });
	} catch (cause) {
		// Sheet not connected, Google unreachable, or a bad tab: tell the admin why instead of a blank 500.
		return json({ error: cause instanceof Error ? cause.message : 'Unable to import from Google Sheets.' }, { status: 400 });
	}
};
