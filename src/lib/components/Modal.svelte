<script module lang="ts">
	type ModalLayer = {
		id: number;
		close: () => void;
		root: () => HTMLElement | undefined;
		setLayer: (top: boolean, index: number) => void;
		previousFocus: HTMLElement | null;
	};

	let nextModalId = 0;
	let modalLayers: ModalLayer[] = [];
	let originalBodyOverflow = '';
	let originalBodyPosition = '';
	let originalBodyTop = '';
	let lockedScrollY = 0;

	const focusableSelector = [
		'button:not([disabled]):not([tabindex="-1"])',
		'[href]',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])'
	].join(',');

	function focusFirst(layer: ModalLayer) {
		requestAnimationFrame(() => {
			const root = layer.root();
			const first = root?.querySelector<HTMLElement>(focusableSelector);
			(first ?? root)?.focus();
		});
	}

	function syncLayers() {
		modalLayers.forEach((layer, index) => layer.setLayer(index === modalLayers.length - 1, index));
	}

	function handleKeydown(event: KeyboardEvent) {
		const top = modalLayers.at(-1);
		if (!top) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			top.close();
			return;
		}
		if (event.key !== 'Tab') return;
		const root = top.root();
		if (!root) return;
		const focusable = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => element.offsetParent !== null);
		if (!focusable.length) {
			event.preventDefault();
			root.focus();
			return;
		}
		const first = focusable[0];
		const last = focusable.at(-1)!;
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	function registerLayer(layer: ModalLayer) {
		if (!modalLayers.length) {
			lockedScrollY = window.scrollY;
			originalBodyOverflow = document.body.style.overflow;
			originalBodyPosition = document.body.style.position;
			originalBodyTop = document.body.style.top;
			document.body.style.overflow = 'hidden';
			document.body.style.position = 'fixed';
			document.body.style.top = `-${lockedScrollY}px`;
			document.body.style.width = '100%';
			window.addEventListener('keydown', handleKeydown, true);
		}
		modalLayers = [...modalLayers, layer];
		syncLayers();
		focusFirst(layer);
	}

	function unregisterLayer(id: number) {
		const layer = modalLayers.find((item) => item.id === id);
		const wasTop = modalLayers.at(-1)?.id === id;
		modalLayers = modalLayers.filter((item) => item.id !== id);
		syncLayers();
		if (!modalLayers.length) {
			document.body.style.overflow = originalBodyOverflow;
			document.body.style.position = originalBodyPosition;
			document.body.style.top = originalBodyTop;
			document.body.style.width = '';
			window.scrollTo(0, lockedScrollY);
			window.removeEventListener('keydown', handleKeydown, true);
		}
		if (!wasTop) return;
		requestAnimationFrame(() => {
			if (layer?.previousFocus?.isConnected) layer.previousFocus.focus();
			else if (modalLayers.at(-1)) focusFirst(modalLayers.at(-1)!);
		});
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { X } from '@lucide/svelte';
	let { title, open = $bindable(), wide = false, children, footer }: { title: string; open: boolean; wide?: boolean; children: import('svelte').Snippet; footer?: import('svelte').Snippet } = $props();
	const modalId = ++nextModalId;
	let modalElement: HTMLElement | undefined = $state();
	let isTop = $state(false);
	let stackIndex = $state(0);

	$effect(() => {
		if (!browser || !open) return;
		registerLayer({
			id: modalId,
			close: () => (open = false),
			root: () => modalElement,
			setLayer: (top, index) => { isTop = top; stackIndex = index; },
			previousFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null
		});
		return () => unregisterLayer(modalId);
	});
</script>
{#if open}
	<div class="modal-layer" class:inactive={!isTop} style={`z-index:${80 + stackIndex * 2}`} inert={!isTop} aria-hidden={!isTop}>
		<button class="modal-backdrop" tabindex="-1" aria-label="Close dialog" onclick={() => { if (isTop) open = false; }}></button>
		<div bind:this={modalElement} class:wide class="modal" role="dialog" aria-modal={isTop ? 'true' : undefined} aria-label={title} tabindex="-1">
			<header><h2>{title}</h2><button class="icon-btn" aria-label="Close" onclick={() => (open = false)}><X size={18} /></button></header>
			<div class="modal-body">{@render children()}</div>
			{#if footer}<footer>{@render footer()}</footer>{/if}
		</div>
	</div>
{/if}
<style>
	.modal-layer{position:fixed;inset:0;pointer-events:none}.modal-layer.inactive{pointer-events:none}.modal-backdrop{position:absolute;inset:0;background:#05060aab;backdrop-filter:blur(3px);border:0;pointer-events:auto}.modal{position:absolute;z-index:1;top:50%;left:50%;transform:translate(-50%,-50%);width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 48px);overflow:auto;border:1px solid #333744;border-radius:13px;background:#171a21;box-shadow:0 25px 80px #0009;pointer-events:auto;transition:filter .16s ease,opacity .16s ease}.modal-layer.inactive .modal{filter:saturate(.65);opacity:.72}.modal.wide{width:min(760px,calc(100vw - 32px))}.modal header,.modal footer{display:flex;align-items:center;padding:17px 20px}.modal header{justify-content:space-between;border-bottom:1px solid #292d36}.modal footer{justify-content:flex-end;gap:9px;border-top:1px solid #292d36}.modal h2{font-size:14px;margin:0}.modal-body{padding:22px}.icon-btn{border:0;background:transparent;color:#8791a0;padding:4px;display:grid;place-items:center}:global(html[data-theme="light"]) .modal-backdrop{background:#0f172a52;backdrop-filter:blur(8px)}:global(html[data-theme="light"]) .modal{border-color:#dbeafe;border-radius:18px;background:#fffffff7;box-shadow:0 30px 90px #6366f12e,0 8px 30px #0f172a18}:global(html[data-theme="light"]) .modal header{border-bottom-color:#e2e8f0}:global(html[data-theme="light"]) .modal footer{border-top-color:#e2e8f0;background:linear-gradient(180deg,#ffffff,#f8fafc)}:global(html[data-theme="light"]) .modal h2{color:#0f172a;font-size:15px}:global(html[data-theme="light"]) .icon-btn{color:#64748b;border-radius:10px}:global(html[data-theme="light"]) .icon-btn:hover{background:#eef2ff;color:#4f46e5}
</style>
