<!-- Client-admin login with stable email/password state and password visibility. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, untrack } from 'svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import AtSign from '@lucide/svelte/icons/at-sign';
	import Baby from '@lucide/svelte/icons/baby';
	import BedDouble from '@lucide/svelte/icons/bed-double';
	import Bike from '@lucide/svelte/icons/bike';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import BriefcaseBusiness from '@lucide/svelte/icons/briefcase-business';
	import Building2 from '@lucide/svelte/icons/building-2';
	import CakeSlice from '@lucide/svelte/icons/cake-slice';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Camera from '@lucide/svelte/icons/camera';
	import CarFront from '@lucide/svelte/icons/car-front';
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import Coffee from '@lucide/svelte/icons/coffee';
	import Drill from '@lucide/svelte/icons/drill';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Flower2 from '@lucide/svelte/icons/flower-2';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import Hammer from '@lucide/svelte/icons/hammer';
	import Handshake from '@lucide/svelte/icons/handshake';
	import HardHat from '@lucide/svelte/icons/hard-hat';
	import HeartPulse from '@lucide/svelte/icons/heart-pulse';
	import House from '@lucide/svelte/icons/house';
	import Laptop from '@lucide/svelte/icons/laptop';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import Music2 from '@lucide/svelte/icons/music-2';
	import Palette from '@lucide/svelte/icons/palette';
	import PawPrint from '@lucide/svelte/icons/paw-print';
	import Plane from '@lucide/svelte/icons/plane';
	import Printer from '@lucide/svelte/icons/printer';
	import Scissors from '@lucide/svelte/icons/scissors';
	import Shirt from '@lucide/svelte/icons/shirt';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import SprayCan from '@lucide/svelte/icons/spray-can';
	import Stethoscope from '@lucide/svelte/icons/stethoscope';
	import Store from '@lucide/svelte/icons/store';
	import Truck from '@lucide/svelte/icons/truck';
	import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed';
	import Wrench from '@lucide/svelte/icons/wrench';
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
	<div class="login-topbar"><span>ND</span><div><strong>NexaDesk</strong><small>Business access</small></div></div>
	<div class="niche-icons" aria-hidden="true">
		<span class="niche-icon camera"><Camera size={23}/></span>
		<span class="niche-icon scissors"><Scissors size={22}/></span>
		<span class="niche-icon wrench"><Wrench size={23}/></span>
		<span class="niche-icon shop"><ShoppingBag size={22}/></span>
		<span class="niche-icon food"><UtensilsCrossed size={22}/></span>
		<span class="niche-icon health"><Stethoscope size={23}/></span>
		<span class="niche-icon office"><BriefcaseBusiness size={22}/></span>
		<span class="niche-icon trade"><HardHat size={22}/></span>
		<span class="niche-icon vehicle"><CarFront size={22}/></span>
		<span class="niche-icon creative"><Palette size={22}/></span>
		<span class="niche-icon education"><GraduationCap size={23}/></span>
		<span class="niche-icon fitness"><Dumbbell size={22}/></span>
		<span class="niche-icon pets"><PawPrint size={22}/></span>
		<span class="niche-icon property"><House size={22}/></span>
		<span class="niche-icon technology"><Laptop size={22}/></span>
		<span class="niche-icon construction"><Hammer size={22}/></span>
		<span class="niche-icon wellness"><Flower2 size={22}/></span>
		<span class="niche-icon scheduling"><CalendarDays size={22}/></span>
		<span class="niche-icon hospitality"><BedDouble size={22}/></span>
		<span class="niche-icon cafe"><Coffee size={22}/></span>
		<span class="niche-icon events"><CakeSlice size={22}/></span>
		<span class="niche-icon delivery"><Truck size={23}/></span>
		<span class="niche-icon travel"><Plane size={22}/></span>
		<span class="niche-icon fashion"><Shirt size={22}/></span>
		<span class="niche-icon music"><Music2 size={22}/></span>
		<span class="niche-icon cleaning"><SprayCan size={22}/></span>
		<span class="niche-icon storefront"><Store size={22}/></span>
		<span class="niche-icon print"><Printer size={22}/></span>
		<span class="niche-icon mobile"><Smartphone size={22}/></span>
		<span class="niche-icon cycling"><Bike size={23}/></span>
		<span class="niche-icon reading"><BookOpen size={22}/></span>
		<span class="niche-icon care"><HeartPulse size={22}/></span>
		<span class="niche-icon partnership"><Handshake size={23}/></span>
		<span class="niche-icon family"><Baby size={22}/></span>
		<span class="niche-icon contractor"><Drill size={22}/></span>
		<span class="niche-icon enterprise"><Building2 size={22}/></span>
	</div>
	<section class="login-card">
			<div class="login-brand"><span>ND</span><div><strong>NexaDesk</strong><small>Business access</small></div></div>
			<h1>Sign in</h1>
			<p class="lede">Access your business account.</p>
			<form method="POST" use:enhance={() => { loading = true; return async ({ update }) => { try { await update(); } finally { loading = false; } }; }}>
				<label><span class="field-label">Email <RequiredMark/> <button type="button" class="help-button" aria-label="Use the email assigned to your NexaDesk business account."><CircleHelp size={13}/></button></span><span class="input-box"><AtSign size={15}/><input name="email" type="email" bind:value={email} autocomplete="username" placeholder="name@example.com" required aria-required="true" /></span></label>
				<label><span class="field-label">Password <RequiredMark/> <button type="button" class="help-button" aria-label="Use the password provided or reset by your account administrator."><CircleHelp size={13}/></button></span><span class="input-box"><LockKeyhole size={15}/><input name="password" type={visible ? 'text' : 'password'} bind:value={password} autocomplete="current-password" placeholder="Enter password" required aria-required="true" /><button type="button" onclick={() => visible = !visible} aria-label={visible ? 'Hide password' : 'Show password'}>{#if visible}<EyeOff size={16}/>{:else}<Eye size={16}/>{/if}</button></span></label>
				{#if form?.rateLimited}<div class="error">Too many attempts. Please wait 15 minutes.</div>{:else if form?.invalid}<div class="error">Email or password is incorrect, or this account is not active.</div>{/if}
				<button class="primary" disabled={loading} aria-busy={loading}>{#if loading}<LoaderCircle class="spinner" size={16}/>Signing in…{:else}Sign in<ArrowRight size={15}/>{/if}</button>
			</form>
			<div class="support"><LockKeyhole class="support-icon" size={13}/><span>Contact your administrator for access or a password reset.</span></div>
	</section>
</main>

<style>
	.login-page{position:relative;isolation:isolate;min-height:100svh;display:grid;place-items:center;overflow:hidden;padding:84px 22px 34px;background:radial-gradient(ellipse at 16% 10%,color-mix(in srgb,var(--purple) 11%,transparent),transparent 30rem),radial-gradient(ellipse at 88% 18%,#06b6d410,transparent 28rem),radial-gradient(ellipse at 52% 105%,#10b9810c,transparent 30rem),linear-gradient(145deg,#f8fafc 0%,#f3f7f8 48%,#edf5f5 100%)}.login-page::before{content:"";position:absolute;z-index:-3;inset:0;background-image:linear-gradient(#0f172a08 1px,transparent 1px),linear-gradient(90deg,#0f172a08 1px,transparent 1px);background-size:38px 38px;mask-image:radial-gradient(ellipse at center,black 10%,transparent 82%)}.login-page::after{content:"";position:absolute;z-index:-2;left:50%;top:50%;width:min(620px,78vw);height:min(620px,78vw);border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,color-mix(in srgb,var(--purple) 7%,transparent),transparent 68%);filter:blur(12px);pointer-events:none}.login-topbar{position:absolute;z-index:3;top:26px;left:clamp(22px,5vw,70px);display:flex;align-items:center;gap:11px;color:#0f172a}.login-topbar>span{width:40px;height:40px;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--purple) 22%,#dbe4ea);border-radius:13px;background:var(--purple);color:#fff;font-size:10px;font-weight:850;box-shadow:0 12px 30px color-mix(in srgb,var(--purple) 18%,transparent)}.login-topbar div{display:grid}.login-topbar strong{font-size:13px}.login-topbar small{margin-top:3px;color:#64748b;font-size:8px;text-transform:uppercase;letter-spacing:.14em}
	.niche-icons{position:absolute;z-index:-1;inset:0;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));grid-template-rows:repeat(6,minmax(0,1fr));grid-auto-flow:dense;gap:4px;width:100%;box-sizing:border-box;padding:64px 18px 18px;overflow:hidden;opacity:.16;pointer-events:none}.niche-icon{--icon-size:30px;position:relative;width:var(--icon-size);height:var(--icon-size);display:grid;place-items:center;align-self:center;justify-self:center;color:var(--icon-color);filter:drop-shadow(0 2px 7px color-mix(in srgb,var(--icon-color) 15%,transparent));animation:niche-float 11s ease-in-out infinite}.niche-icon :global(svg){width:100%;height:100%;stroke-width:1.3}.niche-icon:nth-child(6n+1){--icon-size:44px;translate:-9px -13px;animation-delay:-2s}.niche-icon:nth-child(6n+2){--icon-size:20px;translate:12px 15px;animation-delay:-5s}.niche-icon:nth-child(6n+3){--icon-size:34px;translate:-5px 8px;animation-delay:-7s}.niche-icon:nth-child(6n+4){--icon-size:25px;translate:15px -8px;animation-delay:-3s}.niche-icon:nth-child(6n+5){--icon-size:50px;translate:-13px 6px;animation-delay:-6s}.niche-icon:nth-child(6n){--icon-size:16px;translate:7px -14px;animation-delay:-4s}.niche-icon:nth-child(7n+1){grid-column:span 2}.niche-icon:nth-child(8n+3){grid-row:span 2}@keyframes niche-float{0%,100%{transform:rotate(-2deg) translateY(0)}50%{transform:rotate(2deg) translateY(-6px)}}.camera{--icon-color:#7c3aed}.scissors{--icon-color:#be3f78}.wrench{--icon-color:#0788a5}.shop{--icon-color:#9f7900}.food{--icon-color:#b85f1b}.health{--icon-color:#008d6c}.office{--icon-color:#5b62bd}.trade{--icon-color:#008d88}.vehicle{--icon-color:#087ca2}.creative{--icon-color:#a646b7}.education{--icon-color:#575bad}.fitness{--icon-color:#b94d60}.pets{--icon-color:#96710b}.property{--icon-color:#047f64}.technology{--icon-color:#316dac}.construction{--icon-color:#a95c22}.wellness{--icon-color:#b23f76}.scheduling{--icon-color:#7651ad}.hospitality{--icon-color:#6470a8}.cafe{--icon-color:#9a6b12}.events{--icon-color:#ad5365}.delivery{--icon-color:#078e99}.travel{--icon-color:#267c9e}.fashion{--icon-color:#9c589f}.music{--icon-color:#6f54a5}.cleaning{--icon-color:#16877f}.storefront{--icon-color:#9b7818}.print{--icon-color:#467597}.mobile{--icon-color:#27838e}.cycling{--icon-color:#377f54}.reading{--icon-color:#68649b}.care{--icon-color:#ad5365}.partnership{--icon-color:#25847b}.family{--icon-color:#a15b79}.contractor{--icon-color:#a1683d}.enterprise{--icon-color:#397b92}
	.login-card{position:relative;width:min(440px,100%);box-sizing:border-box;padding:39px;border:1px solid #ffffff20;border-radius:26px;background:linear-gradient(160deg,#142039ee,#091426f2);color:#f8fafc;box-shadow:0 42px 130px #000a,0 0 0 6px #ffffff08,0 0 70px #06b6d41a;backdrop-filter:blur(24px)}.login-card::before{content:"";position:absolute;top:-1px;left:19%;right:19%;height:2px;border-radius:0 0 5px 5px;background:linear-gradient(90deg,transparent,#a78bfa,#22d3ee,#34d399,transparent);box-shadow:0 0 18px #22d3ee99}.login-brand{display:flex;align-items:center;justify-content:center;gap:11px;margin-bottom:26px}.login-brand>span{width:43px;height:43px;display:grid;place-items:center;border:1px solid #ffffff24;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#0891b2 68%,#0d9488);color:#fff;font-size:11px;font-weight:850;box-shadow:0 13px 30px #06b6d43b}.login-brand div{display:grid}.login-brand strong{font-size:13px}.login-brand small{margin-top:3px;color:#94a3b8;font-size:8px;text-transform:uppercase;letter-spacing:.12em}.login-card h1{margin:0 0 8px;text-align:center;color:#fff;font-size:31px;letter-spacing:-.035em}.lede{margin:0 0 24px;text-align:center;color:#94a3b8;font-size:11px;line-height:1.65}.login-card form{display:grid;gap:16px}.login-card label{display:grid;gap:8px;color:#e2e8f0;font-size:11px;font-weight:700}.field-label{display:flex;align-items:center;gap:5px}.help-button{width:18px!important;height:18px!important;display:grid!important;place-items:center;padding:0!important;border:0;border-radius:50%!important;background:transparent;color:#94a3b8}.help-button:hover,.help-button:focus-visible{background:#ffffff0d;color:#67e8f9}.input-box{position:relative;display:flex;align-items:center;gap:9px;height:49px;padding:0 11px;border:1px solid #ffffff1d;border-radius:13px;background:#ffffff0a;color:#94a3b8;box-shadow:inset 0 1px #ffffff0d,0 10px 28px #0002;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}.input-box:hover{border-color:#67e8f94d;background:#ffffff0d}.input-box:focus-within{border-color:#22d3ee;background:#ffffff0f;color:#67e8f9;box-shadow:0 0 0 4px #22d3ee1c,0 15px 34px #0003}.login-card .input-box input{min-width:0;flex:1;width:100%;height:47px;padding:0;border:0;outline:0;background:transparent;color:#f8fafc;box-shadow:none;font-size:12px}.login-card .input-box input::placeholder{color:#64748b}.login-card .input-box button{position:static;flex:none;width:33px;height:33px;display:grid;place-items:center;border:0;border-radius:9px;background:transparent;color:#94a3b8}.login-card .input-box button:hover{background:#ffffff0d;color:#67e8f9}.primary{height:51px;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:2px;border:1px solid #ffffff16;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#0891b2 62%,#0d9488);color:#fff;font-weight:800;box-shadow:0 15px 34px #06b6d42b}.primary:hover{filter:brightness(1.08);transform:translateY(-1px)}.primary:disabled{cursor:wait;opacity:.72}.error{padding:10px;border:1px solid #fb71853a;border-radius:9px;background:#fb718514;color:#fda4af;font-size:11px;line-height:1.45}.support{display:flex;align-items:flex-start;justify-content:center;gap:7px;margin-top:20px;padding-top:18px;border-top:1px solid #ffffff12;color:#8090a7;font-size:9px;line-height:1.55}:global(.support-icon){flex:none;margin-top:1px}:global(.spinner){animation:spin .75s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
	/* Theme-aligned light surface and unified browser-autofill treatment. */
	.login-card{width:min(440px,calc(100vw - 26px));max-width:100%;min-width:0;border-color:#d7e3e7;background:#fffffff2;color:#0f172a;box-shadow:0 34px 100px #0f172a1a,0 0 0 6px #ffffff70,0 0 55px color-mix(in srgb,var(--purple) 8%,transparent)}
	.login-card::before{background:linear-gradient(90deg,transparent,var(--purple),#06b6d4,transparent);box-shadow:0 0 15px color-mix(in srgb,var(--purple) 34%,transparent)}
	.login-brand>span{border-color:color-mix(in srgb,var(--purple) 20%,#d7e3e7);background:var(--purple);box-shadow:0 12px 28px color-mix(in srgb,var(--purple) 22%,transparent)}
	.login-brand strong,.login-card h1{color:#0f172a}.login-brand small,.lede{color:#64748b}.login-card label{color:#1e293b}
	.help-button{color:#718096}.help-button:hover,.help-button:focus-visible{background:color-mix(in srgb,var(--purple) 9%,transparent);color:var(--purple)}
	.input-box{border-color:#cbd8df;background:#f7fafb;color:#64748b;box-shadow:inset 0 1px #fff,0 8px 22px #0f172a08}.input-box:hover{border-color:color-mix(in srgb,var(--purple) 38%,#cbd8df);background:#fff}.input-box:focus-within{border-color:var(--purple);background:#fff;color:var(--purple);box-shadow:0 0 0 4px color-mix(in srgb,var(--purple) 13%,transparent),0 12px 28px #0f172a0d}
	.login-card .input-box input{color:#0f172a}.login-card .input-box input::placeholder{color:#94a3b8}.login-card .input-box button{color:#718096}.login-card .input-box button:hover{background:color-mix(in srgb,var(--purple) 8%,transparent);color:var(--purple)}
	.login-card .input-box input:-webkit-autofill,.login-card .input-box input:-webkit-autofill:hover,.login-card .input-box input:-webkit-autofill:focus{-webkit-text-fill-color:#0f172a;caret-color:#0f172a;-webkit-box-shadow:0 0 0 1000px #f7fafb inset;transition:background-color 9999s ease-out 0s}.input-box:has(input:-webkit-autofill){border-color:#cbd8df;background:#f7fafb;color:var(--purple)}
	.primary{border-color:color-mix(in srgb,var(--purple) 22%,transparent);background:var(--purple);color:#fff;box-shadow:0 14px 32px color-mix(in srgb,var(--purple) 24%,transparent)}
	.error{border-color:#ef444436;background:#ef444410;color:#dc2626}.support{border-top-color:#e2e8f0;color:#718096}
	@media(max-width:760px){.login-page{place-items:start center;padding:86px 13px 28px}.login-page::after{width:130vw;height:130vw}.login-topbar{top:20px;left:20px}.niche-icons{grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(9,minmax(0,1fr));gap:3px;padding:70px 4px 8px;opacity:.12}.niche-icon:nth-child(6n+1){--icon-size:38px}.niche-icon:nth-child(6n+2){--icon-size:17px}.niche-icon:nth-child(6n+3){--icon-size:29px}.niche-icon:nth-child(6n+4){--icon-size:21px}.niche-icon:nth-child(6n+5){--icon-size:44px}.niche-icon:nth-child(6n){--icon-size:15px}.login-card{padding:31px 27px;border-radius:22px}.login-card h1{font-size:28px}.login-card form{gap:14px}.support{margin-top:18px;padding-top:16px}}
	@media(max-width:420px){.login-page{padding:80px 8px 24px}.login-topbar{top:16px;left:16px}.login-topbar>span{width:36px;height:36px}.login-card{padding:26px 19px;border-radius:19px}.login-brand{margin-bottom:23px}.login-card h1{font-size:25px}.input-box{height:48px}.primary{height:50px}.support{font-size:9px}}
	@media(prefers-reduced-motion:reduce){.niche-icon{animation:none}.primary:hover{transform:none}}
</style>
