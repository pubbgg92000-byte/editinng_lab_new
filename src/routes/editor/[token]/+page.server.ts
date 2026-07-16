import { error } from '@sveltejs/kit';
import { readyDatabase } from '$lib/server/db';
import { findEditorByToken, tasksForEditor } from '$lib/server/repository';
export const load = async ({ params, platform }) => { const database = await readyDatabase(platform); const editor = await findEditorByToken(database, params.token); if (!editor) error(404, 'This private editor link is invalid or has been regenerated.'); return { editor, tasks: await tasksForEditor(database, editor.id), token: params.token }; };
