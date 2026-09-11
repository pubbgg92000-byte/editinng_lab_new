// Shared contracts used by repositories, APIs, pages, modals, portals, and exports.
export type OrderStatus = 'Historical' | 'Received' | 'Assigned' | 'Editing' | 'Waiting Review' | 'Revision' | 'Ready Delivery' | 'Delivered' | 'Stopped' | 'Completed';
export type TaskStatus = 'Not started' | 'Files downloaded' | 'In progress' | 'Waiting for clarification' | 'Ready for review' | 'Revision required' | 'Completed';
export type TaskBillingMode = 'manual' | 'duration';
export type EditorSettlement = 'not-set' | 'editor-bills-admin' | 'admin-issues-statement';
export type EditorAvailability = 'available' | 'busy' | 'inactive';
export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'graphite-aqua' | 'ice-cyan' | 'forest-gold' | 'lime-cream' | 'meadow-amber' | 'coral-teal' | 'sky-sorbet' | 'nordic-stone' | 'midnight-violet' | 'obsidian-blue' | 'heritage-sage' | 'merlot-copper' | 'citrus-evergreen' | 'graphite-coral' | 'ink-paper' | 'noir-chalk';
export type StorageWarningLevel = 'healthy' | 'notice' | 'warning' | 'critical';
export type CapabilityKey =
	| 'work.tasks'
	| 'work.staff'
	| 'work.staffPortal'
	| 'work.assignedAssets'
	| 'workflow.delivery'
	| 'billing.payments'
	| 'billing.invoices'
	| 'billing.partialInvoices'
	| 'billing.duration'
	| 'portal.customer'
	| 'communications.whatsapp'
	| 'integrations.googleSheets'
	| 'reports.excelExport'
	| 'customFields'
	| 'branding.whiteLabel';
export type CapabilityValue = boolean | number | string | string[] | Record<string, unknown>;
export type CapabilityValueType = 'boolean' | 'number' | 'enum' | 'list' | 'object';
export type CustomFieldEntity = 'customer' | 'order' | 'task' | 'staff';
export type CustomFieldType = 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select' | 'checkbox' | 'url';
export type CustomFieldValue = string | number | boolean | null;
export type PortalProgressMode = 'milestones' | 'percentage' | 'both';
export type CustomerPortalMode = 'status-only' | 'status-billing' | 'full';
export type StaffPortalMode = 'assignments-only' | 'progress-updates' | 'full';
export type DeliveryExperience = 'digital' | 'pickup' | 'appointment' | 'fulfilment' | 'handover' | 'completion';
export type MessageAudience = 'customer' | 'staff';
export type MessageContext = 'customer' | 'order' | 'assignment' | 'invoice' | 'payment';
export type MessageScenario =
	| 'work-assignment'
	| 'order-received'
	| 'appointment-reminder'
	| 'status-update'
	| 'clarification-request'
	| 'ready'
	| 'invoice'
	| 'partial-invoice'
	| 'payment-received'
	| 'completion-follow-up';

export interface PortalMilestone {
	id: string;
	label: string;
	statuses: string[];
}

export interface CustomerPortalConfiguration {
	mode: CustomerPortalMode;
	progressMode: PortalProgressMode;
	deliveryExperience: DeliveryExperience;
	sections: {
		summary: boolean;
		progress: boolean;
		tasks: boolean;
		billing: boolean;
		payments: boolean;
		delivery: boolean;
		documents: boolean;
		customFields: boolean;
	};
	milestones: PortalMilestone[];
}

export interface StaffPortalConfiguration {
	mode: StaffPortalMode;
	progressMode: PortalProgressMode;
	sections: {
		instructions: boolean;
		references: boolean;
		assets: boolean;
		customFields: boolean;
		progress: boolean;
		output: boolean;
		notes: boolean;
		duration: boolean;
	};
	allowStatusUpdate: boolean;
	allowProgressUpdate: boolean;
	milestones: PortalMilestone[];
}

export interface WhatsAppTemplate {
	id: string;
	name: string;
	audience: MessageAudience;
	scenario: MessageScenario;
	context: MessageContext;
	enabled: boolean;
	body: string;
	source: 'package' | 'custom' | 'legacy';
}

export interface WhatsAppConfiguration {
	defaultTemplateIds: Partial<Record<MessageScenario, string>>;
	templates: Record<string, WhatsAppTemplate>;
	deletedTemplateIds: string[];
}

export interface WorkspaceModuleConfiguration {
	schemaVersion: 1;
	'portal.customer': CustomerPortalConfiguration;
	'work.staffPortal': StaffPortalConfiguration;
	'communications.whatsapp': WhatsAppConfiguration;
}

export type WorkspaceModuleOverrides = Partial<{
	schemaVersion: 1;
	'portal.customer': Partial<CustomerPortalConfiguration>;
	'work.staffPortal': Partial<StaffPortalConfiguration>;
	'communications.whatsapp': Partial<WhatsAppConfiguration>;
}>;

export interface CapabilityDefinition {
	key: CapabilityKey;
	label: string;
	description: string;
	type: CapabilityValueType;
	defaultValue: CapabilityValue;
	version: number;
	dependencies: CapabilityKey[];
	conflicts: CapabilityKey[];
	surfaces: string[];
}

export type TenantEntitlements = Partial<Record<CapabilityKey, CapabilityValue>>;
export type TenantPreferences = Partial<Record<CapabilityKey, CapabilityValue>>;
export type EffectiveCapabilities = Record<CapabilityKey, CapabilityValue>;

export interface TerminologyEntry {
	singular: string;
	plural: string;
}

export interface BusinessTerminology {
	customer: TerminologyEntry;
	order: TerminologyEntry;
	staff: TerminologyEntry;
	task: TerminologyEntry;
	category: TerminologyEntry;
	project: TerminologyEntry;
	dueDate: TerminologyEntry;
	delivery: TerminologyEntry;
	assignedAsset: TerminologyEntry;
}

export interface StatusPresentation {
	label: string;
	tone: 'green' | 'purple' | 'blue' | 'amber' | 'red' | 'gray';
	visible: boolean;
}

export interface CustomFieldDefinition {
	key: string;
	entity: CustomFieldEntity;
	label: string;
	type: CustomFieldType;
	required: boolean;
	active: boolean;
	order: number;
	options?: string[];
	visibility: {
		admin: boolean;
		customerPortal: boolean;
		staffPortal: boolean;
		whatsapp: boolean;
		sheets: boolean;
		export: boolean;
	};
}

export interface BusinessProfile {
	schemaVersion: number;
	presetId: string;
	presetVersion: number;
	terminology: BusinessTerminology;
	statuses: Record<string, StatusPresentation>;
	customFields: CustomFieldDefinition[];
	optionLists: Record<string, string[]>;
	region: {
		currency: 'INR';
		locale: 'en-IN';
		timeZone: 'Asia/Kolkata';
		phoneCountry: 'IN';
		taxLabel: 'GSTIN';
	};
}

export interface NichePackage {
	id: string;
	name: string;
	version: number;
	description: string;
	allowed: TenantEntitlements;
	enabled: TenantPreferences;
	profile: BusinessProfile;
	settingsDefaults: Partial<StudioSettings>;
	moduleConfiguration: Partial<WorkspaceModuleConfiguration>;
}

export interface TenantConfiguration {
	profile: BusinessProfile;
	allowedCapabilities: TenantEntitlements;
	preferences: TenantPreferences;
	effectiveCapabilities: EffectiveCapabilities;
	packageModuleConfiguration: WorkspaceModuleConfiguration;
	moduleOverrides: WorkspaceModuleOverrides;
	moduleConfiguration: WorkspaceModuleConfiguration;
}

export interface DatabaseStorageUsage {
	bytes: number;
	limitBytes: number;
	limitMb: number;
	percent: number;
	level: StorageWarningLevel;
	cleanup: {
		lastRunAt: string;
		syncedRecordsDeleted: number;
		activityRecordsDeleted: number;
	};
}

export interface Customer {
	id: string;
	name: string;
	business: string;
	phone: string;
	email: string;
	address?: string;
	locationUrl?: string;
	gst?: string;
	projects: number;
	pending: number;
	token?: string;
	archived?: boolean;
	customFields?: Record<string, CustomFieldValue>;
}

export interface Editor {
	id: string;
	code?: string;
	name: string;
	initials: string;
	specialty: string;
	phone: string;
	locationUrl?: string;
	activeTasks: number;
	available: boolean;
	availability?: EditorAvailability;
	token?: string;
	archived?: boolean;
	customFields?: Record<string, CustomFieldValue>;
}

export interface Task {
	id: string;
	orderId?: string;
	name: string;
	assignee: string;
	editorId?: string;
	editorCode?: string;
	status: TaskStatus;
	progress: number;
	due: string;
	fileCount?: number;
	instructions?: string;
	textLink?: string;
	imageUrl?: string;
	outputLink?: string;
	notes?: string;
	billableAmount?: number;
	invoicedAmount?: number;
	billingMode?: TaskBillingMode;
	hourlyRate?: number;
	videoDurationMinutes?: number;
	device?: string;
	editorSettlement?: EditorSettlement;
	archived?: boolean;
	customFields?: Record<string, CustomFieldValue>;
}

export interface InvoiceTaskItem {
	taskId: string;
	name: string;
	amount: number;
}

export interface Payment {
	id: string;
	orderId: string;
	amount: number;
	paidAt: string;
	method: string;
	note: string;
	kind: 'advance' | 'payment';
}

export interface Invoice {
	id: string;
	number: string;
	orderId: string;
	message: string;
	openedAt: string;
	kind: 'advance' | 'payment' | 'partial' | 'final';
	paymentId?: string;
	amountReceived: number;
	subtotal: number;
	discount: number;
	total: number;
	paid: number;
	balance: number;
	taskItems?: InvoiceTaskItem[];
	status?: 'draft' | 'sent' | 'paid' | 'cancelled';
	sentAt?: string;
	billingMode?: 'manual' | 'duration';
	discountMode?: 'percent' | 'amount';
}

export interface ActivityLog {
	id: string;
	actor: string;
	action: string;
	entityType: string;
	entityId: string;
	details: string;
	createdAt: string;
}

export interface Order {
	id: string;
	serial?: number;
	project: string;
	customer: string;
	customerId?: string;
	workType: string;
	status: OrderStatus;
	progress: number;
	due: string;
	files: number;
	fileLink: string;
	price: number;
	discount: number;
	paid: number;
	initialAdvance?: number;
	priceSet?: boolean;
	advanceSet?: boolean;
	color: string;
	tasks: Task[];
	payments?: Payment[];
	mobile?: string;
	receiving?: string;
	duration?: string;
	source?: string;
	assignedTo?: string;
	remarks?: string;
	important?: boolean;
	historical?: boolean;
	archived?: boolean;
	deliveryMethod?: 'digital' | 'offline' | '';
	deliveredAt?: string;
	customerNotifiedAt?: string;
	createdAt?: string;
	updatedAt?: string;
	customFields?: Record<string, CustomFieldValue>;
}

export interface StudioSettings {
	studioName: string;
	orderPrefix: string;
	editorPrefix: string;
	logoUrl: string;
	address: string;
	phone: string;
	email: string;
	gstin: string;
	paymentNote: string;
	invoiceFooter: string;
	assignmentTemplate: string;
	invoiceTemplate: string;
	themePalette: ThemePalette;
	themeDefaultMode: ThemeMode;
}

export type TenantStatus = 'draft' | 'active' | 'suspended';
export type AccountRole = 'owner' | 'client_admin';

export interface Tenant {
	id: string;
	slug: string;
	internalName: string;
	studioName: string;
	logoUrl: string;
	databaseUrl: string;
	googleSheetId: string;
	ordersTab: string;
	status: TenantStatus;
	isDemo: boolean;
	isLegacy: boolean;
	connectionStatus: 'unknown' | 'healthy' | 'error';
	connectionError: string;
	lastValidatedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Account {
	id: string;
	email: string;
	role: AccountRole;
	tenantId?: string;
}

export interface AuthSession {
	id: string;
	account: Account;
	tenant?: Tenant;
	expiresAt: string;
}

export interface TenantConnection {
	databaseUrl: string;
	googleSheetId: string;
	ordersTab: string;
}
