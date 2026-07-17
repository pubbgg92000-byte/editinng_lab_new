import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { flushSheetSync, reconcileEditorsFromSheet } from '$lib/server/googleSheets';

export const POST = async ({ cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const database = await readyDatabase(platform);
		const result = await reconcileEditorsFromSheet(database);
		const sync = await flushSheetSync(database);
		return json({ ok: true, ...result, sync });
	} catch (cause) {
		return json({ error: cause instanceof Error ? cause.message : 'Unable to reconcile editors.' }, { status: 400 });
	}
};
