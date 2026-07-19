// Changes invoice lifecycle status and mirrors the result to Google Sheets.
import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { updateInvoiceStatus } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const PATCH = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json().catch(() => ({})) as { status?: string };
	if (!['draft', 'sent', 'paid', 'cancelled'].includes(input.status || '')) return json({ error: 'Unknown invoice status.' }, { status: 400 });
	const database = await readyDatabase(locals.tenant);
	const invoice = await updateInvoiceStatus(database, params.id, input.status as 'draft' | 'sent' | 'paid' | 'cancelled');
	if (invoice) await flushSheetSync(database, locals.tenant!);
	return invoice ? json({ ok: true, invoice }) : json({ error: 'Invoice not found.' }, { status: 404 });
};
