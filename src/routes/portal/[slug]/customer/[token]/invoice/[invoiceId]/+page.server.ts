// Exposes an invoice only when it belongs to this customer token and tenant.
import { error } from '@sveltejs/kit';
import { findTenantBySlug } from '$lib/server/control';
import { readyDatabase } from '$lib/server/db';
import { loadCustomerPortal } from '$lib/server/portals';
import { getInvoice } from '$lib/server/repository';
import { hasCapability } from '$lib/capabilities';
import { customerPortalSections } from '$lib/moduleConfiguration';

export const load = async ({ params }) => {
	const tenant = await findTenantBySlug(params.slug);
	if (!tenant) error(404, 'Workspace not found.');
	const portal = await loadCustomerPortal(tenant, params.token);
	if (!hasCapability(portal.configuration.effectiveCapabilities, 'billing.invoices')) error(404, 'Invoice not found.');
	if (!customerPortalSections(portal.configuration.moduleConfiguration['portal.customer']).documents) error(404, 'Invoice not found.');
	const invoice = await getInvoice(await readyDatabase(tenant), params.invoiceId);
	const order = portal.orders.find((item) => item.id === invoice?.orderId);
	if (!invoice || !order || invoice.status === 'cancelled') error(404, 'Invoice not found.');
	return { invoice, order, customer: portal.customer, settings: portal.settings, tenantSlug: portal.tenantSlug };
};
