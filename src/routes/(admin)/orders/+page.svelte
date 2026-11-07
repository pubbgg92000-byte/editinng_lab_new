<!-- Order register: workflow queues, search and filters, export, and row actions (deliver, notify, archive). -->
<script lang="ts">
    import { allowed } from '$lib/stores/permissions';
import { confirmDanger } from "$lib/stores/confirm";
  import { untrack } from "svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import NewOrderModal from "$lib/components/NewOrderModal.svelte";
  import DeliveryModal from "$lib/components/DeliveryModal.svelte";
  import WhatsAppIcon from "$lib/components/WhatsAppIcon.svelte";
  import { formatDate, money } from "$lib/data";
  import { orderCode } from "$lib/identifiers";
  import { requestJson } from "$lib/http";
  import {
    Search, SlidersHorizontal, ArrowLeft, X, Star, ChevronLeft, ChevronRight, Archive, RotateCcw,
    Trash2, PackageCheck, Download, ChevronRight as Open,
  } from "@lucide/svelte";
  import type { Order } from "$lib/types";
  import { hasCapability, labelFor, statusFor } from "$lib/capabilities";
  import { flashAction, notifyAction } from "$lib/stores/actionFeedback";

  let { data } = $props();
  const profile = $derived(data.configuration?.profile);
  const capabilities = $derived(data.configuration?.effectiveCapabilities);
  const orderLabel = $derived(labelFor(profile, "order"));
  const orderPlural = $derived(labelFor(profile, "order", true));
  const customerLabel = $derived(labelFor(profile, "customer"));
  const staffLabel = $derived(labelFor(profile, "staff"));
  const categoryLabel = $derived(labelFor(profile, "category"));
  const staffEnabled = $derived(hasCapability(capabilities, "work.staff"));
  const paymentsEnabled = $derived(hasCapability(capabilities, "billing.payments"));
  const deliveryEnabled = $derived(hasCapability(capabilities, "workflow.delivery"));
  const whatsappEnabled = $derived(hasCapability(capabilities, "communications.whatsapp") && deliveryEnabled);
  const exportEnabled = $derived(hasCapability(capabilities, "reports.excelExport") && allowed("reports.export"));

  const initialData = untrack(() => data);
  let showNew = $state(false);
  let orders = $state<Order[]>(initialData.orders);
  let pagination = $state(initialData.pagination);
  let query = $state(initialData.filters.query);
  let statusFilter = $state(initialData.filters.status);
  let eventFilter = $state(initialData.filters.event);
  let sortOrder = $state(initialData.filters.sort || "oldest");
  let dateFrom = $state(initialData.filters.dateFrom || "");
  let dateTo = $state(initialData.filters.dateTo || "");
  let archived = $state(Boolean(initialData.filters.archived));
  let archivedCount = $state(initialData.archivedCount);
  let filtersOpen = $state(Boolean(initialData.filters.event || initialData.filters.dateFrom || initialData.filters.dateTo || (initialData.filters.sort && initialData.filters.sort !== "oldest")));
  let busy = $state("");
  let exportOpen = $state(false);
  let exportMode = $state<"month" | "range">("month");
  let exportMonth = $state(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()).slice(0, 7));
  let exportFrom = $state("");
  let exportTo = $state("");
  let exportBusy = $state(false);
  let deliveryOrder = $state<Order | null>(null);
  let deliveryOpen = $state(false);

  const allStatuses = ["Received", "Assigned", "Editing", "Waiting Review", "Revision", "Ready Delivery", "Delivered", "Stopped", "Completed", "Historical"];

  $effect(() => {
    orders = data.orders;
    pagination = data.pagination;
    query = data.filters.query;
    statusFilter = data.filters.status;
    eventFilter = data.filters.event;
    sortOrder = data.filters.sort || "oldest";
    dateFrom = data.filters.dateFrom || "";
    dateTo = data.filters.dateTo || "";
    archived = Boolean(data.filters.archived);
    archivedCount = data.archivedCount;
  });

  const queues = $derived([
    { label: `All ${orderPlural.toLowerCase()}`, status: "", count: data.queueCounts.all },
    { label: statusFor(profile, "Waiting Review").label, status: "Waiting Review", count: data.queueCounts.review },
    { label: statusFor(profile, "Ready Delivery").label, status: "Ready Delivery", count: data.queueCounts.ready },
    { label: statusFor(profile, "Delivered").label, status: "Delivered", count: data.queueCounts.delivered },
  ]);
  const isQueueStatus = $derived(["", "Waiting Review", "Ready Delivery", "Delivered"].includes(statusFilter));
  const pageTitle = $derived(archived ? `Archived ${orderPlural.toLowerCase()}` : orderPlural);
  const pageHint = $derived(archived ? "Restore an item, or delete it permanently." : "Every job from intake to delivery.");

  type Filters = { q?: string; status?: string; event?: string; sort?: string; dateFrom?: string; dateTo?: string; archived?: boolean; page?: number };
  function buildHref(overrides: Partial<Filters> = {}) {
    const next: Filters = { q: query.trim(), status: statusFilter, event: eventFilter, sort: sortOrder, dateFrom, dateTo, archived, ...overrides };
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.status) params.set("status", next.status);
    if (next.event) params.set("event", next.event);
    if (next.sort && next.sort !== "oldest") params.set("sort", next.sort);
    if (next.dateFrom) params.set("dateFrom", next.dateFrom);
    if (next.dateTo) params.set("dateTo", next.dateTo);
    if (next.archived) params.set("archived", "true");
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const value = params.toString();
    return value ? `/orders?${value}` : "/orders";
  }
  const pageHref = (page: number) => buildHref({ page });

  // Removable chips for every active filter, so it's always clear why the list looks the way it does.
  const chips = $derived([
    query.trim() && { label: `Search: “${query.trim()}”`, href: buildHref({ q: "" }) },
    statusFilter && !isQueueStatus && { label: `Status: ${statusFor(profile, statusFilter).label}`, href: buildHref({ status: "" }) },
    eventFilter && { label: `${categoryLabel}: ${eventFilter}`, href: buildHref({ event: "" }) },
    (dateFrom || dateTo) && { label: `Received ${dateFrom ? formatDate(dateFrom) : "…"} – ${dateTo ? formatDate(dateTo) : "…"}`, href: buildHref({ dateFrom: "", dateTo: "" }) },
    sortOrder === "newest" && { label: "Newest first", href: buildHref({ sort: "oldest" }) },
  ].filter(Boolean) as { label: string; href: string }[]);

  // Selects apply immediately; search applies on Enter or the Search button.
  const applyNow = (event: Event) => (event.currentTarget as HTMLSelectElement | HTMLInputElement).form?.requestSubmit();

  const totalOf = (order: Order) => Math.max(0, order.price - order.discount);
  const balanceOf = (order: Order) => Math.max(0, order.price - order.discount - order.paid);
  const assignedTo = (order: Order) => [...new Map(order.tasks.filter((task) => !task.archived && task.editorId).map((task) => [task.editorId, task.assignee])).entries()];

  async function toggleImportant(order: Order) {
    const previous = Boolean(order.important);
    order.important = !previous;
    orders = [...orders];
    try {
      await requestJson(`/api/orders/${order.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ important: !previous }) }, "Couldn't update the star.");
    } catch (cause) {
      order.important = previous;
      orders = [...orders];
      notifyAction(cause instanceof Error ? cause.message : "Couldn't update the star.", "error");
    }
  }

  function downloadExcel() {
    exportBusy = true;
    const params = new URLSearchParams();
    if (exportMode === "month") params.set("month", exportMonth);
    else {
      if (exportFrom) params.set("dateFrom", exportFrom);
      if (exportTo) params.set("dateTo", exportTo);
    }
    // Full navigation so the browser handles the file download (bypasses the client router).
    window.location.assign(`/api/orders/export?${params.toString()}`);
    setTimeout(() => { exportBusy = false; exportOpen = false; }, 1500);
  }

  async function notifyReady(order: Order) {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    busy = `notify-${order.id}`;
    try {
      const result = await requestJson<{ url: string }>(`/api/orders/${order.id}/customer-whatsapp`, { method: "POST" }, "Couldn't prepare the WhatsApp message.");
      if (tab) tab.location.href = result.url;
      else window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (cause) {
      tab?.close();
      notifyAction(cause instanceof Error ? cause.message : "Couldn't prepare the WhatsApp message.", "error");
    } finally {
      busy = "";
    }
  }

  function openDelivery(order: Order) {
    deliveryOrder = order;
    deliveryOpen = true;
  }
  function delivered(updated: Order) {
    orders = orders.filter((item) => item.id !== updated.id);
    deliveryOpen = false;
  }

  async function changeArchive(order: Order, action: "archive" | "restore" | "delete") {
    if (action === "archive" && !await confirmDanger(`Archive “${order.project}”?\n\nIt leaves the active list. You can restore it later.`)) return;
    if (action === "delete" && !await confirmDanger(`Delete “${order.project}” permanently?\n\nAll its tasks, payments and invoices are removed. This can't be undone.`)) return;
    busy = order.id;
    try {
      await requestJson(`/api/orders/${order.id}`, action === "archive"
        ? { method: "DELETE" }
        : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: action === "restore" ? "restore" : "delete-permanently" }) },
        "Couldn't update this order.");
      flashAction(action === "archive" ? `${orderLabel} archived.` : action === "restore" ? `${orderLabel} restored.` : `${orderLabel} deleted.`);
      location.reload();
    } catch (cause) {
      notifyAction(cause instanceof Error ? cause.message : "Couldn't update this order.", "error");
      busy = "";
    }
  }

  function saved(order: Order, synced: boolean) {
    if (pagination.page === 1 && !query && !statusFilter && !eventFilter) {
      orders = [order, ...orders].slice(0, pagination.pageSize);
      const total = pagination.total + 1;
      pagination = { ...pagination, total, totalPages: Math.max(1, Math.ceil(total / pagination.pageSize)), from: 1, to: Math.min(total, pagination.pageSize) };
    }
    notifyAction(synced ? `${orderLabel} created.` : `${orderLabel} created. Google Sheets will update when the connection is available.`);
  }
</script>

<PageHeader eyebrow={pageHint} title={pageTitle} action={archived || !allowed("orders.edit") ? undefined : `New ${orderLabel.toLowerCase()}`} onclick={() => (showNew = true)} />

{#if archived}
  <div class="archive-bar">
    <span><Archive size={16} aria-hidden="true" />You're viewing archived {orderPlural.toLowerCase()}.</span>
    <a href="/orders"><ArrowLeft size={15} aria-hidden="true" />Back to active {orderPlural.toLowerCase()}</a>
  </div>
{:else}
  <nav class="queues" aria-label={`${orderLabel} queues`}>
    {#each queues as queue}
      <a href={queue.status ? `/orders?status=${encodeURIComponent(queue.status)}` : "/orders"} class:active={statusFilter === queue.status} aria-current={statusFilter === queue.status ? "page" : undefined}>
        {queue.label}<span class="count">{queue.count}</span>
      </a>
    {/each}
  </nav>
{/if}

<form class="toolbar" method="GET">
  {#if archived}<input type="hidden" name="archived" value="true" />{/if}
  {#if !filtersOpen}
    <!-- Keep current filters when searching with the panel closed. -->
    {#if statusFilter}<input type="hidden" name="status" value={statusFilter} />{/if}
    {#if eventFilter}<input type="hidden" name="event" value={eventFilter} />{/if}
    {#if dateFrom}<input type="hidden" name="dateFrom" value={dateFrom} />{/if}
    {#if dateTo}<input type="hidden" name="dateTo" value={dateTo} />{/if}
    {#if sortOrder !== "oldest"}<input type="hidden" name="sort" value={sortOrder} />{/if}
  {/if}
  <label class="search">
    <Search size={16} aria-hidden="true" />
    <input name="q" bind:value={query} placeholder={`Search by ${customerLabel.toLowerCase()}, ${orderLabel.toLowerCase()} or number`} aria-label={`Search ${orderPlural.toLowerCase()}`} enterkeyhint="search" />
    <button type="submit" class="search-go">Search</button>
  </label>
  <div class="tools">
    <button type="button" class="secondary" class:active={filtersOpen} aria-expanded={filtersOpen} onclick={() => (filtersOpen = !filtersOpen)}><SlidersHorizontal size={15} aria-hidden="true" />Filters</button>
    {#if exportEnabled}<button type="button" class="secondary" aria-expanded={exportOpen} onclick={() => (exportOpen = !exportOpen)}><Download size={15} aria-hidden="true" />Export</button>{/if}
    {#if !archived}<a class="secondary archived-link" href="/orders?archived=true"><Archive size={15} aria-hidden="true" />Archived<span class="count">{archivedCount}</span></a>{/if}
  </div>

  {#if filtersOpen}
    <div class="filter-panel card">
      <div class="field"><label for="status-filter">Status</label>
        <select id="status-filter" name="status" bind:value={statusFilter} onchange={applyNow}>
          <option value="">Any status</option>
          {#each allStatuses as status}<option value={status}>{statusFor(profile, status).label}</option>{/each}
        </select>
      </div>
      <div class="field"><label for="event-filter">{categoryLabel}</label>
        <select id="event-filter" name="event" bind:value={eventFilter} onchange={applyNow}>
          <option value="">Any {categoryLabel.toLowerCase()}</option>
          {#each data.eventOptions as event}<option>{event}</option>{/each}
        </select>
      </div>
      <div class="field"><label for="date-from">Received from</label><input id="date-from" name="dateFrom" type="date" bind:value={dateFrom} onchange={applyNow} /></div>
      <div class="field"><label for="date-to">Received to</label><input id="date-to" name="dateTo" type="date" bind:value={dateTo} onchange={applyNow} /></div>
      <div class="field"><label for="sort-filter">Order</label>
        <select id="sort-filter" name="sort" bind:value={sortOrder} onchange={applyNow}>
          <option value="oldest">Oldest first</option>
          <option value="newest">Newest first</option>
        </select>
      </div>
    </div>
  {/if}
</form>

{#if chips.length}
  <div class="chips" aria-label="Active filters">
    {#each chips as chip}<a class="chip" href={chip.href} aria-label={`Remove filter ${chip.label}`}>{chip.label}<X size={13} aria-hidden="true" /></a>{/each}
    <a class="clear-all" href={archived ? "/orders?archived=true" : "/orders"}>Clear all</a>
  </div>
{/if}

{#if exportOpen && exportEnabled}
  <section class="export card" aria-label="Export to Excel">
    <div class="export-head"><strong>Download an Excel file</strong><button type="button" class="icon-close" aria-label="Close export" onclick={() => (exportOpen = false)}><X size={16} /></button></div>
    <div class="segmented" role="group" aria-label="Export period">
      <button type="button" class:on={exportMode === "month"} aria-pressed={exportMode === "month"} onclick={() => (exportMode = "month")}>One month</button>
      <button type="button" class:on={exportMode === "range"} aria-pressed={exportMode === "range"} onclick={() => (exportMode = "range")}>Date range</button>
    </div>
    <div class="export-fields">
      {#if exportMode === "month"}
        <div class="field"><label for="export-month">Month</label><input id="export-month" type="month" bind:value={exportMonth} /></div>
      {:else}
        <div class="field"><label for="export-from">From</label><input id="export-from" type="date" bind:value={exportFrom} /></div>
        <div class="field"><label for="export-to">To</label><input id="export-to" type="date" bind:value={exportTo} /></div>
      {/if}
      <button type="button" class="primary" disabled={exportBusy} aria-busy={exportBusy} onclick={downloadExcel}><Download size={15} aria-hidden="true" />{exportBusy ? "Preparing…" : "Download"}</button>
    </div>
  </section>
{/if}

<div class="card list">
  <table class="orders">
    <thead>
      <tr>
        <th class="col-star"><span class="sr-only">Important</span></th>
        <th>{orderLabel}</th>
        <th>Status</th>
        {#if staffEnabled}<th>{staffLabel}</th>{/if}
        <th>Due</th>
        <th class="num">{paymentsEnabled ? "Balance" : "Total"}</th>
        <th class="col-actions"><span class="sr-only">Actions</span></th>
      </tr>
    </thead>
    <tbody>
      {#each orders as order (order.id)}
        {@const editors = assignedTo(order)}
        <tr>
          <td class="col-star">
            <button type="button" class="star" class:on={order.important} aria-pressed={Boolean(order.important)} aria-label={order.important ? `Remove star from ${order.project}` : `Star ${order.project} as important`} title={order.important ? "Starred as important" : "Star as important"} onclick={() => toggleImportant(order)}>
              <Star size={16} fill={order.important ? "currentColor" : "none"} strokeWidth={order.important ? 0 : 1.8} />
            </button>
          </td>
          <td class="col-order">
            <a href={"/orders/" + order.id} class="order-link">
              <strong>{order.project || "Untitled"}</strong>
              <span>{order.customer}</span>
              <small>{orderCode(data.settings, order.serial)}{order.workType ? ` · ${order.workType}` : ""}{order.createdAt ? ` · Received ${formatDate(order.createdAt)}` : ""}</small>
            </a>
          </td>
          <td data-label="Status"><StatusBadge status={order.status} /></td>
          {#if staffEnabled}
            <td data-label={staffLabel} class="col-staff">
              {#if editors.length}{#each editors as [editorId, name], index}<a href={`/editors?editor=${editorId}`}>{name}</a>{index < editors.length - 1 ? ", " : ""}{/each}{:else}<span class="muted">Not assigned</span>{/if}
            </td>
          {/if}
          <td data-label="Due" class:late={order.due && !["Delivered", "Completed", "Stopped", "Historical"].includes(order.status) && order.due.slice(0, 10) < new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date())}>{order.due ? formatDate(order.due) : "—"}</td>
          <td data-label={paymentsEnabled ? "Balance" : "Total"} class="num">
            {#if order.priceSet === false}<span class="muted">Not set</span>
            {:else if paymentsEnabled}
              <span class:paid={balanceOf(order) === 0}>{balanceOf(order) === 0 ? "Paid" : money(balanceOf(order))}</span>
              <small>of {money(totalOf(order))}</small>
            {:else}{money(totalOf(order))}{/if}
          </td>
          <td class="col-actions">
            <div class="actions">
              {#if archived}
                {#if allowed("orders.delete")}<button type="button" class="small" disabled={busy === order.id} onclick={() => changeArchive(order, "restore")}><RotateCcw size={14} aria-hidden="true" />Restore</button>
                <button type="button" class="small danger" disabled={busy === order.id} onclick={() => changeArchive(order, "delete")}><Trash2 size={14} aria-hidden="true" />Delete</button>{/if}
              {:else}
                {#if order.status === "Ready Delivery" && deliveryEnabled}
                  {#if whatsappEnabled}<button type="button" class="icon" disabled={busy === `notify-${order.id}` || !order.mobile} title={order.mobile ? "Tell the customer it's ready (WhatsApp)" : "No mobile number saved"} aria-label={`Tell ${order.customer} it's ready on WhatsApp`} onclick={() => notifyReady(order)}><WhatsAppIcon size={15} /></button>{/if}
                  <button type="button" class="small" onclick={() => openDelivery(order)}><PackageCheck size={14} aria-hidden="true" />Deliver</button>
                {/if}
                <button type="button" class="icon" disabled={busy === order.id} title="Archive" aria-label={`Archive ${order.project}`} onclick={() => changeArchive(order, "archive")}><Archive size={15} /></button>
              {/if}
              <a class="icon open" href={"/orders/" + order.id} title="Open" aria-label={`Open ${order.project}`}><Open size={16} /></a>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if !orders.length}
    <div class="empty">
      <p><strong>{archived ? `No archived ${orderPlural.toLowerCase()}.` : chips.length ? `No ${orderPlural.toLowerCase()} match these filters.` : `No ${orderPlural.toLowerCase()} yet.`}</strong></p>
      {#if chips.length}<a href={archived ? "/orders?archived=true" : "/orders"}>Clear filters</a>{:else if !archived && allowed("orders.edit")}<button type="button" class="secondary" onclick={() => (showNew = true)}>New {orderLabel.toLowerCase()}</button>{/if}
    </div>
  {/if}
</div>

{#if pagination.totalPages > 1 || pagination.total > 0}
  <nav class="pager" aria-label="Pages">
    <span>{pagination.from}–{pagination.to} of {pagination.total}</span>
    {#if pagination.totalPages > 1}
      <div>
        <a class="secondary" class:disabled={pagination.page <= 1} aria-disabled={pagination.page <= 1} href={pageHref(Math.max(1, pagination.page - 1))}><ChevronLeft size={15} aria-hidden="true" />Previous</a>
        <span class="page-of">Page {pagination.page} of {pagination.totalPages}</span>
        <a class="secondary" class:disabled={pagination.page >= pagination.totalPages} aria-disabled={pagination.page >= pagination.totalPages} href={pageHref(Math.min(pagination.totalPages, pagination.page + 1))}>Next<ChevronRight size={15} aria-hidden="true" /></a>
      </div>
    {/if}
  </nav>
{/if}

<NewOrderModal bind:open={showNew} onsaved={saved} />
{#if deliveryOrder}<DeliveryModal bind:open={deliveryOpen} order={deliveryOrder} ondelivered={delivered} />{/if}

<style>
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .muted { color: var(--muted); }
  .count { display: inline-grid; place-items: center; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: var(--theme-soft); color: var(--theme-text); font-size: 12px; font-weight: 650; font-variant-numeric: tabular-nums; }

  .queues { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .queues a { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--theme-text); font-size: 13.5px; font-weight: 600; text-decoration: none; transition: border-color .15s ease, background-color .15s ease; }
  .queues a:hover { border-color: color-mix(in srgb, var(--purple) 45%, var(--line)); }
  .queues a.active { background: var(--purple); border-color: var(--purple); color: var(--accent-text, #fff); }
  .queues a.active .count { background: color-mix(in srgb, #fff 25%, transparent); color: inherit; }

  .archive-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 14px; margin-bottom: 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--theme-soft); font-size: 13.5px; color: var(--theme-text); }
  .archive-bar span, .archive-bar a { display: inline-flex; align-items: center; gap: 8px; }
  .archive-bar a { color: var(--purple); font-weight: 600; text-decoration: none; }

  .toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; margin-bottom: 12px; }
  .search { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 4px 0 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--muted); }
  .search:focus-within { border-color: var(--purple); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple) 18%, transparent); }
  .search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--theme-text); font-size: 14px; height: 100%; }
  .search-go { height: 32px; padding: 0 12px; border: 0; border-radius: 8px; background: var(--theme-soft); color: var(--theme-text); font-size: 13px; font-weight: 600; cursor: pointer; }
  .tools { display: flex; gap: 8px; }
  .tools .secondary, .archived-link { display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 12px; font-size: 13.5px; text-decoration: none; }
  .tools .secondary.active { border-color: var(--purple); color: var(--purple); }
  .filter-panel { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; padding: 14px; }
  .filter-panel .field label { font-size: 12.5px; font-weight: 600; color: var(--theme-text); }
  .filter-panel select, .filter-panel input { width: 100%; height: 38px; font-size: 13.5px; }

  .chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 12px; }
  .chip { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--purple) 35%, var(--line)); background: color-mix(in srgb, var(--purple) 8%, var(--card)); color: var(--theme-text); font-size: 12.5px; font-weight: 600; text-decoration: none; }
  .chip:hover { border-color: var(--purple); }
  .clear-all { font-size: 12.5px; font-weight: 600; color: var(--purple); margin-left: 4px; }

  .export { padding: 16px; margin-bottom: 12px; display: grid; gap: 12px; }
  .export-head { display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: var(--theme-text); }
  .icon-close { width: 32px; height: 32px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--muted); cursor: pointer; }
  .icon-close:hover { background: var(--theme-soft); color: var(--theme-text); }
  .segmented { display: inline-flex; width: max-content; padding: 3px; border-radius: 10px; background: var(--theme-soft); }
  .segmented button { height: 32px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; }
  .segmented button.on { background: var(--card); color: var(--theme-text); box-shadow: 0 1px 2px #0000001a; }
  .export-fields { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; }
  .export-fields .field { min-width: 180px; }
  .export-fields .primary { display: inline-flex; align-items: center; gap: 7px; height: 38px; }

  .list { padding: 0; overflow: hidden; container-type: inline-size; }
  .orders { width: 100%; border-collapse: collapse; }
  .orders th { padding: 11px 14px; text-align: left; font-size: 12px; font-weight: 650; color: var(--muted); border-bottom: 1px solid var(--line); white-space: nowrap; }
  .orders td { padding: 12px 14px; border-bottom: 1px solid var(--line); font-size: 13.5px; color: var(--theme-text); vertical-align: middle; }
  .orders tbody tr { transition: background-color .15s ease; }
  .orders tbody tr:hover { background: color-mix(in srgb, var(--theme-soft) 70%, transparent); }
  .orders tbody tr:last-child td { border-bottom: 0; }
  .num { text-align: right; white-space: nowrap; }
  .num small { display: block; font-size: 12px; color: var(--muted); }
  .num .paid { color: #15803d; font-weight: 650; }
  .orders td.late { color: #dc2626; font-weight: 650; }
  td[data-label="Due"] { white-space: nowrap; }
  .col-star { width: 44px; padding-right: 0 !important; }
  .col-actions { width: 1%; }
  .star { width: 32px; height: 32px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--muted); cursor: pointer; }
  .star:hover { background: var(--theme-soft); }
  .star.on { color: #e11d48; }
  .order-link { display: flex; flex-direction: column; gap: 2px; min-width: 0; color: inherit; text-decoration: none; }
  .order-link strong { font-size: 14px; font-weight: 650; }
  .order-link:hover strong { text-decoration: underline; }
  .order-link span { font-size: 13px; color: var(--theme-text); }
  .order-link small { font-size: 12px; color: var(--muted); }
  .col-staff a { color: inherit; text-decoration: none; }
  .col-staff a:hover { text-decoration: underline; }
  .actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
  .actions .small { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--card); color: var(--theme-text); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .actions .small:hover { border-color: color-mix(in srgb, var(--purple) 45%, var(--line)); }
  .actions .small.danger { color: #b91c1c; }
  .actions .small.danger:hover { border-color: #fca5a5; }
  .actions .icon { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--muted); cursor: pointer; }
  .actions .icon:hover { background: var(--theme-soft); color: var(--theme-text); }
  .actions button:disabled { opacity: .45; cursor: not-allowed; }
  .empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 16px; text-align: center; color: var(--muted); font-size: 14px; }
  .empty p { margin: 0; }
  .empty strong { color: var(--theme-text); }
  .empty a { color: var(--purple); font-weight: 600; }

  .pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 14px; font-size: 13px; color: var(--muted); }
  .pager div { display: flex; align-items: center; gap: 8px; }
  .pager a { display: inline-flex; align-items: center; gap: 4px; height: 36px; padding: 0 12px; font-size: 13px; text-decoration: none; }
  .pager a.disabled { pointer-events: none; opacity: .45; }
  .page-of { color: var(--theme-text); font-weight: 600; }

  @media (max-width: 1000px) {
    .filter-panel { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 760px) {
    .toolbar { grid-template-columns: 1fr; }
    .tools { flex-wrap: wrap; }
    .filter-panel { grid-template-columns: 1fr; }
  }
  /* When the list itself is narrow (phone, or sidebar + small window), each order becomes a card. */
  @container (max-width: 720px) {
    .orders thead { display: none; }
    .orders, .orders tbody, .orders tr, .orders td { display: block; width: 100%; }
    .orders tbody tr { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; padding: 14px 14px 12px 48px; border-bottom: 1px solid var(--line); }
    .orders tbody tr:last-child { border-bottom: 0; }
    .orders td { padding: 0; border: 0; font-size: 13.5px; }
    .orders td[data-label]::before { content: attr(data-label); display: block; font-size: 11.5px; font-weight: 600; color: var(--muted); margin-bottom: 2px; }
    .col-star { position: absolute; left: 8px; top: 12px; width: auto; }
    .col-order { grid-column: 1 / -1; }
    .num { text-align: left; }
    .col-actions { grid-column: 1 / -1; width: auto; }
    .actions { justify-content: flex-start; flex-wrap: wrap; }
  }
</style>
