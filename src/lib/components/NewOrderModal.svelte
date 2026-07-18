<script lang="ts">
	import Modal from './Modal.svelte';
	import NewCustomerModal from './NewCustomerModal.svelte';
	import { customerStore } from '$lib/stores/app';
	import { ChevronDown, Plus, Star, Trash2, X } from '@lucide/svelte';
	import type { Customer, Order } from '$lib/types';
	import { indianMobileError, normalizeIndianMobile } from '$lib/phone';

	type EventOption = { name: string; custom: boolean };
	type TaskDraft = { key: string; name: string; billableAmount?: number };
	type Draft = {
		key: string; event: string; customEvent: string; project: string; receiving: string; duration: string;
		amount?: number; advance?: number; source: string; due: string; remarks: string; important: boolean; tasks: TaskDraft[];
	};

	let { open = $bindable(), onsaved = () => {} }: { open: boolean; onsaved?: (order: Order, synced: boolean) => void } = $props();
	const sourceOptions = ['HD-1', 'HD-2', 'Customer drive', 'Online transfer', 'Other'];
	const defaultEvents: EventOption[] = ['Wedding', 'Birthday', 'Half Saree', 'House Opening', 'Engagement', 'Reception'].map((name) => ({ name, custom: false }));
	let draftCounter = 0;
	let taskCounter = 0;
	const newTask = (): TaskDraft => ({ key: `task-draft-${++taskCounter}`, name: '' });
	const newDraft = (): Draft => ({ key: `order-draft-${++draftCounter}`, event: 'Wedding', customEvent: '', project: '', receiving: '', duration: '', source: 'HD-1', due: '', remarks: '', important: false, tasks: [newTask()] });

	let customerId = $state('');
	let mobile = $state('');
	let showCustomer = $state(false);
	let drafts = $state<Draft[]>([newDraft()]);
	let eventOptions = $state<EventOption[]>(defaultEvents);
	let loadingEvents = $state(false);
	let saving = $state(false);
	let error = $state('');
	let loadedForOpen = $state(false);
	const selectedCustomer = $derived($customerStore.find((item) => item.id === customerId));

	$effect(() => {
		if ((!customerId || !$customerStore.some((item) => item.id === customerId)) && $customerStore.length > 0) customerId = $customerStore[0].id;
	});
	$effect(() => { if (selectedCustomer) mobile = selectedCustomer.phone; });
	$effect(() => {
		if (open && !loadedForOpen) { loadedForOpen = true; void loadEventOptions(); }
		if (!open) loadedForOpen = false;
	});

	async function loadEventOptions() {
		loadingEvents = true;
		try {
			const response = await fetch('/api/event-options');
			const result = await response.json();
			if (response.ok) eventOptions = result.options;
		} finally { loadingEvents = false; }
	}

	function customerSaved(customer: Customer) {
		customerStore.update((items) => items.some((item) => item.id === customer.id) ? items : [customer, ...items]);
		customerId = customer.id;
		mobile = customer.phone;
		error = '';
	}

	function addOrder() { drafts.push(newDraft()); }
	function removeOrder(index: number) { if (drafts.length > 1) drafts.splice(index, 1); }
	function addTask(draft: Draft) { draft.tasks.push(newTask()); }
	function removeTask(draft: Draft, index: number) { if (draft.tasks.length > 1) draft.tasks.splice(index, 1); else draft.tasks[0] = newTask(); }
	function reset() {
		customerId = $customerStore[0]?.id ?? '';
		mobile = $customerStore[0]?.phone ?? '';
		drafts = [newDraft()];
		error = '';
	}

	async function addCustomEvent(draft: Draft) {
		const name = draft.customEvent.trim();
		if (!name) { error = 'Enter a name for the custom event type.'; return; }
		const response = await fetch('/api/event-options', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
		const result = await response.json();
		if (!response.ok) { error = result.error || 'Unable to add event type.'; return; }
		eventOptions = result.options;
		draft.event = result.options.find((item: EventOption) => item.name.toLowerCase() === name.toLowerCase())?.name || name;
		draft.customEvent = '';
		error = '';
	}

	async function deleteCustomEvent(name: string) {
		if (!confirm(`Remove “${name}” from future event choices? Existing orders will not change.`)) return;
		const response = await fetch('/api/event-options', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
		const result = await response.json();
		if (!response.ok) { error = result.error || 'Unable to remove event type.'; return; }
		eventOptions = result.options;
		for (const draft of drafts) if (draft.event === name) draft.event = 'Wedding';
	}

	async function save() {
		if (!selectedCustomer) { error = 'Choose or create a customer.'; return; }
		const phoneError = indianMobileError(mobile, true);
		if (phoneError) { error = phoneError; return; }
		mobile = normalizeIndianMobile(mobile);
		for (const [index, draft] of drafts.entries()) {
			if (!draft.event.trim() || draft.event === 'Other' || !draft.project.trim()) { error = `Add the event and project name for order ${index + 1}.`; return; }
			if (draft.amount !== undefined && draft.advance !== undefined && draft.advance > draft.amount) { error = `Advance cannot be greater than the total for order ${index + 1}.`; return; }
		}
		saving = true;
		error = '';
		try {
			const response = await fetch('/api/orders', {
				method: 'POST', headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					customerId: selectedCustomer.id, customer: selectedCustomer.business, mobile,
					orders: drafts.map((draft) => ({ ...draft, amount: draft.amount ?? null, advance: draft.advance ?? null, tasks: draft.tasks.filter((task) => task.name.trim()).map((task) => ({ name: task.name.trim(), billableAmount: Math.max(0, Number(task.billableAmount || 0)) })) }))
				})
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || 'Unable to create orders');
			for (const order of result.orders || [result.order]) onsaved(order, result.sync?.configured === true && result.sync?.failed === 0);
			open = false;
			reset();
		} catch (cause) { error = cause instanceof Error ? cause.message : 'Unable to create orders'; }
		finally { saving = false; }
	}
</script>

<Modal title={drafts.length > 1 ? `Create ${drafts.length} orders` : 'Create new order'} bind:open wide>
	<p class="sheet-note">Choose the customer once, then add one or more projects. Each project becomes a separate order.</p>
	<div class="form-grid customer-fields">
		<div class="field"><label for="order-studio">Studio name *</label><div class="customer-select"><div class="select-control"><select id="order-studio" bind:value={customerId}><option value="">Choose customer</option>{#each $customerStore as item}<option value={item.id}>{item.business}</option>{/each}</select><span class="select-chevron" aria-hidden="true"><ChevronDown size={15}/></span></div><button class="secondary" type="button" onclick={() => (showCustomer = true)}>New</button></div></div>
		<div class="field"><label for="order-mobile">10-digit mobile number *</label><input id="order-mobile" bind:value={mobile} inputmode="tel" autocomplete="tel" placeholder="98765 43210" /></div>
	</div>

	<div class="orders-stack">
		{#each drafts as draft, index (draft.key)}
			<section class="order-draft">
				<div class="draft-head"><div><strong>Order {index + 1}</strong><span>{draft.project || 'New project'}</span></div>{#if drafts.length > 1}<button type="button" class="remove-order" title="Remove this order" onclick={() => removeOrder(index)}><Trash2 size={14}/></button>{/if}</div>
				<div class="form-grid">
					<div class="field"><label for={`order-event-${draft.key}`}>Event *</label><div class="select-control"><select id={`order-event-${draft.key}`} bind:value={draft.event} disabled={loadingEvents}>{#each eventOptions as option}<option value={option.name}>{option.name}</option>{/each}<option value="Other">+ Other / create new</option></select><span class="select-chevron" aria-hidden="true"><ChevronDown size={15}/></span></div></div>
					<div class="field"><label for={`order-name-${draft.key}`}>Project / event name *</label><input id={`order-name-${draft.key}`} bind:value={draft.project} placeholder="e.g. Hari Wedding" /></div>
					{#if draft.event === 'Other'}<div class="field custom-event"><label for={`custom-event-${draft.key}`}>New event type</label><div><input id={`custom-event-${draft.key}`} bind:value={draft.customEvent} placeholder="e.g. Corporate film" /><button type="button" class="secondary" onclick={() => addCustomEvent(draft)}>Add</button></div></div>{/if}
					<div class="field"><label for={`order-due-${draft.key}`}>Delivery date</label><input id={`order-due-${draft.key}`} bind:value={draft.due} type="date" /></div>
					<div class="field"><label for={`order-amount-${draft.key}`}>Order total (₹) <span>Optional</span></label><input id={`order-amount-${draft.key}`} bind:value={draft.amount} type="number" min="0" step="1" placeholder="Can be set later" /></div>
					<div class="field"><label for={`order-advance-${draft.key}`}>Advance collected (₹) <span>Optional</span></label><input id={`order-advance-${draft.key}`} bind:value={draft.advance} type="number" min="0" step="1" placeholder="0" /></div>
					<div class="field"><label for={`order-source-${draft.key}`}>Source</label><div class="select-control"><select id={`order-source-${draft.key}`} bind:value={draft.source}>{#each sourceOptions as option}<option>{option}</option>{/each}</select><span class="select-chevron" aria-hidden="true"><ChevronDown size={15}/></span></div></div>
					<div class="field"><label for={`order-receiving-${draft.key}`}>Receiving details</label><input id={`order-receiving-${draft.key}`} bind:value={draft.receiving} placeholder="Batch, person or received from" /></div>
					<div class="field"><label for={`order-duration-${draft.key}`}>Duration</label><input id={`order-duration-${draft.key}`} bind:value={draft.duration} placeholder="e.g. 2 hours" /></div>
				</div>
				<div class="field task-input"><div class="task-heading"><span class="task-label">Small tasks <small>Optional</small></span><button type="button" onclick={() => addTask(draft)}><Plus size={13}/> Add task</button></div><div class="task-drafts">{#each draft.tasks as task, taskIndex (task.key)}<div class="task-draft"><input aria-label={`Task ${taskIndex + 1} name`} bind:value={task.name} placeholder="e.g. Colour correction"/><input aria-label={`Task ${taskIndex + 1} value`} bind:value={task.billableAmount} type="number" min="0" placeholder="Value ₹"/><button type="button" aria-label={`Remove task ${taskIndex + 1}`} onclick={() => removeTask(draft, taskIndex)}><X size={13}/></button></div>{/each}</div><small>Values are optional. Completed tasks with a value can be billed partially.</small></div>
				<div class="note-heading"><label for={`order-remarks-${draft.key}`}>Remarks</label><button class:important={draft.important} class="important-toggle" type="button" aria-pressed={draft.important} onclick={() => (draft.important = !draft.important)}><Star size={15} fill={draft.important ? 'currentColor' : 'none'}/>{draft.important ? 'Important' : 'Mark important'}</button></div>
				<div class="field note"><textarea id={`order-remarks-${draft.key}`} bind:value={draft.remarks} placeholder="Special instructions or follow-up details..."></textarea></div>
			</section>
		{/each}
	</div>
	<button type="button" class="add-order" onclick={addOrder}><Plus size={15}/> Add another order for this customer</button>
	{#if eventOptions.some((option) => option.custom)}<div class="custom-options"><span>Custom event choices</span>{#each eventOptions.filter((option) => option.custom) as option}<button type="button" onclick={() => deleteCustomEvent(option.name)}>{option.name}<X size={11}/></button>{/each}</div>{/if}
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={() => (open = false)}>Cancel</button><button class="primary" disabled={saving} onclick={save}>{saving ? 'Creating...' : drafts.length > 1 ? `Create ${drafts.length} orders` : 'Create order'}</button>{/snippet}
</Modal>
<NewCustomerModal bind:open={showCustomer} onsaved={customerSaved}/>

<style>
	.sheet-note{margin:0 0 16px;color:var(--muted);font-size:10px}.customer-fields{padding-bottom:16px;border-bottom:1px solid var(--line)}.customer-select,.custom-event>div{display:grid;grid-template-columns:1fr auto;gap:7px}.select-control{position:relative;min-width:0}.select-control select{appearance:none;-webkit-appearance:none;padding-right:48px}.select-chevron{position:absolute;right:10px;top:50%;width:28px;height:28px;display:grid;place-items:center;transform:translateY(-50%);border:1px solid color-mix(in srgb,var(--purple) 24%,transparent);border-radius:8px;background:var(--theme-soft);color:var(--purple);pointer-events:none;transition:border-color .18s,background .18s,color .18s}.select-control:focus-within .select-chevron{border-color:var(--purple);background:color-mix(in srgb,var(--theme-soft) 75%,var(--purple) 25%)}.select-control select:disabled+.select-chevron{opacity:.45}.orders-stack{display:grid;gap:14px;margin-top:16px}.order-draft{border:1px solid var(--line);border-radius:14px;padding:16px;background:color-mix(in srgb,var(--card) 93%,var(--theme-soft))}.draft-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.draft-head>div{display:flex;align-items:baseline;gap:9px}.draft-head strong{font-size:12px}.draft-head span{font-size:9px;color:var(--muted)}.remove-order{border:1px solid #fb718555;background:#fb718512;color:#fb7185;border-radius:7px;padding:6px;display:grid;place-items:center}.field label span{color:var(--muted);font-size:8px;font-weight:400}.task-input{margin-top:14px}.task-heading{display:flex;align-items:center;justify-content:space-between}.task-heading button{display:flex;align-items:center;gap:5px;border:0;background:transparent;color:var(--purple);font-size:9px}.task-drafts{display:grid;gap:7px;margin-top:7px}.task-draft{display:grid;grid-template-columns:minmax(0,1fr) 120px 30px;gap:7px}.task-draft button{display:grid;place-items:center;border:1px solid #fb718555;border-radius:8px;background:#fb718512;color:#fb7185}.task-input small{display:block;color:var(--muted);font-size:8px;margin-top:5px}.note-heading{display:flex;align-items:center;justify-content:space-between;margin-top:14px}.note-heading>label{font-size:10px;color:var(--muted);font-weight:600}.important-toggle{border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:8px;padding:6px 9px;display:flex;align-items:center;gap:6px;font-size:9px}.important-toggle.important{color:#dc2626;border-color:#fca5a5;background:#fff1f2}.note{margin-top:7px}.note textarea{min-height:56px}.add-order{width:100%;margin-top:12px;border:1px dashed var(--purple);background:var(--theme-soft);color:var(--purple);border-radius:11px;padding:11px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:10px;font-weight:650}.custom-options{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:12px;color:var(--muted);font-size:8px}.custom-options button{display:flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--text);padding:5px 8px;font-size:8px}.error{color:#e11d48;background:#fff1f2;border:1px solid #fecdd3;border-radius:10px;padding:8px 10px;font-size:10px;margin:12px 0 0}@media(max-width:600px){.order-draft{padding:13px}.task-draft{grid-template-columns:minmax(0,1fr) 86px 30px}}
</style>
