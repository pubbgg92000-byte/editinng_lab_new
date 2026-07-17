import { redirect } from '@sveltejs/kit';
import { destroyAuthSession, SESSION_COOKIE } from '$lib/server/auth';

export const GET = async ({ cookies }) => {
	await destroyAuthSession(cookies.get(SESSION_COOKIE));
	cookies.delete(SESSION_COOKIE, { path: '/' });
	redirect(303, '/login');
};
