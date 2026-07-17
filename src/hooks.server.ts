import type { Handle } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
import { getAuthSession, SESSION_COOKIE } from '$lib/server/auth';

const protectedPrefixes = ['/dashboard', '/customers', '/orders', '/editors', '/invoices', '/settings', '/api'];

export const handle: Handle = async ({ event, resolve }) => {
	const session = await getAuthSession(event.cookies.get(SESSION_COOKIE)).catch(() => null);
	event.locals.session = session;
	event.locals.account = session?.account || null;
	event.locals.tenant = session?.tenant || null;

	const pathname = event.url.pathname;
	const isOwnerLogin = pathname === '/owner/login';
	if (pathname.startsWith('/owner') && !isOwnerLogin && event.locals.account?.role !== 'owner') redirect(303, '/owner/login');

	const needsClient = protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) && !pathname.startsWith('/api/portal/');
	if (needsClient && (!event.locals.tenant || event.locals.account?.role !== 'client_admin')) {
		if (pathname.startsWith('/api')) error(401, 'Unauthorized');
		redirect(303, '/login');
	}

	if (!['GET', 'HEAD', 'OPTIONS'].includes(event.request.method)) {
		const origin = event.request.headers.get('origin');
		if (origin && origin !== event.url.origin) error(403, 'Invalid request origin.');
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name.toLowerCase() !== 'set-cookie'
	});
};
