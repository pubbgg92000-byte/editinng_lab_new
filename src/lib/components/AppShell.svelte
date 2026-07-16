<script lang="ts">
	import { page } from '$app/state';
	import { sidebarOpen } from '$lib/stores/app';
	import type { ActivityLog, Customer, Editor, Order, StudioSettings } from '$lib/types';
	import { LayoutDashboard, Users, ClipboardList, UserRound, ReceiptText, Settings, Menu, Search, Bell, Command, X, ArrowUpRight } from 'lucide-svelte';
	type Notification = ActivityLog & { path: string };
	let { children, settings, customers = [], editors = [], orders = [], notifications = [] }: { children: import('svelte').Snippet; settings: StudioSettings; customers?: Customer[]; editors?: Editor[]; orders?: Order[]; notifications?: Notification[] } = $props();
	const nav = [
		{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, { label: 'Customers', href: '/customers', icon: Users },
		{ label: 'Orders', href: '/orders', icon: ClipboardList }, { label: 'Editors', href: '/editors', icon: UserRound },
		{ label: 'Invoices', href: '/invoices', icon: ReceiptText }, { label: 'Settings', href: '/settings', icon: Settings }
	];
	let searchOpen = $state(false);
	let notificationsOpen = $state(false);
	let notificationWrap = $state<HTMLDivElement>();
	let query = $state('');
	let searchInput = $state<HTMLInputElement>();
	const searchResults = $derived([
		...nav.map((item) => ({ title: item.label, subtitle: 'Workspace', href: item.href, type: 'Page' })),
		...orders.map((order) => ({ title: order.project, subtitle: `${order.customer} · ${order.workType}`, href: `/orders/${order.id}`, type: 'Order' })),
		...customers.map((customer) => ({ title: customer.business, subtitle: customer.phone || customer.name, href: '/customers', type: 'Customer' })),
		...editors.map((editor) => ({ title: editor.name, subtitle: editor.specialty || editor.phone, href: '/editors', type: 'Editor' }))
	].filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12));
	function openSearch() { searchOpen = true; query = ''; setTimeout(() => searchInput?.focus()); }
	function keyboard(event: KeyboardEvent) { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); } if (event.key === 'Escape') { searchOpen = false; notificationsOpen = false; } }
	function closeNotificationsOutside(event: PointerEvent) {
		if (notificationsOpen && notificationWrap && !notificationWrap.contains(event.target as Node)) notificationsOpen = false;
	}
	function confirmSignOut(event: MouseEvent) {
		if (!window.confirm('Are you sure you want to sign out?')) event.preventDefault();
	}
</script>
<svelte:window onkeydown={keyboard} onpointerdown={closeNotificationsOutside}/>
<svelte:head><title>Anjana Creations — Editing work, clearly managed</title><meta name="description" content="Anjana Creations workflow for customers, editing, billing and delivery." /></svelte:head>
<div class="app-shell">
	{#if $sidebarOpen}<button class="scrim" aria-label="Close menu" onclick={() => ($sidebarOpen = false)}></button>{/if}
	<aside class:open={$sidebarOpen}>
		<div class="brand-row"><a href="/dashboard" class="brand" aria-label="Anjana Creations home"><span class="brand-logo" aria-hidden="true"><img src="/anjana-creations-logo.png" alt="" /></span><span class="brand-name"><strong>Anjana</strong><small>Creations</small></span></a><button class="icon-btn mobile-close" aria-label="Close menu" onclick={() => ($sidebarOpen = false)}><X size={18} /></button></div>
		<nav><p class="nav-label">Workspace</p>{#each nav as item}<a href={item.href} class:active={page.url.pathname.startsWith(item.href)} onclick={() => ($sidebarOpen = false)}><item.icon size={18} strokeWidth={1.8} /><span>{item.label}</span></a>{/each}</nav>
		<div class="sidebar-footer"><div class="sync"><span class="sync-dot"></span><div><strong>Sheets connected</strong><small>Automatic retry enabled</small></div></div><a href="/logout" class="profile" onclick={confirmSignOut}><span class="avatar">{settings.studioName.split(/\s+/).map((part) => part[0]).join('').slice(0,2).toUpperCase()}</span><div><strong>{settings.studioName}</strong><small>Sign out</small></div><span class="chev">→</span></a></div>
	</aside>
	<section class="workspace"><div class="topbar"><button class="icon-btn menu-btn" aria-label="Open menu" onclick={() => ($sidebarOpen = true)}><Menu size={20} /></button><button class="search-button" onclick={openSearch}><Search size={16} /><span>Search anything...</span><kbd><Command size={11} /> K</kbd></button><div class="top-actions"><div class="notification-wrap" bind:this={notificationWrap}><button class="icon-btn" aria-label="Notifications" aria-expanded={notificationsOpen} onclick={() => (notificationsOpen = !notificationsOpen)}><Bell size={18} />{#if notifications.length}<span class="notice"></span>{/if}</button>{#if notificationsOpen}<div class="notification-popover"><div class="popover-head"><strong>Notifications</strong><span>{notifications.length} recent</span></div>{#each notifications as notification}<a href={notification.path} onclick={() => (notificationsOpen = false)}><span>{notification.action}</span><small>{notification.details || `${notification.entityType} update`}</small><time>{new Date(notification.createdAt).toLocaleString()}</time><ArrowUpRight size={13}/></a>{/each}{#if !notifications.length}<p>No notifications yet.</p>{/if}</div>{/if}</div><span class="top-avatar">{settings.studioName.split(/\s+/).map((part)=>part[0]).join('').slice(0,2).toUpperCase()}</span></div></div><main>{@render children()}</main></section>
</div>
{#if searchOpen}<div class="search-overlay" role="presentation" onclick={(event) => { if (event.currentTarget === event.target) searchOpen = false; }}><div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search"><div class="search-input"><Search size={18}/><input bind:this={searchInput} bind:value={query} placeholder="Search orders, customers, editors and pages"/><button onclick={() => (searchOpen = false)}><X size={16}/></button></div><div class="search-results">{#each searchResults as result}<a href={result.href} onclick={() => (searchOpen = false)}><div><strong>{result.title}</strong><small>{result.subtitle}</small></div><span>{result.type}</span><ArrowUpRight size={14}/></a>{/each}{#if !searchResults.length}<p>No matching results.</p>{/if}</div></div></div>{/if}

<style>.notification-wrap{position:relative}.notification-popover{position:absolute;right:0;top:42px;width:340px;max-height:430px;overflow:auto;border:1px solid var(--line);border-radius:14px;background:var(--card);box-shadow:0 24px 70px #0005;padding:8px;z-index:80}.popover-head{display:flex;justify-content:space-between;align-items:center;padding:9px 10px 12px}.popover-head strong{font-size:12px}.popover-head span{font-size:8px;color:var(--muted)}.notification-popover>a{position:relative;display:grid;grid-template-columns:1fr auto;gap:3px 10px;border-radius:9px;padding:10px;color:inherit}.notification-popover>a:hover{background:var(--theme-soft)}.notification-popover>a span{font-size:10px;font-weight:600}.notification-popover>a small,.notification-popover>a time{font-size:8px;color:var(--muted)}.notification-popover>a time{grid-column:1}.notification-popover>a :global(svg){grid-column:2;grid-row:1/3;color:var(--purple);align-self:center}.notification-popover>p,.search-results>p{text-align:center;color:var(--muted);font-size:10px;padding:24px}.search-overlay{position:fixed;inset:0;z-index:200;background:#02061780;backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:flex-start;padding-top:12vh}.search-dialog{width:min(620px,calc(100vw - 30px));border:1px solid var(--line);border-radius:17px;background:var(--card);box-shadow:0 32px 100px #0008;overflow:hidden}.search-input{height:58px;display:flex;align-items:center;gap:11px;padding:0 16px;border-bottom:1px solid var(--line);color:var(--purple)}.search-input input{flex:1;border:0;outline:0;background:transparent;color:inherit;font-size:13px}.search-input button{border:0;background:transparent;color:var(--muted);display:grid}.search-results{max-height:430px;overflow:auto;padding:8px}.search-results>a{display:grid;grid-template-columns:1fr auto 18px;gap:12px;align-items:center;padding:11px;border-radius:10px;color:inherit}.search-results>a:hover{background:var(--theme-soft)}.search-results>a div{display:flex;flex-direction:column;gap:3px}.search-results strong{font-size:11px}.search-results small,.search-results>a>span{color:var(--muted);font-size:8px}.search-results :global(svg){color:var(--purple)}@media(max-width:600px){.notification-popover{position:fixed;left:12px;right:12px;top:65px;width:auto}}</style>
