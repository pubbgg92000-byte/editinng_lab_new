import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { addEventOption, createCustomer, createOrder, createTask, defaultEventOptions, getOrder, listCustomers, listOrdersPage } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const GET = async ({ cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json(await listOrdersPage(await readyDatabase(locals.tenant), {
		page: Number(url.searchParams.get('page') || 1),
		pageSize: Number(url.searchParams.get('pageSize') || 25),
		query: url.searchParams.get('q') || '',
		status: url.searchParams.get('status') || '',
		event: url.searchParams.get('event') || '',
		includeHistorical: url.searchParams.get('historical') !== 'false',
		archived: url.searchParams.get('archived') === 'true'
	}));
};

export const POST = async ({ request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	const orderInputs: Record<string, any>[] = Array.isArray(input.orders) ? input.orders : [input];
	if (!orderInputs.length || orderInputs.length > 20) return json({ error: 'Create between 1 and 20 orders at a time.' }, { status: 400 });
	if (!String(input.customer || '').trim() || orderInputs.some((item) => !String(item.event || '').trim() || !String(item.project || '').trim())) return json({ error: 'Studio name, event and project name are required for every order.' }, { status: 400 });
	for (const item of orderInputs) {
		const priceSet = item.amount !== null && item.amount !== undefined && item.amount !== '';
		const advanceSet = item.advance !== null && item.advance !== undefined && item.advance !== '';
		const price = priceSet ? Math.max(0, Number(item.amount)) : 0;
		const paid = advanceSet ? Math.max(0, Number(item.advance)) : 0;
		if (!Number.isFinite(price) || !Number.isFinite(paid)) return json({ error: `Amount and advance for “${item.project}” must be valid numbers.` }, { status: 400 });
		if (priceSet && advanceSet && paid > price) return json({ error: `Advance cannot be greater than the total for “${item.project}”.` }, { status: 400 });
	}
	const database = await readyDatabase(locals.tenant);
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
	const createdOrders = [];
	for (const item of orderInputs) {
		const priceSet = item.amount !== null && item.amount !== undefined && item.amount !== '';
		const advanceSet = item.advance !== null && item.advance !== undefined && item.advance !== '';
		const event = String(item.event).trim();
		if (!defaultEventOptions.some((option) => option.toLowerCase() === event.toLowerCase())) await addEventOption(database, event);
		const order = await createOrder(database, { customerId, customer: String(input.customer).trim(), mobile: String(input.mobile || '').trim(), workType: event, project: String(item.project).trim(), receiving: String(item.receiving ?? input.receiving ?? '').trim(), duration: String(item.duration ?? input.duration ?? '').trim(), price: priceSet ? Math.max(0, Number(item.amount)) : 0, paid: advanceSet ? Math.max(0, Number(item.advance)) : 0, priceSet, advanceSet, source: String(item.source ?? input.source ?? '').trim(), remarks: String(item.remarks ?? input.remarks ?? '').trim(), due: String(item.due || '').trim(), important: Boolean(item.important ?? input.important) });
		const initialTasks = Array.isArray(item.tasks) ? item.tasks : [];
		for (const task of initialTasks) {
			if (!String(task.name || '').trim()) continue;
			await createTask(database, order.id, { name: String(task.name).trim(), due: String(task.due || item.due || ''), billableAmount: Math.max(0, Number(task.billableAmount || 0)) });
		}
		createdOrders.push(await getOrder(database, order.id) || order);
	}
	const sync = await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, order: createdOrders[0], orders: createdOrders, customer: createdCustomer, sync }, { status: 201 });
};
