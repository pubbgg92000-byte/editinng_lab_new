// Maps each workspace admin page and API request to the permission it needs (P1, default deny).
// A request that isn't listed here returns `null` and is allowed for the main admin only.
import type { Permission } from '../permissions.ts';

type Rule = { pattern: RegExp; methods: Partial<Record<string, Permission | ((action: string) => Permission)>> };

const id = '[^/]+';
const rules: Rule[] = [
	// Pages (GET only; all writes go through the API routes below).
	{ pattern: /^\/dashboard\/?$/, methods: { GET: 'dashboard.view' } },
	{ pattern: /^\/analytics\/?$/, methods: { GET: 'analytics.view' } },
	{ pattern: new RegExp(`^/orders(/${id})?/?$`), methods: { GET: 'orders.view' } },
	{ pattern: /^\/customers\/?$/, methods: { GET: 'customers.view' } },
	{ pattern: /^\/editors\/?$/, methods: { GET: 'staff.view' } },
	{ pattern: new RegExp(`^/invoices(/${id})?/?$`), methods: { GET: 'invoices.view' } },
	{ pattern: /^\/settings(\/sheets)?\/?$/, methods: { GET: 'settings.manage' } },

	// Shared shell data.
	{ pattern: /^\/api\/capabilities$/, methods: { GET: 'dashboard.view', PATCH: 'settings.manage' } },
	{ pattern: /^\/api\/notifications$/, methods: { GET: 'dashboard.view', POST: 'dashboard.view' } },
	{ pattern: /^\/api\/settings$/, methods: { GET: 'dashboard.view', PATCH: 'settings.manage' } },
	{ pattern: /^\/api\/settings\/whatsapp$/, methods: { PATCH: 'settings.manage' } },

	// Customers.
	{ pattern: /^\/api\/customers$/, methods: { GET: 'customers.view', POST: 'customers.edit' } },
	{ pattern: new RegExp(`^/api/customers/${id}$`), methods: { PATCH: 'customers.edit', POST: (action) => action === 'restore' ? 'customers.delete' : 'customers.edit', DELETE: 'customers.delete' } },

	// Orders, tasks, payments, invoices, messages.
	{ pattern: /^\/api\/orders$/, methods: { GET: 'orders.view', POST: 'orders.edit' } },
	{ pattern: /^\/api\/orders\/export$/, methods: { GET: 'reports.export' } },
	{ pattern: new RegExp(`^/api/orders/${id}$`), methods: { GET: 'orders.view', PATCH: 'orders.edit', POST: 'orders.delete', DELETE: 'orders.delete' } },
	{ pattern: new RegExp(`^/api/orders/${id}/tasks$`), methods: { POST: 'orders.edit' } },
	{ pattern: new RegExp(`^/api/orders/${id}/whatsapp$`), methods: { POST: 'orders.edit' } },
	{ pattern: new RegExp(`^/api/orders/${id}/customer-whatsapp$`), methods: { POST: 'messages.customer' } },
	{ pattern: new RegExp(`^/api/orders/${id}/payments$`), methods: { POST: 'payments.record' } },
	{ pattern: new RegExp(`^/api/orders/${id}/invoice$`), methods: { POST: 'invoices.manage' } },
	{ pattern: new RegExp(`^/api/tasks/${id}$`), methods: { PATCH: 'orders.edit', DELETE: 'orders.edit', POST: 'orders.edit' } },
	{ pattern: /^\/api\/event-options$/, methods: { GET: 'orders.view', POST: 'orders.edit', DELETE: 'orders.delete' } },
	{ pattern: new RegExp(`^/api/invoices/${id}$`), methods: { PATCH: 'invoices.manage' } },
	{ pattern: new RegExp(`^/api/invoices/${id}/whatsapp$`), methods: { POST: 'messages.customer' } },
	{ pattern: /^\/api\/export$/, methods: { GET: 'reports.export' } },

	// Staff.
	{ pattern: /^\/api\/editors$/, methods: { GET: 'staff.view', POST: 'staff.manage' } },
	{ pattern: /^\/api\/editors\/reconcile$/, methods: { POST: 'settings.manage' } },
	{ pattern: new RegExp(`^/api/editors/${id}(/whatsapp)?$`), methods: { PATCH: 'staff.manage', POST: 'staff.manage', DELETE: 'staff.manage' } },

	// Google Sheets.
	{ pattern: /^\/api\/sheets\/sync$/, methods: { GET: 'dashboard.view', POST: 'settings.manage' } },
	{ pattern: /^\/api\/sheets\/import$/, methods: { POST: 'settings.manage' } }
];

/** Routes whose permission depends on the JSON body's `action` field. */
export const needsAction = (method: string, pathname: string) => method === 'POST' && new RegExp(`^/api/customers/${id}$`).test(pathname);

/** The permission a request needs, or null when the route isn't mapped (main admin only). */
export function permissionForRequest(method: string, pathname: string, action = ''): Permission | null {
	const verb = method === 'HEAD' ? 'GET' : method;
	// Reserved rule ordering: '/api/orders/export' must win over '/api/orders/:id'.
	for (const rule of rules) {
		if (!rule.pattern.test(pathname)) continue;
		const value = rule.methods[verb];
		if (!value) return null;
		return typeof value === 'function' ? value(action) : value;
	}
	return null;
}

/** For tests: every rule's pattern, so route coverage can be checked. */
export const permissionRulePatterns = rules.map((rule) => rule.pattern);
