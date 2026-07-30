import { json } from '@sveltejs/kit';
import { findTenantBySlug } from '$lib/server/control';
import { readyDatabase } from '$lib/server/db';
import { findEditorByToken, updateTask } from '$lib/server/repository';
import { flushSheetSync } from '$lib/server/googleSheets';
import { taskLinkError } from '$lib/server/validation';
import { parseVideoDurationMinutes } from '$lib/duration';
import { getTenantConfiguration } from '$lib/server/configuration';
import { hasCapability } from '$lib/capabilities';
import { staffPortalSections } from '$lib/moduleConfiguration';
import type { Task, TaskStatus } from '$lib/types';

// Editor portal writes are limited to the editor's own assigned task and safe fields.
export const PATCH = async ({ params, request }) => {
	const tenant = await findTenantBySlug(params.slug);
	if (!tenant || tenant.status !== 'active') return json({ error: 'Portal unavailable.' }, { status: 404 });
	const submitted = await request.json().catch(() => ({}));
	const database = await readyDatabase(tenant);
	const configuration = await getTenantConfiguration(database, tenant);
	if (!hasCapability(configuration.effectiveCapabilities, 'work.staffPortal')) return json({ error: 'Portal unavailable.' }, { status: 403 });
	const portal = configuration.moduleConfiguration['work.staffPortal'];
	const sections = staffPortalSections(portal);
	const input: Partial<Task> = {};
	if (portal.allowStatusUpdate && portal.mode !== 'assignments-only' && submitted.status !== undefined) {
		const status = String(submitted.status) as TaskStatus;
		if (!['Not started', 'Files downloaded', 'In progress', 'Waiting for clarification', 'Ready for review'].includes(status)) {
			return json({ error: 'Choose an available work status.' }, { status: 400 });
		}
		input.status = status;
	}
	if (portal.allowProgressUpdate && sections.progress && submitted.progress !== undefined) {
		const progress = Number(submitted.progress);
		if (!Number.isFinite(progress) || progress < 0 || progress > 100) return json({ error: 'Progress must be between 0 and 100.' }, { status: 400 });
		input.progress = progress;
	}
	if (sections.output && submitted.outputLink !== undefined) input.outputLink = String(submitted.outputLink).trim().slice(0, 2000);
	if (sections.notes && submitted.notes !== undefined) input.notes = String(submitted.notes).trim().slice(0, 4000);
	if (hasCapability(configuration.effectiveCapabilities, 'billing.duration') && sections.duration && submitted.videoDuration !== undefined) {
		const minutes = parseVideoDurationMinutes(submitted.videoDuration);
		if (!Number.isFinite(minutes) || minutes < 0) return json({ error: 'Enter duration like 30 min, 1.5 hr, or 1:30.' }, { status: 400 });
		input.videoDurationMinutes = minutes;
	}
	const linkError = taskLinkError(input);
	if (linkError) return json({ error: `${linkError} Upload files externally and paste the link here.` }, { status: 400 });
	if (!Object.keys(input).length) return json({ error: 'No enabled worker update was provided.' }, { status: 400 });
	const editor = submitted.token ? await findEditorByToken(database, String(submitted.token)) : null;
	if (!editor) return json({ error: 'Unauthorized' }, { status: 401 });
	let task;
	try { task = await updateTask(database, params.id, input, editor.name, editor.id); }
	catch (cause) { return json({ error: cause instanceof Error ? cause.message : 'Unable to update task.' }, { status: 400 }); }
	if (!task) return json({ error: 'Task not found or not assigned to this editor.' }, { status: 404 });
	await flushSheetSync(database, tenant);
	return json({ ok: true, task });
};
