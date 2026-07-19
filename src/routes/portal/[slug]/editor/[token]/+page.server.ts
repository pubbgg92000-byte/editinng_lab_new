// Resolves a tenant-scoped editor portal and returns only safe assigned work fields.
import { error } from '@sveltejs/kit';
import { findTenantBySlug } from '$lib/server/control';
import { loadEditorPortal } from '$lib/server/portals';

export const load = async ({ params }) => {
	const tenant = await findTenantBySlug(params.slug);
	if (!tenant) error(404, 'Studio not found.');
	return loadEditorPortal(tenant, params.token);
};
