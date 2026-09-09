<script lang="ts">
	import { CheckCircle2, LoaderCircle, TriangleAlert, X } from '@lucide/svelte';
	import { actionFeedback, dismissActionNotice } from '$lib/stores/actionFeedback';
</script>

{#if $actionFeedback.loading}
	<div class="action-loader" role="status" aria-live="polite">
		<span></span>
		<div><LoaderCircle size={14}/><strong>{$actionFeedback.label}</strong></div>
	</div>
{/if}

{#if $actionFeedback.notice}
	<div class:error={$actionFeedback.notice.type === 'error'} class="action-notice" role={$actionFeedback.notice.type === 'error' ? 'alert' : 'status'}>
		{#if $actionFeedback.notice.type === 'error'}<TriangleAlert size={16}/>{:else}<CheckCircle2 size={16}/>{/if}
		<span>{$actionFeedback.notice.message}</span>
		<button type="button" aria-label="Dismiss notification" onclick={() => dismissActionNotice($actionFeedback.notice?.id)}><X size={14}/></button>
	</div>
{/if}

<style>
	.action-loader{position:fixed;z-index:3000;inset:0 0 auto;pointer-events:none}.action-loader>span{display:block;width:34%;height:3px;border-radius:0 99px 99px 0;background:linear-gradient(90deg,var(--purple),#22c55e,var(--purple));background-size:220% 100%;box-shadow:0 0 16px color-mix(in srgb,var(--purple) 55%,transparent);animation:action-progress 1.1s ease-in-out infinite}.action-loader>div{position:absolute;top:12px;left:50%;display:flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid var(--line);border-radius:999px;background:color-mix(in srgb,var(--card) 94%,transparent);color:var(--theme-text);box-shadow:0 12px 34px #0f172a24;backdrop-filter:blur(14px);font-size:9px;transform:translateX(-50%)}.action-loader :global(svg){color:var(--purple);animation:action-spin .8s linear infinite}.action-notice{position:fixed;z-index:3001;top:78px;right:20px;width:min(390px,calc(100vw - 28px));box-sizing:border-box;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;padding:12px 13px;border:1px solid color-mix(in srgb,#10b981 45%,var(--line));border-radius:12px;background:color-mix(in srgb,var(--card) 94%,#10b981 6%);color:#047857;box-shadow:0 20px 55px #0f172a29;backdrop-filter:blur(14px);font-size:10px;line-height:1.45;animation:action-notice-in .2s ease-out}.action-notice.error{border-color:color-mix(in srgb,#ef4444 48%,var(--line));background:color-mix(in srgb,var(--card) 94%,#ef4444 6%);color:#dc2626}.action-notice button{width:28px;height:28px;display:grid;place-items:center;padding:0;border:0;border-radius:8px;background:transparent;color:currentColor}.action-notice button:hover{background:color-mix(in srgb,currentColor 9%,transparent)}@keyframes action-progress{0%{width:8%;background-position:100% 0}55%{width:72%}100%{width:96%;background-position:0 0}}@keyframes action-spin{to{transform:rotate(360deg)}}@keyframes action-notice-in{from{opacity:0;transform:translateY(-8px) scale(.98)}}@media(max-width:620px){.action-loader>div{top:9px}.action-notice{top:70px;right:14px}}@media(prefers-reduced-motion:reduce){.action-loader>span,.action-loader :global(svg),.action-notice{animation:none}}
</style>
