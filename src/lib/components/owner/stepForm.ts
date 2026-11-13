// Shared validation for step-by-step forms: red box + plain message under each missed field.
import './stepForm.css';

const messageFor = (input: HTMLInputElement | HTMLSelectElement) => {
	const v = input.validity;
	if (v.customError) return input.validationMessage;
	if (v.valueMissing) return input instanceof HTMLSelectElement ? 'Please choose one.' : 'Please fill this in.';
	if (v.typeMismatch && input.type === 'email') return 'Enter a valid email, like name@example.com.';
	if (v.tooShort && input instanceof HTMLInputElement) return `Use at least ${input.minLength} characters.`;
	if (v.patternMismatch) return input.dataset.error || 'This format is not right. Check the hint above.';
	return input.validationMessage || 'Please check this.';
};

// Each field points at its own note. Field names can change (custom field rows renumber when one is removed), so notes are not looked up by name.
let noteCount = 0;
const errorFor = (input: HTMLElement) => { const id = input.getAttribute('aria-describedby'); return id ? document.getElementById(id) : null; };

export const clearError = (input: HTMLElement) => {
	input.removeAttribute('aria-invalid');
	errorFor(input)?.remove();
	input.removeAttribute('aria-describedby');
};

const showError = (input: HTMLInputElement | HTMLSelectElement, text: string) => {
	input.setAttribute('aria-invalid', 'true');
	let note = errorFor(input);
	if (!note) {
		note = document.createElement('small');
		note.id = `step-field-error-${++noteCount}`;
		note.className = 'step-field-error';
		note.setAttribute('role', 'alert');
		const parent = input.parentElement;
		const anchor = parent && parent.tagName !== 'LABEL' ? parent : input;
		anchor.after(note);
	}
	note.textContent = text;
	input.setAttribute('aria-describedby', note.id);
};

/** Validates every field in a step. Marks missed ones; focuses the first when `report` is true. */
export const validateStep = (section: HTMLElement | undefined, report = true) => {
	if (!section) return true;
	const inputs = Array.from(section.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[name]:not([disabled]):not([type="hidden"]), select[name]:not([disabled])'));
	let first: HTMLElement | null = null;
	for (const input of inputs) {
		if (input.checkValidity()) { if (report) clearError(input); continue; }
		if (report) showError(input, messageFor(input));
		first ??= input;
	}
	if (first && report) { first.closest('details')?.setAttribute('open', ''); first.focus(); }
	return !first;
};

/** Removes a field's error as soon as the person types or changes it. */
export const clearOnEdit = (node: HTMLElement) => {
	const handler = (event: Event) => {
		const target = event.target as HTMLElement;
		if (target.getAttribute('aria-invalid') === 'true') clearError(target);
		// Fields filled in automatically (e.g. web address from the name) clear once they become valid.
		requestAnimationFrame(() => node.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[aria-invalid="true"]').forEach((input) => { if (input.checkValidity()) clearError(input); }));
	};
	node.addEventListener('input', handler);
	node.addEventListener('change', handler);
	return { destroy() { node.removeEventListener('input', handler); node.removeEventListener('change', handler); } };
};
