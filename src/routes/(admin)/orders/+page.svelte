<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import NewOrderModal from '$lib/components/NewOrderModal.svelte';
	import { money } from '$lib/data';
	import { Search, SlidersHorizontal, Check, ArrowUpRight, X, Star } from 'lucide-svelte';
	import type { Order } from '$lib/types';

	let { data } = $props();
	let showNew = $state(false);
	let orders = $state<Order[]>(data.orders);
	let query = $state('');
	let toast = $state('');
	let filtersOpen = $state(false);
	let statusFilter = $state('');
	let eventFilter = $state('');
	const eventOptions = $derived([...new Set(orders.map((order) => order.workType).filter(Boolean))].sort());
	const filtered = $derived(orders.filter((order) => (order.project + order.customer + order.status + order.workType).toLowerCase().includes(query.toLowerCase()) && (!statusFilter || order.status === statusFilter) && (!eventFilter || order.workType === eventFilter)).sort((left, right) => Number(Boolean(right.important)) - Number(Boolean(left.important))));

	function saved(order: Order, synced: boolean) {
		orders = [order, ...orders];
		toast = synced ? 'Order created and synced to Sheets' : 'Order created; Sheet sync is pending or not configured';
		setTimeout(() => (toast = ''), 3000);
	}
</script>

<PageHeader eyebrow="Customer → editor → delivery" title="Orders" action="New order" onclick={() => (showNew = true)}/>
<div class="list-tools"><div class="filter"><Search size={15}/><input bind:value={query} placeholder="Search orders" aria-label="Search orders"/></div><button class:active={filtersOpen||statusFilter||eventFilter} class="secondary" onclick={()=>filtersOpen=!filtersOpen}><SlidersHorizontal size={13}/> Filter</button></div>
{#if filtersOpen}<div class="filter-panel"><div class="field"><label for="status-filter">Status</label><select id="status-filter" bind:value={statusFilter}><option value="">All statuses</option>{#each ['Historical','Received','Assigned','Editing','Waiting Review','Revision','Ready Delivery','Completed'] as status}<option>{status}</option>{/each}</select></div><div class="field"><label for="event-filter">Event</label><select id="event-filter" bind:value={eventFilter}><option value="">All events</option>{#each eventOptions as event}<option>{event}</option>{/each}</select></div><button class="clear-filters" onclick={()=>{statusFilter='';eventFilter=''}}><X size={13}/> Clear</button></div>{/if}
<div class="card table-wrap order-table-wrap"><table class="data-table order-table"><thead><tr><th style="width:34px"></th><th>Project</th><th>Studio</th><th>Event</th><th>Due date</th><th>Status</th><th>Amount</th><th>Balance</th><th></th></tr></thead><tbody>{#each filtered as order}<tr><td class="priority-cell">{#if order.important}<Star size={14} fill="currentColor" color="#ef4444" aria-label="Important order"/>{/if}</td><td><a class="project-link" href={'/orders/'+order.id}><strong>{order.project}</strong><small>#{order.serial} · {order.workType}{order.due ? ` · Due ${order.due}` : ''}</small></a></td><td>{order.customer}</td><td>{order.workType}</td><td>{order.due}</td><td><StatusBadge status={order.status}/></td><td>{order.priceSet === false ? 'Not set' : money(order.price)}</td><td class:clear={order.priceSet !== false && order.price - order.paid === 0}>{order.priceSet === false ? 'Not set' : money(Math.max(0, order.price - order.paid))}</td><td><a class="arrow-button" href={'/orders/'+order.id} aria-label={`Open ${order.project}`}><ArrowUpRight size={15}/></a></td></tr>{/each}</tbody></table></div>
<NewOrderModal bind:open={showNew} onsaved={saved}/>
{#if toast}<div class="toast"><Check size={15}/>{toast}</div>{/if}

<style>.list-tools{display:flex;justify-content:space-between;margin-bottom:14px}.filter{width:280px;display:flex;align-items:center;gap:8px;border:1px solid #2b2f38;border-radius:8px;padding:0 11px;background:#15181e;color:#687386}.filter input{height:36px;border:0;outline:0;background:transparent;color:white;width:100%;font-size:11px}.secondary{display:flex;align-items:center;gap:7px}.secondary.active{border-color:var(--purple);color:var(--purple)}.filter-panel{display:flex;align-items:end;gap:12px;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:13px;margin:-3px 0 14px}.filter-panel .field{min-width:180px}.clear-filters{height:38px;display:flex;align-items:center;gap:6px;border:0;background:transparent;color:var(--muted);font-size:9px}.arrow-button{width:30px;height:30px;border:1px solid var(--line);border-radius:8px;display:grid;place-items:center;color:var(--purple);transition:.18s}.arrow-button:hover{transform:translate(2px,-2px);border-color:var(--purple);background:var(--theme-soft)}.clear{color:#63d38c!important}.toast{position:fixed;right:24px;bottom:24px;z-index:100;display:flex;align-items:center;gap:9px;border:1px solid #22c55e40;background:#17231d;color:#8ee3ad;padding:12px 15px;border-radius:9px;font-size:11px;box-shadow:0 15px 50px #0008}:global(html[data-theme="light"]) .list-tools{margin-bottom:18px}:global(html[data-theme="light"]) .filter{border-color:#dbeafe;border-radius:14px;background:#fffffff2;color:#6366f1;box-shadow:0 8px 24px #3b82f60d;transition:border-color .22s ease,box-shadow .22s ease}:global(html[data-theme="light"]) .filter:focus-within{border-color:#6366f1;box-shadow:0 0 0 4px #6366f118,0 12px 28px #6366f114}:global(html[data-theme="light"]) .filter input{color:#0f172a}:global(html[data-theme="light"]) .filter input::placeholder{color:#94a3b8}:global(html[data-theme="light"]) .clear{color:#059669!important}:global(html[data-theme="light"]) .toast{border-color:#10b98133;background:linear-gradient(135deg,#ecfdf5,#ffffff);color:#047857;box-shadow:0 18px 55px #10b98120}@media(max-width:650px){.filter-panel{align-items:stretch;flex-direction:column}.filter-panel .field{min-width:0}}</style>
