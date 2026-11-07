<!-- Shown after a private link is created or replaced: copy it, or send it on WhatsApp in one click. -->
<script lang="ts">
	import { Check, Copy } from '@lucide/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import { whatsappNumber } from '$lib/phone';

	let { open = $bindable(false), name, phone = '', link, business, replaced = false, whatsapp = true }: {
		open?: boolean;
		name: string;
		phone?: string;
		link: string;
		business: string;
		replaced?: boolean;
		whatsapp?: boolean;
	} = $props();

	let copied = $state(false);
	const number = $derived(whatsappNumber(phone));
	const message = $derived(`Hi ${name},\n\nHere is your ${replaced ? 'new ' : ''}private link from ${business}:\n${link}\n\n${replaced ? 'Your old link no longer works. ' : ''}Please keep this link private.`);
	const whatsappUrl = $derived(number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : '');

	const copy = async () => {
		try { await navigator.clipboard.writeText(link); copied = true; setTimeout(() => (copied = false), 2000); } catch { /* clipboard blocked; the link stays selectable */ }
	};
</script>

<Modal title={replaced ? 'New link ready' : 'Private link ready'} bind:open>
	<div class="ready">
		<p>{replaced ? `The old link for ${name} has stopped working. Send them this one.` : `Send this link to ${name}. It opens their private page, no password needed.`}</p>
		<label class="link">Private link<input readonly value={link} onfocus={(event) => event.currentTarget.select()} /></label>
		<div class="actions">
			<button type="button" class="secondary" onclick={copy}>{#if copied}<Check size={15} />Copied{:else}<Copy size={15} />Copy link{/if}</button>
			{#if whatsapp && whatsappUrl}
				<a class="primary" href={whatsappUrl} target="_blank" rel="noopener noreferrer" onclick={() => (open = false)}><WhatsAppIcon size={16} />Send on WhatsApp</a>
			{:else if whatsapp}
				<span class="note">Add a mobile number to {name} to send it on WhatsApp.</span>
			{/if}
		</div>
	</div>
</Modal>

<style>
	.ready { display: grid; gap: 14px; }
	p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }
	.link { display: grid; gap: 6px; font-size: 13px; font-weight: 600; }
	.link input { width: 100%; box-sizing: border-box; min-height: 42px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--theme-soft); color: var(--theme-text); font-size: 13.5px; }
	.actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
	.primary, .secondary { display: inline-flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 16px; border-radius: 10px; font-size: 14.5px; font-weight: 700; text-decoration: none; cursor: pointer; }
	.actions a.primary { border: 0; background: #16a34a; color: #fff; }
	.actions button.secondary { border: 1px solid var(--line); background: var(--card); color: var(--theme-text); }
	.note { font-size: 13px; color: var(--muted); }
</style>
