<!-- Overview: workflow totals, what needs attention today, and the active work queue. -->
<script lang="ts">
	  import { allowed } from '$lib/stores/permissions';
	import { page } from '$app/state';
import { untrack } from 'svelte';
	import { ClipboardList, Clock3, PackageCheck, CircleCheckBig, ArrowRight, Star, UserRound, CircleAlert, CalendarClock, Wallet, UserPlus } from '@lucide/svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import NewOrderModal from '$lib/components/NewOrderModal.svelte';
	import { formatDate, money } from '$lib/data';
	import { hasCapability, labelFor } from '$lib/capabilities';
	import { notifyAction } from '$lib/stores/actionFeedback';
	import type { Order } from '$lib/types';

	let { data } = $props();
	const initialData = untrack(() => data);
	let liveOrders = $state<Order[]>(initialData.orders);
	let stats = $state(initialData.stats);
	let showNewOrder = $state(false);

	const currentDate = new Date(initialData.currentDateIso);
	const dateLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' }).format(currentDate);
	const todayIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(currentDate);
	const hour = Number(new Intl.DateTimeFormat('en-IN', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(currentDate).slice(0, 2));
	const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

	const orderLabel = $derived(labelFor(data.configuration?.profile, 'order'));
	const orderPlural = $derived(labelFor(data.configuration?.profile, 'order', true));
	const workerLabel = $derived(labelFor(data.configuration?.profile, 'staff'));
	const staffEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, 'work.staff'));
	const paymentsEnabled = $derived(hasCapability(data.configuration?.effectiveCapabilities, 'billing.payments'));
	const activeOrders = $derived(liveOrders
		.filter((order) => !['Historical', 'Completed'].includes(order.status))
		.sort((left, right) => Number(Boolean(right.important)) - Number(Boolean(left.important))));

	function assignedEditors(order: Order) {
		const names = [...new Set(order.tasks.filter((task) => !task.archived && task.editorId).map((task) => task.assignee).filter(Boolean))];
		return names.length ? names.join(', ') : '';
	}
	const balanceOf = (order: Order) => (order.priceSet === false ? 0 : Math.max(0, order.price - order.discount - order.paid));

	// Plain-language to-do list built from the loaded queue: the few things that need a person today.
	type Attention = { order: Order; kind: 'overdue' | 'review' | 'balance' | 'unassigned'; text: string };
	const attention = $derived.by(() => {
		const items: Attention[] = [];
		for (const order of activeOrders) {
			const name = order.project || order.customer;
			if (order.due && order.due.slice(0, 10) < todayIso && !['Delivered', 'Stopped'].includes(order.status)) items.push({ order, kind: 'overdue', text: `${name} was due ${formatDate(order.due)}` });
			else if (order.status === 'Waiting Review') items.push({ order, kind: 'review', text: `${name} is waiting for your review` });
			else if (order.status === 'Ready Delivery' && paymentsEnabled && balanceOf(order) > 0) items.push({ order, kind: 'balance', text: `${name} is ready, but ${money(balanceOf(order))} is still due` });
			else if (staffEnabled && order.status === 'Received' && !assignedEditors(order)) items.push({ order, kind: 'unassigned', text: `${name} has no ${workerLabel.toLowerCase()} assigned yet` });
		}
		const rank = { overdue: 0, review: 1, balance: 2, unassigned: 3 };
		return items.sort((a, b) => rank[a.kind] - rank[b.kind]).slice(0, 6);
	});
	const attentionIcon = { overdue: CalendarClock, review: Clock3, balance: Wallet, unassigned: UserPlus };

	const statCards = $derived([
		{ href: '/orders', icon: ClipboardList, value: stats.active, label: `Active ${orderPlural.toLowerCase()}`, hint: 'In progress right now' },
		{ href: '/orders?status=Waiting%20Review', icon: Clock3, value: stats.waitingReview, label: 'Waiting for review', hint: 'Work submitted, needs your check' },
		{ href: '/orders?status=Ready%20Delivery', icon: PackageCheck, value: stats.readyDelivery, label: 'Ready to deliver', hint: 'Finished, not handed over yet' },
		{ href: '/orders?status=Delivered', icon: CircleCheckBig, value: stats.delivered, label: 'Delivered', hint: 'Handed over to the customer' }
	]);

	function saved(order: Order, synced: boolean) {
		liveOrders = [order, ...liveOrders].slice(0, 20);
		stats = { ...stats, active: stats.active + 1 };
		notifyAction(synced ? `${orderLabel} created.` : `${orderLabel} created. Google Sheets will update when the connection is available.`);
	}
</script>

<PageHeader eyebrow={`${greeting} · ${dateLabel}`} title="Overview" action={allowed('orders.edit') ? `New ${orderLabel.toLowerCase()}` : undefined} onclick={() => (showNewOrder = true)} />
{#if page.url.searchParams.get('denied')}<p class="denied" role="status">You don't have access to that page. Ask your workspace admin if you need it.</p>{/if}

<section class="stats" aria-label="Summary">
	{#each statCards as stat}
		{@const Icon = stat.icon}
		<a class="card stat" href={stat.href}>
			<span class="stat-label"><Icon size={16} aria-hidden="true" />{stat.label}</span>
			<strong>{stat.value}</strong>
			<span class="stat-hint">{stat.hint}</span>
		</a>
	{/each}
</section>

<div class="columns">
	<section class="card panel attention" aria-labelledby="attention-title">
		<header class="panel-head"><h2 id="attention-title">Needs attention</h2></header>
		{#if attention.length}
			<ul class="attention-list">
				{#each attention as item (item.order.id + item.kind)}
					{@const Icon = attentionIcon[item.kind]}
					<li><a href={'/orders/' + item.order.id} class={`attention-item ${item.kind}`}>
						<span class="attention-icon"><Icon size={16} aria-hidden="true" /></span>
						<span class="attention-text">{item.text}</span>
						<ArrowRight size={15} aria-hidden="true" />
					</a></li>
				{/each}
			</ul>
		{:else}
			<div class="all-clear"><CircleCheckBig size={20} aria-hidden="true" /><p><strong>All clear.</strong> Nothing is overdue or waiting on you.</p></div>
		{/if}
	</section>

	<section class="card panel queue" aria-labelledby="queue-title">
		<header class="panel-head"><h2 id="queue-title">Active {orderPlural.toLowerCase()}</h2><a href="/orders">See all <ArrowRight size={14} aria-hidden="true" /></a></header>
		{#if activeOrders.length}
			<ul class="queue-list">
				{#each activeOrders as order (order.id)}
					<li><a class="queue-row" href={'/orders/' + order.id}>
						<span class="queue-main">
							<strong>{#if order.important}<Star class="important-star" size={13} fill="currentColor" aria-label="Important" />{/if}{order.project}</strong>
							<small>{order.customer}{order.workType ? ` · ${order.workType}` : ''}</small>
							{#if staffEnabled}<small class="queue-staff" class:unassigned={!assignedEditors(order)}><UserRound size={12} aria-hidden="true" />{assignedEditors(order) ? `${workerLabel}: ${assignedEditors(order)}` : `No ${workerLabel.toLowerCase()} assigned`}</small>{/if}
						</span>
						<span class="queue-status"><StatusBadge status={order.status} /></span>
						<span class="queue-progress" aria-label={`Progress ${order.progress}%`}>
							<span class="bar"><span style:width={order.progress + '%'}></span></span>
							<small>{order.progress}%</small>
						</span>
						<span class="queue-due" class:late={order.due && order.due.slice(0, 10) < todayIso}>{order.due ? `Due ${formatDate(order.due)}` : 'No due date'}</span>
					</a></li>
				{/each}
			</ul>
		{:else}
			<div class="empty">
				<ClipboardList size={22} aria-hidden="true" />
				<p><strong>No active {orderPlural.toLowerCase()} yet.</strong> Create one to start tracking work.</p>
				{#if allowed('orders.edit')}<button type="button" class="secondary" onclick={() => (showNewOrder = true)}>New {orderLabel.toLowerCase()}</button>{/if}
			</div>
		{/if}
	</section>
</div>

<NewOrderModal bind:open={showNewOrder} onsaved={saved} />

<style>
	.denied { margin: 0 0 16px; padding: 10px 14px; border: 1px solid color-mix(in srgb, #d97706 40%, var(--line)); border-radius: 10px; background: color-mix(in srgb, #f59e0b 10%, var(--card)); color: var(--theme-text); font-size: 14px; }
	.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
	.stat { display: flex; flex-direction: column; gap: 6px; padding: 18px; color: inherit; text-decoration: none; transition: border-color .15s ease; }
	.stat:hover { border-color: color-mix(in srgb, var(--purple) 45%, var(--line)); }
	.stat:focus-visible { outline: 2px solid var(--purple); outline-offset: 2px; }
	.stat-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--theme-text); }
	.stat-label :global(svg) { color: var(--purple); }
	.stat strong { font-size: 30px; line-height: 1.1; font-weight: 700; color: var(--theme-text); letter-spacing: -.02em; }
	.stat-hint { font-size: 12.5px; color: var(--muted); }

	.columns { display: grid; grid-template-columns: minmax(260px, 1fr) minmax(0, 2fr); gap: 14px; align-items: start; }
	.panel { padding: 0; overflow: hidden; }
	.panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--line); }
	.panel-head h2 { margin: 0; font-size: 15px; font-weight: 650; color: var(--theme-text); }
	.panel-head a { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: var(--purple); text-decoration: none; }
	.panel-head a:hover { text-decoration: underline; }
	ul { list-style: none; margin: 0; padding: 0; }

	.attention-item { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; padding: 12px 18px; border-bottom: 1px solid var(--line); color: var(--theme-text); text-decoration: none; font-size: 13.5px; line-height: 1.4; transition: background-color .15s ease; }
	li:last-child .attention-item { border-bottom: 0; }
	.attention-item:hover { background: var(--theme-soft); }
	.attention-item > :global(svg) { color: var(--muted); }
	.attention-icon { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; background: color-mix(in srgb, var(--tone) 14%, transparent); color: var(--tone); }
	.overdue { --tone: #dc2626; }
	.review { --tone: #d97706; }
	.balance { --tone: #2563eb; }
	.unassigned { --tone: #7c3aed; }
	.all-clear, .empty { display: flex; align-items: center; gap: 12px; padding: 22px 18px; color: var(--muted); font-size: 13.5px; }
	.all-clear :global(svg) { color: #16a34a; flex: 0 0 auto; }
	.all-clear p, .empty p { margin: 0; }
	.all-clear strong, .empty strong { color: var(--theme-text); }
	.empty { flex-wrap: wrap; }

	.queue-row { display: grid; grid-template-columns: minmax(0, 1fr) auto 120px 110px; align-items: center; gap: 16px; padding: 13px 18px; border-bottom: 1px solid var(--line); color: inherit; text-decoration: none; transition: background-color .15s ease; }
	li:last-child .queue-row { border-bottom: 0; }
	.queue-row:hover { background: var(--theme-soft); }
	.queue-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
	.queue-main strong { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: var(--theme-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.queue-main :global(.important-star) { color: #e11d48; flex: 0 0 auto; }
	.queue-main small { font-size: 12.5px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.queue-staff { display: inline-flex; align-items: center; gap: 5px; }
	.queue-staff.unassigned { color: #b45309; }
	.queue-progress { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px; }
	.queue-progress small { font-size: 12.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
	.bar { height: 6px; border-radius: 6px; background: var(--theme-soft); overflow: hidden; }
	.bar span { display: block; height: 100%; background: var(--purple); border-radius: inherit; }
	.queue-due { font-size: 12.5px; color: var(--muted); text-align: right; white-space: nowrap; }
	.queue-due.late { color: #dc2626; font-weight: 600; }

	@media (max-width: 1100px) {
		.columns { grid-template-columns: 1fr; }
	}
	@media (max-width: 900px) {
		.stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.queue-row { grid-template-columns: minmax(0, 1fr) auto; }
		.queue-progress, .queue-due { grid-column: 1 / -1; }
		.queue-due { text-align: left; }
	}
	@media (max-width: 480px) {
		.stat { padding: 14px; }
		.stat strong { font-size: 26px; }
	}
</style>
