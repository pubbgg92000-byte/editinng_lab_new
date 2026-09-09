import type { CapabilityKey } from '../types.ts';

/** Optional admin/API surfaces that must be authorized before their route runs. */
export function capabilitiesForPath(pathname: string): CapabilityKey[] {
	const required: CapabilityKey[] = [];
	if (pathname.startsWith('/editors') || pathname.startsWith('/api/editors')) required.push('work.staff');
	if (pathname.startsWith('/invoices') || pathname.startsWith('/api/invoices')) required.push('billing.invoices');
	if (pathname.startsWith('/settings/sheets') || pathname.startsWith('/api/sheets')) required.push('integrations.googleSheets');
	if (pathname.startsWith('/api/export')) required.push('reports.excelExport');
	if (pathname.startsWith('/api/tasks') || /^\/api\/orders\/[^/]+\/tasks/.test(pathname)) required.push('work.tasks');
	if (pathname.startsWith('/api/notifications')) required.push('work.staff');
	if (/^\/api\/orders\/[^/]+\/payments/.test(pathname)) required.push('billing.payments');
	if (/^\/api\/orders\/[^/]+\/invoice/.test(pathname)) required.push('billing.invoices');
	if (pathname.includes('/whatsapp') || pathname.includes('/customer-whatsapp')) required.push('communications.whatsapp');
	if (/^\/api\/orders\/[^/]+\/customer-whatsapp/.test(pathname)) required.push('workflow.delivery');
	if (/^\/api\/editors\/[^/]+\/whatsapp/.test(pathname)) required.push('work.staffPortal');
	return [...new Set(required)];
}
