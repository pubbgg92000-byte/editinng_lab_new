export function externalUrlError(value: unknown, label: string) {
	if (value === undefined || value === null || String(value).trim() === '') return '';
	const raw = String(value).trim();
	if (raw.length > 2048) return `${label} is too long.`;
	try {
		const url = new URL(raw);
		if (!['http:', 'https:'].includes(url.protocol)) return `${label} must be an external HTTP(S) link.`;
		if (url.username || url.password) return `${label} cannot contain embedded credentials.`;
		return '';
	} catch {
		return `${label} must be a valid external URL.`;
	}
}

export function taskLinkError(input: Record<string, unknown>) {
	return externalUrlError(input.textLink, 'Reference link')
		|| externalUrlError(input.imageUrl, 'Image URL')
		|| externalUrlError(input.outputLink, 'Output link');
}
