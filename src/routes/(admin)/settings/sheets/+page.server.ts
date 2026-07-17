import { customers, editors, orders } from '$lib/data';
import { readSheetValues } from '$lib/server/googleSheets';

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1jsxofckCwLiYPKiF9Di6CrXsET3foZKE9Jr8LFryADc/edit?usp=sharing';
const publicSheetId = '1jsxofckCwLiYPKiF9Di6CrXsET3foZKE9Jr8LFryADc';

function parseCsv(csv: string) {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let quoted = false;
	for (let index = 0; index < csv.length; index++) {
		const character = csv[index];
		if (quoted) {
			if (character === '"' && csv[index + 1] === '"') { cell += '"'; index++; }
			else if (character === '"') quoted = false;
			else cell += character;
		} else if (character === '"') quoted = true;
		else if (character === ',') { row.push(cell); cell = ''; }
		else if (character === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
		else if (character !== '\r') cell += character;
	}
	if (cell || row.length) { row.push(cell); rows.push(row); }
	return rows.filter((current) => current.some((value) => value.length > 0));
}

async function readPublicSheetValues(sheet: string) {
	const endpoint = `https://docs.google.com/spreadsheets/d/${publicSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
	const response = await fetch(endpoint);
	if (!response.ok) return null;
	const body = await response.text();
	if (body.includes('<!DOCTYPE html>') || body.includes('google.visualization.Query.setResponse')) return null;
	return parseCsv(body);
}

function presentSheetValues(sheet: string, values: unknown[][]) {
	if (sheet === 'Settings' && values.length > 1) {
		const headers = values[0].map(String);
		const valueIndex = headers.findIndex((header) => header.toLowerCase() === 'value');
		if (valueIndex >= 0) {
			for (const row of values.slice(1)) {
				try {
					const settings = JSON.parse(String(row[valueIndex] || '')) as Record<string, unknown>;
					const fields: [string, string][] = [
						['Studio name', 'studioName'], ['Studio address', 'address'], ['WhatsApp number', 'phone'],
						['Email', 'email'], ['GSTIN', 'gstin'], ['Payment note', 'paymentNote'],
						['Invoice footer', 'invoiceFooter'], ['Editor assignment message', 'assignmentTemplate'],
						['Customer invoice message', 'invoiceTemplate'], ['Theme palette', 'themePalette'],
						['Default appearance', 'themeDefaultMode']
					];
					return [['Setting', 'Current value'], ...fields.map(([label, key]) => {
						const value = String(settings[key] || '').trim();
						return [label, value ? (key.startsWith('theme') ? value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : value) : 'Not added'];
					})];
					} catch { /* Try the next settings row. */ }
				}
			}
		}
	if (sheet === 'Activity Logs' && values.length > 1) {
		const headers = values[0].map((header) => String(header).toLowerCase());
		const column = (name: string) => headers.indexOf(name.toLowerCase());
		const timeIndex = column('time');
		const actionIndex = column('action');
		const entityTypeIndex = column('entity type');
		const entityIdIndex = column('entity id');
		const detailsIndex = column('details');
		if ([timeIndex, actionIndex, entityTypeIndex, entityIdIndex, detailsIndex].every((index) => index >= 0)) {
			return [['Time', 'Action', 'Item', 'Details'], ...values.slice(1).map((row) => {
				const action = String(row[actionIndex] || 'Activity');
				const entityType = String(row[entityTypeIndex] || '').trim();
				const entityId = String(row[entityIdIndex] || '').trim();
				const rawDetails = String(row[detailsIndex] || '').trim();
				const item = entityType === 'settings'
					? 'Studio settings'
					: entityId || entityType.replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'General';
				const details = action === 'Settings updated'
					? 'Studio profile, messages and appearance updated'
					: rawDetails || 'No additional details';
				return [String(row[timeIndex] || ''), action, item, details];
			})];
		}
	}
	if (!values.length) return values;
	const visibleIndexes = values[0].map(String).map((header, index) => ({ header, index })).filter(({ header }) => header.toLowerCase() !== 'record id');
	return values.map((row) => visibleIndexes.map(({ index }) => row[index]));
}

function recordsFrom(values: unknown[][]) {
	if (!values.length) return [];
	const headers = values[0].map(String);
	return values.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, String(row[index] || '').trim()])));
}

function valueFrom(record: Record<string, string>, ...names: string[]) {
	for (const name of names) {
		if (record[name]) return record[name];
	}
	return '';
}

function entityHref(entityType: string, entityId: string, taskOrders: Map<string, string>, paymentOrders: Map<string, string>) {
	if (!entityId) return '';
	if (entityType === 'order') return `/orders/${encodeURIComponent(entityId)}`;
	if (entityType === 'task') {
		const orderId = taskOrders.get(entityId);
		return orderId ? `/orders/${encodeURIComponent(orderId)}?task=${encodeURIComponent(entityId)}` : '';
	}
	if (entityType === 'editor') return `/editors?editor=${encodeURIComponent(entityId)}`;
	if (entityType === 'customer') return `/customers?customer=${encodeURIComponent(entityId)}`;
	if (entityType === 'invoice') return `/invoices/${encodeURIComponent(entityId)}`;
	if (entityType === 'payment') {
		const orderId = paymentOrders.get(entityId);
		return orderId ? `/orders/${encodeURIComponent(orderId)}` : '';
	}
	if (entityType === 'settings') return '/settings';
	return '';
}

const definitions = [
	{ name: 'Customers', columns: ['Customer ID', 'Name', 'Business', 'Phone', 'Email', 'Projects', 'Pending'], demo: customers.map((c) => [c.id, c.name, c.business, c.phone, c.email, c.projects, c.pending]) },
	{ name: 'Orders', columns: ['S', 'Studio Name', 'Mobile No.', 'Event', 'Names', 'Receiving', 'Duration', 'Amount', 'Advance', 'Balance', 'Source', 'Assigned Name', 'Remark'], demo: orders.map((o) => [o.id, o.customer, o.mobile ?? '', o.workType, o.project, o.receiving ?? '', o.duration ?? '', o.price, o.paid, o.price - o.paid, o.source ?? '', o.assignedTo ?? '', o.remarks ?? '']) },
	{ name: 'Tasks', columns: ['Task ID', 'Order ID', 'Task', 'Editor', 'Due date', 'Progress', 'Status'], demo: orders.flatMap((o) => o.tasks.map((t) => [t.id, o.id, t.name, t.assignee, t.due, `${t.progress}%`, t.status])) },
	{ name: 'Editors', columns: ['Editor ID', 'Name', 'Speciality', 'Phone', 'Active tasks', 'Availability'], demo: editors.map((e) => [e.code || e.id, e.name, e.specialty, e.phone, e.activeTasks, e.available ? 'Available' : 'At capacity']) },
	{ name: 'Invoices', columns: ['Invoice ID', 'Order ID', 'Customer', 'Project', 'Total', 'Paid', 'Balance', 'Status'], demo: orders.map((o) => [`INV-${o.id.slice(-4)}`, o.id, o.customer, o.project, o.price, o.paid, o.price - o.paid, o.paid === o.price ? 'Paid' : o.paid ? 'Partially paid' : 'Unpaid']) },
	{ name: 'Payments', columns: ['Payment ID', 'Invoice ID', 'Customer', 'Amount', 'Date', 'Method'], demo: orders.filter((o) => o.paid > 0).map((o, i) => [`PAY-00${i + 1}`, `INV-${o.id.slice(-4)}`, o.customer, o.paid, '15 Jul 2026', i % 2 ? 'UPI' : 'Bank transfer']) },
	{ name: 'Activity Logs', columns: ['Time', 'Action', 'Entity', 'Details'], demo: [['15 Jul, 11:42', 'Task updated', 'TSK-102', 'Colour correction · 70%'], ['14 Jul, 16:08', 'Task approved', 'TSK-101', 'Culling approved by admin'], ['12 Jul, 14:10', 'Order assigned', 'ORD-2026-0041', 'Editors notified on WhatsApp']] },
	{ name: 'Settings', columns: ['Key', 'Value'], demo: [['Studio name', 'Anjana Creations'], ['Google Sheets sync', 'Demo mode'], ['WhatsApp notifications', 'Demo mode'], ['Default currency', 'INR']] }
];

export const load = async () => {
	const liveResults = await Promise.all(definitions.map(async (sheet) => {
		try {
			const values = await readSheetValues(sheet.name);
			if (values !== null) return { values, source: 'service-account' as const };
		} catch { /* Fall through to the public view-only sheet. */ }
		try {
			const values = await readPublicSheetValues(sheet.name);
			return values === null ? null : { values, source: 'public' as const };
		} catch { return null; }
	}));
	const live = liveResults.some((result) => result !== null);
	const source = liveResults.some((result) => result?.source === 'service-account') ? 'service-account' : live ? 'public' : 'demo';
	const sourceValues = Object.fromEntries(definitions.map((sheet, index) => [sheet.name, liveResults[index]?.values ?? [sheet.columns, ...sheet.demo]]));
	const sourceRecords = Object.fromEntries(Object.entries(sourceValues).map(([name, values]) => [name, recordsFrom(values)])) as Record<string, Record<string, string>[]>;
	const customerIds = new Map<string, string>();
	for (const record of sourceRecords.Customers || []) {
		const id = valueFrom(record, 'Customer ID', 'Record ID');
		for (const name of [valueFrom(record, 'Name'), valueFrom(record, 'Studio Name', 'Business')]) {
			if (id && name) customerIds.set(name.toLowerCase(), id);
		}
	}
	const editorIds = new Map<string, string>();
	const editorRecordIds = new Map<string, string>();
	for (const record of sourceRecords.Editors || []) {
		const id = valueFrom(record, 'Record ID', 'Editor ID');
		const publicId = valueFrom(record, 'Editor ID');
		const name = valueFrom(record, 'Name');
		if (id && name) editorIds.set(name.toLowerCase(), id);
		if (id && publicId) editorRecordIds.set(publicId, id);
	}
	const taskOrders = new Map((sourceRecords.Tasks || []).map((record) => [valueFrom(record, 'Task ID', 'Record ID'), valueFrom(record, 'Order ID')]));
	const paymentOrders = new Map((sourceRecords.Payments || []).map((record) => [valueFrom(record, 'Payment ID', 'Record ID'), valueFrom(record, 'Order ID')]));
	return {
		live,
		source,
		sheetUrl,
		sheets: definitions.map((sheet, index) => {
			const rawValues = liveResults[index]?.values;
			const values = rawValues ? presentSheetValues(sheet.name, rawValues) : rawValues;
			const columns = values && values.length > 0 ? values[0].map(String) : sheet.columns;
			const rows = values && values.length > 0 ? values.slice(1).map((row) => row.map(String)) : sheet.demo.map((row) => row.map(String));
			const rawRecords = sourceRecords[sheet.name] || [];
			const links = rows.map((row, rowIndex) => columns.map((column, columnIndex) => {
				const record = rawRecords[rowIndex] || Object.fromEntries(columns.map((name, cellIndex) => [name, row[cellIndex] || '']));
				if (sheet.name === 'Orders') {
					const orderId = valueFrom(record, 'Record ID') || (rawValues ? '' : row[0]);
					const customerId = customerIds.get(valueFrom(record, 'Studio Name').toLowerCase());
					if (column === 'Studio Name' && customerId) return `/customers?customer=${encodeURIComponent(customerId)}`;
					if (['S', 'Event', 'Names', 'Status'].includes(column) && orderId) return `/orders/${encodeURIComponent(orderId)}`;
					if (column === 'Assigned Name') {
						const editorId = editorIds.get(String(row[columnIndex] || '').trim().toLowerCase());
						return editorId ? `/editors?editor=${encodeURIComponent(editorId)}` : '';
					}
				}
				if (sheet.name === 'Customers') {
					const customerId = valueFrom(record, 'Customer ID', 'Record ID') || row[0];
					if (['Customer ID', 'Name', 'Studio Name', 'Business'].includes(column) && customerId) return `/customers?customer=${encodeURIComponent(customerId)}`;
				}
				if (sheet.name === 'Editors') {
					const editorId = valueFrom(record, 'Record ID', 'Editor ID') || row[0];
					if (['Editor ID', 'Name'].includes(column) && editorId) return `/editors?editor=${encodeURIComponent(editorId)}`;
				}
				if (sheet.name === 'Tasks') {
					const taskId = valueFrom(record, 'Task ID', 'Record ID') || row[0];
					const orderId = valueFrom(record, 'Order ID') || row[1];
					const publicEditorId = valueFrom(record, 'Editor ID');
					const editorId = editorRecordIds.get(publicEditorId) || editorIds.get(valueFrom(record, 'Editor Name', 'Editor').toLowerCase());
					if (['Task ID', 'Task'].includes(column) && orderId) return `/orders/${encodeURIComponent(orderId)}?task=${encodeURIComponent(taskId)}`;
					if (column === 'Order ID' && orderId) return `/orders/${encodeURIComponent(orderId)}`;
					if (['Editor ID', 'Editor Name', 'Editor'].includes(column) && editorId) return `/editors?editor=${encodeURIComponent(editorId)}`;
				}
				if (sheet.name === 'Payments') {
					const orderId = valueFrom(record, 'Order ID');
					if (['Payment ID', 'Order ID'].includes(column) && orderId) return `/orders/${encodeURIComponent(orderId)}`;
				}
				if (sheet.name === 'Invoices') {
					const invoiceId = valueFrom(record, 'Invoice ID', 'Record ID') || row[0];
					const orderId = valueFrom(record, 'Order ID');
					if (['Invoice ID', 'Invoice Number'].includes(column) && invoiceId) return `/invoices/${encodeURIComponent(invoiceId)}`;
					if (column === 'Order ID' && orderId) return `/orders/${encodeURIComponent(orderId)}`;
				}
				if (sheet.name === 'Activity Logs' && ['Action', 'Item'].includes(column)) {
					return entityHref(valueFrom(record, 'Entity Type'), valueFrom(record, 'Entity ID'), taskOrders, paymentOrders);
				}
				return '';
			}));
			return { name: sheet.name, columns, rows, links };
		})
	};
};
