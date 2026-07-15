import { A as escape_html } from "./server.js";
//#region src/lib/components/PageHeader.svelte
function PageHeader($$renderer, $$props) {
	let { title, eyebrow, action = "", onclick = void 0 } = $$props;
	$$renderer.push(`<header class="page-header"><div>`);
	if (eyebrow) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<p class="eyebrow">${escape_html(eyebrow)}</p>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--><h1>${escape_html(title)}</h1></div>`);
	if (action) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<button class="primary">+  ${escape_html(action)}</button>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></header>`);
}
//#endregion
export { PageHeader as t };
