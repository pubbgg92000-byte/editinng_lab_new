import { readyDatabase } from '$lib/server/db';
import { getSettings } from '$lib/server/repository';
export const load = async ({ platform }) => {
	try { return { settings: await getSettings(await readyDatabase(platform)) }; }
	catch { return { settings: { studioName: 'Anjana Creations', address: '', phone: '', email: '', gstin: '', paymentNote: '', invoiceFooter: '', assignmentTemplate: '', invoiceTemplate: '', themePalette: 'graphite-aqua' as const, themeDefaultMode: 'light' as const } }; }
};
