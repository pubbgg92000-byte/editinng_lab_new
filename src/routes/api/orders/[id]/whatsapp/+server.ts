// Prepares a configured customer WhatsApp message for an order without sending it automatically.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getBusinessProfile, getOrder, getSettings, listCustomers, recordActivity, regenerateCustomerToken } from '$lib/server/repository';
import { customerReadyMessage, normalizePhone, whatsappUrl } from '$lib/server/whatsapp';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability } from '$lib/capabilities';
import { templateForScenario } from '$lib/moduleConfiguration';
import type { MessageScenario } from '$lib/types';

const orderScenarios = new Set<MessageScenario>([
	'order-received',
	'appointment-reminder',
	'status-update',
	'clarification-request',
	'ready',
	'payment-received',
	'completion-follow-up'
]);

export const POST = async ({ params, request, cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json().catch(() => ({})) as { templateId?: string; scenario?: MessageScenario };
	const database = await readyDatabase(locals.tenant);
	const configuration = await getTenantConfiguration(database, locals.tenant!);
	const selected = input.templateId
		? configuration.moduleConfiguration['communications.whatsapp'].templates[input.templateId]
		: undefined;
	const scenario = selected?.scenario || input.scenario || 'status-update';
	if (!orderScenarios.has(scenario)) return json({ error: 'Choose a customer order template.' }, { status: 400 });
	if (!templateForScenario(configuration.moduleConfiguration, scenario, input.templateId)) return json({ error: 'That WhatsApp template is unavailable.' }, { status: 400 });
	const order = await getOrder(database, params.id);
	if (!order) return json({ error: 'Order not found.' }, { status: 404 });
	if (scenario === 'payment-received' && !order.payments?.length) return json({ error: 'Record a payment before preparing a payment receipt message.' }, { status: 409 });
	const customers = await listCustomers(database, true);
	const customer = customers.find((item) => item.id === order.customerId)
		|| customers.find((item) => item.business === order.customer && item.phone.replace(/\D/g, '') === order.mobile?.replace(/\D/g, ''));
	const phone = customer?.phone || order.mobile;
	if (!phone) return json({ error: 'Add a valid customer mobile number first.' }, { status: 400 });
	if (!normalizePhone(phone)) return json({ error: 'Add a valid 10-digit customer mobile number first.' }, { status: 400 });
	const portalEnabled = hasCapability(configuration.effectiveCapabilities, 'portal.customer');
	if (portalEnabled && customer && !customer.archived && !customer.token) customer.token = await regenerateCustomerToken(database, customer.id) || undefined;
	const [settings, profile] = await Promise.all([getSettings(database), getBusinessProfile(database)]);
	const message = customerReadyMessage(
		settings,
		order,
		portalEnabled ? customer?.token || '' : '',
		url.origin,
		locals.tenant!.slug,
		customer,
		profile,
		configuration.moduleConfiguration,
		input.templateId,
		scenario
	);
	await recordActivity(database, 'admin', 'Customer WhatsApp message prepared', 'order', order.id, `${scenario} · ${customer?.name || order.customer}`);
	return json({ ok: true, message, url: whatsappUrl(phone, message) });
};
