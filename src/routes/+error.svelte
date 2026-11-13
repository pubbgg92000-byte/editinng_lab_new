<script lang="ts">
	import { page } from '$app/state';

	const status = $derived(page.status);
	const notFound = $derived(status === 404);
	const heading = $derived(notFound ? 'Page not found' : 'Something went wrong');
	const detail = $derived(
		notFound
			? "This page doesn't exist or may have moved."
			: page.error?.message && page.error.message !== 'Internal Error'
				? page.error.message
				: 'An unexpected error happened. Please try again.'
	);
</script>

<svelte:head><title>{heading}</title></svelte:head>

<main class="error-shell">
	<div class="error-card">
		<p class="code">{status}</p>
		<h1>{heading}</h1>
		<p class="detail">{detail}</p>
		<div class="buttons">
			<a class="primary" href="/">Go to sign in</a>
			<button class="secondary" onclick={() => history.back()}>Go back</button>
		</div>
	</div>
</main>

<style>
	.error-shell {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 24px 16px;
		background: var(--surface-muted, #f5f5f7);
		color: var(--ink, #1a1a2e);
	}
	.error-card {
		width: 100%;
		max-width: 420px;
		background: var(--surface, #fff);
		border: 1px solid var(--border, #e4e4ea);
		border-radius: 16px;
		padding: 32px 28px;
		text-align: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	}
	.code {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--purple, #6366f1);
		margin: 0 0 8px;
	}
	h1 {
		font-size: 22px;
		margin: 0 0 10px;
	}
	.detail {
		font-size: 14px;
		color: var(--muted, #6b6b78);
		margin: 0 0 24px;
		line-height: 1.5;
	}
	.buttons {
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.buttons a,
	.buttons button {
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		padding: 11px 18px;
		border-radius: 10px;
		cursor: pointer;
		border: 1px solid transparent;
		text-decoration: none;
		transition: background 150ms, border-color 150ms, color 150ms;
	}
	.primary {
		background: var(--purple, #6366f1);
		color: #fff;
	}
	.primary:hover {
		background: var(--purple-dark, #4f46e5);
	}
	.secondary {
		background: var(--surface, #fff);
		border-color: var(--border, #e4e4ea);
		color: var(--ink, #1a1a2e);
	}
	.secondary:hover {
		border-color: var(--purple, #6366f1);
		color: var(--purple, #6366f1);
	}
</style>
