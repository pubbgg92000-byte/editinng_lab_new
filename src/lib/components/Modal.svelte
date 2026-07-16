<script lang="ts">
	import { browser } from '$app/environment';
	import { X } from 'lucide-svelte';
	let { title, open = $bindable(), wide = false, children, footer }: { title: string; open: boolean; wide?: boolean; children: import('svelte').Snippet; footer?: import('svelte').Snippet } = $props();
	$effect(() => {
		if (!browser || !open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') open = false; };
		window.addEventListener('keydown', closeOnEscape);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', closeOnEscape);
		};
	});
</script>
{#if open}
	<button class="modal-backdrop" aria-label="Close dialog" onclick={() => (open = false)}></button>
	<div class:wide class="modal" role="dialog" aria-modal="true" aria-label={title}>
		<header><h2>{title}</h2><button class="icon-btn" aria-label="Close" onclick={() => (open = false)}><X size={18} /></button></header>
		<div class="modal-body">{@render children()}</div>
		{#if footer}<footer>{@render footer()}</footer>{/if}
	</div>
{/if}
<style>
	.modal-backdrop{position:fixed;inset:0;background:#05060aab;backdrop-filter:blur(3px);border:0;z-index:80}.modal{position:fixed;z-index:81;top:50%;left:50%;transform:translate(-50%,-50%);width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 48px);overflow:auto;border:1px solid #333744;border-radius:13px;background:#171a21;box-shadow:0 25px 80px #0009}.modal.wide{width:min(760px,calc(100vw - 32px))}.modal header,.modal footer{display:flex;align-items:center;padding:17px 20px}.modal header{justify-content:space-between;border-bottom:1px solid #292d36}.modal footer{justify-content:flex-end;gap:9px;border-top:1px solid #292d36}.modal h2{font-size:14px;margin:0}.modal-body{padding:22px}.icon-btn{border:0;background:transparent;color:#8791a0;padding:4px;display:grid;place-items:center}:global(html[data-theme="light"]) .modal-backdrop{background:#0f172a52;backdrop-filter:blur(8px)}:global(html[data-theme="light"]) .modal{border-color:#dbeafe;border-radius:18px;background:#fffffff7;box-shadow:0 30px 90px #6366f12e,0 8px 30px #0f172a18}:global(html[data-theme="light"]) .modal header{border-bottom-color:#e2e8f0}:global(html[data-theme="light"]) .modal footer{border-top-color:#e2e8f0;background:linear-gradient(180deg,#ffffff,#f8fafc)}:global(html[data-theme="light"]) .modal h2{color:#0f172a;font-size:15px}:global(html[data-theme="light"]) .icon-btn{color:#64748b;border-radius:10px}:global(html[data-theme="light"]) .icon-btn:hover{background:#eef2ff;color:#4f46e5}
</style>
