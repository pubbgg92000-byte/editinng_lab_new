<script lang="ts">
	let { status }: { status: string } = $props();
	const tone = $derived(status.includes('Completed') || status.includes('Paid') || status.includes('Ready') ? 'green' : status.includes('Review') || status.includes('Editing') || status.includes('progress') ? 'purple' : status.includes('Revision') || status.includes('Overdue') ? 'red' : 'gray');
</script>
<span class="badge" class:green={tone === 'green'} class:purple={tone === 'purple'} class:red={tone === 'red'}><span class="dot"></span>{status}</span>
