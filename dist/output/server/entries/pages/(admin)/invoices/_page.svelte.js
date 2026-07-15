import { A as escape_html, s as ensure_array_like } from "../../../../chunks/server.js";
import { i as orders, r as money } from "../../../../chunks/data.js";
import { t as Download } from "../../../../chunks/download.js";
import { t as Sheet } from "../../../../chunks/sheet.js";
import { t as PageHeader } from "../../../../chunks/PageHeader.js";
import { t as StatusBadge } from "../../../../chunks/StatusBadge.js";
//#region src/routes/(admin)/invoices/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		PageHeader($$renderer, {
			eyebrow: "Bills and payment tracking",
			title: "Invoices",
			action: "New invoice"
		});
		$$renderer.push(`<!----> <div class="invoice-summary svelte-1lsvxo4"><div class="svelte-1lsvxo4"><span class="svelte-1lsvxo4">Outstanding</span><strong class="svelte-1lsvxo4">${escape_html(money(37500))}</strong></div><div class="svelte-1lsvxo4"><span class="svelte-1lsvxo4">Collected this month</span><strong class="svelte-1lsvxo4">${escape_html(money(64200))}</strong></div><button class="secondary svelte-1lsvxo4">`);
		Download($$renderer, { size: 13 });
		$$renderer.push(`<!----> Export .xlsx</button></div> <div class="card table-wrap"><table class="data-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody><!--[-->`);
		const each_array = ensure_array_like(orders);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let order = each_array[$$index];
			$$renderer.push(`<tr><td><strong>INV-${escape_html(order.id.slice(-4))}</strong><small>${escape_html(order.project)}</small></td><td>${escape_html(order.customer)}</td><td>${escape_html(money(order.price))}</td><td>${escape_html(money(order.paid))}</td><td>${escape_html(money(order.price - order.paid))}</td><td>`);
			StatusBadge($$renderer, { status: order.paid === order.price ? "Paid" : order.paid ? "Partially paid" : "Unpaid" });
			$$renderer.push(`<!----></td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div> <div class="sheet-note svelte-1lsvxo4">`);
		Sheet($$renderer, { size: 14 });
		$$renderer.push(`<!----><span>Payment changes are written to Google Sheets immediately.</span></div>`);
	});
}
//#endregion
export { _page as default };
