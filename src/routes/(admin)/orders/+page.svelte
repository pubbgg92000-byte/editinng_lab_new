<!-- Paginated order register with workflow filters, WhatsApp, and archive views. -->
<script lang="ts">
  import { untrack } from "svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import NewOrderModal from "$lib/components/NewOrderModal.svelte";
  import DeliveryModal from "$lib/components/DeliveryModal.svelte";
  import WhatsAppIcon from "$lib/components/WhatsAppIcon.svelte";
  import { formatDate, money } from "$lib/data";
  import { orderCode } from "$lib/identifiers";
  import {
    Search,
    SlidersHorizontal,
    Check,
    ArrowUpRight,
    ArrowLeft,
    X,
    Star,
    ChevronLeft,
    ChevronRight,
    Archive,
    RotateCcw,
    Trash2,
    ClipboardList,
    Clock3,
    PackageCheck,
    CircleCheckBig,
  } from "@lucide/svelte";
  import type { Order } from "$lib/types";

  let { data } = $props();
  const initialData = untrack(() => data);
  let showNew = $state(false);
  let orders = $state<Order[]>(initialData.orders);
  let pagination = $state(initialData.pagination);
  let query = $state(initialData.filters.query);
  let statusFilter = $state(initialData.filters.status);
  let eventFilter = $state(initialData.filters.event);
  let toast = $state("");
  let filtersOpen = $state(
    Boolean(initialData.filters.status || initialData.filters.event),
  );
  let archived = $state(Boolean(initialData.filters.archived));
  let archivedCount = $state(initialData.archivedCount);
  let busy = $state("");
  let deliveryOrder = $state<Order | null>(null);
  let deliveryOpen = $state(false);
  const queueTitle = $derived(
    archived
      ? "Archived orders"
      : statusFilter === "Waiting Review"
        ? "Review queue"
        : statusFilter === "Ready Delivery"
          ? "Ready for delivery"
          : statusFilter === "Delivered"
            ? "Delivered orders"
            : "Orders",
  );
  const queueEyebrow = $derived(
    archived
      ? "Restore or permanently remove"
      : statusFilter === "Waiting Review"
        ? "Review editor output and request changes"
        : statusFilter === "Ready Delivery"
          ? "Notify customer → collect balance → deliver"
          : statusFilter === "Delivered"
            ? "All completed customer deliveries"
            : "Customer → editor → delivery",
  );

  $effect(() => {
    orders = data.orders;
    pagination = data.pagination;
    query = data.filters.query;
    statusFilter = data.filters.status;
    eventFilter = data.filters.event;
    archived = Boolean(data.filters.archived);
    archivedCount = data.archivedCount;
  });

  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (statusFilter) params.set("status", statusFilter);
    if (eventFilter) params.set("event", eventFilter);
    if (archived) params.set("archived", "true");
    if (page > 1) params.set("page", String(page));
    const value = params.toString();
    return value ? `/orders?${value}` : "/orders";
  }

  async function notifyReady(order: Order) {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    busy = `notify-${order.id}`;
    const response = await fetch(`/api/orders/${order.id}/customer-whatsapp`, {
      method: "POST",
    });
    const result = await response.json();
    busy = "";
    if (!response.ok) {
      tab?.close();
      toast = result.error || "Unable to prepare customer message.";
      return;
    }
    if (tab) tab.location.href = result.url;
    else window.open(result.url, "_blank", "noopener,noreferrer");
  }

  function openDelivery(order: Order) {
    deliveryOrder = order;
    deliveryOpen = true;
  }
  function delivered(updated: Order) {
    orders = orders.filter((item) => item.id !== updated.id);
    deliveryOpen = false;
    toast = "Delivery recorded with a permanent audit trail.";
  }

  async function changeArchive(
    order: Order,
    action: "archive" | "restore" | "delete",
  ) {
    if (
      action === "archive" &&
      !confirm(`Archive “${order.project}”? You can restore it later.`)
    )
      return;
    if (
      action === "delete" &&
      !confirm(
        `Permanently delete “${order.project}” and all its tasks, payments and invoices? This cannot be undone.`,
      )
    )
      return;
    busy = order.id;
    const response = await fetch(
      `/api/orders/${order.id}`,
      action === "archive"
        ? { method: "DELETE" }
        : {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              action: action === "restore" ? "restore" : "delete-permanently",
            }),
          },
    );
    const result = await response.json();
    busy = "";
    if (!response.ok) {
      toast = result.error || "Unable to update order";
      return;
    }
    location.reload();
  }

  function saved(order: Order, synced: boolean) {
    if (pagination.page === 1 && !query && !statusFilter && !eventFilter) {
      orders = [order, ...orders].slice(0, pagination.pageSize);
      const total = pagination.total + 1;
      pagination = {
        ...pagination,
        total,
        totalPages: Math.max(1, Math.ceil(total / pagination.pageSize)),
        from: 1,
        to: Math.min(total, pagination.pageSize),
      };
    }
    toast = synced
      ? "Order created and synced to Sheets"
      : "Order created; Sheet sync is pending or not configured";
    setTimeout(() => (toast = ""), 3000);
  }
</script>

<PageHeader
  eyebrow={queueEyebrow}
  title={queueTitle}
  action="New order"
  onclick={() => (showNew = true)}
/>
{#if !archived}<nav class="queue-tabs" aria-label="Order workflow queues">
    <a class:active={!statusFilter} href="/orders"
      ><ClipboardList size={14} /><span>All orders</span><strong
        >{data.queueCounts.all}</strong
      ></a
    ><a
      class:active={statusFilter === "Waiting Review"}
      href="/orders?status=Waiting%20Review"
      ><Clock3 size={14} /><span>Review</span><strong
        >{data.queueCounts.review}</strong
      ></a
    ><a
      class:active={statusFilter === "Ready Delivery"}
      href="/orders?status=Ready%20Delivery"
      ><PackageCheck size={14} /><span>Ready</span><strong
        >{data.queueCounts.ready}</strong
      ></a
    ><a
      class:active={statusFilter === "Delivered"}
      href="/orders?status=Delivered"
      ><CircleCheckBig size={14} /><span>Delivered</span><strong
        >{data.queueCounts.delivered}</strong
      ></a
    >
  </nav>{/if}
{#if archived}<div class="archive-context">
    <span
      ><Archive size={15} /><strong>Archived orders</strong><small
        >Restore an order or delete it permanently.</small
      ></span
    ><a href="/orders"><ArrowLeft size={14} /> Back to active orders</a>
  </div>{/if}
<form class="order-filters" method="GET">
  <div class="list-tools">
    <div class="filter">
      <Search size={15} /><input
        name="q"
        bind:value={query}
        placeholder="Search orders"
        aria-label="Search orders"
      />
    </div>
    <div class="tool-actions">
      {#if archived}<a class="back-active" href="/orders"
          ><ArrowLeft size={13} /><span>Back to active orders</span></a
        >{:else}<a class="archive-toggle" href="/orders?archived=true"
          ><Archive size={13} /><span>Archived</span><strong
            >{archivedCount}</strong
          ></a
        >{/if}<button
        type="button"
        class:active={filtersOpen || statusFilter || eventFilter}
        class="secondary"
        onclick={() => (filtersOpen = !filtersOpen)}
        ><SlidersHorizontal size={13} /> Filter</button
      >
    </div>
  </div>
  {#if archived}<input type="hidden" name="archived" value="true" />{/if}
  {#if filtersOpen}<div class="filter-panel">
      <div class="field">
        <label for="status-filter">Status</label><select
          id="status-filter"
          name="status"
          bind:value={statusFilter}
          ><option value="">All statuses</option
          >{#each ["Historical", "Received", "Assigned", "Editing", "Waiting Review", "Revision", "Ready Delivery", "Delivered", "Stopped", "Completed"] as status}<option
              >{status}</option
            >{/each}</select
        >
      </div>
      <div class="field">
        <label for="event-filter">Event</label><select
          id="event-filter"
          name="event"
          bind:value={eventFilter}
          ><option value="">All events</option
          >{#each data.eventOptions as event}<option>{event}</option
            >{/each}</select
        >
      </div>
      <button class="apply-filters" type="submit">Apply filters</button><a
        class="clear-filters"
        href={archived ? "/orders?archived=true" : "/orders"}
        ><X size={13} /> Clear</a
      >
    </div>{/if}
</form>
<div class="card table-wrap order-table-wrap">
  <table class="data-table order-table">
    <thead
      ><tr
        ><th style="width:34px"></th><th>Customer studio</th><th>Order</th><th
          >Event</th
        ><th>Due date</th><th>Status</th><th>Amount</th><th>Balance</th><th
        ></th></tr
      ></thead
    ><tbody
      >{#each orders as order}<tr class:archived-row={order.archived}
          ><td class="priority-cell"
            >{#if order.important}<Star
                size={14}
                fill="currentColor"
                color="#ef4444"
                aria-label="Important order"
              />{/if}</td
          ><td
            ><a class="project-link" href={"/orders/" + order.id}
              ><strong>{order.customer}</strong><small
                >{orderCode(data.settings, order.serial)} · {order.project}{order.due
                  ? ` · Due ${formatDate(order.due)}`
                  : ""}</small
              ><span class="mobile-order-meta"
                ><StatusBadge status={order.status} /><b
                  >{order.priceSet === false
                    ? "Total not set"
                    : `${money(Math.max(0, order.price - order.discount - order.paid))} balance`}</b
                ></span
              ></a
            ></td
          ><td>{order.project}</td><td>{order.workType}</td><td
            >{order.due ? formatDate(order.due) : "—"}</td
          ><td><StatusBadge status={order.status} /></td><td
            >{order.priceSet === false
              ? "Not set"
              : money(Math.max(0, order.price - order.discount))}</td
          ><td
            class:clear={order.priceSet !== false &&
              order.price - order.discount - order.paid === 0}
            >{order.priceSet === false
              ? "Not set"
              : money(
                  Math.max(0, order.price - order.discount - order.paid),
                )}</td
          ><td
            ><div class="row-actions">
              {#if archived}<button
                  class="restore"
                  disabled={busy === order.id}
                  title="Restore order"
                  onclick={() => changeArchive(order, "restore")}
                  ><RotateCcw size={14} /></button
                ><button
                  class="delete"
                  disabled={busy === order.id}
                  title="Delete permanently"
                  onclick={() => changeArchive(order, "delete")}
                  ><Trash2 size={14} /></button
                >{:else}{#if order.status === "Ready Delivery"}<button
                    class="whatsapp-ready"
                    disabled={busy === `notify-${order.id}` || !order.mobile}
                    title="WhatsApp customer: ready for delivery"
                    onclick={() => notifyReady(order)}
                    ><WhatsAppIcon size={14} /></button
                  >{#if order.priceSet !== false && Math.max(0, order.price - order.discount - order.paid) === 0}<button
                      class="deliver"
                      title="Confirm delivery"
                      onclick={() => openDelivery(order)}
                      ><CircleCheckBig size={14} /></button
                    >{/if}{/if}<button
                  class="archive"
                  disabled={busy === order.id}
                  title="Archive order"
                  onclick={() => changeArchive(order, "archive")}
                  ><Archive size={14} /></button
                >{/if}<a
                class="arrow-button"
                href={"/orders/" + order.id}
                aria-label={`Open ${order.customer} ${order.project}`}
                ><ArrowUpRight size={15} /></a
              >
            </div></td
          ></tr
        >{/each}</tbody
    >
  </table>
  {#if !orders.length}<p class="empty-orders">
      {archived ? "No archived orders." : "No orders match these filters."}
    </p>{/if}
</div>
<nav class="pagination" aria-label="Orders pagination">
  <span>Showing {pagination.from}–{pagination.to} of {pagination.total}</span>
  <div>
    <a
      class:disabled={pagination.page <= 1}
      aria-disabled={pagination.page <= 1}
      href={pagination.page > 1 ? pageHref(pagination.page - 1) : pageHref(1)}
      ><ChevronLeft size={14} /> Previous</a
    ><strong>Page {pagination.page} of {pagination.totalPages}</strong><a
      class:disabled={pagination.page >= pagination.totalPages}
      aria-disabled={pagination.page >= pagination.totalPages}
      href={pagination.page < pagination.totalPages
        ? pageHref(pagination.page + 1)
        : pageHref(pagination.totalPages)}>Next <ChevronRight size={14} /></a
    >
  </div>
</nav>
<NewOrderModal bind:open={showNew} onsaved={saved} />
{#if deliveryOrder}<DeliveryModal
    bind:open={deliveryOpen}
    order={deliveryOrder}
    ondelivered={delivered}
  />{/if}
{#if toast}<div class="toast"><Check size={15} />{toast}</div>{/if}

<style>
  .archive-context {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin: -6px 0 16px;
    border: 1px solid #f59e0b4d;
    border-radius: 12px;
    background: #f59e0b0d;
    padding: 11px 13px;
  }
  .archive-context > span {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #d99012;
  }
  .archive-context strong {
    font-size: 10px;
  }
  .archive-context small {
    color: var(--muted);
    font-size: 8px;
  }
  .archive-context > a,
  .back-active {
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--purple);
    border-radius: 8px;
    background: var(--theme-soft);
    color: var(--purple);
    font-size: 9px;
    padding: 8px 10px;
  }
  .order-filters {
    margin: 0;
  }
  .list-tools,
  .tool-actions,
  .row-actions {
    display: flex;
    align-items: center;
  }
  .list-tools {
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .tool-actions,
  .row-actions {
    gap: 7px;
  }
  .archive-toggle,
  .back-active {
    height: 36px;
    display: flex;
    align-items: center;
    gap: 7px;
    border-radius: 9px;
    padding: 0 7px 0 10px;
    font-size: 9px;
  }
  .archive-toggle {
    border: 1px solid var(--line);
    background: var(--card);
    color: var(--muted);
  }
  .archive-toggle strong {
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: var(--theme-soft);
    color: var(--purple);
  }
  .filter {
    width: 280px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #2b2f38;
    border-radius: 8px;
    padding: 0 4px 0 11px;
    background: #15181e;
    color: #687386;
  }
  .filter input {
    height: 36px;
    border: 0;
    outline: 0;
    background: transparent;
    color: white;
    width: 100%;
    font-size: 11px;
  }
  .secondary {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .secondary.active {
    border-color: var(--purple);
    color: var(--purple);
  }
  .filter-panel {
    display: flex;
    align-items: end;
    gap: 12px;
    border: 1px solid var(--line);
    background: var(--card);
    border-radius: 12px;
    padding: 13px;
    margin: -3px 0 14px;
  }
  .filter-panel .field {
    min-width: 180px;
  }
  .clear-filters,
  .apply-filters {
    height: 38px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
  }
  .clear-filters {
    border: 0;
    background: transparent;
    color: var(--muted);
  }
  .apply-filters {
    border: 1px solid var(--purple);
    border-radius: 8px;
    background: var(--theme-soft);
    color: var(--purple);
    padding: 0 13px;
  }
  .row-actions {
    justify-content: flex-end;
  }
  .row-actions button,
  .arrow-button {
    width: 30px;
    height: 30px;
    border: 1px solid var(--line);
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: var(--card);
    transition: 0.18s;
  }
  .arrow-button {
    color: var(--purple);
  }
  .arrow-button:hover {
    transform: translate(2px, -2px);
    border-color: var(--purple);
    background: var(--theme-soft);
  }
  .row-actions .archive {
    color: #f59e0b;
  }
  .row-actions .restore {
    color: #38bdf8;
  }
  .row-actions .delete {
    color: #ef4444;
  }
  .row-actions button:hover {
    border-color: currentColor;
    background: var(--theme-soft);
  }
  .archived-row {
    color: var(--muted);
  }
  .archived-row .project-link strong {
    text-decoration: line-through;
  }
  .clear {
    color: #63d38c !important;
  }
  .empty-orders {
    text-align: center;
    color: var(--muted);
    font-size: 10px;
    padding: 32px;
  }
  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    color: var(--muted);
    font-size: 9px;
  }
  .pagination > div {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pagination a {
    height: 32px;
    display: flex;
    align-items: center;
    gap: 5px;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 0 10px;
    color: var(--purple);
    background: var(--card);
  }
  .pagination a.disabled {
    pointer-events: none;
    opacity: 0.4;
  }
  .pagination strong {
    font-size: 9px;
    color: var(--theme-text);
    font-weight: 600;
  }
  .toast {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 9px;
    border: 1px solid #22c55e40;
    background: #17231d;
    color: #8ee3ad;
    padding: 12px 15px;
    border-radius: 9px;
    font-size: 11px;
    box-shadow: 0 15px 50px #0008;
  }
  :global(html[data-theme="light"]) .list-tools {
    margin-bottom: 18px;
  }
  :global(html[data-theme="light"]) .filter {
    border-color: #dbeafe;
    border-radius: 14px;
    background: #fffffff2;
    color: #6366f1;
    box-shadow: 0 8px 24px #3b82f60d;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease;
  }
  :global(html[data-theme="light"]) .filter:focus-within {
    border-color: #6366f1;
    box-shadow:
      0 0 0 4px #6366f118,
      0 12px 28px #6366f114;
  }
  :global(html[data-theme="light"]) .filter input {
    color: #0f172a;
  }
  :global(html[data-theme="light"]) .filter input::placeholder {
    color: #94a3b8;
  }
  :global(html[data-theme="light"]) .clear {
    color: #059669 !important;
  }
  :global(html[data-theme="light"]) .toast {
    border-color: #10b98133;
    background: linear-gradient(135deg, #ecfdf5, #ffffff);
    color: #047857;
    box-shadow: 0 18px 55px #10b98120;
  }
  @media (max-width: 760px) {
    .archive-context {
      align-items: flex-start;
      flex-direction: column;
    }
    .archive-context > span {
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .list-tools {
      gap: 8px;
      align-items: stretch;
      flex-direction: column;
    }
    .tool-actions {
      justify-content: space-between;
    }
    .filter {
      width: auto;
      flex: 1;
    }
    .filter-panel {
      align-items: stretch;
      flex-direction: column;
    }
    .filter-panel .field {
      min-width: 0;
    }
    .pagination {
      align-items: flex-start;
      gap: 10px;
    }
    .pagination > div {
      gap: 5px;
    }
    .pagination strong {
      display: none;
    }
  }
</style>
