<!-- Private customer invoice/receipt viewer with print/PDF support. -->
<script lang="ts">
  import { onMount } from "svelte";
  import { FileText, Printer } from "@lucide/svelte";
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
  onMount(() => {
    if (new URL(location.href).searchParams.get("print") === "1") setTimeout(() => window.print(), 250);
  });
</script>

<svelte:head
  ><title>{data.invoice.number} — {data.settings.studioName}</title><meta
    name="robots"
    content="noindex,nofollow"
  /></svelte:head
>
<div class="no-print">
  <PortalHeader label="Private invoice" settings={data.settings} />
</div>
<main>
  <div class="invoice-toolbar no-print">
    <div>
      <FileText size={18} /><span
        ><small>{data.invoice.number} · {title}</small><strong>{data.customer.business || data.order.customer}</strong><em>{data.order.project}</em></span
      >
    </div>
    <button onclick={() => window.print()}
      ><Printer size={15} /> Print / save PDF</button
    >
  </div>
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
    <div class="customer-document-heading">
      <small>Invoice for</small><h2>{data.customer.business || data.order.customer}</h2>
      <p><strong>{data.invoice.number}</strong> · {data.order.project}{#if data.order.tasks?.length} · {data.order.tasks.filter((task) => !task.archived).map((task) => task.name).join(", ")}{/if}</p>
      {#if data.customer.name}<span>Customer contact: {data.customer.name}</span>{/if}
    </div>
    <div class="bill-grid">
      <div>
        <small>Customer studio</small><strong
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
        {#if data.order.tasks?.length}<p>
            {data.order.tasks.filter((task) => !task.archived).length} task(s)
          </p>{/if}
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
              >{data.order.workType}{#if data.order.tasks?.length}
                · {data.order.tasks
                  .filter((task) => !task.archived)
                  .map((task) => task.name)
                  .join(", ")}{/if}</td
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
  .invoice-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .invoice-toolbar > div,
  .invoice-toolbar span {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .invoice-toolbar span {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }
  .invoice-toolbar small {
    color: var(--muted);
    font-size: 8px;
  }
  .invoice-toolbar strong {
    font-size: 14px;
  }
  .invoice-toolbar button {
    display: flex;
    align-items: center;
    gap: 7px;
    border: 0;
    border-radius: 9px;
    background: var(--purple);
    color: #fff;
    padding: 10px 13px;
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
    font-size: 10px;
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
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .document strong {
    font-size: 19px;
  }
  .document small {
    color: #64748b;
    font-size: 9px;
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
    font-size: 13px;
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
    font-size: 9px;
  }
  th:last-child,
  td:last-child {
    text-align: right;
  }
  td {
    padding: 12px 10px;
    border-bottom: 1px solid #dbe2ea;
    font-size: 10px;
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
    font-size: 10px;
  }
  .totals dd {
    margin: 0;
    font-weight: 650;
  }
  .totals .grand {
    border-block: 1px solid #172033;
    font-size: 13px;
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
    font-size: 8px;
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
    .invoice-toolbar {
      gap: 12px;
    }
    .invoice-toolbar button {
      font-size: 8px;
    }
  }
  @media print {
    @page {
      size: A4;
      margin: 12mm;
    }
    :global(body *) {
      visibility: hidden !important;
    }
    .invoice-paper,
    .invoice-paper * {
      visibility: visible !important;
    }
    .invoice-paper {
      position: absolute;
      inset: 0;
      width: 100%;
      box-sizing: border-box;
      border: 0;
      box-shadow: none;
      padding: 0;
    }
    .no-print {
      display: none !important;
    }
  }
</style>
