export const schemaStatements = [
	`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`,
	`CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, name TEXT NOT NULL, business TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', gst TEXT NOT NULL DEFAULT '', portal_token_hash TEXT, portal_token_cipher TEXT, projects INTEGER NOT NULL DEFAULT 0, pending REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, archived_at TEXT)`,
	`CREATE TABLE IF NOT EXISTS editors (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', specialty TEXT NOT NULL DEFAULT '', availability TEXT NOT NULL DEFAULT 'available', portal_token_hash TEXT, portal_token_cipher TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, archived_at TEXT)`,
	`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, serial INTEGER NOT NULL UNIQUE, customer_id TEXT, customer_name TEXT NOT NULL, mobile TEXT NOT NULL DEFAULT '', event TEXT NOT NULL, project TEXT NOT NULL, receiving TEXT NOT NULL DEFAULT '', duration TEXT NOT NULL DEFAULT '', amount REAL NOT NULL DEFAULT 0, advance REAL NOT NULL DEFAULT 0, source TEXT NOT NULL DEFAULT '', remarks TEXT NOT NULL DEFAULT '', due_date TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Received', progress INTEGER NOT NULL DEFAULT 0, historical INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(customer_id) REFERENCES customers(id))`,
	`ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_set INTEGER NOT NULL DEFAULT 1`,
	`ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_set INTEGER NOT NULL DEFAULT 1`,
	`ALTER TABLE orders ADD COLUMN IF NOT EXISTS important INTEGER NOT NULL DEFAULT 0`,
	`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount REAL NOT NULL DEFAULT 0`,
	`ALTER TABLE orders ADD COLUMN IF NOT EXISTS archived_at TEXT`,
	`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT ''`,
	`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TEXT`,
	`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notified_at TEXT`,
	`CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, editor_id TEXT, title TEXT NOT NULL, instructions TEXT NOT NULL DEFAULT '', due_date TEXT NOT NULL DEFAULT '', text_link TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Not started', progress INTEGER NOT NULL DEFAULT 0, output_link TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, archived_at TEXT, FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(editor_id) REFERENCES editors(id))`,
	`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS billable_amount REAL NOT NULL DEFAULT 0`,
	`UPDATE orders
	 SET status = 'Received'
	 WHERE status = 'Assigned'
	   AND historical = 0
	   AND NOT EXISTS (
		 SELECT 1
		 FROM tasks
		 WHERE tasks.order_id = orders.id
		   AND tasks.archived_at IS NULL
		   AND tasks.editor_id IS NOT NULL
	   )`,
	`CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, amount REAL NOT NULL, paid_at TEXT NOT NULL, method TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, FOREIGN KEY(order_id) REFERENCES orders(id))`,
	`ALTER TABLE payments ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'payment'`,
	`CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY, number TEXT NOT NULL UNIQUE, order_id TEXT NOT NULL, message_snapshot TEXT NOT NULL, opened_at TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(order_id) REFERENCES orders(id))`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'final'`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_id TEXT`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_received REAL NOT NULL DEFAULT 0`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal REAL NOT NULL DEFAULT 0`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount REAL NOT NULL DEFAULT 0`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total REAL NOT NULL DEFAULT 0`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid REAL NOT NULL DEFAULT 0`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance REAL NOT NULL DEFAULT 0`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'`,
	`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TEXT`,
	`UPDATE invoices
	 SET payment_id = NULL
	 WHERE payment_id IS NOT NULL
	   AND id NOT IN (
		 SELECT MIN(id)
		 FROM invoices
		 WHERE payment_id IS NOT NULL
		 GROUP BY payment_id
	   )`,
	`CREATE UNIQUE INDEX IF NOT EXISTS invoices_payment_unique_idx ON invoices(payment_id) WHERE payment_id IS NOT NULL`,
	`CREATE TABLE IF NOT EXISTS invoice_task_items (invoice_id TEXT NOT NULL, task_id TEXT NOT NULL, task_name TEXT NOT NULL, amount REAL NOT NULL DEFAULT 0, PRIMARY KEY(invoice_id, task_id), FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE CASCADE, FOREIGN KEY(task_id) REFERENCES tasks(id))`,
	`CREATE TABLE IF NOT EXISTS custom_event_options (name TEXT PRIMARY KEY, created_at TEXT NOT NULL)`,
	`CREATE TABLE IF NOT EXISTS activity_logs (id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, details TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`,
	`CREATE TABLE IF NOT EXISTS sheet_sync_outbox (id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, operation TEXT NOT NULL, payload TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, synced_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
	`CREATE TABLE IF NOT EXISTS counters (name TEXT PRIMARY KEY, value INTEGER NOT NULL)`,
	`CREATE TABLE IF NOT EXISTS maintenance_runs (name TEXT PRIMARY KEY, last_run_at TEXT NOT NULL, details TEXT NOT NULL DEFAULT '')`,
	`CREATE INDEX IF NOT EXISTS tasks_order_idx ON tasks(order_id)`,
	`CREATE INDEX IF NOT EXISTS tasks_editor_idx ON tasks(editor_id)`,
	`CREATE INDEX IF NOT EXISTS invoice_task_items_task_idx ON invoice_task_items(task_id)`,
	`CREATE INDEX IF NOT EXISTS activity_entity_idx ON activity_logs(entity_type, entity_id)`,
	`CREATE INDEX IF NOT EXISTS activity_created_idx ON activity_logs(created_at)`,
	`CREATE INDEX IF NOT EXISTS outbox_pending_idx ON sheet_sync_outbox(synced_at, created_at)`,
	`CREATE INDEX IF NOT EXISTS orders_archived_idx ON orders(archived_at, serial)`
];
