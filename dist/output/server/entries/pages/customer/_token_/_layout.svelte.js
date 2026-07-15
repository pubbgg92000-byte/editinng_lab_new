import "../../../../chunks/server.js";
import { t as Arrow_left } from "../../../../chunks/arrow-left.js";
//#region src/routes/customer/[token]/+layout.svelte
function _layout($$renderer, $$props) {
	let { children } = $$props;
	children($$renderer);
	$$renderer.push(`<!----> <button class="customer-back svelte-kbd33k" aria-label="Go back to customers">`);
	Arrow_left($$renderer, { size: 15 });
	$$renderer.push(`<!----> Back to customers</button>`);
}
//#endregion
export { _layout as default };
