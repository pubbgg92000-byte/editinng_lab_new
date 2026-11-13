import { env } from '$env/dynamic/private';

/** Private portals use a random URL token, a database hash, and an encrypted admin copy. */
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const fromBase64url = (value: string) => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), (character) => character.charCodeAt(0));

// Derive the key once per secret; lists decrypt one token per row.
let cachedKey: { secret: string; key: Promise<CryptoKey> } | null = null;
function encryptionKey() {
	const secret = env.SESSION_SECRET;
	if (!secret || secret.length < 24) return Promise.reject(new Error('SESSION_SECRET must be configured with at least 24 characters.'));
	if (cachedKey?.secret !== secret) {
		const key = crypto.subtle.digest('SHA-256', encoder.encode(secret)).then((digest) => crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']));
		key.catch(() => { if (cachedKey?.key === key) cachedKey = null; });
		cachedKey = { secret, key };
	}
	return cachedKey.key;
}

export function createPortalToken() {
	return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashPortalToken(token: string) {
	// The hash authenticates a portal link without storing its usable token in plain text.
	return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(token))));
}

export async function sealPortalToken(token: string) {
	// The encrypted copy lets an admin retrieve and share the same portal link later.
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await encryptionKey(), encoder.encode(token)));
	return `${base64url(iv)}.${base64url(encrypted)}`;
}

export async function openPortalToken(value?: string | null) {
	// An old cipher becomes unreadable after SESSION_SECRET changes; the portal can be regenerated safely.
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
