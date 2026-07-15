import { redirect } from "@sveltejs/kit";
//#region src/routes/+page.ts
var load = () => redirect(307, "/dashboard");
//#endregion
export { load };
