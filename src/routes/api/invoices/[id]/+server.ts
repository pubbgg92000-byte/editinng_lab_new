import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { updateInvoiceStatus } from '$lib/server/repository';

export const PATCH = async ({ params, request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json().catch(() => ({})) as { status?: string };
	if (!['draft', 'sent', 'paid', 'cancelled'].includes(input.status || '')) return json({ error: 'Unknown invoice status.' }, { status: 400 });
	const invoice = await updateInvoiceStatus(await readyDatabase(locals.tenant), params.id, input.status as 'draft' | 'sent' | 'paid' | 'cancelled');
	return invoice ? json({ ok: true, invoice }) : json({ error: 'Invoice not found.' }, { status: 404 });
};
