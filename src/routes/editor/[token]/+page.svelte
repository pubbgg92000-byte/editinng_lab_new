<!-- Public editor portal: assigned work, source links, progress, duration, output, and notes. -->
<script lang="ts">
	import { untrack } from 'svelte';
	import { ArrowUpRight, CalendarDays, Check, ChevronLeft, Clock3, FileUp, FolderOpen, HardDrive, Image, Link as LinkIcon } from '@lucide/svelte';
	import PortalHeader from '$lib/components/PortalHeader.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import CustomFieldValues from '$lib/components/CustomFieldValues.svelte';
	import ProgressDisplay from '$lib/components/ProgressDisplay.svelte';
	import { formatDate } from '$lib/data';
	import { formatVideoDuration } from '$lib/duration';
	import { requestJson } from '$lib/http';
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
	let error = $state('');
	const activeTasks = $derived(tasks.filter((task) => task.status !== 'Completed'));
	const completedTasks = $derived(tasks.filter((task) => task.status === 'Completed'));
	const staffLabel = $derived(labelFor(data.configuration.profile, 'staff'));
	const taskLabel = $derived(labelFor(data.configuration.profile, 'task'));
	const portalConfiguration = $derived(data.configuration.moduleConfiguration['work.staffPortal']);
	const portalSections = $derived(staffPortalSections(portalConfiguration));
	const durationEnabled = $derived(portalSections.duration && hasCapability(data.configuration.effectiveCapabilities, 'billing.duration'));
	const assetsEnabled = $derived(portalSections.assets && hasCapability(data.configuration.effectiveCapabilities, 'work.assignedAssets'));
	const customFieldsEnabled = $derived(portalSections.customFields && hasCapability(data.configuration.effectiveCapabilities, 'customFields'));
	const socialImage = $derived(`${data.appUrl}/nexadesk-social.png`);

	function openTask(task: (typeof tasks)[number]) {
		selected = task;
		status = task.status;
		progress = task.progress;
		outputLink = task.outputLink || '';
		notes = task.notes || '';
		videoDuration = formatVideoDuration(task.videoDurationMinutes);
		error = '';
	}

	async function update() {
		if (!selected) return;
		saving = true;
		error = '';
		try {
			const result = await requestJson<{ task: Task }>(`/api/portal/${data.tenantSlug}/tasks/${selected.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					...(portalConfiguration.allowStatusUpdate && portalConfiguration.mode !== 'assignments-only' ? { status } : {}),
					...(portalConfiguration.allowProgressUpdate && portalSections.progress ? { progress } : {}),
					...(portalSections.output ? { outputLink } : {}),
					...(portalSections.notes ? { notes } : {}),
					...(durationEnabled ? { videoDuration } : {}),
					token: data.token
				})
			}, `Unable to update this ${taskLabel.toLowerCase()}.`);
			tasks = tasks.map((task) => task.id === selected?.id ? { ...task, ...result.task } : task);
			selected = tasks.find((task) => task.id === selected?.id) || null;
			saved = true;
			setTimeout(() => saved = false, 2500);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : `Unable to update this ${taskLabel.toLowerCase()}.`;
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
<PortalHeader label={`${staffLabel} portal`} settings={data.settings} themeScope={data.tenantSlug}/>

<main class="portal-main">
	{#if !selected}
		<div class="welcome"><span class="avatar">{data.editor.initials}</span><div><p>Welcome back</p><h1>{data.editor.name}</h1></div></div>
		{#if customFieldsEnabled}<CustomFieldValues definitions={data.configuration.profile.customFields} entity="staff" values={data.editor.customFields} surface="staffPortal"/>{/if}
		<div class="work-title"><h2>Active assignments</h2><span>{activeTasks.length} {labelFor(data.configuration.profile, 'task', true).toLowerCase()}</span></div>
		{#if activeTasks.length}
			<div class="task-cards">
				{#each activeTasks as task}
					<button type="button" class="task-card" onclick={() => openTask(task)}>
						<div class="task-card-top"><div><span class="customer">{task.customer}</span><h3>{task.project}</h3></div><StatusBadge status={task.status}/></div>
						<p>{task.name}</p>
						<div class="task-meta">{#if assetsEnabled && task.device}<span><HardDrive size={12}/> {task.device}</span>{/if}{#if durationEnabled && task.videoDurationMinutes}<span><Clock3 size={12}/> {formatVideoDuration(task.videoDurationMinutes)}</span>{/if}</div>
						<div class="task-footer"><span><CalendarDays size={13}/> {task.due ? `Due ${formatDate(task.due)}` : 'No due date'}</span><span class="open">Open <ArrowUpRight size={13}/></span></div>
					</button>
				{/each}
			</div>
		{:else}<div class="empty card"><Check size={22}/><h2>You’re all caught up</h2><p>No active assignments are available.</p></div>{/if}
		{#if completedTasks.length}<div class="work-title completed-title"><h2>Completed work</h2><span>{completedTasks.length} approved</span></div><div class="task-cards completed-cards">{#each completedTasks as task}<button type="button" class="task-card" onclick={() => openTask(task)}><div class="task-card-top"><div><span class="customer">{task.customer}</span><h3>{task.project}</h3></div><StatusBadge status={task.status}/></div><p>{task.name}</p><div class="task-footer"><span><Check size={13}/> Approved</span><span class="open">View <ArrowUpRight size={13}/></span></div></button>{/each}</div>{/if}
	{:else}
		<button type="button" class="back" onclick={() => selected = null}><ChevronLeft size={15}/> All {labelFor(data.configuration.profile, 'task', true).toLowerCase()}</button>
		<header class="task-heading"><div><span>{selected.customer}</span><h1>{selected.project}</h1><p>{selected.name}</p></div><StatusBadge status={status}/></header>
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
			{#if portalConfiguration.mode !== 'assignments-only'}<section class="card update">
				<h2>Update {taskLabel.toLowerCase()}</h2>
				{#if portalConfiguration.allowStatusUpdate}<div class="field"><label for="task-status">Status</label><select id="task-status" bind:value={status}>{#each ['Not started', 'Files downloaded', 'In progress', 'Waiting for clarification', 'Ready for review'] as option}<option value={option}>{statusFor(data.configuration.profile, option).label}</option>{/each}</select></div>{/if}
				{#if portalSections.progress}<ProgressDisplay milestones={portalConfiguration.milestones} status={status} percent={progress} mode={portalConfiguration.progressMode} label={`${taskLabel} progress`}/>{/if}
				{#if portalConfiguration.allowProgressUpdate && portalSections.progress}<div class="field"><label for="task-progress">Set progress <b>{progress}%</b></label><input id="task-progress" class="range" type="range" min="0" max="100" step="10" bind:value={progress}/></div>{/if}
				{#if durationEnabled}<div class="field duration-field"><label for="video-duration">Work duration <span>Optional</span></label><div class="with-icon"><Clock3 size={14}/><input id="video-duration" bind:value={videoDuration} placeholder="30 min, 1.5 hr, or 1:30"/></div><small>Add the time spent on this work. You can correct it later.</small></div>{/if}
				{#if portalSections.output}<div class="field"><label for="task-output">Completion or delivery link <span>Optional</span></label><div class="with-icon"><FileUp size={14}/><input id="task-output" type="url" inputmode="url" bind:value={outputLink} placeholder="Paste a completed-work or delivery link"/></div></div>{/if}
				{#if portalSections.notes}<div class="field"><label for="task-notes">Notes for administrator <span>Optional</span></label><textarea id="task-notes" bind:value={notes} placeholder="Add an update, question, or missing-information report..."></textarea></div>{/if}
				{#if error}<p class="error">{error}</p>{/if}
				<button type="button" class="primary save" disabled={saving} aria-busy={saving} onclick={update}>{saving ? 'Saving…' : `Update ${taskLabel.toLowerCase()}`}</button>
				{#if saved}<div class="saved" role="status" aria-live="polite"><Check size={13}/> Update saved</div>{/if}
			</section>{/if}
		</div>
	{/if}
</main>

<style>
	.portal-main{max-width:880px;margin:0 auto;padding:58px 22px 80px}.welcome{display:flex;align-items:center;gap:14px;margin-bottom:46px}.avatar{width:44px;height:44px;border-radius:12px;background:var(--theme-soft);color:var(--purple);display:grid;place-items:center;font-size:12px;font-weight:700}.welcome p{color:var(--muted);font-size:11px;margin:0 0 3px}.welcome h1{font-size:22px;margin:0}.work-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.work-title h2{font-size:13px;margin:0}.work-title span{color:var(--muted);font-size:10px}.task-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.task-card{display:block;text-align:left;border:1px solid var(--line);background:var(--card);color:inherit;border-radius:12px;padding:18px;transition:.15s}.task-card:hover{transform:translateY(-2px);border-color:var(--purple)}.task-card-top{display:flex;align-items:start;justify-content:space-between}.customer{color:var(--muted);font-size:9px}.task-card h3{font-size:14px;margin:4px 0}.task-card>p{color:var(--purple);font-size:10px;margin:14px 0 25px}.task-footer{border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between;color:var(--muted);font-size:9px}.task-footer span,.references a,.references span{display:flex;align-items:center;gap:5px}.task-footer .open{color:var(--purple)}.empty{text-align:center;padding:50px;color:var(--muted)}.empty h2{color:inherit}.back{display:flex;gap:5px;align-items:center;border:0;background:transparent;color:var(--muted);font-size:10px;padding:0;margin-bottom:27px}.task-heading{display:flex;align-items:start;justify-content:space-between;margin-bottom:24px}.task-heading span{color:var(--muted);font-size:10px}.task-heading h1{font-size:24px;margin:4px 0}.task-heading p{color:var(--purple);font-size:11px;margin:0}.task-layout{display:grid;grid-template-columns:1fr 1fr;gap:14px}.details,.update{padding:20px}.details h2,.update h2{font-size:12px;margin:0 0 20px}.details dl{margin:0}.details dl div{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-size:10px}.details dt,.instructions span{color:var(--muted)}.details dd{margin:0}.instructions{margin-top:19px}.instructions span{font-size:10px}.instructions p{font-size:10px;line-height:1.7;color:inherit}.references{display:grid;gap:8px;margin-top:20px}.references a,.references span{min-height:36px;justify-content:center;border:1px solid var(--line);background:var(--theme-soft);color:var(--purple);border-radius:8px;font-size:10px}.references span{color:var(--muted)}.update{display:flex;flex-direction:column;gap:16px}.update h2{margin-bottom:3px}.field label{display:flex;justify-content:space-between}.field label b{color:var(--purple)}.range{padding:5px 0!important;accent-color:var(--purple)}.with-icon{position:relative}.with-icon input{padding-left:32px}.save{width:100%;margin-top:2px}.saved{display:flex;align-items:center;justify-content:center;gap:6px;color:#45c982;font-size:9px}.error{color:#ef7777;font-size:10px;margin:0}.portal-main :global(.badge){pointer-events:none}@media(max-width:650px){.task-cards,.task-layout{grid-template-columns:1fr}.portal-main{padding-top:38px}}
	.completed-title{margin-top:34px}.completed-cards{opacity:.86}.completed-cards .task-card{background:color-mix(in srgb,var(--card) 94%,#22c55e 6%)}
	.task-card>p{margin-bottom:12px}.task-meta{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}.task-meta span{display:flex;align-items:center;gap:4px;padding:5px 7px;border-radius:99px;background:var(--theme-soft);color:var(--muted);font-size:8px}.details dl div{gap:14px}.details dd{text-align:right}.field small{color:var(--muted);font-size:8px;line-height:1.5}.duration-field{padding:13px;border:1px solid color-mix(in srgb,var(--purple) 30%,var(--line));border-radius:10px;background:var(--theme-soft)}.with-icon :global(svg){position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--purple)}.task-layout.single{grid-template-columns:1fr}
</style>
