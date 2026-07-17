import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { createCustomer, listCustomers } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const GET = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json({ customers: await listCustomers(await readyDatabase(locals.tenant)) });
};

export const POST = async ({ request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	if (!String(input.name || '').trim() || !String(input.phone || '').trim()) return json({ error: 'Customer name and phone number are required.' }, { status: 400 });
	const database = await readyDatabase(locals.tenant);
	const customer = await createCustomer(database, input);
	const sync = await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, customer, sync }, { status: 201 });
};
