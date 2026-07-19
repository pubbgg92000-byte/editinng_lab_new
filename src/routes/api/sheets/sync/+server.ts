// Flushes the pending database outbox into a refreshed tenant workbook snapshot.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { syncQueueStatus } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const GET = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json(await syncQueueStatus(await readyDatabase(locals.tenant)));
};

export const POST = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json(await flushSheetSync(await readyDatabase(locals.tenant), locals.tenant!));
};
