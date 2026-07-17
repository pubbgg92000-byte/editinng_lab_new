import { error } from '@sveltejs/kit';
import { findTenantBySlug } from '$lib/server/control';
import { loadCustomerPortal } from '$lib/server/portals';

export const load = async ({ params }) => {
	const tenant = await findTenantBySlug(params.slug);
	if (!tenant) error(404, 'Studio not found.');
	return loadCustomerPortal(tenant, params.token);
};
