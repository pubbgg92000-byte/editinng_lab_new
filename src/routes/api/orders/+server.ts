import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { createCustomer, createOrder, listCustomers, listOrders } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const GET = async ({ cookies, platform, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json({ orders: await listOrders(await readyDatabase(platform), url.searchParams.get('historical') !== 'false') });
};

export const POST = async ({ request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	if (!String(input.customer || '').trim() || !String(input.event || '').trim() || !String(input.project || '').trim()) return json({ error: 'Studio name, event and project name are required.' }, { status: 400 });
	const priceSet = input.amount !== null && input.amount !== undefined && input.amount !== '';
	const advanceSet = input.advance !== null && input.advance !== undefined && input.advance !== '';
	const price = priceSet ? Math.max(0, Number(input.amount)) : 0;
	const paid = advanceSet ? Math.max(0, Number(input.advance)) : 0;
	if (!Number.isFinite(price) || !Number.isFinite(paid)) return json({ error: 'Amount and advance must be valid numbers.' }, { status: 400 });
	if (priceSet && advanceSet && paid > price) return json({ error: 'Advance cannot be greater than the total amount.' }, { status: 400 });
	const database = await readyDatabase(platform);
	let customerId = String(input.customerId || '').trim();
	let createdCustomer = null;
	if (input.createCustomer) {
		const business = String(input.customer).trim();
		const phone = String(input.mobile || '').trim();
		if (!phone) return json({ error: 'Mobile number is required when adding a customer.' }, { status: 400 });
		const existing = (await listCustomers(database)).find((customer) => customer.business.toLowerCase() === business.toLowerCase() && customer.phone === phone);
		createdCustomer = existing || await createCustomer(database, { name: String(input.customerName || business).trim(), business, phone, email: String(input.customerEmail || '').trim() });
		customerId = createdCustomer.id;
	}
	const order = await createOrder(database, { customerId, customer: String(input.customer).trim(), mobile: String(input.mobile || '').trim(), workType: String(input.event).trim(), project: String(input.project).trim(), receiving: String(input.receiving || '').trim(), duration: String(input.duration || '').trim(), price, paid, priceSet, advanceSet, source: String(input.source || '').trim(), remarks: String(input.remarks || '').trim(), due: String(input.due || '').trim(), important: Boolean(input.important) });
	const sync = await flushSheetSync(database);
	return json({ ok: true, order, customer: createdCustomer, sync }, { status: 201 });
};
