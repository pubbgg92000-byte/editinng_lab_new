# Audit: server core (2026-11-07, unverified agent findings)

Format: `ID | path:line | severity | defect → fix`

- SC-1 | server/repository.ts:385,623,656,730 | High | invoiced sums include cancelled invoices (= RA-3) → exclude cancelled
- SC-2 | api/orders/[id]/invoice/+server.ts:45; repository.ts:623,714 | High | final duration invoice writes task items at full value even when already partially invoiced, so invoiced reaches 2× and every updateTask (incl. editor portal) then throws; regenerating the final invoice returns an uncaught 500 → insert remainder only, or skip items for final
- SC-3 | repository.ts:520; googleSheets.ts:307-316 | High | import doesn't advance order_serial and skips colliding serials (= RA-10) → bump counter; report collisions
- SC-4 | googleSheets.ts:309-310 | High | import looks up the raw phone, and createCustomer throws, aborting halfway (= RA-9) → normalize; per-row skip
- SC-5 | googleSheets.ts:81,313-315 | Medium | FORMATTED_VALUE + Number() turns "₹1,200.00" into NaN → UNFORMATTED_VALUE + isFinite
- SC-6 | googleSheets.ts:244-253 | Medium | sync overwrites the same orders tab import reads, so legacy rows are wiped before import → separate tab or guard
- SC-7 | googleSheets.ts:334-336 | Medium | reconcile archives editors missing from a stale sheet (= RA-1)
- SC-8 | repository.ts:692-695 | Medium | recordPayment check-then-insert race allows overpayment → single statement / lock
- SC-9 | invoice/+server.ts:28; repository.ts:714 | Medium | concurrent partial invoices can bill the same task twice → NOT EXISTS guard
- SC-10 | invoice/+server.ts:43-57 | Medium | final duration invoice drops manual-task amounts and overwrites the order price → include manual tasks
- SC-11 | db/schema.ts:13,30,48,53-58 | Medium | money columns are REAL (float4) and lose paise above ~₹10 lakh → NUMERIC(12,2) migration (risky: prod data; plan carefully)
- SC-12 | googleSheets.ts:263,266; maintenance.ts:36 | Medium | outbox grows forever when Sheets is disabled → mark skipped / don't enqueue
- SC-13 | googleSheets.ts:272,281 | Medium | markSyncResult runs per item (up to 500 round-trips) → bulk update
- SC-14 | control.ts:381-382 | Medium | duplicate-connection guard compares raw strings (sheet URL vs ID) → normalize
- SC-15 | control.ts:37; tokens.ts:10 | Medium | encryption key falls back to SESSION_SECRET; no key versioning → require CONFIG_ENCRYPTION_KEY (doc note; prod already has both)
- SC-16 | repository.ts:613 | Medium | editor can reopen a Completed task (= RA-6)
- SC-17 | capabilityRoutes.ts:9 | Medium | /api/orders/export not gated (= RA-4)
- SC-18 | repository.ts:435-436 | Medium | date filters compare UTC created_at with bare IST dates → +05:30 bounds
- SC-19 | repository.ts:694,523,707 | Low | default paidAt and invoice year come from UTC → Asia/Kolkata
- SC-20 | repository.ts:620 | Low | can't unassign an editor (null → unchanged; "" → FK error) → `'editorId' in input`
- SC-21 | repository.ts:534 | Low | discount-only NaN (= RA-8)
- SC-22 | repository.ts:726-730 | Low | invoice status transitions unrestricted → allowed transitions
- SC-23 | whatsapp.ts:161 | Low | snapshot forces priceSet true, so an unpriced advance receipt shows ₹0 total → keep false
- SC-24 | repository.ts:743; googleSheets.ts:209,245 | Low | Activity sheet/export keeps only the last 100 rows
- SC-25 | repository.ts:668 | Low | summary recalculation reverts manual Completed/Historical → add to skip list

Unconfirmed: `?`→`$n` rewrite is fragile for future SQL; ensureDatabase re-runs ALTERs on every cold start; authenticate skips PBKDF2 for unknown emails (timing enumeration); Origin check passes requests with no Origin header; stores/app.ts seeded with fake sample customers.
