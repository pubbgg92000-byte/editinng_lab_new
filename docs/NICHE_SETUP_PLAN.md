# Plan: easy niche creation, setup, and permissions

Status: **plan only, not implemented.** Written 2026-11-07. Nothing in the current code or in the
Anjana and Demo workspaces changes until each phase below is approved.

## 1. Goal

The owner can set up NexaDesk for any kind of business (car garage, clinic, salon, electronics
repair, cleaning company, coaching centre, and so on) from the owner panel, in a few minutes,
without technical knowledge. They can also decide who inside each business can do what.

## 2. Ground rules

1. **Existing workspaces never change by themselves.** Anjana and Demo keep their current package
   snapshot, features, wording, data, and flows. New behaviour applies only to new workspaces,
   or to an existing one when the owner explicitly applies an update.
2. **Additive only.** New tables and columns are optional and have safe defaults. No renames, no
   removals, and no change to the canonical workflow statuses or routes (`/orders` stays `/orders`
   even when a niche calls it "Job cards" or "Appointments").
3. **One codebase, one workflow:** customer → order → tasks → staff → billing → delivery. A niche
   changes words, fields, defaults, and which features are on; it never forks code.
4. Every change is versioned and can be rolled back (snapshots already exist).

## 3. What already exists (reuse it)

| Piece | Today | Where |
|---|---|---|
| Feature switches | 15 capabilities (tasks, staff, staff portal, assets, delivery, payments, invoices, partial invoices, duration billing, customer portal, WhatsApp, Google Sheets, Excel export, custom fields, white label) | `src/lib/capabilities.ts` |
| Niche templates ("packages") | 14 built in: Editing Studio, Garage / Vehicle Service, Salon / Spa, Small Shop, Contractor, Hospitality Lite, Electronics Repair, Clinic / Wellness, Education / Coaching, Cleaning / Home Services, Logistics / Delivery, Events / Rentals, Property / Facility, General Service | same file, `builtInPackages` |
| A package contains | Terminology (customer/order/staff/task/... names), status labels, custom fields, option lists, default features, portal and WhatsApp defaults | `NichePackage` type |
| Package builder | One long 5-section form on the owner panel's Packages tab | `routes/owner/+page.svelte` |
| Create workspace | One form: name, slug, logo, **Neon DB URL**, **Google Sheet ID**, orders tab, package, admin email and password | same |
| Per-workspace controls | Allowed features, portal/WhatsApp settings, connections, status, snapshots/rollback, demo reset | same |
| Roles | Only **owner** and one **client_admin** login per workspace | `control_accounts.role` |

So most of the engine is there. The friction is in how it's presented, the required technical
inputs, and the lack of team roles.

## 4. Problems to solve

1. **Creating a workspace needs technical inputs upfront** (Neon connection string, Sheet ID).
2. **The package builder is one long form**, so it's hard to see what the business will look like.
3. **There's no preview.** You can't see "Job cards / Technicians / Vehicle number" before creating.
4. **One login per business.** A garage owner can't give the front desk or a technician limited access.
5. **Sensitive niches** (clinics, hospitals) need extra care about what data is stored and who sees it.

## 5. Proposed owner experience

### 5.1 "New workspace" wizard (replaces the single form; same server action underneath)

| Step | What the owner sees | Notes |
|---|---|---|
| 1. Business type | A grid of tiles with icons: Garage, Clinic, Salon, Repair shop, … + "Start from scratch". Each tile shows its words ("Job cards · Technicians · Vehicle number"). Search box. | Picks a package. |
| 2. Business details | Business name, web address (`/garage-abc`, auto-suggested from the name), logo (optional), colour style. | Slug checked live for availability. |
| 3. Features | Plain-language switches, pre-set by the business type: "Send updates on WhatsApp", "Customers get a private status page", "Track payments", "Staff get their own work page", … Locked items show why ("needs Staff"). | Same capability allowances as today. |
| 4. First admin | Admin name, email, temporary password (or "generate one"), with a copy button. | Existing credential rules. |
| 5. Connections | **Option A (now):** paste Neon URL + Sheet ID with step-by-step help and a "Test" button. **Option B (later, needs approval):** "Create database for me". | See 5.4. |
| 6. Review | A summary card + a **preview** of the business's sidebar and an example order screen in its own words. "Create as draft" → health check → "Activate". | Created as **Draft**, never live until checked. |

The wizard remembers progress, so the owner can leave and come back. "Connections" can be
skipped and done later, with the workspace staying in Draft.

### 5.2 Niche library and simpler package builder (Packages tab)

- **Library view:** every package as a card: name, version, number of workspaces using it, and
  "Use", "Duplicate & edit", "Edit" buttons.
- **Builder as 5 short steps with a live preview on the right:**
  1. **Start from**: pick the closest package (copies everything).
  2. **Words**: rename Customer, Order, Staff, Task, Category, Due date, Delivery, Asset; the
     preview sidebar and example screens update as you type.
  3. **Fields**: add extra fields from suggestions for that niche (e.g. Garage: Vehicle number,
     Make/Model, Odometer, Fuel level; Clinic: Age, Visit reason; Repair: Device IMEI, Fault),
     or create one (label → key auto-made). Choose where each shows: admin, customer page, staff
     page, WhatsApp, Sheets, Excel.
  4. **Statuses and messages**: rename status labels (e.g. "Ready Delivery" → "Ready for pickup")
     and edit the default WhatsApp messages with placeholders picked from a list.
  5. **Default features**: which switches are on for new workspaces of this type.
- **Save** creates a new package version. Existing workspaces show "Update available" and can
  apply it on purpose (this already exists); nothing changes automatically.
- **Suggested starter niches to add** (data only, no code change): Car garage (detailed), Bike
  service, Hospital OPD front desk, Dental clinic, Diagnostic lab sample tracking, Tailoring,
  Photo studio, Printing press, Laundry, Interior/fit-out.

### 5.3 Permissions (team roles inside each business)

**Phase P1: roles with fixed permissions (simple, recommended first)**

| Role | Can |
|---|---|
| Owner admin (today's client_admin) | Everything in the workspace |
| Manager | Orders, customers, staff, billing; no settings or connections |
| Front desk | Create and edit customers and orders, take payments; can't delete, see analytics, or change settings |
| Accounts | Invoices, payments, exports; view orders |
| Viewer | Read-only |

- The workspace admin invites people by email with a role; the owner panel shows how many users
  each workspace has.
- Enforcement is central: one `permissionForPath()` next to today's `capabilitiesForPath()` in
  `hooks.server.ts`, plus checks in API routes, so a route can never be reached by URL alone.
  The UI hides actions the role can't use.
- Staff (editors/technicians) keep using their private links; no login needed.

**Phase P2: custom roles (later)**: per-area matrix (view / create / edit / delete for orders,
customers, staff, billing, settings), set by the workspace admin within what the owner allows.

### 5.4 Database and Sheets setup made easy

- **Now:** guided help with screenshots, a single "Test connection" button, clear errors ("This
  database is already used by another workspace").
- **Later (needs your approval and a Neon API key):** "Create database for me" provisions a new
  Neon database for the workspace automatically and stores its encrypted URL. This removes the
  most technical step entirely. Google Sheets stays optional per workspace.

### 5.5 Sensitive niches (clinics, hospitals)

- Mark packages as **sensitive**. The wizard then shows a short checklist: keep clinical details out
  of notes, turn off WhatsApp message previews of personal details, keep the customer page
  minimal, consent note on forms.
- Recommend positioning as front-desk / appointment / billing tracking, **not** medical records.
  Real hospital records need a proper compliance review (India's DPDP Act, consent, access
  logs, retention).
- Add an **access log view** per workspace (who opened or changed what), using the existing
  activity log.

## 6. Data model changes (all additive)

| Change | Purpose | Affects Anjana/Demo? |
|---|---|---|
| `control_packages.meta` JSON (icon, suggested fields, sensitive flag) | Library cards, suggestions | No (optional) |
| `control_accounts.role` gains `manager`, `front_desk`, `accounts`, `viewer` | P1 roles | No; existing logins stay `client_admin` |
| `control_invitations` table | Invite by email with role | No |
| `control_tenants.setup_state` JSON | Resume the wizard | No; null = fully set up |
| (Later) `control_role_permissions` | P2 custom roles | No |

All changes go into the existing idempotent control-schema statements (`IF NOT EXISTS`, defaults),
and are tested on a **Neon branch first**, never on production directly.

## 7. Phases, effort, and acceptance criteria

| Phase | Work | Effort | Done when |
|---|---|---|---|
| N1 | Wizard UI for New workspace (steps 1–4, 6) using today's create action; Draft → health check → Activate | M | Owner creates a garage workspace in < 3 minutes with no help text needed; Anjana/Demo unchanged |
| N2 | Package library + 5-step builder with live preview; field suggestions; save as version | M | A new niche (e.g. Car garage) is made from "Garage" in < 5 minutes; preview matches the real workspace |
| N3 | Add 6–10 starter niches as data | S | Each appears in the wizard with correct words and fields |
| P1 | Team roles (fixed set) + invites + central enforcement + UI hiding | L | Front-desk user can't open settings/analytics or delete anything by URL or button; audits pass |
| S1 | Sensitive-niche checklist + access log view | S | Clinic package shows the checklist; log lists who changed what |
| D1 | "Create database for me" via Neon API | M | One click creates a working database; **needs your approval + API key** |
| P2 | Custom roles matrix | L | Admin defines a role and it's enforced everywhere |

Suggested order: **N1 → N2 → N3 → P1 → S1**, then D1 and P2 when you want them.

## 8. Needs your decision before building

1. Start with **N1 + N2** (no database schema changes), then P1 roles (control DB schema change)?
2. Which **roles** for P1: the 5 above, or a different set?
3. **Auto-create databases** (D1): yes or no, and which Neon account/project?
4. **Hospitals**: keep to front desk / appointments / billing (recommended), or plan for medical records (needs a compliance review first)?
5. Which **starter niches** to add first?

## 9. Risks

- Package edits must never auto-apply to live workspaces (already versioned; keep it that way).
- The roles feature touches every route; it needs the central check plus tests per role.
- Control DB schema changes must run on a Neon branch first and be reviewed before production.
- Auto-provisioning creates billable cloud resources; it needs limits and a delete path.
