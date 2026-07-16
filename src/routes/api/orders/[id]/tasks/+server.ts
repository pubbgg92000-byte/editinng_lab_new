import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { createTask } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const POST = async ({ params, request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	const tasks: Record<string, unknown>[] = Array.isArray(input.tasks) ? input.tasks : [input];
	if (!tasks.length || tasks.some((task: Record<string, unknown>) => !String(task.name || '').trim())) return json({ error: 'Every task needs a title.' }, { status: 400 });
	const database = await readyDatabase(platform);
	const created = [];
	for (const task of tasks) created.push(await createTask(database, params.id, task));
	await flushSheetSync(database);
	return json({ ok: true, tasks: created }, { status: 201 });
};
