// Generates a styled Excel workbook download from the current tenant database.
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getBusinessProfile, getSettings, listActivity, listCustomers, listEditors, listInvoices, listOrders } from '$lib/server/repository';
import { buildExportWorkbook } from '$lib/server/exportWorkbook';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability } from '$lib/capabilities';

export const GET = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return new Response('Unauthorized', { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const [orders, customers, editors, invoices, activity, settings, profile, configuration] = await Promise.all([listOrders(database, true, true), listCustomers(database, true), listEditors(database, true), listInvoices(database), listActivity(database), getSettings(database), getBusinessProfile(database), getTenantConfiguration(database, locals.tenant!)]);
	const exportProfile = hasCapability(configuration.effectiveCapabilities, 'customFields') ? profile : { ...profile, customFields: [] };
	const exportOrders = orders.map((order) => ({
		...order,
		paid: hasCapability(configuration.effectiveCapabilities, 'billing.payments') ? order.paid : 0,
		initialAdvance: hasCapability(configuration.effectiveCapabilities, 'billing.payments') ? order.initialAdvance : 0,
		advanceSet: hasCapability(configuration.effectiveCapabilities, 'billing.payments') ? order.advanceSet : false,
		payments: hasCapability(configuration.effectiveCapabilities, 'billing.payments') ? order.payments : [],
		tasks: hasCapability(configuration.effectiveCapabilities, 'work.tasks') ? order.tasks.map((task) => ({
			...task,
			editorId: hasCapability(configuration.effectiveCapabilities, 'work.staff') ? task.editorId : undefined,
			editorCode: hasCapability(configuration.effectiveCapabilities, 'work.staff') ? task.editorCode : undefined,
			assignee: hasCapability(configuration.effectiveCapabilities, 'work.staff') ? task.assignee : 'Unassigned',
			device: hasCapability(configuration.effectiveCapabilities, 'work.assignedAssets') ? task.device : '',
			billingMode: hasCapability(configuration.effectiveCapabilities, 'billing.duration') ? task.billingMode : 'manual',
			hourlyRate: hasCapability(configuration.effectiveCapabilities, 'billing.duration') ? task.hourlyRate : 0,
			videoDurationMinutes: hasCapability(configuration.effectiveCapabilities, 'billing.duration') ? task.videoDurationMinutes : 0
		})) : []
	}));
	const file = await buildExportWorkbook({
		orders: exportOrders,
		customers,
		editors: hasCapability(configuration.effectiveCapabilities, 'work.staff') ? editors : [],
		invoices: hasCapability(configuration.effectiveCapabilities, 'billing.invoices') ? invoices : [],
		activity, settings, profile: exportProfile, capabilities: configuration.effectiveCapabilities
	});
	const filename = `${locals.tenant!.slug}-workspace-workbook.xlsx`;
	return new Response(file, { headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'content-disposition': `attachment; filename="${filename}"` } });
};
