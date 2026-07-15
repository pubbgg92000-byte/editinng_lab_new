<script lang="ts">
	import Modal from './Modal.svelte';
	let { open = $bindable(), onsaved = () => {} }: { open: boolean; onsaved?: () => void } = $props();
	let project = $state('');
	function save() { if (!project.trim()) return; open = false; onsaved(); project = ''; }
</script>
<Modal title="Create new order" bind:open>
	<div class="form-grid">
		<div class="field"><label for="customer">Customer</label><select id="customer"><option>Rahul Photography</option><option>AM Studios</option><option>Frame House</option></select></div>
		<div class="field"><label for="project">Project name</label><input id="project" bind:value={project} placeholder="e.g. Neha Wedding" /></div>
		<div class="field"><label for="work">Work type</label><select id="work"><option>Photo editing</option><option>Video editing</option><option>Album design</option><option>Retouching</option></select></div>
		<div class="field"><label for="date">Delivery date</label><input id="date" type="date" /></div>
		<div class="field"><label for="files">Number of files</label><input id="files" type="number" placeholder="0" /></div>
		<div class="field"><label for="price">Price (₹)</label><input id="price" type="number" placeholder="0" /></div>
	</div>
	<div class="field note"><label for="instructions">Special instructions</label><textarea id="instructions" placeholder="Editing style, reference links, delivery notes..."></textarea></div>
	{#snippet footer()}<button class="secondary" onclick={() => (open = false)}>Cancel</button><button class="primary" onclick={save}>Create order</button>{/snippet}
</Modal>
<style>.note{margin-top:18px}</style>
