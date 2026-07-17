export const controlSchemaStatements = [
	`CREATE TABLE IF NOT EXISTS control_tenants (
		id TEXT PRIMARY KEY,
		slug TEXT NOT NULL UNIQUE,
		internal_name TEXT NOT NULL,
		studio_name TEXT NOT NULL,
		logo_url TEXT NOT NULL DEFAULT '',
		database_url_cipher TEXT NOT NULL,
		google_sheet_id TEXT NOT NULL DEFAULT '',
		orders_tab TEXT NOT NULL DEFAULT 'Orders',
		status TEXT NOT NULL DEFAULT 'draft',
		is_demo INTEGER NOT NULL DEFAULT 0,
		is_legacy INTEGER NOT NULL DEFAULT 0,
		connection_status TEXT NOT NULL DEFAULT 'unknown',
		connection_error TEXT NOT NULL DEFAULT '',
		last_validated_at TEXT,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	)`,
	`CREATE TABLE IF NOT EXISTS control_accounts (
		id TEXT PRIMARY KEY,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		role TEXT NOT NULL,
		tenant_id TEXT,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL,
		FOREIGN KEY(tenant_id) REFERENCES control_tenants(id) ON DELETE CASCADE
	)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS control_one_admin_per_tenant_idx ON control_accounts(tenant_id) WHERE tenant_id IS NOT NULL`,
	`CREATE TABLE IF NOT EXISTS control_sessions (
		id TEXT PRIMARY KEY,
		token_hash TEXT NOT NULL UNIQUE,
		account_id TEXT NOT NULL,
		expires_at TEXT NOT NULL,
		created_at TEXT NOT NULL,
		last_seen_at TEXT NOT NULL,
		FOREIGN KEY(account_id) REFERENCES control_accounts(id) ON DELETE CASCADE
	)`,
	`CREATE INDEX IF NOT EXISTS control_sessions_account_idx ON control_sessions(account_id)`,
	`CREATE INDEX IF NOT EXISTS control_sessions_expiry_idx ON control_sessions(expires_at)`,
	`CREATE TABLE IF NOT EXISTS control_login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at TEXT NOT NULL)`,
	`CREATE TABLE IF NOT EXISTS control_audit_logs (id TEXT PRIMARY KEY, account_id TEXT, action TEXT NOT NULL, tenant_id TEXT, details TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`,
	`CREATE INDEX IF NOT EXISTS control_audit_created_idx ON control_audit_logs(created_at)`
];
