<!-- Displays a consistent color-coded order/task workflow status. -->
<script lang="ts">
	let { status }: { status: string } = $props();
	const tone = $derived(status.includes('Completed') || status.includes('Delivered') || status.includes('Paid') || status.includes('Ready') ? 'green' : status.includes('Review') || status.includes('Editing') || status.includes('progress') ? 'purple' : status.includes('Assigned') || status.includes('Received') || status.includes('Files downloaded') ? 'blue' : status.includes('Not started') || status.includes('Waiting for clarification') ? 'amber' : status.includes('Revision') || status.includes('Overdue') || status.includes('Stopped') ? 'red' : 'gray');
</script>
<span class="badge" class:green={tone === 'green'} class:purple={tone === 'purple'} class:blue={tone === 'blue'} class:amber={tone === 'amber'} class:red={tone === 'red'}><span class="dot"></span>{status}</span>
