import { env } from '$env/dynamic/private';
import { createCustomer, getSettings, listActivity, listCustomers, listEditors, listInvoices, listOrders, markSyncResult, pendingSyncItems } from './repository';

let cachedToken: { value: string; expiresAt: number } | null = null;
const encoder = new TextEncoder();
const cleanEnvironmentValue = (value?: string) => {
	const cleaned = String(value || '').trim();
	return cleaned.length >= 2 && ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) ? cleaned.slice(1, -1).trim() : cleaned;
};
const spreadsheetId = () => {
	const value = cleanEnvironmentValue(env.GOOGLE_SHEETS_ID);
	const fromUrl = value.match(/\/spreadsheets\/d\/([^/?#]+)/)?.[1];
	return fromUrl || value;
};
const ordersTab = () => cleanEnvironmentValue(env.GOOGLE_SHEETS_ORDERS_TAB) || 'Orders';
const base64url = (value: string | Uint8Array) => {
	const bytes = typeof value === 'string' ? encoder.encode(value) : value;
	return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
};

function configured() {
	return Boolean(spreadsheetId() && cleanEnvironmentValue(env.GOOGLE_SERVICE_ACCOUNT_EMAIL) && cleanEnvironmentValue(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY));
}

async function accessToken() {
	if (!configured()) throw new Error('Google Sheets service account is not configured.');
	const serviceAccountEmail = cleanEnvironmentValue(env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
	const privateKey = cleanEnvironmentValue(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
	if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
	const issuedAt = Math.floor(Date.now() / 1000);
	const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const claim = base64url(JSON.stringify({ iss: serviceAccountEmail, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', iat: issuedAt, exp: issuedAt + 3600 }));
	const pem = privateKey.replaceAll('\\n', '\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
	const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), (character) => character.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
	const signature = base64url(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(`${header}.${claim}`))));
	const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${header}.${claim}.${signature}` }) });
	if (!response.ok) throw new Error(`Google authentication failed: ${response.status}`);
	const payload = await response.json() as { access_token: string; expires_in: number };
	cachedToken = { value: payload.access_token, expiresAt: Date.now() + payload.expires_in * 1000 };
	return payload.access_token;
}

async function googleFetch(path: string, init: RequestInit = {}) {
	const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId()}${path}`, { ...init, headers: { Authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json', ...(init.headers || {}) } });
	if (!response.ok) throw new Error(`Google Sheets request failed: ${response.status} ${await response.text()}`);
	return response;
}

const tabNames = ['Orders', 'Customers', 'Editors', 'Tasks', 'Payments', 'Invoices', 'Activity Logs', 'Settings'];

export async function ensureWorkbookTabs() {
	if (!configured()) return false;
	const metadata = await (await googleFetch('?fields=sheets.properties.title')).json() as { sheets?: { properties: { title: string } }[] };
	const existing = new Set((metadata.sheets || []).map((sheet) => sheet.properties.title));
	const required = [ordersTab(), ...tabNames.filter((name) => name !== 'Orders')];
	const missing = required.filter((name) => !existing.has(name));
	if (missing.length) await googleFetch(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: missing.map((title) => ({ addSheet: { properties: { title } } })) }) });
	return true;
}

export async function readSheetValues(sheet: string) {
	if (!configured()) return null;
	const response = await googleFetch(`/values/${encodeURIComponent(sheetRange(sheet, 'A:Z'))}`);
	return ((await response.json()) as { values?: unknown[][] }).values || [];
}

const sheetRange = (sheet: string, cells: string) => `'${sheet.replaceAll("'", "''")}'!${cells}`;

const definitions: Record<string, { headers: string[]; values: (payload: any) => unknown[] }> = {
	Orders: { headers: ['S', 'Studio Name', 'Mobile No.', 'Event', 'Names', 'Receiving', 'Duration', 'Amount', 'Advance', 'Balance', 'Source', 'Assigned Name', 'Remark', 'Record ID', 'Status', 'Progress', 'Due Date', 'Important', 'Historical'], values: (order) => [order.serial, order.customer, order.mobile || '', order.workType, order.project, order.receiving || '', order.duration || '', order.priceSet === false ? '' : order.price, order.advanceSet === false && !(order.payments || []).length ? '' : order.paid, order.priceSet === false ? '' : Math.max(0, order.price - order.paid), order.source || '', [...new Set((order.tasks || []).filter((task: any) => !task.archived && task.assignee !== 'Unassigned').map((task: any) => task.assignee))].join(', '), order.remarks || '', order.id, order.status, order.progress, order.due || '', order.important ? '★' : '', order.historical ? 'Yes' : 'No'] },
	Customers: { headers: ['Customer ID', 'Name', 'Studio Name', 'Phone', 'Email', 'Address', 'GSTIN', 'Projects', 'Pending', 'Archived', 'Record ID'], values: (customer) => [customer.id, customer.name, customer.business, customer.phone, customer.email, customer.address || '', customer.gst || '', customer.projects, customer.pending, customer.archived ? 'Yes' : 'No', customer.id] },
	Editors: { headers: ['Editor ID', 'Name', 'Phone', 'Specialty', 'Availability', 'Active Tasks', 'Archived', 'Record ID'], values: (editor) => [editor.id, editor.name, editor.phone, editor.specialty, editor.availability || (editor.available ? 'available' : 'busy'), editor.activeTasks, editor.archived ? 'Yes' : 'No', editor.id] },
	Tasks: { headers: ['Task ID', 'Order ID', 'Task', 'Editor ID', 'Editor Name', 'Due Date', 'Instructions', 'Text Link', 'Image URL', 'Status', 'Progress', 'Output Link', 'Notes', 'Archived', 'Record ID'], values: (task) => [task.id, task.orderId, task.name, task.editorId || '', task.assignee || '', task.due || '', task.instructions || '', task.textLink || '', task.imageUrl || '', task.status, task.progress, task.outputLink || '', task.notes || '', task.archived ? 'Yes' : 'No', task.id] },
	Payments: { headers: ['Payment ID', 'Order ID', 'Amount', 'Date', 'Method', 'Note', 'Record ID'], values: (payment) => [payment.id, payment.orderId, payment.amount, payment.paidAt, payment.method, payment.note, payment.id] },
	Invoices: { headers: ['Invoice ID', 'Invoice Number', 'Order ID', 'Message', 'Opened At', 'Record ID'], values: (invoice) => [invoice.id, invoice.number, invoice.orderId, invoice.message, invoice.openedAt, invoice.id] },
	'Activity Logs': { headers: ['Time', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Details', 'Record ID'], values: (entry) => [entry.createdAt, entry.actor, entry.action, entry.entityType, entry.entityId, entry.details, entry.id] },
	Settings: { headers: ['Key', 'Value', 'Record ID'], values: (settings) => ['studio', JSON.stringify(settings), 'studio'] }
};

const columnName = (count: number) => {
	let value = count;
	let name = '';
	while (value > 0) {
		value--;
		name = String.fromCharCode(65 + (value % 26)) + name;
		value = Math.floor(value / 26);
	}
	return name;
};

async function formatWorkbook(snapshots: Record<string, any[]>) {
	const metadata = await (await googleFetch('?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))')).json() as { sheets?: { properties: { sheetId: number; title: string; gridProperties?: { rowCount?: number; columnCount?: number } } }[] };
	const byTitle = new Map((metadata.sheets || []).map((sheet) => [sheet.properties.title, sheet.properties]));
	const wideColumns: Record<string, number[]> = {
		Orders: [1, 4, 12, 13],
		Customers: [2, 4, 5],
		Editors: [3],
		Tasks: [2, 6, 7, 8, 11, 12],
		Invoices: [3],
		'Activity Logs': [2, 5],
		Settings: [1]
	};
	const requests: Record<string, unknown>[] = [];
	for (const [sheet, definition] of Object.entries(definitions)) {
		const title = sheet === 'Orders' ? ordersTab() : sheet;
		const properties = byTitle.get(title);
		if (!properties) continue;
		const sheetId = properties.sheetId;
		const rowCount = Math.max(2, properties.gridProperties?.rowCount || 1000);
		requests.push(
			{ repeatCell: { range: { sheetId }, cell: { userEnteredFormat: {} }, fields: 'userEnteredFormat' } },
			{ updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
			{ repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: definition.headers.length }, cell: { userEnteredFormat: { horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', textFormat: { fontSize: 10 } } }, fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy,textFormat)' } },
			{ repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: definition.headers.length }, cell: { userEnteredFormat: { backgroundColor: { red: 0.08, green: 0.32, blue: 0.18 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 10 }, horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE', wrapStrategy: 'WRAP', borders: { bottom: { style: 'SOLID_THICK', color: { red: 0.04, green: 0.2, blue: 0.1 } } } } }, fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy,borders)' } },
			{ setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: definition.headers.length } } } },
			{ updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 38 }, fields: 'pixelSize' } },
			{ updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: rowCount }, properties: { pixelSize: 34 }, fields: 'pixelSize' } },
			{ updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: definition.headers.length }, properties: { pixelSize: 140 }, fields: 'pixelSize' } }
		);
		for (const columnIndex of wideColumns[sheet] || []) {
			if (columnIndex >= definition.headers.length) continue;
			requests.push({ updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: columnIndex, endIndex: columnIndex + 1 }, properties: { pixelSize: sheet === 'Settings' || sheet === 'Invoices' ? 280 : 210 }, fields: 'pixelSize' } });
		}
		if (sheet === 'Orders') requests.push({ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 7, endColumnIndex: 10 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } });
		if (sheet === 'Orders') requests.push({ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 17, endColumnIndex: 18 }, cell: { userEnteredFormat: { textFormat: { foregroundColor: { red: 0.9, green: 0.12, blue: 0.12 }, bold: true, fontSize: 14 } } }, fields: 'userEnteredFormat.textFormat' } });
		if (sheet === 'Payments') requests.push({ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 2, endColumnIndex: 3 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } });
		(snapshots[sheet] || []).forEach((record, index) => {
			if (!record.archived) return;
			requests.push({ repeatCell: { range: { sheetId, startRowIndex: index + 1, endRowIndex: index + 2, startColumnIndex: 0, endColumnIndex: definition.headers.length }, cell: { userEnteredFormat: { backgroundColor: { red: 0.94, green: 0.94, blue: 0.94 }, textFormat: { fontSize: 10, strikethrough: true, foregroundColor: { red: 0.45, green: 0.45, blue: 0.45 } } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });
		});
	}
	if (!requests.length) return;
	await googleFetch(':batchUpdate', {
		method: 'POST',
		body: JSON.stringify({ requests })
	});
}

async function writeWorkbookSnapshot(database: AppDatabase) {
	const [orders, customers, editors, invoices, activityLogs, settings] = await Promise.all([
		listOrders(database),
		listCustomers(database, true),
		listEditors(database, true),
		listInvoices(database),
		listActivity(database),
		getSettings(database)
	]);
	const snapshots: Record<string, any[]> = {
		Orders: [...orders].sort((left, right) => Number(left.serial || 0) - Number(right.serial || 0)),
		Customers: customers,
		Editors: editors,
		Tasks: orders.flatMap((order) => order.tasks),
		Payments: orders.flatMap((order) => order.payments || []),
		Invoices: invoices,
		'Activity Logs': activityLogs,
		Settings: [settings]
	};
	const data: { range: string; majorDimension: 'ROWS'; values: unknown[][] }[] = [];
	const clearRanges: string[] = [];
	for (const [sheet, records] of Object.entries(snapshots)) {
		const definition = definitions[sheet];
		const targetSheet = sheet === 'Orders' ? ordersTab() : sheet;
		data.push({ range: sheetRange(targetSheet, 'A1'), majorDimension: 'ROWS', values: [definition.headers, ...records.map(definition.values)] });
		clearRanges.push(sheetRange(targetSheet, `A${records.length + 2}:ZZ`));
		clearRanges.push(sheetRange(targetSheet, `${columnName(definition.headers.length + 1)}:ZZ`));
	}

	await googleFetch('/values:batchUpdate', {
		method: 'POST',
		body: JSON.stringify({ valueInputOption: 'RAW', data })
	});
	await googleFetch('/values:batchClear', { method: 'POST', body: JSON.stringify({ ranges: clearRanges }) });
	await formatWorkbook(snapshots);
	return orders.length;
}

export async function flushSheetSync(database: AppDatabase) {
	if (!configured()) return { configured: false, processed: 0, failed: 0 };
	const items = await pendingSyncItems(database);
	try {
		await ensureWorkbookTabs();
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Google Sheets setup failed';
		for (const item of items) await markSyncResult(database, item.id, message);
		return { configured: true, processed: 0, failed: items.length, error: message };
	}
	try {
		const orderCount = await writeWorkbookSnapshot(database);
		for (const item of items) await markSyncResult(database, item.id);
		return { configured: true, processed: items.length, failed: 0, orders: orderCount };
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Unknown sync error';
		for (const item of items) await markSyncResult(database, item.id, message);
		return { configured: true, processed: 0, failed: items.length, error: message };
	}
}

export async function importHistoricalOrders(database: AppDatabase) {
	if (!configured()) throw new Error('Google Sheets service account is not configured.');
	await ensureWorkbookTabs();
	const sheet = ordersTab();
	const values = await readSheetValues(sheet) || [];
	if (values.length < 2) return { imported: 0, skipped: 0 };
	let imported = 0;
	let skipped = 0;
	for (const row of values.slice(1)) {
		const serial = Number(row[0]);
		const business = String(row[1] || '').trim();
		const phone = String(row[2] || '').trim();
		const event = String(row[3] || '').trim();
		const project = String(row[4] || '').trim();
		if (!serial || !business || (!event && !project)) { skipped++; continue; }
		const existing = await database.prepare('SELECT id FROM orders WHERE serial = ?').bind(serial).first();
		if (existing) { skipped++; continue; }
		let customer = await database.prepare('SELECT id FROM customers WHERE lower(business) = lower(?) AND phone = ?').bind(business, phone).first<{ id: string }>();
		if (!customer) customer = await createCustomer(database, { name: business, business, phone }) as unknown as { id: string };
		const orderId = String(row[13] || '') || `ORD-IMPORT-${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
		const timestamp = nowIso();
		await database.prepare("INSERT INTO orders (id, serial, customer_id, customer_name, mobile, event, project, receiving, duration, amount, advance, source, remarks, due_date, status, progress, historical, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 'Historical', 100, 1, ?, ?)").bind(orderId, serial, customer.id, business, phone, event || 'Imported', project || event, String(row[5] || ''), String(row[6] || ''), Number(row[7] || 0), Number(row[8] || 0), String(row[10] || ''), [String(row[12] || ''), row[11] ? `Legacy assignee: ${row[11]}` : ''].filter(Boolean).join(' · '), timestamp, timestamp).run();
		imported++;
	}
	return { imported, skipped };
}

const nowIso = () => new Date().toISOString();

export async function workbookData(database: AppDatabase) {
	return { Orders: await listOrders(database), Customers: await listCustomers(database), Editors: await listEditors(database, true), Settings: await getSettings(database) };
}
