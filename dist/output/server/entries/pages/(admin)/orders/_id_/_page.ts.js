import { i as orders } from "../../../../../chunks/data.js";
import { error } from "@sveltejs/kit";
//#region src/routes/(admin)/orders/[id]/+page.ts
var load = ({ params }) => {
	const order = orders.find((o) => o.id === params.id);
	if (!order) error(404, "Order not found");
	return { order };
};
//#endregion
export { load };
