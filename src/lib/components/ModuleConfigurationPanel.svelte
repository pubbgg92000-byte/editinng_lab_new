<script lang="ts">
	import { Check, Copy, MessageSquareText, Pencil, Plus, RefreshCw, Smartphone, Trash2, UserRoundCog, UsersRound } from '@lucide/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import RequiredMark from '$lib/components/RequiredMark.svelte';
	import type { CustomerPortalMode, MessageContext, MessageScenario, PortalProgressMode, StaffPortalMode, TenantConfiguration, WhatsAppTemplate } from '$lib/types';
	import { availableTemplatePlaceholders, messageContextLabels, messageScenarioLabels, placeholdersInTemplate } from '$lib/moduleConfiguration';
	import { fillTemplate } from '$lib/messageTemplates';

	let {
		configuration,
		whatsappOnly = false,
		onmessage = () => {}
	}: {
		configuration: TenantConfiguration;
		whatsappOnly?: boolean;
		onmessage?: (message: string) => void;
	} = $props();

	let editorOpen = $state(false);
	let editing = $state<WhatsAppTemplate | null>(null);
	let deleteOpen = $state(false);
	let deleting = $state<WhatsAppTemplate | null>(null);
	let templateError = $state('');
	let textarea: HTMLTextAreaElement | undefined = $state();
	const customerPortal = $derived(configuration.moduleConfiguration['portal.customer']);
	const staffPortal = $derived(configuration.moduleConfiguration['work.staffPortal']);
	const whatsapp = $derived(configuration.moduleConfiguration['communications.whatsapp']);
	const templates = $derived(Object.values(whatsapp.templates).sort((left, right) => left.audience.localeCompare(right.audience) || left.name.localeCompare(right.name)));
	const availablePlaceholders = $derived(editing ? availableTemplatePlaceholders(editing.context, configuration.profile) : []);
	const unavailablePlaceholders = $derived(editing ? [...new Set(placeholdersInTemplate(editing.body).filter((key) => !availablePlaceholders.includes(key)))] : []);
	const previewValues = $derived(Object.fromEntries(availablePlaceholders.map((key) => [key, ({
		studio_name: 'Your Business',
		customer: 'Aarav & Co.',
		customer_name: 'Aarav',
		editor_name: 'Team Member',
		project: 'Service reference',
		event: 'Service type',
		delivery_date: '31 July 2026',
		status: 'In progress',
		progress: '60',
		total: '₹12,000',
		paid: '₹5,000',
		balance: '₹7,000',
		invoice_number: 'INV-0108',
		payment_amount: '₹5,000',
		task_list: '1. First work item\n2. Second work item',
		portal_link: 'https://example.com/private-link',
		studio_address: 'Business address',
		studio_phone_line: '\nPhone: +91 98765 43210',
		gstin_line: '',
		payment_note: 'Payment by UPI or bank transfer',
		invoice_footer_line: '\nThank you for your business.'
	} as Record<string, string>)[key] || `Sample ${key.replaceAll('_', ' ')}`])));
	const preview = $derived(editing ? fillTemplate(editing.body, previewValues) : '');

	const customerModes: Array<{ value: CustomerPortalMode; label: string; help: string }> = [
		{ value: 'status-only', label: 'Status only', help: 'Progress and current status without billing.' },
		{ value: 'status-billing', label: 'Status + billing', help: 'Adds balances, payments, invoices, and receipts.' },
		{ value: 'full', label: 'Full portal', help: 'Includes tasks, delivery, billing, and documents.' }
	];
	const staffModes: Array<{ value: StaffPortalMode; label: string; help: string }> = [
		{ value: 'assignments-only', label: 'Assignments only', help: 'Workers can read assigned work without submitting updates.' },
		{ value: 'progress-updates', label: 'Progress updates', help: 'Workers can update status, progress, and notes.' },
		{ value: 'full', label: 'Full portal', help: 'Adds duration and completion-link inputs.' }
	];
	const progressModes: Array<{ value: PortalProgressMode; label: string }> = [
		{ value: 'milestones', label: 'Milestones' },
		{ value: 'percentage', label: 'Percentage' },
		{ value: 'both', label: 'Both' }
	];

	function newTemplate() {
		const id = `custom-${crypto.randomUUID().slice(0, 12)}`;
		editing = {
			id,
			name: '',
			audience: 'customer',
			scenario: 'status-update',
			context: 'order',
			enabled: true,
			body: 'Hello {{customer_name}},\n\n',
			source: 'custom'
		};
		templateError = '';
		editorOpen = true;
	}

	function editTemplate(item: WhatsAppTemplate) {
		editing = { ...item };
		templateError = '';
		editorOpen = true;
	}

	async function copyTemplateMessage(item: WhatsAppTemplate) {
		try {
			await navigator.clipboard.writeText(item.body);
			onmessage(`“${item.name}” copied to the clipboard.`);
		} catch {
			onmessage('Unable to copy the message. Open Edit and copy the text manually.');
		}
	}

	function resetTemplate(item: WhatsAppTemplate) {
		const packaged = configuration.packageModuleConfiguration['communications.whatsapp'].templates[item.id];
		if (!packaged) return;
		whatsapp.deletedTemplateIds = (whatsapp.deletedTemplateIds || []).filter((id) => id !== item.id);
		configuration.moduleConfiguration['communications.whatsapp'].templates[item.id] = { ...packaged };
		onmessage(`Package template restored. ${whatsappOnly ? 'Save WhatsApp templates' : 'Save business setup'} to apply it.`);
	}

	function requestDeleteTemplate(item: WhatsAppTemplate) {
		deleting = item;
		deleteOpen = true;
	}

	function deleteTemplate() {
		if (!deleting) return;
		const item = deleting;
		delete configuration.moduleConfiguration['communications.whatsapp'].templates[item.id];
		for (const [scenario, id] of Object.entries(whatsapp.defaultTemplateIds)) {
			if (id === item.id) delete whatsapp.defaultTemplateIds[scenario as MessageScenario];
		}
		if (configuration.packageModuleConfiguration['communications.whatsapp'].templates[item.id]) {
			whatsapp.deletedTemplateIds = [...new Set([...(whatsapp.deletedTemplateIds || []), item.id])];
		}
		deleteOpen = false;
		deleting = null;
		onmessage(`Template removed. ${whatsappOnly ? 'Save WhatsApp templates' : 'Save business setup'} to apply it.`);
	}

	function saveTemplate() {
		if (!editing) return;
		if (!editing.name.trim()) {
			templateError = 'Enter a template name.';
			return;
		}
		if (Object.values(whatsapp.templates).some((item) => item.id !== editing?.id && item.name.trim().toLocaleLowerCase() === editing?.name.trim().toLocaleLowerCase())) {
			templateError = 'Use a unique template name.';
			return;
		}
		if (!editing.body.trim()) {
			templateError = 'Enter the message body.';
			return;
		}
		if (unavailablePlaceholders.length) {
			templateError = `Remove unavailable placeholders: ${unavailablePlaceholders.join(', ')}`;
			return;
		}
		editing.name = editing.name.trim();
		const previous = whatsapp.templates[editing.id];
		if (previous?.scenario !== editing.scenario && whatsapp.defaultTemplateIds[previous.scenario] === editing.id) {
			delete whatsapp.defaultTemplateIds[previous.scenario];
		}
		configuration.moduleConfiguration['communications.whatsapp'].templates[editing.id] = { ...editing };
		if (!whatsapp.defaultTemplateIds[editing.scenario]) whatsapp.defaultTemplateIds[editing.scenario] = editing.id;
		editorOpen = false;
		onmessage(`Template updated. ${whatsappOnly ? 'Save WhatsApp templates' : 'Save business setup'} to apply it.`);
	}

	function insertPlaceholder(key: string) {
		if (!editing) return;
		const token = `{{${key}}}`;
		const start = textarea?.selectionStart ?? editing.body.length;
		const end = textarea?.selectionEnd ?? editing.body.length;
		editing.body = `${editing.body.slice(0, start)}${token}${editing.body.slice(end)}`;
		requestAnimationFrame(() => {
			textarea?.focus();
			textarea?.setSelectionRange(start + token.length, start + token.length);
		});
	}

	function updateTemplateContext(context: MessageContext) {
		if (!editing) return;
		editing.context = context;
	}

	function updateTemplateScenario(scenario: MessageScenario) {
		if (!editing) return;
		editing.scenario = scenario;
		const expected: Record<MessageScenario, MessageContext> = {
			'work-assignment': 'assignment',
			'order-received': 'order',
			'appointment-reminder': 'order',
			'status-update': 'order',
			'clarification-request': 'order',
			ready: 'order',
			invoice: 'invoice',
			'partial-invoice': 'invoice',
			'payment-received': 'payment',
			'completion-follow-up': 'order'
		};
		updateTemplateContext(expected[scenario]);
		editing.audience = scenario === 'work-assignment' ? 'staff' : 'customer';
	}
</script>

{#if !whatsappOnly}<section class="module-grid">
	<article class="module-card">
		<header><span><UsersRound size={17}/></span><div><h2>Customer portal</h2><p>Choose what customers can see from their private link.</p></div></header>
		<fieldset>
			<legend>Portal mode</legend>
			<div class="choice-grid">
				{#each customerModes as option}<label class:active={customerPortal.mode === option.value}><input type="radio" bind:group={customerPortal.mode} value={option.value}/><span><b>{option.label}</b><small>{option.help}</small></span></label>{/each}
			</div>
		</fieldset>
		<fieldset>
			<legend>Progress presentation</legend>
			<div class="segmented">{#each progressModes as option}<label class:active={customerPortal.progressMode === option.value}><input type="radio" bind:group={customerPortal.progressMode} value={option.value}/>{option.label}</label>{/each}</div>
		</fieldset>
		<div class="switches">
			{#each Object.entries(customerPortal.sections) as [key, enabled]}
				<label><input type="checkbox" checked={enabled} onchange={(event) => customerPortal.sections[key as keyof typeof customerPortal.sections] = event.currentTarget.checked}/><span>{key.replace(/([A-Z])/g, ' $1')}</span></label>
			{/each}
		</div>
		<div class="milestone-editor">
			<strong>Milestone labels</strong>
			<div>{#each customerPortal.milestones as milestone}<label><span>{milestone.id.replaceAll('-', ' ')} <RequiredMark/></span><input bind:value={milestone.label} required aria-required="true"/></label>{/each}</div>
		</div>
	</article>

	<article class="module-card">
		<header><span><UserRoundCog size={17}/></span><div><h2>Worker portal</h2><p>Control what assigned workers can read and update.</p></div></header>
		<fieldset>
			<legend>Portal mode</legend>
			<div class="choice-grid">
				{#each staffModes as option}<label class:active={staffPortal.mode === option.value}><input type="radio" bind:group={staffPortal.mode} value={option.value}/><span><b>{option.label}</b><small>{option.help}</small></span></label>{/each}
			</div>
		</fieldset>
		<fieldset>
			<legend>Progress presentation</legend>
			<div class="segmented">{#each progressModes as option}<label class:active={staffPortal.progressMode === option.value}><input type="radio" bind:group={staffPortal.progressMode} value={option.value}/>{option.label}</label>{/each}</div>
		</fieldset>
		<div class="switches">
			<label><input type="checkbox" bind:checked={staffPortal.allowStatusUpdate}/><span>Allow status updates</span></label>
			<label><input type="checkbox" bind:checked={staffPortal.allowProgressUpdate}/><span>Allow percentage updates</span></label>
			{#each Object.entries(staffPortal.sections) as [key, enabled]}
				<label><input type="checkbox" checked={enabled} onchange={(event) => staffPortal.sections[key as keyof typeof staffPortal.sections] = event.currentTarget.checked}/><span>{key.replace(/([A-Z])/g, ' $1')}</span></label>
			{/each}
		</div>
		<div class="milestone-editor">
			<strong>Milestone labels</strong>
			<div>{#each staffPortal.milestones as milestone}<label><span>{milestone.id.replaceAll('-', ' ')} <RequiredMark/></span><input bind:value={milestone.label} required aria-required="true"/></label>{/each}</div>
		</div>
	</article>
</section>{/if}

<section class="message-card">
	<header><span><MessageSquareText size={18}/></span><div><h2>WhatsApp templates</h2><p>Messages open in WhatsApp for review. NexaDesk never sends them automatically.</p></div><button type="button" class="primary" onclick={newTemplate}><Plus size={14}/> New template</button></header>
	<div class="template-list">
		{#each templates as item}
			<article class:disabled={!item.enabled}>
				<div class="template-icon"><Smartphone size={16}/></div>
				<div class="template-copy"><span>{item.audience} · {messageScenarioLabels[item.scenario]}</span><strong>{item.name}</strong><small>{item.body}</small></div>
				<div class="template-controls">
					<label class="enable"><input type="checkbox" bind:checked={item.enabled}/><span>{item.enabled ? 'Enabled' : 'Hidden'}</span></label>
					<label class="default"><input type="radio" name={`default-${item.scenario}`} checked={whatsapp.defaultTemplateIds[item.scenario] === item.id} onchange={() => whatsapp.defaultTemplateIds[item.scenario] = item.id}/><span>Default</span></label>
					<div class="template-actions">
						<button type="button" onclick={() => editTemplate(item)} aria-label={`Edit ${item.name}`} title="Edit template"><Pencil size={14}/></button>
						<button type="button" onclick={() => copyTemplateMessage(item)} aria-label={`Copy the message text from ${item.name}`} title="Copy message text"><Copy size={14}/></button>
						{#if configuration.packageModuleConfiguration['communications.whatsapp'].templates[item.id]}<button type="button" onclick={() => resetTemplate(item)} aria-label={`Restore ${item.name} to its original niche-package message`} title="Restore original message"><RefreshCw size={14}/></button>{/if}
						<button type="button" class="remove" onclick={() => requestDeleteTemplate(item)} aria-label={`Delete ${item.name}`} title="Delete template"><Trash2 size={14}/></button>
					</div>
				</div>
			</article>
		{/each}
	</div>
</section>

<Modal title={editing?.source === 'custom' && !whatsapp.templates[editing?.id || ''] ? 'Create WhatsApp template' : 'Edit WhatsApp template'} bind:open={editorOpen} wide>
	{#if editing}<div class="template-editor">
		<div class="editor-fields">
			<label>Template name <RequiredMark/><input bind:value={editing.name} maxlength="80" required aria-required="true" placeholder="Example: Appointment reminder"/></label>
			<label>Message purpose <RequiredMark/><select value={editing.scenario} onchange={(event) => updateTemplateScenario(event.currentTarget.value as MessageScenario)} required aria-required="true">{#each Object.entries(messageScenarioLabels) as [value, label]}<option {value}>{label}</option>{/each}</select></label>
			<label>Audience<select bind:value={editing.audience} disabled aria-label="Audience is selected from message purpose"><option value="customer">Customer</option><option value="staff">Worker / staff</option></select></label>
			<label>Available from<select value={editing.context} disabled aria-label="Available context is selected from message purpose">{#each Object.entries(messageContextLabels) as [value, label]}<option {value}>{label}</option>{/each}</select></label>
		</div>
		<div class="editor-layout">
			<div class="message-editor">
				<label for="message-body">Message <RequiredMark/></label>
				<div class="placeholder-list" aria-label="Insert a message field">{#each availablePlaceholders as key}<button type="button" onclick={() => insertPlaceholder(key)}>+ {key.replaceAll('_', ' ')}</button>{/each}</div>
				<textarea id="message-body" bind:this={textarea} bind:value={editing.body} maxlength="4000" required aria-required="true"></textarea>
				<div class="editor-meta"><span>{editing.body.length} / 4,000 characters</span><span>Fields use double braces, for example &#123;&#123;customer_name&#125;&#125;.</span></div>
				{#if unavailablePlaceholders.length}<p class="template-error">Unavailable fields: {unavailablePlaceholders.join(', ')}</p>{/if}
				{#if templateError}<p class="template-error">{templateError}</p>{/if}
			</div>
			<div class="message-preview"><span>Live WhatsApp preview</span><pre>{preview}</pre><small><Check size={12}/> Opens for review before sending</small></div>
		</div>
	</div>{/if}
	{#snippet footer()}<button type="button" class="secondary" onclick={() => (editorOpen = false)}>Cancel</button><button type="button" class="primary" onclick={saveTemplate}>Save template</button>{/snippet}
</Modal>

<Modal title="Delete WhatsApp template" bind:open={deleteOpen}>
	{#if deleting}<div class="delete-confirmation">
		<strong>Delete “{deleting.name}”?</strong>
		<p>This removes the template from this business after you save. Existing messages are not affected.</p>
		{#if deleting.source !== 'custom'}<small>A platform administrator can restore the original niche package later if it is needed again.</small>{/if}
	</div>{/if}
	{#snippet footer()}<button type="button" class="secondary" onclick={() => (deleteOpen = false)}>Cancel</button><button type="button" class="danger-button" onclick={deleteTemplate}><Trash2 size={14}/> Delete template</button>{/snippet}
</Modal>

<style>
	.module-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:18px 0}.module-card,.message-card{padding:22px;border:1px solid var(--line);border-radius:14px;background:var(--card);box-shadow:var(--shadow)}header{display:flex;align-items:flex-start;gap:11px}header>span,.module-card header>span{width:34px;height:34px;border-radius:10px;background:var(--theme-soft);color:var(--purple);display:grid;place-items:center;flex:0 0 auto}header h2{margin:1px 0 4px;font-size:14px}header p{margin:0;color:var(--muted);font-size:9px;line-height:1.5}.message-card header>div{flex:1}.message-card header button{display:flex;align-items:center;gap:6px}
	fieldset{border:0;padding:0;margin:20px 0 0}legend,.milestone-editor>strong{margin-bottom:9px;font-size:9px;font-weight:700}.choice-grid{display:grid;gap:7px}.choice-grid label{display:flex;align-items:flex-start;gap:8px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--theme-soft)}.choice-grid label.active{border-color:color-mix(in srgb,var(--purple) 55%,var(--line));box-shadow:0 0 0 2px color-mix(in srgb,var(--purple) 8%,transparent)}.choice-grid input,.segmented input,.switches input,.enable input,.default input{width:auto}.choice-grid span{display:grid;gap:3px}.choice-grid b{font-size:9px}.choice-grid small{font-size:8px;color:var(--muted);line-height:1.4}.segmented{display:grid;grid-template-columns:repeat(3,1fr);padding:3px;border:1px solid var(--line);border-radius:10px;background:var(--theme-soft)}.segmented label{position:relative;padding:8px;text-align:center;border-radius:7px;color:var(--muted);font-size:8px}.segmented label.active{background:var(--card);color:var(--purple);box-shadow:var(--shadow)}.segmented input{position:absolute;opacity:0}.switches{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:17px}.switches label{display:flex;align-items:center;gap:7px;padding:8px;border:1px solid var(--line);border-radius:8px;font-size:8px;text-transform:capitalize}.milestone-editor{margin-top:18px;padding-top:17px;border-top:1px solid var(--line)}.milestone-editor>div{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.milestone-editor label{display:grid;gap:4px}.milestone-editor label span{font-size:7px;color:var(--muted);text-transform:capitalize}.milestone-editor input{height:34px}
	.message-card{min-width:0;margin:18px 0}.template-list{display:grid;min-width:0;gap:8px;margin-top:18px}.template-list article{display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:center;gap:10px;min-width:0;padding:11px;border:1px solid var(--line);border-radius:11px;background:var(--theme-soft)}.template-list article.disabled{opacity:.66}.template-icon{width:32px;height:32px;border-radius:9px;background:var(--card);color:var(--purple);display:grid;place-items:center}.template-icon :global(svg),.template-actions :global(svg){display:block}.template-copy{min-width:0;display:grid;gap:3px}.template-copy>span{color:var(--purple);font-size:7px;text-transform:capitalize}.template-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px}.template-copy small{max-width:520px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:7px}.template-controls{display:flex;align-items:center;justify-content:flex-end;gap:10px;min-width:0}.enable,.default{min-height:34px;display:flex;align-items:center;gap:5px;color:var(--muted);font-size:7px;white-space:nowrap;cursor:pointer}.enable input,.default input{flex:0 0 auto;margin:0}.template-actions{display:flex;align-items:center;justify-content:flex-end;gap:5px}.template-actions button{width:34px;min-width:34px;height:34px;box-sizing:border-box;display:inline-grid;place-items:center;padding:0;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--purple);line-height:0;cursor:pointer;transition:border-color .16s ease,background .16s ease,color .16s ease,transform .16s ease}.template-actions button:hover{border-color:color-mix(in srgb,var(--purple) 48%,var(--line));background:color-mix(in srgb,var(--purple) 8%,var(--card));transform:translateY(-1px)}.template-actions button:focus-visible{outline:3px solid color-mix(in srgb,var(--purple) 22%,transparent);outline-offset:2px}.template-actions .remove{width:auto;padding:0 10px;color:#dc5050;font-size:7px;line-height:1}.template-actions .remove:hover{border-color:color-mix(in srgb,#dc5050 48%,var(--line));background:color-mix(in srgb,#dc5050 8%,var(--card))}
	.template-editor{display:grid;gap:16px}.editor-fields{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:9px}.editor-fields label,.message-editor>label{display:grid;gap:6px;font-size:8px;font-weight:650}.editor-layout{display:grid;grid-template-columns:1.25fr .75fr;gap:14px}.message-editor{min-width:0}.placeholder-list{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px}.placeholder-list button{padding:5px 7px;border:1px solid var(--line);border-radius:99px;background:var(--theme-soft);color:var(--purple);font-size:7px}.message-editor textarea{min-height:300px;resize:vertical;line-height:1.6}.editor-meta{display:flex;justify-content:space-between;gap:10px;margin-top:6px;color:var(--muted);font-size:7px}.message-preview{min-width:0;padding:14px;border-radius:13px;background:#e9f5ec;color:#17251d}.message-preview>span{font-size:8px;font-weight:750}.message-preview pre{min-height:300px;margin:9px 0;padding:13px;border-radius:9px;background:#fff;box-shadow:0 2px 12px #0f2d1d17;white-space:pre-wrap;overflow-wrap:anywhere;font:9px/1.6 inherit}.message-preview small{display:flex;align-items:center;gap:5px;color:#2b754a;font-size:7px}.template-error{margin:7px 0 0;color:#dc5050;font-size:8px}.delete-confirmation{display:grid;gap:8px}.delete-confirmation strong{font-size:13px}.delete-confirmation p,.delete-confirmation small{margin:0;color:var(--muted);font-size:9px;line-height:1.55}.danger-button{min-height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 13px;border:1px solid color-mix(in srgb,#dc2626 48%,var(--line));border-radius:9px;background:color-mix(in srgb,#dc2626 10%,var(--card));color:#dc2626;font-size:9px;font-weight:700}
	@media(max-width:980px){.module-grid{grid-template-columns:1fr}.editor-fields{grid-template-columns:1fr 1fr}.editor-layout{grid-template-columns:1fr}.template-list article{grid-template-columns:34px minmax(0,1fr)}.template-controls{grid-column:1/-1;padding-top:2px}}
	@media(max-width:620px){.module-card,.message-card{padding:16px}.message-card header{flex-wrap:wrap}.message-card header button{width:100%;justify-content:center}.switches,.milestone-editor>div,.editor-fields{grid-template-columns:1fr}.template-list article{grid-template-columns:32px minmax(0,1fr);gap:9px;padding:12px}.template-controls{justify-content:space-between;gap:8px;flex-wrap:wrap}.template-actions{margin-left:auto}.template-actions button{width:40px;min-width:40px;height:40px}.template-copy small{max-width:100%}.editor-meta{flex-direction:column}}
	@media(max-width:400px){.template-controls{display:grid;grid-template-columns:1fr 1fr}.template-actions{grid-column:1/-1;width:100%;margin:0}.template-actions button{flex:1}.template-actions .remove{min-width:max-content}}
</style>
