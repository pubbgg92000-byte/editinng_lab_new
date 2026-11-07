// Release guard for team roles (P1): role table, full route coverage, and sample denials.
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { can, permissionKeys, permissionsFor, rolePermissions, tenantRoles } from '../src/lib/permissions.ts';
import { permissionForRequest } from '../src/lib/server/permissionRoutes.ts';

// 1. Role table.
assert.deepEqual([...tenantRoles], ['client_admin', 'manager', 'front_desk', 'accounts', 'viewer']);
assert.deepEqual(permissionsFor('client_admin').sort(), [...permissionKeys].sort(), 'main admin must keep every permission');
assert.equal(can('owner', 'orders.view'), false, 'platform owner is not a workspace role');
assert.equal(can(undefined, 'dashboard.view'), false);
for (const role of tenantRoles) {
	assert.ok(can(role, 'dashboard.view'), `${role} must reach the dashboard (denied pages redirect there)`);
	for (const permission of rolePermissions[role]) assert.ok(permissionKeys.includes(permission), `${role}: unknown ${permission}`);
}
assert.equal(can('manager', 'settings.manage'), false);
assert.equal(can('manager', 'team.manage'), false);
assert.equal(can('front_desk', 'orders.delete'), false);
assert.equal(can('front_desk', 'analytics.view'), false);
assert.equal(can('accounts', 'orders.edit'), false);
assert.equal(can('viewer', 'payments.record'), false);

// 2. Every admin API method and admin page must be mapped (unmapped = main admin only).
const root = fileURLToPath(new URL('../src/routes', import.meta.url));
async function files(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
}
const toPath = (file) => '/' + relative(root, file).split(sep).slice(0, -1).filter((part) => !/^\(.+\)$/.test(part)).map((part) => part.replace(/^\[.+\]$/, 'sample-id')).join('/');
const unmapped = [];
let checked = 0;
for (const file of await files(root)) {
	if (file.endsWith('+server.ts')) {
		const path = toPath(file);
		if (!path.startsWith('/api/') || path.startsWith('/api/portal/')) continue;
		const source = await readFile(file, 'utf8');
		for (const [, method] of source.matchAll(/export (?:const|async function) (GET|POST|PATCH|PUT|DELETE)\b/g)) {
			checked++;
			if (!permissionForRequest(method, path)) unmapped.push(`${method} ${path}`);
		}
	}
	if (file.endsWith('+page.svelte') && relative(root, file).startsWith('(admin)')) {
		const path = toPath(file);
		checked++;
		if (!permissionForRequest('GET', path)) unmapped.push(`GET ${path} (page)`);
	}
}
assert.ok(checked > 50, `route scan looks empty (${checked})`);
assert.deepEqual(unmapped, [], `Unmapped routes fall back to admin-only; map them in permissionRoutes.ts:\n${unmapped.join('\n')}`);

// 3. Sample requests.
const allowedFor = (role, method, path, action) => {
	const permission = permissionForRequest(method, path, action);
	return role === 'client_admin' || (permission !== null && can(role, permission));
};
assert.equal(allowedFor('front_desk', 'DELETE', '/api/orders/ORD-1'), false);
assert.equal(allowedFor('front_desk', 'POST', '/api/orders'), true);
assert.equal(allowedFor('viewer', 'POST', '/api/customers'), false);
assert.equal(allowedFor('accounts', 'GET', '/settings'), false);
assert.equal(allowedFor('accounts', 'GET', '/api/orders/export'), true, 'export must not be read as an order id');
assert.equal(allowedFor('front_desk', 'GET', '/api/orders/export'), false);
assert.equal(allowedFor('front_desk', 'POST', '/api/customers/C-1', 'restore'), false);
assert.equal(allowedFor('front_desk', 'POST', '/api/customers/C-1', 'regenerate-token'), true);
assert.equal(allowedFor('manager', 'POST', '/api/editors/reconcile'), false);
assert.equal(allowedFor('manager', 'GET', '/api/some-new-route'), false, 'unmapped routes are admin-only');
assert.equal(allowedFor('client_admin', 'GET', '/api/some-new-route'), true);

console.log(`Permission audit passed: ${tenantRoles.length} roles, ${permissionKeys.length} permissions, ${checked} admin routes mapped.`);
