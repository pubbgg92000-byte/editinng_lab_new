<!-- Tenant-scoped route that reuses the shared customer portal page. -->
<script lang="ts">
	import CustomerPortal from '../../../../customer/[token]/+page.svelte';
	let { data } = $props();
</script>
<CustomerPortal {data}/>
