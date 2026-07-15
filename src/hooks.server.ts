import type { Handle } from '@sveltejs/kit'; import { redirect } from '@sveltejs/kit'; import { verifySession } from '$lib/server/auth';
const protectedPrefixes=['/dashboard','/customers','/orders','/editors','/invoices','/settings'];
export const handle:Handle=async({event,resolve})=>{const needsAuth=protectedPrefixes.some(path=>event.url.pathname.startsWith(path));if(needsAuth&&!await verifySession(event.cookies.get('studioflow_session')))redirect(303,'/login');return resolve(event)};
