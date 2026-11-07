<!-- Step-by-step "New workspace" setup. Posts the same fields to the existing ?/create action. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, ArrowRight, Check, Copy, Eye, EyeOff, KeyRound, Plus, RefreshCw, Search } from '@lucide/svelte';
	import RequiredMark from '$lib/components/RequiredMark.svelte';
	import NichePreview from './NichePreview.svelte';
	import Stepper from './Stepper.svelte';
	import { clearOnEdit, validateStep } from './stepForm';
	import { nicheIcon, slugFromName } from './nicheIcons';

	let { packages, capabilityDefinitions, submit, busy = false, takenSlugs = [] }: {
		packages: any[];
		capabilityDefinitions: { key: string; label: string }[];
		submit: SubmitFunction;
		busy?: boolean;
		takenSlugs?: string[];
	} = $props();

	const steps = ['Business type', 'Details', 'First admin', 'Connections', 'Review'];
	let step = $state(0);
	let reached = $state(0);
	let query = $state('');
	let packageId = $state('general-service');
	let studioName = $state('');
	let internalName = $state('');
	let slug = $state('');
	let slugEdited = $state(false);
	let internalEdited = $state(false);
	let logoUrl = $state('');
	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let showPassword = $state(false);
	let copied = $state(false);
	let googleSheetId = $state('');
	let ordersTab = $state('Orders');
	let sections: HTMLElement[] = $state([]);

	const selected = $derived(packages.find((item) => item.id === packageId) || packages[0]);
	const filtered = $derived(packages.filter((item) => `${item.name} ${item.description} ${Object.values(item.profile?.terminology || {}).map((term: any) => term.plural).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())));
	const slugTaken = $derived(!!slug && takenSlugs.includes(slug));
	const included = $derived(capabilityDefinitions.filter((definition) => selected?.allowed?.[definition.key] !== false).map((definition) => definition.label));
	const statusLabels = $derived(Object.fromEntries(Object.entries(selected?.profile?.statuses || {}).map(([key, value]: [string, any]) => [key, value.label])));
	const wordsOf = (item: any) => ['order', 'staff', 'customer'].map((key) => item.profile?.terminology?.[key]?.plural).filter(Boolean).join(' · ');

	$effect(() => { if (!slugEdited) slug = slugFromName(studioName); });
	$effect(() => { if (!internalEdited) internalName = studioName; });

	const generatePassword = () => {
		const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
		const values = crypto.getRandomValues(new Uint32Array(14));
		password = passwordConfirm = Array.from(values, (value) => chars[value % chars.length]).join('');
		showPassword = true;
	};
	const copyPassword = async () => {
		try { await navigator.clipboard.writeText(password); copied = true; setTimeout(() => (copied = false), 2000); } catch { /* clipboard blocked; password stays visible */ }
	};

	// Checks the inputs of one step; extra rules the browser can't express are set as custom messages.
	const stepValid = (index: number, report = true) => {
		const section = sections[index];
		if (!section) return true;
		const confirmInput = section.querySelector<HTMLInputElement>('input[name="passwordConfirm"]');
		confirmInput?.setCustomValidity(confirmInput.value && confirmInput.value !== password ? 'The passwords do not match.' : '');
		const slugInput = section.querySelector<HTMLInputElement>('input[name="slug"]');
		slugInput?.setCustomValidity(slugTaken ? 'This web address is already used by another workspace.' : '');
		return validateStep(section, report);
	};
	const next = async () => { if (stepValid(step)) { step = Math.min(step + 1, steps.length - 1); reached = Math.max(reached, step); await tick(); sections[step]?.querySelector<HTMLElement>('h3')?.focus(); } };
	const back = () => (step = Math.max(step - 1, 0));
	const goTo = (index: number) => { for (let i = 0; i < index; i++) if (!stepValid(i, false)) { step = i; tick().then(() => stepValid(i)); return; } step = index; };

	const guarded: SubmitFunction = async (input) => {
		for (let i = 0; i < steps.length; i++) {
			if (!stepValid(i, false)) { input.cancel(); step = i; await tick(); stepValid(i); return; }
		}
		return submit(input);
	};
</script>

<form method="POST" action="?/create" novalidate use:enhance={guarded} use:clearOnEdit class="wizard step-form">
	<Stepper {steps} current={step} {reached} label="Setup steps" onselect={goTo} />

	<div class="layout">
		<div class="steps">
			<section bind:this={sections[0]} hidden={step !== 0}>
				<h3 tabindex="-1">What kind of business is this?</h3>
				<p class="hint">This sets the words, fields, and features. You can change everything later.</p>
				<label class="search"><Search size={15} /><input type="search" bind:value={query} placeholder="Search: garage, clinic, salon…" aria-label="Search business types" /></label>
				<div class="tiles" role="radiogroup" aria-label="Business type">
					{#each filtered as item (item.id)}
						{@const Icon = nicheIcon(item.id)}
						<label class="tile" class:on={packageId === item.id}>
							<input type="radio" name="packageId" value={item.id} bind:group={packageId} />
							<span class="icon"><Icon size={18} /></span>
							<span><b>{item.name}</b><small>{wordsOf(item)}</small></span>
						</label>
					{:else}<p class="hint">No match. Try another word, or pick "General Service".</p>{/each}
				</div>
			</section>

			<section bind:this={sections[1]} hidden={step !== 1}>
				<h3 tabindex="-1">Business details</h3>
				<div class="fields">
					<label>Business name <RequiredMark /><small>Shown to people inside this workspace.</small><input name="studioName" bind:value={studioName} placeholder="Example: Sri Ram Motors" required /></label>
					<label>Web address <RequiredMark /><small>Lowercase letters, numbers, and hyphens. Made from the name.</small><span class="prefix"><em>/</em><input name="slug" bind:value={slug} oninput={() => (slugEdited = true)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" data-error="Use lowercase letters, numbers, and single hyphens only." placeholder="sri-ram-motors" required /></span>{#if slugTaken}<small class="warn">Already used by another workspace.</small>{/if}</label>
					<label>Name for your records <RequiredMark /><small>Only you see this, in this panel.</small><input name="internalName" bind:value={internalName} oninput={() => (internalEdited = true)} placeholder="Example: Sri Ram Motors – Hyderabad" required /></label>
					<label>Logo link <small>Optional. An https:// image address.</small><input name="logoUrl" bind:value={logoUrl} placeholder="https://example.com/logo.png" pattern="(https://|/).*" data-error="The link must start with https://" /></label>
				</div>
			</section>

			<section bind:this={sections[2]} hidden={step !== 2}>
				<h3 tabindex="-1">First admin login</h3>
				<p class="hint">This person signs in at the main sign-in page and runs the workspace.</p>
				<div class="fields">
					<label class="wide">Admin email <RequiredMark /><input name="email" type="email" bind:value={email} autocomplete="off" placeholder="owner@business.com" required /></label>
					<label>Temporary password <RequiredMark /><small>At least 10 characters.</small><span class="secret"><input name="password" type={showPassword ? 'text' : 'password'} bind:value={password} minlength="10" autocomplete="new-password" required /><button type="button" onclick={() => (showPassword = !showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{#if showPassword}<EyeOff size={15} />{:else}<Eye size={15} />{/if}</button></span></label>
					<label>Type it again <RequiredMark /><small>Must match.</small><span class="secret"><input name="passwordConfirm" type={showPassword ? 'text' : 'password'} bind:value={passwordConfirm} minlength="10" autocomplete="new-password" required /></span></label>
				</div>
				<div class="row"><button type="button" class="ghost" onclick={generatePassword}><KeyRound size={15} />Make a strong password</button>{#if password}<button type="button" class="ghost" onclick={copyPassword}>{#if copied}<Check size={15} />Copied{:else}<Copy size={15} />Copy password{/if}</button>{/if}</div>
			</section>

			<section bind:this={sections[3]} hidden={step !== 3}>
				<h3 tabindex="-1">Connect database and sheet</h3>
				<p class="hint">Each workspace keeps its data in its own Neon database and syncs to a Google Sheet.</p>
				<div class="fields">
					<label class="wide">Neon connection link <RequiredMark /><small>In Neon: open the project → <b>Connect</b> → copy the link starting with postgresql://. Stored encrypted.</small><input name="databaseUrl" type="password" autocomplete="off" placeholder="postgresql://…" pattern="postgres.*" data-error="The link must start with postgresql://" required /></label>
					<label>Google Sheet ID <RequiredMark /><small>The long code between /d/ and /edit in the Sheet link. Share the Sheet with the service account first.</small><input name="googleSheetId" bind:value={googleSheetId} placeholder="1AbC…xyz" required /></label>
					<label>Sheet tab name <RequiredMark /><small>Usually keep “Orders”.</small><input name="ordersTab" bind:value={ordersTab} required /></label>
				</div>
				<div class="checks">
					<label><input name="attachExisting" type="checkbox" /> The database already has NexaDesk data. Use it.</label>
					<label><input name="isDemo" type="checkbox" /> This is a demo workspace that can be reset</label>
				</div>
			</section>

			<section bind:this={sections[4]} hidden={step !== 4}>
				<h3 tabindex="-1">Check and create</h3>
				<dl class="summary">
					<div><dt>Business type</dt><dd>{selected?.name}</dd></div>
					<div><dt>Business name</dt><dd>{studioName || '—'}</dd></div>
					<div><dt>Web address</dt><dd>/{slug || '—'}</dd></div>
					<div><dt>Admin email</dt><dd>{email || '—'}</dd></div>
					<div><dt>Google Sheet</dt><dd>{googleSheetId ? `${googleSheetId.slice(0, 8)}… · ${ordersTab}` : '—'}</dd></div>
				</dl>
				<p class="hint">We test the database and sheet first. The workspace goes live only if both work. Turn features on or off afterwards from its card.</p>
			</section>

			<div class="nav">
				{#if step > 0}<button type="button" class="ghost" onclick={back}><ArrowLeft size={15} />Back</button>{:else}<span></span>{/if}
				{#if step < steps.length - 1}
					<button type="button" class="primary" onclick={next}>Next<ArrowRight size={15} /></button>
				{:else}
					<button class="primary" disabled={busy} aria-busy={busy}>{#if busy}<RefreshCw class="spin" size={15} />Checking and creating…{:else}<Plus size={15} />Create workspace{/if}</button>
				{/if}
			</div>
		</div>

		<aside class="side">
			<NichePreview name={studioName} terms={selected?.profile?.terminology || {}} statuses={statusLabels} fields={selected?.profile?.customFields || []} features={step >= 4 || step === 0 ? included : []} />
		</aside>
	</div>
</form>

<style>
	.wizard { display: grid; gap: 18px; container-type: inline-size; }
	.layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, 340px); gap: 24px; align-items: start; }
	.steps, section { display: grid; gap: 14px; min-width: 0; }
	section[hidden] { display: none; }
	h3 { margin: 0; font-size: 18px; outline: none; }
	.hint { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }
	.search { display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 42px; border: 1px solid var(--line); border-radius: 10px; color: var(--muted); }
	.search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; box-shadow: none; padding: 0; height: 100%; color: var(--theme-text); font-size: 15px; }
	.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
	.tile { display: flex; gap: 10px; align-items: flex-start; padding: 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); cursor: pointer; }
	.tile input { position: absolute; opacity: 0; pointer-events: none; }
	.tile:focus-within { box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple) 22%, transparent); }
	.tile.on { border-color: var(--purple); background: color-mix(in srgb, var(--purple) 6%, var(--card)); }
	.tile .icon { display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 10px; background: var(--theme-soft); color: var(--purple); }
	.tile b { display: block; font-size: 14px; }
	.tile small { display: block; margin-top: 2px; font-size: 12.5px; color: var(--muted); line-height: 1.4; }
	.fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
	.fields label { display: block; font-size: 14px; font-weight: 600; }
	.fields label > small, .fields label > input, .fields label > .prefix, .fields label > .secret { display: flex; margin-top: 4px; }
	.fields label > small { display: block; }
	.fields label.wide, .fields label:has(input[name="databaseUrl"]) { grid-column: 1 / -1; }
	.fields small { font-weight: 400; font-size: 12.5px; color: var(--muted); line-height: 1.4; }
	.fields small.warn { color: #b45309; }
	input:not([type="checkbox"]):not([type="radio"]):not([type="search"]) { width: 100%; box-sizing: border-box; min-height: 42px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--theme-text); font: inherit; font-size: 15px; font-weight: 400; }
	input:focus-visible { outline: none; border-color: var(--purple); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple) 18%, transparent); }
	.prefix, .secret { display: flex; align-items: center; gap: 4px; }
	.prefix input, .secret input { flex: 1; min-width: 0; }
	.prefix em { font-style: normal; color: var(--muted); }
	.secret button { flex: none; width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--muted); cursor: pointer; }
	.row, .checks { display: flex; flex-wrap: wrap; gap: 10px; }
	.checks { flex-direction: column; font-size: 14px; }
	.checks label { display: flex; gap: 8px; align-items: center; }
	.summary { margin: 0; display: grid; gap: 0; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
	.summary div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--line); font-size: 14px; }
	.summary div:last-child { border-bottom: 0; }
	.summary dt { color: var(--muted); }
	.summary dd { margin: 0; font-weight: 600; text-align: right; overflow-wrap: anywhere; }
	.nav { display: flex; justify-content: space-between; gap: 10px; padding-top: 6px; border-top: 1px solid var(--line); }
	.primary, .ghost { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 42px; padding: 0 16px; border-radius: 10px; font-size: 14.5px; font-weight: 700; cursor: pointer; }
	.primary { border: 0; background: var(--purple); color: var(--accent-text, #fff); }
	.primary:disabled { opacity: .7; cursor: progress; }
	.ghost { border: 1px solid var(--line); background: var(--card); color: var(--theme-text); }
	.primary :global(.spin) { animation: spin 1s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	@media (prefers-reduced-motion: reduce) { .primary :global(.spin) { animation: none; } }
	@container (max-width: 760px) { .layout { grid-template-columns: 1fr; } }
	@container (max-width: 520px) { .fields { grid-template-columns: 1fr; } }
</style>
