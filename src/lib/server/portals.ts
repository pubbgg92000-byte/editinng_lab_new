// Safe token-based data loaders for public customer and editor portals.
import { error } from '@sveltejs/kit';
import { readyDatabase } from './db';
import { hashPortalToken } from './tokens';
import { findEditorByToken, getCustomer, getSettings, listInvoices, listOrdersForCustomer, tasksForEditor } from './repository';
import type { Tenant } from '$lib/types';
import { getTenantConfiguration } from './configuration';
import { hasCapability } from '$lib/capabilities';
import { customerPortalSections, staffPortalSections } from '$lib/moduleConfiguration';

// Public portal loaders resolve a private token only inside the requested tenant.
export async function loadCustomerPortal(tenant: Tenant, token: string) {
	if (tenant.status !== 'active') error(404, 'This portal is unavailable.');
	const database = await readyDatabase(tenant);
	const configuration = await getTenantConfiguration(database, tenant);
	if (!hasCapability(configuration.effectiveCapabilities, 'portal.customer')) error(404, 'This portal is unavailable.');
	const portalSections = customerPortalSections(configuration.moduleConfiguration['portal.customer']);
	const billingVisible = portalSections.billing && (
		(hasCapability(configuration.effectiveCapabilities, 'billing.payments') && portalSections.payments)
		|| (hasCapability(configuration.effectiveCapabilities, 'billing.invoices') && portalSections.documents)
	);
	const deliveryVisible = hasCapability(configuration.effectiveCapabilities, 'workflow.delivery') && portalSections.delivery;
	const taskListVisible = hasCapability(configuration.effectiveCapabilities, 'work.tasks') && portalSections.tasks;
	const hash = await hashPortalToken(token);
	const row = await database.prepare('SELECT id FROM customers WHERE portal_token_hash = ? AND archived_at IS NULL').bind(hash).first<{ id: string }>();
	if (!row) error(404, 'This private customer link is invalid or has been regenerated.');
	const customer = await getCustomer(database, row.id);
	if (!customer) error(404, 'Customer not found.');
	if (!hasCapability(configuration.effectiveCapabilities, 'customFields') || !portalSections.customFields) customer.customFields = {};
	const rawOrders = await listOrdersForCustomer(database, customer.id);
	const deliveryLinks = Object.fromEntries(rawOrders.map((order) => [
		order.id,
		deliveryVisible
			? order.tasks.find((task) => task.outputLink && task.status === 'Completed')?.outputLink || ''
			: ''
	]));
	const orders = rawOrders.map((order) => ({
		id: order.id,
		serial: order.serial,
		project: order.project,
		customer: order.customer,
		mobile: customer.phone,
		workType: order.workType,
		status: order.status,
		progress: order.progress,
		due: order.due,
		files: 0,
		fileLink: '',
		color: order.color,
		price: billingVisible ? order.price : 0,
		discount: billingVisible ? order.discount : 0,
		paid: billingVisible ? order.paid : 0,
		initialAdvance: billingVisible ? order.initialAdvance : 0,
		priceSet: billingVisible ? order.priceSet : false,
		advanceSet: billingVisible ? order.advanceSet : false,
		customFields: hasCapability(configuration.effectiveCapabilities, 'customFields') && portalSections.customFields ? order.customFields : {},
		payments: billingVisible && hasCapability(configuration.effectiveCapabilities, 'billing.payments') && portalSections.payments ? order.payments : [],
		deliveryMethod: deliveryVisible ? order.deliveryMethod : '',
		deliveredAt: deliveryVisible ? order.deliveredAt : '',
		tasks: taskListVisible ? order.tasks.filter((task) => !task.archived).map((task) => ({
			id: task.id,
			name: task.name,
			status: task.status,
			progress: task.progress,
			due: task.due,
			assignee: hasCapability(configuration.effectiveCapabilities, 'work.staff') ? task.assignee : 'Assigned',
			archived: false,
			customFields: hasCapability(configuration.effectiveCapabilities, 'customFields') && portalSections.customFields ? task.customFields : {},
			outputLink: deliveryVisible && task.status === 'Completed' ? task.outputLink : ''
		})) : []
	}));
	const orderIds = new Set(orders.map((order) => order.id));
	const invoices = portalSections.documents ? (await listInvoices(database)).filter((invoice) => orderIds.has(invoice.orderId) && invoice.status !== 'cancelled') : [];
	const settings = await getSettings(database);
	const displaySettings = hasCapability(configuration.effectiveCapabilities, 'branding.whiteLabel') ? settings : { ...settings, studioName: 'NexaDesk', logoUrl: '' };
	return { customer, token, orders, deliveryLinks, invoices: hasCapability(configuration.effectiveCapabilities, 'billing.invoices') && portalSections.documents ? invoices : [], settings: displaySettings, configuration, tenantSlug: tenant.slug };
}

export async function loadEditorPortal(tenant: Tenant, token: string) {
	if (tenant.status !== 'active') error(404, 'This portal is unavailable.');
	const database = await readyDatabase(tenant);
	const configuration = await getTenantConfiguration(database, tenant);
	if (!hasCapability(configuration.effectiveCapabilities, 'work.staffPortal')) error(404, 'This portal is unavailable.');
	const portalSections = staffPortalSections(configuration.moduleConfiguration['work.staffPortal']);
	const editor = await findEditorByToken(database, token);
	if (!editor) error(404, 'This private editor link is invalid or has been regenerated.');
	if (!hasCapability(configuration.effectiveCapabilities, 'customFields') || !portalSections.customFields) editor.customFields = {};
	// Never expose internal billing rates or settlement flags to an editor portal.
	const tasks = (await tasksForEditor(database, editor.id)).map(({ billingMode: _billingMode, hourlyRate: _hourlyRate, billableAmount: _billableAmount, invoicedAmount: _invoicedAmount, editorSettlement: _editorSettlement, ...task }) => ({
		...task,
		instructions: portalSections.instructions ? task.instructions : '',
		textLink: portalSections.references ? task.textLink : '',
		imageUrl: portalSections.references ? task.imageUrl : '',
		outputLink: portalSections.output ? task.outputLink : '',
		notes: portalSections.notes ? task.notes : '',
		device: hasCapability(configuration.effectiveCapabilities, 'work.assignedAssets') && portalSections.assets ? task.device : '',
		videoDurationMinutes: hasCapability(configuration.effectiveCapabilities, 'billing.duration') && portalSections.duration ? task.videoDurationMinutes : 0,
		customFields: hasCapability(configuration.effectiveCapabilities, 'customFields') && portalSections.customFields ? task.customFields : {}
	}));
	const settings = await getSettings(database);
	const displaySettings = hasCapability(configuration.effectiveCapabilities, 'branding.whiteLabel') ? settings : { ...settings, studioName: 'NexaDesk', logoUrl: '' };
	return { editor, tasks, token, settings: displaySettings, configuration, tenantSlug: tenant.slug };
}
