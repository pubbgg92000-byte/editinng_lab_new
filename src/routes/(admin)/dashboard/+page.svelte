<script lang="ts">
	import { ClipboardList, Clock3, PackageCheck, ArrowUpRight, Check } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import NewOrderModal from '$lib/components/NewOrderModal.svelte';
	import { orders } from '$lib/data';

	let showNewOrder = $state(false);
	let toast = $state(false);
	function saved() {
		toast = true;
		setTimeout(() => (toast = false), 2600);
	}
</script>

<PageHeader eyebrow="Wednesday, 15 July" title="Good morning 👋" action="New order" onclick={() => (showNewOrder = true)} />

<section class="stat-grid">
	<div class="card stat-card"><p>Active orders</p><div class="stat-row"><strong>12</strong><span class="stat-icon"><ClipboardList size={17}/></span></div></div>
	<div class="card stat-card"><p>Waiting review</p><div class="stat-row"><strong>3</strong><span class="stat-icon"><Clock3 size={17}/></span></div></div>
	<div class="card stat-card"><p>Ready delivery</p><div class="stat-row"><strong>2</strong><span class="stat-icon"><PackageCheck size={17}/></span></div></div>
</section>

<section class="card active-orders">
	<div class="card-header"><h2>Active orders</h2><a href="/orders">View all <ArrowUpRight size={12}/></a></div>
	{#each orders.slice(0, 3) as order}
		<a class="order-row" href={'/orders/' + order.id}>
			<span class="order-mark" style:background={order.color}></span>
			<div class="order-main"><strong>{order.project}</strong><small>{order.customer} · {order.workType}</small></div>
			<StatusBadge status={order.status}/>
			<div class="order-progress"><div class="progress-label"><span>Progress</span><b>{order.progress}%</b></div><div class="progress"><span style:width={order.progress + '%'}></span></div></div>
			<span class="due">Due {order.due}</span>
			<ArrowUpRight size={15}/>
		</a>
	{/each}
</section>

<NewOrderModal bind:open={showNewOrder} onsaved={saved}/>
{#if toast}<div class="toast"><Check size={15}/> Order created and synced to Sheets</div>{/if}

<style>
	.card-header a { display: flex; gap: 5px; align-items: center; }
	.active-orders { overflow: hidden; }
	.order-row { display: grid; grid-template-columns: 4px minmax(150px, 1.5fr) 120px 160px 80px 18px; gap: 18px; align-items: center; padding: 18px 20px; border-bottom: 1px solid #252832; transition: .15s; }
	.order-row:last-child { border: 0; }
	.order-row:hover { background: #ffffff05; }
	.order-mark { height: 33px; width: 3px; border-radius: 2px; }
	.order-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
	.order-main strong { font-size: 12px; font-weight: 600; }
	.order-main small, .due { font-size: 10px; color: #707b8d; }
	.order-progress b { font-weight: 600; color: #c0c7d1; }
	.order-row > :global(svg) { color: #596476; }
	.toast { position: fixed; right: 24px; bottom: 24px; z-index: 100; display: flex; align-items: center; gap: 9px; border: 1px solid #22c55e40; background: #17231d; color: #8ee3ad; padding: 12px 15px; border-radius: 9px; font-size: 11px; box-shadow: 0 15px 50px #0008; }
	@media (max-width: 1080px) { .order-row { grid-template-columns: 4px minmax(150px, 1fr) 110px 120px 18px; } .due { display: none; } }
	@media (max-width: 650px) { .order-row { grid-template-columns: 4px 1fr 16px; padding: 15px; } .order-progress, .order-row :global(.badge) { display: none; } }
</style>
