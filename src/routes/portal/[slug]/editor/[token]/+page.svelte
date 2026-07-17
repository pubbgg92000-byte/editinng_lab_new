<script lang="ts">
	import EditorPortal from '../../../../editor/[token]/+page.svelte';
	let { data } = $props();
</script>
<EditorPortal {data}/>
