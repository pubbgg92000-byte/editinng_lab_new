import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getSettings, listActivity, listCustomers, listEditors, listInvoices, listOrders } from '$lib/server/repository';
import * as XLSX from 'xlsx';

export const GET = async ({ cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return new Response('Unauthorized', { status: 401 });
	const database = await readyDatabase(platform);
	const [orders, customers, editors, invoices, activity, settings] = await Promise.all([listOrders(database), listCustomers(database, true), listEditors(database, true), listInvoices(database), listActivity(database), getSettings(database)]);
	const workbook = XLSX.utils.book_new();
	const append = (name: string, records: unknown[]) => XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(records), name);
	append('Orders', orders.map((order) => ({ S: order.serial, 'Studio Name': order.customer, 'Mobile No.': order.mobile, Event: order.workType, Names: order.project, Receiving: order.receiving, Duration: order.duration, Amount: order.priceSet === false ? '' : order.price, Advance: order.advanceSet === false && !(order.payments || []).length ? '' : order.paid, Balance: order.priceSet === false ? '' : Math.max(0, order.price - order.paid), Source: order.source, 'Assigned Names': [...new Set(order.tasks.filter((task) => !task.archived).map((task) => task.assignee))].join(', '), Remark: order.remarks, Important: order.important ? 'Yes' : '', Status: order.status })));
	append('Customers', customers);
	append('Editors', editors.map(({ token: _token, ...editor }) => editor));
	append('Tasks', orders.flatMap((order) => order.tasks.map((task) => ({ ...task, orderId: order.id, serial: order.serial, project: order.project }))));
	append('Payments', orders.flatMap((order) => order.payments || []));
	append('Invoices', invoices);
	append('Activity Logs', activity);
	append('Settings', Object.entries(settings).map(([key, value]) => ({ key, value })));
	const file = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
	return new Response(file, { headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'content-disposition': 'attachment; filename="anjana-creations-workbook.xlsx"' } });
};
