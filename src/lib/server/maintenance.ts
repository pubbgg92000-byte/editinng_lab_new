import { env } from '$env/dynamic/private';
import type { DatabaseStorageUsage, StorageWarningLevel } from '$lib/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_JOB = 'data_retention';
const SYNC_RETENTION_DAYS = 30;
const ACTIVITY_RETENTION_MONTHS = 12;

function storageLevel(percent: number): StorageWarningLevel {
	if (percent >= 90) return 'critical';
	if (percent >= 75) return 'warning';
	if (percent >= 60) return 'notice';
	return 'healthy';
}

function storageLimitMb() {
	const configured = Number(env.DATABASE_STORAGE_LIMIT_MB || 500);
	return Number.isFinite(configured) && configured > 0 ? configured : 500;
}

export async function runScheduledMaintenance(database: AppDatabase) {
	const timestamp = new Date();
	const leaseCutoff = new Date(timestamp.getTime() - DAY_MS).toISOString();
	const lease = await database.prepare(`INSERT INTO maintenance_runs (name, last_run_at, details)
		VALUES (?, ?, '')
		ON CONFLICT(name) DO UPDATE SET last_run_at = excluded.last_run_at
		WHERE maintenance_runs.last_run_at < ?
		RETURNING last_run_at`).bind(RETENTION_JOB, timestamp.toISOString(), leaseCutoff).first<{ last_run_at: string }>();
	if (!lease) return null;

	const syncCutoff = new Date(timestamp.getTime() - SYNC_RETENTION_DAYS * DAY_MS).toISOString();
	const activityCutoff = new Date(timestamp);
	activityCutoff.setUTCMonth(activityCutoff.getUTCMonth() - ACTIVITY_RETENTION_MONTHS);
	const [syncResult, activityResult] = await database.batch([
		database.prepare('DELETE FROM sheet_sync_outbox WHERE synced_at IS NOT NULL AND synced_at < ?').bind(syncCutoff),
		database.prepare('DELETE FROM activity_logs WHERE created_at < ?').bind(activityCutoff.toISOString())
	]);
	const details = {
		syncedRecordsDeleted: Number(syncResult.meta?.changes || 0),
		activityRecordsDeleted: Number(activityResult.meta?.changes || 0),
		syncRetentionDays: SYNC_RETENTION_DAYS,
		activityRetentionMonths: ACTIVITY_RETENTION_MONTHS
	};
	await database.prepare('UPDATE maintenance_runs SET details = ? WHERE name = ?').bind(JSON.stringify(details), RETENTION_JOB).run();
	return details;
}

export async function getDatabaseStorageUsage(database: AppDatabase): Promise<DatabaseStorageUsage> {
	const [size, maintenance] = await Promise.all([
		database.prepare('SELECT pg_database_size(current_database()) AS bytes').first<{ bytes: number | string }>(),
		database.prepare('SELECT last_run_at, details FROM maintenance_runs WHERE name = ?').bind(RETENTION_JOB).first<{ last_run_at: string; details: string }>()
	]);
	const bytes = Number(size?.bytes || 0);
	const limitMb = storageLimitMb();
	const limitBytes = limitMb * 1024 * 1024;
	const percent = limitBytes > 0 ? Math.min(999, Math.round((bytes / limitBytes) * 1000) / 10) : 0;
	let cleanup: DatabaseStorageUsage['cleanup'];
	try {
		const details = maintenance?.details ? JSON.parse(maintenance.details) : {};
		cleanup = {
			lastRunAt: maintenance?.last_run_at || '',
			syncedRecordsDeleted: Number(details.syncedRecordsDeleted || 0),
			activityRecordsDeleted: Number(details.activityRecordsDeleted || 0)
		};
	} catch {
		cleanup = { lastRunAt: maintenance?.last_run_at || '', syncedRecordsDeleted: 0, activityRecordsDeleted: 0 };
	}
	return { bytes, limitBytes, limitMb, percent, level: storageLevel(percent), cleanup };
}
