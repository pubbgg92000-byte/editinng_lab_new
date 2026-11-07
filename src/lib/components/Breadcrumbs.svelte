<!-- Back button + breadcrumb trail for detail and sub pages, e.g. ← Back · Orders › ORD-0012 · Wedding film. -->
<script lang="ts">
	import { ArrowLeft, ChevronRight } from '@lucide/svelte';
	let { items }: { items: { label: string; href?: string }[] } = $props();
	// The nearest linked ancestor is where "Back" goes.
	const parent = $derived([...items].slice(0, -1).reverse().find((item) => item.href));

	// Prefer real history when the user came from inside the app (keeps their filters and
	// scroll position); otherwise follow the parent link.
	function goBack(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey || event.shiftKey) return;
		try {
			if (history.length > 1 && document.referrer && new URL(document.referrer).origin === location.origin) {
				event.preventDefault();
				history.back();
			}
		} catch {
			/* fall through to the link */
		}
	}
</script>

<div class="crumb-bar">
	{#if parent}
		<a class="back" href={parent.href} onclick={goBack}><ArrowLeft size={16} aria-hidden="true" />Back<span class="sr-only"> to {parent.label}</span></a>
	{/if}
	<nav class="breadcrumbs" aria-label="Breadcrumb">
		<ol>
			{#each items as item, index}
				<li>
					{#if item.href && index < items.length - 1}<a href={item.href}>{item.label}</a>{:else}<span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>{/if}
					{#if index < items.length - 1}<ChevronRight size={14} aria-hidden="true" />{/if}
				</li>
			{/each}
		</ol>
	</nav>
</div>

<style>
	.crumb-bar { display: flex; align-items: center; gap: 12px; margin: 0 0 16px; min-width: 0; }
	.back { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px 0 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--theme-text); font-size: 13.5px; font-weight: 600; text-decoration: none; transition: border-color .15s ease; }
	.back:hover { border-color: color-mix(in srgb, var(--purple) 45%, var(--line)); }
	.back:focus-visible { outline: 2px solid var(--purple); outline-offset: 2px; }
	.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
	.breadcrumbs { min-width: 0; flex: 1; }
	ol { display: flex; align-items: center; gap: 4px; margin: 0; padding: 0; list-style: none; font-size: 13px; min-width: 0; }
	li { display: inline-flex; align-items: center; gap: 4px; min-width: 0; color: var(--muted); }
	li:last-child { flex: 1; }
	li :global(svg) { flex: 0 0 auto; opacity: .7; }
	a { color: var(--muted); text-decoration: none; font-weight: 500; white-space: nowrap; }
	ol a:hover { color: var(--theme-text); text-decoration: underline; }
	span[aria-current] { color: var(--theme-text); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
	/* Phones: the Back button is enough; keep only the current page name next to it. */
	@media (max-width: 560px) {
		li:not(:last-child) { display: none; }
	}
</style>
