<!-- Client-admin login with stable email/password state and password visibility. -->
<script lang="ts">
	import PortalHeader from '$lib/components/PortalHeader.svelte';
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import { ArrowRight, AtSign, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck } from '@lucide/svelte';
	let { form } = $props();
	let loading = $state(false);
	let visible = $state(false);
	let email = $state(untrack(() => form?.email || ''));
	let password = $state('');
</script>

<svelte:head><title>Sign in — StudioFlow</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<PortalHeader/>
<main class="login-page">
	<section class="login-shell">
		<aside class="login-visual">
			<div class="visual-brand"><span>SF</span><div><strong>StudioFlow</strong><small>Creative operations workspace</small></div></div>
			<div class="visual-copy">
				<p>Built for editing studios</p>
				<h2>Every project stage, connected and clear.</h2>
				<div class="benefits"><span><Check size={12}/>Projects</span><span><Check size={12}/>Editors</span><span><Check size={12}/>Billing</span></div>
			</div>
		</aside>
		<section class="login-card">
			<div class="login-mark"><ShieldCheck size={20}/></div>
			<p class="eyebrow">Secure studio workspace</p>
			<h1>Welcome back</h1>
			<p class="lede">Use the login provided by your StudioFlow owner.</p>
			<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { try { await update(); } finally { loading = false; } }; }}>
				<label>Email address<span class="input-box"><AtSign size={15}/><input name="email" type="email" bind:value={email} autocomplete="username" placeholder="you@studio.com" required /></span></label>
				<label>Password<span class="input-box"><LockKeyhole size={15}/><input name="password" type={visible ? 'text' : 'password'} bind:value={password} autocomplete="current-password" placeholder="Enter your password" required /><button type="button" onclick={() => visible = !visible} aria-label={visible ? 'Hide password' : 'Show password'}>{#if visible}<EyeOff size={16}/>{:else}<Eye size={16}/>{/if}</button></span></label>
				{#if form?.rateLimited}<div class="error">Too many attempts. Please wait 15 minutes.</div>{:else if form?.invalid}<div class="error">Email or password is incorrect, or this workspace is not active.</div>{/if}
				<button class="primary" disabled={loading} aria-busy={loading}>{#if loading}<LoaderCircle class="spinner" size={16}/>Signing in…{:else}Sign in securely<ArrowRight size={15}/>{/if}</button>
			</form>
			<div class="support"><LockKeyhole class="support-icon" size={13}/><span>Need access or a password reset? Contact your StudioFlow owner.</span></div>
		</section>
	</section>
</main>

<style>
	.login-page{min-height:calc(100svh - 68px);display:grid;place-items:center;padding:44px 24px;background:radial-gradient(circle at 18% 20%,var(--theme-soft),transparent 36%),var(--background)}
	.login-shell{width:min(940px,100%);min-height:560px;display:grid;grid-template-columns:1.08fr .92fr;overflow:hidden;border:1px solid color-mix(in srgb,var(--purple) 24%,var(--line));border-radius:26px;background:var(--card);box-shadow:0 34px 100px #0003,0 0 0 4px color-mix(in srgb,var(--purple) 5%,transparent)}
	.login-visual{position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:34px;color:white;background:linear-gradient(180deg,#070a1bb8,#080b20e8),url('/studioflow-social.png') center/cover}
	.login-visual:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,#8b5cf622,transparent 46%,#84cc1618)}
	.visual-brand,.visual-copy{position:relative;z-index:1}.visual-brand{display:flex;align-items:center;gap:11px}.visual-brand>span{width:39px;height:39px;display:grid;place-items:center;border:1px solid #ffffff38;border-radius:12px;background:#ffffff15;font-size:12px;font-weight:800}.visual-brand div{display:grid}.visual-brand strong{font-size:11px}.visual-brand small{margin-top:2px;color:#ffffff9e;font-size:8px}
	.visual-copy p{margin:0 0 10px;color:#c4b5fd;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.14em}.visual-copy h2{max-width:390px;margin:0;font-size:31px;line-height:1.08;letter-spacing:-.035em}.benefits{display:flex;flex-wrap:wrap;gap:7px;margin-top:20px}.benefits span{display:flex;align-items:center;gap:5px;padding:7px 9px;border:1px solid #ffffff22;border-radius:99px;background:#ffffff10;color:#ffffffe0;font-size:8px}
	.login-card{align-self:center;padding:44px 42px}.login-mark{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:var(--theme-soft);color:var(--purple)}.eyebrow{margin:18px 0 6px;color:var(--purple);text-transform:uppercase;letter-spacing:.12em;font-size:8px;font-weight:700}.login-card h1{margin:0 0 8px;font-size:30px;letter-spacing:-.03em}.lede{margin:0 0 27px;color:var(--muted);font-size:10px;line-height:1.6}.login-card form{display:grid;gap:16px}.login-card label{display:grid;gap:8px;color:var(--theme-text);font-size:9px;font-weight:700}.input-box{position:relative;display:flex;align-items:center;gap:9px;height:46px;padding:0 11px;border:1px solid color-mix(in srgb,var(--purple) 25%,var(--line));border-radius:12px;background:color-mix(in srgb,var(--theme-soft) 34%,var(--card));color:var(--muted);box-shadow:inset 0 1px 0 #fff1;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}.input-box:focus-within{border-color:var(--purple);background:var(--card);color:var(--purple);box-shadow:0 0 0 3px color-mix(in srgb,var(--purple) 14%,transparent)}.login-card .input-box input{min-width:0;flex:1;width:100%;height:44px;padding:0;border:0;outline:0;background:transparent;color:var(--theme-text);box-shadow:none}.login-card .input-box input::placeholder{color:color-mix(in srgb,var(--muted) 80%,transparent)}.login-card label button{position:static;flex:none;width:33px;height:33px;display:grid;place-items:center;border:0;border-radius:9px;background:transparent;color:var(--muted)}.login-card label button:hover{background:var(--theme-soft);color:var(--purple)}.primary{height:48px;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:2px;border-radius:11px;font-weight:750}.primary:disabled{cursor:wait;opacity:.72}.error{padding:10px;border:1px solid #ef44442e;border-radius:9px;background:#ef444412;color:#ef4444;font-size:9px;line-height:1.45}.support{display:flex;align-items:flex-start;justify-content:center;gap:7px;margin-top:20px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:8px;line-height:1.5}:global(.support-icon){flex:none;margin-top:1px}:global(.spinner){animation:spin .75s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
	@media(max-width:760px){.login-page{min-height:calc(100svh - 58px);place-items:start center;padding:18px 14px 28px}.login-shell{width:min(460px,100%);min-height:auto;display:block;border-radius:20px}.login-visual{display:none}.login-card{align-self:auto;padding:30px 26px}.login-card h1{font-size:28px}.login-mark{width:40px;height:40px}.lede{margin-bottom:22px}.login-card form{gap:14px}.support{margin-top:18px;padding-top:16px}}
	@media(max-width:420px){.login-page{padding:10px 8px 22px}.login-shell{border-radius:17px}.login-card{padding:24px 18px}.login-card h1{font-size:25px}.eyebrow{margin-top:14px}.input-box{height:48px}.primary{height:50px}.support{font-size:7.5px}}
</style>
