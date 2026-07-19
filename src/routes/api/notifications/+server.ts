// Lists or marks read the editor-to-admin task update notification inbox.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { listNotifications, markNotificationsRead } from '$lib/server/repository';

export const GET = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json({ notifications: await listNotifications(await readyDatabase(locals.tenant), 100) });
};

export const POST = async ({ request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json().catch(() => ({})) as { editorId?: string };
	await markNotificationsRead(await readyDatabase(locals.tenant), input.editorId ? String(input.editorId) : undefined);
	return json({ ok: true });
};
