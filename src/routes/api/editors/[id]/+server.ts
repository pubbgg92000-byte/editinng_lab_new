import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { archiveEditor, permanentlyDeleteEditor, regenerateEditorToken, restoreEditor, updateEditor } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { indianMobileError } from '$lib/phone';

export const PATCH = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const input = await request.json();
	if (input.name !== undefined && !String(input.name).trim()) return json({ error: 'Editor name is required.' }, { status: 400 });
	if (input.phone !== undefined) {
		const phoneError = indianMobileError(input.phone, true);
		if (phoneError) return json({ error: phoneError }, { status: 400 });
	}
	if (String(input.locationUrl || '').trim() && !/^https:\/\//i.test(String(input.locationUrl).trim())) return json({ error: 'Google Maps location must be an HTTPS link.' }, { status: 400 });
	let editor;
	try { editor = await updateEditor(database, params.id, input); }
	catch (cause) { return json({ error: cause instanceof Error ? cause.message : 'Unable to update editor.' }, { status: 400 }); }
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
	const token = await regenerateEditorToken(database, params.id);
	return token ? json({ ok: true, token }) : json({ error: 'Editor not found' }, { status: 404 });
};

export const DELETE = async ({ params, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const editor = await archiveEditor(database, params.id);
	if (!editor) return json({ error: 'Editor not found' }, { status: 404 });
	const sync = await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, editor, sync });
};
