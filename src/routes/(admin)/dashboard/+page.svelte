<script lang="ts">
	import { ClipboardList, Clock3, PackageCheck, ArrowUpRight, Check, Star } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import NewOrderModal from '$lib/components/NewOrderModal.svelte';
	import type { Order } from '$lib/types';
	let { data } = $props();
	let liveOrders = $state<Order[]>(data.orders);
	const activeOrders = $derived(liveOrders.filter((order) => !['Historical', 'Completed'].includes(order.status)).sort((left, right) => Number(Boolean(right.important)) - Number(Boolean(left.important))));

	let showNewOrder = $state(false);
	let toast = $state('');
	function saved(order: Order, synced: boolean) {
		liveOrders = [order, ...liveOrders];
		toast = synced ? 'Order created and synced to Sheets' : 'Order created; Sheet sync is pending or not configured';
		setTimeout(() => (toast = ''), 2600);
	}
</script>

<PageHeader eyebrow="Wednesday, 15 July" title="Good morning 👋" action="New order" onclick={() => (showNewOrder = true)} />

<section class="stat-grid">
	<div class="card stat-card active-stat"><div class="stat-top"><span class="stat-icon"><ClipboardList size={18}/></span><small>Live pipeline</small></div><div class="stat-row"><div><strong>{activeOrders.length}</strong><span>Active orders</span></div></div><p>Currently moving through production</p></div>
	<div class="card stat-card review-stat"><div class="stat-top"><span class="stat-icon"><Clock3 size={18}/></span><small>Needs attention</small></div><div class="stat-row"><div><strong>{liveOrders.filter((order) => order.status === 'Waiting Review').length}</strong><span>Waiting review</span></div></div><p>Submitted and waiting for approval</p></div>
	<div class="card stat-card ready-stat"><div class="stat-top"><span class="stat-icon"><PackageCheck size={18}/></span><small>Final stage</small></div><div class="stat-row"><div><strong>{liveOrders.filter((order) => order.status === 'Ready Delivery').length}</strong><span>Ready delivery</span></div></div><p>Approved and ready for the customer</p></div>
</section>

	<section class="card active-orders">
	<div class="card-header"><h2>Active orders</h2><a href="/orders">View all <ArrowUpRight size={12}/></a></div>
	<div class="order-list">
		{#each activeOrders as order}
		<a class="order-row" href={'/orders/' + order.id}>
			<span class="order-mark" style:background={order.color}></span>
			<div class="order-main"><strong>{#if order.important}<Star class="important-star" size={13} fill="currentColor" aria-label="Important order"/>{/if}{order.project}</strong><small>{order.customer} · {order.workType}</small></div>
			<StatusBadge status={order.status}/>
			<div class="order-progress"><div class="progress-label"><span>Progress</span><b>{order.progress}%</b></div><div class="progress"><span style:width={order.progress + '%'}></span></div></div>
			<span class="due">Due {order.due}</span>
			<ArrowUpRight size={15}/>
		</a>
	{/each}
	</div>
</section>

<NewOrderModal bind:open={showNewOrder} onsaved={saved}/>
{#if toast}<div class="toast"><Check size={15}/> {toast}</div>{/if}

<style>
	.card-header a { display: flex; gap: 5px; align-items: center; }
	.stat-card{position:relative;overflow:hidden;padding:18px 19px;min-height:142px;border-top:3px solid var(--stat-color);background:linear-gradient(145deg,color-mix(in srgb,var(--stat-color) 8%,var(--card)),var(--card) 62%)}
	.active-stat{--stat-color:#6366f1}.review-stat{--stat-color:#f59e0b}.ready-stat{--stat-color:#14b8a6}
	.stat-top{display:flex;align-items:center;justify-content:space-between}.stat-top small{color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.09em}.stat-icon{width:38px;height:38px;border-radius:11px;background:color-mix(in srgb,var(--stat-color) 14%,transparent);color:var(--stat-color);display:grid;place-items:center}.stat-row{margin-top:15px}.stat-row>div{display:flex;align-items:baseline;gap:9px}.stat-row strong{font-size:31px}.stat-row span{font-size:11px;font-weight:650}.stat-card>p{margin:9px 0 0;color:var(--muted);font-size:9px}
	.active-orders { overflow: hidden; }
	.order-list { max-height: 420px; overflow-y: auto; scrollbar-gutter: stable; }
	.order-row { display: grid; grid-template-columns: 4px minmax(150px, 1.5fr) 120px 160px 80px 18px; gap: 18px; align-items: center; padding: 18px 20px; border-bottom: 1px solid #252832; transition: .15s; }
	.order-row:last-child { border: 0; }
	.order-row:hover { background: #ffffff05; }
	.order-mark { height: 33px; width: 3px; border-radius: 2px; }
	.order-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
	.order-main strong { font-size: 12px; font-weight: 600; display:flex;align-items:center;gap:6px; }
	.order-main strong :global(.important-star){color:#ef4444;flex:0 0 auto}
	.order-main small, .due { font-size: 10px; color: #707b8d; }
	.order-progress b { font-weight: 600; color: #c0c7d1; }
	.order-row > :global(svg) { color: #596476; }
	.toast { position: fixed; right: 24px; bottom: 24px; z-index: 100; display: flex; align-items: center; gap: 9px; border: 1px solid #22c55e40; background: #17231d; color: #8ee3ad; padding: 12px 15px; border-radius: 9px; font-size: 11px; box-shadow: 0 15px 50px #0008; }
	@media (max-width: 1080px) { .order-row { grid-template-columns: 4px minmax(150px, 1fr) 110px 120px 18px; } .due { display: none; } }
	@media (max-width: 820px) { .stat-grid{grid-template-columns:repeat(2,1fr)}.active-stat{grid-column:1/-1}.stat-card{min-height:118px;padding:15px 16px}.stat-row{margin-top:10px}.stat-card>p{margin-top:6px} }
	@media (max-width: 650px) { .order-row { grid-template-columns: 4px 1fr 16px; padding: 15px; } .order-progress, .order-row :global(.badge) { display: none; } }
	@media (max-width: 470px) { .stat-grid{grid-template-columns:1fr}.active-stat{grid-column:auto}.stat-card{min-height:108px}.stat-card>p{display:none} }
	:global(html[data-theme="dark"]) .stat-card{background:linear-gradient(145deg,color-mix(in srgb,var(--stat-color) 17%,var(--card)),var(--card) 58%,color-mix(in srgb,var(--stat-color) 7%,var(--card)))!important;border-color:color-mix(in srgb,var(--stat-color) 42%,var(--line))!important;box-shadow:0 16px 38px color-mix(in srgb,var(--stat-color) 11%,#000),inset 0 1px color-mix(in srgb,var(--stat-color) 14%,transparent)!important}
	:global(html[data-theme="dark"]) .stat-icon{background:color-mix(in srgb,var(--stat-color) 23%,var(--card));border:1px solid color-mix(in srgb,var(--stat-color) 38%,transparent);box-shadow:0 8px 22px color-mix(in srgb,var(--stat-color) 14%,transparent)}
	:global(html[data-theme="dark"]) .active-orders{background:linear-gradient(155deg,color-mix(in srgb,var(--purple) 7%,var(--card)),var(--card) 62%,color-mix(in srgb,#38bdf8 4%,var(--card)))}
	:global(html[data-theme="dark"]) .order-row{border-bottom-color:color-mix(in srgb,var(--purple) 17%,var(--line));transition:background .22s ease,transform .22s ease,box-shadow .22s ease}
	:global(html[data-theme="dark"]) .order-row:hover{background:linear-gradient(90deg,color-mix(in srgb,var(--purple) 14%,transparent),color-mix(in srgb,#38bdf8 5%,transparent));box-shadow:inset 3px 0 var(--purple);transform:translateX(3px)}
	:global(html[data-theme="dark"]) .order-mark{box-shadow:0 0 12px color-mix(in srgb,var(--purple) 42%,transparent)}
	 :global(html[data-theme="light"]) .stat-card{color:#0f172a!important;background:linear-gradient(145deg,color-mix(in srgb,var(--stat-color) 9%,#fff),#fff 64%)!important;border:1px solid color-mix(in srgb,var(--stat-color) 22%,#e2e8f0)!important;border-top:3px solid var(--stat-color)!important;box-shadow:0 12px 34px color-mix(in srgb,var(--stat-color) 13%,transparent)!important} :global(html[data-theme="light"]) .stat-card::after{display:none} :global(html[data-theme="light"]) .stat-row strong{color:#0f172a;text-shadow:none} :global(html[data-theme="light"]) .stat-row span{color:#334155} :global(html[data-theme="light"]) .stat-icon{background:color-mix(in srgb,var(--stat-color) 12%,#fff)!important;color:var(--stat-color)!important;border-color:color-mix(in srgb,var(--stat-color) 22%,transparent)!important} :global(html[data-theme="light"]) .active-orders{ background: #ffffffeb; } :global(html[data-theme="light"]) .order-row{ border-bottom-color: #e2e8f0; transition: background .22s ease, transform .22s ease, box-shadow .22s ease; } :global(html[data-theme="light"]) .order-row:hover{ background: linear-gradient(90deg, #eef2ff91, #f0f9ff91); transform: translateX(3px); box-shadow: inset 3px 0 #6366f1; } :global(html[data-theme="light"]) .order-mark{ box-shadow: 0 0 0 4px #6366f112; } :global(html[data-theme="light"]) .order-main strong{ color: #0f172a; } :global(html[data-theme="light"]) .order-main small,:global(html[data-theme="light"]) .due{ color: #64748b; } :global(html[data-theme="light"]) .order-progress b{ color: #334155; } :global(html[data-theme="light"]) .order-row > :global(svg){ color: #818cf8; } :global(html[data-theme="light"]) .toast{ border-color: #10b98133; background: linear-gradient(135deg, #ecfdf5, #ffffff); color: #047857; box-shadow: 0 18px 55px #10b98120; }
</style>
