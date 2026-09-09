type ApiErrorBody = {
	error?: unknown;
	message?: unknown;
};

function messageFrom(body: ApiErrorBody | null, fallback: string) {
	const candidate = body?.error ?? body?.message;
	return typeof candidate === 'string' && candidate.trim() ? candidate : fallback;
}

/**
 * Fetch JSON from an application endpoint and always surface a useful,
 * user-safe error. This prevents interrupted requests or empty proxy responses
 * from leaving a form stuck in its loading state.
 */
export async function requestJson<T>(
	input: RequestInfo | URL,
	init: RequestInit,
	fallbackMessage: string
): Promise<T> {
	let response: Response;
	try {
		response = await fetch(input, init);
	} catch {
		throw new Error(`${fallbackMessage} Check your connection and try again.`);
	}

	const text = await response.text();
	let body: (T & ApiErrorBody) | null = null;
	if (text) {
		try {
			body = JSON.parse(text) as T & ApiErrorBody;
		} catch {
			if (response.ok) throw new Error(`${fallbackMessage} The server returned an invalid response.`);
		}
	}

	if (!response.ok) {
		throw new Error(messageFrom(body, `${fallbackMessage} (Error ${response.status})`));
	}
	if (body === null) throw new Error(`${fallbackMessage} The server returned an empty response.`);
	return body;
}
