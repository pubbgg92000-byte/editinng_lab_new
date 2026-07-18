# StudioFlow

StudioFlow is a multi-tenant workflow system for editing studios. One Vercel deployment serves the owner panel, Anjana, the resettable demo workspace, and any future clients. Each client login is fixed to its own Neon database and Google Sheet.

## Architecture

- The **control database** stores tenants, salted password hashes, revocable sessions, encrypted tenant connection URLs, connection health, and owner audit records.
- Every **tenant database** stores only that studio's customers, editors, orders, tasks, payments, invoices, settings, and sync queue.
- The request hook resolves the signed-in account once and fixes the tenant context for the request. Routes never accept a tenant or database selector from client input.
- Customer and editor portals use `/portal/{tenant-slug}/...`. Existing unscoped portal links resolve only against the registered legacy tenant.

## Production deployment

This repository is Vercel-only. Follow [`VERCEL_SETUP.md`](./VERCEL_SETUP.md) for a clean first deployment or production update.

1. Create a separate Neon database for the control plane.
2. Copy `.env.example` into the hosting environment and provide `CONTROL_DATABASE_URL`, independent encryption/session secrets, the owner bootstrap credentials, Google service-account credentials, and `PUBLIC_APP_URL`.
3. Run `npm run control:migrate`, then `npm run control:bootstrap` in an environment with those variables.
4. Deploy and sign in at `/owner/login`.
5. Remove `OWNER_BOOTSTRAP_PASSWORD` after the owner login is verified. The owner password can then be changed inside `/owner`.

The application also performs idempotent control and tenant schema initialization at runtime, so cold starts and new empty tenant databases are safe.

The same Vercel URL is used for every workspace:

- Owner panel: `/owner`
- Client/admin app: `/login`
- Tenant portal links: `/portal/{tenant-slug}/customer/{token}` and `/portal/{tenant-slug}/editor/{token}`
- Legacy Anjana portal links: `/customer/{token}` and `/editor/{token}`

## Owner panel process

Use `/owner` to manage clients without another deployment.

- **Add client** creates a new isolated workspace after validating the Neon database and Google Sheet.
- **Edit client login** changes the client-admin email/password and revokes existing sessions.
- **Edit connections and branding** changes studio name, logo URL, Neon URL, Sheet ID, and Orders tab. Leave the Neon URL blank to keep the encrypted existing connection.
- **Test connections** validates the client Neon database and Google Sheet.
- **Status** controls access with `draft`, `active`, and `suspended`.
- **Reset demo data** is shown only for demo tenants and requires typing `RESET`.

## Anjana tenant

Anjana is registered as the legacy tenant with slug `anjana`. The app preserves old unscoped customer/editor portal links by resolving them only against Anjana.

For a first migration, provide the legacy `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GOOGLE_SHEETS_ID`, and optional Orders tab. `npm run control:bootstrap` registers that database as the `anjana` tenant and does not truncate or reseed it.

If Anjana data was temporary/demo data, clear the tenant database first, then use `/owner` > Anjana > **Edit connections and branding** to attach the real Sheet ID and rewrite a clean Sheet snapshot.

## Add a client

1. Create an empty Neon database and Google Sheet.
2. Share the Sheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL` as an editor.
3. In `/owner`, choose **Add client** and enter the slug, studio profile, client login, Neon URL, Sheet ID, and Orders tab.
4. StudioFlow rejects duplicate connections, validates both services, initializes empty schemas/tabs, and activates the client.
5. Existing compatible StudioFlow databases show record counts and require explicit attachment confirmation.

Connection URLs are encrypted and masked. Changing a connection, login, password, or tenant status revokes existing client sessions.

For a client handoff, give the client only the normal app URL and their client-admin login. Do not share owner credentials, service-account credentials, Neon URLs, or connection strings.

## Demo workspace

Create a client with **resettable demo tenant** enabled. StudioFlow seeds fictional customers, editors, workflow states, archived records, payments, partial/final invoices, delivery records, portal tokens, and activity. Demo credentials remain owner-controlled and are not displayed publicly.

Only the owner can reset a demo. The reset requires typing `RESET`, replaces transactional demo data, rotates portal tokens, preserves the client login, and rewrites the demo Sheet snapshot.

The demo workspace should use its own Neon database and its own Google Sheet. Do not point demo to a real client database or Sheet.

## Development and verification

```sh
npm install
npm run dev
npm run check
npm run test:tenancy
npm run build
```

`npm run check` must finish with zero errors and zero warnings. Use separate test databases and Sheets when testing isolation or demo resets.

Before pushing a release, run:

```sh
npm run check
npm run test:tenancy
npm run build
git diff --check
```

Deploy production with:

```sh
npx vercel --prod
```

## Recovery

- **Lost client password:** reset it in `/owner`; all sessions are revoked.
- **Broken tenant connection:** update and validate the resource in the tenant's Connections section.
- **Compromised connection key:** rotate `CONFIG_ENCRYPTION_KEY` only after re-entering/re-encrypting every stored tenant URL; old ciphertext cannot be decrypted with a new key.
- **Suspicious access:** suspend the tenant to revoke sessions immediately, then reset credentials before reactivation.
- **Database restore:** restore only the affected tenant database. The control database and other tenants remain independent.
