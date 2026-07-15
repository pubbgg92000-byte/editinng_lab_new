import * as server from '../entries/pages/(admin)/settings/sheets/_page.server.ts.js';

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(admin)/settings/sheets/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(admin)/settings/sheets/+page.server.ts";
export const imports = ["_app/immutable/nodes/12.YLuw1h-k.js","_app/immutable/chunks/liYEefaB.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/Dp0m8DlN.js","_app/immutable/chunks/DTBFfHl0.js","_app/immutable/chunks/D9BcqJA9.js"];
export const stylesheets = ["_app/immutable/assets/12.B1WdVMQ5.css"];
export const fonts = [];
