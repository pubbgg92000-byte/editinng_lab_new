import { readyDatabase } from '$lib/server/db';
import { getSettings } from '$lib/server/repository';
import { env } from '$env/dynamic/public';
import type { StudioSettings } from '$lib/types';
export const load = async ({ locals, url }) => {
	let settings: StudioSettings = { studioName: 'StudioFlow', logoUrl: '', address: '', phone: '', email: '', gstin: '', paymentNote: '', invoiceFooter: '', assignmentTemplate: '', invoiceTemplate: '', themePalette: 'graphite-aqua', themeDefaultMode: 'light' };
	try { if (locals.tenant) settings = await getSettings(await readyDatabase(locals.tenant)); }
	catch { /* Use the neutral shell while a tenant connection is unavailable. */ }
	const tenantSlug = locals.tenant?.slug || '';
	return { settings, appUrl: String(env.PUBLIC_APP_URL || url.origin).replace(/\/$/, ''), tenantSlug, themeScope: tenantSlug || 'public' };
};
