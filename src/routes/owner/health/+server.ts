// Owner-only live health snapshot for the Health tab. Read-only: it runs SELECTs only and never
// prepares a database (no schema, branding, or maintenance writes). The /owner guard in hooks protects it.
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getTenantById, listLiveSessions, listOwnerAudit, listRecentSignins, listTenantSummaries, readyControlDatabase } from '$lib/server/control';
import { databaseFromUrl } from '$lib/server/db';
import { getDatabaseStorageUsage } from '$lib/server/maintenance';

const DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 330 * 60 * 1000;
const startedAt = new Date().toISOString();

// India Standard Time calendar date (YYYY-MM-DD) for an ISO timestamp.
const istDate = (iso: string) => new Date(new Date(iso).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
const lastDays = () => {
	const today = istDate(new Date().toISOString());
	return Array.from({ length: DAYS }, (_, index) => new Date(Date.parse(`${today}T00:00:00Z`) - (DAYS - 1 - index) * DAY_MS).toISOString().slice(0, 10));
};
const reason = (cause: unknown) => (cause instanceof Error ? cause.message : 'Check failed.').slice(0, 200);

async function timed<T>(work: () => Promise<T>) {
	const start = performance.now();
	const value = await work();
	return { value, ms: Math.round(performance.now() - start) };
}

export const GET = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	const days = lastDays();
	const since = new Date(Date.parse(`${days[0]}T00:00:00Z`) - IST_OFFSET_MS).toISOString();

	let control: { ok: boolean; ms: number | null; error?: string };
	try {
		const database = await readyControlDatabase();
		const { ms } = await timed(() => database.prepare('SELECT 1 AS ok').first());
		control = { ok: true, ms };
	} catch (cause) {
		control = { ok: false, ms: null, error: reason(cause) };
	}

	const summaries = control.ok ? await listTenantSummaries().catch(() => []) : [];
	const workspaces = await Promise.all(summaries.map(async (summary) => {
		const base = { id: summary.id, name: summary.internalName, slug: summary.slug, status: summary.status, connectionStatus: summary.connectionStatus, activeSessions: summary.activeSessions };
		try {
			const tenant = await getTenantById(summary.id);
			if (!tenant?.databaseUrl) throw new Error('No database is connected.');
			const database = databaseFromUrl(tenant.databaseUrl);
			const ping = await timed(() => database.prepare('SELECT 1 AS ok').first());
			const [storage, sync, orders, payments, activity] = await Promise.all([
				getDatabaseStorageUsage(database).catch(() => null),
				database.prepare(`SELECT COUNT(*) AS pending, MIN(created_at) AS oldest, MAX(attempts) AS attempts,
					(SELECT last_error FROM sheet_sync_outbox WHERE synced_at IS NULL AND last_error IS NOT NULL ORDER BY updated_at DESC LIMIT 1) AS last_error,
					(SELECT MAX(synced_at) FROM sheet_sync_outbox) AS last_synced
					FROM sheet_sync_outbox WHERE synced_at IS NULL`).first<{ pending: number | string; oldest: string | null; attempts: number | null; last_error: string | null; last_synced: string | null }>().catch(() => null),
				database.prepare('SELECT created_at FROM orders WHERE created_at >= ? AND historical = 0').bind(since).all<{ created_at: string }>().catch(() => null),
				database.prepare('SELECT paid_at, amount FROM payments WHERE paid_at >= ?').bind(days[0]).all<{ paid_at: string; amount: number | string }>().catch(() => null),
				database.prepare('SELECT id, actor, action, entity_type, details, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 10').all<{ id: string; actor: string; action: string; entity_type: string; details: string; created_at: string }>().catch(() => null)
			]);
			const ordersByDay = Object.fromEntries(days.map((day) => [day, 0]));
			const paymentsByDay = Object.fromEntries(days.map((day) => [day, 0]));
			for (const row of orders?.results || []) { const day = istDate(row.created_at); if (day in ordersByDay) ordersByDay[day] += 1; }
			for (const row of payments?.results || []) { const day = String(row.paid_at).slice(0, 10); if (day in paymentsByDay) paymentsByDay[day] += Number(row.amount || 0); }
			return {
				...base,
				ok: true,
				dbMs: ping.ms,
				storage: storage ? { percent: storage.percent, usedMb: Math.round(storage.bytes / 1024 / 1024 * 10) / 10, limitMb: storage.limitMb } : null,
				sync: sync ? { pending: Number(sync.pending || 0), oldest: sync.oldest, attempts: Number(sync.attempts || 0), lastError: sync.last_error ? sync.last_error.slice(0, 200) : '', lastSynced: sync.last_synced } : null,
				orders: days.map((day) => ordersByDay[day]),
				payments: days.map((day) => Math.round(paymentsByDay[day] * 100) / 100),
				activity: (activity?.results || []).map((row) => ({ id: row.id, actor: row.actor, action: row.action, kind: row.entity_type, details: String(row.details || '').slice(0, 140), at: row.created_at }))
			};
		} catch (cause) {
			return { ...base, ok: false, dbMs: null, error: reason(cause), storage: null, sync: null, orders: days.map(() => 0), payments: days.map(() => 0), activity: [] };
		}
	}));

	const [sessions, signins, audit] = control.ok
		? await Promise.all([listLiveSessions().catch(() => []), listRecentSignins(30).catch(() => []), listOwnerAudit(15).catch(() => [])])
		: [[], [], []];

	return json({
		sessions,
		signins,
		audit,
		checkedAt: new Date().toISOString(),
		app: { commit: (env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || 'local', region: env.VERCEL_REGION || 'local', instanceStartedAt: startedAt },
		control,
		days,
		workspaces
	});
};
