<!-- Production overview: workflow totals and the most relevant active orders. -->
<script lang="ts">
	import { untrack } from 'svelte';
	import { ClipboardList, Clock3, PackageCheck, CircleCheckBig, ArrowUpRight, Check, Star, UserRound } from '@lucide/svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import NewOrderModal from '$lib/components/NewOrderModal.svelte';
	import { formatDate } from '$lib/data';
	import type { Order } from '$lib/types';
	let { data } = $props();
	const initialData = untrack(() => data);
	let liveOrders = $state<Order[]>(initialData.orders);
	let stats = $state(initialData.stats);
	const currentDate = new Date(initialData.currentDateIso);
	const dateLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'Asia/Kolkata' }).format(currentDate);
	const hour = Number(new Intl.DateTimeFormat('en-IN', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(currentDate).slice(0, 2));
	const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
	const activeOrders = $derived(liveOrders.filter((order) => !['Historical', 'Completed'].includes(order.status)).sort((left, right) => Number(Boolean(right.important)) - Number(Boolean(left.important))));

	let showNewOrder = $state(false);
	let toast = $state('');
	function assignedEditors(order: Order) {
		const names = [...new Set(order.tasks.filter((task) => !task.archived && task.editorId).map((task) => task.assignee).filter(Boolean))];
		return names.length ? names.join(', ') : 'Not assigned';
	}
	function saved(order: Order, synced: boolean) {
		liveOrders = [order, ...liveOrders].slice(0, 20);
		stats = { ...stats, active: stats.active + 1 };
		toast = synced ? 'Order created and synced to Sheets' : 'Order created; Sheet sync is pending or not configured';
		setTimeout(() => (toast = ''), 2600);
	}
</script>

<PageHeader eyebrow={dateLabel} title={`${greeting} 👋`} action="New order" onclick={() => (showNewOrder = true)} />

<section class="stat-grid">
	<a href="/orders" class="card stat-card active-stat"><div class="stat-top"><span class="stat-icon"><ClipboardList size={19}/></span><small><i></i>Production</small></div><div class="stat-row"><strong>{stats.active}</strong><div><span>Active orders</span><p>Currently moving through production</p></div></div><div class="stat-footer"><span>Open all orders</span><ArrowUpRight size={14}/></div></a>
	<a href="/orders?status=Waiting%20Review" class="card stat-card review-stat"><div class="stat-top"><span class="stat-icon"><Clock3 size={19}/></span><small><i></i>Approval</small></div><div class="stat-row"><strong>{stats.waitingReview}</strong><div><span>Waiting review</span><p>Submitted and awaiting approval</p></div></div><div class="stat-footer"><span>Review submitted work</span><ArrowUpRight size={14}/></div></a>
	<a href="/orders?status=Ready%20Delivery" class="card stat-card ready-stat"><div class="stat-top"><span class="stat-icon"><PackageCheck size={19}/></span><small><i></i>Delivery</small></div><div class="stat-row"><strong>{stats.readyDelivery}</strong><div><span>Ready to deliver</span><p>Notify customer and collect balance</p></div></div><div class="stat-footer"><span>Open delivery queue</span><ArrowUpRight size={14}/></div></a>
	<a href="/orders?status=Delivered" class="card stat-card delivered-stat"><div class="stat-top"><span class="stat-icon"><CircleCheckBig size={19}/></span><small><i></i>Completed</small></div><div class="stat-row"><strong>{stats.delivered}</strong><div><span>Delivered</span><p>Completed customer handovers</p></div></div><div class="stat-footer"><span>View delivery history</span><ArrowUpRight size={14}/></div></a>
</section>

	<section class="card active-orders">
	<div class="card-header"><h2>Active orders</h2><a href="/orders">View all <ArrowUpRight size={12}/></a></div>
	<div class="order-list">
		{#each activeOrders as order}
		<a class="order-row" href={'/orders/' + order.id}>
			<span class="order-mark" style:background={order.color}></span>
			<div class="order-main"><strong>{#if order.important}<Star class="important-star" size={13} fill="currentColor" aria-label="Important order"/>{/if}{order.project}</strong><small>{order.customer} · {order.workType}</small><small class:unassigned={assignedEditors(order) === 'Not assigned'} class="editor-summary"><UserRound size={11}/> <span>Editor: {assignedEditors(order)}</span></small></div>
			<StatusBadge status={order.status}/>
			<div class="order-progress"><div class="progress-label"><span>Progress</span><b>{order.progress}%</b></div><div class="progress"><span style:width={order.progress + '%'}></span></div></div>
			<span class="due">{order.due ? `Due ${formatDate(order.due)}` : 'No due date'}</span>
			<ArrowUpRight size={15}/>
		</a>
	{/each}
	</div>
</section>

<NewOrderModal bind:open={showNewOrder} onsaved={saved}/>
{#if toast}<div class="toast"><Check size={15}/> {toast}</div>{/if}

<style>
	.card-header a { display: flex; gap: 5px; align-items: center; }
	.stat-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.stat-card{position:relative;overflow:hidden;padding:18px;min-height:164px;border:1px solid color-mix(in srgb,var(--stat-color) 28%,var(--line));background:linear-gradient(150deg,color-mix(in srgb,var(--stat-color) 8%,var(--card)),var(--card) 56%);color:inherit;display:flex;flex-direction:column;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}.stat-card::before{content:'';position:absolute;inset:0 auto 0 0;width:3px;background:var(--stat-color)}.stat-card::after{content:'';position:absolute;width:120px;height:120px;border-radius:50%;right:-58px;top:-62px;background:color-mix(in srgb,var(--stat-color) 11%,transparent);pointer-events:none}.stat-card:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--stat-color) 62%,var(--line));box-shadow:0 18px 38px color-mix(in srgb,var(--stat-color) 14%,transparent)}.stat-card:focus-visible{outline:3px solid color-mix(in srgb,var(--stat-color) 38%,transparent);outline-offset:3px}
	.active-stat{--stat-color:#6366f1}.review-stat{--stat-color:#f59e0b}.ready-stat{--stat-color:#14b8a6}.delivered-stat{--stat-color:#22c55e}
	.stat-top{display:flex;align-items:center;justify-content:space-between}.stat-top small{color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.11em;display:flex;align-items:center;gap:6px;font-weight:700}.stat-top small i{width:6px;height:6px;border-radius:50%;background:var(--stat-color);box-shadow:0 0 0 4px color-mix(in srgb,var(--stat-color) 12%,transparent)}.stat-icon{width:39px;height:39px;border-radius:10px;background:color-mix(in srgb,var(--stat-color) 13%,transparent);border:1px solid color-mix(in srgb,var(--stat-color) 22%,transparent);color:var(--stat-color);display:grid;place-items:center}.stat-row{display:flex;align-items:center;gap:13px;margin-top:17px}.stat-row strong{font-size:32px;line-height:1;font-variant-numeric:tabular-nums}.stat-row>div{min-width:0}.stat-row span{display:block;font-size:11px;font-weight:720}.stat-row p{margin:4px 0 0;color:var(--muted);font-size:8.5px;line-height:1.45}.stat-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:13px;border-top:1px solid color-mix(in srgb,var(--stat-color) 18%,var(--line));color:color-mix(in srgb,var(--stat-color) 78%,var(--text));font-size:8.5px;font-weight:650}.stat-footer :global(svg){transition:transform .18s ease}.stat-card:hover .stat-footer :global(svg){transform:translate(2px,-2px)}
	.active-orders { overflow: hidden; }
	.order-list { max-height: 420px; overflow-y: auto; scrollbar-gutter: stable; }
	.order-row { display: grid; grid-template-columns: 4px minmax(150px, 1.5fr) 120px 160px 80px 18px; gap: 18px; align-items: center; padding: 18px 20px; border-bottom: 1px solid #252832; transition: .15s; }
	.order-row:last-child { border: 0; }
	.order-row:hover { background: #ffffff05; }
	.order-mark { height: 33px; width: 3px; border-radius: 2px; }
	.order-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
	.order-main strong { font-size: 12px; font-weight: 600; display:flex;align-items:center;gap:6px; }
	.order-main strong :global(.important-star){color:#ef4444;flex:0 0 auto}
	.order-main small, .due { font-size: 10px; color: var(--muted); }
	.editor-summary{display:flex!important;align-items:center;gap:5px;color:var(--purple)!important}.editor-summary.unassigned{color:var(--muted)!important}.editor-summary :global(svg){flex:0 0 auto}
	.order-progress b { font-weight: 600; color: var(--theme-text); }
	.order-row > :global(svg) { color: var(--muted); }
	.toast { position: fixed; right: 24px; bottom: 24px; z-index: 100; display: flex; align-items: center; gap: 9px; border: 1px solid #22c55e40; background: #17231d; color: #8ee3ad; padding: 12px 15px; border-radius: 9px; font-size: 11px; box-shadow: 0 15px 50px #0008; }
	@media (max-width: 1080px) { .stat-grid{grid-template-columns:repeat(2,1fr)}.order-row { grid-template-columns: 4px minmax(150px, 1fr) 110px 120px 18px; } .due { display: none; } }
	@media (max-width: 820px) { .stat-grid{grid-template-columns:repeat(2,1fr)}.stat-card{min-height:150px;padding:15px 16px}.stat-row{margin-top:13px} }
	@media (max-width: 650px) { .stat-grid{gap:10px}.stat-card{min-height:122px;padding:13px}.stat-top small{font-size:7px}.stat-icon{width:32px;height:32px}.stat-row{gap:8px;margin-top:11px}.stat-row strong{font-size:25px}.stat-row span{font-size:10px}.stat-row p,.stat-footer{display:none}.order-row { grid-template-columns: 4px minmax(0,1fr) auto 16px; gap:10px;padding: 15px; } .order-progress { display: none; } .order-row :global(.badge){display:inline-flex;font-size:8px}.editor-summary span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap} }
	@media (max-width: 470px) { .stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.active-stat{grid-column:auto}.stat-card{min-height:118px}.stat-row{align-items:flex-end;flex-direction:column;gap:4px}.stat-row strong{align-self:flex-start}.stat-row>div{width:100%} }
	:global(html[data-theme="dark"]) .stat-card{background:linear-gradient(145deg,color-mix(in srgb,var(--stat-color) 17%,var(--card)),var(--card) 58%,color-mix(in srgb,var(--stat-color) 7%,var(--card)))!important;border-color:color-mix(in srgb,var(--stat-color) 42%,var(--line))!important;box-shadow:0 16px 38px color-mix(in srgb,var(--stat-color) 11%,#000),inset 0 1px color-mix(in srgb,var(--stat-color) 14%,transparent)!important}
	:global(html[data-theme="dark"]) .stat-icon{background:color-mix(in srgb,var(--stat-color) 23%,var(--card));border:1px solid color-mix(in srgb,var(--stat-color) 38%,transparent);box-shadow:0 8px 22px color-mix(in srgb,var(--stat-color) 14%,transparent)}
	:global(html[data-theme="dark"]) .active-orders{background:linear-gradient(155deg,color-mix(in srgb,var(--purple) 7%,var(--card)),var(--card) 62%,color-mix(in srgb,#38bdf8 4%,var(--card)))}
	:global(html[data-theme="dark"]) .order-row{border-bottom-color:color-mix(in srgb,var(--purple) 17%,var(--line));transition:background .22s ease,transform .22s ease,box-shadow .22s ease}
	:global(html[data-theme="dark"]) .order-row:hover{background:linear-gradient(90deg,color-mix(in srgb,var(--purple) 14%,transparent),color-mix(in srgb,#38bdf8 5%,transparent));box-shadow:inset 3px 0 var(--purple);transform:translateX(3px)}
	:global(html[data-theme="dark"]) .order-mark{box-shadow:0 0 12px color-mix(in srgb,var(--purple) 42%,transparent)}
	 :global(html[data-theme="light"]) .stat-card{color:#0f172a!important;background:linear-gradient(145deg,color-mix(in srgb,var(--stat-color) 9%,#fff),#fff 64%)!important;border:1px solid color-mix(in srgb,var(--stat-color) 22%,#e2e8f0)!important;border-top:3px solid var(--stat-color)!important;box-shadow:0 12px 34px color-mix(in srgb,var(--stat-color) 13%,transparent)!important} :global(html[data-theme="light"]) .stat-card::after{display:none} :global(html[data-theme="light"]) .stat-row strong{color:#0f172a;text-shadow:none} :global(html[data-theme="light"]) .stat-row span{color:#334155} :global(html[data-theme="light"]) .stat-icon{background:color-mix(in srgb,var(--stat-color) 12%,#fff)!important;color:var(--stat-color)!important;border-color:color-mix(in srgb,var(--stat-color) 22%,transparent)!important} :global(html[data-theme="light"]) .active-orders{ background: #ffffffeb; } :global(html[data-theme="light"]) .order-row{ border-bottom-color: #e2e8f0; transition: background .22s ease, transform .22s ease, box-shadow .22s ease; } :global(html[data-theme="light"]) .order-row:hover{ background: linear-gradient(90deg, #eef2ff91, #f0f9ff91); transform: translateX(3px); box-shadow: inset 3px 0 #6366f1; } :global(html[data-theme="light"]) .order-mark{ box-shadow: 0 0 0 4px #6366f112; } :global(html[data-theme="light"]) .order-main strong{ color: #0f172a; } :global(html[data-theme="light"]) .order-main small,:global(html[data-theme="light"]) .due{ color: #64748b; } :global(html[data-theme="light"]) .order-progress b{ color: #334155; } :global(html[data-theme="light"]) .order-row > :global(svg){ color: #818cf8; } :global(html[data-theme="light"]) .toast{ border-color: #10b98133; background: linear-gradient(135deg, #ecfdf5, #ffffff); color: #047857; box-shadow: 0 18px 55px #10b98120; }
</style>
