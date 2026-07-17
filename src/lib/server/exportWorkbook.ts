import ExcelJS, { type Cell, type Worksheet } from 'exceljs';
import type { ActivityLog, Customer, Editor, Invoice, Order, StudioSettings } from '$lib/types';

type ColumnDefinition = {
	header: string;
	key: string;
	width: number;
	format?: 'currency' | 'date' | 'datetime' | 'percent' | 'integer' | 'center' | 'link';
};

export interface ExportWorkbookData {
	orders: Order[];
	customers: Customer[];
	editors: Editor[];
	invoices: Invoice[];
	activity: ActivityLog[];
	settings: StudioSettings;
}

const COLORS = {
	header: 'FF1F4E3D',
	headerAccent: 'FFD4AF37',
	headerText: 'FFFFFFFF',
	stripe: 'FFF3F7F5',
	border: 'FFD9E3DE',
	text: 'FF1F2937',
	muted: 'FF6B7280',
	red: 'FFFEE2E2',
	redText: 'FFB91C1C',
	green: 'FFDCFCE7',
	greenText: 'FF166534',
	amber: 'FFFEF3C7',
	amberText: 'FF92400E',
	blue: 'FFDBEAFE',
	blueText: 'FF1D4ED8',
	gray: 'FFF3F4F6'
};

const thinBottom = { bottom: { style: 'thin' as const, color: { argb: COLORS.border } } };
const asDate = (value?: string) => {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const externalLink = (value?: string) => value ? { text: value, hyperlink: value, tooltip: 'Open link' } : null;
const byText = (left: string, right: string) => left.localeCompare(right, undefined, { sensitivity: 'base' });

function styleStatus(cell: Cell) {
	const value = String(cell.value || '').toLowerCase();
	let fill = COLORS.gray;
	let color = COLORS.muted;
	if (value.includes('completed') || value.includes('ready delivery') || value.includes('available')) { fill = COLORS.green; color = COLORS.greenText; }
	else if (value.includes('revision') || value.includes('inactive') || value.includes('archived')) { fill = COLORS.red; color = COLORS.redText; }
	else if (value.includes('review') || value.includes('waiting') || value.includes('busy')) { fill = COLORS.amber; color = COLORS.amberText; }
	else if (value.includes('editing') || value.includes('progress') || value.includes('assigned')) { fill = COLORS.blue; color = COLORS.blueText; }
	cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
	cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: color } };
	cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
}

function styleSheet(worksheet: Worksheet, columns: ColumnDefinition[], rowCount: number, options: { statusKey?: string; archivedKey?: string; importantKey?: string } = {}) {
	worksheet.views = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];
	worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, rowCount + 1), column: columns.length } };
	worksheet.pageSetup = {
		paperSize: 9,
		orientation: columns.length > 8 ? 'landscape' : 'portrait',
		fitToPage: true,
		fitToWidth: 1,
		fitToHeight: 0,
		margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
		printTitlesRow: '1:1'
	};
	worksheet.headerFooter.oddFooter = '&LStudioFlow export&CPage &P of &N&R&D &T';
	worksheet.properties.defaultRowHeight = 22;
	worksheet.getRow(1).height = 32;
	worksheet.getRow(1).eachCell((cell) => {
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.header } };
		cell.font = { name: 'Aptos Display', size: 10, bold: true, color: { argb: COLORS.headerText } };
		cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
		cell.border = { bottom: { style: 'medium', color: { argb: COLORS.headerAccent } } };
	});

	for (let rowNumber = 2; rowNumber <= rowCount + 1; rowNumber++) {
		const row = worksheet.getRow(rowNumber);
		row.height = 24;
		row.eachCell({ includeEmpty: true }, (cell) => {
			cell.font = { name: 'Aptos', size: 10, color: { argb: COLORS.text } };
			cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
			cell.border = thinBottom;
			if (rowNumber % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.stripe } };
		});
		if (options.statusKey) styleStatus(row.getCell(options.statusKey));
		if (options.importantKey && String(row.getCell(options.importantKey).value || '').toLowerCase() === 'yes') {
			const cell = row.getCell(options.importantKey);
			cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.red } };
			cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: COLORS.redText } };
			cell.alignment = { vertical: 'middle', horizontal: 'center' };
		}
		if (options.archivedKey && String(row.getCell(options.archivedKey).value || '').toLowerCase() === 'yes') {
			row.eachCell((cell) => {
				cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gray } };
				cell.font = { name: 'Aptos', size: 10, color: { argb: COLORS.muted }, strike: true };
			});
		}
	}

	for (const definition of columns) {
		const column = worksheet.getColumn(definition.key);
		column.width = definition.width;
		column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
			if (rowNumber === 1) return;
			if (definition.format === 'currency') { cell.numFmt = '₹#,##0.00'; cell.alignment = { vertical: 'middle', horizontal: 'right' }; }
			else if (definition.format === 'integer') { cell.numFmt = '#,##0'; cell.alignment = { vertical: 'middle', horizontal: 'right' }; }
			else if (definition.format === 'percent') { cell.numFmt = '0.00%'; cell.alignment = { vertical: 'middle', horizontal: 'center' }; }
			else if (definition.format === 'date') { cell.numFmt = 'dd-mmm-yyyy'; cell.alignment = { vertical: 'middle', horizontal: 'center' }; }
			else if (definition.format === 'datetime') { cell.numFmt = 'dd-mmm-yyyy hh:mm'; cell.alignment = { vertical: 'middle', horizontal: 'center' }; }
			else if (definition.format === 'center') cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
			else if (definition.format === 'link' && cell.value) cell.font = { name: 'Aptos', size: 10, color: { argb: COLORS.blueText }, underline: true };
		});
	}

	if (!rowCount) {
		worksheet.mergeCells(2, 1, 2, columns.length);
		const empty = worksheet.getCell('A2');
		empty.value = 'No records available';
		empty.font = { name: 'Aptos', size: 11, italic: true, color: { argb: COLORS.muted } };
		empty.alignment = { vertical: 'middle', horizontal: 'center' };
		worksheet.getRow(2).height = 34;
	}
}

function addSheet(workbook: ExcelJS.Workbook, name: string, columns: ColumnDefinition[], records: Record<string, unknown>[], options: { statusKey?: string; archivedKey?: string; importantKey?: string; tabColor?: string } = {}) {
	const worksheet = workbook.addWorksheet(name, {
		properties: { tabColor: { argb: options.tabColor || COLORS.headerAccent } },
		views: [{ state: 'frozen', ySplit: 1 }]
	});
	worksheet.columns = columns.map(({ header, key, width }) => ({ header, key, width }));
	worksheet.addRows(records);
	styleSheet(worksheet, columns, records.length, options);
	return worksheet;
}

export async function buildExportWorkbook(data: ExportWorkbookData) {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = 'StudioFlow';
	workbook.lastModifiedBy = 'StudioFlow';
	workbook.created = new Date();
	workbook.modified = new Date();
	workbook.calcProperties.fullCalcOnLoad = true;

	const orders = [...data.orders].sort((left, right) => Number(right.serial || 0) - Number(left.serial || 0));
	const ordersSheet = addSheet(workbook, 'Orders', [
		{ header: 'S.No.', key: 'serial', width: 10, format: 'integer' },
		{ header: 'Studio Name', key: 'customer', width: 24 },
		{ header: 'Mobile No.', key: 'mobile', width: 16, format: 'center' },
		{ header: 'Event', key: 'event', width: 16 },
		{ header: 'Project / Names', key: 'project', width: 28 },
		{ header: 'Receiving', key: 'receiving', width: 18 },
		{ header: 'Duration', key: 'duration', width: 12, format: 'center' },
		{ header: 'Subtotal', key: 'amount', width: 15, format: 'currency' },
		{ header: 'Discount %', key: 'discountPercent', width: 13, format: 'percent' },
		{ header: 'Discount Amount', key: 'discount', width: 17, format: 'currency' },
		{ header: 'Total', key: 'total', width: 15, format: 'currency' },
		{ header: 'Collected', key: 'paid', width: 15, format: 'currency' },
		{ header: 'Balance', key: 'balance', width: 15, format: 'currency' },
		{ header: 'Source', key: 'source', width: 18 },
		{ header: 'Assigned Names', key: 'assignedNames', width: 24 },
		{ header: 'Remark', key: 'remark', width: 34 },
		{ header: 'Important', key: 'important', width: 11, format: 'center' },
		{ header: 'Status', key: 'status', width: 18, format: 'center' },
		{ header: 'Progress', key: 'progress', width: 12, format: 'percent' },
		{ header: 'Due Date', key: 'dueDate', width: 15, format: 'date' },
		{ header: 'Historical', key: 'historical', width: 11, format: 'center' },
		{ header: 'Archived', key: 'archived', width: 11, format: 'center' },
		{ header: 'Order ID', key: 'orderId', width: 24 }
	], orders.map((order, index) => ({
		serial: index + 1, customer: order.customer, mobile: order.mobile || null, event: order.workType, project: order.project,
		receiving: order.receiving || null, duration: order.duration || null, amount: order.priceSet === false ? null : order.price,
		discountPercent: order.priceSet === false ? null : order.price > 0 ? Number(order.discount || 0) / order.price : 0,
		discount: order.priceSet === false ? null : Number(order.discount || 0), total: order.priceSet === false ? null : { formula: `MAX(0,H${index + 2}-J${index + 2})`, result: Math.max(0, order.price - Number(order.discount || 0)) },
		paid: order.advanceSet === false && !(order.payments || []).length ? null : order.paid,
		balance: order.priceSet === false ? null : { formula: `MAX(0,K${index + 2}-L${index + 2})`, result: Math.max(0, order.price - Number(order.discount || 0) - order.paid) },
		source: order.source || null, assignedNames: [...new Set(order.tasks.filter((task) => !task.archived && task.assignee !== 'Unassigned').map((task) => task.assignee))].join(', ') || null,
		remark: order.remarks || null, important: order.important ? 'Yes' : null, status: order.status, progress: Number(order.progress || 0) / 100,
		dueDate: asDate(order.due), historical: order.historical ? 'Yes' : null, archived: order.archived ? 'Yes' : null, orderId: order.id
	})), { statusKey: 'status', importantKey: 'important', archivedKey: 'archived', tabColor: 'FFD4AF37' });
	ordersSheet.getColumn('balance').eachCell((cell, rowNumber) => { if (rowNumber > 1 && cell.value) cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: COLORS.text } }; });

	addSheet(workbook, 'Customers', [
		{ header: 'Customer ID', key: 'id', width: 24 }, { header: 'Contact Name', key: 'name', width: 22 }, { header: 'Studio Name', key: 'business', width: 26 },
		{ header: 'Phone', key: 'phone', width: 16, format: 'center' }, { header: 'Email', key: 'email', width: 28 }, { header: 'Address', key: 'address', width: 36 },
		{ header: 'GSTIN', key: 'gst', width: 20 }, { header: 'Projects', key: 'projects', width: 12, format: 'integer' }, { header: 'Pending', key: 'pending', width: 15, format: 'currency' },
		{ header: 'Archived', key: 'archived', width: 11, format: 'center' }
	], [...data.customers].sort((a, b) => byText(a.business, b.business)).map((customer) => ({ id: customer.id, name: customer.name, business: customer.business, phone: customer.phone || null, email: customer.email || null, address: customer.address || null, gst: customer.gst || null, projects: customer.projects, pending: customer.pending, archived: customer.archived ? 'Yes' : null })), { archivedKey: 'archived', tabColor: 'FF2563EB' });

	addSheet(workbook, 'Editors', [
		{ header: 'Editor ID', key: 'id', width: 22 }, { header: 'Name', key: 'name', width: 22 }, { header: 'Phone', key: 'phone', width: 16, format: 'center' },
		{ header: 'Specialty', key: 'specialty', width: 24 }, { header: 'Availability', key: 'availability', width: 16, format: 'center' },
		{ header: 'Active Tasks', key: 'activeTasks', width: 14, format: 'integer' }, { header: 'Archived', key: 'archived', width: 11, format: 'center' }, { header: 'Record ID', key: 'recordId', width: 24 }
	], [...data.editors].sort((a, b) => byText(a.name, b.name)).map((editor) => ({ id: editor.code || editor.id, name: editor.name, phone: editor.phone || null, specialty: editor.specialty || null, availability: editor.availability || (editor.available ? 'available' : 'busy'), activeTasks: editor.activeTasks, archived: editor.archived ? 'Yes' : null, recordId: editor.id })), { statusKey: 'availability', archivedKey: 'archived', tabColor: 'FF7C3AED' });

	addSheet(workbook, 'Tasks', [
		{ header: 'S.No.', key: 'serial', width: 10, format: 'integer' }, { header: 'Project', key: 'project', width: 26 }, { header: 'Task', key: 'task', width: 24 },
		{ header: 'Editor ID', key: 'editorId', width: 14 }, { header: 'Editor', key: 'editor', width: 20 }, { header: 'Status', key: 'status', width: 22, format: 'center' }, { header: 'Progress', key: 'progress', width: 12, format: 'percent' },
		{ header: 'Due Date', key: 'dueDate', width: 15, format: 'date' }, { header: 'Task Value (Billable)', key: 'billableAmount', width: 19, format: 'currency' }, { header: 'Already Invoiced', key: 'invoicedAmount', width: 17, format: 'currency' }, { header: 'Instructions', key: 'instructions', width: 38 },
		{ header: 'Reference Link', key: 'textLink', width: 34, format: 'link' }, { header: 'Image URL', key: 'imageUrl', width: 34, format: 'link' },
		{ header: 'Output Link', key: 'outputLink', width: 34, format: 'link' }, { header: 'Notes', key: 'notes', width: 34 },
		{ header: 'Archived', key: 'archived', width: 11, format: 'center' }, { header: 'Task ID', key: 'taskId', width: 24 }, { header: 'Order ID', key: 'orderId', width: 24 }
	], orders.flatMap((order) => order.tasks.map((task) => ({ project: order.project, task: task.name, editorId: task.editorCode || null, editor: task.assignee, status: task.status, progress: Number(task.progress || 0) / 100, dueDate: asDate(task.due), billableAmount: task.billableAmount || null, invoicedAmount: task.invoicedAmount || null, instructions: task.instructions || null, textLink: externalLink(task.textLink), imageUrl: externalLink(task.imageUrl), outputLink: externalLink(task.outputLink), notes: task.notes || null, archived: task.archived ? 'Yes' : null, taskId: task.id, orderId: order.id }))).map((record, index) => ({ serial: index + 1, ...record })), { statusKey: 'status', archivedKey: 'archived', tabColor: 'FF0EA5E9' });

	addSheet(workbook, 'Payments', [
		{ header: 'S.No.', key: 'serial', width: 10, format: 'integer' }, { header: 'Studio Name', key: 'customer', width: 24 }, { header: 'Project', key: 'project', width: 26 },
		{ header: 'Type', key: 'kind', width: 18 }, { header: 'Amount', key: 'amount', width: 15, format: 'currency' }, { header: 'Paid Date', key: 'paidDate', width: 15, format: 'date' },
		{ header: 'Method', key: 'method', width: 16 }, { header: 'Note', key: 'note', width: 32 }, { header: 'Payment ID', key: 'paymentId', width: 24 }, { header: 'Order ID', key: 'orderId', width: 24 }
	], orders.flatMap((order) => (order.payments || []).map((payment) => ({ customer: order.customer, project: order.project, kind: payment.kind === 'advance' ? 'Advance collected' : 'Payment', amount: payment.amount, paidDate: asDate(payment.paidAt), method: payment.method || null, note: payment.note || null, paymentId: payment.id, orderId: order.id }))).map((record, index) => ({ serial: index + 1, ...record })), { tabColor: 'FF16A34A' });

	const ordersById = new Map(orders.map((order) => [order.id, order]));
	addSheet(workbook, 'Invoices', [
		{ header: 'Invoice Number', key: 'number', width: 20 }, { header: 'S.No.', key: 'serial', width: 10, format: 'integer' }, { header: 'Studio Name', key: 'customer', width: 24 },
		{ header: 'Project', key: 'project', width: 26 }, { header: 'Type', key: 'kind', width: 18 }, { header: 'Received', key: 'received', width: 15, format: 'currency' },
		{ header: 'Subtotal', key: 'subtotal', width: 15, format: 'currency' }, { header: 'Discount %', key: 'discountPercent', width: 13, format: 'percent' }, { header: 'Discount Amount', key: 'discount', width: 17, format: 'currency' }, { header: 'Total', key: 'total', width: 15, format: 'currency' }, { header: 'Paid', key: 'paid', width: 15, format: 'currency' },
		{ header: 'Balance', key: 'balance', width: 15, format: 'currency' }, { header: 'Created At', key: 'openedAt', width: 21, format: 'datetime' },
		{ header: 'Invoice ID', key: 'invoiceId', width: 24 }, { header: 'Order ID', key: 'orderId', width: 24 }, { header: 'Message Snapshot', key: 'message', width: 48 }
	], [...data.invoices].sort((left, right) => {
		const serialDifference = Number(ordersById.get(right.orderId)?.serial || 0) - Number(ordersById.get(left.orderId)?.serial || 0);
		return serialDifference || String(right.openedAt).localeCompare(String(left.openedAt));
	}).map((invoice) => { const order = ordersById.get(invoice.orderId); return { number: invoice.number, customer: order?.customer || null, project: order?.project || null, kind: invoice.kind === 'advance' ? 'Advance receipt' : invoice.kind === 'payment' ? 'Payment receipt' : invoice.kind === 'partial' ? 'Partial work invoice' : 'Final invoice', received: invoice.amountReceived, subtotal: invoice.subtotal, discountPercent: invoice.subtotal > 0 ? invoice.discount / invoice.subtotal : 0, discount: invoice.discount, total: invoice.total, paid: invoice.paid, balance: invoice.balance, openedAt: asDate(invoice.openedAt), invoiceId: invoice.id, orderId: invoice.orderId, message: invoice.message || null }; }).map((record, index) => ({ serial: index + 1, ...record })), { tabColor: 'FFF59E0B' });

	addSheet(workbook, 'Activity Logs', [
		{ header: 'Date & Time', key: 'createdAt', width: 21, format: 'datetime' }, { header: 'Actor', key: 'actor', width: 18 }, { header: 'Action', key: 'action', width: 28 },
		{ header: 'Entity Type', key: 'entityType', width: 16, format: 'center' }, { header: 'Entity ID', key: 'entityId', width: 24 }, { header: 'Details', key: 'details', width: 44 }, { header: 'Log ID', key: 'id', width: 24 }
	], [...data.activity].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).map((entry) => ({ createdAt: asDate(entry.createdAt), actor: entry.actor || null, action: entry.action, entityType: entry.entityType, entityId: entry.entityId || null, details: entry.details || null, id: entry.id })), { tabColor: 'FF64748B' });

	const settingLabels: Record<string, string> = { studioName: 'Studio Name', logoUrl: 'Logo URL', address: 'Address', phone: 'Phone', email: 'Email', gstin: 'GSTIN', paymentNote: 'Payment Note', invoiceFooter: 'Invoice Footer', assignmentTemplate: 'Assignment Template', invoiceTemplate: 'Invoice Template', themePalette: 'Theme Palette', themeDefaultMode: 'Default Theme Mode' };
	addSheet(workbook, 'Settings', [
		{ header: 'Setting', key: 'setting', width: 28 }, { header: 'Value', key: 'value', width: 90 }
	], Object.entries(data.settings).map(([key, value]) => ({ setting: settingLabels[key] || key, value: value === null || value === undefined || value === '' ? null : String(value) })), { tabColor: 'FF475569' });

	return new Uint8Array(await workbook.xlsx.writeBuffer());
}
