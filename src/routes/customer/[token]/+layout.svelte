<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
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
	
		:global(html[data-theme="light"]) .customer-back{ border-color: #c7d2fe; border-radius: 12px; background: #fffffff0; color: #4f46e5; box-shadow: 0 10px 26px #6366f116; transition: .22s ease; }
		:global(html[data-theme="light"]) .customer-back:hover{ border-color: #818cf8; background: #eef2ff; color: #3730a3; transform: translateY(-1px); }
	
	@media (max-width: 650px) {
		.customer-back { position: static; margin: 16px 22px -14px; }
	}
</style>
