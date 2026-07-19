<!-- Reusable admin page title, eyebrow text, and primary action button. -->
<script lang="ts">
	let { title, eyebrow, action = '', onclick = undefined }: { title: string; eyebrow?: string; action?: string; onclick?: () => void } = $props();
</script>
<header class="page-header"><div>{#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}<h1>{title}</h1></div>{#if action}<button class="primary" onclick={onclick}>+&nbsp; {action}</button>{/if}</header>
