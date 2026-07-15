<script lang="ts">
	import { Search, MessageCircle, Check, Sheet } from 'lucide-svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import NewCustomerModal from '$lib/components/NewCustomerModal.svelte';
	import { money } from '$lib/data';
	import { customerStore } from '$lib/stores/app';
	import type { Customer } from '$lib/types';

	let query = $state('');
	let showNewCustomer = $state(false);
	let toast = $state('');
	const filtered = $derived($customerStore.filter((customer) => (customer.name + customer.business + customer.phone).toLowerCase().includes(query.toLowerCase())));

	function customerSaved(customer: Customer, synced: boolean) {
		customerStore.update((items) => [customer, ...items]);
		toast = synced ? 'Customer added and synced to Google Sheets' : 'Customer added in demo mode';
		setTimeout(() => (toast = ''), 3000);
	}
</script>

<PageHeader eyebrow="People you work with" title="Customers" action="New customer" onclick={() => (showNewCustomer = true)} />

<div class="list-tools">
	<div class="filter"><Search size={15}/><input bind:value={query} placeholder="Search customers" aria-label="Search customers"/></div>
	<div class="tool-actions"><a class="sheet-link" href="/settings/sheets"><Sheet size={13}/> Sheets data</a><span>{filtered.length} customers</span></div>
</div>

<div class="card table-wrap">
	<table class="data-table">
		<thead><tr><th>Customer</th><th>Phone</th><th>Projects</th><th>Pending</th><th></th></tr></thead>
		<tbody>{#each filtered as customer}<tr><td><strong>{customer.business}</strong><small>{customer.name} · {customer.id}</small></td><td>{customer.phone}</td><td>{customer.projects}</td><td class:clear={customer.pending===0}>{customer.pending ? money(customer.pending) : 'All clear'}</td><td><div class="row-actions"><a class="whatsapp" href={'https://wa.me/'+customer.phone.replace(/\D/g,'')} aria-label="WhatsApp customer"><MessageCircle size={14}/></a><a class="open-button" href={'/customer/'+customer.token}>Open</a></div></td></tr>{/each}</tbody>
	</table>
</div>

<NewCustomerModal bind:open={showNewCustomer} onsaved={customerSaved}/>
{#if toast}<div class="toast"><Check size={15}/>{toast}</div>{/if}

<style>
	.list-tools{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.filter{width:260px;display:flex;align-items:center;gap:8px;border:1px solid #2b2f38;border-radius:8px;padding:0 11px;background:#15181e;color:#687386}.filter input{height:36px;border:0;outline:0;background:transparent;color:white;width:100%;font-size:11px}.tool-actions{display:flex;align-items:center;gap:13px}.tool-actions>span{font-size:10px;color:#697487}.sheet-link{height:32px;display:flex;align-items:center;gap:6px;border:1px solid #30343e;border-radius:7px;padding:0 10px;color:#aab3c0;font-size:9px}.sheet-link:hover{border-color:#554785;color:#fff}.clear{color:#63d38c!important}.row-actions{display:flex;gap:7px;justify-content:flex-end}.whatsapp{width:29px;height:29px;display:grid;place-items:center;border:1px solid #30343e;border-radius:6px;color:#6bd291}.toast{position:fixed;right:24px;bottom:24px;z-index:100;display:flex;align-items:center;gap:9px;border:1px solid #22c55e40;background:#17231d;color:#8ee3ad;padding:12px 15px;border-radius:9px;font-size:11px;box-shadow:0 15px 50px #0008}@media(max-width:600px){.filter{width:190px}.tool-actions>span{display:none}.sheet-link{font-size:0}.sheet-link :global(svg){width:14px}}
</style>
