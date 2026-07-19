// Preview-only sample records plus shared Indian currency/date display helpers used by the UI.
import type { Customer, Editor, Order } from './types';

export const customers: Customer[] = [
	{ id: 'CUST-1042', name: 'Rahul Sharma', business: 'Rahul Photography', phone: '+91 98765 43210', email: 'rahul@photography.in', projects: 8, pending: 7000, token: 'rahul-secure-1042' },
	{ id: 'CUST-1038', name: 'Ananya Mehta', business: 'AM Studios', phone: '+91 98220 11774', email: 'hello@amstudios.in', projects: 4, pending: 0, token: 'ananya-secure-1038' },
	{ id: 'CUST-1031', name: 'Vikram Singh', business: 'Frame House', phone: '+91 99876 24510', email: 'vikram@framehouse.in', projects: 12, pending: 18500, token: 'vikram-secure-1031' },
	{ id: 'CUST-1027', name: 'Priya Nair', business: 'Direct client', phone: '+91 99441 88291', email: 'priya.nair@gmail.com', projects: 2, pending: 3500, token: 'priya-secure-1027' }
];

export const editors: Editor[] = [
	{ id: 'ED-018', name: 'Anil Kumar', initials: 'AK', specialty: 'Photo editing', phone: '+91 98710 44521', activeTasks: 3, available: true, token: 'anil-abc123xyz' },
	{ id: 'ED-014', name: 'Megha Rao', initials: 'MR', specialty: 'Album design', phone: '+91 98450 12777', activeTasks: 2, available: true, token: 'megha-f8k4p2q' },
	{ id: 'ED-009', name: 'Meera Das', initials: 'MD', specialty: 'Color correction', phone: '+91 99110 65332', activeTasks: 4, available: false, token: 'meera-m9n2r4s' },
	{ id: 'ED-021', name: 'Kabir Shah', initials: 'KS', specialty: 'Video editing', phone: '+91 98920 44318', activeTasks: 1, available: true, token: 'kabir-v7c1x9z' }
];

export const orders: Order[] = [
	{ id: 'ORD-2026-0041', project: 'Priya Wedding', customer: 'Rahul Photography', workType: 'Wedding photo edit', status: 'Editing', progress: 70, due: '25 Jul', files: 850, fileLink: 'drive.google.com/priya-wedding', price: 12000, discount: 0, paid: 5000, color: '#7C5CFC', tasks: [
		{ id: 'TSK-101', name: 'Culling', assignee: 'Anil Kumar', status: 'Completed', progress: 100, due: '20 Jul', fileCount: 850, instructions: 'Remove blinks, duplicates and test shots.' },
		{ id: 'TSK-102', name: 'Colour correction', assignee: 'Meera Das', status: 'In progress', progress: 70, due: '22 Jul', fileCount: 420, instructions: 'Warm natural tones. Keep skin texture. Use reference folder.' },
		{ id: 'TSK-103', name: 'Quality check', assignee: 'Megha Rao', status: 'Not started', progress: 0, due: '24 Jul', fileCount: 420 },
		{ id: 'TSK-104', name: 'Final delivery', assignee: 'Unassigned', status: 'Not started', progress: 0, due: '25 Jul' }
	] },
	{ id: 'ORD-2026-0040', project: 'Ananya Album', customer: 'AM Studios', workType: 'Album design', status: 'Waiting Review', progress: 88, due: '19 Jul', files: 146, fileLink: 'drive.google.com/ananya-album', price: 8500, discount: 0, paid: 8500, color: '#22C55E', tasks: [
		{ id: 'TSK-098', name: 'Image selection', assignee: 'Anil Kumar', status: 'Completed', progress: 100, due: '15 Jul' },
		{ id: 'TSK-099', name: 'Album design', assignee: 'Megha Rao', status: 'Ready for review', progress: 100, due: '18 Jul', instructions: 'Minimal ivory layouts, 40 spreads.' },
		{ id: 'TSK-100', name: 'Quality check', assignee: 'Unassigned', status: 'Not started', progress: 0, due: '19 Jul' }
	] },
	{ id: 'ORD-2026-0039', project: 'Aarav Reception', customer: 'Frame House', workType: 'Highlight video', status: 'Assigned', progress: 20, due: '28 Jul', files: 312, fileLink: 'r2.studioflow.app/aarav', price: 18500, discount: 0, paid: 0, color: '#EAB308', tasks: [
		{ id: 'TSK-095', name: 'Footage organisation', assignee: 'Kabir Shah', status: 'Files downloaded', progress: 20, due: '18 Jul' },
		{ id: 'TSK-096', name: 'Highlight edit', assignee: 'Kabir Shah', status: 'Not started', progress: 0, due: '25 Jul' },
		{ id: 'TSK-097', name: 'Quality check', assignee: 'Anil Kumar', status: 'Not started', progress: 0, due: '27 Jul' }
	] },
	{ id: 'ORD-2026-0038', project: 'Mira Portraits', customer: 'Priya Nair', workType: 'Photo retouching', status: 'Ready Delivery', progress: 100, due: 'Today', files: 36, fileLink: 'drive.google.com/mira-portraits', price: 3500, discount: 0, paid: 3500, color: '#3B82F6', tasks: [
		{ id: 'TSK-094', name: 'Portrait retouching', assignee: 'Meera Das', status: 'Completed', progress: 100, due: 'Today' }
	] }
];

export const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

function dateParts(value: string | Date, withTime = false) {
	if (!value) return '';
	const text = String(value);
	const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);
	const date = new Date(dateOnly ? `${text}T00:00:00.000Z` : value);
	if (Number.isNaN(date.getTime())) return text;
	const parts = new Intl.DateTimeFormat('en-GB', {
		day: '2-digit', month: 'short', year: 'numeric',
		...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
		timeZone: dateOnly ? 'UTC' : 'Asia/Kolkata'
	}).formatToParts(date);
	const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || '';
	return `${part('day')}-${part('month')}-${part('year')}${withTime ? `, ${part('hour')}:${part('minute')} ${part('dayPeriod').toUpperCase()}` : ''}`;
}

export const formatDate = (value?: string | Date) => value ? dateParts(value) : '';
export const formatDateTime = (value?: string | Date) => value ? dateParts(value, true) : '';
