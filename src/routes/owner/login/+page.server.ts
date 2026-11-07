// Old owner sign-in URL. Everyone now signs in at /login, which routes each account by role.
import { redirect } from '@sveltejs/kit';

export const load = () => {
	redirect(308, '/login');
};
