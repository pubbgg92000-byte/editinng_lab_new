<script lang="ts">
	import { page } from '$app/state';
	import { sidebarOpen } from '$lib/stores/app';
	import { LayoutDashboard, Users, ClipboardList, UserRound, ReceiptText, Settings, Menu, Search, Bell, Command, X } from 'lucide-svelte';
	let { children } = $props();
	const nav = [
		{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, { label: 'Customers', href: '/customers', icon: Users },
		{ label: 'Orders', href: '/orders', icon: ClipboardList }, { label: 'Editors', href: '/editors', icon: UserRound },
		{ label: 'Invoices', href: '/invoices', icon: ReceiptText }, { label: 'Settings', href: '/settings', icon: Settings }
	];
</script>
<svelte:head><title>StudioFlow — Editing work, clearly managed</title><meta name="description" content="A lightweight workflow system for editing studios." /></svelte:head>
<div class="app-shell">
	{#if $sidebarOpen}<button class="scrim" aria-label="Close menu" onclick={() => ($sidebarOpen = false)}></button>{/if}
	<aside class:open={$sidebarOpen}>
		<div class="brand-row"><a href="/dashboard" class="brand" aria-label="StudioFlow home"><span class="mark"><span></span><span></span><span></span></span><strong>StudioFlow</strong></a><button class="icon-btn mobile-close" aria-label="Close menu" onclick={() => ($sidebarOpen = false)}><X size={18} /></button></div>
		<nav><p class="nav-label">Workspace</p>{#each nav as item}<a href={item.href} class:active={page.url.pathname.startsWith(item.href)} onclick={() => ($sidebarOpen = false)}><item.icon size={18} strokeWidth={1.8} /><span>{item.label}</span></a>{/each}</nav>
		<div class="sidebar-footer"><div class="sync"><span class="sync-dot"></span><div><strong>Sheets synced</strong><small>Just now</small></div></div><div class="profile"><span class="avatar">AS</span><div><strong>Arvind Studio</strong><small>Administrator</small></div><span class="chev">•••</span></div></div>
	</aside>
	<section class="workspace"><div class="topbar"><button class="icon-btn menu-btn" aria-label="Open menu" onclick={() => ($sidebarOpen = true)}><Menu size={20} /></button><button class="search-button"><Search size={16} /><span>Search anything...</span><kbd><Command size={11} /> K</kbd></button><div class="top-actions"><button class="icon-btn" aria-label="Notifications"><Bell size={18} /><span class="notice"></span></button><span class="top-avatar">AS</span></div></div><main>{@render children()}</main></section>
</div>
