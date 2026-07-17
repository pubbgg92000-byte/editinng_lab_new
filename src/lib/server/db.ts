import { env } from '$env/dynamic/private';
import { neon, type FullQueryResults, type NeonQueryFunction } from '@neondatabase/serverless';
import { schemaStatements } from '../../../db/schema';
import { defaultAssignmentTemplate, defaultInvoiceTemplate } from '$lib/messageTemplates';
import { runScheduledMaintenance } from './maintenance';

let initialized = false;
let initializing: Promise<void> | null = null;
let database: AppDatabase | null = null;
let databaseUrl = '';

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

export function databaseFrom(): AppDatabase {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not configured. Connect the Neon database to this Vercel project.');
	if (!database || databaseUrl !== env.DATABASE_URL) {
		databaseUrl = env.DATABASE_URL;
		database = new NeonDatabase(neon(databaseUrl, { fullResults: true }));
		initialized = false;
	}
	return database;
}

export async function ensureDatabase(database: AppDatabase) {
	if (initialized) return;
	if (initializing) return initializing;
	initializing = (async () => {
		await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
		const now = new Date().toISOString();
		const defaultSettings: Record<string, string> = {
			studioName: 'Anjana Creations',
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
		const brandVersion = 'anjana-creations-v1';
		await database.batch([
			database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'studioName' AND NOT EXISTS (SELECT 1 FROM settings WHERE key = 'brandVersion' AND value = ?)").bind('Anjana Creations', now, brandVersion),
			database.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT (key) DO NOTHING').bind('brandVersion', brandVersion, now)
		]);
		initialized = true;
	})();
	try {
		await initializing;
	} finally {
		initializing = null;
	}
}

export async function readyDatabase(_platform?: unknown) {
	const database = databaseFrom();
	await ensureDatabase(database);
	try {
		await runScheduledMaintenance(database);
	} catch (cause) {
		console.error('Scheduled data retention failed.', cause);
	}
	return database;
}
