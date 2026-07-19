<!-- Creates or edits an editor profile, phone, specialty, availability, and map link. -->
<script lang="ts">
	import Modal from './Modal.svelte';
	import type { Editor, EditorAvailability } from '$lib/types';
	import { indianMobileError, normalizeIndianMobile } from '$lib/phone';
	let { open = $bindable(), editor = null, onsaved = () => {} }: { open: boolean; editor?: Editor | null; onsaved?: (editor: Editor) => void } = $props();
	let name = $state(''); let phone = $state(''); let locationUrl = $state(''); let specialty = $state(''); let availability = $state<EditorAvailability>('available'); let error = $state(''); let saving = $state(false);
	$effect(() => { if (open) { name = editor?.name || ''; phone = editor?.phone || ''; locationUrl = editor?.locationUrl || ''; specialty = editor?.specialty || ''; availability = editor?.availability || 'available'; error = ''; } });
	async function save() { if (!name.trim()) { error='Editor name is required.'; return; } const phoneError=indianMobileError(phone,true); if(phoneError){error=phoneError;return} if(locationUrl.trim()&&!/^https:\/\//i.test(locationUrl.trim())){error='Google Maps location must be an HTTPS link.';return} phone=normalizeIndianMobile(phone); saving=true; const response=await fetch(editor?`/api/editors/${editor.id}`:'/api/editors',{method:editor?'PATCH':'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,phone,locationUrl:locationUrl.trim(),specialty,availability})}); const result=await response.json(); saving=false; if(!response.ok){error=result.error||'Unable to save editor';return} onsaved(result.editor); open=false; }
</script>
<Modal title={editor?'Edit editor':'Create editor'} bind:open>
	<div class="form-grid"><div class="field"><label for="editor-name">Name *</label><input id="editor-name" bind:value={name}/></div><div class="field"><label for="editor-phone">10-digit WhatsApp number *</label><input id="editor-phone" bind:value={phone} inputmode="tel" autocomplete="tel" placeholder="98765 43210 or +91 98765 43210"/></div><div class="field"><label for="editor-specialty">Specialty</label><input id="editor-specialty" bind:value={specialty} placeholder="Photo editing, album design..."/></div><div class="field"><label for="editor-availability">Availability</label><select id="editor-availability" bind:value={availability}><option value="available">Available</option><option value="busy">Busy</option><option value="inactive">Inactive</option></select></div></div><div class="field location"><label for="editor-location">Google Maps home / delivery location</label><input id="editor-location" type="url" bind:value={locationUrl} placeholder="https://maps.app.goo.gl/..."/><small>Optional. Paste the location shared from Google Maps.</small></div>
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={()=>open=false}>Cancel</button><button class="primary" disabled={saving} onclick={save}>{saving?'Saving...':'Save editor'}</button>{/snippet}
</Modal>
<style>.location{margin-top:16px}.error{color:#ef4444;font-size:10px;margin-top:12px}</style>
