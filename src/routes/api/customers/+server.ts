import { json } from '@sveltejs/kit';
import { appendSheetRow, logActivity } from '$lib/server/googleSheets';
import { verifySession } from '$lib/server/auth';
import type { Customer } from '$lib/types';

export const POST = async ({ request, cookies }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	if (!String(input.name || '').trim() || !String(input.phone || '').trim()) return json({ ok: false, error: 'Customer name and phone number are required.' }, { status: 400 });
	const suffix = `${Date.now()}`.slice(-5);
	const customer: Customer = {
		id: `CUST-${suffix}`,
		name: String(input.name).trim(),
		business: String(input.business || input.name).trim(),
		phone: String(input.phone).trim(),
		email: String(input.email || '').trim(),
		projects: 0,
		pending: 0,
		token: `cust-${crypto.randomUUID().replaceAll('-', '').slice(0, 18)}`
	};
	const sync = await appendSheetRow('Customers', [customer.id, customer.name, customer.business, customer.phone, input.whatsapp || customer.phone, customer.email, input.address || '', input.gst || '', 0, 0, customer.token]);
	await logActivity('Customer created', customer.id, customer.business);
	return json({ ok: true, customer, sync }, { status: 201 });
};
