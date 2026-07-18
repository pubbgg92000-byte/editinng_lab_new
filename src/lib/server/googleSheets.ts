import { env } from '$env/dynamic/private';
import { archiveEditor, createCustomer, getSettings, listActivity, listCustomers, listEditors, listInvoices, listOrders, markSyncResult, pendingSyncItems } from './repository';
import type { Tenant } from '$lib/types';
import { editorCode, orderCode } from '$lib/identifiers';

let cachedToken: { value: string; expiresAt: number } | null = null;
const encoder = new TextEncoder();
const cleanEnvironmentValue = (value?: string) => {
	const cleaned = String(value || '').trim();
	return cleaned.length >= 2 && ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) ? cleaned.slice(1, -1).trim() : cleaned;
};
const spreadsheetId = (tenant: Pick<Tenant, 'googleSheetId'>) => {
	const value = cleanEnvironmentValue(tenant.googleSheetId);
	const fromUrl = value.match(/\/spreadsheets\/d\/([^/?#]+)/)?.[1];
	return fromUrl || value;
};
const ordersTab = (tenant: Pick<Tenant, 'ordersTab'>) => cleanEnvironmentValue(tenant.ordersTab) || 'Orders';
const base64url = (value: string | Uint8Array) => {
	const bytes = typeof value === 'string' ? encoder.encode(value) : value;
	return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
};

function configured(tenant: Pick<Tenant, 'googleSheetId'>) {
	return Boolean(spreadsheetId(tenant) && cleanEnvironmentValue(env.GOOGLE_SERVICE_ACCOUNT_EMAIL) && cleanEnvironmentValue(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY));
}

async function accessToken() {
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

async function googleFetch(tenant: Pick<Tenant, 'googleSheetId'>, path: string, init: RequestInit = {}) {
	if (!configured(tenant)) throw new Error('Google Sheets service account or tenant Sheet is not configured.');
	const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId(tenant)}${path}`, { ...init, headers: { Authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json', ...(init.headers || {}) } });
	if (!response.ok) throw new Error(`Google Sheets request failed: ${response.status} ${await response.text()}`);
	return response;
}

const tabNames = ['Orders', 'Customers', 'Editors', 'Tasks', 'Payments', 'Invoices', 'Activity Logs', 'Settings'];

export async function ensureWorkbookTabs(tenant: Pick<Tenant, 'googleSheetId' | 'ordersTab'>) {
	if (!configured(tenant)) return false;
	const metadata = await (await googleFetch(tenant, '?fields=sheets.properties.title')).json() as { sheets?: { properties: { title: string } }[] };
	const existing = new Set((metadata.sheets || []).map((sheet) => sheet.properties.title));
	const required = [ordersTab(tenant), ...tabNames.filter((name) => name !== 'Orders')];
	const missing = required.filter((name) => !existing.has(name));
	if (missing.length) await googleFetch(tenant, ':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: missing.map((title) => ({ addSheet: { properties: { title } } })) }) });
	return true;
}

export async function readSheetValues(tenant: Pick<Tenant, 'googleSheetId'>, sheet: string) {
	if (!configured(tenant)) return null;
	const response = await googleFetch(tenant, `/values/${encodeURIComponent(sheetRange(sheet, 'A:Z'))}`);
	return ((await response.json()) as { values?: unknown[][] }).values || [];
}

const sheetRange = (sheet: string, cells: string) => `'${sheet.replaceAll("'", "''")}'!${cells}`;

const istStamp = (value?: string) => {
	const date = new Date(value || Date.now());
	const parts = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).formatToParts(date);
	const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || '';
	return { date: `${part('day')}-${part('month')}-${part('year')}`, time: `${part('hour')}:${part('minute')} ${part('dayPeriod').toUpperCase()}` };
};

const definitions: Record<string, { headers: string[]; values: (payload: any) => unknown[] }> = {
	Orders: { headers: ['Date', 'Time (IST)', 'Order ID', 'Studio Name', 'Mobile No.', 'Event', 'Names', 'Receiving', 'Duration', 'Subtotal', 'Discount %', 'Discount Amount', 'Total', 'Collected', 'Balance', 'Source', 'Assigned Name', 'Remark', 'Record ID', 'Status', 'Progress', 'Due Date', 'Important', 'Historical', 'Archived'], values: (order) => { const stamp = istStamp(order.createdAt || order.updatedAt); return [stamp.date, stamp.time, order.displayCode || order.serial, order.customer, order.mobile || '', order.workType, order.project, order.receiving || '', order.duration || '', order.priceSet === false ? '' : order.price, order.priceSet === false || !order.price ? 0 : Number(((order.discount || 0) / order.price).toFixed(4)), order.discount || 0, order.priceSet === false ? '' : Math.max(0, order.price - order.discount), order.advanceSet === false && !(order.payments || []).length ? '' : order.paid, order.priceSet === false ? '' : Math.max(0, order.price - order.discount - order.paid), order.source || '', [...new Set((order.tasks || []).filter((task: any) => !task.archived && task.assignee !== 'Unassigned').map((task: any) => task.assignee))].join(', '), order.remarks || '', order.id, order.status, order.progress, order.due || '', order.important ? '★' : '', order.historical ? 'Yes' : 'No', order.archived ? 'Yes' : 'No']; } },
	Customers: { headers: ['Customer ID', 'Name', 'Studio Name', 'Phone', 'Email', 'Address', 'Google Maps Location', 'GSTIN', 'Projects', 'Pending', 'Archived', 'Record ID'], values: (customer) => [customer.id, customer.name, customer.business, customer.phone, customer.email, customer.address || '', customer.locationUrl || '', customer.gst || '', customer.projects, customer.pending, customer.archived ? 'Yes' : 'No', customer.id] },
	Editors: { headers: ['Editor ID', 'Name', 'Phone', 'Google Maps Location', 'Specialty', 'Availability', 'Active Tasks', 'Archived', 'Record ID'], values: (editor) => [editor.code || editor.id, editor.name, editor.phone, editor.locationUrl || '', editor.specialty, editor.availability || (editor.available ? 'available' : 'busy'), editor.activeTasks, editor.archived ? 'Yes' : 'No', editor.id] },
	Tasks: { headers: ['Task ID', 'Order ID', 'Task', 'Editor ID', 'Editor Name', 'Device', 'Editor Payment Arrangement', 'Billing Method', 'Rate / Video Hour', 'Video Duration (Minutes)', 'Due Date', 'Task Value (Billable)', 'Already Invoiced', 'Instructions', 'Text Link', 'Image URL', 'Status', 'Progress', 'Output Link', 'Notes', 'Archived', 'Record ID'], values: (task) => [task.id, task.orderId, task.name, task.editorCode || '', task.assignee || '', task.device || '', task.editorSettlement === 'editor-bills-admin' ? 'Editor bills admin' : task.editorSettlement === 'admin-issues-statement' ? 'Admin issues statement' : 'Not decided', task.billingMode === 'duration' ? 'By video duration' : 'Manual amount', task.hourlyRate || 0, task.videoDurationMinutes || 0, task.due || '', task.billableAmount || 0, task.invoicedAmount || 0, task.instructions || '', task.textLink || '', task.imageUrl || '', task.status, task.progress, task.outputLink || '', task.notes || '', task.archived ? 'Yes' : 'No', task.id] },
	Payments: { headers: ['Payment ID', 'Order ID', 'Type', 'Amount', 'Date', 'Method', 'Note', 'Record ID'], values: (payment) => [payment.id, payment.orderId, payment.kind === 'advance' ? 'Advance' : 'Payment', payment.amount, payment.paidAt, payment.method, payment.note, payment.id] },
	Invoices: { headers: ['Invoice ID', 'Invoice Number', 'Order ID', 'Type', 'Billing Method', 'Discount Type', 'Payment ID', 'Amount Received', 'Subtotal', 'Discount %', 'Discount Amount', 'Total', 'Paid', 'Balance', 'Message', 'Created At', 'Record ID'], values: (invoice) => [invoice.id, invoice.number, invoice.orderId, invoice.kind, invoice.billingMode === 'duration' ? 'Video duration' : 'Manual total', invoice.discountMode === 'percent' ? 'Percentage' : 'Manual amount', invoice.paymentId || '', invoice.amountReceived, invoice.subtotal, invoice.subtotal ? Number((invoice.discount / invoice.subtotal).toFixed(4)) : 0, invoice.discount, invoice.total, invoice.paid, invoice.balance, invoice.message, invoice.openedAt, invoice.id] },
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

async function formatWorkbook(tenant: Pick<Tenant, 'googleSheetId' | 'ordersTab'>, snapshots: Record<string, any[]>) {
	const metadata = await (await googleFetch(tenant, '?fields=sheets.properties(sheetId,title,gridProperties(rowCount,columnCount))')).json() as { sheets?: { properties: { sheetId: number; title: string; gridProperties?: { rowCount?: number; columnCount?: number } } }[] };
	const byTitle = new Map((metadata.sheets || []).map((sheet) => [sheet.properties.title, sheet.properties]));
	const wideColumns: Record<string, number[]> = {
		Orders: [3, 6, 14, 15],
		Customers: [2, 4, 5, 6],
		Editors: [3, 4],
		Tasks: [2, 6, 7, 8, 9, 12, 13],
		Invoices: [13, 14],
		'Activity Logs': [2, 5],
		Settings: [1]
	};
	const requests: Record<string, unknown>[] = [];
	for (const [sheet, definition] of Object.entries(definitions)) {
		const title = sheet === 'Orders' ? ordersTab(tenant) : sheet;
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
		if (sheet === 'Orders') requests.push(
			{ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 9, endColumnIndex: 10 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } },
			{ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 10, endColumnIndex: 11 }, cell: { userEnteredFormat: { numberFormat: { type: 'PERCENT', pattern: '0.00%' } } }, fields: 'userEnteredFormat.numberFormat' } },
			{ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 11, endColumnIndex: 15 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } }
		);
		if (sheet === 'Customers') requests.push({ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 9, endColumnIndex: 10 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } });
		if (sheet === 'Tasks') requests.push(
			{ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 8, endColumnIndex: 9 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } },
			{ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 11, endColumnIndex: 13 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } }
		);
		if (sheet === 'Orders') requests.push({ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 19, endColumnIndex: 20 }, cell: { userEnteredFormat: { textFormat: { foregroundColor: { red: 0.9, green: 0.12, blue: 0.12 }, bold: true, fontSize: 14 } } }, fields: 'userEnteredFormat.textFormat' } });
		if (sheet === 'Payments') requests.push({ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } });
		if (sheet === 'Invoices') requests.push(
			{ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 7, endColumnIndex: 9 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } },
			{ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 9, endColumnIndex: 10 }, cell: { userEnteredFormat: { numberFormat: { type: 'PERCENT', pattern: '0.00%' } } }, fields: 'userEnteredFormat.numberFormat' } },
			{ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: 10, endColumnIndex: 14 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } }
		);
		(snapshots[sheet] || []).forEach((record, index) => {
			if (!record.archived) return;
			requests.push({ repeatCell: { range: { sheetId, startRowIndex: index + 1, endRowIndex: index + 2, startColumnIndex: 0, endColumnIndex: definition.headers.length }, cell: { userEnteredFormat: { backgroundColor: { red: 0.94, green: 0.94, blue: 0.94 }, textFormat: { fontSize: 10, strikethrough: true, foregroundColor: { red: 0.45, green: 0.45, blue: 0.45 } } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } });
		});
	}
	if (!requests.length) return;
	await googleFetch(tenant, ':batchUpdate', {
		method: 'POST',
		body: JSON.stringify({ requests })
	});
}

async function writeWorkbookSnapshot(database: AppDatabase, tenant: Pick<Tenant, 'googleSheetId' | 'ordersTab'>) {
	const [orders, customers, editors, invoices, activityLogs, settings] = await Promise.all([
		listOrders(database, true, true),
		listCustomers(database, true),
		listEditors(database, true),
		listInvoices(database),
		listActivity(database),
		getSettings(database)
	]);
	const snapshots: Record<string, any[]> = {
		Orders: [...orders].sort((left, right) => Number(left.serial || 0) - Number(right.serial || 0)).map((order) => ({ ...order, displayCode: orderCode(settings, order.serial) })),
		Customers: customers,
		Editors: editors.map((editor) => ({ ...editor, code: editorCode(settings, editor.code) })),
		Tasks: orders.flatMap((order) => order.tasks).map((task) => ({ ...task, editorCode: editorCode(settings, task.editorCode) })),
		Payments: orders.flatMap((order) => order.payments || []),
		Invoices: invoices,
		'Activity Logs': activityLogs,
		Settings: [settings]
	};
	const data: { range: string; majorDimension: 'ROWS'; values: unknown[][] }[] = [];
	const clearRanges: string[] = [];
	for (const [sheet, records] of Object.entries(snapshots)) {
		const definition = definitions[sheet];
		const targetSheet = sheet === 'Orders' ? ordersTab(tenant) : sheet;
		data.push({ range: sheetRange(targetSheet, 'A1'), majorDimension: 'ROWS', values: [definition.headers, ...records.map(definition.values)] });
		clearRanges.push(sheetRange(targetSheet, `A${records.length + 2}:ZZ`));
		clearRanges.push(sheetRange(targetSheet, `${columnName(definition.headers.length + 1)}:ZZ`));
	}

	await googleFetch(tenant, '/values:batchUpdate', {
		method: 'POST',
		body: JSON.stringify({ valueInputOption: 'RAW', data })
	});
	await googleFetch(tenant, '/values:batchClear', { method: 'POST', body: JSON.stringify({ ranges: clearRanges }) });
	await formatWorkbook(tenant, snapshots);
	return orders.length;
}

export async function flushSheetSync(database: AppDatabase, tenant: Pick<Tenant, 'googleSheetId' | 'ordersTab'>) {
	if (!configured(tenant)) return { configured: false, processed: 0, failed: 0 };
	const items = await pendingSyncItems(database);
	try {
		await ensureWorkbookTabs(tenant);
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Google Sheets setup failed';
		for (const item of items) await markSyncResult(database, item.id, message);
		return { configured: true, processed: 0, failed: items.length, error: message };
	}
	try {
		const orderCount = await writeWorkbookSnapshot(database, tenant);
		for (const item of items) await markSyncResult(database, item.id);
		return { configured: true, processed: items.length, failed: 0, orders: orderCount };
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Unknown sync error';
		for (const item of items) await markSyncResult(database, item.id, message);
		return { configured: true, processed: 0, failed: items.length, error: message };
	}
}

export async function importHistoricalOrders(database: AppDatabase, tenant: Pick<Tenant, 'googleSheetId' | 'ordersTab'>) {
	if (!configured(tenant)) throw new Error('Google Sheets service account is not configured.');
	await ensureWorkbookTabs(tenant);
	const sheet = ordersTab(tenant);
	const values = await readSheetValues(tenant, sheet) || [];
	if (values.length < 2) return { imported: 0, skipped: 0 };
	const headers = values[0].map((value) => String(value || '').trim());
	const cell = (row: unknown[], ...names: string[]) => {
		const index = names.map((name) => headers.indexOf(name)).find((value) => value >= 0);
		return index === undefined ? '' : row[index];
	};
	let imported = 0;
	let skipped = 0;
	for (const row of values.slice(1)) {
		const serial = Number(cell(row, 'S', 'S.No.', 'Serial'));
		const business = String(cell(row, 'Studio Name') || '').trim();
		const phone = String(cell(row, 'Mobile No.', 'Phone') || '').trim();
		const event = String(cell(row, 'Event') || '').trim();
		const project = String(cell(row, 'Names', 'Project / Names', 'Project') || '').trim();
		if (!serial || !business || (!event && !project)) { skipped++; continue; }
		const existing = await database.prepare('SELECT id FROM orders WHERE serial = ?').bind(serial).first();
		if (existing) { skipped++; continue; }
		let customer = await database.prepare('SELECT id FROM customers WHERE lower(business) = lower(?) AND phone = ?').bind(business, phone).first<{ id: string }>();
		if (!customer) customer = await createCustomer(database, { name: business, business, phone }) as unknown as { id: string };
		const orderId = String(cell(row, 'Record ID', 'Order ID') || '') || `ORD-IMPORT-${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
		const timestamp = nowIso();
		const subtotal = Number(cell(row, 'Subtotal', 'Amount') || 0);
		const discountValue = cell(row, 'Discount Amount', 'Discount');
		const discount = discountValue === '' ? Math.round(subtotal * Number(cell(row, 'Discount %') || 0) / 100) : Number(discountValue || 0);
		await database.prepare("INSERT INTO orders (id, serial, customer_id, customer_name, mobile, event, project, receiving, duration, amount, discount, advance, source, remarks, due_date, status, progress, historical, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 'Historical', 100, 1, ?, ?)").bind(orderId, serial, customer.id, business, phone, event || 'Imported', project || event, String(cell(row, 'Receiving') || ''), String(cell(row, 'Duration') || ''), subtotal, discount, Number(cell(row, 'Collected', 'Advance') || 0), String(cell(row, 'Source') || ''), [String(cell(row, 'Remark') || ''), cell(row, 'Assigned Name', 'Assigned Names') ? `Legacy assignee: ${cell(row, 'Assigned Name', 'Assigned Names')}` : ''].filter(Boolean).join(' · '), timestamp, timestamp).run();
		imported++;
	}
	return { imported, skipped };
}

export async function reconcileEditorsFromSheet(database: AppDatabase, tenant: Pick<Tenant, 'googleSheetId'>) {
	if (!configured(tenant)) throw new Error('Google Sheets service account is not configured.');
	const values = await readSheetValues(tenant, 'Editors') || [];
	if (!values.length) return { editorsArchived: 0, editorRows: 0 };
	const headers = values[0].map((value) => String(value || '').trim());
	const recordIdIndex = headers.indexOf('Record ID');
	const publicIdIndex = headers.indexOf('Editor ID');
	const idIndex = recordIdIndex >= 0 ? recordIdIndex : publicIdIndex;
	if (idIndex < 0 || !headers.includes('Name')) return { editorsArchived: 0, editorRows: 0, warning: 'Editors tab headers were not recognized.' };
	const sheetIds = new Set(values.slice(1).map((row) => String(row[idIndex] || '').trim()).filter(Boolean));
	const activeEditors = (await listEditors(database, true)).filter((editor) => !editor.archived);
	let editorsArchived = 0;
	for (const editor of activeEditors) {
		if (sheetIds.has(editor.id) || Boolean(editor.code && sheetIds.has(editor.code))) continue;
		if (await archiveEditor(database, editor.id)) editorsArchived++;
	}
	return { editorsArchived, editorRows: sheetIds.size };
}

export async function validateSheetConnection(tenant: Pick<Tenant, 'googleSheetId' | 'ordersTab'>) {
	if (!configured(tenant)) throw new Error('Sheet ID or Google service-account credentials are missing.');
	const metadata = await (await googleFetch(tenant, '?fields=spreadsheetId,properties.title')).json() as { spreadsheetId?: string; properties?: { title?: string } };
	return { id: metadata.spreadsheetId || spreadsheetId(tenant), title: metadata.properties?.title || '' };
}

const nowIso = () => new Date().toISOString();

export async function workbookData(database: AppDatabase) {
	return { Orders: await listOrders(database), Customers: await listCustomers(database), Editors: await listEditors(database, true), Settings: await getSettings(database) };
}
