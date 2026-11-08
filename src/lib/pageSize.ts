// Remembers each list's "rows per page" choice in this browser only. Storage can be blocked; fall back quietly.
export const PAGE_SIZES = [10, 25, 50, 100];

export function readPageSize(key: string, fallback: number) {
	try {
		const value = Number(globalThis.localStorage?.getItem(`nexadesk.pageSize.${key}`));
		return PAGE_SIZES.includes(value) ? value : fallback;
	} catch {
		return fallback;
	}
}

export function savePageSize(key: string, size: number) {
	try { globalThis.localStorage?.setItem(`nexadesk.pageSize.${key}`, String(size)); } catch { /* storage blocked */ }
}

// The rows to show for one page of an already filtered list.
export function pageSlice<T>(items: T[], page: number, size: number) {
	const pages = Math.max(1, Math.ceil(items.length / size));
	const current = Math.min(Math.max(1, page), pages);
	return items.slice((current - 1) * size, current * size);
}
