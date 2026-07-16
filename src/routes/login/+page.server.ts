import { fail, redirect } from '@sveltejs/kit';
import { createSession, SESSION_MAX_AGE_SECONDS, validCredentials, verifySession } from '$lib/server/auth';

export const load = async ({ cookies }) => {
	if (await verifySession(cookies.get('studioflow_session'))) redirect(303, '/dashboard');
};

export const actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') || '');
		const password = String(form.get('password') || '');
		if (!validCredentials(email, password)) return fail(400, { invalid: true, email });
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
