<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%237C5CFC%22/><path d=%22M18 20h29v8H27v5h17v8H27v15h-9z%22 fill=%22white%22/></svg>" />
	<meta name="theme-color" content="#0F1115" />
	<meta
		name="description"
		content="StudioFlow is a lightweight workflow system that manages editing work from customer to editor to delivery."
	/>
	<meta name="application-name" content="StudioFlow" />
	<meta name="robots" content="index, follow" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="StudioFlow" />
	<meta property="og:title" content="StudioFlow — Editing studio workflow" />
	<meta
		property="og:description"
		content="Manage customers, editing orders, editors, invoices and delivery in one focused workflow."
	/>
	<meta property="og:url" content="https://editing-lab-new.vercel.app" />
	<meta property="og:image" content="https://editing-lab-new.vercel.app/studioflow-preview.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="StudioFlow orders workspace in dark mode" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="StudioFlow — Editing studio workflow" />
	<meta
		name="twitter:description"
		content="A lightweight workflow system for editing studios."
	/>
	<meta name="twitter:image" content="https://editing-lab-new.vercel.app/studioflow-preview.png" />
	<link rel="canonical" href="https://editing-lab-new.vercel.app" />
</svelte:head>
{@render children()}
