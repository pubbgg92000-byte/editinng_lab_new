<!-- Invoices and receipts: filter by type and payment state, see what's owed, open or export. -->
<script lang="ts">
	  import { allowed } from '$lib/stores/permissions';
import PageHeader from '$lib/components/PageHeader.svelte';
	import { formatDateTime, money } from '$lib/data';
	import { orderCode } from '$lib/identifiers';
	import { hasCapability, labelFor } from '$lib/capabilities';
	import { ChevronRight, Download, Search, Wallet, Hourglass } from '@lucide/svelte';
	import type { Invoice, Order } from '$lib/types';

	let { data } = $props();
	const profile = $derived(data.configuration?.profile);
	const customerLabel = $derived(labelFor(profile, 'customer'));
	const orderLabel = $derived(labelFor(profile, 'order'));
	const paymentsEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, 'billing.payments'));
	const exportEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, 'reports.excelExport') && allowed('reports.export'));

	type Filter = 'all' | 'invoices' | 'receipts' | 'unpaid' | 'cancelled';
	let query = $state('');
	let filter = $state<Filter>('all');

	const isReceipt = (invoice: Invoice) => invoice.kind === 'advance' || invoice.kind === 'payment';
	const kindLabel = (invoice: Invoice) => invoice.kind === 'advance' ? 'Advance receipt' : invoice.kind === 'payment' ? 'Payment receipt' : invoice.kind === 'partial' ? 'Part invoice' : 'Final invoice';
	const orderBalance = (order?: Order) => (!order || order.priceSet === false ? 0 : Math.max(0, order.price - order.discount - order.paid));
	// The amount on the document itself (snapshot). A ₹0 snapshot is still a snapshot, so check for null, not falsy.
	const documentAmount = (invoice: Invoice, order?: Order) => isReceipt(invoice)
		? Number(invoice.amountReceived ?? 0)
		: invoice.total != null ? Number(invoice.total) : order && order.priceSet !== false ? Math.max(0, order.price - order.discount) : 0;

	type State = { label: string; tone: 'paid' | 'due' | 'muted' | 'cancelled'; note?: string };
	// Payment state comes from what has actually been collected on the order, so it can't contradict payments.
	function stateOf(invoice: Invoice, order?: Order): State {
		if (invoice.status === 'cancelled') return { label: 'Cancelled', tone: 'cancelled' };
		if (isReceipt(invoice)) return { label: 'Payment received', tone: 'paid' };
		if (!order) return { label: invoice.status === 'sent' ? 'Sent' : 'Draft', tone: 'muted' };
		if (order.priceSet === false) return { label: 'Total not set', tone: 'muted' };
		const balance = orderBalance(order);
		if (balance <= 0.009) return { label: 'Paid', tone: 'paid' };
		return { label: invoice.status === 'sent' ? 'Sent, unpaid' : 'Unpaid', tone: 'due', note: `${money(balance)} due` };
	}

	const rows = $derived((data.invoices as Invoice[])
		.map((invoice) => {
			const order = (data.orders as Order[]).find((item) => item.id === invoice.orderId);
			return { invoice, order, state: stateOf(invoice, order) };
		})
		.sort((a, b) => b.invoice.openedAt.localeCompare(a.invoice.openedAt)));
	const counts = $derived({
		all: rows.length,
		invoices: rows.filter((row) => !isReceipt(row.invoice)).length,
		receipts: rows.filter((row) => isReceipt(row.invoice)).length,
		unpaid: rows.filter((row) => row.state.tone === 'due').length,
		cancelled: rows.filter((row) => row.state.tone === 'cancelled').length
	});
	const visible = $derived(rows.filter(({ invoice, order, state }) => {
		if (filter === 'invoices' && isReceipt(invoice)) return false;
		if (filter === 'receipts' && !isReceipt(invoice)) return false;
		if (filter === 'unpaid' && state.tone !== 'due') return false;
		if (filter === 'cancelled' && state.tone !== 'cancelled') return false;
		const text = `${invoice.number} ${order?.customer || ''} ${order?.project || ''} ${order ? orderCode(data.settings, order.serial) : ''}`.toLowerCase();
		return text.includes(query.trim().toLowerCase());
	}));
	const outstanding = $derived((data.orders as Order[]).reduce((sum, order) => sum + orderBalance(order), 0));
	const collected = $derived((data.orders as Order[]).reduce((sum, order) => sum + Number(order.paid || 0), 0));
	const filters = $derived<{ key: Filter; label: string }[]>([
		{ key: 'all', label: 'All' },
		{ key: 'invoices', label: 'Invoices' },
		...(paymentsEnabled ? [{ key: 'receipts' as Filter, label: 'Receipts' }] : []),
		{ key: 'unpaid', label: 'Unpaid' },
		...(counts.cancelled ? [{ key: 'cancelled' as Filter, label: 'Cancelled' }] : [])
	]);
</script>

<PageHeader eyebrow="Bills and receipts you've sent, and what's still owed." title="Invoices" />

{#if paymentsEnabled}
	<section class="tiles" aria-label="Totals">
		<div class="card tile"><span class="tile-label"><Hourglass size={16} aria-hidden="true" />Still to collect</span><strong>{money(outstanding)}</strong><span class="tile-note">Across all open {labelFor(profile, 'order', true).toLowerCase()}</span></div>
		<div class="card tile"><span class="tile-label"><Wallet size={16} aria-hidden="true" />Collected so far</span><strong>{money(collected)}</strong><span class="tile-note">All payments recorded</span></div>
	</section>
{/if}

<div class="toolbar">
	<label class="search">
		<Search size={16} aria-hidden="true" />
		<input bind:value={query} placeholder={`Search by number, ${customerLabel.toLowerCase()} or ${orderLabel.toLowerCase()}`} aria-label="Search invoices" />
	</label>
	{#if exportEnabled}<a class="secondary export" href="/api/export" data-sveltekit-reload><Download size={15} aria-hidden="true" />Download Excel</a>{/if}
</div>

<div class="filters" role="group" aria-label="Show">
	{#each filters as item}
		<button type="button" class:on={filter === item.key} aria-pressed={filter === item.key} onclick={() => (filter = item.key)}>{item.label}<span class="count">{counts[item.key]}</span></button>
	{/each}
</div>

<div class="card list">
	<table class="docs">
		<thead>
			<tr>
				<th>Number</th>
				<th>{customerLabel}</th>
				<th>Date</th>
				<th class="num">Amount</th>
				<th>Status</th>
				<th class="col-open"><span class="sr-only">Open</span></th>
			</tr>
		</thead>
		<tbody>
			{#each visible as row (row.invoice.id)}
				<tr>
					<td class="col-number">
						<a href={'/invoices/' + row.invoice.id} class="doc-link"><strong>{row.invoice.number}</strong><small>{kindLabel(row.invoice)}</small></a>
					</td>
					<td data-label={customerLabel} class="col-customer">
						{#if row.order}<span>{row.order.customer}</span><small>{row.order.project}</small>{:else}<span class="muted">{orderLabel} removed</span>{/if}
					</td>
					<td data-label="Date" class="nowrap">{formatDateTime(row.invoice.openedAt)}</td>
					<td data-label="Amount" class="num">{money(documentAmount(row.invoice, row.order))}</td>
					<td data-label="Status">
						<span class={`state ${row.state.tone}`}>{row.state.label}</span>
						{#if row.state.note}<small class="state-note">{row.state.note}</small>{/if}
					</td>
					<td class="col-open"><a class="open" href={'/invoices/' + row.invoice.id} aria-label={`Open ${row.invoice.number}`}><ChevronRight size={16} /></a></td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#if !visible.length}
		<div class="empty">
			<p><strong>{rows.length ? 'Nothing matches this view.' : 'No invoices yet.'}</strong></p>
			<p>{rows.length ? 'Try another filter or clear the search.' : `Create one from an ${orderLabel.toLowerCase()} using "Create invoice".`}</p>
			{#if rows.length}<button type="button" class="secondary" onclick={() => { filter = 'all'; query = ''; }}>Show everything</button>{/if}
		</div>
	{/if}
</div>

<style>
	.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
	.muted { color: var(--muted); }
	.nowrap { white-space: nowrap; }
	.count { display: inline-grid; place-items: center; min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px; background: var(--theme-soft); color: var(--theme-text); font-size: 12px; font-weight: 650; }

	.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 16px; }
	.tile { display: flex; flex-direction: column; gap: 6px; padding: 18px; min-width: 0; }
	.tile-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--theme-text); }
	.tile-label :global(svg) { color: var(--purple); }
	.tile strong { font-size: 26px; line-height: 1.15; font-weight: 700; color: var(--theme-text); overflow-wrap: anywhere; }
	.tile-note { font-size: 12.5px; color: var(--muted); }

	.toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
	.search { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--muted); }
	.search:focus-within { border-color: var(--purple); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple) 18%, transparent); }
	.search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; color: var(--theme-text); font-size: 14px; }
	.export { display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 12px; font-size: 13.5px; text-decoration: none; }

	.filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
	.filters button { display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--theme-text); font-size: 13.5px; font-weight: 600; cursor: pointer; transition: border-color .15s ease, background-color .15s ease; }
	.filters button:hover { border-color: color-mix(in srgb, var(--purple) 45%, var(--line)); }
	.filters button.on { background: var(--purple); border-color: var(--purple); color: var(--accent-text, #fff); }
	.filters button.on .count { background: color-mix(in srgb, #fff 25%, transparent); color: inherit; }

	.list { padding: 0; container-type: inline-size; }
	.docs { width: 100%; border-collapse: collapse; }
	.docs th { padding: 11px 14px; text-align: left; font-size: 12px; font-weight: 650; color: var(--muted); border-bottom: 1px solid var(--line); white-space: nowrap; }
	.docs td { padding: 12px 14px; border-bottom: 1px solid var(--line); font-size: 13.5px; color: var(--theme-text); vertical-align: middle; }
	.docs tbody tr { transition: background-color .15s ease; }
	.docs tbody tr:hover { background: color-mix(in srgb, var(--theme-soft) 70%, transparent); }
	.docs tbody tr:last-child td { border-bottom: 0; }
	.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; font-weight: 600; }
	.doc-link { display: flex; flex-direction: column; gap: 2px; color: inherit; text-decoration: none; }
	.doc-link strong { font-size: 14px; font-weight: 650; white-space: nowrap; }
	.doc-link:hover strong { text-decoration: underline; }
	.doc-link small, .col-customer small, .state-note { display: block; font-size: 12px; color: var(--muted); }
	.col-customer span { display: block; overflow-wrap: anywhere; }
	.col-open { width: 1%; }
	.open { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 8px; color: var(--muted); }
	.open:hover { background: var(--theme-soft); color: var(--theme-text); }
	.state { display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 999px; font-size: 12px; font-weight: 650; white-space: nowrap; }
	.state.paid { background: color-mix(in srgb, #16a34a 14%, transparent); color: #15803d; }
	.state.due { background: color-mix(in srgb, #d97706 16%, transparent); color: #b45309; }
	.state.muted { background: var(--theme-soft); color: var(--muted); }
	.state.cancelled { background: color-mix(in srgb, #dc2626 12%, transparent); color: #b91c1c; text-decoration: line-through; }
	.empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 36px 16px; text-align: center; color: var(--muted); font-size: 14px; }
	.empty p { margin: 0; }
	.empty strong { color: var(--theme-text); }
	.empty button { margin-top: 6px; }

	/* Narrow list: each document becomes a card with the amount and status always visible. */
	@container (max-width: 680px) {
		.docs thead { display: none; }
		.docs, .docs tbody, .docs tr, .docs td { display: block; width: 100%; }
		.docs tbody tr { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; padding: 14px 44px 14px 14px; border-bottom: 1px solid var(--line); }
		.docs tbody tr:last-child { border-bottom: 0; }
		.docs td { padding: 0; border: 0; }
		.docs td[data-label]::before { content: attr(data-label); display: block; font-size: 11.5px; font-weight: 600; color: var(--muted); margin-bottom: 2px; }
		.col-number, .col-customer { grid-column: 1 / -1; }
		.num { text-align: left; }
		.docs td.col-open { position: absolute; right: 8px; top: 12px; width: auto; }
	}
</style>
