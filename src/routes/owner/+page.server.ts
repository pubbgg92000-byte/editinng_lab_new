import { fail, redirect } from '@sveltejs/kit';
import { assertConnectionsAvailable, changeOwnerPassword, createTenant, getTenantById, listTenantSummaries, setTenantConnectionResult, setTenantStatus, updateTenantConnection, updateTenantCredentials } from '$lib/server/control';
import { databaseFromUrl, ensureDatabase, inspectTenantDatabase, readyDatabase } from '$lib/server/db';
import { ensureWorkbookTabs, flushSheetSync, validateSheetConnection } from '$lib/server/googleSheets';
import { updateSettings } from '$lib/server/repository';
import { resetDemoTenant } from '$lib/server/demo';
import type { Tenant, TenantStatus } from '$lib/types';

const field = (form: FormData, name: string) => String(form.get(name) || '').trim();
const message = (cause: unknown) => cause instanceof Error ? cause.message : 'The operation failed.';

export const load = async ({ locals }) => ({ account: locals.account, tenants: await listTenantSummaries() });

export const actions = {
	create: async ({ request, locals }) => {
		const form = await request.formData();
		const passwordConfirm = field(form, 'passwordConfirm');
		const input = {
			internalName: field(form, 'internalName'), slug: field(form, 'slug').toLowerCase(), studioName: field(form, 'studioName'),
			logoUrl: field(form, 'logoUrl'), databaseUrl: field(form, 'databaseUrl'), googleSheetId: field(form, 'googleSheetId'),
			ordersTab: field(form, 'ordersTab') || 'Orders', email: field(form, 'email').toLowerCase(), password: field(form, 'password'),
			isDemo: form.get('isDemo') === 'on', status: 'draft' as TenantStatus
		};
		if (!input.internalName || !input.studioName || !input.email || !input.databaseUrl || !input.googleSheetId) return fail(400, { action: 'create', error: 'Client name, studio name, login email, Neon URL, and Sheet ID are required.' });
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
			await ensureWorkbookTabs(tenant);
			await flushSheetSync(await readyDatabase(tenant), tenant);
			await setTenantConnectionResult(tenant.id, 'healthy');
			await setTenantStatus(tenant.id, 'active', locals.account!.id);
			return { action: 'create', success: `Created ${input.internalName}.` };
		} catch (cause) {
			return fail(400, { action: 'create', error: message(cause) });
		}
	},
	connections: async ({ request, locals }) => {
		const form = await request.formData();
		const tenant = await getTenantById(field(form, 'tenantId'));
		if (!tenant) return fail(404, { action: 'connections', error: 'Client not found.' });
		const replacementDatabaseUrl = field(form, 'databaseUrl');
		const replacementDatabaseUrlConfirm = field(form, 'databaseUrlConfirm');
		if (replacementDatabaseUrl !== replacementDatabaseUrlConfirm) return fail(400, { action: 'connections', error: 'The replacement Neon URLs do not match.' });
		const databaseUrl = replacementDatabaseUrl || tenant.databaseUrl;
		const googleSheetId = field(form, 'googleSheetId') || tenant.googleSheetId;
		const ordersTab = field(form, 'ordersTab') || tenant.ordersTab;
		const studioName = field(form, 'studioName') || tenant.studioName;
		const logoUrl = field(form, 'logoUrl') || tenant.logoUrl;
		try {
			await assertConnectionsAvailable(databaseUrl, googleSheetId, tenant.id);
			const inspection = await inspectTenantDatabase(databaseUrl);
			if (!inspection.compatible) throw new Error('The replacement database has an incompatible schema.');
			await validateSheetConnection({ googleSheetId, ordersTab } as Tenant);
			const target = databaseFromUrl(databaseUrl);
			await ensureDatabase(target, databaseUrl);
			await updateSettings(target, { studioName, logoUrl });
			const nextTenant = { ...tenant, databaseUrl, googleSheetId, ordersTab, studioName, logoUrl };
			await ensureWorkbookTabs(nextTenant);
			await flushSheetSync(target, nextTenant);
			await updateTenantConnection(tenant.id, { databaseUrl, googleSheetId, ordersTab, studioName, logoUrl }, locals.account!.id);
			return { action: 'connections', success: 'Connections and branding updated; client sessions revoked.' };
		} catch (cause) { return fail(400, { action: 'connections', error: message(cause) }); }
	},
	status: async ({ request, locals }) => {
		const form = await request.formData();
		const status = field(form, 'status') as TenantStatus;
		if (!['draft', 'active', 'suspended'].includes(status)) return fail(400, { action: 'status', error: 'Invalid status.' });
		if (status === 'active') {
			const tenant = await getTenantById(field(form, 'tenantId'));
			if (!tenant) return fail(404, { action: 'status', error: 'Client not found.' });
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
		return { action: 'status', success: 'Client status updated and existing client sessions revoked.' };
	},
	credentials: async ({ request, locals }) => {
		const form = await request.formData();
		const password = field(form, 'password');
		if (password !== field(form, 'passwordConfirm')) return fail(400, { action: 'credentials', error: 'The new password and confirmation do not match.' });
		try {
			await updateTenantCredentials(field(form, 'tenantId'), field(form, 'email'), password, locals.account!.id);
			return { action: 'credentials', success: 'Client login saved. Existing client sessions were signed out.' };
		} catch (cause) { return fail(400, { action: 'credentials', error: message(cause) }); }
	},
	test: async ({ request }) => {
		const form = await request.formData();
		const tenant = await getTenantById(field(form, 'tenantId'));
		if (!tenant) return fail(404, { action: 'test', error: 'Client not found.' });
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
		if (password !== field(form, 'passwordConfirm')) return fail(400, { action: 'ownerPassword', error: 'The new master passwords do not match.' });
		try { await changeOwnerPassword(locals.account!.id, password); }
		catch (cause) { return fail(400, { action: 'ownerPassword', error: message(cause) }); }
		cookies.delete('studioflow_session', { path: '/' });
		redirect(303, '/owner/login');
	}
};
