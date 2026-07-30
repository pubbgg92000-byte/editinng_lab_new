import { writable } from 'svelte/store';

export type ActionNotice = {
	id: number;
	message: string;
	type: 'success' | 'error';
};

type ActionFeedbackState = {
	loading: boolean;
	label: string;
	notice: ActionNotice | null;
};

export const actionFeedback = writable<ActionFeedbackState>({
	loading: false,
	label: 'Working…',
	notice: null
});

let pendingActions = 0;
let loadingTimer: ReturnType<typeof setTimeout> | undefined;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
let nextNoticeId = 0;

export function beginAction(label = 'Saving changes…') {
	pendingActions += 1;
	if (pendingActions === 1) {
		if (loadingTimer) clearTimeout(loadingTimer);
		loadingTimer = setTimeout(() => {
			if (pendingActions > 0) actionFeedback.update((state) => ({ ...state, loading: true, label }));
		}, 180);
	}
	let finished = false;
	return () => {
		if (finished) return;
		finished = true;
		pendingActions = Math.max(0, pendingActions - 1);
		if (pendingActions) return;
		if (loadingTimer) clearTimeout(loadingTimer);
		loadingTimer = undefined;
		actionFeedback.update((state) => ({ ...state, loading: false }));
	};
}

export function notifyAction(message: string, type: ActionNotice['type'] = 'success') {
	if (noticeTimer) clearTimeout(noticeTimer);
	const notice = { id: ++nextNoticeId, message, type };
	actionFeedback.update((state) => ({ ...state, notice }));
	noticeTimer = setTimeout(() => dismissActionNotice(notice.id), type === 'error' ? 8000 : 4200);
}

export function dismissActionNotice(id?: number) {
	actionFeedback.update((state) => {
		if (id && state.notice?.id !== id) return state;
		return { ...state, notice: null };
	});
}

export function flashAction(message: string, type: ActionNotice['type'] = 'success') {
	try {
		sessionStorage.setItem('nexadesk-action-flash', JSON.stringify({ message, type }));
	} catch {
		notifyAction(message, type);
	}
}

export function consumeActionFlash() {
	try {
		const value = sessionStorage.getItem('nexadesk-action-flash');
		if (!value) return;
		sessionStorage.removeItem('nexadesk-action-flash');
		const parsed = JSON.parse(value) as { message?: string; type?: ActionNotice['type'] };
		if (parsed.message) notifyAction(parsed.message, parsed.type === 'error' ? 'error' : 'success');
	} catch {
		// Ignore unavailable or malformed browser storage.
	}
}
