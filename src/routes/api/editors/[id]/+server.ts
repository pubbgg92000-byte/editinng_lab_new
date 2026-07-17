import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { archiveEditor, permanentlyDeleteEditor, regenerateEditorToken, restoreEditor, updateEditor } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const PATCH = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const editor = await updateEditor(database, params.id, await request.json());
	if (!editor) return json({ error: 'Editor not found' }, { status: 404 });
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, editor });
};

export const POST = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	const database = await readyDatabase(locals.tenant);
	if (input.action === 'restore') {
		const editor = await restoreEditor(database, params.id);
		if (!editor) return json({ error: 'Archived editor not found' }, { status: 404 });
		const sync = await flushSheetSync(database, locals.tenant!);
		return json({ ok: true, editor, sync });
	}
	if (input.action === 'delete-permanently') {
		const deleted = await permanentlyDeleteEditor(database, params.id);
		if (!deleted) return json({ error: 'Only an archived editor can be permanently deleted' }, { status: 409 });
		const sync = await flushSheetSync(database, locals.tenant!);
		return json({ ok: true, deleted, sync });
	}
	if (input.action !== 'regenerate-token') return json({ error: 'Unknown action' }, { status: 400 });
	return json({ ok: true, token: await regenerateEditorToken(database, params.id) });
};

export const DELETE = async ({ params, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const editor = await archiveEditor(database, params.id);
	if (!editor) return json({ error: 'Editor not found' }, { status: 404 });
	const sync = await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, editor, sync });
};
