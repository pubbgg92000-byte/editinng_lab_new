import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getSettings, updateSettings } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { indianMobileError, normalizeIndianMobile } from '$lib/phone';

export const GET = async ({ locals }) => json({ settings: await getSettings(await readyDatabase(locals.tenant)) });

export const PATCH = async ({ request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const input = await request.json() as Record<string, unknown>;
	const allowed = new Set(['studioName', 'orderPrefix', 'editorPrefix', 'logoUrl', 'address', 'phone', 'email', 'gstin', 'paymentNote', 'invoiceFooter', 'assignmentTemplate', 'invoiceTemplate', 'themePalette', 'themeDefaultMode']);
	const safeInput = Object.fromEntries(Object.entries(input).filter(([key]) => allowed.has(key)));
	for (const key of ['orderPrefix', 'editorPrefix']) {
		if (safeInput[key] === undefined) continue;
		const prefix = String(safeInput[key] || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
		if (!prefix) return json({ error: `${key === 'orderPrefix' ? 'Order' : 'Editor'} prefix must contain letters or numbers.` }, { status: 400 });
		safeInput[key] = prefix;
	}
	const logoUrl = String(safeInput.logoUrl || '').trim();
	if (logoUrl && !logoUrl.startsWith('https://') && !logoUrl.startsWith('/')) return json({ error: 'Logo URL must use HTTPS.' }, { status: 400 });
	if (safeInput.phone !== undefined && String(safeInput.phone || '').trim()) {
		const phoneError = indianMobileError(safeInput.phone);
		if (phoneError) return json({ error: phoneError }, { status: 400 });
		safeInput.phone = normalizeIndianMobile(safeInput.phone);
	}
	const settings = await updateSettings(database, safeInput);
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, settings });
};
