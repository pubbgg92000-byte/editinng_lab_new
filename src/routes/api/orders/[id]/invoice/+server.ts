import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getOrder, getSettings, listCustomers, recordInvoice, regenerateCustomerToken, updateOrder, updateTask } from '$lib/server/repository';
import { applicationUrl, invoiceMessage, whatsappUrl } from '$lib/server/whatsapp';
import { flushSheetSync } from '$lib/server/googleSheets';
import { money } from '$lib/data';
import { durationBillableAmount } from '$lib/duration';

export const POST = async ({ params, request, cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const existingOrder = await getOrder(database, params.id);
	if (!existingOrder) return json({ error: 'Order not found' }, { status: 404 });
	let order = existingOrder;
	const input = await request.json().catch(() => ({})) as { kind?: 'advance' | 'payment' | 'partial' | 'final'; paymentId?: string; taskIds?: string[]; billingMode?: 'manual' | 'duration'; manualSubtotal?: number; discountMode?: 'percent' | 'amount'; discountValue?: number };
	const requestedKind = input.kind === 'advance' ? 'advance' : input.kind === 'payment' ? 'payment' : input.kind === 'partial' ? 'partial' : 'final';
	const payment = input.paymentId ? order.payments?.find((item) => item.id === input.paymentId) : undefined;
	if (input.paymentId && !payment) return json({ error: 'Payment record not found.' }, { status: 404 });
	const kind = payment?.kind || requestedKind;
	const requestedTaskIds = new Set(Array.isArray(input.taskIds) ? input.taskIds : []);
	const partialTasks = kind === 'partial' ? order.tasks.filter((task) => !task.archived && task.status === 'Completed' && (requestedTaskIds.size === 0 || requestedTaskIds.has(task.id)) && Number(task.billableAmount || 0) - Number(task.invoicedAmount || 0) > 0.009) : [];
	if (kind === 'partial' && !partialTasks.length) return json({ error: 'No completed uninvoiced task has a billable value. Edit the completed task and add its value first.' }, { status: 400 });
	const customers = await listCustomers(database, true);
	const customer = customers.find((item) => item.id === order.customerId)
		|| customers.find((item) => item.business === order.customer && item.phone.replace(/\D/g, '') === order.mobile?.replace(/\D/g, ''));
	if (customer && !customer.token && !customer.archived) customer.token = await regenerateCustomerToken(database, customer.id) || undefined;
	const settings = await getSettings(database);
	let billingMode: 'manual' | 'duration' = input.billingMode === 'duration' ? 'duration' : 'manual';
	let discountMode: 'percent' | 'amount' = input.discountMode === 'percent' ? 'percent' : 'amount';
	let taskItems = partialTasks.map((task) => ({ taskId: task.id, name: task.name, amount: Math.max(0, Number(task.billableAmount || 0) - Number(task.invoicedAmount || 0)) }));
	let subtotal = kind === 'partial' ? taskItems.reduce((sum, item) => sum + item.amount, 0) : order.priceSet === false ? 0 : order.price;
	let discount = kind === 'partial' ? 0 : order.discount;
	if (kind === 'final') {
		if (billingMode === 'duration') {
			const durationTasks = order.tasks.filter((task) => !task.archived && Number(task.videoDurationMinutes || 0) > 0 && Number(task.hourlyRate || 0) > 0);
			if (!durationTasks.length) return json({ error: 'No task has both an editor duration and hourly rate.' }, { status: 400 });
			taskItems = durationTasks.map((task) => ({ taskId: task.id, name: `${task.name} · ${task.videoDurationMinutes} min`, amount: durationBillableAmount(task.hourlyRate, task.videoDurationMinutes) }));
			subtotal = taskItems.reduce((sum, item) => sum + item.amount, 0);
			for (const task of durationTasks) await updateTask(database, task.id, { billingMode: 'duration', hourlyRate: task.hourlyRate, videoDurationMinutes: task.videoDurationMinutes });
		} else {
			subtotal = Math.max(0, Number(input.manualSubtotal ?? order.price));
			taskItems = [];
		}
		const discountValue = Math.max(0, Number(input.discountValue || 0));
		if (discountMode === 'percent' && discountValue > 100) return json({ error: 'Discount percentage cannot exceed 100%.' }, { status: 400 });
		discount = discountMode === 'percent' ? Math.round(subtotal * discountValue / 100 * 100) / 100 : discountValue;
		if (discount > subtotal) return json({ error: 'Discount cannot be greater than the subtotal.' }, { status: 400 });
		if (subtotal - discount + 0.009 < order.paid) return json({ error: 'Invoice total cannot be below payments already collected.' }, { status: 400 });
		const updatedOrder = await updateOrder(database, order.id, { price: subtotal, discount, priceSet: true });
		if (!updatedOrder) return json({ error: 'Unable to save invoice billing.' }, { status: 400 });
		order = updatedOrder;
	}
	const total = Math.max(0, subtotal - discount);
	const invoice = await recordInvoice(database, order.id, (number, invoiceId) => {
		const portalLink = customer?.token ? `${applicationUrl(url.origin)}/portal/${locals.tenant!.slug}/customer/${customer.token}` : '';
		const invoiceLink = customer?.token ? `${portalLink}/invoice/${invoiceId}` : '';
		if (kind !== 'partial') return invoiceMessage(settings, number, order, customer?.token || '', url.origin, { kind, amount: payment?.amount, invoiceUrl: invoiceLink }, locals.tenant!.slug);
		return [
			settings.studioName,
			`Partial work invoice: ${number}`,
			'',
			`Customer: ${order.customer}`,
			`Project: ${order.project}`,
			'',
			'Completed work billed:',
			...taskItems.map((item, index) => `${index + 1}. ${item.name} — ${money(item.amount)}`),
			'',
			`Partial invoice amount: ${money(total)}`,
			order.priceSet === false ? 'Overall order total: To be confirmed' : `Overall order total: ${money(Math.max(0, order.price - order.discount))}`,
			`Payments collected: ${money(order.paid)}`,
			order.priceSet === false ? '' : `Overall order balance: ${money(Math.max(0, order.price - order.discount - order.paid))}`,
			settings.paymentNote,
			invoiceLink ? `Open invoice / print PDF:\n${invoiceLink}` : portalLink ? `View work status and bill:\n${portalLink}` : '',
			settings.invoiceFooter
		].filter(Boolean).join('\n');
	}, {
		kind, paymentId: payment?.id, amountReceived: payment?.amount || 0,
		subtotal,
		discount,
		total,
		paid: kind === 'partial' ? 0 : order.paid,
		balance: kind === 'partial' ? total : Math.max(0, total - order.paid),
		taskItems,
		billingMode,
		discountMode
	});
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, invoice, invoiceUrl: `/invoices/${invoice.id}`, url: order.mobile ? whatsappUrl(order.mobile, invoice.message) : '' });
};
