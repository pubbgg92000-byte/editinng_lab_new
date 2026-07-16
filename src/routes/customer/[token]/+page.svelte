<script lang="ts">
	import { ArrowUpRight, Check, Circle, Clock3, Download, FileText } from 'lucide-svelte';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import PortalHeader from '$lib/components/PortalHeader.svelte';
	import { money } from '$lib/data';
	import type { Order } from '$lib/types';

	let { data } = $props();
	let selected = $state<Order | null>(data.orders[0] || null);
	const firstName = $derived((data.customer.name || data.customer.business || 'there').split(' ')[0]);
	const outputLink = $derived(selected?.tasks.find((task) => task.outputLink && task.status === 'Completed')?.outputLink || '');
	const steps = $derived(selected ? [
		['Files received', selected.progress > 0 || selected.status !== 'Received' ? 'done' : 'current'],
		['Work assigned', selected.tasks.length ? 'done' : ''],
		['Editing in progress', selected.progress >= 100 ? 'done' : selected.progress > 0 ? 'current' : ''],
		['Quality review', selected.status === 'Waiting Review' ? 'current' : ['Ready Delivery', 'Completed'].includes(selected.status) ? 'done' : ''],
		['Ready for delivery', selected.status === 'Ready Delivery' ? 'current' : selected.status === 'Completed' ? 'done' : ''],
		['Delivered', selected.status === 'Completed' ? 'done' : '']
	] : []);
	const studioPhone = $derived(data.settings?.phone?.replace(/\D/g, '') || '');
</script>

<svelte:head><title>{data.customer.business} — Anjana Creations</title></svelte:head>
<PortalHeader label="Customer portal"/>

<main class="customer-main">
	<div class="hello"><p>Hello {firstName} 👋</p><h1>Your projects</h1><span>Track approved progress, payments, and deliveries in one place.</span></div>
	{#if !selected}
		<section class="empty card"><FileText size={24}/><h2>No projects yet</h2><p>Your studio will add projects here after creating an order.</p></section>
	{:else}
		{#if data.orders.length > 1}<div class="project-switch">{#each data.orders as order}<button class:active={selected.id === order.id} onclick={() => selected = order}>{order.project}</button>{/each}</div>{/if}
		<section class="project-card card">
			<div class="project-head"><div><span>{selected.workType || 'Studio project'}</span><h2>{selected.project}</h2><p>Order #{selected.serial} {selected.due ? `· Delivery ${selected.due}` : ''}</p></div><span class="percent"><strong>{selected.progress}%</strong> complete</span></div>
			<div class="customer-progress">{#each steps as step, index}<div class:done={step[1] === 'done'} class:current={step[1] === 'current'}><span>{#if step[1] === 'done'}<Check size={13}/>{:else if step[1] === 'current'}<Clock3 size={13}/>{:else}<Circle size={9}/>{/if}</span><strong>{step[0]}</strong>{#if index < steps.length - 1}<i></i>{/if}</div>{/each}</div>
		</section>
		<div class="customer-grid">
			<section class="card invoice"><div class="section-title"><span><FileText size={16}/></span><div><h2>Bill summary</h2><p>Manual payment record</p></div></div><div class="money-grid"><div><span>Total</span><strong>{selected.priceSet === false ? 'Not set' : money(selected.price)}</strong></div><div><span>Paid</span><strong class="green">{selected.advanceSet === false && !(selected.payments || []).length ? 'Not recorded' : money(selected.paid)}</strong></div><div><span>Balance</span><strong>{selected.priceSet === false ? 'Not set' : money(Math.max(0, selected.price - selected.paid))}</strong></div></div></section>
			<section class="card delivery"><div class="section-title"><span><Download size={16}/></span><div><h2>Project files</h2><p>{outputLink ? 'Approved delivery is available' : 'Available after final approval'}</p></div></div>{#if outputLink}<a href={outputLink} target="_blank" rel="noreferrer">Open delivery <ArrowUpRight size={13}/></a>{:else}<span class="locked">Delivery link will appear here</span>{/if}</section>
		</div>
	{/if}
	{#if studioPhone}<a class="whatsapp" href={`https://wa.me/${studioPhone}`} target="_blank" rel="noreferrer"><WhatsAppIcon size={17}/> Chat with the studio on WhatsApp</a>{/if}
	<p class="privacy">This private link shows only your projects, payments, and approved delivery details.</p>
</main>

<style>
	.customer-main{max-width:820px;margin:0 auto;padding:62px 22px 80px}.hello{text-align:center;margin-bottom:38px}.hello p{color:var(--purple);font-size:11px;margin:0 0 8px}.hello h1{font-size:27px;margin:0}.hello>span{display:block;color:var(--muted);font-size:10px;margin-top:8px}.empty{text-align:center;padding:52px;color:var(--muted)}.empty svg{color:var(--purple)}.empty h2{font-size:16px;color:inherit}.empty p{font-size:10px}.project-switch{display:flex;justify-content:center;gap:6px;margin-bottom:13px;flex-wrap:wrap}.project-switch button{border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:8px;padding:8px 11px;font-size:9px}.project-switch button.active{border-color:var(--purple);color:var(--purple)}.project-card{padding:22px}.project-head{display:flex;justify-content:space-between}.project-head>div>span{color:var(--purple);font-size:9px}.project-head h2{font-size:18px;margin:5px 0}.project-head p{color:var(--muted);font-size:9px;margin:0}.percent{display:flex;flex-direction:column;text-align:right;color:var(--muted);font-size:8px;gap:2px}.percent strong{font-size:18px}.customer-progress{display:grid;grid-template-columns:repeat(6,1fr);margin-top:34px}.customer-progress>div{position:relative;text-align:center;display:flex;align-items:center;flex-direction:column;gap:9px}.customer-progress>div>span{position:relative;z-index:2;width:25px;height:25px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);background:var(--card);color:var(--muted)}.customer-progress>div.done>span{border-color:#22c55e50;background:#22c55e15;color:#4fd17d}.customer-progress>div.current>span{border-color:var(--purple);background:var(--theme-soft);color:var(--purple)}.customer-progress strong{font-size:8px;font-weight:550;color:var(--muted)}.customer-progress i{position:absolute;top:12px;left:50%;right:-50%;height:1px;background:var(--line);z-index:1}.customer-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:13px;margin-top:13px}.invoice,.delivery{padding:19px}.section-title{display:flex;align-items:center;gap:10px}.section-title>span{width:32px;height:32px;border-radius:8px;background:var(--theme-soft);color:var(--purple);display:grid;place-items:center}.section-title h2{font-size:11px;margin:0}.section-title p{font-size:8px;color:var(--muted);margin:3px 0 0}.money-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;border-top:1px solid var(--line);margin-top:17px;padding-top:14px}.money-grid div{display:flex;flex-direction:column;gap:4px}.money-grid span{color:var(--muted);font-size:8px}.money-grid strong{font-size:13px}.money-grid .green{color:#5dd087}.delivery>a,.locked{margin-top:18px;height:36px;border:1px solid var(--line);background:var(--theme-soft);color:var(--purple);border-radius:7px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:9px}.locked{color:var(--muted)}.whatsapp{width:max-content;margin:24px auto 0;display:flex;align-items:center;gap:8px;color:#62d58b;font-size:10px}.privacy{text-align:center;color:var(--muted);font-size:8px;margin-top:23px}@media(max-width:650px){.customer-main{padding-top:40px}.customer-progress{grid-template-columns:1fr;gap:11px}.customer-progress>div{flex-direction:row;text-align:left}.customer-progress i{left:12px;top:25px;bottom:-11px;width:1px;height:auto}.customer-grid{grid-template-columns:1fr}.project-head{gap:15px}}
</style>
