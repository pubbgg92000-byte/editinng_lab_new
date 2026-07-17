<script lang="ts">
	import { CircleCheckBig, Link2, PackageCheck, MessageCircle, IndianRupee } from 'lucide-svelte';
	import Modal from './Modal.svelte';
	import { money } from '$lib/data';
	import type { Order } from '$lib/types';
	let { open = $bindable(false), order, ondelivered }: { open?: boolean; order: Order; ondelivered?: (order: Order) => void } = $props();
	const hasOutput = $derived(order.tasks.some((task) => !task.archived && task.status === 'Completed' && Boolean(task.outputLink?.trim())));
	const balance = $derived(order.priceSet === false ? null : Math.max(0, order.price - order.discount - order.paid));
	let method = $state<'digital' | 'offline'>('digital'); let confirmed = $state(false); let busy = $state(false); let error = $state('');
	$effect(() => { if (open) { method = hasOutput ? 'digital' : 'offline'; confirmed = false; error = ''; } });
	async function deliver() {
		if (!confirmed || balance === null || balance > .009 || (method === 'digital' && !hasOutput)) return;
		busy = true; error = '';
		const response = await fetch(`/api/orders/${order.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'Delivered', progress: 100, deliveryMethod: method, deliveredAt: new Date().toISOString() }) });
		const result = await response.json(); busy = false;
		if (!response.ok) { error = result.error || 'Unable to mark this order delivered.'; return; }
		open = false; ondelivered?.(result.order);
	}
</script>
<Modal bind:open title="Confirm customer delivery" wide>
	<div class="intro"><span><PackageCheck size={20}/></span><div><strong>{order.project}</strong><small>{order.customer} · Order #{order.serial}</small></div></div>
	<div class="checks"><div class:ok={balance !== null && balance <= .009}><IndianRupee size={16}/><span><strong>Payment</strong><small>{balance === null ? 'Set the final total first' : balance > .009 ? `${money(balance)} balance remaining` : 'Balance cleared'}</small></span></div><div class:ok={Boolean(order.customerNotifiedAt)}><MessageCircle size={16}/><span><strong>Customer notification</strong><small>{order.customerNotifiedAt ? 'WhatsApp message prepared' : 'Not recorded yet — you can still continue'}</small></span></div><div class:ok={hasOutput}><Link2 size={16}/><span><strong>Digital output</strong><small>{hasOutput ? 'Completed output link is available' : 'No completed task output link'}</small></span></div></div>
	<fieldset><legend>How was this work delivered?</legend><label class:disabled={!hasOutput}><input type="radio" bind:group={method} value="digital" disabled={!hasOutput}/><span><strong>Digital link</strong><small>Customer can open the final link from their status page.</small></span></label><label><input type="radio" bind:group={method} value="offline"/><span><strong>Physical / offline delivery</strong><small>Drive, hard disk, physical media, or in-person handover.</small></span></label></fieldset>
	<label class="confirmation"><input type="checkbox" bind:checked={confirmed}/><span>I confirm the final work was handed over to the customer.</span></label>
	{#if error}<p class="error">{error}</p>{/if}<div class="actions"><button class="secondary" type="button" onclick={() => (open = false)}>Cancel</button><button class="primary" type="button" disabled={busy || !confirmed || balance === null || balance > .009 || (method === 'digital' && !hasOutput)} onclick={deliver}><CircleCheckBig size={16}/>{busy ? 'Saving…' : 'Mark delivered'}</button></div>
</Modal>
<style>.intro{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid var(--line);border-radius:12px;background:var(--theme-soft)}.intro>span{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:var(--card);color:var(--purple)}.intro>div,.checks span,fieldset label span{display:flex;flex-direction:column;gap:3px}.intro strong{font-size:13px}.intro small,.checks small,fieldset small{color:var(--muted);font-size:10px}.checks{display:grid;gap:8px;margin:14px 0}.checks>div{display:flex;gap:10px;align-items:center;padding:10px 12px;border:1px solid #f59e0b45;border-radius:10px;color:#d97706;background:#f59e0b0b}.checks>div.ok{border-color:#22c55e3d;color:#16a34a;background:#22c55e09}.checks strong,fieldset strong{font-size:11px;color:var(--theme-text)}fieldset{display:grid;gap:8px;margin:0;padding:12px;border:1px solid var(--line);border-radius:12px}legend{padding:0 6px;color:var(--muted);font-size:10px}fieldset label{display:flex;align-items:flex-start;gap:9px;padding:9px;border-radius:9px;cursor:pointer}fieldset label:hover{background:var(--theme-soft)}fieldset label.disabled{opacity:.48;cursor:not-allowed}input{accent-color:var(--purple)}.confirmation{display:flex;align-items:flex-start;gap:9px;margin:14px 2px;color:var(--theme-text);font-size:11px;line-height:1.5}.error{margin:0 0 10px;color:#ef4444;font-size:10px}.actions{display:flex;justify-content:flex-end;gap:8px}.actions button{display:flex;align-items:center;gap:7px}.actions .primary:disabled{opacity:.45;cursor:not-allowed}@media(max-width:520px){.actions{display:grid;grid-template-columns:1fr 1fr}.actions button{justify-content:center}}</style>
