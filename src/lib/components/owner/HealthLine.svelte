<!-- Live line chart for response times (ms). One series per database; hover shows every value at that moment. -->
<script lang="ts">
	type Series = { id: string; label: string; color: string };
	type Point = { t: string; values: Record<string, number | null> };
	let { series, points, unit = 'ms' }: { series: Series[]; points: Point[]; unit?: string } = $props();

	let width = $state(640);
	const height = 220;
	const pad = { top: 12, right: 12, bottom: 26, left: 44 };
	let hover = $state<number | null>(null);

	const plotW = $derived(Math.max(120, width - pad.left - pad.right));
	const plotH = height - pad.top - pad.bottom;
	const maxValue = $derived(Math.max(100, ...points.flatMap((p) => Object.values(p.values).filter((v): v is number => v !== null))));
	const yMax = $derived((() => { const step = 10 ** Math.floor(Math.log10(maxValue)); const top = Math.ceil(maxValue / step) * step; return top === maxValue ? top + step : top; })());
	const ticks = $derived([0, yMax / 2, yMax]);
	const slots = $derived(Math.max(points.length - 1, 1));
	const x = (index: number) => pad.left + (points.length <= 1 ? plotW : (index / slots) * plotW);
	const y = (value: number) => pad.top + plotH - (value / yMax) * plotH;
	const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

	// Break the line wherever a check failed (null), instead of drawing through it.
	const path = (id: string) => {
		let d = '', drawing = false;
		points.forEach((point, index) => {
			const value = point.values[id];
			if (value === null || value === undefined) { drawing = false; return; }
			d += `${drawing ? 'L' : 'M'}${x(index).toFixed(1)},${y(value).toFixed(1)}`;
			drawing = true;
		});
		return d;
	};

	const move = (event: PointerEvent) => {
		const box = (event.currentTarget as SVGElement).getBoundingClientRect();
		const local = ((event.clientX - box.left) / box.width) * width - pad.left;
		hover = points.length ? Math.max(0, Math.min(points.length - 1, Math.round((local / plotW) * slots))) : null;
	};
	const tipLeft = $derived(hover === null ? 0 : Math.min(Math.max(x(hover) / width, 0.12), 0.78) * 100);
</script>

<div class="line-chart" bind:clientWidth={width}>
	<ul class="legend">{#each series as item}<li><i style:background={item.color}></i>{item.label}</li>{/each}</ul>
	<div class="plot">
		<svg viewBox={`0 0 ${width} ${height}`} width="100%" {height} role="img" aria-label={`Response time in ${unit}, last ${points.length} checks`} onpointermove={move} onpointerleave={() => (hover = null)}>
			{#each ticks as tick}
				<line class="grid" x1={pad.left} x2={pad.left + plotW} y1={y(tick)} y2={y(tick)} />
				<text class="axis" x={pad.left - 8} y={y(tick) + 4} text-anchor="end">{Math.round(tick)}</text>
			{/each}
			{#if points.length}
				<text class="axis" x={pad.left} y={height - 6}>{time(points[0].t)}</text>
				<text class="axis" x={pad.left + plotW} y={height - 6} text-anchor="end">{time(points[points.length - 1].t)}</text>
			{/if}
			{#each series as item}
				<path d={path(item.id)} fill="none" stroke={item.color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
				{@const last = points.length ? points[points.length - 1].values[item.id] : null}
				{#if last !== null && last !== undefined}<circle cx={x(points.length - 1)} cy={y(last)} r="4" fill={item.color} stroke="var(--card, #fff)" stroke-width="2" />{/if}
			{/each}
			{#if hover !== null}
				<line class="cross" x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + plotH} />
				{#each series as item}
					{@const value = points[hover].values[item.id]}
					{#if value !== null && value !== undefined}<circle cx={x(hover)} cy={y(value)} r="4" fill={item.color} stroke="var(--card, #fff)" stroke-width="2" />{/if}
				{/each}
			{/if}
		</svg>
		{#if hover !== null}
			<div class="tip" style:left={`${tipLeft}%`}>
				<b>{time(points[hover].t)}</b>
				{#each series as item}{@const value = points[hover].values[item.id]}<span><i style:background={item.color}></i>{item.label}<em>{value === null || value === undefined ? 'No answer' : `${value} ${unit}`}</em></span>{/each}
			</div>
		{/if}
	</div>
	{#if points.length < 2}<p class="hint">The line fills in as checks run every 15 seconds while this page is open.</p>{/if}
</div>

<style>
	.line-chart { display: grid; gap: 8px; min-width: 0; }
	.legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0; padding: 0; list-style: none; font-size: 13px; color: var(--theme-text, #0f172a); }
	.legend li { display: inline-flex; align-items: center; gap: 6px; }
	.legend i, .tip i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
	.plot { position: relative; }
	svg { display: block; touch-action: pan-y; }
	.grid { stroke: var(--line, #e2e8f0); stroke-width: 1; }
	.cross { stroke: var(--muted, #64748b); stroke-width: 1; stroke-dasharray: 3 3; }
	.axis { fill: var(--muted, #64748b); font-size: 11px; }
	.tip { position: absolute; top: 4px; transform: translateX(-50%); display: grid; gap: 4px; min-width: 170px; padding: 8px 10px; border: 1px solid var(--line, #e2e8f0); border-radius: 10px; background: var(--card, #fff); color: var(--theme-text, #0f172a); font-size: 12.5px; box-shadow: 0 8px 24px #0f172a1f; pointer-events: none; }
	.tip span { display: flex; align-items: center; gap: 6px; }
	.tip em { margin-left: auto; font-style: normal; font-weight: 700; font-variant-numeric: tabular-nums; }
	.hint { margin: 0; font-size: 12.5px; color: var(--muted, #64748b); }
</style>
