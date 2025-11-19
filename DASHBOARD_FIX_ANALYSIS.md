# Dashboard Fix Analysis - November 19, 2025

## Problem Summary

The production dashboard at heycasi.com was showing "supabaseKey is required" errors and failing to load. This document traces the root cause and explains how the issue was introduced.

## Root Cause

**The dashboard was importing `AnalyticsService` directly in client-side code, which tries to access `SUPABASE_SERVICE_ROLE_KEY` at module load time. This environment variable only exists server-side, causing the error in the browser.**

## Timeline of Changes

### October 23, 2025 - Initial Correct Fix (commit eb83d41)

**Title:** "fix: Move session management to server-side API with service role"

**What was done correctly:**

- Created `/api/sessions` endpoint with POST and PUT methods
- Used SERVICE_ROLE_KEY in the API route (server-side only)
- Changed `analytics.ts` to use ANON_KEY (client-safe)
- Updated dashboard to call API routes instead of AnalyticsService directly
- **Removed direct AnalyticsService usage from dashboard**

**This was the correct architecture!** Client components should never import server-side modules that require SERVICE_ROLE_KEY.

```typescript
// CORRECT: Dashboard called API routes
const response = await fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ streamerEmail: email, channelName }),
})
```

### October 25, 2025 - Regression Introduced (commit a9c0abc)

**Title:** "fix: Post-stream report system - improved error logging and auto-session-end"

**What went wrong:**

- **Re-added `import { AnalyticsService } from '../../lib/analytics'` to dashboard**
- Changed `analytics.ts` back to using SERVICE_ROLE_KEY
- Dashboard started calling `AnalyticsService.storeChatMessage()` directly
- This worked in development (where all env vars are available) but **broke in production**

**Why it broke:**

1. `analytics.ts` creates Supabase client at module load:

   ```typescript
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY! // ❌ Not available in browser
   )
   ```

2. Dashboard imports AnalyticsService:

   ```typescript
   import { AnalyticsService } from '../../lib/analytics' // ❌ Client component
   ```

3. When dashboard loads in browser:
   - Module executes and tries to create Supabase client
   - `process.env.SUPABASE_SERVICE_ROLE_KEY` is undefined in browser
   - Supabase SDK throws "supabaseKey is required"

### November 11, 2025 - Problem Persisted (commits through today)

The issue continued through multiple commits:

- `0ff2507` - feat: Complete post-stream report system
- `b0dc547` - Add beta code redemption form to dashboard
- Multiple other dashboard updates
- **All kept the AnalyticsService import**

### November 19, 2025 - Proper Fix (commit edab912)

**Title:** "Fix dashboard Supabase client initialization errors"

**What was done:**

1. **Removed** `import { AnalyticsService }` from dashboard
2. Created `/api/sessions/stats` route for session stat updates
3. Implemented client-side batching functions:
   - `batchStoreMessage()` - Queues messages for API call
   - `flushMessageBatch()` - Sends batch to `/api/chat-messages`
   - `updateSessionStats()` - Calls `/api/sessions/stats`
4. All database operations now go through API routes

**This restores the correct architecture from eb83d41 with improvements.**

## Why Development Worked But Production Failed

**Development Environment:**

- `.env.local` contains ALL environment variables including SERVICE_ROLE_KEY
- Next.js dev server has access to all env vars in Node.js process
- Even though it's wrong, the client can access server-only vars

**Production Environment (Vercel):**

- Only `NEXT_PUBLIC_*` variables are sent to browser
- `SUPABASE_SERVICE_ROLE_KEY` stays server-side only (correct security)
- Client-side code cannot access it → error occurs

## The Correct Architecture

### ✅ GOOD: What We Have Now

```
Dashboard (Client) → API Route (Server) → Supabase
                     ↓
                Uses SERVICE_ROLE_KEY
```

- Client code only calls API routes
- API routes use SERVICE_ROLE_KEY server-side
- Security maintained, works in production

### ❌ BAD: What We Had

```
Dashboard (Client) → AnalyticsService (tries to use SERVICE_ROLE_KEY) → Error
```

- Client code imports server-side module
- Module tries to access SERVICE_ROLE_KEY at load time
- Browser doesn't have the key → crash

## Lessons Learned

### 1. Development ≠ Production

Just because it works locally doesn't mean it will work in production. The development environment is more permissive.

### 2. Client vs Server Separation

Next.js has clear boundaries:

- **Client Components** (`'use client'`) run in browser
- **Server Components** run on server
- **API Routes** always run on server

Never import server-only code (that uses SERVICE_ROLE_KEY) into client components.

### 3. Environment Variables Matter

- `NEXT_PUBLIC_*` → Available everywhere (browser + server)
- Non-prefixed → **Server-side only**
- SERVICE*ROLE_KEY should NEVER be `NEXT_PUBLIC*\*`

### 4. Test in Production-Like Environment

The error would have been caught immediately if tested in a production-like environment (Vercel preview deployment).

### 5. Code Reviews Should Check Imports

When reviewing changes to client components, verify:

- No imports of server-side modules
- No access to non-`NEXT_PUBLIC_*` env vars
- No direct database access (should use API routes)

## Other Potentially Affected Code

Since the AnalyticsService import was in the dashboard for ~3 weeks, we should check if any other changes made during that time might be affected:

### ✅ Already Fixed

- `AnalyticsService.storeChatMessage()` → Now uses `/api/chat-messages`
- `AnalyticsService.updateSessionStats()` → Now uses `/api/sessions/stats`
- `AnalyticsService.createSession()` → Already using `/api/sessions` (from eb83d41)
- `AnalyticsService.endSession()` → Already using `/api/sessions` (from eb83d41)

### ✅ Verified - No Other Issues

Checked all files for AnalyticsService imports:

```bash
grep -r "import.*AnalyticsService" --include="*.tsx" --include="*.ts" src/
```

**Result:** All AnalyticsService imports are in API routes (server-side only):

- `/api/admin/resend-report/route.ts` ✅ (API route)
- `/api/admin/sessions/route.ts` ✅ (API route)
- `/api/report/[sessionId]/route.ts` ✅ (API route)
- `/api/generate-report/route.ts` ✅ (API route)
- `/api/cron/cleanup-stale-sessions/route.ts` ✅ (API route)

**No client components import AnalyticsService** - the dashboard was the only problematic file.

## Prevention Strategy

### Git Hooks

Consider adding a pre-commit hook to check for:

- `'use client'` files importing from `src/lib/analytics.ts`
- Client components accessing non-`NEXT_PUBLIC_*` env vars

### Code Review Checklist

When reviewing dashboard changes:

- [ ] No server-only imports in client components
- [ ] All database operations go through API routes
- [ ] Environment variables properly prefixed
- [ ] Tested in Vercel preview environment

### Testing Protocol

Before merging dashboard changes:

1. Test locally (development)
2. Deploy to Vercel preview
3. Test preview deployment
4. Check browser console for errors
5. Verify environment variables available

## Conclusion

The issue was introduced when we reverted the correct architecture (API routes) back to direct imports (AnalyticsService) for better error logging. The proper solution was to keep the API route architecture and improve error logging within the API routes themselves, not by adding server-side imports to client components.

**The fix deployed tonight (edab912) restores the correct architecture with the added benefit of message batching for better performance.**

---

## Files Modified in Fix

1. **src/app/dashboard/page.tsx**
   - Removed: `import { AnalyticsService } from '../../lib/analytics'`
   - Added: Batching functions and API wrappers
   - Changed: Direct AnalyticsService calls → API calls

2. **src/app/api/sessions/stats/route.ts** (new file)
   - Created: PATCH endpoint for session stats updates
   - Uses: SERVICE_ROLE_KEY (server-side)
   - Validates: Session exists before updating

## Commits Involved

- `eb83d41` (Oct 23) - ✅ Initial correct fix
- `a9c0abc` (Oct 25) - ❌ Regression introduced
- `edab912` (Nov 19) - ✅ Final fix

---

_Generated: November 19, 2025_
_Author: Claude Code Analysis_
