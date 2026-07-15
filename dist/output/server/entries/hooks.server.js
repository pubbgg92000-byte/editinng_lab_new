import { r as verifySession } from "../chunks/auth.js";
import { redirect } from "@sveltejs/kit";
//#region src/hooks.server.ts
var protectedPrefixes = [
	"/dashboard",
	"/customers",
	"/orders",
	"/editors",
	"/invoices",
	"/settings"
];
var handle = async ({ event, resolve }) => {
	if (protectedPrefixes.some((path) => event.url.pathname.startsWith(path)) && !await verifySession(event.cookies.get("studioflow_session"))) redirect(303, "/login");
	return resolve(event);
};
//#endregion
export { handle };
