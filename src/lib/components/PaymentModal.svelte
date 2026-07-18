<script lang="ts">
	import { CheckCircle2, IndianRupee } from '@lucide/svelte';
	import Modal from './Modal.svelte';
	import { money } from '$lib/data';
	import type { OrderStatus } from '$lib/types';

	let { open = $bindable(), orderId, balance = 0, orderStatus = 'Received', onsaved = () => {} }: { open: boolean; orderId: string; balance?: number; orderStatus?: OrderStatus; onsaved?: () => void } = $props();
	let amount = $state(0); let paidAt = $state(new Date().toISOString().slice(0, 10)); let method = $state('UPI'); let note = $state('');
	let kind = $state<'advance' | 'payment'>('advance'); let generateInvoice = $state(true); let error = $state(''); let saving = $state(false); let saved = $state(false);
	$effect(() => { if (open) { kind = orderStatus === 'Received' ? 'advance' : 'payment'; amount = 0; note = ''; error = ''; saved = false; } });

	async function save() {
		if (!(amount > 0)) { error = 'Enter a payment amount.'; return; }
		if (balance > 0 && amount > balance + .009) { error = `Amount cannot be greater than the ${money(balance)} balance.`; return; }
		saving = true; error = '';
		const response = await fetch(`/api/orders/${orderId}/payments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ amount, paidAt, method, note, kind }) });
		const result = await response.json();
		if (!response.ok) { saving = false; error = result.error || 'Unable to record payment'; return; }
		saved = true; onsaved();
		if (generateInvoice) {
			const invoiceResponse = await fetch(`/api/orders/${orderId}/invoice`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, paymentId: result.payment.id }) });
			const invoiceResult = await invoiceResponse.json(); saving = false;
			if (!invoiceResponse.ok) { error = `Payment saved, but the receipt could not be generated: ${invoiceResult.error || 'unknown error'}`; return; }
			open = false; location.href = `/invoices/${invoiceResult.invoice.id}`; return;
		}
		saving = false; open = false;
	}
</script>

<Modal title="Record customer payment" bind:open>
	{#if balance > 0}<div class="balance-summary"><span><IndianRupee size={17}/></span><div><small>Current balance</small><strong>{money(balance)}</strong></div><button type="button" onclick={() => { amount = balance; kind = 'payment'; }}>Use full balance</button></div>{/if}
	<div class="form-grid">
		<div class="field"><label for="payment-kind">Collection type</label><select id="payment-kind" bind:value={kind}><option value="advance">Advance collected</option><option value="payment">Part / final payment</option></select><small>Use advance only for booking money collected before regular payments.</small></div>
		<div class="field"><label for="payment-amount">Amount (₹)</label><input id="payment-amount" type="number" min="1" max={balance > 0 ? balance : undefined} bind:value={amount}/></div>
		<div class="field"><label for="payment-date">Date</label><input id="payment-date" type="date" bind:value={paidAt}/></div>
		<div class="field"><label for="payment-method">Method</label><select id="payment-method" bind:value={method}><option>UPI</option><option>Cash</option><option>Bank transfer</option><option>Card</option><option>Other</option></select></div>
		<div class="field full"><label for="payment-note">Reference / note</label><input id="payment-note" bind:value={note} placeholder="Transaction ID or optional note"/></div>
	</div>
	<label class="invoice-option"><input type="checkbox" bind:checked={generateInvoice}/> Generate a professional receipt after saving</label>
	{#if saved}<p class="saved"><CheckCircle2 size={15}/> Payment is safely recorded.</p>{/if}{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={() => open = false}>{saved ? 'Close' : 'Cancel'}</button>{#if !saved}<button class="primary" disabled={saving} onclick={save}>{saving ? 'Saving…' : 'Record payment'}</button>{/if}{/snippet}
</Modal>

<style>.balance-summary{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;margin-bottom:15px;padding:12px;border:1px solid var(--line);border-radius:11px;background:var(--theme-soft)}.balance-summary>span{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:var(--card);color:var(--purple)}.balance-summary div{display:flex;flex-direction:column;gap:2px}.balance-summary small,.field small{color:var(--muted);font-size:9px;line-height:1.45}.balance-summary strong{font-size:15px}.balance-summary button{border:1px solid var(--purple);border-radius:8px;background:var(--card);color:var(--purple);padding:8px 10px;font-size:10px}.full{grid-column:1/-1}.invoice-option{display:flex;align-items:center;gap:8px;margin-top:14px;color:var(--muted);font-size:10px}.invoice-option input{width:auto}.error,.saved{display:flex;align-items:center;gap:7px;font-size:10px;margin-top:12px}.error{color:#ef4444}.saved{color:#16a34a}@media(max-width:600px){.balance-summary{grid-template-columns:auto 1fr}.balance-summary button{grid-column:1/-1}.full{grid-column:auto}}</style>
