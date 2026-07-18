export type OrderStatus = 'Historical' | 'Received' | 'Assigned' | 'Editing' | 'Waiting Review' | 'Revision' | 'Ready Delivery' | 'Delivered' | 'Stopped' | 'Completed';
export type TaskStatus = 'Not started' | 'Files downloaded' | 'In progress' | 'Waiting for clarification' | 'Ready for review' | 'Revision required' | 'Completed';
export type TaskBillingMode = 'manual' | 'duration';
export type EditorAvailability = 'available' | 'busy' | 'inactive';
export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'graphite-aqua' | 'ice-cyan' | 'forest-gold' | 'lime-cream' | 'meadow-amber' | 'coral-teal' | 'sky-sorbet' | 'nordic-stone' | 'midnight-violet' | 'obsidian-blue' | 'heritage-sage' | 'merlot-copper' | 'citrus-evergreen' | 'graphite-coral';
export type StorageWarningLevel = 'healthy' | 'notice' | 'warning' | 'critical';

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
	gst?: string;
	projects: number;
	pending: number;
	token?: string;
	archived?: boolean;
}

export interface Editor {
	id: string;
	code?: string;
	name: string;
	initials: string;
	specialty: string;
	phone: string;
	activeTasks: number;
	available: boolean;
	availability?: EditorAvailability;
	token?: string;
	archived?: boolean;
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
	archived?: boolean;
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
}

export interface StudioSettings {
	studioName: string;
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
