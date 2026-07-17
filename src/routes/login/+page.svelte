<script lang="ts">
	import PortalHeader from '$lib/components/PortalHeader.svelte';
	import { enhance } from '$app/forms';
	import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-svelte';
	let { form } = $props();
	let loading = $state(false);
	let visible = $state(false);
</script>

<svelte:head><title>Sign in — StudioFlow</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<PortalHeader/>
<main class="login">
	<div class="login-mark"><ShieldCheck size={20}/></div><p class="eyebrow">Secure studio workspace</p><h1>Welcome back</h1><p>Sign in with the credentials provided for your studio.</p>
	<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { await update(); loading = false; }; }}>
		<label>Email<input name="email" type="email" value={form?.email || ''} autocomplete="username" required /></label>
		<label>Password<span><input name="password" type={visible ? 'text' : 'password'} autocomplete="current-password" required /><button type="button" onclick={() => visible = !visible} aria-label="Toggle password">{#if visible}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
		{#if form?.rateLimited}<div class="error">Too many attempts. Please wait 15 minutes.</div>{:else if form?.invalid}<div class="error">Email or password is incorrect, or this workspace is not active.</div>{/if}
		<button class="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}<ArrowRight size={14}/></button>
	</form>
	<small>Need access or a password reset? Contact your StudioFlow owner.</small>
</main>

<style>
	.login{width:min(390px,calc(100vw - 40px));margin:72px auto;padding:30px;border:1px solid var(--line);border-radius:20px;background:var(--card);box-shadow:0 28px 80px #0002}.login-mark{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:var(--theme-soft);color:var(--purple)}.eyebrow{margin:18px 0 5px!important;color:var(--purple)!important;text-transform:uppercase;letter-spacing:.1em;font-size:8px!important}.login h1{margin:0 0 6px;font-size:26px}.login>p{margin:0 0 22px;color:var(--muted);font-size:10px}.login form{display:grid;gap:16px}.login label{display:grid;gap:7px;color:var(--muted);font-size:9px}.login label span{position:relative}.login input{width:100%;box-sizing:border-box}.login label button{position:absolute;right:5px;top:5px;width:31px;height:31px;border:0;background:transparent;color:var(--muted)}.primary{height:42px;display:flex;align-items:center;justify-content:center;gap:7px}.error{padding:9px;border-radius:8px;background:#ef444412;color:#ef4444;font-size:9px}.login>small{display:block;margin-top:18px;text-align:center;color:var(--muted);font-size:8px}
</style>
