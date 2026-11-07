// Short-lived, per-instance cache for data read on every request (session, settings, workspace
// configuration). Page changes otherwise repeat the same database round trips several times.
// Any write request clears it (see hooks.server.ts), so changes are visible immediately on this
// instance; other serverless instances catch up within the TTL.

type Entry = { expires: number; value: Promise<unknown> };

const store = new Map<string, Entry>();
export const CACHE_TTL_MS = 15_000;

/** Return a cached value (deep-copied so callers can't mutate shared state), loading it on a miss. */
export async function cached<T>(key: string, load: () => Promise<T>, ttl = CACHE_TTL_MS): Promise<T> {
	const now = Date.now();
	let entry = store.get(key);
	if (!entry || entry.expires <= now) {
		const value = load();
		entry = { expires: now + ttl, value };
		store.set(key, entry);
		// Never cache failures.
		value.catch(() => { if (store.get(key)?.value === value) store.delete(key); });
	}
	return structuredClone(await (entry.value as Promise<T>));
}

/** Clear everything, or only keys starting with a prefix. */
export function clearCache(prefix = '') {
	if (!prefix) { store.clear(); return; }
	for (const key of store.keys()) if (key.startsWith(prefix)) store.delete(key);
}

// Stable per-process ids for database handles (one handle per tenant database URL).
const databaseIds = new WeakMap<object, string>();
let nextDatabaseId = 0;
export function databaseKey(database: object) {
	let key = databaseIds.get(database);
	if (!key) { key = `db${++nextDatabaseId}`; databaseIds.set(database, key); }
	return key;
}
