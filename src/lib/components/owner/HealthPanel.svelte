<!-- Owner Health tab: checks every 15 s while open and keeps a short history in the browser (nothing is stored). -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { CheckCircle2, CircleAlert, CirclePause, ExternalLink, RefreshCw, TriangleAlert } from '@lucide/svelte';
	import HealthLine from './HealthLine.svelte';
	import HealthBars from './HealthBars.svelte';

	type Workspace = { id: string; name: string; slug: string; status: string; connectionStatus: string; activeSessions: number; ok: boolean; dbMs: number | null; error?: string; storage: { percent: number; usedMb: number; limitMb: number } | null; sync: { pending: number; oldest: string | null; attempts: number; lastError: string; lastSynced: string | null } | null; orders: number[]; payments: number[] };
	type Snapshot = { checkedAt: string; app: { commit: string; region: string; instanceStartedAt: string }; control: { ok: boolean; ms: number | null; error?: string }; days: string[]; workspaces: Workspace[] };
	type Level = 'good' | 'warning' | 'critical' | 'paused';

	const INTERVAL_MS = 15_000;
	const HISTORY = 40; // 10 minutes of checks
	const SERIES_COLORS = ['#eb6834', '#1baf7a', '#eda100', '#e87ba4']; // slot 1 (blue) is the main database
	const STATUS = { good: '#0ca30c', warning: '#fab219', critical: '#d03b3b', paused: '#94a3b8' } as const;

	let snapshot = $state<Snapshot | null>(null);
	let history = $state<{ t: string; values: Record<string, number | null> }[]>([]);
	let failed = $state('');
	let loading = $state(false);
	let chartWorkspace = $state('all');
	let timer: ReturnType<typeof setInterval> | undefined;

	const rupees = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
	const ago = (iso: string | null) => {
		if (!iso) return 'never';
		const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
		return minutes < 1 ? 'just now' : minutes < 60 ? `${minutes} min ago` : minutes < 1440 ? `${Math.round(minutes / 60)} h ago` : `${Math.round(minutes / 1440)} days ago`;
	};

	// One plain-language verdict per workspace; the first problem found wins.
	const verdict = (w: Workspace): { level: Level; text: string } => {
		if (w.status === 'suspended') return { level: 'paused', text: 'Paused by you' };
		if (!w.ok) return { level: 'critical', text: `Database not answering: ${w.error || 'unknown error'}` };
		if (w.storage && w.storage.percent >= 95) return { level: 'critical', text: 'Database storage is almost full' };
		if (w.sync?.lastError && w.sync.pending > 0) return { level: 'warning', text: `Google Sheet not updating: ${w.sync.lastError}` };
		if (w.storage && w.storage.percent >= 80) return { level: 'warning', text: 'Database storage is getting full' };
		if (w.sync && w.sync.pending > 0 && w.sync.oldest && Date.now() - Date.parse(w.sync.oldest) > 30 * 60_000) return { level: 'warning', text: `${w.sync.pending} changes waiting to reach the Google Sheet` };
		if (w.dbMs !== null && w.dbMs > 1500) return { level: 'warning', text: 'Database is slow right now' };
		if (w.status === 'draft') return { level: 'warning', text: 'Set up but not live yet' };
		return { level: 'good', text: 'Everything working' };
	};

	const verdicts = $derived(snapshot ? snapshot.workspaces.map((w) => ({ w, ...verdict(w) })) : []);
	const problems = $derived(verdicts.filter((v) => v.level === 'critical' || v.level === 'warning').length + (snapshot && !snapshot.control.ok ? 1 : 0));
	const overall = $derived<Level>(!snapshot ? 'paused' : !snapshot.control.ok || verdicts.some((v) => v.level === 'critical') ? 'critical' : problems ? 'warning' : 'good');
	const series = $derived(snapshot ? [{ id: 'control', label: 'Main database', color: '#2a78d6' }, ...snapshot.workspaces.slice(0, SERIES_COLORS.length).map((w, index) => ({ id: w.id, label: w.name, color: SERIES_COLORS[index] }))] : []);
	const today = $derived(snapshot ? snapshot.days.length - 1 : 0);
	const chosen = $derived(snapshot ? (chartWorkspace === 'all' ? snapshot.workspaces : snapshot.workspaces.filter((w) => w.id === chartWorkspace)) : []);
	const sumDays = (key: 'orders' | 'payments') => (snapshot ? snapshot.days.map((_, index) => chosen.reduce((sum, w) => sum + w[key][index], 0)) : []);
	const ordersByDay = $derived(sumDays('orders'));
	const paymentsByDay = $derived(sumDays('payments'));

	async function check() {
		if (loading || document.visibilityState !== 'visible') return;
		loading = true;
		try {
			const response = await fetch('/owner/health', { headers: { accept: 'application/json' } });
			if (!response.ok || !response.headers.get('content-type')?.includes('json')) throw new Error(response.status === 200 ? 'Signed out. Sign in again.' : `Check failed (${response.status}).`);
			const next: Snapshot = await response.json();
			snapshot = next;
			failed = '';
			history = [...history, { t: next.checkedAt, values: { control: next.control.ms, ...Object.fromEntries(next.workspaces.map((w) => [w.id, w.dbMs])) } }].slice(-HISTORY);
		} catch (cause) {
			failed = cause instanceof Error ? cause.message : 'Check failed.';
		} finally {
			loading = false;
		}
	}

	const onVisible = () => { if (document.visibilityState === 'visible') check(); };
	onMount(() => {
		check();
		timer = setInterval(check, INTERVAL_MS);
		document.addEventListener('visibilitychange', onVisible);
	});
	onDestroy(() => {
		clearInterval(timer);
		if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisible);
	});
</script>

<div class="health-panel">
	<header class="head">
		<div class="verdict" style:--status={STATUS[overall]}>
			{#if overall === 'good'}<CheckCircle2 size={22} />{:else if overall === 'critical'}<CircleAlert size={22} />{:else if overall === 'warning'}<TriangleAlert size={22} />{:else}<CirclePause size={22} />{/if}
			<div>
				<h2>{!snapshot ? 'Checking…' : overall === 'good' ? 'All systems working' : `${problems} thing${problems === 1 ? '' : 's'} need${problems === 1 ? 's' : ''} attention`}</h2>
				<p>{snapshot ? `Last check ${new Date(snapshot.checkedAt).toLocaleTimeString()} · updates every 15 seconds` : 'Running the first check'}</p>
			</div>
		</div>
		<div class="head-actions">
			<button type="button" class="ghost" onclick={check} disabled={loading}><RefreshCw size={15} class={loading ? 'spin' : ''} />Check now</button>
			<a class="ghost" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer"><ExternalLink size={15} />Visitors (Vercel Analytics)</a>
		</div>
	</header>
	{#if failed}<p class="banner" role="alert"><TriangleAlert size={16} />{failed} Showing the last good result.</p>{/if}

	{#if snapshot}
		<section class="tiles">
			<div class="tile"><small>Main database</small><b style:color={snapshot.control.ok ? 'inherit' : STATUS.critical}>{snapshot.control.ok ? `${snapshot.control.ms} ms` : 'Not answering'}</b><em>{snapshot.control.ok ? 'Response time' : snapshot.control.error}</em></div>
			<div class="tile"><small>Workspaces working</small><b>{verdicts.filter((v) => v.level === 'good').length} / {verdicts.length}</b><em>{verdicts.filter((v) => v.level === 'paused').length} paused</em></div>
			<div class="tile"><small>Signed in now</small><b>{snapshot.workspaces.reduce((sum, w) => sum + w.activeSessions, 0)}</b><em>Admin sessions</em></div>
			<div class="tile"><small>Orders today</small><b>{snapshot.workspaces.reduce((sum, w) => sum + w.orders[today], 0)}</b><em>All workspaces</em></div>
			<div class="tile"><small>Payments today</small><b>{rupees(snapshot.workspaces.reduce((sum, w) => sum + w.payments[today], 0))}</b><em>All workspaces</em></div>
		</section>

		<section class="card">
			<div class="card-head"><h3>Database response time</h3><p>Lower is better. Under 300 ms feels instant; over 1500 ms feels slow.</p></div>
			<HealthLine {series} points={history} />
		</section>

		<section class="card">
			<div class="card-head"><h3>Workspaces</h3><p>One line per workspace. Green means nothing to do.</p></div>
			<ul class="ws-list">
				{#each verdicts as { w, level, text } (w.id)}
					<li class="ws" style:--status={STATUS[level]}>
						<div class="ws-top"><i class="light" aria-hidden="true"></i><div><b>{w.name}</b><span class="ws-verdict">{text}</span></div><span class="ws-ms">{w.dbMs !== null ? `${w.dbMs} ms` : '—'}</span></div>
						<div class="ws-facts">
							<div class="gauge-wrap">
								<small>Storage {w.storage ? `${w.storage.percent}% · ${w.storage.usedMb} of ${w.storage.limitMb} MB` : 'unknown'}</small>
								<div class="gauge" role="meter" aria-label={`${w.name} storage used`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={w.storage?.percent ?? 0}>
									<span class="fill" style:width={`${Math.min(100, w.storage?.percent ?? 0)}%`} style:background={!w.storage ? 'transparent' : w.storage.percent >= 95 ? STATUS.critical : w.storage.percent >= 80 ? STATUS.warning : w.storage.percent >= 60 ? '#86b6ef' : '#2a78d6'}></span>
									<i style:left="60%"></i><i style:left="80%"></i><i style:left="95%"></i>
								</div>
							</div>
							<span><small>Google Sheet</small>{!w.sync ? 'Unknown' : w.sync.pending === 0 ? `Up to date · ${ago(w.sync.lastSynced)}` : `${w.sync.pending} waiting · oldest ${ago(w.sync.oldest)}`}</span>
							<span><small>Signed in</small>{w.activeSessions}</span>
						</div>
					</li>
				{/each}
			</ul>
		</section>

		<section class="card">
			<div class="card-head row">
				<div><h3>Last 14 days</h3><p>New orders and money received, by day (India time).</p></div>
				<label class="pick">Workspace<select bind:value={chartWorkspace}><option value="all">All workspaces</option>{#each snapshot.workspaces as w}<option value={w.id}>{w.name}</option>{/each}</select></label>
			</div>
			<div class="two">
				<HealthBars days={snapshot.days} values={ordersByDay} label="New orders" color="#2a78d6" />
				<HealthBars days={snapshot.days} values={paymentsByDay} label="Payments received" color="#1baf7a" format={rupees} />
			</div>
		</section>

		<p class="foot">Version {snapshot.app.commit} · region {snapshot.app.region} · server started {ago(snapshot.app.instanceStartedAt)}. History is kept only while this page is open.</p>
	{/if}
</div>

<style>
	.health-panel { display: grid; gap: 16px; }
	.head { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; }
	.verdict { display: flex; align-items: center; gap: 12px; color: var(--status); }
	.verdict h2 { margin: 0; font-size: 19px; color: var(--theme-text, #0f172a); }
	.verdict p, .card-head p, .foot { margin: 2px 0 0; font-size: 13px; color: var(--muted, #64748b); }
	.head-actions { display: flex; flex-wrap: wrap; gap: 8px; }
	.ghost { display: inline-flex; align-items: center; gap: 7px; min-height: 38px; padding: 0 14px; border: 1px solid var(--line, #e2e8f0); border-radius: 10px; background: var(--card, #fff); color: var(--theme-text, #0f172a); font-size: 13.5px; font-weight: 600; text-decoration: none; cursor: pointer; }
	.ghost:disabled { opacity: 0.6; cursor: default; }
	.ghost :global(.spin) { animation: spin 1s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.banner { display: flex; align-items: center; gap: 8px; margin: 0; padding: 10px 12px; border-radius: 10px; background: #fef3c7; color: #92400e; font-size: 13.5px; }
	.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
	.tile { display: grid; gap: 2px; padding: 14px; border: 1px solid var(--line, #e2e8f0); border-radius: 14px; background: var(--card, #fff); }
	.tile small, .ws-facts small { font-size: 12px; color: var(--muted, #64748b); }
	.tile b { font-size: 24px; font-variant-numeric: tabular-nums; color: var(--theme-text, #0f172a); }
	.tile em { font-style: normal; font-size: 12px; color: var(--muted, #64748b); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.card { display: grid; gap: 14px; padding: 16px; border: 1px solid var(--line, #e2e8f0); border-radius: 16px; background: var(--card, #fff); min-width: 0; }
	.card-head h3 { margin: 0; font-size: 15.5px; color: var(--theme-text, #0f172a); }
	.card-head.row { display: flex; flex-wrap: wrap; gap: 10px; align-items: end; justify-content: space-between; }
	.pick { display: grid; gap: 4px; font-size: 12px; color: var(--muted, #64748b); }
	.pick select { min-height: 36px; padding: 0 10px; border: 1px solid var(--line, #e2e8f0); border-radius: 10px; background: var(--card, #fff); color: var(--theme-text, #0f172a); font-size: 13.5px; }
	.two { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
	.ws-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
	.ws { display: grid; gap: 10px; padding: 12px; border: 1px solid var(--line, #e2e8f0); border-left: 4px solid var(--status); border-radius: 12px; }
	.ws-top { display: flex; align-items: center; gap: 10px; }
	.ws-top > div { display: grid; min-width: 0; flex: 1; }
	.ws-top b { font-size: 14.5px; color: var(--theme-text, #0f172a); }
	.ws-verdict { font-size: 13px; color: var(--muted, #64748b); overflow-wrap: anywhere; }
	.light { width: 12px; height: 12px; flex: none; border-radius: 50%; background: var(--status); }
	.ws-ms { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--theme-text, #0f172a); }
	.ws-facts { display: grid; grid-template-columns: minmax(180px, 2fr) repeat(2, minmax(110px, 1fr)); gap: 12px; font-size: 13px; color: var(--theme-text, #0f172a); }
	.ws-facts > span { display: grid; gap: 2px; }
	.gauge-wrap { display: grid; gap: 5px; }
	.gauge { position: relative; height: 10px; border-radius: 6px; background: var(--theme-soft, #f1f5f9); overflow: hidden; }
	.gauge .fill { position: absolute; inset: 0 auto 0 0; border-radius: 6px; }
	.gauge i { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--card, #fff); }
	@media (max-width: 640px) { .ws-facts { grid-template-columns: 1fr 1fr; } .gauge-wrap { grid-column: 1 / -1; } }
</style>
