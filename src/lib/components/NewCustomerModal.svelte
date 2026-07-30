<!-- Creates or edits customer identity, studio, phone, address, GST, and map link. -->
<script lang="ts">
	import Modal from './Modal.svelte';
	import CustomFields from './CustomFields.svelte';
	import { page } from '$app/state';
	import type { Customer, CustomFieldValue } from '$lib/types';
	import { hasCapability, labelFor } from '$lib/capabilities';
	import { requestJson } from '$lib/http';
	import { indianMobileError, normalizeIndianMobile } from '$lib/phone';
	import RequiredMark from './RequiredMark.svelte';

	let { open = $bindable(), customer = null, onsaved = () => {} }: { open: boolean; customer?: Customer | null; onsaved?: (customer: Customer, synced: boolean) => void } = $props();
	let name = $state('');
	let business = $state('');
	let phone = $state('');
	let email = $state('');
	let address = $state('');
	let locationUrl = $state('');
	let gst = $state('');
	let saving = $state(false);
	let error = $state('');
	let customFields = $state<Record<string, CustomFieldValue>>({});
	const customerLabel = $derived(labelFor(page.data.configuration?.profile, 'customer'));

	$effect(() => {
		if (!open) return;
		name = customer?.name || '';
		business = customer?.business || '';
		phone = customer?.phone || '';
		email = customer?.email || '';
		address = customer?.address || '';
		locationUrl = customer?.locationUrl || '';
		gst = customer?.gst || '';
		customFields = { ...(customer?.customFields || {}) };
		error = '';
	});

	async function save() {
		if (!name.trim() || !phone.trim()) { error = 'Customer name and phone number are required.'; return; }
		const phoneError = indianMobileError(phone, true);
		if (phoneError) { error = phoneError; return; }
		if (locationUrl.trim() && !/^https:\/\//i.test(locationUrl.trim())) { error = 'Google Maps location must be an HTTPS link.'; return; }
		phone = normalizeIndianMobile(phone);
		saving = true;
		error = '';
		try {
			const result = await requestJson<{ customer: Customer; sync?: { configured?: boolean; failed?: number } }>(customer ? `/api/customers/${customer.id}` : '/api/customers', {
				method: customer ? 'PATCH' : 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name, business: business || name, phone, email, address, locationUrl: locationUrl.trim(), gst, customFields })
			}, `Unable to save ${customerLabel.toLowerCase()}.`);
			onsaved(result.customer, result.sync?.configured === true && result.sync?.failed === 0);
			open = false;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : `Unable to save ${customerLabel.toLowerCase()}.`;
		} finally { saving = false; }
	}
</script>

<Modal title={customer ? `Edit ${customerLabel.toLowerCase()}` : `Add new ${customerLabel.toLowerCase()}`} bind:open>
	<div class="form-grid">
		<div class="field"><label for="customer-name">{customerLabel} name <RequiredMark/></label><input id="customer-name" bind:value={name} placeholder="e.g. Rahul Sharma" required aria-required="true" /></div>
		<div class="field"><label for="business-name">Business name</label><input id="business-name" bind:value={business} placeholder="e.g. Rahul Photography" /></div>
		<div class="field"><label for="customer-phone">10-digit mobile number <RequiredMark/></label><input id="customer-phone" bind:value={phone} inputmode="tel" autocomplete="tel" placeholder="98765 43210 or +91 98765 43210" required aria-required="true" /></div>
		<div class="field"><label for="customer-email">Email</label><input id="customer-email" bind:value={email} type="email" placeholder="name@studio.com" /></div>
		<div class="field"><label for="customer-gst">GST details</label><input id="customer-gst" bind:value={gst} placeholder="Optional" /></div>
	</div>
	<div class="field address"><label for="customer-address">Address</label><textarea id="customer-address" bind:value={address} placeholder="Billing address"></textarea></div>
	<div class="field address"><label for="customer-location">Google Maps home / delivery location</label><input id="customer-location" type="url" bind:value={locationUrl} placeholder="https://maps.app.goo.gl/..."/><small>Optional. Paste the location shared from Google Maps.</small></div>
	{#if hasCapability(page.data.configuration?.effectiveCapabilities, 'customFields')}<CustomFields definitions={page.data.configuration.profile.customFields} entity="customer" bind:values={customFields}/>{/if}
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button type="button" class="secondary" disabled={saving} onclick={() => open = false}>Cancel</button><button type="button" class="primary" disabled={saving} aria-busy={saving} onclick={save}>{saving ? 'Saving…' : customer ? 'Save changes' : `Add ${customerLabel.toLowerCase()}`}</button>{/snippet}
</Modal>

<style>.address{margin-top:18px}.error{color:#ef8585;font-size:10px;margin:12px 0 0}</style>
