import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { controlSchemaStatements } from '../../../db/control-schema';
import { databaseFromUrl } from './db';
import type { Account, AuthSession, Tenant, TenantStatus } from '$lib/types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SESSION_DAYS = 30;
const PASSWORD_ITERATIONS = 310_000;
let controlReady: Promise<AppDatabase> | null = null;

// The control database holds the master owner, client accounts, and tenant connections.

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const fromBase64url = (value: string) => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), (character) => character.charCodeAt(0));
const randomToken = (size = 32) => base64url(crypto.getRandomValues(new Uint8Array(size)));
const digest = async (value: string) => base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));

function controlUrl() {
	const url = env.CONTROL_DATABASE_URL || (dev ? env.DATABASE_URL : '');
	if (!url) throw new Error('CONTROL_DATABASE_URL is required.');
	return url;
}

async function encryptionKey() {
	// Connection strings must be recoverable, so they are encrypted; login passwords are hashed below.
	const source = env.CONFIG_ENCRYPTION_KEY || env.SESSION_SECRET || (dev ? 'studioflow-local-control-encryption-key' : '');
	if (source.length < 24) throw new Error('CONFIG_ENCRYPTION_KEY must contain at least 24 characters.');
	const key = await crypto.subtle.digest('SHA-256', encoder.encode(source));
	return crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptSecret(value: string) {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await encryptionKey(), encoder.encode(value)));
	return `${base64url(iv)}.${base64url(encrypted)}`;
}

export async function decryptSecret(value: string) {
	const [iv, encrypted] = value.split('.');
	if (!iv || !encrypted) throw new Error('Stored connection details are invalid.');
	const clear = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64url(iv) }, await encryptionKey(), fromBase64url(encrypted));
	return decoder.decode(clear);
}

export async function hashPassword(password: string) {
	if (password.length < 10) throw new Error('Passwords must contain at least 10 characters.');
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
	const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PASSWORD_ITERATIONS }, material, 256));
	return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${base64url(salt)}$${base64url(derived)}`;
}

export async function verifyPassword(password: string, stored: string) {
	const [algorithm, iterations, saltValue, expectedValue] = stored.split('$');
	if (algorithm !== 'pbkdf2-sha256' || !iterations || !saltValue || !expectedValue) return false;
	const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
	const actual = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64url(saltValue), iterations: Number(iterations) }, material, 256));
	const expected = fromBase64url(expectedValue);
	if (actual.length !== expected.length) return false;
	let difference = 0;
	for (let index = 0; index < actual.length; index++) difference |= actual[index] ^ expected[index];
	return difference === 0;
}

async function bootstrap(database: AppDatabase) {
	const owner = await database.prepare("SELECT id FROM control_accounts WHERE role = 'owner' LIMIT 1").first();
	const ownerEmail = String(env.OWNER_BOOTSTRAP_EMAIL || '').trim().toLowerCase();
	const ownerPassword = String(env.OWNER_BOOTSTRAP_PASSWORD || '');
	if (!owner && ownerEmail && ownerPassword) {
		const timestamp = now();
		await database.prepare('INSERT INTO control_accounts (id, email, password_hash, role, tenant_id, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?)')
			.bind(id('ACC'), ownerEmail, await hashPassword(ownerPassword), 'owner', timestamp, timestamp).run();
	}

	const tenantCount = Number(await database.prepare('SELECT COUNT(*) AS count FROM control_tenants').first('count') || 0);
	if (!tenantCount && env.DATABASE_URL && env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
		const timestamp = now();
		const tenantId = id('TEN');
		await database.batch([
			database.prepare('INSERT INTO control_tenants (id, slug, internal_name, studio_name, logo_url, database_url_cipher, google_sheet_id, orders_tab, status, is_demo, is_legacy, connection_status, connection_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?, ?, ?)')
				.bind(tenantId, 'anjana', 'Anjana Creations', 'Anjana Creations', '/anjana-creations-logo.png', await encryptSecret(env.DATABASE_URL), env.GOOGLE_SHEETS_ID || '', env.GOOGLE_SHEETS_ORDERS_TAB || 'Orders', 'active', 'unknown', '', timestamp, timestamp),
			database.prepare('INSERT INTO control_accounts (id, email, password_hash, role, tenant_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
				.bind(id('ACC'), env.ADMIN_EMAIL.trim().toLowerCase(), await hashPassword(env.ADMIN_PASSWORD), 'client_admin', tenantId, timestamp, timestamp)
		]);
	}
}

export async function readyControlDatabase() {
	if (controlReady) return controlReady;
	controlReady = (async () => {
		const database = databaseFromUrl(controlUrl());
		await database.batch(controlSchemaStatements.map((statement) => database.prepare(statement)));
		await database.prepare('DELETE FROM control_sessions WHERE expires_at <= ?').bind(now()).run();
		await bootstrap(database);
		return database;
	})();
	try { return await controlReady; }
	catch (cause) { controlReady = null; throw cause; }
}

type TenantRow = Record<string, any>;

async function tenantFromRow(row?: TenantRow | null): Promise<Tenant | undefined> {
	// Decrypt the tenant connection only on the server where database access is needed.
	if (!row?.tenant_id && !row?.id) return undefined;
	const prefix = row.tenant_id ? 'tenant_' : '';
	const value = (name: string) => row[`${prefix}${name}`];
	return {
		id: String(value('id')),
		slug: String(value('slug')),
		internalName: String(value('internal_name')),
		studioName: String(value('studio_name')),
		logoUrl: String(value('logo_url') || ''),
		databaseUrl: await decryptSecret(String(value('database_url_cipher'))),
		googleSheetId: String(value('google_sheet_id') || ''),
		ordersTab: String(value('orders_tab') || 'Orders'),
		status: value('status') as TenantStatus,
		isDemo: Boolean(Number(value('is_demo'))),
		isLegacy: Boolean(Number(value('is_legacy'))),
		connectionStatus: value('connection_status') || 'unknown',
		connectionError: String(value('connection_error') || ''),
		lastValidatedAt: value('last_validated_at') || undefined,
		createdAt: String(value('created_at')),
		updatedAt: String(value('updated_at'))
	};
}

export async function findTenantBySlug(slug: string) {
	const database = await readyControlDatabase();
	return tenantFromRow(await database.prepare('SELECT * FROM control_tenants WHERE slug = ?').bind(slug.toLowerCase()).first<TenantRow>());
}

export async function findLegacyTenant() {
	const database = await readyControlDatabase();
	return tenantFromRow(await database.prepare('SELECT * FROM control_tenants WHERE is_legacy = 1 LIMIT 1').first<TenantRow>());
}

export async function authenticate(email: string, password: string, address: string) {
	const database = await readyControlDatabase();
	const normalized = email.trim().toLowerCase();
	const attemptKey = await digest(`${address}:${normalized}`);
	const attempt = await database.prepare('SELECT count, reset_at FROM control_login_attempts WHERE key = ?').bind(attemptKey).first<{ count: number; reset_at: string }>();
	if (attempt && attempt.count >= 8 && new Date(attempt.reset_at).getTime() > Date.now()) return { rateLimited: true as const };
	const row = await database.prepare(`SELECT a.*, t.status AS tenant_status FROM control_accounts a LEFT JOIN control_tenants t ON t.id = a.tenant_id WHERE lower(a.email) = lower(?)`).bind(normalized).first<TenantRow>();
	const valid = row && await verifyPassword(password, String(row.password_hash));
	if (!valid || (row.role === 'client_admin' && row.tenant_status !== 'active')) {
		const resetAt = new Date(Date.now() + 15 * 60_000).toISOString();
		await database.prepare('INSERT INTO control_login_attempts (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT (key) DO UPDATE SET count = CASE WHEN control_login_attempts.reset_at > ? THEN control_login_attempts.count + 1 ELSE 1 END, reset_at = CASE WHEN control_login_attempts.reset_at > ? THEN control_login_attempts.reset_at ELSE excluded.reset_at END')
			.bind(attemptKey, resetAt, now(), now()).run();
		return { invalid: true as const };
	}
	await database.prepare('DELETE FROM control_login_attempts WHERE key = ?').bind(attemptKey).run();
	return { account: { id: String(row.id), email: String(row.email), role: row.role, tenantId: row.tenant_id || undefined } as Account };
}

export async function createAuthSession(account: Account) {
	const database = await readyControlDatabase();
	const rawToken = randomToken();
	const timestamp = now();
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
	await database.prepare('INSERT INTO control_sessions (id, token_hash, account_id, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)')
		.bind(id('SES'), await digest(rawToken), account.id, expiresAt, timestamp, timestamp).run();
	return { token: rawToken, maxAge: SESSION_DAYS * 86_400 };
}

export async function getAuthSession(rawToken?: string): Promise<AuthSession | null> {
	if (!rawToken) return null;
	const database = await readyControlDatabase();
	const row = await database.prepare(`SELECT s.id AS session_id, s.expires_at,
		a.id AS account_id, a.email AS account_email, a.role AS account_role, a.tenant_id AS account_tenant_id,
		t.id AS tenant_id, t.slug AS tenant_slug, t.internal_name AS tenant_internal_name, t.studio_name AS tenant_studio_name,
		t.logo_url AS tenant_logo_url, t.database_url_cipher AS tenant_database_url_cipher, t.google_sheet_id AS tenant_google_sheet_id,
		t.orders_tab AS tenant_orders_tab, t.status AS tenant_status, t.is_demo AS tenant_is_demo, t.is_legacy AS tenant_is_legacy,
		t.connection_status AS tenant_connection_status, t.connection_error AS tenant_connection_error,
		t.last_validated_at AS tenant_last_validated_at, t.created_at AS tenant_created_at, t.updated_at AS tenant_updated_at
		FROM control_sessions s JOIN control_accounts a ON a.id = s.account_id LEFT JOIN control_tenants t ON t.id = a.tenant_id
		WHERE s.token_hash = ? AND s.expires_at > ?`).bind(await digest(rawToken), now()).first<TenantRow>();
	if (!row || (row.account_role === 'client_admin' && row.tenant_status !== 'active')) return null;
	const account: Account = { id: row.account_id, email: row.account_email, role: row.account_role, tenantId: row.account_tenant_id || undefined };
	return { id: row.session_id, account, tenant: await tenantFromRow(row), expiresAt: row.expires_at };
}

export async function destroyAuthSession(rawToken?: string) {
	if (!rawToken) return;
	const database = await readyControlDatabase();
	await database.prepare('DELETE FROM control_sessions WHERE token_hash = ?').bind(await digest(rawToken)).run();
}

export async function listTenantSummaries() {
	// Show safe connection metadata in master control, never the Neon password or full URL.
	const database = await readyControlDatabase();
	const result = await database.prepare(`SELECT t.*, a.email AS admin_email,
		(SELECT COUNT(*) FROM control_sessions s WHERE s.account_id = a.id AND s.expires_at > ?) AS active_sessions
		FROM control_tenants t LEFT JOIN control_accounts a ON a.tenant_id = t.id ORDER BY t.created_at`).bind(now()).all<TenantRow>();
	return Promise.all((result.results || []).map(async (row) => {
		const tenant = (await tenantFromRow(row))!;
		let databaseHost = 'Stored securely';
		let databaseName = 'Protected';
		let databaseRole = 'Protected';
		try {
			const connection = new URL(tenant.databaseUrl);
			databaseHost = connection.hostname || databaseHost;
			databaseName = decodeURIComponent(connection.pathname.replace(/^\//, '')) || databaseName;
			databaseRole = decodeURIComponent(connection.username) || databaseRole;
		} catch { /* Keep protected labels for malformed legacy URLs. */ }
		return { ...tenant, adminEmail: row.admin_email || '', activeSessions: Number(row.active_sessions || 0), databaseUrl: undefined, databaseHost, databaseName, databaseRole };
	}));
}

export interface NewTenantInput {
	internalName: string; slug: string; studioName: string; logoUrl: string; databaseUrl: string;
	googleSheetId: string; ordersTab: string; email: string; password: string; isDemo: boolean; status: TenantStatus;
}

export async function createTenant(input: NewTenantInput, ownerId: string) {
	const database = await readyControlDatabase();
	const timestamp = now();
	const tenantId = id('TEN');
	await database.batch([
		database.prepare('INSERT INTO control_tenants (id, slug, internal_name, studio_name, logo_url, database_url_cipher, google_sheet_id, orders_tab, status, is_demo, is_legacy, connection_status, connection_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)')
			.bind(tenantId, input.slug, input.internalName, input.studioName, input.logoUrl, await encryptSecret(input.databaseUrl), input.googleSheetId, input.ordersTab, input.status, input.isDemo ? 1 : 0, 'healthy', '', timestamp, timestamp),
		database.prepare('INSERT INTO control_accounts (id, email, password_hash, role, tenant_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
			.bind(id('ACC'), input.email.toLowerCase(), await hashPassword(input.password), 'client_admin', tenantId, timestamp, timestamp),
		database.prepare('INSERT INTO control_audit_logs (id, account_id, action, tenant_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(id('AUD'), ownerId, 'Tenant created', tenantId, input.internalName, timestamp)
	]);
	return findTenantBySlug(input.slug);
}

export async function setTenantConnectionResult(tenantId: string, status: 'healthy' | 'error', error = '') {
	const database = await readyControlDatabase();
	await database.prepare('UPDATE control_tenants SET connection_status = ?, connection_error = ?, last_validated_at = ?, updated_at = ? WHERE id = ?')
		.bind(status, error.slice(0, 500), now(), now(), tenantId).run();
}

export async function setTenantStatus(tenantId: string, status: TenantStatus, ownerId: string) {
	const database = await readyControlDatabase();
	await database.batch([
		database.prepare('UPDATE control_tenants SET status = ?, updated_at = ? WHERE id = ?').bind(status, now(), tenantId),
		database.prepare('DELETE FROM control_sessions WHERE account_id IN (SELECT id FROM control_accounts WHERE tenant_id = ?)').bind(tenantId),
		database.prepare('INSERT INTO control_audit_logs (id, account_id, action, tenant_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id('AUD'), ownerId, 'Tenant status changed', tenantId, status, now())
	]);
}

export async function updateTenantCredentials(tenantId: string, email: string, password: string, ownerId: string) {
	const database = await readyControlDatabase();
	const statements = [database.prepare('UPDATE control_accounts SET email = ?, updated_at = ? WHERE tenant_id = ?').bind(email.trim().toLowerCase(), now(), tenantId)];
	if (password) statements.push(database.prepare('UPDATE control_accounts SET password_hash = ?, updated_at = ? WHERE tenant_id = ?').bind(await hashPassword(password), now(), tenantId));
	statements.push(database.prepare('DELETE FROM control_sessions WHERE account_id IN (SELECT id FROM control_accounts WHERE tenant_id = ?)').bind(tenantId));
	statements.push(database.prepare('INSERT INTO control_audit_logs (id, account_id, action, tenant_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id('AUD'), ownerId, 'Client credentials changed', tenantId, email.trim().toLowerCase(), now()));
	await database.batch(statements);
}

export async function changeOwnerPassword(ownerId: string, password: string) {
	const database = await readyControlDatabase();
	await database.batch([
		database.prepare('UPDATE control_accounts SET password_hash = ?, updated_at = ? WHERE id = ? AND role = ?').bind(await hashPassword(password), now(), ownerId, 'owner'),
		database.prepare('DELETE FROM control_sessions WHERE account_id = ?').bind(ownerId)
	]);
}

export async function getTenantById(tenantId: string) {
	const database = await readyControlDatabase();
	return tenantFromRow(await database.prepare('SELECT * FROM control_tenants WHERE id = ?').bind(tenantId).first<TenantRow>());
}

export async function assertConnectionsAvailable(databaseUrl: string, googleSheetId: string, excludeTenantId = '') {
	const database = await readyControlDatabase();
	const result = await database.prepare('SELECT id, database_url_cipher, google_sheet_id FROM control_tenants WHERE id != ?').bind(excludeTenantId).all<TenantRow>();
	for (const row of result.results || []) {
		if (row.google_sheet_id === googleSheetId) throw new Error('This Google Sheet is already assigned to another client.');
		if (await decryptSecret(String(row.database_url_cipher)) === databaseUrl) throw new Error('This Neon database is already assigned to another client.');
	}
}

export async function updateTenantConnection(tenantId: string, input: { databaseUrl: string; googleSheetId: string; ordersTab: string; studioName: string; logoUrl: string }, ownerId: string) {
	const database = await readyControlDatabase();
	await database.batch([
		database.prepare('UPDATE control_tenants SET database_url_cipher = ?, google_sheet_id = ?, orders_tab = ?, studio_name = ?, logo_url = ?, connection_status = ?, connection_error = ?, updated_at = ? WHERE id = ?')
			.bind(await encryptSecret(input.databaseUrl), input.googleSheetId, input.ordersTab, input.studioName, input.logoUrl, 'healthy', '', now(), tenantId),
		database.prepare('DELETE FROM control_sessions WHERE account_id IN (SELECT id FROM control_accounts WHERE tenant_id = ?)').bind(tenantId),
		database.prepare('INSERT INTO control_audit_logs (id, account_id, action, tenant_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id('AUD'), ownerId, 'Tenant connections updated', tenantId, 'Connections revalidated; client sessions revoked', now())
	]);
}
