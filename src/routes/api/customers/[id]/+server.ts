import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { archiveCustomer, regenerateCustomerToken, restoreCustomer, updateCustomer } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const PATCH = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const customer = await updateCustomer(database, params.id, await request.json());
	if (!customer) return json({ error: 'Customer not found' }, { status: 404 });
	const sync = await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, customer, sync });
};

export const POST = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	const database = await readyDatabase(locals.tenant);
	if (input.action === 'restore') {
		const customer = await restoreCustomer(database, params.id);
		if (!customer) return json({ error: 'Archived customer not found' }, { status: 404 });
		await flushSheetSync(database, locals.tenant!);
		return json({ ok: true, customer });
	}
	if (input.action !== 'regenerate-token') return json({ error: 'Unsupported action' }, { status: 400 });
	const token = await regenerateCustomerToken(database, params.id);
	return token ? json({ ok: true, token }) : json({ error: 'Customer not found' }, { status: 404 });
};

export const DELETE = async ({ params, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const customer = await archiveCustomer(database, params.id);
	if (!customer) return json({ error: 'Customer not found' }, { status: 404 });
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, customer });
};
