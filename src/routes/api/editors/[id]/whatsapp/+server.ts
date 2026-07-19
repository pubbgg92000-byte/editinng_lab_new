import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getOrder, getSettings, listEditors, recordActivity, regenerateEditorToken } from '$lib/server/repository';
import { editorAssignmentMessage, whatsappUrl } from '$lib/server/whatsapp';
import { flushSheetSync } from '$lib/server/googleSheets';

export const POST = async ({ params, request, cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	const database = await readyDatabase(locals.tenant);
	let editor = (await listEditors(database, true)).find((item) => item.id === params.id);
	if (!editor || editor.archived) return json({ error: 'Active editor not found' }, { status: 404 });
	if (!editor.phone) return json({ error: 'Add the editor WhatsApp number first.' }, { status: 400 });
	const token = editor.token || await regenerateEditorToken(database, editor.id);
	if (!token) return json({ error: 'Unable to create the editor portal link.' }, { status: 409 });
	const order = await getOrder(database, String(input.orderId || ''));
	if (!order) return json({ error: 'Order not found' }, { status: 404 });
	const tasks = order.tasks.filter((task) => !task.archived && task.editorId === editor!.id);
	if (!tasks.length) return json({ error: 'Assign at least one task to this editor first.' }, { status: 400 });
	const message = editorAssignmentMessage(await getSettings(database), editor, order, tasks, token, url.origin, locals.tenant!.slug);
	await recordActivity(database, 'admin', 'Editor assignment opened in WhatsApp', 'order', order.id, `${editor.name} · ${tasks.length} task(s)`);
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, url: whatsappUrl(editor.phone, message), token });
};
