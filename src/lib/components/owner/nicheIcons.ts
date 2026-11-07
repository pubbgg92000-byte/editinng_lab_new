// Icons and starter field suggestions for niche packages (presentation only; no behaviour).
import { Bike, Briefcase, Building2, Camera, Car, Film, FlaskConical, Hospital, Printer, Shirt, Smile, Sofa, WashingMachine, GraduationCap, HardHat, Hotel, PartyPopper, Scissors, Smartphone, Sparkles, Stethoscope, Store, Truck } from '@lucide/svelte';

const icons: Record<string, typeof Briefcase> = {
	'editing-studio': Film,
	'garage-service': Car,
	'salon-spa': Scissors,
	'small-shop': Store,
	'contractor-services': HardHat,
	'hospitality-lite': Hotel,
	'electronics-repair': Smartphone,
	'clinic-wellness': Stethoscope,
	'education-coaching': GraduationCap,
	'cleaning-home-services': Sparkles,
	'logistics-delivery': Truck,
	'event-services': PartyPopper,
	'property-services': Building2,
	'car-garage': Car,
	'bike-service': Bike,
	'hospital-front-desk': Hospital,
	'dental-clinic': Smile,
	'diagnostic-lab': FlaskConical,
	'tailoring': Shirt,
	'photo-studio': Camera,
	'printing-press': Printer,
	'laundry': WashingMachine,
	'interior-fitout': Sofa
};

export const nicheIcon = (id: string) => icons[id] || Briefcase;

export type FieldSuggestion = { entity: 'customer' | 'order' | 'task' | 'staff'; label: string; type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select' | 'checkbox' | 'url'; options?: string };

const common: FieldSuggestion[] = [
	{ entity: 'order', label: 'Reference number', type: 'text' },
	{ entity: 'order', label: 'Special instructions', type: 'textarea' },
	{ entity: 'customer', label: 'Address', type: 'textarea' }
];

const byNiche: Record<string, FieldSuggestion[]> = {
	'garage-service': [
		{ entity: 'order', label: 'Fuel level', type: 'select', options: 'Empty, Quarter, Half, Three quarters, Full' },
		{ entity: 'order', label: 'Chassis number', type: 'text' },
		{ entity: 'order', label: 'Insurance claim', type: 'checkbox' },
		{ entity: 'order', label: 'Next service due', type: 'date' }
	],
	'electronics-repair': [
		{ entity: 'order', label: 'Device IMEI / serial', type: 'text' },
		{ entity: 'order', label: 'Fault reported', type: 'textarea' },
		{ entity: 'order', label: 'Accessories received', type: 'text' },
		{ entity: 'order', label: 'Under warranty', type: 'checkbox' }
	],
	'clinic-wellness': [
		{ entity: 'customer', label: 'Age', type: 'number' },
		{ entity: 'order', label: 'Visit reason', type: 'text' },
		{ entity: 'order', label: 'Visit type', type: 'select', options: 'First visit, Follow-up, Review' },
		{ entity: 'order', label: 'Follow-up date', type: 'date' }
	],
	'salon-spa': [
		{ entity: 'customer', label: 'Birthday', type: 'date' },
		{ entity: 'customer', label: 'Allergies to note', type: 'text' },
		{ entity: 'order', label: 'Preferred stylist', type: 'text' }
	],
	'education-coaching': [
		{ entity: 'customer', label: 'Guardian phone', type: 'text' },
		{ entity: 'order', label: 'Batch', type: 'text' },
		{ entity: 'order', label: 'Course start date', type: 'date' }
	],
	'cleaning-home-services': [
		{ entity: 'order', label: 'Property size (sq ft)', type: 'number' },
		{ entity: 'order', label: 'Visit time slot', type: 'select', options: 'Morning, Afternoon, Evening' }
	],
	'logistics-delivery': [
		{ entity: 'order', label: 'Pickup address', type: 'textarea' },
		{ entity: 'order', label: 'Drop address', type: 'textarea' },
		{ entity: 'order', label: 'Weight (kg)', type: 'number' }
	],
	'hospital-front-desk': [
		{ entity: 'customer', label: 'Emergency contact', type: 'text' },
		{ entity: 'order', label: 'Token number', type: 'text' }
	],
	'dental-clinic': [
		{ entity: 'order', label: 'Treatment plan stage', type: 'select', options: 'Planned, In progress, Done' }
	],
	'diagnostic-lab': [
		{ entity: 'order', label: 'Fasting sample', type: 'checkbox' },
		{ entity: 'order', label: 'Home collection', type: 'checkbox' }
	],
	'tailoring': [
		{ entity: 'order', label: 'Design reference link', type: 'url' },
		{ entity: 'order', label: 'Lining', type: 'checkbox' }
	],
	'printing-press': [
		{ entity: 'order', label: 'Colour', type: 'select', options: 'Single colour, Full colour' },
		{ entity: 'order', label: 'Finish', type: 'select', options: 'Matte, Gloss, None' }
	],
	'laundry': [
		{ entity: 'order', label: 'Stains to note', type: 'text' }
	],
	'interior-fitout': [
		{ entity: 'order', label: 'Budget', type: 'number' },
		{ entity: 'order', label: 'Site visit date', type: 'date' }
	],
	'event-services': [
		{ entity: 'order', label: 'Event venue', type: 'text' },
		{ entity: 'order', label: 'Guest count', type: 'number' }
	]
};

const alias: Record<string, string> = { 'car-garage': 'garage-service', 'bike-service': 'garage-service' };
export const fieldSuggestions = (id: string) => [...(byNiche[id] || byNiche[alias[id]] || []), ...common];

/** Make a stable field key from a label: "Fuel level" → "fuel_level". */
export const keyFromLabel = (label: string) => {
	const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
	return /^[a-z]/.test(base) ? base : base ? `f_${base}`.slice(0, 48) : '';
};

/** Make a URL-safe slug: "Sri Ram Motors" → "sri-ram-motors". */
export const slugFromName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
