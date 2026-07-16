export type OrderStatus = 'Historical' | 'Received' | 'Assigned' | 'Editing' | 'Waiting Review' | 'Revision' | 'Ready Delivery' | 'Completed';
export type TaskStatus = 'Not started' | 'Files downloaded' | 'In progress' | 'Waiting for clarification' | 'Ready for review' | 'Revision required' | 'Completed';
export type EditorAvailability = 'available' | 'busy' | 'inactive';
export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'graphite-aqua' | 'ice-cyan' | 'forest-gold' | 'lime-cream' | 'meadow-amber' | 'midnight-violet' | 'obsidian-blue';

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
	status: TaskStatus;
	progress: number;
	due: string;
	fileCount?: number;
	instructions?: string;
	textLink?: string;
	imageUrl?: string;
	outputLink?: string;
	notes?: string;
	archived?: boolean;
}

export interface Payment {
	id: string;
	orderId: string;
	amount: number;
	paidAt: string;
	method: string;
	note: string;
}

export interface Invoice {
	id: string;
	number: string;
	orderId: string;
	message: string;
	openedAt: string;
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
	paid: number;
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
}

export interface StudioSettings {
	studioName: string;
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
