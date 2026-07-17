import { json } from '@sveltejs/kit';
import { verifySession } from '$lib/server/auth';
import { readyDatabase } from '$lib/server/db';
import { getOrder, getSettings, listCustomers, recordInvoice, regenerateCustomerToken } from '$lib/server/repository';
import { applicationUrl, invoiceMessage, whatsappUrl } from '$lib/server/whatsapp';
import { flushSheetSync } from '$lib/server/googleSheets';
import { money } from '$lib/data';

export const POST = async ({ params, request, cookies, locals, url }) => {
	if (!await verifySession(cookies.get('studioflow_session'))) return json({ error: 'Unauthorized' }, { status: 401 });
	const database = await readyDatabase(locals.tenant);
	const order = await getOrder(database, params.id);
	if (!order) return json({ error: 'Order not found' }, { status: 404 });
	const input = await request.json().catch(() => ({})) as { kind?: 'advance' | 'payment' | 'partial' | 'final'; paymentId?: string; taskIds?: string[] };
	const requestedKind = input.kind === 'advance' ? 'advance' : input.kind === 'payment' ? 'payment' : input.kind === 'partial' ? 'partial' : 'final';
	const payment = input.paymentId ? order.payments?.find((item) => item.id === input.paymentId) : undefined;
	if (input.paymentId && !payment) return json({ error: 'Payment record not found.' }, { status: 404 });
	const kind = payment?.kind || requestedKind;
	if (kind === 'final' && order.priceSet === false) return json({ error: 'Set the total amount before generating the final invoice.' }, { status: 400 });
	const requestedTaskIds = new Set(Array.isArray(input.taskIds) ? input.taskIds : []);
	const partialTasks = kind === 'partial' ? order.tasks.filter((task) => !task.archived && task.status === 'Completed' && (requestedTaskIds.size === 0 || requestedTaskIds.has(task.id)) && Number(task.billableAmount || 0) - Number(task.invoicedAmount || 0) > 0.009) : [];
	if (kind === 'partial' && !partialTasks.length) return json({ error: 'No completed uninvoiced task has a billable value. Edit the completed task and add its value first.' }, { status: 400 });
	const customers = await listCustomers(database, true);
	const customer = customers.find((item) => item.id === order.customerId)
		|| customers.find((item) => item.business === order.customer && item.phone.replace(/\D/g, '') === order.mobile?.replace(/\D/g, ''));
	if (customer && !customer.token && !customer.archived) customer.token = await regenerateCustomerToken(database, customer.id) || undefined;
	const settings = await getSettings(database);
	const total = order.priceSet === false ? 0 : Math.max(0, order.price - order.discount);
	const taskItems = partialTasks.map((task) => ({ taskId: task.id, name: task.name, amount: Math.max(0, Number(task.billableAmount || 0) - Number(task.invoicedAmount || 0)) }));
	const partialTotal = taskItems.reduce((sum, item) => sum + item.amount, 0);
	const invoice = await recordInvoice(database, order.id, (number) => {
		if (kind !== 'partial') return invoiceMessage(settings, number, order, customer?.token || '', url.origin, { kind, amount: payment?.amount }, locals.tenant!.slug);
		const portalLink = customer?.token ? `${applicationUrl(url.origin)}/portal/${locals.tenant!.slug}/customer/${customer.token}` : '';
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
			`Partial invoice amount: ${money(partialTotal)}`,
			order.priceSet === false ? 'Overall order total: To be confirmed' : `Overall order total: ${money(total)}`,
			`Payments collected: ${money(order.paid)}`,
			order.priceSet === false ? '' : `Overall order balance: ${money(Math.max(0, total - order.paid))}`,
			settings.paymentNote,
			portalLink ? `View work status and bill:\n${portalLink}` : '',
			settings.invoiceFooter
		].filter(Boolean).join('\n');
	}, {
		kind, paymentId: payment?.id, amountReceived: payment?.amount || 0,
		subtotal: kind === 'partial' ? partialTotal : order.priceSet === false ? 0 : order.price,
		discount: kind === 'partial' ? 0 : order.discount,
		total: kind === 'partial' ? partialTotal : total,
		paid: kind === 'partial' ? 0 : order.paid,
		balance: kind === 'partial' ? partialTotal : order.priceSet === false ? 0 : Math.max(0, total - order.paid),
		taskItems
	});
	await flushSheetSync(database, locals.tenant!);
	return json({ ok: true, invoice, invoiceUrl: `/invoices/${invoice.id}`, url: order.mobile ? whatsappUrl(order.mobile, invoice.message) : '' });
};
