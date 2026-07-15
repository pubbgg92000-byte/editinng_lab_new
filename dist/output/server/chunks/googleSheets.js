import { t as private_env } from "./shared-server.js";
//#region src/lib/server/googleSheets.ts
var headers = () => ({
	Authorization: `Bearer ${private_env.GOOGLE_SHEETS_ACCESS_TOKEN}`,
	"Content-Type": "application/json"
});
async function appendSheetRow(sheet, values) {
	if (!private_env.GOOGLE_SHEETS_ID || !private_env.GOOGLE_SHEETS_ACCESS_TOKEN) return {
		synced: false,
		mode: "demo"
	};
	const range = encodeURIComponent(`${sheet}!A:Z`);
	const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${private_env.GOOGLE_SHEETS_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ values: [values] })
	});
	if (!response.ok) throw new Error(`Google Sheets sync failed: ${response.status}`);
	return {
		synced: true,
		mode: "live"
	};
}
async function logActivity(action, entity, detail) {
	return appendSheetRow("Activity Logs", [
		(/* @__PURE__ */ new Date()).toISOString(),
		action,
		entity,
		detail
	]);
}
async function readSheetValues(sheet) {
	if (!private_env.GOOGLE_SHEETS_ID || !private_env.GOOGLE_SHEETS_ACCESS_TOKEN) return null;
	const range = encodeURIComponent(`${sheet}!A:Z`);
	const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${private_env.GOOGLE_SHEETS_ID}/values/${range}`, { headers: headers() });
	if (!response.ok) throw new Error(`Google Sheets read failed: ${response.status}`);
	return (await response.json()).values || [];
}
//#endregion
export { logActivity as n, readSheetValues as r, appendSheetRow as t };
