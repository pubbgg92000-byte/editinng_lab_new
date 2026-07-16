import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { createEditor, listEditors } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const GET = async ({ cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json({ editors: await listEditors(await readyDatabase(platform), true) });
};

export const POST = async ({ request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	if (!String(input.name || '').trim()) return json({ error: 'Editor name is required.' }, { status: 400 });
	const database = await readyDatabase(platform);
	const editor = await createEditor(database, input);
	await flushSheetSync(database);
	return json({ ok: true, editor }, { status: 201 });
};
