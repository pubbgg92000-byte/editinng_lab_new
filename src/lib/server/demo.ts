import { clearDatabaseInitialization, readyDatabase } from './db';
import { createPortalToken, hashPortalToken, sealPortalToken } from './tokens';
import { defaultAssignmentTemplate, defaultInvoiceTemplate } from '$lib/messageTemplates';
import type { Tenant } from '$lib/types';

// Resettable fictional workspace. The isDemo guard is the critical safety boundary.
const timestamp = () => new Date().toISOString();

export async function resetDemoTenant(tenant: Tenant) {
	// Destructive by design, but the guard prevents this seed reset from touching a real client.
	if (!tenant.isDemo) throw new Error('Only demo tenants can be reset.');
	const database = await readyDatabase(tenant);
	await database.prepare(`TRUNCATE TABLE invoice_task_items, invoices, payments, tasks, orders, customers, editors, custom_event_options, activity_logs, sheet_sync_outbox, counters, maintenance_runs, settings RESTART IDENTITY CASCADE`).run();
	clearDatabaseInitialization(tenant.databaseUrl);
	await readyDatabase(tenant);

	const now = timestamp();
	const customerTokens = await Promise.all(Array.from({ length: 5 }, async () => {
		const token = createPortalToken();
		return { token, hash: await hashPortalToken(token), cipher: await sealPortalToken(token) };
	}));
	const editorTokens = await Promise.all(Array.from({ length: 4 }, async () => {
		const token = createPortalToken();
		return { token, hash: await hashPortalToken(token), cipher: await sealPortalToken(token) };
	}));

	await database.batch([
		database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'studioName'").bind(tenant.studioName || 'StudioFlow Demo Studio', now),
		database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'logoUrl'").bind(tenant.logoUrl || '', now),
		database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'phone'").bind('+91 00000 00000', now),
		database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'email'").bind('hello@demo.invalid', now),
		database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'address'").bind('Demo workspace · Fictional data only', now),
		database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'assignmentTemplate'").bind(defaultAssignmentTemplate, now),
		database.prepare("UPDATE settings SET value = ?, updated_at = ? WHERE key = 'invoiceTemplate'").bind(defaultInvoiceTemplate, now),

		...[
			['CUS-DEMO-001', 'Aarav Mehta', 'Mehta Wedding Stories', '+91 00000 00001', 'aarav@example.invalid', '', ''],
			['CUS-DEMO-002', 'Mira Kapoor', 'Kapoor Celebrations', '+91 00000 00002', 'mira@example.invalid', '', ''],
			['CUS-DEMO-003', 'Kabir Rao', 'Rao Films', '+91 00000 00003', 'kabir@example.invalid', '', ''],
			['CUS-DEMO-004', 'Diya Shah', 'Shah Family', '+91 00000 00004', 'diya@example.invalid', '', ''],
			['CUS-DEMO-005', 'Archived Client', 'Legacy Demo Studio', '+91 00000 00005', 'legacy@example.invalid', now, '']
		].map((customer, index) => database.prepare('INSERT INTO customers (id, name, business, phone, phone_normalized, email, address, gst, portal_token_hash, portal_token_cipher, projects, pending, created_at, updated_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)')
			.bind(customer[0], customer[1], customer[2], customer[3], String(customer[3]).replace(/\D/g, '').slice(-10), customer[4], 'Demo address', customer[6], customerTokens[index].hash, customerTokens[index].cipher, now, now, customer[5] || null)),

		...[
			['ED-DEMO-001', 'ED-0001', 'Riya Sen', '+91 00000 00101', 'Wedding films', 'available', null],
			['ED-DEMO-002', 'ED-0002', 'Arjun Nair', '+91 00000 00102', 'Colour grading', 'busy', null],
			['ED-DEMO-003', 'ED-0003', 'Nisha Paul', '+91 00000 00103', 'Albums and reels', 'inactive', null],
			['ED-DEMO-004', 'ED-0004', 'Archived Editor', '+91 00000 00104', 'Legacy work', 'inactive', now]
		].map((editor, index) => database.prepare('INSERT INTO editors (id, code, name, phone, phone_normalized, specialty, availability, portal_token_hash, portal_token_cipher, created_at, updated_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
			.bind(editor[0], editor[1], editor[2], editor[3], String(editor[3]).replace(/\D/g, '').slice(-10), editor[4], editor[5], editorTokens[index].hash, editorTokens[index].cipher, now, now, editor[6])),

		...[
			['ORD-DEMO-001', 1001, 'CUS-DEMO-001', 'Mehta Wedding Stories', 'Wedding', 'Aarav & Saanvi', 125000, 15000, 25000, 'Received', 5, '', 0, null, null],
			['ORD-DEMO-002', 1002, 'CUS-DEMO-001', 'Mehta Wedding Stories', 'Pre-wedding', 'Jaipur Film', 65000, 0, 15000, 'Assigned', 15, '', 0, null, null],
			['ORD-DEMO-003', 1003, 'CUS-DEMO-002', 'Kapoor Celebrations', 'Wedding', 'Mira & Dev', 180000, 10000, 50000, 'Editing', 45, '', 1, null, null],
			['ORD-DEMO-004', 1004, 'CUS-DEMO-002', 'Kapoor Celebrations', 'Reception', 'Reception Highlights', 85000, 0, 30000, 'Waiting Review', 75, '', 0, null, null],
			['ORD-DEMO-005', 1005, 'CUS-DEMO-003', 'Rao Films', 'Corporate', 'Brand Launch', 95000, 5000, 45000, 'Revision', 82, '', 0, null, null],
			['ORD-DEMO-006', 1006, 'CUS-DEMO-004', 'Shah Family', 'Birthday', 'Anaya Turns Five', 40000, 0, 20000, 'Ready Delivery', 100, '', 0, null, now],
			['ORD-DEMO-007', 1007, 'CUS-DEMO-004', 'Shah Family', 'Wedding', 'Shah Wedding Archive', 70000, 0, 70000, 'Delivered', 100, 'digital', 0, now, now],
			['ORD-DEMO-008', 1008, 'CUS-DEMO-005', 'Legacy Demo Studio', 'Historical', 'Imported 2024 Project', 30000, 0, 30000, 'Historical', 100, '', 0, null, null],
			['ORD-DEMO-009', 1009, 'CUS-DEMO-003', 'Rao Films', 'Commercial', 'Archived Campaign', 50000, 0, 10000, 'Stopped', 30, '', 0, null, null]
		].map((order, index) => database.prepare('INSERT INTO orders (id, serial, customer_id, customer_name, mobile, event, project, receiving, duration, amount, discount, advance, source, remarks, due_date, status, progress, historical, amount_set, advance_set, important, delivery_method, delivered_at, customer_notified_at, created_at, updated_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?)')
			.bind(order[0], order[1], order[2], order[3], `+91 00000 0000${(index % 5) + 1}`, order[4], order[5], 'Google Drive', '5–8 min', order[6], order[7], order[8], 'Referral', 'Fictional demo record', '2026-08-15', order[9], order[10], order[9] === 'Historical' ? 1 : 0, order[12], order[11], order[13], order[14], now, now, order[0] === 'ORD-DEMO-009' ? now : null)),

		...[
			['TSK-DEMO-001', 'ORD-DEMO-001', null, 'Organise footage', 'Not started', 0, 0, '', '', 'manual', 0, 0],
			['TSK-DEMO-002', 'ORD-DEMO-002', 'ED-DEMO-001', 'Cinematic teaser', 'Files downloaded', 10, 12000, '', 'HD-1', 'manual', 0, 0],
			['TSK-DEMO-003', 'ORD-DEMO-003', 'ED-DEMO-002', 'Main wedding film', 'In progress', 45, 45000, '', 'HD-2', 'duration', 12000, 225],
			['TSK-DEMO-004', 'ORD-DEMO-004', 'ED-DEMO-001', 'Reception highlights', 'Ready for review', 75, 25000, '', 'HD-3', 'manual', 0, 0],
			['TSK-DEMO-005', 'ORD-DEMO-005', 'ED-DEMO-002', 'Revision pass', 'Revision required', 82, 18000, '', 'HD-2', 'manual', 0, 0],
			['TSK-DEMO-006', 'ORD-DEMO-006', 'ED-DEMO-003', 'Birthday highlight', 'Completed', 100, 20000, 'https://example.com/demo-output', 'HD-4', 'manual', 0, 0],
			['TSK-DEMO-007', 'ORD-DEMO-007', 'ED-DEMO-001', 'Archive delivery', 'Completed', 100, 35000, 'https://example.com/demo-delivery', 'HD-1', 'duration', 10000, 210],
			['TSK-DEMO-008', 'ORD-DEMO-003', null, 'Social media reel', 'Not started', 0, 8000, '', '', 'manual', 0, 0]
		].map((task) => database.prepare('INSERT INTO tasks (id, order_id, editor_id, title, instructions, due_date, text_link, image_url, status, progress, output_link, notes, billable_amount, device, billing_mode, hourly_rate, video_duration_minutes, created_at, updated_at, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)')
			.bind(task[0], task[1], task[2], task[3], 'Use this record to explore the complete workflow.', '2026-08-10', 'https://example.com/demo-reference', '', task[4], task[5], task[7], '', task[6], task[8], task[9], task[10], task[11], now, now)),

		database.prepare('INSERT INTO payments (id, order_id, amount, paid_at, method, note, kind, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind('PAY-DEMO-001', 'ORD-DEMO-003', 25000, '2026-07-10', 'UPI', 'Second payment', 'payment', now),
		database.prepare('INSERT INTO payments (id, order_id, amount, paid_at, method, note, kind, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind('PAY-DEMO-002', 'ORD-DEMO-006', 20000, '2026-07-12', 'Bank transfer', 'Balance payment', 'payment', now),
		database.prepare('INSERT INTO invoices (id, number, order_id, message_snapshot, opened_at, created_at, kind, amount_received, subtotal, discount, total, paid, balance, status, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind('INV-DEMO-001', 'INV-2026-1001', 'ORD-DEMO-003', 'Demo partial invoice', now, now, 'partial', 0, 45000, 0, 45000, 0, 45000, 'sent', now),
		database.prepare('INSERT INTO invoice_task_items (invoice_id, task_id, task_name, amount) VALUES (?, ?, ?, ?)').bind('INV-DEMO-001', 'TSK-DEMO-003', 'Main wedding film', 45000),
		database.prepare('INSERT INTO invoices (id, number, order_id, message_snapshot, opened_at, created_at, kind, amount_received, subtotal, discount, total, paid, balance, status, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind('INV-DEMO-002', 'INV-2026-1002', 'ORD-DEMO-007', 'Demo final paid invoice', now, now, 'final', 0, 70000, 0, 70000, 70000, 0, 'paid', now),
		...['Wedding', 'Pre-wedding', 'Reception', 'Corporate', 'Birthday', 'Commercial'].map((name) => database.prepare('INSERT INTO custom_event_options (name, created_at) VALUES (?, ?)').bind(name, now)),
		database.prepare('INSERT INTO counters (name, value) VALUES (?, ?) ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value').bind('editor_serial', 4),
		...[
			['Demo workspace reset', 'settings', 'studio', 'Version 1 demo data restored'],
			['Task updated', 'task', 'TSK-DEMO-003', 'In progress · 45%'],
			['Payment recorded', 'payment', 'PAY-DEMO-002', '₹20,000'],
			['Invoice sent', 'invoice', 'INV-DEMO-001', 'Partial work invoice'],
			['Customer delivery message prepared', 'order', 'ORD-DEMO-006', 'Ready for delivery']
		].map((activity, index) => database.prepare('INSERT INTO activity_logs (id, actor, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(`ACT-DEMO-${index + 1}`, 'demo-admin', activity[0], activity[1], activity[2], activity[3], now))
	]);

	return { customers: 5, editors: 4, orders: 9, tasks: 8, customerTokens: customerTokens.map((item) => item.token), editorTokens: editorTokens.map((item) => item.token) };
}
