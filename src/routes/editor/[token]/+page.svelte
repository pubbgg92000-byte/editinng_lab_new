<!-- Public editor portal: assigned work, source links, progress, duration, output, and notes. -->
<script lang="ts">
	import { untrack } from 'svelte';
	import { ArrowUpRight, CalendarDays, Check, ChevronLeft, Clock3, FileUp, FolderOpen, HardDrive, Image, Link as LinkIcon } from '@lucide/svelte';
	import PortalHeader from '$lib/components/PortalHeader.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import CustomFieldValues from '$lib/components/CustomFieldValues.svelte';
	import ProgressDisplay from '$lib/components/ProgressDisplay.svelte';
	import { formatDate } from '$lib/data';
	import { formatVideoDuration, parseVideoDurationMinutes } from '$lib/duration';
	import { requestJson } from '$lib/http';
	import { askConfirm } from '$lib/stores/confirm';
	import type { Task, TaskStatus } from '$lib/types';
	import { hasCapability, labelFor, statusFor } from '$lib/capabilities';
	import { staffPortalSections } from '$lib/moduleConfiguration';

	let { data } = $props();
	let tasks = $state<(Task & { customer: string; project: string; workType: string })[]>(untrack(() => data.tasks));
	let selected = $state<(typeof tasks)[number] | null>(null);
	let status = $state<TaskStatus>('Not started');
	let progress = $state(0);
	let outputLink = $state('');
	let notes = $state('');
	let videoDuration = $state('');
	let saved = $state(false);
	let saving = $state(false);
	let readying = $state(false);
	let savedTimer: ReturnType<typeof setTimeout> | undefined;
	let error = $state('');
	const editorStatuses: TaskStatus[] = ['Not started', 'Files downloaded', 'In progress', 'Waiting for clarification', 'Ready for review'];
	const todayIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
	const needsAction = (task: Task) => task.status === 'Revision required' || task.status === 'Waiting for clarification';
	// Work that needs the editor's attention first, then by due date.
	const activeTasks = $derived(tasks.filter((task) => task.status !== 'Completed').sort((a, b) =>
		Number(needsAction(b)) - Number(needsAction(a)) || (a.due || '9999').localeCompare(b.due || '9999')));
	const dueChip = (task: Task) => !task.due ? '' : task.due.slice(0, 10) < todayIso ? 'Overdue' : task.due.slice(0, 10) === todayIso ? 'Due today' : '';
	const completedTasks = $derived(tasks.filter((task) => task.status === 'Completed'));
	const staffLabel = $derived(labelFor(data.configuration.profile, 'staff'));
	const taskLabel = $derived(labelFor(data.configuration.profile, 'task'));
	const portalConfiguration = $derived(data.configuration.moduleConfiguration['work.staffPortal']);
	const portalSections = $derived(staffPortalSections(portalConfiguration));
	const durationEnabled = $derived(portalSections.duration && hasCapability(data.configuration.effectiveCapabilities, 'billing.duration'));
	const assetsEnabled = $derived(portalSections.assets && hasCapability(data.configuration.effectiveCapabilities, 'work.assignedAssets'));
	const customFieldsEnabled = $derived(portalSections.customFields && hasCapability(data.configuration.effectiveCapabilities, 'customFields'));
	const socialImage = $derived(`${data.appUrl}/nexadesk-social.png`);
	// Unsaved edits: a field this portal is allowed to save differs from what the server last returned for the open task.
	const dirty = $derived(selected !== null && selected.status !== 'Completed' && portalConfiguration.mode !== 'assignments-only' && (
		(portalConfiguration.allowStatusUpdate && status !== selected.status)
		|| (portalConfiguration.allowProgressUpdate && portalSections.progress && Number(progress) !== Number(selected.progress))
		|| (portalSections.output && outputLink.trim() !== (selected.outputLink || '').trim())
		|| (portalSections.notes && notes.trim() !== (selected.notes || '').trim())
		|| (durationEnabled && parseVideoDurationMinutes(videoDuration) !== Math.round(Number(selected.videoDurationMinutes) || 0))));
	const confirmDiscard = () => askConfirm({ title: 'Unsaved changes', message: `You have unsaved changes to this ${taskLabel.toLowerCase()}. Leave without saving?`, confirmLabel: 'Leave without saving', danger: true });

	function openTask(task: (typeof tasks)[number]) {
		selected = task;
		status = task.status;
		progress = task.progress;
		outputLink = task.outputLink || '';
		notes = task.notes || '';
		videoDuration = formatVideoDuration(task.videoDurationMinutes);
		error = '';
		saved = false;
		// Phone back button returns to the list instead of leaving the portal.
		history.pushState({ editorTask: task.id }, '');
		window.scrollTo(0, 0);
	}
	async function closeTask() {
		if (dirty && !(await confirmDiscard())) return;
		const viaHistory = Boolean(history.state?.editorTask);
		selected = null;
		if (viaHistory) history.back();
	}
	async function onPopState() {
		if (!selected) return;
		const task = selected;
		// The phone back button has already left the task entry; put it back if the editor keeps editing.
		if (dirty && !(await confirmDiscard())) { history.pushState({ editorTask: task.id }, ''); return; }
		if (selected?.id === task.id) selected = null;
	}
	async function markReady() {
		if (saving) return;
		status = 'Ready for review';
		progress = 100;
		readying = true;
		try { await update(); } finally { readying = false; }
	}

	async function update() {
		if (!selected || saving) return;
		// The editor may go back or open other work while this saves, so pin the task being saved.
		const target = selected;
		const sentStatus = status;
		saving = true;
		error = '';
		saved = false;
		try {
			const result = await requestJson<{ task: Task }>(`/api/portal/${data.tenantSlug}/tasks/${target.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					// Send status only when the editor changed it, so admin-set states like "Revision required" don't block saving notes or links.
					...(portalConfiguration.allowStatusUpdate && portalConfiguration.mode !== 'assignments-only' && status !== target.status ? { status } : {}),
					...(portalConfiguration.allowProgressUpdate && portalSections.progress ? { progress } : {}),
					...(portalSections.output ? { outputLink } : {}),
					...(portalSections.notes ? { notes } : {}),
					...(durationEnabled ? { videoDuration } : {}),
					token: data.token
				})
			}, `Unable to update this ${taskLabel.toLowerCase()}.`);
			tasks = tasks.map((task) => task.id === target.id ? { ...task, ...result.task } : task);
			if (selected?.id !== target.id) return;
			selected = tasks.find((task) => task.id === target.id) || null;
			// Follow a status the administrator set meanwhile, so the next save does not silently undo it.
			if (selected && status === sentStatus) status = selected.status;
			saved = true;
			clearTimeout(savedTimer);
			savedTimer = setTimeout(() => saved = false, 2500);
		} catch (cause) {
			if (selected?.id === target.id) error = cause instanceof Error ? cause.message : `Unable to update this ${taskLabel.toLowerCase()}.`;
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Secure {staffLabel.toLowerCase()} portal — {data.settings.studioName}</title>
	<meta property="og:title" content={`${data.settings.studioName} — Secure ${staffLabel.toLowerCase()} portal`} />
	<meta property="og:description" content={`Privately view assignments, source files, progress, and delivery actions for ${data.settings.studioName}.`} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={data.settings.studioName} />
	<meta property="og:url" content={data.pageUrl} />
	<meta property="og:image" content={socialImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={`${data.settings.studioName} secure ${staffLabel.toLowerCase()} portal`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`${data.settings.studioName} — Secure ${staffLabel.toLowerCase()} portal`} />
	<meta name="twitter:description" content={`Private assignments and progress access for ${data.settings.studioName}.`} />
	<meta name="twitter:image" content={socialImage} />
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>
<svelte:window onpopstate={onPopState} />
<PortalHeader label={`${staffLabel} portal`} settings={data.settings} themeScope={data.tenantSlug}/>

<main class="portal-main">
	{#if !selected}
		<div class="welcome"><span class="avatar">{data.editor.initials}</span><div><p>Welcome back</p><h1>{data.editor.name}</h1></div></div>
		{#if customFieldsEnabled}<CustomFieldValues definitions={data.configuration.profile.customFields} entity="staff" values={data.editor.customFields} surface="staffPortal"/>{/if}
		<div class="work-title"><h2>Active assignments</h2><span>{activeTasks.length} {activeTasks.length === 1 ? labelFor(data.configuration.profile, 'task').toLowerCase() : labelFor(data.configuration.profile, 'task', true).toLowerCase()}</span></div>
		{#if activeTasks.length}
			<div class="task-cards">
				{#each activeTasks as task}
					<button type="button" class="task-card" onclick={() => openTask(task)}>
						<div class="task-card-top"><div><span class="customer">{task.customer}</span><h3>{task.project}</h3></div><StatusBadge status={task.status}/></div>
						<p>{task.name}</p>
						<div class="task-meta">{#if assetsEnabled && task.device}<span><HardDrive size={12}/> {task.device}</span>{/if}{#if durationEnabled && task.videoDurationMinutes}<span><Clock3 size={12}/> {formatVideoDuration(task.videoDurationMinutes)}</span>{/if}</div>
						{#if (dueChip(task) && task.status !== 'Completed') || needsAction(task)}<div class="chip-row">{#if needsAction(task)}<b class="due-chip action">Needs you</b>{/if}{#if dueChip(task) && task.status !== 'Completed'}<b class="due-chip">{dueChip(task)}</b>{/if}</div>{/if}<div class="task-footer"><span><CalendarDays size={13}/> {task.due ? `Due ${formatDate(task.due)}` : 'No due date'}</span><span class="open">Open <ArrowUpRight size={13}/></span></div>
					</button>
				{/each}
			</div>
		{:else}<div class="empty card"><Check size={22}/><h2>You’re all caught up</h2><p>No active assignments are available.</p></div>{/if}
		{#if completedTasks.length}<div class="work-title completed-title"><h2>Completed work</h2><span>{completedTasks.length} approved</span></div><div class="task-cards completed-cards">{#each completedTasks as task}<button type="button" class="task-card" onclick={() => openTask(task)}><div class="task-card-top"><div><span class="customer">{task.customer}</span><h3>{task.project}</h3></div><StatusBadge status={task.status}/></div><p>{task.name}</p><div class="task-footer"><span><Check size={13}/> Approved</span><span class="open">View <ArrowUpRight size={13}/></span></div></button>{/each}</div>{/if}
	{:else}
		<button type="button" class="back" onclick={closeTask}><ChevronLeft size={15}/> All {labelFor(data.configuration.profile, 'task', true).toLowerCase()}</button>
		<header class="task-heading"><div><span>{selected.customer}</span><h1>{selected.project}</h1><p>{selected.name}</p></div><StatusBadge status={selected.status}/></header>
		<div class:single={portalConfiguration.mode === 'assignments-only'} class="task-layout">
			<section class="card details">
				<h2>Work details</h2>
				{#if customFieldsEnabled}<CustomFieldValues definitions={data.configuration.profile.customFields} entity="task" values={selected.customFields} surface="staffPortal"/>{/if}
				<dl><div><dt>{taskLabel}</dt><dd>{selected.name}</dd></div><div><dt>{labelFor(data.configuration.profile, 'dueDate')}</dt><dd>{selected.due ? formatDate(selected.due) : 'Not set'}</dd></div><div><dt>{labelFor(data.configuration.profile, 'category')}</dt><dd>{selected.workType || '—'}</dd></div>{#if assetsEnabled}<div><dt>{labelFor(data.configuration.profile, 'assignedAsset')}</dt><dd>{selected.device || 'Not specified'}</dd></div>{/if}{#if durationEnabled}<div><dt>Billable duration</dt><dd>{formatVideoDuration(selected.videoDurationMinutes) || 'Not submitted'}</dd></div>{/if}</dl>
				{#if portalSections.instructions}<div class="instructions"><span>Instructions</span><p>{selected.instructions || `Follow the ${taskLabel.toLowerCase()} instructions and notify the administrator if anything is missing.`}</p></div>{/if}
				{#if portalSections.references}<div class="references">
					{#if selected.textLink}<a href={selected.textLink} target="_blank" rel="noreferrer"><LinkIcon size={14}/> Open source files / Drive link <ArrowUpRight size={12}/></a>{/if}
					{#if selected.imageUrl}<a href={selected.imageUrl} target="_blank" rel="noreferrer"><Image size={14}/> Open reference image <ArrowUpRight size={12}/></a>{/if}
					{#if !selected.textLink && !selected.imageUrl}<span><FolderOpen size={14}/> No reference link added</span>{/if}
				</div>{/if}
			</section>
			{#if selected.status === 'Completed'}<section class="card update"><h2>Approved</h2><p class="locked-note">This work was approved and is now locked. Ask the administrator if anything needs to change.</p></section>{:else if portalConfiguration.mode !== 'assignments-only'}<section class="card update">
				<h2>Update {taskLabel.toLowerCase()}</h2>
				{#if portalConfiguration.allowStatusUpdate}<fieldset class="field status-pick"><legend>Status</legend>{#if !editorStatuses.includes(selected.status)}<p class="current-note">Current: <b>{statusFor(data.configuration.profile, selected.status).label}</b>. Pick a new status only when it changes.</p>{/if}<div class="chips">{#each editorStatuses as option}<label class="chip" class:on={status === option}><input type="radio" name="task-status" value={option} bind:group={status}/>{statusFor(data.configuration.profile, option).label}</label>{/each}</div></fieldset>{/if}
				{#if portalSections.progress}<ProgressDisplay milestones={portalConfiguration.milestones} status={status} percent={progress} mode={portalConfiguration.progressMode} label={`${taskLabel} progress`}/>{/if}
				{#if portalConfiguration.allowProgressUpdate && portalSections.progress}<div class="field"><label for="task-progress">Set progress <b>{progress}%</b></label><div class="chips progress-chips" role="group" aria-label="Quick progress">{#each [0, 25, 50, 75, 100] as value}<button type="button" class="chip" class:on={progress === value} aria-pressed={progress === value} onclick={() => (progress = value)}>{value}%</button>{/each}</div><input id="task-progress" class="range" type="range" min="0" max="100" step="5" bind:value={progress} aria-label="Fine-tune progress"/></div>{/if}
				{#if durationEnabled}<div class="field duration-field"><label for="video-duration">Work duration <span>Optional</span></label><div class="with-icon"><Clock3 size={14}/><input id="video-duration" bind:value={videoDuration} placeholder="30 min, 1.5 hr, or 1:30"/></div><small>Add the time spent on this work. You can correct it later.</small></div>{/if}
				{#if portalSections.output}<div class="field"><label for="task-output">Completion or delivery link <span>Optional</span></label><div class="with-icon"><FileUp size={14}/><input id="task-output" type="url" inputmode="url" bind:value={outputLink} placeholder="Paste a completed-work or delivery link"/></div></div>{/if}
				{#if portalSections.notes}<div class="field"><label for="task-notes">Notes for administrator <span>Optional</span></label><textarea id="task-notes" bind:value={notes} placeholder="Add an update, question, or missing-information report..."></textarea></div>{/if}
				{#if error}<p class="error">{error}</p>{/if}
				<div class="save-row">
					{#if portalConfiguration.allowStatusUpdate && selected.status !== 'Ready for review'}<button type="button" class="secondary ready" disabled={saving} aria-busy={readying} onclick={markReady}><Check size={16}/> {readying ? 'Saving…' : 'Mark ready for review'}</button>{/if}
					<button type="button" class="primary save" disabled={saving} aria-busy={saving && !readying} onclick={update}>{saving && !readying ? 'Saving…' : 'Save update'}</button>
				</div>
				{#if saved}<div class="saved" role="status" aria-live="polite"><Check size={13}/> Update saved</div>{/if}
			</section>{/if}
		</div>
	{/if}
</main>

<style>
	.locked-note{margin:6px 0 0;font-size:14px;line-height:1.5;color:var(--muted, #64748b)}
	.portal-main{max-width:880px;margin:0 auto;padding:58px 22px 80px}.welcome{display:flex;align-items:center;gap:14px;margin-bottom:46px}.avatar{width:44px;height:44px;border-radius:12px;background:var(--theme-soft);color:var(--purple);display:grid;place-items:center;font-size:13px;font-weight:700}.welcome p{color:var(--muted);font-size:12.5px;margin:0 0 3px}.welcome h1{font-size:22px;margin:0}.work-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.work-title h2{font-size:14px;margin:0}.work-title span{color:var(--muted);font-size:12px}.task-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.task-card{display:block;text-align:left;border:1px solid var(--line);background:var(--card);color:inherit;border-radius:12px;padding:18px;transition:.15s}.task-card:hover{border-color:var(--purple)}.task-card-top{display:flex;align-items:start;justify-content:space-between}.customer{color:var(--muted);font-size:11px}.task-card h3{font-size:14px;margin:4px 0}.task-card>p{color:var(--purple);font-size:12px;margin:14px 0 25px}.task-footer{border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between;color:var(--muted);font-size:11px}.task-footer span,.references a,.references span{display:flex;align-items:center;gap:5px}.task-footer .open{color:var(--purple)}.empty{text-align:center;padding:50px;color:var(--muted)}.empty h2{color:inherit}.back{display:flex;gap:5px;align-items:center;border:0;background:transparent;color:var(--muted);font-size:12px;padding:0;margin-bottom:27px}.task-heading{display:flex;align-items:start;justify-content:space-between;margin-bottom:24px}.task-heading span{color:var(--muted);font-size:12px}.task-heading h1{font-size:24px;margin:4px 0}.task-heading p{color:var(--purple);font-size:12.5px;margin:0}.task-layout{display:grid;grid-template-columns:1fr 1fr;gap:14px}.details,.update{padding:20px}.details h2,.update h2{font-size:13px;margin:0 0 20px}.details dl{margin:0}.details dl div{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-size:12px}.details dt,.instructions span{color:var(--muted)}.details dd{margin:0}.instructions{margin-top:19px}.instructions span{font-size:12px}.instructions p{font-size:12px;line-height:1.7;color:inherit}.references{display:grid;gap:8px;margin-top:20px}.references a,.references span{min-height:36px;justify-content:center;border:1px solid var(--line);background:var(--theme-soft);color:var(--purple);border-radius:8px;font-size:12px}.references span{color:var(--muted)}.update{display:flex;flex-direction:column;gap:16px}.update h2{margin-bottom:3px}.field label{display:flex;justify-content:space-between}.field label b{color:var(--purple)}.range{padding:5px 0!important;accent-color:var(--purple)}.with-icon{position:relative}.with-icon input{padding-left:32px}.save{width:100%;margin-top:2px}.saved{display:flex;align-items:center;justify-content:center;gap:6px;color:#45c982;font-size:11px}.error{color:#ef7777;font-size:12px;margin:0}.portal-main :global(.badge){pointer-events:none}@media(max-width:650px){.task-cards,.task-layout{grid-template-columns:1fr}.portal-main{padding-top:38px}}
	.completed-title{margin-top:34px}.completed-cards{opacity:.86}.completed-cards .task-card{background:color-mix(in srgb,var(--card) 94%,#22c55e 6%)}
	.task-card>p{margin-bottom:12px}.task-meta{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}.task-meta span{display:flex;align-items:center;gap:4px;padding:5px 7px;border-radius:99px;background:var(--theme-soft);color:var(--muted);font-size:11px}.details dl div{gap:14px}.details dd{text-align:right}.field small{color:var(--muted);font-size:11px;line-height:1.5}.duration-field{padding:13px;border:1px solid color-mix(in srgb,var(--purple) 30%,var(--line));border-radius:10px;background:var(--theme-soft)}.with-icon :global(svg){position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--purple)}.task-layout.single{grid-template-columns:1fr}

	/* Phone-first sizing: readable text, 44px targets, 16px inputs (prevents iOS zoom on focus). */
	.portal-main{padding:28px 16px 64px}
	.portal-main :global(input:not([type="radio"]):not([type="range"])),.portal-main textarea{font-size:16px;min-height:46px}
	.portal-main textarea{min-height:96px}
	.task-card{min-height:44px}
	.status-pick{border:0;margin:0;padding:0}
	.status-pick legend{font-size:14px;font-weight:600;margin-bottom:8px;padding:0}
	.current-note{margin:0 0 8px;font-size:14px;color:var(--muted)}
	.chips{display:flex;flex-wrap:wrap;gap:8px}
	.chip{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--theme-text);font-size:14px;font-weight:600;cursor:pointer}
	.chip.on{background:var(--purple);border-color:var(--purple);color:var(--accent-text,#fff)}
	.chip input{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}
	.chip:has(input:focus-visible){outline:2px solid var(--purple);outline-offset:2px}
	.progress-chips{margin-bottom:6px}
	.save-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
	.save-row button{flex:1 1 200px;min-height:48px;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:15px}
	.due-chip{margin-left:8px;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,#dc2626 14%,transparent);color:#b91c1c;font-size:12px;font-weight:700}
	.due-chip.action{background:color-mix(in srgb,#d97706 16%,transparent);color:#92400e}
	.back{min-height:44px;font-size:14px}
	@media (min-width:700px){.portal-main{padding:48px 22px 80px}}

	.chip-row{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px}
	.chip-row .due-chip{margin-left:0;white-space:nowrap}
	.progress-chips{display:grid;grid-template-columns:repeat(5,minmax(0,1fr))}
	.progress-chips .chip{justify-content:center;padding:0 6px}
	.task-footer span{white-space:nowrap}
</style>
