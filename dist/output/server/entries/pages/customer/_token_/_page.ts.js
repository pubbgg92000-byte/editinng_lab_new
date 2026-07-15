import { i as orders, t as customers } from "../../../../chunks/data.js";
import { error } from "@sveltejs/kit";
//#region src/routes/customer/[token]/+page.ts
var load = ({ params }) => {
	const customer = customers.find((c) => c.token === params.token);
	if (!customer) error(404, "This secure customer link is invalid or has expired.");
	const customerOrders = orders.filter((o) => o.customer === customer.business);
	return {
		customer,
		orders: customerOrders.length ? customerOrders : [orders[0]]
	};
};
//#endregion
export { load };
