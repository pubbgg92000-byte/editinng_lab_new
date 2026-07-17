import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const crypto = globalThis.crypto || webcrypto;
const encoder = new TextEncoder();
const controlUrl = process.env.CONTROL_DATABASE_URL;
const command = process.argv[2] || 'migrate';
if (!controlUrl) throw new Error('CONTROL_DATABASE_URL is required.');
if (!['migrate', 'bootstrap'].includes(command)) throw new Error('Use migrate or bootstrap.');

const client = neon(controlUrl, { fullResults: true });
const schemaSource = await readFile(new URL('../db/control-schema.ts', import.meta.url), 'utf8');
const statements = [...schemaSource.matchAll(/`([\s\S]*?)`/g)].map((match) => match[1]);
for (const statement of statements) await client.query(statement, []);

if (command === 'migrate') {
	console.log(`Applied ${statements.length} control-database statements.`);
	process.exit(0);
}

const base64url = (bytes) => Buffer.from(bytes).toString('base64url');
const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}-${crypto.randomUUID()}`;

async function hashPassword(password) {
	if (password.length < 10) throw new Error('Bootstrap passwords must contain at least 10 characters.');
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
	const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 310_000 }, material, 256));
	return `pbkdf2-sha256$310000$${base64url(salt)}$${base64url(derived)}`;
}

async function encryptSecret(value) {
	const source = process.env.CONFIG_ENCRYPTION_KEY || process.env.SESSION_SECRET || '';
	if (source.length < 24) throw new Error('CONFIG_ENCRYPTION_KEY must contain at least 24 characters.');
	const digest = await crypto.subtle.digest('SHA-256', encoder.encode(source));
	const key = await crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt']);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(value)));
	return `${base64url(iv)}.${base64url(encrypted)}`;
}

const ownerCount = Number((await client.query("SELECT COUNT(*) AS count FROM control_accounts WHERE role = 'owner'", [])).rows[0]?.count || 0);
if (!ownerCount) {
	const email = String(process.env.OWNER_BOOTSTRAP_EMAIL || '').trim().toLowerCase();
	const password = String(process.env.OWNER_BOOTSTRAP_PASSWORD || '');
	if (!email || !password) throw new Error('OWNER_BOOTSTRAP_EMAIL and OWNER_BOOTSTRAP_PASSWORD are required for the first bootstrap.');
	const timestamp = now();
	await client.query('INSERT INTO control_accounts (id, email, password_hash, role, tenant_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NULL, $5, $6)', [id('ACC'), email, await hashPassword(password), 'owner', timestamp, timestamp]);
	console.log('Created the initial StudioFlow owner account.');
}

const tenantCount = Number((await client.query('SELECT COUNT(*) AS count FROM control_tenants', [])).rows[0]?.count || 0);
if (!tenantCount && process.env.DATABASE_URL && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
	const timestamp = now();
	const tenantId = id('TEN');
	await client.query('INSERT INTO control_tenants (id, slug, internal_name, studio_name, logo_url, database_url_cipher, google_sheet_id, orders_tab, status, is_demo, is_legacy, connection_status, connection_error, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 1, $10, $11, $12, $13)', [tenantId, 'anjana', 'Anjana Creations', 'Anjana Creations', '/anjana-creations-logo.png', await encryptSecret(process.env.DATABASE_URL), process.env.GOOGLE_SHEETS_ID || '', process.env.GOOGLE_SHEETS_ORDERS_TAB || 'Orders', 'active', 'unknown', '', timestamp, timestamp]);
	await client.query('INSERT INTO control_accounts (id, email, password_hash, role, tenant_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [id('ACC'), process.env.ADMIN_EMAIL.trim().toLowerCase(), await hashPassword(process.env.ADMIN_PASSWORD), 'client_admin', tenantId, timestamp, timestamp]);
	console.log('Registered the existing Anjana database as the legacy tenant without modifying its records.');
}

console.log('Control bootstrap complete.');
