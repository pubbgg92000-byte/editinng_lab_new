# Plan: P1 team roles and permissions

Status: **P1a–P1d built (dormant); P1e/P1f cancelled 2026-11-08: the owner wants no staff logins (staff use passwordless portal links).** Written 2026-11-08. Part of `docs/NICHE_SETUP_PLAN.md` §5.3.
Anjana and Demo keep working exactly as today: their one login stays the full-access workspace admin.

## 1. Goal

A workspace admin can add people with a fixed role (Manager, Front desk, Accounts, Viewer). Each
person sees and can do only what their role allows. A blocked page or action can't be reached by
typing its URL or calling the API.

## 2. What exists today (and what blocks multiple users)

| Area | Today | Where |
|---|---|---|
| Roles | `owner` and `client_admin` only | `src/lib/types.ts:393` |
| One login per workspace | **Unique index on `tenant_id`**, which blocks a second account in the same workspace | `db/control-schema.ts:31` (`control_one_admin_per_tenant_idx`) |
| Route guard | Allows only `client_admin` into admin pages and APIs | `src/hooks.server.ts:31` |
| Feature guard | `capabilitiesForPath()` blocks routes for features a workspace doesn't have | `src/lib/server/capabilityRoutes.ts` |
| Suspended workspace check | Applies only when `role === 'client_admin'` | `src/lib/server/control.ts:185`, `:222` |
| Owner "change login" | `UPDATE … WHERE tenant_id = ?` changes **every** account in the workspace | `src/lib/server/control.ts:364-365` |
| Owner workspace list | `LEFT JOIN control_accounts` returns one row **per account** | `src/lib/server/control.ts:240` |
| Email | Unique across the whole platform (one person = one workspace) | `db/control-schema.ts:23` |

The last three rows are fine with one login, but would become bugs once a workspace has several
logins. They have to be fixed in the same change (see §6).

## 3. Roles and what each can do

✓ = allowed, — = hidden and blocked.

| Area | Admin (today's login) | Manager | Front desk | Accounts | Viewer |
|---|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Analytics | ✓ | ✓ | — | ✓ | — |
| Orders: view | ✓ | ✓ | ✓ | ✓ | ✓ |
| Orders: create and edit, change status, tasks | ✓ | ✓ | ✓ | — | — |
| Orders: delete or cancel | ✓ | ✓ | — | — | — |
| Customers: view | ✓ | ✓ | ✓ | ✓ | ✓ |
| Customers: create and edit | ✓ | ✓ | ✓ | — | — |
| Customers: delete | ✓ | ✓ | — | — | — |
| Staff: view | ✓ | ✓ | ✓ | — | ✓ |
| Staff: add and edit, portal links, WhatsApp | ✓ | ✓ | — | — | — |
| Payments: record | ✓ | ✓ | ✓ | ✓ | — |
| Invoices: create and edit, mark paid | ✓ | ✓ | — | ✓ | — |
| Invoices: view and print | ✓ | ✓ | ✓ | ✓ | ✓ |
| Excel export | ✓ | ✓ | — | ✓ | — |
| Customer WhatsApp messages | ✓ | ✓ | ✓ | ✓ | — |
| Settings, Google Sheets, reconcile | ✓ | — | — | — | — |
| Team (add people, change roles) | ✓ | — | — | — | — |

- Workspace features still apply first. If invoices are off for a workspace, nobody sees them,
  whatever their role.
- Staff (editors or technicians) keep their private link pages; nothing changes for them.

## 4. Design

### 4.1 One permission list (shared by server and screens)
- New `src/lib/permissions.ts`: the `TenantRole` type, permission keys (e.g. `orders.edit`,
  `invoices.manage`, `settings.manage`, `team.manage`), the role → permissions table from §3, and
  `can(role, permission)`. Plain code with no database, so it's easy to test.
- `client_admin` gets **every** permission. Anjana and Demo therefore behave exactly as today.

### 4.2 Central enforcement (default deny)
- New `src/lib/server/permissionRoutes.ts` with `permissionForRequest(method, pathname)`, which
  maps each admin page and API route + method to one permission, next to `capabilitiesForPath()`.
- `hooks.server.ts`:
  1. Accept any workspace role, not just `client_admin`.
  2. After the feature check, check the permission. Blocked pages redirect to the dashboard with a
     message; blocked APIs return 403.
  3. **Any admin route or method missing from the map is allowed for `client_admin` only.** A new
     route is therefore safe even if someone forgets to map it.
- Form actions (`?/…` on pages) are covered: they arrive as POSTs to the page path.

### 4.3 Screens
- The root layout sends `role` and the allowed permissions to the browser.
- Sidebar items, buttons and menu entries are hidden with `can()`. This is for tidiness only; the
  server check is what actually protects.
- A short "You don't have access to that" notice appears when a blocked page redirects.

### 4.4 Team page (`/settings/team`, admin only)
- List members: name, email, role, last sign-in, Active/Disabled.
- **Add person:** name, email, role, temporary password ("Make a strong password" + Copy, the same
  as the wizard). The admin passes the password on themselves. Email invites need an email
  provider, so they come later.
- Change role, reset password, disable or enable, remove (with confirmation).
- Guard: the admin login itself can't be removed or downgraded here. The owner panel manages it.
- Changing a role or disabling someone signs that person out (their sessions are deleted).

### 4.5 Owner panel
- The workspace card shows "N people".
- "Change login" edits only the main admin account.

## 5. Database changes (control database)

| Change | Why | Effect on Anjana and Demo |
|---|---|---|
| `DROP INDEX control_one_admin_per_tenant_idx` | Allows several logins per workspace | None |
| `CREATE UNIQUE INDEX control_one_primary_admin_idx ON control_accounts(tenant_id) WHERE role = 'client_admin'` | Still exactly one main admin per workspace | None (they each have one) |
| `ALTER TABLE control_accounts ADD COLUMN IF NOT EXISTS name TEXT` | Show names in the team list | None (null) |
| `… ADD COLUMN IF NOT EXISTS disabled_at TEXT` | Disable without deleting | None (null = active) |
| `… ADD COLUMN IF NOT EXISTS last_login_at TEXT` | "Last sign-in" column | None |

- Role values need no schema change (there's no CHECK on `role`).
- Dropping an index isn't purely additive, so **all of this runs on a Neon branch of the control
  database first**. Production gets it only after you approve, using the same idempotent
  statements in `db/control-schema.ts`.

## 6. Fixes that must ship with roles (otherwise they become bugs)

1. **Suspended workspaces:** the "workspace must be active" check must apply to every workspace
   role, not just `client_admin` (`control.ts:185`, `:222`). Otherwise a suspended workspace's
   front-desk login could still sign in.
2. **Owner "change login"** must update only the `client_admin` row (`control.ts:364-365`).
   Otherwise it would set the same email and password on everyone.
3. **Owner workspace list** must join only the `client_admin` account, and count members with a
   subquery (`control.ts:240`). Otherwise workspaces would show up more than once.
4. **Disabled accounts** can't sign in, and their sessions are cleared.

## 7. Tests

- `scripts/test-permissions.mjs` (new, added to `npm run test:capabilities` or its own script):
  - Each role's permissions match §3.
  - `client_admin` has every permission.
  - **Every admin page and API route file is checked:** each one is either mapped or falls back to
    admin-only, and the script lists any unmapped ones.
  - Sample requests: front desk `DELETE /api/orders/x` → 403; viewer `POST /api/customers` → 403;
    accounts `GET /settings` → redirect.
- Keep `test:tenancy` passing.
- On the Neon branch, sign in once per role and click through every page and action.

## 8. Build order (each step works on its own)

| Step | What | DB change? | Behaviour change for Anjana and Demo |
|---|---|---|---|
| P1a | `permissions.ts` + tests | No | None |
| P1b | Central enforcement in hooks (default deny) + route map + tests | No | None: their login is `client_admin` = everything |
| P1c | Hide buttons and menus by permission | No | None |
| P1d | Fixes from §6 (safe even with one login) | No | None |
| P1e | Schema changes on a **Neon branch** + Team page | Yes (branch first) | None until you approve production |
| P1f | Owner panel member count; then production schema change after approval | Yes (prod, approval) | Card shows "1 person" |

P1a–P1d need no database change and can start now. P1e needs a Neon branch connection string.

## 9. Decisions for you

**Answered 2026-11-08:** 1 = yes, keep the 5 roles and the §3 table. Until told otherwise: 2 = one main admin only, 3 = temporary passwords, 5 = one workspace per email. 4 = waiting for a Neon branch link.

1. **Roles:** keep the 5 in §3, or change them? Any cells in the table you want different (for
   example, should Front desk see Analytics)?
2. **More than one full admin per workspace?** The plan keeps one main admin (managed from the owner
   panel), with Manager as the next-highest role. Should admins be able to add a second Admin?
3. **Adding people:** a temporary password the admin shares (works now), or email invites (needs an
   email provider such as Resend or SES later)?
4. **Neon branch** for P1e: will you create one and share its connection string, or should I use
   the Neon CLI/API (needs your Neon login)?
5. **One person in several workspaces?** Not supported today (email is unique). Fine for P1?

## 10. Risks

- Missing a route in the map. Mitigated by default deny plus the route-coverage test.
- The index change on production. Mitigated by testing on a Neon branch first and running it only
  with your approval.
- Cached sessions: role changes must clear the session cache (writes already call `clearCache()`),
  and the changed person's sessions are deleted.
