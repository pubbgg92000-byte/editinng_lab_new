<!-- Customer directory: search, details, new order, portal link, WhatsApp, invoices, archive/restore. -->
<script lang="ts">
      import LinkReadyDialog from '$lib/components/LinkReadyDialog.svelte';
import { allowed } from '$lib/stores/permissions';
import { confirmDanger } from "$lib/stores/confirm";
  import { safeFetch } from "$lib/http";
  import { onMount, untrack } from "svelte";
  import { invalidateAll, afterNavigate } from "$app/navigation";
  import {
    Search, Edit3, Copy, RefreshCw, Archive, RotateCcw, ExternalLink, Mail, MapPin, ReceiptIndianRupee,
    FileText, Plus, MoreHorizontal, ArrowLeft, Phone, ChevronRight,
  } from "@lucide/svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import DirectWhatsAppModal from "$lib/components/DirectWhatsAppModal.svelte";
  import NewCustomerModal from "$lib/components/NewCustomerModal.svelte";
  import NewOrderModal from "$lib/components/NewOrderModal.svelte";
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import WhatsAppIcon from "$lib/components/WhatsAppIcon.svelte";
  import CustomFieldValues from "$lib/components/CustomFieldValues.svelte";
  import { formatDateTime, money } from "$lib/data";
  import { orderCode } from "$lib/identifiers";
  import { customerStore } from "$lib/stores/app";
  import { notifyAction } from "$lib/stores/actionFeedback";
  import type { Customer, Invoice, Order } from "$lib/types";
  import { hasCapability, labelFor } from "$lib/capabilities";

  let { data } = $props();
  const profile = $derived(data.configuration?.profile);
  const customerLabel = $derived(labelFor(profile, "customer"));
  const customerPlural = $derived(labelFor(profile, "customer", true));
  const orderLabel = $derived(labelFor(profile, "order"));
  const orderPlural = $derived(labelFor(profile, "order", true));
  const portalEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, "portal.customer"));
  const whatsappEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, "communications.whatsapp"));
  const invoicesEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, "billing.invoices"));
  const paymentsEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, "billing.payments"));
  const customFieldsEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, "customFields"));

  let query = $state("");
  let showNewCustomer = $state(false);
  let editingCustomer = $state<Customer | null>(null);
  let customers = $state<Customer[]>(untrack(() => data.customers));
  let orders = $state<Order[]>(untrack(() => data.orders));
  let showArchived = $state(false);
  let detailsOpen = $state(false);
  let selectedCustomer = $state<Customer | null>(null);
  let invoicePickerOpen = $state(false);
  let directWhatsAppOpen = $state(false);
  let directCustomer = $state<Customer | null>(null);
  let newOrderOpen = $state(false);
  let newOrderCustomerId = $state("");
  let menuFor = $state("");
  let busy = $state("");

  // Keep local copies fresh after shared data reloads (invalidateAll) without losing open dialogs.
  $effect(() => {
    const next = { customers: data.customers, orders: data.orders };
    untrack(() => {
      customers = next.customers;
      orders = next.orders;
      if (selectedCustomer) selectedCustomer = next.customers.find((item: Customer) => item.id === selectedCustomer?.id) || selectedCustomer;
    });
  });

  const archivedCount = $derived(customers.filter((customer) => Boolean(customer.archived)).length);
  const filtered = $derived(customers.filter((customer) =>
    Boolean(customer.archived) === showArchived &&
    `${customer.name} ${customer.business} ${customer.phone} ${customer.email || ""}`.toLowerCase().includes(query.trim().toLowerCase())));

  // Paged in the browser; going back to page 1 whenever the search or archive view changes.
  let page = $state(1);
  $effect(() => { query; showArchived; page = 1; });
  let pageSize = $state(readPageSize('customers', 25));
  $effect(() => savePageSize('customers', pageSize));
  const shown = $derived(pageSlice(filtered, page, pageSize));

  const ordersFor = (customer: Customer | null) => customer
    ? orders.filter((order) => order.customerId === customer.id || (!order.customerId && order.customer === customer.business))
    : [];
  const selectedOrders = $derived(ordersFor(selectedCustomer));
  const directCustomerOrders = $derived(ordersFor(directCustomer));
  const totalBilled = $derived(selectedOrders.reduce((sum, order) => sum + (order.priceSet === false ? 0 : Math.max(0, order.price - order.discount)), 0));
  const totalPaid = $derived(selectedOrders.reduce((sum, order) => sum + order.paid, 0));
  const selectedInvoiceRows = $derived.by(() => selectedCustomer
    ? (data.invoices as Invoice[])
        .map((invoice) => ({ invoice, order: orders.find((order) => order.id === invoice.orderId) }))
        .filter((row) => row.order && (row.order.customerId === selectedCustomer?.id || (!row.order.customerId && row.order.customer === selectedCustomer?.business)))
        .sort((left, right) => right.invoice.openedAt.localeCompare(left.invoice.openedAt))
    : []);
  const invoiceableOrders = $derived(selectedOrders.filter((order) =>
    !selectedInvoiceRows.some((row) => row.order?.id === order.id) &&
    (order.progress >= 100 || ["Completed", "Ready Delivery", "Delivered"].includes(order.status))));

  function customerSaved(customer: Customer, synced: boolean) {
    customers = customers.some((item) => item.id === customer.id) ? customers.map((item) => (item.id === customer.id ? customer : item)) : [customer, ...customers];
    customerStore.update((items) => items.some((item) => item.id === customer.id) ? items.map((item) => (item.id === customer.id ? customer : item)) : [customer, ...items]);
    if (selectedCustomer?.id === customer.id) selectedCustomer = customer;
    // Customer identity is copied onto orders for fast Sheets/search views; keep this screen in sync, then refresh shared data.
    orders = orders.map((order) => order.customerId === customer.id ? { ...order, customer: customer.business, mobile: customer.phone } : order);
    void invalidateAll();
    notifyAction(synced ? `${customerLabel} saved.` : `${customerLabel} saved. Google Sheets will update when the connection is available.`);
  }
  function openCustomer(customer: Customer) {
    menuFor = "";
    selectedCustomer = customer;
    invoicePickerOpen = false;
    detailsOpen = true;
  }
  function edit(customer: Customer) {
    menuFor = "";
    detailsOpen = false;
    editingCustomer = customer;
    showNewCustomer = true;
  }
  function startOrder(customer: Customer) {
    menuFor = "";
    detailsOpen = false;
    newOrderCustomerId = customer.id;
    newOrderOpen = true;
  }
  function orderSaved(order: Order) {
    orders = [order, ...orders];
    notifyAction(`${orderLabel} created.`);
  }
  function customerPortalUrl(token: string) {
    const url = new URL(`/portal/${data.tenantSlug}/customer/${token}`, location.origin);
    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) url.protocol = "http:";
    return url.toString();
  }
  async function copyLink(customer: Customer | null) {
    menuFor = "";
    if (!customer?.token) return;
    try {
      await navigator.clipboard.writeText(customerPortalUrl(customer.token));
      notifyAction("Private link copied. Paste it into a message to the customer.");
    } catch {
      notifyAction("Couldn't copy automatically. Open the portal and copy the address instead.", "error");
    }
  }
  function openCustomerChat(customer: Customer | null) {
    menuFor = "";
    if (!customer?.phone) return;
    directCustomer = customer;
    directWhatsAppOpen = true;
  }
  async function sendInvoiceInWhatsApp(customer: Customer | null, invoice: Invoice) {
    if (!customer?.phone) return;
    const tab = window.open("about:blank", "_blank");
    const response = await safeFetch(`/api/invoices/${invoice.id}/whatsapp`, { method: "POST" });
    const result = await response.json();
    if (!response.ok) {
      tab?.close();
      notifyAction(result.error || "Couldn't prepare the WhatsApp message.", "error");
      return;
    }
    if (tab) tab.location.href = result.url;
    else window.open(result.url, "_blank", "noopener,noreferrer");
  }
  async function regenerate(customer: Customer) {
    menuFor = "";
    if (!await confirmDanger(`Create a new private link for ${customer.business}?\n\nThe old link will stop working.`)) return;
    busy = customer.id;
    const response = await safeFetch(`/api/customers/${customer.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "regenerate-token" }) });
    const result = await response.json();
    busy = "";
    if (!response.ok) { notifyAction(result.error || "Couldn't create a new link.", "error"); return; }
    customers = customers.map((item) => (item.id === customer.id ? { ...item, token: result.token } : item));
    if (selectedCustomer?.id === customer.id) selectedCustomer = { ...selectedCustomer, token: result.token };
    customerStore.update((items) => items.map((item) => (item.id === customer.id ? { ...item, token: result.token } : item)));
    linkReady = { open: true, name: customer.name || customer.business, phone: customer.phone, link: new URL(`/portal/${data.tenantSlug}/customer/${result.token}`, location.origin).toString(), replaced: Boolean(customer.token) };
  }
  let linkReady = $state({ open: false, name: "", phone: "", link: "", replaced: false });
  async function archiveCustomer(customer: Customer) {
    menuFor = "";
    if (!await confirmDanger(`Archive ${customer.business}?\n\nTheir ${orderPlural.toLowerCase()} are kept. You can restore them later.`)) return;
    busy = customer.id;
    const response = await safeFetch(`/api/customers/${customer.id}`, { method: "DELETE" });
    const result = await response.json();
    busy = "";
    if (!response.ok) { notifyAction(result.error || `Couldn't archive this ${customerLabel.toLowerCase()}.`, "error"); return; }
    customers = customers.map((item) => (item.id === customer.id ? result.customer : item));
    customerStore.update((items) => items.filter((item) => item.id !== customer.id));
    detailsOpen = false;
    selectedCustomer = null;
    notifyAction(`${customerLabel} archived.`);
  }
  async function restoreCustomer(customer: Customer) {
    busy = customer.id;
    const response = await safeFetch(`/api/customers/${customer.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "restore" }) });
    const result = await response.json();
    busy = "";
    if (!response.ok) { notifyAction(result.error || `Couldn't restore this ${customerLabel.toLowerCase()}.`, "error"); return; }
    customers = customers.map((item) => (item.id === customer.id ? result.customer : item));
    customerStore.update((items) => [result.customer, ...items.filter((item) => item.id !== customer.id)]);
    notifyAction(`${customerLabel} restored.`);
  }
  // Runs on first load and on same-page links (e.g. picking a result in Cmd-K while already here).
  afterNavigate((navigation) => {
    const customerId = (navigation.to?.url ?? new URL(location.href)).searchParams.get("customer");
    const customer = customers.find((item) => item.id === customerId);
    if (customer) {
      showArchived = Boolean(customer.archived);
      openCustomer(customer);
    }
  });
  import ListPager from '$lib/components/ListPager.svelte';
  import { pageSlice, readPageSize, savePageSize } from '$lib/pageSize';
</script>

<svelte:window
  onclick={(event) => { if (menuFor && !(event.target as Element).closest?.(".row-menu")) menuFor = ""; }}
  onkeydown={(event) => { if (event.key === "Escape") menuFor = ""; }}
/>

<PageHeader
  eyebrow={showArchived ? "Restore anyone you archived." : "Everyone you work for, with their orders and balance."}
  title={showArchived ? `Archived ${customerPlural.toLowerCase()}` : customerPlural}
  action={showArchived || !allowed("customers.edit") ? undefined : `New ${customerLabel.toLowerCase()}`}
  onclick={() => { editingCustomer = null; showNewCustomer = true; }}
/>

{#if showArchived}
  <div class="archive-bar">
    <span><Archive size={16} aria-hidden="true" />You're viewing archived {customerPlural.toLowerCase()}.</span>
    <button type="button" class="link" onclick={() => (showArchived = false)}><ArrowLeft size={15} aria-hidden="true" />Back to active {customerPlural.toLowerCase()}</button>
  </div>
{/if}

<div class="toolbar">
  <label class="search">
    <Search size={16} aria-hidden="true" />
    <input bind:value={query} placeholder="Search by name, business, phone or email" aria-label={`Search ${customerPlural.toLowerCase()}`} />
  </label>
  {#if !showArchived}<button type="button" class="secondary archived-btn" onclick={() => (showArchived = true)}><Archive size={15} aria-hidden="true" />Archived<span class="count">{archivedCount}</span></button>{/if}
</div>
<p class="result-count">{filtered.length} {filtered.length === 1 ? customerLabel.toLowerCase() : customerPlural.toLowerCase()}{query.trim() ? ` matching “${query.trim()}”` : ""}</p>

<div class="card list">
  <table class="people">
    <thead>
      <tr>
        <th>{customerLabel}</th>
        <th>Phone</th>
        <th class="num">{orderPlural}</th>
        {#if paymentsEnabled}<th class="num">Balance due</th>{/if}
        <th class="col-actions"><span class="sr-only">Actions</span></th>
      </tr>
    </thead>
    <tbody>
      {#each shown as customer, index (customer.id)}
        <tr>
          <td class="col-name">
            <button type="button" class="name-btn" onclick={() => openCustomer(customer)}>
              <strong>{customer.business}</strong>
              {#if customer.name && customer.name !== customer.business}<span>{customer.name}</span>{/if}
            </button>
          </td>
          <td data-label="Phone">{#if customer.phone}<a class="phone" href={`tel:${customer.phone}`}>{customer.phone}</a>{:else}<span class="muted">Not added</span>{/if}</td>
          <td data-label={orderPlural} class="num">{customer.projects}</td>
          {#if paymentsEnabled}<td data-label="Balance due" class="num">{#if customer.pending}<b class="due">{money(customer.pending)}</b>{:else}<span class="clear">All paid</span>{/if}</td>{/if}
          <td class="col-actions">
            <div class="actions">
              {#if customer.archived}
                {#if allowed("customers.delete")}<button type="button" class="small" disabled={busy === customer.id} onclick={() => restoreCustomer(customer)}><RotateCcw size={14} aria-hidden="true" />Restore</button>{/if}
              {:else}
                {#if whatsappEnabled && customer.phone}<button type="button" class="icon" title="Message on WhatsApp" aria-label={`Message ${customer.business} on WhatsApp`} onclick={() => openCustomerChat(customer)}><WhatsAppIcon size={16} /></button>{/if}
                <button type="button" class="small" onclick={() => openCustomer(customer)}>View<ChevronRight size={14} aria-hidden="true" /></button>
                <div class="row-menu">
                  <button type="button" class="icon" aria-haspopup="menu" aria-expanded={menuFor === customer.id} title="More actions" aria-label={`More actions for ${customer.business}`} onclick={() => (menuFor = menuFor === customer.id ? "" : customer.id)}><MoreHorizontal size={16} /></button>
                  {#if menuFor === customer.id}
                    <div class="menu" class:up={shown.length > 3 && index >= shown.length - 2} role="menu">
                      {#if allowed("orders.edit")}<button type="button" role="menuitem" onclick={() => startOrder(customer)}><Plus size={15} aria-hidden="true" />New {orderLabel.toLowerCase()}</button>{/if}
                      {#if allowed("customers.edit")}<button type="button" role="menuitem" onclick={() => edit(customer)}><Edit3 size={15} aria-hidden="true" />Edit details</button>{/if}
                      {#if portalEnabled && customer.token}
                        <button type="button" role="menuitem" onclick={() => copyLink(customer)}><Copy size={15} aria-hidden="true" />Copy private link</button>
                        <a role="menuitem" href={`/portal/${data.tenantSlug}/customer/${customer.token}`} target="_blank" rel="noreferrer" onclick={() => (menuFor = "")}><ExternalLink size={15} aria-hidden="true" />Open their portal</a>
                      {/if}
                      {#if portalEnabled}<button type="button" role="menuitem" onclick={() => regenerate(customer)}><RefreshCw size={15} aria-hidden="true" />{customer.token ? "Create a new link" : "Create private link"}</button>{/if}
                      {#if allowed("customers.delete")}<button type="button" role="menuitem" class="danger" onclick={() => archiveCustomer(customer)}><Archive size={15} aria-hidden="true" />Archive</button>{/if}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if !filtered.length}
    <div class="empty">
      <p><strong>{query.trim() ? `No ${customerPlural.toLowerCase()} match “${query.trim()}”.` : showArchived ? `No archived ${customerPlural.toLowerCase()}.` : `No ${customerPlural.toLowerCase()} yet.`}</strong></p>
      {#if query.trim()}<button type="button" class="secondary" onclick={() => (query = "")}>Clear search</button>{:else if !showArchived}<button type="button" class="secondary" onclick={() => { editingCustomer = null; showNewCustomer = true; }}>New {customerLabel.toLowerCase()}</button>{/if}
    </div>
  {/if}
</div>
<ListPager total={filtered.length} bind:page bind:pageSize />

<Modal title={selectedCustomer?.business || `${customerLabel} details`} bind:open={detailsOpen} wide>
  {#if selectedCustomer}
    <div class="detail">
      <div class="detail-actions">
        {#if !selectedCustomer.archived && allowed("orders.edit")}<button type="button" class="primary" onclick={() => startOrder(selectedCustomer!)}><Plus size={15} aria-hidden="true" />New {orderLabel.toLowerCase()}</button>{/if}
        {#if whatsappEnabled && selectedCustomer.phone}<button type="button" class="secondary" onclick={() => openCustomerChat(selectedCustomer)}><WhatsAppIcon size={15} />Message</button>{/if}
        {#if whatsappEnabled && invoicesEnabled && selectedCustomer.phone}<button type="button" class="secondary" aria-expanded={invoicePickerOpen} onclick={() => (invoicePickerOpen = !invoicePickerOpen)}><FileText size={15} aria-hidden="true" />Send an invoice</button>{/if}
        {#if allowed("customers.edit")}<button type="button" class="secondary" onclick={() => edit(selectedCustomer!)}><Edit3 size={15} aria-hidden="true" />Edit</button>{/if}
      </div>

      {#if invoicePickerOpen}
        <section class="box">
          <h3>Choose an invoice to send</h3>
          {#if selectedInvoiceRows.length}
            <ul class="rows">
              {#each selectedInvoiceRows as row}
                <li>
                  <span><strong>{row.invoice.number}</strong><small>{row.order?.project} · {formatDateTime(row.invoice.openedAt)} · {row.invoice.balance > 0 ? `${money(row.invoice.balance)} due` : "Paid"}</small></span>
                  <button type="button" class="small" disabled={!selectedCustomer.token} onclick={() => sendInvoiceInWhatsApp(selectedCustomer, row.invoice)}><WhatsAppIcon size={14} />Send</button>
                </li>
              {/each}
            </ul>
          {:else}<p class="muted">No invoices yet.</p>{/if}
          {#each invoiceableOrders as order}
            <a class="ready-link" href={`/orders/${order.id}?invoice=1`}>{order.project}: work is finished, no invoice yet. Create one <ChevronRight size={14} aria-hidden="true" /></a>
          {/each}
        </section>
      {/if}

      <div class="detail-grid">
        <section class="box">
          <h3>Contact</h3>
          <dl class="facts">
            {#if selectedCustomer.name && selectedCustomer.name !== selectedCustomer.business}<div><dt>Contact person</dt><dd>{selectedCustomer.name}</dd></div>{/if}
            <div><dt><Phone size={14} aria-hidden="true" />Phone</dt><dd>{#if selectedCustomer.phone}<a href={`tel:${selectedCustomer.phone}`}>{selectedCustomer.phone}</a>{:else}Not added{/if}</dd></div>
            <div><dt><Mail size={14} aria-hidden="true" />Email</dt><dd>{#if selectedCustomer.email}<a href={`mailto:${selectedCustomer.email}`}>{selectedCustomer.email}</a>{:else}Not added{/if}</dd></div>
            <div><dt><MapPin size={14} aria-hidden="true" />Address</dt><dd>{selectedCustomer.address || "Not added"}{#if selectedCustomer.locationUrl}<br /><a href={selectedCustomer.locationUrl} target="_blank" rel="noreferrer">Open in Google Maps <ExternalLink size={12} aria-hidden="true" /></a>{/if}</dd></div>
            <div><dt><ReceiptIndianRupee size={14} aria-hidden="true" />GSTIN</dt><dd>{selectedCustomer.gst || "Not added"}</dd></div>
          </dl>
          {#if customFieldsEnabled}<CustomFieldValues definitions={data.configuration.profile.customFields} entity="customer" values={selectedCustomer.customFields} />{/if}
        </section>

        <div class="stack">
          {#if paymentsEnabled}
            <section class="box">
              <h3>Account</h3>
              <dl class="money">
                <div><dt>Billed</dt><dd>{money(totalBilled)}</dd></div>
                <div><dt>Paid</dt><dd class="clear">{money(totalPaid)}</dd></div>
                <div><dt>Balance due</dt><dd class:due={selectedCustomer.pending > 0} class:clear={selectedCustomer.pending === 0}>{selectedCustomer.pending > 0 ? money(selectedCustomer.pending) : "All paid"}</dd></div>
              </dl>
            </section>
          {/if}
          {#if portalEnabled}
            <section class="box">
              <h3>Private customer page</h3>
              <p class="muted">{selectedCustomer.token ? "A private page where they can see progress, bills and files. Share the link with them." : "Create a private link so they can see progress, bills and files."}</p>
              <div class="inline-actions">
                {#if selectedCustomer.token}
                  <button type="button" class="secondary" onclick={() => copyLink(selectedCustomer)}><Copy size={14} aria-hidden="true" />Copy link</button>
                  <a class="secondary" href={`/portal/${data.tenantSlug}/customer/${selectedCustomer.token}`} target="_blank" rel="noreferrer"><ExternalLink size={14} aria-hidden="true" />Open</a>
                {/if}
                {#if !selectedCustomer.archived}<button type="button" class="secondary" disabled={busy === selectedCustomer.id} onclick={() => regenerate(selectedCustomer!)}><RefreshCw size={14} aria-hidden="true" />{selectedCustomer.token ? "New link" : "Create link"}</button>{/if}
              </div>
            </section>
          {/if}
        </div>
      </div>

      <section class="box">
        <h3>{orderPlural} <span class="muted">({selectedOrders.length})</span></h3>
        {#if selectedOrders.length}
          <ul class="rows">
            {#each selectedOrders.slice(0, 8) as order (order.id)}
              <li><a class="order-row" href={"/orders/" + order.id}>
                <span><strong>{order.project || "Untitled"}</strong><small>{orderCode(data.settings, order.serial)}{order.workType ? ` · ${order.workType}` : ""}</small></span>
                <StatusBadge status={order.status} />
                <ChevronRight size={15} aria-hidden="true" />
              </a></li>
            {/each}
          </ul>
          {#if selectedOrders.length > 8}<p class="muted">Showing the latest 8. Search for this {customerLabel.toLowerCase()} on the {orderPlural} page to see all.</p>{/if}
        {:else}
          <p class="muted">No {orderPlural.toLowerCase()} yet.</p>
        {/if}
      </section>

      {#if !selectedCustomer.archived && allowed("customers.delete")}
        <div class="danger-zone"><button type="button" class="link danger" disabled={busy === selectedCustomer.id} onclick={() => archiveCustomer(selectedCustomer!)}><Archive size={14} aria-hidden="true" />Archive this {customerLabel.toLowerCase()}</button></div>
      {/if}
    </div>
  {/if}
  {#snippet footer()}<button class="secondary" onclick={() => (detailsOpen = false)}>Close</button>{/snippet}
</Modal>

<DirectWhatsAppModal
  bind:open={directWhatsAppOpen}
  recipient={directCustomer ? { kind: "customer", record: directCustomer } : null}
  orders={directCustomerOrders}
  configuration={data.configuration}
  onmessage={(value) => notifyAction(value)}
/>
<NewCustomerModal bind:open={showNewCustomer} customer={editingCustomer} onsaved={customerSaved} />
<NewOrderModal bind:open={newOrderOpen} initialCustomerId={newOrderCustomerId} onsaved={orderSaved} />

<LinkReadyDialog bind:open={linkReady.open} name={linkReady.name} phone={linkReady.phone} link={linkReady.link} replaced={linkReady.replaced} business={data.settings?.studioName || ""} whatsapp={whatsappEnabled} />

<style>
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .muted { color: var(--muted); }
  .clear { color: #15803d; font-weight: 600; }
  .due { color: var(--theme-text); font-weight: 650; }
  .count { display: inline-grid; place-items: center; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: var(--theme-soft); color: var(--theme-text); font-size: 12px; font-weight: 650; }
  .link { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: var(--purple); font-size: 13.5px; font-weight: 600; cursor: pointer; }
  .link.danger { color: #b91c1c; }

  .archive-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 14px; margin-bottom: 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--theme-soft); font-size: 13.5px; color: var(--theme-text); }
  .archive-bar span { display: inline-flex; align-items: center; gap: 8px; }

  .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
  .search { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--muted); }
  .search:focus-within { border-color: var(--purple); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple) 18%, transparent); }
  .search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; color: var(--theme-text); font-size: 14px; }
  .archived-btn { display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 12px; font-size: 13.5px; }
  .result-count { margin: 0 0 12px; font-size: 12.5px; color: var(--muted); }

  .list { padding: 0; container-type: inline-size; }
  .people { width: 100%; border-collapse: collapse; }
  .people th { padding: 11px 14px; text-align: left; font-size: 12px; font-weight: 650; color: var(--muted); border-bottom: 1px solid var(--line); white-space: nowrap; }
  .people td { padding: 12px 14px; border-bottom: 1px solid var(--line); font-size: 13.5px; color: var(--theme-text); vertical-align: middle; }
  .people tbody tr { transition: background-color .15s ease; }
  .people tbody tr:hover { background: color-mix(in srgb, var(--theme-soft) 70%, transparent); }
  .people tbody tr:last-child td { border-bottom: 0; }
  .num { text-align: right; white-space: nowrap; }
  .col-actions { width: 1%; }
  .name-btn { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 0; border: 0; background: none; color: inherit; text-align: left; cursor: pointer; min-width: 0; }
  .name-btn strong { font-size: 14px; font-weight: 650; overflow-wrap: anywhere; }
  .name-btn span { font-size: 12.5px; color: var(--muted); }
  .name-btn:hover strong { text-decoration: underline; }
  .phone { color: inherit; text-decoration: none; white-space: nowrap; }
  .phone:hover { text-decoration: underline; }
  .actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
  .small { display: inline-flex; align-items: center; gap: 5px; height: 32px; padding: 0 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--card); color: var(--theme-text); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .small:hover { border-color: color-mix(in srgb, var(--purple) 45%, var(--line)); }
  .small:disabled { opacity: .5; cursor: not-allowed; }
  .icon { width: 32px; height: 32px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--muted); cursor: pointer; }
  .icon:hover { background: var(--theme-soft); color: var(--theme-text); }
  .row-menu { position: relative; }
  .menu { position: absolute; right: 0; top: calc(100% + 4px); z-index: 30; min-width: 220px; padding: 6px; display: grid; gap: 2px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); box-shadow: 0 12px 32px #0000001f; }
  /* Last rows open the menu upward so it is not cut off inside the scrolling list. */
  .menu.up { top: auto; bottom: calc(100% + 4px); }
  .menu button, .menu a { display: flex; align-items: center; gap: 9px; width: 100%; height: 38px; padding: 0 10px; border: 0; border-radius: 8px; background: transparent; color: var(--theme-text); font-size: 13.5px; font-weight: 500; text-align: left; text-decoration: none; cursor: pointer; white-space: nowrap; }
  .menu button:hover, .menu a:hover { background: var(--theme-soft); }
  .menu .danger { color: #b91c1c; }
  .empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 16px; text-align: center; color: var(--muted); font-size: 14px; }
  .empty p { margin: 0; }
  .empty strong { color: var(--theme-text); }

  /* Narrow list (phone, or sidebar + small window): each person becomes a card. */
  @container (max-width: 640px) {
    .people thead { display: none; }
    .people, .people tbody, .people tr, .people td { display: block; width: 100%; }
    .people tbody tr { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; padding: 14px; border-bottom: 1px solid var(--line); }
    .people tbody tr:last-child { border-bottom: 0; }
    .people td { padding: 0; border: 0; }
    .people td[data-label]::before { content: attr(data-label); display: block; font-size: 11.5px; font-weight: 600; color: var(--muted); margin-bottom: 2px; }
    .col-name, .col-actions { grid-column: 1 / -1; }
    .num { text-align: left; }
    .col-actions { width: auto; }
    .actions { justify-content: flex-start; flex-wrap: wrap; }
    .menu { left: 0; right: auto; }
  }

  /* Details dialog */
  .detail { display: grid; gap: 14px; }
  .detail-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .detail-actions button { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; }
  .detail-grid { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 14px; align-items: start; }
  .stack { display: grid; gap: 14px; }
  .box { border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; background: var(--card); min-width: 0; }
  .box h3 { margin: 0 0 10px; font-size: 14px; font-weight: 650; color: var(--theme-text); }
  .box p { margin: 0 0 10px; font-size: 13px; line-height: 1.5; }
  .facts, .money { margin: 0; display: grid; gap: 10px; }
  .facts div { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 10px; }
  .facts dt { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--muted); }
  .facts dd { margin: 0; font-size: 13.5px; color: var(--theme-text); overflow-wrap: anywhere; }
  .facts a, .rows a { color: var(--purple); }
  .money div { display: flex; justify-content: space-between; gap: 12px; font-size: 13.5px; }
  .money dt { color: var(--muted); }
  .money dd { margin: 0; font-weight: 650; color: var(--theme-text); }
  .inline-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .inline-actions .secondary { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px; font-size: 13px; text-decoration: none; }
  .rows { list-style: none; margin: 0; padding: 0; display: grid; }
  .rows li { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); }
  .rows li:last-child { border-bottom: 0; }
  .rows span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .rows strong { font-size: 13.5px; color: var(--theme-text); }
  .rows small { font-size: 12px; color: var(--muted); }
  .order-row { display: grid !important; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 10px; width: 100%; color: inherit !important; text-decoration: none; }
  .order-row:hover strong { text-decoration: underline; }
  .ready-link { display: flex; align-items: center; gap: 4px; margin-top: 8px; font-size: 13px; font-weight: 600; color: var(--purple); }
  .danger-zone { display: flex; justify-content: flex-end; }
  @media (max-width: 720px) {
    .detail-grid { grid-template-columns: 1fr; }
    .facts div { grid-template-columns: 1fr; gap: 2px; }
    .toolbar { flex-wrap: wrap; }
  }
</style>
