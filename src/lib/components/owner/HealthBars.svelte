<!-- 14-day bar chart (one value per day). Hover a day to see its exact value. -->
<script lang="ts">
	let { days, values, color = '#2a78d6', format = (value: number) => String(value), label }: { days: string[]; values: number[]; color?: string; format?: (value: number) => string; label: string } = $props();

	let width = $state(640);
	const height = 180;
	const pad = { top: 10, right: 8, bottom: 24, left: 8 };
	let hover = $state<number | null>(null);

	const plotW = $derived(Math.max(120, width - pad.left - pad.right));
	const plotH = height - pad.top - pad.bottom;
	const maxValue = $derived(Math.max(1, ...values));
	const slot = $derived(plotW / Math.max(days.length, 1));
	const barW = $derived(Math.max(4, Math.min(28, slot - 4)));
	const dayLabel = (day: string, long = false) => new Date(`${day}T00:00:00Z`).toLocaleDateString([], long ? { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' } : { day: 'numeric', month: 'short', timeZone: 'UTC' });
	const barH = (value: number) => (value > 0 ? Math.max(3, (value / maxValue) * plotH) : 0);
	const total = $derived(values.reduce((sum, value) => sum + value, 0));
</script>

<div class="bars" bind:clientWidth={width}>
	<p class="total">{label}: <b>{format(total)}</b> in {days.length} days</p>
	<div class="plot">
		<svg viewBox={`0 0 ${width} ${height}`} width="100%" {height} role="img" aria-label={`${label} per day for the last ${days.length} days`} onpointerleave={() => (hover = null)}>
			<line class="base" x1={pad.left} x2={pad.left + plotW} y1={pad.top + plotH} y2={pad.top + plotH} />
			{#each days as day, index}
				{@const cx = pad.left + slot * index + slot / 2}
				{@const h = barH(values[index])}
				<!-- Hit area is the whole day column, wider and taller than the bar. -->
				<rect class="hit" x={pad.left + slot * index} y={pad.top} width={slot} height={plotH} role="presentation" onpointerenter={() => (hover = index)} />
				{#if h > 0}<path d={`M${cx - barW / 2},${pad.top + plotH} V${pad.top + plotH - h + 4} q0,-4 4,-4 H${cx + barW / 2 - 4} q4,0 4,4 V${pad.top + plotH} Z`} fill={color} opacity={hover === null || hover === index ? 1 : 0.45} />{/if}
				{#if index === 0 || index === days.length - 1 || index === Math.floor(days.length / 2)}<text class="axis" x={cx} y={height - 6} text-anchor="middle">{dayLabel(day)}</text>{/if}
			{/each}
		</svg>
		{#if hover !== null}
			<div class="tip" style:left={`${Math.min(Math.max((pad.left + slot * hover + slot / 2) / width, 0.1), 0.9) * 100}%`}><b>{dayLabel(days[hover], true)}</b><span>{format(values[hover])}</span></div>
		{/if}
	</div>
</div>

<style>
	.bars { display: grid; gap: 6px; min-width: 0; }
	.total { margin: 0; font-size: 13px; color: var(--muted, #64748b); }
	.total b { color: var(--theme-text, #0f172a); font-variant-numeric: tabular-nums; }
	.plot { position: relative; }
	svg { display: block; touch-action: pan-y; }
	.base { stroke: var(--line, #e2e8f0); }
	.hit { fill: transparent; }
	path, .axis, .base { pointer-events: none; }
	.axis { fill: var(--muted, #64748b); font-size: 11px; }
	.tip { position: absolute; top: 0; transform: translateX(-50%); display: grid; gap: 2px; padding: 6px 10px; border: 1px solid var(--line, #e2e8f0); border-radius: 10px; background: var(--card, #fff); color: var(--theme-text, #0f172a); font-size: 12.5px; white-space: nowrap; box-shadow: 0 8px 24px #0f172a1f; pointer-events: none; }
	.tip span { font-weight: 700; font-variant-numeric: tabular-nums; }
</style>
