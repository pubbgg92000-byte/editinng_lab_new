import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const email = () => env.ADMIN_EMAIL || (dev ? 'admin@studioflow.app' : '');
const password = () => env.ADMIN_PASSWORD || (dev ? 'studioflow' : '');
const secret = () => env.SESSION_SECRET || (dev ? 'studioflow-local-development-secret' : '');
const bytes = (value: string) => new TextEncoder().encode(value);

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

async function sign(value: string) {
	if (!secret()) throw new Error('SESSION_SECRET is required.');
	const key = await crypto.subtle.importKey('raw', bytes(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	const signature = await crypto.subtle.sign('HMAC', key, bytes(value));
	return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(userEmail: string) { const payload = `${userEmail}:${Date.now()}`; return `${payload}:${await sign(payload)}`; }
export async function verifySession(token?: string) {
	if (!token) return false;
	const parts = token.split(':'); if (parts.length < 3) return false;
	const signature = parts.pop()!; const payload = parts.join(':');
	return signature === await sign(payload) && Date.now() - Number(parts.at(-1)) < SESSION_MAX_AGE_SECONDS * 1000;
}
export const validCredentials = (userEmail: string, userPassword: string) => Boolean(email() && password()) && userEmail.trim().toLowerCase() === email().toLowerCase() && userPassword === password();
