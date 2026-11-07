// Business analytics: money collected, outstanding balance, order volume, delivery speed,
// status mix, top customers, categories, and staff workload. All aggregation is server-side
// so the page receives small, ready-to-draw numbers. Months are calendar months in IST.
import { readyDatabase } from '$lib/server/db';
import { listOrders } from '$lib/server/repository';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability } from '$lib/capabilities';

const istDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
const monthKey = (value?: string | null) => {
	if (!value) return '';
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(0, 7);
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '' : istDate.format(date).slice(0, 7);
};
const shiftMonth = (key: string, delta: number) => {
	const [year, month] = key.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1 + delta, 1));
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const load = async ({ locals, url }) => {
	const database = await readyDatabase(locals.tenant);
	const configuration = await getTenantConfiguration(database, locals.tenant!);
	const capabilities = configuration.effectiveCapabilities;
	const range = [3, 6, 12].includes(Number(url.searchParams.get('months'))) ? Number(url.searchParams.get('months')) : 6;

	const all = await listOrders(database, true, false);
	const live = all.filter((order) => !order.historical && order.status !== 'Historical');

	const thisMonth = istDate.format(new Date()).slice(0, 7);
	const months = Array.from({ length: range }, (_, index) => shiftMonth(thisMonth, index - range + 1));
	const inRange = new Set(months);

	const collected = Object.fromEntries(months.map((key) => [key, 0]));
	const created = Object.fromEntries(months.map((key) => [key, 0]));
	let collectedThisMonth = 0;
	let collectedLastMonth = 0;
	const lastMonth = shiftMonth(thisMonth, -1);
	for (const order of all) {
		for (const payment of order.payments || []) {
			const key = monthKey(payment.paidAt);
			const amount = Number(payment.amount || 0);
			if (inRange.has(key)) collected[key] += amount;
			if (key === thisMonth) collectedThisMonth += amount;
			if (key === lastMonth) collectedLastMonth += amount;
		}
	}
	for (const order of live) {
		const key = monthKey(order.createdAt);
		if (inRange.has(key)) created[key] += 1;
	}

	const outstanding = live
		.filter((order) => order.priceSet !== false && !['Stopped'].includes(order.status))
		.reduce((sum, order) => sum + Math.max(0, order.price - order.discount - order.paid), 0);
	const activeCount = live.filter((order) => !['Delivered', 'Completed', 'Stopped'].includes(order.status)).length;

	// Average days from order received to delivered, for orders delivered within the range.
	const turnaround = live
		.filter((order) => order.deliveredAt && order.createdAt && inRange.has(monthKey(order.deliveredAt)))
		.map((order) => (new Date(order.deliveredAt!).getTime() - new Date(order.createdAt!).getTime()) / 86_400_000)
		.filter((days) => Number.isFinite(days) && days >= 0);
	const avgDeliveryDays = turnaround.length ? Math.round((turnaround.reduce((a, b) => a + b, 0) / turnaround.length) * 10) / 10 : null;

	const statusOrder = ['Received', 'Assigned', 'Editing', 'Waiting Review', 'Revision', 'Ready Delivery', 'Delivered', 'Completed', 'Stopped'];
	const statusCounts = statusOrder
		.map((status) => ({ status, count: live.filter((order) => order.status === status).length }))
		.filter((row) => row.count > 0);

	const rangeOrders = live.filter((order) => inRange.has(monthKey(order.createdAt)));
	const byCustomer = new Map<string, { name: string; billed: number; orders: number }>();
	for (const order of rangeOrders) {
		const key = order.customerId || order.customer;
		const row = byCustomer.get(key) || { name: order.customer || 'Unknown', billed: 0, orders: 0 };
		row.orders += 1;
		if (order.priceSet !== false) row.billed += Math.max(0, order.price - order.discount);
		byCustomer.set(key, row);
	}
	const topCustomers = [...byCustomer.values()].sort((a, b) => b.billed - a.billed || b.orders - a.orders).slice(0, 6);

	const byCategory = new Map<string, number>();
	for (const order of rangeOrders) {
		const key = order.workType?.trim() || 'Not set';
		byCategory.set(key, (byCategory.get(key) || 0) + 1);
	}
	const categories = [...byCategory.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);

	const byStaff = new Map<string, { name: string; active: number; done: number }>();
	for (const order of live) {
		for (const task of order.tasks) {
			if (task.archived || !task.editorId) continue;
			const row = byStaff.get(task.editorId) || { name: task.assignee || 'Unknown', active: 0, done: 0 };
			if (task.status === 'Completed') row.done += 1;
			else row.active += 1;
			byStaff.set(task.editorId, row);
		}
	}
	const staffLoad = [...byStaff.values()].sort((a, b) => b.active - a.active || b.done - a.done).slice(0, 8);

	return {
		range,
		months,
		thisMonth,
		paymentsEnabled: hasCapability(capabilities, 'billing.payments'),
		staffEnabled: hasCapability(capabilities, 'work.staff'),
		collectedSeries: months.map((key) => ({ key, value: collected[key] })),
		createdSeries: months.map((key) => ({ key, value: created[key] })),
		collectedThisMonth,
		collectedLastMonth,
		outstanding,
		activeCount,
		ordersThisMonth: created[thisMonth] ?? 0,
		avgDeliveryDays,
		deliveredInRange: turnaround.length,
		statusCounts,
		topCustomers,
		categories,
		staffLoad
	};
};
