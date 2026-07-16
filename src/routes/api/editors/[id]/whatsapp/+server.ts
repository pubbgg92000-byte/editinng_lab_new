import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getOrder, getSettings, listEditors, recordActivity, regenerateEditorToken } from '$lib/server/repository';
import { editorAssignmentMessage, whatsappUrl } from '$lib/server/whatsapp';
import { flushSheetSync } from '$lib/server/googleSheets';

export const POST = async ({ params, request, cookies, platform, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	const database = await readyDatabase(platform);
	let editor = (await listEditors(database, true)).find((item) => item.id === params.id);
	if (!editor) return json({ error: 'Editor not found' }, { status: 404 });
	if (!editor.phone) return json({ error: 'Add the editor WhatsApp number first.' }, { status: 400 });
	if (!editor.token) {
		editor.token = await regenerateEditorToken(database, editor.id);
	}
	const order = await getOrder(database, String(input.orderId || ''));
	if (!order) return json({ error: 'Order not found' }, { status: 404 });
	const tasks = order.tasks.filter((task) => !task.archived && task.editorId === editor!.id);
	if (!tasks.length) return json({ error: 'Assign at least one task to this editor first.' }, { status: 400 });
	const message = editorAssignmentMessage(await getSettings(database), editor, order, tasks, editor.token, url.origin);
	await recordActivity(database, 'admin', 'Editor assignment opened in WhatsApp', 'order', order.id, `${editor.name} · ${tasks.length} task(s)`);
	await flushSheetSync(database);
	return json({ ok: true, url: whatsappUrl(editor.phone, message), token: editor.token });
};
