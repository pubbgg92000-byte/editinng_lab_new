import { readyDatabase } from '$lib/server/db';
import { getSettings } from '$lib/server/repository';
export const load = async ({ locals }) => {
	try { if (locals.tenant) return { settings: await getSettings(await readyDatabase(locals.tenant)) }; }
	catch { /* Use the neutral shell while a tenant connection is unavailable. */ }
	return { settings: { studioName: 'StudioFlow', logoUrl: '', address: '', phone: '', email: '', gstin: '', paymentNote: '', invoiceFooter: '', assignmentTemplate: '', invoiceTemplate: '', themePalette: 'graphite-aqua' as const, themeDefaultMode: 'light' as const } };
};
