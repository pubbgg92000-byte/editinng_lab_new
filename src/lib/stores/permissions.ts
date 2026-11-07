// UI helper: hides actions the signed-in team role can't use. The server enforces the same rules.
import { page } from '$app/state';
import { can, type Permission } from '$lib/permissions';

/** True when the current workspace user's role allows the action (reactive in templates). */
export const allowed = (permission: Permission) => can(page.data?.role, permission);
