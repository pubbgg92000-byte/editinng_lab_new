<script lang="ts">
	import type { CustomFieldDefinition, CustomFieldEntity, CustomFieldValue } from '$lib/types';
	let { definitions, entity, values = {}, surface = 'admin' }: { definitions: CustomFieldDefinition[]; entity: CustomFieldEntity; values?: Record<string, CustomFieldValue>; surface?: 'admin' | 'customerPortal' | 'staffPortal' } = $props();
	const fields = $derived(definitions.filter((field) => field.active && field.entity === entity && field.visibility[surface] && values[field.key] !== undefined && values[field.key] !== null && values[field.key] !== ''));
	const display = (value: CustomFieldValue) => typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value ?? '');
</script>

{#if fields.length}
	<dl class="custom-values">
		{#each fields as field}<div><dt>{field.label}</dt><dd>{#if field.type === 'url'}<a href={String(values[field.key])} target="_blank" rel="noreferrer">Open link</a>{:else}{display(values[field.key])}{/if}</dd></div>{/each}
	</dl>
{/if}

<style>
	.custom-values{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0 0;padding-top:14px;border-top:1px solid var(--line)}.custom-values div{display:grid;gap:3px}.custom-values dt{font-size:7px;color:var(--muted)}.custom-values dd{margin:0;font-size:9px;overflow-wrap:anywhere}.custom-values a{color:var(--purple)}@media(max-width:520px){.custom-values{grid-template-columns:1fr}}
</style>
