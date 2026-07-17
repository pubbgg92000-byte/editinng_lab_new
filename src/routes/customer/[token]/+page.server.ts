import { error } from '@sveltejs/kit';
import { hashPortalToken } from '$lib/server/tokens';
import { readyDatabase } from '$lib/server/db';
import { getCustomer, listOrdersForCustomer } from '$lib/server/repository';
export const load = async ({ params, platform }) => { const database = await readyDatabase(platform); const hash = await hashPortalToken(params.token); const row = await database.prepare('SELECT id FROM customers WHERE portal_token_hash = ? AND archived_at IS NULL').bind(hash).first<{ id: string }>(); if (!row) error(404, 'This private customer link is invalid or has been regenerated.'); const customer = await getCustomer(database, row.id); if (!customer) error(404, 'Customer not found.'); return { customer, orders: await listOrdersForCustomer(database, customer.id) }; };
