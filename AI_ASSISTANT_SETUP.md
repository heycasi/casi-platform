# AI Assistant Setup Guide for Casi Platform

This guide helps you configure AI assistants (Claude, Gemini, ChatGPT, etc.) to work effectively with the Casi platform codebase.

---

## Quick Reference for AI Assistants

### Project Type

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **Deployment:** Vercel
- **Architecture:** Serverless API routes + Client components

### Critical Rules

#### 1. **Client vs Server Separation** ⚠️ MOST IMPORTANT

**NEVER import server-side modules into client components:**

```typescript
// ❌ WRONG - Will break in production
'use client'
import { AnalyticsService } from '@/lib/analytics' // Uses SERVICE_ROLE_KEY

// ✅ CORRECT - Use API routes
;('use client')
const response = await fetch('/api/sessions', {
  method: 'POST',
  body: JSON.stringify({ data }),
})
```

**Files that use `SUPABASE_SERVICE_ROLE_KEY` (server-side only):**

- `src/lib/analytics.ts`
- `src/lib/storage.ts`
- `src/lib/tierTracking.ts`
- `src/lib/apiLogger.ts`
- All files in `src/app/api/**/route.ts`

**NEVER import these into files with `'use client'` directive.**

#### 2. **Environment Variables**

```bash
# ✅ Available in browser (public)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_TWITCH_CLIENT_ID
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL

# ❌ Server-side ONLY (never expose to client)
SUPABASE_SERVICE_ROLE_KEY
TWITCH_CLIENT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
CRON_SECRET
```

**Rule:** If a file uses non-`NEXT_PUBLIC_*` env vars, it MUST be:

- An API route (`src/app/api/**/route.ts`)
- A server component (no `'use client'` directive)
- A server-side utility imported ONLY by API routes

#### 3. **Database Operations**

**All database operations from client components MUST go through API routes:**

```typescript
// ❌ WRONG - Direct database access from client
'use client'
const { data } = await supabase.from('users').select('*')

// ✅ CORRECT - Use API route
;('use client')
const response = await fetch('/api/users')
const data = await response.json()
```

**Exception:** Read-only queries using the anon key in client components are OK for public data, but prefer API routes for consistency.

---

## Architecture Overview

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing page (Server Component)
│   ├── dashboard/page.tsx       # Dashboard ('use client')
│   ├── api/                     # API Routes (Server-side)
│   │   ├── sessions/route.ts   # Session management
│   │   ├── chat-messages/route.ts
│   │   ├── webhooks/
│   │   └── admin/
│   └── auth/callback/page.tsx  # OAuth callback
├── lib/                         # Utility libraries
│   ├── analytics.ts            # ⚠️ SERVER-SIDE (uses SERVICE_ROLE_KEY)
│   ├── email.ts                # ⚠️ SERVER-SIDE (uses RESEND_API_KEY)
│   ├── multilingual.ts         # ✅ Client-safe
│   ├── rate-limit.ts           # ⚠️ SERVER-SIDE
│   └── supabase/
│       └── client.ts           # ✅ Client-safe (uses ANON_KEY)
├── components/                  # React components
│   ├── ActivityFeed.tsx        # 'use client'
│   ├── TierUpgradeNudge.tsx    # 'use client'
│   └── EmailCapture.tsx        # 'use client'
└── types/                       # TypeScript types
    ├── analytics.ts
    └── chat.ts
```

### Data Flow Patterns

#### Pattern 1: Client → API → Database

```
Dashboard (Client Component)
    ↓ fetch('/api/sessions')
API Route (Server-side)
    ↓ uses SUPABASE_SERVICE_ROLE_KEY
Supabase Database
```

**Example:**

```typescript
// Client: src/app/dashboard/page.tsx
const createSession = async () => {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ streamerEmail: email, channelName })
  })
  const { sessionId } = await response.json()
}

// Server: src/app/api/sessions/route.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ Server-side only
)

export async function POST(request: NextRequest) {
  const { streamerEmail, channelName } = await request.json()
  const { data } = await supabase.from('sessions').insert({ ... })
  return NextResponse.json({ sessionId: data.id })
}
```

#### Pattern 2: External Webhook → API → Database

```
Twitch EventSub Webhook
    ↓ POST to www.heycasi.com/api/webhooks/twitch-events
API Route verifies HMAC signature
    ↓ stores event
Supabase Database
    ↓ polled by
Dashboard displays events
```

#### Pattern 3: Cron Job → API → Background Processing

```
Vercel Cron (every 5 minutes)
    ↓ POST to /api/cron/cleanup-stale-sessions
API Route with CRON_SECRET verification
    ↓ processes old sessions
    ↓ generates reports
    ↓ sends emails
Background tasks complete
```

---

## Common Tasks & Correct Patterns

### Task: Store Chat Messages

**❌ WRONG:**

```typescript
'use client'
import { AnalyticsService } from '@/lib/analytics'

// Direct call from client
AnalyticsService.storeChatMessage(sessionId, message)
```

**✅ CORRECT:**

```typescript
'use client'
// Batch messages and send to API
const messages = []
messages.push(message)

// Flush batch
await fetch('/api/chat-messages', {
  method: 'POST',
  body: JSON.stringify({ sessionId, messages }),
})
```

### Task: Update Session Statistics

**❌ WRONG:**

```typescript
'use client'
import { AnalyticsService } from '@/lib/analytics'

AnalyticsService.updateSessionStats(sessionId, stats)
```

**✅ CORRECT:**

```typescript
'use client'
await fetch('/api/sessions/stats', {
  method: 'PATCH',
  body: JSON.stringify({ sessionId, stats }),
})
```

### Task: Send Email Report

**❌ WRONG:**

```typescript
'use client'
import { sendEmail } from '@/lib/email'

sendEmail(reportData) // Uses RESEND_API_KEY - not available in browser
```

**✅ CORRECT:**

```typescript
'use client'
await fetch('/api/generate-report', {
  method: 'POST',
  body: JSON.stringify({ sessionId }),
})

// Server: src/app/api/generate-report/route.ts
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { sessionId } = await request.json()
  const report = await generateReport(sessionId)
  await sendEmail(report) // ✅ Server-side only
  return NextResponse.json({ success: true })
}
```

### Task: Create Stripe Checkout Session

**❌ WRONG:**

```typescript
'use client'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!) // Not available
```

**✅ CORRECT:**

```typescript
'use client'
const response = await fetch('/api/create-checkout-session', {
  method: 'POST',
  body: JSON.stringify({ priceId, email }),
})
const { url } = await response.json()
window.location.href = url
```

---

## Database Schema Quick Reference

### Key Tables

**stream_report_sessions** (main session tracking)

- `id` (uuid, primary key)
- `streamer_email` (varchar)
- `channel_name` (varchar)
- `session_start` (timestamp)
- `session_end` (timestamp)
- `stream_title` (varchar)
- `stream_category` (varchar)
- `peak_viewer_count` (integer)
- `total_messages` (integer)

**stream_chat_messages** (individual chat messages)

- `id` (uuid, primary key)
- `session_id` (uuid, foreign key)
- `username` (varchar)
- `message` (text)
- `timestamp` (timestamp)
- `sentiment` (decimal)
- `is_question` (boolean)
- `language` (varchar)

**stream_top_chatters** (top 10 chatters per session)

- `session_id` (uuid, foreign key)
- `username` (varchar)
- `message_count` (integer)
- `is_recurring` (boolean)

**stream_events** (Twitch EventSub events)

- `id` (uuid, primary key)
- `channel_name` (varchar)
- `event_type` (varchar) - 'channel.subscribe', 'channel.raid', etc.
- `event_data` (jsonb)

**subscriptions** (Stripe subscriptions)

- `id` (uuid, primary key)
- `user_email` (varchar)
- `tier` (varchar) - 'Creator', 'Pro', 'Streamer+'
- `stripe_subscription_id` (varchar)
- `status` (varchar) - 'active', 'canceled', 'past_due'

### Row Level Security (RLS)

**All tables have RLS enabled.** When using:

- `SUPABASE_SERVICE_ROLE_KEY` → Bypasses RLS (for admin operations)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Enforces RLS (user can only see their own data)

**Use SERVICE_ROLE_KEY when:**

- Admin needs to view all users' data
- Background jobs processing multiple users
- System operations (cron jobs, cleanup)

**Use ANON_KEY when:**

- Client-side queries for current user's data
- Public data that anyone can read

---

## Common Pitfalls & How to Avoid Them

### Pitfall 1: "supabaseKey is required" Error

**Cause:** Importing server-side module into client component

**Fix:**

1. Check if file has `'use client'` directive
2. Search for imports from `@/lib/analytics`, `@/lib/email`, etc.
3. Replace with API route calls

### Pitfall 2: "process.env.X is undefined" in Browser Console

**Cause:** Trying to access server-only env var from client

**Fix:**

1. Move logic to API route
2. Or prefix variable with `NEXT_PUBLIC_` (only if safe to expose)

### Pitfall 3: RLS Policy Violation

**Error:** `new row violates row-level security policy`

**Cause:** Using ANON_KEY when SERVICE_ROLE_KEY is needed

**Fix:**

```typescript
// Change from:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ❌ Enforces RLS
)

// To:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ Bypasses RLS
)
```

### Pitfall 4: CORS Errors on Webhook Endpoints

**Cause:** Webhook URL uses wrong domain (redirect issues)

**Fix:** Always use `https://www.heycasi.com` (with www) for webhooks

- Twitch EventSub webhooks don't follow redirects
- `heycasi.com` redirects to `www.heycasi.com` → verification fails

### Pitfall 5: Working Locally, Broken in Production

**Cause:** Development environment has access to all env vars, production doesn't

**Fix:**

1. Test in Vercel preview deployment before merging
2. Use `vercel env pull` to check production env vars
3. Never rely on server-only vars being available in client

---

## Testing Checklist

Before pushing code changes:

### Local Testing

- [ ] `npm run dev` starts without errors
- [ ] Check browser console for errors
- [ ] Test all modified features
- [ ] Verify environment variables loaded

### Pre-Deploy Testing

- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Verify no server-only imports in client components

### Production Testing (After Deploy)

- [ ] Deploy to Vercel preview
- [ ] Test in preview environment
- [ ] Check browser console in preview
- [ ] Verify API routes work
- [ ] Confirm webhooks still functioning

---

## AI Assistant Prompt Template

When starting a new conversation with an AI assistant about Casi:

```
I'm working on the Casi platform - an AI-powered analytics tool for Twitch streamers.

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Supabase (PostgreSQL)
- Deployed on Vercel

**CRITICAL RULES:**
1. NEVER import server-side modules (analytics.ts, email.ts, storage.ts) into client components ('use client')
2. All database operations from client → API routes → database
3. Only NEXT_PUBLIC_* env vars are available in browser
4. SUPABASE_SERVICE_ROLE_KEY must ONLY be used server-side

**Project Docs:**
- ARCHITECTURE.md - Full system architecture
- CLAUDE.md - Development guidelines
- SESSION_LOG.md - Development history
- DASHBOARD_FIX_ANALYSIS.md - Common pitfall example

[Your specific question/task here]
```

---

## Gemini-Specific Setup

Since you mentioned Gemini hasn't been set up properly, here are specific things to configure:

### 1. **Context Window**

Gemini 2.0 has a 2M token context window. Upload these files at the start of each session:

**Priority 1 (Always include):**

- `ARCHITECTURE.md` - System overview
- `CLAUDE.md` - Development guidelines
- `AI_ASSISTANT_SETUP.md` - This file
- `DASHBOARD_FIX_ANALYSIS.md` - Real example of common mistake

**Priority 2 (When working on specific features):**

- `SESSION_LOG.md` - Development history
- `README.md` - Quick reference
- Relevant source files

### 2. **System Instructions**

Add this to Gemini's system instructions:

```
You are a senior TypeScript developer working on the Casi platform.

CRITICAL ARCHITECTURE RULES:
1. Client components ('use client') NEVER import from src/lib/analytics.ts, src/lib/email.ts, src/lib/storage.ts
2. Database operations from client → API route → database
3. Server-only env vars: SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, RESEND_API_KEY
4. Always use API routes for database writes from client code

Reference ARCHITECTURE.md and AI_ASSISTANT_SETUP.md before suggesting code changes.
```

### 3. **File Organization**

Create a Gemini workspace/project with:

- Repository: `https://github.com/heycasi/casi-platform`
- Primary language: TypeScript
- Framework: Next.js 14
- Key files to track: All `.md` docs in root

### 4. **Quality Checks**

Before accepting Gemini's suggestions, verify:

- [ ] No `import { AnalyticsService }` in client components
- [ ] No `process.env.SUPABASE_SERVICE_ROLE_KEY` outside API routes
- [ ] All database operations from client go through `/api/*`
- [ ] No mixing of client and server code

### 5. **Gemini Advantages**

Leverage Gemini's strengths:

- **Large context:** Upload entire file trees for analysis
- **Multimodal:** Share screenshots of errors
- **Code execution:** Test TypeScript snippets before implementing
- **Search:** Can search latest Next.js 14 documentation

---

## Other AI Assistants (ChatGPT, Cursor, etc.)

### ChatGPT Setup

- Use GPT-4 Turbo (128k context)
- Upload key .md files via file attachment
- Create custom GPT with system instructions from above
- Enable code interpreter for testing

### Cursor IDE Setup

- Add `.cursorignore` file:
  ```
  node_modules/
  .next/
  .vercel/
  public/
  *.log
  ```
- Configure rules in `.cursorrules`:
  ```
  - Never import analytics.ts into client components
  - All database ops from client → API routes
  - Use NEXT_PUBLIC_* for client-accessible env vars
  ```

### GitHub Copilot Setup

- Works in VSCode/Cursor
- Learns from existing code patterns
- May suggest wrong patterns - always review against this guide

---

## Quick Debugging Commands

```bash
# Check for problematic imports
grep -r "import.*AnalyticsService" --include="*.tsx" src/app/
grep -r "import.*email" --include="*.tsx" src/app/

# Check for client components
grep -r "'use client'" --include="*.tsx" src/

# Verify environment variables
vercel env pull .env.production --environment=production

# Test build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# View recent commits affecting specific file
git log --oneline -10 -- src/app/dashboard/page.tsx
```

---

## Support & Resources

- **Architecture Docs:** `ARCHITECTURE.md`
- **Development Guide:** `CLAUDE.md`
- **Session History:** `SESSION_LOG.md`
- **Common Mistakes:** `DASHBOARD_FIX_ANALYSIS.md`
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

## Version History

- **v1.0** (Nov 19, 2025) - Initial creation after dashboard fix
  - Comprehensive client/server separation rules
  - Gemini-specific setup instructions
  - Common pitfalls and solutions

---

_Last Updated: November 19, 2025_
_Maintained by: Connor Dahl_
_Purpose: Ensure all AI assistants understand Casi architecture correctly_
