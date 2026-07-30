// Builds a fresh invoice WhatsApp message from current contact data and snapshot money.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getBusinessProfile, getInvoice, getOrder, getSettings, listCustomers, regenerateCustomerToken } from '$lib/server/repository';
import { currentInvoiceMessage, normalizePhone, whatsappUrl } from '$lib/server/whatsapp';
import { flushSheetSync } from '$lib/server/googleSheets';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability } from '$lib/capabilities';
import { templateForScenario } from '$lib/moduleConfiguration';

export const POST = async ({ params, request, cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const configuration = await getTenantConfiguration(database, locals.tenant!);
	const input = await request.json().catch(() => ({})) as { templateId?: string };
	const invoice = await getInvoice(database, params.id);
	if (!invoice || invoice.status === 'cancelled') return json({ error: invoice ? 'A cancelled invoice cannot be sent.' : 'Invoice not found.' }, { status: invoice ? 409 : 404 });
	const scenario = invoice.kind === 'partial' ? 'partial-invoice' : 'invoice';
	if (!templateForScenario(configuration.moduleConfiguration, scenario, input.templateId)) return json({ error: 'That WhatsApp template is unavailable.' }, { status: 400 });
	const order = await getOrder(database, invoice.orderId);
	if (!order) return json({ error: 'The order for this invoice was not found.' }, { status: 404 });
	const customers = await listCustomers(database, true);
	const customer = customers.find((item) => item.id === order.customerId)
		|| customers.find((item) => item.business === order.customer && item.phone.replace(/\D/g, '') === order.mobile?.replace(/\D/g, ''));
	const phone = customer?.phone || order.mobile;
	if (!phone) return json({ error: 'Add a valid customer mobile number before sending.' }, { status: 400 });
	if (!normalizePhone(phone)) return json({ error: 'Add a valid 10-digit customer mobile number before sending.' }, { status: 400 });
	const portalEnabled = hasCapability(configuration.effectiveCapabilities, 'portal.customer');
	if (portalEnabled && customer && !customer.archived && !customer.token) customer.token = await regenerateCustomerToken(database, customer.id) || undefined;
	const [settings, profile] = await Promise.all([getSettings(database), getBusinessProfile(database)]);
	const messageCustomer = customer && !portalEnabled ? { ...customer, token: '' } : customer;
	const message = currentInvoiceMessage(settings, invoice, order, messageCustomer, url.origin, locals.tenant!.slug, profile, configuration.moduleConfiguration, input.templateId);
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, message, url: whatsappUrl(phone, message) });
};
