// Loads active/archived customers with their orders and invoices for related views.
import { readyDatabase } from '$lib/server/db';
import { listCustomers, listInvoices, listOrders } from '$lib/server/repository';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability } from '$lib/capabilities';
export const load = async ({ locals }) => {
	const database = await readyDatabase(locals.tenant);
	const configuration = await getTenantConfiguration(database, locals.tenant!);
	const [customers, orders, invoices] = await Promise.all([listCustomers(database, true), listOrders(database), hasCapability(configuration.effectiveCapabilities, 'billing.invoices') ? listInvoices(database) : Promise.resolve([])]);
	return { customers, orders, invoices, configuration };
};
