import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { addEventOption, deleteEventOption, listEventOptions } from '$lib/server/repository';

export const GET = async ({ cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json({ options: await listEventOptions(await readyDatabase(platform)) });
};

export const POST = async ({ request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	try {
		return json({ options: await addEventOption(await readyDatabase(platform), String(input.name || '')) }, { status: 201 });
	} catch (cause) {
		return json({ error: cause instanceof Error ? cause.message : 'Unable to add event type.' }, { status: 400 });
	}
};

export const DELETE = async ({ request, cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const input = await request.json();
	return json({ options: await deleteEventOption(await readyDatabase(platform), String(input.name || '')) });
};
