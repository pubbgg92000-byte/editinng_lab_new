import type { ActivityLog, Customer, Editor, EditorAvailability, Order, Payment, StudioSettings, Task, TaskStatus } from '$lib/types';
import { createPortalToken, hashPortalToken, openPortalToken, sealPortalToken } from './tokens';
import { defaultAssignmentTemplate, defaultInvoiceTemplate } from '$lib/messageTemplates';

type Row = Record<string, any>;
const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

async function rows(database: AppDatabase, query: string, values: unknown[] = []) {
	return (await database.prepare(query).bind(...values).all<Row>()).results ?? [];
}

async function activity(database: AppDatabase, actor: string, action: string, entityType: string, entityId: string, details = '') {
	const record = { id: id('ACT'), actor, action, entityType, entityId, details, createdAt: now() };
	await database.prepare('INSERT INTO activity_logs (id, actor, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(record.id, actor, action, entityType, entityId, details, record.createdAt).run();
	await queueSheetSync(database, 'Activity Logs', record.id, record);
}

export async function recordActivity(database: AppDatabase, actor: string, action: string, entityType: string, entityId: string, details = '') {
	await activity(database, actor, action, entityType, entityId, details);
}

export async function queueSheetSync(database: AppDatabase, entityType: string, entityId: string, payload: unknown, operation = 'upsert') {
	const timestamp = now();
	await database.prepare('INSERT INTO sheet_sync_outbox (id, entity_type, entity_id, operation, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id('SYNC'), entityType, entityId, operation, JSON.stringify(payload), timestamp, timestamp).run();
}

function customerFrom(row: Row): Customer {
	return { id: row.id, name: row.name, business: row.business, phone: row.phone, email: row.email, address: row.address, gst: row.gst, projects: Number(row.projects ?? 0), pending: Number(row.pending ?? 0), archived: Boolean(row.archived_at) };
}

function editorFrom(row: Row): Editor {
	const availability = row.availability as EditorAvailability;
	return { id: row.id, name: row.name, initials: initials(row.name), specialty: row.specialty, phone: row.phone, activeTasks: Number(row.active_tasks ?? 0), available: availability === 'available', availability, archived: Boolean(row.archived_at) };
}

function taskFrom(row: Row): Task {
	return { id: row.id, orderId: row.order_id, name: row.title, assignee: row.editor_name || 'Unassigned', editorId: row.editor_id || undefined, status: row.status, progress: Number(row.progress), due: row.due_date, instructions: row.instructions, textLink: row.text_link, imageUrl: row.image_url, outputLink: row.output_link, notes: row.notes, archived: Boolean(row.archived_at) };
}

function paymentFrom(row: Row): Payment {
	return { id: row.id, orderId: row.order_id, amount: Number(row.amount), paidAt: row.paid_at, method: row.method, note: row.note };
}

function orderFrom(row: Row, orderTasks: Task[] = [], orderPayments: Payment[] = []): Order {
	const paid = Number(row.advance) + orderPayments.reduce((sum, payment) => sum + payment.amount, 0);
	return { id: row.id, serial: Number(row.serial), customerId: row.customer_id || undefined, customer: row.customer_name, mobile: row.mobile, workType: row.event, project: row.project, receiving: row.receiving, duration: row.duration, price: Number(row.amount), paid, priceSet: Boolean(row.amount_set), advanceSet: Boolean(row.advance_set), source: row.source, remarks: row.remarks, due: row.due_date, status: row.status, progress: Number(row.progress), files: 0, fileLink: '', color: '#00ADB5', tasks: orderTasks, payments: orderPayments, important: Boolean(row.important), historical: Boolean(row.historical) };
}

export async function getSettings(database: AppDatabase): Promise<StudioSettings> {
	const values = Object.fromEntries((await rows(database, 'SELECT key, value FROM settings')).map((row) => [row.key, row.value]));
	return { studioName: values.studioName || 'Anjana Creations', address: values.address || '', phone: values.phone || '', email: values.email || '', gstin: values.gstin || '', paymentNote: values.paymentNote || '', invoiceFooter: values.invoiceFooter || '', assignmentTemplate: values.assignmentTemplate || defaultAssignmentTemplate, invoiceTemplate: values.invoiceTemplate || defaultInvoiceTemplate, themePalette: values.themePalette || 'graphite-aqua', themeDefaultMode: values.themeDefaultMode === 'dark' ? 'dark' : 'light' } as StudioSettings;
}

export async function updateSettings(database: AppDatabase, input: Partial<StudioSettings>) {
	const timestamp = now();
	await database.batch(Object.entries(input).map(([key, value]) => database.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind(key, String(value ?? ''), timestamp)));
	const settings = await getSettings(database);
	await activity(database, 'admin', 'Settings updated', 'settings', 'studio', Object.keys(input).join(', '));
	await queueSheetSync(database, 'Settings', 'studio', settings);
	return settings;
}

export async function listCustomers(database: AppDatabase, includeArchived = false) {
	const customerRows = await rows(database, `SELECT c.*,
		(SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS projects,
		COALESCE((SELECT SUM(CASE WHEN o.amount - o.advance - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.order_id = o.id), 0) > 0 THEN o.amount - o.advance - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.order_id = o.id), 0) ELSE 0 END) FROM orders o WHERE o.customer_id = c.id), 0) AS pending
		FROM customers c ${includeArchived ? '' : 'WHERE c.archived_at IS NULL'} ORDER BY c.business`);
	const customers = customerRows.map(customerFrom);
	for (const customer of customers) {
		const source = customerRows.find((row) => row.id === customer.id);
		customer.token = await openPortalToken(source?.portal_token_cipher);
	}
	return customers;
}

export async function createCustomer(database: AppDatabase, input: Partial<Customer>) {
	const timestamp = now();
	const token = createPortalToken();
	const customer: Customer = { id: id('CUST'), name: String(input.name || '').trim(), business: String(input.business || input.name || '').trim(), phone: String(input.phone || '').trim(), email: String(input.email || '').trim(), address: input.address || '', gst: input.gst || '', projects: 0, pending: 0, token };
	await database.prepare('INSERT INTO customers (id, name, business, phone, email, address, gst, portal_token_hash, portal_token_cipher, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(customer.id, customer.name, customer.business, customer.phone, customer.email, customer.address, customer.gst, await hashPortalToken(token), await sealPortalToken(token), timestamp, timestamp).run();
	await activity(database, 'admin', 'Customer created', 'customer', customer.id, customer.business);
	await queueSheetSync(database, 'Customers', customer.id, customer);
	return customer;
}

export async function updateCustomer(database: AppDatabase, customerId: string, input: Partial<Customer>) {
	const existing = await database.prepare('SELECT * FROM customers WHERE id = ? AND archived_at IS NULL').bind(customerId).first<Row>();
	if (!existing) return null;
	await database.prepare('UPDATE customers SET name = ?, business = ?, phone = ?, email = ?, address = ?, gst = ?, updated_at = ? WHERE id = ?').bind(input.name ?? existing.name, input.business ?? existing.business, input.phone ?? existing.phone, input.email ?? existing.email, input.address ?? existing.address, input.gst ?? existing.gst, now(), customerId).run();
	const customer = (await listCustomers(database)).find((item) => item.id === customerId)!;
	await activity(database, 'admin', 'Customer updated', 'customer', customerId, customer.business);
	await queueSheetSync(database, 'Customers', customerId, customer);
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

export async function createEditor(database: AppDatabase, input: Partial<Editor>) {
	const timestamp = now();
	const token = createPortalToken();
	const editor: Editor = { id: id('ED'), name: String(input.name || '').trim(), initials: initials(String(input.name || '')), phone: String(input.phone || '').trim(), specialty: String(input.specialty || '').trim(), availability: input.availability || 'available', available: (input.availability || 'available') === 'available', activeTasks: 0, token };
	await database.prepare('INSERT INTO editors (id, name, phone, specialty, availability, portal_token_hash, portal_token_cipher, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(editor.id, editor.name, editor.phone, editor.specialty, editor.availability, await hashPortalToken(token), await sealPortalToken(token), timestamp, timestamp).run();
	await activity(database, 'admin', 'Editor created', 'editor', editor.id, editor.name);
	await queueSheetSync(database, 'Editors', editor.id, editor);
	return editor;
}

export async function updateEditor(database: AppDatabase, editorId: string, input: Partial<Editor>) {
	const existing = await database.prepare('SELECT * FROM editors WHERE id = ?').bind(editorId).first<Row>();
	if (!existing) return null;
	const availability = input.availability || existing.availability;
	await database.prepare('UPDATE editors SET name = ?, phone = ?, specialty = ?, availability = ?, updated_at = ? WHERE id = ?').bind(input.name ?? existing.name, input.phone ?? existing.phone, input.specialty ?? existing.specialty, availability, now(), editorId).run();
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

export async function regenerateEditorToken(database: AppDatabase, editorId: string) {
	const token = createPortalToken();
	await database.prepare('UPDATE editors SET portal_token_hash = ?, portal_token_cipher = ?, updated_at = ? WHERE id = ?').bind(await hashPortalToken(token), await sealPortalToken(token), now(), editorId).run();
	await activity(database, 'admin', 'Editor portal link regenerated', 'editor', editorId);
	return token;
}

export async function findEditorByToken(database: AppDatabase, token: string) {
	const row = await database.prepare(`SELECT e.*, COUNT(CASE WHEN t.archived_at IS NULL AND t.status != 'Completed' THEN 1 END) AS active_tasks FROM editors e LEFT JOIN tasks t ON t.editor_id = e.id WHERE e.portal_token_hash = ? AND e.archived_at IS NULL GROUP BY e.id`).bind(await hashPortalToken(token)).first<Row>();
	return row ? editorFrom(row) : null;
}

export async function listOrders(database: AppDatabase, includeHistorical = true) {
	const orderRows = await rows(database, `SELECT * FROM orders ${includeHistorical ? '' : 'WHERE historical = 0'} ORDER BY serial DESC`);
	const taskRows = await rows(database, `SELECT t.*, e.name AS editor_name FROM tasks t LEFT JOIN editors e ON e.id = t.editor_id ORDER BY t.created_at`);
	const paymentRows = await rows(database, 'SELECT * FROM payments ORDER BY paid_at DESC');
	return orderRows.map((row) => orderFrom(row, taskRows.filter((task) => task.order_id === row.id).map(taskFrom), paymentRows.filter((payment) => payment.order_id === row.id).map(paymentFrom)));
}

export async function getOrder(database: AppDatabase, orderId: string) {
	return (await listOrders(database)).find((order) => order.id === orderId) || null;
}

export async function createOrder(database: AppDatabase, input: Partial<Order>) {
	const timestamp = now();
	const serialRow = await database.prepare("INSERT INTO counters (name, value) SELECT 'order_serial', COALESCE(MAX(serial), 0) + 1 FROM orders ON CONFLICT (name) DO UPDATE SET value = counters.value + 1 RETURNING value AS serial").first<{ serial: number }>();
	const orderId = id('ORD');
	await database.prepare('INSERT INTO orders (id, serial, customer_id, customer_name, mobile, event, project, receiving, duration, amount, advance, amount_set, advance_set, source, remarks, due_date, status, progress, historical, important, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)').bind(orderId, Number(serialRow?.serial || 1), input.customerId || null, input.customer || '', input.mobile || '', input.workType || '', input.project || '', input.receiving || '', input.duration || '', Number(input.price || 0), Number(input.paid || 0), Number(input.priceSet !== false), Number(input.advanceSet !== false), input.source || '', input.remarks || '', input.due || '', 'Received', Number(Boolean(input.important)), timestamp, timestamp).run();
	const order = await getOrder(database, orderId);
	await activity(database, 'admin', 'Order created', 'order', orderId, `${input.customer} · ${input.project}`);
	await queueSheetSync(database, 'Orders', orderId, order);
	return order!;
}

export async function updateOrder(database: AppDatabase, orderId: string, input: Partial<Order>) {
	const existing = await getOrder(database, orderId);
	if (!existing) return null;
	await database.prepare('UPDATE orders SET customer_id = ?, customer_name = ?, mobile = ?, event = ?, project = ?, receiving = ?, duration = ?, amount = ?, advance = ?, source = ?, remarks = ?, due_date = ?, historical = ?, important = ?, updated_at = ? WHERE id = ?').bind(input.customerId ?? existing.customerId ?? null, input.customer ?? existing.customer, input.mobile ?? existing.mobile ?? '', input.workType ?? existing.workType, input.project ?? existing.project, input.receiving ?? existing.receiving ?? '', input.duration ?? existing.duration ?? '', input.price ?? existing.price, input.paid ?? Math.min(existing.paid, existing.price), input.source ?? existing.source ?? '', input.remarks ?? existing.remarks ?? '', input.due ?? existing.due, input.historical === undefined ? Number(existing.historical) : Number(input.historical), input.important === undefined ? Number(existing.important) : Number(input.important), now(), orderId).run();
	const order = await getOrder(database, orderId);
	await activity(database, 'admin', 'Order updated', 'order', orderId, order?.project);
	await queueSheetSync(database, 'Orders', orderId, order);
	return order;
}

export async function createTask(database: AppDatabase, orderId: string, input: Partial<Task>) {
	const timestamp = now();
	const task: Task = { id: id('TSK'), orderId, name: String(input.name || '').trim(), assignee: '', editorId: input.editorId, status: 'Not started', progress: 0, due: input.due || '', instructions: input.instructions || '', textLink: input.textLink || '', imageUrl: input.imageUrl || '', outputLink: '', notes: '' };
	await database.prepare('INSERT INTO tasks (id, order_id, editor_id, title, instructions, due_date, text_link, image_url, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)').bind(task.id, orderId, task.editorId || null, task.name, task.instructions, task.due, task.textLink, task.imageUrl, task.status, timestamp, timestamp).run();
	await updateOrderSummary(database, orderId);
	const saved = (await getOrder(database, orderId))!.tasks.find((item) => item.id === task.id)!;
	await activity(database, 'admin', 'Task assigned', 'task', task.id, `${saved.name} · ${saved.assignee}`);
	await queueSheetSync(database, 'Tasks', task.id, saved);
	return saved;
}

export async function updateTask(database: AppDatabase, taskId: string, input: Partial<Task>, actor = 'admin', editorId?: string) {
	const existing = await database.prepare('SELECT * FROM tasks WHERE id = ? AND archived_at IS NULL').bind(taskId).first<Row>();
	if (!existing || (editorId && existing.editor_id !== editorId)) return null;
	const allowedEditorStatuses: TaskStatus[] = ['Not started', 'Files downloaded', 'In progress', 'Waiting for clarification', 'Ready for review'];
	const status = editorId && input.status && !allowedEditorStatuses.includes(input.status) ? existing.status : input.status ?? existing.status;
	const progress = Math.max(0, Math.min(100, Number(input.progress ?? existing.progress)));
	await database.prepare('UPDATE tasks SET editor_id = ?, title = ?, instructions = ?, due_date = ?, text_link = ?, image_url = ?, status = ?, progress = ?, output_link = ?, notes = ?, updated_at = ? WHERE id = ?').bind(editorId ? existing.editor_id : input.editorId ?? existing.editor_id, input.name ?? existing.title, input.instructions ?? existing.instructions, input.due ?? existing.due_date, input.textLink ?? existing.text_link, input.imageUrl ?? existing.image_url, status, progress, input.outputLink ?? existing.output_link, input.notes ?? existing.notes, now(), taskId).run();
	await updateOrderSummary(database, existing.order_id);
	const task = (await getOrder(database, existing.order_id))!.tasks.find((item) => item.id === taskId)!;
	await activity(database, actor, 'Task updated', 'task', taskId, `${task.status} · ${task.progress}%`);
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
	const taskRows = await rows(database, `SELECT t.*, e.name AS editor_name, o.project, o.customer_name, o.event, o.serial FROM tasks t JOIN orders o ON o.id = t.order_id LEFT JOIN editors e ON e.id = t.editor_id WHERE t.editor_id = ? AND t.archived_at IS NULL AND o.historical = 0 ORDER BY t.due_date, t.created_at`, [editorId]);
	return taskRows.map((row) => ({ ...taskFrom(row), project: row.project, customer: row.customer_name, workType: row.event, serial: row.serial }));
}

export async function updateOrderSummary(database: AppDatabase, orderId: string) {
	const order = await database.prepare('SELECT historical FROM orders WHERE id = ?').bind(orderId).first<{ historical: number }>();
	if (!order) return;
	if (order.historical) {
		await database.prepare("UPDATE orders SET status = 'Historical', progress = 100, updated_at = ? WHERE id = ?").bind(now(), orderId).run();
		return;
	}
	const active = await rows(database, 'SELECT status, progress FROM tasks WHERE order_id = ? AND archived_at IS NULL', [orderId]);
	let status: Order['status'] = 'Received';
	let progress = 0;
	if (active.length) {
		progress = Math.round(active.reduce((sum, task) => sum + Number(task.progress), 0) / active.length);
		if (active.every((task) => task.status === 'Completed')) status = 'Ready Delivery';
		else if (active.some((task) => task.status === 'Revision required')) status = 'Revision';
		else if (active.some((task) => task.status === 'Ready for review')) status = 'Waiting Review';
		else if (active.some((task) => Number(task.progress) > 0 || task.status === 'In progress')) status = 'Editing';
		else status = 'Assigned';
	}
	await database.prepare('UPDATE orders SET status = ?, progress = ?, updated_at = ? WHERE id = ?').bind(status, progress, now(), orderId).run();
	const updated = await getOrder(database, orderId);
	await queueSheetSync(database, 'Orders', orderId, updated);
}

export async function recordPayment(database: AppDatabase, orderId: string, input: Partial<Payment>) {
	const payment: Payment = { id: id('PAY'), orderId, amount: Number(input.amount || 0), paidAt: input.paidAt || new Date().toISOString().slice(0, 10), method: input.method || 'Manual', note: input.note || '' };
	await database.prepare('INSERT INTO payments (id, order_id, amount, paid_at, method, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(payment.id, orderId, payment.amount, payment.paidAt, payment.method, payment.note, now()).run();
	await activity(database, 'admin', 'Payment recorded', 'payment', payment.id, `${payment.amount}`);
	await queueSheetSync(database, 'Payments', payment.id, payment);
	await queueSheetSync(database, 'Orders', orderId, await getOrder(database, orderId));
	return payment;
}

export async function recordInvoice(database: AppDatabase, orderId: string, messageInput: string | ((number: string) => string)) {
	const year = new Date().getFullYear();
	const counter = await database.prepare('INSERT INTO counters (name, value) VALUES (?, 1) ON CONFLICT (name) DO UPDATE SET value = counters.value + 1 RETURNING value').bind(`invoice_${year}`).first<{ value: number }>();
	const number = `INV-${year}-${String(Number(counter?.value || 1)).padStart(4, '0')}`;
	const message = typeof messageInput === 'function' ? messageInput(number) : messageInput;
	const invoice = { id: id('INV'), number, orderId, message, openedAt: now() };
	await database.prepare('INSERT INTO invoices (id, number, order_id, message_snapshot, opened_at, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(invoice.id, invoice.number, orderId, invoice.message, invoice.openedAt, invoice.openedAt).run();
	await activity(database, 'admin', 'Invoice opened in WhatsApp', 'invoice', invoice.id, number);
	await queueSheetSync(database, 'Invoices', invoice.id, invoice);
	return invoice;
}

export async function listInvoices(database: AppDatabase) {
	return (await rows(database, 'SELECT * FROM invoices ORDER BY created_at DESC')).map((row) => ({ id: row.id, number: row.number, orderId: row.order_id, message: row.message_snapshot, openedAt: row.opened_at }));
}

export async function getInvoice(database: AppDatabase, invoiceId: string) {
	return (await listInvoices(database)).find((invoice) => invoice.id === invoiceId) || null;
}

export async function listActivity(database: AppDatabase, entityType?: string, entityId?: string) {
	const activityRows = entityType && entityId ? await rows(database, 'SELECT * FROM activity_logs WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC', [entityType, entityId]) : await rows(database, 'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100');
	return activityRows.map((row): ActivityLog => ({ id: row.id, actor: row.actor, action: row.action, entityType: row.entity_type, entityId: row.entity_id, details: row.details, createdAt: row.created_at }));
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
