<script lang="ts">
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EditorModal from '$lib/components/EditorModal.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import { Pencil, Link2, Check, Archive, RotateCcw, Eye, Phone, Sparkles, ClipboardList, Trash2 } from 'lucide-svelte';
	import { editorStore } from '$lib/stores/app';
	import type { Editor, Order } from '$lib/types';

	let { data } = $props();
	let editors = $state<Editor[]>(data.editors);
	let orders = $state<Order[]>(data.orders);
	let showEditor = $state(false);
	let editing = $state<Editor | null>(null);
	let copied = $state('');
	let showArchived = $state(false);
	let message = $state('');
	let detailsOpen = $state(false);
	let detailEditor = $state<Editor | null>(null);
	const visibleEditors = $derived(editors.filter((editor) => Boolean(editor.archived) === showArchived));

	function tasksFor(editorId: string) {
		return orders.flatMap((order) => order.tasks.filter((task) => task.editorId === editorId && !task.archived).map((task) => ({ ...task, project: order.project, customer: order.customer, orderId: order.id })));
	}
	function openEditor(editor: Editor | null = null) { editing = editor; showEditor = true; }
	function openDetails(editor: Editor) { detailEditor = editor; detailsOpen = true; }
	function editDetails(editor: Editor) { detailsOpen = false; openEditor(editor); }
	function saved(editor: Editor) {
		const index = editors.findIndex((item) => item.id === editor.id);
		editors = index < 0 ? [...editors, editor] : editors.map((item) => item.id === editor.id ? editor : item);
		if (detailEditor?.id === editor.id) detailEditor = editor;
		editorStore.update((items) => items.some((item) => item.id === editor.id) ? items.map((item) => item.id === editor.id ? editor : item) : [editor, ...items]);
	}
	async function copyPortal(editor: Editor) {
		let token = editor.token;
		if (!token) {
			const response = await fetch(`/api/editors/${editor.id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'regenerate-token' }) });
			const result = await response.json();
			if (!response.ok) return;
			token = result.token;
			editor.token = token;
		}
		await navigator.clipboard.writeText(`${location.origin}/editor/${token}`);
		copied = editor.id;
		setTimeout(() => copied = '', 1800);
	}
	async function archiveEditor(editor: Editor) {
		if (!confirm(`Archive ${editor.name}? Assigned work will remain in history.`)) return;
		const response = await fetch(`/api/editors/${editor.id}`, { method: 'DELETE' });
		const result = await response.json();
		if (!response.ok) { message = result.error || 'Unable to archive editor'; return; }
		editors = editors.map((item) => item.id === editor.id ? result.editor : item);
		detailsOpen = false;
		detailEditor = null;
		editorStore.update((items) => items.filter((item) => item.id !== editor.id));
		message = result.sync?.configured && !result.sync?.failed
			? 'Editor archived in the database and Google Sheets'
			: 'Editor archived in the database; Google Sheets update is queued';
	}
	async function restoreEditor(editor: Editor) {
		const response = await fetch(`/api/editors/${editor.id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'restore' }) });
		const result = await response.json();
		if (!response.ok) { message = result.error || 'Unable to restore editor'; return; }
		editors = editors.map((item) => item.id === editor.id ? result.editor : item);
		editorStore.update((items) => [result.editor, ...items.filter((item) => item.id !== editor.id)]);
		message = result.sync?.configured && !result.sync?.failed
			? 'Editor restored in the database and Google Sheets'
			: 'Editor restored in the database; Google Sheets update is queued';
	}
	async function permanentlyDelete(editor: Editor) {
		if (!confirm(`Permanently delete ${editor.name}? This cannot be undone. Their existing tasks will be kept and changed to Unassigned.`)) return;
		const response = await fetch(`/api/editors/${editor.id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'delete-permanently' }) });
		const result = await response.json();
		if (!response.ok) { message = result.error || 'Unable to delete editor'; return; }
		editors = editors.filter((item) => item.id !== editor.id);
		editorStore.update((items) => items.filter((item) => item.id !== editor.id));
		detailsOpen = false;
		detailEditor = null;
		message = result.sync?.configured && !result.sync?.failed
			? `${editor.name} permanently deleted from the database and Google Sheets`
			: `${editor.name} deleted from the database; Google Sheets deletion is queued until writable credentials are added`;
	}
	onMount(() => {
		const editorId = new URL(location.href).searchParams.get('editor');
		const editor = editors.find((item) => item.id === editorId);
		if (editor) {
			showArchived = Boolean(editor.archived);
			openDetails(editor);
		}
	});
</script>

<PageHeader eyebrow="Create, edit and assign" title="Editors" action="New editor" onclick={() => openEditor()}/>
<div class="editor-tools"><button class:active={showArchived} onclick={() => { showArchived = !showArchived; detailsOpen = false; detailEditor = null; }}>{showArchived ? 'View active' : 'View archived'}</button><span>{visibleEditors.length} editors</span></div>
{#if message}<p class="message">{message}</p>{/if}

<div class="editor-grid">
	{#each visibleEditors as editor}
		<article class:archived={editor.archived} class="card editor-card">
			<div class="editor-summary">
				<div class="editor-top"><span class="editor-avatar">{editor.initials}</span><span class:available={editor.availability === 'available'} class="availability"><i></i>{editor.archived ? 'archived' : editor.availability || 'available'}</span></div>
				<h2>{editor.name}</h2><p>{editor.specialty || 'Specialty not set'}</p>
				<div class="editor-meta"><span><strong>{editor.activeTasks}</strong> Active tasks</span><span>{editor.phone || 'No WhatsApp number'}</span></div>
				<div class:archived-actions={editor.archived} class="editor-actions">
					<button aria-label={`Open ${editor.name} details`} onclick={() => openDetails(editor)}><Eye size={13}/><span class="action-label">Open</span></button>
					{#if editor.archived}<button aria-label={`Restore ${editor.name}`} onclick={() => restoreEditor(editor)}><RotateCcw size={13}/><span class="action-label">Restore</span></button><button class="delete-permanent" aria-label={`Permanently delete ${editor.name}`} title="Delete permanently" onclick={() => permanentlyDelete(editor)}><Trash2 size={13}/><span class="action-label">Delete</span></button>{:else}
						<button aria-label={`Copy ${editor.name} portal link`} onclick={() => copyPortal(editor)}>{#if copied === editor.id}<Check size={13}/><span class="action-label">Copied</span>{:else}<Link2 size={13}/><span class="action-label">Portal</span>{/if}</button>
						<button aria-label={`Edit ${editor.name}`} onclick={() => openEditor(editor)}><Pencil size={13}/><span class="action-label">Edit</span></button>
						{#if editor.phone}<a class="whatsapp" href={'https://wa.me/' + editor.phone.replace(/\D/g, '')} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${editor.name}`}><WhatsAppIcon size={14}/></a>{:else}<button type="button" class="whatsapp unavailable" aria-disabled="true" aria-label={`No WhatsApp number for ${editor.name}`}><WhatsAppIcon size={14}/></button>{/if}
						<button class="danger" aria-label={`Archive ${editor.name}`} onclick={() => archiveEditor(editor)}><Archive size={13}/></button>
					{/if}
				</div>
			</div>

		</article>
	{/each}
</div>

<Modal bind:open={detailsOpen} wide title={detailEditor ? `${detailEditor.name} — Editor profile` : 'Editor profile'}>
	{#if detailEditor}
		<div class="editor-detail">
			<div class="expansion-head"><div><div class="entity-tags"><span class="editor-tag">Editor</span><span>{detailEditor.availability || 'available'}</span></div><h3>{detailEditor.name}'s workspace</h3><p>{detailEditor.specialty || 'Add a specialty to help with assignment decisions.'}</p></div><button class="secondary" onclick={() => editDetails(detailEditor!)}><Pencil size={13}/> Edit profile</button></div>
			<div class="editor-stats"><div><Phone size={15}/><span>WhatsApp<strong>{detailEditor.phone || 'Not added'}</strong></span></div><div><Sparkles size={15}/><span>Availability<strong>{detailEditor.availability || 'Available'}</strong></span></div><div><ClipboardList size={15}/><span>Active work<strong>{tasksFor(detailEditor.id).length} tasks</strong></span></div><div><Check size={15}/><span>Completed<strong>{tasksFor(detailEditor.id).filter((task) => task.status === 'Completed').length} tasks</strong></span></div></div>
			<div class="assignment-head"><span>Current assignments</span><strong>{tasksFor(detailEditor.id).length} tasks</strong></div>
			{#if tasksFor(detailEditor.id).length}<div class="assignment-list">{#each tasksFor(detailEditor.id).slice(0, 12) as task}<a href={'/orders/' + task.orderId}><div class="assignment-copy"><div class="entity-tags"><span class="task-tag">Task</span><span class="customer-tag">Customer</span><span>{task.customer}</span></div><strong>{task.name}</strong><small>{task.project}</small></div><div class="assignment-status"><span>{task.status}</span><small>{task.progress}% complete</small></div></a>{/each}</div>{:else}<p class="empty-detail">No active assignments for this editor.</p>{/if}
		</div>
	{/if}
</Modal>
<EditorModal bind:open={showEditor} editor={editing} onsaved={saved}/>

<style>
	.editor-tools{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-bottom:14px}.editor-tools button{height:32px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--muted);font-size:9px;padding:0 11px}.editor-tools button.active{color:var(--purple);border-color:var(--purple)}.editor-tools span,.message{color:var(--muted);font-size:9px}.message{text-align:right}.editor-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:start}.editor-card{padding:18px}.editor-card.archived h2,.editor-card.archived>p,.editor-card.archived .editor-meta{text-decoration:line-through}.editor-top{display:flex;justify-content:space-between}.editor-avatar{width:39px;height:39px;border-radius:10px;background:var(--theme-soft);color:var(--purple);display:grid;place-items:center;font-size:11px;font-weight:700}.availability{display:flex;gap:5px;align-items:center;border-radius:20px;background:var(--theme-soft);color:var(--muted);font-size:8px;padding:4px 7px;text-transform:capitalize}.availability i{width:5px;height:5px;border-radius:50%;background:#94a3b8}.availability.available{color:#059669}.availability.available i{background:#10b981}.editor-card h2{font-size:13px;margin:15px 0 3px}.editor-card p{font-size:10px;color:var(--muted);margin:0}.editor-meta{border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:17px 0 13px;padding:12px 0;display:flex;justify-content:space-between;color:var(--muted);font-size:9px}.editor-meta strong{font-size:11px;margin-right:4px}.editor-actions{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr) minmax(0,.8fr) 32px 32px;gap:7px}.editor-actions.archived-actions{grid-template-columns:minmax(0,1fr) auto}.editor-actions a,.editor-actions button{min-width:0;height:32px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--purple);font-size:9px;padding:0 7px;display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap}.editor-actions .whatsapp,.editor-actions .danger{width:32px;padding:0}.editor-actions .whatsapp{color:#25d366}.editor-actions .whatsapp.unavailable{color:var(--muted);cursor:help;opacity:.55}.editor-actions .danger{color:#ef7777}.editor-detail{min-width:0}.expansion-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.expansion-head h3{font-size:17px;margin:7px 0 4px}.expansion-head p{margin:0;color:var(--muted);font-size:9px}.expansion-head .secondary{display:flex;align-items:center;gap:6px}.entity-tags{display:flex;align-items:center;gap:5px;flex-wrap:wrap}.entity-tags span{padding:4px 7px;border:1px solid var(--line);border-radius:999px;color:var(--muted);background:var(--card);font-size:7px;text-transform:uppercase;letter-spacing:.05em}.entity-tags .editor-tag{color:#7c3aed;border-color:#8b5cf640;background:#8b5cf612}.entity-tags .customer-tag{color:#0284c7;border-color:#0ea5e940;background:#0ea5e912}.entity-tags .task-tag{color:#059669;border-color:#10b98140;background:#10b98112}.editor-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.editor-stats>div{display:flex;gap:9px;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--card);color:var(--purple)}.editor-stats span{display:flex;flex-direction:column;gap:4px;color:var(--muted);font-size:8px}.editor-stats strong{color:var(--theme-text);font-size:10px;text-transform:capitalize}.assignment-head{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding:16px 0 7px}.assignment-head span{color:var(--purple);font-size:8px;text-transform:uppercase;letter-spacing:.08em}.assignment-head strong{font-size:10px}.assignment-list{display:grid}.assignment-list>a{display:flex;justify-content:space-between;align-items:center;gap:15px;border-top:1px solid var(--line);padding:12px 0}.assignment-copy{display:flex;flex-direction:column;gap:5px;min-width:0}.assignment-copy>strong{font-size:11px}.assignment-copy>small{font-size:8px;color:var(--muted)}.assignment-status{display:flex;flex-direction:column;align-items:flex-end;gap:4px}.assignment-status>span{font-size:9px;color:var(--purple)}.assignment-status>small,.empty-detail{font-size:8px;color:var(--muted)}.empty-detail{margin:14px 0 0}@media(max-width:1050px){.editor-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:650px){.editor-grid{grid-template-columns:1fr}.editor-stats{grid-template-columns:1fr 1fr}.expansion-head{flex-direction:column}.assignment-list>a{align-items:flex-start}.assignment-status{min-width:82px}}@media(max-width:430px){.editor-actions{grid-template-columns:repeat(5,1fr)}.editor-actions.archived-actions{grid-template-columns:repeat(2,1fr)}.editor-actions .whatsapp,.editor-actions .danger{width:100%}.action-label{display:none}.editor-stats{grid-template-columns:1fr}}
	.editor-card.archived .editor-summary>p,.editor-card.archived .editor-avatar{text-decoration:line-through;opacity:.65}.editor-actions.archived-actions{grid-template-columns:minmax(0,1fr) auto auto}.editor-actions .delete-permanent{border-color:#ef777744;background:#ef77770d;color:#ef7777}.editor-actions .delete-permanent:hover{border-color:#ef7777;background:#ef77771a;color:#ef7777}
</style>
