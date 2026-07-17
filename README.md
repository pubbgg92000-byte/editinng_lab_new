# StudioFlow

StudioFlow is a multi-tenant workflow system for editing studios. One deployment serves many clients while every client is fixed to its own Neon database and Google Sheet.

## Architecture

- The **control database** stores tenants, salted password hashes, revocable sessions, encrypted tenant connection URLs, connection health, and owner audit records.
- Every **tenant database** stores only that studio's customers, editors, orders, tasks, payments, invoices, settings, and sync queue.
- The request hook resolves the signed-in account once and fixes the tenant context for the request. Routes never accept a tenant or database selector from client input.
- Customer and editor portals use `/portal/{tenant-slug}/...`. Existing unscoped portal links resolve only against the registered legacy tenant.

## First deployment

1. Create a separate Neon database for the control plane.
2. Copy `.env.example` into the hosting environment and provide `CONTROL_DATABASE_URL`, independent encryption/session secrets, the owner bootstrap credentials, Google service-account credentials, and `PUBLIC_APP_URL`.
3. Run `npm run control:migrate`, then `npm run control:bootstrap` in an environment with those variables.
4. Deploy and sign in at `/owner/login`.
5. Remove `OWNER_BOOTSTRAP_PASSWORD` after the owner login is verified. The owner password can then be changed inside `/owner`.

The application also performs idempotent control and tenant schema initialization at runtime, so cold starts and new empty tenant databases are safe.

## Preserve the existing Anjana tenant

For the one-time bootstrap, provide the legacy `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GOOGLE_SHEETS_ID`, and optional Orders tab. `npm run control:bootstrap` registers that database as the `anjana` tenant and does not truncate or reseed it. Verify dashboard counts, Sheet sync, and existing `/customer/{token}` and `/editor/{token}` links before removing the legacy environment variables.

## Add a client

1. Create an empty Neon database and Google Sheet.
2. Share the Sheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL` as an editor.
3. In `/owner`, choose **Add client** and enter the slug, studio profile, client login, Neon URL, Sheet ID, and Orders tab.
4. StudioFlow rejects duplicate connections, validates both services, initializes empty schemas/tabs, and activates the client.
5. Existing compatible StudioFlow databases show record counts and require explicit attachment confirmation.

Connection URLs are encrypted and masked. Changing a connection, login, password, or tenant status revokes existing client sessions.

## Demo workspace

Create a client with **resettable demo tenant** enabled. StudioFlow seeds fictional customers, editors, workflow states, archived records, payments, partial/final invoices, delivery records, portal tokens, and activity. Demo credentials remain owner-controlled and are not displayed publicly.

Only the owner can reset a demo. The reset requires typing `RESET`, replaces transactional demo data, rotates portal tokens, preserves the client login, and rewrites the demo Sheet snapshot.

## Development and verification

```sh
npm install
npm run dev
npm run check
npm run test:tenancy
npm run build
```

`npm run check` must finish with zero errors and zero warnings. Use separate test databases and Sheets when testing isolation or demo resets.

## Recovery

- **Lost client password:** reset it in `/owner`; all sessions are revoked.
- **Broken tenant connection:** update and validate the resource in the tenant's Connections section.
- **Compromised connection key:** rotate `CONFIG_ENCRYPTION_KEY` only after re-entering/re-encrypting every stored tenant URL; old ciphertext cannot be decrypted with a new key.
- **Suspicious access:** suspend the tenant to revoke sessions immediately, then reset credentials before reactivation.
- **Database restore:** restore only the affected tenant database. The control database and other tenants remain independent.
