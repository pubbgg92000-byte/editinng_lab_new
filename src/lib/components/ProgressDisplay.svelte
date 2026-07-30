<script lang="ts">
	import { Check, Circle, Clock3 } from '@lucide/svelte';
	import type { PortalMilestone, PortalProgressMode } from '$lib/types';

	let {
		milestones,
		status,
		percent = 0,
		mode = 'both',
		label = 'Progress'
	}: {
		milestones: PortalMilestone[];
		status: string;
		percent?: number;
		mode?: PortalProgressMode;
		label?: string;
	} = $props();

	const activeIndex = $derived(Math.max(0, milestones.findIndex((item) => item.statuses.includes(status))));
	const showMilestones = $derived(mode === 'milestones' || mode === 'both');
	const showPercentage = $derived(mode === 'percentage' || mode === 'both');
</script>

<div class="progress-display" aria-label={`${label}: ${percent}%`}>
	{#if showPercentage}
		<div class="percentage">
			<div><span>{label}</span><strong>{percent}%</strong></div>
			<div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
				<span style:width={`${Math.max(0, Math.min(100, percent))}%`}></span>
			</div>
		</div>
	{/if}
	{#if showMilestones}
		<div class="milestones" style={`--milestone-count:${Math.max(1, milestones.length)}`}>
			{#each milestones as milestone, index}
				{@const done = index < activeIndex || percent >= 100}
				{@const current = index === activeIndex && percent < 100}
				<div class:done class:current>
					<span class="marker">
						{#if done}<Check size={13}/>{:else if current}<Clock3 size={13}/>{:else}<Circle size={9}/>{/if}
					</span>
					<strong>{milestone.label}</strong>
					{#if index < milestones.length - 1}<i></i>{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.progress-display{display:grid;gap:24px}.percentage{display:grid;gap:8px}.percentage>div:first-child{display:flex;align-items:center;justify-content:space-between;gap:12px}.percentage span{color:var(--muted);font-size:9px}.percentage strong{font-size:14px}.track{height:7px;border-radius:99px;background:var(--theme-soft);overflow:hidden;border:1px solid var(--line)}.track>span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--purple),var(--cyan));transition:width .25s ease}
	.milestones{display:grid;grid-template-columns:repeat(var(--milestone-count,6),minmax(0,1fr))}.milestones>div{position:relative;display:flex;align-items:center;flex-direction:column;gap:9px;text-align:center}.marker{position:relative;z-index:2;width:25px;height:25px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);background:var(--card);color:var(--muted)}.milestones>div.done .marker{border-color:#22c55e50;background:#22c55e15;color:#35b86b}.milestones>div.current .marker{border-color:var(--purple);background:var(--theme-soft);color:var(--purple)}.milestones strong{max-width:110px;color:var(--muted);font-size:8px;font-weight:600}.milestones i{position:absolute;z-index:1;top:12px;left:50%;right:-50%;height:1px;background:var(--line)}
	@media(max-width:650px){.milestones{grid-template-columns:1fr;gap:10px}.milestones>div{flex-direction:row;text-align:left}.milestones i{left:12px;right:auto;top:25px;bottom:-10px;width:1px;height:auto}}
	@media(prefers-reduced-motion:reduce){.track>span{transition:none}}
</style>
