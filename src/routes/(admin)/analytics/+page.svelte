<!-- Analytics: headline numbers, monthly trends, and simple ranked lists. One accent colour, values always written out. -->
<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { money } from '$lib/data';
	import { labelFor, statusFor } from '$lib/capabilities';
	import { Wallet, Hourglass, ClipboardList, Timer } from '@lucide/svelte';

	let { data } = $props();
	const profile = $derived(data.configuration?.profile);
	const orderPlural = $derived(labelFor(profile, 'order', true));
	const customerPlural = $derived(labelFor(profile, 'customer', true));
	const staffPlural = $derived(labelFor(profile, 'staff', true));
	const categoryLabel = $derived(labelFor(profile, 'category'));

	const monthName = (key: string, long = false) => {
		const [year, month] = key.split('-').map(Number);
		return new Intl.DateTimeFormat('en-IN', { month: long ? 'long' : 'short', ...(long ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)));
	};
	const compactMoney = (value: number) => (value >= 100000 ? `₹${(value / 100000).toFixed(value >= 1000000 ? 0 : 1)}L` : value >= 1000 ? `₹${Math.round(value / 1000)}k` : money(value));
	const change = $derived(data.collectedLastMonth > 0 ? Math.round(((data.collectedThisMonth - data.collectedLastMonth) / data.collectedLastMonth) * 100) : null);

	type Point = { key: string; value: number };
	const maxOf = (points: { value: number }[]) => Math.max(1, ...points.map((point) => point.value));
</script>

{#snippet barChart(points: Point[], format: (value: number) => string, unit: string, title: string)}
	{@const max = maxOf(points)}
	{@const peak = points.reduce((best, point) => (point.value > best.value ? point : best), points[0])}
	<div class="chart" role="group" aria-label={title}>
		<div class="plot">
			{#each points as point (point.key)}
				{@const isLabelled = point.value > 0 && (point.key === peak.key || point.key === data.thisMonth)}
				<button type="button" class="col" aria-label={`${monthName(point.key, true)}: ${format(point.value)} ${unit}`}>
					<span class="tip">{monthName(point.key, true)}<b>{format(point.value)}</b></span>
					<span class="value" class:show={isLabelled}>{format(point.value)}</span>
					<span class="bar" class:current={point.key === data.thisMonth} style:height={`${Math.max(point.value > 0 ? 3 : 0, (point.value / max) * 100)}%`}></span>
				</button>
			{/each}
		</div>
		<div class="axis">{#each points as point (point.key)}<span class:current={point.key === data.thisMonth}>{monthName(point.key)}</span>{/each}</div>
		<details class="as-table">
			<summary>View as table</summary>
			<table><thead><tr><th>Month</th><th>{unit}</th></tr></thead><tbody>{#each points as point}<tr><td>{monthName(point.key, true)}</td><td>{format(point.value)}</td></tr>{/each}</tbody></table>
		</details>
	</div>
{/snippet}

{#snippet barList(rows: { label: string; value: number; display: string; note?: string }[], empty: string)}
	{#if rows.length}
		{@const max = maxOf(rows)}
		<ul class="bar-list">
			{#each rows as row}
				<li>
					<div class="row-text"><span class="row-label">{row.label}</span><span class="row-value">{row.display}</span></div>
					<div class="track" aria-hidden="true"><span style:width={`${Math.max(row.value > 0 ? 2 : 0, (row.value / max) * 100)}%`}></span></div>
					{#if row.note}<small>{row.note}</small>{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">{empty}</p>
	{/if}
{/snippet}

<PageHeader eyebrow="How the business is doing" title="Analytics" />

<nav class="range" aria-label="Time range">
	{#each [3, 6, 12] as months}
		<a href={`/analytics?months=${months}`} class:on={data.range === months} aria-current={data.range === months ? 'page' : undefined}><span class="wide-only">Last&nbsp;</span>{months} months</a>
	{/each}
</nav>

<section class="tiles" aria-label="Key numbers">
	{#if data.paymentsEnabled}
		<div class="card tile">
			<span class="tile-label"><Wallet size={16} aria-hidden="true" />Collected this month</span>
			<strong>{money(data.collectedThisMonth)}</strong>
			<span class="tile-note">{change === null ? `${money(data.collectedLastMonth)} last month` : `${change >= 0 ? '+' : ''}${change}% vs last month`}</span>
		</div>
		<div class="card tile">
			<span class="tile-label"><Hourglass size={16} aria-hidden="true" />Still to collect</span>
			<strong>{money(data.outstanding)}</strong>
			<span class="tile-note">Balance across open {orderPlural.toLowerCase()}</span>
		</div>
	{/if}
	<div class="card tile">
		<span class="tile-label"><ClipboardList size={16} aria-hidden="true" />New {orderPlural.toLowerCase()} this month</span>
		<strong>{data.ordersThisMonth}</strong>
		<span class="tile-note">{data.activeCount} in progress right now</span>
	</div>
	<div class="card tile">
		<span class="tile-label"><Timer size={16} aria-hidden="true" />Average time to deliver</span>
		<strong>{data.avgDeliveryDays === null ? '—' : `${data.avgDeliveryDays} days`}</strong>
		<span class="tile-note">{data.deliveredInRange ? `From ${data.deliveredInRange} delivered in this period` : 'Nothing delivered in this period'}</span>
	</div>
</section>

<div class="grid">
	{#if data.paymentsEnabled}
		<section class="card panel wide">
			<header><h2>Money collected per month</h2><p>All payments received, including advances.</p></header>
			{@render barChart(data.collectedSeries, compactMoney, 'collected', 'Money collected per month')}
		</section>
	{/if}
	<section class="card panel" class:wide={!data.paymentsEnabled}>
		<header><h2>New {orderPlural.toLowerCase()} per month</h2><p>By the date the work was received.</p></header>
		{@render barChart(data.createdSeries, (value) => String(value), orderPlural.toLowerCase(), `New ${orderPlural.toLowerCase()} per month`)}
	</section>
	<section class="card panel">
		<header><h2>Where work stands</h2><p>Every current {labelFor(profile, 'order').toLowerCase()} by status.</p></header>
		{@render barList(data.statusCounts.map((row) => ({ label: statusFor(profile, row.status).label, value: row.count, display: String(row.count) })), `No ${orderPlural.toLowerCase()} yet.`)}
	</section>
	<section class="card panel">
		<header><h2>Top {customerPlural.toLowerCase()}</h2><p>{data.paymentsEnabled ? 'By amount billed' : `By number of ${orderPlural.toLowerCase()}`} in this period.</p></header>
		{@render barList(data.topCustomers.map((row) => ({ label: row.name, value: data.paymentsEnabled ? row.billed : row.orders, display: data.paymentsEnabled ? money(row.billed) : String(row.orders), note: `${row.orders} ${row.orders === 1 ? labelFor(profile, 'order').toLowerCase() : orderPlural.toLowerCase()}` })), `No ${orderPlural.toLowerCase()} in this period.`)}
	</section>
	<section class="card panel">
		<header><h2>By {categoryLabel.toLowerCase()}</h2><p>{orderPlural} received in this period.</p></header>
		{@render barList(data.categories.map((row) => ({ label: row.name, value: row.count, display: String(row.count) })), `No ${orderPlural.toLowerCase()} in this period.`)}
	</section>
	{#if data.staffEnabled}
		<section class="card panel">
			<header><h2>{staffPlural} workload</h2><p>Open work right now, and work approved so far.</p></header>
			{@render barList(data.staffLoad.map((row) => ({ label: row.name, value: row.active, display: `${row.active} open`, note: `${row.done} approved` })), `No work assigned yet.`)}
		</section>
	{/if}
</div>

<style>
	.range { display: inline-flex; gap: 4px; padding: 3px; margin-bottom: 16px; border-radius: 10px; background: var(--theme-soft); max-width: 100%; overflow-x: auto; }
	.range a { flex: 0 0 auto; height: 34px; padding: 0 12px; display: inline-flex; align-items: center; border-radius: 8px; color: var(--muted); font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; }
	.range a.on { background: var(--card); color: var(--theme-text); box-shadow: 0 1px 2px #0000001a; }

	.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 16px; }
	.tile { display: flex; flex-direction: column; gap: 6px; padding: 18px; min-width: 0; }
	.tile-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--theme-text); }
	.tile-label :global(svg) { color: var(--purple); flex: 0 0 auto; }
	.tile strong { font-size: 26px; line-height: 1.15; font-weight: 700; color: var(--theme-text); letter-spacing: -.02em; overflow-wrap: anywhere; }
	.tile-note { font-size: 12.5px; color: var(--muted); }

	.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
	.panel { padding: 18px; min-width: 0; }
	.panel.wide { grid-column: 1 / -1; }
	.panel header { margin-bottom: 14px; }
	.panel h2 { margin: 0; font-size: 15px; font-weight: 650; color: var(--theme-text); }
	.panel header p { margin: 4px 0 0; font-size: 12.5px; color: var(--muted); }
	.empty { margin: 0; font-size: 13.5px; color: var(--muted); }

	/* Vertical bars: thin marks, rounded data ends on a shared baseline, recessive axis. */
	.plot { position: relative; display: flex; align-items: flex-end; gap: 8px; height: 180px; padding-top: 22px; border-bottom: 1px solid var(--line); }
	.col { position: relative; flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; background: none; font: inherit; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; outline: none; cursor: default; }
	.bar { width: min(36px, 70%); border-radius: 4px 4px 0 0; background: color-mix(in srgb, var(--purple) 55%, var(--card)); transition: background-color .15s ease; }
	.bar.current { background: var(--purple); }
	.col:hover .bar, .col:focus-visible .bar { background: var(--purple); }
	.value { font-size: 12px; font-weight: 600; color: var(--theme-text); margin-bottom: 4px; visibility: hidden; white-space: nowrap; }
	.value.show { visibility: visible; }
	.tip { position: absolute; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%); z-index: 2; display: none; flex-direction: column; gap: 2px; padding: 7px 10px; border-radius: 8px; background: var(--theme-text); color: var(--card); font-size: 12px; white-space: nowrap; pointer-events: none; }
	.tip b { font-size: 13px; }
	.col:hover .tip, .col:focus-visible .tip { display: flex; }
	.col:focus-visible .bar { outline: 2px solid var(--purple); outline-offset: 2px; }
	.axis { display: flex; gap: 8px; margin-top: 6px; }
	.axis span { flex: 1; text-align: center; font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.axis span.current { color: var(--theme-text); font-weight: 600; }
	.as-table { margin-top: 12px; font-size: 12.5px; color: var(--muted); }
	.as-table summary { cursor: pointer; width: max-content; }
	.as-table table { margin-top: 8px; width: 100%; border-collapse: collapse; }
	.as-table th, .as-table td { text-align: left; padding: 6px 0; border-bottom: 1px solid var(--line); color: var(--theme-text); font-size: 13px; }
	.as-table th:last-child, .as-table td:last-child { text-align: right; }

	/* Ranked lists: label and value as text, a thin bar for relative size. */
	.bar-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
	.row-text { display: flex; justify-content: space-between; gap: 12px; font-size: 13.5px; margin-bottom: 5px; }
	.row-label { color: var(--theme-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
	.row-value { color: var(--theme-text); font-weight: 650; font-variant-numeric: tabular-nums; white-space: nowrap; }
	.track { height: 6px; border-radius: 6px; background: var(--theme-soft); overflow: hidden; }
	.track span { display: block; height: 100%; border-radius: 6px; background: var(--purple); }
	.bar-list small { display: block; margin-top: 4px; font-size: 12px; color: var(--muted); }

	@media (max-width: 900px) {
		.grid { grid-template-columns: 1fr; }
	}
	@media (max-width: 480px) {
		.wide-only { display: none; }
		.plot { gap: 4px; height: 150px; }
		.axis { gap: 4px; }
		.tile strong { font-size: 22px; }
	}
	@media (prefers-reduced-motion: reduce) {
		.bar { transition: none; }
	}
</style>
