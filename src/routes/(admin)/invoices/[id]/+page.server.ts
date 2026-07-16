import { error } from '@sveltejs/kit';
import { readyDatabase } from '$lib/server/db';
import { getInvoice, getOrder, listActivity } from '$lib/server/repository';

export const load = async ({ params, platform }) => {
	const database = await readyDatabase(platform);
	const invoice = await getInvoice(database, params.id);
	if (!invoice) error(404, 'Invoice not found');
	const order = await getOrder(database, invoice.orderId);
	return { invoice, order, activity: await listActivity(database, 'invoice', invoice.id) };
};
