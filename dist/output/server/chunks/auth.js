import { t as private_env } from "./shared-server.js";
//#region src/lib/server/auth.ts
var email = () => private_env.ADMIN_EMAIL || "admin@studioflow.app";
var password = () => private_env.ADMIN_PASSWORD || "studioflow";
var secret = () => private_env.SESSION_SECRET || "studioflow-local-development-secret";
var bytes = (value) => new TextEncoder().encode(value);
async function sign(value) {
	const key = await crypto.subtle.importKey("raw", bytes(secret()), {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	const signature = await crypto.subtle.sign("HMAC", key, bytes(value));
	return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function createSession(userEmail) {
	const payload = `${userEmail}:${Date.now()}`;
	return `${payload}:${await sign(payload)}`;
}
async function verifySession(token) {
	if (!token) return false;
	const parts = token.split(":");
	if (parts.length < 3) return false;
	return parts.pop() === await sign(parts.join(":")) && Date.now() - Number(parts.at(-1)) < 1e3 * 60 * 60 * 24 * 14;
}
var validCredentials = (userEmail, userPassword) => userEmail.trim().toLowerCase() === email().toLowerCase() && userPassword === password();
//#endregion
export { validCredentials as n, verifySession as r, createSession as t };
