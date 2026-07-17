<script lang="ts">
	import Modal from './Modal.svelte';
	import { money } from '$lib/data';
	import type { Order } from '$lib/types';

	let { open = $bindable(), order, onsaved = () => {} }: { open: boolean; order: Order; onsaved?: (order: Order) => void } = $props();
	let total = $state<number | undefined>(undefined);
	let discountPercent = $state(0);
	let saving = $state(false);
	let error = $state('');
	const discountAmount = $derived(Math.round(Number(total || 0) * Number(discountPercent || 0) / 100));
	const finalTotal = $derived(Math.max(0, Number(total || 0) - discountAmount));
	const balance = $derived(Math.max(0, finalTotal - order.paid));

	$effect(() => {
		if (open) {
			total = order.priceSet === false ? undefined : order.price;
			discountPercent = order.price > 0 ? Number(((order.discount || 0) / order.price * 100).toFixed(2)) : 0;
			error = '';
		}
	});

	async function save() {
		if (total === undefined || !Number.isFinite(Number(total)) || Number(total) < 0) { error = 'Enter the agreed total amount.'; return; }
		if (discountPercent < 0 || discountPercent > 100) { error = 'Discount percentage must be between 0% and 100%.'; return; }
		if (finalTotal < order.paid) { error = `The discounted total cannot be below the already collected amount (${money(order.paid)}).`; return; }
		saving = true;
		const response = await fetch(`/api/orders/${order.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ price: Number(total), discount: discountAmount, priceSet: true }) });
		const result = await response.json();
		saving = false;
		if (!response.ok) { error = result.error || 'Unable to save billing details.'; return; }
		open = false;
		onsaved(result.order);
	}
</script>

<Modal title="Set total and discount" bind:open>
	<div class="form-grid">
		<div class="field"><label for="billing-total">Agreed total (₹)</label><input id="billing-total" type="number" min="0" step="1" bind:value={total} placeholder="Enter total when confirmed"/></div>
		<div class="field"><label for="billing-discount">Discount (%)</label><input id="billing-discount" type="number" min="0" max="100" step="0.01" bind:value={discountPercent}/></div>
	</div>
	<div class="summary"><div><span>Discount ({discountPercent || 0}%)</span><strong>−{money(discountAmount)}</strong></div><div><span>Total after discount</span><strong>{money(finalTotal)}</strong></div><div><span>Already collected</span><strong>{money(order.paid)}</strong></div><div><span>Balance</span><strong>{money(balance)}</strong></div></div>
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={() => open = false}>Cancel</button><button class="primary" disabled={saving} onclick={save}>{saving ? 'Saving…' : 'Save billing'}</button>{/snippet}
</Modal>

<style>.summary{display:grid;gap:7px;margin-top:16px;border:1px solid var(--line);border-radius:10px;background:var(--theme-soft);padding:12px}.summary div{display:flex;justify-content:space-between;gap:12px;font-size:10px}.summary span{color:var(--muted)}.error{color:#ef4444;font-size:10px;margin-top:12px}</style>
