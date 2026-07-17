import { env } from '$env/dynamic/private';
import { neon, type FullQueryResults, type NeonQueryFunction } from '@neondatabase/serverless';
import { schemaStatements } from '../../../db/schema';
import { defaultAssignmentTemplate, defaultInvoiceTemplate } from '$lib/messageTemplates';
import { runScheduledMaintenance } from './maintenance';
import type { Tenant } from '$lib/types';

const databases = new Map<string, AppDatabase>();
const initialized = new Set<string>();
const initializing = new Map<string, Promise<void>>();
const brandInitialized = new Set<string>();

const placeholders = (query: string) => {
	let index = 0;
	return query.replaceAll('?', () => `$${++index}`);
};

const result = <T>(queryResult: FullQueryResults<false>): DatabaseResult<T> => ({
	success: true,
	results: queryResult.rows as T[],
	meta: { changes: queryResult.rowCount }
});

class NeonPreparedStatement implements DatabasePreparedStatement {
	values: unknown[] = [];

	constructor(readonly client: NeonQueryFunction<false, true>, readonly query: string) {}

	bind(...values: unknown[]) {
		this.values = values.map((value) => value === undefined ? null : value);
		return this;
	}

	execute() {
		return this.client.query(placeholders(this.query), this.values);
	}

	async first<T = Record<string, unknown>>(column?: string): Promise<T | null> {
		const queryResult = await this.execute();
		const row = queryResult.rows[0] as Record<string, unknown> | undefined;
		if (!row) return null;
		return (column ? row[column] : row) as T;
	}

	async all<T = Record<string, unknown>>() {
		return result<T>(await this.execute());
	}

	async run<T = Record<string, unknown>>() {
		return result<T>(await this.execute());
	}
}

class NeonDatabase implements AppDatabase {
	constructor(readonly client: NeonQueryFunction<false, true>) {}

	prepare(query: string) {
		return new NeonPreparedStatement(this.client, query);
	}

	async batch<T = unknown>(statements: DatabasePreparedStatement[]) {
		const prepared = statements.map((statement) => {
			if (!(statement instanceof NeonPreparedStatement)) throw new Error('Invalid database statement.');
			return statement;
		});
		const queryResults = await this.client.transaction(
			prepared.map((statement) => this.client.query(placeholders(statement.query), statement.values)),
			{ fullResults: true }
		);
		return queryResults.map((queryResult) => result<T>(queryResult));
	}
}

export function databaseFromUrl(databaseUrl: string): AppDatabase {
	if (!databaseUrl) throw new Error('The tenant database URL is not configured.');
	let database = databases.get(databaseUrl);
	if (!database) {
		database = new NeonDatabase(neon(databaseUrl, { fullResults: true }));
		databases.set(databaseUrl, database);
	}
	return database;
}

export function databaseFrom(): AppDatabase {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not configured. Use tenant-aware database access in production.');
	return databaseFromUrl(env.DATABASE_URL);
}

export async function ensureDatabase(database: AppDatabase, cacheKey: string | AppDatabase = database) {
	const key = typeof cacheKey === 'string' ? cacheKey : `database:${String(cacheKey)}`;
	if (initialized.has(key)) return;
	const pending = initializing.get(key);
	if (pending) return pending;
	const promise = (async () => {
		await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
		const now = new Date().toISOString();
		const defaultSettings: Record<string, string> = {
			studioName: 'StudioFlow Studio',
			logoUrl: '',
			address: '',
			phone: '',
			email: '',
			gstin: '',
			paymentNote: 'Payment is collected manually. Please contact the studio for payment details.',
			invoiceFooter: 'Thank you for choosing our studio.',
			assignmentTemplate: defaultAssignmentTemplate,
			invoiceTemplate: defaultInvoiceTemplate,
			themePalette: 'graphite-aqua',
			themeDefaultMode: 'light'
		};
		await database.batch(Object.entries(defaultSettings).map(([key, value]) => database.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT (key) DO NOTHING').bind(key, value, now)));
		initialized.add(key);
	})();
	initializing.set(key, promise);
	try {
		await promise;
	} finally {
		initializing.delete(key);
	}
}

export function clearDatabaseInitialization(cacheKey: string) {
	initialized.delete(cacheKey);
	brandInitialized.delete(cacheKey);
}

export async function inspectTenantDatabase(databaseUrl: string) {
	const database = databaseFromUrl(databaseUrl);
	await database.prepare('SELECT 1').first();
	const exists = Boolean(await database.prepare("SELECT to_regclass('public.settings') AS table_name").first('table_name'));
	if (!exists) return { empty: true, compatible: true, counts: { customers: 0, editors: 0, orders: 0 } };
	const required = ['settings', 'customers', 'editors', 'orders', 'tasks'];
	for (const table of required) {
		if (!await database.prepare('SELECT to_regclass(?) AS table_name').bind(`public.${table}`).first('table_name')) return { empty: false, compatible: false, counts: {} };
	}
	const [customers, editors, orders] = await Promise.all([
		database.prepare('SELECT COUNT(*) AS count FROM customers').first<number>('count'),
		database.prepare('SELECT COUNT(*) AS count FROM editors').first<number>('count'),
		database.prepare('SELECT COUNT(*) AS count FROM orders').first<number>('count')
	]);
	return { empty: false, compatible: true, counts: { customers: Number(customers || 0), editors: Number(editors || 0), orders: Number(orders || 0) } };
}

export async function readyDatabase(tenant?: Tenant | null) {
	const databaseUrl = tenant?.databaseUrl || (env.CONTROL_DATABASE_URL ? '' : env.DATABASE_URL || '');
	if (!databaseUrl) throw new Error('No tenant database is available for this request.');
	const database = databaseFromUrl(databaseUrl);
	await ensureDatabase(database, databaseUrl);
	if (tenant && !brandInitialized.has(databaseUrl)) {
		await database.batch([
			database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'logoUrl' AND value = ''").bind(tenant.logoUrl || '', new Date().toISOString()),
			database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'studioName' AND value = 'StudioFlow Studio'").bind(tenant.studioName, new Date().toISOString())
		]);
		brandInitialized.add(databaseUrl);
	}
	try {
		await runScheduledMaintenance(database);
	} catch (cause) {
		console.error('Scheduled data retention failed.', cause);
	}
	return database;
}
