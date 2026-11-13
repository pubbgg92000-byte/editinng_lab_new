// In-app confirmation dialog (replaces window.confirm / window.prompt, which some embedded and
// in-app browsers suppress, silently returning "No").
import { writable } from 'svelte/store';

export type ConfirmOptions = {
	title?: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	danger?: boolean;
	/** When set, the user must type this exact text before confirming (e.g. a workspace slug). */
	requireText?: string;
};

type ConfirmState = (ConfirmOptions & { open: true; resolve: (value: boolean) => void }) | { open: false };

export const confirmState = writable<ConfirmState>({ open: false });

/** Ask the user to confirm. Resolves true on confirm, false on cancel or Escape. */
export function askConfirm(options: ConfirmOptions | string): Promise<boolean> {
	const opts = typeof options === 'string' ? { message: options } : options;
	return new Promise((resolve) => {
		confirmState.update((previous) => {
			// A newer question replaces the one on screen; answer the old one "No" so its caller never hangs.
			if (previous.open) previous.resolve(false);
			return { ...opts, open: true, resolve };
		});
	});
}

/** Shorthand for a destructive or important action: red confirm button. */
export function confirmDanger(message: string, confirmLabel = 'Yes, continue') {
	return askConfirm({ message, confirmLabel, danger: true });
}
