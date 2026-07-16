import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { recordPayment } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const POST = async ({ params, request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	if (!(Number(input.amount) > 0)) return json({ error: 'Payment amount must be greater than zero.' }, { status: 400 });
	const database = await readyDatabase(platform);
	const payment = await recordPayment(database, params.id, input);
	await flushSheetSync(database);
	return json({ ok: true, payment }, { status: 201 });
};
