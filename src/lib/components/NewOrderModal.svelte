<script lang="ts">
	import Modal from './Modal.svelte';
	import NewCustomerModal from './NewCustomerModal.svelte';
	import { customerStore } from '$lib/stores/app';
	import { Star } from 'lucide-svelte';
	import type { Customer, Order } from '$lib/types';

	let { open = $bindable(), onsaved = () => {} }: { open: boolean; onsaved?: (order: Order, synced: boolean) => void } = $props();
	const eventOptions = ['Wedding', 'Birthday', 'Half Saree', 'House Opening', 'Engagement', 'Reception', 'Other'];
	const sourceOptions = ['HD-1', 'HD-2', 'Customer drive', 'Online transfer', 'Other'];

	let customerId = $state('');
	let mobile = $state('');
	let showCustomer = $state(false);
	let event = $state('Wedding');
	let project = $state('');
	let receiving = $state('');
	let duration = $state('');
	let amount = $state<number | undefined>(undefined);
	let advance = $state<number | undefined>(undefined);
	let source = $state('HD-1');
	let due = $state('');
	let remarks = $state('');
	let important = $state(false);
	let saving = $state(false);
	let error = $state('');
	const balance = $derived(amount === undefined ? '' : String(Math.max(0, amount - (advance ?? 0))));
	const selectedCustomer = $derived($customerStore.find((item) => item.id === customerId));

	$effect(() => {
		if ((!customerId || !$customerStore.some((item) => item.id === customerId)) && $customerStore.length > 0) {
			customerId = $customerStore[0].id;
		}
	});

	$effect(() => {
		if (selectedCustomer) mobile = selectedCustomer.phone;
	});

	function customerSaved(customer: Customer) {
		customerStore.update((items) => items.some((item) => item.id === customer.id) ? items : [customer, ...items]);
		customerId = customer.id;
		mobile = customer.phone;
		error = '';
	}

	function reset() {
		customerId = $customerStore[0]?.id ?? '';
		mobile = $customerStore[0]?.phone ?? '';
		event = 'Wedding';
		project = receiving = duration = due = remarks = '';
		amount = advance = undefined;
		source = 'HD-1';
		important = false;
	}

	async function save() {
		if (!selectedCustomer || !event.trim() || !project.trim()) {
			error = 'Customer, event and project name are required.';
			return;
		}
		if (amount !== undefined && advance !== undefined && advance > amount) {
			error = 'Advance cannot be greater than the total amount.';
			return;
		}
		saving = true;
		error = '';
		try {
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ customerId: selectedCustomer.id, customer: selectedCustomer.business, mobile, event, project, receiving, duration, amount: amount ?? null, advance: advance ?? null, source, due, remarks, important })
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || 'Unable to create order');
			onsaved(result.order, result.sync?.configured === true && result.sync?.failed === 0);
			open = false;
			reset();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Unable to create order';
		} finally {
			saving = false;
		}
	}
</script>

<Modal title="Create new order" bind:open wide>
	<p class="sheet-note">Fields follow your current order tracking sheet.</p>
	<div class="form-grid">
		<div class="field">
			<label for="order-studio">Studio name *</label>
			<div class="customer-select"><select id="order-studio" bind:value={customerId}><option value="">Choose customer</option>{#each $customerStore as item}<option value={item.id}>{item.business}</option>{/each}</select><button class="secondary" type="button" onclick={() => (showCustomer = true)}>New</button></div>
		</div>
		<div class="field"><label for="order-mobile">Mobile number</label><input id="order-mobile" bind:value={mobile} inputmode="tel" placeholder="Customer mobile number" /></div>
		<div class="field"><label for="order-event">Event *</label><select id="order-event" bind:value={event}>{#each eventOptions as option}<option>{option}</option>{/each}</select></div>
		<div class="field"><label for="order-name">Project / event name *</label><input id="order-name" bind:value={project} placeholder="e.g. Hari Wedding" /></div>
		<div class="field"><label for="order-receiving">Receiving details</label><input id="order-receiving" bind:value={receiving} placeholder="Batch, person or received from" /></div>
		<div class="field"><label for="order-duration">Duration</label><input id="order-duration" bind:value={duration} placeholder="e.g. 3.31" /></div>
		<div class="field"><label for="order-amount">Amount (₹) <span>Optional</span></label><input id="order-amount" bind:value={amount} type="number" min="0" step="1" placeholder="Enter when confirmed" /></div>
		<div class="field"><label for="order-advance">Advance (₹) <span>Optional</span></label><input id="order-advance" bind:value={advance} type="number" min="0" step="1" placeholder="Enter if received" /></div>
		<div class="field"><label for="order-balance">Balance (₹)</label><input id="order-balance" value={balance} placeholder="Calculated after amount" readonly /></div>
		<div class="field"><label for="order-source">Source</label><select id="order-source" bind:value={source}>{#each sourceOptions as option}<option>{option}</option>{/each}</select></div>
		<div class="field"><label for="order-due">Delivery date</label><input id="order-due" bind:value={due} type="date" /></div>
	</div>
	<div class="note-heading"><label for="order-remarks">Remarks</label><button class:important class="important-toggle" type="button" aria-pressed={important} onclick={() => (important = !important)} title="Mark this order as important"><Star size={16} fill={important ? 'currentColor' : 'none'}/>{important ? 'Important' : 'Mark important'}</button></div>
	<div class="field note"><textarea id="order-remarks" bind:value={remarks} placeholder="Special instructions, editing notes or follow-up details..."></textarea></div>
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={() => (open = false)}>Cancel</button><button class="primary" disabled={saving} onclick={save}>{saving ? 'Creating...' : 'Create order'}</button>{/snippet}
</Modal>
<NewCustomerModal bind:open={showCustomer} onsaved={customerSaved}/>

<style>.sheet-note{margin:0 0 18px;color:#778294;font-size:10px}.field label span{color:var(--muted);font-size:9px;font-weight:400}.customer-select{display:grid;grid-template-columns:1fr auto;gap:7px}.note-heading{display:flex;align-items:center;justify-content:space-between;margin-top:18px}.note-heading>label{font-size:10px;color:var(--muted);font-weight:600}.important-toggle{border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:8px;padding:7px 10px;display:flex;align-items:center;gap:6px;font-size:9px}.important-toggle.important{color:#ef4444;border-color:#ef444466;background:#ef444412}.note{margin-top:7px}.error{color:#ef8585;font-size:10px;margin:12px 0 0}:global(html[data-theme="light"]) .sheet-note{color:#64748b}:global(html[data-theme="light"]) .important-toggle{background:#fff}:global(html[data-theme="light"]) .important-toggle.important{color:#dc2626;border-color:#fca5a5;background:#fff1f2}:global(html[data-theme="light"]) .error{color:#e11d48;background:#fff1f2;border:1px solid #fecdd3;border-radius:10px;padding:8px 10px}</style>
