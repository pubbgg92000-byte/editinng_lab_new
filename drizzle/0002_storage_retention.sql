CREATE TABLE IF NOT EXISTS maintenance_runs (
	name TEXT PRIMARY KEY,
	last_run_at TEXT NOT NULL,
	details TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS activity_created_idx ON activity_logs(created_at);
