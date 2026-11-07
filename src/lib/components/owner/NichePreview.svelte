<!-- Live preview of how a niche package's words, statuses, and fields look inside a workspace. -->
<script lang="ts">
	type Term = { singular: string; plural: string };
	type PreviewField = { label: string; entity: string };
	let { name = 'Your business', terms, statuses = {}, fields = [], features = [] }: {
		name?: string;
		terms: Record<string, Term>;
		statuses?: Record<string, string>;
		fields?: PreviewField[];
		features?: string[];
	} = $props();
	const t = (key: string, plural = false) => (plural ? terms[key]?.plural : terms[key]?.singular) || key;
	const orderFields = $derived(fields.filter((item) => item.entity === 'order' && item.label).slice(0, 3));
	const flow = $derived(['Received', 'Editing', 'Ready Delivery', 'Delivered'].map((key) => statuses[key] || key));
</script>

<div class="preview" aria-label="Preview of the workspace">
	<p class="caption">Preview</p>
	<div class="frame">
		<nav>
			<b>{name || 'Your business'}</b>
			<span class="on">Dashboard</span>
			<span>{t('order', true)}</span>
			<span>{t('customer', true)}</span>
			<span>{t('staff', true)}</span>
			<span>Invoices</span>
		</nav>
		<div class="body">
			<div class="head"><strong>New {t('order').toLowerCase()}</strong><span class="chip">{flow[0]}</span></div>
			<dl>
				<div><dt>{t('customer')}</dt><dd>Sample name</dd></div>
				<div><dt>{t('project')}</dt><dd>Sample</dd></div>
				<div><dt>{t('dueDate')}</dt><dd>12 Dec</dd></div>
				<div><dt>{t('staff')}</dt><dd>Not assigned</dd></div>
				{#each orderFields as item}<div><dt>{item.label}</dt><dd>—</dd></div>{/each}
			</dl>
			<ol class="flow">{#each flow as step}<li>{step}</li>{/each}</ol>
		</div>
	</div>
	{#if features.length}<p class="features"><b>Included:</b> {features.join(' · ')}</p>{/if}
</div>

<style>
	.preview { display: grid; gap: 8px; min-width: 0; }
	.caption { margin: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
	.frame { display: grid; grid-template-columns: minmax(96px, 32%) 1fr; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: var(--card); font-size: 12.5px; }
	nav { display: grid; align-content: start; gap: 2px; padding: 12px 8px; background: var(--theme-soft); border-right: 1px solid var(--line); min-width: 0; }
	nav b { padding: 0 6px 8px; font-size: 13px; overflow-wrap: anywhere; }
	nav span { padding: 6px; border-radius: 8px; color: var(--muted); overflow-wrap: anywhere; }
	nav span.on { background: var(--card); color: var(--theme-text); font-weight: 600; }
	.body { padding: 12px; display: grid; gap: 10px; align-content: start; min-width: 0; }
	.head { display: flex; justify-content: space-between; gap: 8px; align-items: center; flex-wrap: wrap; }
	.chip { padding: 2px 8px; border-radius: 999px; background: color-mix(in srgb, var(--purple) 12%, var(--card)); color: var(--theme-text); font-size: 11.5px; font-weight: 600; }
	dl { margin: 0; display: grid; gap: 6px; }
	dl div { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px dashed var(--line); padding-bottom: 4px; }
	dt { color: var(--muted); overflow-wrap: anywhere; }
	dd { margin: 0; text-align: right; }
	.flow { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 4px; }
	.flow li { padding: 2px 8px; border: 1px solid var(--line); border-radius: 999px; font-size: 11.5px; color: var(--muted); }
	.features { margin: 0; font-size: 12.5px; color: var(--muted); line-height: 1.5; }
	@container (max-width: 520px) { .frame { grid-template-columns: 1fr; } nav { display: flex; flex-wrap: wrap; gap: 4px; border-right: 0; border-bottom: 1px solid var(--line); } nav b { flex-basis: 100%; padding-bottom: 4px; } nav span { white-space: nowrap; padding: 4px 8px; } }
</style>
