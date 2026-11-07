// Team roles and what each can do inside a workspace (P1). Shared by the server checks and the UI.
// The workspace's main admin (`client_admin`) can always do everything, so existing workspaces
// behave exactly as before.

export const tenantRoles = ['client_admin', 'manager', 'front_desk', 'accounts', 'viewer'] as const;
export type TenantRole = (typeof tenantRoles)[number];

export const permissionKeys = [
	'dashboard.view',
	'analytics.view',
	'orders.view',
	'orders.edit',
	'orders.delete',
	'customers.view',
	'customers.edit',
	'customers.delete',
	'staff.view',
	'staff.manage',
	'payments.record',
	'invoices.view',
	'invoices.manage',
	'reports.export',
	'messages.customer',
	'settings.manage',
	'team.manage'
] as const;
export type Permission = (typeof permissionKeys)[number];

export const roleLabels: Record<TenantRole, string> = {
	client_admin: 'Admin',
	manager: 'Manager',
	front_desk: 'Front desk',
	accounts: 'Accounts',
	viewer: 'Viewer'
};

const everything = [...permissionKeys];
export const rolePermissions: Record<TenantRole, readonly Permission[]> = {
	client_admin: everything,
	manager: everything.filter((key) => key !== 'settings.manage' && key !== 'team.manage'),
	front_desk: ['dashboard.view', 'orders.view', 'orders.edit', 'customers.view', 'customers.edit', 'staff.view', 'payments.record', 'invoices.view', 'messages.customer'],
	accounts: ['dashboard.view', 'analytics.view', 'orders.view', 'customers.view', 'payments.record', 'invoices.view', 'invoices.manage', 'reports.export', 'messages.customer'],
	viewer: ['dashboard.view', 'orders.view', 'customers.view', 'staff.view', 'invoices.view']
};

export const isTenantRole = (role: unknown): role is TenantRole => tenantRoles.includes(role as TenantRole);

/** True when the role may perform the action. Unknown roles may do nothing. */
export const can = (role: string | null | undefined, permission: Permission) =>
	isTenantRole(role) && rolePermissions[role].includes(permission);

export const permissionsFor = (role: string | null | undefined): Permission[] =>
	isTenantRole(role) ? [...rolePermissions[role]] : [];
