import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function files(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
}

const routeFiles = (await files(new URL('../src/routes', import.meta.url).pathname)).filter((file) => file.endsWith('.ts'));
const failures = [];
for (const file of routeFiles) {
	const source = await readFile(file, 'utf8');
	if (source.includes('readyDatabase(platform)')) failures.push(`${file}: uses deployment platform instead of tenant context`);
	if (/flushSheetSync\(database\)(?!,)/.test(source)) failures.push(`${file}: Sheet sync is missing tenant configuration`);
	if (/readSheetValues\([^,()]+\)/.test(source)) failures.push(`${file}: Sheet read is missing tenant configuration`);
}

const hooks = await readFile(new URL('../src/hooks.server.ts', import.meta.url), 'utf8');
if (!hooks.includes("pathname.startsWith('/api/portal/')")) failures.push('Public portal API exception is not explicitly scoped.');
if (!hooks.includes("event.locals.tenant")) failures.push('Request hook does not establish tenant context.');

const settingsApi = await readFile(new URL('../src/routes/api/settings/+server.ts', import.meta.url), 'utf8');
if (!settingsApi.includes('readyDatabase(locals.tenant)')) failures.push('Settings API is not tenant scoped.');

const sheetsView = await readFile(new URL('../src/routes/(admin)/settings/sheets/+page.server.ts', import.meta.url), 'utf8');
if (/1jsxofck|publicSheetId|readPublicSheetValues/.test(sheetsView)) failures.push('Sheets view still contains a global/public workbook fallback.');

if (failures.length) {
	console.error(failures.join('\n'));
	process.exit(1);
}
console.log(`Tenant-boundary audit passed across ${routeFiles.length} server route files.`);
