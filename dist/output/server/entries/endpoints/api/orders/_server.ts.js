import { n as logActivity, t as appendSheetRow } from "../../../../chunks/googleSheets.js";
import { r as verifySession } from "../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/orders/+server.ts
var POST = async ({ request, cookies }) => {
	if (!await verifySession(cookies.get("studioflow_session"))) return json({
		ok: false,
		error: "Unauthorized"
	}, { status: 401 });
	const order = await request.json();
	const result = await appendSheetRow("Orders", [
		order.id,
		order.customer,
		order.project,
		order.workType,
		order.files,
		order.due,
		order.price,
		"Received"
	]);
	await logActivity("Order created", order.id, order.project);
	return json({
		ok: true,
		sync: result
	}, { status: 201 });
};
//#endregion
export { POST };
