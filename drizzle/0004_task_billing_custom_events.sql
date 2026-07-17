ALTER TABLE tasks ADD COLUMN IF NOT EXISTS billable_amount REAL NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS invoice_task_items (
  invoice_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (invoice_id, task_id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE INDEX IF NOT EXISTS invoice_task_items_task_idx ON invoice_task_items(task_id);

CREATE TABLE IF NOT EXISTS custom_event_options (
  name TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);
