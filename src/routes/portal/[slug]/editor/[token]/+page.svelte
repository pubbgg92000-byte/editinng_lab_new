<!-- Tenant-scoped route that reuses the shared editor work portal. -->
<script lang="ts">
	import EditorPortal from '../../../../editor/[token]/+page.svelte';
	let { data } = $props();
</script>
<EditorPortal {data}/>
