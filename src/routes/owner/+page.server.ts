// Owner actions for onboarding, connections, credentials, status, demo reset, and password.
import { fail, redirect } from '@sveltejs/kit';
import { assertConnectionsAvailable, assignTenantPackage, changeOwnerPassword, createTenant, getPackage, getTenantById, getTenantPackage, listPackages, listTenantSummaries, savePackage, setTenantConnectionResult, setTenantStatus, updateTenantConnection, updateTenantCredentials } from '$lib/server/control';
import { databaseFromUrl, ensureDatabase, inspectTenantDatabase, readyDatabase } from '$lib/server/db';
import { flushSheetSync, validateSheetConnection } from '$lib/server/googleSheets';
import { applyNichePackage, createConfigurationSnapshot, listConfigurationSnapshots, restoreConfigurationSnapshot, updateSettings } from '$lib/server/repository';
import { resetDemoTenant } from '$lib/server/demo';
import type { BusinessTerminology, CustomFieldDefinition, CustomFieldEntity, CustomFieldType, Tenant, TenantStatus } from '$lib/types';
import { capabilityKeys, capabilityRegistry } from '$lib/capabilities';
import { getTenantConfiguration, saveModuleConfiguration, saveTenantPreferences } from '$lib/server/configuration';
import { normalizePackageModuleConfiguration, validateModuleConfiguration } from '$lib/moduleConfiguration';
import { getDatabaseStorageUsage } from '$lib/server/maintenance';
import { themePalettes } from '$lib/theme';

const field = (form: FormData, name: string) => String(form.get(name) || '').trim();
const message = (cause: unknown) => cause instanceof Error ? cause.message : 'The operation failed.';
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const terminologyKeys: (keyof BusinessTerminology)[] = ['customer', 'order', 'staff', 'task', 'category', 'project', 'dueDate', 'delivery', 'assignedAsset'];

export const load = async ({ locals }) => {
	const [tenants, packages] = await Promise.all([listTenantSummaries(), listPackages()]);
	const enrichedTenants = await Promise.all(tenants.map(async (summary) => {
		try {
			const tenant = await getTenantById(summary.id);
			if (!tenant) throw new Error('Workspace not found.');
			const database = await readyDatabase(tenant);
			const [configuration, settings, storage, snapshots] = await Promise.all([
				getTenantConfiguration(database, tenant),
				(await import('$lib/server/repository')).getSettings(database),
				getDatabaseStorageUsage(database),
				listConfigurationSnapshots(database)
			]);
			return { ...summary, configuration, settings, storage, snapshots };
		} catch {
			const assignment = await getTenantPackage(summary.id);
			const packageModules = normalizePackageModuleConfiguration(assignment.package.id, assignment.package.moduleConfiguration);
			return {
				...summary,
				configuration: {
					profile: assignment.package.profile,
					allowedCapabilities: assignment.allowed,
					preferences: assignment.allowed,
					effectiveCapabilities: assignment.allowed,
					packageModuleConfiguration: packageModules,
					moduleOverrides: {},
					moduleConfiguration: packageModules
				},
				settings: null,
				storage: null,
				snapshots: []
			};
		}
	}));
	return { account: locals.account, tenants: enrichedTenants, packages, capabilityDefinitions: capabilityKeys.map((key) => capabilityRegistry[key]) };
};

export const actions = {
	create: async ({ request, locals }) => {
		const form = await request.formData();
		const passwordConfirm = field(form, 'passwordConfirm');
		const input = {
			internalName: field(form, 'internalName'), slug: field(form, 'slug').toLowerCase(), studioName: field(form, 'studioName'),
			logoUrl: field(form, 'logoUrl'), databaseUrl: field(form, 'databaseUrl'), googleSheetId: field(form, 'googleSheetId'),
			ordersTab: field(form, 'ordersTab') || 'Orders', email: field(form, 'email').toLowerCase(), password: field(form, 'password'),
			isDemo: form.get('isDemo') === 'on', status: 'draft' as TenantStatus, packageId: field(form, 'packageId') || 'editing-studio'
		};
		if (!input.internalName || !input.studioName || !input.email || !input.databaseUrl || !input.googleSheetId) return fail(400, { action: 'create', error: 'Workspace name, display name, administrator email, Neon URL, and Sheet ID are required.' });
		if (!validEmail(input.email)) return fail(400, { action: 'create', error: 'Enter a valid administrator email address.' });
		if (input.password !== passwordConfirm) return fail(400, { action: 'create', error: 'The first password and confirmation do not match.' });
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) return fail(400, { action: 'create', error: 'Slug may contain lowercase letters, numbers, and single hyphens.' });
		if (!input.databaseUrl.startsWith('postgres')) return fail(400, { action: 'create', error: 'Enter a valid PostgreSQL/Neon connection URL.' });
		if (input.logoUrl && !input.logoUrl.startsWith('https://') && !input.logoUrl.startsWith('/')) return fail(400, { action: 'create', error: 'Logo URL must use HTTPS.' });
		try {
			await assertConnectionsAvailable(input.databaseUrl, input.googleSheetId);
			const inspection = await inspectTenantDatabase(input.databaseUrl);
			if (!inspection.compatible) return fail(400, { action: 'create', error: 'This database contains an incompatible schema.' });
			if (!inspection.empty && form.get('attachExisting') !== 'on') return fail(409, { action: 'create', error: `Database already contains ${inspection.counts.orders} orders, ${inspection.counts.customers} customers, and ${inspection.counts.editors} editors. Confirm that you want to attach it.` });
			const temporary = { googleSheetId: input.googleSheetId, ordersTab: input.ordersTab };
			await validateSheetConnection(temporary as Tenant);
			const target = databaseFromUrl(input.databaseUrl);
			await ensureDatabase(target, input.databaseUrl);
			const tenant = await createTenant(input, locals.account!.id);
			if (!tenant) throw new Error('Tenant could not be created.');
			if (tenant.isDemo) await resetDemoTenant(tenant);
			else await updateSettings(target, { studioName: input.studioName, logoUrl: input.logoUrl });
			await applyNichePackage(target, await getPackage(input.packageId));
			await flushSheetSync(await readyDatabase(tenant), tenant);
			await setTenantConnectionResult(tenant.id, 'healthy');
			await setTenantStatus(tenant.id, 'active', locals.account!.id);
			return { action: 'create', success: `Created ${input.internalName}.` };
		} catch (cause) {
			return fail(400, { action: 'create', error: message(cause) });
		}
	},
	capabilities: async ({ request, locals }) => {
		const form = await request.formData();
		const tenant = await getTenantById(field(form, 'tenantId'));
		if (!tenant) return fail(404, { action: 'capabilities', error: 'Workspace not found.' });
		const packageId = field(form, 'packageId');
		const selectedPackage = await getPackage(packageId);
		const allowed = Object.fromEntries(capabilityKeys.map((key) => [key, form.get(`capability:${key}`) === 'on']));
		try {
			const current = await getTenantPackage(tenant.id);
			const target = await readyDatabase(tenant);
			await createConfigurationSnapshot(target, 'Before package or feature change', { packageId: current.package.id, allowed: current.allowed });
			await assignTenantPackage(tenant.id, selectedPackage.id, allowed, locals.account!.id);
			if (current.package.id !== selectedPackage.id || current.package.version !== selectedPackage.version || current.updateAvailable) {
				await applyNichePackage(target, selectedPackage);
			}
			await saveTenantPreferences(target, tenant, allowed);
			return { action: 'capabilities', success: `${tenant.internalName} now uses ${selectedPackage.name}; records and hidden feature data were preserved.` };
		} catch (cause) {
			return fail(400, { action: 'capabilities', error: message(cause) });
		}
	},
	modules: async ({ request }) => {
		const form = await request.formData();
		const tenant = await getTenantById(field(form, 'tenantId'));
		if (!tenant) return fail(404, { action: 'modules', error: 'Workspace not found.' });
		try {
			const raw = field(form, 'moduleConfiguration');
			if (!raw) throw new Error('Portal and messaging configuration is missing.');
			const target = await readyDatabase(tenant);
			const current = await getTenantConfiguration(target, tenant);
			const submitted = validateModuleConfiguration(JSON.parse(raw), current.profile, current.allowedCapabilities);
			const assignment = await getTenantPackage(tenant.id);
			await createConfigurationSnapshot(target, 'Before portal or messaging change', { packageId: assignment.package.id, allowed: assignment.allowed });
			await saveModuleConfiguration(target, tenant, submitted);
			return { action: 'modules', success: `${tenant.internalName} portal and WhatsApp settings saved.` };
		} catch (cause) {
			return fail(400, { action: 'modules', error: message(cause) });
		}
	},
	package: async ({ request, locals }) => {
		const form = await request.formData();
		const base = await getPackage(field(form, 'basePackageId') || 'general-service');
		const packageId = field(form, 'packageId').toLowerCase();
		const name = field(form, 'packageName');
		const description = field(form, 'packageDescription');
		const allowed = Object.fromEntries(capabilityKeys.map((key) => [key, form.get(`package-capability:${key}`) === 'on']));
		const terminology = Object.fromEntries(terminologyKeys.map((key) => [key, {
			singular: field(form, `term:${key}:singular`) || base.profile.terminology[key].singular,
			plural: field(form, `term:${key}:plural`) || base.profile.terminology[key].plural
		}])) as unknown as BusinessTerminology;
		const fieldTypes: CustomFieldType[] = ['text', 'textarea', 'number', 'date', 'datetime', 'select', 'checkbox', 'url'];
		const fieldEntities: CustomFieldEntity[] = ['customer', 'order', 'task', 'staff'];
		const customFields: CustomFieldDefinition[] = [];
		const customCount = Math.min(30, Math.max(0, Number(field(form, 'customFieldCount') || 0)));
		for (let index = 0; index < customCount; index++) {
			const key = field(form, `custom:${index}:key`).toLowerCase();
			const label = field(form, `custom:${index}:label`);
			if (!key && !label) continue;
			const entity = field(form, `custom:${index}:entity`) as CustomFieldEntity;
			const type = field(form, `custom:${index}:type`) as CustomFieldType;
			if (!/^[a-z][a-z0-9_]{1,48}$/.test(key)) return fail(400, { action: 'package', error: `Custom field key "${key}" is invalid.` });
			if (!label || !fieldEntities.includes(entity) || !fieldTypes.includes(type)) return fail(400, { action: 'package', error: `Custom field ${index + 1} is incomplete.` });
			const options = field(form, `custom:${index}:options`).split(',').map((item) => item.trim()).filter(Boolean);
			if (type === 'select' && !options.length) return fail(400, { action: 'package', error: `${label} needs comma-separated choices.` });
			customFields.push({
				key, label, entity, type, options: type === 'select' ? options : undefined,
				required: form.get(`custom:${index}:required`) === 'on', active: true, order: base.profile.customFields.length + index + 1,
				visibility: {
					admin: true,
					customerPortal: form.get(`custom:${index}:customerPortal`) === 'on',
					staffPortal: form.get(`custom:${index}:staffPortal`) === 'on',
					whatsapp: form.get(`custom:${index}:whatsapp`) === 'on',
					sheets: form.get(`custom:${index}:sheets`) === 'on',
					export: form.get(`custom:${index}:export`) === 'on'
				}
			});
		}
		const customKeys = new Set(customFields.map((item) => `${item.entity}:${item.key}`));
		const categories = field(form, 'categoryOptions').split(',').map((item) => item.trim()).filter(Boolean);
		const moduleConfiguration = normalizePackageModuleConfiguration(base.id, base.moduleConfiguration);
		const customerMode = field(form, 'customerPortalMode');
		const staffMode = field(form, 'staffPortalMode');
		const progressMode = field(form, 'progressMode');
		const deliveryExperience = field(form, 'deliveryExperience');
		if (['status-only', 'status-billing', 'full'].includes(customerMode)) moduleConfiguration['portal.customer'].mode = customerMode as typeof moduleConfiguration['portal.customer']['mode'];
		if (['assignments-only', 'progress-updates', 'full'].includes(staffMode)) moduleConfiguration['work.staffPortal'].mode = staffMode as typeof moduleConfiguration['work.staffPortal']['mode'];
		if (['milestones', 'percentage', 'both'].includes(progressMode)) {
			moduleConfiguration['portal.customer'].progressMode = progressMode as typeof moduleConfiguration['portal.customer']['progressMode'];
			moduleConfiguration['work.staffPortal'].progressMode = progressMode as typeof moduleConfiguration['work.staffPortal']['progressMode'];
		}
		if (['digital', 'pickup', 'appointment', 'fulfilment', 'handover', 'completion'].includes(deliveryExperience)) moduleConfiguration['portal.customer'].deliveryExperience = deliveryExperience as typeof moduleConfiguration['portal.customer']['deliveryExperience'];
		const value = {
			...base, id: packageId, name, description, version: 1, allowed, enabled: { ...allowed },
			moduleConfiguration,
			profile: {
				...base.profile, presetId: packageId, presetVersion: 1, terminology,
				customFields: [...base.profile.customFields.filter((item) => !customKeys.has(`${item.entity}:${item.key}`)), ...customFields],
				optionLists: { ...base.profile.optionLists, categories: categories.length ? categories : base.profile.optionLists.categories || [] }
			}
		};
		try {
			const saved = await savePackage(value, locals.account!.id);
			return { action: 'package', success: `Created niche package ${saved.name}.` };
		} catch (cause) {
			return fail(400, { action: 'package', error: message(cause) });
		}
	},
	connections: async ({ request, locals }) => {
		const form = await request.formData();
		const tenant = await getTenantById(field(form, 'tenantId'));
		if (!tenant) return fail(404, { action: 'connections', error: 'Workspace not found.' });
		const replacementDatabaseUrl = field(form, 'databaseUrl');
		const replacementDatabaseUrlConfirm = field(form, 'databaseUrlConfirm');
		if (replacementDatabaseUrl !== replacementDatabaseUrlConfirm) return fail(400, { action: 'connections', error: 'The replacement Neon URLs do not match.' });
		const databaseUrl = replacementDatabaseUrl || tenant.databaseUrl;
		const googleSheetId = field(form, 'googleSheetId') || tenant.googleSheetId;
		const ordersTab = field(form, 'ordersTab') || tenant.ordersTab;
		const studioName = field(form, 'studioName') || tenant.studioName;
		const logoUrl = field(form, 'logoUrl') || tenant.logoUrl;
		const themePalette = themePalettes.some((item) => item.id === field(form, 'themePalette')) ? field(form, 'themePalette') : undefined;
		const themeDefaultMode = field(form, 'themeDefaultMode') === 'dark' ? 'dark' : 'light';
		try {
			const target = databaseFromUrl(databaseUrl);
			const assignment = await getTenantPackage(tenant.id);
			await createConfigurationSnapshot(await readyDatabase(tenant), 'Before connection or branding change', { packageId: assignment.package.id, allowed: assignment.allowed });
			await assertConnectionsAvailable(databaseUrl, googleSheetId, tenant.id);
			const inspection = await inspectTenantDatabase(databaseUrl);
			if (!inspection.compatible) throw new Error('The replacement database has an incompatible schema.');
			await validateSheetConnection({ googleSheetId, ordersTab } as Tenant);
			await ensureDatabase(target, databaseUrl);
			await updateSettings(target, { studioName, logoUrl, ...(themePalette ? { themePalette: themePalette as any, themeDefaultMode } : {}) });
			const nextTenant = { ...tenant, databaseUrl, googleSheetId, ordersTab, studioName, logoUrl };
			await flushSheetSync(target, nextTenant);
			await updateTenantConnection(tenant.id, { databaseUrl, googleSheetId, ordersTab, studioName, logoUrl }, locals.account!.id);
			return { action: 'connections', success: 'Connections and branding updated; workspace sessions revoked.' };
		} catch (cause) { return fail(400, { action: 'connections', error: message(cause) }); }
	},
	rollback: async ({ request, locals }) => {
		const form = await request.formData();
		const tenant = await getTenantById(field(form, 'tenantId'));
		if (!tenant) return fail(404, { action: 'rollback', error: 'Workspace not found.' });
		try {
			const database = await readyDatabase(tenant);
			const current = await getTenantPackage(tenant.id);
			await createConfigurationSnapshot(database, 'Before rollback', { packageId: current.package.id, allowed: current.allowed });
			const restored = await restoreConfigurationSnapshot(database, field(form, 'snapshotId'));
			if (restored.ownerState) {
				await assignTenantPackage(tenant.id, restored.ownerState.packageId, restored.ownerState.allowed, locals.account!.id);
			}
			await flushSheetSync(database, tenant);
			return { action: 'rollback', success: `${tenant.internalName} was restored to ${restored.label}.` };
		} catch (cause) {
			return fail(400, { action: 'rollback', error: message(cause) });
		}
	},
	status: async ({ request, locals }) => {
		const form = await request.formData();
		const status = field(form, 'status') as TenantStatus;
		if (!['draft', 'active', 'suspended'].includes(status)) return fail(400, { action: 'status', error: 'Invalid status.' });
		if (status === 'active') {
			const tenant = await getTenantById(field(form, 'tenantId'));
			if (!tenant) return fail(404, { action: 'status', error: 'Workspace not found.' });
			try {
				const inspection = await inspectTenantDatabase(tenant.databaseUrl);
				if (!inspection.compatible) throw new Error('The tenant database schema is incompatible.');
				await validateSheetConnection(tenant);
				await setTenantConnectionResult(tenant.id, 'healthy');
			} catch (cause) {
				await setTenantConnectionResult(tenant.id, 'error', message(cause));
				return fail(400, { action: 'status', error: `Activation blocked: ${message(cause)}` });
			}
		}
		await setTenantStatus(field(form, 'tenantId'), status, locals.account!.id);
		return { action: 'status', success: 'Workspace status updated and existing sessions revoked.' };
	},
	credentials: async ({ request, locals }) => {
		const form = await request.formData();
		const password = field(form, 'password');
		const email = field(form, 'email').toLowerCase();
		if (!validEmail(email)) return fail(400, { action: 'credentials', error: 'Enter a valid administrator email address.' });
		if (password !== field(form, 'passwordConfirm')) return fail(400, { action: 'credentials', error: 'The new password and confirmation do not match.' });
		try {
			await updateTenantCredentials(field(form, 'tenantId'), email, password, locals.account!.id);
			return { action: 'credentials', success: 'Administrator login saved. Existing workspace sessions were signed out.' };
		} catch (cause) { return fail(400, { action: 'credentials', error: message(cause) }); }
	},
	test: async ({ request }) => {
		const form = await request.formData();
		const tenant = await getTenantById(field(form, 'tenantId'));
		if (!tenant) return fail(404, { action: 'test', error: 'Workspace not found.' });
		try {
			const inspection = await inspectTenantDatabase(tenant.databaseUrl);
			if (!inspection.compatible) throw new Error('The tenant database schema is incompatible.');
			await validateSheetConnection(tenant);
			await setTenantConnectionResult(tenant.id, 'healthy');
			return { action: 'test', success: `${tenant.internalName} connections are healthy.` };
		} catch (cause) {
			await setTenantConnectionResult(tenant.id, 'error', message(cause));
			return fail(400, { action: 'test', error: message(cause) });
		}
	},
	reset: async ({ request }) => {
		const form = await request.formData();
		if (field(form, 'confirmation') !== 'RESET') return fail(400, { action: 'reset', error: 'Type RESET to confirm the demo reset.' });
		const tenant = await getTenantById(field(form, 'tenantId'));
		if (!tenant?.isDemo) return fail(403, { action: 'reset', error: 'Only demo tenants can be reset.' });
		try {
			const seeded = await resetDemoTenant(tenant);
			await flushSheetSync(await readyDatabase(tenant), tenant);
			return { action: 'reset', success: `Demo restored with ${seeded.orders} orders and ${seeded.tasks} tasks.` };
		} catch (cause) { return fail(400, { action: 'reset', error: message(cause) }); }
	},
	ownerPassword: async ({ request, locals, cookies }) => {
		const form = await request.formData();
		const password = field(form, 'password');
		if (password !== field(form, 'passwordConfirm')) return fail(400, { action: 'ownerPassword', error: 'The new administrator passwords do not match.' });
		try { await changeOwnerPassword(locals.account!.id, password); }
		catch (cause) { return fail(400, { action: 'ownerPassword', error: message(cause) }); }
		cookies.delete('studioflow_session', { path: '/' });
		redirect(303, '/owner/login');
	}
};
