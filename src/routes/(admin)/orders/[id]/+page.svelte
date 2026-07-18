<script lang="ts">
  import { onMount, untrack } from "svelte";
  import {
    ArrowLeft,
    Archive,
    Check,
    ChevronRight,
    Edit3,
    ExternalLink,
    FileText,
    Flag,
    FolderKanban,
    HardDrive,
    IndianRupee,
    Plus,
    RotateCcw,
    Star,
    Settings2,
    PackageCheck,
    CircleCheckBig,
  } from "@lucide/svelte";
  import { formatVideoDuration } from "$lib/duration";
  import WhatsAppIcon from "$lib/components/WhatsAppIcon.svelte";
  import BillingModal from "$lib/components/BillingModal.svelte";
  import InvoiceModal from "$lib/components/InvoiceModal.svelte";
  import PaymentModal from "$lib/components/PaymentModal.svelte";
  import DeliveryModal from "$lib/components/DeliveryModal.svelte";
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import TaskModal from "$lib/components/TaskModal.svelte";
  import { formatDate, formatDateTime, money } from "$lib/data";
  import { orderCode } from "$lib/identifiers";
  import type { Editor, Order, Task } from "$lib/types";

  let { data } = $props();
  let order = $state<Order>(untrack(() => data.order));
  let editors = $state<Editor[]>(untrack(() => data.editors));
  let devices = $state<string[]>(untrack(() => data.devices));
  let activities = $state(untrack(() => data.activity));
  let taskModalOpen = $state(false);
  let paymentModalOpen = $state(false);
  let billingModalOpen = $state(false);
  let invoiceModalOpen = $state(false);
  let deliveryModalOpen = $state(false);
  let editingTask = $state<Task | null>(null);
  let error = $state("");
  let busy = $state("");
  let showArchivedTasks = $state(false);

  const activeTasks = $derived(order.tasks.filter((task) => !task.archived));
  const approvedTasks = $derived(
    activeTasks.filter((task) => task.status === "Completed").length,
  );
  const partialInvoiceTasks = $derived(
    activeTasks.filter(
      (task) =>
        task.status === "Completed" &&
        Number(task.billableAmount || 0) - Number(task.invoicedAmount || 0) >
          0.009,
    ),
  );
  const partialInvoiceAmount = $derived(
    partialInvoiceTasks.reduce(
      (sum, task) =>
        sum +
        Number(task.billableAmount || 0) -
        Number(task.invoicedAmount || 0),
      0,
    ),
  );
  const archivedTasks = $derived(order.tasks.filter((task) => task.archived));
  const visibleTasks = $derived(
    showArchivedTasks ? archivedTasks : activeTasks,
  );
  const assignedEditors = $derived(
    editors.filter((editor) =>
      activeTasks.some((task) => task.editorId === editor.id),
    ),
  );
  const finalTotal = $derived(Math.max(0, order.price - order.discount));
  const balance = $derived(Math.max(0, finalTotal - order.paid));
  const discountPercent = $derived(
    order.price > 0 ? (order.discount / order.price) * 100 : 0,
  );
  const deliveryBlocked = $derived(order.priceSet === false || balance > 0.009);
  const paidPercent = $derived(
    finalTotal > 0
      ? Math.min(100, Math.round((order.paid / finalTotal) * 100))
      : 0,
  );
  const customerRecord = $derived(
    data.customers.find(
      (customer: { id: string }) => customer.id === order.customerId,
    ),
  );
  const customerOrders = $derived(
    (data.customerOrders as Order[]).filter((item) => !item.archived),
  );
  const reserveWhatsAppTab = () => {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    return tab;
  };
  const openWhatsAppTab = (tab: Window | null, url: string) => {
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  };

  async function refresh() {
    const response = await fetch(`/api/orders/${order.id}`);
    if (!response.ok) return;
    const result = await response.json();
    order = result.order;
    activities = result.activity ?? activities;
  }

  async function toggleImportant() {
    busy = "important";
    error = "";
    const response = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ important: !order.important }),
    });
    const result = await response.json();
    busy = "";
    if (!response.ok) {
      error = result.error || "Unable to update priority.";
      return;
    }
    order = result.order;
  }

  function openTask(task: Task | null = null) {
    editingTask = task;
    taskModalOpen = true;
  }

  async function updateTask(
    task: Task,
    status: Task["status"],
    progress = task.progress,
  ) {
    error = "";
    busy = task.id;
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, progress }),
    });
    const result = await response.json();
    busy = "";
    if (!response.ok) {
      error = result.error || "Unable to update task.";
      return;
    }
    await refresh();
  }

  async function archiveTask(task: Task) {
    if (
      !confirm(`Archive “${task.name}”? It will remain in Sheets and exports.`)
    )
      return;
    busy = task.id;
    const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    busy = "";
    if (!response.ok) {
      error = "Unable to archive task.";
      return;
    }
    await refresh();
  }

  async function restoreTask(task: Task) {
    busy = task.id;
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    busy = "";
    if (!response.ok) {
      error = "Unable to restore task.";
      return;
    }
    await refresh();
  }

  async function openEditorWhatsApp(editor: Editor) {
    const whatsappTab = reserveWhatsAppTab();
    error = "";
    busy = editor.id;
    try {
      const response = await fetch(`/api/editors/${editor.id}/whatsapp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        whatsappTab?.close();
        error = result.error || "Unable to prepare WhatsApp message.";
        return;
      }
      openWhatsAppTab(whatsappTab, result.url);
    } catch {
      whatsappTab?.close();
      error = "Unable to prepare WhatsApp message.";
    } finally {
      busy = "";
    }
  }

  function openBill() {
    error = "";
    invoiceModalOpen = true;
  }

  async function invoiceCompletedWork() {
    error = "";
    busy = "partial-invoice";
    try {
      const response = await fetch(`/api/orders/${order.id}/invoice`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "partial",
          taskIds: partialInvoiceTasks.map((task) => task.id),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        error = result.error || "Unable to invoice completed work.";
        return;
      }
      location.href = result.invoiceUrl;
    } catch {
      error = "Unable to invoice completed work.";
    } finally {
      busy = "";
    }
  }

  async function notifyCustomerReady() {
    const whatsappTab = reserveWhatsAppTab();
    error = "";
    busy = "customer-whatsapp";
    try {
      const response = await fetch(
        `/api/orders/${order.id}/customer-whatsapp`,
        { method: "POST" },
      );
      const result = await response.json();
      if (!response.ok) {
        whatsappTab?.close();
        error = result.error || "Unable to prepare the customer message.";
        return;
      }
      openWhatsAppTab(whatsappTab, result.url);
      await refresh();
    } catch {
      whatsappTab?.close();
      error = "Unable to prepare the customer message.";
    } finally {
      busy = "";
    }
  }

  async function setOrderStatus(status: Order["status"]) {
    busy = "status";
    error = "";
    const response = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status,
        progress: status === "Delivered" ? 100 : order.progress,
      }),
    });
    const result = await response.json();
    busy = "";
    if (!response.ok) {
      error = result.error || "Unable to update status.";
      return;
    }
    order = result.order;
  }

  async function archiveCurrentOrder() {
    if (
      !confirm(
        `Archive “${order.project}”? You can restore it from the archived orders box.`,
      )
    )
      return;
    busy = "archive";
    const response = await fetch(`/api/orders/${order.id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    busy = "";
    if (!response.ok) {
      error = result.error || "Unable to archive order.";
      return;
    }
    location.href = "/orders";
  }

  async function createPaymentInvoice(
    paymentId: string,
    kind: "advance" | "payment",
  ) {
    busy = paymentId;
    error = "";
    const response = await fetch(`/api/orders/${order.id}/invoice`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, paymentId }),
    });
    const result = await response.json();
    busy = "";
    if (!response.ok) {
      error = result.error || "Unable to generate receipt.";
      return;
    }
    location.href = result.invoiceUrl;
  }
  onMount(() => {
    const params = new URL(location.href).searchParams;
    const taskId = params.get("task");
    const task = order.tasks.find((item) => item.id === taskId);
    if (task) {
      showArchivedTasks = Boolean(task.archived);
      openTask(task);
    }
    if (params.get("invoice") === "1" && !order.archived) openBill();
  });
</script>

<svelte:head
  ><title>{order.customer} · {order.project} — StudioFlow</title></svelte:head
>

<div class="detail-top">
  <a href="/orders" class="back"><ArrowLeft size={16} /> Orders</a>
  <div class="actions">
    {#if !order.archived}<button
        class="secondary"
        onclick={() => (billingModalOpen = true)}
        ><Settings2 size={14} /> Set order total</button
      ><button class="secondary" onclick={() => (paymentModalOpen = true)}
        ><IndianRupee size={14} /> Record customer payment</button
      >
      <button class="primary" disabled={busy === "invoice"} onclick={openBill}
        ><FileText size={15} />
        {busy === "invoice"
          ? "Creating final invoice…"
          : "Create final invoice"}</button
      ><button
        class="archive-order"
        disabled={busy === "archive"}
        onclick={archiveCurrentOrder}
        ><Archive size={14} /> Archive this order</button
      >{/if}
  </div>
</div>

<header class="order-heading">
  <div class="project-icon">{orderCode(data.settings, order.serial)}</div>
  <div>
    <div class="title-line">
      <button
        aria-label={order.important
          ? "Remove important mark"
          : "Mark order important"}
        title={order.important
          ? "Remove important mark"
          : "Mark order important"}
        disabled={busy === "important"}
        onclick={toggleImportant}
        style={`border:0;background:transparent;padding:2px;display:grid;place-items:center;color:${order.important ? "#ef4444" : "var(--muted)"}`}
        ><Star
          size={19}
          fill={order.important ? "currentColor" : "none"}
        /></button
      >{#if customerRecord}<a
          class="studio-title"
          href={`/customers?customer=${customerRecord.id}`}>{order.customer}</a
        >{:else}<h1>{order.customer || "Customer studio"}</h1>{/if}<StatusBadge
        status={order.status}
      />{#if order.important}<span class="priority-label">Important</span>{/if}
    </div>
    <div class="customer-heading">
      <strong>{order.project || "Untitled order"}</strong><span
        >Order {orderCode(data.settings, order.serial)} · {order.workType || "Event not set"}</span
      >
    </div>
  </div>
</header>

<div class="sticky-order-context" aria-label="Current order summary">
  <span class="sticky-order-number">{orderCode(data.settings, order.serial)}</span>
  <span class="sticky-order-name"
    ><strong>{order.customer || "Customer studio"}</strong><small
      >{order.project || "Untitled order"} · {order.workType ||
        "Event not set"}</small
    ></span
  >
  <StatusBadge status={order.status} />
  {#if order.due}<span class="sticky-detail"
      ><small>Due</small><strong>{formatDate(order.due)}</strong></span
    >{/if}
  <span class="sticky-detail"
    ><small>Balance</small><strong
      >{order.priceSet === false ? "Not set" : money(balance)}</strong
    ></span
  >
</div>

{#if error}<div class="error">{error}</div>{/if}

{#if order.status === "Waiting Review"}
  <section class="workflow-card review-workflow">
    <span class="workflow-icon"><RotateCcw size={19} /></span>
    <div>
      <small>Next action · Review</small>
      <h2>Review editor output</h2>
      <p>
        Open each submitted output below. Approve it or request a revision. When
        every task is approved, the order automatically moves to Ready for
        Delivery.
      </p>
    </div>
    <strong>{approvedTasks}/{activeTasks.length} approved</strong>
  </section>
{:else if order.status === "Ready Delivery"}
  <section class="workflow-card ready-workflow">
    <span class="workflow-icon"><PackageCheck size={19} /></span>
    <div>
      <small>Next action · Customer delivery</small>
      <h2>
        {deliveryBlocked
          ? "Notify customer and collect the balance"
          : "Payment complete — ready to deliver"}
      </h2>
      <p>
        {order.priceSet === false
          ? "Set the final total, then send the customer their private status and bill link."
          : balance > 0
            ? `Send the ready message with the ${money(balance)} balance. Record the payment before delivery.`
            : "Send the ready message, hand over the files, then confirm how the work was delivered."}
      </p>
    </div>
    <div class="workflow-actions">
      <button
        class="notify-customer"
        disabled={busy === "customer-whatsapp" || !order.mobile}
        onclick={notifyCustomerReady}
        ><WhatsAppIcon size={15} />{busy === "customer-whatsapp"
          ? "Preparing…"
          : "WhatsApp customer"}</button
      >{#if order.priceSet === false}<button
          class="primary"
          onclick={() => (billingModalOpen = true)}>Set final total</button
        >{:else if balance > 0}<button
          class="primary"
          onclick={() => (paymentModalOpen = true)}>Add balance payment</button
        >{:else}<button
          class="deliver-order"
          onclick={() => (deliveryModalOpen = true)}
          ><CircleCheckBig size={15} /> Confirm delivery</button
        >{/if}
    </div>
  </section>
{:else if order.status === "Delivered"}
  <section class="workflow-card delivered-workflow">
    <span class="workflow-icon"><CircleCheckBig size={19} /></span>
    <div>
      <small>Workflow complete</small>
      <h2>Delivered to customer</h2>
      <p>Payment is complete and this order is listed on the Delivered page.</p>
    </div>
    <a href="/orders?status=Delivered">View delivered orders</a>
  </section>
{/if}

<div class="detail-grid">
  <div class="main-col">
    <section class="card">
      <div class="section-head">
        <div>
          <h2>Assigned tasks</h2>
          <p>
            {approvedTasks} completed · {Math.max(
              0,
              activeTasks.length - approvedTasks,
            )} remaining
          </p>
        </div>
        <div class="section-actions">
          {#if archivedTasks.length}<button
              class:active={showArchivedTasks}
              class="secondary"
              onclick={() => (showArchivedTasks = !showArchivedTasks)}
              >{showArchivedTasks
                ? "Active tasks"
                : `Archived (${archivedTasks.length})`}</button
            >{/if}{#if !showArchivedTasks && approvedTasks > 0}<button
              class="partial-invoice"
              disabled={busy === "partial-invoice"}
              onclick={() =>
                partialInvoiceTasks.length
                  ? invoiceCompletedWork()
                  : openTask(
                      activeTasks.find((task) => task.status === "Completed") ||
                        null,
                    )}
              ><FileText size={13} />{partialInvoiceTasks.length
                ? busy === "partial-invoice"
                  ? "Generating…"
                  : `Invoice completed · ${money(partialInvoiceAmount)}`
                : "Set completed work value"}</button
            >{/if}{#if !showArchivedTasks}<button
              class="secondary"
              onclick={() => openTask()}><Plus size={13} /> Assign work</button
            >{/if}
        </div>
      </div>
      {#if visibleTasks.length}
        <div class="task-list">
          {#each visibleTasks as task}
            <article class:archived-task={task.archived} class="task-row">
              <div class="task-title">
                <strong>{task.name}</strong><small
                  >{#if task.editorId}<a
                      class="editor-link"
                      href={`/editors?editor=${task.editorId}`}
                      >{task.assignee}</a
                    >{:else}{task.assignee}{/if}
                  {task.due ? `· Due ${formatDate(task.due)}` : ""}</small
                >
                <div class="task-meta">
                  {#if task.device}<span
                      ><HardDrive size={11} /> {task.device}</span
                    >{/if}{#if task.billingMode === "duration"}<span
                      >{formatVideoDuration(task.videoDurationMinutes) ||
                        "Duration pending"} · {money(
                        task.hourlyRate || 0,
                      )}/hr</span
                    >{/if}{#if task.editorSettlement && task.editorSettlement !== "not-set"}<span
                      ><Flag size={10} />{task.editorSettlement ===
                      "editor-bills-admin"
                        ? "Editor bills admin"
                        : "Admin issues statement"}</span
                    >{/if}
                </div>
                {#if (task.billableAmount || 0) > 0}<small class="task-billing"
                    >Billing amount {money(
                      task.billableAmount || 0,
                    )}{#if (task.invoicedAmount || 0) > 0}
                      · Invoiced {money(task.invoicedAmount || 0)}{/if}</small
                  >{/if}
              </div>
              <StatusBadge status={task.status} />
              <div class="task-progress">
                <div class="progress">
                  <span style:width={`${task.progress}%`}></span>
                </div>
                <small>{task.progress}%</small>
              </div>
              <div class="task-actions">
                {#if task.archived}<button
                    class="task-restore"
                    title="Restore task"
                    disabled={busy === task.id}
                    onclick={() => restoreTask(task)}
                    ><RotateCcw size={14} /></button
                  >{:else}
                  <button
                    class="task-edit"
                    title="Edit task"
                    onclick={() => openTask(task)}><Edit3 size={14} /></button
                  >
                  {#if task.status === "Ready for review"}
                    <button
                      class="approve"
                      title="Approve"
                      disabled={busy === task.id}
                      onclick={() => updateTask(task, "Completed", 100)}
                      ><Check size={14} /></button
                    >
                    <button
                      class="revision"
                      title="Request revision"
                      disabled={busy === task.id}
                      onclick={() => updateTask(task, "Revision required")}
                      ><RotateCcw size={14} /></button
                    >
                  {/if}
                  <button
                    class="task-archive"
                    title="Archive task"
                    disabled={busy === task.id}
                    onclick={() => archiveTask(task)}
                    ><Archive size={14} /></button
                  >
                {/if}
              </div>
              {#if task.instructions}<p class="instructions">
                  {task.instructions}
                </p>{/if}
              {#if task.outputLink}<a
                  class="output"
                  href={task.outputLink}
                  target="_blank"
                  rel="noreferrer"
                  >Open editor output <ExternalLink size={12} /></a
                >{/if}
            </article>
          {/each}
        </div>
      {:else if !showArchivedTasks}
        <div class="empty">
          <p>No work assigned yet.</p>
          <button class="primary" onclick={() => openTask()}
            ><Plus size={13} /> Create first task</button
          >
        </div>
      {:else}<div class="empty"><p>No archived tasks.</p></div>
      {/if}
    </section>

    <section class="card activity-card">
      <div class="section-head">
        <div>
          <h2>Activity</h2>
          <p>Order changes and billing history</p>
        </div>
      </div>
      {#if activities.length}
        <div class="activity-list">
          {#each activities as item}<div>
              <strong>{item.action}</strong><span>{item.details}</span><small
                >{formatDateTime(item.createdAt)}</small
              >
            </div>{/each}
        </div>
      {:else}<div class="empty"><p>No activity recorded yet.</p></div>{/if}
    </section>
  </div>

  <div class="side-col">
    <section class="card customer-orders-card">
      <div class="customer-card-head">
        <span><FolderKanban size={16} /></span>
        <div>
          <small>Customer / studio</small>{#if customerRecord}<a
              href={`/customers?customer=${customerRecord.id}`}
              >{order.customer}</a
            >{:else}<strong>{order.customer}</strong>{/if}
          <p>
            {customerOrders.length}
            {customerOrders.length === 1 ? "order" : "orders"} in this account
          </p>
        </div>
      </div>
      {#if customerOrders.length}<div class="customer-order-list">
          {#each customerOrders as customerOrder}<a
              class:current={customerOrder.id === order.id}
              href={`/orders/${customerOrder.id}`}
              ><span
                ><strong>{customerOrder.project}</strong><small
                  >{orderCode(data.settings, customerOrder.serial)} · {customerOrder.workType}</small
                ></span
              ><span class="order-state"
                >{customerOrder.id === order.id
                  ? "Current"
                  : customerOrder.status}</span
              ><ChevronRight size={14} /></a
            >{/each}
        </div>{:else}<p class="muted">
          No other orders are linked to this customer.
        </p>{/if}
    </section>

    <section class="card info-card">
      <h2>Order details</h2>
      <div class="status-control">
        <label for="order-status">Order status</label
        >{#if order.status === "Delivered"}<div class="delivered-state">
            <CircleCheckBig size={15} /> Delivered {order.deliveredAt
              ? formatDate(order.deliveredAt)
              : ""}
          </div>{:else}<select
            id="order-status"
            value={order.status}
            disabled={busy === "status" || order.archived}
            onchange={(event) =>
              setOrderStatus(
                (event.currentTarget as HTMLSelectElement)
                  .value as Order["status"],
              )}
            >{#each ["Historical", "Received", "Assigned", "Editing", "Waiting Review", "Revision", "Ready Delivery", "Stopped", "Completed"] as status}<option
                value={status}>{status}</option
              >{/each}</select
          ><small
            >Use the guided delivery confirmation to mark work Delivered.</small
          >{/if}
      </div>
      <dl>
        <div>
          <dt>Customer</dt>
          <dd>{order.customer}</dd>
        </div>
        <div>
          <dt>Mobile</dt>
          <dd>{order.mobile || "Not added"}</dd>
        </div>
        <div>
          <dt>Received</dt>
          <dd>{order.receiving || "—"}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{order.duration || "—"}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{order.source || "—"}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{order.due ? formatDate(order.due) : "Not set"}</dd>
        </div>
      </dl>
      {#if order.remarks}<p class="remarks">{order.remarks}</p>{/if}
    </section>

    <section class="card people-card">
      <h2>Assigned editors</h2>
      {#if assignedEditors.length}
        {#each assignedEditors as editor}
          <div class="person">
            <span>{editor.initials}</span>
            <div>
              <a
                class="editor-profile-link"
                href={`/editors?editor=${editor.id}`}
                ><strong>{editor.name}</strong></a
              ><small
                >{activeTasks.filter((task) => task.editorId === editor.id)
                  .length} task(s) · View profile</small
              >
            </div>
            <button
              class="whatsapp-icon"
              disabled={busy === editor.id}
              onclick={() => openEditorWhatsApp(editor)}
              title="Open WhatsApp"><WhatsAppIcon size={15} /></button
            >
          </div>
        {/each}
      {:else}<p class="muted">Assign a task to add an editor.</p>{/if}
      <button class="add-person" onclick={() => openTask()}
        ><Plus size={13} /> Assign editor or task</button
      >
    </section>

    <section class="card invoice-card">
      <div class="invoice-title">
        <span><FileText size={15} /></span>
        <div>
          <h2>Billing</h2>
          <small>Advance and payment ledger</small>
        </div>
      </div>
      <div class="amount">
        <small>Total after discount</small><strong
          >{order.priceSet === false ? "Not set" : money(finalTotal)}</strong
        >
      </div>
      {#if order.priceSet !== false && order.discount > 0}<div
          class="discount-line"
        >
          <span>Subtotal {money(order.price)}</span><strong
            >Discount {discountPercent.toFixed(discountPercent % 1 ? 2 : 0)}% ·
            −{money(order.discount)}</strong
          >
        </div>{/if}
      <div class="payment-bar">
        <span style:width={`${paidPercent}%`}></span>
      </div>
      <div class="paid-row">
        <span
          >Collected {order.advanceSet === false &&
          !(order.payments || []).length
            ? "Not recorded"
            : money(order.paid)}</span
        ><span
          >Balance {order.priceSet === false ? "Not set" : money(balance)}</span
        >
      </div>
      {#if (order.initialAdvance || 0) > 0 || (order.payments || []).length}<div
          class="payment-list"
        >
          {#if (order.initialAdvance || 0) > 0}<div
              class="payment-entry legacy"
            >
              <span
                ><strong>Opening advance</strong><small
                  >Legacy advance record</small
                ></span
              ><b>{money(order.initialAdvance || 0)}</b>
            </div>{/if}
          {#each order.payments || [] as payment}<div class="payment-entry">
              <span
                ><strong
                  >{payment.kind === "advance"
                    ? "Advance collected"
                    : "Payment received"}</strong
                ><small
                  >{formatDate(payment.paidAt)} · {payment.method}{payment.note
                    ? ` · ${payment.note}`
                    : ""}</small
                ></span
              ><b>{money(payment.amount)}</b><button
                title="Generate receipt"
                disabled={busy === payment.id}
                onclick={() => createPaymentInvoice(payment.id, payment.kind)}
                ><FileText size={12} /></button
              >
            </div>{/each}
        </div>{/if}
      <div class="billing-buttons">
        <button class="invoice-button" onclick={() => (billingModalOpen = true)}
          ><Settings2 size={13} />
          {order.priceSet === false
            ? "Set order total"
            : "Edit order total"}</button
        ><button
          class="invoice-button"
          onclick={() => (paymentModalOpen = true)}
          ><IndianRupee size={13} /> Record payment</button
        >
      </div>
    </section>
  </div>
</div>

<TaskModal
  bind:open={taskModalOpen}
  orderId={order.id}
  bind:editors
  bind:devices
  task={editingTask}
  onsaved={refresh}
/>
<PaymentModal
  bind:open={paymentModalOpen}
  orderId={order.id}
  {balance}
  orderStatus={order.status}
  onsaved={refresh}
/>
<BillingModal
  bind:open={billingModalOpen}
  {order}
  onsaved={(savedOrder) => (order = savedOrder)}
/>
<InvoiceModal bind:open={invoiceModalOpen} {order} />
<DeliveryModal
  bind:open={deliveryModalOpen}
  {order}
  ondelivered={(savedOrder) => {
    order = savedOrder;
    refresh();
  }}
/>

<style>
  :global(html) {
    --border: var(--line);
    --surface-2: var(--theme-soft);
    --accent: var(--purple);
  }
  .detail-top,
  .actions,
  .title-line,
  .section-head,
  .section-actions,
  .person,
  .invoice-title,
  .amount,
  .paid-row {
    display: flex;
    align-items: center;
  }
  .detail-top,
  .section-head,
  .amount,
  .paid-row {
    justify-content: space-between;
  }
  .detail-top {
    margin-bottom: 28px;
  }
  .actions,
  .section-actions {
    gap: 8px;
    flex-wrap: wrap;
  }
  .actions button,
  .section-head button,
  .invoice-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }
  .partial-invoice {
    border: 1px solid #16a34a55;
    background: #16a34a12;
    color: #16a34a;
    border-radius: 8px;
    padding: 8px 10px;
  }
  .archive-order {
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #f59e0b55;
    border-radius: 8px;
    background: #f59e0b10;
    color: #f59e0b;
    padding: 8px 10px;
  }
  .section-actions .active {
    border-color: var(--purple);
    color: var(--purple);
  }
  .back {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--muted);
    font-size: 12px;
  }
  .order-heading {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
  }
  .project-icon {
    min-width: 48px;
    height: 44px;
    padding: 0 10px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--accent);
    display: grid;
    place-items: center;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
  }
  .title-line {
    gap: 10px;
  }
  .title-line h1 {
    font-size: 24px;
    margin: 0;
  }
  .customer-heading {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 7px;
  }
  .studio-title,
  .customer-heading strong {
    color: var(--theme-text);
    font-size: 16px;
    font-weight: 750;
  }
  .customer-heading span {
    color: var(--muted);
    font-size: 10px;
  }
  .error {
    border: 1px solid #ef444455;
    background: #ef444414;
    color: #ef7777;
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 11px;
    margin-bottom: 16px;
  }
  .detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 330px;
    gap: 16px;
  }
  .main-col,
  .side-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .section-head {
    padding: 17px 18px;
    border-bottom: 1px solid var(--border);
  }
  h2 {
    font-size: 12px;
    margin: 0;
  }
  .section-head p {
    font-size: 10px;
    color: var(--muted);
    margin: 4px 0 0;
  }
  .task-row {
    display: grid;
    grid-template-columns: minmax(180px, 1fr) auto 120px auto;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--border);
  }
  .task-row:last-child {
    border-bottom: 0;
  }
  .archived-task {
    color: var(--muted);
    text-decoration: line-through;
    background: color-mix(in srgb, var(--card) 80%, var(--muted) 4%);
  }
  .archived-task .task-actions {
    text-decoration: none;
  }
  .task-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .task-title strong {
    font-size: 11px;
  }
  .task-title small,
  .task-progress small {
    font-size: 9px;
    color: var(--muted);
  }
  .task-title .task-billing {
    color: #16a34a;
  }
  .task-meta {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .task-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border-radius: 99px;
    background: var(--surface-2);
    color: var(--muted);
    font-size: 8px;
  }
  .task-progress {
    display: grid;
    grid-template-columns: 1fr 26px;
    gap: 7px;
    align-items: center;
  }
  .task-actions {
    display: flex;
    gap: 4px;
  }
  .task-actions button,
  .person button {
    border: 1px solid color-mix(in srgb, var(--accent) 38%, var(--border));
    background: color-mix(in srgb, var(--accent) 11%, var(--surface-2));
    color: var(--accent);
    border-radius: 7px;
    padding: 6px;
    display: grid;
    place-items: center;
    transition:
      border-color 0.18s ease,
      background 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.15s ease;
  }
  .task-actions button:not(:disabled):hover,
  .person button:not(:disabled):hover {
    border-color: color-mix(in srgb, var(--accent) 78%, #fff);
    background: color-mix(in srgb, var(--accent) 20%, var(--surface-2));
    box-shadow: 0 7px 18px color-mix(in srgb, var(--accent) 15%, transparent);
    transform: translateY(-1px);
  }
  .task-actions button:disabled,
  .person button:disabled {
    cursor: not-allowed;
    opacity: 0.46;
  }
  .task-actions .approve {
    color: #36c778;
    border-color: #36c77855;
    background: #36c77814;
  }
  .task-actions .revision {
    color: #f0a14a;
    border-color: #f0a14a55;
    background: #f0a14a14;
  }
  .task-actions .task-archive {
    color: #fb7185;
    border-color: #fb71854f;
    background: #fb718512;
  }
  .task-actions .task-restore {
    color: #38bdf8;
    border-color: #38bdf84f;
    background: #38bdf812;
  }
  .instructions,
  .output {
    grid-column: 1/-1;
    margin: 0;
    font-size: 10px;
  }
  .instructions {
    color: var(--muted);
    line-height: 1.6;
  }
  .output {
    color: var(--accent);
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .empty {
    padding: 28px;
    text-align: center;
    color: var(--muted);
    font-size: 11px;
  }
  .activity-list {
    padding: 4px 18px 12px;
  }
  .activity-list > div {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 3px 12px;
    padding: 11px 0;
    border-bottom: 1px solid var(--border);
  }
  .activity-list > div:last-child {
    border: 0;
  }
  .activity-list strong {
    font-size: 10px;
  }
  .activity-list span,
  .activity-list small {
    font-size: 9px;
    color: var(--muted);
  }
  .activity-list small {
    grid-row: 1;
    grid-column: 2;
  }
  .info-card,
  .people-card,
  .invoice-card {
    padding: 18px;
  }
  .info-card h2,
  .people-card h2 {
    margin-bottom: 14px;
  }
  .status-control {
    display: grid;
    gap: 6px;
    margin-bottom: 10px;
  }
  .status-control label {
    font-size: 9px;
    color: var(--muted);
  }
  .info-card dl {
    margin: 0;
  }
  .info-card dl div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 0;
    border-bottom: 1px solid var(--border);
    font-size: 10px;
  }
  .info-card dt {
    color: var(--muted);
  }
  .info-card dd {
    margin: 0;
    text-align: right;
  }
  .remarks,
  .muted {
    font-size: 10px;
    color: var(--muted);
    line-height: 1.6;
  }
  .remarks {
    padding-top: 12px;
  }
  .person {
    gap: 9px;
    margin: 11px 0;
  }
  .person > span,
  .invoice-title > span {
    width: 31px;
    height: 31px;
    border-radius: 9px;
    background: var(--surface-2);
    color: var(--accent);
    display: grid;
    place-items: center;
    font-size: 9px;
    font-weight: 700;
  }
  .person > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
  }
  .person strong {
    font-size: 10px;
  }
  .person small,
  .invoice-title small {
    font-size: 9px;
    color: var(--muted);
  }
  .add-person {
    border: 0;
    background: transparent;
    color: var(--accent);
    font-size: 10px;
    display: flex;
    gap: 6px;
    padding: 8px 0 0;
  }
  .invoice-title {
    gap: 9px;
  }
  .invoice-title > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .amount {
    margin: 20px 0 10px;
  }
  .amount small {
    color: var(--muted);
    font-size: 10px;
  }
  .amount strong {
    font-size: 18px;
  }
  .discount-line {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin: -5px 0 10px;
    color: var(--muted);
    font-size: 8px;
  }
  .discount-line strong {
    color: #16a34a;
  }
  .payment-bar {
    height: 5px;
    background: var(--surface-2);
    border-radius: 5px;
    overflow: hidden;
  }
  .payment-bar span {
    height: 100%;
    display: block;
    background: #22c55e;
  }
  .paid-row {
    color: var(--muted);
    font-size: 8px;
    margin-top: 7px;
  }
  .payment-entry {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 8px;
    padding: 9px 0;
    border-bottom: 1px solid var(--line);
  }
  .payment-entry > span {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .payment-entry strong,
  .payment-entry b {
    font-size: 9px;
  }
  .payment-entry small {
    color: var(--muted);
    font-size: 7px;
    line-height: 1.4;
  }
  .payment-entry button {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--theme-soft);
    color: var(--purple);
  }
  .payment-entry.legacy {
    grid-template-columns: 1fr auto;
  }
  .billing-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
  }
  .invoice-button {
    width: 100%;
    justify-content: center;
    margin-top: 14px;
    border: 1px solid color-mix(in srgb, var(--accent) 38%, var(--border));
    background: color-mix(in srgb, var(--accent) 10%, var(--surface-2));
    color: var(--accent);
    border-radius: 8px;
    padding: 9px;
    font-size: 9px;
    transition:
      border-color 0.18s ease,
      background 0.18s ease,
      transform 0.15s ease;
  }
  .invoice-button:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 18%, var(--surface-2));
    transform: translateY(-1px);
  }
  .delivered-state {
    display: flex;
    align-items: center;
    gap: 7px;
    border: 1px solid #22c55e3d;
    background: #22c55e0d;
    color: #16a34a;
    border-radius: 9px;
    padding: 10px;
    font-size: 10px;
  }
  .status-control select {
    color-scheme: dark;
    background: var(--surface-2);
    color: var(--theme-text);
    border-color: var(--border);
    font-weight: 650;
  }
  .status-control select option {
    background: var(--card);
    color: var(--theme-text);
  }
  :global(html[data-theme="light"]) .status-control select {
    color-scheme: light;
  }
  .status-control small {
    color: var(--muted);
    font-size: 9px;
    line-height: 1.5;
  }
  .activity-list {
    max-height: 420px;
    overflow-y: auto;
    overscroll-behavior: auto;
    scrollbar-gutter: stable;
  }
  .customer-orders-card {
    padding: 18px;
  }
  .customer-card-head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .customer-card-head > span {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: var(--surface-2);
    color: var(--accent);
  }
  .customer-card-head > div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 3px;
  }
  .customer-card-head small {
    color: var(--muted);
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .customer-card-head a,
  .customer-card-head strong {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--theme-text);
    font-size: 17px;
    font-weight: 760;
    white-space: nowrap;
  }
  .customer-card-head p {
    margin: 0;
    color: var(--muted);
    font-size: 9px;
  }
  .customer-order-list {
    display: grid;
    gap: 5px;
    margin-top: 14px;
  }
  .customer-order-list > a {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 8px;
    padding: 9px;
    border: 1px solid var(--line);
    border-radius: 9px;
    color: inherit;
  }
  .customer-order-list > a:hover,
  .customer-order-list > a.current {
    border-color: color-mix(in srgb, var(--accent) 48%, var(--line));
    background: var(--surface-2);
  }
  .customer-order-list a > span:first-child {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 3px;
  }
  .customer-order-list strong {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 9px;
    white-space: nowrap;
  }
  .customer-order-list small,
  .order-state {
    color: var(--muted);
    font-size: 7.5px;
  }
  .customer-order-list a.current .order-state {
    color: var(--accent);
    font-weight: 700;
  }
  .studio-title {
    color: var(--theme-text);
    font-size: 24px;
    font-weight: 750;
    line-height: 1.15;
  }
  @media (max-width: 1050px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }
    .side-col {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      align-items: start;
    }
    .customer-orders-card {
      grid-column: 1/-1;
    }
  }
  @media (max-width: 760px) {
    .detail-top {
      align-items: flex-start;
      flex-direction: column;
      gap: 14px;
    }
    .actions {
      width: 100%;
      display: grid;
      grid-auto-rows: 1fr;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .actions button {
      width: 100%;
      height: 100%;
      min-height: 70px;
      padding: 10px;
      white-space: normal;
    }
    .task-row {
      grid-template-columns: 1fr auto;
    }
    .task-progress {
      grid-column: 1;
    }
    .task-actions {
      grid-column: 2;
      grid-row: 1/3;
    }
    .side-col {
      grid-template-columns: 1fr;
    }
    .customer-orders-card {
      grid-column: auto;
    }
    .customer-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 2px;
    }
    .activity-list {
      max-height: 360px;
    }
  }
  .sticky-order-context {
    position: sticky;
    top: 72px;
    z-index: 16;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 16px;
    padding: 9px 12px;
    border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
    border-radius: 13px;
    background: color-mix(in srgb, var(--card) 91%, transparent);
    box-shadow: 0 12px 35px #00000016;
    backdrop-filter: blur(16px);
  }
  .sticky-order-number {
    min-width: 34px;
    height: 32px;
    padding: 0 7px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: var(--surface-2);
    color: var(--accent);
    font-size: 9px;
    font-weight: 800;
  }
  .sticky-order-name {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
  }
  .sticky-order-name strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
  }
  .sticky-order-name small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--muted);
    font-size: 8px;
  }
  .sticky-detail {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-left: 11px;
    border-left: 1px solid var(--border);
  }
  .sticky-detail small {
    color: var(--muted);
    font-size: 7px;
    text-transform: uppercase;
  }
  .sticky-detail strong {
    font-size: 9px;
    white-space: nowrap;
  }
  @media (max-width: 600px) {
    .sticky-order-context {
      top: 70px;
      margin-left: -8px;
      margin-right: -8px;
      padding: 8px;
      gap: 7px;
    }
    .sticky-order-context > :global(.status-badge) {
      display: none;
    }
    .sticky-order-name small {
      max-width: 42vw;
    }
    .sticky-detail:first-of-type {
      display: none;
    }
    .sticky-detail {
      padding-left: 7px;
    }
  }
</style>
