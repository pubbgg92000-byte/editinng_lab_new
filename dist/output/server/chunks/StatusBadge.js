import { A as escape_html, a as derived, t as attr_class } from "./server.js";
//#region src/lib/components/StatusBadge.svelte
function StatusBadge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { status } = $$props;
		const tone = derived(() => status.includes("Completed") || status.includes("Paid") || status.includes("Ready") ? "green" : status.includes("Review") || status.includes("Editing") || status.includes("progress") ? "purple" : status.includes("Revision") || status.includes("Overdue") ? "red" : "gray");
		$$renderer.push(`<span${attr_class("badge", void 0, {
			"green": tone() === "green",
			"purple": tone() === "purple",
			"red": tone() === "red"
		})}><span class="dot"></span>${escape_html(status)}</span>`);
	});
}
//#endregion
export { StatusBadge as t };
