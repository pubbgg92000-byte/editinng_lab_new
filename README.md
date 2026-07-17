# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.16.3 create --template minimal --types ts --install npm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Data retention and storage

- Successfully synchronized Google Sheets outbox records are retained for 30 days.
- Activity logs are retained for 12 months.
- Retention runs automatically at most once per day when the application receives traffic.
- Database usage is compared with `DATABASE_STORAGE_LIMIT_MB` (500 MB by default). The application shows notices at 60%, warnings at 75%, and critical warnings at 90%.
- Orders are loaded in 25-record server-side pages. Dashboard and global search queries are independently bounded.

## Media storage

StudioFlow does not store uploaded images, videos, or editing outputs in PostgreSQL. Store files in Google Drive, Cloudflare R2, Amazon S3, or another file host and save only an `https://` link in StudioFlow. Task reference and output fields reject inline `data:` values, local file paths, and non-HTTP protocols.
