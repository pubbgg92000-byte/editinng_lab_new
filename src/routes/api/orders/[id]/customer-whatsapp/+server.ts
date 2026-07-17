import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getOrder, getSettings, listCustomers, markCustomerNotified, recordActivity, regenerateCustomerToken } from '$lib/server/repository';
import { customerReadyMessage, whatsappUrl } from '$lib/server/whatsapp';

export const POST = async ({ params, cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const order = await getOrder(database, params.id);
	if (!order) return json({ error: 'Order not found.' }, { status: 404 });
	if (!order.mobile) return json({ error: 'Add the customer WhatsApp number first.' }, { status: 400 });
	if (order.status !== 'Ready Delivery') return json({ error: 'Move this order to Ready Delivery before notifying the customer.' }, { status: 409 });
	const customers = await listCustomers(database, true);
	const customer = customers.find((item) => item.id === order.customerId)
		|| customers.find((item) => item.business === order.customer && item.phone.replace(/\D/g, '') === order.mobile?.replace(/\D/g, ''));
	if (customer && !customer.token && !customer.archived) customer.token = await regenerateCustomerToken(database, customer.id) || undefined;
	const message = customerReadyMessage(await getSettings(database), order, customer?.token || '', url.origin, locals.tenant!.slug);
	await markCustomerNotified(database, order.id);
	await recordActivity(database, 'admin', 'Customer delivery message prepared', 'order', order.id, `${order.customer} · ${Math.max(0, order.price - order.discount - order.paid)} balance`);
	return json({ ok: true, message, url: whatsappUrl(order.mobile, message) });
};
