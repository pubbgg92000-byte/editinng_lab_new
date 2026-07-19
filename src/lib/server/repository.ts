import type { ActivityLog, Customer, Editor, EditorAvailability, Invoice, Order, Payment, StudioSettings, Task, TaskStatus } from '$lib/types';
import { createPortalToken, hashPortalToken, openPortalToken, sealPortalToken } from './tokens';
import { defaultAssignmentTemplate, defaultInvoiceTemplate, legacyAssignmentTemplate, legacyInvoiceTemplate } from '$lib/messageTemplates';
import { durationBillableAmount } from '$lib/duration';
import { indianMobileError, normalizeIndianMobile } from '$lib/phone';

type Row = Record<string, any>;
const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

async function rows(database: AppDatabase, query: string, values: unknown[] = []) {
	return (await database.prepare(query).bind(...values).all<Row>()).results ?? [];
}

async function activity(database: AppDatabase, actor: string, action: string, entityType: string, entityId: string, details = '', editorId?: string) {
	const record = { id: id('ACT'), actor, action, entityType, entityId, details, editorId, createdAt: now() };
	await database.prepare('INSERT INTO activity_logs (id, actor, action, entity_type, entity_id, details, editor_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(record.id, actor, action, entityType, entityId, details, editorId || null, record.createdAt).run();
	await queueSheetSync(database, 'Activity Logs', record.id, record);
}

export async function recordActivity(database: AppDatabase, actor: string, action: string, entityType: string, entityId: string, details = '') {
	await activity(database, actor, action, entityType, entityId, details);
}

export async function queueSheetSync(database: AppDatabase, entityType: string, entityId: string, payload: unknown, operation = 'upsert') {
	// Database writes succeed first; this outbox is flushed to Google Sheets afterward.
	const timestamp = now();
	await database.prepare('INSERT INTO sheet_sync_outbox (id, entity_type, entity_id, operation, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id('SYNC'), entityType, entityId, operation, JSON.stringify(payload), timestamp, timestamp).run();
}

function customerFrom(row: Row): Customer {
	return { id: row.id, name: row.name, business: row.business, phone: row.phone, email: row.email, address: row.address, locationUrl: row.location_url || '', gst: row.gst, projects: Number(row.projects ?? 0), pending: Number(row.pending ?? 0), archived: Boolean(row.archived_at) };
}

function editorFrom(row: Row): Editor {
	const availability = row.availability as EditorAvailability;
	return { id: row.id, code: row.code || row.id, name: row.name, initials: initials(row.name), specialty: row.specialty, phone: row.phone, locationUrl: row.location_url || '', activeTasks: Number(row.active_tasks ?? 0), available: availability === 'available', availability, archived: Boolean(row.archived_at) };
}

function taskFrom(row: Row): Task {
	// Central task mapping keeps admin billing and editor work data on the same record.
	return { id: row.id, orderId: row.order_id, name: row.title, assignee: row.editor_name || 'Unassigned', editorId: row.editor_id || undefined, editorCode: row.editor_code || undefined, status: row.status, progress: Number(row.progress), due: row.due_date, instructions: row.instructions, textLink: row.text_link, imageUrl: row.image_url, outputLink: row.output_link, notes: row.notes, billableAmount: Number(row.billable_amount || 0), invoicedAmount: Number(row.invoiced_amount || 0), billingMode: row.billing_mode === 'duration' ? 'duration' : 'manual', hourlyRate: Number(row.hourly_rate || 0), videoDurationMinutes: Number(row.video_duration_minutes || 0), device: String(row.device || ''), editorSettlement: row.editor_settlement === 'editor-bills-admin' ? 'editor-bills-admin' : row.editor_settlement === 'admin-issues-statement' ? 'admin-issues-statement' : 'not-set', archived: Boolean(row.archived_at) };
}

function paymentFrom(row: Row): Payment {
	return { id: row.id, orderId: row.order_id, amount: Number(row.amount), paidAt: row.paid_at, method: row.method, note: row.note, kind: row.kind === 'advance' ? 'advance' : 'payment' };
}

function orderFrom(row: Row, orderTasks: Task[] = [], orderPayments: Payment[] = []): Order {
	const initialAdvance = Number(row.advance);
	const paid = initialAdvance + orderPayments.reduce((sum, payment) => sum + payment.amount, 0);
	return { id: row.id, serial: Number(row.serial), customerId: row.customer_id || undefined, customer: row.customer_name, mobile: row.mobile, workType: row.event, project: row.project, receiving: row.receiving, duration: row.duration, price: Number(row.amount), discount: Number(row.discount || 0), paid, initialAdvance, priceSet: Boolean(row.amount_set), advanceSet: Boolean(row.advance_set), source: row.source, remarks: row.remarks, due: row.due_date, status: row.status, progress: Number(row.progress), files: 0, fileLink: '', color: '#00ADB5', tasks: orderTasks, payments: orderPayments, important: Boolean(row.important), historical: Boolean(row.historical), archived: Boolean(row.archived_at), deliveryMethod: row.delivery_method || '', deliveredAt: row.delivered_at || '', customerNotifiedAt: row.customer_notified_at || '', createdAt: row.created_at || '', updatedAt: row.updated_at || '' };
}

export async function getSettings(database: AppDatabase): Promise<StudioSettings> {
	const values = Object.fromEntries((await rows(database, 'SELECT key, value FROM settings')).map((row) => [row.key, row.value]));
	const savedAssignmentTemplate = String(values.assignmentTemplate || '');
	const assignmentTemplate = !savedAssignmentTemplate || savedAssignmentTemplate.trim() === legacyAssignmentTemplate.trim() ? defaultAssignmentTemplate : savedAssignmentTemplate;
	const storedInvoiceTemplate = String(values.invoiceTemplate || '');
	const savedInvoiceTemplate = !storedInvoiceTemplate || storedInvoiceTemplate.trim() === legacyInvoiceTemplate.trim() ? defaultInvoiceTemplate : storedInvoiceTemplate;
	const invoiceTemplate = savedInvoiceTemplate.includes('{{portal_link}}') ? savedInvoiceTemplate : `${savedInvoiceTemplate.trimEnd()}\n\nView your work status and bill:\n{{portal_link}}`;
	return { studioName: values.studioName || 'StudioFlow Studio', orderPrefix: String(values.orderPrefix || 'ORD').toUpperCase(), editorPrefix: String(values.editorPrefix || 'ED').toUpperCase(), logoUrl: values.logoUrl || '', address: values.address || '', phone: values.phone || '', email: values.email || '', gstin: values.gstin || '', paymentNote: values.paymentNote || '', invoiceFooter: values.invoiceFooter || '', assignmentTemplate, invoiceTemplate, themePalette: values.themePalette || 'graphite-aqua', themeDefaultMode: values.themeDefaultMode === 'dark' ? 'dark' : 'light' } as StudioSettings;
}

export async function updateSettings(database: AppDatabase, input: Partial<StudioSettings>) {
	const timestamp = now();
	await database.batch(Object.entries(input).map(([key, value]) => database.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind(key, String(value ?? ''), timestamp)));
	const settings = await getSettings(database);
	await activity(database, 'admin', 'Settings updated', 'settings', 'studio', 'Studio profile, messages and appearance updated');
	await queueSheetSync(database, 'Settings', 'studio', settings);
	return settings;
}

export async function listCustomers(database: AppDatabase, includeArchived = false) {
	const customerRows = await rows(database, `SELECT c.*,
		(SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS projects,
		COALESCE((SELECT SUM(CASE WHEN o.amount - o.discount - o.advance - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.order_id = o.id), 0) > 0 THEN o.amount - o.discount - o.advance - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.order_id = o.id), 0) ELSE 0 END) FROM orders o WHERE o.customer_id = c.id AND o.archived_at IS NULL), 0) AS pending
		FROM customers c ${includeArchived ? '' : 'WHERE c.archived_at IS NULL'} ORDER BY c.business`);
	const customers = customerRows.map(customerFrom);
	for (const customer of customers) {
		const source = customerRows.find((row) => row.id === customer.id);
		customer.token = await openPortalToken(source?.portal_token_cipher);
	}
	return customers;
}

export async function getCustomer(database: AppDatabase, customerId: string) {
	const row = await database.prepare('SELECT * FROM customers WHERE id = ?').bind(customerId).first<Row>();
	if (!row) return null;
	const customer = customerFrom(row);
	customer.token = await openPortalToken(row.portal_token_cipher);
	return customer;
}

export async function createCustomer(database: AppDatabase, input: Partial<Customer>) {
	const timestamp = now();
	const token = createPortalToken();
	const phoneError = indianMobileError(input.phone, true);
	if (phoneError) throw new Error(phoneError);
	const phone = normalizeIndianMobile(input.phone);
	if (await database.prepare('SELECT id FROM customers WHERE phone_normalized = ? OR RIGHT(regexp_replace(phone, ?, ?, ?), 10) = ? LIMIT 1').bind(phone, '\\D', '', 'g', phone).first()) throw new Error('A customer with this mobile number already exists. Open the existing customer instead.');
	const customer: Customer = { id: id('CUST'), name: String(input.name || '').trim(), business: String(input.business || input.name || '').trim(), phone, email: String(input.email || '').trim(), address: input.address || '', locationUrl: String(input.locationUrl || '').trim(), gst: input.gst || '', projects: 0, pending: 0, token };
	await database.prepare('INSERT INTO customers (id, name, business, phone, phone_normalized, email, address, location_url, gst, portal_token_hash, portal_token_cipher, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(customer.id, customer.name, customer.business, customer.phone, phone, customer.email, customer.address, customer.locationUrl, customer.gst, await hashPortalToken(token), await sealPortalToken(token), timestamp, timestamp).run();
	await activity(database, 'admin', 'Customer created', 'customer', customer.id, customer.business);
	await queueSheetSync(database, 'Customers', customer.id, customer);
	return customer;
}

export async function updateCustomer(database: AppDatabase, customerId: string, input: Partial<Customer>) {
	const existing = await database.prepare('SELECT * FROM customers WHERE id = ? AND archived_at IS NULL').bind(customerId).first<Row>();
	if (!existing) return null;
	const phoneError = indianMobileError(input.phone ?? existing.phone, true);
	if (phoneError) throw new Error(phoneError);
	const phone = normalizeIndianMobile(input.phone ?? existing.phone);
	if (await database.prepare('SELECT id FROM customers WHERE id != ? AND (phone_normalized = ? OR RIGHT(regexp_replace(phone, ?, ?, ?), 10) = ?) LIMIT 1').bind(customerId, phone, '\\D', '', 'g', phone).first()) throw new Error('Another customer already uses this mobile number.');
	const timestamp = now();
	const business = String(input.business ?? existing.business).trim() || String(input.name ?? existing.name).trim();
	const linkedOrders = await rows(database, 'SELECT id FROM orders WHERE customer_id = ?', [customerId]);
	await database.batch([
		database.prepare('UPDATE customers SET name = ?, business = ?, phone = ?, phone_normalized = ?, email = ?, address = ?, location_url = ?, gst = ?, updated_at = ? WHERE id = ?').bind(input.name ?? existing.name, business, phone, phone, input.email ?? existing.email, input.address ?? existing.address, input.locationUrl ?? existing.location_url ?? '', input.gst ?? existing.gst, timestamp, customerId),
		database.prepare('UPDATE orders SET customer_name = ?, mobile = ?, updated_at = ? WHERE customer_id = ?').bind(business, phone, timestamp, customerId)
	]);
	const customer = (await listCustomers(database)).find((item) => item.id === customerId)!;
	await activity(database, 'admin', 'Customer updated', 'customer', customerId, customer.business);
	await queueSheetSync(database, 'Customers', customerId, customer);
	for (const linked of linkedOrders) {
		const order = await getOrder(database, String(linked.id));
		if (order) await queueSheetSync(database, 'Orders', order.id, order);
	}
	return customer;
}

export async function regenerateCustomerToken(database: AppDatabase, customerId: string) {
	const token = createPortalToken();
	const result = await database.prepare('UPDATE customers SET portal_token_hash = ?, portal_token_cipher = ?, updated_at = ? WHERE id = ? AND archived_at IS NULL').bind(await hashPortalToken(token), await sealPortalToken(token), now(), customerId).run();
	if (!result.meta?.changes) return null;
	await activity(database, 'admin', 'Customer portal link regenerated', 'customer', customerId);
	return token;
}

export async function archiveCustomer(database: AppDatabase, customerId: string) {
	const result = await database.prepare('UPDATE customers SET archived_at = ?, updated_at = ? WHERE id = ? AND archived_at IS NULL').bind(now(), now(), customerId).run();
	if (!result.meta?.changes) return null;
	const customer = (await listCustomers(database, true)).find((item) => item.id === customerId)!;
	await activity(database, 'admin', 'Customer archived', 'customer', customerId, customer.business);
	await queueSheetSync(database, 'Customers', customerId, customer);
	return customer;
}

export async function restoreCustomer(database: AppDatabase, customerId: string) {
	const result = await database.prepare('UPDATE customers SET archived_at = NULL, updated_at = ? WHERE id = ? AND archived_at IS NOT NULL').bind(now(), customerId).run();
	if (!result.meta?.changes) return null;
	const customer = (await listCustomers(database, true)).find((item) => item.id === customerId)!;
	await activity(database, 'admin', 'Customer restored', 'customer', customerId, customer.business);
	await queueSheetSync(database, 'Customers', customerId, customer);
	return customer;
}

export async function listEditors(database: AppDatabase, includeInactive = false) {
	const editorRows = await rows(database, `SELECT e.*, COUNT(CASE WHEN t.archived_at IS NULL AND t.status != 'Completed' THEN 1 END) AS active_tasks FROM editors e LEFT JOIN tasks t ON t.editor_id = e.id ${includeInactive ? '' : 'WHERE e.archived_at IS NULL'} GROUP BY e.id ORDER BY e.name`);
	const editors = editorRows.map(editorFrom);
	for (const editor of editors) {
		const source = editorRows.find((row) => row.id === editor.id);
		editor.token = await openPortalToken(source?.portal_token_cipher);
	}
	return editors;
}

export async function listDeviceOptions(database: AppDatabase) {
	const deviceRows = await rows(database, "SELECT DISTINCT TRIM(device) AS device FROM tasks WHERE TRIM(COALESCE(device, '')) <> '' ORDER BY TRIM(device)");
	return deviceRows.map((row) => String(row.device)).filter(Boolean);
}

export async function createEditor(database: AppDatabase, input: Partial<Editor>) {
	const timestamp = now();
	const token = createPortalToken();
	const phoneError = indianMobileError(input.phone, true);
	if (phoneError) throw new Error(phoneError);
	const phone = normalizeIndianMobile(input.phone);
	if (await database.prepare('SELECT id FROM editors WHERE phone_normalized = ? OR RIGHT(regexp_replace(phone, ?, ?, ?), 10) = ? LIMIT 1').bind(phone, '\\D', '', 'g', phone).first()) throw new Error('An editor with this mobile number already exists. Open the existing editor instead.');
	const serial = await database.prepare("INSERT INTO counters (name, value) VALUES ('editor_serial', 1) ON CONFLICT(name) DO UPDATE SET value = counters.value + 1 RETURNING value").first<{ value: number }>();
	const prefix = (await getSettings(database)).editorPrefix;
	const editor: Editor = { id: id('ED'), code: `${prefix}-${String(Number(serial?.value || 1)).padStart(4, '0')}`, name: String(input.name || '').trim(), initials: initials(String(input.name || '')), phone, locationUrl: String(input.locationUrl || '').trim(), specialty: String(input.specialty || '').trim(), availability: input.availability || 'available', available: (input.availability || 'available') === 'available', activeTasks: 0, token };
	await database.prepare('INSERT INTO editors (id, code, name, phone, phone_normalized, location_url, specialty, availability, portal_token_hash, portal_token_cipher, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(editor.id, editor.code, editor.name, editor.phone, phone, editor.locationUrl, editor.specialty, editor.availability, await hashPortalToken(token), await sealPortalToken(token), timestamp, timestamp).run();
	await activity(database, 'admin', 'Editor created', 'editor', editor.id, editor.name);
	await queueSheetSync(database, 'Editors', editor.id, editor);
	return editor;
}

export async function updateEditor(database: AppDatabase, editorId: string, input: Partial<Editor>) {
	const existing = await database.prepare('SELECT * FROM editors WHERE id = ? AND archived_at IS NULL').bind(editorId).first<Row>();
	if (!existing) return null;
	const phoneError = indianMobileError(input.phone ?? existing.phone, true);
	if (phoneError) throw new Error(phoneError);
	const phone = normalizeIndianMobile(input.phone ?? existing.phone);
	if (await database.prepare('SELECT id FROM editors WHERE id != ? AND (phone_normalized = ? OR RIGHT(regexp_replace(phone, ?, ?, ?), 10) = ?) LIMIT 1').bind(editorId, phone, '\\D', '', 'g', phone).first()) throw new Error('Another editor already uses this mobile number.');
	const availability = input.availability || existing.availability;
	await database.prepare('UPDATE editors SET name = ?, phone = ?, phone_normalized = ?, location_url = ?, specialty = ?, availability = ?, updated_at = ? WHERE id = ?').bind(input.name ?? existing.name, phone, phone, input.locationUrl ?? existing.location_url ?? '', input.specialty ?? existing.specialty, availability, now(), editorId).run();
	const editor = (await listEditors(database, true)).find((item) => item.id === editorId)!;
	await activity(database, 'admin', 'Editor updated', 'editor', editorId, editor.name);
	await queueSheetSync(database, 'Editors', editorId, editor);
	return editor;
}

export async function archiveEditor(database: AppDatabase, editorId: string) {
	const result = await database.prepare("UPDATE editors SET archived_at = ?, availability = 'inactive', updated_at = ? WHERE id = ? AND archived_at IS NULL").bind(now(), now(), editorId).run();
	if (!result.meta?.changes) return null;
	const editor = (await listEditors(database, true)).find((item) => item.id === editorId)!;
	await activity(database, 'admin', 'Editor archived', 'editor', editorId, editor.name);
	await queueSheetSync(database, 'Editors', editorId, editor);
	return editor;
}

export async function restoreEditor(database: AppDatabase, editorId: string) {
	const result = await database.prepare("UPDATE editors SET archived_at = NULL, availability = 'available', updated_at = ? WHERE id = ? AND archived_at IS NOT NULL").bind(now(), editorId).run();
	if (!result.meta?.changes) return null;
	const editor = (await listEditors(database, true)).find((item) => item.id === editorId)!;
	await activity(database, 'admin', 'Editor restored', 'editor', editorId, editor.name);
	await queueSheetSync(database, 'Editors', editorId, editor);
	return editor;
}

export async function permanentlyDeleteEditor(database: AppDatabase, editorId: string) {
	const existing = await database.prepare('SELECT * FROM editors WHERE id = ? AND archived_at IS NOT NULL').bind(editorId).first<Row>();
	if (!existing) return null;
	const taskCount = Number((await database.prepare('SELECT COUNT(*) AS count FROM tasks WHERE editor_id = ?').bind(editorId).first<{ count: number }>())?.count || 0);
	const timestamp = now();
	await database.batch([
		database.prepare('UPDATE tasks SET editor_id = NULL, updated_at = ? WHERE editor_id = ?').bind(timestamp, editorId),
		database.prepare('DELETE FROM editors WHERE id = ? AND archived_at IS NOT NULL').bind(editorId)
	]);
	await activity(database, 'admin', 'Editor permanently deleted', 'editor', editorId, `${existing.name} · ${taskCount} task(s) changed to Unassigned`);
	await queueSheetSync(database, 'Editors', editorId, { id: editorId }, 'delete');
	return { id: editorId, name: String(existing.name), taskCount };
}

export async function regenerateEditorToken(database: AppDatabase, editorId: string) {
	const token = createPortalToken();
	const result = await database.prepare('UPDATE editors SET portal_token_hash = ?, portal_token_cipher = ?, updated_at = ? WHERE id = ? AND archived_at IS NULL').bind(await hashPortalToken(token), await sealPortalToken(token), now(), editorId).run();
	if (!result.meta?.changes) return null;
	await activity(database, 'admin', 'Editor portal link regenerated', 'editor', editorId);
	return token;
}

export async function findEditorByToken(database: AppDatabase, token: string) {
	const row = await database.prepare(`SELECT e.*, COUNT(CASE WHEN t.archived_at IS NULL AND t.status != 'Completed' THEN 1 END) AS active_tasks FROM editors e LEFT JOIN tasks t ON t.editor_id = e.id WHERE e.portal_token_hash = ? AND e.archived_at IS NULL GROUP BY e.id`).bind(await hashPortalToken(token)).first<Row>();
	return row ? editorFrom(row) : null;
}

async function hydrateOrders(database: AppDatabase, orderRows: Row[]) {
	if (!orderRows.length) return [];
	const orderIds = orderRows.map((row) => row.id);
	const placeholders = orderIds.map(() => '?').join(', ');
	const [taskRows, paymentRows] = await Promise.all([
		rows(database, `SELECT t.*, e.name AS editor_name, e.code AS editor_code, COALESCE((SELECT SUM(item.amount) FROM invoice_task_items item WHERE item.task_id = t.id), 0) AS invoiced_amount FROM tasks t LEFT JOIN editors e ON e.id = t.editor_id WHERE t.order_id IN (${placeholders}) ORDER BY t.created_at`, orderIds),
		rows(database, `SELECT * FROM payments WHERE order_id IN (${placeholders}) ORDER BY paid_at DESC`, orderIds)
	]);
	return orderRows.map((row) => orderFrom(row, taskRows.filter((task) => task.order_id === row.id).map(taskFrom), paymentRows.filter((payment) => payment.order_id === row.id).map(paymentFrom)));
}

export async function listOrders(database: AppDatabase, includeHistorical = true, includeArchived = false) {
	const conditions = [includeHistorical ? '' : 'historical = 0', includeArchived ? '' : 'archived_at IS NULL'].filter(Boolean);
	const orderRows = await rows(database, `SELECT * FROM orders ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY serial DESC`);
	return hydrateOrders(database, orderRows);
}

export async function listOrdersForCustomer(database: AppDatabase, customerId: string) {
	const orderRows = await rows(database, 'SELECT * FROM orders WHERE customer_id = ? AND archived_at IS NULL ORDER BY serial DESC', [customerId]);
	return hydrateOrders(database, orderRows);
}

export async function getOrder(database: AppDatabase, orderId: string) {
	const order = await database.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first<Row>();
	return order ? (await hydrateOrders(database, [order]))[0] : null;
}

export interface OrderPageOptions {
	page?: number;
	pageSize?: number;
	query?: string;
	status?: string;
	event?: string;
	includeHistorical?: boolean;
	archived?: boolean;
}

export async function listOrdersPage(database: AppDatabase, options: OrderPageOptions = {}) {
	const pageSize = Math.max(10, Math.min(100, Math.floor(Number(options.pageSize) || 25)));
	const requestedPage = Math.max(1, Math.floor(Number(options.page) || 1));
	const conditions: string[] = [];
	const values: unknown[] = [];
	conditions.push(options.archived ? 'archived_at IS NOT NULL' : 'archived_at IS NULL');
	if (options.includeHistorical === false) conditions.push('historical = 0');
	if (options.query?.trim()) {
		conditions.push("LOWER(project || ' ' || customer_name || ' ' || event || ' ' || status || ' ' || serial::text) LIKE ?");
		values.push(`%${options.query.trim().toLowerCase()}%`);
	}
	if (options.status?.trim()) { conditions.push('status = ?'); values.push(options.status.trim()); }
	if (options.event?.trim()) { conditions.push('event = ?'); values.push(options.event.trim()); }
	const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
	const count = await database.prepare(`SELECT COUNT(*) AS count FROM orders ${where}`).bind(...values).first<{ count: number | string }>();
	const total = Number(count?.count || 0);
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const page = Math.min(requestedPage, totalPages);
	const offset = (page - 1) * pageSize;
	const orderRows = await rows(database, `SELECT * FROM orders ${where} ORDER BY important DESC, serial DESC LIMIT ? OFFSET ?`, [...values, pageSize, offset]);
	return {
		orders: await hydrateOrders(database, orderRows),
		pagination: { page, pageSize, total, totalPages, from: total ? offset + 1 : 0, to: Math.min(offset + pageSize, total) }
	};
}

export async function countArchivedOrders(database: AppDatabase) {
	const result = await database.prepare('SELECT COUNT(*) AS count FROM orders WHERE archived_at IS NOT NULL').first<{ count: number | string }>();
	return Number(result?.count || 0);
}

export async function getOrderQueueCounts(database: AppDatabase) {
	const result = await database.prepare(`SELECT
		COUNT(*) FILTER (WHERE archived_at IS NULL) AS all_orders,
		COUNT(*) FILTER (WHERE archived_at IS NULL AND status = 'Waiting Review') AS review,
		COUNT(*) FILTER (WHERE archived_at IS NULL AND status = 'Ready Delivery') AS ready,
		COUNT(*) FILTER (WHERE archived_at IS NULL AND status = 'Delivered') AS delivered
		FROM orders`).first<{ all_orders: number | string; review: number | string; ready: number | string; delivered: number | string }>();
	return { all: Number(result?.all_orders || 0), review: Number(result?.review || 0), ready: Number(result?.ready || 0), delivered: Number(result?.delivered || 0) };
}

export async function listOrderEvents(database: AppDatabase) {
	return (await rows(database, "SELECT DISTINCT event FROM orders WHERE event != '' ORDER BY event")).map((row) => String(row.event));
}

export const defaultEventOptions = ['Wedding', 'Birthday', 'Half Saree', 'House Opening', 'Engagement', 'Reception'];

export async function listEventOptions(database: AppDatabase) {
	const custom = (await rows(database, 'SELECT name FROM custom_event_options ORDER BY LOWER(name)')).map((row) => String(row.name));
	return [...defaultEventOptions.map((name) => ({ name, custom: false })), ...custom.filter((name) => !defaultEventOptions.some((item) => item.toLowerCase() === name.toLowerCase())).map((name) => ({ name, custom: true }))];
}

export async function addEventOption(database: AppDatabase, nameInput: string) {
	const name = nameInput.trim().replace(/\s+/g, ' ');
	if (!name) throw new Error('Enter an event name.');
	if (defaultEventOptions.some((item) => item.toLowerCase() === name.toLowerCase())) return listEventOptions(database);
	await database.prepare('INSERT INTO custom_event_options (name, created_at) VALUES (?, ?) ON CONFLICT (name) DO NOTHING').bind(name, now()).run();
	return listEventOptions(database);
}

export async function deleteEventOption(database: AppDatabase, name: string) {
	await database.prepare('DELETE FROM custom_event_options WHERE name = ?').bind(name.trim()).run();
	return listEventOptions(database);
}

export async function listOrderSearchIndex(database: AppDatabase, limit = 100) {
	const orderRows = await rows(database, 'SELECT * FROM orders ORDER BY updated_at DESC LIMIT ?', [Math.max(1, Math.min(250, limit))]);
	return orderRows.map((row) => orderFrom(row));
}

export async function getDashboardData(database: AppDatabase) {
	const stats = await database.prepare(`SELECT
		COUNT(*) FILTER (WHERE archived_at IS NULL AND historical = 0 AND status NOT IN ('Historical', 'Completed', 'Delivered', 'Stopped')) AS active,
		COUNT(*) FILTER (WHERE archived_at IS NULL AND historical = 0 AND status = 'Waiting Review') AS waiting_review,
		COUNT(*) FILTER (WHERE archived_at IS NULL AND historical = 0 AND status = 'Ready Delivery') AS ready_delivery,
		COUNT(*) FILTER (WHERE archived_at IS NULL AND status = 'Delivered') AS delivered
		FROM orders`).first<{ active: number | string; waiting_review: number | string; ready_delivery: number | string; delivered: number | string }>();
	const orderRows = await rows(database, "SELECT * FROM orders WHERE archived_at IS NULL AND historical = 0 AND status NOT IN ('Historical', 'Completed', 'Delivered', 'Stopped') ORDER BY important DESC, updated_at DESC LIMIT 20");
	return {
		orders: await hydrateOrders(database, orderRows),
		stats: { active: Number(stats?.active || 0), waitingReview: Number(stats?.waiting_review || 0), readyDelivery: Number(stats?.ready_delivery || 0), delivered: Number(stats?.delivered || 0) }
	};
}

export async function createOrder(database: AppDatabase, input: Partial<Order>) {
	const timestamp = now();
	const linkedCustomer = input.customerId ? await database.prepare('SELECT business, phone FROM customers WHERE id = ?').bind(input.customerId).first<Row>() : null;
	const customerName = linkedCustomer ? String(linkedCustomer.business || '') : String(input.customer || '');
	const mobileInput = linkedCustomer ? String(linkedCustomer.phone || '') : input.mobile;
	const mobileError = indianMobileError(mobileInput, true);
	if (mobileError) throw new Error(mobileError);
	const mobile = normalizeIndianMobile(mobileInput);
	const serialRow = await database.prepare("INSERT INTO counters (name, value) SELECT 'order_serial', COALESCE(MAX(serial), 0) + 1 FROM orders ON CONFLICT (name) DO UPDATE SET value = counters.value + 1 RETURNING value AS serial").first<{ serial: number }>();
	const orderId = id('ORD');
	await database.prepare('INSERT INTO orders (id, serial, customer_id, customer_name, mobile, event, project, receiving, duration, amount, discount, advance, amount_set, advance_set, source, remarks, due_date, status, progress, historical, important, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)').bind(orderId, Number(serialRow?.serial || 1), input.customerId || null, customerName, mobile, input.workType || '', input.project || '', input.receiving || '', input.duration || '', Number(input.price || 0), Number(input.priceSet !== false), Number(input.advanceSet !== false), input.source || '', input.remarks || '', input.due || '', 'Received', Number(Boolean(input.important)), timestamp, timestamp).run();
	if (Number(input.paid || 0) > 0) await recordPayment(database, orderId, { amount: Number(input.paid), paidAt: timestamp.slice(0, 10), method: 'Advance at booking', note: 'Advance collected when order was created', kind: 'advance' });
	const order = await getOrder(database, orderId);
	await activity(database, 'admin', 'Order created', 'order', orderId, `${customerName} · ${input.project}`);
	await queueSheetSync(database, 'Orders', orderId, order);
	return order!;
}

export async function updateOrder(database: AppDatabase, orderId: string, input: Partial<Order>) {
	const existing = await getOrder(database, orderId);
	if (!existing) return null;
	const price = Math.max(0, Number(input.price ?? existing.price));
	const discount = Math.max(0, Number(input.discount ?? existing.discount));
	if (discount > price) throw new Error('Discount cannot be greater than the total amount.');
	if ((input.price !== undefined || input.discount !== undefined) && input.priceSet !== false && price - discount < existing.paid) throw new Error('The discounted total cannot be below the amount already collected.');
	const nextStatus = input.status ?? existing.status;
	const nextCustomerId = input.customerId ?? existing.customerId;
	const linkedCustomer = nextCustomerId ? await database.prepare('SELECT business, phone FROM customers WHERE id = ?').bind(nextCustomerId).first<Row>() : null;
	const customerName = linkedCustomer ? String(linkedCustomer.business || '') : input.customer ?? existing.customer;
	const mobileInput = linkedCustomer ? String(linkedCustomer.phone || '') : input.mobile ?? existing.mobile;
	const mobileError = indianMobileError(mobileInput, true);
	if (mobileError) throw new Error(mobileError);
	const mobile = normalizeIndianMobile(mobileInput);
	const deliveredAt = nextStatus === 'Delivered' ? input.deliveredAt || existing.deliveredAt || now() : nextStatus === 'Ready Delivery' ? '' : existing.deliveredAt || '';
	await database.prepare('UPDATE orders SET customer_id = ?, customer_name = ?, mobile = ?, event = ?, project = ?, receiving = ?, duration = ?, amount = ?, discount = ?, amount_set = ?, advance_set = ?, source = ?, remarks = ?, due_date = ?, status = ?, progress = ?, historical = ?, important = ?, delivery_method = ?, delivered_at = ?, customer_notified_at = ?, updated_at = ? WHERE id = ?').bind(nextCustomerId ?? null, customerName, mobile, input.workType ?? existing.workType, input.project ?? existing.project, input.receiving ?? existing.receiving ?? '', input.duration ?? existing.duration ?? '', price, discount, input.priceSet === undefined ? Number(existing.priceSet !== false) : Number(input.priceSet), input.advanceSet === undefined ? Number(existing.advanceSet !== false) : Number(input.advanceSet), input.source ?? existing.source ?? '', input.remarks ?? existing.remarks ?? '', input.due ?? existing.due, nextStatus, Math.max(0, Math.min(100, Number(input.progress ?? existing.progress))), input.historical === undefined ? Number(existing.historical) : Number(input.historical), input.important === undefined ? Number(existing.important) : Number(input.important), input.deliveryMethod ?? existing.deliveryMethod ?? '', deliveredAt || null, input.customerNotifiedAt ?? existing.customerNotifiedAt ?? null, now(), orderId).run();
	const order = await getOrder(database, orderId);
	await activity(database, 'admin', 'Order updated', 'order', orderId, order?.project);
	await queueSheetSync(database, 'Orders', orderId, order);
	return order;
}

export async function markCustomerNotified(database: AppDatabase, orderId: string) {
	const notifiedAt = now();
	const result = await database.prepare('UPDATE orders SET customer_notified_at = ?, updated_at = ? WHERE id = ?').bind(notifiedAt, notifiedAt, orderId).run();
	return result.meta?.changes ? notifiedAt : null;
}

export async function archiveOrder(database: AppDatabase, orderId: string) {
	const result = await database.prepare('UPDATE orders SET archived_at = ?, updated_at = ? WHERE id = ? AND archived_at IS NULL').bind(now(), now(), orderId).run();
	if (!result.meta?.changes) return null;
	const order = await getOrder(database, orderId);
	await activity(database, 'admin', 'Order archived', 'order', orderId, order?.project || '');
	await queueSheetSync(database, 'Orders', orderId, order);
	return order;
}

export async function restoreOrder(database: AppDatabase, orderId: string) {
	const result = await database.prepare('UPDATE orders SET archived_at = NULL, updated_at = ? WHERE id = ? AND archived_at IS NOT NULL').bind(now(), orderId).run();
	if (!result.meta?.changes) return null;
	const order = await getOrder(database, orderId);
	await activity(database, 'admin', 'Order restored', 'order', orderId, order?.project || '');
	await queueSheetSync(database, 'Orders', orderId, order);
	return order;
}

export async function permanentlyDeleteOrder(database: AppDatabase, orderId: string) {
	const existing = await database.prepare('SELECT id, project FROM orders WHERE id = ? AND archived_at IS NOT NULL').bind(orderId).first<Row>();
	if (!existing) return null;
	await database.batch([
		database.prepare('DELETE FROM invoices WHERE order_id = ?').bind(orderId),
		database.prepare('DELETE FROM payments WHERE order_id = ?').bind(orderId),
		database.prepare('DELETE FROM tasks WHERE order_id = ?').bind(orderId),
		database.prepare('DELETE FROM orders WHERE id = ? AND archived_at IS NOT NULL').bind(orderId)
	]);
	await activity(database, 'admin', 'Order permanently deleted', 'order', orderId, String(existing.project || ''));
	await queueSheetSync(database, 'Orders', orderId, { id: orderId }, 'delete');
	return { id: orderId, project: String(existing.project || '') };
}

export async function createTask(database: AppDatabase, orderId: string, input: Partial<Task>) {
	const timestamp = now();
	if (input.editorId && !String(input.device || '').trim()) throw new Error('Enter the device given to the editor, such as HD-1.');
	const billingMode = input.billingMode === 'duration' ? 'duration' : 'manual';
	const hourlyRate = billingMode === 'duration' ? Math.max(0, Number(input.hourlyRate || 0)) : 0;
	const videoDurationMinutes = Math.max(0, Math.round(Number(input.videoDurationMinutes || 0)));
	// Duration billing is calculated; manual billing uses the entered task amount.
	const billableAmount = billingMode === 'duration' ? durationBillableAmount(hourlyRate, videoDurationMinutes) : Math.max(0, Number(input.billableAmount || 0));
	const editorSettlement = input.editorSettlement === 'editor-bills-admin' ? 'editor-bills-admin' : input.editorSettlement === 'admin-issues-statement' ? 'admin-issues-statement' : 'not-set';
	const task: Task = { id: id('TSK'), orderId, name: String(input.name || '').trim(), assignee: '', editorId: input.editorId, status: 'Not started', progress: 0, due: input.due || '', instructions: input.instructions || '', textLink: input.textLink || '', imageUrl: input.imageUrl || '', outputLink: '', notes: '', billableAmount, invoicedAmount: 0, billingMode, hourlyRate, videoDurationMinutes, device: String(input.device || '').trim(), editorSettlement };
	await database.prepare('INSERT INTO tasks (id, order_id, editor_id, title, instructions, due_date, text_link, image_url, status, progress, billable_amount, billing_mode, hourly_rate, video_duration_minutes, device, editor_settlement, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)').bind(task.id, orderId, task.editorId || null, task.name, task.instructions, task.due, task.textLink, task.imageUrl, task.status, task.billableAmount, task.billingMode, task.hourlyRate, task.videoDurationMinutes, task.device, task.editorSettlement, timestamp, timestamp).run();
	await updateOrderSummary(database, orderId);
	const saved = (await getOrder(database, orderId))!.tasks.find((item) => item.id === task.id)!;
	await activity(database, 'admin', saved.editorId ? 'Task assigned' : 'Task created', 'task', task.id, saved.editorId ? `${saved.name} · ${saved.assignee}` : saved.name);
	await queueSheetSync(database, 'Tasks', task.id, saved);
	return saved;
}

export async function updateTask(database: AppDatabase, taskId: string, input: Partial<Task>, actor = 'admin', editorId?: string) {
	const existing = await database.prepare('SELECT * FROM tasks WHERE id = ? AND archived_at IS NULL').bind(taskId).first<Row>();
	if (!existing || (editorId && existing.editor_id !== editorId)) return null;
	const allowedEditorStatuses: TaskStatus[] = ['Not started', 'Files downloaded', 'In progress', 'Waiting for clarification', 'Ready for review'];
	const status = editorId && input.status && !allowedEditorStatuses.includes(input.status) ? existing.status : input.status ?? existing.status;
	const progress = Math.max(0, Math.min(100, Number(input.progress ?? existing.progress)));
	const billingMode = editorId ? (existing.billing_mode === 'duration' ? 'duration' : 'manual') : input.billingMode === 'duration' ? 'duration' : input.billingMode === 'manual' ? 'manual' : existing.billing_mode === 'duration' ? 'duration' : 'manual';
	const hourlyRate = billingMode === 'duration' ? Math.max(0, Number(editorId ? existing.hourly_rate : input.hourlyRate ?? existing.hourly_rate ?? 0)) : 0;
	// Editors may report duration for any task; the admin decides later whether it is billed.
	const videoDurationMinutes = Math.max(0, Math.round(Number(input.videoDurationMinutes ?? existing.video_duration_minutes ?? 0)));
	const billableAmount = billingMode === 'duration' ? durationBillableAmount(hourlyRate, videoDurationMinutes) : Math.max(0, Number(input.billableAmount ?? existing.billable_amount ?? 0));
	const nextEditorId = editorId ? existing.editor_id : input.editorId ?? existing.editor_id;
	const device = editorId ? existing.device : input.device ?? existing.device ?? '';
	const editorSettlement = editorId ? existing.editor_settlement : input.editorSettlement === 'editor-bills-admin' ? 'editor-bills-admin' : input.editorSettlement === 'admin-issues-statement' ? 'admin-issues-statement' : input.editorSettlement === 'not-set' ? 'not-set' : existing.editor_settlement || 'not-set';
	if (nextEditorId && !String(device).trim()) throw new Error('Enter the device given to the editor, such as HD-1.');
	const invoicedAmount = Number((await database.prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM invoice_task_items WHERE task_id = ?').bind(taskId).first<{ total: number | string }>())?.total || 0);
	if (billableAmount + 0.009 < invoicedAmount) throw new Error('Task value cannot be lower than the amount already invoiced.');
	await database.prepare('UPDATE tasks SET editor_id = ?, title = ?, instructions = ?, due_date = ?, text_link = ?, image_url = ?, status = ?, progress = ?, output_link = ?, notes = ?, billable_amount = ?, billing_mode = ?, hourly_rate = ?, video_duration_minutes = ?, device = ?, editor_settlement = ?, updated_at = ? WHERE id = ?').bind(nextEditorId, input.name ?? existing.title, input.instructions ?? existing.instructions, input.due ?? existing.due_date, input.textLink ?? existing.text_link, input.imageUrl ?? existing.image_url, status, progress, input.outputLink ?? existing.output_link, input.notes ?? existing.notes, billableAmount, billingMode, hourlyRate, videoDurationMinutes, device, editorSettlement, now(), taskId).run();
	await updateOrderSummary(database, existing.order_id);
	const task = (await getOrder(database, existing.order_id))!.tasks.find((item) => item.id === taskId)!;
	const updateDetails = `${task.name} · ${task.status} · ${task.progress}%${task.videoDurationMinutes ? ` · ${task.videoDurationMinutes} min` : ''}${task.outputLink ? ' · Output link submitted' : ''}`;
	await activity(database, actor, editorId ? 'Editor updated work' : 'Task updated', 'task', taskId, updateDetails, editorId);
	await queueSheetSync(database, 'Tasks', taskId, task);
	return task;
}

export async function archiveTask(database: AppDatabase, taskId: string) {
	const existing = await database.prepare('SELECT * FROM tasks WHERE id = ?').bind(taskId).first<Row>();
	if (!existing) return false;
	await database.prepare('UPDATE tasks SET archived_at = ?, updated_at = ? WHERE id = ?').bind(now(), now(), taskId).run();
	await updateOrderSummary(database, existing.order_id);
	await activity(database, 'admin', 'Task archived', 'task', taskId, existing.title);
	await queueSheetSync(database, 'Tasks', taskId, { ...taskFrom(existing), archived: true });
	return true;
}

export async function restoreTask(database: AppDatabase, taskId: string) {
	const existing = await database.prepare('SELECT * FROM tasks WHERE id = ? AND archived_at IS NOT NULL').bind(taskId).first<Row>();
	if (!existing) return null;
	await database.prepare('UPDATE tasks SET archived_at = NULL, updated_at = ? WHERE id = ?').bind(now(), taskId).run();
	await updateOrderSummary(database, existing.order_id);
	const task = (await getOrder(database, existing.order_id))!.tasks.find((item) => item.id === taskId)!;
	await activity(database, 'admin', 'Task restored', 'task', taskId, task.name);
	await queueSheetSync(database, 'Tasks', taskId, task);
	return task;
}

export async function tasksForEditor(database: AppDatabase, editorId: string) {
	const taskRows = await rows(database, `SELECT t.*, e.name AS editor_name, e.code AS editor_code, o.project, o.customer_name, o.event, o.serial, COALESCE((SELECT SUM(item.amount) FROM invoice_task_items item WHERE item.task_id = t.id), 0) AS invoiced_amount FROM tasks t JOIN orders o ON o.id = t.order_id LEFT JOIN editors e ON e.id = t.editor_id WHERE t.editor_id = ? AND t.archived_at IS NULL AND o.historical = 0 AND o.archived_at IS NULL ORDER BY t.due_date, t.created_at`, [editorId]);
	return taskRows.map((row) => ({ ...taskFrom(row), project: row.project, customer: row.customer_name, workType: row.event, serial: row.serial }));
}

export async function updateOrderSummary(database: AppDatabase, orderId: string) {
	const order = await database.prepare('SELECT historical, status FROM orders WHERE id = ?').bind(orderId).first<{ historical: number; status: Order['status'] }>();
	if (!order) return;
	if (order.historical) {
		await database.prepare("UPDATE orders SET status = 'Historical', progress = 100, updated_at = ? WHERE id = ?").bind(now(), orderId).run();
		return;
	}
	if (['Delivered', 'Stopped'].includes(order.status)) return;
	const active = await rows(database, 'SELECT editor_id, status, progress FROM tasks WHERE order_id = ? AND archived_at IS NULL', [orderId]);
	let status: Order['status'] = 'Received';
	let progress = 0;
	if (active.length) {
		progress = Math.round(active.reduce((sum, task) => sum + Number(task.progress), 0) / active.length);
		if (active.every((task) => task.status === 'Completed')) status = 'Ready Delivery';
		else if (active.some((task) => task.status === 'Revision required')) status = 'Revision';
		else if (active.some((task) => task.status === 'Ready for review')) status = 'Waiting Review';
		else if (active.some((task) => Number(task.progress) > 0 || task.status === 'In progress')) status = 'Editing';
		else if (active.some((task) => Boolean(task.editor_id))) status = 'Assigned';
		else status = 'Received';
	}
	await database.prepare('UPDATE orders SET status = ?, progress = ?, updated_at = ? WHERE id = ?').bind(status, progress, now(), orderId).run();
	const updated = await getOrder(database, orderId);
	await queueSheetSync(database, 'Orders', orderId, updated);
}

export async function recordPayment(database: AppDatabase, orderId: string, input: Partial<Payment>) {
	const order = await getOrder(database, orderId);
	if (!order) throw new Error('Order not found.');
	const amount = Number(input.amount || 0);
	if (!(amount > 0)) throw new Error('Payment amount must be greater than zero.');
	const total = Math.max(0, order.price - order.discount);
	if (order.priceSet !== false && order.paid + amount > total) throw new Error('Payment cannot be greater than the remaining balance.');
	const payment: Payment = { id: id('PAY'), orderId, amount, paidAt: input.paidAt || new Date().toISOString().slice(0, 10), method: input.method || 'Manual', note: input.note || '', kind: input.kind === 'advance' ? 'advance' : 'payment' };
	await database.prepare('INSERT INTO payments (id, order_id, amount, paid_at, method, note, kind, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(payment.id, orderId, payment.amount, payment.paidAt, payment.method, payment.note, payment.kind, now()).run();
	await activity(database, 'admin', payment.kind === 'advance' ? 'Advance collected' : 'Payment recorded', 'payment', payment.id, `${payment.amount}`);
	await queueSheetSync(database, 'Payments', payment.id, payment);
	await queueSheetSync(database, 'Orders', orderId, await getOrder(database, orderId));
	return payment;
}

export async function recordInvoice(database: AppDatabase, orderId: string, messageInput: string | ((number: string, invoiceId: string) => string), snapshot: Partial<Invoice> = {}) {
	if (snapshot.paymentId) {
		const existing = await database.prepare('SELECT id FROM invoices WHERE payment_id = ? LIMIT 1').bind(snapshot.paymentId).first<{ id: string }>();
		if (existing?.id) return (await getInvoice(database, existing.id))!;
	}
	const year = new Date().getFullYear();
	const counter = await database.prepare('INSERT INTO counters (name, value) VALUES (?, 1) ON CONFLICT (name) DO UPDATE SET value = counters.value + 1 RETURNING value').bind(`invoice_${year}`).first<{ value: number }>();
	const number = `INV-${year}-${String(Number(counter?.value || 1)).padStart(4, '0')}`;
	const invoiceId = id('INV');
	const message = typeof messageInput === 'function' ? messageInput(number, invoiceId) : messageInput;
	const invoice: Invoice = { id: invoiceId, number, orderId, message, openedAt: now(), kind: snapshot.kind || 'final', paymentId: snapshot.paymentId, amountReceived: Number(snapshot.amountReceived || 0), subtotal: Number(snapshot.subtotal || 0), discount: Number(snapshot.discount || 0), total: Number(snapshot.total || 0), paid: Number(snapshot.paid || 0), balance: Number(snapshot.balance || 0), taskItems: snapshot.taskItems || [], status: snapshot.status || 'draft', sentAt: snapshot.sentAt, billingMode: snapshot.billingMode === 'duration' ? 'duration' : 'manual', discountMode: snapshot.discountMode === 'percent' ? 'percent' : 'amount' };
	await database.prepare('INSERT INTO invoices (id, number, order_id, message_snapshot, opened_at, kind, payment_id, amount_received, subtotal, discount, total, paid, balance, status, sent_at, billing_mode, discount_mode, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(invoice.id, invoice.number, orderId, invoice.message, invoice.openedAt, invoice.kind, invoice.paymentId || null, invoice.amountReceived, invoice.subtotal, invoice.discount, invoice.total, invoice.paid, invoice.balance, invoice.status, invoice.sentAt || null, invoice.billingMode, invoice.discountMode, invoice.openedAt).run();
	if (invoice.taskItems?.length) await database.batch(invoice.taskItems.map((item) => database.prepare('INSERT INTO invoice_task_items (invoice_id, task_id, task_name, amount) VALUES (?, ?, ?, ?)').bind(invoice.id, item.taskId, item.name, item.amount)));
	await activity(database, 'admin', invoice.kind === 'advance' ? 'Advance invoice generated' : invoice.kind === 'payment' ? 'Payment invoice generated' : invoice.kind === 'partial' ? 'Partial work invoice generated' : 'Invoice generated', 'invoice', invoice.id, `${number}${invoice.kind === 'partial' ? ` · ${invoice.taskItems?.length || 0} task(s)` : ''}`);
	await queueSheetSync(database, 'Invoices', invoice.id, invoice);
	return invoice;
}

export async function listInvoices(database: AppDatabase) {
	const invoiceRows = await rows(database, 'SELECT * FROM invoices ORDER BY created_at DESC');
	const itemRows = await rows(database, 'SELECT * FROM invoice_task_items ORDER BY invoice_id, task_name');
	return invoiceRows.map((row): Invoice => ({ id: row.id, number: row.number, orderId: row.order_id, message: row.message_snapshot, openedAt: row.opened_at, kind: row.kind === 'advance' ? 'advance' : row.kind === 'payment' ? 'payment' : row.kind === 'partial' ? 'partial' : 'final', paymentId: row.payment_id || undefined, amountReceived: Number(row.amount_received || 0), subtotal: Number(row.subtotal || 0), discount: Number(row.discount || 0), total: Number(row.total || 0), paid: Number(row.paid || 0), balance: Number(row.balance || 0), status: ['sent','paid','cancelled'].includes(row.status) ? row.status : 'draft', sentAt: row.sent_at || undefined, billingMode: row.billing_mode === 'duration' ? 'duration' : 'manual', discountMode: row.discount_mode === 'percent' ? 'percent' : 'amount', taskItems: itemRows.filter((item) => item.invoice_id === row.id).map((item) => ({ taskId: String(item.task_id), name: String(item.task_name), amount: Number(item.amount || 0) })) }));
}

export async function updateInvoiceStatus(database: AppDatabase, invoiceId: string, status: NonNullable<Invoice['status']>) {
	const invoice = await getInvoice(database, invoiceId);
	if (!invoice) return null;
	const sentAt = status === 'sent' ? invoice.sentAt || now() : invoice.sentAt || null;
	await database.prepare('UPDATE invoices SET status = ?, sent_at = ? WHERE id = ?').bind(status, sentAt, invoiceId).run();
	await activity(database, 'admin', `Invoice ${status}`, 'invoice', invoiceId, invoice.number);
	const updated = await getInvoice(database, invoiceId);
	await queueSheetSync(database, 'Invoices', invoiceId, updated);
	return updated;
}

export async function getInvoice(database: AppDatabase, invoiceId: string) {
	return (await listInvoices(database)).find((invoice) => invoice.id === invoiceId) || null;
}

export async function listActivity(database: AppDatabase, entityType?: string, entityId?: string) {
	const activityRows = entityType && entityId ? await rows(database, 'SELECT * FROM activity_logs WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC', [entityType, entityId]) : await rows(database, 'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100');
	return activityRows.map((row): ActivityLog => ({ id: row.id, actor: row.actor, action: row.action, entityType: row.entity_type, entityId: row.entity_id, details: row.details, createdAt: row.created_at }));
}

export async function listNotifications(database: AppDatabase, limit = 12) {
	const activityRows = await rows(database, `SELECT a.*, t.order_id, t.title AS task_title, COALESCE(e.name, a.actor) AS editor_name
		FROM activity_logs a
		JOIN tasks t ON t.id = a.entity_id
		LEFT JOIN editors e ON e.id = a.editor_id
		WHERE a.entity_type = 'task' AND a.editor_id IS NOT NULL AND a.read_at IS NULL
		ORDER BY a.created_at DESC LIMIT ?`, [Math.max(1, Math.min(100, limit))]);
	return activityRows.map((row) => ({ id: row.id, actor: row.actor, action: row.action, entityType: row.entity_type, entityId: row.entity_id, details: row.details, createdAt: row.created_at, path: `/orders/${row.order_id}`, editorId: row.editor_id, editorName: row.editor_name, taskTitle: row.task_title }));
}

export async function markNotificationsRead(database: AppDatabase, editorId?: string) {
	const timestamp = now();
	if (editorId) await database.prepare('UPDATE activity_logs SET read_at = ? WHERE read_at IS NULL AND editor_id = ?').bind(timestamp, editorId).run();
	else await database.prepare('UPDATE activity_logs SET read_at = ? WHERE read_at IS NULL AND editor_id IS NOT NULL').bind(timestamp).run();
}

export async function listOrderActivity(database: AppDatabase, orderId: string) {
	const activityRows = await rows(database, `SELECT * FROM activity_logs WHERE
		(entity_type = 'order' AND entity_id = ?) OR
		(entity_type = 'task' AND entity_id IN (SELECT id FROM tasks WHERE order_id = ?)) OR
		(entity_type = 'payment' AND entity_id IN (SELECT id FROM payments WHERE order_id = ?)) OR
		(entity_type = 'invoice' AND entity_id IN (SELECT id FROM invoices WHERE order_id = ?))
		ORDER BY created_at DESC`, [orderId, orderId, orderId, orderId]);
	return activityRows.map((row): ActivityLog => ({ id: row.id, actor: row.actor, action: row.action, entityType: row.entity_type, entityId: row.entity_id, details: row.details, createdAt: row.created_at }));
}

export async function syncQueueStatus(database: AppDatabase) {
	const status = await database.prepare(`SELECT
		COUNT(*) AS pending,
		COALESCE(SUM(attempts), 0) AS attempts,
		(SELECT last_error FROM sheet_sync_outbox WHERE synced_at IS NULL AND last_error IS NOT NULL ORDER BY updated_at DESC LIMIT 1) AS last_error,
		(SELECT updated_at FROM sheet_sync_outbox WHERE synced_at IS NULL AND last_error IS NOT NULL ORDER BY updated_at DESC LIMIT 1) AS last_attempt_at
		FROM sheet_sync_outbox WHERE synced_at IS NULL`).first<{ pending: number; attempts: number; last_error?: string; last_attempt_at?: string }>();
	return {
		pending: Number(status?.pending || 0),
		attempts: Number(status?.attempts || 0),
		lastError: status?.last_error ? String(status.last_error).slice(0, 800) : '',
		lastAttemptAt: status?.last_attempt_at || ''
	};
}

export async function pendingSyncItems(database: AppDatabase) {
	return rows(database, 'SELECT * FROM sheet_sync_outbox WHERE synced_at IS NULL ORDER BY created_at LIMIT 500');
}

export async function markSyncResult(database: AppDatabase, syncId: string, error?: string) {
	if (error) await database.prepare('UPDATE sheet_sync_outbox SET attempts = attempts + 1, last_error = ?, updated_at = ? WHERE id = ?').bind(error, now(), syncId).run();
	else await database.prepare('UPDATE sheet_sync_outbox SET attempts = attempts + 1, last_error = NULL, synced_at = ?, updated_at = ? WHERE id = ?').bind(now(), now(), syncId).run();
}
