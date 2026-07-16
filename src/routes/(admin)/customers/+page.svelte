<script lang="ts">
	import { Search, Check, Sheet, Edit3, Copy, RefreshCw, Archive, RotateCcw, Eye, ExternalLink, FolderKanban, Mail, MapPin, ReceiptIndianRupee } from 'lucide-svelte';
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
	let customers = $state<Customer[]>(data.customers);
	let orders = $state<Order[]>(data.orders);
	let showArchived = $state(false);
	let detailsOpen = $state(false);
	let selectedCustomer = $state<Customer | null>(null);
	const filtered = $derived(customers.filter((customer) => Boolean(customer.archived) === showArchived && (customer.name + customer.business + customer.phone).toLowerCase().includes(query.toLowerCase())));
	const selectedOrders = $derived.by(() => {
		const customer = selectedCustomer;
		return customer ? orders.filter((order) => order.customerId === customer.id || (!order.customerId && order.customer === customer.business)) : [];
	});
	const totalBilled = $derived(selectedOrders.reduce((sum, order) => sum + (order.priceSet === false ? 0 : order.price), 0));
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
	async function copyLink(customer: Customer) { if (!customer.token) return; await navigator.clipboard.writeText(`${location.origin}/customer/${customer.token}`); toast = 'Private customer link copied'; setTimeout(() => toast = '', 2500); }
	async function regenerate(customer: Customer) { if (!confirm('Regenerate this customer link? The previous link will stop working.')) return; const response = await fetch(`/api/customers/${customer.id}`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({action:'regenerate-token'}) }); const result=await response.json(); if(response.ok){ customerStore.update((items)=>items.map((item)=>item.id===customer.id?{...item,token:result.token}:item)); toast='Customer link regenerated'; } else toast=result.error||'Unable to regenerate link'; setTimeout(()=>toast='',2500); }
	async function archiveCustomer(customer: Customer) { if (!confirm(`Archive ${customer.business}? Existing orders will be kept.`)) return; const response=await fetch(`/api/customers/${customer.id}`,{method:'DELETE'}); const result=await response.json(); if(!response.ok){toast=result.error||'Unable to archive customer';return} customers=customers.map((item)=>item.id===customer.id?result.customer:item); customerStore.update((items)=>items.filter((item)=>item.id!==customer.id)); toast='Customer archived'; }
	async function restoreCustomer(customer: Customer) { const response=await fetch(`/api/customers/${customer.id}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'restore'})}); const result=await response.json(); if(!response.ok){toast=result.error||'Unable to restore customer';return} customers=customers.map((item)=>item.id===customer.id?result.customer:item); customerStore.update((items)=>[result.customer,...items.filter((item)=>item.id!==customer.id)]); toast='Customer restored'; }
</script>

<PageHeader eyebrow="People you work with" title="Customers" action="New customer" onclick={() => { editingCustomer = null; showNewCustomer = true; }} />

<div class="list-tools">
	<div class="filter"><Search size={15}/><input bind:value={query} placeholder="Search customers" aria-label="Search customers"/></div>
	<div class="tool-actions"><button class:active={showArchived} class="archive-toggle" onclick={() => (showArchived = !showArchived)}>{showArchived ? 'View active' : 'View archived'}</button><a class="sheet-link" href="/settings/sheets"><Sheet size={13}/> Sheets data</a><span>{filtered.length} customers</span></div>
</div>

<div class="card table-wrap">
	<table class="data-table customer-table">
		<thead><tr><th>Customer</th><th>Phone</th><th>Projects</th><th>Pending</th><th class="actions-heading">Actions</th></tr></thead>
		<tbody>{#each filtered as customer}<tr class:archived={customer.archived}><td><button class="customer-name-button" onclick={()=>openCustomer(customer)} aria-label={`Open ${customer.business} details`}><strong>{customer.business}</strong><small>{customer.name} · {customer.id}</small></button></td><td>{customer.phone}</td><td>{customer.projects}</td><td class:clear={customer.pending===0}>{customer.pending ? money(customer.pending) : 'All clear'}</td><td class="actions-cell"><div class="row-actions"><button class="view" onclick={()=>openCustomer(customer)} aria-label="View customer details" title="View customer details"><Eye size={14}/></button>{#if customer.archived}<button onclick={()=>restoreCustomer(customer)} aria-label="Restore customer" title="Restore"><RotateCcw size={14}/></button>{:else}<button onclick={()=>edit(customer)} aria-label="Edit customer"><Edit3 size={14}/></button><button onclick={()=>copyLink(customer)} disabled={!customer.token} aria-label="Copy private link"><Copy size={14}/></button><button onclick={()=>regenerate(customer)} aria-label="Regenerate private link"><RefreshCw size={14}/></button>{#if customer.phone}<a class="whatsapp" href={'https://wa.me/'+customer.phone.replace(/\D/g,'')} target="_blank" rel="noreferrer" aria-label="WhatsApp customer"><WhatsAppIcon size={15}/></a>{/if}{#if customer.token}<a class="portal-action" href={'/customer/'+customer.token} target="_blank" rel="noreferrer" aria-label="Open customer portal" title="Open customer portal"><ExternalLink size={14}/></a>{/if}<button class="danger" onclick={()=>archiveCustomer(customer)} aria-label="Archive customer" title="Archive"><Archive size={14}/></button>{/if}</div></td></tr>{/each}</tbody>
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
	.list-tools{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.filter{width:260px;display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:8px;padding:0 11px;background:var(--card);color:var(--muted)}.filter input{height:36px;border:0;outline:0;background:transparent;color:inherit;width:100%;font-size:11px}.tool-actions{display:flex;align-items:center;gap:10px}.tool-actions>span{font-size:10px;color:var(--muted)}.sheet-link,.archive-toggle{height:32px;display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:7px;padding:0 10px;color:var(--muted);background:var(--card);font-size:9px}.archive-toggle.active{color:var(--purple);border-color:var(--purple)}.clear{color:#63d38c!important}.row-actions{display:flex;flex-wrap:nowrap;gap:6px;justify-content:flex-end}.row-actions button,.row-actions a{flex:0 0 29px;width:29px;height:29px;padding:0;display:grid;place-items:center;border:1px solid var(--line);background:var(--card);border-radius:6px;color:var(--muted)}.row-actions .view,.row-actions .portal-action{color:var(--purple)}.row-actions .danger{color:#ef7777}.row-actions .whatsapp{color:#25d366}.archived td{text-decoration:line-through;color:var(--muted)}.archived .row-actions,.archived .row-actions button{text-decoration:none}.toast{position:fixed;right:24px;bottom:24px;z-index:100;display:flex;align-items:center;gap:9px;border:1px solid #22c55e40;background:#17231d;color:#8ee3ad;padding:12px 15px;border-radius:9px;font-size:11px;box-shadow:0 15px 50px #0008}@media(max-width:800px){.customer-table th:nth-child(1){width:24%}.customer-table th:nth-child(2){width:16%}.customer-table th:nth-child(3){width:10%}.customer-table th:nth-child(4){width:14%}.customer-table th:nth-child(5){width:36%}}@media(max-width:600px){.filter{width:190px}.tool-actions>span{display:none}.sheet-link{display:none}}
</style>
