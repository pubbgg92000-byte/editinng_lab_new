import type {
	BusinessProfile,
	CustomerPortalConfiguration,
	MessageContext,
	MessageScenario,
	PortalMilestone,
	StaffPortalConfiguration,
	StudioSettings,
	TenantEntitlements,
	WhatsAppConfiguration,
	WhatsAppTemplate,
	WorkspaceModuleConfiguration,
	WorkspaceModuleOverrides
} from './types.ts';

export const messageScenarioLabels: Record<MessageScenario, string> = {
	'work-assignment': 'Work assignment',
	'order-received': 'Order received',
	'appointment-reminder': 'Appointment or booking reminder',
	'status-update': 'Status update',
	'clarification-request': 'Clarification request',
	ready: 'Ready for pickup or delivery',
	invoice: 'Invoice',
	'partial-invoice': 'Partial invoice',
	'payment-received': 'Payment received',
	'completion-follow-up': 'Completion follow-up'
};

export const messageContextLabels: Record<MessageContext, string> = {
	customer: 'Customer',
	order: 'Order',
	assignment: 'Worker assignment',
	invoice: 'Invoice',
	payment: 'Payment'
};

export const baseTemplatePlaceholders: Record<MessageContext, string[]> = {
	customer: ['studio_name', 'customer', 'customer_name', 'portal_link'],
	order: ['studio_name', 'customer', 'customer_name', 'order_id', 'order_label', 'project', 'event', 'delivery_date', 'status', 'progress', 'total', 'paid', 'balance', 'portal_link'],
	assignment: ['studio_name', 'editor_name', 'project', 'customer', 'task_list', 'delivery_date', 'portal_link'],
	invoice: ['studio_name', 'studio_address', 'studio_phone_line', 'gstin_line', 'invoice_number', 'customer', 'project', 'event', 'delivery_date', 'total', 'paid', 'balance', 'payment_note', 'invoice_footer_line', 'portal_link'],
	payment: ['studio_name', 'customer', 'customer_name', 'project', 'invoice_number', 'payment_amount', 'paid', 'balance', 'portal_link']
};

const customerMilestones: PortalMilestone[] = [
	{ id: 'received', label: 'Received', statuses: ['Received'] },
	{ id: 'assigned', label: 'Scheduled', statuses: ['Assigned'] },
	{ id: 'progress', label: 'In progress', statuses: ['Editing'] },
	{ id: 'review', label: 'Review', statuses: ['Waiting Review', 'Revision'] },
	{ id: 'ready', label: 'Ready', statuses: ['Ready Delivery'] },
	{ id: 'complete', label: 'Completed', statuses: ['Delivered', 'Completed'] }
];

const staffMilestones: PortalMilestone[] = [
	{ id: 'not-started', label: 'Not started', statuses: ['Not started'] },
	{ id: 'started', label: 'Started', statuses: ['Files downloaded', 'In progress'] },
	{ id: 'clarification', label: 'Needs clarification', statuses: ['Waiting for clarification'] },
	{ id: 'review', label: 'Ready for review', statuses: ['Ready for review', 'Revision required'] },
	{ id: 'complete', label: 'Completed', statuses: ['Completed'] }
];

const packageCopy: Record<string, {
	delivery: CustomerPortalConfiguration['deliveryExperience'];
	customerMode?: CustomerPortalConfiguration['mode'];
	staffMode?: StaffPortalConfiguration['mode'];
	received: string;
	reminder: string;
	ready: string;
	assignment: string;
	followup: string;
}> = {
	'editing-studio': {
		delivery: 'digital',
		received: 'We have received your project {{project}} and will keep its progress updated here:\n{{portal_link}}',
		reminder: 'A quick reminder from {{studio_name}} about {{project}} due on {{delivery_date}}.',
		ready: 'Your project {{project}} is ready for delivery.\n\nBalance: {{balance}}\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nNew work has been assigned for {{project}}.\n\n{{task_list}}\n\nOpen your private work portal:\n{{portal_link}}',
		followup: 'Thank you for working with {{studio_name}}. Your project {{project}} is complete. We would value your feedback.'
	},
	'garage-service': {
		delivery: 'pickup',
		received: 'Hello {{customer_name}}, your job card for {{project}} has been opened at {{studio_name}}.\nTrack it here: {{portal_link}}',
		reminder: 'Reminder: your vehicle service for {{project}} is scheduled for {{delivery_date}} at {{studio_name}}.',
		ready: 'Your vehicle / job {{project}} is ready for pickup.\nBalance: {{balance}}\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nA service job has been assigned: {{project}}.\n\n{{task_list}}\n\nJob portal: {{portal_link}}',
		followup: 'Thank you for choosing {{studio_name}}. The work on {{project}} is complete. Please let us know if you need any help.'
	},
	'salon-spa': {
		delivery: 'appointment',
		staffMode: 'progress-updates',
		received: 'Hello {{customer_name}}, your appointment at {{studio_name}} is confirmed for {{delivery_date}}.\nDetails: {{portal_link}}',
		reminder: 'Friendly reminder: your appointment at {{studio_name}} is on {{delivery_date}}. We look forward to seeing you.',
		ready: 'Your visit {{project}} is complete. You can view the summary and receipt here:\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nYou have a new appointment / service assignment for {{project}}.\n\n{{task_list}}\n\nView details: {{portal_link}}',
		followup: 'Thank you for visiting {{studio_name}}. We hope you enjoyed your service and would love your feedback.'
	},
	'small-shop': {
		delivery: 'fulfilment',
		staffMode: 'assignments-only',
		received: 'Hello {{customer_name}}, we received your order {{project}} at {{studio_name}}.\nTrack it here: {{portal_link}}',
		reminder: 'Reminder from {{studio_name}}: your order {{project}} is expected on {{delivery_date}}.',
		ready: 'Your order {{project}} is ready for fulfilment.\nBalance: {{balance}}\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nPlease prepare order {{project}}.\n\n{{task_list}}\n\nDetails: {{portal_link}}',
		followup: 'Thank you for your order from {{studio_name}}. We hope to serve you again.'
	},
	'contractor-services': {
		delivery: 'handover',
		received: 'Hello {{customer_name}}, your job {{project}} is now active with {{studio_name}}.\nTrack progress: {{portal_link}}',
		reminder: 'Reminder: the next scheduled date for {{project}} is {{delivery_date}}.',
		ready: '{{project}} is ready for handover.\nBalance: {{balance}}\nReview details: {{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nYou have been assigned work for {{project}}.\n\n{{task_list}}\n\nSite / job details: {{portal_link}}',
		followup: 'The handover for {{project}} is complete. Thank you for choosing {{studio_name}}.'
	},
	'hospitality-lite': {
		delivery: 'completion',
		customerMode: 'status-billing',
		staffMode: 'assignments-only',
		received: 'Hello {{customer_name}}, your booking / service order {{project}} is confirmed at {{studio_name}}.\n{{portal_link}}',
		reminder: 'Reminder: your booking with {{studio_name}} is on {{delivery_date}}. We look forward to welcoming you.',
		ready: 'Your service {{project}} is complete. View the receipt and summary here:\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nYou have a service assignment for {{project}}.\n\n{{task_list}}\n\nDetails: {{portal_link}}',
		followup: 'Thank you for visiting {{studio_name}}. We hope to welcome you again.'
	},
	'electronics-repair': {
		delivery: 'pickup',
		received: 'Hello {{customer_name}}, repair ticket {{project}} has been opened at {{studio_name}}.\nTrack diagnostics and repair progress: {{portal_link}}',
		reminder: 'Reminder from {{studio_name}}: the expected date for {{project}} is {{delivery_date}}.',
		ready: 'Your device / repair {{project}} is ready for collection.\nBalance: {{balance}}\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nA repair ticket has been assigned: {{project}}.\n\n{{task_list}}\n\nRepair portal: {{portal_link}}',
		followup: 'Thank you for choosing {{studio_name}}. The repair for {{project}} is complete.'
	},
	'clinic-wellness': {
		delivery: 'appointment',
		staffMode: 'progress-updates',
		received: 'Hello {{customer_name}}, your appointment at {{studio_name}} is confirmed for {{delivery_date}}.\nPrivate details: {{portal_link}}',
		reminder: 'Reminder: your appointment with {{studio_name}} is on {{delivery_date}}.',
		ready: 'Your visit {{project}} is complete. View the shared summary and receipt here:\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nYou have a new appointment assignment for {{project}}.\n\n{{task_list}}\n\nPrivate details: {{portal_link}}',
		followup: 'Thank you for visiting {{studio_name}}. Please contact us if you need a follow-up.'
	},
	'education-coaching': {
		delivery: 'completion',
		received: 'Hello {{customer_name}}, your enrollment for {{project}} is active with {{studio_name}}.\nTrack shared progress: {{portal_link}}',
		reminder: 'Reminder from {{studio_name}}: the next target date for {{project}} is {{delivery_date}}.',
		ready: '{{project}} has reached its completion stage. View the latest summary here:\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nNew learner work is assigned for {{project}}.\n\n{{task_list}}\n\nInstructor portal: {{portal_link}}',
		followup: 'Congratulations on completing {{project}} with {{studio_name}}.'
	},
	'cleaning-home-services': {
		delivery: 'completion',
		received: 'Hello {{customer_name}}, your service booking {{project}} is confirmed with {{studio_name}}.\n{{portal_link}}',
		reminder: 'Reminder: your service visit is scheduled for {{delivery_date}}.',
		ready: 'The service visit {{project}} is complete.\nBalance: {{balance}}\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nA service visit has been assigned: {{project}}.\n\n{{task_list}}\n\nVisit details: {{portal_link}}',
		followup: 'Thank you for choosing {{studio_name}}. We would value your feedback on {{project}}.'
	},
	'logistics-delivery': {
		delivery: 'fulfilment',
		received: 'Hello {{customer_name}}, shipment {{project}} has been accepted by {{studio_name}}.\nTrack it here: {{portal_link}}',
		reminder: 'Delivery reminder: shipment {{project}} is scheduled for {{delivery_date}}.',
		ready: 'Shipment {{project}} is ready for delivery / collection.\nBalance: {{balance}}\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nShipment {{project}} has been assigned.\n\n{{task_list}}\n\nDriver portal: {{portal_link}}',
		followup: 'Shipment {{project}} has been completed. Thank you for using {{studio_name}}.'
	},
	'event-services': {
		delivery: 'handover',
		received: 'Hello {{customer_name}}, event booking {{project}} is confirmed with {{studio_name}}.\n{{portal_link}}',
		reminder: 'Event reminder: {{project}} is scheduled for {{delivery_date}}.',
		ready: 'Preparations for {{project}} are ready for handover.\nBalance: {{balance}}\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nYou have an event assignment for {{project}}.\n\n{{task_list}}\n\nCrew portal: {{portal_link}}',
		followup: 'Thank you for trusting {{studio_name}} with {{project}}. We would love your feedback.'
	},
	'property-services': {
		delivery: 'completion',
		received: 'Hello {{customer_name}}, service request {{project}} is open with {{studio_name}}.\nTrack resolution: {{portal_link}}',
		reminder: 'Reminder: service request {{project}} is scheduled for {{delivery_date}}.',
		ready: 'Service request {{project}} is ready for resolution.\nBalance: {{balance}}\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nA property service request is assigned: {{project}}.\n\n{{task_list}}\n\nField portal: {{portal_link}}',
		followup: 'Service request {{project}} has been resolved. Thank you for using {{studio_name}}.'
	},
	'general-service': {
		delivery: 'completion',
		received: 'Hello {{customer_name}}, we have received your job {{project}} at {{studio_name}}.\nTrack progress: {{portal_link}}',
		reminder: 'Reminder from {{studio_name}}: {{project}} is scheduled for {{delivery_date}}.',
		ready: 'Your job {{project}} is ready for completion.\nBalance: {{balance}}\n{{portal_link}}',
		assignment: 'Hello {{editor_name}},\n\nNew work has been assigned for {{project}}.\n\n{{task_list}}\n\nOpen the work portal: {{portal_link}}',
		followup: 'Thank you for choosing {{studio_name}}. {{project}} is now complete.'
	}
};

const commonBody = {
	status: 'Hello {{customer_name}},\n\n{{project}} is now: {{status}}.\nProgress: {{progress}}%\n\nView the latest details:\n{{portal_link}}',
	clarification: 'Hello {{customer_name}},\n\nWe need a little more information before continuing with {{project}}. Please contact {{studio_name}} or review the latest update here:\n{{portal_link}}',
	invoice: '{{studio_name}}\n{{studio_address}}{{studio_phone_line}}{{gstin_line}}\n\nInvoice: {{invoice_number}}\nCustomer: {{customer}}\nReference: {{project}}\n\nTotal: {{total}}\nPaid: {{paid}}\nBalance: {{balance}}\n\n{{payment_note}}{{invoice_footer_line}}\n\nView invoice and status:\n{{portal_link}}',
	partial: '{{studio_name}}\n\nPartial invoice {{invoice_number}} for {{project}}\nTotal: {{total}}\nPaid: {{paid}}\nBalance: {{balance}}\n\nView document:\n{{portal_link}}',
	payment: 'Hello {{customer_name}},\n\nWe received your payment of {{payment_amount}} for {{project}}.\nPaid to date: {{paid}}\nBalance: {{balance}}\n\nThank you — {{studio_name}}\n{{portal_link}}'
};

function template(id: string, name: string, audience: WhatsAppTemplate['audience'], scenario: MessageScenario, context: MessageContext, body: string): WhatsAppTemplate {
	return { id, name, audience, scenario, context, enabled: true, body, source: 'package' };
}

export function moduleDefaultsForPreset(presetId = 'general-service'): WorkspaceModuleConfiguration {
	const copy = packageCopy[presetId] || packageCopy['general-service'];
	const templateList = [
		template('staff-assignment', 'New work assignment', 'staff', 'work-assignment', 'assignment', copy.assignment),
		template('customer-order-received', 'Order received', 'customer', 'order-received', 'order', copy.received),
		template('customer-reminder', 'Appointment / booking reminder', 'customer', 'appointment-reminder', 'order', copy.reminder),
		template('customer-status', 'Status update', 'customer', 'status-update', 'order', commonBody.status),
		template('customer-clarification', 'Clarification request', 'customer', 'clarification-request', 'order', commonBody.clarification),
		template('customer-ready', 'Ready for completion', 'customer', 'ready', 'order', copy.ready),
		template('customer-invoice', 'Invoice', 'customer', 'invoice', 'invoice', commonBody.invoice),
		template('customer-partial-invoice', 'Partial invoice', 'customer', 'partial-invoice', 'invoice', commonBody.partial),
		template('customer-payment', 'Payment received', 'customer', 'payment-received', 'payment', commonBody.payment),
		template('customer-follow-up', 'Completion follow-up', 'customer', 'completion-follow-up', 'order', copy.followup)
	];
	const templates = Object.fromEntries(templateList.map((item) => [item.id, item]));
	return {
		schemaVersion: 1,
		'portal.customer': {
			mode: copy.customerMode || 'full',
			progressMode: 'both',
			deliveryExperience: copy.delivery,
			sections: { summary: true, progress: true, tasks: true, billing: true, payments: true, delivery: true, documents: true, customFields: true },
			milestones: structuredClone(customerMilestones)
		},
		'work.staffPortal': {
			mode: copy.staffMode || 'full',
			progressMode: 'both',
			sections: { instructions: true, references: true, assets: true, customFields: true, progress: true, output: true, notes: true, duration: presetId === 'editing-studio' },
			allowStatusUpdate: true,
			allowProgressUpdate: true,
			milestones: structuredClone(staffMilestones)
		},
		'communications.whatsapp': {
			defaultTemplateIds: Object.fromEntries(templateList.map((item) => [item.scenario, item.id])),
			templates,
			deletedTemplateIds: []
		}
	};
}

function mergeObject<T extends object>(base: T, override?: Partial<T>): T {
	if (!override) return structuredClone(base);
	const result = structuredClone(base) as Record<string, unknown>;
	for (const [key, value] of Object.entries(override)) {
		if (value === undefined) continue;
		const current = result[key];
		result[key] = value && typeof value === 'object' && !Array.isArray(value) && current && typeof current === 'object' && !Array.isArray(current)
			? mergeObject(current as object, value as object)
			: structuredClone(value);
	}
	return result as T;
}

export function normalizePackageModuleConfiguration(presetId: string, input?: Partial<WorkspaceModuleConfiguration>): WorkspaceModuleConfiguration {
	return mergeModuleConfiguration(moduleDefaultsForPreset(presetId), input || {});
}

export function mergeModuleConfiguration(base: WorkspaceModuleConfiguration, overrides: WorkspaceModuleOverrides | Partial<WorkspaceModuleConfiguration>): WorkspaceModuleConfiguration {
	const result = mergeObject(base, overrides as Partial<WorkspaceModuleConfiguration>);
	const deletedTemplateIds = [...new Set(result['communications.whatsapp'].deletedTemplateIds || [])];
	result['communications.whatsapp'].deletedTemplateIds = deletedTemplateIds;
	for (const id of deletedTemplateIds) delete result['communications.whatsapp'].templates[id];
	for (const [scenario, id] of Object.entries(result['communications.whatsapp'].defaultTemplateIds)) {
		if (!id || !result['communications.whatsapp'].templates[id]) {
			delete result['communications.whatsapp'].defaultTemplateIds[scenario as MessageScenario];
		}
	}
	result.schemaVersion = 1;
	return result;
}

export function legacyModuleOverrides(settings: StudioSettings): WorkspaceModuleOverrides {
	return {
		schemaVersion: 1,
		'communications.whatsapp': {
			templates: {
				'staff-assignment': {
					...moduleDefaultsForPreset('general-service')['communications.whatsapp'].templates['staff-assignment'],
					body: settings.assignmentTemplate,
					source: 'legacy'
				},
				'customer-invoice': {
					...moduleDefaultsForPreset('general-service')['communications.whatsapp'].templates['customer-invoice'],
					body: settings.invoiceTemplate,
					source: 'legacy'
				}
			}
		}
	};
}

const portalModes = new Set(['status-only', 'status-billing', 'full']);
const staffModes = new Set(['assignments-only', 'progress-updates', 'full']);
const progressModes = new Set(['milestones', 'percentage', 'both']);
const deliveryExperiences = new Set(['digital', 'pickup', 'appointment', 'fulfilment', 'handover', 'completion']);
const scenarios = new Set(Object.keys(messageScenarioLabels));
const contexts = new Set(Object.keys(messageContextLabels));
const placeholderPattern = /{{\s*([^{}\s]+)\s*}}/g;
const scenarioContracts: Record<MessageScenario, { audience: WhatsAppTemplate['audience']; context: MessageContext }> = {
	'work-assignment': { audience: 'staff', context: 'assignment' },
	'order-received': { audience: 'customer', context: 'order' },
	'appointment-reminder': { audience: 'customer', context: 'order' },
	'status-update': { audience: 'customer', context: 'order' },
	'clarification-request': { audience: 'customer', context: 'order' },
	ready: { audience: 'customer', context: 'order' },
	invoice: { audience: 'customer', context: 'invoice' },
	'partial-invoice': { audience: 'customer', context: 'invoice' },
	'payment-received': { audience: 'customer', context: 'payment' },
	'completion-follow-up': { audience: 'customer', context: 'order' }
};
const contextEntities: Record<MessageContext, Array<'customer' | 'order' | 'task' | 'staff'>> = {
	customer: ['customer'],
	order: ['customer', 'order'],
	assignment: ['order', 'task', 'staff'],
	invoice: ['customer', 'order'],
	payment: ['customer', 'order']
};

export function placeholdersInTemplate(body: string) {
	return [...body.matchAll(placeholderPattern)].map((match) => match[1]);
}

export function availableTemplatePlaceholders(context: MessageContext, profile?: BusinessProfile) {
	const custom = (profile?.customFields || [])
		.filter((field) => field.active && field.visibility.whatsapp && contextEntities[context].includes(field.entity))
		.map((field) => `${field.entity}.${field.key}`);
	return [...new Set([...baseTemplatePlaceholders[context], ...custom])];
}

export function validateModuleConfiguration(input: unknown, profile: BusinessProfile, allowed: TenantEntitlements): WorkspaceModuleConfiguration {
	if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Module configuration must be an object.');
	const value = input as WorkspaceModuleConfiguration;
	const customer = value['portal.customer'];
	const staff = value['work.staffPortal'];
	const whatsapp = value['communications.whatsapp'];
	if (!customer || !portalModes.has(customer.mode) || !progressModes.has(customer.progressMode) || !deliveryExperiences.has(customer.deliveryExperience)) throw new Error('Customer portal configuration is invalid.');
	if (!staff || !staffModes.has(staff.mode) || !progressModes.has(staff.progressMode)) throw new Error('Worker portal configuration is invalid.');
	for (const section of [...Object.values(customer.sections || {}), ...Object.values(staff.sections || {})]) if (typeof section !== 'boolean') throw new Error('Portal section switches must be enabled or disabled.');
	for (const milestone of [...(customer.milestones || []), ...(staff.milestones || [])]) {
		if (!/^[a-z0-9-]{2,48}$/.test(milestone.id) || !milestone.label?.trim() || !Array.isArray(milestone.statuses)) throw new Error('A portal milestone is invalid.');
	}
	if (customer.milestones.length > 12 || staff.milestones.length > 12) throw new Error('A portal may contain at most 12 milestones.');
	if (!whatsapp || !whatsapp.templates || typeof whatsapp.templates !== 'object') throw new Error('WhatsApp template configuration is invalid.');
	if (Object.keys(whatsapp.templates).length > 60) throw new Error('A workspace may contain at most 60 WhatsApp templates.');
	if (!Array.isArray(whatsapp.deletedTemplateIds) || whatsapp.deletedTemplateIds.length > 60 || whatsapp.deletedTemplateIds.some((id) => typeof id !== 'string' || !/^[a-z0-9-]{2,64}$/.test(id))) {
		throw new Error('Deleted WhatsApp template references are invalid.');
	}
	const templateNames = new Set<string>();
	for (const [id, item] of Object.entries(whatsapp.templates)) {
		if (item.id !== id || !/^[a-z0-9-]{2,64}$/.test(id)) throw new Error(`Invalid template ID: ${id}`);
		if (!item.name?.trim() || item.name.trim().length > 80) throw new Error('Each template needs a name of 80 characters or fewer.');
		if (!['customer', 'staff'].includes(item.audience) || !scenarios.has(item.scenario) || !contexts.has(item.context)) throw new Error(`${item.name} has an invalid audience, purpose, or context.`);
		const contract = scenarioContracts[item.scenario];
		if (item.audience !== contract.audience || item.context !== contract.context) throw new Error(`${item.name} is not compatible with its selected message purpose.`);
		if (typeof item.enabled !== 'boolean' || !['package', 'custom', 'legacy'].includes(item.source)) throw new Error(`${item.name} has invalid template settings.`);
		const normalizedName = item.name.trim().toLocaleLowerCase();
		if (templateNames.has(normalizedName)) throw new Error(`Template names must be unique. "${item.name.trim()}" is used more than once.`);
		templateNames.add(normalizedName);
		if (!item.body?.trim() || item.body.length > 4000) throw new Error(`${item.name} must contain between 1 and 4,000 characters.`);
		const allowedPlaceholders = new Set(availableTemplatePlaceholders(item.context, profile));
		const unknown = placeholdersInTemplate(item.body).filter((key) => !allowedPlaceholders.has(key));
		if (unknown.length) throw new Error(`${item.name} uses unavailable placeholders: ${[...new Set(unknown)].join(', ')}`);
	}
	for (const [scenario, id] of Object.entries(whatsapp.defaultTemplateIds || {})) {
		const selected = id ? whatsapp.templates[id] : undefined;
		if (!scenarios.has(scenario) || !selected || selected.scenario !== scenario) {
			throw new Error(`The default ${messageScenarioLabels[scenario as MessageScenario] || scenario} template is unavailable.`);
		}
	}
	return { ...structuredClone(value), schemaVersion: 1 };
}

export function moduleOverridesFromEffective(packageDefaults: WorkspaceModuleConfiguration, effective: WorkspaceModuleConfiguration): WorkspaceModuleOverrides {
	const templateOverrides = Object.fromEntries(Object.entries(effective['communications.whatsapp'].templates).filter(([id, item]) => {
		const packaged = packageDefaults['communications.whatsapp'].templates[id];
		return item.source === 'custom' || !packaged || JSON.stringify(item) !== JSON.stringify(packaged);
	}));
	return {
		schemaVersion: 1,
		'portal.customer': structuredClone(effective['portal.customer']),
		'work.staffPortal': structuredClone(effective['work.staffPortal']),
		'communications.whatsapp': {
			defaultTemplateIds: structuredClone(effective['communications.whatsapp'].defaultTemplateIds),
			templates: templateOverrides,
			deletedTemplateIds: structuredClone(effective['communications.whatsapp'].deletedTemplateIds || [])
		}
	};
}

export function templateForScenario(configuration: WorkspaceModuleConfiguration, scenario: MessageScenario, requestedId?: string) {
	const catalog = configuration['communications.whatsapp'];
	if (requestedId) {
		const requested = catalog.templates[requestedId];
		return requested?.enabled && requested.scenario === scenario ? requested : undefined;
	}
	const defaultId = catalog.defaultTemplateIds[scenario];
	const selected = defaultId ? catalog.templates[defaultId] : undefined;
	return selected?.enabled && selected.scenario === scenario
		? selected
		: Object.values(catalog.templates).find((item) => item.enabled && item.scenario === scenario);
}

export function customerPortalSections(configuration: CustomerPortalConfiguration) {
	return {
		...configuration.sections,
		tasks: configuration.mode === 'full' && configuration.sections.tasks,
		billing: configuration.mode !== 'status-only' && configuration.sections.billing,
		payments: configuration.mode !== 'status-only' && configuration.sections.payments,
		documents: configuration.mode !== 'status-only' && configuration.sections.documents,
		delivery: configuration.mode === 'full' && configuration.sections.delivery
	};
}

export function staffPortalSections(configuration: StaffPortalConfiguration) {
	return {
		...configuration.sections,
		progress: configuration.mode !== 'assignments-only' && configuration.sections.progress,
		output: configuration.mode === 'full' && configuration.sections.output,
		notes: configuration.mode !== 'assignments-only' && configuration.sections.notes,
		duration: configuration.mode === 'full' && configuration.sections.duration
	};
}
