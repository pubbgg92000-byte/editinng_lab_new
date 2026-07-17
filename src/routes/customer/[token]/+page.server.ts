import { error } from '@sveltejs/kit';
import { findLegacyTenant } from '$lib/server/control';
import { loadCustomerPortal } from '$lib/server/portals';

export const load = async ({ params }) => {
	const tenant = await findLegacyTenant();
	if (!tenant) error(404, 'This legacy portal link is unavailable.');
	return loadCustomerPortal(tenant, params.token);
};
