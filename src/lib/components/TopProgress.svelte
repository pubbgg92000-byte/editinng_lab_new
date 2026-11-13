<!-- Slim top loading bar: shows while a page is changing or a saved action is in flight. -->
<script lang="ts">
	import { navigating } from '$app/state';
	import { actionFeedback } from '$lib/stores/actionFeedback';

	// A page change that is dropped mid-way (a data refresh started while it was loading) never
	// clears `navigating`, so remember it here; otherwise the bar would stay on until the next page change.
	let dropped = $state.raw<unknown>(null);
	$effect(() => {
		const target = navigating.to;
		if (!target) return;
		navigating.complete?.catch(() => { if (navigating.to === target) dropped = target; });
	});

	// Wait a moment before showing, so instant changes don't flash a bar.
	const loadingPage = $derived(Boolean(navigating.to) && navigating.to !== dropped);
	const busy = $derived(loadingPage || $actionFeedback.loading);
	let visible = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		if (busy) {
			timer = setTimeout(() => (visible = true), 120);
		} else {
			if (timer) clearTimeout(timer);
			visible = false;
		}
		return () => timer && clearTimeout(timer);
	});
</script>

{#if visible}
	<div class="top-progress" role="progressbar" aria-label={loadingPage ? 'Loading page' : 'Saving'} aria-busy="true"><span></span></div>
{/if}

<style>
	.top-progress { position: fixed; top: 0; left: 0; right: 0; z-index: 2000; height: 3px; overflow: hidden; background: color-mix(in srgb, var(--purple) 18%, transparent); pointer-events: none; }
	.top-progress span { position: absolute; top: 0; bottom: 0; left: 0; width: 40%; border-radius: 0 3px 3px 0; background: var(--purple); animation: slide 1.1s ease-in-out infinite; }
	@keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(260%); } }
	@media (prefers-reduced-motion: reduce) { .top-progress span { animation: none; width: 100%; opacity: .6; } }
</style>
