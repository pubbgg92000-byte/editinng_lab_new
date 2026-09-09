<!-- Public customer portal: current orders, progress, billing, receipts, and delivery links. -->
<script lang="ts">
  import { untrack } from "svelte";
  import {
    ArrowUpRight,
    Check,
    ChevronDown,
    Clock3,
    Download,
    Eye,
    FileText,
    Printer,
  } from "@lucide/svelte";
  import WhatsAppIcon from "$lib/components/WhatsAppIcon.svelte";
  import PortalHeader from "$lib/components/PortalHeader.svelte";
  import CustomFieldValues from "$lib/components/CustomFieldValues.svelte";
  import ProgressDisplay from "$lib/components/ProgressDisplay.svelte";
  import { formatDate, money } from "$lib/data";
  import { orderCode } from "$lib/identifiers";
  import type { Invoice, Order } from "$lib/types";
  import { hasCapability, labelFor, statusFor } from "$lib/capabilities";
  import { customerPortalSections } from "$lib/moduleConfiguration";
  import { whatsappNumber } from "$lib/phone";

  let { data } = $props();
  let selected = $state<Order | null>(untrack(() => data.orders[0] || null));
  let documentsOpen = $state(false);
  const portalConfiguration = $derived(data.configuration.moduleConfiguration["portal.customer"]);
  const portalSections = $derived(customerPortalSections(portalConfiguration));
  const tasksEnabled = $derived(portalSections.tasks && hasCapability(data.configuration.effectiveCapabilities, "work.tasks"));
  const paymentsEnabled = $derived(portalSections.payments && hasCapability(data.configuration.effectiveCapabilities, "billing.payments"));
  const invoicesEnabled = $derived(portalSections.documents && hasCapability(data.configuration.effectiveCapabilities, "billing.invoices"));
  const billingEnabled = $derived(portalSections.billing && (paymentsEnabled || invoicesEnabled));
  const deliveryEnabled = $derived(portalSections.delivery && hasCapability(data.configuration.effectiveCapabilities, "workflow.delivery"));
  const whatsappEnabled = $derived(hasCapability(data.configuration.effectiveCapabilities, "communications.whatsapp"));
  const customFieldsEnabled = $derived(portalSections.customFields && hasCapability(data.configuration.effectiveCapabilities, "customFields"));
  const firstName = $derived(
    (data.customer.name || data.customer.business || "there").split(" ")[0],
  );
  const outputLink = $derived(
    selected ? data.deliveryLinks?.[selected.id] || "" : "",
  );
  const discountPercent = $derived(
    selected && selected.price > 0
      ? Math.round((selected.discount / selected.price) * 10000) / 100
      : 0,
  );
  const selectedInvoices = $derived(
    selected
      ? data.invoices.filter(
          (invoice: { orderId: string }) => invoice.orderId === selected?.id,
        )
      : [],
  );
  const allInvoiceRows = $derived(
    (data.invoices as Invoice[])
      .map((invoice) => ({
        invoice,
        order: (data.orders as Order[]).find(
          (order) => order.id === invoice.orderId,
        ),
      }))
      .filter((row: { order: unknown }) => row.order)
      .sort(
        (
          left: { invoice: { openedAt: string } },
          right: { invoice: { openedAt: string } },
        ) => right.invoice.openedAt.localeCompare(left.invoice.openedAt),
      ),
  );
  const deliveryCopy = $derived(({
    digital: { title: "Delivered files", ready: "Your files are ready", action: "View delivered files" },
    pickup: { title: "Pickup details", ready: "Your order is ready for pickup", action: "View pickup details" },
    appointment: { title: "Appointment details", ready: "Your appointment details are ready", action: "View appointment details" },
    fulfilment: { title: "Order fulfilment", ready: "Your order details are ready", action: "View order details" },
    handover: { title: "Handover details", ready: "Your handover details are ready", action: "View handover details" },
    completion: { title: "Completion details", ready: "Your completion details are ready", action: "View completion details" }
  } as const)[portalConfiguration.deliveryExperience]);
  const studioPhone = $derived(whatsappNumber(data.settings?.phone));
  const portalLabel = $derived(
    portalConfiguration.mode === "status-only"
      ? "Private status"
      : billingEnabled || invoicesEnabled
        ? "Private status & billing"
        : "Customer portal",
  );
  const socialImage = $derived(`${data.appUrl}/nexadesk-social.png`);
</script>

<svelte:head>
  <title>Secure customer portal — {data.settings.studioName}</title>
  <meta
    property="og:title"
    content={`${data.settings.studioName} — Secure customer portal`}
  />
  <meta
    property="og:description"
    content={`Privately view service progress, billing, documents, and delivery updates from ${data.settings.studioName}.`}
  />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={data.settings.studioName} />
  <meta property="og:url" content={data.pageUrl} />
  <meta property="og:image" content={socialImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={`${data.settings.studioName} secure customer portal`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${data.settings.studioName} — Secure customer portal`} />
  <meta name="twitter:description" content={`Private status, billing, document, and delivery access from ${data.settings.studioName}.`} />
  <meta name="twitter:image" content={socialImage} />
  <meta name="robots" content="noindex,nofollow" />
</svelte:head>
<PortalHeader label={portalLabel} settings={data.settings} themeScope={data.tenantSlug} />

<main class="customer-main">
  {#if portalSections.summary}<div class="hello">
    <p>Hello {firstName} 👋</p>
    <h1>{data.customer.business || data.customer.name}</h1>
    {#if customFieldsEnabled}<CustomFieldValues definitions={data.configuration.profile.customFields} entity="customer" values={data.customer.customFields} surface="customerPortal"/>{/if}
    <span>Your {labelFor(data.configuration.profile, "order", true).toLowerCase()}, status, billing and approved files.</span>
  </div>{/if}
  <div class="portal-shortcuts">
    {#if portalSections.progress}<a href="#work-status"><Clock3 size={14} /> View {labelFor(data.configuration.profile, "order").toLowerCase()} status</a>{/if}{#if invoicesEnabled}<a
      href="#documents"
      onclick={() => (documentsOpen = true)}
      ><FileText size={14} /> Invoices & receipts</a
    >{/if}{#if whatsappEnabled && studioPhone}<a
        class="contact"
        href={`https://wa.me/${studioPhone}`}
        target="_blank"
        rel="noreferrer"><WhatsAppIcon size={15} /> Contact {data.settings.studioName}</a
      >{/if}
  </div>
  {#if !selected}
    <section class="empty card">
      <FileText size={24} />
      <h2>No {labelFor(data.configuration.profile, "project", true).toLowerCase()} yet</h2>
      <p>{data.settings.studioName} will add them here after creating a {labelFor(data.configuration.profile, "order").toLowerCase()}.</p>
    </section>
  {:else}
    <div class="orders-heading">
      <h2>{labelFor(data.configuration.profile, "order", true)}</h2>
      <span
        >{data.orders.length}
        {data.orders.length === 1 ? labelFor(data.configuration.profile, "order").toLowerCase() : labelFor(data.configuration.profile, "order", true).toLowerCase()}</span
      >
    </div>
    <div class="project-switch">
      {#each data.orders as order}<button
          class:active={selected.id === order.id}
          onclick={() => (selected = order)}
          >{orderCode(data.settings, order.serial)} · {order.project}</button
        >{/each}
    </div>
    {#if portalSections.summary || portalSections.progress}<section id="work-status" class="project-card card">
      {#if portalSections.summary}
      <div class="project-head">
        <div>
          <span>{selected.workType || labelFor(data.configuration.profile, "project")}</span>
          <h2>{selected.project}</h2>
          {#if customFieldsEnabled}<CustomFieldValues definitions={data.configuration.profile.customFields} entity="order" values={selected.customFields} surface="customerPortal"/>{/if}
          <p>
            {labelFor(data.configuration.profile, "order")} {orderCode(data.settings, selected.serial)}
            {selected.due ? `· ${labelFor(data.configuration.profile, "dueDate")} ${formatDate(selected.due)}` : ""}
          </p>
        </div>
        {#if portalConfiguration.progressMode === "milestones"}<span class="percent"><strong>{statusFor(data.configuration.profile, selected.status).label}</strong> current status</span>{/if}
      </div>
      {/if}
      {#if portalSections.progress}<div class="customer-progress"><ProgressDisplay milestones={portalConfiguration.milestones} status={selected.status} percent={selected.progress} mode={portalConfiguration.progressMode} label={`${labelFor(data.configuration.profile, "order")} progress`}/></div>{/if}
    </section>{/if}
    {#if tasksEnabled}
      <section class="card task-summary">
        <div class="section-title">
          <span><Check size={16} /></span>
          <div>
            <h2>{labelFor(data.configuration.profile, "task", true)}</h2>
            <p>Current progress for this {labelFor(data.configuration.profile, "order").toLowerCase()}</p>
          </div>
        </div>
        {#if selected.tasks.length}
          <div class="customer-tasks">
            {#each selected.tasks as task}
              <article>
                <div><strong>{task.name}</strong><small>{task.due ? `${labelFor(data.configuration.profile, "dueDate")} ${formatDate(task.due)}` : "No date set"}</small></div>
                <span>{statusFor(data.configuration.profile, task.status).label} · {task.progress}%</span>
              </article>
            {/each}
          </div>
        {:else}<p class="empty-task-list">No {labelFor(data.configuration.profile, "task", true).toLowerCase()} have been shared yet.</p>{/if}
      </section>
    {/if}
    <div class="customer-grid">
      {#if billingEnabled || invoicesEnabled}<section id="bill" class="card invoice">
        <div class="section-title">
          <span><FileText size={16} /></span>
          <div>
            <h2>{billingEnabled ? "Billing summary" : "Invoices & receipts"}</h2>
            <p>{billingEnabled ? "Payments, invoices and remaining balance" : "Your billing documents"}</p>
          </div>
        </div>
        {#if billingEnabled}
        <div class="money-grid">
          <div>
            <span
              >{discountPercent > 0
                ? `Total after ${discountPercent}% discount`
                : "Total amount"}</span
            ><strong
              >{selected.priceSet === false
                ? "Not set"
                : money(
                    Math.max(0, selected.price - selected.discount),
                  )}</strong
            >
          </div>
          <div>
            <span>Paid / advance</span><strong class="green"
              >{selected.advanceSet === false &&
              !(selected.payments || []).length
                ? "Not recorded"
                : money(selected.paid)}</strong
            >
          </div>
          <div>
            <span>Balance</span><strong
              >{selected.priceSet === false
                ? "Not set"
                : money(
                    Math.max(
                      0,
                      selected.price - selected.discount - selected.paid,
                    ),
                  )}</strong
            >
          </div>
        </div>
        {#if paymentsEnabled && ((selected.initialAdvance || 0) > 0 || (selected.payments || []).length)}<div
            class="ledger"
          >
            <h3>Payment history</h3>
            {#if (selected.initialAdvance || 0) > 0}<div>
                <span
                  ><strong>Opening advance</strong><small
                    >Recorded with the order</small
                  ></span
                ><b>{money(selected.initialAdvance || 0)}</b>
              </div>{/if}{#each selected.payments || [] as payment}<div>
                <span
                  ><strong
                    >{payment.kind === "advance"
                      ? "Advance collected"
                      : "Payment received"}</strong
                  ><small>{formatDate(payment.paidAt)} · {payment.method}</small
                  ></span
                ><b>{money(payment.amount)}</b>
              </div>{/each}
          </div>{/if}
        {/if}
        {#if invoicesEnabled}<div id="documents" class="invoice-history">
          <h3>
            <button
              aria-expanded={documentsOpen}
              onclick={() => (documentsOpen = !documentsOpen)}
              >Invoices & receipts <span>{allInvoiceRows.length}</span
              ><ChevronDown class={documentsOpen ? "open" : ""} size={14} /></button
            >
          </h3>
          {#if documentsOpen}<p class="document-note">
              View a document online or open the print dialog to save it as a PDF.
            </p>
            {#each allInvoiceRows as row, index}<article class="document-row">
                <span class="document-icon"><FileText size={14} /></span>
                <span class="document-copy"
                  ><strong
                    >{row.invoice.number}{#if index === 0}<i>Latest</i
                      >{/if}</strong
                  ><small
                    >{row.invoice.kind === "final"
                      ? "Final invoice"
                      : row.invoice.kind === "partial"
                        ? "Partial work invoice"
                        : row.invoice.kind === "advance"
                          ? "Advance receipt"
                          : "Payment receipt"} · {formatDate(
                      row.invoice.openedAt,
                    )}</small
                  ><em
                    >{row.order?.project || "Order"} · {row.invoice.balance > 0
                      ? `Balance ${money(row.invoice.balance)}`
                      : "Paid in full"}</em
                  ></span
                >
                <span class="document-actions"
                  ><a
                    class="view-document"
                    href={`/portal/${data.tenantSlug}/customer/${data.token}/invoice/${row.invoice.id}`}
                    target="_blank"
                    rel="noreferrer"><Eye size={13}/> View</a
                  ><a
                    class="save-document"
                    href={`/portal/${data.tenantSlug}/customer/${data.token}/invoice/${row.invoice.id}?print=1`}
                    target="_blank"
                    rel="noreferrer"
                    ><Printer size={13} /> Print / Save PDF</a
                  ></span
                >
              </article>{/each}
            {#if !allInvoiceRows.length}<p class="empty-documents">
                No invoices or receipts have been generated yet.
              </p>{/if}{/if}
        </div>{/if}
      </section>{/if}
      {#if deliveryEnabled}<section class="card delivery">
        <div class="section-title">
          <span><Download size={16} /></span>
          <div>
            <h2>{deliveryCopy.title}</h2>
            <p>
              {outputLink
                ? deliveryCopy.ready
                : selected.status === "Delivered" &&
                    selected.deliveryMethod === "offline"
                  ? `${labelFor(data.configuration.profile, "delivery")} completed offline`
                  : `Available when the ${labelFor(data.configuration.profile, "order").toLowerCase()} is ready`}
            </p>
          </div>
        </div>
        {#if outputLink}<a href={outputLink} target="_blank" rel="noreferrer"
            >{deliveryCopy.action} <ArrowUpRight size={13} /></a
          >{:else if selected.status === "Delivered" && selected.deliveryMethod === "offline"}<span
            class="delivered-offline"
            ><Check size={14} /> {labelFor(data.configuration.profile, "delivery")} completed {selected.deliveredAt
              ? formatDate(selected.deliveredAt)
              : ""}</span
          >{:else}<span class="locked">{labelFor(data.configuration.profile, "delivery")} details will appear here</span
          >{/if}
      </section>{/if}
    </div>
  {/if}
  {#if whatsappEnabled && studioPhone}<a
      class="whatsapp"
      href={`https://wa.me/${studioPhone}`}
      target="_blank"
      rel="noreferrer"><WhatsAppIcon size={17} /> Contact {data.settings.studioName} on WhatsApp</a
    >{/if}
  <p class="privacy">
    This private link shows only your workspace records and the details shared with you.
  </p>
</main>

<style>
  .customer-main {
    max-width: 820px;
    margin: 0 auto;
    padding: 62px 22px 80px;
  }
  .hello {
    text-align: center;
    margin-bottom: 22px;
  }
  .hello p {
    color: var(--purple);
    font-size: 11px;
    margin: 0 0 8px;
  }
  .hello h1 {
    font-size: 27px;
    margin: 0;
  }
  .hello > span {
    display: block;
    color: var(--muted);
    font-size: 10px;
    margin-top: 8px;
  }
  .portal-shortcuts {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .portal-shortcuts a {
    height: 34px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: var(--card);
    color: var(--purple);
    padding: 0 11px;
    font-size: 9px;
  }
  .portal-shortcuts a.contact {
    border-color: #22c55e55;
    background: #22c55e10;
    color: #2fbf69;
  }
  .empty {
    text-align: center;
    padding: 52px;
    color: var(--muted);
  }
  .empty h2 {
    font-size: 16px;
    color: inherit;
  }
  .empty p {
    font-size: 10px;
  }
  .project-switch {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 13px;
    flex-wrap: wrap;
  }
  .project-switch button {
    border: 1px solid var(--line);
    background: var(--card);
    color: var(--muted);
    border-radius: 8px;
    padding: 8px 11px;
    font-size: 9px;
  }
  .project-switch button.active {
    border-color: var(--purple);
    color: var(--purple);
  }
  .project-card {
    padding: 22px;
    scroll-margin-top: 18px;
  }
  .task-summary {
    margin-top: 14px;
    padding: 22px;
  }
  .customer-tasks {
    display: grid;
    gap: 8px;
    margin-top: 16px;
  }
  .customer-tasks article {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 11px 12px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: var(--theme-soft);
  }
  .customer-tasks article > div {
    display: grid;
    gap: 3px;
    min-width: 0;
  }
  .customer-tasks strong {
    overflow: hidden;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .customer-tasks small,
  .customer-tasks article > span,
  .empty-task-list {
    color: var(--muted);
    font-size: 8px;
  }
  .customer-tasks article > span {
    flex: none;
    color: var(--purple);
    font-weight: 700;
  }
  .empty-task-list {
    margin: 16px 0 0;
  }
  .project-head {
    display: flex;
    justify-content: space-between;
  }
  .project-head > div > span {
    color: var(--purple);
    font-size: 9px;
  }
  .project-head h2 {
    font-size: 18px;
    margin: 5px 0;
  }
  .project-head p {
    color: var(--muted);
    font-size: 9px;
    margin: 0;
  }
  .percent {
    display: flex;
    flex-direction: column;
    text-align: right;
    color: var(--muted);
    font-size: 8px;
    gap: 2px;
  }
  .percent strong {
    font-size: 18px;
  }
  .customer-progress {
    margin-top: 34px;
  }
  .customer-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    align-items: start;
    gap: 13px;
    margin-top: 13px;
  }
  .invoice,
  .delivery {
    padding: 19px;
    scroll-margin-top: 18px;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-title > span {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--theme-soft);
    color: var(--purple);
    display: grid;
    place-items: center;
  }
  .section-title h2 {
    font-size: 11px;
    margin: 0;
  }
  .section-title p {
    font-size: 8px;
    color: var(--muted);
    margin: 3px 0 0;
  }
  .money-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    border-top: 1px solid var(--line);
    margin-top: 17px;
    padding-top: 14px;
  }
  .money-grid div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .money-grid span {
    color: var(--muted);
    font-size: 8px;
  }
  .money-grid strong {
    font-size: 13px;
  }
  .money-grid .green {
    color: #5dd087;
  }
  .delivery > a,
  .locked {
    margin-top: 18px;
    min-height: 40px;
    box-sizing: border-box;
    border: 1px solid var(--line);
    background: color-mix(in srgb, var(--purple) 7%, var(--card));
    color: var(--purple);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    font-size: 9px;
    font-weight: 700;
    text-align: center;
    transition: border-color .18s ease, background .18s ease, transform .18s ease;
  }
  .delivery > a:hover {
    border-color: var(--purple);
    background: color-mix(in srgb, var(--purple) 12%, var(--card));
    transform: translateY(-1px);
  }
  .locked {
    color: var(--muted);
  }
  .whatsapp {
    width: max-content;
    margin: 24px auto 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #62d58b;
    font-size: 10px;
  }
  .privacy {
    text-align: center;
    color: var(--muted);
    font-size: 8px;
    margin-top: 23px;
  }
  @media (max-width: 650px) {
    .customer-main {
      padding-top: 40px;
    }
    .customer-grid {
      grid-template-columns: 1fr;
    }
    .project-head {
      gap: 15px;
    }
  }
  .ledger {
    margin-top: 15px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }
  .ledger h3 {
    margin: 0 0 5px;
    font-size: 10px;
  }
  .ledger > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--line);
  }
  .ledger > div:last-child {
    border: 0;
  }
  .ledger > div span {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .ledger strong,
  .ledger b {
    font-size: 9px;
  }
  .ledger small {
    color: var(--muted);
    font-size: 8px;
  }
  .delivered-offline {
    margin-top: 18px;
    min-height: 36px;
    border: 1px solid #22c55e45;
    background: #22c55e0c;
    color: #16a34a;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    font-size: 9px;
    text-align: center;
  }
  .invoice-history {
    margin-top: 15px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }
  .invoice-history > h3 {
    margin: 0;
  }
  .invoice-history > h3 button {
    width: 100%; display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 7px; border: 0; background: transparent; color: inherit; padding: 0; text-align: left; font-size: 10px;
  }
  .invoice-history > h3 button :global(svg) { color: var(--muted); transition: transform .2s; }
  .invoice-history > h3 button :global(svg.open) { transform: rotate(180deg); }
  .invoice-history > h3 span {
    min-width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    border-radius: 99px;
    background: var(--purple);
    color: #fff;
    font-size: 8px;
  }
  .document-note {
    color: var(--muted);
    font-size: 8px;
    line-height: 1.5;
  }
  .document-row {
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr) auto;
    align-items: center;
    gap: 9px;
    margin-top: 8px;
    padding: 10px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--theme-soft);
  }
  .document-icon {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: var(--card);
    color: var(--purple);
  }
  .document-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .document-copy strong {
    font-size: 9px;
  }
  .document-copy strong i {
    margin-left: 5px;
    padding: 2px 5px;
    border-radius: 99px;
    background: #22c55e1c;
    color: #16a34a;
    font-size: 6px;
    font-style: normal;
    text-transform: uppercase;
  }
  .document-copy small,
  .document-copy em {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--muted);
    font-size: 7px;
    font-style: normal;
  }
  .document-copy em {
    color: var(--purple);
  }
  .document-actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .invoice-history .document-actions a {
    min-height: 34px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 10px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: var(--card);
    color: var(--theme-text);
    font-size: 8px;
    font-weight: 700;
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
    transition: border-color .18s ease, background .18s ease, color .18s ease, transform .18s ease;
  }
  .invoice-history .document-actions .view-document {
    border-color: color-mix(in srgb, var(--purple) 72%, var(--line));
    background: var(--purple);
    color: var(--accent-text, #fff);
  }
  .invoice-history .document-actions .save-document {
    color: var(--purple);
  }
  .invoice-history .document-actions a:hover {
    border-color: var(--purple);
    transform: translateY(-1px);
  }
  .invoice-history .document-actions .save-document:hover {
    background: color-mix(in srgb, var(--purple) 8%, var(--card));
  }
  .invoice-history .document-actions a:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--purple) 22%, transparent);
    outline-offset: 2px;
  }
  .empty-documents {
    padding: 12px;
    text-align: center;
    color: var(--muted);
    font-size: 8px;
  }
  @media (max-width: 620px) {
    .document-row {
      grid-template-columns: 30px minmax(0, 1fr);
    }
    .document-actions {
      grid-column: 1/-1;
    }
    .document-actions a {
      flex: 1;
    }
    .customer-tasks article {
      align-items: flex-start;
      flex-direction: column;
      gap: 7px;
    }
  }
  .customer-progress{display:block;margin-top:28px}
</style>
