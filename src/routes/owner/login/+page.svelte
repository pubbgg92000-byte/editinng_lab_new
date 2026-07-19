<!-- Separate master-owner login; normal client accounts use /login. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Check, Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from '@lucide/svelte';
	let { form } = $props();
	let loading = $state(false);
	let visible = $state(false);
</script>

<svelte:head><title>Master owner sign in — StudioFlow</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<main class="owner-login-page">
	<section class="owner-login-shell">
		<aside class="owner-login-info">
			<div class="master-brand"><span>SF</span><div><strong>StudioFlow</strong><small>Master control</small></div></div>
			<div class="master-copy">
				<p>Private owner access</p>
				<h2>Manage every client workspace from one secure place.</h2>
				<div class="master-benefits">
					<span><Check size={13}/>Create and activate client workspaces</span>
					<span><Check size={13}/>Store Neon and Google Sheet connections securely</span>
					<span><Check size={13}/>Update client login ID and reset passwords</span>
				</div>
			</div>
		</aside>

		<section class="owner-login-card">
			<div class="mark"><ShieldCheck size={22}/></div>
			<p class="eyebrow">StudioFlow master portal</p>
			<h1>Owner sign in</h1>
			<p class="lede">Use your master owner email and password. Client, editor, and customer logins do not work here.</p>
			<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { try { await update(); } finally { loading = false; } }; }}>
				<label>Master owner email<input name="email" type="email" value={form?.email || ''} autocomplete="username" placeholder="owner@yourstudio.com" required /></label>
				<label>Master password<span><input name="password" type={visible ? 'text' : 'password'} autocomplete="current-password" placeholder="Enter your master password" required /><button type="button" onclick={() => visible = !visible} aria-label={visible ? 'Hide password' : 'Show password'}>{#if visible}<EyeOff size={16}/>{:else}<Eye size={16}/>{/if}</button></span></label>
				{#if form?.rateLimited}<div class="error">Too many sign-in attempts. Please wait 15 minutes and try again.</div>{:else if form?.invalid}<div class="error">The master owner email or password is incorrect.</div>{/if}
				<button class="submit" disabled={loading} aria-busy={loading}>{#if loading}<LoaderCircle class="spinner" size={16}/>Signing in…{:else}<KeyRound size={16}/>Open master control{/if}</button>
			</form>
			<div class="security-note"><ShieldCheck size={14}/><span>This private login controls client databases, Sheets, and access credentials.</span></div>
		</section>
	</section>
</main>

<style>
	.owner-login-page{min-height:100svh;display:grid;place-items:center;padding:34px 22px;background:radial-gradient(circle at 18% 18%,var(--theme-soft),transparent 34%),var(--background)}
	.owner-login-shell{width:min(900px,100%);min-height:530px;display:grid;grid-template-columns:1.05fr .95fr;overflow:hidden;border:1px solid var(--line);border-radius:26px;background:var(--card);box-shadow:0 34px 100px #0003}
	.owner-login-info{display:flex;flex-direction:column;justify-content:space-between;padding:36px;color:white;background:linear-gradient(145deg,#0a1025,#15112d 58%,#102a32)}
	.master-brand{display:flex;align-items:center;gap:11px}.master-brand>span{width:42px;height:42px;display:grid;place-items:center;border:1px solid #ffffff35;border-radius:13px;background:#ffffff12;font-size:12px;font-weight:800}.master-brand div{display:grid}.master-brand strong{font-size:12px}.master-brand small{margin-top:3px;color:#ffffff9d;font-size:8px;text-transform:uppercase;letter-spacing:.13em}
	.master-copy>p{margin:0 0 10px;color:#7dd3fc;font-size:8px;font-weight:750;text-transform:uppercase;letter-spacing:.14em}.master-copy h2{max-width:390px;margin:0;font-size:30px;line-height:1.1;letter-spacing:-.035em}.master-benefits{display:grid;gap:10px;margin-top:25px}.master-benefits span{display:flex;align-items:center;gap:8px;color:#ffffffe0;font-size:9px}.master-benefits :global(svg){color:#5eead4;flex:none}
	.owner-login-card{align-self:center;padding:42px}.mark{width:46px;height:46px;display:grid;place-items:center;border-radius:14px;background:var(--theme-soft);color:var(--purple)}.eyebrow{margin:18px 0 6px;color:var(--purple);font-size:8px;font-weight:750;text-transform:uppercase;letter-spacing:.12em}.owner-login-card h1{margin:0 0 8px;font-size:29px;letter-spacing:-.03em}.lede{margin:0 0 25px;color:var(--muted);font-size:9px;line-height:1.65}
	form{display:grid;gap:16px}label{display:grid;gap:7px;color:var(--theme-text);font-size:9px;font-weight:650}label span{position:relative}input{width:100%;height:44px;box-sizing:border-box;padding-right:43px}label span button{position:absolute;right:5px;top:5px;width:34px;height:34px;border:0;background:transparent;color:var(--muted)}.submit{height:46px;display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:10px;background:var(--purple);color:white;font-weight:750}.submit:disabled{cursor:wait;opacity:.7}.error{padding:11px;border-radius:9px;background:#ef444412;color:#ef4444;font-size:9px;line-height:1.5}.security-note{display:flex;align-items:flex-start;gap:7px;margin-top:21px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:8px;line-height:1.5}.security-note :global(svg){flex:none;margin-top:1px}:global(.spinner){animation:spin .75s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
	@media(max-width:760px){.owner-login-page{place-items:start center;padding:18px 14px 28px}.owner-login-shell{width:min(470px,100%);min-height:auto;display:block;border-radius:20px}.owner-login-info{display:none}.owner-login-card{padding:31px 27px}.owner-login-card h1{font-size:27px}.lede{margin-bottom:22px}}
	@media(max-width:420px){.owner-login-page{padding:10px 8px 22px}.owner-login-shell{border-radius:17px}.owner-login-card{padding:25px 19px}.owner-login-card h1{font-size:25px}input{height:46px}.submit{height:48px}}
</style>
