// Master database only: tenants, accounts, sessions, rate limits, and owner audit logs.
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
	// Device and approximate location (city/country, never the IP) for the owner Health tab. Additive only.
	`ALTER TABLE control_sessions ADD COLUMN IF NOT EXISTS device TEXT NOT NULL DEFAULT ''`,
	`ALTER TABLE control_sessions ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT ''`,
	// Sign-outs are kept for 5 days (shown as "Signed out" in Health) instead of being deleted at once.
	`ALTER TABLE control_sessions ADD COLUMN IF NOT EXISTS signed_out_at TEXT`,
	`ALTER TABLE control_sessions ADD COLUMN IF NOT EXISTS signed_out_reason TEXT NOT NULL DEFAULT ''`,
	`CREATE TABLE IF NOT EXISTS control_signins (id TEXT PRIMARY KEY, account_id TEXT, tenant_id TEXT, email TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT '', device TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`,
	`CREATE INDEX IF NOT EXISTS control_signins_created_idx ON control_signins(created_at)`,
	`CREATE TABLE IF NOT EXISTS control_login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at TEXT NOT NULL)`,
	`CREATE TABLE IF NOT EXISTS control_audit_logs (id TEXT PRIMARY KEY, account_id TEXT, action TEXT NOT NULL, tenant_id TEXT, details TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`,
	`CREATE INDEX IF NOT EXISTS control_audit_created_idx ON control_audit_logs(created_at)`,
	`CREATE TABLE IF NOT EXISTS control_packages (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		version INTEGER NOT NULL DEFAULT 1,
		description TEXT NOT NULL DEFAULT '',
		definition TEXT NOT NULL,
		is_builtin INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	)`,
	`CREATE TABLE IF NOT EXISTS control_tenant_packages (
		tenant_id TEXT PRIMARY KEY,
		package_id TEXT NOT NULL,
		package_version INTEGER NOT NULL,
		snapshot TEXT NOT NULL,
		updated_at TEXT NOT NULL,
		FOREIGN KEY(tenant_id) REFERENCES control_tenants(id) ON DELETE CASCADE
	)`,
	`CREATE TABLE IF NOT EXISTS control_tenant_capabilities (
		tenant_id TEXT NOT NULL,
		capability_key TEXT NOT NULL,
		allowed_value TEXT NOT NULL,
		updated_at TEXT NOT NULL,
		PRIMARY KEY(tenant_id, capability_key),
		FOREIGN KEY(tenant_id) REFERENCES control_tenants(id) ON DELETE CASCADE
	)`,
	`CREATE INDEX IF NOT EXISTS control_tenant_capabilities_tenant_idx ON control_tenant_capabilities(tenant_id)`
];
