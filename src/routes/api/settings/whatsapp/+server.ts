import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getTenantConfiguration, saveModuleConfiguration } from '$lib/server/configuration';
import { flushSheetSync } from '$lib/server/googleSheets';
import { createConfigurationSnapshot } from '$lib/server/repository';
import { validateModuleConfiguration } from '$lib/moduleConfiguration';

export const PATCH = async ({ request, cookies, locals }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	if (!locals.tenant) return json({ error: 'Workspace not found.' }, { status: 404 });
	const database = await readyDatabase(locals.tenant);
	const current = await getTenantConfiguration(database, locals.tenant);
	if (!current.effectiveCapabilities['communications.whatsapp']) {
		return json({ error: 'WhatsApp templates are not enabled for this workspace. Contact your platform administrator.' }, { status: 403 });
	}
	const catalog = await request.json().catch(() => null);
	if (!catalog || typeof catalog !== 'object') return json({ error: 'Invalid WhatsApp message settings.' }, { status: 400 });
	let submitted;
	try {
		submitted = validateModuleConfiguration({
			...current.moduleConfiguration,
			'communications.whatsapp': catalog
		}, current.profile, current.allowedCapabilities);
	} catch (cause) {
		return json({ error: cause instanceof Error ? cause.message : 'WhatsApp message settings are invalid.' }, { status: 400 });
	}
	await createConfigurationSnapshot(database, 'Before administrator WhatsApp template change');
	const configuration = await saveModuleConfiguration(database, locals.tenant, submitted);
	await flushSheetSync(database, locals.tenant);
	return json({ ok: true, catalog: configuration.moduleConfiguration['communications.whatsapp'] });
};
