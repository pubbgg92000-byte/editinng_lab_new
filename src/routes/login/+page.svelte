<!-- Single sign-in for owners and workspace admins; the server routes each account by role. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, untrack } from 'svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import AtSign from '@lucide/svelte/icons/at-sign';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import RequiredMark from '$lib/components/RequiredMark.svelte';
	import { applyTheme, getLastWorkspaceTheme } from '$lib/theme';
	let { form } = $props();
	let loading = $state(false);
	let visible = $state(false);
	let email = $state(untrack(() => form?.email || ''));
	let password = $state('');
	onMount(() => applyTheme(getLastWorkspaceTheme(), false));
</script>

<svelte:head><title>Sign in — NexaDesk</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<main class="login-page">
	<section class="login-card" aria-labelledby="login-title">
		<div class="brand"><img src="/favicon.svg" alt="" width="40" height="40" /><div><strong>NexaDesk</strong><small>Business workspace</small></div></div>
		<h1 id="login-title">Sign in</h1>
		<p class="lede">Use the email and password your administrator gave you.</p>

		<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { try { await update(); } finally { loading = false; } }; }}>
			<div class="login-field">
				<label for="login-email">Email <RequiredMark /></label>
				<div class="input-box"><AtSign size={16} aria-hidden="true" /><input id="login-email" name="email" type="email" bind:value={email} autocomplete="username" placeholder="name@example.com" required aria-required="true" aria-describedby="email-hint" /></div>
				<small id="email-hint">The email linked to your NexaDesk account.</small>
			</div>
			<div class="login-field">
				<label for="login-password">Password <RequiredMark /></label>
				<div class="input-box">
					<LockKeyhole size={16} aria-hidden="true" />
					<input id="login-password" name="password" type={visible ? 'text' : 'password'} bind:value={password} autocomplete="current-password" placeholder="Your password" required aria-required="true" />
					<button type="button" class="toggle" onclick={() => (visible = !visible)} aria-pressed={visible} title={visible ? 'Hide password' : 'Show password'}>{#if visible}<EyeOff size={17} />{:else}<Eye size={17} />{/if}<span class="sr-only">{visible ? 'Hide password' : 'Show password'}</span></button>
				</div>
			</div>
			{#if form?.rateLimited}<p class="error" role="alert">Too many attempts. Please wait 15 minutes and try again.</p>{:else if form?.invalid}<p class="error" role="alert">That email and password don't match an active account. Check for typos and try again.</p>{/if}
			<button class="submit" disabled={loading} aria-busy={loading}>{#if loading}<LoaderCircle class="spinner" size={17} />Signing in…{:else}Sign in<ArrowRight size={16} aria-hidden="true" />{/if}</button>
		</form>
		<p class="support">Forgot your password? Ask your administrator to reset it.</p>
	</section>
</main>

<style>
	.login-page { min-height: 100svh; display: grid; place-items: center; padding: 32px 16px; background: radial-gradient(ellipse at 20% 0%, color-mix(in srgb, var(--purple) 10%, transparent), transparent 32rem), var(--bg, #f8fafc); }
	.login-card { width: min(420px, 100%); box-sizing: border-box; padding: 32px; border: 1px solid var(--line); border-radius: 20px; background: var(--card); color: var(--theme-text); box-shadow: 0 24px 60px #0f172a14; }
	.brand { display: flex; align-items: center; gap: 12px; margin-bottom: 26px; }
	.brand img { border-radius: 10px; }
	.brand strong { display: block; font-size: 16px; }
	.brand small { font-size: 13px; color: var(--muted); }
	h1 { margin: 0; font-size: 26px; font-weight: 750; letter-spacing: -.02em; }
	.lede { margin: 6px 0 22px; font-size: 14px; line-height: 1.5; color: var(--muted); }
	form { display: grid; gap: 16px; }
	.login-field { display: grid; gap: 6px; }
	.login-field label { font-size: 14px; font-weight: 600; }
	.login-field small { font-size: 12.5px; color: var(--muted); }
	.input-box { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 6px 0 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); color: var(--muted); transition: border-color .15s ease; }
	.input-box:focus-within { border-color: var(--purple); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple) 18%, transparent); }
	.input-box input { box-shadow: none; padding: 0; flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; color: var(--theme-text); font-size: 16px; }
	.toggle { width: 40px; height: 40px; display: grid; place-items: center; border: 0; border-radius: 10px; background: transparent; color: var(--muted); cursor: pointer; }
	.toggle:hover { background: var(--theme-soft); color: var(--theme-text); }
	.error { margin: 0; padding: 10px 12px; border-radius: 10px; background: color-mix(in srgb, #dc2626 10%, var(--card)); color: #b91c1c; font-size: 14px; line-height: 1.45; }
	.submit { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 50px; border: 0; border-radius: 12px; background: var(--purple); color: var(--accent-text, #fff); font-size: 16px; font-weight: 700; cursor: pointer; }
	.submit:disabled { opacity: .7; cursor: progress; }
	.submit :global(.spinner) { animation: spin 1s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.support { margin: 20px 0 0; padding-top: 16px; border-top: 1px solid var(--line); font-size: 13px; color: var(--muted); text-align: center; }
	.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
	@media (max-width: 420px) { .login-card { padding: 24px 18px; } }
	@media (prefers-reduced-motion: reduce) { .submit :global(.spinner) { animation: none; } }
</style>
