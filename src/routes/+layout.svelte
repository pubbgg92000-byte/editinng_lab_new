<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { applyTheme, getStoredTheme } from '$lib/theme';

	let { children, data } = $props();
	onMount(() => applyTheme(getStoredTheme(data.settings.themePalette, data.settings.themeDefaultMode)));
</script>

<svelte:head>
	<script>
		try {
			const palette = localStorage.getItem('studioflow_palette') || 'graphite-aqua';
			const theme = ['midnight-violet', 'obsidian-blue', 'heritage-sage', 'merlot-copper', 'citrus-evergreen', 'graphite-coral'].includes(palette) ? 'dark' : 'light';
			document.documentElement.dataset.theme = theme;
			document.documentElement.dataset.palette = palette;
			document.documentElement.style.colorScheme = theme;
		} catch {
			document.documentElement.dataset.theme = 'light';
			document.documentElement.dataset.palette = 'graphite-aqua';
			document.documentElement.style.colorScheme = 'light';
		}
	</script>
	<link rel="icon" href={data.settings.logoUrl || '/studioflow.svg'} />
	<link rel="apple-touch-icon" href={data.settings.logoUrl || '/studioflow.svg'} />
	<meta name="theme-color" content="#0F1115" media="(prefers-color-scheme: dark)" />
	<meta name="theme-color" content="#F8FAFC" media="(prefers-color-scheme: light)" />
	<meta name="description" content="StudioFlow manages customers, editing assignments, billing and delivery in one focused workflow." />
	<meta name="application-name" content="StudioFlow" />
	<meta name="robots" content="noindex, nofollow" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="StudioFlow" />
	<meta property="og:title" content="StudioFlow — Editing studio workflow" />
	<meta
		property="og:description"
		content="Manage customers, editing orders, editors, invoices and delivery in one focused workflow."
	/>
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="StudioFlow — Editing studio workflow" />
	<meta
		name="twitter:description"
		content="A lightweight workflow system for editing studios."
	/>
</svelte:head>
{@render children()}
