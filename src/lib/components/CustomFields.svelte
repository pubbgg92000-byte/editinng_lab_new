<script lang="ts">
	import type { CustomFieldDefinition, CustomFieldEntity, CustomFieldValue } from '$lib/types';
	import RequiredMark from '$lib/components/RequiredMark.svelte';

	let {
		definitions,
		entity,
		values = $bindable({}),
		surface = 'admin'
	}: {
		definitions: CustomFieldDefinition[];
		entity: CustomFieldEntity;
		values: Record<string, CustomFieldValue>;
		surface?: 'admin' | 'customerPortal' | 'staffPortal';
	} = $props();

	const fields = $derived(definitions.filter((field) => field.active && field.entity === entity && field.visibility[surface]).sort((left, right) => left.order - right.order));
</script>

{#if fields.length}
	<div class="custom-field-grid">
		{#each fields as field}
			<div class:wide={field.type === 'textarea'} class="field">
				<label for={`custom-${entity}-${field.key}`}>{field.label}{#if field.required}<RequiredMark/>{/if}</label>
				{#if field.type === 'textarea'}
					<textarea id={`custom-${entity}-${field.key}`} bind:value={values[field.key]} required={field.required} aria-required={field.required}></textarea>
				{:else if field.type === 'select'}
					<select id={`custom-${entity}-${field.key}`} bind:value={values[field.key]} required={field.required} aria-required={field.required}><option value="">Choose {field.label.toLowerCase()}</option>{#each field.options || [] as option}<option value={option}>{option}</option>{/each}</select>
				{:else if field.type === 'checkbox'}
					<label class="check"><input id={`custom-${entity}-${field.key}`} type="checkbox" checked={values[field.key] === true} onchange={(event) => values[field.key] = event.currentTarget.checked}/><span>Yes</span></label>
				{:else}
					<input id={`custom-${entity}-${field.key}`} type={field.type === 'datetime' ? 'datetime-local' : field.type} bind:value={values[field.key]} required={field.required} aria-required={field.required}/>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.custom-field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px;padding-top:18px;border-top:1px solid var(--line)}.wide{grid-column:1/-1}.check{height:42px;display:flex!important;align-items:center;gap:7px}.check input{width:auto}.check span{font-size:9px}@media(max-width:620px){.custom-field-grid{grid-template-columns:1fr}.wide{grid-column:auto}}
</style>
