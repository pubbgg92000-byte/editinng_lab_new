import { error } from '@sveltejs/kit';
import { capabilityRegistry, hasCapability, resolveCapabilities, validatePreferences } from '$lib/capabilities';
import type { BusinessProfile, CapabilityKey, Tenant, TenantConfiguration, TenantPreferences, WorkspaceModuleConfiguration } from '$lib/types';
import { getTenantPackage } from './control';
import { getBusinessProfile, getCapabilityPreferences, getModuleConfigurationOverrides, getSettings, updateModuleConfigurationOverrides, updateTenantProfile } from './repository';
import {
	legacyModuleOverrides,
	mergeModuleConfiguration,
	moduleOverridesFromEffective,
	normalizePackageModuleConfiguration,
	validateModuleConfiguration
} from '$lib/moduleConfiguration';

export async function getTenantConfiguration(database: AppDatabase, tenant: Tenant): Promise<TenantConfiguration> {
	const [profile, preferences, assignment, savedOverrides, settings] = await Promise.all([
		getBusinessProfile(database),
		getCapabilityPreferences(database),
		getTenantPackage(tenant.id),
		getModuleConfigurationOverrides(database),
		getSettings(database)
	]);
	const packageModuleConfiguration = normalizePackageModuleConfiguration(profile.presetId, assignment.package.moduleConfiguration);
	const moduleOverrides = savedOverrides ?? legacyModuleOverrides(settings);
	return {
		profile,
		allowedCapabilities: assignment.allowed,
		preferences,
		effectiveCapabilities: resolveCapabilities(assignment.allowed, preferences),
		packageModuleConfiguration,
		moduleOverrides,
		moduleConfiguration: mergeModuleConfiguration(packageModuleConfiguration, moduleOverrides)
	};
}

export async function saveTenantPreferences(database: AppDatabase, tenant: Tenant, input: unknown) {
	const configuration = await getTenantConfiguration(database, tenant);
	const preferences = {
		...configuration.preferences,
		...validatePreferences(input, configuration.allowedCapabilities)
	} as TenantPreferences;
	await updateTenantProfile(database, configuration.profile, preferences);
	return getTenantConfiguration(database, tenant);
}

export async function saveBusinessProfile(database: AppDatabase, tenant: Tenant, profile: BusinessProfile) {
	const configuration = await getTenantConfiguration(database, tenant);
	if (!hasCapability(configuration.effectiveCapabilities, 'customFields') && JSON.stringify(profile.customFields) !== JSON.stringify(configuration.profile.customFields)) {
		error(403, 'Custom fields are not available for this workspace.');
	}
	const submitted = new Set(profile.customFields.map((field) => `${field.entity}:${field.key}`));
	const preserved = configuration.profile.customFields
		.filter((field) => !submitted.has(`${field.entity}:${field.key}`))
		.map((field) => ({ ...field, active: false }));
	const normalized: BusinessProfile = {
		...profile,
		presetId: configuration.profile.presetId,
		presetVersion: configuration.profile.presetVersion,
		customFields: [...profile.customFields, ...preserved],
		region: configuration.profile.region
	};
	await updateTenantProfile(database, normalized, configuration.preferences);
	return getTenantConfiguration(database, tenant);
}

export async function saveModuleConfiguration(database: AppDatabase, tenant: Tenant, input: unknown) {
	const configuration = await getTenantConfiguration(database, tenant);
	const submitted = validateModuleConfiguration(input, configuration.profile, configuration.allowedCapabilities);
	const overrides = moduleOverridesFromEffective(configuration.packageModuleConfiguration, submitted);
	await updateModuleConfigurationOverrides(database, overrides);
	return getTenantConfiguration(database, tenant);
}

export async function requireCapability(database: AppDatabase, tenant: Tenant | null | undefined, capability: CapabilityKey) {
	if (!tenant) error(401, 'Unauthorized');
	const configuration = await getTenantConfiguration(database, tenant);
	if (!hasCapability(configuration.effectiveCapabilities, capability)) {
		error(403, `${capabilityRegistry[capability].label} is not available for this workspace.`);
	}
	return configuration;
}
