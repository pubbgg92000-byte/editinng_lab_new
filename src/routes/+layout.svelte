<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%237C5CFC%22/><path d=%22M18 20h29v8H27v5h17v8H27v15h-9z%22 fill=%22white%22/></svg>" />
	<meta name="theme-color" content="#0F1115" />
</svelte:head>
{@render children()}
