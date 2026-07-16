import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getOrder, getSettings, recordInvoice } from '$lib/server/repository';
import { invoiceMessage, whatsappUrl } from '$lib/server/whatsapp';
import { flushSheetSync } from '$lib/server/googleSheets';

export const POST = async ({ params, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	const order = await getOrder(database, params.id);
	if (!order) return json({ error: 'Order not found' }, { status: 404 });
	if (!order.mobile) return json({ error: 'Add the customer WhatsApp number before sending a bill.' }, { status: 400 });
	const settings = await getSettings(database);
	const invoice = await recordInvoice(database, order.id, (number) => invoiceMessage(settings, number, order));
	await flushSheetSync(database);
	return json({ ok: true, invoice, url: whatsappUrl(order.mobile, invoice.message) });
};
