import type { Handle } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
import { getAuthSession, SESSION_COOKIE } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getTenantConfiguration } from '$lib/server/configuration';
import { capabilityRegistry, hasCapability } from '$lib/capabilities';
import { capabilitiesForPath } from '$lib/server/capabilityRoutes';
import { clearCache } from '$lib/server/cache';
import { can, isTenantRole } from '$lib/permissions';
import { needsAction, permissionForRequest } from '$lib/server/permissionRoutes';

/**
 * Global request gate: separates owner, client-admin, API, and public portal access
 * before a page runs, and rejects cross-site form/API mutations.
 */
const protectedPrefixes = ['/dashboard', '/analytics', '/customers', '/orders', '/editors', '/invoices', '/settings', '/api'];
export const handle: Handle = async ({ event, resolve }) => {
	// Writes must never be served from (or leave behind) cached session/settings/configuration.
	const isWrite = !['GET', 'HEAD', 'OPTIONS'].includes(event.request.method);
	if (isWrite) clearCache();
	// Load one control session, then enforce owner and client route boundaries centrally.
	const session = await getAuthSession(event.cookies.get(SESSION_COOKIE)).catch(() => null);
	event.locals.session = session;
	event.locals.account = session?.account || null;
	event.locals.tenant = session?.tenant || null;

	const pathname = event.url.pathname;
	// Single sign-in: /login routes each account by role (owner → /owner, workspace admin → /dashboard).
	const isOwnerLogin = pathname === '/owner/login';
	if (pathname.startsWith('/owner') && !isOwnerLogin && event.locals.account?.role !== 'owner') redirect(303, '/login');

	const needsClient = protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) && !pathname.startsWith('/api/portal/');
	if (needsClient && (!event.locals.tenant || !isTenantRole(event.locals.account?.role))) {
		if (pathname.startsWith('/api')) error(401, 'Unauthorized');
		redirect(303, '/login');
	}
	// Team roles (default deny): unmapped requests are for the main admin only.
	if (needsClient) {
		const role = event.locals.account!.role;
		let action = '';
		if (role !== 'client_admin' && needsAction(event.request.method, pathname)) {
			action = String((await event.request.clone().json().catch(() => ({})))?.action || '');
		}
		const permission = permissionForRequest(event.request.method, pathname, action);
		const allowed = role === 'client_admin' || (permission !== null && can(role, permission));
		if (!allowed) {
			if (pathname.startsWith('/api') || event.request.method !== 'GET') error(403, 'Your role does not allow this.');
			redirect(303, pathname.startsWith('/dashboard') ? '/login' : '/dashboard?denied=1');
		}
	}
	const required = capabilitiesForPath(pathname);
	if (required.length && event.locals.tenant) {
		const database = await readyDatabase(event.locals.tenant);
		const configuration = await getTenantConfiguration(database, event.locals.tenant);
		const unavailable = required.find((capability) => !hasCapability(configuration.effectiveCapabilities, capability));
		if (unavailable) error(403, `${capabilityRegistry[unavailable].label} is not available for this workspace.`);
	}

	if (!['GET', 'HEAD', 'OPTIONS'].includes(event.request.method)) {
		const origin = event.request.headers.get('origin');
		if (origin && origin !== event.url.origin) error(403, 'Invalid request origin.');
	}

	const response = await resolve(event, {
		filterSerializedResponseHeaders: (name) => name.toLowerCase() !== 'set-cookie'
	});
	if (isWrite) clearCache();
	return response;
};
