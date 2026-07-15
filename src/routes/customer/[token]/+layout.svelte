<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	let { children } = $props();

	function goBack() {
		if (history.length > 1) history.back();
		else location.assign('/customers');
	}
</script>

{@render children()}

<button class="customer-back" onclick={goBack} aria-label="Go back to customers">
	<ArrowLeft size={15} />
	Back to customers
</button>

<style>
	.customer-back {
		position: fixed;
		top: 84px;
		left: max(22px, calc((100vw - 880px) / 2));
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 7px;
		border: 1px solid #30343e;
		border-radius: 7px;
		background: #171a21;
		color: #aab2bf;
		padding: 8px 10px;
		font-size: 10px;
	}
	.customer-back:hover { border-color: #554785; color: #fff; }
	@media (max-width: 650px) {
		.customer-back { position: static; margin: 16px 22px -14px; }
	}
</style>
