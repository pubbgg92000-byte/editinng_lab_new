// Forms, APIs, duplicate checks, invoices, and WhatsApp all share this phone rule.
export function normalizeIndianMobile(value: unknown) {
	// Store one consistent 10-digit Indian number; an entered +91 prefix is removed.
	let digits = String(value || '').replace(/\D/g, '');
	if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
	return /^\d{10}$/.test(digits) ? digits : '';
}

export function indianMobileError(value: unknown, required = false) {
	// One shared rule keeps customer, editor, order, and settings validation identical.
	const raw = String(value || '').trim();
	if (!raw) return required ? 'Enter a 10-digit mobile number.' : '';
	return normalizeIndianMobile(raw) ? '' : 'Mobile number must contain exactly 10 digits. You may optionally add the +91 country code.';
}

export function whatsappNumber(value: unknown) {
	const local = normalizeIndianMobile(value);
	return local ? `91${local}` : '';
}
