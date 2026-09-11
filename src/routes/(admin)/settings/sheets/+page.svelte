<!-- Full-column mobile/desktop view of the tenant's Sheets and database records. -->
<script lang="ts">
	import { ArrowLeft, ArrowUpRight, RefreshCw, Sheet, CircleAlert, ExternalLink, Download, X, SlidersHorizontal } from '@lucide/svelte';
	import { labelFor } from '$lib/capabilities';
	let { data } = $props();
	let active = $state('Customers');
	const selected = $derived(data.sheets.find((sheet) => sheet.name === active) ?? data.sheets[0]);
	const isPhoneColumn = (column: string) => /phone|mobile|whatsapp/i.test(column);

	// ---- Month abbreviation map for parsing DD-MMM-YYYY dates from Google Sheets ----
	const monthAbbreviations: Record<string, string> = {
		jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
		jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12'
	};

	/**
	 * Parse a date value from Google Sheets into YYYY-MM-DD.
	 * Supports:
	 *   - DD-MMM-YYYY  (e.g. "09-sept-2026", "01-Oct-2026")
	 *   - ISO strings   (e.g. "2026-09-09T10:44:21.000Z")
	 *   - YYYY-MM-DD    (e.g. "2026-09-09")
	 * Returns empty string if unparseable.
	 */
	function parseSheetDate(raw: string): string {
		const value = raw.trim();
		if (!value) return '';

		// Try DD-MMM-YYYY or DD-MMM-YYYY (with optional time after space)
		const ddMmmYyyy = value.match(/^(\d{1,2})[\-\/\s]([\w]+)[\-\/\s](\d{4})/i);
		if (ddMmmYyyy) {
			const day = ddMmmYyyy[1].padStart(2, '0');
			const monthKey = ddMmmYyyy[2].toLowerCase().replace(/\.$/, '');
			const year = ddMmmYyyy[3];
			const month = monthAbbreviations[monthKey];
			if (month) return `${year}-${month}-${day}`;
		}

		// Try ISO or YYYY-MM-DD
		const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

		return '';
	}

	// ---- Orders filter state ----
	let filterMode = $state<'month' | 'range'>('month');
	let filterMonth = $state(new Date().toISOString().slice(0, 7));
	let filterFrom = $state('');
	let filterTo = $state('');
	let filtersActive = $state(false);

	// Find the date column index in the Orders sheet.
	// Prefer an exact "Date" column, then fall back to columns containing date-related keywords.
	// Exclude columns like "Due Date" or "Delivery Date" which are not the order creation date.
	const ordersDateCol = $derived(() => {
		if (active !== 'Orders') return -1;
		// First: exact match on "Date" (the column header written by the sync)
		const exactIdx = selected.columns.findIndex((c: string) => c.trim().toLowerCase() === 'date');
		if (exactIdx >= 0) return exactIdx;
		// Second: look for "Created At" or "Created Date" or "Received Date"
		const createdIdx = selected.columns.findIndex((c: string) => /^(created|received)\b/i.test(c.trim()));
		if (createdIdx >= 0) return createdIdx;
		// Third: broader fallback — any column containing "date" but not "due" or "delivery"
		return selected.columns.findIndex((c: string) => {
			const lower = c.trim().toLowerCase();
			if (/due|delivery/.test(lower)) return false;
			return /created|date|received/i.test(lower);
		});
	});

	// Filtered rows for display
	const displayRows = $derived(() => {
		if (active !== 'Orders' || !filtersActive) return selected.rows;
		const dateIdx = ordersDateCol();
		if (dateIdx < 0) return selected.rows;

		let from = '', to = '';
		if (filterMode === 'month' && filterMonth) {
			const [y, m] = filterMonth.split('-').map(Number);
			const last = new Date(y, m, 0).getDate();
			from = `${filterMonth}-01`;
			to = `${filterMonth}-${String(last).padStart(2, '0')}`;
		} else {
			from = filterFrom;
			to = filterTo;
		}

		return selected.rows.filter((row: string[]) => {
			const parsed = parseSheetDate(row[dateIdx] || '');
			if (!parsed) return false;
			if (from && parsed < from) return false;
			if (to && parsed > to) return false;
			return true;
		});
	});

	let downloadBusy = $state(false);

	const rows = $derived(active === 'Orders' ? displayRows() : selected.rows);

	function downloadExcel() {
		downloadBusy = true;
		const params = new URLSearchParams();
		if (filterMode === 'month' && filterMonth) {
			params.set('month', filterMonth);
		} else {
			if (filterFrom) params.set('dateFrom', filterFrom);
			if (filterTo) params.set('dateTo', filterTo);
		}
		window.location.assign(`/api/orders/export?${params.toString()}`);
		setTimeout(() => { downloadBusy = false; }, 2000);
	}
</script>

<svelte:head><title>Sheets data — NexaDesk</title></svelte:head>

<div class="sheet-heading">
	<div class="heading-copy"><a href="/settings"><ArrowLeft size={14}/> Back to settings</a><span class="eyebrow"><Sheet size={13}/> Data workspace</span><h1>Google Sheets data</h1><p>Browse the live tables behind your {labelFor(data.configuration?.profile, 'customer', true).toLowerCase()}, {labelFor(data.configuration?.profile, 'order', true).toLowerCase()}, {labelFor(data.configuration?.profile, 'staff', true).toLowerCase()}, billing, and business activity.</p></div>
	<div class="sheet-actions">{#if data.sheetUrl}<a class="secondary open-sheet" href={data.sheetUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={13}/> Open Google Sheet</a>{/if}<button class="secondary" onclick={() => location.reload()}><RefreshCw size={13}/> Refresh</button></div>
</div>

<div class:live={data.live} class="mode-notice">
	{#if data.live}<Sheet size={14}/><span><strong>Live Google Sheets</strong> — showing synchronized data from this tenant’s isolated workbook.</span>{:else}<CircleAlert size={14}/><span><strong>Sheet unavailable</strong> — no fallback data is shown; ask the NexaDesk owner to validate this tenant’s workbook connection.</span>{/if}
</div>

<div class="sheet-tabs" role="tablist" aria-label="Google Sheets tables">
	{#each data.sheets as sheet}<button class:active={active === sheet.name} onclick={() => { active = sheet.name; filtersActive = false; }}>{sheet.name}<span>{sheet.rows.length}</span></button>{/each}
</div>

{#if active === 'Orders'}
<div class="orders-filter-bar card">
	<div class="filter-bar-row">
		<div class="filter-bar-tabs">
			<button type="button" class:filter-tab-active={filterMode === 'month'} onclick={() => (filterMode = 'month')}>By month</button>
			<button type="button" class:filter-tab-active={filterMode === 'range'} onclick={() => (filterMode = 'range')}>Date range</button>
		</div>
		{#if filterMode === 'month'}
			<div class="filter-bar-field">
				<label for="sheets-filter-month">Month</label>
				<input id="sheets-filter-month" type="month" bind:value={filterMonth} />
			</div>
		{:else}
			<div class="filter-bar-field">
				<label for="sheets-filter-from">From</label>
				<input id="sheets-filter-from" type="date" bind:value={filterFrom} />
			</div>
			<div class="filter-bar-field">
				<label for="sheets-filter-to">To</label>
				<input id="sheets-filter-to" type="date" bind:value={filterTo} />
			</div>
		{/if}
		<button type="button" class="filter-apply" onclick={() => (filtersActive = true)}><SlidersHorizontal size={12} /> Apply filter</button>
		{#if filtersActive}<button type="button" class="filter-clear" onclick={() => (filtersActive = false)}><X size={12} /> Clear</button>{/if}
		<button type="button" class="filter-download" disabled={downloadBusy} onclick={downloadExcel}>
			{#if downloadBusy}<span class="dl-spinner"></span> Preparing…{:else}<Download size={13} /> Download Excel{/if}
		</button>
	</div>
</div>
{/if}

<div class="table-summary"><div><span>Current table</span><h2>{selected.name}</h2></div><p><strong>{rows.length}</strong> {rows.length === 1 ? 'record' : 'records'} {#if filtersActive && active === 'Orders'}<i></i> filtered from {selected.rows.length} total{:else}<i></i> Updated from the shared sheet{/if}</p></div>

<div class="card table-wrap sheet-table">
	<table class="data-table">
		<thead><tr>{#each selected.columns as column}<th class:phone-cell={isPhoneColumn(column)}>{column}</th>{/each}</tr></thead>
		<tbody>{#each rows as row, rowIndex}<tr>{#each selected.columns as column, index}<td class:phone-cell={isPhoneColumn(column)}>{#if selected.links?.[rowIndex]?.[index]}<a class="cell-link" href={selected.links[rowIndex][index]} title={`Open related ${column.toLowerCase()}`}><span>{row[index] || '—'}</span><ArrowUpRight size={12}/></a>{:else}<span class:empty-value={!row[index]}>{row[index] || '—'}</span>{/if}</td>{/each}</tr>{:else}<tr><td class="empty-table" colspan={selected.columns.length}>No records match these filters.</td></tr>{/each}</tbody>
	</table>
</div>

<style>
	.sheet-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:22px}.heading-copy>a{width:max-content;display:flex;align-items:center;gap:6px;color:var(--muted);font-size:9px;margin-bottom:17px;transition:color .18s ease,transform .18s ease}.heading-copy>a:hover{color:var(--purple);transform:translateX(-2px)}.heading-copy .eyebrow{display:flex;align-items:center;gap:6px;margin-bottom:7px;color:var(--purple);font-size:9px;font-weight:700;letter-spacing:.11em;text-transform:uppercase}.sheet-heading h1{font-size:27px;letter-spacing:-.04em;margin:0}.sheet-heading p{max-width:610px;color:var(--muted);font-size:10px;line-height:1.6;margin:7px 0 0}.sheet-actions{display:flex;align-items:center;gap:8px}.sheet-actions a,.sheet-actions button{display:flex;align-items:center;gap:7px;white-space:nowrap}.open-sheet{color:var(--purple)}.mode-notice{display:flex;align-items:center;gap:9px;border:1px solid #eab30838;background:#eab3080c;color:#c9ad54;border-radius:10px;padding:12px 14px;font-size:9px;line-height:1.55;margin-bottom:17px}.mode-notice strong{color:#dfc56c}.mode-notice.live{border-color:#22c55e38;background:#22c55e0c;color:#76d498}.mode-notice.live strong{color:#8ee3ad}.sheet-tabs{display:flex;gap:6px;overflow:auto;padding:1px 1px 13px}.sheet-tabs button{display:flex;align-items:center;gap:8px;white-space:nowrap;border:1px solid #2c3039;background:#15181e;color:#778294;border-radius:9px;padding:8px 11px;font-size:9px;font-weight:600;transition:border-color .18s ease,background .18s ease,color .18s ease,transform .18s ease}.sheet-tabs button:hover{border-color:color-mix(in srgb,var(--purple) 45%,var(--line));color:var(--theme-text);transform:translateY(-1px)}.sheet-tabs button span{display:grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:#242832;color:#8b95a5;font-size:8px}.sheet-tabs button.active{border-color:var(--purple);background:color-mix(in srgb,var(--purple) 15%,var(--card));color:color-mix(in srgb,var(--purple) 55%,#fff)}.sheet-tabs button.active span{background:var(--purple);color:#fff}.table-summary{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:8px 2px 12px}.table-summary>div{display:flex;flex-direction:column;gap:3px}.table-summary span{color:var(--purple);font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.table-summary h2{margin:0;font-size:15px;letter-spacing:-.02em}.table-summary p{display:flex;align-items:center;gap:6px;margin:0;color:var(--muted);font-size:9px}.table-summary p strong{color:var(--theme-text);font-size:10px}.table-summary i{width:3px;height:3px;border-radius:50%;background:var(--purple)}.sheet-table{max-height:560px}.sheet-table th{position:sticky;top:0;z-index:2;min-width:110px;background:color-mix(in srgb,var(--card) 94%,var(--theme-soft));backdrop-filter:blur(10px)}.sheet-table td{min-width:110px;max-width:260px;white-space:normal;overflow-wrap:anywhere;word-break:break-word;vertical-align:top;line-height:1.6}.sheet-table td>span{display:block}.sheet-table td:first-child{min-width:135px;color:#f1f3f6;font-weight:620}.empty-value{color:var(--muted);opacity:.55}.empty-table{text-align:center!important;color:var(--muted)!important;padding:42px!important;font-weight:500!important}:global(html[data-theme="light"]) .heading-copy>a{color:#4f46e5}:global(html[data-theme="light"]) .sheet-heading h1{color:#0f172a;font-size:30px}:global(html[data-theme="light"]) .sheet-heading p{color:#64748b}:global(html[data-theme="light"]) .mode-notice{border-color:#f59e0b33;background:linear-gradient(135deg,#fffbeb,#ffffff);color:#b45309;border-radius:14px;box-shadow:0 10px 28px #f59e0b12}:global(html[data-theme="light"]) .mode-notice strong{color:#92400e}:global(html[data-theme="light"]) .mode-notice.live{border-color:#10b98133;background:linear-gradient(135deg,#ecfdf5,#ffffff);color:#047857}:global(html[data-theme="light"]) .mode-notice.live strong{color:#047857}:global(html[data-theme="light"]) .sheet-tabs{gap:8px}:global(html[data-theme="light"]) .sheet-tabs button{border-color:#dbeafe;background:#fff;color:#64748b;border-radius:12px;box-shadow:0 6px 16px #3b82f60b}:global(html[data-theme="light"]) .sheet-tabs button span{background:#eef2ff;color:#4f46e5}:global(html[data-theme="light"]) .sheet-tabs button:hover{border-color:#a5b4fc}:global(html[data-theme="light"]) .sheet-tabs button.active{border-color:#6366f1;background:linear-gradient(135deg,#6366f1,#3b82f6);color:#fff;box-shadow:0 12px 28px #6366f132}:global(html[data-theme="light"]) .sheet-tabs button.active span{background:#ffffff2b;color:#fff}:global(html[data-theme="light"]) .sheet-table th{background:#f8fafcee}:global(html[data-theme="light"]) .sheet-table td:first-child{color:#0f172a}@media(max-width:700px){.sheet-heading{align-items:flex-start}.sheet-actions{flex-direction:column;align-items:stretch}.sheet-actions a,.sheet-actions button{justify-content:center}.table-summary{align-items:flex-start;flex-direction:column;gap:7px}}@media(max-width:520px){.sheet-heading{flex-direction:column}.sheet-actions{width:100%;flex-direction:row}.sheet-actions a,.sheet-actions button{flex:1}.sheet-tabs{margin-right:-20px}.table-summary p{align-items:flex-start;flex-wrap:wrap}}
	.sheet-table .phone-cell{min-width:145px;white-space:nowrap;overflow-wrap:normal;word-break:normal}.cell-link{display:flex;align-items:flex-start;gap:6px;width:max-content;max-width:100%;color:var(--purple);font-weight:650;text-decoration:none}.cell-link span{min-width:0;overflow-wrap:anywhere}.cell-link :global(svg){flex:0 0 auto;margin-top:3px;opacity:.7;transition:transform .18s ease,opacity .18s ease}.cell-link:hover{text-decoration:underline;text-underline-offset:3px}.cell-link:hover :global(svg){opacity:1;transform:translate(2px,-2px)}.phone-cell .cell-link span{overflow-wrap:normal}
	.sheet-table{overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-inline:contain}.sheet-table table{width:max-content;min-width:100%}@media(max-width:520px){.sheet-table .data-table th,.sheet-table .data-table td{display:table-cell!important}.sheet-table::after{content:'Swipe sideways to view every column';position:sticky;left:12px;display:block;width:max-content;margin:8px 12px 10px;color:var(--muted);font-size:8px}}
	.orders-filter-bar{padding:12px 14px;margin-bottom:12px}
	.filter-bar-row{display:flex;align-items:end;gap:10px;flex-wrap:wrap}
	.filter-bar-tabs{display:flex;gap:4px}
	.filter-bar-tabs button{border:1px solid var(--line);background:transparent;border-radius:7px;padding:5px 11px;font-size:9px;cursor:pointer;color:var(--muted)}
	.filter-bar-tabs button.filter-tab-active{border-color:var(--purple);color:var(--purple);background:var(--theme-soft)}
	.filter-bar-field{display:flex;flex-direction:column;gap:3px;min-width:130px}
	.filter-bar-field label{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
	.filter-bar-field input{height:34px;border:1px solid var(--line);border-radius:7px;background:var(--bg);color:var(--theme-text);padding:0 9px;font-size:9px}
	.filter-apply,.filter-clear,.filter-download{height:34px;display:flex;align-items:center;gap:5px;border-radius:7px;padding:0 12px;font-size:9px;font-weight:600;cursor:pointer;white-space:nowrap}
	.filter-apply{border:1px solid var(--purple);background:var(--theme-soft);color:var(--purple)}
	.filter-clear{border:1px solid var(--line);background:transparent;color:var(--muted)}
	.filter-download{border:1px solid #16a34a;background:#dcfce7;color:#15803d}
	.filter-download:disabled{opacity:.6;cursor:default}
	.dl-spinner{width:11px;height:11px;border:2px solid #15803d44;border-top-color:#15803d;border-radius:50%;animation:dl-spin .7s linear infinite;display:inline-block}
	@keyframes dl-spin{to{transform:rotate(360deg)}}
</style>
