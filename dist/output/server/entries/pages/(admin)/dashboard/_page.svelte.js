import { A as escape_html, O as attr, d as sanitize_props, f as slot, n as attr_style, p as spread_props, s as ensure_array_like } from "../../../../chunks/server.js";
import { i as orders } from "../../../../chunks/data.js";
import { t as Icon } from "../../../../chunks/Icon.js";
import { t as Arrow_up_right } from "../../../../chunks/arrow-up-right.js";
import { t as Check } from "../../../../chunks/check.js";
import { t as Clipboard_list } from "../../../../chunks/clipboard-list.js";
import { t as Clock_3 } from "../../../../chunks/clock-3.js";
import { t as PageHeader } from "../../../../chunks/PageHeader.js";
import { t as StatusBadge } from "../../../../chunks/StatusBadge.js";
import { t as NewOrderModal } from "../../../../chunks/NewOrderModal.js";
//#region node_modules/lucide-svelte/dist/icons/package-check.svelte
function Package_check($$renderer, $$props) {
	/**
	* @license lucide-svelte v1.0.1 - ISC
	*
	* ISC License
	*
	* Copyright (c) 2026 Lucide Icons and Contributors
	*
	* Permission to use, copy, modify, and/or distribute this software for any
	* purpose with or without fee is hereby granted, provided that the above
	* copyright notice and this permission notice appear in all copies.
	*
	* THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
	* WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
	* MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
	* ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
	* WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
	* ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
	* OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	*
	* ---
	*
	* The following Lucide icons are derived from the Feather project:
	*
	* airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out
	*
	* The MIT License (MIT) (for the icons listed above)
	*
	* Copyright (c) 2013-present Cole Bemis
	*
	* Permission is hereby granted, free of charge, to any person obtaining a copy
	* of this software and associated documentation files (the "Software"), to deal
	* in the Software without restriction, including without limitation the rights
	* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	* copies of the Software, and to permit persons to whom the Software is
	* furnished to do so, subject to the following conditions:
	*
	* The above copyright notice and this permission notice shall be included in all
	* copies or substantial portions of the Software.
	*
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	* SOFTWARE.
	*
	*/
	Icon($$renderer, spread_props([
		{ name: "package-check" },
		sanitize_props($$props),
		{
			/**
			* @component @name PackageCheck
			* @description Lucide SVG icon component, renders SVG Element with children.
			*
			* @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMjJWMTIiIC8+CiAgPHBhdGggZD0ibTE2IDE3IDIgMiA0LTQiIC8+CiAgPHBhdGggZD0iTTIxIDExLjEyN1Y4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzI5bDcgNGEyIDIgMCAwIDAgMiAuMDAxbDEuMzItLjc1MyIgLz4KICA8cGF0aCBkPSJNMy4yOSA3IDEyIDEybDguNzEtNSIgLz4KICA8cGF0aCBkPSJtNy41IDQuMjcgOC45OTcgNS4xNDgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/package-check
			* @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
			*
			* @param {Object} props - Lucide icons props and any valid SVG attribute
			* @returns {FunctionalComponent} Svelte component
			*
			*/
			iconNode: [
				["path", { "d": "M12 22V12" }],
				["path", { "d": "m16 17 2 2 4-4" }],
				["path", { "d": "M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753" }],
				["path", { "d": "M3.29 7 12 12l8.71-5" }],
				["path", { "d": "m7.5 4.27 8.997 5.148" }]
			],
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				slot($$renderer, $$props, "default", {}, null);
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
//#endregion
//#region src/routes/(admin)/dashboard/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let showNewOrder = false;
		let toast = false;
		function saved() {
			toast = true;
			setTimeout(() => toast = false, 2600);
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			PageHeader($$renderer, {
				eyebrow: "Wednesday, 15 July",
				title: "Good morning 👋",
				action: "New order",
				onclick: () => showNewOrder = true
			});
			$$renderer.push(`<!----> <section class="stat-grid"><div class="card stat-card"><p>Active orders</p><div class="stat-row"><strong>12</strong><span class="stat-icon">`);
			Clipboard_list($$renderer, { size: 17 });
			$$renderer.push(`<!----></span></div></div> <div class="card stat-card"><p>Waiting review</p><div class="stat-row"><strong>3</strong><span class="stat-icon">`);
			Clock_3($$renderer, { size: 17 });
			$$renderer.push(`<!----></span></div></div> <div class="card stat-card"><p>Ready delivery</p><div class="stat-row"><strong>2</strong><span class="stat-icon">`);
			Package_check($$renderer, { size: 17 });
			$$renderer.push(`<!----></span></div></div></section> <section class="card active-orders svelte-13ofds2"><div class="card-header svelte-13ofds2"><h2>Active orders</h2><a href="/orders" class="svelte-13ofds2">View all `);
			Arrow_up_right($$renderer, { size: 12 });
			$$renderer.push(`<!----></a></div> <!--[-->`);
			const each_array = ensure_array_like(orders.slice(0, 3));
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let order = each_array[$$index];
				$$renderer.push(`<a class="order-row svelte-13ofds2"${attr("href", "/orders/" + order.id)}><span class="order-mark svelte-13ofds2"${attr_style("", { background: order.color })}></span> <div class="order-main svelte-13ofds2"><strong class="svelte-13ofds2">${escape_html(order.project)}</strong><small class="svelte-13ofds2">${escape_html(order.customer)} · ${escape_html(order.workType)}</small></div> `);
				StatusBadge($$renderer, { status: order.status });
				$$renderer.push(`<!----> <div class="order-progress svelte-13ofds2"><div class="progress-label"><span>Progress</span><b class="svelte-13ofds2">${escape_html(order.progress)}%</b></div><div class="progress"><span${attr_style("", { width: order.progress + "%" })}></span></div></div> <span class="due svelte-13ofds2">Due ${escape_html(order.due)}</span> `);
				Arrow_up_right($$renderer, { size: 15 });
				$$renderer.push(`<!----></a>`);
			}
			$$renderer.push(`<!--]--></section> `);
			NewOrderModal($$renderer, {
				onsaved: saved,
				get open() {
					return showNewOrder;
				},
				set open($$value) {
					showNewOrder = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----> `);
			if (toast) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="toast svelte-13ofds2">`);
				Check($$renderer, { size: 15 });
				$$renderer.push(`<!----> Order created and synced to Sheets</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
export { _page as default };
