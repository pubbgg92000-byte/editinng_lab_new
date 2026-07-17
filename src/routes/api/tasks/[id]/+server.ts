import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { archiveTask, findEditorByToken, restoreTask, updateTask } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { taskLinkError } from '$lib/server/validation';

export const PATCH = async ({ params, request, cookies, platform }) => {
	const input = await request.json();
	const linkError = taskLinkError(input);
	if (linkError) return json({ error: `${linkError} Upload files externally and paste the link here.` }, { status: 400 });
	const database = await readyDatabase(platform);
	const isAdmin = await verifySession(cookies.get('studioflow_session'));
	const editor = input.token ? await findEditorByToken(database, String(input.token)) : null;
	if (!isAdmin && !editor) return json({ error: 'Unauthorized' }, { status: 401 });
	if (input.billableAmount !== undefined && (!Number.isFinite(Number(input.billableAmount)) || Number(input.billableAmount) < 0)) return json({ error: 'Task value must be zero or a positive number.' }, { status: 400 });
	let task;
	try {
		task = await updateTask(database, params.id, input, isAdmin ? 'admin' : editor!.name, isAdmin ? undefined : editor!.id);
	} catch (cause) {
		return json({ error: cause instanceof Error ? cause.message : 'Unable to update task.' }, { status: 400 });
	}
	if (!task) return json({ error: 'Task not found or not assigned to this editor.' }, { status: 404 });
	await flushSheetSync(database);
	return json({ ok: true, task });
};

export const DELETE = async ({ params, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	if (!await archiveTask(database, params.id)) return json({ error: 'Task not found' }, { status: 404 });
	await flushSheetSync(database);
	return json({ ok: true });
};

export const POST = async ({ params, request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	if (input.action !== 'restore') return json({ error: 'Unsupported action' }, { status: 400 });
	const database = await readyDatabase(platform);
	const task = await restoreTask(database, params.id);
	if (!task) return json({ error: 'Archived task not found' }, { status: 404 });
	await flushSheetSync(database);
	return json({ ok: true, task });
};
