<!-- Master owner panel: onboard clients, protect credentials, test connections, and reset demos. -->
<script lang="ts">
		import { enhance } from '$app/forms';
		import type { SubmitFunction } from '@sveltejs/kit';
		import { CheckCircle2, Database, Eye, EyeOff, KeyRound, LogOut, Pencil, Plus, RefreshCw, ShieldCheck, Sheet, TriangleAlert, X } from '@lucide/svelte';
		let { data, form } = $props();
		let creating = $state(false);
		let pendingAction = $state('');
		let credentialTenant = $state('');
		let connectionTenant = $state('');
		let showCreatePassword = $state(false);
		let showClientPassword = $state(false);
		let showDatabaseUrl = $state(false);
		let showOwnerPassword = $state(false);
		const track = (key: string, close?: () => void): SubmitFunction => () => {
			pendingAction = key;
			return async ({ result, update }) => {
				try { await update(); if (result.type === 'success') close?.(); }
				finally { pendingAction = ''; }
			};
		};
		const closeCredentials = () => { credentialTenant = ''; showClientPassword = false; };
		const closeConnections = () => { connectionTenant = ''; showDatabaseUrl = false; };
	</script>

<svelte:head><title>Client control — StudioFlow</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<header class="owner-head"><a href="/owner"><b>SF</b><span><strong>StudioFlow</strong><small>Owner control</small></span></a><div><span>{data.account?.email || 'Owner'}</span><a href="/logout"><LogOut size={15}/>Sign out</a></div></header>
<main class="owner-main">
	<section class="intro"><div><p>Master workspace control</p><h1>Client accounts and stored services</h1><span>Create clients, review their saved Neon and Sheet setup, and manage login access from one place.</span></div><button onclick={() => creating = !creating}><Plus size={16}/>{creating ? 'Close setup' : 'Add new client'}</button></section>
	{#if form?.error}<div class="owner-notice error"><TriangleAlert size={16}/>{form.error}</div>{:else if form?.success}<div class="owner-notice success"><CheckCircle2 size={16}/>{form.success}</div>{/if}

	{#if creating}
	<section class="panel create-panel"><h2>Create a client workspace</h2><p>First create the Neon database and Google Sheet, then enter the saved services and the client's first login ID below.</p>
		<form method="POST" action="?/create" use:enhance={track('create')}>
			<div class="grid">
				<label>Internal client name<small>Only visible in master control.</small><input name="internalName" placeholder="Example: Anjana Creations" required /></label>
				<label>Workspace URL name<small>Lowercase letters, numbers, and hyphens.</small><input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="anjana-creations" required /></label>
				<label>Studio display name<small>Shown inside the client's workspace.</small><input name="studioName" required /></label>
				<label>Logo URL <small>Optional HTTPS image address.</small><input name="logoUrl" placeholder="https://…" /></label>
				<label>Client login ID (email)<small>The client uses this on the main sign-in page.</small><input name="email" type="email" autocomplete="off" required /></label>
				<label>First password<small>Minimum 10 characters.</small><span class="secret-input"><input name="password" type={showCreatePassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" required /><button type="button" onclick={() => showCreatePassword = !showCreatePassword} aria-label={showCreatePassword ? 'Hide passwords' : 'Show passwords'}>{#if showCreatePassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
				<label>Confirm first password<small>Enter the same password again.</small><span class="secret-input"><input name="passwordConfirm" type={showCreatePassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" required /><button type="button" onclick={() => showCreatePassword = !showCreatePassword} aria-label={showCreatePassword ? 'Hide passwords' : 'Show passwords'}>{#if showCreatePassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
				<label class="wide">Neon database connection URL<small>Stored encrypted. Only safe connection details appear after saving.</small><input name="databaseUrl" type="password" autocomplete="off" required /></label>
				<label>Google Sheet ID<small>Saved so this workspace syncs to the correct Sheet.</small><input name="googleSheetId" required /></label>
				<label>Orders sheet tab<small>Usually keep this as Orders.</small><input name="ordersTab" value="Orders" required /></label>
			</div>
			<div class="checks"><label><input name="attachExisting" type="checkbox" /> I reviewed and want to attach existing StudioFlow data</label><label><input name="isDemo" type="checkbox" /> This is a resettable demo tenant</label></div>
			<button class="primary" disabled={pendingAction !== ''} aria-busy={pendingAction === 'create'}>{#if pendingAction === 'create'}<RefreshCw class="loading-icon" size={15}/>{:else}<Plus size={15}/>{/if}{pendingAction === 'create' ? 'Validating…' : 'Validate and create client'}</button>
		</form>
	</section>
	{/if}

	<section class="tenant-grid">
		{#each data.tenants as tenant}
		<article class="panel tenant-card">
			<div class="tenant-top"><div class="tenant-logo">{#if tenant.logoUrl}<img src={tenant.logoUrl} alt="" />{:else}{tenant.internalName.slice(0,2).toUpperCase()}{/if}</div><div><span class="slug">Workspace /{tenant.slug}</span><h2>{tenant.internalName}</h2><p>{tenant.studioName}</p></div><span class:healthy={tenant.connectionStatus === 'healthy'} class:error-state={tenant.connectionStatus === 'error'} class="health">{tenant.connectionStatus}</span></div>
			<div class="facts"><span><Database size={15}/><small>Neon database</small><b>{tenant.databaseName}</b><em>{tenant.databaseRole}@{tenant.databaseHost}</em></span><span><Sheet size={15}/><small>Google Sheet</small><b>{tenant.googleSheetId ? `${tenant.googleSheetId.slice(0,8)}…${tenant.googleSheetId.slice(-4)}` : 'Not configured'}</b><em>Tab: {tenant.ordersTab || 'Orders'}</em></span><span><KeyRound size={15}/><small>Client login ID</small><b>{tenant.adminEmail}</b><em>Password protected · {tenant.activeSessions} active session{tenant.activeSessions === 1 ? '' : 's'}</em></span></div>
			{#if tenant.connectionError}<div class="connection-error">{tenant.connectionError}</div>{/if}
			<div class="actions">
				<form method="POST" action="?/test" use:enhance={track(`test:${tenant.id}`)}><input type="hidden" name="tenantId" value={tenant.id}/><button disabled={pendingAction !== ''} aria-busy={pendingAction === `test:${tenant.id}`}>{#if pendingAction === `test:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>{:else}<RefreshCw size={13}/>{/if}{pendingAction === `test:${tenant.id}` ? 'Testing…' : 'Test connections'}</button></form>
				<form method="POST" action="?/status" use:enhance={track(`status:${tenant.id}`)}><input type="hidden" name="tenantId" value={tenant.id}/><select name="status" value={tenant.status} disabled={pendingAction !== ''}><option value="draft">Draft</option><option value="active">Active</option><option value="suspended">Suspended</option></select><button disabled={pendingAction !== ''} aria-busy={pendingAction === `status:${tenant.id}`}>{#if pendingAction === `status:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>{/if}{pendingAction === `status:${tenant.id}` ? 'Saving…' : 'Save status'}</button></form>
			</div>
			<div class="edit-buttons">
				<button type="button" onclick={() => credentialTenant = tenant.id}><Pencil size={13}/>Edit login ID or password</button>
				<button type="button" onclick={() => connectionTenant = tenant.id}><Pencil size={13}/>Edit stored services</button>
			</div>

			{#if credentialTenant === tenant.id}
				<!-- Client passwords are replaced here; their one-way hashes cannot be revealed. -->
				<div class="modal-backdrop" role="presentation">
					<div class="owner-modal" role="dialog" aria-modal="true" aria-labelledby={`login-title-${tenant.id}`}>
						<header><div><span>Client access</span><h2 id={`login-title-${tenant.id}`}>Edit login ID or reset password</h2></div><button type="button" class="icon-button" onclick={closeCredentials} aria-label="Close login popup"><X size={17}/></button></header>
						<div class="current-details"><span><KeyRound size={14}/><small>Current login ID</small><b>{tenant.adminEmail}</b></span><span><EyeOff size={14}/><small>Current password</small><b>Secure hash · cannot be viewed</b></span></div>
						<p class="modal-copy">Passwords are intentionally one-way protected. To change it, enter the new password twice. Saving signs out all existing client sessions.</p>
						<form method="POST" action="?/credentials" class="modal-form" use:enhance={track(`credentials:${tenant.id}`, closeCredentials)}>
							<input type="hidden" name="tenantId" value={tenant.id}/>
							<label>Client login ID (email)<input name="email" type="email" value={tenant.adminEmail} autocomplete="off" required/></label>
							<label>New password <small>Optional · leave both password fields empty to keep the current password.</small><span class="secret-input"><input name="password" type={showClientPassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Minimum 10 characters"/><button type="button" onclick={() => showClientPassword = !showClientPassword} aria-label={showClientPassword ? 'Hide new passwords' : 'Show new passwords'}>{#if showClientPassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
							<label>Confirm new password<span class="secret-input"><input name="passwordConfirm" type={showClientPassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Enter the same password again"/><button type="button" onclick={() => showClientPassword = !showClientPassword} aria-label={showClientPassword ? 'Hide new passwords' : 'Show new passwords'}>{#if showClientPassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
							<div class="confirmation"><ShieldCheck size={15}/><span>Confirming will save the login ID, replace the password only when provided, and sign out this client's active sessions.</span></div>
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
							<label>Studio display name<input name="studioName" value={tenant.studioName} required/></label>
							<label>Logo URL<input name="logoUrl" value={tenant.logoUrl} placeholder="Optional HTTPS logo URL"/></label>
							<label class="wide">Replacement Neon URL <small>Leave both URL fields empty to keep the current encrypted connection.</small><span class="secret-input"><input name="databaseUrl" type={showDatabaseUrl ? 'text' : 'password'} autocomplete="off" placeholder="Paste a new Neon URL only when replacing it"/><button type="button" onclick={() => showDatabaseUrl = !showDatabaseUrl} aria-label={showDatabaseUrl ? 'Hide replacement URLs' : 'Show replacement URLs'}>{#if showDatabaseUrl}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
							<label class="wide">Confirm replacement Neon URL<span class="secret-input"><input name="databaseUrlConfirm" type={showDatabaseUrl ? 'text' : 'password'} autocomplete="off" placeholder="Paste the same replacement URL again"/><button type="button" onclick={() => showDatabaseUrl = !showDatabaseUrl} aria-label={showDatabaseUrl ? 'Hide replacement URLs' : 'Show replacement URLs'}>{#if showDatabaseUrl}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
							<label>Google Sheet ID<input name="googleSheetId" value={tenant.googleSheetId}/></label>
							<label>Orders sheet tab<input name="ordersTab" value={tenant.ordersTab} placeholder="Orders"/></label>
							<div class="confirmation wide"><ShieldCheck size={15}/><span>StudioFlow will validate the Neon database and Google Sheet before saving. A successful change signs out existing client sessions.</span></div>
							<footer class="wide"><button type="button" class="secondary" onclick={closeConnections}>Cancel</button><button class="save-button" disabled={pendingAction !== ''} aria-busy={pendingAction === `connections:${tenant.id}`}>{#if pendingAction === `connections:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>Checking…{:else}<CheckCircle2 size={14}/>Confirm and save services{/if}</button></footer>
						</form>
					</div>
				</div>
			{/if}
			{#if tenant.isDemo}<details class="danger"><summary>Reset demo data</summary><form method="POST" action="?/reset" class="inline-form" use:enhance={track(`reset:${tenant.id}`)}><input type="hidden" name="tenantId" value={tenant.id}/><input name="confirmation" placeholder="Type RESET" required/><button disabled={pendingAction !== ''} aria-busy={pendingAction === `reset:${tenant.id}`}>{#if pendingAction === `reset:${tenant.id}`}<RefreshCw class="loading-icon" size={13}/>{/if}{pendingAction === `reset:${tenant.id}` ? 'Resetting…' : 'Reset database and Sheet'}</button></form></details>{/if}
		</article>
		{/each}
		{#if !data.tenants.length}<div class="panel empty">No clients yet. Add the first isolated workspace.</div>{/if}
	</section>
	<section class="panel owner-security"><ShieldCheck size={20}/><div><h2>Master owner password</h2><p>The current password is protected as a secure hash and cannot be displayed. Enter the new password twice; saving signs out every master-owner session, including this one.</p></div><form method="POST" action="?/ownerPassword" use:enhance={track('owner-password')}><label>New master password<span class="secret-input"><input name="password" type={showOwnerPassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Minimum 10 characters" required/><button type="button" onclick={() => showOwnerPassword = !showOwnerPassword} aria-label={showOwnerPassword ? 'Hide master passwords' : 'Show master passwords'}>{#if showOwnerPassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label><label>Confirm master password<span class="secret-input"><input name="passwordConfirm" type={showOwnerPassword ? 'text' : 'password'} minlength="10" autocomplete="new-password" placeholder="Enter the same password again" required/><button type="button" onclick={() => showOwnerPassword = !showOwnerPassword} aria-label={showOwnerPassword ? 'Hide master passwords' : 'Show master passwords'}>{#if showOwnerPassword}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label><button disabled={pendingAction !== ''} aria-busy={pendingAction === 'owner-password'}>{#if pendingAction === 'owner-password'}<RefreshCw class="loading-icon" size={13}/>{/if}{pendingAction === 'owner-password' ? 'Changing password…' : 'Confirm password change'}</button></form></section>
</main>

<style>
	.owner-head{height:68px;padding:0 max(22px,calc((100vw - 1180px)/2));display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);background:var(--card)}.owner-head>a,.owner-head>div,.owner-head>div>a{display:flex;align-items:center;gap:10px}.owner-head>a>b{width:35px;height:35px;border-radius:10px;background:var(--purple);color:white;display:grid;place-items:center}.owner-head a span{display:flex;flex-direction:column}.owner-head strong{font-size:12px}.owner-head small,.owner-head>div>span{font-size:8px;color:var(--muted)}.owner-head>div>a{font-size:9px;color:var(--purple)}
	.owner-main{max-width:1180px;margin:0 auto;padding:36px 22px 80px}.intro{display:flex;justify-content:space-between;align-items:end;margin-bottom:22px}.intro p,.slug{margin:0 0 6px;color:var(--purple);font-size:9px;text-transform:uppercase;letter-spacing:.1em}.intro h1{font-size:26px;margin:0 0 7px}.intro span{font-size:10px;color:var(--muted)}.intro button,.primary{display:flex;align-items:center;gap:7px;border:0;border-radius:9px;background:var(--purple);color:white;padding:11px 15px}.owner-notice{position:static;display:flex;align-items:flex-start;gap:8px;width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;margin:0 0 16px;font-size:10px;line-height:1.45}.owner-notice :global(svg){flex:0 0 auto;margin-top:1px}.owner-notice.error,.connection-error{background:#ef444412;color:#ef4444}.owner-notice.success{background:#10b98112;color:#059669}
	.panel{border:1px solid var(--line);border-radius:15px;background:var(--card);padding:20px}.create-panel{margin-bottom:20px}.panel h2{margin:0;font-size:14px}.panel>p{font-size:9px;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:18px 0}.grid label,.owner-security label{display:grid;gap:6px;font-size:9px;color:var(--theme-text);font-weight:650}.grid label small{color:var(--muted);font-size:7px;font-weight:450;line-height:1.35}.grid .wide{grid-column:1/-1}.checks{display:flex;gap:20px;margin-bottom:16px}.checks label{display:flex;align-items:center;gap:6px;font-size:9px;color:var(--muted)}.checks input{width:auto}
	.tenant-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.tenant-top{display:flex;align-items:center;gap:12px}.tenant-logo{width:43px;height:43px;overflow:hidden;border-radius:11px;background:var(--theme-soft);color:var(--purple);display:grid;place-items:center;font-size:10px;font-weight:700}.tenant-logo img{width:100%;height:100%;object-fit:contain}.tenant-top h2{margin:0 0 3px}.tenant-top p{margin:0;color:var(--muted);font-size:9px}.tenant-top .health{margin-left:auto;border-radius:20px;background:var(--theme-soft);padding:5px 8px;font-size:8px;text-transform:capitalize}.health.healthy{color:#059669}.health.error-state{color:#ef4444}
	.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:17px 0}.facts>span{min-width:0;padding:11px;border:1px solid var(--line);border-radius:10px;display:grid;gap:4px;color:var(--purple);background:color-mix(in srgb,var(--theme-soft) 34%,var(--card))}.facts b{font-size:8px;color:var(--theme-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.facts small{font-size:7px;color:var(--muted);font-weight:650}.facts em{font-size:7px;color:var(--muted);font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.connection-error{padding:8px;border-radius:8px;font-size:8px;overflow-wrap:anywhere}
	.actions{display:flex;gap:8px;margin-top:13px}.actions form{display:flex;gap:5px;flex:1}.actions button,.actions select,details button,.owner-security button{height:36px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--purple);font-size:8px;padding:0 10px}.actions button,details button,.owner-security button{display:flex;align-items:center;justify-content:center;gap:5px}.actions select{min-width:90px}button:disabled,select:disabled{cursor:wait;opacity:.58}:global(.loading-icon){animation:owner-spin .75s linear infinite}@keyframes owner-spin{to{transform:rotate(360deg)}}
	.secret-input{position:relative;display:block}.secret-input input{width:100%;box-sizing:border-box;padding-right:42px}.secret-input button{position:absolute;right:4px;top:4px;width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:7px;background:transparent;color:var(--muted)}.secret-input button:hover{background:var(--theme-soft);color:var(--purple)}
	.edit-buttons{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:13px}.edit-buttons button{min-height:38px;display:flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--purple);font-size:8px;font-weight:650}.edit-buttons button:hover{border-color:color-mix(in srgb,var(--purple) 35%,var(--line));background:var(--theme-soft)}
	details{border-top:1px solid var(--line);margin-top:13px;padding-top:12px}summary{cursor:pointer;color:var(--theme-text);font-size:9px;font-weight:650}.inline-form{display:grid;grid-template-columns:1fr 1fr auto;gap:7px;margin-top:10px}.danger summary,.danger button{color:#ef4444}
	.modal-backdrop{position:fixed;z-index:1000;inset:0;display:grid;place-items:center;padding:20px;background:#090b12b8;backdrop-filter:blur(8px)}.owner-modal{width:min(560px,calc(100vw - 28px));max-height:calc(100svh - 40px);overflow:auto;border:1px solid var(--line);border-radius:18px;background:var(--card);box-shadow:0 36px 120px #0007}.owner-modal.wide-modal{width:min(720px,calc(100vw - 28px))}.owner-modal>header{position:sticky;z-index:2;top:0;display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--card) 94%,transparent);backdrop-filter:blur(12px)}.owner-modal>header span{color:var(--purple);font-size:7px;font-weight:750;text-transform:uppercase;letter-spacing:.12em}.owner-modal>header h2{margin:4px 0 0;font-size:16px}.icon-button{width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--muted)}
	.current-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:18px 20px 0}.current-details.service-details{grid-template-columns:repeat(3,minmax(0,1fr))}.current-details span{min-width:0;display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:7px;padding:11px;border:1px solid var(--line);border-radius:10px;background:var(--theme-soft);color:var(--purple)}.current-details small{font-size:7px;color:var(--muted)}.current-details b{grid-column:2;margin-top:3px;color:var(--theme-text);font-size:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.current-details em{grid-column:2;margin-top:2px;color:var(--muted);font-size:7px;font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.modal-copy{margin:14px 20px 0;color:var(--muted);font-size:8px;line-height:1.55}
	.modal-form{display:grid;gap:12px;padding:18px 20px 20px}.modal-form.service-form{grid-template-columns:repeat(2,minmax(0,1fr))}.modal-form label{display:grid;gap:6px;color:var(--theme-text);font-size:9px;font-weight:650}.modal-form label small{color:var(--muted);font-size:7px;font-weight:450;line-height:1.4}.modal-form .wide{grid-column:1/-1}.confirmation{display:flex;align-items:flex-start;gap:8px;padding:11px;border-radius:10px;background:var(--theme-soft);color:var(--muted);font-size:8px;line-height:1.45}.confirmation :global(svg){flex:none;color:var(--purple)}.modal-form footer{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}.modal-form footer button{min-height:39px;padding:0 13px;border-radius:9px;font-size:8px;font-weight:700}.modal-form .secondary{border:1px solid var(--line);background:var(--card);color:var(--muted)}.modal-form .save-button{display:flex;align-items:center;justify-content:center;gap:6px;border:0;background:var(--purple);color:white}
	.owner-security{display:flex;align-items:flex-start;gap:13px;margin-top:20px;color:var(--purple)}.owner-security>div{flex:1}.owner-security p{max-width:520px;margin:5px 0 0;color:var(--muted);font-size:8px;line-height:1.45}.owner-security form{display:grid;grid-template-columns:repeat(2,minmax(190px,1fr)) auto;align-items:end;gap:8px}.owner-security label{min-width:0}.empty{text-align:center;color:var(--muted);grid-column:1/-1}
	@media(max-width:850px){.tenant-grid{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.grid .wide{grid-column:auto}.intro{align-items:flex-start;gap:18px}.owner-security{flex-direction:column}.owner-security form{width:100%}.inline-form{grid-template-columns:1fr}.owner-head>div>span{display:none}}
	@media(max-width:620px){.intro{flex-direction:column}.facts,.current-details,.current-details.service-details,.modal-form.service-form{grid-template-columns:1fr}.modal-form .wide{grid-column:auto}.checks,.actions{flex-direction:column}.edit-buttons{grid-template-columns:1fr}.owner-security form{width:100%;grid-template-columns:1fr}.owner-modal>header{padding:15px 16px}.current-details{padding:15px 16px 0}.modal-copy{margin:12px 16px 0}.modal-form{padding:16px}.modal-form footer{flex-direction:column-reverse}.modal-form footer button{width:100%}}
</style>
