// Builds a fresh invoice WhatsApp message from current contact data and snapshot money.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getInvoice, getOrder, getSettings, listCustomers, regenerateCustomerToken, updateInvoiceStatus } from '$lib/server/repository';
import { currentInvoiceMessage, whatsappUrl } from '$lib/server/whatsapp';
import { flushSheetSync } from '$lib/server/googleSheets';

export const POST = async ({ params, cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const invoice = await getInvoice(database, params.id);
	if (!invoice || invoice.status === 'cancelled') return json({ error: invoice ? 'A cancelled invoice cannot be sent.' : 'Invoice not found.' }, { status: invoice ? 409 : 404 });
	const order = await getOrder(database, invoice.orderId);
	if (!order) return json({ error: 'The order for this invoice was not found.' }, { status: 404 });
	const customers = await listCustomers(database, true);
	const customer = customers.find((item) => item.id === order.customerId)
		|| customers.find((item) => item.business === order.customer && item.phone.replace(/\D/g, '') === order.mobile?.replace(/\D/g, ''));
	const phone = customer?.phone || order.mobile;
	if (!phone) return json({ error: 'Add a valid customer mobile number before sending.' }, { status: 400 });
	if (customer && !customer.archived && !customer.token) customer.token = await regenerateCustomerToken(database, customer.id) || undefined;
	const message = currentInvoiceMessage(await getSettings(database), invoice, order, customer, url.origin, locals.tenant!.slug);
	await updateInvoiceStatus(database, invoice.id, 'sent');
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, message, url: whatsappUrl(phone, message) });
};
