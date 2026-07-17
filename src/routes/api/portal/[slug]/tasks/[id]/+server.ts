import { json } from '@sveltejs/kit';
import { findTenantBySlug } from '$lib/server/control';
import { readyDatabase } from '$lib/server/db';
import { findEditorByToken, updateTask } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { taskLinkError } from '$lib/server/validation';

export const PATCH = async ({ params, request }) => {
	const tenant = await findTenantBySlug(params.slug);
	if (!tenant || tenant.status !== 'active') return json({ error: 'Portal unavailable.' }, { status: 404 });
	const input = await request.json();
	const linkError = taskLinkError(input);
	if (linkError) return json({ error: `${linkError} Upload files externally and paste the link here.` }, { status: 400 });
	const database = await readyDatabase(tenant);
	const editor = input.token ? await findEditorByToken(database, String(input.token)) : null;
	if (!editor) return json({ error: 'Unauthorized' }, { status: 401 });
	let task;
	try { task = await updateTask(database, params.id, input, editor.name, editor.id); }
	catch (cause) { return json({ error: cause instanceof Error ? cause.message : 'Unable to update task.' }, { status: 400 }); }
	if (!task) return json({ error: 'Task not found or not assigned to this editor.' }, { status: 404 });
	await flushSheetSync(database, tenant);
	return json({ ok: true, task });
};
