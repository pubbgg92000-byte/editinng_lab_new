// Customer collection API: list/create with phone, map-link, duplicate, and tenant checks.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { createCustomer, listCustomers } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { indianMobileError } from '$lib/phone';

export const GET = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json({ customers: await listCustomers(await readyDatabase(locals.tenant)) });
};

export const POST = async ({ request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	if (!String(input.name || '').trim() || !String(input.business || input.name || '').trim() || !String(input.phone || '').trim()) return json({ error: 'Customer name, studio name, and phone number are required.' }, { status: 400 });
	const phoneError = indianMobileError(input.phone, true);
	if (phoneError) return json({ error: phoneError }, { status: 400 });
	if (String(input.locationUrl || '').trim() && !/^https:\/\//i.test(String(input.locationUrl).trim())) return json({ error: 'Google Maps location must be an HTTPS link.' }, { status: 400 });
	const database = await readyDatabase(locals.tenant);
	let customer;
	try { customer = await createCustomer(database, input); }
	catch (cause) { return json({ error: cause instanceof Error ? cause.message : 'Unable to save customer.' }, { status: 400 }); }
	const sync = await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, customer, sync }, { status: 201 });
};
