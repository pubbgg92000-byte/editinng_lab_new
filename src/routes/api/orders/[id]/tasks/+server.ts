import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { createTask } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { taskLinkError } from '$lib/server/validation';

export const POST = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	const tasks: Record<string, unknown>[] = Array.isArray(input.tasks) ? input.tasks : [input];
	if (!tasks.length || tasks.some((task: Record<string, unknown>) => !String(task.name || '').trim())) return json({ error: 'Every task needs a title.' }, { status: 400 });
	for (const task of tasks) {
		const linkError = taskLinkError(task);
		if (linkError) return json({ error: `${linkError} Upload files to Drive, R2, S3 or another file host and paste the link here.` }, { status: 400 });
		if (task.billableAmount !== undefined && (!Number.isFinite(Number(task.billableAmount)) || Number(task.billableAmount) < 0)) return json({ error: 'Task value must be zero or a positive number.' }, { status: 400 });
	}
	const database = await readyDatabase(locals.tenant);
	const created = [];
	for (const task of tasks) created.push(await createTask(database, params.id, task));
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, tasks: created }, { status: 201 });
};
