// Plain-language device and approximate location for a sign-in. Location comes from Vercel's edge headers
// (city/region/country only); the IP address itself is never stored.

export function deviceFromUserAgent(userAgent: string | null) {
	const ua = userAgent || '';
	if (!ua) return 'Unknown device';
	const browser = /Edg\//.test(ua) ? 'Edge'
		: /OPR\/|Opera/.test(ua) ? 'Opera'
		: /SamsungBrowser/.test(ua) ? 'Samsung Internet'
		: /Firefox\/|FxiOS/.test(ua) ? 'Firefox'
		: /Chrome\/|CriOS/.test(ua) ? 'Chrome'
		: /Safari\//.test(ua) ? 'Safari'
		: 'Browser';
	const system = /iPhone/.test(ua) ? 'iPhone'
		: /iPad/.test(ua) ? 'iPad'
		: /Android/.test(ua) ? (/Mobile/.test(ua) ? 'Android phone' : 'Android tablet')
		: /Windows/.test(ua) ? 'Windows'
		: /Mac OS X|Macintosh/.test(ua) ? 'Mac'
		: /CrOS/.test(ua) ? 'Chromebook'
		: /Linux/.test(ua) ? 'Linux'
		: 'Unknown system';
	return `${browser} on ${system}`;
}

const decode = (value: string | null) => {
	if (!value) return '';
	try { return decodeURIComponent(value).trim(); } catch { return value.trim(); }
};

export function locationFromHeaders(headers: Headers) {
	const city = decode(headers.get('x-vercel-ip-city'));
	const region = decode(headers.get('x-vercel-ip-country-region'));
	const code = decode(headers.get('x-vercel-ip-country')).toUpperCase();
	if (!city && !code) return 'Local';
	let country = code;
	try { country = (code && new Intl.DisplayNames(['en'], { type: 'region' }).of(code)) || code; } catch { /* keep the code */ }
	return [city, code === 'IN' || code === 'US' ? region : '', country].filter(Boolean).join(', ').slice(0, 120);
}

export function clientInfo(request: Request) {
	return {
		device: deviceFromUserAgent(request.headers.get('user-agent')).slice(0, 80),
		location: locationFromHeaders(request.headers)
	};
}
