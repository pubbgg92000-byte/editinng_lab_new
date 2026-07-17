import { error } from '@sveltejs/kit';
import { readyDatabase } from './db';
import { hashPortalToken } from './tokens';
import { findEditorByToken, getCustomer, getSettings, listOrdersForCustomer, tasksForEditor } from './repository';
import type { Tenant } from '$lib/types';

export async function loadCustomerPortal(tenant: Tenant, token: string) {
	if (tenant.status !== 'active') error(404, 'This portal is unavailable.');
	const database = await readyDatabase(tenant);
	const hash = await hashPortalToken(token);
	const row = await database.prepare('SELECT id FROM customers WHERE portal_token_hash = ? AND archived_at IS NULL').bind(hash).first<{ id: string }>();
	if (!row) error(404, 'This private customer link is invalid or has been regenerated.');
	const customer = await getCustomer(database, row.id);
	if (!customer) error(404, 'Customer not found.');
	return { customer, orders: await listOrdersForCustomer(database, customer.id), settings: await getSettings(database), tenantSlug: tenant.slug };
}

export async function loadEditorPortal(tenant: Tenant, token: string) {
	if (tenant.status !== 'active') error(404, 'This portal is unavailable.');
	const database = await readyDatabase(tenant);
	const editor = await findEditorByToken(database, token);
	if (!editor) error(404, 'This private editor link is invalid or has been regenerated.');
	return { editor, tasks: await tasksForEditor(database, editor.id), token, settings: await getSettings(database), tenantSlug: tenant.slug };
}
