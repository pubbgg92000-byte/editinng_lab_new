import { c as head } from "../../chunks/server.js";
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	let { children } = $$props;
	head("12qhfyh", $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="icon" href="data:image/svg+xml,&lt;svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22>&lt;rect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%237C5CFC%22/>&lt;path d=%22M18 20h29v8H27v5h17v8H27v15h-9z%22 fill=%22white%22/>&lt;/svg>"/> <meta name="theme-color" content="#0F1115"/>`);
	});
	children($$renderer);
	$$renderer.push(`<!---->`);
}
//#endregion
export { _layout as default };
