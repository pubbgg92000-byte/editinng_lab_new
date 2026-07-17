<script lang="ts">
	import { ArrowUpRight, CalendarDays, Check, ChevronLeft, FileUp, FolderOpen, Image, Link as LinkIcon } from 'lucide-svelte';
	import PortalHeader from '$lib/components/PortalHeader.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { formatDate } from '$lib/data';
	import type { Task, TaskStatus } from '$lib/types';

	let { data } = $props();
	let tasks = $state<(Task & { customer: string; project: string; workType: string })[]>(data.tasks);
	let selected = $state<(typeof tasks)[number] | null>(null);
	let status = $state<TaskStatus>('Not started');
	let progress = $state(0);
	let outputLink = $state('');
	let notes = $state('');
	let saved = $state(false);
	let saving = $state(false);
	let error = $state('');
	const activeTasks = $derived(tasks.filter((task) => task.status !== 'Completed'));
	const completedTasks = $derived(tasks.filter((task) => task.status === 'Completed'));

	function openTask(task: (typeof tasks)[number]) {
		selected = task;
		status = task.status;
		progress = task.progress;
		outputLink = task.outputLink || '';
		notes = task.notes || '';
		error = '';
	}

	async function update() {
		if (!selected) return;
		saving = true;
		error = '';
		const response = await fetch(`/api/tasks/${selected.id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ status, progress, outputLink, notes, token: data.token })
		});
		const result = await response.json();
		saving = false;
		if (!response.ok) { error = result.error || 'Unable to update this task.'; return; }
		tasks = tasks.map((task) => task.id === selected?.id ? { ...task, ...result.task } : task);
		selected = tasks.find((task) => task.id === selected?.id) || null;
		saved = true;
		setTimeout(() => saved = false, 2500);
	}
</script>

<svelte:head><title>{data.editor.name}’s work — Anjana Creations</title></svelte:head>
<PortalHeader label="Editor portal"/>

<main class="portal-main">
	{#if !selected}
		<div class="welcome"><span class="avatar">{data.editor.initials}</span><div><p>Welcome back</p><h1>{data.editor.name}</h1></div></div>
		<div class="work-title"><h2>Active assignments</h2><span>{activeTasks.length} assigned</span></div>
		{#if activeTasks.length}
			<div class="task-cards">
				{#each activeTasks as task}
					<button class="task-card" onclick={() => openTask(task)}>
						<div class="task-card-top"><div><span class="customer">{task.customer}</span><h3>{task.project}</h3></div><StatusBadge status={task.status}/></div>
						<p>{task.name}</p>
						<div class="task-footer"><span><CalendarDays size={13}/> {task.due ? `Due ${formatDate(task.due)}` : 'No due date'}</span><span class="open">Open <ArrowUpRight size={13}/></span></div>
					</button>
				{/each}
			</div>
		{:else}<div class="empty card"><Check size={22}/><h2>You’re all caught up</h2><p>No active assignments are available.</p></div>{/if}
		{#if completedTasks.length}<div class="work-title completed-title"><h2>Completed work</h2><span>{completedTasks.length} approved</span></div><div class="task-cards completed-cards">{#each completedTasks as task}<button class="task-card" onclick={() => openTask(task)}><div class="task-card-top"><div><span class="customer">{task.customer}</span><h3>{task.project}</h3></div><StatusBadge status={task.status}/></div><p>{task.name}</p><div class="task-footer"><span><Check size={13}/> Approved</span><span class="open">View <ArrowUpRight size={13}/></span></div></button>{/each}</div>{/if}
	{:else}
		<button class="back" onclick={() => selected = null}><ChevronLeft size={15}/> All tasks</button>
		<header class="task-heading"><div><span>{selected.customer}</span><h1>{selected.project}</h1><p>{selected.name}</p></div><StatusBadge status={status}/></header>
		<div class="task-layout">
			<section class="card details">
				<h2>Work details</h2>
				<dl><div><dt>Task</dt><dd>{selected.name}</dd></div><div><dt>Due date</dt><dd>{selected.due ? formatDate(selected.due) : 'Not set'}</dd></div><div><dt>Event</dt><dd>{selected.workType || '—'}</dd></div></dl>
				<div class="instructions"><span>Instructions</span><p>{selected.instructions || 'Follow the project brief and notify the admin if anything is missing.'}</p></div>
				<div class="references">
					{#if selected.textLink}<a href={selected.textLink} target="_blank" rel="noreferrer"><LinkIcon size={14}/> Open reference <ArrowUpRight size={12}/></a>{/if}
					{#if selected.imageUrl}<a href={selected.imageUrl} target="_blank" rel="noreferrer"><Image size={14}/> Open reference image <ArrowUpRight size={12}/></a>{/if}
					{#if !selected.textLink && !selected.imageUrl}<span><FolderOpen size={14}/> No reference links added</span>{/if}
				</div>
			</section>
			<section class="card update">
				<h2>Update your work</h2>
				<div class="field"><label for="task-status">Status</label><select id="task-status" bind:value={status}><option>Not started</option><option>Files downloaded</option><option>In progress</option><option>Waiting for clarification</option><option>Ready for review</option></select></div>
				<div class="field"><label for="task-progress">Progress <b>{progress}%</b></label><input id="task-progress" class="range" type="range" min="0" max="100" step="10" bind:value={progress}/></div>
				<div class="field"><label for="task-output">External output link</label><div class="with-icon"><FileUp size={14}/><input id="task-output" type="url" inputmode="url" bind:value={outputLink} placeholder="Paste a Drive or delivery link"/></div></div>
				<div class="field"><label for="task-notes">Notes for admin</label><textarea id="task-notes" bind:value={notes} placeholder="Add an update, question, or missing-file report..."></textarea></div>
				{#if error}<p class="error">{error}</p>{/if}
				<button class="primary save" disabled={saving} onclick={update}>{saving ? 'Saving…' : 'Update task'}</button>
				{#if saved}<div class="saved"><Check size={13}/> Update sent to admin and Sheets</div>{/if}
			</section>
		</div>
	{/if}
</main>

<style>
	.portal-main{max-width:880px;margin:0 auto;padding:58px 22px 80px}.welcome{display:flex;align-items:center;gap:14px;margin-bottom:46px}.avatar{width:44px;height:44px;border-radius:12px;background:var(--theme-soft);color:var(--purple);display:grid;place-items:center;font-size:12px;font-weight:700}.welcome p{color:var(--muted);font-size:11px;margin:0 0 3px}.welcome h1{font-size:22px;margin:0}.work-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.work-title h2{font-size:13px;margin:0}.work-title span{color:var(--muted);font-size:10px}.task-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.task-card{display:block;text-align:left;border:1px solid var(--line);background:var(--card);color:inherit;border-radius:12px;padding:18px;transition:.15s}.task-card:hover{transform:translateY(-2px);border-color:var(--purple)}.task-card-top{display:flex;align-items:start;justify-content:space-between}.customer{color:var(--muted);font-size:9px}.task-card h3{font-size:14px;margin:4px 0}.task-card>p{color:var(--purple);font-size:10px;margin:14px 0 25px}.task-footer{border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between;color:var(--muted);font-size:9px}.task-footer span,.references a,.references span{display:flex;align-items:center;gap:5px}.task-footer .open{color:var(--purple)}.empty{text-align:center;padding:50px;color:var(--muted)}.empty svg{color:#45c982}.empty h2{color:inherit}.back{display:flex;gap:5px;align-items:center;border:0;background:transparent;color:var(--muted);font-size:10px;padding:0;margin-bottom:27px}.task-heading{display:flex;align-items:start;justify-content:space-between;margin-bottom:24px}.task-heading span{color:var(--muted);font-size:10px}.task-heading h1{font-size:24px;margin:4px 0}.task-heading p{color:var(--purple);font-size:11px;margin:0}.task-layout{display:grid;grid-template-columns:1fr 1fr;gap:14px}.details,.update{padding:20px}.details h2,.update h2{font-size:12px;margin:0 0 20px}.details dl{margin:0}.details dl div{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-size:10px}.details dt,.instructions span{color:var(--muted)}.details dd{margin:0}.instructions{margin-top:19px}.instructions span{font-size:10px}.instructions p{font-size:10px;line-height:1.7;color:inherit}.references{display:grid;gap:8px;margin-top:20px}.references a,.references span{min-height:36px;justify-content:center;border:1px solid var(--line);background:var(--theme-soft);color:var(--purple);border-radius:8px;font-size:10px}.references span{color:var(--muted)}.update{display:flex;flex-direction:column;gap:16px}.update h2{margin-bottom:3px}.field label{display:flex;justify-content:space-between}.field label b{color:var(--purple)}.range{padding:5px 0!important;accent-color:var(--purple)}.with-icon{position:relative}.with-icon svg{position:absolute;left:10px;top:10px;color:var(--purple)}.with-icon input{padding-left:32px}.save{width:100%;margin-top:2px}.saved{display:flex;align-items:center;justify-content:center;gap:6px;color:#45c982;font-size:9px}.error{color:#ef7777;font-size:10px;margin:0}.portal-main :global(.badge){pointer-events:none}@media(max-width:650px){.task-cards,.task-layout{grid-template-columns:1fr}.portal-main{padding-top:38px}}
	.completed-title{margin-top:34px}.completed-cards{opacity:.86}.completed-cards .task-card{background:color-mix(in srgb,var(--card) 94%,#22c55e 6%)}
</style>
