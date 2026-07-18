import { error } from '@sveltejs/kit';
import { readyDatabase } from './db';
import { hashPortalToken } from './tokens';
import { findEditorByToken, getCustomer, getSettings, listInvoices, listOrdersForCustomer, tasksForEditor } from './repository';
import type { Tenant } from '$lib/types';

export async function loadCustomerPortal(tenant: Tenant, token: string) {
	if (tenant.status !== 'active') error(404, 'This portal is unavailable.');
	const database = await readyDatabase(tenant);
	const hash = await hashPortalToken(token);
	const row = await database.prepare('SELECT id FROM customers WHERE portal_token_hash = ? AND archived_at IS NULL').bind(hash).first<{ id: string }>();
	if (!row) error(404, 'This private customer link is invalid or has been regenerated.');
	const customer = await getCustomer(database, row.id);
	if (!customer) error(404, 'Customer not found.');
	const orders = await listOrdersForCustomer(database, customer.id);
	const orderIds = new Set(orders.map((order) => order.id));
	const invoices = (await listInvoices(database)).filter((invoice) => orderIds.has(invoice.orderId) && invoice.status !== 'cancelled');
	return { customer, token, orders, invoices, settings: await getSettings(database), tenantSlug: tenant.slug };
}

export async function loadEditorPortal(tenant: Tenant, token: string) {
	if (tenant.status !== 'active') error(404, 'This portal is unavailable.');
	const database = await readyDatabase(tenant);
	const editor = await findEditorByToken(database, token);
	if (!editor) error(404, 'This private editor link is invalid or has been regenerated.');
	const tasks = (await tasksForEditor(database, editor.id)).map(({ billingMode: _billingMode, hourlyRate: _hourlyRate, billableAmount: _billableAmount, invoicedAmount: _invoicedAmount, editorSettlement: _editorSettlement, ...task }) => task);
	return { editor, tasks, token, settings: await getSettings(database), tenantSlug: tenant.slug };
}
