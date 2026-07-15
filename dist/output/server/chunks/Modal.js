import { A as escape_html, O as attr, i as bind_props } from "./server.js";
import { t as X } from "./x.js";
//#region src/lib/components/Modal.svelte
function Modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title, open = void 0, children, footer } = $$props;
		if (open) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="modal-backdrop svelte-ta60gp" aria-label="Close dialog"></button> <div class="modal svelte-ta60gp" role="dialog" aria-modal="true"${attr("aria-label", title)}><header class="svelte-ta60gp"><h2 class="svelte-ta60gp">${escape_html(title)}</h2><button class="icon-btn svelte-ta60gp" aria-label="Close">`);
			X($$renderer, { size: 18 });
			$$renderer.push(`<!----></button></header> <div class="modal-body svelte-ta60gp">`);
			children($$renderer);
			$$renderer.push(`<!----></div> `);
			if (footer) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<footer class="svelte-ta60gp">`);
				footer($$renderer);
				$$renderer.push(`<!----></footer>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		bind_props($$props, { open });
	});
}
//#endregion
export { Modal as t };
