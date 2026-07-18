import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { archiveTask, restoreTask, updateTask } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { taskLinkError } from '$lib/server/validation';
import { parseVideoDurationMinutes } from '$lib/duration';

export const PATCH = async ({ params, request, cookies, locals }) => {
	const input = await request.json();
	const linkError = taskLinkError(input);
	if (linkError) return json({ error: `${linkError} Upload files externally and paste the link here.` }, { status: 400 });
	if (input.videoDuration !== undefined) {
		const minutes = parseVideoDurationMinutes(input.videoDuration);
		if (!Number.isFinite(minutes)) return json({ error: 'Enter duration like 30 min, 1.5 hr, or 1:30.' }, { status: 400 });
		input.videoDurationMinutes = minutes;
	}
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	if (input.billableAmount !== undefined && (!Number.isFinite(Number(input.billableAmount)) || Number(input.billableAmount) < 0)) return json({ error: 'Task value must be zero or a positive number.' }, { status: 400 });
	if (input.hourlyRate !== undefined && (!Number.isFinite(Number(input.hourlyRate)) || Number(input.hourlyRate) < 0)) return json({ error: 'Hourly rate must be zero or a positive number.' }, { status: 400 });
	if (input.billingMode && !['manual', 'duration'].includes(input.billingMode)) return json({ error: 'Choose manual billing or duration billing.' }, { status: 400 });
	let task;
	try {
		task = await updateTask(database, params.id, input, 'admin');
	} catch (cause) {
		return json({ error: cause instanceof Error ? cause.message : 'Unable to update task.' }, { status: 400 });
	}
	if (!task) return json({ error: 'Task not found or not assigned to this editor.' }, { status: 404 });
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, task });
};

export const DELETE = async ({ params, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	if (!await archiveTask(database, params.id)) return json({ error: 'Task not found' }, { status: 404 });
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true });
};

export const POST = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	if (input.action !== 'restore') return json({ error: 'Unsupported action' }, { status: 400 });
	const database = await readyDatabase(locals.tenant);
	const task = await restoreTask(database, params.id);
	if (!task) return json({ error: 'Archived task not found' }, { status: 404 });
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, task });
};
