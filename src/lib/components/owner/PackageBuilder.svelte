<!-- Niche library plus a 5-step package builder with live preview. Posts the same fields to ?/package. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick, untrack } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, ArrowRight, Check, Copy, Pencil, Plus, RefreshCw, X } from '@lucide/svelte';
	import RequiredMark from '$lib/components/RequiredMark.svelte';
	import NichePreview from './NichePreview.svelte';
	import Stepper from './Stepper.svelte';
	import { clearOnEdit, validateStep } from './stepForm';
	import { fieldSuggestions, keyFromLabel, nicheIcon, slugFromName, type FieldSuggestion } from './nicheIcons';

	let { packages, capabilityDefinitions, builtInIds, usage, submit, busy = false }: {
		packages: any[];
		capabilityDefinitions: { key: string; label: string; description: string }[];
		builtInIds: string[];
		usage: Record<string, number>;
		submit: SubmitFunction;
		busy?: boolean;
	} = $props();

	const terminologyFields = [
		{ key: 'customer', title: 'People you serve', example: 'Client, Patient, Student' },
		{ key: 'order', title: 'Main work item', example: 'Job card, Appointment, Booking' },
		{ key: 'staff', title: 'People doing the work', example: 'Technician, Doctor, Stylist' },
		{ key: 'task', title: 'Steps inside the work', example: 'Work item, Service, Test' },
		{ key: 'category', title: 'Type of work', example: 'Service type, Treatment' },
		{ key: 'project', title: 'Title of each job', example: 'Vehicle, Visit, Device' },
		{ key: 'dueDate', title: 'Due date', example: 'Promised date, Appointment date' },
		{ key: 'delivery', title: 'Handover at the end', example: 'Pickup, Checkout, Discharge' },
		{ key: 'assignedAsset', title: 'Equipment or room', example: 'Bay, Chair, Room' }
	] as const;
	const statusKeys = ['Received', 'Assigned', 'Editing', 'Waiting Review', 'Revision', 'Ready Delivery', 'Delivered', 'Completed', 'Stopped'];
	const steps = ['Start from', 'Words', 'Fields', 'Statuses', 'Features'];

	type DraftField = { id: number; entity: string; label: string; key: string; keyEdited: boolean; type: string; options: string; required: boolean; customerPortal: boolean; staffPortal: boolean; whatsapp: boolean; sheets: boolean; export: boolean };
	let nextId = 1;

	let open = $state(false);
	let editing = $state(false);
	let step = $state(0);
	let reached = $state(0);
	let baseId = $state('general-service');
	let name = $state('');
	let packageId = $state('');
	let idEdited = $state(false);
	let description = $state('');
	let terms = $state<Record<string, { singular: string; plural: string }>>({});
	let categories = $state('');
	let statuses = $state<Record<string, string>>({});
	let allowed = $state<Record<string, boolean>>({});
	let portal = $state({ customer: 'full', staff: 'full', progress: 'both', delivery: 'completion' });
	let fields = $state<DraftField[]>([]);
	let sections: HTMLElement[] = $state([]);

	const base = $derived(packages.find((item) => item.id === baseId) || packages[0]);
	const baseFields = $derived((base?.profile?.customFields || []) as any[]);
	const suggestions = $derived(fieldSuggestions(baseId).filter((item) => !baseFields.some((existing) => existing.label.toLowerCase() === item.label.toLowerCase()) && !fields.some((existing) => existing.label.toLowerCase() === item.label.toLowerCase())));
	const previewFields = $derived([...baseFields, ...fields]);
	const includedLabels = $derived(capabilityDefinitions.filter((definition) => allowed[definition.key]).map((definition) => definition.label));
	const isBuiltIn = (id: string) => builtInIds.includes(id);

	// Copy everything from a package into the editable draft.
	const loadFrom = (item: any) => {
		baseId = item.id;
		terms = structuredClone(item.profile?.terminology || {});
		categories = (item.profile?.optionLists?.categories || []).join(', ');
		statuses = Object.fromEntries(statusKeys.filter((key) => item.profile?.statuses?.[key]).map((key) => [key, item.profile.statuses[key].label]));
		allowed = Object.fromEntries(capabilityDefinitions.map((definition) => [definition.key, item.allowed?.[definition.key] !== false]));
		const modules = item.moduleConfiguration || {};
		portal = { customer: modules['portal.customer']?.mode || 'full', staff: modules['work.staffPortal']?.mode || 'full', progress: modules['portal.customer']?.progressMode || 'both', delivery: modules['portal.customer']?.deliveryExperience || 'completion' };
		fields = [];
	};
	const start = async (item: any, mode: 'new' | 'edit') => {
		loadFrom(item);
		editing = mode === 'edit';
		name = editing ? item.name : '';
		packageId = editing ? item.id : '';
		idEdited = editing;
		description = editing ? item.description || '' : '';
		step = editing ? 1 : 0;
		reached = editing ? steps.length - 1 : 0;
		open = true;
		await tick();
		sections[step]?.querySelector<HTMLElement>('h3')?.focus();
	};
	const changeBase = (id: string) => { const item = packages.find((entry) => entry.id === id); if (item) loadFrom(item); };
	$effect(() => { const value = name; if (!idEdited) untrack(() => (packageId = slugFromName(value))); });

	const addField = (suggestion?: FieldSuggestion) => {
		const label = suggestion?.label || '';
		fields = [...fields, { id: nextId++, entity: suggestion?.entity || 'order', label, key: keyFromLabel(label), keyEdited: false, type: suggestion?.type || 'text', options: suggestion?.options || '', required: false, customerPortal: false, staffPortal: false, whatsapp: false, sheets: true, export: true }];
	};
	const removeField = (id: number) => (fields = fields.filter((item) => item.id !== id));

	const stepValid = (index: number, report = true) => {
		const section = sections[index];
		if (!section) return true;
		const idInput = section.querySelector<HTMLInputElement>('input[name="packageId"]');
		idInput?.setCustomValidity(!editing && packages.some((item) => item.id === packageId) ? 'This ID is already used. Choose another.' : '');
		return validateStep(section, report);
	};
	const next = async () => { if (stepValid(step)) { step = Math.min(step + 1, steps.length - 1); reached = Math.max(reached, step); await tick(); sections[step]?.querySelector<HTMLElement>('h3')?.focus(); } };
	const goTo = (index: number) => { for (let i = 0; i < index; i++) if (!stepValid(i, false)) { step = i; tick().then(() => stepValid(i)); return; } step = index; };
	const guarded: SubmitFunction = async (input) => {
		for (let i = 0; i < steps.length; i++) if (!stepValid(i, false)) { input.cancel(); step = i; await tick(); stepValid(i); return; }
		const inner = await submit(input);
		return async (result) => {
			await inner?.(result);
			if (result.result.type === 'success') open = false;
		};
	};
</script>

{#if !open}
	<section class="library">
		<header><div><h2>Business types</h2><p>Each workspace starts from one of these. Duplicate the closest one to make a new type. Live workspaces never change by themselves.</p></div><button type="button" class="primary" onclick={() => start(packages.find((item) => item.id === 'general-service') || packages[0], 'new')}><Plus size={15} />New business type</button></header>
		<div class="cards">
			{#each packages as item (item.id)}
				{@const Icon = nicheIcon(item.id)}
				<article>
					<div class="top"><span class="icon"><Icon size={18} /></span><div><b>{item.name}</b><small>v{item.version} · {isBuiltIn(item.id) ? 'Built in' : 'Custom'} · {usage[item.id] || 0} workspace{(usage[item.id] || 0) === 1 ? '' : 's'}</small></div></div>
					<p>{item.description}</p>
					<p class="words">{['order', 'staff', 'customer'].map((key) => item.profile?.terminology?.[key]?.plural).filter(Boolean).join(' · ')}</p>
					<div class="actions">
						<button type="button" class="ghost" onclick={() => start(item, 'new')}><Copy size={14} />Duplicate &amp; edit</button>
						{#if !isBuiltIn(item.id)}<button type="button" class="ghost" onclick={() => start(item, 'edit')}><Pencil size={14} />Edit</button>{/if}
					</div>
				</article>
			{/each}
		</div>
	</section>
{:else}
	<form method="POST" action="?/package" novalidate use:enhance={guarded} use:clearOnEdit class="builder step-form">
		<header class="bar"><h2>{editing ? `Edit ${name}` : 'New business type'}</h2><button type="button" class="ghost" onclick={() => (open = false)}><X size={15} />Close</button></header>
		<Stepper {steps} current={step} {reached} label="Builder steps" onselect={goTo} />
		<input type="hidden" name="basePackageId" value={baseId} />
		<input type="hidden" name="customFieldCount" value={fields.length} />

		<div class="layout">
			<div class="steps">
				<section bind:this={sections[0]} hidden={step !== 0}>
					<h3 tabindex="-1">Start from the closest type</h3>
					<div class="fields">
						<label class="wide">Copy settings from<small>Words, fields, statuses, and features are copied. You change them in the next steps.</small><select value={baseId} onchange={(event) => changeBase(event.currentTarget.value)} disabled={editing}>{#each packages as item}<option value={item.id}>{item.name}</option>{/each}</select></label>
						<label>Name <RequiredMark /><small>Shown when choosing a business type.</small><input name="packageName" bind:value={name} placeholder="Example: Car Garage" required /></label>
						<label>ID <RequiredMark /><small>{editing ? 'Fixed for an existing type.' : 'Made from the name. Lowercase and hyphens.'}</small><input name="packageId" bind:value={packageId} oninput={() => (idEdited = true)} readonly={editing} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" data-error="Use lowercase letters, numbers, and single hyphens only." required /></label>
						<label class="wide">Short description<input name="packageDescription" bind:value={description} placeholder="Example: Job cards, technicians, billing and pickup" /></label>
					</div>
				</section>

				<section bind:this={sections[1]} hidden={step !== 1}>
					<h3 tabindex="-1">Words people will see</h3>
					<p class="hint">Watch the preview change as you type.</p>
					<div class="terms">
						<div class="terms-head" aria-hidden="true"><span></span><span>One</span><span>Many</span></div>
						{#each terminologyFields as item}
							{#if terms[item.key]}
								<div class="term">
									<span><b>{item.title}</b><small>e.g. {item.example}</small></span>
									<input name={`term:${item.key}:singular`} bind:value={terms[item.key].singular} aria-label={`${item.title}, one`} />
									<input name={`term:${item.key}:plural`} bind:value={terms[item.key].plural} aria-label={`${item.title}, many`} />
								</div>
							{/if}
						{/each}
					</div>
					<label class="block">Types of work<small>Separate with commas, e.g. General service, Repair, Inspection.</small><input name="categoryOptions" bind:value={categories} /></label>
				</section>

				<section bind:this={sections[2]} hidden={step !== 2}>
					<h3 tabindex="-1">Extra information to collect</h3>
					{#if baseFields.length}<p class="hint">Already included: {baseFields.map((item) => item.label).join(', ')}.</p>{/if}
					{#if suggestions.length}
						<div class="suggest"><span>Suggestions:</span>{#each suggestions as suggestion}<button type="button" class="chip" onclick={() => addField(suggestion)}><Plus size={13} />{suggestion.label}</button>{/each}</div>
					{/if}
					{#each fields as item, index (item.id)}
						<div class="field-card">
							<div class="fields">
								<label>Label <RequiredMark /><input name={`custom:${index}:label`} bind:value={item.label} oninput={() => { if (!item.keyEdited) item.key = keyFromLabel(item.label); }} placeholder="e.g. Vehicle colour" required /></label>
								<label>Answer type<select name={`custom:${index}:type`} bind:value={item.type}><option value="text">Short text</option><option value="textarea">Long text</option><option value="number">Number</option><option value="date">Date</option><option value="datetime">Date and time</option><option value="select">Pick from a list</option><option value="checkbox">Yes / No</option><option value="url">Web link</option></select></label>
								<label>Belongs to<select name={`custom:${index}:entity`} bind:value={item.entity}><option value="order">{terms.order?.singular || 'Order'}</option><option value="customer">{terms.customer?.singular || 'Customer'}</option><option value="task">{terms.task?.singular || 'Task'}</option><option value="staff">{terms.staff?.singular || 'Staff'}</option></select></label>
								{#if item.type === 'select'}<label>Choices <RequiredMark /><small>Separate with commas.</small><input name={`custom:${index}:options`} bind:value={item.options} required /></label>{/if}
							</div>
							<details><summary>More options</summary>
								<label class="inline">Field key<input name={`custom:${index}:key`} bind:value={item.key} oninput={() => (item.keyEdited = true)} pattern="[a-z][a-z0-9_]{'{1,48}'}" data-error="Start with a letter; use lowercase letters, numbers, and _ only." required /></label>
								<div class="checks">
									<label><input type="checkbox" name={`custom:${index}:required`} bind:checked={item.required} />Must be filled</label>
									<label><input type="checkbox" name={`custom:${index}:customerPortal`} bind:checked={item.customerPortal} />Show on customer page</label>
									<label><input type="checkbox" name={`custom:${index}:staffPortal`} bind:checked={item.staffPortal} />Show on staff page</label>
									<label><input type="checkbox" name={`custom:${index}:whatsapp`} bind:checked={item.whatsapp} />Use in WhatsApp</label>
									<label><input type="checkbox" name={`custom:${index}:sheets`} bind:checked={item.sheets} />Google Sheets</label>
									<label><input type="checkbox" name={`custom:${index}:export`} bind:checked={item.export} />Excel export</label>
								</div>
							</details>
							<button type="button" class="remove" onclick={() => removeField(item.id)}><X size={14} />Remove</button>
						</div>
					{/each}
					<button type="button" class="ghost add" onclick={() => addField()}><Plus size={15} />Add your own field</button>
				</section>

				<section bind:this={sections[3]} hidden={step !== 3}>
					<h3 tabindex="-1">Status names and pages</h3>
					<p class="hint">Rename the steps a job goes through. The order and meaning stay the same.</p>
					<div class="fields">
						{#each Object.keys(statuses) as key}
							<label>{key}<input name={`status:${key}:label`} bind:value={statuses[key]} maxlength="40" required /></label>
						{/each}
					</div>
					<div class="fields">
						<label>Customer page shows<select name="customerPortalMode" bind:value={portal.customer}><option value="status-only">Status only</option><option value="status-billing">Status and bills</option><option value="full">Everything</option></select></label>
						<label>Staff page shows<select name="staffPortalMode" bind:value={portal.staff}><option value="assignments-only">Their work only</option><option value="progress-updates">Work and progress updates</option><option value="full">Everything</option></select></label>
						<label>Show progress as<select name="progressMode" bind:value={portal.progress}><option value="milestones">Steps</option><option value="percentage">Percentage</option><option value="both">Steps and percentage</option></select></label>
						<label>How work is handed over<select name="deliveryExperience" bind:value={portal.delivery}><option value="digital">Digital delivery</option><option value="pickup">Pickup / collection</option><option value="appointment">Appointment completion</option><option value="fulfilment">Order fulfilment</option><option value="handover">Project handover</option><option value="completion">General completion</option></select></label>
					</div>
				</section>

				<section bind:this={sections[4]} hidden={step !== 4}>
					<h3 tabindex="-1">Features included</h3>
					<p class="hint">Workspaces of this type can use these. Each workspace can still turn them off.</p>
					<div class="caps">
						{#each capabilityDefinitions as definition}
							<label><input type="checkbox" name={`package-capability:${definition.key}`} bind:checked={allowed[definition.key]} /><span><b>{definition.label}</b><small>{definition.description}</small></span></label>
						{/each}
					</div>
				</section>

				<div class="nav">
					{#if step > 0}<button type="button" class="ghost" onclick={() => (step -= 1)}><ArrowLeft size={15} />Back</button>{:else}<span></span>{/if}
					{#if step < steps.length - 1}
						<button type="button" class="primary" onclick={next}>Next<ArrowRight size={15} /></button>
					{:else}
						<button class="primary" disabled={busy} aria-busy={busy}>{#if busy}<RefreshCw class="spin" size={15} />Saving…{:else}<Check size={15} />{editing ? 'Save new version' : 'Create business type'}{/if}</button>
					{/if}
				</div>
			</div>
			<aside class="side"><NichePreview name={name || base?.name} {terms} {statuses} fields={previewFields} features={includedLabels} /></aside>
		</div>
	</form>
{/if}

<style>
	.library, .builder { display: grid; gap: 16px; container-type: inline-size; }
	.library header, .bar { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
	h2 { margin: 0; font-size: 20px; }
	.library header p { margin: 4px 0 0; max-width: 60ch; color: var(--muted); font-size: 14px; line-height: 1.5; }
	.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
	article { display: grid; gap: 8px; align-content: start; padding: 14px; border: 1px solid var(--line); border-radius: 14px; background: var(--card); }
	.top { display: flex; gap: 10px; align-items: center; }
	.icon { display: grid; place-items: center; flex: none; width: 36px; height: 36px; border-radius: 10px; background: var(--theme-soft); color: var(--purple); }
	.top b { display: block; font-size: 15px; }
	.top small { font-size: 12.5px; color: var(--muted); }
	article p { margin: 0; font-size: 13.5px; color: var(--muted); line-height: 1.45; }
	article p.words { color: var(--theme-text); font-size: 13px; }
	.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
	.layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, 340px); gap: 24px; align-items: start; }
	.side { position: sticky; top: 16px; }
	.steps, section { display: grid; gap: 14px; min-width: 0; }
	section[hidden] { display: none; }
	h3 { margin: 0; font-size: 18px; outline: none; }
	.hint { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }
	.fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
	.fields label, .block, .inline { display: block; font-size: 14px; font-weight: 600; }
	.fields label > :is(small, input, select), .block > :is(small, input), .inline > input { display: block; margin-top: 4px; }
	.fields label.wide { grid-column: 1 / -1; }
	small { font-weight: 400; font-size: 12.5px; color: var(--muted); line-height: 1.4; }
	input:not([type="checkbox"]):not([type="radio"]):not([type="search"]), select { width: 100%; box-sizing: border-box; min-height: 42px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--theme-text); font: inherit; font-size: 15px; font-weight: 400; }
	input:focus-visible, select:focus-visible { outline: none; border-color: var(--purple); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple) 18%, transparent); }
	input[readonly] { background: var(--theme-soft); }
	.terms { display: grid; gap: 8px; }
	.terms-head, .term { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr); gap: 8px; align-items: center; }
	.terms-head span { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
	.term b { display: block; font-size: 14px; }
	.suggest { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 13.5px; color: var(--muted); }
	.chip { display: inline-flex; align-items: center; gap: 4px; min-height: 32px; padding: 0 10px; border: 1px dashed var(--line); border-radius: 999px; background: var(--card); color: var(--theme-text); font-size: 13px; cursor: pointer; }
	.field-card { position: relative; display: grid; gap: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); }
	details summary { cursor: pointer; font-size: 13.5px; color: var(--muted); }
	details[open] { display: grid; gap: 10px; }
	.checks { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 13.5px; }
	.checks label { display: flex; gap: 6px; align-items: center; }
	.remove { justify-self: start; display: inline-flex; align-items: center; gap: 4px; border: 0; background: none; color: #b91c1c; font-size: 13px; cursor: pointer; padding: 4px 0; }
	.caps { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
	.caps label { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; font-size: 14px; }
	.caps b { display: block; }
	.nav { display: flex; justify-content: space-between; gap: 10px; padding-top: 6px; border-top: 1px solid var(--line); }
	.primary, .ghost { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 40px; padding: 0 14px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; }
	.primary { border: 0; background: var(--purple); color: var(--accent-text, #fff); }
	.primary:disabled { opacity: .7; cursor: progress; }
	.ghost { border: 1px solid var(--line); background: var(--card); color: var(--theme-text); }
	.add { justify-self: start; }
	.primary :global(.spin) { animation: spin 1s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	@media (prefers-reduced-motion: reduce) { .primary :global(.spin) { animation: none; } }
	@container (max-width: 760px) { .layout { grid-template-columns: 1fr; } .side { position: static; } }
	@container (max-width: 520px) { .fields { grid-template-columns: 1fr; } .terms-head { display: none; } .term { grid-template-columns: 1fr 1fr; } .term > span { grid-column: 1 / -1; } }
</style>
