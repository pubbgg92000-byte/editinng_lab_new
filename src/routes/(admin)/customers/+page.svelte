<script lang="ts">
  import { onMount, untrack } from "svelte";
  import {
    Search,
    Check,
    Edit3,
    Copy,
    RefreshCw,
    Archive,
    RotateCcw,
    Eye,
    ExternalLink,
    FolderKanban,
    Mail,
    MapPin,
    ReceiptIndianRupee,
    MessageCircle,
    FileText,
    Link2,
    ArrowRight,
  } from "@lucide/svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import NewCustomerModal from "$lib/components/NewCustomerModal.svelte";
  import WhatsAppIcon from "$lib/components/WhatsAppIcon.svelte";
  import { formatDateTime, money } from "$lib/data";
  import { whatsappNumber } from "$lib/phone";
  import { customerStore } from "$lib/stores/app";
  import type { Customer, Invoice, Order } from "$lib/types";

  let query = $state("");
  let showNewCustomer = $state(false);
  let editingCustomer = $state<Customer | null>(null);
  let toast = $state("");
  let { data } = $props();
  let customers = $state<Customer[]>(untrack(() => data.customers));
  let orders = $state<Order[]>(untrack(() => data.orders));
  let showArchived = $state(false);
  let detailsOpen = $state(false);
  let selectedCustomer = $state<Customer | null>(null);
  let customerAction = $state<"closed" | "choice" | "invoices">("closed");
  let copiedPortal = $state("");
  let mapOpen = $state(false);
  let mapTarget = $state("");
  const archivedCount = $derived(
    customers.filter((customer) => Boolean(customer.archived)).length,
  );
  const filtered = $derived(
    customers.filter(
      (customer) =>
        Boolean(customer.archived) === showArchived &&
        (customer.name + customer.business + customer.phone)
          .toLowerCase()
          .includes(query.toLowerCase()),
    ),
  );
  const selectedOrders = $derived.by(() => {
    const customer = selectedCustomer;
    return customer
      ? orders.filter(
          (order) =>
            order.customerId === customer.id ||
            (!order.customerId && order.customer === customer.business),
        )
      : [];
  });
  const totalBilled = $derived(
    selectedOrders.reduce(
      (sum, order) =>
        sum +
        (order.priceSet === false
          ? 0
          : Math.max(0, order.price - order.discount)),
      0,
    ),
  );
  const totalPaid = $derived(
    selectedOrders.reduce((sum, order) => sum + order.paid, 0),
  );
  const selectedInvoiceRows = $derived.by(() =>
    selectedCustomer
      ? (data.invoices as Invoice[])
          .map((invoice) => ({
            invoice,
            order: orders.find((order) => order.id === invoice.orderId),
          }))
          .filter(
            (row) =>
              row.order &&
              (row.order.customerId === selectedCustomer?.id ||
                (!row.order.customerId &&
                  row.order.customer === selectedCustomer?.business)),
          )
          .sort((left, right) =>
            right.invoice.openedAt.localeCompare(left.invoice.openedAt),
          )
      : [],
  );
  const invoiceableOrders = $derived(
    selectedOrders.filter(
      (order) =>
        !selectedInvoiceRows.some((row) => row.order?.id === order.id) &&
        (order.progress >= 100 ||
          ["Completed", "Ready Delivery", "Delivered"].includes(order.status)),
    ),
  );

  function customerSaved(customer: Customer, synced: boolean) {
    customers = customers.some((item) => item.id === customer.id)
      ? customers.map((item) => (item.id === customer.id ? customer : item))
      : [customer, ...customers];
    customerStore.update((items) =>
      items.some((item) => item.id === customer.id)
        ? items.map((item) => (item.id === customer.id ? customer : item))
        : [customer, ...items],
    );
    if (selectedCustomer?.id === customer.id) selectedCustomer = customer;
    toast = synced
      ? "Customer saved and synced to Google Sheets"
      : "Customer saved; Sheet sync is pending or not configured";
    setTimeout(() => (toast = ""), 3000);
  }
  function openCustomer(customer: Customer) {
    selectedCustomer = customer;
    customerAction = "closed";
    detailsOpen = true;
  }
  function edit(customer: Customer) {
    detailsOpen = false;
    editingCustomer = customer;
    showNewCustomer = true;
  }
  function editSelectedCustomer() {
    if (selectedCustomer) edit(selectedCustomer);
  }
  function customerPortalUrl(token: string) {
    const url = new URL(
      `/portal/${data.tenantSlug}/customer/${token}`,
      location.origin,
    );
    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname))
      url.protocol = "http:";
    return url.toString();
  }
  async function copyLink(customer: Customer | null) {
    if (!customer?.token) return;
    await navigator.clipboard.writeText(customerPortalUrl(customer.token));
    copiedPortal = customer.id;
    toast = "Private customer portal link copied";
    setTimeout(() => {
      toast = "";
      copiedPortal = "";
    }, 2500);
  }
  function openCustomerChat(customer: Customer | null) {
    if (!customer?.phone) return;
    window.open(
      `https://wa.me/${whatsappNumber(customer.phone)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
  function previewMap(url: string | undefined) { if (!url) return; mapTarget = url; mapOpen = true; }
  function sendInvoiceInWhatsApp(
    customer: Customer | null,
    invoice: Invoice,
    order: Order,
  ) {
    if (!customer?.phone || !customer.token) return;
    const invoiceUrl = `${location.origin}/portal/${data.tenantSlug}/customer/${customer.token}/invoice/${invoice.id}`;
    const message = [
      `Invoice ${invoice.number}`,
      customer.business,
      order.project,
      `Editing: ${order.status} (${order.progress}%)`,
      `Amount due: ${money(invoice.balance)}`,
      `Open invoice / save PDF: ${invoiceUrl}`,
    ].join("\n");
    window.open(
      `https://wa.me/${whatsappNumber(customer.phone)}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
  async function regenerate(customer: Customer) {
    if (
      !confirm(
        "Regenerate this customer link? The previous link will stop working.",
      )
    )
      return;
    const response = await fetch(`/api/customers/${customer.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "regenerate-token" }),
    });
    const result = await response.json();
    if (response.ok) {
      customerStore.update((items) =>
        items.map((item) =>
          item.id === customer.id ? { ...item, token: result.token } : item,
        ),
      );
      toast = "Customer link regenerated";
    } else toast = result.error || "Unable to regenerate link";
    setTimeout(() => (toast = ""), 2500);
  }
  async function archiveCustomer(customer: Customer) {
    if (!confirm(`Archive ${customer.business}? Existing orders will be kept.`))
      return;
    const response = await fetch(`/api/customers/${customer.id}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!response.ok) {
      toast = result.error || "Unable to archive customer";
      return;
    }
    customers = customers.map((item) =>
      item.id === customer.id ? result.customer : item,
    );
    customerStore.update((items) =>
      items.filter((item) => item.id !== customer.id),
    );
    toast = "Customer archived";
  }
  async function restoreCustomer(customer: Customer) {
    const response = await fetch(`/api/customers/${customer.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast = result.error || "Unable to restore customer";
      return;
    }
    customers = customers.map((item) =>
      item.id === customer.id ? result.customer : item,
    );
    customerStore.update((items) => [
      result.customer,
      ...items.filter((item) => item.id !== customer.id),
    ]);
    toast = "Customer restored";
  }
  onMount(() => {
    const customerId = new URL(location.href).searchParams.get("customer");
    const customer = customers.find((item) => item.id === customerId);
    if (customer) {
      showArchived = Boolean(customer.archived);
      openCustomer(customer);
    }
  });
</script>

<PageHeader
  eyebrow="People you work with"
  title="Customers"
  action="New customer"
  onclick={() => {
    editingCustomer = null;
    showNewCustomer = true;
  }}
/>

<div class="list-tools">
  <div class="filter">
    <Search size={15} /><input
      bind:value={query}
      placeholder="Search customers"
      aria-label="Search customers"
    />
  </div>
  <div class="tool-actions">
    <button
      class:active={showArchived}
      class="archive-toggle"
      onclick={() => (showArchived = !showArchived)}
      ><span>{showArchived ? "Back to active" : "Archived"}</span><strong
        class="archive-count">{archivedCount}</strong
      ></button
    ><span>{filtered.length} customers</span>
  </div>
</div>

<div class="card table-wrap">
  <table class="data-table customer-table">
    <thead
      ><tr
        ><th>Customer</th><th>Phone</th><th>Projects</th><th>Pending</th><th
          class="actions-heading">Actions</th
        ></tr
      ></thead
    >
    <tbody
      >{#each filtered as customer}<tr class:archived={customer.archived}
          ><td
            ><button
              class="customer-name-button"
              onclick={() => openCustomer(customer)}
              aria-label={`Open ${customer.business} details`}
              ><strong>{customer.business}</strong><small
                >{customer.name} · {customer.id}</small
              ></button
            ></td
          ><td>{customer.phone}</td><td>{customer.projects}</td><td
            class:clear={customer.pending === 0}
            >{customer.pending ? money(customer.pending) : "All clear"}</td
          ><td class="actions-cell"
            ><div class="row-actions">
              <div class="action-cluster">
                <button
                  class="view"
                  onclick={() => openCustomer(customer)}
                  aria-label="View customer details"
                  title="View details"><Eye size={14} /></button
                >{#if customer.archived}<button
                    class="restore"
                    onclick={() => restoreCustomer(customer)}
                    aria-label="Restore customer"
                    title="Restore customer"><RotateCcw size={14} /></button
                  >{:else}<button
                    onclick={() => edit(customer)}
                    aria-label="Edit customer"
                    title="Edit customer"><Edit3 size={14} /></button
                  ><button
                    class="portal-copy"
                    onclick={() => copyLink(customer)}
                    disabled={!customer.token}
                    aria-label="Copy customer portal link"
                    title={customer.token
                      ? "Copy customer portal link"
                      : "Private link unavailable"}
                    >{#if copiedPortal === customer.id}<Check size={13} /><span
                        >Copied</span
                      >{:else}<Link2 size={13} /><span>Portal</span
                      >{/if}</button
                  ><button
                    onclick={() => regenerate(customer)}
                    aria-label="Regenerate private link"
                    title="Regenerate private link"
                    ><RefreshCw size={14} /></button
                  >{#if customer.phone}<a
                      class="whatsapp"
                      href={"https://wa.me/" + whatsappNumber(customer.phone)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="WhatsApp customer"
                      title="Open WhatsApp"><WhatsAppIcon size={15} /></a
                    >{/if}{#if customer.token}<a
                      class="portal-action"
                      href={`/portal/${data.tenantSlug}/customer/${customer.token}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open customer portal"
                      title="Open customer portal"><ExternalLink size={14} /></a
                    >{/if}{/if}
              </div>
              {#if !customer.archived}<button
                  class="danger"
                  onclick={() => archiveCustomer(customer)}
                  aria-label="Archive customer"
                  title="Archive customer"><Archive size={14} /></button
                >{/if}
            </div></td
          ></tr
        >{/each}</tbody
    >
  </table>
</div>

<Modal title="Customer details" bind:open={detailsOpen} wide>
  {#if selectedCustomer}
    <section class="customer-overview">
      <div class="card customer-profile">
        <div class="profile-head">
          <div>
            <span>Customer overview</span>
            <h2>{selectedCustomer.business}</h2>
            <p>{selectedCustomer.name}</p>
          </div>
          <div class="profile-actions">
            <button
              class="secondary whatsapp-detail"
              disabled={!selectedCustomer.phone}
              onclick={() =>
                (customerAction =
                  customerAction === "closed" ? "choice" : "closed")}
              ><WhatsAppIcon size={14} /> WhatsApp</button
            ><button class="secondary" onclick={editSelectedCustomer}
              ><Edit3 size={13} /> Edit details</button
            >
          </div>
        </div>
          <div class="contact-grid">
          <div>
            <Mail size={14} /><span
              >Email<strong>{selectedCustomer.email || "Not added"}</strong
              ></span
            >
          </div>
          <div>
            <MapPin size={14} /><span
              >Address<strong>{selectedCustomer.address || "Not added"}</strong
              ></span
            >
          </div>
            <div>
              <ReceiptIndianRupee size={14} /><span
                >GSTIN<strong>{selectedCustomer.gst || "Not added"}</strong></span
              >
            </div>
            {#if selectedCustomer.locationUrl}<div class="location-contact"><MapPin size={14}/><span>Google Maps location<strong><button onclick={() => previewMap(selectedCustomer?.locationUrl)}>Preview map</button><a href={selectedCustomer.locationUrl} target="_blank" rel="noreferrer">Open in new tab <ExternalLink size={11}/></a></strong></span></div>{/if}
        </div>
        {#if customerAction !== "closed"}<div class="customer-actions-panel">
            {#if customerAction === "choice"}<button
                onclick={() => openCustomerChat(selectedCustomer)}
                ><MessageCircle size={17} /><span
                  ><strong>Start a chat</strong><small
                    >Open a normal WhatsApp conversation</small
                  ></span
                ><ArrowRight size={14} /></button
              ><button onclick={() => (customerAction = "invoices")}
                ><FileText size={17} /><span
                  ><strong>Send an invoice</strong><small
                    >Choose an invoice and review the amount due</small
                  ></span
                ><ArrowRight size={14} /></button
              >{:else}<div class="invoice-choice-head">
                <button onclick={() => (customerAction = "choice")}
                  ><ArrowRight size={13} /> Back</button
                ><span
                  ><strong>Choose an invoice</strong><small
                    >Secure portal link · printable PDF template</small
                  ></span
                >
              </div>
              <div class="customer-invoice-list">
                {#each selectedInvoiceRows as row}<div>
                    <span
                      ><strong>{row.invoice.number}</strong><small
                        >{row.order?.project} · {formatDateTime(
                          row.invoice.openedAt,
                        )}</small
                      ><em
                        >Editing {row.order?.status} ({row.order?.progress}%) ·
                        Due {money(row.invoice.balance)}</em
                      ></span
                    ><button
                      disabled={!selectedCustomer.token}
                      onclick={() =>
                        row.order &&
                        sendInvoiceInWhatsApp(
                          selectedCustomer!,
                          row.invoice,
                          row.order,
                        )}><WhatsAppIcon size={14} /> Send</button
                    >
                  </div>{/each}{#if !selectedInvoiceRows.length}<p>
                    No invoices have been generated for this customer.
                  </p>{/if}{#each invoiceableOrders as order}<a
                    href={`/orders/${order.id}?invoice=1`}
                    ><span
                      ><strong>{order.project}</strong><small
                        >Editing complete · no invoice yet</small
                      ></span
                    ><span>Create invoice <ArrowRight size={13} /></span></a
                  >{/each}
              </div>{/if}
          </div>{/if}
        <div class="portal-panel">
          <span
            ><strong>Private customer portal</strong><small
              >{selectedCustomer.token
                ? "Copy or open the customer’s secure portal."
                : "Generate a private link to enable the portal."}</small
            ></span
          ><button
            class="secondary"
            disabled={!selectedCustomer.token}
            onclick={() => copyLink(selectedCustomer)}
            ><Copy size={13} />
            {copiedPortal === selectedCustomer.id
              ? "Copied"
              : "Copy link"}</button
          >{#if selectedCustomer.token}<a
              class="secondary"
              href={`/portal/${data.tenantSlug}/customer/${selectedCustomer.token}`}
              target="_blank"
              rel="noreferrer"><ExternalLink size={13} /> Open</a
            >{/if}
        </div>
      </div>
      <div class="card customer-finance">
        <span>Account summary</span>
        <div>
          <p>Total billed<strong>{money(totalBilled)}</strong></p>
          <p>Total paid<strong class="paid">{money(totalPaid)}</strong></p>
          <p>
            Pending<strong class:paid={selectedCustomer.pending === 0}
              >{money(selectedCustomer.pending)}</strong
            >
          </p>
        </div>
      </div>
      <div class="card customer-projects">
        <div class="projects-head">
          <div>
            <span>Recent work</span>
            <h2>{selectedOrders.length} projects</h2>
          </div>
          <FolderKanban size={18} />
        </div>
        {#if selectedOrders.length}<div class="mini-orders">
            {#each selectedOrders.slice(0, 5) as order}<a
                href={"/orders/" + order.id}
                ><span
                  ><strong>{order.project}</strong><small
                    >{order.workType} · #{order.serial}</small
                  ></span
                ><span>{order.status}</span></a
              >{/each}
          </div>{:else}<p class="empty-detail">
            No orders created for this customer yet.
          </p>{/if}
      </div>
    </section>
  {/if}
  {#snippet footer()}<button
      class="secondary"
      onclick={() => (detailsOpen = false)}>Close</button
    >{/snippet}
</Modal>

<Modal title="Google Maps location" bind:open={mapOpen} wide>
  <div class="map-preview"><iframe title="Google Maps location preview" src={mapTarget} loading="lazy"></iframe><p>If Google blocks the embedded preview, use the new-tab button.</p><a class="primary" href={mapTarget} target="_blank" rel="noreferrer"><MapPin size={14}/> Open in Google Maps</a></div>
</Modal>

<NewCustomerModal
  bind:open={showNewCustomer}
  customer={editingCustomer}
  onsaved={customerSaved}
/>
{#if toast}<div class="toast"><Check size={15} />{toast}</div>{/if}

<style>
  .customer-name-button {
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    padding: 0;
    width: 100%;
  }
  .customer-table {
    table-layout: fixed;
  }
  .customer-table th:nth-child(1) {
    width: 27%;
  }
  .customer-table th:nth-child(2) {
    width: 14%;
  }
  .customer-table th:nth-child(3) {
    width: 11%;
  }
  .customer-table th:nth-child(4) {
    width: 14%;
  }
  .customer-table th:nth-child(5) {
    width: 34%;
  }
  .actions-heading {
    text-align: right;
  }
  .actions-cell {
    white-space: nowrap;
  }
  .customer-overview {
    display: grid;
    grid-template-columns: 1.4fr 0.8fr;
    gap: 14px;
  }
  .customer-profile,
  .customer-finance,
  .customer-projects {
    padding: 20px;
  }
  .customer-projects {
    grid-column: 1/-1;
  }
  .profile-head,
  .projects-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .profile-head span,
  .customer-finance > span,
  .projects-head span {
    color: var(--purple);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .profile-head h2,
  .projects-head h2 {
    font-size: 16px;
    margin: 5px 0 2px;
  }
  .profile-head p {
    color: var(--muted);
    font-size: 10px;
    margin: 0;
  }
  .profile-head button {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 20px;
  }
  .contact-grid > div {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 11px;
    color: var(--purple);
  }
  .contact-grid span {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: var(--muted);
    font-size: 8px;
  }
  .contact-grid strong {
    color: var(--text);
    font-size: 9px;
    line-height: 1.4;
  }
  .location-contact strong{display:flex;align-items:flex-start;flex-direction:column;gap:4px}.location-contact button,.location-contact a{display:flex;align-items:center;gap:4px;border:0;background:transparent;color:var(--purple);padding:0;font-size:8px}.map-preview{display:grid;gap:10px}.map-preview iframe{width:100%;height:min(55vh,430px);border:1px solid var(--line);border-radius:12px;background:var(--theme-soft)}.map-preview p{margin:0;color:var(--muted);font-size:8px}.map-preview>a{display:flex;align-items:center;justify-content:center;gap:6px}
  .customer-finance > div {
    display: grid;
    gap: 13px;
    margin-top: 17px;
  }
  .customer-finance p {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--muted);
    font-size: 9px;
    margin: 0;
  }
  .customer-finance strong {
    color: var(--text);
    font-size: 13px;
  }
  .customer-finance strong.paid {
    color: #22a866;
  }
  .mini-orders {
    display: grid;
    margin-top: 14px;
  }
  .mini-orders a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid var(--line);
  }
  .mini-orders a > span:first-child {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .mini-orders strong {
    font-size: 10px;
  }
  .mini-orders small,
  .mini-orders a > span:last-child,
  .empty-detail {
    font-size: 8px;
    color: var(--muted);
  }
  .row-actions .view {
    color: var(--purple);
  }
  .empty-detail {
    margin: 18px 0 0;
  }
  @media (max-width: 900px) {
    .customer-overview {
      grid-template-columns: 1fr;
    }
    .customer-projects {
      grid-column: auto;
    }
    .contact-grid {
      grid-template-columns: 1fr;
    }
  }
  .list-tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }
  .filter {
    width: 260px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 0 11px;
    background: var(--card);
    color: var(--muted);
  }
  .filter input {
    height: 36px;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    width: 100%;
    font-size: 11px;
  }
  .tool-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .tool-actions > span {
    font-size: 10px;
    color: var(--muted);
  }
  .archive-toggle {
    height: 32px;
    display: flex;
    align-items: center;
    gap: 7px;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 0 6px 0 10px;
    color: var(--muted);
    background: var(--card);
    font-size: 9px;
  }
  .archive-toggle.active {
    color: var(--purple);
    border-color: var(--purple);
    background: color-mix(in srgb, var(--purple) 8%, var(--card));
  }
  .archive-count {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: color-mix(in srgb, var(--purple) 12%, var(--theme-soft));
    color: var(--purple);
    font-size: 9px;
    font-weight: 700;
  }
  .archive-toggle.active .archive-count {
    background: var(--purple);
    color: #fff;
  }
  .clear {
    color: #63d38c !important;
  }
  .row-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 7px;
  }
  .action-cluster {
    display: flex;
    align-items: center;
    padding: 3px;
    border: 1px solid color-mix(in srgb, var(--purple) 18%, var(--line));
    border-radius: 10px;
    background: color-mix(in srgb, var(--theme-soft) 42%, var(--card));
    box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 7%, transparent);
  }
  .row-actions button,
  .row-actions a {
    flex: 0 0 29px;
    width: 29px;
    height: 29px;
    padding: 0;
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    border-radius: 7px;
    color: var(--muted);
    transition:
      color 0.18s ease,
      background 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.15s ease;
  }
  .action-cluster button + button,
  .action-cluster button + a,
  .action-cluster a + a {
    position: relative;
  }
  .action-cluster button + button::before,
  .action-cluster button + a::before,
  .action-cluster a + a::before {
    content: "";
    position: absolute;
    left: -1px;
    top: 7px;
    width: 1px;
    height: 15px;
    background: color-mix(in srgb, var(--line) 72%, transparent);
  }
  .row-actions button:not(:disabled):hover,
  .row-actions a:hover {
    background: var(--card);
    color: var(--text);
    box-shadow: 0 4px 12px #00000012;
    transform: translateY(-1px);
  }
  .row-actions button:focus-visible,
  .row-actions a:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--purple) 65%, transparent);
    outline-offset: 2px;
  }
  .row-actions button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .row-actions .view,
  .row-actions .portal-action {
    color: var(--purple);
  }
  .row-actions .view {
    background: color-mix(in srgb, var(--purple) 11%, var(--card));
  }
  .row-actions .restore {
    color: #38bdf8;
  }
  .row-actions .whatsapp {
    color: #16c967;
  }
  .row-actions > .danger {
    border: 1px solid color-mix(in srgb, #ef7777 25%, var(--line));
    background: color-mix(in srgb, #ef7777 6%, var(--card));
    color: #ef7777;
    border-radius: 9px;
  }
  .row-actions > .danger:hover {
    border-color: color-mix(in srgb, #ef7777 60%, var(--line));
    background: color-mix(in srgb, #ef7777 13%, var(--card));
    color: #e94e62;
  }
  .archived td {
    text-decoration: line-through;
    color: var(--muted);
  }
  .archived .row-actions,
  .archived .row-actions button {
    text-decoration: none;
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
  @media (max-width: 800px) {
    .customer-table th:nth-child(1) {
      width: 24%;
    }
    .customer-table th:nth-child(2) {
      width: 16%;
    }
    .customer-table th:nth-child(3) {
      width: 10%;
    }
    .customer-table th:nth-child(4) {
      width: 14%;
    }
    .customer-table th:nth-child(5) {
      width: 36%;
    }
  }
  @media (max-width: 600px) {
    .filter {
      width: 190px;
    }
    .tool-actions > span {
      display: none;
    }
  }
  .action-cluster .portal-copy {
    display: flex;
    width: auto;
    min-width: 62px;
    padding: 0 8px;
    gap: 5px;
    color: var(--purple);
  }
  .portal-copy span {
    font-size: 8px;
    font-weight: 700;
  }
  .profile-actions {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .whatsapp-detail {
    color: #16a34a;
  }
  .customer-actions-panel,
  .portal-panel {
    margin-top: 14px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--theme-soft);
    padding: 10px;
  }
  .customer-actions-panel {
    display: grid;
    gap: 8px;
  }
  .customer-actions-panel > button {
    display: grid;
    grid-template-columns: 24px 1fr auto;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: var(--card);
    padding: 11px;
    color: inherit;
    text-align: left;
  }
  .customer-actions-panel > button > span,
  .invoice-choice-head > span,
  .customer-invoice-list > div > span,
  .customer-invoice-list > a > span:first-child,
  .portal-panel > span {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .customer-actions-panel strong,
  .invoice-choice-head strong,
  .customer-invoice-list strong,
  .portal-panel strong {
    font-size: 10px;
  }
  .customer-actions-panel small,
  .invoice-choice-head small,
  .customer-invoice-list small,
  .portal-panel small {
    color: var(--muted);
    font-size: 8px;
  }
  .invoice-choice-head {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 2px 2px 9px;
    border-bottom: 1px solid var(--line);
  }
  .invoice-choice-head > button {
    display: flex;
    align-items: center;
    gap: 4px;
    border: 0;
    background: transparent;
    color: var(--purple);
    font-size: 8px;
  }
  .invoice-choice-head > button :global(svg) {
    transform: rotate(180deg);
  }
  .customer-invoice-list {
    display: grid;
  }
  .customer-invoice-list > div,
  .customer-invoice-list > a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 2px;
    border-bottom: 1px solid var(--line);
    color: inherit;
  }
  .customer-invoice-list > div > button {
    display: flex;
    align-items: center;
    gap: 5px;
    border: 0;
    border-radius: 8px;
    background: #16a34a;
    color: #fff;
    padding: 8px 10px;
    font-size: 8px;
    font-weight: 700;
  }
  .customer-invoice-list em {
    color: var(--purple);
    font-size: 8px;
    font-style: normal;
  }
  .customer-invoice-list > a > span:last-child {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--purple);
    font-size: 8px;
    font-weight: 700;
  }
  .customer-invoice-list > p {
    margin: 10px 2px;
    color: var(--muted);
    font-size: 8px;
  }
  .portal-panel {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .portal-panel > span {
    margin-right: auto;
  }
  .portal-panel button,
  .portal-panel a {
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
  @media (max-width: 620px) {
    .profile-head {
      gap: 12px;
    }
    .profile-actions {
      align-items: stretch;
      flex-direction: column;
    }
    .portal-panel {
      align-items: stretch;
      flex-wrap: wrap;
    }
    .portal-panel > span {
      flex: 1 0 100%;
    }
    .customer-invoice-list > div,
    .customer-invoice-list > a {
      align-items: flex-start;
    }
    .customer-table th:nth-child(5) {
      width: 44%;
    }
  }
</style>
