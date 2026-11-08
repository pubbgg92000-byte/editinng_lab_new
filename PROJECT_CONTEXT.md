# NexaDesk: Project Context, Bugs, and Enhancement Progress

> **Resume rule:** Read this file first in any new session. Pick the first unchecked item under **Progress** and continue. Update this file after every completed item.

Last updated: 2026-11-07 · Branch: `enhance/ux-and-bugfixes`

## Goal

1. Find and fix bugs across the whole codebase.
2. Make UI and UX simpler and easier, and shorten flows.
3. **Keep every existing feature and behavior.** Routes, data model, statuses, capabilities, and security rules stay the same. Only the UI and UX and the bug fixes change.

## Safety rules (must follow)

- Local `.env.local` points at the **production** control DB (tenants `anjana` and `demo`). Any write in the local app changes live data.
- Browser verification is **read-only**. Do not submit forms, change passwords, reset the demo, save tenant connections, or send WhatsApp messages unless the user explicitly approves.
- Never print or decrypt secrets from `.env.local` or the DB.
- Commit only when the user asks. Work stays on branch `enhance/ux-and-bugfixes`.

## How to run

```bash
npm install
npm run dev            # http://localhost:5173  (launch config: .claude/launch.json → "nexadesk-dev")
npm run check          # svelte-check type check
npm run test:capabilities
npm run test:tenancy
```

- `.env.local` must use the **production** `CONFIG_ENCRYPTION_KEY` and `SESSION_SECRET`. A different key causes `OperationError` 500s, because tenant DB URLs and portal tokens can't be decrypted.
- `OWNER_BOOTSTRAP_*` only applies when the control DB has no owner. An owner already exists, so use the real owner password.

## Architecture (short)

- **Stack:** SvelteKit 2 + Svelte 5 + TypeScript + Tailwind 4 + Vite 8, Vercel adapter, Neon Postgres (`@neondatabase/serverless`), ExcelJS, Lucide icons.
- **Control DB** (`db/control-schema.ts`, `src/lib/server/control.ts`): owner and client accounts, sessions, login rate limits, audit log, tenants (DB URL encrypted with AES-GCM), niche packages, capability allowances.
- **Tenant DB per client** (`db/schema.ts`, `drizzle/*.sql`, auto-migrated in `src/lib/server/db.ts`): settings, customers, editors, orders, tasks, payments, invoices, activity_logs, sheet_sync_outbox, counters.
- **Request gate** (`src/hooks.server.ts`): session selects the tenant server-side; owner and admin route guards; capability-to-route gating (`src/lib/server/capabilityRoutes.ts`); same-origin check on mutations.
- **Capabilities** (`src/lib/capabilities.ts`): effective = registered ∩ owner allowance ∩ client preference ∩ dependencies. Niche packages set terminology, fields, and defaults.
- **Business logic:** `src/lib/server/repository.ts`. Sheets mirror: `googleSheets.ts`. WhatsApp links: `whatsapp.ts`. Excel: `exportWorkbook.ts`. Portals: `portals.ts`. Demo reset: `demo.ts`.
- **Roles and URLs:** owner `/owner/login`; client admin `/login` → `/dashboard`; customer `/portal/{slug}/customer/{token}`; editor `/portal/{slug}/editor/{token}`. Legacy `/customer/{token}` and `/editor/{token}` work for Anjana only.
- **Core flow:** customer → order → tasks → assign editor (WhatsApp) → editor updates progress and output → billing (manual or duration, discount, payments) → invoice (WhatsApp) → delivery or archive.

## Bugs found

Full findings with file:line and fixes are in `docs/audit/`:
- `server-core.md` (SC-*), `routes-api.md` (RA-*), `admin-ui.md` (AU-*), `portals-owner.md` (PO-*)

About 90 findings in total. These were spot-checked and confirmed real: AU-1, AU-2, AU-3, SC-1, PO-1, PO-2. Duplicates across files: SC-1=RA-3, SC-3=RA-10, SC-4=RA-9, SC-7=RA-1=AU-7, SC-16=RA-6, SC-17=RA-4, RA-5=PO-2, SC-21=RA-8.

## UX design rules (apply to every screen)

Audience: non-technical studio owners, staff, and customers on phones. Calm, clear, consistent. No gimmicks.

1. **Plain words.** Say what happens: "Mark as delivered", not "Confirm handover workflow". No internal IDs or jargon on screen. Every icon-only button gets a visible label or tooltip plus an aria-label.
2. **One primary action per screen or card.** The main next step is a filled button; everything else is secondary or under "More".
3. **No motion on hover.** Cards and buttons don't lift, scale, or slide. Hover changes only color, border, or underline. Transitions are 150ms color/border only. Motion is kept only for meaning (modal open, toast, loading spinner) and respects `prefers-reduced-motion`.
4. **Readable sizes.** Text at least 11px (caps labels), 12–13px secondary, 14px body; tap targets at least 40px (44px in portals).
5. **Same component, same look.** One button style per role (primary / secondary / danger / ghost), one card style, one badge style, one table style. No per-page one-offs.
6. **Status is always spelled out.** A badge with a text label (never color alone), plus a one-line "what's next" where it helps.
7. **Show the state.** Empty states say what to do next; loading shows a spinner on the clicked button; errors appear next to the thing that failed, in plain words.
8. **Confirm only what's destructive or irreversible** (archive, delete, cancel invoice, suspend), and name the item in the confirmation.
9. **Mobile first for portals.** One column, big tap targets, primary action reachable at the bottom.
10. **Keep every feature and flow.** Simplify presentation, never remove capability.

## Phased plan (do in order; check off in Progress)

**Phase 1: high-impact bugs (small, safe fixes)**
1. AU-1 orders list row actions (missing `{:else}`)
2. AU-2 new WhatsApp template save crash
3. AU-3 order detail stale when navigating between orders
4. AU-4 "Delivered" via the status select bypasses DeliveryModal; select doesn't revert on error
5. PO-1 editor can't submit while a task is "Revision required"/"Completed"; PO-20 header shows unsaved status
6. PO-2 editor PATCH leaks internal rates; SC-16 editor can reopen Completed tasks
7. PO-3 owner page crashes after creating a workspace; PO-12 package field rows shift privacy flags
8. SC-1 cancelled invoices still count as invoiced; SC-2 final invoice double-writes task items
9. RA-2 orders export truncated at 100; RA-4 export capability gate + payment masking
10. SC-7 editor reconcile: confirm + guard against empty/stale sheet + capability gate
11. RA-7/RA-8/SC-21 order PATCH field allowlist + numeric validation; AU-9 blank invoice subtotal

**Phase 2: medium bugs**
- Sheets import: SC-3 serial counter, SC-4 phone normalization + per-row errors, SC-5 unformatted values; SC-12 outbox growth; SC-13 bulk status update
- Races: SC-8 payment overpay, SC-9 double partial invoice
- Time zone (IST): SC-18 date filters, SC-19 paidAt/invoice year, AU-11 default dates
- Money display: AU-10 paise rounding; AU-17 ₹0 snapshot fallback; SC-23 unpriced receipt
- UI robustness: AU-5/AU-6 fetch error handling (requestJson + try/finally), AU-12 stale lists, AU-13 notification poll, AU-16 inactive editor in TaskModal, AU-8 NewOrderModal auto-select
- Remaining RA/SC/PO low items (RA-12..23, SC-10, SC-14, SC-20, SC-22, SC-24, SC-25, PO-8..11, PO-13..19)

**Phase 3: design system foundation** (enables all UX work)
- Tokens: type scale with 12px minimum (body 14px), spacing scale, semantic success/warning/danger; remove hard-coded hex and the ~53 indigo overrides in layout.css (AU-20)
- Components: `Button`, `Field` kit, `DataTable` (desktop table / mobile cards) + `EmptyState`, `RowActions` menu, `ConfirmDialog`, `Drawer`, `Card`
- One feedback system: `notifyAction` everywhere; no page-local toasts; no `window.confirm`

**Phase 4: admin screens (simpler flows, same features)**
- Order detail: split the 1799-line file into components; status-driven "Next step" bar; labelled Approve / Request changes; TaskModal split into required + advanced; DeliveryModal checklist; merge "Set total" into the invoice flow
- Orders list: 11 → 7 columns, live filters + chips, shared ExportDialog
- Customers: New order from customer, row overflow menu, detail drawer, mobile cards
- Editors: Active/Completed tabs; reconcile moved to Settings › Sheets
- Invoices: chips, mobile cards, paid status derived from balance
- Settings: per-section save, dirty warning, remove dead markup
- Dashboard: "Needs attention" list; AppShell nav cleanup (Sheets under Settings, Cmd-K a11y)

**Phase 5: portals, owner, login**
- Editor portal (phone): sticky action bar, status chips, progress stepper, hr/min duration, grouped task list
- Customer portal: one status card, "You owe ₹X", "View your files", order switcher, readable text and 44px tap targets (PO-6)
- Shared portal components (legacy and slug routes become thin wrappers); single meta source (PO-5)
- Owner: tabs (Workspaces / Packages / Account), Danger zone with typed confirmations, inline modal errors
- Login: remove the animated icon field, visible hints, wrong-door message, label fix (PO-7)

**Needs user decision (do not do without asking)**
- SC-11 REAL → NUMERIC money migration (touches production data)
- RA-18 logout GET → POST (old logout links stop working)
- SC-6 sync overwrites the legacy import tab (choose a separate tab or guard)
- SC-15 encryption key versioning
- PO-13 require current password for owner password change (behavior change; recommended)

## Progress

- [x] Local server running; env fixed (production keys); owner panel verified (both tenants "Services online")
- [x] Full code audit (bugs + UX) → `docs/audit/*`
- [x] Phase 1: high-impact bugs (items 1–11), done 2026-11-07; `npm run check` 0 errors, both audits pass
  - [x] 1 AU-1 orders list row actions (`{:else}` added)
  - [x] 2 AU-2 template save guard (`previous &&`)
  - [x] 3 AU-3 order detail re-syncs from route data (`$effect.pre`; closes modals when the order id changes)
  - [x] 4 AU-4 choosing "Delivered" in the status select opens DeliveryModal; select reverts on error; `setOrderStatus` uses requestJson + try/finally
  - [x] 5 PO-1/PO-20 editor portal: status sent only when changed; current admin status shown as a disabled option; header shows saved status (file `routes/editor/[token]/+page.svelte`, shared by the slug portal)
  - [x] 6 PO-2 `toEditorTask()` in `server/portals.ts` used by load + PATCH; SC-16 editors get a 400 when updating Completed (approved) tasks, and the UI shows an "Approved, locked" card. **Behavior change:** approved work is now read-only for editors.
  - [x] 7 PO-3 owner `tenantConfigurations` syncs with `data.tenants` (new and changed workspaces); PO-12 package field rows keyed by id with bound checkboxes; PO-16 snapshot date pinned to IST
  - [x] 8 SC-1/SC-2 task "invoiced amount" counts only live (non-cancelled) **partial** invoices (repository.ts 3 queries). Final duration invoice `updateTask` errors return 400. **Semantics:** final invoices no longer mark tasks "Invoiced ₹X".
  - [x] 9 orders export pages through all results; masks paid when billing.payments is off; uses `orderCode()` with the tenant prefix (RA-20); `/api/orders/export` gated by reports.excelExport
  - [x] 10 reconcile: flush first; refuse when outbox rows are pending or the sheet has no rows; dry run returns the `missing` names; editors page confirms with names before archiving; route gated by integrations.googleSheets; import route runs flush → reconcile → import sequentially
  - [x] 11 order PATCH: invalid body → 400; strips server-owned fields; validates price/discount/progress independently; customerId must be an active customer. Invoice: blank or invalid manual subtotal/discount rejected client and server side
- [x] Single sign-in (user request, 2026-11-07): `/login` is the only login. Owner → `/owner`, workspace admin → `/dashboard`. `/owner/login` 308-redirects to `/login` (its page was deleted); hooks and owner password-change redirects go to `/login`; logout links use `data-sveltekit-reload` (fixed "Not found: /logout" console error); README updated
- [x] UI foundation pass 1 (2026-11-07, user asked for UI/UX before Phase 2):
  - New favicon: `static/favicon.svg` (flat ink square, white N, teal dot), `static/apple-touch-icon.png` (180px), `static/favicon.ico` (48px PNG). `+layout.svelte` links updated; a tenant logo still overrides when white-label is on.
  - Removed hover lift/scale movement from 39 `:hover` rules app-wide (rule 3) and deleted the resulting empty rulesets.
  - Raised tiny text app-wide, one-off monotonic map (463 declarations): <10px→11, 10→12, 11→12.5, 12→13, 13→14. **Do not re-apply** (not idempotent); the script was deleted.
  - Replaced 40 hard-coded indigo `#6366f1` colors/gradients/shadows with `var(--purple)` (the workspace palette accent) in layout.css, orders, settings/sheets, customer layout, and Modal.
  - AppShell: logo fallback shows business initials (was hard-coded "SF"); Sheets status in plain words ("1 change waiting to copy", "Google Sheets is up to date") and links to /settings/sheets; nav "Sheets data" → "Google Sheets".
  - Dashboard rewritten: 4 uniform stat cards with a plain hint line; new **Needs attention** list (overdue, waiting review, ready-but-unpaid, unassigned); cleaner active queue (late due dates in red); shared `notifyAction` toast. Same data, links, and New order flow.
- [x] UI pass 2: Orders list (`routes/(admin)/orders/+page.svelte` rewritten, same features):
  - 11 columns → ★, Order (title, customer, code · category · received), Status, Staff (if work.staff), Due (overdue in red), Balance ("Paid" in green + "of ₹total"; shows Total when payments are off), Actions
  - Card layout via a container query when the list is under 720px wide (phones, or sidebar + small window), so no sideways scroll
  - Queue tabs use workspace status labels; filters apply immediately on change; search applies on Enter or the Search button; removable filter **chips** + "Clear all"; hidden inputs keep filters when searching with the panel closed
  - Row actions labelled: "Deliver" and "Restore"/"Delete" as text buttons; WhatsApp/Archive/Open icons with tooltips and aria-labels; WhatsApp, Deliver, Export, and Staff hidden when their capability is off
  - Removed star confetti animation; star toggle rolls back on failure; all fetches use requestJson with errors shown via notifyAction (fixes AU-5/AU-6 on this page); export month defaults to the IST month (AU-11)
  - Clear empty states ("No orders match these filters" + Clear filters / New order)
- [x] UI pass 3: Order detail + shared pieces (2026-11-07):
  - `safeFetch()` in `$lib/http.ts`: never throws, always returns a JSON body. Replaced all 29 raw `await fetch(` in orders/[id], customers, editors, settings, invoices/[id], AppShell, and DirectWhatsAppModal (fixes stuck busy states and silent failures, AU-5/AU-6/AU-13 partly). Use `safeFetch` or `requestJson` for new UI code.
  - New `Breadcrumbs.svelte` (user request): Orders › [Archived ›] CODE · Project; Invoices › INV-…; Settings › Google Sheets. It replaces the old back links. **Use it on every detail or sub page.**
  - Order header: Record payment (secondary) + Create invoice (primary) + **More** menu (Set total and discount, Archive) that closes on outside click or Esc; the WhatsApp template select shows only when there's more than one template.
  - Next-step card now covers every stage: Add tasks → Assign staff → In progress / Changes requested (X of Y approved) → Review → Ready (notify, collect, deliver) → Delivered.
  - Task review buttons labelled "Approve" / "Request changes"; icon buttons have aria-labels.
  - Removed the duplicate order-code box, star confetti and pop animation, and the forever-pulsing star glow; a/an grammar uses the workspace's wording (`withArticle`).
  - Workflow card text enlarged (title 15.5px, body 13px, buttons 38px tall, no shadow).
  - `npm run check`: 0 errors, 0 warnings.
  - Not done yet on this page: component split, simpler TaskModal (required + advanced), DeliveryModal checklist.
- [x] UI pass 3b (user requests, 2026-11-07):
  - **Back button**: `Breadcrumbs.svelte` now shows a "← Back" button (uses history.back() when the user came from inside the app, so list filters are kept; otherwise links to the parent crumb). On phones only Back + the current page name show.
  - **Sidebar**: "Workspace" group (Overview, Orders, Customers, Editors, Invoices, Analytics) + a "Setup" group at the bottom (Google Sheets, Settings). `isNavActive` matches path segments, so Settings and Sheets no longer both highlight.
  - **Analytics** (`routes/(admin)/analytics`): server-side aggregation in IST with a 3/6/12-month range; tiles (collected this month vs last, still to collect, new orders, average days to deliver); monthly bar charts (money collected, new orders) with hover/focus tooltips, labelled peak and current month, and "View as table"; ranked lists (status mix, top customers, categories, staff workload). One accent colour, values always as text; payment and staff panels hidden when those capabilities are off.
  - **Responsive audit** (scripted check for page-level and inner sideways overflow at 375px and 768px on dashboard, orders, order detail, customers, editors, invoices, invoice detail, settings, sheets, analytics). Fixed:
    - Root cause on every page at tablet width: the global aria-label tooltip `::after` boxes took space while hidden → now `display:none` until hover or focus-visible; top-bar tooltips open downward and right-aligned.
    - Order detail header wraps; mobile action buttons 44px (were 70px); sticky summary on phones shows code, status, balance.
    - Sheets tab strip constrained; analytics range labels shorten on phones.
    - Tables: on phones cells wrap long codes (`overflow-wrap:anywhere`) with tighter padding; internal invoice id removed from the invoices list; invoices hides Project/Created at 621–1000px.
    - Result: no page-level sideways scroll on any audited page at 375 or 768. The only remaining inner scroll is the Google Sheets data grid (spreadsheet data, intended).
  - Known gap: on phones the global table rule hides columns 4+ (e.g. invoice Total, customer actions). Fix in the customers and invoices passes with card layouts.
- [x] UI pass 4: Customers (`routes/(admin)/customers/+page.svelte` rewritten, same features):
  - Columns: Customer (business + contact person), Phone (tap to call), Orders, Balance due ("All paid" in green; column hidden when payments are off), Actions. Card layout via container query under 640px; audited clean at 375/768/1400.
  - Row actions: WhatsApp icon → opens the message dialog directly (was 3 steps), **View**, and a **⋯** menu (New order, Edit details, Copy private link, Open their portal, Create a new link, Archive). Archived rows: Restore. The menu closes on outside click or Esc.
  - **New order from a customer**: row menu + details dialog; `NewOrderModal` gained `initialCustomerId`. Also fixed AU-8: the mobile number is filled only when the chosen customer changes (no longer wiped by store refreshes).
  - Details dialog: action row (New order primary, Message, Send an invoice, Edit); Contact facts (tap-to-call/email; "Open in Google Maps" replaces the blocked map iframe); Account (billed/paid/balance); "Private customer page" explained in plain words; orders list with status badges; Archive as a separate red link.
  - Internal customer id no longer shown; empty states for no results, no archived, and no customers yet; all messages via notifyAction; local lists re-sync after invalidateAll (AU-12).
  - Global: page-header primary buttons no longer wrap.
- [x] UI pass 5: Editors (`routes/(admin)/editors/+page.svelte` rewritten, same features):
  - Team cards (auto-fill grid; works at every width): initials, name, skill, availability badge in plain words (Available / Busy / Not taking work / Archived), **Open work** (counts only unfinished tasks, fixing the old count that included completed ones), tap-to-call phone. Actions: View, WhatsApp, ⋯ (Copy private link, Edit details, Archive). Archived: Restore + Delete.
  - Search box (name, skill, phone); archived toggle with count; empty states.
  - Profile dialog: Message / Copy private link / Open their page / Edit; facts; **Open work | Approved** tabs with status badges and progress; separate red Archive link. Map iframe replaced with an "Open in Google Maps" link.
  - All messages via notifyAction (no more inline `message` paragraph).
  - **Reconcile moved** to Settings › Google Sheets as "Match editors to Sheet" (same dry-run + named confirmation); the Sheets header now wraps.
  - Audited clean at 375 and 768.
- [x] UI pass 6: Invoices (2026-11-07):
  - List rewritten: totals tiles (Still to collect / Collected so far, when payments are on); search; filter buttons with counts (All / Invoices / Receipts / Unpaid / Cancelled when any); columns Number+type, Customer+project, Date, Amount, **Status from real payments** (Payment received / Paid / Unpaid or "Sent, unpaid" + "₹X due" / Total not set / Cancelled); sorted newest first; card layout under 680px with the amount and status always visible (fixes the hidden Total on phones). Excel download only when reports.excelExport is on. ₹0 snapshot amounts no longer fall back to live order totals (AU-17, list).
  - Detail: header pill shows the plain payment state (e.g. "₹35,000 due", "Paid", "Cancelled"); status select has plain labels (Draft (not sent yet) / Sent to customer / Marked as paid / Cancelled); **cancelling asks for confirmation** and explains that billed work becomes invoiceable again; billing card adds a "still due now / paid in full now" line from the live order; WhatsApp template select only when there's more than one.
  - Left as-is on purpose: the detail's `hasBillingSnapshot` heuristic (legacy invoices from before migration 0003 have all-zero snapshots; switching to `!= null` would show ₹0 for them).
  - Audited clean at 375/768/1400.
- [x] UI pass 7: Settings (`routes/(admin)/settings/+page.svelte`):
  - Removed 134 lines of commented-out legacy markup.
  - **Unsaved changes**: the save bar appears only when something changed ("You have unsaved changes" + Discard + Save changes); leaving the page (in-app navigation or tab close) asks first; Discard restores fields and theme. Verified in the browser (edit → bar → Discard; nothing saved).
  - Theme click is a preview only; it's remembered after Save succeeds (AU-19).
  - All notices go through notifyAction with explicit success/error (AU-18: "0 failed" is no longer red); removed the page-local notice and its CSS.
  - Jump bar: Business details · WhatsApp messages · Google Sheets and reports · Look and colours · Storage (anchors with scroll margin).
  - Plain wording: "Copy changes now" (was Retry sync), "Import past orders from the Sheet" (now asks first), "Download Excel file", "N changes waiting to copy" / "Google Sheets is up to date", "Look and colours", clearer storage line.
  - Audited clean at 375/768.
- [x] UI pass 8: Portals, done and browser-verified 2026-11-07 (Demo workspace; user approved creating demo links). Private links were created for demo customer **Mehta Wedding Stories** (CUS-DEMO-001) and demo editors **Riya Sen** (ED-DEMO-001) and **Arjun Nair** (ED-DEMO-002); their old links (if any) were replaced. Demo workspace slug: `demo`. Audited clean at 375 and 768 (customer portal, invoice page, both editor portals).
  - Follow-up fixes after the browser check: no past "Expected by" date; note when the selected order has no bills; editor cards show a separate chips row and "1 task"; progress buttons in one even row; phone Back returns to the task list (verified).
  - Invoice page (`portal/[slug]/customer/[token]/invoice/[invoiceId]`): "← Back to my orders" + Print / Save PDF toolbar; removed the duplicate "Invoice for" block that listed current tasks (PO-8); fallback line item no longer lists current tasks (receipts say "Payment towards CODE"); print uses a static layout, hides UI, keeps header colours (`print-color-adjust`), avoids splitting rows (PO-9); in-app browsers (WhatsApp/Instagram/Facebook) show an "Open in browser to save PDF" note and skip auto-print (PO-10).
- Details of the original portal work:
  - Customer portal (`routes/customer/[token]/+page.svelte`, shared by the slug route) rewritten phone-first: opens on the newest unfinished order (select switcher shows status and balance); status card with a plain "what's next" line and a "View your files" primary button; total due across orders; Payment card (total/paid/still due + collapsible history); Bills and receipts for the selected order with "Show all" (open in the same tab); collapsible work steps; single WhatsApp contact; all portal section toggles respected.
  - Removed legacy `customer/[token]/+layout.svelte` (PO-4 "Back to customers" sent customers to the admin login).
  - Editor portal: status radio chips (current admin status shown as a note), quick 0/25/50/75/100 progress + fine slider, "Mark ready for review" shortcut, needs-action-first sort with Overdue / Due today / Needs you chips, history entry so the phone Back returns to the list, 16px inputs and 44px targets.
  - Root layout skips generic og/twitter tags on portal routes (PO-5).
  - Remaining: browser check at 375/768; invoice print page (PO-8/9/10 + "Back to my orders").
- [ ] UI pass 8 (original scope): Portals (editor + customer, mobile first: PO-6 text sizes/tap targets, PO-4 back button on customer portal, PO-5 meta, PO-8/9 invoice, status card, "You owe", task update bar), then owner panel and login (see Phase 5) (New order from customer, row overflow menu, mobile cards, breadcrumbs for detail), then editors, invoices, settings, portals, owner (see Phase 4/5)
- [x] Login rewrite (PO-7), 2026-11-07: `routes/login/+page.svelte` rebuilt with the same form, enhance, show/hide password, rate-limit and invalid messages, and theme. Removed the ~40 animated niche icons and 50 icon imports; labels use `for`/`id` (no button inside a label); visible hint text (`aria-describedby`); plain error copy; 16px inputs, 48–50px controls; uses `/favicon.svg` as the brand mark. Verified via signed-out HTML fetch (labels and hints present, icon wall gone); type check clean.
- [x] Speed + loading bar (user request): new `src/lib/server/cache.ts`, a 15s per-instance cache (deep-copied results) for `getAuthSession`, `getSettings`, and `getTenantConfiguration`. Cleared at the start and end of every non-GET request (hooks), on logout, and after settings/configuration saves. Measured server time per page change: **1.4–2.8s → 0.24–0.47s**. New `TopProgress.svelte` in the root layout: slim top bar during navigation and in-flight saves (120ms delay, reduced-motion aware). Trade-off: session revocation or tenant suspension on another instance takes effect within ≤15s.
- [x] Phase 2: medium bugs, done 2026-11-07 apart from the small deferred items listed below; `npm run build` succeeds locally. Done (type check clean, both audits pass; no DB writes were run to test them):
  - SC-3: order serial counter uses GREATEST(counter+1, MAX(serial)+1), so no collisions after importing old serials.
  - SC-4 / SC-5 / RA-9: import matches customers by normalized phone (falls back to a phone-only match), parses "₹1,200" / "10%" safely (never NaN), skips bad rows with a warning instead of aborting.
  - SC-8: recordPayment locks the order row and inserts conditionally in one transaction (explicit ::text/::real casts).
  - SC-12: maintenance purges unsynced outbox rows older than the retention window (rows are change signals; sync writes full snapshots). SC-13: `markSyncResults` does one bulk UPDATE (`id = ANY(?::text[])`).
  - SC-18: order date filters use IST day bounds. SC-19: payment default date and invoice year use IST. AU-11: PaymentModal (reset on open) and Sheets month default use IST.
  - AU-10: `money()` shows paise only when present. SC-23: unpriced receipts keep "To be confirmed".
  - RA-13: WhatsApp settings 400 on bad payloads. RA-14/15: task status enum + active-editor check. RA-23: all API `request.json()` calls fall back to `{}` (400 instead of 500).
  - SC-20: tasks can be unassigned. RA-21: cancelled receipts don't block reissue. RA-22: permanent order delete removes invoice items. SC-25: summary recompute skips Completed/Historical.
  - RA-19: logo URL rejects `//host`; theme values validated. PO-15: owner-panel passwords stored untrimmed. RA-17: status change requires an existing workspace. RA-12: snapshot of the old DB is best-effort when repairing a connection. SC-14: duplicate Sheet/DB guard compares normalized IDs/hosts.
  - AU-13: notification poll skips hidden tabs and no-team workspaces; mark-read only clears on success; uses goto. AU-16: TaskModal keeps an inactive assigned editor selectable.
  - Deferred (needs a multi-step transaction refactor; UI already prevents double clicks): SC-9.
  - PO-18: `publicConfiguration()` in `server/portals.ts`; customer/editor portal loaders and the root layout (signed-out pages) send only profile, resolved switches, and that portal's module settings. Verified: portal HTML has no templates, defaultTemplateIds, or package defaults; both portals still render.
  - PO-11: owner notices sit above dialogs (z-index 1100). PO-14: owner confirmations for Suspend, Restore snapshot, owner password change; demo reset requires typing the workspace slug (a mismatch cancels). `track()` takes an optional `confirmFor(form)` that returns a question, null, or false.
  - Left for later (low impact): PO-19 editor portal re-sync on client navigation; RA-16 tenant-create rollback; SC-24 activity log beyond 100 rows in Sheets/export; SC-9 (above).
- Decisions sent to the "Hermes test message" session on 2026-11-07 (D1 RA-18 logout POST, D2 PO-13 current owner password, D3 SC-10 duration invoice includes manual tasks, D4 SC-22 invoice status transitions, D5 SC-6 separate import tab, D6 SC-11, D7 SC-15, D8 commit/PR). Waiting for the owner's direct reply.
- [~] Phase 5 owner panel: **Workspaces | Packages | Account & security** tabs (`routes/owner/+page.svelte`). Same forms and actions; "Add workspace" shows only on Workspaces; the package builder opens expanded on its tab; a form result reopens its tab (package → Packages, owner password → Account). Confirmations and notices from Phase 2 (PO-11/14). Browser-verified as owner (2026-11-07): all three tabs, workspace cards open with full details; no overflow at 375/768 with all cards open. Minor polish left: Account tab password fields squeeze their placeholders at narrow widths. Remaining owner UX: status as explicit buttons, a per-workspace danger zone layout, package builder as steps.
- [x] In-app confirmation dialog (user report: "Sign out does nothing"). The cause: native `window.confirm()` / `prompt()` are suppressed in the app's browser pane (and some in-app browsers) and return false. New `$lib/stores/confirm.ts` (`askConfirm(options)`, `confirmDanger(message)`) + `ConfirmDialog.svelte` mounted in the root layout (focus trap, Esc, typed confirmation via `requireText`). Replaced every confirm/prompt: sign-out, orders, order detail, customers, editors, invoice cancel, Settings import + leave-with-unsaved (cancel → ask → goto), Sheets reconcile, NewOrderModal event removal, owner forms (async SubmitFunction; demo reset requires typing the slug). Verified in the pane: the Sign out dialog appears and confirming lands on /login. Also fixed a double input border on the login page (global `.field input` styles; wrapper renamed `.login-field`). **Rule: never use window.confirm/prompt; use askConfirm/confirmDanger.**
- [ ] Niche setup plan (user request, 2026-11-07): `docs/NICHE_SETUP_PLAN.md`: new-workspace wizard, package library + 5-step builder with live preview, starter niches, team roles (P1/P2), easy DB setup, sensitive-niche handling. **Plan only; waiting on the decisions in its section 8.** Must not change Anjana/Demo.
  - [x] N1 New-workspace wizard (2026-11-08): `src/lib/components/owner/WorkspaceWizard.svelte`. 5 steps (type tiles + search, details with auto slug, first admin with password generator, connections help, review) and live preview. Posts the same fields to the unchanged `?/create` action.
  - [x] N2 Package library + 5-step builder (2026-11-08): `PackageBuilder.svelte`, `NichePreview.svelte`, `nicheIcons.ts` (icons, field suggestions). Library cards show version, built-in/custom, workspace count; Duplicate & edit, Edit (custom only). `?/package` gained optional `status:<key>:label` renames (additive). `load` returns `builtInIds`. Old builder markup/CSS removed.
  - [x] Step UI polish (2026-11-08): shared `Stepper.svelte` (dots joined by a filling line, current dot ringed, finished dots clickable to go back, unreached ones disabled) and `stepForm.ts/.css` (red box + message under each missed required field, clears on edit). Used by wizard and builder.
  - [x] N3 starter niches (2026-11-08), code only: 10 built-ins in `capabilities.ts` (car-garage, bike-service, hospital-front-desk, dental-clinic, diagnostic-lab, tailoring, photo-studio, printing-press, laundry, interior-fitout) + WhatsApp copy in `moduleConfiguration.ts` + icons/suggestions + test id list. Seeded into prod `control_packages` on 2026-11-08 dev restart, with owner approval (additive, `seedCapabilityControl` upsert). Verified: 24 types in wizard/library; Anjana and Demo still Editing Studio v1; no server errors.
  - [ ] P1 roles plan written (2026-11-08): `docs/P1_ROLES_PLAN.md`. Blocker found: unique index `control_one_admin_per_tenant_idx` (one login per workspace). Steps P1a–P1d need no DB change; P1e needs Neon branch. Waiting on decisions in its §9.
  - [x] P1a–P1d (2026-11-08), no DB change, plan defaults (5 roles, §3 table):
    - P1a `src/lib/permissions.ts` (roles, 17 permissions, `can`); `AccountRole` = owner | TenantRole.
    - P1b `src/lib/server/permissionRoutes.ts` + `hooks.server.ts`: any tenant role allowed in; per-request permission check after capability check; unmapped = client_admin only; API → 403, page → `/dashboard?denied=1`. `/analytics` added to protected prefixes (was unguarded by the hook). Customer `POST /api/customers/:id` reads body `action` (restore = delete tier).
    - P1c `$lib/stores/permissions.ts` `allowed()`; `(admin)/+layout.server.ts` returns `role`. Hidden by role: sidebar (staff, invoices, analytics, sheets, settings), profile settings link, storage banner, new order/customer/staff, edit/archive/restore/delete menus, record payment, create invoice, set total, add task, export. Dashboard shows "no access" notice.
    - P1d `control.ts`: active-workspace check for every non-owner role (login + session); owner list joins only `client_admin` and adds `memberCount`; owner "change login" updates/signs out only `client_admin`.
    - `scripts/test-permissions.mjs` (runs inside `npm run test:capabilities`): role table, all 53 admin routes mapped, sample denials.
    - Verified: owner panel lists 2 workspaces once each, no server errors. Workspace-admin browsing not yet checked in browser (session is owner).
  - [x] Portal link replace + send (2026-11-08, owner chose option A, no DB change): `LinkReadyDialog.svelte` (Copy link / Send on WhatsApp via wa.me with ready message) after replacing a link. Staff now have "Create a new link" (menu + detail) like customers. Old/unknown link → `PortalLinkError.svelte` via `src/routes/{portal,editor,customer}/+error.svelte`: business name/logo, "replaced or expired", "Ask for a new link on WhatsApp" (to business phone) + Call. `App.Error` extended; `portals.ts` throws `linkReplaced` error. Data stays tied to the record, so new link shows everything. Verified: fake link → friendly page (customer + staff), valid demo links 200, menu item present. Replace tested once on Demo editor Arjun Nair with owner approval: window shows link, Copy, WhatsApp (wa.me to his number, correct text); old link → replaced page, new link 200; `__demoPortalTokens.arjun` updated in pane localStorage.
  - [~] P1e/P1f cancelled (2026-11-08, owner): staff use passwordless portal links only; no team logins. Single admin login per workspace stays. P1a–d code is dormant (admin = all permissions).
  - [ ] Next: P1 roles, S1 sensitive checklist. Decisions 2–5 in plan section 8 still open.
- [ ] Phase 3: design system foundation
- [ ] Phase 4: admin screens
- [ ] Phase 5: portals, owner, login

## Session log

- 2026-11-07 (later): Audit done (`docs/audit/*`), Phase 1 fixed. Not yet browser-tested with a tenant login. Next: Phase 2.
- 2026-11-07: Project explored, server run, env issues diagnosed (bootstrap password ignored while an owner exists; encryption key mismatch → 500). Branch created. Audit started.

- [x] Committed locally on `enhance/ux-and-bugfixes` (2026-11-08): 22223c6 docs, a47f73d server/API, 746bd30 owner, 3564f24 UI. Pushed via personal SSH alias and merged into main by the owner as PR #3 (810b6ec) on 2026-11-08. Repo is PUBLIC: review `docs/audit/*` (lists security findings) before any push.

## Full-system test (2026-11-08, 7 testers + skeptics, read-only)
- 32 findings confirmed, 0 refuted. Raw output: tasks/wu8u570a5.output (session scratch).
- [x] CRITICAL encoded-path auth bypass (`/%6Fwner/__data.json` returned owner data anonymously in prod). Fixed `hooks.server.ts` (decode like SvelteKit, map `/__data.json`), commit db5e8a0, pushed to main, verified live. Also closes the HIGH role/capability bypass via `/%61pi/...`.
- [ ] Audit-log review for anonymous owner actions before the fix: needs owner to approve a read-only prod query or check Vercel logs for paths containing `%6F`/`%6f`.
- [x] Medium (10) fixed 2026-11-08: MONEY_EPSILON 0.009 in recordPayment/updateOrder + invoice route catches updateOrder errors (no 500); niche switch deactivates and unrequires old-niche fields (same-niche updates unchanged); receipt resend uses snapshot pricing (unpriced receipt stays "To be confirmed"); BillingModal blank total blocked + exact discount kept + tolerance; InvoiceModal opens with exact discount amount; PaymentModal receipt option only with invoices.manage; customers/editors deep links via afterNavigate; wizard always posts hidden packageId (verified in browser); customer portal keeps business seller name without white label (logo dropped only); archived tasks excluded from portal delivery links. Not browser-tested: order/billing modals (pane on owner session; saving would write prod).
- [ ] Low (20): see report; incl. advance paid_at UTC, delivered_at kept on revert, logout GET (D1), NewOrderModal auto-selects first customer (AU-8), invoice detail snapshot truthiness (AU-17), create action not atomic, connections logo clear/HTTPS, duplicate field keys, package upsert overwrite, credentials success on missing tenant, portal API on archived orders, layout data leaks templates on portal pages, payment notes in portal data, no X-Frame-Options/CSP.

## Owner Health tab (2026-11-08)
- [x] Owner panel → Health tab (`HealthPanel.svelte`, `HealthLine.svelte`, `HealthBars.svelte`), data from `GET /owner/health` (owner-only via the `/owner` hook guard, `no-store`). Read-only: SELECTs on control + each tenant DB via `databaseFromUrl` (no `readyDatabase`, so no schema/branding/maintenance writes). No DB changes.
- Shows: overall verdict, main DB response, workspaces working, signed-in sessions, orders/payments today; live response-time line (15 s polling, paused when the tab is hidden, last 40 checks kept in the browser only); per-workspace status light + plain reason, storage gauge (60/80/95 marks), Google Sheet backlog/last error; 14-day bars for new orders (IST, non-historical) and payments (paid_at), filter by workspace; version/region footer; link to Vercel Analytics for visitors.
- Verified in browser on local dev (prod data, read-only). Not committed.
- [x] Lists (orders, customers, invoices) 2026-11-08: header row sticks under the 64px top bar while the page scrolls (card `overflow: clip`, no inner scroll box: it trapped the wheel); tinted band + bottom line. Customers last-2-row menus open upward. Global CSS in `layout.css` (`div.card.list`). Verified on real Demo lists (orders, customers incl. upward menu, invoices). Not committed.
- [x] Number column titles right-aligned to match values (`th.num` was overridden). Medium screens 821–1180px: sidebar icon-only (76px) with name shown on hover/focus (`data-label` tooltip; names visually hidden, still read by screen readers); desktop >1180 unchanged, phones keep slide-in menu. Verified at 1024/1280/700. Not committed.
- [x] Google Sheets viewer (`settings/sheets`): cells centred horizontally and vertically, tinted header band, soft zebra rows, light column lines, first column pinned when scrolling sideways; table tabs no longer shrink (count badges overlapped the next tab) and wrap instead of scrolling. Verified on Demo Customers and Orders tabs. Not committed.
- [x] Demo workspace sample data (user-approved prod write, 2026-11-08): 22 customers + 43 orders created through the app APIs from the signed-in Demo session (phones 98000101xx–98000102xx, remarks/notes "Sample data"); ~2/3 orders have an editor task (Riya/Arjun/Nisha), some fully paid by UPI. Demo now 31 customers, 51 orders. A demo reset would remove them. Anjana untouched.
- [x] Pages for Customers (25), Invoices (25) and the Sheets viewer (50) via `ListPager.svelte`, same look as Orders; resets to page 1 on search/filter/tab change. Verified in browser. Not committed.
- [x] Rows per page (10/25/50/100) on Orders (server, `?size=`, kept in page links and search), Customers, Invoices, Sheets viewer (remembered per list in this browser, `src/lib/pageSize.ts`). List pages on screens ≥761px wide and ≥560px tall: title, tabs and filters fixed, rows scroll inside the card under pinned column titles, page bar fixed at the bottom (`main:has(>div.card.list)` in layout.css); phones scroll normally. Verified in browser at 1280x760 and 375 wide. Not committed.
- [x] Scrollbars: slim rounded soft theme-tinted thumb on clear track, darker on hover/drag. Removed global `scrollbar-color` (it made Chrome ignore the webkit styles and draw a thick dark bar); Firefox gets thin standard colours via @supports. Not committed.
