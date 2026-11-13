<!-- Global confirmation dialog driven by askConfirm() in $lib/stores/confirm. -->
<script lang="ts">
	import { tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { confirmState } from '$lib/stores/confirm';

	let typed = $state('');
	let dialog = $state<HTMLDivElement | null>(null);
	let previousFocus: Element | null = null;

	const current = $derived($confirmState);
	const canConfirm = $derived(!current.open || !current.requireText || typed.trim() === current.requireText);

	$effect(() => {
		if (current.open) {
			typed = '';
			if (!dialog?.contains(document.activeElement)) previousFocus = document.activeElement;
			tick().then(() => (dialog?.querySelector<HTMLElement>('input, .confirm-btn') ?? dialog)?.focus());
		}
	});

	function close(result: boolean) {
		if (!current.open) return;
		if (result && !canConfirm) return;
		const resolve = current.resolve;
		confirmState.set({ open: false });
		resolve(result);
		if (previousFocus instanceof HTMLElement) previousFocus.focus();
	}

	// The page that asked is gone after a page change (e.g. browser Back): answer "No" instead of
	// leaving the question on top of a different page with its caller waiting forever.
	afterNavigate((navigation) => { if (navigation.type !== 'enter') close(false); });

	function onKeydown(event: KeyboardEvent) {
		if (!current.open) return;
		if (event.key === 'Escape') { event.preventDefault(); close(false); }
		if (event.key === 'Tab' && dialog) {
			// Keep keyboard focus inside the dialog.
			const items = [...dialog.querySelectorAll<HTMLElement>('button, input')].filter((el) => !el.hasAttribute('disabled'));
			if (!items.length) return;
			const first = items[0], last = items[items.length - 1];
			if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
			else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if current.open}
	<div class="confirm-backdrop" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) close(false); }}>
		<div class="confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" tabindex="-1" bind:this={dialog}>
			<h2 id="confirm-title">{current.title || 'Please confirm'}</h2>
			<p id="confirm-message">{current.message}</p>
			{#if current.requireText}
				<label class="type-field">
					<span>Type <b>{current.requireText}</b> to confirm</span>
					<input bind:value={typed} autocomplete="off" spellcheck="false" onkeydown={(event) => { if (event.key === 'Enter') close(true); }} />
				</label>
			{/if}
			<div class="actions">
				<button type="button" class="cancel-btn" onclick={() => close(false)}>{current.cancelLabel || 'Cancel'}</button>
				<button type="button" class="confirm-btn" class:danger={current.danger} disabled={!canConfirm} onclick={() => close(true)}>{current.confirmLabel || 'Confirm'}</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.confirm-backdrop { position: fixed; inset: 0; z-index: 3000; display: grid; place-items: center; padding: 16px; background: #0f172a8c; }
	.confirm { width: min(440px, 100%); box-sizing: border-box; padding: 22px; border-radius: 16px; background: var(--card, #fff); color: var(--theme-text, #0f172a); box-shadow: 0 24px 60px #0f172a40; outline: none; }
	h2 { margin: 0 0 8px; font-size: 18px; font-weight: 700; }
	p { margin: 0; font-size: 14.5px; line-height: 1.55; color: var(--muted, #475569); white-space: pre-line; }
	.type-field { display: grid; gap: 6px; margin-top: 14px; font-size: 13.5px; }
	.type-field input { height: 44px; padding: 0 12px; border: 1px solid var(--line, #cbd5e1); border-radius: 10px; background: var(--card, #fff); color: inherit; font-size: 16px; }
	.actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; flex-wrap: wrap; }
	.actions button { min-height: 42px; padding: 0 16px; border-radius: 10px; font-size: 14px; font-weight: 650; cursor: pointer; }
	.cancel-btn { border: 1px solid var(--line, #cbd5e1); background: transparent; color: inherit; }
	.confirm-btn { border: 0; background: var(--purple, #334155); color: var(--accent-text, #fff); }
	.confirm-btn.danger { background: #b91c1c; color: #fff; }
	.confirm-btn:disabled { opacity: .5; cursor: not-allowed; }
</style>
