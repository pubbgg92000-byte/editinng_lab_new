import { fail, redirect } from '@sveltejs/kit';
import { authenticate, createAuthSession, SESSION_COOKIE } from '$lib/server/auth';

export const load = async ({ locals }) => {
	if (locals.account?.role === 'owner') redirect(303, '/owner');
	if (locals.tenant) redirect(303, '/dashboard');
	return {};
};

export const actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const form = await request.formData();
		const email = String(form.get('email') || '');
		const result = await authenticate(email, String(form.get('password') || ''), getClientAddress());
		if ('rateLimited' in result) return fail(429, { rateLimited: true, email });
		if (!result.account) return fail(400, { invalid: true, email });
		const session = await createAuthSession(result.account);
		cookies.set(SESSION_COOKIE, session.token, {
			path: '/', httpOnly: true, sameSite: 'lax', secure: url.protocol === 'https:', maxAge: session.maxAge
		});
		redirect(303, result.account.role === 'owner' ? '/owner' : '/dashboard');
	}
};
