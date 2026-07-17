<script lang="ts">
	import { enhance } from '$app/forms';
	import { Eye, EyeOff, ShieldCheck } from 'lucide-svelte';
	let { form } = $props();
	let loading = $state(false);
	let visible = $state(false);
</script>

<svelte:head><title>Owner sign in — StudioFlow</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<main class="owner-login">
	<div class="mark"><ShieldCheck size={22}/></div>
	<p>StudioFlow control</p><h1>Owner sign in</h1>
	<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { await update(); loading = false; }; }}>
		<label>Email<input name="email" type="email" value={form?.email || ''} autocomplete="username" required /></label>
		<label>Password<span><input name="password" type={visible ? 'text' : 'password'} autocomplete="current-password" required /><button type="button" onclick={() => visible = !visible} aria-label="Toggle password">{#if visible}<EyeOff size={15}/>{:else}<Eye size={15}/>{/if}</button></span></label>
		{#if form?.rateLimited}<div class="error">Too many attempts. Try again in 15 minutes.</div>{:else if form?.invalid}<div class="error">Owner credentials are incorrect.</div>{/if}
		<button class="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
	</form>
</main>

<style>
	.owner-login{width:min(390px,calc(100vw - 36px));margin:11vh auto;padding:30px;border:1px solid var(--line);border-radius:20px;background:var(--card);box-shadow:0 28px 80px #0002}.mark{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:var(--theme-soft);color:var(--purple)}p{margin:16px 0 4px;color:var(--purple);font-size:10px;text-transform:uppercase;letter-spacing:.12em}h1{margin:0 0 24px;font-size:25px}form{display:grid;gap:16px}label{display:grid;gap:7px;color:var(--muted);font-size:10px}label span{position:relative}input{width:100%;box-sizing:border-box}label span button{position:absolute;right:5px;top:5px;width:32px;height:32px;border:0;background:transparent;color:var(--muted)}.submit{height:42px;border:0;border-radius:9px;background:var(--purple);color:white;font-weight:650}.error{padding:10px;border-radius:8px;background:#ef444412;color:#ef4444;font-size:10px}
</style>
