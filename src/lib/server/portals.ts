// Safe token-based data loaders for public customer and editor portals.
import { error } from '@sveltejs/kit';
import { readyDatabase } from './db';
import { hashPortalToken } from './tokens';
import { findEditorByToken, getCustomer, getSettings, listInvoices, listOrdersForCustomer, tasksForEditor } from './repository';
import type { Task, Tenant, TenantConfiguration } from '$lib/types';
import { getTenantConfiguration } from './configuration';
import { hasCapability } from '$lib/capabilities';
import { customerPortalSections, staffPortalSections } from '$lib/moduleConfiguration';

/** Old or unknown private link: friendly page with the business's contact so the person can ask for a new one. */
async function linkReplaced(database: AppDatabase, kind: 'customer' | 'staff'): Promise<never> {
	const settings = await getSettings(database);
	error(404, {
		message: 'This private link was replaced or has expired.',
		linkReplaced: true,
		kind,
		business: { name: settings.studioName || 'the business', logoUrl: settings.logoUrl || '', phone: settings.phone || '' }
	});
}

/**
 * Configuration safe for public token pages: labels, resolved feature switches, and only the named
 * portal's module settings. Internal WhatsApp templates, package defaults, overrides, and raw
 * allowances never reach the browser.
 */
export function publicConfiguration(configuration: TenantConfiguration, keep: ('portal.customer' | 'work.staffPortal')[] = []): TenantConfiguration {
	const moduleConfiguration = Object.fromEntries(keep.map((key) => [key, configuration.moduleConfiguration[key]]));
	return {
		profile: configuration.profile,
		effectiveCapabilities: configuration.effectiveCapabilities,
		allowedCapabilities: configuration.effectiveCapabilities,
		preferences: configuration.effectiveCapabilities,
		packageModuleConfiguration: {},
		moduleOverrides: {},
		moduleConfiguration
	} as unknown as TenantConfiguration;
}

/**
 * Shape a task for the editor portal. Never expose internal billing rates or settlement
 * flags, and blank out sections the workspace has hidden. Used by the portal page load and
 * by the portal task PATCH response so both return the same safe fields.
 */
export function toEditorTask<T extends Task>(task: T, configuration: TenantConfiguration) {
	const portalSections = staffPortalSections(configuration.moduleConfiguration['work.staffPortal']);
	const capabilities = configuration.effectiveCapabilities;
	const { billingMode: _billingMode, hourlyRate: _hourlyRate, billableAmount: _billableAmount, invoicedAmount: _invoicedAmount, editorSettlement: _editorSettlement, ...safe } = task;
	return {
		...safe,
		instructions: portalSections.instructions ? safe.instructions : '',
		textLink: portalSections.references ? safe.textLink : '',
		imageUrl: portalSections.references ? safe.imageUrl : '',
		outputLink: portalSections.output ? safe.outputLink : '',
		notes: portalSections.notes ? safe.notes : '',
		device: hasCapability(capabilities, 'work.assignedAssets') && portalSections.assets ? safe.device : '',
		videoDurationMinutes: hasCapability(capabilities, 'billing.duration') && portalSections.duration ? safe.videoDurationMinutes : 0,
		customFields: hasCapability(capabilities, 'customFields') && portalSections.customFields ? safe.customFields : {}
	};
}

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
	if (!row) return linkReplaced(database, 'customer');
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
	return { customer, token, orders, deliveryLinks, invoices: hasCapability(configuration.effectiveCapabilities, 'billing.invoices') && portalSections.documents ? invoices : [], settings: displaySettings, configuration: publicConfiguration(configuration, ['portal.customer']), tenantSlug: tenant.slug };
}

export async function loadEditorPortal(tenant: Tenant, token: string) {
	if (tenant.status !== 'active') error(404, 'This portal is unavailable.');
	const database = await readyDatabase(tenant);
	const configuration = await getTenantConfiguration(database, tenant);
	if (!hasCapability(configuration.effectiveCapabilities, 'work.staffPortal')) error(404, 'This portal is unavailable.');
	const portalSections = staffPortalSections(configuration.moduleConfiguration['work.staffPortal']);
	const editor = await findEditorByToken(database, token);
	if (!editor) return linkReplaced(database, 'staff');
	if (!hasCapability(configuration.effectiveCapabilities, 'customFields') || !portalSections.customFields) editor.customFields = {};
	const tasks = (await tasksForEditor(database, editor.id)).map((task) => toEditorTask(task, configuration));
	const settings = await getSettings(database);
	const displaySettings = hasCapability(configuration.effectiveCapabilities, 'branding.whiteLabel') ? settings : { ...settings, studioName: 'NexaDesk', logoUrl: '' };
	return { editor, tasks, token, settings: displaySettings, configuration: publicConfiguration(configuration, ['work.staffPortal']), tenantSlug: tenant.slug };
}
