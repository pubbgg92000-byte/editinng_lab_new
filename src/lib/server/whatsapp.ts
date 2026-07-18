import { env } from '$env/dynamic/private';
import type { Editor, Order, StudioSettings, Task } from '$lib/types';
import { whatsappNumber } from '$lib/phone';
import { money } from '$lib/data';
import { fillTemplate } from '$lib/messageTemplates';

export const normalizePhone = (phone: string) => whatsappNumber(phone);
export const whatsappUrl = (phone: string, message: string) => `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;

export function applicationUrl(origin?: string) {
	const configured = origin || env.PUBLIC_APP_URL || 'http://localhost:5173';
	try {
		const url = new URL(configured);
		if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) url.protocol = 'http:';
		return url.origin;
	} catch {
		return 'http://localhost:5173';
	}
}

export function editorAssignmentMessage(settings: StudioSettings, editor: Editor, order: Order, tasks: Task[], token: string, origin?: string, tenantSlug = '') {
	const publicUrl = applicationUrl(origin);
	const taskLines = tasks.map((task, index) => `${index + 1}. ${task.name}${task.due ? ` — due ${task.due}` : ''}${task.instructions ? `\n   ${task.instructions}` : ''}${task.textLink ? `\n   Link: ${task.textLink}` : ''}${task.imageUrl ? `\n   Image: ${task.imageUrl}` : ''}`).join('\n');
	return fillTemplate(settings.assignmentTemplate, {
		editor_name: editor.name,
		studio_name: settings.studioName,
		project: order.project,
		customer: order.customer,
		task_list: taskLines,
		portal_link: tenantSlug ? `${publicUrl}/portal/${tenantSlug}/editor/${token}` : `${publicUrl}/editor/${token}`
	});
}

export function invoiceMessage(settings: StudioSettings, invoiceNumber: string, order: Order, customerToken = '', origin?: string, receipt?: { kind?: 'advance' | 'payment' | 'final'; amount?: number }, tenantSlug = '') {
	const publicUrl = applicationUrl(origin);
	const portalLink = customerToken ? (tenantSlug ? `${publicUrl}/portal/${tenantSlug}/customer/${customerToken}` : `${publicUrl}/customer/${customerToken}`) : '';
	const netTotal = Math.max(0, order.price - order.discount);
	const total = order.priceSet === false ? 'To be confirmed' : money(netTotal);
	const paid = order.advanceSet === false && !(order.payments || []).length ? 'Not recorded' : money(order.paid);
	const balance = order.priceSet === false ? 'Will be calculated after total is set' : money(Math.max(0, netTotal - order.paid));
	let message = fillTemplate(settings.invoiceTemplate, {
		studio_name: settings.studioName,
		studio_address: settings.address,
		studio_phone_line: settings.phone ? `\nPhone: ${settings.phone}` : '',
		gstin_line: settings.gstin ? `\nGSTIN: ${settings.gstin}` : '',
		invoice_number: invoiceNumber,
		customer: order.customer,
		project: order.project,
		event: order.workType,
		delivery_date: order.due || 'Not set',
		total: total,
		paid: paid,
		balance: balance,
		payment_note: settings.paymentNote,
		invoice_footer_line: settings.invoiceFooter ? `\n\n${settings.invoiceFooter}` : '',
		portal_link: portalLink
	});
	const additions: string[] = [];
	if (receipt?.kind === 'advance') additions.push(`Advance collected: ${money(receipt.amount || 0)}`);
	else if (receipt?.kind === 'payment') additions.push(`Payment received: ${money(receipt.amount || 0)}`);
	if (order.discount > 0) {
		const discountPercent = order.price > 0 ? order.discount / order.price * 100 : 0;
		additions.push(`Subtotal: ${money(order.price)}\nDiscount (${discountPercent.toFixed(discountPercent % 1 ? 2 : 0)}%): ${money(order.discount)}\nTotal after discount: ${money(netTotal)}`);
	}
	if (additions.length) message = `${message.trimEnd()}\n\n${additions.join('\n')}`;
	if (portalLink && !message.includes(portalLink)) message = `${message.trimEnd()}\n\nTrack your work status:\n${portalLink}`;
	return message;
}

export function customerReadyMessage(settings: StudioSettings, order: Order, customerToken = '', origin?: string, tenantSlug = '') {
	const publicUrl = applicationUrl(origin);
	const portalLink = customerToken ? (tenantSlug ? `${publicUrl}/portal/${tenantSlug}/customer/${customerToken}` : `${publicUrl}/customer/${customerToken}`) : '';
	const netTotal = Math.max(0, order.price - order.discount);
	const balance = Math.max(0, netTotal - order.paid);
	const lines = [
		`Hello ${order.customer},`,
		'',
		`Your work “${order.project}” is ready for delivery.`,
		'',
		`Total: ${order.priceSet === false ? 'To be confirmed' : money(netTotal)}`,
		`Paid / advance: ${order.advanceSet === false && !(order.payments || []).length ? 'Not recorded' : money(order.paid)}`,
		`Balance: ${order.priceSet === false ? 'To be calculated' : money(balance)}`,
		'',
		balance > 0 ? `Please clear the balance of ${money(balance)} to complete delivery.` : 'Payment is complete. Your studio can now mark the project as delivered.',
		portalLink ? `\nView work status and bill:\n${portalLink}` : '',
		settings.phone ? `\nContact ${settings.studioName}: ${settings.phone}` : `\nContact ${settings.studioName} for delivery.`,
		'',
		settings.invoiceFooter
	];
	return lines.filter((line, index) => line !== '' || lines[index - 1] !== '').join('\n').trim();
}
