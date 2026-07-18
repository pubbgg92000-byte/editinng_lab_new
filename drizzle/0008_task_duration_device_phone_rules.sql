ALTER TABLE tasks ADD COLUMN IF NOT EXISTS billing_mode TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hourly_rate REAL NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS video_duration_minutes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS device TEXT NOT NULL DEFAULT '';

ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone_normalized TEXT;
ALTER TABLE editors ADD COLUMN IF NOT EXISTS phone_normalized TEXT;

WITH ranked AS (
  SELECT id, RIGHT(regexp_replace(phone, '\D', '', 'g'), 10) AS normalized,
    ROW_NUMBER() OVER (PARTITION BY RIGHT(regexp_replace(phone, '\D', '', 'g'), 10) ORDER BY created_at, id) AS position
  FROM customers
  WHERE length(regexp_replace(phone, '\D', '', 'g')) IN (10, 12)
)
UPDATE customers SET phone_normalized = ranked.normalized
FROM ranked
WHERE customers.id = ranked.id AND ranked.position = 1 AND customers.phone_normalized IS NULL;

WITH ranked AS (
  SELECT id, RIGHT(regexp_replace(phone, '\D', '', 'g'), 10) AS normalized,
    ROW_NUMBER() OVER (PARTITION BY RIGHT(regexp_replace(phone, '\D', '', 'g'), 10) ORDER BY created_at, id) AS position
  FROM editors
  WHERE length(regexp_replace(phone, '\D', '', 'g')) IN (10, 12)
)
UPDATE editors SET phone_normalized = ranked.normalized
FROM ranked
WHERE editors.id = ranked.id AND ranked.position = 1 AND editors.phone_normalized IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS customers_phone_normalized_unique_idx
ON customers(phone_normalized) WHERE phone_normalized IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS editors_phone_normalized_unique_idx
ON editors(phone_normalized) WHERE phone_normalized IS NOT NULL;
