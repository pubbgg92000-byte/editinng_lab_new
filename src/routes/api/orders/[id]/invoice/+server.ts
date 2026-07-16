import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getOrder, getSettings, listCustomers, recordInvoice, regenerateCustomerToken } from '$lib/server/repository';
import { invoiceMessage, whatsappUrl } from '$lib/server/whatsapp';
import { flushSheetSync } from '$lib/server/googleSheets';

export const POST = async ({ params, cookies, platform, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	const order = await getOrder(database, params.id);
	if (!order) return json({ error: 'Order not found' }, { status: 404 });
	if (!order.mobile) return json({ error: 'Add the customer WhatsApp number before sending a bill.' }, { status: 400 });
	const customers = await listCustomers(database, true);
	const customer = customers.find((item) => item.id === order.customerId)
		|| customers.find((item) => item.business === order.customer && item.phone.replace(/\D/g, '') === order.mobile?.replace(/\D/g, ''));
	if (!customer) return json({ error: 'Link this order to a customer before sending the bill so their private portal can be included.' }, { status: 400 });
	if (!customer.token && !customer.archived) customer.token = await regenerateCustomerToken(database, customer.id) || undefined;
	if (!customer.token) return json({ error: 'The customer portal link is unavailable. Restore or update the customer before sending the bill.' }, { status: 400 });
	const settings = await getSettings(database);
	const invoice = await recordInvoice(database, order.id, (number) => invoiceMessage(settings, number, order, customer.token!, url.origin));
	await flushSheetSync(database);
	return json({ ok: true, invoice, url: whatsappUrl(order.mobile, invoice.message) });
};
