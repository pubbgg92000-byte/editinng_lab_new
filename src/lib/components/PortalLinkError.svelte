<!-- Public error page for private links: an old/replaced link asks the business for a new one on WhatsApp. -->
<script lang="ts">
	import { page } from '$app/state';
	import { Link2Off, Phone, TriangleAlert } from '@lucide/svelte';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import { whatsappNumber } from '$lib/phone';

	const err = $derived(page.error);
	const business = $derived(err?.business);
	const number = $derived(whatsappNumber(business?.phone || ''));
	const askText = $derived(`Hi ${business?.name || ''}, my private ${err?.kind === 'staff' ? 'work ' : ''}link isn't working any more. Please send me a new one. Thank you.`);
	const askUrl = $derived(number ? `https://wa.me/${number}?text=${encodeURIComponent(askText)}` : '');
</script>

<svelte:head><title>{err?.linkReplaced ? 'Link replaced' : 'Page unavailable'}{business?.name ? ` — ${business.name}` : ''}</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<main class="link-error">
	<section class="card">
		{#if business}
			<div class="brand">{#if business.logoUrl}<img src={business.logoUrl} alt="" />{:else}<span class="initials">{business.name.slice(0, 2).toUpperCase()}</span>{/if}<strong>{business.name}</strong></div>
		{/if}
		{#if err?.linkReplaced}
			<span class="icon"><Link2Off size={26} /></span>
			<h1>This link was replaced or has expired</h1>
			<p>For your privacy, {business?.name || 'the business'} has made a new private link for you. Ask them to send it. Nothing has been lost. Everything is still there in your new link.</p>
			<div class="actions">
				{#if askUrl}<a class="primary" href={askUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={18} />Ask for a new link on WhatsApp</a>{/if}
				{#if business?.phone}<a class="secondary" href={`tel:${business.phone}`}><Phone size={16} />Call {business.phone}</a>{/if}
				{#if !business?.phone}<p class="small">Please contact {business?.name || 'the business'} for a new link.</p>{/if}
			</div>
		{:else}
			<span class="icon warn"><TriangleAlert size={26} /></span>
			<h1>This page isn't available</h1>
			<p>{err?.message || 'Something went wrong.'}</p>
		{/if}
	</section>
</main>

<style>
	.link-error { min-height: 100svh; display: grid; place-items: center; padding: 32px 16px; box-sizing: border-box; background: var(--bg, #f8fafc); }
	.card { width: min(440px, 100%); box-sizing: border-box; display: grid; justify-items: center; gap: 14px; padding: 32px 24px; border: 1px solid var(--line, #e2e8f0); border-radius: 20px; background: var(--card, #fff); color: var(--theme-text, #0f172a); text-align: center; box-shadow: 0 24px 60px #0f172a14; }
	.brand { display: flex; align-items: center; gap: 10px; font-size: 15px; }
	.brand img { width: 36px; height: 36px; border-radius: 10px; object-fit: contain; }
	.initials { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; background: var(--theme-soft, #f1f5f9); font-size: 13px; font-weight: 700; }
	.icon { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; background: color-mix(in srgb, var(--purple, #0f766e) 12%, transparent); color: var(--purple, #0f766e); }
	.icon.warn { background: #fef3c7; color: #b45309; }
	h1 { margin: 0; font-size: 22px; line-height: 1.3; }
	p { margin: 0; color: var(--muted, #64748b); font-size: 15px; line-height: 1.55; }
	.actions { display: grid; gap: 10px; width: 100%; margin-top: 6px; }
	.primary, .secondary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; padding: 0 16px; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none; }
	.actions a.primary { background: #16a34a; color: #fff; border: 0; }
	.actions a.secondary { border: 1px solid var(--line, #e2e8f0); background: var(--card, #fff); color: var(--theme-text, #0f172a); }
	.small { font-size: 14px; }
</style>
