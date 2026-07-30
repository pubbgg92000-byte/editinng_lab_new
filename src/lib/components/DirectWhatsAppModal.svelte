<script lang="ts">
	import { Check, MessageCircle, Send, Sparkles } from '@lucide/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import { messageScenarioLabels } from '$lib/moduleConfiguration';
	import { whatsappNumber } from '$lib/phone';
	import type { Customer, Editor, Order, TenantConfiguration, WhatsAppTemplate } from '$lib/types';

	type Recipient =
		| { kind: 'customer'; record: Customer }
		| { kind: 'staff'; record: Editor };

	let {
		open = $bindable(false),
		recipient,
		orders = [],
		configuration,
		onmessage = () => {}
	}: {
		open?: boolean;
		recipient: Recipient | null;
		orders?: Order[];
		configuration: TenantConfiguration;
		onmessage?: (message: string) => void;
	} = $props();

	let templateId = $state('');
	let orderId = $state('');
	let draft = $state('');
	let preparing = $state(false);
	let error = $state('');
	let openedFor = $state('');

	const catalog = $derived(configuration.moduleConfiguration['communications.whatsapp']);
	const templates = $derived(
		Object.values(catalog.templates)
			.filter((template) =>
				template.enabled &&
				(recipient?.kind === 'staff'
					? template.audience === 'staff' && template.scenario === 'work-assignment'
					: template.audience === 'customer' && !['invoice', 'partial-invoice'].includes(template.scenario))
			)
			.sort((left, right) => messageScenarioLabels[left.scenario].localeCompare(messageScenarioLabels[right.scenario]) || left.name.localeCompare(right.name))
	);
	const selectedTemplate = $derived<WhatsAppTemplate | undefined>(templates.find((template) => template.id === templateId));
	const availableOrders = $derived.by(() => {
		if (!recipient) return [];
		let choices = orders;
		if (recipient.kind === 'staff') {
			choices = choices.filter((order) => order.tasks.some((task) => !task.archived && task.editorId === recipient.record.id));
		}
		if (selectedTemplate?.scenario === 'payment-received') {
			choices = choices.filter((order) => Boolean(order.payments?.length));
		}
		return choices;
	});
	const recipientName = $derived(
		recipient?.kind === 'customer'
			? recipient.record.business || recipient.record.name
			: recipient?.record.name || ''
	);
	const phone = $derived(recipient ? whatsappNumber(recipient.record.phone || '') : '');

	$effect(() => {
		if (!open || !recipient) {
			if (!open) openedFor = '';
			return;
		}
		if (openedFor === `${recipient.kind}:${recipient.record.id}`) return;
		openedFor = `${recipient.kind}:${recipient.record.id}`;
		templateId = '';
		orderId = '';
		draft = '';
		error = '';
	});

	$effect(() => {
		if (availableOrders.some((order) => order.id === orderId)) return;
		orderId = availableOrders[0]?.id || '';
	});

	function chooseTemplate(value: string) {
		templateId = value;
		draft = '';
		error = '';
	}

	function openWhatsApp(message = '') {
		if (!phone) {
			error = 'Add a valid WhatsApp number before starting a conversation.';
			return;
		}
		const url = `https://wa.me/${phone}${message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ''}`;
		window.open(url, '_blank', 'noopener,noreferrer');
		open = false;
		onmessage(message.trim() ? 'WhatsApp message opened for review.' : 'Blank WhatsApp conversation opened.');
	}

	async function prepareMessage() {
		if (!recipient || !selectedTemplate) {
			openWhatsApp();
			return;
		}
		if (!orderId) {
			error = recipient.kind === 'staff'
				? 'Assign work to this team member before using an assignment template.'
				: 'This customer needs a related order before using this template.';
			return;
		}
		preparing = true;
		error = '';
		try {
			const endpoint = recipient.kind === 'staff'
				? `/api/editors/${recipient.record.id}/whatsapp`
				: `/api/orders/${orderId}/whatsapp`;
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(recipient.kind === 'staff'
					? { orderId, templateId }
					: { templateId })
			});
			const result = await response.json();
			if (!response.ok) {
				error = result.error || 'Unable to prepare this WhatsApp message.';
				return;
			}
			draft = result.message || '';
			if (!draft) error = 'The selected template did not produce a message.';
		} catch {
			error = 'Unable to reach the server. Try again.';
		} finally {
			preparing = false;
		}
	}
</script>

<Modal title={recipient ? `WhatsApp ${recipientName}` : 'Direct WhatsApp'} bind:open wide>
	{#if recipient}<div class="direct-whatsapp">
		<div class="recipient">
			<span><WhatsAppIcon size={17}/></span>
			<div><strong>{recipientName}</strong><small>{recipient.record.phone || 'No WhatsApp number'}</small></div>
			<i>{recipient.kind === 'staff' ? 'Team member' : 'Customer'}</i>
		</div>

		{#if !draft}
			<div class="mode-copy"><Sparkles size={15}/><div><strong>Choose how to start</strong><small>Select a saved template to fill it with current details, or continue with a blank conversation.</small></div></div>
			<label class="template-field">
				<span>Message template</span>
				<select value={templateId} onchange={(event) => chooseTemplate(event.currentTarget.value)}>
					<option value="">No template — start a blank chat</option>
					{#each templates as template}<option value={template.id}>{messageScenarioLabels[template.scenario]} — {template.name}</option>{/each}
				</select>
			</label>
			{#if selectedTemplate}<label class="template-field">
				<span>{recipient.kind === 'staff' ? 'Assignment' : 'Related order'}</span>
				<select bind:value={orderId}>
					{#each availableOrders as order}<option value={order.id}>{order.project} — {order.customer}</option>{/each}
				</select>
				{#if !availableOrders.length}<small>{recipient.kind === 'staff' ? 'No assigned work is available.' : 'No compatible order is available for this message.'}</small>{/if}
			</label>
			<div class="template-summary"><MessageCircle size={14}/><span><strong>{selectedTemplate.name}</strong><small>{messageScenarioLabels[selectedTemplate.scenario]} · Details are filled securely from the selected record.</small></span></div>{/if}
		{:else}
			<div class="preview-heading"><span><Check size={14}/><strong>Message prepared</strong></span><button type="button" onclick={() => (draft = '')}>Change template</button></div>
			<label class="draft-field"><span>Review or edit before opening WhatsApp</span><textarea bind:value={draft} maxlength="4000"></textarea><small>{draft.length} / 4,000 characters</small></label>
		{/if}
		{#if error}<p class="direct-error">{error}</p>{/if}
	</div>{/if}
	{#snippet footer()}
		<button type="button" class="secondary" onclick={() => (open = false)}>Cancel</button>
		{#if draft}<button type="button" class="primary direct-action" onclick={() => openWhatsApp(draft)}><Send size={14}/> Open WhatsApp</button>
		{:else}<button type="button" class="primary direct-action" disabled={preparing || !phone || (Boolean(selectedTemplate) && !orderId)} aria-busy={preparing} onclick={prepareMessage}>
			{#if templateId}<Sparkles size={14}/>{preparing ? 'Preparing…' : 'Prepare message'}{:else}<WhatsAppIcon size={14}/> Continue without template{/if}
		</button>{/if}
	{/snippet}
</Modal>

<style>
	.direct-whatsapp{display:grid;gap:16px}.recipient{display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;gap:10px;padding:11px;border:1px solid var(--line);border-radius:12px;background:var(--theme-soft)}.recipient>span{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:color-mix(in srgb,#22c55e 12%,var(--card));color:#16a34a}.recipient>div{min-width:0;display:grid;gap:3px}.recipient strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.recipient small{color:var(--muted);font-size:8px}.recipient i{padding:5px 8px;border-radius:999px;background:var(--card);color:var(--muted);font-size:7px;font-style:normal}.mode-copy{display:flex;align-items:flex-start;gap:9px;color:var(--purple)}.mode-copy>div{display:grid;gap:3px}.mode-copy strong{font-size:10px}.mode-copy small{color:var(--muted);font-size:8px;line-height:1.5}.template-field,.draft-field{display:grid;gap:6px}.template-field>span,.draft-field>span{font-size:9px;font-weight:700}.template-field select{width:100%;height:42px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--theme-text);padding:0 11px}.template-field>small,.draft-field>small{color:var(--muted);font-size:7px}.template-summary{display:flex;align-items:flex-start;gap:8px;padding:10px;border:1px solid color-mix(in srgb,var(--purple) 22%,var(--line));border-radius:10px;background:color-mix(in srgb,var(--purple) 6%,var(--card));color:var(--purple)}.template-summary span{display:grid;gap:3px}.template-summary strong{font-size:9px}.template-summary small{color:var(--muted);font-size:8px;line-height:1.45}.preview-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}.preview-heading>span{display:flex;align-items:center;gap:6px;color:#16a34a}.preview-heading strong{font-size:10px}.preview-heading button{border:0;background:transparent;color:var(--purple);font-size:8px;font-weight:700}.draft-field textarea{min-height:260px;resize:vertical;border:1px solid var(--line);border-radius:11px;background:var(--card);color:var(--theme-text);padding:12px;font:9px/1.6 inherit}.draft-field textarea:focus,.template-field select:focus{outline:3px solid color-mix(in srgb,var(--purple) 18%,transparent);border-color:var(--purple)}.direct-error{margin:0;padding:9px 10px;border-radius:9px;background:#ef44440d;color:#dc2626;font-size:8px;line-height:1.5}.direct-action{display:inline-flex;align-items:center;justify-content:center;gap:7px}
	@media(max-width:520px){.recipient{grid-template-columns:38px minmax(0,1fr)}.recipient i{grid-column:2;justify-self:start}.draft-field textarea{min-height:220px}}
</style>
