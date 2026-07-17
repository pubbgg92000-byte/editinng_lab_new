ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notified_at TEXT;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TEXT;
-- Older versions could create more than one receipt for the same payment.
-- Keep the first link and detach the duplicates before enforcing idempotency.
UPDATE invoices
SET payment_id = NULL
WHERE payment_id IS NOT NULL
  AND id NOT IN (
    SELECT MIN(id)
    FROM invoices
    WHERE payment_id IS NOT NULL
    GROUP BY payment_id
  );

CREATE UNIQUE INDEX IF NOT EXISTS invoices_payment_unique_idx ON invoices(payment_id) WHERE payment_id IS NOT NULL;
