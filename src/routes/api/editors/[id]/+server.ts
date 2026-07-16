import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { archiveEditor, regenerateEditorToken, restoreEditor, updateEditor } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const PATCH = async ({ params, request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	const editor = await updateEditor(database, params.id, await request.json());
	if (!editor) return json({ error: 'Editor not found' }, { status: 404 });
	await flushSheetSync(database);
	return json({ ok: true, editor });
};

export const POST = async ({ params, request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	const database = await readyDatabase(platform);
	if (input.action === 'restore') {
		const editor = await restoreEditor(database, params.id);
		if (!editor) return json({ error: 'Archived editor not found' }, { status: 404 });
		await flushSheetSync(database);
		return json({ ok: true, editor });
	}
	if (input.action !== 'regenerate-token') return json({ error: 'Unknown action' }, { status: 400 });
	return json({ ok: true, token: await regenerateEditorToken(database, params.id) });
};

export const DELETE = async ({ params, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	const editor = await archiveEditor(database, params.id);
	if (!editor) return json({ error: 'Editor not found' }, { status: 404 });
	await flushSheetSync(database);
	return json({ ok: true, editor });
};
