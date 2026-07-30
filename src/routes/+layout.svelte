<!-- Global document title, favicon, tenant theme, and page rendering wrapper. -->
<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { applyTheme, getLastWorkspaceTheme, getStoredTheme } from '$lib/theme';
	import { hasCapability } from '$lib/capabilities';

	let { children, data } = $props();
	const displayName = $derived(hasCapability(data.configuration?.effectiveCapabilities, 'branding.whiteLabel') ? data.settings.studioName : 'NexaDesk');
	const displayLogo = $derived(hasCapability(data.configuration?.effectiveCapabilities, 'branding.whiteLabel') ? data.settings.logoUrl : '');
	const socialImage = $derived(`${data.appUrl}/nexadesk-social.png`);
	const siteDescription = 'Customer relationships, service workflows, team assignments, billing, portals, and delivery in one secure platform.';
	onMount(() => {
		const selection = data.useLastWorkspaceTheme
			? getLastWorkspaceTheme(data.settings.themePalette, data.settings.themeDefaultMode)
			: getStoredTheme(data.settings.themePalette, data.settings.themeDefaultMode, data.themeScope);
		applyTheme(selection, !data.useLastWorkspaceTheme, data.themeScope);
	});
</script>

<svelte:head>
	<meta name="studioflow-theme" content={`${data.themeScope}|${data.settings.themePalette}|${data.settings.themeDefaultMode}|${data.useLastWorkspaceTheme ? 'last' : 'current'}`} />
	<script>
		try {
			const config = document.querySelector('meta[name="studioflow-theme"]')?.getAttribute('content')?.split('|') || [];
			const savedScope = config[3] === 'last' ? localStorage.getItem('studioflow_last_workspace_scope') : '';
			const scope = encodeURIComponent(savedScope || config[0] || 'public');
			const palette = localStorage.getItem(`studioflow_palette:${scope}`) || config[1] || 'graphite-aqua';
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
	<link rel="icon" href={displayLogo || '/nexadesk.svg'} />
	<link rel="apple-touch-icon" href={displayLogo || '/nexadesk.svg'} />
	<link rel="canonical" href={data.pageUrl} />
	<meta name="theme-color" content="#0F1115" media="(prefers-color-scheme: dark)" />
	<meta name="theme-color" content="#F8FAFC" media="(prefers-color-scheme: light)" />
	<meta name="description" content={siteDescription} />
	<meta name="application-name" content="NexaDesk" />
	<meta name="robots" content="noindex, nofollow" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={displayName} />
	<meta property="og:title" content={displayName} />
	<meta property="og:description" content={siteDescription} />
	<meta property="og:url" content={data.pageUrl} />
	<meta property="og:image" content={socialImage} />
	<meta property="og:image:secure_url" content={socialImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="NexaDesk — universal business operations" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={displayName} />
	<meta name="twitter:description" content={siteDescription} />
	<meta name="twitter:image" content={socialImage} />
	<meta name="twitter:image:alt" content="NexaDesk — universal business operations" />
</svelte:head>
{@render children()}
