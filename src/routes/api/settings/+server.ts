import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getSettings, updateSettings } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';

export const GET = async ({ platform }) => json({ settings: await getSettings(await readyDatabase(platform)) });

export const PATCH = async ({ request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(platform);
	const settings = await updateSettings(database, await request.json());
	await flushSheetSync(database);
	return json({ ok: true, settings });
};
