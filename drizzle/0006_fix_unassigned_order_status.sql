-- Orders only become Assigned when at least one active task has an editor.
-- Repair records created with unassigned starter tasks.
UPDATE orders
SET status = 'Received'
WHERE status = 'Assigned'
  AND historical = 0
  AND NOT EXISTS (
    SELECT 1
    FROM tasks
    WHERE tasks.order_id = orders.id
      AND tasks.archived_at IS NULL
      AND tasks.editor_id IS NOT NULL
  );
