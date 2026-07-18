<script lang="ts">
	import Modal from './Modal.svelte';
	import EditorModal from './EditorModal.svelte';
	import { durationBillableAmount, formatVideoDuration, parseVideoDurationMinutes } from '$lib/duration';
	import type { Editor, Task, TaskBillingMode } from '$lib/types';

	let { open = $bindable(), orderId, editors = $bindable(), devices = $bindable(), task = null, onsaved = () => {} }: { open:boolean; orderId:string; editors:Editor[]; devices:string[]; task?:Task|null; onsaved?:()=>void } = $props();
	let titles = $state('');
	let editorId = $state('');
	let due = $state('');
	let instructions = $state('');
	let textLink = $state('');
	let imageUrl = $state('');
	let device = $state('');
	let billingMode = $state<TaskBillingMode>('manual');
	let billableAmount = $state<number | undefined>(undefined);
	let hourlyRate = $state<number | undefined>(undefined);
	let videoDuration = $state('');
	let error = $state('');
	let saving = $state(false);
	let showEditor = $state(false);
	let addingDevice = $state(false);
	const calculatedAmount = $derived(durationBillableAmount(hourlyRate, parseVideoDurationMinutes(videoDuration)));

	$effect(() => {
		if (!open) return;
		titles = task?.name || '';
		editorId = task?.editorId || '';
		due = task?.due || '';
		instructions = task?.instructions || '';
		textLink = task?.textLink || '';
		imageUrl = task?.imageUrl || '';
		device = task?.device || '';
		addingDevice = Boolean(task?.device && !devices.includes(task.device));
		billingMode = task?.billingMode || 'manual';
		billableAmount = task?.billableAmount || undefined;
		hourlyRate = task?.hourlyRate || undefined;
		videoDuration = formatVideoDuration(task?.videoDurationMinutes);
		error = '';
	});

	function parseLine(line: string) {
		const divider = line.lastIndexOf('|');
		if (divider < 0) return { name: line, billableAmount: 0 };
		const amount = Number(line.slice(divider + 1).trim().replaceAll(',', ''));
		return Number.isFinite(amount) ? { name: line.slice(0, divider).trim(), billableAmount: Math.max(0, amount) } : { name: line, billableAmount: 0 };
	}

	async function save() {
		const names = titles.split('\n').map((value) => value.trim()).filter(Boolean);
		if (!names.length) { error = 'Add at least one task title.'; return; }
		if (!editorId) { error = 'Choose or create an editor.'; return; }
		if (!device.trim()) { error = 'Enter the device given to the editor, such as HD-1.'; return; }
		if (billingMode === 'duration' && !(Number(hourlyRate) > 0)) { error = 'Enter the billing rate per video hour.'; return; }
		if (billingMode === 'duration' && videoDuration.trim() && !Number.isFinite(parseVideoDurationMinutes(videoDuration))) { error = 'Enter duration like 30 min, 1.5 hr, or 1:30.'; return; }

		saving = true;
		error = '';
		const endpoint = task ? `/api/tasks/${task.id}` : `/api/orders/${orderId}/tasks`;
		const shared = { editorId, due, instructions, textLink, imageUrl, device: device.trim(), billingMode, hourlyRate: billingMode === 'duration' ? Number(hourlyRate || 0) : 0, videoDuration };
		const body = task
			? { name: names[0], ...shared, billableAmount: billingMode === 'manual' ? Number(billableAmount || 0) : calculatedAmount }
			: { tasks: names.map((line) => ({ ...(billingMode === 'manual' ? parseLine(line) : { name: line, billableAmount: 0 }), ...shared })) };
		const response = await fetch(endpoint, { method: task ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
		const result = await response.json();
		saving = false;
		if (!response.ok) { error = result.error || 'Unable to save task'; return; }
		if (device.trim() && !devices.includes(device.trim())) devices = [...devices, device.trim()].sort((a, b) => a.localeCompare(b));
		open = false;
		onsaved();
	}

	function editorSaved(editor: Editor) { editors = [...editors, editor]; editorId = editor.id; }
</script>

<Modal title={task ? 'Edit assigned work' : 'Assign work'} bind:open wide>
	<div class="field"><label for="task-titles">{task ? 'Task title' : 'Task titles — one per line'}</label><textarea id="task-titles" bind:value={titles} placeholder={task ? 'Culling' : 'Culling | 3000\nColour correction | 5000\nQuality check'}></textarea></div>
	<div class="form-grid task-fields">
		<div class="field"><label for="task-editor">Editor *</label><div class="editor-select"><select id="task-editor" bind:value={editorId}><option value="">Choose editor</option>{#each editors.filter((editor) => editor.availability !== 'inactive') as editor}<option value={editor.id}>{editor.name} · {editor.activeTasks} active</option>{/each}</select><button class="secondary" onclick={() => showEditor = true}>New</button></div></div>
		<div class="field"><label for="task-due">Due date</label><input id="task-due" type="date" bind:value={due}/></div>
		<div class="field"><label for="task-device">Device given to editor *</label><div class="device-select">{#if addingDevice}<input id="task-device" bind:value={device} placeholder="e.g. HD-1, HD-2, SSD-3"/>{:else}<select id="task-device" bind:value={device}><option value="">Choose device</option>{#each devices as option}<option value={option}>{option}</option>{/each}</select>{/if}<button class="secondary" type="button" onclick={() => { addingDevice = !addingDevice; if (addingDevice) device = ''; }}>{addingDevice ? 'Use list' : 'Add new device'}</button></div><small>New devices are saved to the reusable list when this task is assigned.</small></div>
		<div class="field"><label for="billing-mode">Default task billing</label><select id="billing-mode" bind:value={billingMode}><option value="manual">Manual task value</option><option value="duration">Rate × editor video duration</option></select><small>The admin can still choose manual or duration billing when creating the final invoice.</small></div>
	</div>

	{#if billingMode === 'manual'}
		{#if task}<div class="field section"><label for="task-value">Task billing amount (₹)</label><input id="task-value" type="number" min={task.invoicedAmount || 0} step="1" bind:value={billableAmount} placeholder="Amount to bill for this task"/>{#if (task.invoicedAmount || 0) > 0}<small class="invoiced-note">Already invoiced: ₹{(task.invoicedAmount || 0).toLocaleString('en-IN')}</small>{/if}</div>{:else}<p class="value-note">For manual billing, add an optional amount after each title: <b>Colour correction | 5000</b>.</p>{/if}
	{:else}
		<div class="duration-panel section">
			<div class="field"><label for="hourly-rate">Rate per video hour (₹) *</label><input id="hourly-rate" type="number" min="0" step="1" bind:value={hourlyRate} placeholder="e.g. 12000"/></div>
			<div class="field"><label for="video-duration">Video duration</label><input id="video-duration" bind:value={videoDuration} placeholder="e.g. 30 min, 1.5 hr, or 1:30"/><small>The editor can enter or correct this from their portal.</small></div>
			<div class="calculated"><span>Calculated task value</span><strong>₹{calculatedAmount.toLocaleString('en-IN')}</strong></div>
		</div>
	{/if}

	<div class="field section"><label for="task-instructions">Instructions</label><textarea id="task-instructions" bind:value={instructions}></textarea></div>
	<div class="form-grid section"><div class="field"><label for="task-link">External text / reference link</label><input id="task-link" type="url" inputmode="url" bind:value={textLink} placeholder="https://..."/></div><div class="field"><label for="task-image">External image URL</label><input id="task-image" type="url" inputmode="url" bind:value={imageUrl} placeholder="https://..."/></div></div>
	<p class="media-note">Files stay in Drive, R2, S3 or your chosen file host. StudioFlow stores only the external link.</p>
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={() => open = false}>Cancel</button><button class="primary" disabled={saving} onclick={save}>{saving ? 'Saving...' : task ? 'Save task changes' : 'Assign tasks'}</button>{/snippet}
</Modal>
<EditorModal bind:open={showEditor} onsaved={editorSaved}/>

<style>
	.task-fields,.section{margin-top:18px}.editor-select,.device-select{display:grid;grid-template-columns:1fr auto;gap:7px}.device-select button{white-space:nowrap}.media-note,.value-note,.invoiced-note,.field small{margin:8px 0 0;color:var(--muted);font-size:8px}.value-note b{color:var(--text)}.invoiced-note{display:block}.error{color:#ef4444;font-size:10px;margin-top:12px}.duration-panel{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:16px;border:1px solid var(--line);border-radius:12px;background:var(--theme-soft)}.calculated{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--line);font-size:10px}.calculated strong{font-size:16px;color:var(--purple)}
	@media(max-width:620px){.duration-panel{grid-template-columns:1fr}}
</style>
