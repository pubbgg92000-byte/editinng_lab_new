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
	<link rel="icon" type="image/png" href="/anjana-creations-logo.png" />
	<link rel="apple-touch-icon" href="/anjana-creations-logo.png" />
	<meta name="theme-color" content="#0F1115" media="(prefers-color-scheme: dark)" />
	<meta name="theme-color" content="#F8FAFC" media="(prefers-color-scheme: light)" />
	<meta
		name="description"
		content="Anjana Creations manages customer projects, editing assignments, billing and delivery in one focused workflow."
	/>
	<meta name="application-name" content="Anjana Creations" />
	<meta name="robots" content="index, follow" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Anjana Creations" />
	<meta property="og:title" content="Anjana Creations — Editing studio workflow" />
	<meta
		property="og:description"
		content="Manage customers, editing orders, editors, invoices and delivery in one focused workflow."
	/>
	<meta property="og:url" content="https://editing-lab-new.vercel.app" />
	<meta property="og:image" content="https://editing-lab-new.vercel.app/anjana-creations-logo-social-v3.png" />
	<meta property="og:image:secure_url" content="https://editing-lab-new.vercel.app/anjana-creations-logo-social-v3.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Anjana Creations gold logo on a deep navy background" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Anjana Creations — Editing studio workflow" />
	<meta
		name="twitter:description"
		content="A lightweight workflow system for editing studios."
	/>
	<meta name="twitter:image" content="https://editing-lab-new.vercel.app/anjana-creations-logo-social-v3.png" />
	<meta name="twitter:image:alt" content="Anjana Creations gold logo on a deep navy background" />
	<link rel="canonical" href="https://editing-lab-new.vercel.app" />
</svelte:head>
{@render children()}
