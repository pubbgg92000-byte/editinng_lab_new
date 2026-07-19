// Editor collection API: list/create with phone, availability, map-link, and duplicate checks.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { createEditor, listEditors } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { indianMobileError } from '$lib/phone';

export const GET = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json({ editors: await listEditors(await readyDatabase(locals.tenant), true) });
};

export const POST = async ({ request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	if (!String(input.name || '').trim()) return json({ error: 'Editor name is required.' }, { status: 400 });
	const phoneError = indianMobileError(input.phone, true);
	if (phoneError) return json({ error: phoneError }, { status: 400 });
	if (String(input.locationUrl || '').trim() && !/^https:\/\//i.test(String(input.locationUrl).trim())) return json({ error: 'Google Maps location must be an HTTPS link.' }, { status: 400 });
	const database = await readyDatabase(locals.tenant);
	let editor;
	try { editor = await createEditor(database, input); }
	catch (cause) { return json({ error: cause instanceof Error ? cause.message : 'Unable to save editor.' }, { status: 400 }); }
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, editor }, { status: 201 });
};
