import type { StudioSettings } from '$lib/types';

const cleanPrefix = (value: string | undefined, fallback: string) => String(value || fallback).toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8) || fallback;

/** Converts the tenant's numeric order serial into its readable business ID. */
export const orderCode = (settings: Pick<StudioSettings, 'orderPrefix'> | undefined, serial: number | undefined) =>
	`${cleanPrefix(settings?.orderPrefix, 'ORD')}-${String(Number(serial || 0)).padStart(4, '0')}`;

/** Keeps an editor's numeric suffix while applying the current tenant prefix. */
export const editorCode = (settings: Pick<StudioSettings, 'editorPrefix'> | undefined, code: string | undefined) => {
	const suffix = String(code || '').match(/(\d+)$/)?.[1];
	return suffix ? `${cleanPrefix(settings?.editorPrefix, 'ED')}-${suffix.padStart(4, '0')}` : String(code || '');
};
