import { N as writable } from "./server.js";
import "./index-server.js";
import { i as orders, t as customers } from "./data.js";
writable(structuredClone(orders));
var customerStore = writable(structuredClone(customers));
var sidebarOpen = writable(false);
//#endregion
export { sidebarOpen as n, customerStore as t };
