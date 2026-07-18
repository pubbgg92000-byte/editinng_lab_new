<script lang="ts">
	import Modal from './Modal.svelte';
	import type { Customer } from '$lib/types';
	import { indianMobileError, normalizeIndianMobile } from '$lib/phone';

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

	$effect(() => {
		if (!open) return;
		name = customer?.name || '';
		business = customer?.business || '';
		phone = customer?.phone || '';
		email = customer?.email || '';
		address = customer?.address || '';
		locationUrl = customer?.locationUrl || '';
		gst = customer?.gst || '';
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
			const response = await fetch(customer ? `/api/customers/${customer.id}` : '/api/customers', {
				method: customer ? 'PATCH' : 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name, business: business || name, phone, email, address, locationUrl: locationUrl.trim(), gst })
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || 'Unable to save customer');
			onsaved(result.customer, result.sync?.configured === true && result.sync?.failed === 0);
			open = false;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Unable to save customer';
		} finally { saving = false; }
	}
</script>

<Modal title={customer ? 'Edit customer' : 'Add new customer'} bind:open>
	<div class="form-grid">
		<div class="field"><label for="customer-name">Customer name *</label><input id="customer-name" bind:value={name} placeholder="e.g. Rahul Sharma" /></div>
		<div class="field"><label for="business-name">Business name</label><input id="business-name" bind:value={business} placeholder="e.g. Rahul Photography" /></div>
		<div class="field"><label for="customer-phone">10-digit mobile number *</label><input id="customer-phone" bind:value={phone} inputmode="tel" autocomplete="tel" placeholder="98765 43210 or +91 98765 43210" /></div>
		<div class="field"><label for="customer-email">Email</label><input id="customer-email" bind:value={email} type="email" placeholder="name@studio.com" /></div>
		<div class="field"><label for="customer-gst">GST details</label><input id="customer-gst" bind:value={gst} placeholder="Optional" /></div>
	</div>
	<div class="field address"><label for="customer-address">Address</label><textarea id="customer-address" bind:value={address} placeholder="Billing address"></textarea></div>
	<div class="field address"><label for="customer-location">Google Maps home / delivery location</label><input id="customer-location" type="url" bind:value={locationUrl} placeholder="https://maps.app.goo.gl/..."/><small>Optional. Paste the location shared from Google Maps.</small></div>
	{#if error}<p class="error">{error}</p>{/if}
	{#snippet footer()}<button class="secondary" onclick={() => open = false}>Cancel</button><button class="primary" disabled={saving} onclick={save}>{saving ? 'Saving...' : customer ? 'Save changes' : 'Add customer'}</button>{/snippet}
</Modal>

<style>.address{margin-top:18px}.error{color:#ef8585;font-size:10px;margin:12px 0 0}</style>
