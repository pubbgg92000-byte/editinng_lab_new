<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowLeft, Archive, Check, Edit3, ExternalLink, FileText, IndianRupee, Plus, RotateCcw, Star } from 'lucide-svelte';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import PaymentModal from '$lib/components/PaymentModal.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TaskModal from '$lib/components/TaskModal.svelte';
	import { money } from '$lib/data';
	import type { Editor, Order, Task } from '$lib/types';

	let { data } = $props();
	let order = $state<Order>(data.order);
	let editors = $state<Editor[]>(data.editors);
	let activities = $state(data.activity);
	let taskModalOpen = $state(false);
	let paymentModalOpen = $state(false);
	let editingTask = $state<Task | null>(null);
	let error = $state('');
	let busy = $state('');
	let showArchivedTasks = $state(false);

	const activeTasks = $derived(order.tasks.filter((task) => !task.archived));
	const archivedTasks = $derived(order.tasks.filter((task) => task.archived));
	const visibleTasks = $derived(showArchivedTasks ? archivedTasks : activeTasks);
	const assignedEditors = $derived(editors.filter((editor) => activeTasks.some((task) => task.editorId === editor.id)));
	const paidPercent = $derived(order.price > 0 ? Math.min(100, Math.round(order.paid / order.price * 100)) : 0);
	const reserveWhatsAppTab = () => {
		const tab = window.open('about:blank', '_blank');
		if (tab) tab.opener = null;
		return tab;
	};
	const openWhatsAppTab = (tab: Window | null, url: string) => {
		if (tab) tab.location.href = url;
		else window.open(url, '_blank', 'noopener,noreferrer');
	};

	async function refresh() {
		const response = await fetch(`/api/orders/${order.id}`);
		if (!response.ok) return;
		const result = await response.json();
		order = result.order;
		activities = result.activity ?? activities;
	}

	async function toggleImportant() {
		busy = 'important';
		error = '';
		const response = await fetch(`/api/orders/${order.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ important: !order.important }) });
		const result = await response.json();
		busy = '';
		if (!response.ok) { error = result.error || 'Unable to update priority.'; return; }
		order = result.order;
	}

	function openTask(task: Task | null = null) {
		editingTask = task;
		taskModalOpen = true;
	}

	async function updateTask(task: Task, status: Task['status'], progress = task.progress) {
		error = '';
		busy = task.id;
		const response = await fetch(`/api/tasks/${task.id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ status, progress })
		});
		const result = await response.json();
		busy = '';
		if (!response.ok) { error = result.error || 'Unable to update task.'; return; }
		await refresh();
	}

	async function archiveTask(task: Task) {
		if (!confirm(`Archive “${task.name}”? It will remain in Sheets and exports.`)) return;
		busy = task.id;
		const response = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
		busy = '';
		if (!response.ok) { error = 'Unable to archive task.'; return; }
		await refresh();
	}

	async function restoreTask(task: Task) {
		busy = task.id;
		const response = await fetch(`/api/tasks/${task.id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'restore' }) });
		busy = '';
		if (!response.ok) { error = 'Unable to restore task.'; return; }
		await refresh();
	}

	async function openEditorWhatsApp(editor: Editor) {
		const whatsappTab = reserveWhatsAppTab();
		error = '';
		busy = editor.id;
		try {
			const response = await fetch(`/api/editors/${editor.id}/whatsapp`, {
				method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orderId: order.id })
			});
			const result = await response.json();
			if (!response.ok) { whatsappTab?.close(); error = result.error || 'Unable to prepare WhatsApp message.'; return; }
			openWhatsAppTab(whatsappTab, result.url);
		} catch {
			whatsappTab?.close();
			error = 'Unable to prepare WhatsApp message.';
		} finally {
			busy = '';
		}
	}

	async function openBill() {
		const whatsappTab = reserveWhatsAppTab();
		error = '';
		busy = 'invoice';
		try {
			const response = await fetch(`/api/orders/${order.id}/invoice`, { method: 'POST' });
			const result = await response.json();
			if (!response.ok) { whatsappTab?.close(); error = result.error || 'Unable to prepare bill.'; return; }
			openWhatsAppTab(whatsappTab, result.url);
			await refresh();
		} catch {
			whatsappTab?.close();
			error = 'Unable to prepare bill.';
		} finally {
			busy = '';
		}
	}
	onMount(() => {
		const taskId = new URL(location.href).searchParams.get('task');
		const task = order.tasks.find((item) => item.id === taskId);
		if (task) {
			showArchivedTasks = Boolean(task.archived);
			openTask(task);
		}
	});
</script>

<svelte:head><title>{order.project} — Anjana Creations</title></svelte:head>

<div class="detail-top">
	<a href="/orders" class="back"><ArrowLeft size={16}/> Orders</a>
	<div class="actions">
		<button class="secondary" onclick={() => paymentModalOpen = true}><IndianRupee size={14}/> Record payment</button>
		<button class="primary" disabled={busy === 'invoice'} onclick={openBill}><WhatsAppIcon size={15}/> {busy === 'invoice' ? 'Preparing…' : 'WhatsApp bill'}</button>
	</div>
</div>

<header class="order-heading">
	<div class="project-icon">#{order.serial ?? '—'}</div>
	<div>
		<div class="title-line"><button aria-label={order.important ? 'Remove important mark' : 'Mark order important'} title={order.important ? 'Remove important mark' : 'Mark order important'} disabled={busy === 'important'} onclick={toggleImportant} style={`border:0;background:transparent;padding:2px;display:grid;place-items:center;color:${order.important ? '#ef4444' : 'var(--muted)'}`}><Star size={19} fill={order.important ? 'currentColor' : 'none'}/></button><h1>{order.project || 'Untitled project'}</h1><StatusBadge status={order.status}/></div>
		<p>{order.customer} · {order.workType || 'Event not set'}</p>
	</div>
</header>

{#if error}<div class="error">{error}</div>{/if}

<div class="detail-grid">
	<div class="main-col">
		<section class="card">
			<div class="section-head">
				<div><h2>Assigned tasks</h2><p>{activeTasks.filter((task) => task.status === 'Completed').length} completed · {activeTasks.length} active</p></div>
				<div class="section-actions">{#if archivedTasks.length}<button class:active={showArchivedTasks} class="secondary" onclick={() => (showArchivedTasks = !showArchivedTasks)}>{showArchivedTasks ? 'Active tasks' : `Archived (${archivedTasks.length})`}</button>{/if}{#if !showArchivedTasks}<button class="secondary" onclick={() => openTask()}><Plus size={13}/> Assign work</button>{/if}</div>
			</div>
			{#if visibleTasks.length}
				<div class="task-list">
					{#each visibleTasks as task}
						<article class:archived-task={task.archived} class="task-row">
							<div class="task-title"><strong>{task.name}</strong><small>{task.assignee} {task.due ? `· Due ${task.due}` : ''}</small></div>
							<StatusBadge status={task.status}/>
							<div class="task-progress"><div class="progress"><span style:width={`${task.progress}%`}></span></div><small>{task.progress}%</small></div>
							<div class="task-actions">{#if task.archived}<button class="task-restore" title="Restore task" disabled={busy === task.id} onclick={() => restoreTask(task)}><RotateCcw size={14}/></button>{:else}
								<button class="task-edit" title="Edit task" onclick={() => openTask(task)}><Edit3 size={14}/></button>
								{#if task.status === 'Ready for review'}
									<button class="approve" title="Approve" disabled={busy === task.id} onclick={() => updateTask(task, 'Completed', 100)}><Check size={14}/></button>
									<button class="revision" title="Request revision" disabled={busy === task.id} onclick={() => updateTask(task, 'Revision required')}><RotateCcw size={14}/></button>
								{/if}
								<button class="task-archive" title="Archive task" disabled={busy === task.id} onclick={() => archiveTask(task)}><Archive size={14}/></button>
							{/if}</div>
							{#if task.instructions}<p class="instructions">{task.instructions}</p>{/if}
							{#if task.outputLink}<a class="output" href={task.outputLink} target="_blank" rel="noreferrer">Open editor output <ExternalLink size={12}/></a>{/if}
						</article>
					{/each}
				</div>
			{:else if !showArchivedTasks}
				<div class="empty"><p>No work assigned yet.</p><button class="primary" onclick={() => openTask()}><Plus size={13}/> Create first task</button></div>
			{:else}<div class="empty"><p>No archived tasks.</p></div>
			{/if}
		</section>

		<section class="card activity-card">
			<div class="section-head"><div><h2>Activity</h2><p>Order changes and billing history</p></div></div>
			{#if activities.length}
				<div class="activity-list">{#each activities as item}<div><strong>{item.action}</strong><span>{item.details}</span><small>{new Date(item.createdAt).toLocaleString()}</small></div>{/each}</div>
			{:else}<div class="empty"><p>No activity recorded yet.</p></div>{/if}
		</section>
	</div>

	<div class="side-col">
		<section class="card info-card">
			<h2>Order details</h2>
			<dl>
				<div><dt>Customer</dt><dd>{order.customer}</dd></div>
				<div><dt>Mobile</dt><dd>{order.mobile || 'Not added'}</dd></div>
				<div><dt>Received</dt><dd>{order.receiving || '—'}</dd></div>
				<div><dt>Duration</dt><dd>{order.duration || '—'}</dd></div>
				<div><dt>Source</dt><dd>{order.source || '—'}</dd></div>
				<div><dt>Due</dt><dd>{order.due || 'Not set'}</dd></div>
			</dl>
			{#if order.remarks}<p class="remarks">{order.remarks}</p>{/if}
		</section>

		<section class="card people-card">
			<h2>Assigned editors</h2>
			{#if assignedEditors.length}
				{#each assignedEditors as editor}
					<div class="person"><span>{editor.initials}</span><div><strong>{editor.name}</strong><small>{activeTasks.filter((task) => task.editorId === editor.id).length} task(s)</small></div><button class="whatsapp-icon" disabled={busy === editor.id} onclick={() => openEditorWhatsApp(editor)} title="Open WhatsApp"><WhatsAppIcon size={15}/></button></div>
				{/each}
			{:else}<p class="muted">Assign a task to add an editor.</p>{/if}
			<button class="add-person" onclick={() => openTask()}><Plus size={13}/> Assign editor or task</button>
		</section>

		<section class="card invoice-card">
			<div class="invoice-title"><span><FileText size={15}/></span><div><h2>Billing</h2><small>Manual payments</small></div></div>
			<div class="amount"><small>Total</small><strong>{order.priceSet === false ? 'Not set' : money(order.price)}</strong></div>
			<div class="payment-bar"><span style:width={`${paidPercent}%`}></span></div>
			<div class="paid-row"><span>Paid {order.advanceSet === false && !(order.payments || []).length ? 'Not recorded' : money(order.paid)}</span><span>Balance {order.priceSet === false ? 'Not set' : money(Math.max(0, order.price - order.paid))}</span></div>
			<button class="invoice-button" onclick={() => paymentModalOpen = true}><IndianRupee size={13}/> Record payment</button>
		</section>
	</div>
</div>

<TaskModal bind:open={taskModalOpen} orderId={order.id} bind:editors task={editingTask} onsaved={refresh}/>
<PaymentModal bind:open={paymentModalOpen} orderId={order.id} onsaved={refresh}/>

<style>
	:global(html){--border:var(--line);--surface-2:var(--theme-soft);--accent:var(--purple)}
	.detail-top,.actions,.title-line,.section-head,.section-actions,.person,.invoice-title,.amount,.paid-row{display:flex;align-items:center}.detail-top,.section-head,.amount,.paid-row{justify-content:space-between}.detail-top{margin-bottom:28px}.actions,.section-actions{gap:8px}.actions button,.section-head button,.invoice-button{display:flex;align-items:center;gap:7px}.section-actions .active{border-color:var(--purple);color:var(--purple)}.back{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:12px}.order-heading{display:flex;align-items:center;gap:14px;margin-bottom:22px}.project-icon{min-width:48px;height:44px;padding:0 10px;border:1px solid var(--border);background:var(--surface-2);color:var(--accent);display:grid;place-items:center;border-radius:12px;font-size:11px;font-weight:700}.title-line{gap:10px}.title-line h1{font-size:24px;margin:0}.order-heading p{font-size:11px;color:var(--muted);margin:5px 0 0}.error{border:1px solid #ef444455;background:#ef444414;color:#ef7777;border-radius:10px;padding:11px 14px;font-size:11px;margin-bottom:16px}.detail-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px}.main-col,.side-col{display:flex;flex-direction:column;gap:16px}.section-head{padding:17px 18px;border-bottom:1px solid var(--border)}h2{font-size:12px;margin:0}.section-head p{font-size:10px;color:var(--muted);margin:4px 0 0}.task-row{display:grid;grid-template-columns:minmax(180px,1fr) auto 120px auto;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--border)}.task-row:last-child{border-bottom:0}.archived-task{color:var(--muted);text-decoration:line-through;background:color-mix(in srgb,var(--card) 80%,var(--muted) 4%)}.archived-task .task-actions{text-decoration:none}.task-title{display:flex;flex-direction:column;gap:4px}.task-title strong{font-size:11px}.task-title small,.task-progress small{font-size:9px;color:var(--muted)}.task-progress{display:grid;grid-template-columns:1fr 26px;gap:7px;align-items:center}.task-actions{display:flex;gap:4px}.task-actions button,.person button{border:1px solid color-mix(in srgb,var(--accent) 38%,var(--border));background:color-mix(in srgb,var(--accent) 11%,var(--surface-2));color:var(--accent);border-radius:7px;padding:6px;display:grid;place-items:center;transition:border-color .18s ease,background .18s ease,box-shadow .18s ease,transform .15s ease}.task-actions button:not(:disabled):hover,.person button:not(:disabled):hover{border-color:color-mix(in srgb,var(--accent) 78%,#fff);background:color-mix(in srgb,var(--accent) 20%,var(--surface-2));box-shadow:0 7px 18px color-mix(in srgb,var(--accent) 15%,transparent);transform:translateY(-1px)}.task-actions button:disabled,.person button:disabled{cursor:not-allowed;opacity:.46}.task-actions .approve{color:#36c778;border-color:#36c77855;background:#36c77814}.task-actions .revision{color:#f0a14a;border-color:#f0a14a55;background:#f0a14a14}.task-actions .task-archive{color:#fb7185;border-color:#fb71854f;background:#fb718512}.task-actions .task-restore{color:#38bdf8;border-color:#38bdf84f;background:#38bdf812}.instructions,.output{grid-column:1/-1;margin:0;font-size:10px}.instructions{color:var(--muted);line-height:1.6}.output{color:var(--accent);display:flex;align-items:center;gap:5px}.empty{padding:28px;text-align:center;color:var(--muted);font-size:11px}.activity-list{padding:4px 18px 12px}.activity-list>div{display:grid;grid-template-columns:1fr auto;gap:3px 12px;padding:11px 0;border-bottom:1px solid var(--border)}.activity-list>div:last-child{border:0}.activity-list strong{font-size:10px}.activity-list span,.activity-list small{font-size:9px;color:var(--muted)}.activity-list small{grid-row:1;grid-column:2}.info-card,.people-card,.invoice-card{padding:18px}.info-card h2,.people-card h2{margin-bottom:14px}.info-card dl{margin:0}.info-card dl div{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--border);font-size:10px}.info-card dt{color:var(--muted)}.info-card dd{margin:0;text-align:right}.remarks,.muted{font-size:10px;color:var(--muted);line-height:1.6}.remarks{padding-top:12px}.person{gap:9px;margin:11px 0}.person>span,.invoice-title>span{width:31px;height:31px;border-radius:9px;background:var(--surface-2);color:var(--accent);display:grid;place-items:center;font-size:9px;font-weight:700}.person>div{display:flex;flex-direction:column;gap:3px;flex:1}.person strong{font-size:10px}.person small,.invoice-title small{font-size:9px;color:var(--muted)}.add-person{border:0;background:transparent;color:var(--accent);font-size:10px;display:flex;gap:6px;padding:8px 0 0}.invoice-title{gap:9px}.invoice-title>div{display:flex;flex-direction:column;gap:2px}.amount{margin:20px 0 10px}.amount small{color:var(--muted);font-size:10px}.amount strong{font-size:18px}.payment-bar{height:5px;background:var(--surface-2);border-radius:5px;overflow:hidden}.payment-bar span{height:100%;display:block;background:#22c55e}.paid-row{color:var(--muted);font-size:8px;margin-top:7px}.invoice-button{width:100%;justify-content:center;margin-top:16px;border:1px solid color-mix(in srgb,var(--accent) 38%,var(--border));background:color-mix(in srgb,var(--accent) 10%,var(--surface-2));color:var(--accent);border-radius:8px;padding:9px;font-size:10px;transition:border-color .18s ease,background .18s ease,transform .15s ease}.invoice-button:hover{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 18%,var(--surface-2));transform:translateY(-1px)}
	.activity-list{max-height:420px;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
	@media(max-width:1050px){.detail-grid{grid-template-columns:1fr}.side-col{display:grid;grid-template-columns:repeat(3,1fr);align-items:start}}
	@media(max-width:760px){.detail-top{align-items:flex-start;gap:14px}.actions{flex-direction:column;align-items:stretch}.task-row{grid-template-columns:1fr auto}.task-progress{grid-column:1}.task-actions{grid-column:2;grid-row:1/3}.side-col{grid-template-columns:1fr}}
</style>
