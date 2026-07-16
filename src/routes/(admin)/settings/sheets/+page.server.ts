import { customers, editors, orders } from '$lib/data';
import { readSheetValues } from '$lib/server/googleSheets';

const definitions = [
	{ name: 'Customers', columns: ['Customer ID', 'Name', 'Business', 'Phone', 'Email', 'Projects', 'Pending'], demo: customers.map((c) => [c.id, c.name, c.business, c.phone, c.email, c.projects, c.pending]) },
	{ name: 'Orders', columns: ['S', 'Studio Name', 'Mobile No.', 'Event', 'Names', 'Receiving', 'Duration', 'Amount', 'Advance', 'Balance', 'Source', 'Assigned Name', 'Remark'], demo: orders.map((o) => [o.id, o.customer, o.mobile ?? '', o.workType, o.project, o.receiving ?? '', o.duration ?? '', o.price, o.paid, o.price - o.paid, o.source ?? '', o.assignedTo ?? '', o.remarks ?? '']) },
	{ name: 'Tasks', columns: ['Task ID', 'Order ID', 'Task', 'Editor', 'Due date', 'Progress', 'Status'], demo: orders.flatMap((o) => o.tasks.map((t) => [t.id, o.id, t.name, t.assignee, t.due, `${t.progress}%`, t.status])) },
	{ name: 'Editors', columns: ['Editor ID', 'Name', 'Speciality', 'Phone', 'Active tasks', 'Availability'], demo: editors.map((e) => [e.id, e.name, e.specialty, e.phone, e.activeTasks, e.available ? 'Available' : 'At capacity']) },
	{ name: 'Invoices', columns: ['Invoice ID', 'Order ID', 'Customer', 'Project', 'Total', 'Paid', 'Balance', 'Status'], demo: orders.map((o) => [`INV-${o.id.slice(-4)}`, o.id, o.customer, o.project, o.price, o.paid, o.price - o.paid, o.paid === o.price ? 'Paid' : o.paid ? 'Partially paid' : 'Unpaid']) },
	{ name: 'Payments', columns: ['Payment ID', 'Invoice ID', 'Customer', 'Amount', 'Date', 'Method'], demo: orders.filter((o) => o.paid > 0).map((o, i) => [`PAY-00${i + 1}`, `INV-${o.id.slice(-4)}`, o.customer, o.paid, '15 Jul 2026', i % 2 ? 'UPI' : 'Bank transfer']) },
	{ name: 'Activity Logs', columns: ['Time', 'Action', 'Entity', 'Details'], demo: [['15 Jul, 11:42', 'Task updated', 'TSK-102', 'Colour correction · 70%'], ['14 Jul, 16:08', 'Task approved', 'TSK-101', 'Culling approved by admin'], ['12 Jul, 14:10', 'Order assigned', 'ORD-2026-0041', 'Editors notified on WhatsApp']] },
	{ name: 'Settings', columns: ['Key', 'Value'], demo: [['Studio name', 'Anjana Creations'], ['Google Sheets sync', 'Demo mode'], ['WhatsApp notifications', 'Demo mode'], ['Default currency', 'INR']] }
];

export const load = async () => {
	const liveResults = await Promise.all(definitions.map(async (sheet) => {
		try { return await readSheetValues(sheet.name); } catch { return null; }
	}));
	const live = liveResults.some((result) => result !== null);
	return {
		live,
		sheets: definitions.map((sheet, index) => {
			const values = liveResults[index];
			if (values && values.length > 0) return { name: sheet.name, columns: values[0].map(String), rows: values.slice(1).map((row) => row.map(String)) };
			return { name: sheet.name, columns: sheet.columns, rows: sheet.demo.map((row) => row.map(String)) };
		})
	};
};
