// Loads the current tenant's editable studio settings and connection/sync summary.
import { readyDatabase } from '$lib/server/db';
import { getSettings, syncQueueStatus } from '$lib/server/repository';
import { getTenantConfiguration } from '$lib/server/configuration';
import { capabilityKeys, capabilityRegistry } from '$lib/capabilities';
export const load = async ({ locals }) => {
	const database = await readyDatabase(locals.tenant);
	return {
		settings: await getSettings(database),
		configuration: await getTenantConfiguration(database, locals.tenant!),
		capabilityDefinitions: capabilityKeys.map((key) => capabilityRegistry[key]),
		sync: await syncQueueStatus(database)
	};
};
