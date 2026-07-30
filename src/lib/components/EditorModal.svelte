<!-- Creates or edits an editor profile, phone, specialty, availability, and map link. -->
<script lang="ts">
	import Modal from './Modal.svelte';
	import CustomFields from './CustomFields.svelte';
	import { page } from '$app/state';
	import type { CustomFieldValue, Editor, EditorAvailability } from '$lib/types';
	import { hasCapability, labelFor } from '$lib/capabilities';
	import { requestJson } from '$lib/http';
	import { indianMobileError, normalizeIndianMobile } from '$lib/phone';
	import RequiredMark from './RequiredMark.svelte';
	let { open = $bindable(), editor = null, onsaved = () => {} }: { open: boolean; editor?: Editor | null; onsaved?: (editor: Editor) => void } = $props();
	let name = $state(''); let phone = $state(''); let locationUrl = $state(''); let specialty = $state(''); let availability = $state<EditorAvailability>('available'); let error = $state(''); let saving = $state(false);
	let customFields = $state<Record<string, CustomFieldValue>>({});
	const staffLabel = $derived(labelFor(page.data.configuration?.profile, 'staff'));
	$effect(() => { if (open) { name = editor?.name || ''; phone = editor?.phone || ''; locationUrl = editor?.locationUrl || ''; specialty = editor?.specialty || ''; availability = editor?.availability || 'available'; customFields = { ...(editor?.customFields || {}) }; error = ''; } });
	async function save() {
		if (!name.trim()) { error = `${staffLabel} name is required.`; return; }
		const phoneError = indianMobileError(phone, true);
		if (phoneError) { error = phoneError; return; }
		if (locationUrl.trim() && !/^https:\/\//i.test(locationUrl.trim())) { error = 'Google Maps location must be an HTTPS link.'; return; }
		phone = normalizeIndianMobile(phone);
		saving = true;
		error = '';
		try {
			const result = await requestJson<{ editor: Editor }>(editor ? `/api/editors/${editor.id}` : '/api/editors', {
				method: editor ? 'PATCH' : 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name, phone, locationUrl: locationUrl.trim(), specialty, availability, customFields })
			}, `Unable to save ${staffLabel.toLowerCase()}.`);
			onsaved(result.editor);
			open = false;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : `Unable to save ${staffLabel.toLowerCase()}.`;
		} finally {
			saving = false;
		}
	}
</script>
<Modal title={editor?`Edit ${staffLabel.toLowerCase()}`:`Create ${staffLabel.toLowerCase()}`} bind:open>
	<div class="form-grid"><div class="field"><label for="editor-name">Name <RequiredMark/></label><input id="editor-name" bind:value={name} required aria-required="true"/></div><div class="field"><label for="editor-phone">10-digit WhatsApp number <RequiredMark/></label><input id="editor-phone" bind:value={phone} inputmode="tel" autocomplete="tel" placeholder="98765 43210 or +91 98765 43210" required aria-required="true"/></div><div class="field"><label for="editor-specialty">Specialty</label><input id="editor-specialty" bind:value={specialty} placeholder="Primary skill or service area"/></div><div class="field"><label for="editor-availability">Availability</label><select id="editor-availability" bind:value={availability}><option value="available">Available</option><option value="busy">Busy</option><option value="inactive">Inactive</option></select></div></div><div class="field location"><label for="editor-location">Google Maps home / service location</label><input id="editor-location" type="url" bind:value={locationUrl} placeholder="https://maps.app.goo.gl/..."/><small>Optional. Paste the location shared from Google Maps.</small></div>
	{#if hasCapability(page.data.configuration?.effectiveCapabilities, 'customFields')}<CustomFields definitions={page.data.configuration.profile.customFields} entity="staff" bind:values={customFields}/>{/if}
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button type="button" class="secondary" disabled={saving} onclick={()=>open=false}>Cancel</button><button type="button" class="primary" disabled={saving} aria-busy={saving} onclick={save}>{saving?'Saving…':`Save ${staffLabel.toLowerCase()}`}</button>{/snippet}
</Modal>
<style>.location{margin-top:16px}.error{color:#ef4444;font-size:10px;margin-top:12px}</style>
