<!-- Public customer portal: current orders, progress, billing, receipts, and delivery links. -->
<script lang="ts">
  import { untrack } from "svelte";
  import {
    ArrowUpRight,
    Check,
    ChevronDown,
    Circle,
    Clock3,
    Download,
    FileText,
    Printer,
  } from "@lucide/svelte";
  import WhatsAppIcon from "$lib/components/WhatsAppIcon.svelte";
  import PortalHeader from "$lib/components/PortalHeader.svelte";
  import { formatDate, money } from "$lib/data";
  import { orderCode } from "$lib/identifiers";
  import type { Invoice, Order } from "$lib/types";

  let { data } = $props();
  let selected = $state<Order | null>(untrack(() => data.orders[0] || null));
  let documentsOpen = $state(false);
  const firstName = $derived(
    (data.customer.name || data.customer.business || "there").split(" ")[0],
  );
  const outputLink = $derived(
    selected?.tasks.find(
      (task) => task.outputLink && task.status === "Completed",
    )?.outputLink || "",
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
  const steps = $derived(
    selected
      ? [
          [
            "Files received",
            selected.progress > 0 || selected.status !== "Received"
              ? "done"
              : "current",
          ],
          ["Work assigned", selected.tasks.length ? "done" : ""],
          [
            "Editing in progress",
            selected.progress >= 100
              ? "done"
              : selected.progress > 0
                ? "current"
                : "",
          ],
          [
            "Quality review",
            selected.status === "Waiting Review"
              ? "current"
              : ["Ready Delivery", "Completed", "Delivered"].includes(
                    selected.status,
                  )
                ? "done"
                : "",
          ],
          [
            "Ready for delivery",
            selected.status === "Ready Delivery"
              ? "current"
              : ["Completed", "Delivered"].includes(selected.status)
                ? "done"
                : "",
          ],
          [
            "Delivered",
            ["Completed", "Delivered"].includes(selected.status) ? "done" : "",
          ],
        ]
      : [],
  );
  const studioPhone = $derived(data.settings?.phone?.replace(/\D/g, "") || "");
</script>

<svelte:head>
  <title>{data.customer.business} — {data.settings.studioName} portal</title>
  <meta
    property="og:title"
    content={`${data.customer.business} — Private customer portal`}
  />
  <meta
    property="og:description"
    content={`View orders, task progress and invoices from ${data.settings.studioName}.`}
  />
  <meta property="og:type" content="website" />
  {#if data.settings.logoUrl}<meta
      property="og:image"
      content={data.settings.logoUrl}
    />{/if}
  <meta name="robots" content="noindex,nofollow" />
</svelte:head>
<PortalHeader label="Private status & bill" settings={data.settings} />

<main class="customer-main">
  <div class="hello">
    <p>Hello {firstName} 👋</p>
    <h1>{data.customer.business || data.customer.name}</h1>
    <span>Your studio orders, assigned tasks, billing and approved files.</span>
  </div>
  <div class="portal-shortcuts">
    <a href="#work-status"><Clock3 size={14} /> View work status</a><a
      href="#documents"
      onclick={() => (documentsOpen = true)}
      ><FileText size={14} /> Invoices & receipts</a
    >{#if studioPhone}<a
        class="contact"
        href={`https://wa.me/${studioPhone}`}
        target="_blank"
        rel="noreferrer"><WhatsAppIcon size={15} /> Contact studio</a
      >{/if}
  </div>
  {#if !selected}
    <section class="empty card">
      <FileText size={24} />
      <h2>No projects yet</h2>
      <p>Your studio will add projects here after creating an order.</p>
    </section>
  {:else}
    <div class="orders-heading">
      <h2>Orders</h2>
      <span
        >{data.orders.length}
        {data.orders.length === 1 ? "order" : "orders"}</span
      >
    </div>
    <div class="project-switch">
      {#each data.orders as order}<button
          class:active={selected.id === order.id}
          onclick={() => (selected = order)}
          >{orderCode(data.settings, order.serial)} · {order.project}</button
        >{/each}
    </div>
    <section id="work-status" class="project-card card">
      <div class="project-head">
        <div>
          <span>{selected.workType || "Studio project"}</span>
          <h2>{selected.project}</h2>
          <p>
            Order {orderCode(data.settings, selected.serial)}
            {selected.due ? `· Delivery ${formatDate(selected.due)}` : ""}
          </p>
        </div>
        <span class="percent"
          ><strong>{selected.progress}%</strong> complete</span
        >
      </div>
      <div class="customer-progress">
        {#each steps as step, index}<div
            class:done={step[1] === "done"}
            class:current={step[1] === "current"}
          >
            <span
              >{#if step[1] === "done"}<Check
                  size={13}
                />{:else if step[1] === "current"}<Clock3
                  size={13}
                />{:else}<Circle size={9} />{/if}</span
            ><strong>{step[0]}</strong>{#if index < steps.length - 1}<i
              ></i>{/if}
          </div>{/each}
      </div>
    </section>
    <div class="customer-grid">
      <section id="bill" class="card invoice">
        <div class="section-title">
          <span><FileText size={16} /></span>
          <div>
            <h2>Your bill</h2>
            <p>Advance, payments and remaining balance</p>
          </div>
        </div>
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
        {#if (selected.initialAdvance || 0) > 0 || (selected.payments || []).length}<div
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
        <div id="documents" class="invoice-history">
          <h3>
            <button
              aria-expanded={documentsOpen}
              onclick={() => (documentsOpen = !documentsOpen)}
              >Invoices & receipts <span>{allInvoiceRows.length}</span
              ><ChevronDown class={documentsOpen ? "open" : ""} size={14} /></button
            >
          </h3>
          {#if documentsOpen}<p class="document-note">
              Newest documents are shown first. Open a document to view it, or
              use Download / print PDF.
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
                    >{row.order?.project || "Order"} · Due {money(
                      row.invoice.balance,
                    )}</em
                  ></span
                >
                <span class="document-actions"
                  ><a
                    href={`/portal/${data.tenantSlug}/customer/${data.token}/invoice/${row.invoice.id}`}
                    target="_blank"
                    rel="noreferrer">Open</a
                  ><a
                    href={`/portal/${data.tenantSlug}/customer/${data.token}/invoice/${row.invoice.id}?print=1`}
                    target="_blank"
                    rel="noreferrer"
                    ><Printer size={12} /> Download / print PDF</a
                  ></span
                >
              </article>{/each}
            {#if !allInvoiceRows.length}<p class="empty-documents">
                No invoices or receipts have been generated yet.
              </p>{/if}{/if}
        </div>
      </section>
      <section class="card delivery">
        <div class="section-title">
          <span><Download size={16} /></span>
          <div>
            <h2>Project files</h2>
            <p>
              {outputLink
                ? "Approved delivery is available"
                : selected.status === "Delivered" &&
                    selected.deliveryMethod === "offline"
                  ? "Delivered physically / offline"
                  : "Available after final approval"}
            </p>
          </div>
        </div>
        {#if outputLink}<a href={outputLink} target="_blank" rel="noreferrer"
            >Open delivery <ArrowUpRight size={13} /></a
          >{:else if selected.status === "Delivered" && selected.deliveryMethod === "offline"}<span
            class="delivered-offline"
            ><Check size={14} /> Delivery completed {selected.deliveredAt
              ? formatDate(selected.deliveredAt)
              : ""}</span
          >{:else}<span class="locked">Delivery link will appear here</span
          >{/if}
      </section>
    </div>
  {/if}
  {#if studioPhone}<a
      class="whatsapp"
      href={`https://wa.me/${studioPhone}`}
      target="_blank"
      rel="noreferrer"><WhatsAppIcon size={17} /> Contact studio on WhatsApp</a
    >{/if}
  <p class="privacy">
    This private link shows only your projects, payments, and approved delivery
    details.
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
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    margin-top: 34px;
  }
  .customer-progress > div {
    position: relative;
    text-align: center;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 9px;
  }
  .customer-progress > div > span {
    position: relative;
    z-index: 2;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    border: 1px solid var(--line);
    background: var(--card);
    color: var(--muted);
  }
  .customer-progress > div.done > span {
    border-color: #22c55e50;
    background: #22c55e15;
    color: #4fd17d;
  }
  .customer-progress > div.current > span {
    border-color: var(--purple);
    background: var(--theme-soft);
    color: var(--purple);
  }
  .customer-progress strong {
    font-size: 8px;
    font-weight: 550;
    color: var(--muted);
  }
  .customer-progress i {
    position: absolute;
    top: 12px;
    left: 50%;
    right: -50%;
    height: 1px;
    background: var(--line);
    z-index: 1;
  }
  .customer-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
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
    height: 36px;
    border: 1px solid var(--line);
    background: var(--theme-soft);
    color: var(--purple);
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 9px;
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
    .customer-progress {
      grid-template-columns: 1fr;
      gap: 11px;
    }
    .customer-progress > div {
      flex-direction: row;
      text-align: left;
    }
    .customer-progress i {
      left: 12px;
      top: 25px;
      bottom: -11px;
      width: 1px;
      height: auto;
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
    min-height: 30px;
    padding: 0 8px;
    border: 1px solid var(--line);
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
  }
</style>
