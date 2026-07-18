# StudioFlow Vercel Setup

StudioFlow has one supported hosting target: **Vercel**.

- Production URL: <https://editing-lab-new.vercel.app>
- Active build configuration: `vite.config.ts`
- SvelteKit adapter: `@sveltejs/adapter-vercel`
- Database hosting: Neon
- Cloudflare Pages, Workers, Wrangler, and OpenAI Sites are not used.

## First-time Vercel setup

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, select **Add New > Project** and import the repository.
3. Keep the detected SvelteKit framework settings.
4. Use `npm install` as the install command and `npm run build` as the build command. Do not set a custom output directory.
5. Add the environment variables listed below to the Production environment.
6. Deploy the project.

## Required production environment variables

Copy the names from `.env.example` into Vercel. Never commit their real values.

| Variable | Purpose |
| --- | --- |
| `CONTROL_DATABASE_URL` | Separate Neon database for tenants, accounts, and sessions |
| `OWNER_BOOTSTRAP_EMAIL` | Creates the first owner account |
| `OWNER_BOOTSTRAP_PASSWORD` | Temporary first-owner password; remove after verifying login |
| `CONFIG_ENCRYPTION_KEY` | Encrypts saved tenant database connections; use at least 24 characters |
| `SESSION_SECRET` | Signs sessions; use a different value of at least 24 characters |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Sheets service-account email |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Google service-account private key, including line breaks |
| `PUBLIC_APP_URL` | `https://editing-lab-new.vercel.app` or the final custom domain |
| `DATABASE_STORAGE_LIMIT_MB` | Optional warning threshold; default is `500` |

The legacy `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GOOGLE_SHEETS_ID`, and `GOOGLE_SHEETS_ORDERS_TAB` variables are only needed for the one-time Anjana migration described in `README.md`. Remove them after that migration is verified.

## Initialize a new production environment

With the same production environment variables available in your terminal, run:

```sh
npm run control:migrate
npm run control:bootstrap
```

Then deploy and verify `/owner/login`. After the first owner login works, remove `OWNER_BOOTSTRAP_PASSWORD` from Vercel.

## Deploy updates

Normally, push to the Git branch connected to the Vercel Production environment. Vercel will build and deploy automatically.

For a manual deployment from a terminal already linked to the correct Vercel project:

```sh
npx vercel --prod
```

## Checks before deployment

```sh
npm install
npm run check
npm run test:tenancy
npm run build
git diff --check
```

On Windows without Developer Mode, the final local Vercel packaging step may fail when creating a symbolic link even after the application compiles successfully. Vercel's deployment environment supports that link.

## Avoid hosting confusion

- Run `npm run build`; there is no alternative Cloudflare build command.
- Do not add `wrangler.jsonc`, `vite.sites.config.ts`, or `.openai/hosting.json` unless the project intentionally changes hosting providers.
- Do not install `@sveltejs/adapter-cloudflare` or `wrangler` for this Vercel deployment.
- Keep `@sveltejs/adapter-vercel` in `package.json` and `vite.config.ts`.
