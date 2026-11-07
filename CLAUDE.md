# CLAUDE.md

Read `PROJECT_CONTEXT.md` first. It holds the architecture summary, safety rules, bug list, UI/UX plan, and the progress checklist. When the user says "resume", continue from the first unchecked Progress item, and update `PROJECT_CONTEXT.md` after each completed item.

Key rules:
- Local `.env.local` uses the **production** databases. Browser checks are read-only unless the user approves a write.
- Keep all features and behavior the same. Only UI/UX simplification and bug fixes change.
- Work on branch `enhance/ux-and-bugfixes`. Commit only when asked.
- Run `npm run check`, `npm run test:capabilities`, and `npm run test:tenancy` after changes.
