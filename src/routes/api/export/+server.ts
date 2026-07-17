import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getSettings, listActivity, listCustomers, listEditors, listInvoices, listOrders } from '$lib/server/repository';
import { buildExportWorkbook } from '$lib/server/exportWorkbook';

export const GET = async ({ cookies, platform }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return new Response('Unauthorized', { status: 401 });
	const database = await readyDatabase(platform);
	const [orders, customers, editors, invoices, activity, settings] = await Promise.all([listOrders(database, true, true), listCustomers(database, true), listEditors(database, true), listInvoices(database), listActivity(database), getSettings(database)]);
	const file = await buildExportWorkbook({ orders, customers, editors, invoices, activity, settings });
	return new Response(file, { headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'content-disposition': 'attachment; filename="anjana-creations-workbook.xlsx"' } });
};
