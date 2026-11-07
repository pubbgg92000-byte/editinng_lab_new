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

/**
 * Drop-in replacement for `fetch` in UI code that never throws and always returns a
 * JSON body. Network failures become a 503 with a friendly `error`, and non-JSON error
 * pages become `{ error }`. Callers keep their existing `response.ok` / `response.json()`
 * handling, but can no longer get stuck in a busy state or fail silently.
 */
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	const jsonResponse = (body: unknown, status: number) =>
		new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
	let response: Response;
	try {
		response = await fetch(input, init);
	} catch {
		return jsonResponse({ error: 'Connection problem. Check your internet and try again.' }, 503);
	}
	const status = response.status === 204 || response.status === 205 || response.status === 304 ? 200 : response.status;
	const text = await response.text().catch(() => '');
	if (!text) return jsonResponse({}, status);
	try {
		return jsonResponse(JSON.parse(text), status);
	} catch {
		return jsonResponse(response.ok ? {} : { error: `Something went wrong (error ${response.status}). Please try again.` }, status);
	}
}
