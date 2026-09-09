// WhatsApp URL/message builder using current tenant data and validated templates.
import { env } from '$env/dynamic/private';
import type {
	BusinessProfile,
	Customer,
	Editor,
	Invoice,
	MessageScenario,
	Order,
	StudioSettings,
	Task,
	WorkspaceModuleConfiguration
} from '$lib/types';
import { whatsappNumber } from '$lib/phone';
import { money } from '$lib/data';
import { fillTemplate } from '$lib/messageTemplates';
import { templateForScenario } from '$lib/moduleConfiguration';

export const normalizePhone = (phone: string) => whatsappNumber(phone);
export const whatsappUrl = (phone: string, message: string) => `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;

function selectedBody(configuration: WorkspaceModuleConfiguration | undefined, scenario: MessageScenario, fallback: string, templateId?: string) {
	if (!configuration) return fallback;
	return templateForScenario(configuration, scenario, templateId)?.body || fallback;
}

function customTemplateValues(
	profile?: BusinessProfile,
	records: Partial<Record<'customer' | 'order' | 'task' | 'staff', { customFields?: Record<string, unknown> } | Array<{ customFields?: Record<string, unknown> }>>> = {}
) {
	if (!profile) return {};
	return Object.fromEntries(profile.customFields
		.filter((field) => field.active && field.visibility.whatsapp)
		.map((field) => {
			const record = records[field.entity];
			const values = Array.isArray(record)
				? [...new Set(record.map((item) => item.customFields?.[field.key]).filter((value) => value !== undefined && value !== null && value !== '').map(String))]
				: record?.customFields?.[field.key] === undefined || record?.customFields?.[field.key] === null
					? []
					: [String(record.customFields[field.key])];
			return [`${field.entity}.${field.key}`, values.join(', ')];
		}));
}

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

function portalUrl(kind: 'customer' | 'editor', token: string, origin?: string, tenantSlug = '') {
	if (!token) return '';
	const publicUrl = applicationUrl(origin);
	return tenantSlug
		? `${publicUrl}/portal/${tenantSlug}/${kind}/${token}`
		: `${publicUrl}/${kind}/${token}`;
}

export function editorAssignmentMessage(
	settings: StudioSettings,
	editor: Editor,
	order: Order,
	tasks: Task[],
	token: string,
	origin?: string,
	tenantSlug = '',
	profile?: BusinessProfile,
	modules?: WorkspaceModuleConfiguration,
	templateId?: string
) {
	const taskLines = tasks.map((task, index) =>
		`${index + 1}. ${task.name}${task.due ? ` — due ${task.due}` : ''}${task.instructions ? `\n   ${task.instructions}` : ''}${task.textLink ? `\n   Link: ${task.textLink}` : ''}${task.imageUrl ? `\n   Image: ${task.imageUrl}` : ''}`
	).join('\n');
	return fillTemplate(selectedBody(modules, 'work-assignment', settings.assignmentTemplate, templateId), {
		editor_name: editor.name,
		studio_name: settings.studioName,
		project: order.project,
		customer: order.customer,
		task_list: taskLines,
		delivery_date: order.due || 'Not set',
		portal_link: portalUrl('editor', token, origin, tenantSlug),
		...customTemplateValues(profile, { order, task: tasks, staff: editor })
	});
}

function invoiceValues(settings: StudioSettings, invoiceNumber: string, order: Order, customer: Customer | null | undefined, portalLink: string, profile?: BusinessProfile) {
	const netTotal = Math.max(0, order.price - order.discount);
	return {
		studio_name: settings.studioName,
		studio_address: settings.address,
		studio_phone_line: settings.phone ? `\nPhone: ${settings.phone}` : '',
		gstin_line: settings.gstin ? `\nGSTIN: ${settings.gstin}` : '',
		invoice_number: invoiceNumber,
		customer: customer?.business || order.customer,
		customer_name: customer?.name || order.customer,
		project: order.project,
		event: order.workType,
		delivery_date: order.due || 'Not set',
		total: order.priceSet === false ? 'To be confirmed' : money(netTotal),
		paid: order.advanceSet === false && !(order.payments || []).length ? 'Not recorded' : money(order.paid),
		balance: order.priceSet === false ? 'Will be calculated after total is set' : money(Math.max(0, netTotal - order.paid)),
		payment_note: settings.paymentNote,
		invoice_footer_line: settings.invoiceFooter ? `\n\n${settings.invoiceFooter}` : '',
		portal_link: portalLink,
		...customTemplateValues(profile, { customer: customer || undefined, order })
	};
}

export function invoiceMessage(
	settings: StudioSettings,
	invoiceNumber: string,
	order: Order,
	customerToken = '',
	origin?: string,
	receipt?: { kind?: 'advance' | 'payment' | 'final'; amount?: number; invoiceUrl?: string },
	tenantSlug = '',
	customer?: Customer | null,
	profile?: BusinessProfile,
	modules?: WorkspaceModuleConfiguration,
	templateId?: string
) {
	const portalLink = portalUrl('customer', customerToken, origin, tenantSlug);
	let message = fillTemplate(
		selectedBody(modules, 'invoice', settings.invoiceTemplate, templateId),
		invoiceValues(settings, invoiceNumber, order, customer, portalLink, profile)
	);
	const additions: string[] = [];
	if (receipt?.kind === 'advance') additions.push(`Advance collected: ${money(receipt.amount || 0)}`);
	else if (receipt?.kind === 'payment') additions.push(`Payment received: ${money(receipt.amount || 0)}`);
	if (order.discount > 0) {
		const discountPercent = order.price > 0 ? order.discount / order.price * 100 : 0;
		additions.push(`Subtotal: ${money(order.price)}\nDiscount (${discountPercent.toFixed(discountPercent % 1 ? 2 : 0)}%): ${money(order.discount)}\nTotal after discount: ${money(Math.max(0, order.price - order.discount))}`);
	}
	if (receipt?.invoiceUrl) additions.push(`Open invoice / print PDF:\n${receipt.invoiceUrl}`);
	if (additions.length) message = `${message.trimEnd()}\n\n${additions.join('\n')}`;
	if (portalLink && !message.includes(portalLink)) message = `${message.trimEnd()}\n\nView status and documents:\n${portalLink}`;
	return message;
}

export function currentInvoiceMessage(
	settings: StudioSettings,
	invoice: Invoice,
	order: Order,
	customer?: Customer | null,
	origin?: string,
	tenantSlug = '',
	profile?: BusinessProfile,
	modules?: WorkspaceModuleConfiguration,
	templateId?: string
) {
	const customerToken = customer?.archived ? '' : customer?.token || '';
	const portalLink = portalUrl('customer', customerToken, origin, tenantSlug);
	const invoiceLink = portalLink ? `${portalLink}/invoice/${invoice.id}` : '';
	const hasSnapshot = Boolean(invoice.subtotal || invoice.total || invoice.discount || invoice.amountReceived || invoice.paid || invoice.balance);
	const snapshotOrder: Order = hasSnapshot
		? { ...order, price: invoice.subtotal, discount: invoice.discount, paid: invoice.paid, priceSet: true }
		: order;
	if (invoice.kind !== 'partial') {
		return invoiceMessage(settings, invoice.number, snapshotOrder, customerToken, origin, {
			kind: invoice.kind,
			amount: invoice.amountReceived,
			invoiceUrl: invoiceLink
		}, tenantSlug, customer, profile, modules, templateId);
	}
	const values = invoiceValues(settings, invoice.number, {
		...snapshotOrder,
		price: invoice.total,
		discount: 0,
		paid: invoice.paid
	}, customer, invoiceLink || portalLink, profile);
	return fillTemplate(
		selectedBody(modules, 'partial-invoice', settings.invoiceTemplate, templateId),
		values
	);
}

export function customerReadyMessage(
	settings: StudioSettings,
	order: Order,
	customerToken = '',
	origin?: string,
	tenantSlug = '',
	customer?: Customer | null,
	profile?: BusinessProfile,
	modules?: WorkspaceModuleConfiguration,
	templateId?: string,
	scenario: MessageScenario = 'ready'
) {
	const portalLink = portalUrl('customer', customerToken, origin, tenantSlug);
	const netTotal = Math.max(0, order.price - order.discount);
	const balance = Math.max(0, netTotal - order.paid);
	const latestPayment = order.payments?.[0];
	const fallback = [
		`Hello ${customer?.name || order.customer},`,
		'',
		`Your work "${order.project}" is ready.`,
		'',
		`Total: ${order.priceSet === false ? 'To be confirmed' : money(netTotal)}`,
		`Paid / advance: ${order.advanceSet === false && !(order.payments || []).length ? 'Not recorded' : money(order.paid)}`,
		`Balance: ${order.priceSet === false ? 'To be calculated' : money(balance)}`,
		portalLink ? `\nView the latest details:\n${portalLink}` : '',
		settings.phone ? `\nContact ${settings.studioName}: ${settings.phone}` : '',
		settings.invoiceFooter
	].filter(Boolean).join('\n');
	return fillTemplate(selectedBody(modules, scenario, fallback, templateId), {
		studio_name: settings.studioName,
		customer: order.customer,
		customer_name: customer?.name || order.customer,
		order_id: order.id,
		order_label: profile?.terminology.order.singular || 'Order',
		project: order.project,
		event: order.workType,
		delivery_date: order.due || 'Not set',
		status: order.status,
		progress: String(order.progress),
		total: order.priceSet === false ? 'To be confirmed' : money(netTotal),
		paid: order.advanceSet === false && !(order.payments || []).length ? 'Not recorded' : money(order.paid),
		balance: order.priceSet === false ? 'To be calculated' : money(balance),
		invoice_number: '',
		payment_amount: latestPayment ? money(latestPayment.amount) : '',
		portal_link: portalLink,
		...customTemplateValues(profile, { customer: customer || undefined, order })
	});
}
