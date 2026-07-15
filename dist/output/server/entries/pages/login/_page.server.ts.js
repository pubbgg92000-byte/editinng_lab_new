import { n as validCredentials, t as createSession } from "../../../chunks/auth.js";
import { fail, redirect } from "@sveltejs/kit";
//#region src/routes/login/+page.server.ts
var actions = { default: async ({ request, cookies, url }) => {
	const form = await request.formData();
	const email = String(form.get("email") || "");
	if (!validCredentials(email, String(form.get("password") || ""))) return fail(400, {
		invalid: true,
		email
	});
	cookies.set("studioflow_session", await createSession(email), {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: url.protocol === "https:",
		maxAge: 3600 * 24 * 14
	});
	redirect(303, "/dashboard");
} };
//#endregion
export { actions };
