<!-- Displays a consistent color-coded order/task workflow status. -->
<script lang="ts">
	import { page } from '$app/state';
	import { statusFor } from '$lib/capabilities';
	let { status }: { status: string } = $props();
	const presentation = $derived(statusFor(page.data.configuration?.profile, status));
	const tone = $derived(presentation.tone);
</script>
<span class="badge" class:green={tone === 'green'} class:purple={tone === 'purple'} class:blue={tone === 'blue'} class:amber={tone === 'amber'} class:red={tone === 'red'}><span class="dot"></span>{presentation.label}</span>
