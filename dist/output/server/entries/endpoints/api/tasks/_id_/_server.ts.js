import { n as logActivity, t as appendSheetRow } from "../../../../../chunks/googleSheets.js";
import { i as orders, n as editors } from "../../../../../chunks/data.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/tasks/[id]/+server.ts
var PATCH = async ({ params, request }) => {
	const update = await request.json();
	const editor = editors.find((item) => item.token === update.token);
	const task = orders.flatMap((order) => order.tasks).find((item) => item.id === params.id);
	if (!editor || !task || task.assignee !== editor.name) return json({
		ok: false,
		error: "Invalid or expired task access"
	}, { status: 403 });
	const result = await appendSheetRow("Task Updates", [
		(/* @__PURE__ */ new Date()).toISOString(),
		params.id,
		update.status,
		update.progress,
		update.notes || ""
	]);
	await logActivity("Task updated", params.id, `${update.status} · ${update.progress}%`);
	return json({
		ok: true,
		sync: result
	});
};
//#endregion
export { PATCH };
