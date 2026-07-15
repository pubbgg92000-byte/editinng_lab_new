import { A as escape_html } from "./server.js";
//#region src/lib/components/PortalHeader.svelte
function PortalHeader($$renderer, $$props) {
	let { label = "" } = $$props;
	$$renderer.push(`<header class="portal-header svelte-cxitux"><a href="/" class="brand svelte-cxitux"><span class="mark svelte-cxitux"><span></span><span></span><span></span></span><strong>StudioFlow</strong></a>`);
	if (label) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<span class="portal-label svelte-cxitux">${escape_html(label)}</span>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></header>`);
}
//#endregion
export { PortalHeader as t };
