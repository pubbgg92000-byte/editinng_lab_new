// Root loader supplies tenant branding and a tenant-scoped theme to every page and portal.
import { readyDatabase } from '$lib/server/db';
import { getSettings } from '$lib/server/repository';
import { getTenantConfiguration } from '$lib/server/configuration';
import { allCapabilities, defaultPackage, resolveCapabilities } from '$lib/capabilities';
import { env } from '$env/dynamic/public';
import type { StudioSettings } from '$lib/types';
import { findLegacyTenant, findTenantBySlug } from '$lib/server/control';
export const load = async ({ locals, url }) => {
	let settings: StudioSettings = { studioName: 'NexaDesk', orderPrefix: 'ORD', editorPrefix: 'ED', logoUrl: '', address: '', phone: '', email: '', gstin: '', paymentNote: '', invoiceFooter: '', assignmentTemplate: '', invoiceTemplate: '', themePalette: 'graphite-aqua', themeDefaultMode: 'light' };
	let configuration = { profile: defaultPackage.profile, allowedCapabilities: allCapabilities, preferences: defaultPackage.enabled, effectiveCapabilities: resolveCapabilities(allCapabilities, defaultPackage.enabled) };
	let themeTenant = locals.tenant || undefined;
	try {
		if (!themeTenant) {
			const portalSlug = url.pathname.match(/^\/portal\/([^/]+)\/(?:customer|editor)\//)?.[1];
			if (portalSlug) themeTenant = await findTenantBySlug(decodeURIComponent(portalSlug));
			else if (/^\/(?:customer|editor)\//.test(url.pathname)) themeTenant = await findLegacyTenant();
		}
		if (themeTenant?.status === 'active') {
			const database = await readyDatabase(themeTenant);
			[settings, configuration] = await Promise.all([getSettings(database), getTenantConfiguration(database, themeTenant)]);
		}
	}
	catch { /* Use the neutral shell while a tenant connection is unavailable. */ }
	const tenantSlug = themeTenant?.slug || '';
	return {
		settings,
		configuration,
		appUrl: String(env.PUBLIC_APP_URL || url.origin).replace(/\/$/, ''),
		pageUrl: `${url.origin}${url.pathname}`,
		tenantSlug,
		themeScope: tenantSlug || 'public',
		useLastWorkspaceTheme: url.pathname === '/login'
	};
};
