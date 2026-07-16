<script lang="ts">
	import Modal from './Modal.svelte';

	let { open = $bindable(), orderId, onsaved = () => {} }: { open: boolean; orderId: string; onsaved?: () => void } = $props();
	let amount = $state(0);
	let paidAt = $state(new Date().toISOString().slice(0, 10));
	let method = $state('UPI');
	let note = $state('');
	let error = $state('');
	let saving = $state(false);

	async function save() {
		if (!(amount > 0)) { error = 'Enter a payment amount.'; return; }
		saving = true;
		error = '';
		const response = await fetch(`/api/orders/${orderId}/payments`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ amount, paidAt, method, note })
		});
		const result = await response.json();
		saving = false;
		if (!response.ok) { error = result.error || 'Unable to record payment'; return; }
		open = false;
		amount = 0;
		note = '';
		onsaved();
	}
</script>

<Modal title="Record manual payment" bind:open>
	<div class="form-grid">
		<div class="field"><label for="payment-amount">Amount (₹)</label><input id="payment-amount" type="number" min="1" bind:value={amount}/></div>
		<div class="field"><label for="payment-date">Date</label><input id="payment-date" type="date" bind:value={paidAt}/></div>
		<div class="field"><label for="payment-method">Method</label><select id="payment-method" bind:value={method}><option>UPI</option><option>Cash</option><option>Bank transfer</option><option>Card</option><option>Other</option></select></div>
		<div class="field"><label for="payment-note">Note</label><input id="payment-note" bind:value={note}/></div>
	</div>
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={() => open = false}>Cancel</button><button class="primary" disabled={saving} onclick={save}>{saving ? 'Saving...' : 'Record payment'}</button>{/snippet}
</Modal>

<style>.error{color:#ef4444;font-size:10px;margin-top:12px}</style>
