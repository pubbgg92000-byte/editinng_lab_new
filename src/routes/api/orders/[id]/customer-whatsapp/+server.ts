// Builds the current customer-ready WhatsApp message and records notification history.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getBusinessProfile, getOrder, getSettings, listCustomers, recordActivity, regenerateCustomerToken } from '$lib/server/repository';
import { customerReadyMessage, normalizePhone, whatsappUrl } from '$lib/server/whatsapp';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability } from '$lib/capabilities';
import { templateForScenario } from '$lib/moduleConfiguration';

export const POST = async ({ params, request, cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const configuration = await getTenantConfiguration(database, locals.tenant!);
	const input = await request.json().catch(() => ({})) as { templateId?: string };
	const order = await getOrder(database, params.id);
	if (!order) return json({ error: 'Order not found.' }, { status: 404 });
	if (order.status !== 'Ready Delivery') return json({ error: 'Move this order to Ready Delivery before notifying the customer.' }, { status: 409 });
	const customers = await listCustomers(database, true);
	const customer = customers.find((item) => item.id === order.customerId)
		|| customers.find((item) => item.business === order.customer && item.phone.replace(/\D/g, '') === order.mobile?.replace(/\D/g, ''));
	const currentCustomerPhone = customer?.phone || order.mobile;
	if (!currentCustomerPhone) return json({ error: 'Add the customer WhatsApp number first.' }, { status: 400 });
	if (!normalizePhone(currentCustomerPhone)) return json({ error: 'Add a valid 10-digit customer WhatsApp number first.' }, { status: 400 });
	if (!templateForScenario(configuration.moduleConfiguration, 'ready', input.templateId)) return json({ error: 'That WhatsApp template is unavailable.' }, { status: 400 });
	if (hasCapability(configuration.effectiveCapabilities, 'portal.customer') && customer && !customer.token && !customer.archived) customer.token = await regenerateCustomerToken(database, customer.id) || undefined;
	const [settings, profile] = await Promise.all([getSettings(database), getBusinessProfile(database)]);
	const customerToken = hasCapability(configuration.effectiveCapabilities, 'portal.customer') ? customer?.token || '' : '';
	const message = customerReadyMessage(settings, order, customerToken, url.origin, locals.tenant!.slug, customer, profile, configuration.moduleConfiguration, input.templateId);
	await recordActivity(database, 'admin', 'Customer delivery message prepared', 'order', order.id, `${order.customer} · ${Math.max(0, order.price - order.discount - order.paid)} balance · review before sending`);
	return json({ ok: true, message, url: whatsappUrl(currentCustomerPhone, message) });
};
