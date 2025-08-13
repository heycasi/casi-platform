# casi-platform
Casi Platform - Real-time Streaming Analytics

## Deployment

This repo is configured to deploy with Vercel via GitHub Actions.

### 1) Create a Vercel project
- Import this GitHub repo into Vercel (New Project → Import Git Repository).
- Vercel will auto-detect Next.js. Keep defaults unless you need custom build settings.

### 2) Get required IDs and token
- In Vercel, go to Project Settings → General to find:
  - `ORG_ID`
  - `PROJECT_ID`
- Create a Vercel token: Account Settings → Tokens → Create.

### 3) Add GitHub repository secrets
Add these secrets in GitHub repo Settings → Secrets and variables → Actions:
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`

Add any runtime env vars your app needs in Vercel Project Settings → Environment Variables (recommended), or as GitHub Actions variables as needed.

### 4) GitHub Actions workflow
Workflow file: `.github/workflows/vercel-deploy.yml`
- Pull Requests: builds and deploys a preview
- `main` branch: builds and deploys to production

You can also trigger manually via “Run workflow”.

### Notes
- Node 18 is used in CI to match Next.js 14 requirements.
- ESLint/TypeScript errors are ignored during build per `next.config.js`.

## Twitch Discovery API (experimental)

Endpoint: `POST /api/twitch/discover`

Body:
```json
{ "game": "Call of Duty", "first": 20 }
```

- Fetches live streams (optionally filtered by `game`), enriches with user bios, extracts a business email (best-effort) from the description, resolves game names, and stores/upserts into `twitch_streamers`.
- Requires env: `NEXT_PUBLIC_TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`.
- DB schema: `database/twitch-scraper.sql` (run in Supabase).

Response:
```json
{ "count": 20, "records": [ { "login": "...", "email": "...", "game_name": "...", "current_viewer_count": 123 } ] }
```
