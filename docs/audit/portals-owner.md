# Audit: portals, owner, login (2026-11-07, unverified agent findings)

Format: `ID | path:line | severity | defect → fix`

## Bugs
- PO-1 | routes/editor/[token]/+page.svelte:57,131 | High | update() always sends `status`; the select lacks "Revision required" and "Completed", so the API returns 400 and an editor can't resubmit a revision → send status only when changed; show the current status as a disabled option; make Completed read-only
- PO-2 | routes/api/portal/[slug]/tasks/[id]/+server.ts:53 | High | PATCH returns the raw Task (hourlyRate, billableAmount, invoicedAmount, editorSettlement) to the editor → shared `toEditorTask()` from portals.ts:89-99
- PO-3 | routes/owner/+page.svelte:23,234-235 | High | tenantConfigurations copied once via untrack; after creating a workspace, `tenantConfigurations[newId]` is undefined, so a TypeError crashes the page → sync on data.tenants change
- PO-4 | routes/customer/[token]/+layout.svelte:6-17 | Medium | the customer portal shows "Back to customers", which leads to the admin page → render only for an admin session, or remove
- PO-5 | routes/+layout.svelte:48-63 vs portal pages | Medium | duplicate og/twitter tags, and the generic ones come first, so link previews show "NexaDesk" → single meta source
- PO-6 | customer/[token]/+page.svelte:470,502,542,561,583; editor/[token]/+page.svelte:148 | High (mobile) | 6–9px text, and tap targets around 27–34px → at least 12–14px text, 44px targets
- PO-7 | login/+page.svelte:104-105; owner/login/+page.svelte:66-67; owner/+page.svelte:103-120 | Medium | the help button inside <label> captures the label, so inputs are unlabeled → move the button out; show a visible hint
- PO-8 | portal/.../invoice/[invoiceId]/+page.svelte:67-68,103-107 | Medium | heading and fallback items use the order's current tasks, not the invoiced items; receipts say "Invoice for" → use invoice.taskItems; label by kind
- PO-9 | invoice/[invoiceId]/+page.svelte:252,330-345 | Medium | white th text with no print-color-adjust prints invisible; absolute print layout clips → print-color-adjust:exact; static print layout
- PO-10 | invoice/[invoiceId]/+page.svelte:24,44 | Medium | window.print() does nothing in WhatsApp's in-app browser → show an "open in browser" hint
- PO-11 | owner/+page.svelte:64,304,318 | Medium | the owner notice (z 120) renders behind the modal backdrop (z 1000), so errors are hidden → show the error inside the modal
- PO-12 | owner/+page.svelte:159-175 | Medium | package field rows have no key and surface checkboxes are unbound, so removing a row shifts flags (privacy leak) → keyed each + bind
- PO-13 | owner/+page.server.ts:307-314 | Medium | owner password change doesn't require the current password → require and verify it
- PO-14 | owner/+page.svelte:243-246,215 | Medium | snapshot Restore and Suspend are one click → confirm dialog
- PO-15 | owner/+page.server.ts:15 | Low | field() trims passwords on save, but login doesn't trim → don't trim passwords
- PO-16 | owner/+page.svelte:40 | Low | snapshotDate has no timeZone, causing a hydration mismatch → formatDateTime (Asia/Kolkata)
- PO-17 | editor/[token]/+page.svelte:38-46,115 | Medium | task detail is local state: no scroll reset, Back leaves the portal, unsaved edits are lost → ?task= shallow routing + scrollTo
- PO-18 | server/portals.ts:76,102; routes/+layout.server.ts:21,28 | Low | full tenant configuration (templates, allowances) is sent to public token pages → send only that portal's slice
- PO-19 | customer/[token]/+page.svelte:26; editor/[token]/+page.svelte:17 | Low | $state(untrack(data)) never re-syncs → selectedId + derived
- PO-20 | editor/[token]/+page.svelte:116 | Low | header badge shows the unsaved select value → show saved status

## UX
- Editor: sticky bottom action bar with status chips + progress stepper (0/25/50/75/100) + one Save; collapsible notes/duration/link (M)
- Editor: hr/min numeric duration inputs with live preview; "Mark ready for review" one-tap (S)
- Editor list: group by Needs action / In progress / Done; due chips; completed read-only (S)
- Customer: one top status card (status, progress, due, next step) + collapsible tasks (M)
- Customer: "You owe ₹X" at top; per-order balance; invoices filtered to the selected order (`selectedInvoices` unused at customer/+page.svelte:48) (M)
- Customer: "View your files" primary button in the status card (S)
- Customer: scrollable order switcher / select when >4; default to the latest unfinished order (S)
- Invoice: remove duplicate customer heading; "← Back to my orders"; open in the same tab; big Paid/Balance badge (S)
- Portals: extract CustomerPortal / EditorPortal / PortalMeta / MoneySummary components; legacy routes become thin wrappers (M)
- Login: drop the ~40 animated icons; visible hints; wrong-door message (S)
- Owner: tabs (Workspaces / Packages / Account & security); workspace detail sub-tabs (L)
- Owner: Danger zone + typed confirmation for Suspend / Reset demo / Restore / password (M)
- Owner: status as explicit action buttons (S)
- Owner: package builder as a stepper; "Required" moved out of surfaces; auto key from label (M)
- Owner: inline errors in modals; success-only toasts with role=status (S)
