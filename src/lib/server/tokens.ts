import { env } from '$env/dynamic/private';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const fromBase64url = (value: string) => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), (character) => character.charCodeAt(0));

async function encryptionKey() {
	if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 24) throw new Error('SESSION_SECRET must be configured with at least 24 characters.');
	const digest = await crypto.subtle.digest('SHA-256', encoder.encode(env.SESSION_SECRET));
	return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export function createPortalToken() {
	return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashPortalToken(token: string) {
	return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(token))));
}

export async function sealPortalToken(token: string) {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await encryptionKey(), encoder.encode(token)));
	return `${base64url(iv)}.${base64url(encrypted)}`;
}

export async function openPortalToken(value?: string | null) {
	if (!value) return '';
	const [iv, encrypted] = value.split('.');
	if (!iv || !encrypted) return '';
	try {
		const clear = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64url(iv) }, await encryptionKey(), fromBase64url(encrypted));
		return decoder.decode(clear);
	} catch {
		return '';
	}
}
