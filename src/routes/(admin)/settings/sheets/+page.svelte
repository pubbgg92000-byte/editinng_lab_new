<script lang="ts">
	import { ArrowLeft, RefreshCw, Sheet, CircleAlert } from 'lucide-svelte';
	let { data } = $props();
	let active = $state('Customers');
	const selected = $derived(data.sheets.find((sheet) => sheet.name === active) ?? data.sheets[0]);
</script>

<svelte:head><title>Sheets data — StudioFlow</title></svelte:head>

<div class="sheet-heading">
	<div><a href="/settings"><ArrowLeft size={14}/> Settings</a><h1>Google Sheets data</h1><p>View every table used by the StudioFlow workflow.</p></div>
	<button class="secondary" onclick={() => location.reload()}><RefreshCw size={13}/> Refresh</button>
</div>

<div class:live={data.live} class="mode-notice">
	{#if data.live}<Sheet size={14}/><span><strong>Live Google Sheets</strong> — showing synchronized spreadsheet data.</span>{:else}<CircleAlert size={14}/><span><strong>Demo data</strong> — add Google Sheets credentials to show your real spreadsheet here.</span>{/if}
</div>

<div class="sheet-tabs" role="tablist" aria-label="Google Sheets tables">
	{#each data.sheets as sheet}<button class:active={active === sheet.name} onclick={() => (active = sheet.name)}>{sheet.name}<span>{sheet.rows.length}</span></button>{/each}
</div>

<div class="card table-wrap sheet-table">
	<table class="data-table">
		<thead><tr>{#each selected.columns as column}<th>{column}</th>{/each}</tr></thead>
		<tbody>{#each selected.rows as row}<tr>{#each selected.columns as _, index}<td>{row[index] ?? '—'}</td>{/each}</tr>{:else}<tr><td colspan={selected.columns.length}>No rows in this sheet yet.</td></tr>{/each}</tbody>
	</table>
</div>

<style>
	.sheet-heading{display:flex;align-items:end;justify-content:space-between;margin-bottom:22px}.sheet-heading a{display:flex;align-items:center;gap:6px;color:#778294;font-size:10px;margin-bottom:13px}.sheet-heading h1{font-size:25px;letter-spacing:-.035em;margin:0}.sheet-heading p{color:#6f7a8b;font-size:10px;margin:7px 0 0}.sheet-heading button{display:flex;align-items:center;gap:7px}.mode-notice{display:flex;align-items:center;gap:9px;border:1px solid #eab30838;background:#eab3080c;color:#c9ad54;border-radius:8px;padding:11px 13px;font-size:9px;margin-bottom:16px}.mode-notice strong{color:#dfc56c}.mode-notice.live{border-color:#22c55e38;background:#22c55e0c;color:#76d498}.mode-notice.live strong{color:#8ee3ad}.sheet-tabs{display:flex;gap:5px;overflow:auto;padding-bottom:10px}.sheet-tabs button{display:flex;align-items:center;gap:7px;white-space:nowrap;border:1px solid #2c3039;background:#15181e;color:#778294;border-radius:7px;padding:7px 10px;font-size:9px}.sheet-tabs button span{display:grid;place-items:center;min-width:17px;height:17px;border-radius:10px;background:#242832;color:#8b95a5;font-size:8px}.sheet-tabs button.active{border-color:#57478d;background:#211d31;color:#c4b7fa}.sheet-tabs button.active span{background:#342b50;color:#c4b7fa}.sheet-table{max-height:560px}.sheet-table td{white-space:nowrap}.sheet-table td:first-child{color:#f1f3f6;font-weight:560}@media(max-width:600px){.sheet-heading{align-items:start}.sheet-heading button{font-size:0}.sheet-tabs{margin-right:-20px}}
</style>
