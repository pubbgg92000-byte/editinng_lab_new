<!-- Private customer invoice/receipt viewer with print/PDF support. -->
<script lang="ts">
  import { onMount } from "svelte";
  import { ArrowLeft, Printer } from "@lucide/svelte";
  import { page } from "$app/state";
  import PortalHeader from "$lib/components/PortalHeader.svelte";
  import { formatDate, formatDateTime, money } from "$lib/data";
  import { orderCode } from "$lib/identifiers";
  let { data } = $props();
  const discountPercent = $derived(
    data.invoice.subtotal > 0
      ? (data.invoice.discount / data.invoice.subtotal) * 100
      : 0,
  );
  const title = $derived(
    data.invoice.kind === "advance"
      ? "Advance receipt"
      : data.invoice.kind === "payment"
        ? "Payment receipt"
        : data.invoice.kind === "partial"
          ? "Partial work invoice"
          : "Invoice",
  );
  const isReceipt = $derived(data.invoice.kind === "advance" || data.invoice.kind === "payment");
  const portalHref = $derived(`/portal/${page.params.slug}/customer/${page.params.token}`);
  // In-app browsers (WhatsApp, Instagram, Facebook) usually ignore window.print(), so explain the workaround.
  let inAppBrowser = $state(false);
  onMount(() => {
    inAppBrowser = /WhatsApp|FBAN|FBAV|Instagram|; wv\)/i.test(navigator.userAgent);
    if (new URL(location.href).searchParams.get("print") === "1" && !inAppBrowser) setTimeout(() => window.print(), 250);
  });
</script>

<svelte:head
  ><title>{data.invoice.number} — {data.settings.studioName}</title><meta
    name="robots"
    content="noindex,nofollow"
  /></svelte:head
>
<div class="no-print">
  <PortalHeader label="Private invoice" settings={data.settings} themeScope={data.tenantSlug} />
</div>
<main>
  <div class="invoice-toolbar no-print">
    <a class="back" href={portalHref}><ArrowLeft size={16} aria-hidden="true" />Back to my orders</a>
    <button type="button" class="print" onclick={() => window.print()}><Printer size={16} aria-hidden="true" />Print / Save PDF</button>
  </div>
  {#if inAppBrowser}<p class="in-app-note no-print">To save this as a PDF, open the page in Chrome or Safari: tap the ⋮ or share menu, then <b>Open in browser</b>.</p>{/if}
  <section class="invoice-paper">
    <header>
      <div>
        <h1>{data.settings.studioName}</h1>
        <p>{data.settings.address}</p>
        <p>
          {data.settings.phone}{data.settings.email
            ? ` · ${data.settings.email}`
            : ""}
        </p>
        {#if data.settings.gstin}<p>GSTIN: {data.settings.gstin}</p>{/if}
      </div>
      <div class="document">
        <span>{title}</span><strong>{data.invoice.number}</strong><small
          >{formatDateTime(data.invoice.openedAt)}</small
        >
      </div>
    </header>
    <div class="bill-grid">
      <div>
        <small>Customer</small><strong
          >{data.customer.business || data.order.customer}</strong
        >{#if data.customer.name}<p>
            Contact: {data.customer.name}
          </p>{/if}{#if data.customer.address}<p>
            {data.customer.address}
          </p>{/if}
        <p>{data.customer.phone || data.order.mobile}</p>
      </div>
      <div>
        <small>Order details</small><strong>{data.order.project}</strong>
        <p>{data.order.workType}</p>
        <p>Order {orderCode(data.settings, data.order.serial)}</p>
      </div>
    </div>
    <table>
      <thead
        ><tr><th>Order / task</th><th>Details</th><th>Amount</th></tr></thead
      ><tbody
        >{#if data.invoice.taskItems?.length}{#each data.invoice.taskItems as item}<tr
              ><td>{item.name}</td><td
                >{data.invoice.billingMode === "duration"
                  ? "Duration billing"
                  : "Completed work"}</td
              ><td>{money(item.amount)}</td></tr
            >{/each}{:else}<tr
            ><td>{data.order.project}</td><td
              >{isReceipt ? `Payment towards ${orderCode(data.settings, data.order.serial)}` : data.order.workType || "Work as agreed"}</td
            ><td>{money(data.invoice.subtotal)}</td></tr
          >{/if}</tbody
      >
    </table>
    <div class="totals">
      <p>{data.settings.paymentNote}</p>
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{money(data.invoice.subtotal)}</dd>
        </div>
        {#if data.invoice.discount}<div>
            <dt>
              Discount {data.invoice.discountMode === "percent"
                ? `(${discountPercent.toFixed(discountPercent % 1 ? 2 : 0)}%)`
                : "(manual)"}
            </dt>
            <dd>−{money(data.invoice.discount)}</dd>
          </div>{/if}
        <div class="grand">
          <dt>Total</dt>
          <dd>{money(data.invoice.total)}</dd>
        </div>
        {#if data.invoice.kind !== "partial"}<div>
            <dt>Paid</dt>
            <dd>{money(data.invoice.paid)}</dd>
          </div>
          <div>
            <dt>Balance</dt>
            <dd>{money(data.invoice.balance)}</dd>
          </div>{/if}
      </dl>
    </div>
    <footer>
      <p>{data.settings.invoiceFooter || "Thank you for choosing us."}</p>
      <span>Generated {formatDate(data.invoice.openedAt)}</span>
    </footer>
  </section>
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 38px 20px 70px;
  }
  .invoice-paper {
    border: 1px solid #dbe2ea;
    border-radius: 15px;
    background: #fff;
    color: #172033;
    padding: 38px;
    box-shadow: 0 20px 70px #00000015;
  }
  .invoice-paper header {
    display: flex;
    justify-content: space-between;
    gap: 30px;
    padding-bottom: 24px;
    border-bottom: 2px solid #172033;
  }
  .invoice-paper h1 {
    margin: 0 0 7px;
    font-size: 24px;
  }
  .invoice-paper p {
    margin: 3px 0;
    color: #526075;
    font-size:12px;
    line-height: 1.5;
  }
  .document {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    gap: 5px;
    text-align: right;
  }
  .document span,
  .bill-grid small {
    color: #64748b;
    font-size:11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .document strong {
    font-size: 19px;
  }
  .document small {
    color: #64748b;
    font-size:11px;
  }
  .bill-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 38px;
    padding: 24px 0;
  }
  .bill-grid > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .bill-grid strong {
    font-size:14px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    padding: 10px;
    background: #172033;
    color: #fff;
    text-align: left;
    font-size:11px;
  }
  th:last-child,
  td:last-child {
    text-align: right;
  }
  td {
    padding: 12px 10px;
    border-bottom: 1px solid #dbe2ea;
    font-size:12px;
  }
  .totals {
    display: grid;
    grid-template-columns: 1fr 250px;
    gap: 30px;
    margin-top: 20px;
  }
  .totals dl {
    margin: 0;
  }
  .totals dl div {
    display: flex;
    justify-content: space-between;
    padding: 7px 0;
    font-size:12px;
  }
  .totals dd {
    margin: 0;
    font-weight: 650;
  }
  .totals .grand {
    border-block: 1px solid #172033;
    font-size:14px;
  }
  .invoice-paper footer {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 34px;
    padding-top: 15px;
    border-top: 1px solid #dbe2ea;
  }
  .invoice-paper footer span {
    color: #64748b;
    font-size:11px;
  }
  @media (max-width: 650px) {
    main {
      padding: 24px 12px 50px;
    }
    .invoice-paper {
      padding: 20px;
    }
    .invoice-paper header,
    .invoice-paper footer {
      align-items: flex-start;
      flex-direction: column;
    }
    .document {
      align-items: flex-start;
      text-align: left;
    }
    .bill-grid,
    .totals {
      grid-template-columns: 1fr;
    }
  }
  @media print {
    @page { size: A4; margin: 12mm; }
    .no-print, :global(.action-feedback) { display: none !important; }
    main { max-width: none; padding: 0; margin: 0; }
    .invoice-paper { position: static; width: 100%; box-sizing: border-box; border: 0; box-shadow: none; padding: 0; }
    /* Keep header fills and the grand total visible even when "background graphics" is off. */
    th, .grand { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    tr, .totals, footer { break-inside: avoid; }
  }

  .invoice-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
  .invoice-toolbar .back, .invoice-toolbar .print { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 14px; border-radius: 12px; font-size: 15px; font-weight: 650; text-decoration: none; cursor: pointer; }
  .invoice-toolbar .back { border: 1px solid var(--line); background: var(--card); color: var(--theme-text); }
  .invoice-toolbar .print { border: 0; background: var(--purple); color: var(--accent-text, #fff); }
  .in-app-note { margin: 0 0 14px; padding: 12px 14px; border-radius: 12px; background: color-mix(in srgb, #d97706 12%, var(--card)); font-size: 14px; line-height: 1.5; }
</style>
