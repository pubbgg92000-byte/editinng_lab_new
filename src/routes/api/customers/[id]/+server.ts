// Customer record API: edit with order propagation, archive, restore, and portal rotation.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { archiveCustomer, regenerateCustomerToken, restoreCustomer, updateCustomer } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { indianMobileError } from '$lib/phone';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability, validateCustomValues } from '$lib/capabilities';

export const PATCH = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const input = await request.json();
	const configuration = await getTenantConfiguration(database, locals.tenant!);
	try {
		if (input.customFields !== undefined) {
			if (hasCapability(configuration.effectiveCapabilities, 'customFields')) input.customFields = validateCustomValues(configuration.profile, 'customer', input.customFields);
			else delete input.customFields;
		}
	} catch (cause) { return json({ error: cause instanceof Error ? cause.message : 'Custom fields are invalid.' }, { status: 400 }); }
	if (input.name !== undefined && !String(input.name).trim()) return json({ error: 'Customer name is required.' }, { status: 400 });
	if (input.business !== undefined && !String(input.business).trim()) return json({ error: 'Customer studio name is required.' }, { status: 400 });
	if (input.phone !== undefined) {
		const phoneError = indianMobileError(input.phone, true);
		if (phoneError) return json({ error: phoneError }, { status: 400 });
	}
	if (String(input.locationUrl || '').trim() && !/^https:\/\//i.test(String(input.locationUrl).trim())) return json({ error: 'Google Maps location must be an HTTPS link.' }, { status: 400 });
	let customer;
	try { customer = await updateCustomer(database, params.id, input); }
	catch (cause) { return json({ error: cause instanceof Error ? cause.message : 'Unable to update customer.' }, { status: 400 }); }
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
	const configuration = await getTenantConfiguration(database, locals.tenant!);
	if (!hasCapability(configuration.effectiveCapabilities, 'portal.customer')) return json({ error: 'Customer portal is not available for this workspace.' }, { status: 403 });
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
