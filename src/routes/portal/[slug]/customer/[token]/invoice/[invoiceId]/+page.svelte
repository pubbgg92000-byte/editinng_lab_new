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
  // Receipts confirm money already in hand; invoices are settled when nothing is left to collect.
  const paidInFull = $derived(isReceipt || data.invoice.balance <= 0.009);
  const stampText = $derived(paidInFull ? "PAID" : "BALANCE DUE");
  const initials = $derived(
    (data.settings.studioName || "")
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ND",
  );
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
    <header class="paper-band">
      <div class="brand">
        <span class="band-logo" aria-hidden="true"
          >{#if data.settings.logoUrl}<img src={data.settings.logoUrl} alt="" />{:else}<b>{initials}</b>{/if}</span
        >
        <div class="brand-text">
          <h1>{data.settings.studioName}</h1>
          {#if data.settings.address}<p>{data.settings.address}</p>{/if}
          <p>
            {data.settings.phone}{data.settings.email ? ` · ${data.settings.email}` : ""}
          </p>
          {#if data.settings.gstin}<p>GSTIN: {data.settings.gstin}</p>{/if}
        </div>
      </div>
      <div class="document">
        <span class="doc-kind">{title}</span>
        <strong>{data.invoice.number}</strong>
        <small>{formatDateTime(data.invoice.openedAt)}</small>
        <span class="stamp" class:due={!paidInFull}>{stampText}</span>
      </div>
    </header>

    <div class="bill-grid">
      <div>
        <small>Billed to</small>
        <strong>{data.customer.business || data.order.customer}</strong>
        {#if data.customer.name}<p>Contact: {data.customer.name}</p>{/if}
        {#if data.customer.address}<p>{data.customer.address}</p>{/if}
        <p>{data.customer.phone || data.order.mobile}</p>
      </div>
      <div>
        <small>Order details</small>
        <strong>{data.order.project}</strong>
        <p>{data.order.workType}</p>
        <p>Order {orderCode(data.settings, data.order.serial)}</p>
      </div>
    </div>

    <table>
      <thead
        ><tr><th>Order / task</th><th>Details</th><th>Amount</th></tr></thead
      ><tbody
        >{#if data.invoice.taskItems?.length}{#each data.invoice.taskItems as item}<tr
              ><td class="item-name">{item.name}</td><td class="item-detail"
                >{data.invoice.billingMode === "duration"
                  ? "Duration billing"
                  : "Completed work"}</td
              ><td class="item-amount">{money(item.amount)}</td></tr
            >{/each}{:else}<tr
            ><td class="item-name">{data.order.project}</td><td class="item-detail"
              >{isReceipt ? `Payment towards ${orderCode(data.settings, data.order.serial)}` : data.order.workType || "Work as agreed"}</td
            ><td class="item-amount">{money(data.invoice.subtotal)}</td></tr
          >{/if}</tbody
      >
    </table>

    <div class="totals">
      <div class="note">
        {#if data.settings.paymentNote}<p>{data.settings.paymentNote}</p>{/if}
      </div>
      <div class="summary">
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{money(data.invoice.subtotal)}</dd>
          </div>
          {#if data.invoice.discount}<div class="discount">
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
            </div>{/if}
        </dl>
        <div class="balance" class:settled={paidInFull}>
          <span>{paidInFull ? "Paid in full" : "Balance due"}</span>
          <strong>{money(data.invoice.kind === "partial" ? data.invoice.total : data.invoice.balance)}</strong>
        </div>
      </div>
    </div>

    <footer>
      <p>{data.settings.invoiceFooter || "Thank you for choosing us."}</p>
      <span>Generated {formatDate(data.invoice.openedAt)}</span>
    </footer>
  </section>
</main>

<style>
  /* Branded, print-safe document: white "paper" + the workspace accent (--purple / --accent-text)
     for the header band, table head and totals, so it stays legible in every palette and on paper. */
  main {
    max-width: 860px;
    margin: 0 auto;
    padding: 34px 20px 70px;
  }
  .invoice-paper {
    --paper-ink: #1b2232;
    --paper-soft: #5b6676;
    --paper-line: #e6eaf0;
    --brand: var(--purple, #2f6b3f);
    --brand-ink: var(--accent-text, #fff);
    position: relative;
    border-radius: 18px;
    background: #fff;
    color: var(--paper-ink);
    overflow: hidden;
    box-shadow: 0 24px 70px #0e193312, 0 2px 6px #0e193310;
    border: 1px solid var(--paper-line);
  }

  .paper-band {
    display: flex;
    justify-content: space-between;
    gap: 28px;
    padding: 30px 36px;
    background: linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand) 78%, #000 22%));
    color: var(--brand-ink);
  }
  .brand {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  .band-logo {
    width: 54px;
    height: 54px;
    flex: 0 0 54px;
    border-radius: 13px;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--brand-ink) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--brand-ink) 32%, transparent);
  }
  .band-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .band-logo b {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: var(--brand-ink);
  }
  .brand-text h1 {
    margin: 0 0 6px;
    font-size: 23px;
    line-height: 1.1;
    letter-spacing: -0.01em;
  }
  .brand-text p {
    margin: 2px 0;
    font-size: 12px;
    line-height: 1.5;
    opacity: 0.88;
  }
  .document {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    gap: 4px;
    flex: 0 0 auto;
  }
  .doc-kind {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    opacity: 0.85;
  }
  .document strong {
    font-size: 20px;
    letter-spacing: 0.01em;
  }
  .document small {
    font-size: 11.5px;
    opacity: 0.82;
  }
  .stamp {
    margin-top: 10px;
    padding: 5px 12px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    background: #10b981;
    color: #fff;
    box-shadow: 0 4px 14px #10b98155;
  }
  .stamp.due {
    background: #f4b740;
    color: #3a2c05;
    box-shadow: 0 4px 14px #f4b74044;
  }

  .bill-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 36px;
    padding: 28px 36px 10px;
  }
  .bill-grid > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .bill-grid small {
    color: var(--paper-soft);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 3px;
  }
  .bill-grid strong {
    font-size: 15px;
  }
  .bill-grid p {
    margin: 1px 0;
    color: var(--paper-soft);
    font-size: 12.5px;
    line-height: 1.5;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 0;
  }
  th {
    padding: 11px 36px;
    background: color-mix(in srgb, var(--brand) 12%, #fff);
    color: color-mix(in srgb, var(--brand) 72%, #000 28%);
    text-align: left;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 2px solid color-mix(in srgb, var(--brand) 40%, #fff);
  }
  th:last-child,
  td:last-child {
    text-align: right;
  }
  td {
    padding: 13px 36px;
    border-bottom: 1px solid var(--paper-line);
    font-size: 13px;
    vertical-align: top;
  }
  .item-name {
    font-weight: 600;
  }
  .item-detail {
    color: var(--paper-soft);
  }
  .item-amount {
    font-weight: 650;
    white-space: nowrap;
  }

  .totals {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 30px;
    padding: 22px 36px 4px;
  }
  .note p {
    margin: 0;
    color: var(--paper-soft);
    font-size: 12.5px;
    line-height: 1.6;
    max-width: 34ch;
  }
  .summary dl {
    margin: 0;
  }
  .summary dl div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 7px 0;
    font-size: 13px;
  }
  .summary dt {
    color: var(--paper-soft);
  }
  .summary dd {
    margin: 0;
    font-weight: 600;
  }
  .summary .discount dd {
    color: #15803d;
  }
  .summary .grand {
    border-top: 1.5px solid var(--paper-ink);
    margin-top: 4px;
    padding-top: 10px;
    font-size: 15px;
  }
  .summary .grand dt,
  .summary .grand dd {
    color: var(--paper-ink);
    font-weight: 750;
  }
  .balance {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand) 80%, #000 20%));
    color: var(--brand-ink);
  }
  .balance.settled {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
  }
  .balance span {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.9;
  }
  .balance strong {
    font-size: 20px;
    letter-spacing: 0.01em;
  }

  footer {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-end;
    margin-top: 24px;
    padding: 18px 36px 30px;
    border-top: 1px solid var(--paper-line);
  }
  footer p {
    margin: 0;
    font-size: 13px;
    color: var(--paper-ink);
    max-width: 48ch;
  }
  footer span {
    color: var(--paper-soft);
    font-size: 11px;
    white-space: nowrap;
  }

  @media (max-width: 650px) {
    main {
      padding: 20px 12px 50px;
    }
    .paper-band {
      flex-direction: column;
      padding: 22px;
      gap: 18px;
    }
    .document {
      align-items: flex-start;
      text-align: left;
    }
    .bill-grid {
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 22px 22px 6px;
    }
    th,
    td {
      padding-left: 22px;
      padding-right: 22px;
    }
    .totals {
      grid-template-columns: 1fr;
      gap: 14px;
      padding: 18px 22px 4px;
    }
    footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 16px 22px 26px;
    }
  }

  @media print {
    @page { size: A4; margin: 11mm; }
    .no-print, :global(.action-feedback) { display: none !important; }
    main { max-width: none; padding: 0; margin: 0; }
    .invoice-paper { position: static; width: 100%; box-sizing: border-box; border: 0; box-shadow: none; border-radius: 0; }
    /* Keep the brand band, table head, totals and stamp coloured even when "background graphics" is off. */
    .paper-band, th, .balance, .stamp, .grand { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    tr, .totals, footer, .balance { break-inside: avoid; }
  }

  .invoice-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
  .invoice-toolbar .back, .invoice-toolbar .print { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 14px; border-radius: 12px; font-size: 15px; font-weight: 650; text-decoration: none; cursor: pointer; }
  .invoice-toolbar .back { border: 1px solid var(--line); background: var(--card); color: var(--theme-text); }
  .invoice-toolbar .print { border: 0; background: var(--purple); color: var(--accent-text, #fff); }
  .in-app-note { margin: 0 0 14px; padding: 12px 14px; border-radius: 12px; background: color-mix(in srgb, #d97706 12%, var(--card)); font-size: 14px; line-height: 1.5; }
</style>
