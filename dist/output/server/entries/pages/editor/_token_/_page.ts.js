import { i as orders, n as editors } from "../../../../chunks/data.js";
import { error } from "@sveltejs/kit";
//#region src/routes/editor/[token]/+page.ts
var load = ({ params }) => {
	const editor = editors.find((e) => e.token === params.token);
	if (!editor) error(404, "This secure editor link is invalid or has expired.");
	return {
		editor,
		tasks: orders.flatMap((order) => order.tasks.filter((task) => task.assignee === editor.name).map((task) => ({
			...task,
			orderId: order.id,
			project: order.project,
			customer: order.customer,
			workType: order.workType,
			fileLink: order.fileLink
		})))
	};
};
//#endregion
export { load };
