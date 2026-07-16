import { redirect } from '@sveltejs/kit';
export const GET = ({ cookies }) => { cookies.delete('studioflow_session', { path: '/' }); redirect(303, '/login'); };
