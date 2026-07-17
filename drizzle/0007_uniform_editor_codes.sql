ALTER TABLE editors ADD COLUMN IF NOT EXISTS code TEXT;

WITH current_max AS (
  SELECT COALESCE(MAX(CASE WHEN code ~ '^ED-[0-9]+$' THEN SUBSTRING(code FROM 4)::INTEGER END), 0) AS value
  FROM editors
), missing AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS position
  FROM editors
  WHERE code IS NULL OR code = ''
)
UPDATE editors
SET code = 'ED-' || LPAD((current_max.value + missing.position)::TEXT, 4, '0')
FROM current_max, missing
WHERE editors.id = missing.id;

INSERT INTO counters (name, value)
SELECT 'editor_serial', COALESCE(MAX(CASE WHEN code ~ '^ED-[0-9]+$' THEN SUBSTRING(code FROM 4)::INTEGER END), 0)
FROM editors
ON CONFLICT(name) DO UPDATE SET value = GREATEST(counters.value, excluded.value);

CREATE UNIQUE INDEX IF NOT EXISTS editors_code_unique_idx ON editors(code) WHERE code IS NOT NULL;
