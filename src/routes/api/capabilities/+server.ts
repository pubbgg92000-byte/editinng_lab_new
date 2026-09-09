import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getTenantConfiguration } from '$lib/server/configuration';
import { capabilityKeys, capabilityRegistry } from '$lib/capabilities';

export const GET = async ({ cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	return json({
		configuration: await getTenantConfiguration(database, locals.tenant!),
		definitions: capabilityKeys.map((key) => capabilityRegistry[key])
	});
};

export const PATCH = async ({ cookies }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	return json({ error: 'Workspace features, portals, and messaging templates are managed by the platform administrator.' }, { status: 403 });
};
