<!-- Master owner panel: onboard clients, protect credentials, test connections, and reset demos. -->
<script lang="ts">
		import { enhance } from '$app/forms';
		import { untrack } from 'svelte';
		import type { SubmitFunction } from '@sveltejs/kit';
		import { CheckCircle2, ChevronDown, CircleHelp, Database, Eye, EyeOff, KeyRound, Layers3, LogOut, Pencil, Plus, RefreshCw, ShieldCheck, Sheet, SlidersHorizontal, Tags, TriangleAlert, X } from '@lucide/svelte';
		import ModuleConfigurationPanel from '$lib/components/ModuleConfigurationPanel.svelte';
		import RequiredMark from '$lib/components/RequiredMark.svelte';
		import { themePalettes } from '$lib/theme';
		let { data, form } = $props();
		let creating = $state(false);
		let pendingAction = $state('');
		let credentialTenant = $state('');
		let connectionTenant = $state('');
		let showCreatePassword = $state(false);
		let showClientPassword = $state(false);
		let showDatabaseUrl = $state(false);
		let showOwnerPassword = $state(false);
		let noticeVisible = $state(false);
		let noticeTimer: ReturnType<typeof setTimeout> | undefined;
		let packageBaseId = $state('general-service');
		let packageFields = $state([{ entity: 'order', key: '', label: '', type: 'text', options: '' }]);
		let tenantConfigurations = $state(untrack(() => Object.fromEntries(data.tenants.map((tenant: any) => [tenant.id, structuredClone(tenant.configuration)]))));
		$effect(() => {
			if (form?.error || form?.success) noticeVisible = true;
		});
		const terminologyFields = [
			{ key: 'customer', title: 'People you serve', usage: 'Used for customer records, menus, and buttons.' },
			{ key: 'order', title: 'Main work or booking', usage: 'Used for the primary work item, such as a job or appointment.' },
			{ key: 'staff', title: 'People doing the work', usage: 'Used for employees, technicians, stylists, or team members.' },
			{ key: 'task', title: 'Steps inside the work', usage: 'Used for smaller activities required to finish the main work.' },
			{ key: 'category', title: 'Service grouping', usage: 'Used to group services, repairs, treatments, or work types.' },
			{ key: 'project', title: 'Work title', usage: 'Used for the name shown on each job, booking, or project.' },
			{ key: 'dueDate', title: 'Date the work is due', usage: 'Used wherever the expected finish date is shown.' },
			{ key: 'delivery', title: 'Finished handover', usage: 'Used for completion, collection, delivery, or final handover.' },
			{ key: 'assignedAsset', title: 'Assigned equipment or resource', usage: 'Used for a bay, chair, vehicle, device, room, or other resource.' }
		] as const;
		const packageBase = $derived(data.packages.find((item: any) => item.id === packageBaseId) || data.packages[0]);
		const connectionLabel = (status: string) => status === 'healthy' ? 'Services online' : status === 'error' ? 'Connection issue' : 'Not checked';
		const snapshotDate = (value: string) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
		const addPackageField = () => packageFields = [...packageFields, { entity: 'order', key: '', label: '', type: 'text', options: '' }];
		const removePackageField = (index: number) => packageFields = packageFields.filter((_, position) => position !== index);
		const track = (key: string, close?: () => void): SubmitFunction => () => {
			pendingAction = key;
			return async ({ result, update }) => {
				try {
					await update();
					noticeVisible = true;
					if (noticeTimer) clearTimeout(noticeTimer);
					noticeTimer = setTimeout(() => noticeVisible = false, result.type === 'success' ? 4500 : 9000);
					if (result.type === 'success') close?.();
				}
				finally { pendingAction = ''; }
			};
		};
		const closeCredentials = () => { credentialTenant = ''; showClientPassword = false; };
		const closeConnections = () => { connectionTenant = ''; showDatabaseUrl = false; };
	</script>

<svelte:head><title>Workspace administration — NexaDesk</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<header class="owner-head"><a href="/owner"><b>ND</b><span><strong>NexaDesk</strong><small>Platform administration</small></span></a><div><span>{data.account?.email || 'Administrator'}</span><a href="/logout"><LogOut size={15}/>Sign out</a></div></header>
<main class="owner-main">
	<section class="intro"><div><p>Platform administration</p><h1>Workspace management</h1><span>Set up workspaces, monitor connected services, and manage secure access.</span></div><button onclick={() => creating = !creating}><Plus size={16}/>{creating ? 'Close setup' : 'Add workspace'}</button></section>
	{#if noticeVisible && form?.error}<div class="owner-notice error" role="alert"><TriangleAlert size={16}/><span>{form.error}</span><button type="button" onclick={() => noticeVisible = false} aria-label="Dismiss notification"><X size={14}/></button></div>{:else if noticeVisible && form?.success}<div class="owner-notice success" role="status"><CheckCircle2 size={16}/><span>{form.success}</span><button type="button" onclick={() => noticeVisible = false} aria-label="Dismiss notification"><X size={14}/></button></div>{/if}

	{#if creating}
	<section class="panel create-panel"><h2>Create a workspace</h2><p>Connect its Neon database and Google Sheet, then create the first administrator login.</p>
		<form method="POST" action="?/create" use:enhance={track('create')}>
			<div class="grid">
				<label>Internal workspace name <RequiredMark/><small>Only visible in platform administration.</small><input name="internalName" placeholder="Example: North Region Team" required aria-required="true" /></label>
				<label>Workspace URL name <RequiredMark/><small>Lowercase letters, numbers, and hyphens.</small><input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="anjana-creations" required aria-required="true" /></label>
				<label>Workspace display name <RequiredMark/><small>Shown to people inside this workspace.</small><input name="studioName" placeholder="Example: North Region Operations" required aria-required="true" /></label>
				<label>Starting niche package<small>Sets terminology and the first capability bundle.</small><select name="packageId">{#each data.packages as item}<option value={item.id}>{item.name}</option>{/each}</select></label>
				<label>Logo URL <small>Optional HTTPS image address.</small><input name="logoUrl" placeholder="https://example.com/logo.png" /></label>
				<label>Administrator email <RequiredMark/><small>Used on the main sign-in page.</small><input name="email" type="email" autocomplete="off" placeholder="admin@example.com" required aria-required="true" /></label>
				<label>First password <RequiredMark/><small>Minimum 10 characters.</small><span class="secret-input"><input name="password" type={showCreatePassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Create a secure first password" required aria-required="true" /><button type="button" onclick={() => showCreatePassword = !showCreatePassword} aria-label={showCreatePassword ? 'Hide passwords' : 'Show passwords'}>{#if showCreatePassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
				<label>Confirm first password <RequiredMark/><small>Enter the same password again.</small><span class="secret-input"><input name="passwordConfirm" type={showCreatePassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Repeat the first password" required aria-required="true" /><button type="button" onclick={() => showCreatePassword = !showCreatePassword} aria-label={showCreatePassword ? 'Hide passwords' : 'Show passwords'}>{#if showCreatePassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
				<label class="wide">Neon database connection URL <RequiredMark/><small>Stored encrypted. Find it in Neon → Project → Connect.</small><input name="databaseUrl" type="password" autocomplete="off" placeholder="postgresql://user:password@host/database?sslmode=require" required aria-required="true" /></label>
				<label>Google Sheet ID <RequiredMark/><small>Copy the long ID between /d/ and /edit in the Sheet URL.</small><input name="googleSheetId" placeholder="1AbC…xyz from the Google Sheet URL" required aria-required="true" /></label>
				<label>Orders sheet tab <RequiredMark/><small>Usually keep this as Orders.</small><input name="ordersTab" value="Orders" required aria-required="true" /></label>
			</div>
			<div class="checks"><label><input name="attachExisting" type="checkbox" /> Attach existing NexaDesk data</label><label><input name="isDemo" type="checkbox" /> This is a resettable demo workspace</label></div>
			<button class="primary" disabled={pendingAction !== ''} aria-busy={pendingAction === 'create'}>{#if pendingAction === 'create'}<RefreshCw class="loading-icon" size={15}/>{:else}<Plus size={15}/>{/if}{pendingAction === 'create' ? 'Validating…' : 'Validate and create workspace'}</button>
		</form>
	</section>
	{/if}

	<details class="panel package-builder">
		<summary>
			<span class="summary-icon"><Layers3 size={17}/></span>
			<span><strong>Create a reusable niche package</strong><small>Configure language, fields, and features once, then reuse the setup for future workspaces.</small></span>
			<span class="summary-action">Open builder</span>
		</summary>
		<div class="package-intro"><CircleHelp size={16}/><span>Start from the closest existing package. Your changes create a new template and will not alter live workspaces.</span></div>
		<form method="POST" action="?/package" use:enhance={track('package')}>
			<section class="builder-section">
				<header class="section-heading">
					<span><Tags size={15}/></span>
					<div><p>Step 1</p><h3>Package identity</h3><small>Name the template and select the closest starting point.</small></div>
				</header>
				<div class="grid identity-grid">
					<label>
						<span class="label-line">Package ID <RequiredMark/> <button type="button" class="help-tip" aria-label="Help for package ID"><CircleHelp size={13}/><span role="tooltip">A permanent technical ID. Use a short lowercase value with hyphens. It cannot contain spaces.</span></button></span>
						<small>Used internally and in saved configuration.</small>
						<input name="packageId" placeholder="e.g. electronics-repair" required aria-required="true" pattern="[a-z0-9]+(?:-[a-z0-9]+)*"/>
					</label>
					<label>
						<span class="label-line">Package name <RequiredMark/> <button type="button" class="help-tip" aria-label="Help for package name"><CircleHelp size={13}/><span role="tooltip">The friendly name administrators see when assigning this package to a workspace.</span></button></span>
						<small>Shown in package and workspace selectors.</small>
						<input name="packageName" placeholder="e.g. Electronics Repair" required aria-required="true"/>
					</label>
					<label>
						<span class="label-line">Base package <button type="button" class="help-tip" aria-label="Help for base package"><CircleHelp size={13}/><span role="tooltip">Choose the package closest to this workflow. Its wording, options, and allowed features are copied as your starting point.</span></button></span>
						<small>Copies a safe starting configuration.</small>
						<select name="basePackageId" bind:value={packageBaseId}>{#each data.packages as item}<option value={item.id}>{item.name}</option>{/each}</select>
					</label>
					<label>
						<span class="label-line">Short description <button type="button" class="help-tip" aria-label="Help for short description"><CircleHelp size={13}/><span role="tooltip">Summarize the workflow this package supports. This helps administrators choose the right package later.</span></button></span>
						<small>Keep it clear and under one sentence.</small>
						<input name="packageDescription" placeholder="e.g. Repairs, technicians, billing and customer updates"/>
					</label>
				</div>
			</section>

			<section class="builder-section">
				<header class="section-heading">
					<span><SlidersHorizontal size={15}/></span>
					<div><p>Step 2</p><h3>Names shown in the app</h3><small>Choose the words people will see in menus, buttons, forms, and lists.</small></div>
				</header>
				<div class="term-example"><CircleHelp size={15}/><span><b>Example:</b> A repair shop can use <b>Job</b> for one record and <b>Jobs</b> for the list. A salon can use <b>Appointment</b> and <b>Appointments</b>.</span></div>
				<div class="term-legend"><span>What this controls</span><span>Name for one item</span><span>Name for a list</span></div>
				<div class="terminology-grid">
					{#each terminologyFields as field}
						<label>
							<span class="term-key"><b>{field.title}</b><small>{field.usage}</small></span>
							<span class="term-input"><small>For one item</small><input name={`term:${field.key}:singular`} value={packageBase?.profile.terminology[field.key].singular} placeholder="Example: Job" aria-label={`${field.title}: name for one item`}/></span>
							<span class="term-input"><small>For a list</small><input name={`term:${field.key}:plural`} value={packageBase?.profile.terminology[field.key].plural} placeholder="Example: Jobs" aria-label={`${field.title}: name for a list`}/></span>
						</label>
					{/each}
				</div>
				<label class="category-options">
					<span class="label-line">Default categories / service types <button type="button" class="help-tip" aria-label="Help for default service types"><CircleHelp size={13}/><span role="tooltip">Enter the standard options this niche uses. Separate each option with a comma; administrators can refine the list later.</span></button></span>
					<small>Use a comma between choices, for example: Screen repair, Battery replacement, Diagnostics.</small>
					<input name="categoryOptions" value={packageBase?.profile.optionLists.categories?.join(', ') || ''} placeholder="Screen repair, Battery replacement, Diagnostics"/>
				</label>
			</section>

			<section class="builder-section">
				<div class="package-fields-head">
					<div class="section-heading">
						<span><Plus size={15}/></span>
						<div><p>Step 3</p><h3>Default custom fields</h3><small>Add information this niche needs beyond the standard fields.</small></div>
					</div>
					<button type="button" onclick={addPackageField}><Plus size={14}/>Add another field</button>
				</div>
				<div class="field-guide"><CircleHelp size={15}/><span><b>Example:</b> An electronics repair package could add “Device serial number” to each order. The stable key would be <code>device_serial_number</code>.</span></div>
				<input type="hidden" name="customFieldCount" value={packageFields.length}/>
				<div class="package-fields">
					{#each packageFields as custom, index}
						<div class="package-field">
							<div class="field-cell"><span>Attach to</span><select name={`custom:${index}:entity`} bind:value={custom.entity} aria-label="Record type"><option value="customer">Customer</option><option value="order">Order</option><option value="task">Task</option><option value="staff">Staff</option></select></div>
							<div class="field-cell"><span>Field label</span><input name={`custom:${index}:label`} bind:value={custom.label} placeholder="e.g. Device serial number" aria-label="Field label"/></div>
							<div class="field-cell"><span>Stable key</span><input name={`custom:${index}:key`} bind:value={custom.key} placeholder="e.g. device_serial_number" aria-label="Stable key"/></div>
							<div class="field-cell"><span>Answer type</span><select name={`custom:${index}:type`} bind:value={custom.type} aria-label="Field type"><option value="text">Text</option><option value="textarea">Long text</option><option value="number">Number</option><option value="date">Date</option><option value="datetime">Date and time</option><option value="select">Select</option><option value="checkbox">Checkbox</option><option value="url">HTTPS link</option></select></div>
							<div class="field-cell"><span>Select choices</span><input name={`custom:${index}:options`} bind:value={custom.options} placeholder={custom.type === 'select' ? 'Option one, Option two' : 'Available for Select fields'} disabled={custom.type !== 'select'} aria-label="Select choices"/></div>
							<button type="button" class="remove-field" onclick={() => removePackageField(index)} disabled={packageFields.length === 1}>Remove</button>
							<div class="field-surfaces">
								<span>Show this field in:</span>
								<label><input type="checkbox" name={`custom:${index}:required`}/>Required</label>
								<label><input type="checkbox" name={`custom:${index}:customerPortal`}/>Customer portal</label>
								<label><input type="checkbox" name={`custom:${index}:staffPortal`}/>Staff portal</label>
								<label><input type="checkbox" name={`custom:${index}:whatsapp`}/>WhatsApp</label>
								<label><input type="checkbox" name={`custom:${index}:sheets`} checked/>Google Sheets</label>
								<label><input type="checkbox" name={`custom:${index}:export`} checked/>Excel export</label>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section class="builder-section">
				<header class="section-heading">
					<span><ShieldCheck size={15}/></span>
					<div><p>Step 4</p><h3>Included features</h3><small>Select what a workspace assigned to this package can use.</small></div>
				</header>
				<div class="capability-grid">{#each data.capabilityDefinitions as definition}<label><input type="checkbox" name={`package-capability:${definition.key}`} checked={packageBase?.allowed[definition.key] !== false}/><span><b>{definition.label}</b><small>{definition.description}</small></span></label>{/each}</div>
			</section>
			<section class="builder-section">
				<header class="section-heading">
					<span><SlidersHorizontal size={15}/></span>
					<div><p>Step 5</p><h3>Portal workflow defaults</h3><small>Set the safe starting experience. Refine individual workspaces below.</small></div>
				</header>
				<div class="grid identity-grid">
					<label>Customer portal mode<select name="customerPortalMode" value={packageBase?.moduleConfiguration?.['portal.customer']?.mode || 'full'}><option value="status-only">Status only</option><option value="status-billing">Status + billing</option><option value="full">Full portal</option></select></label>
					<label>Worker portal mode<select name="staffPortalMode" value={packageBase?.moduleConfiguration?.['work.staffPortal']?.mode || 'full'}><option value="assignments-only">Assignments only</option><option value="progress-updates">Progress updates</option><option value="full">Full portal</option></select></label>
					<label>Progress display<select name="progressMode" value={packageBase?.moduleConfiguration?.['portal.customer']?.progressMode || 'both'}><option value="milestones">Milestones</option><option value="percentage">Percentage</option><option value="both">Milestones + percentage</option></select></label>
					<label>Completion experience<select name="deliveryExperience" value={packageBase?.moduleConfiguration?.['portal.customer']?.deliveryExperience || 'completion'}><option value="digital">Digital delivery</option><option value="pickup">Pickup / collection</option><option value="appointment">Appointment completion</option><option value="fulfilment">Order fulfilment</option><option value="handover">Project handover</option><option value="completion">General completion</option></select></label>
				</div>
			</section>
			<div class="builder-footer"><span><ShieldCheck size={15}/>You can review the package before assigning it to a live workspace.</span><button class="primary" disabled={pendingAction !== ''}>{pendingAction === 'package' ? 'Creating…' : 'Create niche package'}</button></div>
		</form>
	</details>

	<section class="tenant-grid">
		{#each data.tenants as tenant}
		<details class="panel tenant-card">
			<summary class="tenant-top"><div class="tenant-logo">{#if tenant.logoUrl}<img src={tenant.logoUrl} alt="" />{:else}{tenant.internalName.slice(0,2).toUpperCase()}{/if}</div><div><span class="slug">Workspace · /{tenant.slug}</span><h2>{tenant.internalName}</h2><p>{tenant.studioName}</p></div><span class:healthy={tenant.connectionStatus === 'healthy'} class:error-state={tenant.connectionStatus === 'error'} class:unchecked={tenant.connectionStatus !== 'healthy' && tenant.connectionStatus !== 'error'} class="health" title={tenant.connectionStatus === 'healthy' ? 'The database and Google Sheet connections passed the latest check.' : tenant.connectionStatus === 'error' ? 'One or more connected services failed the latest check. Open the error details and test again.' : 'Run Test connections to confirm the database and Google Sheet are available.'}><i aria-hidden="true"></i>{connectionLabel(tenant.connectionStatus)}</span><span class="tenant-chevron"><ChevronDown size={18}/></span></summary>
			<div class="tenant-body">
			<p class="tenant-package">Package: <b>{tenant.packageName} · v{tenant.packageVersion}</b>{#if tenant.packageUpdateAvailable}<span>Update available</span>{/if}</p>
			<div class="facts"><span><Database size={15}/><small>Neon database</small><b>{tenant.databaseName}</b><em>{tenant.databaseRole}@{tenant.databaseHost}</em></span><span><Sheet size={15}/><small>Google Sheet</small><b>{tenant.googleSheetId ? `${tenant.googleSheetId.slice(0,8)}…${tenant.googleSheetId.slice(-4)}` : 'Not configured'}</b><em>Tab: {tenant.ordersTab || 'Orders'}</em></span><span><KeyRound size={15}/><small>Administrator login</small><b>{tenant.adminEmail}</b><em>Password protected · {tenant.activeSessions} active session{tenant.activeSessions === 1 ? '' : 's'}</em></span></div>
			{#if tenant.storage || tenant.settings}<div class="owner-metrics">{#if tenant.storage}<span><Database size={15}/><small>Database usage</small><b>{tenant.storage.percent}% used</b><em>{Math.max(0, tenant.storage.limitMb - tenant.storage.bytes / 1024 / 1024).toFixed(1)} MB monitored space remaining</em></span>{/if}{#if tenant.settings}<span><SlidersHorizontal size={15}/><small>Workspace theme</small><b>{themePalettes.find((item) => item.id === tenant.settings.themePalette)?.name || tenant.settings.themePalette}</b><em>{tenant.settings.themeDefaultMode} mode</em></span>{/if}</div>{/if}
			{#if tenant.connectionError}<div class="connection-error">{tenant.connectionError}</div>{/if}
			<div class="actions">
				<form method="POST" action="?/test" use:enhance={track(`test:${tenant.id}`)}><input type="hidden" name="tenantId" value={tenant.id}/><button disabled={pendingAction !== ''} aria-busy={pendingAction === `test:${tenant.id}`}>{#if pendingAction === `test:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>{:else}<RefreshCw size={13}/>{/if}{pendingAction === `test:${tenant.id}` ? 'Testing…' : 'Test connections'}</button></form>
				<form method="POST" action="?/status" use:enhance={track(`status:${tenant.id}`)}><input type="hidden" name="tenantId" value={tenant.id}/><select name="status" value={tenant.status} disabled={pendingAction !== ''}><option value="draft">Draft</option><option value="active">Active</option><option value="suspended">Suspended</option></select><button disabled={pendingAction !== ''} aria-busy={pendingAction === `status:${tenant.id}`}>{#if pendingAction === `status:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>{/if}{pendingAction === `status:${tenant.id}` ? 'Saving…' : 'Save status'}</button></form>
			</div>
			<div class="edit-buttons">
				<button type="button" onclick={() => credentialTenant = tenant.id}><Pencil size={13}/>Edit login ID or password</button>
				<button type="button" onclick={() => connectionTenant = tenant.id}><Pencil size={13}/>Edit stored services</button>
			</div>
			<details class="capability-editor">
				<summary>Package and allowed capabilities</summary>
				<form method="POST" action="?/capabilities" use:enhance={track(`capabilities:${tenant.id}`)}>
					<input type="hidden" name="tenantId" value={tenant.id}/>
					<label class="package-select">Niche package<select name="packageId" value={tenant.packageId}>{#each data.packages as item}<option value={item.id}>{item.name} · v{item.version}</option>{/each}</select></label>
					<div class="capability-grid">{#each data.capabilityDefinitions as definition}<label><input type="checkbox" name={`capability:${definition.key}`} checked={Boolean(tenant.entitlements?.[definition.key])}/><span><b>{definition.label}</b><small>{definition.description}</small></span></label>{/each}</div>
					<button disabled={pendingAction !== ''}>{pendingAction === `capabilities:${tenant.id}` ? 'Applying…' : 'Apply package and allowances'}</button>
				</form>
			</details>
			<details class="modules-editor">
				<summary>Customer portal, worker portal and WhatsApp templates</summary>
				<form method="POST" action="?/modules" use:enhance={track(`modules:${tenant.id}`)}>
					<input type="hidden" name="tenantId" value={tenant.id}/>
					<ModuleConfigurationPanel configuration={tenantConfigurations[tenant.id]}/>
					<input type="hidden" name="moduleConfiguration" value={JSON.stringify(tenantConfigurations[tenant.id].moduleConfiguration)}/>
					<button class="module-save" disabled={pendingAction !== ''} aria-busy={pendingAction === `modules:${tenant.id}`}>{#if pendingAction === `modules:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>Saving…{:else}<ShieldCheck size={13}/>Save portal and messaging setup{/if}</button>
				</form>
			</details>
			{#if tenant.snapshots?.length}<details class="rollback-editor">
				<summary>Configuration history and rollback</summary>
				<div class="snapshot-list">
					{#each tenant.snapshots as snapshot}
						<form method="POST" action="?/rollback" use:enhance={track(`rollback:${tenant.id}:${snapshot.id}`)}>
							<input type="hidden" name="tenantId" value={tenant.id}/><input type="hidden" name="snapshotId" value={snapshot.id}/>
							<span><b>{snapshot.label}</b><small>{snapshotDate(snapshot.createdAt)}</small></span>
							<button disabled={pendingAction !== ''} aria-busy={pendingAction === `rollback:${tenant.id}:${snapshot.id}`}>{pendingAction === `rollback:${tenant.id}:${snapshot.id}` ? 'Restoring…' : 'Restore'}</button>
						</form>
					{/each}
				</div>
			</details>{/if}

			{#if credentialTenant === tenant.id}
				<!-- Client passwords are replaced here; their one-way hashes cannot be revealed. -->
				<div class="modal-backdrop" role="presentation">
					<div class="owner-modal" role="dialog" aria-modal="true" aria-labelledby={`login-title-${tenant.id}`}>
						<header><div><span>Workspace access</span><h2 id={`login-title-${tenant.id}`}>Edit administrator login</h2></div><button type="button" class="icon-button" onclick={closeCredentials} aria-label="Close login popup"><X size={17}/></button></header>
						<div class="current-details"><span><KeyRound size={14}/><small>Current login ID</small><b>{tenant.adminEmail}</b></span><span><EyeOff size={14}/><small>Current password</small><b>Secure hash · cannot be viewed</b></span></div>
						<p class="modal-copy">Passwords cannot be displayed. Enter a new password twice to replace it. Saving signs out existing workspace sessions.</p>
						<form method="POST" action="?/credentials" class="modal-form" use:enhance={track(`credentials:${tenant.id}`, closeCredentials)}>
							<input type="hidden" name="tenantId" value={tenant.id}/>
							<label>Administrator email <RequiredMark/><input name="email" type="email" value={tenant.adminEmail} autocomplete="off" required aria-required="true"/></label>
							<label>New password <small>Optional · leave both password fields empty to keep the current password.</small><span class="secret-input"><input name="password" type={showClientPassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Minimum 10 characters"/><button type="button" onclick={() => showClientPassword = !showClientPassword} aria-label={showClientPassword ? 'Hide new passwords' : 'Show new passwords'}>{#if showClientPassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
							<label>Confirm new password<span class="secret-input"><input name="passwordConfirm" type={showClientPassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Enter the same password again"/><button type="button" onclick={() => showClientPassword = !showClientPassword} aria-label={showClientPassword ? 'Hide new passwords' : 'Show new passwords'}>{#if showClientPassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
							<div class="confirmation"><ShieldCheck size={15}/><span>Saving updates the login and signs out this workspace’s active sessions.</span></div>
							<footer><button type="button" class="secondary" onclick={closeCredentials}>Cancel</button><button class="save-button" disabled={pendingAction !== ''} aria-busy={pendingAction === `credentials:${tenant.id}`}>{#if pendingAction === `credentials:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>Saving…{:else}<CheckCircle2 size={14}/>Confirm and save login{/if}</button></footer>
						</form>
					</div>
				</div>
			{/if}

			{#if connectionTenant === tenant.id}
				<!-- Only safe Neon metadata is displayed; replacing the secret requires two matching URLs. -->
				<div class="modal-backdrop" role="presentation">
					<div class="owner-modal wide-modal" role="dialog" aria-modal="true" aria-labelledby={`service-title-${tenant.id}`}>
						<header><div><span>Stored services</span><h2 id={`service-title-${tenant.id}`}>Review or replace connections</h2></div><button type="button" class="icon-button" onclick={closeConnections} aria-label="Close services popup"><X size={17}/></button></header>
						<div class="current-details service-details"><span><Database size={14}/><small>Current Neon database</small><b>{tenant.databaseName}</b><em>Role {tenant.databaseRole} · Host {tenant.databaseHost}</em></span><span><EyeOff size={14}/><small>Database password</small><b>Encrypted · never displayed</b></span><span><Sheet size={14}/><small>Current Google Sheet ID</small><b>{tenant.googleSheetId || 'Not configured'}</b><em>Tab {tenant.ordersTab || 'Orders'}</em></span></div>
						<form method="POST" action="?/connections" class="modal-form service-form" use:enhance={track(`connections:${tenant.id}`, closeConnections)}>
							<input type="hidden" name="tenantId" value={tenant.id}/>
							<label>Workspace display name <RequiredMark/><input name="studioName" value={tenant.studioName} required aria-required="true"/></label>
							<label>Logo URL<input name="logoUrl" value={tenant.logoUrl} placeholder="Optional HTTPS logo URL"/></label>
							<label class="wide">Replacement Neon URL <small>Leave both URL fields empty to keep the current encrypted connection.</small><span class="secret-input"><input name="databaseUrl" type={showDatabaseUrl ? 'text' : 'password'} autocomplete="off" placeholder="Paste a new Neon URL only when replacing it"/><button type="button" onclick={() => showDatabaseUrl = !showDatabaseUrl} aria-label={showDatabaseUrl ? 'Hide replacement URLs' : 'Show replacement URLs'}>{#if showDatabaseUrl}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
							<label class="wide">Confirm replacement Neon URL<span class="secret-input"><input name="databaseUrlConfirm" type={showDatabaseUrl ? 'text' : 'password'} autocomplete="off" placeholder="Paste the same replacement URL again"/><button type="button" onclick={() => showDatabaseUrl = !showDatabaseUrl} aria-label={showDatabaseUrl ? 'Hide replacement URLs' : 'Show replacement URLs'}>{#if showDatabaseUrl}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
							<label>Google Sheet ID<input name="googleSheetId" value={tenant.googleSheetId}/></label>
							<label>Orders sheet tab<input name="ordersTab" value={tenant.ordersTab} placeholder="Orders"/></label>
							<label>Workspace theme<select name="themePalette" value={tenant.settings?.themePalette || 'graphite-aqua'}>{#each themePalettes as palette}<option value={palette.id}>{palette.name}</option>{/each}</select></label>
							<label>Default appearance<select name="themeDefaultMode" value={tenant.settings?.themeDefaultMode || 'light'}><option value="light">Light mode</option><option value="dark">Dark mode</option></select></label>
							<div class="confirmation wide"><ShieldCheck size={15}/><span>NexaDesk validates both connections before saving. A successful change signs out existing workspace sessions.</span></div>
							<footer class="wide"><button type="button" class="secondary" onclick={closeConnections}>Cancel</button><button class="save-button" disabled={pendingAction !== ''} aria-busy={pendingAction === `connections:${tenant.id}`}>{#if pendingAction === `connections:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>Checking…{:else}<CheckCircle2 size={14}/>Confirm and save services{/if}</button></footer>
						</form>
					</div>
				</div>
			{/if}
			{#if tenant.isDemo}<details class="danger"><summary>Reset demo data</summary><form method="POST" action="?/reset" class="inline-form" use:enhance={track(`reset:${tenant.id}`)}><input type="hidden" name="tenantId" value={tenant.id}/><label>Confirmation <RequiredMark/><input name="confirmation" placeholder="Type RESET" required aria-required="true"/></label><button disabled={pendingAction !== ''} aria-busy={pendingAction === `reset:${tenant.id}`}>{#if pendingAction === `reset:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>{/if}{pendingAction === `reset:${tenant.id}` ? 'Resetting…' : 'Reset database and Sheet'}</button></form></details>{/if}
			</div>
		</details>
		{/each}
		{#if !data.tenants.length}<div class="panel empty">No workspaces yet. Add the first workspace.</div>{/if}
	</section>
	<section class="panel owner-security"><ShieldCheck size={20}/><div><h2>Platform administrator password</h2><p>The current password cannot be displayed. Enter the new password twice; saving signs out every platform administrator session, including this one.</p></div><form method="POST" action="?/ownerPassword" use:enhance={track('owner-password')}><label>New administrator password <RequiredMark/><span class="secret-input"><input name="password" type={showOwnerPassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Minimum 10 characters" required aria-required="true"/><button type="button" onclick={() => showOwnerPassword = !showOwnerPassword} aria-label={showOwnerPassword ? 'Hide administrator passwords' : 'Show administrator passwords'}>{#if showOwnerPassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label><label>Confirm administrator password <RequiredMark/><span class="secret-input"><input name="passwordConfirm" type={showOwnerPassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Enter the same password again" required aria-required="true"/><button type="button" onclick={() => showOwnerPassword = !showOwnerPassword} aria-label={showOwnerPassword ? 'Hide administrator passwords' : 'Show administrator passwords'}>{#if showOwnerPassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label><button disabled={pendingAction !== ''} aria-busy={pendingAction === 'owner-password'}>{#if pendingAction === 'owner-password'}<RefreshCw class="loading-icon" size={13}/>{/if}{pendingAction === 'owner-password' ? 'Changing password…' : 'Confirm password change'}</button></form></section>
</main>

<style>
	.owner-head{height:68px;padding:0 max(22px,calc((100vw - 1180px)/2));display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);background:var(--card)}.owner-head>a,.owner-head>div,.owner-head>div>a{display:flex;align-items:center;gap:10px}.owner-head>a>b{width:35px;height:35px;border-radius:10px;background:var(--purple);color:white;display:grid;place-items:center}.owner-head a span{display:flex;flex-direction:column}.owner-head strong{font-size:12px}.owner-head small,.owner-head>div>span{font-size:8px;color:var(--muted)}.owner-head>div>a{font-size:9px;color:var(--purple)}
	.owner-main{max-width:1180px;margin:0 auto;padding:36px 22px 80px}.intro{display:flex;justify-content:space-between;align-items:end;margin-bottom:22px}.intro p,.slug{margin:0 0 6px;color:var(--purple);font-size:9px;text-transform:uppercase;letter-spacing:.1em}.intro h1{font-size:26px;margin:0 0 7px}.intro span{font-size:10px;color:var(--muted)}.intro button,.primary{display:flex;align-items:center;gap:7px;border:0;border-radius:9px;background:var(--purple);color:white;padding:11px 15px}.owner-notice{position:fixed;z-index:120;top:82px;right:22px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:flex-start;gap:9px;width:min(420px,calc(100vw - 28px));box-sizing:border-box;padding:13px 14px;border:1px solid currentColor;border-radius:12px;background:var(--card);box-shadow:0 20px 55px #0f172a2b;font-size:10px;line-height:1.45;animation:notice-in .2s ease-out}.owner-notice :global(svg){flex:0 0 auto;margin-top:1px}.owner-notice>button{width:26px;height:26px;display:grid;place-items:center;padding:0;border:0;border-radius:7px;background:transparent;color:currentColor}.owner-notice.error,.connection-error{background:color-mix(in srgb,var(--card) 92%,#ef4444 8%);color:#dc2626}.owner-notice.success{background:color-mix(in srgb,var(--card) 92%,#10b981 8%);color:#047857}@keyframes notice-in{from{opacity:0;transform:translateY(-8px) scale(.98)}}@media(max-width:620px){.owner-notice{top:76px;right:14px}}
	.panel{border:1px solid color-mix(in srgb,var(--line) 78%,var(--purple));border-radius:18px;background:var(--card);padding:22px;box-shadow:0 12px 36px #0f172a0b}.create-panel{margin-bottom:20px}.panel h2{margin:0;font-size:15px}.panel>p{font-size:10px;color:var(--muted)}
	input:not([type="checkbox"]):not([type="hidden"]),select{width:100%;min-width:0;height:44px;box-sizing:border-box;border:1px solid color-mix(in srgb,var(--line) 76%,#94a3b8);border-radius:10px;background:color-mix(in srgb,var(--card) 96%,var(--theme-soft));color:var(--theme-text);padding:0 12px;font:inherit;font-size:11px;outline:0;box-shadow:inset 0 1px 2px #0f172a08;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}input:not([type="checkbox"]):not([type="hidden"])::placeholder{color:color-mix(in srgb,var(--muted) 78%,transparent);opacity:1}input:not([type="checkbox"]):not([type="hidden"]):hover,select:hover{border-color:color-mix(in srgb,var(--purple) 42%,var(--line));background:var(--card)}input:not([type="checkbox"]):not([type="hidden"]):focus,select:focus{border-color:var(--purple);background:var(--card);box-shadow:0 0 0 4px color-mix(in srgb,var(--purple) 12%,transparent),0 8px 22px #0f172a0a}input:not([type="checkbox"]):not([type="hidden"]):disabled{cursor:not-allowed;background:color-mix(in srgb,var(--theme-soft) 78%,var(--card));color:var(--muted);opacity:.72}
	input[type="checkbox"]{width:16px;height:16px;margin:0;accent-color:var(--purple)}
	.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:18px 0}.grid label,.owner-security label{position:relative;display:grid;gap:7px;font-size:11px;color:var(--theme-text);font-weight:680}.grid label small{color:var(--muted);font-size:9px;font-weight:450;line-height:1.45}.grid .wide{grid-column:1/-1}.checks{display:flex;gap:20px;margin-bottom:16px}.checks label{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--muted)}.checks input{width:auto}
	.package-builder{margin-bottom:20px;padding:0;overflow:visible;border-color:color-mix(in srgb,var(--purple) 24%,var(--line));box-shadow:0 18px 48px #0f172a0d}.package-builder>summary{list-style:none;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:13px;padding:19px 21px;cursor:pointer;color:var(--theme-text)}.package-builder>summary::-webkit-details-marker{display:none}.summary-icon,.section-heading>span{width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:color-mix(in srgb,var(--purple) 11%,var(--card));color:var(--purple)}.package-builder>summary>span:nth-child(2){display:grid;gap:4px}.package-builder>summary strong{font-size:13px}.package-builder>summary small{color:var(--muted);font-size:9px;font-weight:450;line-height:1.45}.summary-action{display:flex;align-items:center;gap:6px;border:1px solid color-mix(in srgb,var(--purple) 30%,var(--line));border-radius:999px;background:color-mix(in srgb,var(--purple) 7%,var(--card));color:var(--purple);padding:7px 10px;font-size:9px;font-weight:700}.summary-action::after{content:'↓';font-size:11px;transition:transform .18s ease}.package-builder[open] .summary-action::after{transform:rotate(180deg)}.package-builder[open]>summary{border-bottom:1px solid var(--line)}.package-intro,.field-guide,.term-example{display:flex;align-items:flex-start;gap:9px;margin:18px 20px 0;padding:11px 12px;border:1px solid color-mix(in srgb,var(--purple) 18%,var(--line));border-radius:10px;background:color-mix(in srgb,var(--purple) 6%,var(--card));color:var(--muted);font-size:9px;line-height:1.5}.package-intro :global(svg),.field-guide :global(svg),.term-example :global(svg){flex:none;margin-top:1px;color:var(--purple)}.package-builder>form{padding:0 20px 20px}.builder-section{padding:22px 0;border-bottom:1px solid var(--line)}.section-heading{display:flex;align-items:flex-start;gap:11px}.section-heading>span{width:32px;height:32px;flex:none}.section-heading>div{display:grid;gap:2px}.section-heading p{margin:0;color:var(--purple);font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.package-builder .section-heading h3{margin:0;font-size:13px}.section-heading small{color:var(--muted);font-size:9px;line-height:1.45}.identity-grid{margin-bottom:0}.label-line{display:flex;align-items:center;gap:5px}.package-builder .help-tip{position:relative;width:18px;height:18px;min-height:0;display:inline-grid;place-items:center;padding:0;border:0;border-radius:50%;background:transparent;color:var(--muted);cursor:help;outline:0}.package-builder .help-tip:hover,.package-builder .help-tip:focus{background:color-mix(in srgb,var(--purple) 10%,var(--card));color:var(--purple)}.help-tip>span[role="tooltip"]{position:absolute;z-index:40;left:50%;bottom:calc(100% + 9px);width:230px;padding:9px 10px;border-radius:9px;background:#111827;color:#f8fafc;box-shadow:0 12px 30px #0f172a44;font-size:9px;font-weight:500;line-height:1.45;text-align:left;transform:translate(-50%,5px);opacity:0;visibility:hidden;pointer-events:none;transition:.16s ease}.help-tip>span[role="tooltip"]::after{content:'';position:absolute;top:100%;left:50%;border:5px solid transparent;border-top-color:#111827;transform:translateX(-50%)}.help-tip:hover>span[role="tooltip"],.help-tip:focus>span[role="tooltip"]{opacity:1;visibility:visible;transform:translate(-50%,0)}.term-example{margin:15px 0 0}.term-legend{display:grid;grid-template-columns:minmax(180px,1.25fr) 1fr 1fr;gap:8px;margin:14px 0 7px;padding:0 10px;color:var(--muted);font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}.terminology-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.terminology-grid label{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:11px;border:1px solid var(--line);border-radius:11px;background:color-mix(in srgb,var(--theme-soft) 42%,var(--card))}.term-key{grid-column:1/-1;display:grid;gap:3px;color:var(--theme-text);font-size:9px}.term-key b{font-weight:750}.term-key small{color:var(--muted);font-size:8px;font-weight:450;line-height:1.4}.term-input{display:grid;gap:5px}.term-input small{display:none;color:var(--muted);font-size:8px}.terminology-grid input{height:40px}.category-options{display:grid;gap:7px;margin-top:14px;font-size:11px;font-weight:680}.category-options small{color:var(--muted);font-size:9px;font-weight:450}.package-fields-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.package-fields-head button,.remove-field{height:38px;border:1px solid color-mix(in srgb,var(--purple) 28%,var(--line));border-radius:9px;background:color-mix(in srgb,var(--purple) 6%,var(--card));color:var(--purple);font-size:9px;font-weight:700}.package-fields-head button{display:flex;align-items:center;gap:6px;padding:0 12px}.field-guide{margin:15px 0 0}.field-guide code{border-radius:4px;background:color-mix(in srgb,var(--purple) 10%,var(--card));color:var(--purple);padding:2px 4px}.package-fields{display:grid;gap:10px;margin-top:11px}.package-field{display:grid;grid-template-columns:120px minmax(150px,1fr) minmax(150px,1fr) 140px minmax(180px,1fr) auto;align-items:end;gap:9px;padding:13px;border:1px solid color-mix(in srgb,var(--line) 82%,var(--purple));border-radius:12px;background:color-mix(in srgb,var(--theme-soft) 36%,var(--card))}.field-cell{display:grid;gap:6px;min-width:0}.field-cell>span,.field-surfaces>span{color:var(--muted);font-size:8px;font-weight:750;text-transform:uppercase;letter-spacing:.05em}.field-cell input,.field-cell select{height:40px}.field-surfaces{grid-column:1/-1;display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding-top:3px}.field-surfaces>span{margin-right:2px}.field-surfaces label{display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;background:var(--card);padding:6px 9px;color:var(--muted);font-size:8px}.field-surfaces label:has(input:checked){border-color:color-mix(in srgb,var(--purple) 35%,var(--line));background:color-mix(in srgb,var(--purple) 7%,var(--card));color:var(--theme-text)}.remove-field{grid-column:6;grid-row:1;width:64px}.tenant-package{margin:7px 0 0!important;color:var(--muted);font-size:8px!important}.capability-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:15px 0 0}.capability-grid label{display:flex;align-items:flex-start;gap:9px;padding:11px;border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--theme-soft) 42%,var(--card));transition:.16s ease}.capability-grid label:hover{border-color:color-mix(in srgb,var(--purple) 34%,var(--line));background:color-mix(in srgb,var(--purple) 5%,var(--card))}.capability-grid input{width:auto;margin-top:1px}.capability-grid span{display:grid;gap:3px}.capability-grid b{font-size:9px}.capability-grid small{font-size:8px;color:var(--muted);line-height:1.4}.builder-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:18px}.builder-footer>span{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:9px}.builder-footer>span :global(svg){color:#059669}.builder-footer .primary{min-width:190px;justify-content:center}.capability-editor form{margin-top:12px}.capability-editor .package-select{display:grid;gap:5px;font-size:8px}.capability-editor form>button{width:100%}.package-select select{height:38px}
	.tenant-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}.tenant-card{position:relative;overflow:hidden;padding:0;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}.tenant-card:hover{border-color:color-mix(in srgb,var(--purple) 38%,var(--line));box-shadow:0 20px 48px #0f172a14;transform:translateY(-2px)}.tenant-card[open]{grid-column:1/-1;transform:none}.tenant-top{display:flex;align-items:center;gap:12px;min-width:0;padding:18px 20px;list-style:none;cursor:pointer;outline:0}.tenant-top::-webkit-details-marker{display:none}.tenant-top:focus-visible{box-shadow:inset 0 0 0 3px color-mix(in srgb,var(--purple) 24%,transparent)}.tenant-body{padding:0 20px 20px;border-top:1px solid var(--line);animation:tenant-open .2s ease-out}.tenant-chevron{flex:0 0 auto;color:var(--muted);transition:transform .2s ease,color .2s ease}.tenant-card[open] .tenant-chevron{color:var(--purple);transform:rotate(180deg)}@keyframes tenant-open{from{opacity:0;transform:translateY(-5px)}}.tenant-logo{width:46px;height:46px;overflow:hidden;flex:0 0 46px;border:1px solid color-mix(in srgb,var(--purple) 20%,var(--line));border-radius:12px;background:var(--theme-soft);color:var(--purple);display:grid;place-items:center;font-size:10px;font-weight:800;box-shadow:0 8px 22px color-mix(in srgb,var(--purple) 9%,transparent)}.tenant-logo img{width:100%;height:100%;object-fit:contain}.tenant-top>div:nth-child(2){min-width:0}.tenant-top h2{overflow:hidden;margin:0 0 3px;text-overflow:ellipsis;white-space:nowrap}.tenant-top p{overflow:hidden;margin:0;color:var(--muted);font-size:9px;text-overflow:ellipsis;white-space:nowrap}.tenant-top .health{margin-left:auto;flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:999px;background:var(--theme-soft);padding:7px 10px;font-size:8px;font-weight:750;letter-spacing:.01em}.health i{position:relative;width:8px;height:8px;flex:0 0 8px;border:1px solid #fff9;border-radius:50%;background:#f59e0b;box-shadow:0 0 0 4px #f59e0b18,0 0 8px 2px #f59e0baa,0 0 22px #f59e0b88}.health i::before{content:'';position:absolute;inset:1px;border-radius:50%;background:#fff;opacity:.65;filter:blur(.5px)}.health i::after{content:'';position:absolute;inset:-5px;border:1px solid currentColor;border-radius:50%;opacity:.55;animation:status-pulse 1.9s ease-out infinite}.health.healthy{border-color:#10b98135;background:#10b9810b;color:#047857}.health.healthy i{background:#10b981;box-shadow:0 0 0 4px #10b98118,0 0 9px 2px #10b981cc,0 0 24px #10b981aa}.health.error-state{border-color:#ef44443d;background:#ef44440b;color:#dc2626}.health.error-state i{background:#ef4444;box-shadow:0 0 0 4px #ef444418,0 0 9px 2px #ef4444dd,0 0 24px #ef4444b5}.health.unchecked{border-color:#f59e0b3d;background:#f59e0b0b;color:#b45309}@keyframes status-pulse{0%{transform:scale(.72);opacity:.75}70%,100%{transform:scale(1.55);opacity:0}}
	.tenant-card:has(.modules-editor[open]){grid-column:1/-1}.modules-editor>form{margin-top:14px}.modules-editor .module-save{width:100%;min-height:42px;margin-top:8px;background:var(--purple);color:#fff}
	.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:17px 0}.facts>span{min-width:0;padding:11px;border:1px solid var(--line);border-radius:10px;display:grid;gap:4px;color:var(--purple);background:color-mix(in srgb,var(--theme-soft) 34%,var(--card))}.facts b{font-size:8px;color:var(--theme-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.facts small{font-size:7px;color:var(--muted);font-weight:650}.facts em{font-size:7px;color:var(--muted);font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.connection-error{padding:8px;border-radius:8px;font-size:8px;overflow-wrap:anywhere}
	.owner-metrics{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:-9px 0 14px}.owner-metrics>span{min-width:0;display:grid;grid-template-columns:auto 1fr;column-gap:8px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--theme-soft);color:var(--purple)}.owner-metrics :global(svg){grid-row:1/4}.owner-metrics small,.owner-metrics em{font-size:7px;color:var(--muted);font-style:normal}.owner-metrics b{font-size:8px;color:var(--theme-text)}.snapshot-list{display:grid;gap:7px;margin-top:11px}.snapshot-list form{display:flex;align-items:center;gap:10px;padding:9px;border:1px solid var(--line);border-radius:9px;background:var(--theme-soft)}.snapshot-list span{min-width:0;display:grid;gap:3px;flex:1}.snapshot-list b{font-size:8px}.snapshot-list small{font-size:7px;color:var(--muted)}.snapshot-list button{flex:0 0 auto}
	.actions{display:flex;gap:8px;margin-top:13px}.actions form{display:flex;gap:5px;flex:1}.actions button,.actions select,details button,.owner-security button{height:36px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--purple);font-size:8px;padding:0 10px}.actions button,details button,.owner-security button{display:flex;align-items:center;justify-content:center;gap:5px}.actions select{min-width:90px}button:disabled,select:disabled{cursor:wait;opacity:.58}:global(.loading-icon){animation:owner-spin .75s linear infinite}@keyframes owner-spin{to{transform:rotate(360deg)}}
	.secret-input{position:relative;display:block}.secret-input input{width:100%;box-sizing:border-box;padding-right:42px}.secret-input button{position:absolute;right:4px;top:4px;width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:7px;background:transparent;color:var(--muted)}.secret-input button:hover{background:var(--theme-soft);color:var(--purple)}
	.edit-buttons{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:13px}.edit-buttons button{min-height:38px;display:flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--purple);font-size:8px;font-weight:650}.edit-buttons button:hover{border-color:color-mix(in srgb,var(--purple) 35%,var(--line));background:var(--theme-soft)}
	.tenant-body details{border-top:1px solid var(--line);margin-top:13px;padding-top:12px}.tenant-body summary{cursor:pointer;color:var(--theme-text);font-size:9px;font-weight:650}.tenant-body details>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;list-style:none}.tenant-body details>summary::-webkit-details-marker{display:none}.tenant-body details>summary::after{content:'›';width:22px;height:22px;display:grid;place-items:center;border:1px solid var(--line);border-radius:7px;background:var(--theme-soft);color:var(--muted);font-size:15px;line-height:1;transition:transform .18s ease,border-color .18s ease,color .18s ease}.tenant-body details[open]>summary::after{border-color:color-mix(in srgb,var(--purple) 35%,var(--line));color:var(--purple);transform:rotate(90deg)}.inline-form{display:grid;grid-template-columns:1fr auto;align-items:end;gap:7px;margin-top:10px}.inline-form label{display:grid;gap:5px;font-size:8px}.danger summary,.danger button{color:#ef4444}
	.modal-backdrop{position:fixed;z-index:1000;inset:0;display:grid;place-items:center;padding:20px;background:#090b12b8;backdrop-filter:blur(8px)}.owner-modal{width:min(560px,calc(100vw - 28px));max-height:calc(100svh - 40px);overflow:auto;border:1px solid var(--line);border-radius:18px;background:var(--card);box-shadow:0 36px 120px #0007}.owner-modal.wide-modal{width:min(720px,calc(100vw - 28px))}.owner-modal>header{position:sticky;z-index:2;top:0;display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--card) 94%,transparent);backdrop-filter:blur(12px)}.owner-modal>header span{color:var(--purple);font-size:7px;font-weight:750;text-transform:uppercase;letter-spacing:.12em}.owner-modal>header h2{margin:4px 0 0;font-size:16px}.icon-button{width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--muted)}
	.current-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:18px 20px 0}.current-details.service-details{grid-template-columns:repeat(3,minmax(0,1fr))}.current-details span{min-width:0;display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:7px;padding:11px;border:1px solid var(--line);border-radius:10px;background:var(--theme-soft);color:var(--purple)}.current-details small{font-size:7px;color:var(--muted)}.current-details b{grid-column:2;margin-top:3px;color:var(--theme-text);font-size:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.current-details em{grid-column:2;margin-top:2px;color:var(--muted);font-size:7px;font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.modal-copy{margin:14px 20px 0;color:var(--muted);font-size:8px;line-height:1.55}
	.modal-form{display:grid;gap:12px;padding:18px 20px 20px}.modal-form.service-form{grid-template-columns:repeat(2,minmax(0,1fr))}.modal-form label{display:grid;gap:6px;color:var(--theme-text);font-size:9px;font-weight:650}.modal-form label small{color:var(--muted);font-size:7px;font-weight:450;line-height:1.4}.modal-form .wide{grid-column:1/-1}.confirmation{display:flex;align-items:flex-start;gap:8px;padding:11px;border-radius:10px;background:var(--theme-soft);color:var(--muted);font-size:8px;line-height:1.45}.confirmation :global(svg){flex:none;color:var(--purple)}.modal-form footer{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}.modal-form footer button{min-height:39px;padding:0 13px;border-radius:9px;font-size:8px;font-weight:700}.modal-form .secondary{border:1px solid var(--line);background:var(--card);color:var(--muted)}.modal-form .save-button{display:flex;align-items:center;justify-content:center;gap:6px;border:0;background:var(--purple);color:white}
	.owner-security{display:flex;align-items:flex-start;gap:13px;margin-top:20px;color:var(--purple)}.owner-security>div{flex:1}.owner-security p{max-width:520px;margin:5px 0 0;color:var(--muted);font-size:8px;line-height:1.45}.owner-security form{display:grid;grid-template-columns:repeat(2,minmax(190px,1fr)) auto;align-items:end;gap:8px}.owner-security label{min-width:0}.empty{text-align:center;color:var(--muted);grid-column:1/-1}
	@media(max-width:850px){.tenant-grid{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.grid .wide{grid-column:auto}.term-legend{display:none}.terminology-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.term-input small{display:block}.package-field{grid-template-columns:1fr 1fr}.field-surfaces{grid-column:1/-1}.remove-field{grid-column:auto;grid-row:auto;width:100%}.intro{align-items:flex-start;gap:18px}.owner-security{flex-direction:column}.owner-security form{width:100%}.inline-form{grid-template-columns:1fr}.owner-head>div>span{display:none}}
	@media(max-width:620px){.owner-main{padding-inline:14px}.intro{align-items:flex-start;flex-direction:column;gap:14px}.owner-metrics{grid-template-columns:1fr}.package-builder>summary{grid-template-columns:auto 1fr;padding:16px}.summary-action{display:none}.package-intro{margin:14px 14px 0}.package-builder>form{padding:0 14px 16px}.builder-section{padding:18px 0}.terminology-grid,.package-field{grid-template-columns:1fr}.package-fields-head,.builder-footer{align-items:stretch;flex-direction:column}.package-fields-head button,.builder-footer .primary{width:100%;min-width:0}.field-surfaces{align-items:flex-start;flex-direction:column}.field-surfaces label{width:100%;box-sizing:border-box;border-radius:9px}.help-tip>span[role="tooltip"]{left:auto;right:-10px;width:205px;transform:translateY(5px)}.help-tip:hover>span[role="tooltip"],.help-tip:focus>span[role="tooltip"]{transform:translateY(0)}.facts,.current-details,.current-details.service-details,.modal-form.service-form{grid-template-columns:1fr}.modal-form .wide{grid-column:auto}.checks,.actions{flex-direction:column}.edit-buttons{grid-template-columns:1fr}.owner-security form{width:100%;grid-template-columns:1fr}.owner-modal>header{padding:15px 16px}.current-details{padding:15px 16px 0}.modal-copy{margin:12px 16px 0}.modal-form{padding:16px}.modal-form footer{flex-direction:column-reverse}.modal-form footer button{width:100%}.snapshot-list form{align-items:stretch;flex-direction:column}.snapshot-list button{width:100%}}
	@media(prefers-reduced-motion:reduce){.health i::after{animation:none}.tenant-body{animation:none}.tenant-card,.tenant-chevron{transition:none}}
</style>
