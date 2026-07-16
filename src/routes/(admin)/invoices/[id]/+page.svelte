<script lang="ts">
	import { ArrowLeft, CalendarClock, FileText, IndianRupee } from 'lucide-svelte';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import { money } from '$lib/data';
	import type { ActivityLog, Invoice, Order } from '$lib/types';
	let { data }: { data: { invoice: Invoice; order: Order | null; activity: ActivityLog[] } } = $props();
	const whatsappUrl = $derived(data.order?.mobile ? `https://wa.me/${data.order.mobile.replace(/\D/g,'')}?text=${encodeURIComponent(data.invoice.message)}` : '');
</script>

<div class="detail-top"><a href="/invoices"><ArrowLeft size={15}/> Invoices</a>{#if whatsappUrl}<a class="primary whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer"><WhatsAppIcon size={16}/> Open in WhatsApp</a>{/if}</div>
<div class="invoice-heading"><span><FileText size={20}/></span><div><p>Invoice record</p><h1>{data.invoice.number}</h1><small>{data.invoice.id}</small></div></div>
<div class="detail-grid">
	<section class="card message-card"><h2>Message snapshot</h2><p>The exact bill text prepared when WhatsApp was opened.</p><pre>{data.invoice.message}</pre></section>
	<div class="side-grid">
		<section class="card summary-card"><div><CalendarClock size={15}/><span>Opened</span></div><strong>{new Date(data.invoice.openedAt).toLocaleString()}</strong></section>
		<section class="card summary-card"><div><IndianRupee size={15}/><span>Billing summary</span></div>{#if data.order}<dl><div><dt>Customer</dt><dd>{data.order.customer}</dd></div><div><dt>Project</dt><dd>{data.order.project}</dd></div><div><dt>Total</dt><dd>{data.order.priceSet===false?'Not set':money(data.order.price)}</dd></div><div><dt>Paid</dt><dd>{money(data.order.paid)}</dd></div><div><dt>Balance</dt><dd>{data.order.priceSet===false?'Not set':money(Math.max(0,data.order.price-data.order.paid))}</dd></div></dl>{:else}<p>Linked order is unavailable.</p>{/if}</section>
		<section class="card summary-card"><h2>History</h2>{#each data.activity as item}<div class="activity"><strong>{item.action}</strong><small>{new Date(item.createdAt).toLocaleString()}</small></div>{/each}</section>
	</div>
</div>

<style>.detail-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.detail-top>a{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:11px}.detail-top .whatsapp{color:white}.invoice-heading{display:flex;align-items:center;gap:14px;margin-bottom:22px}.invoice-heading>span{width:48px;height:48px;border-radius:13px;background:var(--theme-soft);color:var(--purple);display:grid;place-items:center}.invoice-heading p,.invoice-heading small{margin:0;color:var(--muted);font-size:9px}.invoice-heading h1{margin:3px 0;font-size:24px}.detail-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,.7fr);gap:16px}.message-card,.summary-card{padding:20px}.message-card h2,.summary-card h2{font-size:12px;margin:0}.message-card>p{color:var(--muted);font-size:9px}.message-card pre{margin:18px 0 0;border:1px solid var(--line);background:var(--theme-soft);border-radius:12px;padding:18px;white-space:pre-wrap;overflow-wrap:anywhere;font:10px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace}.side-grid{display:flex;flex-direction:column;gap:13px}.summary-card>div:first-child{display:flex;align-items:center;gap:7px;color:var(--purple);font-size:9px;margin-bottom:10px}.summary-card>strong{font-size:12px}.summary-card dl{margin:10px 0 0}.summary-card dl div{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:9px}.summary-card dt{color:var(--muted)}.summary-card dd{margin:0;text-align:right}.activity{display:flex;flex-direction:column;gap:3px;padding:9px 0;border-bottom:1px solid var(--line)}.activity strong{font-size:9px}.activity small{font-size:8px;color:var(--muted)}@media(max-width:760px){.detail-grid{grid-template-columns:1fr}}</style>
