import type {
	BusinessProfile,
	BusinessTerminology,
	CapabilityDefinition,
	CapabilityKey,
	CapabilityValue,
	CustomFieldDefinition,
	EffectiveCapabilities,
	NichePackage,
	TenantEntitlements,
	TenantPreferences
} from './types.ts';
import { moduleDefaultsForPreset } from './moduleConfiguration.ts';

const editingTerms: BusinessTerminology = {
	customer: { singular: 'Customer', plural: 'Customers' },
	order: { singular: 'Order', plural: 'Orders' },
	staff: { singular: 'Editor', plural: 'Editors' },
	task: { singular: 'Task', plural: 'Tasks' },
	category: { singular: 'Event', plural: 'Events' },
	project: { singular: 'Project', plural: 'Projects' },
	dueDate: { singular: 'Delivery date', plural: 'Delivery dates' },
	delivery: { singular: 'Delivery', plural: 'Deliveries' },
	assignedAsset: { singular: 'Device', plural: 'Devices' }
};

const tone = (label: string, value: 'green' | 'purple' | 'blue' | 'amber' | 'red' | 'gray', visible = true) => ({ label, tone: value, visible });
const editingStatuses = {
	Historical: tone('Historical', 'gray'),
	Received: tone('Received', 'blue'),
	Assigned: tone('Assigned', 'blue'),
	Editing: tone('Editing', 'purple'),
	'Waiting Review': tone('Waiting Review', 'purple'),
	Revision: tone('Revision', 'red'),
	'Ready Delivery': tone('Ready Delivery', 'green'),
	Delivered: tone('Delivered', 'green'),
	Stopped: tone('Stopped', 'red'),
	Completed: tone('Completed', 'green'),
	'Not started': tone('Not started', 'amber'),
	'Files downloaded': tone('Files downloaded', 'blue'),
	'In progress': tone('In progress', 'purple'),
	'Waiting for clarification': tone('Waiting for clarification', 'amber'),
	'Ready for review': tone('Ready for review', 'purple'),
	'Revision required': tone('Revision required', 'red')
};
const genericStatuses = (terminology: BusinessTerminology) => ({
	...editingStatuses,
	Editing: tone('In Progress', 'purple'),
	'Waiting Review': tone('Awaiting Review', 'purple'),
	Revision: tone('Changes Required', 'red'),
	'Ready Delivery': tone(`Ready for ${terminology.delivery.singular}`, 'green'),
	Delivered: tone(terminology.delivery.singular === 'Delivery' ? 'Delivered' : `${terminology.delivery.singular} Complete`, 'green'),
	'Files downloaded': tone('Work Started', 'blue'),
	'In progress': tone('In Progress', 'purple'),
	'Waiting for clarification': tone('Needs Clarification', 'amber'),
	'Ready for review': tone('Ready for Review', 'purple'),
	'Revision required': tone('Changes Required', 'red')
});

export const capabilityRegistry: Record<CapabilityKey, CapabilityDefinition> = {
	'work.tasks': { key: 'work.tasks', label: 'Tasks / work items', description: 'Break orders into trackable work items.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'portal', 'reports'] },
	'work.staff': { key: 'work.staff', label: 'Staff management', description: 'Maintain workers and assign work.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'reports'] },
	'work.staffPortal': { key: 'work.staffPortal', label: 'Staff portal', description: 'Private work portal for assigned staff.', type: 'boolean', defaultValue: true, version: 1, dependencies: ['work.staff', 'work.tasks'], conflicts: [], surfaces: ['portal'] },
	'work.assignedAssets': { key: 'work.assignedAssets', label: 'Assigned assets', description: 'Track devices or assets handed to staff.', type: 'boolean', defaultValue: true, version: 1, dependencies: ['work.staff', 'work.tasks'], conflicts: [], surfaces: ['admin', 'portal', 'reports'] },
	'workflow.delivery': { key: 'workflow.delivery', label: 'Delivery / completion', description: 'Track final customer handover.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'portal', 'messages'] },
	'billing.payments': { key: 'billing.payments', label: 'Payments', description: 'Record advances and payments.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'portal', 'reports'] },
	'billing.invoices': { key: 'billing.invoices', label: 'Invoices', description: 'Create printable invoices and receipts.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'portal', 'reports'] },
	'billing.partialInvoices': { key: 'billing.partialInvoices', label: 'Partial invoices', description: 'Invoice completed work in stages.', type: 'boolean', defaultValue: true, version: 1, dependencies: ['billing.invoices', 'work.tasks'], conflicts: [], surfaces: ['admin', 'portal'] },
	'billing.duration': { key: 'billing.duration', label: 'Duration billing', description: 'Calculate bills from time or media duration.', type: 'boolean', defaultValue: true, version: 1, dependencies: ['billing.invoices', 'work.tasks'], conflicts: [], surfaces: ['admin', 'portal', 'reports'] },
	'portal.customer': { key: 'portal.customer', label: 'Customer portal', description: 'Private customer status and invoice portal.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['portal'] },
	'communications.whatsapp': { key: 'communications.whatsapp', label: 'WhatsApp actions', description: 'Create tenant-branded WhatsApp messages.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'messages'] },
	'integrations.googleSheets': { key: 'integrations.googleSheets', label: 'Google Sheets', description: 'Mirror tenant records to Google Sheets.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'reports'] },
	'reports.excelExport': { key: 'reports.excelExport', label: 'Excel export', description: 'Download a formatted workbook.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'reports'] },
	customFields: { key: 'customFields', label: 'Custom fields', description: 'Add niche-specific fields to core records.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'portal', 'reports', 'messages'] },
	'branding.whiteLabel': { key: 'branding.whiteLabel', label: 'White label', description: 'Lead tenant surfaces with the tenant brand.', type: 'boolean', defaultValue: true, version: 1, dependencies: [], conflicts: [], surfaces: ['admin', 'portal', 'messages', 'reports'] }
};

export const capabilityKeys = Object.keys(capabilityRegistry) as CapabilityKey[];
export const allCapabilities = Object.fromEntries(capabilityKeys.map((key) => [key, true])) as TenantEntitlements;

const visibility = (overrides: Partial<CustomFieldDefinition['visibility']> = {}): CustomFieldDefinition['visibility'] => ({
	admin: true, customerPortal: false, staffPortal: false, whatsapp: false, sheets: true, export: true, ...overrides
});
const field = (entity: CustomFieldDefinition['entity'], key: string, label: string, type: CustomFieldDefinition['type'], order: number, required = false, options?: string[]): CustomFieldDefinition => ({
	entity, key, label, type, order, required, active: true, options, visibility: visibility()
});

const baseProfile = (presetId: string, terminology: BusinessTerminology, customFields: CustomFieldDefinition[] = [], optionLists: Record<string, string[]> = {}): BusinessProfile => ({
	schemaVersion: 1,
	presetId,
	presetVersion: 1,
	terminology,
	statuses: { ...(presetId === 'editing-studio' ? editingStatuses : genericStatuses(terminology)) },
	customFields,
	optionLists,
	region: { currency: 'INR', locale: 'en-IN', timeZone: 'Asia/Kolkata', phoneCountry: 'IN', taxLabel: 'GSTIN' }
});

const terms = (values: Partial<Record<keyof BusinessTerminology, [string, string]>>): BusinessTerminology =>
	Object.fromEntries(Object.entries(editingTerms).map(([key, value]) => {
		const replacement = values[key as keyof BusinessTerminology];
		return [key, replacement ? { singular: replacement[0], plural: replacement[1] } : value];
	})) as unknown as BusinessTerminology;

const enabled = (disabled: CapabilityKey[] = []): TenantPreferences =>
	Object.fromEntries(capabilityKeys.map((key) => [key, !disabled.includes(key)])) as TenantPreferences;

const generalAssignmentTemplate = `Hello {{editor_name}},

New work has been assigned by {{studio_name}}.

Reference: {{project}}
Customer: {{customer}}

Work items:
{{task_list}}

Open your private work portal:
{{portal_link}}`;
const generalInvoiceTemplate = `{{studio_name}}
{{studio_address}}{{studio_phone_line}}{{gstin_line}}

Invoice: {{invoice_number}}
Customer: {{customer}}
Reference: {{project}}
Category: {{event}}
Due: {{delivery_date}}

Total: {{total}}
Paid: {{paid}}
Balance: {{balance}}

{{payment_note}}{{invoice_footer_line}}

View status and documents:
{{portal_link}}`;

const pkg = (id: string, name: string, description: string, profile: BusinessProfile, disabled: CapabilityKey[] = []): NichePackage => ({
	id, name, description, version: 1, allowed: enabled(disabled), enabled: enabled(disabled), profile,
	settingsDefaults: id === 'editing-studio' ? {} : { assignmentTemplate: generalAssignmentTemplate, invoiceTemplate: generalInvoiceTemplate },
	moduleConfiguration: moduleDefaultsForPreset(id)
});

export const builtInPackages: NichePackage[] = [
	pkg('editing-studio', 'Editing Studio', 'A complete production and delivery workflow for editing teams.', baseProfile('editing-studio', editingTerms, [], { categories: ['Wedding', 'Birthday', 'Half Saree', 'House Opening', 'Engagement', 'Reception'] })),
	pkg('garage-service', 'Garage / Vehicle Service', 'Job cards, technicians, work items, billing and pickup.', baseProfile('garage-service', terms({ order: ['Job Card', 'Job Cards'], staff: ['Technician', 'Technicians'], task: ['Work Item', 'Work Items'], category: ['Service Type', 'Service Types'], project: ['Vehicle / Job', 'Vehicles / Jobs'], dueDate: ['Promised date', 'Promised dates'], delivery: ['Pickup', 'Pickups'], assignedAsset: ['Tool / Asset', 'Tools / Assets'] }), [
		field('order', 'vehicle_registration', 'Vehicle registration', 'text', 1, true),
		field('order', 'vehicle_make_model', 'Vehicle make / model', 'text', 2),
		field('order', 'odometer', 'Odometer', 'number', 3),
		field('order', 'intake_notes', 'Intake notes', 'textarea', 4)
	], { categories: ['General Service', 'Repair', 'Inspection', 'Body Work', 'Tyres'] }), ['billing.duration']),
	pkg('salon-spa', 'Salon / Spa', 'Appointments, stylists, services, billing and client updates.', baseProfile('salon-spa', terms({ customer: ['Client', 'Clients'], order: ['Appointment', 'Appointments'], staff: ['Stylist', 'Stylists'], task: ['Service', 'Services'], category: ['Service Category', 'Service Categories'], project: ['Visit', 'Visits'], dueDate: ['Appointment date', 'Appointment dates'], delivery: ['Checkout', 'Checkouts'], assignedAsset: ['Station', 'Stations'] }), [
		field('order', 'appointment_at', 'Appointment date and time', 'datetime', 1, true),
		field('customer', 'preferences', 'Client preferences', 'textarea', 2)
	], { categories: ['Hair', 'Skin', 'Nails', 'Spa', 'Bridal'] }), ['work.assignedAssets', 'workflow.delivery', 'billing.duration']),
	pkg('small-shop', 'Small Shop / Basic Orders', 'Customer orders, payments, invoices and WhatsApp without POS or stock.', baseProfile('small-shop', terms({ order: ['Sale Order', 'Sale Orders'], staff: ['Staff Member', 'Staff'], task: ['Order Item', 'Order Items'], category: ['Order Type', 'Order Types'], project: ['Order Reference', 'Order References'], dueDate: ['Fulfilment date', 'Fulfilment dates'], delivery: ['Fulfilment', 'Fulfilments'] })), ['work.staff', 'work.staffPortal', 'work.assignedAssets', 'work.tasks', 'billing.partialInvoices', 'billing.duration']),
	pkg('contractor-services', 'Contractor / Project Services', 'Clients, jobs, work items, teams, billing and completion.', baseProfile('contractor-services', terms({ order: ['Job', 'Jobs'], staff: ['Team Member', 'Team Members'], task: ['Work Item', 'Work Items'], category: ['Project Type', 'Project Types'], project: ['Site / Project', 'Sites / Projects'], dueDate: ['Target date', 'Target dates'], delivery: ['Handover', 'Handovers'], assignedAsset: ['Equipment', 'Equipment'] }), [
		field('order', 'site_location', 'Site location', 'url', 1),
		field('order', 'contract_reference', 'Contract reference', 'text', 2)
	]), ['billing.duration']),
	pkg('hospitality-lite', 'Hospitality / Pub Lite', 'Basic bookings, service orders and billing; no POS, stock or table management.', baseProfile('hospitality-lite', terms({ customer: ['Guest', 'Guests'], order: ['Service Order', 'Service Orders'], staff: ['Team Member', 'Team Members'], task: ['Service Item', 'Service Items'], category: ['Service Type', 'Service Types'], project: ['Booking / Event', 'Bookings / Events'], dueDate: ['Service date', 'Service dates'], delivery: ['Completion', 'Completions'] }), [
		field('order', 'booking_at', 'Booking date and time', 'datetime', 1),
		field('order', 'party_size', 'Party size', 'number', 2)
	]), ['work.staff', 'work.staffPortal', 'work.assignedAssets', 'work.tasks', 'workflow.delivery', 'billing.partialInvoices', 'billing.duration']),
	pkg('electronics-repair', 'Electronics Repair', 'Device intake, diagnostics, technicians, repair progress, billing and collection.', baseProfile('electronics-repair', terms({ order: ['Repair Ticket', 'Repair Tickets'], staff: ['Technician', 'Technicians'], task: ['Repair Step', 'Repair Steps'], category: ['Device Type', 'Device Types'], project: ['Device / Repair', 'Devices / Repairs'], dueDate: ['Expected date', 'Expected dates'], delivery: ['Collection', 'Collections'], assignedAsset: ['Bench / Tool', 'Benches / Tools'] }), [
		field('order', 'device_brand_model', 'Device brand and model', 'text', 1, true),
		field('order', 'serial_number', 'Serial / IMEI number', 'text', 2),
		field('order', 'reported_issue', 'Reported issue', 'textarea', 3, true),
		field('order', 'accessories_received', 'Accessories received', 'text', 4)
	], { categories: ['Phone', 'Laptop', 'Tablet', 'TV', 'Appliance', 'Other'] }), ['billing.duration']),
	pkg('clinic-wellness', 'Clinic / Wellness Practice', 'Appointments, practitioners, services, payments and private client updates.', baseProfile('clinic-wellness', terms({ customer: ['Client', 'Clients'], order: ['Appointment', 'Appointments'], staff: ['Practitioner', 'Practitioners'], task: ['Service', 'Services'], category: ['Visit Type', 'Visit Types'], project: ['Visit', 'Visits'], dueDate: ['Appointment date', 'Appointment dates'], delivery: ['Visit completion', 'Visit completions'], assignedAsset: ['Room', 'Rooms'] }), [
		field('order', 'appointment_at', 'Appointment date and time', 'datetime', 1, true),
		field('customer', 'contact_preference', 'Contact preference', 'select', 2, false, ['Phone', 'WhatsApp', 'Email'])
	], { categories: ['Consultation', 'Follow-up', 'Therapy', 'Wellness', 'Other'] }), ['workflow.delivery', 'billing.partialInvoices', 'billing.duration']),
	pkg('education-coaching', 'Education / Coaching', 'Learners, sessions, instructors, assignments, fees and progress updates.', baseProfile('education-coaching', terms({ customer: ['Learner', 'Learners'], order: ['Enrollment', 'Enrollments'], staff: ['Instructor', 'Instructors'], task: ['Learning Task', 'Learning Tasks'], category: ['Course Type', 'Course Types'], project: ['Course / Batch', 'Courses / Batches'], dueDate: ['Target date', 'Target dates'], delivery: ['Course completion', 'Course completions'], assignedAsset: ['Classroom / Resource', 'Classrooms / Resources'] }), [
		field('customer', 'guardian_name', 'Guardian name', 'text', 1),
		field('order', 'batch_timing', 'Batch timing', 'text', 2)
	], { categories: ['Tutoring', 'Exam preparation', 'Language', 'Music', 'Professional training'] }), ['billing.duration']),
	pkg('cleaning-home-services', 'Cleaning / Home Services', 'Bookings, field teams, service checklists, payments and completion.', baseProfile('cleaning-home-services', terms({ order: ['Booking', 'Bookings'], staff: ['Service Professional', 'Service Professionals'], task: ['Checklist Item', 'Checklist Items'], category: ['Service Type', 'Service Types'], project: ['Service Visit', 'Service Visits'], dueDate: ['Visit date', 'Visit dates'], delivery: ['Completion', 'Completions'], assignedAsset: ['Equipment Kit', 'Equipment Kits'] }), [
		field('order', 'service_location', 'Service location', 'url', 1, true),
		field('order', 'access_instructions', 'Access instructions', 'textarea', 2)
	], { categories: ['Home cleaning', 'Office cleaning', 'Deep cleaning', 'Pest control', 'Maintenance'] }), ['billing.duration']),
	pkg('logistics-delivery', 'Logistics / Delivery', 'Shipment requests, drivers, checkpoints, payments and proof of delivery.', baseProfile('logistics-delivery', terms({ customer: ['Sender / Client', 'Senders / Clients'], order: ['Shipment', 'Shipments'], staff: ['Driver', 'Drivers'], task: ['Checkpoint', 'Checkpoints'], category: ['Delivery Type', 'Delivery Types'], project: ['Shipment Reference', 'Shipment References'], dueDate: ['Delivery date', 'Delivery dates'], delivery: ['Delivery', 'Deliveries'], assignedAsset: ['Vehicle', 'Vehicles'] }), [
		field('order', 'pickup_location', 'Pickup location', 'url', 1, true),
		field('order', 'drop_location', 'Drop location', 'url', 2, true),
		field('order', 'recipient_phone', 'Recipient phone', 'text', 3)
	], { categories: ['Local', 'Same day', 'Intercity', 'Scheduled', 'Bulk'] }), ['billing.partialInvoices', 'billing.duration']),
	pkg('event-services', 'Events / Rentals', 'Event bookings, teams, service tasks, equipment, billing and handover.', baseProfile('event-services', terms({ customer: ['Client', 'Clients'], order: ['Event Booking', 'Event Bookings'], staff: ['Crew Member', 'Crew Members'], task: ['Event Task', 'Event Tasks'], category: ['Event Type', 'Event Types'], project: ['Event', 'Events'], dueDate: ['Event date', 'Event dates'], delivery: ['Event completion', 'Event completions'], assignedAsset: ['Equipment', 'Equipment'] }), [
		field('order', 'venue_location', 'Venue location', 'url', 1),
		field('order', 'guest_count', 'Expected guest count', 'number', 2)
	], { categories: ['Wedding', 'Corporate', 'Birthday', 'Exhibition', 'Private event'] }), ['billing.duration']),
	pkg('property-services', 'Property / Facility Services', 'Properties, maintenance requests, field teams, billing and completion.', baseProfile('property-services', terms({ customer: ['Resident / Client', 'Residents / Clients'], order: ['Service Request', 'Service Requests'], staff: ['Field Staff', 'Field Staff'], task: ['Maintenance Task', 'Maintenance Tasks'], category: ['Request Type', 'Request Types'], project: ['Property / Unit', 'Properties / Units'], dueDate: ['Scheduled date', 'Scheduled dates'], delivery: ['Resolution', 'Resolutions'], assignedAsset: ['Equipment / Key', 'Equipment / Keys'] }), [
		field('order', 'property_location', 'Property location', 'url', 1),
		field('order', 'unit_reference', 'Unit / property reference', 'text', 2, true)
	], { categories: ['Plumbing', 'Electrical', 'Cleaning', 'Inspection', 'General maintenance'] }), ['billing.duration']),
	pkg('general-service', 'General Service Business', 'Flexible customers, jobs, staff, work items and billing.', baseProfile('general-service', terms({ order: ['Job', 'Jobs'], staff: ['Staff Member', 'Staff'], task: ['Work Item', 'Work Items'], category: ['Service Type', 'Service Types'], project: ['Job Name', 'Job Names'], dueDate: ['Due date', 'Due dates'], delivery: ['Completion', 'Completions'], assignedAsset: ['Asset', 'Assets'] })), ['billing.duration'])
];

export const defaultPackage = builtInPackages[0];
export const packageById = (id?: string) => builtInPackages.find((item) => item.id === id) || defaultPackage;

const truthy = (value: CapabilityValue | undefined) => value !== false && value !== 0 && value !== '';

export function resolveCapabilities(allowed: TenantEntitlements = allCapabilities, preferences: TenantPreferences = allCapabilities): EffectiveCapabilities {
	const result = {} as EffectiveCapabilities;
	for (const key of capabilityKeys) {
		const definition = capabilityRegistry[key];
		const allowedValue = allowed[key] ?? definition.defaultValue;
		const preferredValue = preferences[key] ?? definition.defaultValue;
		result[key] = truthy(allowedValue) && truthy(preferredValue) ? preferredValue : false;
	}
	let changed = true;
	while (changed) {
		changed = false;
		for (const key of capabilityKeys) {
			if (!truthy(result[key])) continue;
			if (capabilityRegistry[key].dependencies.some((dependency) => !truthy(result[dependency]))) {
				result[key] = false;
				changed = true;
			}
		}
	}
	return result;
}

export const hasCapability = (capabilities: EffectiveCapabilities | undefined, key: CapabilityKey) => truthy(capabilities?.[key]);
export const labelFor = (profile: BusinessProfile | undefined, key: keyof BusinessTerminology, plural = false) =>
	profile?.terminology[key]?.[plural ? 'plural' : 'singular'] || editingTerms[key][plural ? 'plural' : 'singular'];
export const statusFor = (profile: BusinessProfile | undefined, status: string) =>
	profile?.statuses[status] || editingStatuses[status as keyof typeof editingStatuses] || tone(status, 'gray');

export function profileForPackage(current: BusinessProfile, nichePackage: NichePackage): BusinessProfile {
	const packaged = new Set(nichePackage.profile.customFields.map((field) => `${field.entity}:${field.key}`));
	return {
		...nichePackage.profile,
		customFields: [
			...nichePackage.profile.customFields,
			...current.customFields.filter((field) => !packaged.has(`${field.entity}:${field.key}`))
		],
		presetId: nichePackage.id,
		presetVersion: nichePackage.version
	};
}

export function parseJsonSetting<T>(value: unknown, fallback: T): T {
	try {
		if (!value) return fallback;
		return (typeof value === 'string' ? JSON.parse(value) : value) as T;
	} catch {
		return fallback;
	}
}

export function validatePreferences(input: unknown, allowed: TenantEntitlements): TenantPreferences {
	if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Capabilities must be an object.');
	const result: TenantPreferences = {};
	for (const [rawKey, value] of Object.entries(input as Record<string, unknown>)) {
		if (!capabilityKeys.includes(rawKey as CapabilityKey)) throw new Error(`Unknown capability: ${rawKey}`);
		const key = rawKey as CapabilityKey;
		if (!truthy(allowed[key]) && truthy(value as CapabilityValue)) {
			const denial = new Error(`${capabilityRegistry[key].label} is not allowed for this workspace.`) as Error & { status: number };
			denial.status = 403;
			throw denial;
		}
		if (capabilityRegistry[key].type === 'boolean' && typeof value !== 'boolean') throw new Error(`${capabilityRegistry[key].label} must be enabled or disabled.`);
		result[key] = value as CapabilityValue;
	}
	return result;
}

export function validateCustomValues(profile: BusinessProfile, entity: CustomFieldDefinition['entity'], input: unknown) {
	const values = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
	const definitions = profile.customFields.filter((item) => item.entity === entity && item.active);
	const output: Record<string, string | number | boolean | null> = {};
	for (const definition of definitions) {
		const value = values[definition.key];
		if (definition.required && (value === undefined || value === null || value === '')) throw new Error(`${definition.label} is required.`);
		if (value === undefined) continue;
		if (definition.type === 'number' && value !== '' && !Number.isFinite(Number(value))) throw new Error(`${definition.label} must be a number.`);
		if (definition.type === 'checkbox' && typeof value !== 'boolean') throw new Error(`${definition.label} must be checked or unchecked.`);
		if (definition.type === 'select' && value !== '' && !definition.options?.includes(String(value))) throw new Error(`Choose a valid ${definition.label}.`);
		if (definition.type === 'url' && value !== '' && !String(value).startsWith('https://')) throw new Error(`${definition.label} must use HTTPS.`);
		output[definition.key] = definition.type === 'number' && value !== '' ? Number(value) : value as string | boolean | null;
	}
	return output;
}
