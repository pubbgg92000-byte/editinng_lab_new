import { env } from '$env/dynamic/private';

const headers = () => ({ Authorization: `Bearer ${env.GOOGLE_SHEETS_ACCESS_TOKEN}`, 'Content-Type': 'application/json' });
export async function appendSheetRow(sheet: string, values: unknown[]) {
	if (!env.GOOGLE_SHEETS_ID || !env.GOOGLE_SHEETS_ACCESS_TOKEN) return { synced: false, mode: 'demo' as const };
	const range = encodeURIComponent(`${sheet}!A:Z`);
	const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEETS_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, { method: 'POST', headers: headers(), body: JSON.stringify({ values: [values] }) });
	if (!response.ok) throw new Error(`Google Sheets sync failed: ${response.status}`);
	return { synced: true, mode: 'live' as const };
}

export async function logActivity(action: string, entity: string, detail: string) { return appendSheetRow('Activity Logs', [new Date().toISOString(), action, entity, detail]); }

export async function readSheetValues(sheet: string) {
	if (!env.GOOGLE_SHEETS_ID || !env.GOOGLE_SHEETS_ACCESS_TOKEN) return null;
	const range = encodeURIComponent(`${sheet}!A:Z`);
	const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEETS_ID}/values/${range}`, { headers: headers() });
	if (!response.ok) throw new Error(`Google Sheets read failed: ${response.status}`);
	const payload = await response.json() as { values?: unknown[][] };
	return payload.values || [];
}
