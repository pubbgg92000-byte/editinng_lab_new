// Compares active database editors with the Editors Sheet and archives missing entries.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { flushSheetSync, reconcileEditorsFromSheet } from '$lib/server/googleSheets';

export const POST = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const database = await readyDatabase(locals.tenant);
		const result = await reconcileEditorsFromSheet(database, locals.tenant!);
		const sync = await flushSheetSync(database, locals.tenant!);
		return json({ ok: true, ...result, sync });
	} catch (cause) {
		return json({ error: cause instanceof Error ? cause.message : 'Unable to reconcile editors.' }, { status: 400 });
	}
};
