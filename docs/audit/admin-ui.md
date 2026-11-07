# Audit: admin UI (2026-11-07, unverified agent findings)

Format: `ID | path:line | severity | defect → fix`

## Bugs
- AU-1 | (admin)/orders/+page.svelte:443-473 | High | missing {:else}: WhatsApp, Deliver and Archive row actions render only in the archived view → add {:else}
- AU-2 | components/ModuleConfigurationPanel.svelte:151 | High | `previous.scenario` read when previous is undefined, so a new custom template can't be saved → guard `previous &&`
- AU-3 | (admin)/orders/[id]/+page.svelte:39-42 | High | order/editors/devices/activities seeded with untrack; navigating A→B keeps showing A and actions hit A → re-sync effect or {#key data.order.id}
- AU-4 | (admin)/orders/[id]/+page.svelte:761-770 | High | the status select allows "Delivered", bypassing the DeliveryModal balance check; select doesn't revert on error → open DeliveryModal; reset on error
- AU-5 | (admin)/orders/[id]/+page.svelte:134-391 | Medium | raw fetch with .json() before checking ok and no try/finally leaves busy stuck → requestJson + try/finally
- AU-6 | orders, customers, editors, invoices/[id] pages | Medium | same fetch pattern; optimistic star has no rollback; clipboard not caught; toasts never time out → requestJson, revert, notifyAction
- AU-7 | (admin)/editors/+page.svelte:217-234,266 | Medium | one-click Reconcile Sheets archives editors with no confirm → dry-run count + confirm; move to Settings › Sheets
- AU-8 | components/NewOrderModal.svelte:51-54 | Medium | auto-selects the first customer; mobile is overwritten on store update → no auto-select; customerId prop
- AU-9 | components/InvoiceModal.svelte:19,33 | Medium | blank manual subtotal becomes 0, creating a ₹0 final invoice → check empty
- AU-10 | lib/data.ts:40; DeliveryModal.svelte:11,15,31 | Medium | money() shows 0 decimals while balances have paise ("₹0 remaining" but blocked) → 2 decimals when non-integer
- AU-11 | PaymentModal.svelte:11,13; orders/+page.svelte:56; settings/sheets/+page.svelte:47 | Low-Med | UTC toISOString default dates are wrong between 00:00 and 05:30 IST; paidAt is stale → IST date helper; reset on open
- AU-12 | customers/+page.svelte:45-46,277-284; editors/+page.svelte:39-40,235-242 | Medium | untrack-seeded lists go stale after invalidateAll; ?customer= read only onMount → sync effect; react to the URL
- AU-13 | components/AppShell.svelte:227-251 | Low-Med | notification poll has no try/catch; mark-read doesn't check ok; polls hidden tabs → fix
- AU-14 | components/AppShell.svelte:198-208,488-519 | Medium (a11y) | Cmd-K has no focus trap or labels; Escape doesn't close the mobile sidebar → fix
- AU-15 | customers/+page.svelte:317-400 | Medium (mobile) | fixed table with 8 icon actions overflows at 375px; no empty state → cards on mobile, overflow menu, empty row
- AU-16 | components/TaskModal.svelte:99 | Low-Med | inactive assigned editor is hidden, so save fails → include the current editor with "(inactive)"
- AU-17 | invoices/+page.svelte:16; invoices/[id]/+page.svelte:46-54 | Low | truthiness fallback shows live order totals for ₹0 snapshots → `!= null`
- AU-18 | settings/+page.svelte:32,118 | Low | /fail/ regex makes "0 failed" show red → typed notice
- AU-19 | settings/+page.svelte:50-56 | Low | theme preview saved to localStorage before Save → remember=false
- AU-20 | NewOrderModal 185, dashboard 92, DirectWhatsAppModal 179, CustomFieldValues 15, customers 477/552, orders/[id] 745 | Medium | hard-coded light colors break dark mode; ~170 declarations at 7–9px; invalid `font:9px/1.6 inherit`; raw status text instead of statusFor → tokens, 11–12px minimum, statusFor

## UX
- Customers: "New order" from customer row/detail (customerId prop) (S)
- Customers: row = Open / WhatsApp / ⋯ menu; WhatsApp opens DirectWhatsAppModal directly (M)
- Customers: detail as drawer or /customers/[id]; drop the blocked map iframe (M)
- Orders: 11 → 7 columns (★, Customer+Order, Status, Assigned, Due, Balance, Actions) (S)
- Orders: filters apply on change, debounced search, filter chips; shared ExportDialog (dup at sheets:131-158) (M)
- Orders: single STATUS_FLOW; grouped options; align task vs order status wording (M)
- Order detail: status-driven "Next step" bar; secondary actions under More; merge BillingModal into InvoiceModal ("Set total" appears 3×) (M)
- Order detail: labelled Approve / Request changes; Archive moved to overflow (S)
- Order detail: TaskModal split into required + collapsed advanced; inline assign dropdown per task (M)
- Order detail: TaskDraftList component replacing the `Title | 5000` syntax (S)
- Order detail: DeliveryModal as a checklist with inline "record balance" and "send ready msg" (M)
- Order detail: split the 1799-line file → OrderHeader, WorkflowNextStep, TaskList/TaskRow, ActivityFeed, CustomerOrdersCard, OrderInfoCard, AssignedStaffCard, BillingCard/PaymentLedger, orderActions.ts (L)
- Invoice detail: paid status derived from balance; manual select limited to Draft/Sent/Cancelled (S)
- Invoices list: type/status chips, mobile cards, hide internal id (S)
- Editors: move reconcile to Settings › Sheets; Active/Completed tabs; Assign work button (S)
- Settings: save per section, dirty indicator, beforeNavigate warning; remove ~150 lines of commented markup (M)
- Dashboard: "Needs attention" list; use notifyAction (M)
- AppShell: profile card opens popover; Sheets under Settings; initials from the business name; goto() for notifications (S)
- Global: one feedback system (notifyAction) + ConfirmDialog instead of window.confirm (S)
- NewOrderModal: optional fields under "More details"; custom event deletion moved to Settings (S/M)

## Design system
1. Button (primary/secondary/danger/ghost/icon, loading, label→aria-label)
2. Field kit: Field, MoneyInput, DateInput (IST), PhoneInput, FormGrid
3. DataTable (desktop table / mobile cards) + EmptyState + Pagination + RowActions menu
4. Tokens: 11px minimum type scale, spacing 4/8/12/16/24/32, semantic success/warning/danger; remove ~53 hard-coded indigo #6366f1 in layout.css light overrides
5. Action layer: requestJson + useAsyncAction, ConfirmDialog, Drawer, Card/SectionHeader/StatTile; statusFor + money() everywhere
