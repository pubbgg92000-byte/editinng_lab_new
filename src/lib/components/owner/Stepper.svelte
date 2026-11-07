<!-- Dots joined by a line that fills as you move forward. Finished steps can be clicked to go back. -->
<script lang="ts">
	import { Check } from '@lucide/svelte';
	let { steps, current, reached = current, label = 'Steps', onselect }: {
		steps: string[];
		current: number;
		reached?: number;
		label?: string;
		onselect: (index: number) => void;
	} = $props();
	const progress = $derived(steps.length > 1 ? current / (steps.length - 1) : 0);
</script>

<nav class="stepper" aria-label={label} style={`--n:${steps.length};--p:${progress}`}>
	<div class="line" aria-hidden="true"><span></span></div>
	<ol>
		{#each steps as name, index}
			{@const state = index < current ? 'done' : index === current ? 'current' : 'todo'}
			<li class={state}>
				<button type="button" onclick={() => onselect(index)} disabled={index > reached} aria-current={state === 'current' ? 'step' : undefined} aria-label={`Step ${index + 1}: ${name}${state === 'done' ? ' (done)' : ''}`}>
					<span class="dot">{#if state === 'done'}<Check size={15} strokeWidth={3} />{:else}{index + 1}{/if}</span>
					<span class="name">{name}</span>
				</button>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.stepper { position: relative; container-type: inline-size; padding: 4px 0 2px; }
	ol { position: relative; z-index: 1; margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); }
	.line { position: absolute; top: 21px; left: calc(100% / var(--n) / 2); right: calc(100% / var(--n) / 2); height: 3px; border-radius: 3px; background: var(--line); }
	.line span { display: block; height: 100%; width: calc(var(--p) * 100%); border-radius: inherit; background: var(--purple); transition: width .35s ease; }
	button { width: 100%; display: grid; justify-items: center; gap: 6px; padding: 0 4px; border: 0; background: none; color: var(--muted); font: inherit; cursor: pointer; }
	button:disabled { cursor: default; }
	.dot { display: grid; place-items: center; width: 36px; height: 36px; box-sizing: border-box; border: 2px solid var(--line); border-radius: 50%; background: var(--card); font-size: 14px; font-weight: 700; transition: background-color .2s ease, border-color .2s ease, box-shadow .2s ease; }
	.name { font-size: 13px; font-weight: 600; text-align: center; line-height: 1.3; overflow-wrap: anywhere; }
	.done .dot { border-color: var(--purple); background: var(--purple); color: var(--accent-text, #fff); }
	.done .name { color: var(--theme-text); }
	.current .dot { border-color: var(--purple); color: var(--purple); box-shadow: 0 0 0 5px color-mix(in srgb, var(--purple) 18%, transparent); }
	.current .name { color: var(--theme-text); font-weight: 700; }
	.done button:hover .dot { box-shadow: 0 0 0 4px color-mix(in srgb, var(--purple) 14%, transparent); }
	button:focus-visible { outline: none; }
	button:focus-visible .dot { box-shadow: 0 0 0 3px var(--card), 0 0 0 5px var(--purple); }
	@container (max-width: 480px) { .name { display: none; } .current .name { display: block; } }
	@media (prefers-reduced-motion: reduce) { .line span, .dot { transition: none; } }
</style>
