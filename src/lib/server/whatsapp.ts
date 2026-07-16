import { env } from '$env/dynamic/private';
import type { Editor, Order, StudioSettings, Task } from '$lib/types';
import { money } from '$lib/data';
import { fillTemplate } from '$lib/messageTemplates';

export const normalizePhone = (phone: string) => phone.replace(/\D/g, '');
export const whatsappUrl = (phone: string, message: string) => `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;

export function editorAssignmentMessage(settings: StudioSettings, editor: Editor, order: Order, tasks: Task[], token: string, origin?: string) {
	const applicationUrl = origin || env.PUBLIC_APP_URL || 'http://localhost:5173';
	const taskLines = tasks.map((task, index) => `${index + 1}. ${task.name}${task.due ? ` — due ${task.due}` : ''}${task.instructions ? `\n   ${task.instructions}` : ''}${task.textLink ? `\n   Link: ${task.textLink}` : ''}${task.imageUrl ? `\n   Image: ${task.imageUrl}` : ''}`).join('\n');
	return fillTemplate(settings.assignmentTemplate, {
		editor_name: editor.name,
		studio_name: settings.studioName,
		project: order.project,
		customer: order.customer,
		task_list: taskLines,
		portal_link: `${applicationUrl}/editor/${token}`
	});
}

export function invoiceMessage(settings: StudioSettings, invoiceNumber: string, order: Order) {
	const total = order.priceSet === false ? 'Not set' : money(order.price);
	const paid = order.advanceSet === false && !(order.payments || []).length ? 'Not recorded' : money(order.paid);
	const balance = order.priceSet === false ? 'Not set' : money(Math.max(0, order.price - order.paid));
	return fillTemplate(settings.invoiceTemplate, {
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
		invoice_footer_line: settings.invoiceFooter ? `\n\n${settings.invoiceFooter}` : ''
	});
}
