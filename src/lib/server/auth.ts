import { env } from '$env/dynamic/private';

const email = () => env.ADMIN_EMAIL || 'admin@studioflow.app';
const password = () => env.ADMIN_PASSWORD || 'studioflow';
const secret = () => env.SESSION_SECRET || 'studioflow-local-development-secret';
const bytes = (value: string) => new TextEncoder().encode(value);

async function sign(value: string) {
	const key = await crypto.subtle.importKey('raw', bytes(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	const signature = await crypto.subtle.sign('HMAC', key, bytes(value));
	return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(userEmail: string) { const payload = `${userEmail}:${Date.now()}`; return `${payload}:${await sign(payload)}`; }
export async function verifySession(token?: string) {
	if (!token) return false;
	const parts = token.split(':'); if (parts.length < 3) return false;
	const signature = parts.pop()!; const payload = parts.join(':');
	return signature === await sign(payload) && Date.now() - Number(parts.at(-1)) < 1000 * 60 * 60 * 24 * 14;
}
export const validCredentials = (userEmail: string, userPassword: string) => userEmail.trim().toLowerCase() === email().toLowerCase() && userPassword === password();
