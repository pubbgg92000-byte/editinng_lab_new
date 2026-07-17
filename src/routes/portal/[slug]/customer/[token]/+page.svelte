<script lang="ts">
	import CustomerPortal from '../../../../customer/[token]/+page.svelte';
	let { data } = $props();
</script>
<CustomerPortal {data}/>
