import { fail, redirect } from '@sveltejs/kit';
import { createSession, SESSION_MAX_AGE_SECONDS, validCredentials, verifySession } from '$lib/server/auth';
import { dev } from '$app/environment';

const attempts = new Map<string, { count: number; resetAt: number }>();

export const load = async ({ cookies }) => {
	if (await verifySession(cookies.get('studioflow_session'))) redirect(303, '/dashboard');
	return { showDemo: dev };
};

export const actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const key = getClientAddress(); const current = attempts.get(key); const now = Date.now();
		if (current && current.resetAt > now && current.count >= 8) return fail(429, { rateLimited: true });
		const form = await request.formData();
		const email = String(form.get('email') || '');
		const password = String(form.get('password') || '');
		if (!validCredentials(email, password)) { attempts.set(key, current && current.resetAt > now ? { ...current, count: current.count + 1 } : { count: 1, resetAt: now + 15 * 60 * 1000 }); return fail(400, { invalid: true, email }); }
		attempts.delete(key);
		cookies.set('studioflow_session', await createSession(email), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: url.protocol === 'https:',
			maxAge: SESSION_MAX_AGE_SECONDS,
			expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)
		});
		redirect(303, '/dashboard');
	}
};
