import { A as escape_html, O as attr, a as derived, c as head, s as ensure_array_like, t as attr_class } from "../../../../chunks/server.js";
import { r as money } from "../../../../chunks/data.js";
import { t as Arrow_up_right } from "../../../../chunks/arrow-up-right.js";
import { t as Check } from "../../../../chunks/check.js";
import { n as Circle, t as File_text } from "../../../../chunks/file-text.js";
import { t as Clock_3 } from "../../../../chunks/clock-3.js";
import { t as Download } from "../../../../chunks/download.js";
import { t as Message_circle } from "../../../../chunks/message-circle.js";
import { t as PortalHeader } from "../../../../chunks/PortalHeader.js";
//#region src/routes/customer/[token]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let selected = data.orders[0];
		const steps = derived(() => [
			["Files received", "done"],
			["Work assigned", "done"],
			["Editing in progress", selected.progress > 30 ? "done" : "current"],
			["Quality review", selected.status === "Waiting Review" ? "current" : selected.progress >= 100 ? "done" : ""],
			["Ready for delivery", selected.status === "Ready Delivery" ? "current" : ""],
			["Delivered", selected.status === "Completed" ? "done" : ""]
		]);
		head("1fflwz", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(data.customer.business)} — StudioFlow</title>`);
			});
		});
		PortalHeader($$renderer, { label: "Customer portal" });
		$$renderer.push(`<!----> <main class="customer-main svelte-1fflwz"><div class="hello svelte-1fflwz"><p class="svelte-1fflwz">Hello ${escape_html(data.customer.name.split(" ")[0])} 👋</p><h1 class="svelte-1fflwz">Your projects</h1><span class="svelte-1fflwz">Track progress, invoices and deliveries in one place.</span></div>`);
		if (data.orders.length > 1) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="project-switch svelte-1fflwz"><!--[-->`);
			const each_array = ensure_array_like(data.orders);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let order = each_array[$$index];
				$$renderer.push(`<button${attr_class("svelte-1fflwz", void 0, { "active": selected.id === order.id })}>${escape_html(order.project)}</button>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--><section class="project-card card svelte-1fflwz"><div class="project-head svelte-1fflwz"><div class="svelte-1fflwz"><span class="svelte-1fflwz">${escape_html(selected.workType)}</span><h2 class="svelte-1fflwz">${escape_html(selected.project)}</h2><p class="svelte-1fflwz">${escape_html(selected.id)} · Delivery ${escape_html(selected.due)}</p></div><span class="percent svelte-1fflwz"><strong class="svelte-1fflwz">${escape_html(selected.progress)}%</strong> complete</span></div><div class="customer-progress svelte-1fflwz"><!--[-->`);
		const each_array_1 = ensure_array_like(steps());
		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let step = each_array_1[i];
			$$renderer.push(`<div${attr_class("svelte-1fflwz", void 0, {
				"done": step[1] === "done",
				"current": step[1] === "current"
			})}><span class="svelte-1fflwz">`);
			if (step[1] === "done") {
				$$renderer.push("<!--[0-->");
				Check($$renderer, { size: 13 });
			} else if (step[1] === "current") {
				$$renderer.push("<!--[1-->");
				Clock_3($$renderer, { size: 13 });
			} else {
				$$renderer.push("<!--[-1-->");
				Circle($$renderer, { size: 9 });
			}
			$$renderer.push(`<!--]--></span><strong class="svelte-1fflwz">${escape_html(step[0])}</strong>`);
			if (i < steps().length - 1) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<i class="svelte-1fflwz"></i>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></section><div class="customer-grid svelte-1fflwz"><section class="card invoice svelte-1fflwz"><div class="section-title svelte-1fflwz"><span class="svelte-1fflwz">`);
		File_text($$renderer, { size: 16 });
		$$renderer.push(`<!----></span><div><h2 class="svelte-1fflwz">Invoice</h2><p class="svelte-1fflwz">INV-${escape_html(selected.id.slice(-4))}</p></div><button class="svelte-1fflwz">`);
		Download($$renderer, { size: 13 });
		$$renderer.push(`<!----> Download</button></div><div class="money-grid svelte-1fflwz"><div class="svelte-1fflwz"><span class="svelte-1fflwz">Total</span><strong class="svelte-1fflwz">${escape_html(money(selected.price))}</strong></div><div class="svelte-1fflwz"><span class="svelte-1fflwz">Paid</span><strong class="green svelte-1fflwz">${escape_html(money(selected.paid))}</strong></div><div class="svelte-1fflwz"><span class="svelte-1fflwz">Balance</span><strong class="svelte-1fflwz">${escape_html(money(selected.price - selected.paid))}</strong></div></div></section><section class="card delivery svelte-1fflwz"><div class="section-title svelte-1fflwz"><span class="svelte-1fflwz">`);
		Download($$renderer, { size: 16 });
		$$renderer.push(`<!----></span><div><h2 class="svelte-1fflwz">Project files</h2><p class="svelte-1fflwz">${escape_html(selected.status === "Ready Delivery" ? "Your files are ready" : "Available after final approval")}</p></div></div>`);
		if (selected.status === "Ready Delivery" || selected.status === "Completed") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a${attr("href", "https://" + selected.fileLink)} class="svelte-1fflwz">Download files `);
			Arrow_up_right($$renderer, { size: 13 });
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<span class="locked svelte-1fflwz">Delivery link will appear here</span>`);
		}
		$$renderer.push(`<!--]--></section></div><a class="whatsapp svelte-1fflwz"${attr("href", "https://wa.me/" + data.customer.phone.replace(/\D/g, ""))}>`);
		Message_circle($$renderer, { size: 16 });
		$$renderer.push(`<!----> Chat with the studio on WhatsApp</a><p class="privacy svelte-1fflwz">This private link shows only your projects, payments and approved progress updates.</p></main>`);
	});
}
//#endregion
export { _page as default };
