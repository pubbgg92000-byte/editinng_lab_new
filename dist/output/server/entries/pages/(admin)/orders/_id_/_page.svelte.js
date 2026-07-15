import { A as escape_html, O as attr, d as sanitize_props, f as slot, n as attr_style, p as spread_props, s as ensure_array_like, t as attr_class } from "../../../../../chunks/server.js";
import { r as money } from "../../../../../chunks/data.js";
import { t as Icon } from "../../../../../chunks/Icon.js";
import { t as Arrow_left } from "../../../../../chunks/arrow-left.js";
import { t as Check } from "../../../../../chunks/check.js";
import { n as Circle, t as File_text } from "../../../../../chunks/file-text.js";
import { t as Clock_3 } from "../../../../../chunks/clock-3.js";
import { t as External_link } from "../../../../../chunks/external-link.js";
import { t as Message_circle } from "../../../../../chunks/message-circle.js";
import { t as StatusBadge } from "../../../../../chunks/StatusBadge.js";
//#region node_modules/lucide-svelte/dist/icons/ellipsis.svelte
function Ellipsis($$renderer, $$props) {
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
		{ name: "ellipsis" },
		sanitize_props($$props),
		{
			/**
			* @component @name Ellipsis
			* @description Lucide SVG icon component, renders SVG Element with children.
			*
			* @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxIiAvPgogIDxjaXJjbGUgY3g9IjE5IiBjeT0iMTIiIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iNSIgY3k9IjEyIiByPSIxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/ellipsis
			* @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
			*
			* @param {Object} props - Lucide icons props and any valid SVG attribute
			* @returns {FunctionalComponent} Svelte component
			*
			*/
			iconNode: [
				["circle", {
					"cx": "12",
					"cy": "12",
					"r": "1"
				}],
				["circle", {
					"cx": "19",
					"cy": "12",
					"r": "1"
				}],
				["circle", {
					"cx": "5",
					"cy": "12",
					"r": "1"
				}]
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
//#region node_modules/lucide-svelte/dist/icons/indian-rupee.svelte
function Indian_rupee($$renderer, $$props) {
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
		{ name: "indian-rupee" },
		sanitize_props($$props),
		{
			/**
			* @component @name IndianRupee
			* @description Lucide SVG icon component, renders SVG Element with children.
			*
			* @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiAzaDEyIiAvPgogIDxwYXRoIGQ9Ik02IDhoMTIiIC8+CiAgPHBhdGggZD0ibTYgMTMgOC41IDgiIC8+CiAgPHBhdGggZD0iTTYgMTNoMyIgLz4KICA8cGF0aCBkPSJNOSAxM2M2LjY2NyAwIDYuNjY3LTEwIDAtMTAiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/indian-rupee
			* @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
			*
			* @param {Object} props - Lucide icons props and any valid SVG attribute
			* @returns {FunctionalComponent} Svelte component
			*
			*/
			iconNode: [
				["path", { "d": "M6 3h12" }],
				["path", { "d": "M6 8h12" }],
				["path", { "d": "m6 13 8.5 8" }],
				["path", { "d": "M6 13h3" }],
				["path", { "d": "M9 13c6.667 0 6.667-10 0-10" }]
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
//#region node_modules/lucide-svelte/dist/icons/paperclip.svelte
function Paperclip($$renderer, $$props) {
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
		{ name: "paperclip" },
		sanitize_props($$props),
		{
			/**
			* @component @name Paperclip
			* @description Lucide SVG icon component, renders SVG Element with children.
			*
			* @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTYgNi04LjQxNCA4LjU4NmEyIDIgMCAwIDAgMi44MjkgMi44MjlsOC40MTQtOC41ODZhNCA0IDAgMSAwLTUuNjU3LTUuNjU3bC04LjM3OSA4LjU1MWE2IDYgMCAxIDAgOC40ODUgOC40ODVsOC4zNzktOC41NTEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/paperclip
			* @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
			*
			* @param {Object} props - Lucide icons props and any valid SVG attribute
			* @returns {FunctionalComponent} Svelte component
			*
			*/
			iconNode: [["path", { "d": "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" }]],
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
//#region node_modules/lucide-svelte/dist/icons/plus.svelte
function Plus($$renderer, $$props) {
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
		{ name: "plus" },
		sanitize_props($$props),
		{
			/**
			* @component @name Plus
			* @description Lucide SVG icon component, renders SVG Element with children.
			*
			* @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KICA8cGF0aCBkPSJNMTIgNXYxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/plus
			* @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
			*
			* @param {Object} props - Lucide icons props and any valid SVG attribute
			* @returns {FunctionalComponent} Svelte component
			*
			*/
			iconNode: [["path", { "d": "M5 12h14" }], ["path", { "d": "M12 5v14" }]],
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
//#region src/routes/(admin)/orders/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const order = data.order;
		let tab = "Overview";
		const timeline = [
			[
				"Received",
				"12 Jul · 10:24",
				"done"
			],
			[
				"Assigned",
				"12 Jul · 14:10",
				"done"
			],
			[
				"Editing",
				"In progress",
				"current"
			],
			[
				"Review",
				"Next",
				""
			],
			[
				"Completed",
				"—",
				""
			]
		];
		$$renderer.push(`<div class="detail-top svelte-2yql63"><a href="/orders" class="back svelte-2yql63">`);
		Arrow_left($$renderer, { size: 16 });
		$$renderer.push(`<!----> Orders</a><div class="svelte-2yql63"><button class="secondary svelte-2yql63">`);
		Message_circle($$renderer, { size: 14 });
		$$renderer.push(`<!----> WhatsApp</button><button class="primary">Mark ready</button><button class="icon-button svelte-2yql63">`);
		Ellipsis($$renderer, { size: 17 });
		$$renderer.push(`<!----></button></div></div> <header class="order-heading svelte-2yql63"><div class="project-icon svelte-2yql63">PW</div><div><div class="title-line svelte-2yql63"><h1 class="svelte-2yql63">${escape_html(order.project)}</h1>`);
		StatusBadge($$renderer, { status: order.status });
		$$renderer.push(`<!----></div><p class="svelte-2yql63">${escape_html(order.id)} · ${escape_html(order.customer)}</p></div></header> <div class="tabs svelte-2yql63"><!--[-->`);
		const each_array = ensure_array_like([
			"Overview",
			"Files",
			"Activity"
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<button${attr_class("svelte-2yql63", void 0, { "active": tab === item })}>${escape_html(item)}</button>`);
		}
		$$renderer.push(`<!--]--></div> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="detail-grid svelte-2yql63"><div class="main-col svelte-2yql63"><section class="card"><div class="section-head svelte-2yql63"><div><h2 class="svelte-2yql63">Tasks</h2><p class="svelte-2yql63">${escape_html(order.tasks.filter((t) => t.status === "Completed").length)} of ${escape_html(order.tasks.length)} completed</p></div><button class="secondary svelte-2yql63">`);
			Plus($$renderer, { size: 13 });
			$$renderer.push(`<!----> Add task</button></div> <div class="task-list"><!--[-->`);
			const each_array_1 = ensure_array_like(order.tasks);
			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let task = each_array_1[index];
				$$renderer.push(`<div class="task-row svelte-2yql63"><span${attr_class("svelte-2yql63", void 0, {
					"complete": task.status === "Completed",
					"activeTask": task.status === "In progress" || task.status === "Ready for review"
				})}>`);
				if (task.status === "Completed") {
					$$renderer.push("<!--[0-->");
					Check($$renderer, { size: 13 });
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span>${escape_html(index + 1)}</span>`);
				}
				$$renderer.push(`<!--]--></span><div class="task-name svelte-2yql63"><strong class="svelte-2yql63">${escape_html(task.name)}</strong><small class="svelte-2yql63">${escape_html(task.assignee)}</small></div>`);
				StatusBadge($$renderer, { status: task.status });
				$$renderer.push(`<!----><div class="task-progress svelte-2yql63"><div class="progress"><span${attr_style("", { width: task.progress + "%" })}></span></div><small class="svelte-2yql63">${escape_html(task.progress)}%</small></div><span class="task-due svelte-2yql63">${escape_html(task.due)}</span><button class="dots svelte-2yql63">`);
				Ellipsis($$renderer, { size: 15 });
				$$renderer.push(`<!----></button></div>`);
			}
			$$renderer.push(`<!--]--></div></section> <section class="card timeline-card svelte-2yql63"><div class="section-head svelte-2yql63"><div><h2 class="svelte-2yql63">Timeline</h2><p class="svelte-2yql63">Customer-visible progress</p></div></div><div class="timeline svelte-2yql63"><!--[-->`);
			const each_array_2 = ensure_array_like(timeline);
			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let step = each_array_2[i];
				$$renderer.push(`<div${attr_class("timeline-step svelte-2yql63", void 0, {
					"done": step[2] === "done",
					"current": step[2] === "current"
				})}><span class="svelte-2yql63">`);
				if (step[2] === "done") {
					$$renderer.push("<!--[0-->");
					Check($$renderer, { size: 12 });
				} else if (step[2] === "current") {
					$$renderer.push("<!--[1-->");
					Clock_3($$renderer, { size: 12 });
				} else {
					$$renderer.push("<!--[-1-->");
					Circle($$renderer, { size: 9 });
				}
				$$renderer.push(`<!--]--></span><div class="svelte-2yql63"><strong class="svelte-2yql63">${escape_html(step[0])}</strong><small class="svelte-2yql63">${escape_html(step[1])}</small></div>`);
				if (i < timeline.length - 1) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<i class="svelte-2yql63"></i>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div></section> <section class="card activity-card"><div class="section-head svelte-2yql63"><div><h2 class="svelte-2yql63">Recent activity</h2><p class="svelte-2yql63">Latest updates for this order</p></div></div><div class="activity svelte-2yql63"><div class="svelte-2yql63"><span class="activity-icon purple svelte-2yql63">`);
			Clock_3($$renderer, { size: 13 });
			$$renderer.push(`<!----></span><p class="svelte-2yql63"><strong class="svelte-2yql63">Meera updated Colour correction to 70%</strong><small class="svelte-2yql63">Today, 11:42</small></p></div><div class="svelte-2yql63"><span class="activity-icon svelte-2yql63">`);
			Paperclip($$renderer, { size: 13 });
			$$renderer.push(`<!----></span><p class="svelte-2yql63"><strong class="svelte-2yql63">Reference files were added</strong><small class="svelte-2yql63">Yesterday, 18:16</small></p></div><div class="svelte-2yql63"><span class="activity-icon green svelte-2yql63">`);
			Check($$renderer, { size: 13 });
			$$renderer.push(`<!----></span><p class="svelte-2yql63"><strong class="svelte-2yql63">Culling was approved by admin</strong><small class="svelte-2yql63">14 Jul, 16:08</small></p></div></div></section></div><aside class="side-col svelte-2yql63"><section class="card info-card svelte-2yql63"><h2 class="svelte-2yql63">Order details</h2><dl class="svelte-2yql63"><div class="svelte-2yql63"><dt class="svelte-2yql63">Customer</dt><dd class="svelte-2yql63">${escape_html(order.customer)}</dd></div><div class="svelte-2yql63"><dt class="svelte-2yql63">Work type</dt><dd class="svelte-2yql63">${escape_html(order.workType)}</dd></div><div class="svelte-2yql63"><dt class="svelte-2yql63">Files received</dt><dd class="svelte-2yql63">${escape_html(order.files)} files</dd></div><div class="svelte-2yql63"><dt class="svelte-2yql63">Delivery date</dt><dd class="svelte-2yql63">${escape_html(order.due)}</dd></div><div class="svelte-2yql63"><dt class="svelte-2yql63">Source files</dt><dd class="svelte-2yql63"><a${attr("href", "https://" + order.fileLink)} class="svelte-2yql63">Open folder `);
			External_link($$renderer, { size: 11 });
			$$renderer.push(`<!----></a></dd></div></dl></section> <section class="card people-card svelte-2yql63"><h2 class="svelte-2yql63">Assigned editors</h2><!--[-->`);
			const each_array_3 = ensure_array_like([...new Set(order.tasks.filter((t) => t.assignee !== "Unassigned").map((t) => t.assignee))]);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let editor = each_array_3[$$index_3];
				$$renderer.push(`<div class="person svelte-2yql63"><span class="svelte-2yql63">${escape_html(editor.split(" ").map((n) => n[0]).join(""))}</span><div class="svelte-2yql63"><strong class="svelte-2yql63">${escape_html(editor)}</strong><small class="svelte-2yql63">${escape_html(order.tasks.find((t) => t.assignee === editor)?.name)}</small></div></div>`);
			}
			$$renderer.push(`<!--]--><button class="add-person svelte-2yql63">`);
			Plus($$renderer, { size: 13 });
			$$renderer.push(`<!----> Assign editor</button></section> <section class="card invoice-card svelte-2yql63"><div class="invoice-title svelte-2yql63"><span class="svelte-2yql63">`);
			File_text($$renderer, { size: 15 });
			$$renderer.push(`<!----></span><div class="svelte-2yql63"><h2 class="svelte-2yql63">Invoice</h2><small class="svelte-2yql63">INV-2026-0088</small></div>`);
			StatusBadge($$renderer, { status: order.paid === order.price ? "Paid" : "Partially paid" });
			$$renderer.push(`<!----></div><div class="amount svelte-2yql63"><small class="svelte-2yql63">Total</small><strong class="svelte-2yql63">${escape_html(money(order.price))}</strong></div><div class="payment-bar svelte-2yql63"><span class="svelte-2yql63"${attr_style("", { width: order.paid / order.price * 100 + "%" })}></span></div><div class="paid-row svelte-2yql63"><span>Paid ${escape_html(money(order.paid))}</span><span>Balance ${escape_html(money(order.price - order.paid))}</span></div><button class="invoice-button svelte-2yql63">`);
			Indian_rupee($$renderer, { size: 13 });
			$$renderer.push(`<!----> Record payment</button></section></aside></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _page as default };
