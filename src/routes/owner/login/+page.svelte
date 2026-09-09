<!-- Separate master-owner login; normal client accounts use /login. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import RequiredMark from '$lib/components/RequiredMark.svelte';
	import { AtSign, CircleHelp, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, ShieldCheck } from '@lucide/svelte';
	let { form } = $props();
	let loading = $state(false);
	let visible = $state(false);
</script>

<svelte:head><title>Administrator sign in — NexaDesk</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<main class="owner-login-page">
	<section class="owner-login-shell">
		<aside class="owner-login-info">
			<div class="master-brand"><span>ND</span><div><strong>NexaDesk</strong><small>Platform administration</small></div></div>
			<div class="workspace-art" aria-hidden="true">
				<svg viewBox="0 0 520 360" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="panel-fill" x1="115" y1="68" x2="408" y2="306" gradientUnits="userSpaceOnUse">
							<stop stop-color="#FFFFFF" stop-opacity=".16"/>
							<stop offset="1" stop-color="#FFFFFF" stop-opacity=".04"/>
						</linearGradient>
						<linearGradient id="flow-line" x1="97" y1="258" x2="433" y2="98" gradientUnits="userSpaceOnUse">
							<stop stop-color="#A78BFA"/>
							<stop offset=".54" stop-color="#22D3EE"/>
							<stop offset="1" stop-color="#34D399"/>
						</linearGradient>
						<filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
							<feGaussianBlur stdDeviation="8"/>
						</filter>
					</defs>
					<circle cx="421" cy="76" r="44" fill="#22D3EE" fill-opacity=".16" filter="url(#soft-glow)"/>
					<circle cx="102" cy="284" r="48" fill="#A78BFA" fill-opacity=".2" filter="url(#soft-glow)"/>
					<rect x="88" y="54" width="344" height="250" rx="28" fill="url(#panel-fill)" stroke="#FFFFFF" stroke-opacity=".18"/>
					<rect x="112" y="79" width="296" height="38" rx="12" fill="#FFFFFF" fill-opacity=".08"/>
					<circle cx="133" cy="98" r="5" fill="#34D399"/>
					<rect x="150" y="94" width="72" height="8" rx="4" fill="#FFFFFF" fill-opacity=".68"/>
					<rect x="337" y="91" width="48" height="14" rx="7" fill="#22D3EE" fill-opacity=".22"/>
					<rect x="112" y="137" width="88" height="76" rx="15" fill="#FFFFFF" fill-opacity=".08" stroke="#FFFFFF" stroke-opacity=".12"/>
					<rect x="216" y="137" width="88" height="76" rx="15" fill="#FFFFFF" fill-opacity=".08" stroke="#FFFFFF" stroke-opacity=".12"/>
					<rect x="320" y="137" width="88" height="76" rx="15" fill="#FFFFFF" fill-opacity=".08" stroke="#FFFFFF" stroke-opacity=".12"/>
					<circle cx="134" cy="160" r="8" fill="#A78BFA" fill-opacity=".8"/>
					<circle cx="238" cy="160" r="8" fill="#22D3EE" fill-opacity=".8"/>
					<circle cx="342" cy="160" r="8" fill="#34D399" fill-opacity=".8"/>
					<rect x="128" y="181" width="51" height="6" rx="3" fill="#FFFFFF" fill-opacity=".56"/>
					<rect x="232" y="181" width="51" height="6" rx="3" fill="#FFFFFF" fill-opacity=".56"/>
					<rect x="336" y="181" width="51" height="6" rx="3" fill="#FFFFFF" fill-opacity=".56"/>
					<path d="M122 267C165 220 210 279 260 239C312 198 352 248 399 224" stroke="url(#flow-line)" stroke-width="4" stroke-linecap="round"/>
					<circle cx="122" cy="267" r="7" fill="#A78BFA"/>
					<circle cx="260" cy="239" r="7" fill="#22D3EE"/>
					<circle cx="399" cy="224" r="7" fill="#34D399"/>
				</svg>
			</div>
			<div class="master-copy">
				<h2>Every workspace, one secure platform.</h2>
			</div>
		</aside>

		<section class="owner-login-card">
			<div class="mobile-brand"><span>ND</span><strong>NexaDesk</strong><small>Platform administration</small></div>
			<div class="mark"><ShieldCheck size={22}/></div>
			<h1>Administrator sign in</h1>
			<p class="lede">Enter your administrator credentials.</p>
			<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { try { await update(); } finally { loading = false; } }; }}>
				<label><span class="field-label">Email <RequiredMark/> <button type="button" class="help-button" aria-label="Use the platform administrator email configured during setup."><CircleHelp size={13}/></button></span><span class="owner-input-box"><AtSign size={15}/><input name="email" type="email" value={form?.email || ''} autocomplete="username" placeholder="admin@example.com" required aria-required="true" /></span></label>
				<label><span class="field-label">Password <RequiredMark/> <button type="button" class="help-button" aria-label="Use the platform administrator password. Workspace user passwords do not work here."><CircleHelp size={13}/></button></span><span class="owner-input-box"><LockKeyhole size={15}/><input name="password" type={visible ? 'text' : 'password'} autocomplete="current-password" placeholder="Enter password" required aria-required="true" /><button type="button" onclick={() => visible = !visible} aria-label={visible ? 'Hide password' : 'Show password'}>{#if visible}<EyeOff size={16}/>{:else}<Eye size={16}/>{/if}</button></span></label>
				{#if form?.rateLimited}<div class="error">Too many sign-in attempts. Please wait 15 minutes and try again.</div>{:else if form?.invalid}<div class="error">The administrator email or password is incorrect.</div>{/if}
				<button class="submit" disabled={loading} aria-busy={loading}>{#if loading}<LoaderCircle class="spinner" size={16}/>Signing in…{:else}<KeyRound size={16}/>Sign in{/if}</button>
			</form>
		</section>
	</section>
</main>

<style>
	.owner-login-page{position:relative;isolation:isolate;min-height:100svh;display:grid;place-items:center;overflow:hidden;padding:34px 22px;background:radial-gradient(circle at 15% 14%,color-mix(in srgb,var(--purple) 16%,transparent),transparent 31rem),radial-gradient(circle at 86% 84%,#14b8a60e,transparent 27rem),var(--background)}.owner-login-page::before{content:"";position:absolute;z-index:-1;right:-130px;top:-150px;width:310px;height:310px;border:1px solid color-mix(in srgb,var(--purple) 22%,transparent);border-radius:50%;box-shadow:0 0 100px color-mix(in srgb,var(--purple) 13%,transparent)}
	.owner-login-shell{width:min(940px,100%);min-height:560px;display:grid;grid-template-columns:1.05fr .95fr;overflow:hidden;border:1px solid color-mix(in srgb,var(--purple) 24%,var(--line));border-radius:28px;background:var(--card);box-shadow:0 40px 120px #0003,0 0 0 5px color-mix(in srgb,var(--purple) 5%,transparent)}
	.owner-login-info{position:relative;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;padding:38px;color:white;background:radial-gradient(circle at 78% 18%,#38bdf81a,transparent 17rem),linear-gradient(145deg,#080d22,#14112c 58%,#0d2930)}.owner-login-info::after{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(#ffffff06 1px,transparent 1px),linear-gradient(90deg,#ffffff06 1px,transparent 1px);background-size:28px 28px;mask-image:linear-gradient(to bottom,black,transparent 78%)}
	.master-brand{display:flex;align-items:center;gap:11px}.master-brand>span{width:42px;height:42px;display:grid;place-items:center;border:1px solid #ffffff35;border-radius:13px;background:#ffffff12;font-size:12px;font-weight:800}.master-brand div{display:grid}.master-brand strong{font-size:12px}.master-brand small{margin-top:3px;color:#ffffff9d;font-size:8px;text-transform:uppercase;letter-spacing:.13em}
	.workspace-art{position:absolute;z-index:1;inset:94px 20px 96px;display:grid;place-items:center}.workspace-art svg{width:100%;height:auto;filter:drop-shadow(0 30px 46px #0006)}.master-copy,.master-brand{position:relative;z-index:2}.master-copy h2{max-width:400px;margin:0;font-size:33px;line-height:1.08;letter-spacing:-.04em}
	.owner-login-card{align-self:center;min-width:0;padding:42px}.mobile-brand{display:none}.mark{width:47px;height:47px;display:grid;place-items:center;margin-bottom:20px;border:1px solid color-mix(in srgb,var(--purple) 16%,var(--line));border-radius:14px;background:var(--theme-soft);color:var(--purple);box-shadow:0 10px 26px color-mix(in srgb,var(--purple) 12%,transparent)}.owner-login-card h1{margin:0 0 9px;font-size:30px;letter-spacing:-.035em}.lede{margin:0 0 24px;color:var(--muted);font-size:10px;line-height:1.65}
	form{display:grid;gap:16px}label{display:grid;gap:8px;color:var(--theme-text);font-size:11px;font-weight:700}.field-label{display:flex;align-items:center;gap:5px}.help-button{width:18px;height:18px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;background:transparent;color:var(--muted)}.help-button:hover,.help-button:focus-visible{background:var(--theme-soft);color:var(--purple)}.owner-input-box{position:relative;display:flex;align-items:center;gap:9px;width:100%;height:48px;box-sizing:border-box;padding:0 11px;border:1px solid color-mix(in srgb,var(--purple) 25%,var(--line));border-radius:12px;background:color-mix(in srgb,var(--theme-soft) 34%,var(--card));color:var(--muted);box-shadow:inset 0 1px #fff1,0 8px 22px #0f172a08;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}.owner-input-box:hover{border-color:color-mix(in srgb,var(--purple) 42%,var(--line))}.owner-input-box:focus-within{border-color:var(--purple);background:var(--card);color:var(--purple);box-shadow:0 0 0 4px color-mix(in srgb,var(--purple) 13%,transparent),0 12px 26px #0f172a0b}.owner-input-box input{min-width:0;flex:1;width:100%;height:46px;padding:0;border:0;outline:0;background:transparent;color:var(--theme-text);box-shadow:none;font-size:12px}.owner-input-box input::placeholder{color:color-mix(in srgb,var(--muted) 78%,transparent)}.owner-input-box button{position:static;flex:none;width:33px;height:33px;display:grid;place-items:center;border:0;border-radius:9px;background:transparent;color:var(--muted)}.owner-input-box button:hover{background:var(--theme-soft);color:var(--purple)}.submit{height:50px;display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:11px;background:var(--purple);color:white;font-size:10px;font-weight:780;box-shadow:0 12px 28px color-mix(in srgb,var(--purple) 22%,transparent)}.submit:disabled{cursor:wait;opacity:.7}.error{padding:11px;border:1px solid #ef44442e;border-radius:9px;background:#ef444412;color:#ef4444;font-size:10px;line-height:1.5}:global(.spinner){animation:spin .75s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
	@media(max-width:900px){.owner-login-page{place-items:start center;padding:22px 14px 30px}.owner-login-shell{width:min(500px,100%);min-height:auto;display:block;border-radius:22px}.owner-login-info{display:none}.owner-login-card{padding:30px}.mobile-brand{display:grid;grid-template-columns:48px minmax(0,1fr);grid-template-rows:auto auto;align-items:center;margin-bottom:28px}.mobile-brand>span{grid-row:1/3;width:36px;height:36px;display:grid;place-items:center;border-radius:11px;background:linear-gradient(135deg,var(--purple),#0891b2);color:#fff;font-size:10px;font-weight:800;box-shadow:0 9px 22px color-mix(in srgb,var(--purple) 24%,transparent)}.mobile-brand strong{font-size:12px;line-height:1.15}.mobile-brand small{color:var(--muted);font-size:8px;letter-spacing:.08em;text-transform:uppercase}.mark{display:none}.owner-login-card h1{font-size:28px}.lede{margin-bottom:22px}}
	@media(max-width:520px){.owner-login-page{padding:12px 9px 24px}.owner-login-shell{border-radius:18px}.owner-login-card{padding:24px 20px 27px}.mobile-brand{margin-bottom:24px}.owner-login-card h1{font-size:25px}.mark{width:42px;height:42px}.owner-input-box,.submit{height:49px}}
</style>
