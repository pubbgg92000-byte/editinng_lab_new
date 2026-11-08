<!-- Page controls: "1–25 of 120 · Rows per page [25] · Previous · Page 1 of 5 · Next".
     Lists filtered in the browser bind page/pageSize. Orders (paged on the server) pass hrefFor and onSizeChange instead. -->
<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	let {
		total,
		page = $bindable(1),
		pageSize = $bindable(25),
		sizes = [10, 25, 50, 100],
		hrefFor,
		onSizeChange
	}: {
		total: number;
		page?: number;
		pageSize?: number;
		sizes?: number[];
		hrefFor?: (page: number) => string;
		onSizeChange?: (size: number) => void;
	} = $props();

	const pages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	const current = $derived(Math.min(Math.max(1, page), pages));
	const from = $derived(total ? (current - 1) * pageSize + 1 : 0);
	const to = $derived(Math.min(total, current * pageSize));
	const go = (next: number) => { page = Math.min(Math.max(1, next), pages); };
	const changeSize = (event: Event) => {
		const size = Number((event.currentTarget as HTMLSelectElement).value);
		if (onSizeChange) return onSizeChange(size);
		pageSize = size;
		page = 1;
	};
</script>

{#if total > 0}
	<nav class="pager" aria-label="Pages">
		<span class="range">{from}–{to} of {total}</span>
		<label class="size">Rows per page
			<select value={pageSize} onchange={changeSize}>{#each sizes as size}<option value={size}>{size}</option>{/each}</select>
		</label>
		{#if pages > 1}
			<div class="steps">
				{#if hrefFor}
					<a class="secondary" class:disabled={current <= 1} aria-disabled={current <= 1} href={hrefFor(Math.max(1, current - 1))}><ChevronLeft size={15} aria-hidden="true" />Previous</a>
					<span class="page-of">Page {current} of {pages}</span>
					<a class="secondary" class:disabled={current >= pages} aria-disabled={current >= pages} href={hrefFor(Math.min(pages, current + 1))}>Next<ChevronRight size={15} aria-hidden="true" /></a>
				{:else}
					<button type="button" class="secondary" disabled={current <= 1} onclick={() => go(current - 1)}><ChevronLeft size={15} aria-hidden="true" />Previous</button>
					<span class="page-of">Page {current} of {pages}</span>
					<button type="button" class="secondary" disabled={current >= pages} onclick={() => go(current + 1)}>Next<ChevronRight size={15} aria-hidden="true" /></button>
				{/if}
			</div>
		{/if}
	</nav>
{/if}

<style>
	.pager { display: flex; align-items: center; gap: 12px 18px; flex-wrap: wrap; margin-top: 12px; font-size: 13px; color: var(--muted); }
	.range { font-variant-numeric: tabular-nums; }
	.size { display: inline-flex; align-items: center; gap: 8px; }
	.size select { height: 34px; padding: 0 8px; border: 1px solid var(--line); border-radius: 9px; background: var(--card); color: var(--theme-text); font-size: 13px; }
	.steps { display: flex; align-items: center; gap: 8px; margin-left: auto; }
	.steps a, .steps button { display: inline-flex; align-items: center; gap: 4px; height: 36px; padding: 0 12px; font-size: 13px; text-decoration: none; cursor: pointer; }
	.steps a.disabled { pointer-events: none; opacity: .45; }
	.steps button:disabled { opacity: .45; cursor: default; }
	.page-of { color: var(--theme-text); font-weight: 600; }
</style>
