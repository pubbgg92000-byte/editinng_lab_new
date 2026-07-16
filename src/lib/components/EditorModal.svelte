<script lang="ts">
	import Modal from './Modal.svelte';
	import type { Editor, EditorAvailability } from '$lib/types';
	let { open = $bindable(), editor = null, onsaved = () => {} }: { open: boolean; editor?: Editor | null; onsaved?: (editor: Editor) => void } = $props();
	let name = $state(''); let phone = $state(''); let specialty = $state(''); let availability = $state<EditorAvailability>('available'); let error = $state(''); let saving = $state(false);
	$effect(() => { if (open) { name = editor?.name || ''; phone = editor?.phone || ''; specialty = editor?.specialty || ''; availability = editor?.availability || 'available'; error = ''; } });
	async function save() { if (!name.trim()) { error='Editor name is required.'; return; } saving=true; const response=await fetch(editor?`/api/editors/${editor.id}`:'/api/editors',{method:editor?'PATCH':'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,phone,specialty,availability})}); const result=await response.json(); saving=false; if(!response.ok){error=result.error||'Unable to save editor';return} onsaved(result.editor); open=false; }
</script>
<Modal title={editor?'Edit editor':'Create editor'} bind:open>
	<div class="form-grid"><div class="field"><label for="editor-name">Name *</label><input id="editor-name" bind:value={name}/></div><div class="field"><label for="editor-phone">WhatsApp number</label><input id="editor-phone" bind:value={phone}/></div><div class="field"><label for="editor-specialty">Specialty</label><input id="editor-specialty" bind:value={specialty} placeholder="Photo editing, album design..."/></div><div class="field"><label for="editor-availability">Availability</label><select id="editor-availability" bind:value={availability}><option value="available">Available</option><option value="busy">Busy</option><option value="inactive">Inactive</option></select></div></div>
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={()=>open=false}>Cancel</button><button class="primary" disabled={saving} onclick={save}>{saving?'Saving...':'Save editor'}</button>{/snippet}
</Modal>
<style>.error{color:#ef4444;font-size:10px;margin-top:12px}</style>
