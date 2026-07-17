import { authenticate, createAuthSession, destroyAuthSession, getAuthSession } from './control';
import type { Account } from '$lib/types';

export const SESSION_COOKIE = 'studioflow_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export { authenticate, createAuthSession, destroyAuthSession, getAuthSession };

export async function createSession(account: Account) {
	return createAuthSession(account);
}

export async function verifySession(token?: string) {
	return Boolean(await getAuthSession(token));
}
