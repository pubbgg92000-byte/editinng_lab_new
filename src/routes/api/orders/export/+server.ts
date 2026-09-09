// Export orders as a downloadable XLSX file, filtered by date range or month.
import ExcelJS from 'exceljs';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { listOrdersPage } from '$lib/server/repository';

export const GET = async ({ cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
	}

	// Accept either ?month=YYYY-MM  or  ?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
	let dateFrom = url.searchParams.get('dateFrom') || '';
	let dateTo   = url.searchParams.get('dateTo')   || '';
	const month  = url.searchParams.get('month')    || '';

	if (month) {
		// Expand month to full date range
		const [y, m] = month.split('-').map(Number);
		const last = new Date(y, m, 0).getDate(); // last day of month
		dateFrom = `${month}-01`;
		dateTo   = `${month}-${String(last).padStart(2, '0')}`;
	}

	const status = url.searchParams.get('status') || '';
	const event  = url.searchParams.get('event')  || '';

	const database = await readyDatabase(locals.tenant);

	// Fetch ALL matching orders (large page size, loop if needed)
	const { orders } = await listOrdersPage(database, {
		pageSize: 1000,
		page: 1,
		status,
		event,
		dateFrom,
		dateTo,
	});

	// Build Excel workbook
	const workbook = new ExcelJS.Workbook();
	workbook.creator = 'Editing Lab';
	workbook.created = new Date();

	const sheet = workbook.addWorksheet('Orders', {
		views: [{ state: 'frozen', ySplit: 1 }],
	});

	// ---- Column definitions ----
	sheet.columns = [
		{ header: 'Order No.',    key: 'serial',    width: 12 },
		{ header: 'Customer',     key: 'customer',  width: 24 },
		{ header: 'Mobile',       key: 'mobile',    width: 16 },
		{ header: 'Project',      key: 'project',   width: 28 },
		{ header: 'Event',        key: 'event',     width: 18 },
		{ header: 'Source',       key: 'source',    width: 14 },
		{ header: 'Status',       key: 'status',    width: 16 },
		{ header: 'Assigned To',  key: 'assignedTo',width: 22 },
		{ header: 'Received',     key: 'receiving', width: 14 },
		{ header: 'Duration',     key: 'duration',  width: 14 },
		{ header: 'Due Date',     key: 'due',       width: 14 },
		{ header: 'Total (₹)',    key: 'price',     width: 13 },
		{ header: 'Discount (₹)', key: 'discount',  width: 13 },
		{ header: 'Paid (₹)',     key: 'paid',      width: 13 },
		{ header: 'Balance (₹)',  key: 'balance',   width: 13 },
		{ header: 'Delivered At', key: 'deliveredAt',width: 16 },
		{ header: 'Created At',   key: 'createdAt', width: 20 },
		{ header: 'Remarks',      key: 'remarks',   width: 32 },
	];

	// ---- Style header row ----
	const headerRow = sheet.getRow(1);
	headerRow.eachCell((cell) => {
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1f2e' } };
		cell.font = { bold: true, color: { argb: 'FF00ADB5' }, size: 10 };
		cell.alignment = { vertical: 'middle', horizontal: 'center' };
		cell.border = { bottom: { style: 'thin', color: { argb: 'FF00ADB5' } } };
	});
	headerRow.height = 22;

	// ---- Data rows ----
	orders.forEach((order, idx) => {
		const balance = Math.max(0, order.price - order.discount - order.paid);
		const assignedEditors = [
			...new Map(
				order.tasks
					.filter((t) => !t.archived && t.editorId)
					.map((t) => [t.editorId, t.assignee])
			).values(),
		].join(', ');

		const row = sheet.addRow({
			serial:      `ORD-${String(order.serial).padStart(4, '0')}`,
			customer:    order.customer,
			mobile:      order.mobile,
			project:     order.project,
			event:       order.workType,
			source:      order.source,
			status:      order.status,
			assignedTo:  assignedEditors || '—',
			receiving:   order.receiving,
			duration:    order.duration,
			due:         order.due || '',
			price:       order.priceSet === false ? '' : order.price,
			discount:    order.discount || 0,
			paid:        order.paid,
			balance:     order.priceSet === false ? '' : balance,
			deliveredAt: order.deliveredAt ? order.deliveredAt.slice(0, 10) : '',
			createdAt:   order.createdAt ? order.createdAt.slice(0, 16).replace('T', ' ') : '',
			remarks:     order.remarks,
		});

		// Zebra stripe
		if (idx % 2 === 0) {
			row.eachCell((cell) => {
				cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FF' } };
			});
		}

		// Highlight pending balance in orange
		if (order.priceSet !== false && balance > 0) {
			const balCell = row.getCell('balance');
			balCell.font = { color: { argb: 'FFd97706' }, bold: true };
		}

		row.eachCell((cell) => {
			cell.alignment = { vertical: 'middle' };
			cell.font = cell.font ?? {};
			cell.font.size = 9;
		});
		row.height = 18;
	});

	// ---- Summary row at the bottom ----
	sheet.addRow({});
	const totalOrders = orders.length;
	const totalPaid   = orders.reduce((s, o) => s + o.paid, 0);
	const totalBalance = orders.reduce((s, o) => {
		if (o.priceSet === false) return s;
		return s + Math.max(0, o.price - o.discount - o.paid);
	}, 0);

	const summaryRow = sheet.addRow({
		serial:   `${totalOrders} orders`,
		paid:     totalPaid,
		balance:  totalBalance,
	});
	summaryRow.eachCell((cell) => {
		cell.font = { bold: true, size: 10, color: { argb: 'FF1a1f2e' } };
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe0fdf4' } };
	});

	// ---- Generate buffer ----
	const buffer = await workbook.xlsx.writeBuffer();

	// ---- Build filename ----
	const label = month
		? month
		: dateFrom && dateTo
			? `${dateFrom}_to_${dateTo}`
			: 'all';
	const filename = `orders_${label}.xlsx`;

	return new Response(buffer as ArrayBuffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="${filename}"`,
		},
	});
};
