import { A as escape_html, O as attr, a as derived, h as unsubscribe_stores, i as bind_props, m as store_get, s as ensure_array_like, t as attr_class } from "../../../../chunks/server.js";
import { r as money } from "../../../../chunks/data.js";
import { t as customerStore } from "../../../../chunks/app.js";
import { t as Check } from "../../../../chunks/check.js";
import { t as Message_circle } from "../../../../chunks/message-circle.js";
import { t as Search } from "../../../../chunks/search.js";
import { t as Sheet } from "../../../../chunks/sheet.js";
import { t as PageHeader } from "../../../../chunks/PageHeader.js";
import { t as Modal } from "../../../../chunks/Modal.js";
//#region src/lib/components/NewCustomerModal.svelte
function NewCustomerModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = void 0, onsaved = () => {} } = $$props;
		let name = "";
		let business = "";
		let phone = "";
		let whatsapp = "";
		let email = "";
		let address = "";
		let gst = "";
		let saving = false;
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			{
				function footer($$renderer) {
					$$renderer.push(`<button class="secondary">Cancel</button><button class="primary"${attr("disabled", saving, true)}>${escape_html("Add customer")}</button>`);
				}
				Modal($$renderer, {
					title: "Add new customer",
					get open() {
						return open;
					},
					set open($$value) {
						open = $$value;
						$$settled = false;
					},
					footer,
					children: ($$renderer) => {
						$$renderer.push(`<div class="form-grid"><div class="field"><label for="customer-name">Customer name *</label><input id="customer-name"${attr("value", name)} placeholder="e.g. Rahul Sharma"/></div> <div class="field"><label for="business-name">Business name</label><input id="business-name"${attr("value", business)} placeholder="e.g. Rahul Photography"/></div> <div class="field"><label for="customer-phone">Phone number *</label><input id="customer-phone"${attr("value", phone)} placeholder="+91 98765 43210"/></div> <div class="field"><label for="customer-whatsapp">WhatsApp number</label><input id="customer-whatsapp"${attr("value", whatsapp)} placeholder="Same as phone if blank"/></div> <div class="field"><label for="customer-email">Email</label><input id="customer-email"${attr("value", email)} type="email" placeholder="name@studio.com"/></div> <div class="field"><label for="customer-gst">GST details</label><input id="customer-gst"${attr("value", gst)} placeholder="Optional"/></div></div> <div class="field address svelte-jd1ca5"><label for="customer-address">Address</label><textarea id="customer-address" placeholder="Billing address">`);
						const $$body = escape_html(address);
						if ($$body) $$renderer.push(`${$$body}`);
						$$renderer.push(`</textarea></div> `);
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]-->`);
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
//#region src/routes/(admin)/customers/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let query = "";
		let showNewCustomer = false;
		let toast = "";
		const filtered = derived(() => store_get($$store_subs ??= {}, "$customerStore", customerStore).filter((customer) => (customer.name + customer.business + customer.phone).toLowerCase().includes(query.toLowerCase())));
		function customerSaved(customer, synced) {
			customerStore.update((items) => [customer, ...items]);
			toast = synced ? "Customer added and synced to Google Sheets" : "Customer added in demo mode";
			setTimeout(() => toast = "", 3e3);
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			PageHeader($$renderer, {
				eyebrow: "People you work with",
				title: "Customers",
				action: "New customer",
				onclick: () => showNewCustomer = true
			});
			$$renderer.push(`<!----> <div class="list-tools svelte-rswdxj"><div class="filter svelte-rswdxj">`);
			Search($$renderer, { size: 15 });
			$$renderer.push(`<!----><input${attr("value", query)} placeholder="Search customers" aria-label="Search customers" class="svelte-rswdxj"/></div> <div class="tool-actions svelte-rswdxj"><a class="sheet-link svelte-rswdxj" href="/settings/sheets">`);
			Sheet($$renderer, { size: 13 });
			$$renderer.push(`<!----> Sheets data</a><span class="svelte-rswdxj">${escape_html(filtered().length)} customers</span></div></div> <div class="card table-wrap"><table class="data-table"><thead><tr><th>Customer</th><th>Phone</th><th>Projects</th><th>Pending</th><th></th></tr></thead><tbody><!--[-->`);
			const each_array = ensure_array_like(filtered());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let customer = each_array[$$index];
				$$renderer.push(`<tr><td><strong>${escape_html(customer.business)}</strong><small>${escape_html(customer.name)} · ${escape_html(customer.id)}</small></td><td>${escape_html(customer.phone)}</td><td>${escape_html(customer.projects)}</td><td${attr_class("svelte-rswdxj", void 0, { "clear": customer.pending === 0 })}>${escape_html(customer.pending ? money(customer.pending) : "All clear")}</td><td><div class="row-actions svelte-rswdxj"><a class="whatsapp svelte-rswdxj"${attr("href", "https://wa.me/" + customer.phone.replace(/\D/g, ""))} aria-label="WhatsApp customer">`);
				Message_circle($$renderer, { size: 14 });
				$$renderer.push(`<!----></a><a class="open-button"${attr("href", "/customer/" + customer.token)}>Open</a></div></td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div> `);
			NewCustomerModal($$renderer, {
				onsaved: customerSaved,
				get open() {
					return showNewCustomer;
				},
				set open($$value) {
					showNewCustomer = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----> `);
			if (toast) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="toast svelte-rswdxj">`);
				Check($$renderer, { size: 15 });
				$$renderer.push(`<!---->${escape_html(toast)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
