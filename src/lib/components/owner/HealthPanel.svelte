<!-- Owner Health tab: checks every 15 s while open and keeps a short history in the browser (nothing is stored). -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { CheckCircle2, CircleAlert, CirclePause, ExternalLink, Monitor, RefreshCw, Smartphone, TriangleAlert } from '@lucide/svelte';
	import HealthLine from './HealthLine.svelte';
	import HealthBars from './HealthBars.svelte';

	type Workspace = { id: string; name: string; slug: string; status: string; connectionStatus: string; activeSessions: number; ok: boolean; dbMs: number | null; error?: string; storage: { percent: number; usedMb: number; limitMb: number } | null; sync: { pending: number; oldest: string | null; attempts: number; lastError: string; lastSynced: string | null } | null; orders: number[]; payments: number[]; activity: { id: string; actor: string; action: string; kind: string; details: string; at: string }[] };
	type Session = { id: string; email: string; role: string; workspace: string; device: string; location: string; signedInAt: string; lastSeenAt: string; signedOutAt: string; signedOutReason: string };
	type Signin = { id: string; email: string; role: string; workspace: string; device: string; location: string; at: string };
	type Audit = { id: string; action: string; details: string; workspace: string; at: string };
	type Snapshot = { sessions: Session[]; signins: Signin[]; audit: Audit[]; checkedAt: string; app: { commit: string; region: string; instanceStartedAt: string }; control: { ok: boolean; ms: number | null; error?: string }; days: string[]; workspaces: Workspace[] };
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
		return minutes < 1 ? 'just now' : minutes < 60 ? `${minutes} min ago` : minutes < 1440 ? `${Math.round(minutes / 60)} h ago` : Math.round(minutes / 1440) === 1 ? '1 day ago' : `${Math.round(minutes / 1440)} days ago`;
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
	// "Active now" = used in the last 10 minutes (last active is recorded at most every 5 minutes).
	const activeNow = (iso: string) => Date.now() - Date.parse(iso) < 10 * 60_000;
	const isPhone = (device: string) => /iPhone|Android phone/.test(device);
	const roleLabel = (role: string) => (role === 'owner' ? 'Owner' : 'Admin');
	const when = (iso: string) => new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
	let view = $state<'system' | 'people'>('system');
	let showOlder = $state(false);
	const DAY_MS = 24 * 60 * 60_000;
	// One row per person (each login email), built from live sessions and sign-in history.
	let person = $state('all');
	const people = $derived.by(() => {
		if (!snapshot) return [];
		const map = new Map<string, { email: string; role: string; workspace: string; sessions: number; active: boolean; lastActive: string; device: string; location: string; signins: number }>();
		for (const g of snapshot.signins) {
			const row = map.get(g.email) || { email: g.email, role: g.role, workspace: g.workspace, sessions: 0, active: false, lastActive: '', device: g.device, location: g.location, signins: 0 };
			row.signins += 1;
			map.set(g.email, row);
		}
		for (const x of snapshot.sessions) {
			if (x.signedOutAt) continue;
			const row = map.get(x.email) || { email: x.email, role: x.role, workspace: x.workspace, sessions: 0, active: false, lastActive: '', device: '', location: '', signins: 0 };
			row.sessions += 1;
			if (activeNow(x.lastSeenAt)) row.active = true;
			if (x.lastSeenAt > row.lastActive) row.lastActive = x.lastSeenAt;
			if (!row.device && x.device) { row.device = x.device; row.location = x.location; }
			map.set(x.email, row);
		}
		return [...map.values()].sort((a, b) => b.lastActive.localeCompare(a.lastActive));
	});
	const chosenPerson = $derived(people.find((p) => p.email === person));
	// Signed-in sessions; signed-out ones are kept 5 days so they can be reviewed, then cleared automatically.
	let sessionFilter = $state<'in' | 'out' | 'all'>('in');
	const personSessions = $derived(snapshot ? snapshot.sessions.filter((x) => person === 'all' || x.email === person) : []);
	const mySessions = $derived(personSessions.filter((x) => !x.signedOutAt));
	const signedOut = $derived(personSessions.filter((x) => x.signedOutAt).sort((a, b) => b.signedOutAt.localeCompare(a.signedOutAt)));
	const mySignins = $derived(snapshot ? snapshot.signins.filter((g) => person === 'all' || g.email === person) : []);
	const recentSessions = $derived(mySessions.filter((x) => Date.now() - Date.parse(x.lastSeenAt) < DAY_MS));
	const olderCount = $derived(mySessions.length - recentSessions.length);
	const listed = $derived(sessionFilter === 'out' ? signedOut : sessionFilter === 'all' ? [...(showOlder ? mySessions : recentSessions), ...signedOut] : showOlder ? mySessions : recentSessions);
	const allFeed = $derived(snapshot ? [
		...snapshot.workspaces.flatMap((w) => w.activity.map((a) => ({ id: a.id, workspace: w.name, who: a.actor, what: a.action, details: a.details, at: a.at }))),
		...snapshot.audit.map((a) => ({ id: a.id, workspace: a.workspace || 'Platform', who: 'Owner', what: a.action, details: a.details, at: a.at }))
	].sort((a, b) => b.at.localeCompare(a.at)) : []);
	// Each workspace has one admin login, so a person's activity is their workspace's activity; the owner's is owner actions.
	const feed = $derived(allFeed.filter((a) => !chosenPerson || (chosenPerson.role === 'owner' ? a.who === 'Owner' : a.workspace === chosenPerson.workspace && a.who !== 'Owner')).slice(0, 25));
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
				<h2>{!snapshot ? (failed && !loading ? 'Check failed' : 'Checking…') : overall === 'good' ? 'All systems working' : `${problems} thing${problems === 1 ? '' : 's'} need${problems === 1 ? 's' : ''} attention`}</h2>
				<p>{snapshot ? `Last check ${new Date(snapshot.checkedAt).toLocaleTimeString()} · updates every 15 seconds` : failed && !loading ? 'Trying again every 15 seconds' : 'Running the first check'}</p>
			</div>
		</div>
		<div class="head-actions">
			<button type="button" class="ghost" onclick={check} disabled={loading}><RefreshCw size={15} class={loading ? 'spin' : ''} />Check now</button>
			<a class="ghost" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer"><ExternalLink size={15} />Visitors (Vercel Analytics)</a>
		</div>
	</header>
	{#if failed}<p class="banner" role="alert"><TriangleAlert size={16} />{failed}{snapshot ? ' Showing the last good result.' : ''}</p>{/if}

	{#if snapshot}
		<div class="views" role="tablist" aria-label="Health views">
			<button type="button" role="tab" aria-selected={view === 'system'} class:on={view === 'system'} onclick={() => (view = 'system')}>Overview</button>
			<button type="button" role="tab" aria-selected={view === 'people'} class:on={view === 'people'} onclick={() => (view = 'people')}>People &amp; activity <span>{snapshot.sessions.filter((s) => !s.signedOutAt && activeNow(s.lastSeenAt)).length} active</span></button>
		</div>

		{#if view === 'system'}
		<section class="tiles">
			<div class="tile"><small>Main database</small><b style:color={snapshot.control.ok ? 'inherit' : STATUS.critical}>{snapshot.control.ok ? `${snapshot.control.ms} ms` : 'Not answering'}</b><em>{snapshot.control.ok ? 'Response time' : snapshot.control.error}</em></div>
			<div class="tile"><small>Workspaces working</small><b>{verdicts.filter((v) => v.level === 'good').length} / {verdicts.length}</b><em>{verdicts.filter((v) => v.level === 'paused').length} paused</em></div>
			<div class="tile"><small>Signed in now</small><b>{snapshot.workspaces.reduce((sum, w) => sum + w.activeSessions, 0)}</b><em>Admin sessions</em></div>
			<div class="tile"><small>Orders today</small><b>{snapshot.workspaces.reduce((sum, w) => sum + w.orders[today], 0)}</b><em>All workspaces</em></div>
			<div class="tile"><small>Payments today</small><b>{rupees(snapshot.workspaces.reduce((sum, w) => sum + w.payments[today], 0))}</b><em>All workspaces</em></div>
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
			<div class="card-head"><h3>Database response time</h3><p>Lower is better. Under 300 ms feels instant; over 1500 ms feels slow.</p></div>
			<HealthLine {series} points={history} />
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

		{:else}
		<div class="person-bar">
			<label class="pick">Show<select bind:value={person}><option value="all">Everyone ({people.length})</option>{#each people as p (p.email)}<option value={p.email}>{p.email} · {p.workspace}</option>{/each}</select></label>
			{#if chosenPerson}<button type="button" class="ghost" onclick={() => (person = 'all')}>Back to everyone</button>{/if}
		</div>
		<section class="tiles">
			<div class="tile"><small>Active now</small><b>{mySessions.filter((x) => activeNow(x.lastSeenAt)).length}</b><em>Used in the last 10 minutes</em></div>
			<div class="tile"><small>Signed in</small><b>{mySessions.length}</b><em>Sessions not signed out</em></div>
			<div class="tile"><small>Sign-ins today</small><b>{mySignins.filter((g) => g.at.slice(0, 10) === snapshot!.checkedAt.slice(0, 10)).length}</b><em>{chosenPerson ? chosenPerson.workspace : 'All workspaces'}</em></div>
		</section>

		{#if !chosenPerson}
			<section class="card">
				<div class="card-head"><h3>People</h3><p>Everyone with a login. Pick one to see only their sign-ins, devices and activity.</p></div>
				<div class="table-scroll"><table class="people-table">
					<thead><tr><th>Person</th><th>Last active</th><th>Open sign-ins</th><th>Latest device</th><th>Sign-ins (90 days)</th><th></th></tr></thead>
					<tbody>{#each people as p (p.email)}<tr>
						<td><span class="who"><i class="dot" class:on={p.active} aria-hidden="true"></i><span><b>{p.email}</b><small>{roleLabel(p.role)} · {p.workspace}</small></span></span></td>
						<td>{p.active ? 'Active now' : p.lastActive ? ago(p.lastActive) : '—'}</td>
						<td>{p.sessions}</td>
						<td>{p.device ? `${p.device}${p.location ? ` · ${p.location}` : ''}` : 'Device unknown'}</td>
						<td>{p.signins}</td>
						<td><button type="button" class="ghost small-btn" onclick={() => (person = p.email)}>View</button></td>
					</tr>{/each}</tbody>
				</table></div>
			</section>
		{/if}

		<section class="card">
			<div class="card-head"><h3>{chosenPerson ? `${chosenPerson.email} — sessions` : 'Sessions'}</h3><p>A green dot means active in the last 10 minutes. Signed-out sessions are kept for 5 days, then cleared.</p></div>
			<div class="chips" role="tablist" aria-label="Session status">
				<button type="button" role="tab" aria-selected={sessionFilter === 'in'} class:on={sessionFilter === 'in'} onclick={() => (sessionFilter = 'in')}>Signed in <span>{mySessions.length}</span></button>
				<button type="button" role="tab" aria-selected={sessionFilter === 'out'} class:on={sessionFilter === 'out'} onclick={() => (sessionFilter = 'out')}>Signed out <span>{signedOut.length}</span></button>
				<button type="button" role="tab" aria-selected={sessionFilter === 'all'} class:on={sessionFilter === 'all'} onclick={() => (sessionFilter = 'all')}>All <span>{mySessions.length + signedOut.length}</span></button>
			</div>
			{#if personSessions.length}
				<div class="table-scroll"><table class="people-table">
					<thead><tr><th>Person</th><th>Status</th><th>Device</th><th>Location</th><th>Signed in</th><th>Last active</th></tr></thead>
					<tbody>{#each listed as s (s.id)}<tr>
						<td><span class="who"><i class="dot" class:on={!s.signedOutAt && activeNow(s.lastSeenAt)} aria-hidden="true"></i><span><b>{s.email}</b><small>{roleLabel(s.role)} · {s.workspace}</small></span></span></td>
						<td>{#if s.signedOutAt}<span class="pill out" title={s.signedOutReason}>Signed out · {ago(s.signedOutAt)}</span>{#if s.signedOutReason && s.signedOutReason !== 'Signed out'}<small class="reason">{s.signedOutReason}</small>{/if}{:else}<span class="pill in">Signed in</span>{/if}</td>
						<td><span class="dev">{#if isPhone(s.device)}<Smartphone size={15} />{:else}<Monitor size={15} />{/if}{s.device || 'Device unknown'}</span></td>
						<td>{s.location || '—'}</td>
						<td>{when(s.signedInAt)}</td>
						<td>{!s.signedOutAt && activeNow(s.lastSeenAt) ? 'Active now' : ago(s.lastSeenAt)}</td>
					</tr>{:else}<tr><td colspan="6" class="empty-row">{sessionFilter === 'out' ? 'No sign-outs in the last 5 days.' : 'Nobody used the app in the last 24 hours.'}</td></tr>{/each}</tbody>
				</table></div>
				{#if olderCount && sessionFilter !== 'out'}<button type="button" class="ghost more" onclick={() => (showOlder = !showOlder)}>{showOlder ? 'Hide older sessions' : `Show ${olderCount} older session${olderCount === 1 ? '' : 's'} (not used in 24 hours)`}</button>{/if}
			{:else}<p class="empty">Nobody is signed in.</p>{/if}
		</section>

		<div class="two">
			<section class="card">
				<div class="card-head"><h3>Recent sign-ins</h3><p>Last 30, kept for 90 days. Location is approximate (city and country).</p></div>
				{#if mySignins.length}
					<ul class="feed">{#each mySignins as g (g.id)}<li>
						<span class="feed-icon">{#if isPhone(g.device)}<Smartphone size={15} />{:else}<Monitor size={15} />{/if}</span>
						<span class="feed-text"><b>{g.email}</b> signed in to {g.workspace}<small>{g.device || 'Device unknown'} · {g.location || 'Location unknown'}</small></span>
						<time datetime={g.at}>{when(g.at)}</time>
					</li>{/each}</ul>
				{:else}<p class="empty">No sign-ins recorded yet. New sign-ins appear here from now on.</p>{/if}
			</section>
			<section class="card">
				<div class="card-head"><h3>Recent activity</h3><p>{chosenPerson ? (chosenPerson.role === 'owner' ? 'Your owner actions.' : `Changes in ${chosenPerson.workspace} (one admin login per workspace).`) : 'Latest changes across all workspaces, and your own owner actions.'}</p></div>
				{#if feed.length}
					<ul class="feed">{#each feed as a (a.id)}<li class="plain">
						<span class="feed-text"><span class="feed-tag">{a.workspace}</span><b>{a.what}</b>{#if a.details}<small>{a.details}</small>{/if}<small>by {a.who}</small></span>
						<time datetime={a.at}>{ago(a.at)}</time>
					</li>{/each}</ul>
				{:else}<p class="empty">No activity yet.</p>{/if}
			</section>
		</div>

		{/if}

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
	.card { display: grid; align-content: start; gap: 14px; padding: 16px; border: 1px solid var(--line, #e2e8f0); border-radius: 16px; background: var(--card, #fff); min-width: 0; }
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
	.views { display: inline-flex; gap: 4px; padding: 4px; border: 1px solid var(--line, #e2e8f0); border-radius: 12px; background: var(--card, #fff); justify-self: start; }
	.views button { display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border: 0; border-radius: 9px; background: transparent; color: var(--muted, #64748b); font-size: 13.5px; font-weight: 650; cursor: pointer; }
	.views button.on { background: var(--theme-soft, #f1f5f9); color: var(--theme-text, #0f172a); }
	.views button span { padding: 2px 8px; border-radius: 999px; background: #0ca30c1f; color: #087f08; font-size: 11.5px; }
	.more { justify-self: start; }
	.empty-row { text-align: center; color: var(--muted, #64748b) !important; padding: 18px !important; white-space: normal !important; }
	.person-bar { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; }
	.small-btn { min-height: 32px; padding: 0 12px; font-size: 12.5px; }
	.chips { display: flex; flex-wrap: wrap; gap: 6px; }
	.chips button { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border: 1px solid var(--line, #e2e8f0); border-radius: 999px; background: var(--card, #fff); color: var(--muted, #64748b); font-size: 12.5px; font-weight: 650; cursor: pointer; }
	.chips button.on { border-color: var(--purple, #0f766e); background: color-mix(in srgb, var(--purple, #0f766e) 10%, var(--card, #fff)); color: var(--theme-text, #0f172a); }
	.chips button span { font-variant-numeric: tabular-nums; }
	.pill { display: inline-flex; padding: 3px 9px; border-radius: 999px; font-size: 12px; font-weight: 650; }
	.pill.in { background: #0ca30c1f; color: #087f08; }
	.pill.out { background: #94a3b829; color: #475569; }
	.reason { display: block; margin-top: 3px; color: var(--muted, #64748b); font-size: 11.5px; }
	.table-scroll { overflow: auto; max-height: 420px; }
	.people-table th { position: sticky; top: 0; z-index: 1; }
	.people-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.people-table th { padding: 9px 12px; text-align: left; font-size: 12px; font-weight: 700; color: var(--muted, #64748b); background: color-mix(in srgb, var(--theme-soft, #f1f5f9) 65%, var(--card, #fff)); white-space: nowrap; }
	.people-table td { padding: 10px 12px; border-top: 1px solid var(--line, #e2e8f0); color: var(--theme-text, #0f172a); white-space: nowrap; }
	.who { display: flex; align-items: center; gap: 10px; }
	.who > span { display: grid; }
	.who small, .feed small { color: var(--muted, #64748b); font-size: 12px; }
	.dot { width: 9px; height: 9px; flex: none; border-radius: 50%; background: #cbd5e1; }
	.dot.on { background: #0ca30c; box-shadow: 0 0 0 3px #0ca30c26; }
	.dev { display: inline-flex; align-items: center; gap: 7px; }
	.feed { display: grid; margin: 0; padding: 0; list-style: none; max-height: 420px; overflow-y: auto; }
	.feed li { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: start; padding: 10px 2px; border-top: 1px solid var(--line, #e2e8f0); font-size: 13px; color: var(--theme-text, #0f172a); }
	.feed li:first-child { border-top: 0; }
	.feed li.plain { grid-template-columns: 1fr auto; }
	.feed-text { display: grid; gap: 2px; min-width: 0; overflow-wrap: anywhere; }
	.feed-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: var(--theme-soft, #f1f5f9); color: var(--muted, #64748b); }
	.feed-tag { justify-self: start; margin-bottom: 3px; max-width: 100%; padding: 3px 8px; border-radius: 999px; background: var(--theme-soft, #f1f5f9); color: var(--muted, #64748b); font-size: 11.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.feed time { color: var(--muted, #64748b); font-size: 12px; white-space: nowrap; }
	.empty { margin: 0; color: var(--muted, #64748b); font-size: 13px; }
	@media (max-width: 640px) { .ws-facts { grid-template-columns: 1fr 1fr; } .gauge-wrap { grid-column: 1 / -1; } }
</style>
