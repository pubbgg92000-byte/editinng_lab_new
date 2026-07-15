import { O as attr, i as bind_props } from "./server.js";
import { t as Modal } from "./Modal.js";
//#region src/lib/components/NewOrderModal.svelte
function NewOrderModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = void 0, onsaved = () => {} } = $$props;
		let project = "";
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			{
				function footer($$renderer) {
					$$renderer.push(`<button class="secondary">Cancel</button><button class="primary">Create order</button>`);
				}
				Modal($$renderer, {
					title: "Create new order",
					get open() {
						return open;
					},
					set open($$value) {
						open = $$value;
						$$settled = false;
					},
					footer,
					children: ($$renderer) => {
						$$renderer.push(`<div class="form-grid"><div class="field"><label for="customer">Customer</label><select id="customer">`);
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`Rahul Photography`);
						});
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`AM Studios`);
						});
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`Frame House`);
						});
						$$renderer.push(`</select></div> <div class="field"><label for="project">Project name</label><input id="project"${attr("value", project)} placeholder="e.g. Neha Wedding"/></div> <div class="field"><label for="work">Work type</label><select id="work">`);
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`Photo editing`);
						});
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`Video editing`);
						});
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`Album design`);
						});
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`Retouching`);
						});
						$$renderer.push(`</select></div> <div class="field"><label for="date">Delivery date</label><input id="date" type="date"/></div> <div class="field"><label for="files">Number of files</label><input id="files" type="number" placeholder="0"/></div> <div class="field"><label for="price">Price (₹)</label><input id="price" type="number" placeholder="0"/></div></div> <div class="field note svelte-z6jk0z"><label for="instructions">Special instructions</label><textarea id="instructions" placeholder="Editing style, reference links, delivery notes..."></textarea></div>`);
					},
					$$slots: {
						footer: true,
						default: true
					}
				});
			}
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		bind_props($$props, { open });
	});
}
//#endregion
export { NewOrderModal as t };
