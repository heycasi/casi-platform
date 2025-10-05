# Repository Guidelines

## Project Structure & Module Organization
The app source lives in `src` with the App Router under `src/app` (route folders mirror public URLs), shared UI in `src/components`, utilities in `src/lib`, and shared types in `src/types`. Static assets stay in `public`. Database and Supabase DDL scripts live in `database` and `supabase-migrations`, while deploy helpers and local automation live in `scripts/`.

## Build, Test, and Development Commands
- `npm run dev` starts the Next.js dev server on http://localhost:3000.
- `npm run build` compiles the production bundle; fix lint and TypeScript warnings locally because CI ignores them.
- `npm run lint` runs the Next.js ESLint preset; keep output clean before merging.
- `npm run migrate:db` applies Supabase migrations via `scripts/migrate-database.js`.
- `npm run setup:reports` regenerates streaming reports assets; rerun when `database/` or `scripts/` change.
- `npm run test:reports` validates the reporting setup in a CI-like mode.

## Coding Style & Naming Conventions
Author React function components in TypeScript using `export default function ComponentName()`. Follow two-space indentation, single quotes for strings in `.ts/.tsx`, and trailing commas where the compiler inserts them. Components and files use PascalCase, helper utilities use camelCase. Styling relies on Tailwind classes in markup; limit bespoke CSS to `src/app/globals.css`. ESLint extends `next/core-web-vitals`; clear warnings locally rather than depending on the relaxed `next.config.js` build flags.

## Testing Guidelines
Automated UI tests are not yet in place, so perform manual smoke tests on critical flows (`/login`, `/dashboard`, checkout) before opening a PR. Always run `npm run test:reports` after modifying reporting or database scripts and share noteworthy console output. When adding automated coverage, colocate specs under `src/**/__tests__` with a `.test.tsx` suffix and focus on new logic paths.

## Commit & Pull Request Guidelines
Commits use short, imperative summaries (see `git log`: "Reduce header size...", "Add comprehensive reactbits-inspired text animations..."). Group related changes and avoid drive-by reformatting. PRs need a concise description, testing notes, and screenshots or Loom links for UI tweaks. Link relevant issues and confirm the Vercel preview deploy passes before requesting review.

## Environment & Configuration
Copy `.env.example` to `.env.local` for local work and keep secrets out of Git. Required keys cover Supabase, Stripe, Resend, and Vercel IDs. Never commit environment files; update Vercel project variables for shared changes and coordinate rotations with the team.
