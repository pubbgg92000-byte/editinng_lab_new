<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { Search, Check, Edit3, Copy, RefreshCw, Archive, RotateCcw, Eye, ExternalLink, FolderKanban, Mail, MapPin, ReceiptIndianRupee } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import NewCustomerModal from '$lib/components/NewCustomerModal.svelte';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import { money } from '$lib/data';
	import { customerStore } from '$lib/stores/app';
	import type { Customer, Order } from '$lib/types';

	let query = $state('');
	let showNewCustomer = $state(false);
	let editingCustomer = $state<Customer | null>(null);
	let toast = $state('');
	let { data } = $props();
	let customers = $state<Customer[]>(untrack(() => data.customers));
	let orders = $state<Order[]>(untrack(() => data.orders));
	let showArchived = $state(false);
	let detailsOpen = $state(false);
	let selectedCustomer = $state<Customer | null>(null);
	const archivedCount = $derived(customers.filter((customer) => Boolean(customer.archived)).length);
	const filtered = $derived(customers.filter((customer) => Boolean(customer.archived) === showArchived && (customer.name + customer.business + customer.phone).toLowerCase().includes(query.toLowerCase())));
	const selectedOrders = $derived.by(() => {
		const customer = selectedCustomer;
		return customer ? orders.filter((order) => order.customerId === customer.id || (!order.customerId && order.customer === customer.business)) : [];
	});
	const totalBilled = $derived(selectedOrders.reduce((sum, order) => sum + (order.priceSet === false ? 0 : Math.max(0, order.price - order.discount)), 0));
	const totalPaid = $derived(selectedOrders.reduce((sum, order) => sum + order.paid, 0));

	function customerSaved(customer: Customer, synced: boolean) {
		customers = customers.some((item) => item.id === customer.id) ? customers.map((item) => item.id === customer.id ? customer : item) : [customer, ...customers];
		customerStore.update((items) => items.some((item) => item.id === customer.id) ? items.map((item) => item.id === customer.id ? customer : item) : [customer, ...items]);
		if (selectedCustomer?.id === customer.id) selectedCustomer = customer;
		toast = synced ? 'Customer saved and synced to Google Sheets' : 'Customer saved; Sheet sync is pending or not configured';
		setTimeout(() => (toast = ''), 3000);
	}
	function openCustomer(customer: Customer) { selectedCustomer = customer; detailsOpen = true; }
	function edit(customer: Customer) { detailsOpen = false; editingCustomer = customer; showNewCustomer = true; }
	function editSelectedCustomer() { if (selectedCustomer) edit(selectedCustomer); }
	function customerPortalUrl(token: string) {
		const url = new URL(`/customer/${token}`, location.origin);
		if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) url.protocol = 'http:';
		return url.toString();
	}
	async function copyLink(customer: Customer) { if (!customer.token) return; await navigator.clipboard.writeText(customerPortalUrl(customer.token)); toast = 'Private customer link copied'; setTimeout(() => toast = '', 2500); }
	async function regenerate(customer: Customer) { if (!confirm('Regenerate this customer link? The previous link will stop working.')) return; const response = await fetch(`/api/customers/${customer.id}`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({action:'regenerate-token'}) }); const result=await response.json(); if(response.ok){ customerStore.update((items)=>items.map((item)=>item.id===customer.id?{...item,token:result.token}:item)); toast='Customer link regenerated'; } else toast=result.error||'Unable to regenerate link'; setTimeout(()=>toast='',2500); }
	async function archiveCustomer(customer: Customer) { if (!confirm(`Archive ${customer.business}? Existing orders will be kept.`)) return; const response=await fetch(`/api/customers/${customer.id}`,{method:'DELETE'}); const result=await response.json(); if(!response.ok){toast=result.error||'Unable to archive customer';return} customers=customers.map((item)=>item.id===customer.id?result.customer:item); customerStore.update((items)=>items.filter((item)=>item.id!==customer.id)); toast='Customer archived'; }
	async function restoreCustomer(customer: Customer) { const response=await fetch(`/api/customers/${customer.id}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'restore'})}); const result=await response.json(); if(!response.ok){toast=result.error||'Unable to restore customer';return} customers=customers.map((item)=>item.id===customer.id?result.customer:item); customerStore.update((items)=>[result.customer,...items.filter((item)=>item.id!==customer.id)]); toast='Customer restored'; }
	onMount(() => {
		const customerId = new URL(location.href).searchParams.get('customer');
		const customer = customers.find((item) => item.id === customerId);
		if (customer) {
			showArchived = Boolean(customer.archived);
			openCustomer(customer);
		}
	});
</script>

<PageHeader eyebrow="People you work with" title="Customers" action="New customer" onclick={() => { editingCustomer = null; showNewCustomer = true; }} />

<div class="list-tools">
	<div class="filter"><Search size={15}/><input bind:value={query} placeholder="Search customers" aria-label="Search customers"/></div>
	<div class="tool-actions"><button class:active={showArchived} class="archive-toggle" onclick={() => (showArchived = !showArchived)}><span>{showArchived ? 'Back to active' : 'Archived'}</span><strong class="archive-count">{archivedCount}</strong></button><span>{filtered.length} customers</span></div>
</div>

<div class="card table-wrap">
	<table class="data-table customer-table">
		<thead><tr><th>Customer</th><th>Phone</th><th>Projects</th><th>Pending</th><th class="actions-heading">Actions</th></tr></thead>
		<tbody>{#each filtered as customer}<tr class:archived={customer.archived}><td><button class="customer-name-button" onclick={()=>openCustomer(customer)} aria-label={`Open ${customer.business} details`}><strong>{customer.business}</strong><small>{customer.name} · {customer.id}</small></button></td><td>{customer.phone}</td><td>{customer.projects}</td><td class:clear={customer.pending===0}>{customer.pending ? money(customer.pending) : 'All clear'}</td><td class="actions-cell"><div class="row-actions"><div class="action-cluster"><button class="view" onclick={()=>openCustomer(customer)} aria-label="View customer details" title="View details"><Eye size={14}/></button>{#if customer.archived}<button class="restore" onclick={()=>restoreCustomer(customer)} aria-label="Restore customer" title="Restore customer"><RotateCcw size={14}/></button>{:else}<button onclick={()=>edit(customer)} aria-label="Edit customer" title="Edit customer"><Edit3 size={14}/></button><button onclick={()=>copyLink(customer)} disabled={!customer.token} aria-label="Copy private link" title={customer.token ? 'Copy private link' : 'Private link unavailable'}><Copy size={14}/></button><button onclick={()=>regenerate(customer)} aria-label="Regenerate private link" title="Regenerate private link"><RefreshCw size={14}/></button>{#if customer.phone}<a class="whatsapp" href={'https://wa.me/'+customer.phone.replace(/\D/g,'')} target="_blank" rel="noreferrer" aria-label="WhatsApp customer" title="Open WhatsApp"><WhatsAppIcon size={15}/></a>{/if}{#if customer.token}<a class="portal-action" href={'/customer/'+customer.token} target="_blank" rel="noreferrer" aria-label="Open customer portal" title="Open customer portal"><ExternalLink size={14}/></a>{/if}{/if}</div>{#if !customer.archived}<button class="danger" onclick={()=>archiveCustomer(customer)} aria-label="Archive customer" title="Archive customer"><Archive size={14}/></button>{/if}</div></td></tr>{/each}</tbody>
	</table>
</div>

<Modal title="Customer details" bind:open={detailsOpen} wide>
	{#if selectedCustomer}
		<section class="customer-overview">
			<div class="card customer-profile"><div class="profile-head"><div><span>Customer overview</span><h2>{selectedCustomer.business}</h2><p>{selectedCustomer.name}</p></div><button class="secondary" onclick={editSelectedCustomer}><Edit3 size={13}/> Edit details</button></div><div class="contact-grid"><div><Mail size={14}/><span>Email<strong>{selectedCustomer.email||'Not added'}</strong></span></div><div><MapPin size={14}/><span>Address<strong>{selectedCustomer.address||'Not added'}</strong></span></div><div><ReceiptIndianRupee size={14}/><span>GSTIN<strong>{selectedCustomer.gst||'Not added'}</strong></span></div></div></div>
			<div class="card customer-finance"><span>Account summary</span><div><p>Total billed<strong>{money(totalBilled)}</strong></p><p>Total paid<strong class="paid">{money(totalPaid)}</strong></p><p>Pending<strong class:paid={selectedCustomer.pending===0}>{money(selectedCustomer.pending)}</strong></p></div></div>
			<div class="card customer-projects"><div class="projects-head"><div><span>Recent work</span><h2>{selectedOrders.length} projects</h2></div><FolderKanban size={18}/></div>{#if selectedOrders.length}<div class="mini-orders">{#each selectedOrders.slice(0,5) as order}<a href={'/orders/'+order.id}><span><strong>{order.project}</strong><small>{order.workType} · #{order.serial}</small></span><span>{order.status}</span></a>{/each}</div>{:else}<p class="empty-detail">No orders created for this customer yet.</p>{/if}</div>
		</section>
	{/if}
	{#snippet footer()}<button class="secondary" onclick={() => (detailsOpen = false)}>Close</button>{/snippet}
</Modal>

<NewCustomerModal bind:open={showNewCustomer} customer={editingCustomer} onsaved={customerSaved}/>
{#if toast}<div class="toast"><Check size={15}/>{toast}</div>{/if}

<style>
	.customer-name-button{border:0;background:transparent;color:inherit;text-align:left;padding:0;width:100%}
	.customer-table{table-layout:fixed}.customer-table th:nth-child(1){width:27%}.customer-table th:nth-child(2){width:14%}.customer-table th:nth-child(3){width:11%}.customer-table th:nth-child(4){width:14%}.customer-table th:nth-child(5){width:34%}.actions-heading{text-align:right}.actions-cell{white-space:nowrap}
	.customer-overview{display:grid;grid-template-columns:1.4fr .8fr;gap:14px}.customer-profile,.customer-finance,.customer-projects{padding:20px}.customer-projects{grid-column:1/-1}.profile-head,.projects-head{display:flex;align-items:flex-start;justify-content:space-between}.profile-head span,.customer-finance>span,.projects-head span{color:var(--purple);font-size:9px;text-transform:uppercase;letter-spacing:.08em}.profile-head h2,.projects-head h2{font-size:16px;margin:5px 0 2px}.profile-head p{color:var(--muted);font-size:10px;margin:0}.profile-head button{display:flex;align-items:center;gap:6px}.contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}.contact-grid>div{display:flex;align-items:flex-start;gap:8px;border:1px solid var(--line);border-radius:10px;padding:11px;color:var(--purple)}.contact-grid span{display:flex;flex-direction:column;gap:4px;color:var(--muted);font-size:8px}.contact-grid strong{color:var(--text);font-size:9px;line-height:1.4}.customer-finance>div{display:grid;gap:13px;margin-top:17px}.customer-finance p{display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:9px;margin:0}.customer-finance strong{color:var(--text);font-size:13px}.customer-finance strong.paid{color:#22a866}.mini-orders{display:grid;margin-top:14px}.mini-orders a{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--line)}.mini-orders a>span:first-child{display:flex;flex-direction:column;gap:3px}.mini-orders strong{font-size:10px}.mini-orders small,.mini-orders a>span:last-child,.empty-detail{font-size:8px;color:var(--muted)}.row-actions .view{color:var(--purple)}.empty-detail{margin:18px 0 0}@media(max-width:900px){.customer-overview{grid-template-columns:1fr}.customer-projects{grid-column:auto}.contact-grid{grid-template-columns:1fr}}
	.list-tools{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.filter{width:260px;display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:8px;padding:0 11px;background:var(--card);color:var(--muted)}.filter input{height:36px;border:0;outline:0;background:transparent;color:inherit;width:100%;font-size:11px}.tool-actions{display:flex;align-items:center;gap:10px}.tool-actions>span{font-size:10px;color:var(--muted)}.archive-toggle{height:32px;display:flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:8px;padding:0 6px 0 10px;color:var(--muted);background:var(--card);font-size:9px}.archive-toggle.active{color:var(--purple);border-color:var(--purple);background:color-mix(in srgb,var(--purple) 8%,var(--card))}.archive-count{min-width:20px;height:20px;padding:0 6px;display:grid;place-items:center;border-radius:999px;background:color-mix(in srgb,var(--purple) 12%,var(--theme-soft));color:var(--purple);font-size:9px;font-weight:700}.archive-toggle.active .archive-count{background:var(--purple);color:#fff}.clear{color:#63d38c!important}.row-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px}.action-cluster{display:flex;align-items:center;padding:3px;border:1px solid color-mix(in srgb,var(--purple) 18%,var(--line));border-radius:10px;background:color-mix(in srgb,var(--theme-soft) 42%,var(--card));box-shadow:inset 0 1px 0 color-mix(in srgb,#fff 7%,transparent)}.row-actions button,.row-actions a{flex:0 0 29px;width:29px;height:29px;padding:0;display:grid;place-items:center;border:0;background:transparent;border-radius:7px;color:var(--muted);transition:color .18s ease,background .18s ease,box-shadow .18s ease,transform .15s ease}.action-cluster button+button,.action-cluster button+a,.action-cluster a+a{position:relative}.action-cluster button+button::before,.action-cluster button+a::before,.action-cluster a+a::before{content:'';position:absolute;left:-1px;top:7px;width:1px;height:15px;background:color-mix(in srgb,var(--line) 72%,transparent)}.row-actions button:not(:disabled):hover,.row-actions a:hover{background:var(--card);color:var(--text);box-shadow:0 4px 12px #00000012;transform:translateY(-1px)}.row-actions button:focus-visible,.row-actions a:focus-visible{outline:2px solid color-mix(in srgb,var(--purple) 65%,transparent);outline-offset:2px}.row-actions button:disabled{opacity:.35;cursor:not-allowed}.row-actions .view,.row-actions .portal-action{color:var(--purple)}.row-actions .view{background:color-mix(in srgb,var(--purple) 11%,var(--card))}.row-actions .restore{color:#38bdf8}.row-actions .whatsapp{color:#16c967}.row-actions>.danger{border:1px solid color-mix(in srgb,#ef7777 25%,var(--line));background:color-mix(in srgb,#ef7777 6%,var(--card));color:#ef7777;border-radius:9px}.row-actions>.danger:hover{border-color:color-mix(in srgb,#ef7777 60%,var(--line));background:color-mix(in srgb,#ef7777 13%,var(--card));color:#e94e62}.archived td{text-decoration:line-through;color:var(--muted)}.archived .row-actions,.archived .row-actions button{text-decoration:none}.toast{position:fixed;right:24px;bottom:24px;z-index:100;display:flex;align-items:center;gap:9px;border:1px solid #22c55e40;background:#17231d;color:#8ee3ad;padding:12px 15px;border-radius:9px;font-size:11px;box-shadow:0 15px 50px #0008}@media(max-width:800px){.customer-table th:nth-child(1){width:24%}.customer-table th:nth-child(2){width:16%}.customer-table th:nth-child(3){width:10%}.customer-table th:nth-child(4){width:14%}.customer-table th:nth-child(5){width:36%}}@media(max-width:600px){.filter{width:190px}.tool-actions>span{display:none}}
</style>
