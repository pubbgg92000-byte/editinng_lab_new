import assert from 'node:assert/strict';
import {
	allCapabilities,
	builtInPackages,
	capabilityKeys,
	capabilityRegistry,
	profileForPackage,
	resolveCapabilities,
	statusFor,
	validateCustomValues,
	validatePreferences
} from '../src/lib/capabilities.ts';
import { capabilitiesForPath } from '../src/lib/server/capabilityRoutes.ts';
import {
	availableTemplatePlaceholders,
	customerPortalSections,
	mergeModuleConfiguration,
	moduleDefaultsForPreset,
	moduleOverridesFromEffective,
	placeholdersInTemplate,
	templateForScenario,
	validateModuleConfiguration
} from '../src/lib/moduleConfiguration.ts';
import { fillTemplate } from '../src/lib/messageTemplates.ts';

assert.equal(capabilityKeys.length, 15, 'all initial capabilities must be registered');
for (const key of capabilityKeys) {
	const definition = capabilityRegistry[key];
	assert.equal(definition.key, key);
	assert.ok(definition.label && definition.description);
	assert.ok(definition.version >= 1);
	for (const dependency of definition.dependencies) assert.ok(capabilityRegistry[dependency], `${key} has an unknown dependency`);
}

const blockedByOwner = resolveCapabilities({ ...allCapabilities, 'billing.invoices': false }, { ...allCapabilities, 'billing.invoices': true });
assert.equal(blockedByOwner['billing.invoices'], false, 'a tenant preference cannot exceed its owner allowance');
assert.equal(blockedByOwner['billing.partialInvoices'], false, 'dependants must become ineffective');
assert.equal(blockedByOwner['billing.duration'], false, 'transitive invoice dependants must become ineffective');

const dependencyOff = resolveCapabilities({ ...allCapabilities }, { ...allCapabilities, 'work.tasks': false });
assert.equal(dependencyOff['work.staffPortal'], false);
assert.equal(dependencyOff['work.assignedAssets'], false);
assert.equal(dependencyOff['billing.partialInvoices'], false);
const restored = resolveCapabilities({ ...allCapabilities }, { ...allCapabilities });
assert.equal(restored['work.staffPortal'], true, 'stored preferences restore when dependencies return');

assert.throws(
	() => validatePreferences({ 'billing.invoices': true }, { 'billing.invoices': false }),
	(error) => error.status === 403 && /not allowed/.test(error.message),
	'ungranted client capability changes must be denied with 403'
);
assert.throws(() => validatePreferences({ 'unknown.module': true }, allCapabilities), /Unknown capability/);

assert.deepEqual(
	builtInPackages.map((item) => item.id),
	[
		'editing-studio', 'garage-service', 'salon-spa', 'small-shop', 'contractor-services',
		'hospitality-lite', 'electronics-repair', 'clinic-wellness',
		'education-coaching', 'cleaning-home-services', 'logistics-delivery',
		'event-services', 'property-services', 'general-service'
	]
);
for (const niche of ['small-shop', 'hospitality-lite']) {
	const item = builtInPackages.find((candidate) => candidate.id === niche);
	assert.equal(item.allowed['work.tasks'], false);
	assert.equal(item.allowed['work.staffPortal'], false);
}
for (const item of builtInPackages.filter((candidate) => candidate.id !== 'editing-studio')) {
	const visibleVocabulary = JSON.stringify({ terminology: item.profile.terminology, statuses: Object.values(item.profile.statuses).map((status) => status.label) });
	assert.doesNotMatch(visibleVocabulary, /\b(editor|editing|video|studio)\b/i, `${item.id} exposes editing-studio wording`);
}
assert.equal(Object.values(resolveCapabilities(builtInPackages[0].allowed, builtInPackages[0].enabled)).every(Boolean), true, 'editing compatibility package must retain every current feature');

const garage = builtInPackages.find((item) => item.id === 'garage-service');
assert.equal(garage.profile.terminology.order.singular, 'Job Card');
assert.equal(statusFor(garage.profile, 'Ready Delivery').label, 'Ready for Pickup');
assert.deepEqual(validateCustomValues(garage.profile, 'order', {
	vehicle_registration: 'KA01AB1234',
	vehicle_make_model: 'Honda City',
	odometer: '42500'
}), {
	vehicle_registration: 'KA01AB1234',
	vehicle_make_model: 'Honda City',
	odometer: 42500
});
assert.throws(() => validateCustomValues(garage.profile, 'order', { vehicle_registration: '' }), /required/);
assert.deepEqual(capabilitiesForPath('/api/orders/ORD-1/tasks'), ['work.tasks']);
assert.deepEqual(capabilitiesForPath('/api/orders/ORD-1/payments'), ['billing.payments']);
assert.deepEqual(capabilitiesForPath('/api/orders/ORD-1/customer-whatsapp'), ['communications.whatsapp', 'workflow.delivery']);
assert.deepEqual(capabilitiesForPath('/api/editors/ED-1/whatsapp'), ['work.staff', 'communications.whatsapp', 'work.staffPortal']);
assert.deepEqual(capabilitiesForPath('/api/export'), ['reports.excelExport']);

const tenantField = {
	key: 'preferred_bay', entity: 'order', label: 'Preferred bay', type: 'text',
	required: false, active: true, order: 99,
	visibility: { admin: true, customerPortal: false, staffPortal: false, whatsapp: false, sheets: true, export: true }
};
const upgradedGarage = { ...garage, version: 2, profile: { ...garage.profile, presetVersion: 2 } };
const mergedProfile = profileForPackage({ ...garage.profile, customFields: [...garage.profile.customFields, tenantField] }, upgradedGarage);
assert.equal(mergedProfile.presetVersion, 2);
assert.ok(mergedProfile.customFields.some((field) => field.key === 'preferred_bay'), 'package upgrades preserve tenant-added fields');

for (const item of builtInPackages) {
	const modules = moduleDefaultsForPreset(item.id);
	assert.ok(modules['portal.customer'].milestones.length >= 3, `${item.id} needs useful customer milestones`);
	assert.ok(modules['work.staffPortal'].milestones.length >= 3, `${item.id} needs useful worker milestones`);
	assert.ok(Object.keys(modules['communications.whatsapp'].templates).length >= 10, `${item.id} needs a complete message catalog`);
	validateModuleConfiguration(modules, item.profile, item.allowed);
	for (const template of Object.values(modules['communications.whatsapp'].templates)) {
		const values = Object.fromEntries(availableTemplatePlaceholders(template.context, item.profile).map((key) => [key, `sample-${key}`]));
		assert.doesNotMatch(fillTemplate(template.body, values), /{{[^{}]+}}/, `${item.id}/${template.id} leaves an unresolved variable`);
	}
}

const garageModules = moduleDefaultsForPreset('garage-service');
assert.equal(garageModules['portal.customer'].deliveryExperience, 'pickup');
assert.equal(garageModules['work.staffPortal'].progressMode, 'both');
assert.deepEqual(customerPortalSections({ ...garageModules['portal.customer'], mode: 'status-only' }), {
	summary: true,
	progress: true,
	tasks: false,
	billing: false,
	payments: false,
	delivery: false,
	documents: false,
	customFields: true
});
assert.deepEqual(placeholdersInTemplate('Hello {{customer}}, {{order_id}}'), ['customer', 'order_id']);
const whatsappGarageProfile = structuredClone(garage.profile);
whatsappGarageProfile.customFields.find((field) => field.key === 'vehicle_registration').visibility.whatsapp = true;
whatsappGarageProfile.customFields.push({
	key: 'staff_certification', entity: 'staff', label: 'Certification', type: 'text',
	required: false, active: true, order: 100,
	visibility: { admin: true, customerPortal: false, staffPortal: true, whatsapp: true, sheets: true, export: true }
});
assert.ok(availableTemplatePlaceholders('order', whatsappGarageProfile).includes('order.vehicle_registration'));
assert.ok(!availableTemplatePlaceholders('invoice', whatsappGarageProfile).includes('staff.staff_certification'), 'message builders expose only custom fields available in their rendering context');
assert.ok(availableTemplatePlaceholders('assignment', whatsappGarageProfile).includes('staff.staff_certification'));

const customTemplate = {
	id: 'custom-garage-update',
	name: 'Garage inspection update',
	audience: 'customer',
	scenario: 'status-update',
	enabled: true,
	body: 'Hello {{customer}}, your {{order_label}} {{order_id}} is now {{status}}.',
	source: 'custom',
	context: 'order'
};
const customizedModules = structuredClone(garageModules);
customizedModules['portal.customer'].mode = 'full';
customizedModules['communications.whatsapp'].templates[customTemplate.id] = customTemplate;
const overrides = moduleOverridesFromEffective(garageModules, customizedModules);
const upgradedModules = mergeModuleConfiguration(moduleDefaultsForPreset('garage-service'), overrides);
assert.equal(upgradedModules['portal.customer'].mode, 'full', 'tenant portal choices survive package upgrades');
assert.equal(upgradedModules['communications.whatsapp'].templates[customTemplate.id].source, 'custom', 'custom templates survive package upgrades');
const deletedTemplateModules = structuredClone(garageModules);
const deletedTemplateId = deletedTemplateModules['communications.whatsapp'].defaultTemplateIds.ready;
delete deletedTemplateModules['communications.whatsapp'].defaultTemplateIds.ready;
delete deletedTemplateModules['communications.whatsapp'].templates[deletedTemplateId];
deletedTemplateModules['communications.whatsapp'].deletedTemplateIds.push(deletedTemplateId);
const deletionOverrides = moduleOverridesFromEffective(garageModules, deletedTemplateModules);
const modulesAfterDeletion = mergeModuleConfiguration(moduleDefaultsForPreset('garage-service'), deletionOverrides);
assert.equal(modulesAfterDeletion['communications.whatsapp'].templates[deletedTemplateId], undefined, 'administrator-deleted package templates stay deleted after merging package defaults');
assert.equal(templateForScenario(customizedModules, 'status-update', 'missing-template'), undefined, 'an explicitly requested unknown template must not silently fall back');
assert.equal(templateForScenario(customizedModules, 'invoice', customTemplate.id), undefined, 'a template requested for the wrong scenario must be rejected');
assert.doesNotThrow(
	() => validateModuleConfiguration(garageModules, garage.profile, { ...garage.allowed, 'communications.whatsapp': false }),
	'disabled capabilities retain their saved package configuration for safe re-enabling and rollback'
);
assert.throws(
	() => validateModuleConfiguration({
		...garageModules,
		'communications.whatsapp': {
			...garageModules['communications.whatsapp'],
			templates: {
				...garageModules['communications.whatsapp'].templates,
				broken: { ...customTemplate, id: 'broken', body: 'Hello {{unknown_value}}' }
			}
		}
	}, garage.profile, garage.allowed),
	/unknown_value/,
	'unknown message variables must block saving'
);
assert.throws(
	() => validateModuleConfiguration({
		...garageModules,
		'communications.whatsapp': {
			...garageModules['communications.whatsapp'],
			templates: {
				...garageModules['communications.whatsapp'].templates,
				'customer-status': { ...garageModules['communications.whatsapp'].templates['customer-status'], context: 'invoice' }
			}
		}
	}, garage.profile, garage.allowed),
	/not compatible/,
	'message purpose, audience, and rendering context must agree'
);

console.log(`Capability audit passed: ${capabilityKeys.length} capabilities, ${builtInPackages.length} niche packages.`);
