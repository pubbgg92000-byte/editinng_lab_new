// Root entry sends authenticated users toward the main client dashboard.
import { redirect } from '@sveltejs/kit';
export const load = () => redirect(307, '/dashboard');
