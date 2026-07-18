<script lang="ts">
	import Modal from './Modal.svelte';
	import { durationBillableAmount, formatVideoDuration } from '$lib/duration';
	import { money } from '$lib/data';
	import type { Order } from '$lib/types';

	let { open = $bindable(), order }: { open: boolean; order: Order } = $props();
	let billingMode = $state<'manual' | 'duration'>('manual');
	let manualSubtotal = $state<number | undefined>(undefined);
	let discountMode = $state<'percent' | 'amount'>('percent');
	let discountValue = $state(0);
	let saving = $state(false);
	let error = $state('');
	const durationItems = $derived(order.tasks.filter((task) => !task.archived && Number(task.videoDurationMinutes || 0) > 0 && Number(task.hourlyRate || 0) > 0).map((task) => ({ ...task, amount: durationBillableAmount(task.hourlyRate, task.videoDurationMinutes) })));
	const durationSubtotal = $derived(durationItems.reduce((sum, task) => sum + task.amount, 0));
	const subtotal = $derived(billingMode === 'duration' ? durationSubtotal : Number(manualSubtotal || 0));
	const discountAmount = $derived(discountMode === 'percent' ? Math.round(subtotal * Number(discountValue || 0) / 100 * 100) / 100 : Math.max(0, Number(discountValue || 0)));
	const total = $derived(Math.max(0, subtotal - discountAmount));

	$effect(() => {
		if (!open) return;
		billingMode = 'manual';
		manualSubtotal = order.priceSet === false ? undefined : order.price;
		discountMode = order.price > 0 && order.discount > 0 ? 'percent' : 'percent';
		discountValue = order.price > 0 ? Number(((order.discount || 0) / order.price * 100).toFixed(2)) : 0;
		error = '';
	});

	async function createInvoice() {
		if (billingMode === 'manual' && !(subtotal >= 0)) { error = 'Enter the manual invoice subtotal.'; return; }
		if (billingMode === 'duration' && !durationItems.length) { error = 'No task has both an editor duration and an hourly rate. Update the task billing details first.'; return; }
		if (discountMode === 'percent' && (discountValue < 0 || discountValue > 100)) { error = 'Discount percentage must be between 0 and 100.'; return; }
		if (discountAmount > subtotal) { error = 'Discount cannot be greater than the subtotal.'; return; }
		if (total + 0.009 < order.paid) { error = `Invoice total cannot be below payments already collected (${money(order.paid)}).`; return; }
		saving = true; error = '';
		const response = await fetch(`/api/orders/${order.id}/invoice`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'final', billingMode, manualSubtotal: subtotal, discountMode, discountValue }) });
		const result = await response.json();
		saving = false;
		if (!response.ok) { error = result.error || 'Unable to create invoice.'; return; }
		location.href = result.invoiceUrl;
	}
</script>

<Modal title="Create final invoice" bind:open wide>
	<div class="choice-grid">
		<label class:active={billingMode === 'manual'}><input type="radio" bind:group={billingMode} value="manual"/><span><strong>Manual total</strong><small>Use an amount decided by the admin.</small></span></label>
		<label class:active={billingMode === 'duration'}><input type="radio" bind:group={billingMode} value="duration"/><span><strong>Bill by video duration</strong><small>Rate × duration submitted by editors.</small></span></label>
	</div>
	{#if billingMode === 'manual'}
		<div class="field section"><label for="invoice-subtotal">Invoice subtotal (₹)</label><input id="invoice-subtotal" type="number" min="0" step="1" bind:value={manualSubtotal} placeholder="Enter the amount to bill"/></div>
	{:else}
		<div class="duration-list section"><header><span>Duration-ready tasks</span><strong>{money(durationSubtotal)}</strong></header>{#each durationItems as task}<div><span><b>{task.name}</b><small>{formatVideoDuration(task.videoDurationMinutes)} × {money(task.hourlyRate || 0)}/hr</small></span><strong>{money(task.amount)}</strong></div>{/each}{#if !durationItems.length}<p>No duration-ready tasks yet. Each billed task needs an hourly rate and editor-submitted duration.</p>{/if}</div>
	{/if}
	<div class="discount section"><div class="field"><label for="discount-mode">Discount method</label><select id="discount-mode" bind:value={discountMode}><option value="percent">Percentage (%)</option><option value="amount">Manual amount (₹)</option></select></div><div class="field"><label for="discount-value">Discount {discountMode === 'percent' ? '(%)' : '(₹)'}</label><input id="discount-value" type="number" min="0" max={discountMode === 'percent' ? 100 : undefined} step="0.01" bind:value={discountValue}/></div></div>
	<div class="summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Discount</span><strong>−{money(discountAmount)}</strong></div><div class="grand"><span>Invoice total</span><strong>{money(total)}</strong></div><div><span>Already collected</span><strong>{money(order.paid)}</strong></div></div>
	<p class="note">This choice and discount are saved as the invoice snapshot. The WhatsApp message includes a private printable invoice link.</p>
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={() => open = false}>Cancel</button><button class="primary" disabled={saving} onclick={createInvoice}>{saving ? 'Creating invoice…' : 'Confirm and create invoice'}</button>{/snippet}
</Modal>

<style>.choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.choice-grid>label{display:flex;align-items:flex-start;gap:9px;padding:13px;border:1px solid var(--line);border-radius:11px;background:var(--card);cursor:pointer}.choice-grid>label.active{border-color:var(--purple);background:var(--theme-soft)}.choice-grid input{width:auto;margin-top:2px}.choice-grid span{display:flex;flex-direction:column;gap:4px}.choice-grid strong{font-size:10px}.choice-grid small,.note{color:var(--muted);font-size:8px;line-height:1.5}.section{margin-top:16px}.discount{display:grid;grid-template-columns:1fr 1fr;gap:12px}.duration-list{border:1px solid var(--line);border-radius:11px;padding:13px;background:var(--theme-soft)}.duration-list header,.duration-list>div{display:flex;justify-content:space-between;gap:12px}.duration-list header{padding-bottom:9px;border-bottom:1px solid var(--line);font-size:10px}.duration-list>div{padding:9px 0;border-bottom:1px solid var(--line)}.duration-list>div:last-child{border:0}.duration-list span{display:flex;flex-direction:column;gap:3px}.duration-list b,.duration-list strong{font-size:9px}.duration-list small,.duration-list p{color:var(--muted);font-size:8px}.summary{display:grid;gap:7px;margin-top:16px;padding:13px;border:1px solid var(--line);border-radius:11px}.summary div{display:flex;justify-content:space-between;font-size:10px}.summary span{color:var(--muted)}.summary .grand{padding-top:7px;border-top:1px solid var(--line);font-size:13px}.note{margin:12px 0 0}.error{color:#ef4444;font-size:9px}@media(max-width:620px){.choice-grid,.discount{grid-template-columns:1fr}}</style>
