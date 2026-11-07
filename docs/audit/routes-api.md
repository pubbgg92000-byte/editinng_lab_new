# Audit: routes and API (2026-11-07, unverified agent findings)

Format: `ID | path:line | severity | defect → fix`

- RA-1 | api/editors/reconcile/+server.ts:11; api/sheets/import/+server.ts:10; server/googleSheets.ts:331-336 | High | reconcile archives every DB editor missing from the Sheet without flushing the outbox first; not gated by integrations.googleSheets; a header-only tab archives all editors → flush first; abort if rows are pending or the sheet is empty; add the capability gate
- RA-2 | api/orders/export/+server.ts:31 | High | pageSize 1000 is clamped to 100 (repository.ts:423) with no loop, so the export silently truncates → paginate or add an unpaginated query
- RA-3 | server/repository.ts:385; api/invoices/[id]/+server.ts:13 | High | invoiced_amount counts items on cancelled invoices, so cancelling never releases tasks → exclude cancelled invoices everywhere
- RA-4 | server/capabilityRoutes.ts:9; api/orders/export/+server.ts:106 | Medium | /api/orders/export is not gated by reports.excelExport and doesn't mask payments when billing.payments is off → gate + mask
- RA-5 | api/portal/[slug]/tasks/[id]/+server.ts:53 | Medium | editor PATCH returns internal rates (= PO-2) → sanitize
- RA-6 | server/repository.ts:613; portal +server.ts:24-36 | Medium | an editor can reopen a Completed task and overwrite the approved outputLink → reject editor updates on Completed
- RA-7 | api/orders/[id]/+server.ts:47 | Medium | mass assignment (historical, priceSet, advanceSet, deliveredAt, customerId, …) → allowlist + validate
- RA-8 | api/orders/[id]/+server.ts:39; api/orders/[id]/invoice/+server.ts:49 | Medium | numeric fields are validated only when price is present, so NaN gets stored → Number.isFinite on all numerics
- RA-9 | api/sheets/import/+server.ts:10; googleSheets.ts:310 | Medium | import matches the raw phone, has no per-row try/catch, and partial commits return a 500 → normalized phone, per-row catch, 400
- RA-10 | googleSheets.ts:316; repository.ts:520 | Medium | import doesn't advance the order_serial counter, so new orders hit duplicate-key errors → bump the counter to MAX(serial)
- RA-11 | api/orders/+server.ts:65 | Medium | batch create isn't atomic; validation inside the loop leaves partial commits → validate everything first
- RA-12 | owner/+page.server.ts:219 | Medium | the connections action snapshots the old (broken) DB first, so a dead DB can't be repaired → best-effort snapshot
- RA-13 | api/settings/whatsapp/+server.ts:17-18 | Medium | unhandled parse/validation throws return 500 → try/catch 400
- RA-14 | api/tasks/[id]/+server.ts:44 | Low | admin task status isn't validated → enum check
- RA-15 | api/orders/[id]/tasks/+server.ts:43 | Low | editorId isn't checked to exist and be active → verify
- RA-16 | owner/+page.server.ts:82-89 | Low | tenant create has no rollback on later failure → delete on failure
- RA-17 | owner/+page.server.ts:267 | Low | status change doesn't verify the tenant exists → lookup
- RA-18 | logout/+server.ts:5 | Low | GET logout allows cross-site logout → POST only
- RA-19 | api/settings/+server.ts:25 | Low | logoUrl accepts `//evil.host`; theme values aren't validated → validate
- RA-20 | api/orders/export/+server.ts:93 | Low | hard-coded ORD- prefix → settings.orderPrefix
- RA-21 | server/repository.ts:704 | Low | payment receipt dedup matches cancelled invoices → ignore cancelled
- RA-22 | server/repository.ts:581 | Low | permanentlyDeleteOrder leaves orphan invoice_task_items → delete them
- RA-23 | api/*/+server.ts (customers, editors, orders, payments, tasks, settings, event-options) | Low | an unhandled request.json() throw returns 500 → catch, 400

Unconfirmed: mutations allowed on archived orders; fire-and-forget flushSheetSync may freeze on Vercel; final invoice may double-bill amounts already on partial invoices.
