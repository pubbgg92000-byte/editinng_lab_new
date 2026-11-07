<!-- Public customer portal (phone-first): status and next step, money owed, tasks, documents, delivery, contact. -->
<script lang="ts">
  import { untrack } from "svelte";
  import { ArrowUpRight, Check, Download, Eye, FileText, Printer } from "@lucide/svelte";
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
  const profile = $derived(data.configuration.profile);
  const orderLabel = $derived(labelFor(profile, "order"));
  const orderPlural = $derived(labelFor(profile, "order", true));
  const portalConfiguration = $derived(data.configuration.moduleConfiguration["portal.customer"]);
  const portalSections = $derived(customerPortalSections(portalConfiguration));
  const capabilities = $derived(data.configuration.effectiveCapabilities);
  const tasksEnabled = $derived(portalSections.tasks && hasCapability(capabilities, "work.tasks"));
  const paymentsEnabled = $derived(portalSections.payments && hasCapability(capabilities, "billing.payments"));
  const invoicesEnabled = $derived(portalSections.documents && hasCapability(capabilities, "billing.invoices"));
  const billingEnabled = $derived(portalSections.billing && (paymentsEnabled || invoicesEnabled));
  const deliveryEnabled = $derived(portalSections.delivery && hasCapability(capabilities, "workflow.delivery"));
  const whatsappEnabled = $derived(hasCapability(capabilities, "communications.whatsapp"));
  const customFieldsEnabled = $derived(portalSections.customFields && hasCapability(capabilities, "customFields"));

  const doneStatuses = ["Delivered", "Completed", "Stopped", "Historical"];
  // Open the most relevant order first: the newest unfinished one, else the first.
  const firstOrder = untrack(() => (data.orders as Order[]).find((order) => !doneStatuses.includes(order.status)) || data.orders[0] || null);
  let selectedId = $state<string>(firstOrder?.id || "");
  const selected = $derived((data.orders as Order[]).find((order) => order.id === selectedId) || (data.orders as Order[])[0] || null);
  let showAllDocuments = $state(false);

  const firstName = $derived((data.customer.name || data.customer.business || "there").split(" ")[0]);
  const outputLink = $derived(selected ? data.deliveryLinks?.[selected.id] || "" : "");
  const balanceOf = (order: Order) => (order.priceSet === false ? 0 : Math.max(0, order.price - order.discount - order.paid));
  const totalDue = $derived((data.orders as Order[]).reduce((sum, order) => sum + balanceOf(order), 0));
  const discountPercent = $derived(selected && selected.price > 0 ? Math.round((selected.discount / selected.price) * 10000) / 100 : 0);

  const deliveryCopy = $derived(({
    digital: { title: "Your files", ready: "Your files are ready", action: "View your files" },
    pickup: { title: "Pickup details", ready: "Ready for pickup", action: "View pickup details" },
    appointment: { title: "Appointment details", ready: "Your appointment details are ready", action: "View appointment details" },
    fulfilment: { title: "Order details", ready: "Your order details are ready", action: "View order details" },
    handover: { title: "Handover details", ready: "Your handover details are ready", action: "View handover details" },
    completion: { title: "Completion details", ready: "Your completion details are ready", action: "View completion details" }
  } as const)[portalConfiguration.deliveryExperience]);

  // One plain sentence about what happens next for the selected order.
  const nextStep = $derived.by(() => {
    if (!selected) return { tone: "info", text: "" };
    const balance = balanceOf(selected);
    if (selected.status === "Delivered") return { tone: "done", text: selected.deliveryMethod === "offline" ? `Handed over${selected.deliveredAt ? ` on ${formatDate(selected.deliveredAt)}` : ""}. Thank you!` : "Delivered. Thank you!" };
    if (selected.status === "Completed") return { tone: "done", text: "All done. Thank you!" };
    if (selected.status === "Stopped") return { tone: "info", text: `This ${orderLabel.toLowerCase()} is on hold. Contact us if you have questions.` };
    if (outputLink && deliveryEnabled) return { tone: "done", text: deliveryCopy.ready };
    if (selected.status === "Ready Delivery") return billingEnabled && balance > 0 ? { tone: "due", text: `It's ready. ${money(balance)} is due before handover.` } : { tone: "done", text: "It's ready for you." };
    if (selected.status === "Waiting Review" || selected.status === "Revision") return { tone: "info", text: "We're checking the work and polishing the final details." };
    const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    // Only promise a date that is still ahead.
    return { tone: "info", text: selected.due && selected.due.slice(0, 10) >= todayIso ? `We're working on it. Expected by ${formatDate(selected.due)}.` : "We're working on it. We'll update you here as it moves along." };
  });

  const documentRows = $derived((data.invoices as Invoice[])
    .map((invoice) => ({ invoice, order: (data.orders as Order[]).find((order) => order.id === invoice.orderId) }))
    .filter((row) => row.order)
    .sort((left, right) => right.invoice.openedAt.localeCompare(left.invoice.openedAt)));
  const selectedDocuments = $derived(documentRows.filter((row) => row.invoice.orderId === selected?.id));
  const visibleDocuments = $derived(showAllDocuments || !selectedDocuments.length ? documentRows : selectedDocuments);
  const kindLabel = (invoice: Invoice) => invoice.kind === "final" ? "Invoice" : invoice.kind === "partial" ? "Part invoice" : invoice.kind === "advance" ? "Advance receipt" : "Payment receipt";

  const studioPhone = $derived(whatsappNumber(data.settings?.phone));
  const portalLabel = $derived(portalConfiguration.mode === "status-only" ? "Private status" : billingEnabled || invoicesEnabled ? "Private status & billing" : "Customer portal");
  const socialImage = $derived(`${data.appUrl}/nexadesk-social.png`);
  const documentHref = (invoice: Invoice, print = false) => `/portal/${data.tenantSlug}/customer/${data.token}/invoice/${invoice.id}${print ? "?print=1" : ""}`;
</script>

<svelte:head>
  <title>Secure customer portal — {data.settings.studioName}</title>
  <meta property="og:title" content={`${data.settings.studioName} — Secure customer portal`} />
  <meta property="og:description" content={`Privately view service progress, billing, documents, and delivery updates from ${data.settings.studioName}.`} />
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

<main class="portal">
  {#if portalSections.summary}
    <header class="hello">
      <p>Hi {firstName} 👋</p>
      <h1>{data.customer.business || data.customer.name}</h1>
      {#if customFieldsEnabled}<CustomFieldValues definitions={profile.customFields} entity="customer" values={data.customer.customFields} surface="customerPortal" />{/if}
    </header>
  {/if}

  {#if billingEnabled && data.orders.length > 1 && totalDue > 0}
    <p class="owe-all">Total still due across your {orderPlural.toLowerCase()}: <strong>{money(totalDue)}</strong></p>
  {/if}

  {#if !selected}
    <section class="card empty">
      <FileText size={24} aria-hidden="true" />
      <h2>Nothing here yet</h2>
      <p>{data.settings.studioName} will add your {orderPlural.toLowerCase()} here once they're created.</p>
    </section>
  {:else}
    {#if data.orders.length > 1}
      <div class="switch">
        <label for="order-switch">Showing</label>
        <select id="order-switch" bind:value={selectedId}>
          {#each data.orders as order (order.id)}
            <option value={order.id}>{order.project || orderCode(data.settings, order.serial)} · {statusFor(profile, order.status).label}{billingEnabled && balanceOf(order) > 0 ? ` · ${money(balanceOf(order))} due` : ""}</option>
          {/each}
        </select>
      </div>
    {/if}

    <section class="card status" id="work-status" aria-labelledby="status-title">
      <div class="status-top">
        <div>
          <p class="kicker">{selected.workType || labelFor(profile, "project")} · {orderCode(data.settings, selected.serial)}</p>
          <h2 id="status-title">{selected.project}</h2>
          {#if selected.due && !doneStatuses.includes(selected.status)}<p class="due">{labelFor(profile, "dueDate")}: {formatDate(selected.due)}</p>{/if}
        </div>
        <span class="status-badge">{statusFor(profile, selected.status).label}</span>
      </div>
      {#if customFieldsEnabled}<CustomFieldValues definitions={profile.customFields} entity="order" values={selected.customFields} surface="customerPortal" />{/if}
      {#if portalSections.progress}<div class="progress-wrap"><ProgressDisplay milestones={portalConfiguration.milestones} status={selected.status} percent={selected.progress} mode={portalConfiguration.progressMode} label={`${orderLabel} progress`} /></div>{/if}
      <p class={`next ${nextStep.tone}`}>{#if nextStep.tone === "done"}<Check size={16} aria-hidden="true" />{/if}{nextStep.text}</p>
      {#if deliveryEnabled && outputLink}<a class="primary-action" href={outputLink} target="_blank" rel="noreferrer">{deliveryCopy.action}<ArrowUpRight size={16} aria-hidden="true" /></a>{/if}
    </section>

    {#if billingEnabled}
      <section class="card" id="bill" aria-labelledby="bill-title">
        <h2 id="bill-title">Payment</h2>
        <dl class="money">
          <div><dt>{discountPercent > 0 ? `Total after ${discountPercent}% discount` : "Total"}</dt><dd>{selected.priceSet === false ? "Not set yet" : money(Math.max(0, selected.price - selected.discount))}</dd></div>
          <div><dt>Paid</dt><dd class="paid">{selected.advanceSet === false && !(selected.payments || []).length ? "Nothing yet" : money(selected.paid)}</dd></div>
          <div class="balance"><dt>Still due</dt><dd>{selected.priceSet === false ? "Not set yet" : balanceOf(selected) > 0 ? money(balanceOf(selected)) : "Nothing. Fully paid"}</dd></div>
        </dl>
        {#if paymentsEnabled && ((selected.initialAdvance || 0) > 0 || (selected.payments || []).length)}
          <details class="ledger">
            <summary>Payment history</summary>
            <ul>
              {#if (selected.initialAdvance || 0) > 0}<li><span><strong>Advance at booking</strong></span><b>{money(selected.initialAdvance || 0)}</b></li>{/if}
              {#each selected.payments || [] as payment}<li><span><strong>{payment.kind === "advance" ? "Advance" : "Payment"}</strong><small>{formatDate(payment.paidAt)}{payment.method ? ` · ${payment.method}` : ""}</small></span><b>{money(payment.amount)}</b></li>{/each}
            </ul>
          </details>
        {/if}
      </section>
    {/if}

    {#if invoicesEnabled}
      <section class="card" id="documents" aria-labelledby="docs-title">
        <h2 id="docs-title">Bills and receipts</h2>
        {#if visibleDocuments.length}
          {#if !selectedDocuments.length}<p class="muted doc-note">No bills for this {orderLabel.toLowerCase()} yet. Showing your other bills.</p>{/if}
          <ul class="docs">
            {#each visibleDocuments as row (row.invoice.id)}
              <li>
                <span class="doc-icon"><FileText size={16} aria-hidden="true" /></span>
                <span class="doc-text"><strong>{kindLabel(row.invoice)} {row.invoice.number}</strong><small>{formatDate(row.invoice.openedAt)}{showAllDocuments || !selectedDocuments.length ? ` · ${row.order?.project}` : ""}</small></span>
                <span class="doc-actions">
                  <a href={documentHref(row.invoice)} class="doc-btn"><Eye size={15} aria-hidden="true" />View</a>
                  <a href={documentHref(row.invoice, true)} class="doc-btn"><Printer size={15} aria-hidden="true" />PDF</a>
                </span>
              </li>
            {/each}
          </ul>
          {#if selectedDocuments.length && documentRows.length > selectedDocuments.length}
            <button type="button" class="text-btn" onclick={() => (showAllDocuments = !showAllDocuments)}>{showAllDocuments ? `Show only this ${orderLabel.toLowerCase()}` : `Show all (${documentRows.length})`}</button>
          {/if}
        {:else}
          <p class="muted">No bills or receipts yet.</p>
        {/if}
      </section>
    {/if}

    {#if tasksEnabled}
      <section class="card" aria-labelledby="tasks-title">
        <details open={selected.tasks.length <= 4}>
          <summary><h2 id="tasks-title">Work steps <span class="muted">({selected.tasks.length})</span></h2></summary>
          {#if selected.tasks.length}
            <ul class="steps">
              {#each selected.tasks as task (task.id)}
                <li>
                  <span><strong>{task.name}</strong>{#if task.due}<small>{labelFor(profile, "dueDate")} {formatDate(task.due)}</small>{/if}</span>
                  <span class="step-state">{statusFor(profile, task.status).label}<small>{task.progress}%</small></span>
                </li>
              {/each}
            </ul>
          {:else}<p class="muted">No steps shared yet.</p>{/if}
        </details>
      </section>
    {/if}

    {#if deliveryEnabled && !outputLink}
      <section class="card" aria-labelledby="delivery-title">
        <h2 id="delivery-title"><Download size={17} aria-hidden="true" />{deliveryCopy.title}</h2>
        {#if selected.status === "Delivered" && selected.deliveryMethod === "offline"}
          <p class="next done"><Check size={16} aria-hidden="true" />{labelFor(profile, "delivery")} completed{selected.deliveredAt ? ` on ${formatDate(selected.deliveredAt)}` : ""}.</p>
        {:else}
          <p class="muted">These will appear here when your {orderLabel.toLowerCase()} is ready.</p>
        {/if}
      </section>
    {/if}
  {/if}

  {#if whatsappEnabled && studioPhone}
    <a class="contact" href={`https://wa.me/${studioPhone}`} target="_blank" rel="noreferrer"><WhatsAppIcon size={18} />Message {data.settings.studioName} on WhatsApp</a>
  {/if}
  <p class="privacy">This is your private page. Only you and {data.settings.studioName} can see it.</p>
</main>

<style>
  .portal { max-width: 680px; margin: 0 auto; padding: 24px 16px 48px; display: grid; gap: 14px; color: var(--theme-text); }
  .card { padding: 18px; border: 1px solid var(--line); border-radius: 16px; background: var(--card); }
  h2 { margin: 0 0 12px; font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  .muted { color: var(--muted); font-size: 14px; margin: 0; }

  .hello p { margin: 0; font-size: 15px; color: var(--muted); }
  .hello h1 { margin: 2px 0 0; font-size: 26px; line-height: 1.2; font-weight: 750; letter-spacing: -.02em; overflow-wrap: anywhere; }
  .owe-all { margin: 0; padding: 12px 14px; border-radius: 12px; background: color-mix(in srgb, #d97706 12%, var(--card)); font-size: 15px; }
  .switch { display: grid; gap: 6px; }
  .switch label { font-size: 13px; font-weight: 600; color: var(--muted); }
  .switch select { width: 100%; min-height: 48px; padding: 0 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); color: var(--theme-text); font-size: 15px; }

  .status { display: grid; gap: 14px; }
  .status-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .status-top > div { min-width: 0; }
  .kicker { margin: 0 0 4px; font-size: 13px; color: var(--muted); }
  .status h2 { margin: 0; font-size: 21px; line-height: 1.25; overflow-wrap: anywhere; }
  .due { margin: 4px 0 0; font-size: 14px; color: var(--muted); }
  .status-badge { flex: 0 0 auto; padding: 6px 12px; border-radius: 999px; background: color-mix(in srgb, var(--purple) 14%, transparent); color: var(--theme-text); font-size: 14px; font-weight: 700; }
  .progress-wrap { min-width: 0; }
  .next { display: flex; align-items: flex-start; gap: 8px; margin: 0; padding: 12px 14px; border-radius: 12px; font-size: 15px; line-height: 1.45; background: var(--theme-soft); }
  .next.done { background: color-mix(in srgb, #16a34a 12%, var(--card)); color: #166534; }
  .next.due { background: color-mix(in srgb, #d97706 14%, var(--card)); color: #92400e; font-weight: 600; }
  .next :global(svg) { flex: 0 0 auto; margin-top: 2px; }
  .primary-action { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; border-radius: 12px; background: var(--purple); color: var(--accent-text, #fff); font-size: 16px; font-weight: 700; text-decoration: none; }

  .money { margin: 0; display: grid; gap: 10px; }
  .money div { display: flex; justify-content: space-between; gap: 12px; font-size: 15px; }
  .money dt { color: var(--muted); }
  .money dd { margin: 0; font-weight: 650; text-align: right; }
  .money .paid { color: #15803d; }
  .money .balance { padding-top: 10px; border-top: 1px solid var(--line); font-size: 17px; }
  .money .balance dt { color: var(--theme-text); font-weight: 650; }
  .ledger { margin-top: 12px; }
  .ledger summary, details summary { cursor: pointer; font-size: 14px; font-weight: 600; color: var(--purple); min-height: 40px; display: flex; align-items: center; }
  details summary h2 { margin: 0; color: var(--theme-text); }
  details summary::-webkit-details-marker { display: none; }
  details summary { list-style: none; }
  ul { list-style: none; margin: 0; padding: 0; }
  .ledger li, .steps li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
  .ledger li:last-child, .steps li:last-child { border-bottom: 0; }
  .ledger span, .steps span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .ledger small, .steps small { color: var(--muted); font-size: 13px; }
  .step-state { text-align: right; align-items: flex-end; font-weight: 600; }

  .docs li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 10px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line); }
  .docs li:last-child { border-bottom: 0; }
  .doc-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; background: var(--theme-soft); color: var(--purple); }
  .doc-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; font-size: 14px; }
  .doc-text small { color: var(--muted); font-size: 13px; }
  .doc-actions { grid-column: 2; display: flex; gap: 8px; margin-top: 6px; }
  .doc-btn { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border: 1px solid var(--line); border-radius: 10px; color: var(--theme-text); font-size: 14px; font-weight: 600; text-decoration: none; }
  .doc-note { margin-bottom: 4px; }
  .text-btn { margin-top: 8px; min-height: 40px; padding: 0; border: 0; background: none; color: var(--purple); font-size: 14px; font-weight: 600; cursor: pointer; }

  .empty { text-align: center; display: grid; justify-items: center; gap: 8px; }
  .empty h2 { margin: 0; }
  .contact { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; border-radius: 12px; background: #16a34a; color: #fff; font-size: 15px; font-weight: 700; text-decoration: none; }
  .privacy { margin: 4px 0 0; text-align: center; font-size: 13px; color: var(--muted); }

  @media (min-width: 640px) {
    .portal { padding-top: 36px; }
    .doc-actions { grid-column: auto; margin-top: 0; }
    .docs li { grid-template-columns: auto minmax(0, 1fr) auto; }
  }
</style>
