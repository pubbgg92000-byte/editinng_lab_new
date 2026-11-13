// Master control plane for owner accounts, tenant connections, encrypted secrets, and sessions.
import { cached, clearCache } from './cache';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { controlSchemaStatements } from '../../../db/control-schema';
import { databaseFromUrl } from './db';
import { builtInPackages, capabilityKeys, defaultPackage, packageById, parseJsonSetting } from '$lib/capabilities';
import type { Account, AuthSession, NichePackage, Tenant, TenantEntitlements, TenantStatus } from '$lib/types';

/**
 * MASTER CONTROL PLANE
 * Holds owner/client accounts and encrypted tenant connections only. A studio's
 * customers, orders, editors, and invoices always stay in its tenant database.
 */
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

// ---------- Password hashing and first-time owner/legacy setup ----------
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

async function seedCapabilityControl(database: AppDatabase) {
	const timestamp = now();
	await database.batch(builtInPackages.map((item) => database.prepare(
		`INSERT INTO control_packages (id, name, version, description, definition, is_builtin, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, 1, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET name = excluded.name, version = excluded.version,
		 description = excluded.description, definition = excluded.definition, updated_at = excluded.updated_at`
	).bind(item.id, item.name, item.version, item.description, JSON.stringify(item), timestamp, timestamp)));
	const tenantRows = await database.prepare('SELECT id FROM control_tenants').all<{ id: string }>();
	for (const tenant of tenantRows.results || []) {
		await database.prepare(
			`INSERT INTO control_tenant_packages (tenant_id, package_id, package_version, snapshot, updated_at)
			 VALUES (?, ?, ?, ?, ?) ON CONFLICT(tenant_id) DO NOTHING`
		).bind(tenant.id, defaultPackage.id, defaultPackage.version, JSON.stringify(defaultPackage), timestamp).run();
		const assignment = await database.prepare('SELECT snapshot FROM control_tenant_packages WHERE tenant_id = ?').bind(tenant.id).first<{ snapshot: string }>();
		const snapshot = parseJsonSetting<NichePackage>(assignment?.snapshot, defaultPackage);
		await database.batch(capabilityKeys.map((key) => database.prepare(
			`INSERT INTO control_tenant_capabilities (tenant_id, capability_key, allowed_value, updated_at)
			 VALUES (?, ?, ?, ?) ON CONFLICT(tenant_id, capability_key) DO NOTHING`
		).bind(tenant.id, key, JSON.stringify(snapshot.allowed[key] ?? false), timestamp)));
	}
}

export async function readyControlDatabase() {
	if (controlReady) return controlReady;
	controlReady = (async () => {
		const database = databaseFromUrl(controlUrl());
		await database.batch(controlSchemaStatements.map((statement) => database.prepare(statement)));
		await database.prepare('DELETE FROM control_sessions WHERE expires_at <= ? OR signed_out_at < ?').bind(now(), new Date(Date.now() - SIGNED_OUT_KEEP_DAYS * 86_400_000).toISOString()).run();
		await database.prepare('DELETE FROM control_signins WHERE created_at < ?').bind(new Date(Date.now() - SIGNIN_HISTORY_DAYS * 86_400_000).toISOString()).run();
		await bootstrap(database);
		await seedCapabilityControl(database);
		return database;
	})();
	try { return await controlReady; }
	catch (cause) { controlReady = null; throw cause; }
}

type TenantRow = Record<string, any>;

// ---------- Convert protected control rows into server-only tenant context ----------
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

// ---------- Login rate limiting and revocable 30-day sessions ----------
export async function authenticate(email: string, password: string, address: string) {
	const database = await readyControlDatabase();
	const normalized = email.trim().toLowerCase();
	const attemptKey = await digest(`${address}:${normalized}`);
	const attempt = await database.prepare('SELECT count, reset_at FROM control_login_attempts WHERE key = ?').bind(attemptKey).first<{ count: number; reset_at: string }>();
	if (attempt && attempt.count >= 8 && new Date(attempt.reset_at).getTime() > Date.now()) return { rateLimited: true as const };
	const row = await database.prepare(`SELECT a.*, t.status AS tenant_status FROM control_accounts a LEFT JOIN control_tenants t ON t.id = a.tenant_id WHERE lower(a.email) = lower(?)`).bind(normalized).first<TenantRow>();
	const valid = row && await verifyPassword(password, String(row.password_hash));
	// Every workspace login (any team role) needs an active workspace; only the platform owner doesn't.
	if (!valid || (row.role !== 'owner' && row.tenant_status !== 'active')) {
		const resetAt = new Date(Date.now() + 15 * 60_000).toISOString();
		await database.prepare('INSERT INTO control_login_attempts (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT (key) DO UPDATE SET count = CASE WHEN control_login_attempts.reset_at > ? THEN control_login_attempts.count + 1 ELSE 1 END, reset_at = CASE WHEN control_login_attempts.reset_at > ? THEN control_login_attempts.reset_at ELSE excluded.reset_at END')
			.bind(attemptKey, resetAt, now(), now()).run();
		return { invalid: true as const };
	}
	await database.prepare('DELETE FROM control_login_attempts WHERE key = ?').bind(attemptKey).run();
	return { account: { id: String(row.id), email: String(row.email), role: row.role, tenantId: row.tenant_id || undefined } as Account };
}

const SIGNIN_HISTORY_DAYS = 90;
const SIGNED_OUT_KEEP_DAYS = 5;
const LAST_SEEN_EVERY_MS = 5 * 60_000;
const lastSeenWrites = new Map<string, number>();

export async function createAuthSession(account: Account, client: { device?: string; location?: string } = {}) {
	const database = await readyControlDatabase();
	const rawToken = randomToken();
	const timestamp = now();
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
	const device = client.device || '', location = client.location || '';
	await database.batch([
		database.prepare('INSERT INTO control_sessions (id, token_hash, account_id, expires_at, created_at, last_seen_at, device, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
			.bind(id('SES'), await digest(rawToken), account.id, expiresAt, timestamp, timestamp, device, location),
		database.prepare('INSERT INTO control_signins (id, account_id, tenant_id, email, role, device, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
			.bind(id('SIN'), account.id, account.tenantId || null, account.email, account.role, device, location, timestamp)
	]);
	return { token: rawToken, maxAge: SESSION_DAYS * 86_400 };
}

/** Session lookup (cached briefly per token; logout and any write request clear it). */
export function getAuthSession(rawToken?: string): Promise<AuthSession | null> {
	if (!rawToken) return Promise.resolve(null);
	return cached(`session:${rawToken}`, () => loadAuthSession(rawToken));
}

async function loadAuthSession(rawToken: string): Promise<AuthSession | null> {
	const database = await readyControlDatabase();
	const row = await database.prepare(`SELECT s.id AS session_id, s.expires_at,
		a.id AS account_id, a.email AS account_email, a.role AS account_role, a.tenant_id AS account_tenant_id,
		t.id AS tenant_id, t.slug AS tenant_slug, t.internal_name AS tenant_internal_name, t.studio_name AS tenant_studio_name,
		t.logo_url AS tenant_logo_url, t.database_url_cipher AS tenant_database_url_cipher, t.google_sheet_id AS tenant_google_sheet_id,
		t.orders_tab AS tenant_orders_tab, t.status AS tenant_status, t.is_demo AS tenant_is_demo, t.is_legacy AS tenant_is_legacy,
		t.connection_status AS tenant_connection_status, t.connection_error AS tenant_connection_error,
		t.last_validated_at AS tenant_last_validated_at, t.created_at AS tenant_created_at, t.updated_at AS tenant_updated_at
		FROM control_sessions s JOIN control_accounts a ON a.id = s.account_id LEFT JOIN control_tenants t ON t.id = a.tenant_id
		WHERE s.token_hash = ? AND s.expires_at > ? AND s.signed_out_at IS NULL`).bind(await digest(rawToken), now()).first<TenantRow>();
	if (!row || (row.account_role !== 'owner' && row.tenant_status !== 'active')) return null;
	const account: Account = { id: row.account_id, email: row.account_email, role: row.account_role, tenantId: row.account_tenant_id || undefined };
	return { id: row.session_id, account, tenant: await tenantFromRow(row), expiresAt: row.expires_at };
}

/** Marks a session as recently used, at most once every 5 minutes per session per server instance. */
export async function touchAuthSession(sessionId: string) {
	const last = lastSeenWrites.get(sessionId) || 0;
	if (Date.now() - last < LAST_SEEN_EVERY_MS) return;
	lastSeenWrites.set(sessionId, Date.now());
	if (lastSeenWrites.size > 5000) lastSeenWrites.clear();
	const database = await readyControlDatabase();
	await database.prepare('UPDATE control_sessions SET last_seen_at = ? WHERE id = ?').bind(now(), sessionId).run();
}

/** Owner Health tab: who is signed in now, and recent sign-ins. Read-only. */
export async function listLiveSessions() {
	const database = await readyControlDatabase();
	const result = await database.prepare(`SELECT s.id, s.created_at, s.last_seen_at, s.device, s.location, s.signed_out_at, s.signed_out_reason, a.email, a.role, t.internal_name AS tenant_name
		FROM control_sessions s JOIN control_accounts a ON a.id = s.account_id LEFT JOIN control_tenants t ON t.id = a.tenant_id
		WHERE s.expires_at > ? ORDER BY s.last_seen_at DESC LIMIT 200`).bind(now()).all<Record<string, string>>();
	return (result.results || []).map((row) => ({ id: row.id, email: row.email, role: row.role, workspace: row.tenant_name || 'Platform owner', device: row.device || '', location: row.location || '', signedInAt: row.created_at, lastSeenAt: row.last_seen_at, signedOutAt: row.signed_out_at || '', signedOutReason: row.signed_out_reason || '' }));
}

export async function listRecentSignins(limit = 30) {
	const database = await readyControlDatabase();
	const result = await database.prepare(`SELECT g.id, g.email, g.role, g.device, g.location, g.created_at, t.internal_name AS tenant_name
		FROM control_signins g LEFT JOIN control_tenants t ON t.id = g.tenant_id ORDER BY g.created_at DESC LIMIT ?`).bind(limit).all<Record<string, string>>();
	return (result.results || []).map((row) => ({ id: row.id, email: row.email, role: row.role, workspace: row.tenant_name || 'Platform owner', device: row.device || '', location: row.location || '', at: row.created_at }));
}

export async function listOwnerAudit(limit = 15) {
	const database = await readyControlDatabase();
	const result = await database.prepare(`SELECT l.id, l.action, l.details, l.created_at, t.internal_name AS tenant_name FROM control_audit_logs l LEFT JOIN control_tenants t ON t.id = l.tenant_id ORDER BY l.created_at DESC LIMIT ?`).bind(limit).all<Record<string, string>>();
	return (result.results || []).map((row) => ({ id: row.id, action: row.action, details: (row.details || '').slice(0, 120), workspace: row.tenant_name || '', at: row.created_at }));
}

export async function destroyAuthSession(rawToken?: string) {
	if (!rawToken) return;
	clearCache(`session:${rawToken}`);
	const database = await readyControlDatabase();
	await database.prepare("UPDATE control_sessions SET signed_out_at = ?, signed_out_reason = 'Signed out' WHERE signed_out_at IS NULL AND token_hash = ?").bind(now(), await digest(rawToken)).run();
}

// ---------- Owner-panel client lifecycle and connection management ----------
export async function listTenantSummaries() {
	// Show safe connection metadata in master control, never the Neon password or full URL.
	const database = await readyControlDatabase();
	// One row per workspace: join only its main admin, and count team members separately.
	const result = await database.prepare(`SELECT t.*, a.email AS admin_email,
		(SELECT COUNT(*) FROM control_sessions s WHERE s.account_id = a.id AND s.expires_at > ? AND s.signed_out_at IS NULL) AS active_sessions,
		(SELECT COUNT(*) FROM control_accounts m WHERE m.tenant_id = t.id) AS member_count
		FROM control_tenants t LEFT JOIN control_accounts a ON a.tenant_id = t.id AND a.role = 'client_admin' ORDER BY t.created_at`).bind(now()).all<TenantRow>();
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
		const assignment = await getTenantPackage(tenant.id);
		return { ...tenant, adminEmail: row.admin_email || '', activeSessions: Number(row.active_sessions || 0), memberCount: Number((row as any).member_count || 0), databaseUrl: undefined, databaseHost, databaseName, databaseRole, packageId: assignment.package.id, packageName: assignment.package.name, packageVersion: assignment.package.version, packageUpdateAvailable: assignment.updateAvailable, entitlements: assignment.allowed };
	}));
}

export interface NewTenantInput {
	internalName: string; slug: string; studioName: string; logoUrl: string; databaseUrl: string;
	googleSheetId: string; ordersTab: string; email: string; password: string; isDemo: boolean; status: TenantStatus; packageId?: string;
}

export async function createTenant(input: NewTenantInput, ownerId: string) {
	const database = await readyControlDatabase();
	const timestamp = now();
	const tenantId = id('TEN');
	const selectedPackage = await getPackage(input.packageId || defaultPackage.id);
	await database.batch([
		database.prepare('INSERT INTO control_tenants (id, slug, internal_name, studio_name, logo_url, database_url_cipher, google_sheet_id, orders_tab, status, is_demo, is_legacy, connection_status, connection_error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)')
			.bind(tenantId, input.slug, input.internalName, input.studioName, input.logoUrl, await encryptSecret(input.databaseUrl), input.googleSheetId, input.ordersTab, input.status, input.isDemo ? 1 : 0, 'healthy', '', timestamp, timestamp),
		database.prepare('INSERT INTO control_accounts (id, email, password_hash, role, tenant_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
			.bind(id('ACC'), input.email.toLowerCase(), await hashPassword(input.password), 'client_admin', tenantId, timestamp, timestamp),
		database.prepare('INSERT INTO control_audit_logs (id, account_id, action, tenant_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(id('AUD'), ownerId, 'Tenant created', tenantId, `${input.internalName} · ${selectedPackage.name}`, timestamp),
		database.prepare('INSERT INTO control_tenant_packages (tenant_id, package_id, package_version, snapshot, updated_at) VALUES (?, ?, ?, ?, ?)')
			.bind(tenantId, selectedPackage.id, selectedPackage.version, JSON.stringify(selectedPackage), timestamp),
		...capabilityKeys.map((key) => database.prepare('INSERT INTO control_tenant_capabilities (tenant_id, capability_key, allowed_value, updated_at) VALUES (?, ?, ?, ?)')
			.bind(tenantId, key, JSON.stringify(selectedPackage.allowed[key] ?? false), timestamp))
	]);
	return findTenantBySlug(input.slug);
}

export async function listPackages(): Promise<NichePackage[]> {
	const database = await readyControlDatabase();
	const result = await database.prepare('SELECT definition FROM control_packages ORDER BY is_builtin DESC, name').all<{ definition: string }>();
	return (result.results || []).map((row) => parseJsonSetting<NichePackage>(row.definition, defaultPackage));
}

export async function getPackage(packageId: string): Promise<NichePackage> {
	const database = await readyControlDatabase();
	const row = await database.prepare('SELECT definition FROM control_packages WHERE id = ?').bind(packageId).first<{ definition: string }>();
	return row ? parseJsonSetting<NichePackage>(row.definition, packageById(packageId)) : packageById(packageId);
}

export async function savePackage(input: NichePackage, ownerId: string) {
	const database = await readyControlDatabase();
	const packageId = String(input.id || '').trim().toLowerCase();
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(packageId)) throw new Error('Package ID may contain lowercase letters, numbers, and hyphens.');
	if (!input.name?.trim()) throw new Error('Package name is required.');
	const existing = await database.prepare('SELECT version, is_builtin FROM control_packages WHERE id = ?').bind(packageId).first<{ version: number; is_builtin: number }>();
	if (existing?.is_builtin) throw new Error('Built-in packages cannot be overwritten. Duplicate it with a new ID.');
	const value: NichePackage = { ...input, id: packageId, name: input.name.trim(), version: Number(existing?.version || 0) + 1 };
	const timestamp = now();
	await database.batch([
		database.prepare(`INSERT INTO control_packages (id, name, version, description, definition, is_builtin, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, 0, ?, ?)
			ON CONFLICT(id) DO UPDATE SET name = excluded.name, version = excluded.version, description = excluded.description, definition = excluded.definition, updated_at = excluded.updated_at`)
			.bind(value.id, value.name, value.version, value.description || '', JSON.stringify(value), timestamp, timestamp),
		database.prepare('INSERT INTO control_audit_logs (id, account_id, action, details, created_at) VALUES (?, ?, ?, ?, ?)')
			.bind(id('AUD'), ownerId, existing ? 'Niche package updated' : 'Niche package created', `${value.name} v${value.version}`, timestamp)
	]);
	return value;
}

export async function getTenantEntitlements(tenantId: string): Promise<TenantEntitlements> {
	const database = await readyControlDatabase();
	const result = await database.prepare('SELECT capability_key, allowed_value FROM control_tenant_capabilities WHERE tenant_id = ?').bind(tenantId).all<{ capability_key: string; allowed_value: string }>();
	const values = Object.fromEntries((result.results || []).map((row) => [row.capability_key, parseJsonSetting(row.allowed_value, false)]));
	return { ...Object.fromEntries(capabilityKeys.map((key) => [key, false])), ...values };
}

export async function getTenantPackage(tenantId: string): Promise<{ package: NichePackage; allowed: TenantEntitlements; updateAvailable: boolean }> {
	const database = await readyControlDatabase();
	const [row, allowed] = await Promise.all([
		database.prepare('SELECT package_id, package_version, snapshot FROM control_tenant_packages WHERE tenant_id = ?').bind(tenantId).first<{ package_id: string; package_version: number; snapshot: string }>(),
		getTenantEntitlements(tenantId)
	]);
	const snapshot = row ? parseJsonSetting<NichePackage>(row.snapshot, defaultPackage) : defaultPackage;
	const current = await getPackage(row?.package_id || snapshot.id);
	return { package: snapshot, allowed, updateAvailable: current.version > Number(row?.package_version || snapshot.version) };
}

export async function assignTenantPackage(tenantId: string, packageId: string, allowed: TenantEntitlements, ownerId: string) {
	const database = await readyControlDatabase();
	const selectedPackage = await getPackage(packageId);
	const timestamp = now();
	await database.batch([
		database.prepare(`INSERT INTO control_tenant_packages (tenant_id, package_id, package_version, snapshot, updated_at)
			VALUES (?, ?, ?, ?, ?) ON CONFLICT(tenant_id) DO UPDATE SET package_id = excluded.package_id,
			package_version = excluded.package_version, snapshot = excluded.snapshot, updated_at = excluded.updated_at`)
			.bind(tenantId, selectedPackage.id, selectedPackage.version, JSON.stringify(selectedPackage), timestamp),
		...capabilityKeys.map((key) => database.prepare(`INSERT INTO control_tenant_capabilities (tenant_id, capability_key, allowed_value, updated_at)
			VALUES (?, ?, ?, ?) ON CONFLICT(tenant_id, capability_key) DO UPDATE SET allowed_value = excluded.allowed_value, updated_at = excluded.updated_at`)
			.bind(tenantId, key, JSON.stringify(allowed[key] ?? false), timestamp)),
		database.prepare('INSERT INTO control_audit_logs (id, account_id, action, tenant_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(id('AUD'), ownerId, 'Tenant capabilities updated', tenantId, `${selectedPackage.name} v${selectedPackage.version}`, timestamp)
	]);
	return { package: selectedPackage, allowed: await getTenantEntitlements(tenantId), updateAvailable: false };
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
		database.prepare("UPDATE control_sessions SET signed_out_at = ?, signed_out_reason = 'Workspace status changed' WHERE signed_out_at IS NULL AND account_id IN (SELECT id FROM control_accounts WHERE tenant_id = ?)").bind(now(), tenantId),
		database.prepare('INSERT INTO control_audit_logs (id, account_id, action, tenant_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id('AUD'), ownerId, 'Tenant status changed', tenantId, status, now())
	]);
}

export async function updateTenantCredentials(tenantId: string, email: string, password: string, ownerId: string) {
	const database = await readyControlDatabase();
	// Only the workspace's main admin login; team members keep their own credentials and sessions.
	const statements = [database.prepare("UPDATE control_accounts SET email = ?, updated_at = ? WHERE tenant_id = ? AND role = 'client_admin'").bind(email.trim().toLowerCase(), now(), tenantId)];
	if (password) statements.push(database.prepare("UPDATE control_accounts SET password_hash = ?, updated_at = ? WHERE tenant_id = ? AND role = 'client_admin'").bind(await hashPassword(password), now(), tenantId));
	statements.push(database.prepare("UPDATE control_sessions SET signed_out_at = ?, signed_out_reason = 'Login changed by owner' WHERE signed_out_at IS NULL AND account_id IN (SELECT id FROM control_accounts WHERE tenant_id = ? AND role = 'client_admin')").bind(now(), tenantId));
	statements.push(database.prepare('INSERT INTO control_audit_logs (id, account_id, action, tenant_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id('AUD'), ownerId, 'Client credentials changed', tenantId, email.trim().toLowerCase(), now()));
	await database.batch(statements);
}

export async function changeOwnerPassword(ownerId: string, password: string) {
	const database = await readyControlDatabase();
	await database.batch([
		database.prepare('UPDATE control_accounts SET password_hash = ?, updated_at = ? WHERE id = ? AND role = ?').bind(await hashPassword(password), now(), ownerId, 'owner'),
		database.prepare("UPDATE control_sessions SET signed_out_at = ?, signed_out_reason = 'Password changed' WHERE signed_out_at IS NULL AND account_id = ?").bind(now(), ownerId)
	]);
}

export async function getTenantById(tenantId: string) {
	const database = await readyControlDatabase();
	return tenantFromRow(await database.prepare('SELECT * FROM control_tenants WHERE id = ?').bind(tenantId).first<TenantRow>());
}

export async function assertConnectionsAvailable(databaseUrl: string, googleSheetId: string, excludeTenantId = '') {
	const database = await readyControlDatabase();
	const result = await database.prepare('SELECT id, database_url_cipher, google_sheet_id FROM control_tenants WHERE id != ?').bind(excludeTenantId).all<TenantRow>();
	// Compare normalized identities: a Sheet given as a URL or a bare ID, and a database URL with a
	// different query string or the pooled host, must still count as the same connection.
	const sheetKey = (value: string) => (String(value || '').match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1] || String(value || '').trim());
	const databaseKey = (value: string) => {
		try {
			const url = new URL(value);
			return `${url.hostname.replace('-pooler', '').toLowerCase()}${url.pathname}`;
		} catch {
			return String(value || '').trim();
		}
	};
	const wantedSheet = sheetKey(googleSheetId);
	const wantedDatabase = databaseKey(databaseUrl);
	for (const row of result.results || []) {
		if (wantedSheet && sheetKey(String(row.google_sheet_id || '')) === wantedSheet) throw new Error('This Google Sheet is already assigned to another client.');
		if (databaseKey(await decryptSecret(String(row.database_url_cipher))) === wantedDatabase) throw new Error('This Neon database is already assigned to another client.');
	}
}

export async function updateTenantConnection(tenantId: string, input: { databaseUrl: string; googleSheetId: string; ordersTab: string; studioName: string; logoUrl: string }, ownerId: string) {
	const database = await readyControlDatabase();
	await database.batch([
		database.prepare('UPDATE control_tenants SET database_url_cipher = ?, google_sheet_id = ?, orders_tab = ?, studio_name = ?, logo_url = ?, connection_status = ?, connection_error = ?, updated_at = ? WHERE id = ?')
			.bind(await encryptSecret(input.databaseUrl), input.googleSheetId, input.ordersTab, input.studioName, input.logoUrl, 'healthy', '', now(), tenantId),
		database.prepare("UPDATE control_sessions SET signed_out_at = ?, signed_out_reason = 'Workspace connection changed' WHERE signed_out_at IS NULL AND account_id IN (SELECT id FROM control_accounts WHERE tenant_id = ?)").bind(now(), tenantId),
		database.prepare('INSERT INTO control_audit_logs (id, account_id, action, tenant_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id('AUD'), ownerId, 'Workspace connections updated', tenantId, 'Connections revalidated; workspace sessions revoked', now())
	]);
}
