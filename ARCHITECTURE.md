# Casi Platform - System Architecture

**Version:** 2.0 (Emergency Refactor - Post-Beta)
**Last Updated:** November 27, 2025
**Platform:** Next.js 14 + Supabase + Vercel

---

## 🚨 CRITICAL: Emergency Refactor Summary (Nov 27, 2025)

This document has been updated to reflect **3 critical architectural changes** implemented during the emergency refactor to fix production data ingestion bugs discovered during beta testing.

### Changes Overview:

1. **Chat Ingestion Schema Fixed** - Corrected database schema mapping in `/api/chat-messages`
2. **Session Management Automated** - `stream.offline` EventSub webhook now auto-closes sessions
3. **Reporting Strategy Pivot** - Disabled instant post-stream reports, moving to weekly digest model

**⚠️ All previous documentation referring to `channel_name`/`channel_email` in `stream_chat_messages` is now outdated.**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagrams](#architecture-diagrams)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [Real-Time Processing](#real-time-processing)
8. [Analytics Pipeline](#analytics-pipeline)
9. [External Integrations](#external-integrations)
10. [Security Architecture](#security-architecture)
11. [Deployment Architecture](#deployment-architecture)

---

## System Overview

Casi is a **real-time streaming analytics platform** that helps Twitch and Kick streamers understand their audience through AI-powered chat analysis. The platform monitors live chat, performs multilingual sentiment analysis, detects questions, and generates comprehensive weekly digest reports.

### Core Value Proposition

- **Real-time Chat Monitoring** - Live chat ingestion and analysis during streams
- **AI-Powered Analytics** - Sentiment analysis, question detection, engagement scoring (13+ languages)
- **Community Insights** - Top chatters, recurring users, chat activity timelines
- **Weekly Digest Reports** - Sunday email reports summarizing all streams from the past week
- **Multi-Platform Support** - Twitch (live) + Kick (planned)

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         CASI PLATFORM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Frontend   │    │   Backend    │    │   Database   │      │
│  │  (Next.js)   │◄──►│  (API Routes)│◄──►│  (Supabase)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         ▲                    ▲                    ▲             │
│         │                    │                    │             │
│         └────────────────────┼────────────────────┘             │
│                              │                                   │
│  ┌──────────────────────────┴──────────────────────────┐       │
│  │           External Services & Integrations           │       │
│  ├──────────────────────────────────────────────────────┤       │
│  │  • Twitch API (OAuth, EventSub, Helix)              │       │
│  │  • Kick API (WebSocket chat monitoring)             │       │
│  │  • Resend (Email delivery)                          │       │
│  │  • Stripe (Payments & subscriptions)                │       │
│  │  • Vercel (Hosting + Cron Jobs)                     │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Inline CSS with Casi brand colors (#6932FF, #932FFE, #B8EE8A)
- **UI Components:** Custom React components
- **State Management:** React hooks + URL params
- **Authentication:** Supabase Auth (Twitch OAuth)

### Backend

- **Framework:** Next.js API Routes (serverless functions)
- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **API Design:** RESTful + Webhooks
- **Rate Limiting:** Custom rate limiter (60 req/min for chat, 3 req/hour for reports)
- **Validation:** Custom validation library

### Database

- **Primary DB:** PostgreSQL (Supabase)
- **ORM:** Supabase JS Client
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (future: stream clips)
- **Security:** Row Level Security (RLS) policies

### AI & Analytics

- **Multilingual Detection:** Custom library (13+ languages)
- **Sentiment Analysis:** Rule-based + keyword analysis
- **Question Detection:** Pattern matching + language-aware
- **Engagement Scoring:** Message frequency + sentiment + interaction

### External Services

- **Chat Monitoring:**
  - Twitch: EventSub webhooks
  - Kick: WebSocket client (backend agent)
- **Email:** Resend API
- **Payments:** Stripe (Checkout + Customer Portal)
- **Hosting:** Vercel (auto-deploy from GitHub)
- **Cron Jobs:** Vercel Cron (weekly report generation)
- **CDN:** Vercel Edge Network

---

## Architecture Diagrams

### 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USER FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                           │
├─────────────────────────────────────────────────────────────────────┤
│  Landing Page  │  Login  │  Dashboard  │  Analytics  │  Settings    │
│  /             │  /login │  /dashboard │  /analytics │  /settings   │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼ API Requests
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (API Routes)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Auth API  │  │Analytics API│  │Webhook API  │                 │
│  │  /api/auth  │  │  /api/*     │  │/api/webhooks│                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│         │                 │                 │                        │
└─────────┼─────────────────┼─────────────────┼────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (Supabase PostgreSQL)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    Users     │  │   Sessions   │  │   Messages   │              │
│  │  (Auth)      │  │ (Streams)    │  │  (Chat)      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Analytics   │  │ Subscriptions│  │   Events     │              │
│  │  (Reports)   │  │  (Stripe)    │  │ (EventSub)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │Twitch API    │  │  Resend      │  │   Stripe     │              │
│  │(EventSub)    │  │  (Email)     │  │ (Payments)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. 🔄 NEW: Data Flow - Stream Monitoring → Analytics → Weekly Report

```
┌──────────────────────────────────────────────────────────────────────┐
│                       LIVE STREAM MONITORING                          │
└──────────────────────────────────────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │   Twitch    │        │    Kick     │        │  Platform   │
  │  EventSub   │        │  WebSocket  │        │   Events    │
  │  Webhooks   │        │   Client    │        │ (Subs/Bits) │
  └─────────────┘        └─────────────┘        └─────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │     /api/webhooks/twitch-events              │
         │     • Processes EventSub notifications       │
         │     • Stores stream events (subs/follows)    │
         │     🆕 Auto-closes sessions on stream.offline │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │         /api/chat-messages                   │
         │  • Batch saves messages from frontend        │
         │  🆕 NO channel_name/channel_email stored     │
         │  🆕 Sentiment as TEXT (not Float)            │
         │  🆕 Engagement: high/medium/low              │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │         MULTILINGUAL ANALYSIS                │
         │  • Language detection (13+ languages)        │
         │  • Sentiment analysis (pos/neg/neutral)      │
         │  • Question detection                        │
         │  • Engagement scoring (high/medium/low)      │
         │  • Topic extraction                          │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │          STORE IN DATABASE                   │
         │  • stream_chat_messages                      │
         │    └─ session_id, username, message          │
         │    └─ sentiment (TEXT), is_question          │
         │    └─ engagement_level, language             │
         │  • stream_events                             │
         │  • stream_report_sessions                    │
         │    └─ 🆕 session_end set by stream.offline   │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │  🆕 WEEKLY REPORT GENERATION (Sundays)       │
         │     /api/cron/weekly-report                  │
         │  • Triggered by Vercel Cron                  │
         │  • Fetches all sessions from past week       │
         │  • Generates aggregate analytics             │
         │  • Sends digest email via Resend             │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │      STREAMER RECEIVES WEEKLY EMAIL          │
         │  ✅ All streams from past 7 days             │
         │  ✅ Aggregate community MVPs                 │
         │  ✅ Week-over-week trends                    │
         │  ✅ Top moments across all streams           │
         │  ✅ Engagement summary                       │
         └──────────────────────────────────────────────┘
```

### 3. 🆕 Session Lifecycle - Automated via EventSub

```
┌──────────────────────────────────────────────────────────────────────┐
│              AUTOMATED SESSION LIFECYCLE (Nov 2025)                   │
└──────────────────────────────────────────────────────────────────────┘

1. User goes live on Twitch
         │
         ▼
2. Frontend Dashboard detects stream is live
   • POST /api/sessions (create or reuse session)
   • Returns session_id
         │
         ▼
3. Chat messages flow in
   • POST /api/chat-messages (batched every 5-10 seconds)
   • Messages stored with session_id
         │
         ▼
4. Stream events arrive
   • POST /api/webhooks/twitch-events
   • Subs, follows, bits, raids stored
         │
         ▼
5. 🆕 STREAM ENDS - Twitch sends stream.offline event
   • POST /api/webhooks/twitch-events
   • subscription.type = 'stream.offline'
         │
         ▼
6. 🆕 AUTO-CLOSE SESSION (lines 182-221 in twitch-events route)
   • Find active session for broadcaster
   • UPDATE stream_report_sessions
     SET session_end = NOW()
     WHERE id = activeSession.id
   • Calculate duration_minutes
         │
         ▼
7. ✅ Session closed automatically
   • No frontend interaction required
   • No manual "End Stream" button needed
   • Data ready for weekly report generation

┌──────────────────────────────────────────────────────────────────────┐
│                   PREVIOUS BEHAVIOR (Before Refactor)                 │
│  ❌ Frontend had to manually call PUT /api/sessions                   │
│  ❌ Users forgot to end sessions → corrupted data                     │
│  ❌ Multiple active sessions per user caused issues                   │
└──────────────────────────────────────────────────────────────────────┘
```

### 4. Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION FLOW                           │
└──────────────────────────────────────────────────────────────────────┘

1. User clicks "Login with Twitch"
         │
         ▼
2. Redirect to /api/auth/twitch
         │
         ▼
3. Generate OAuth URL with scopes:
   • user:read:email
   • channel:read:subscriptions
   • moderator:read:followers
   • bits:read
         │
         ▼
4. Redirect to Twitch OAuth consent screen
         │
         ▼
5. User grants permissions
         │
         ▼
6. Twitch redirects to /auth/callback?code=...
         │
         ▼
7. Exchange code for access_token + refresh_token
         │
         ▼
8. Fetch Twitch user profile
         │
         ▼
9. Create/update user in Supabase Auth
   • Store access_token in user metadata
   • Store refresh_token in user metadata
   • Store Twitch user_id and username
         │
         ▼
10. Create Supabase session
         │
         ▼
11. Redirect to /dashboard
         │
         ▼
12. User is authenticated ✅

┌──────────────────────────────────────────────────────────────────────┐
│                   SESSION MANAGEMENT                                  │
└──────────────────────────────────────────────────────────────────────┘

• Sessions stored in Supabase Auth (JWT tokens)
• Access token stored in user metadata for Twitch API calls
• Refresh token used to renew access when expired
• Protected routes check session via middleware
• Logout clears Supabase session
```

---

## Database Schema

### 🔄 UPDATED: Entity Relationship Diagram

```
┌─────────────────────┐
│   auth.users        │ (Supabase managed)
│─────────────────────│
│ id (UUID)           │◄───────────┐
│ email               │            │
│ user_metadata (JSON)│            │
│ • twitch_id         │            │
│ • username          │            │
│ • access_token      │            │
│ • refresh_token     │            │
└─────────────────────┘            │
         │                         │
         │ 1:N                     │
         ▼                         │
┌─────────────────────┐            │
│ subscriptions       │            │
│─────────────────────│            │
│ id (UUID)           │            │
│ user_id (FK)        │────────────┘
│ user_email          │
│ stripe_customer_id  │
│ stripe_subscription │
│ tier_name (TEXT)    │ Starter/Pro/Agency
│ plan_name (TEXT)    │
│ status (TEXT)       │ active/trialing/canceled
│ trial_ends_at       │
│ current_period_end  │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────┐
│ stream_report_sessions      │
│─────────────────────────────│
│ id (UUID)                   │◄──────────┐
│ streamer_email              │           │
│ channel_name                │           │
│ platform (twitch/kick)      │           │
│ session_start               │           │
│ session_end                 │ 🆕 AUTO   │
│ stream_title                │           │
│ stream_category             │           │
│ stream_tags []              │           │
│ peak_viewer_count           │           │
│ avg_viewer_count            │           │
│ total_messages              │           │
│ unique_chatters             │           │
│ report_generated (bool)     │           │
│ report_sent (bool)          │           │
└─────────────────────────────┘           │
         │                                │
         │ 1:N                            │
         ▼                                │
┌─────────────────────────────┐           │
│ 🆕 stream_chat_messages     │           │
│─────────────────────────────│           │
│ id (UUID)                   │           │
│ session_id (FK)             │───────────┘
│ username                    │ 🆕 NO channel_name
│ message                     │ 🆕 NO channel_email
│ timestamp                   │
│ language                    │
│ language_confidence         │
│ sentiment (TEXT) ⚠️         │ 🆕 'positive'/'negative'/'neutral'
│ sentiment_score (FLOAT)     │
│ sentiment_reason            │
│ is_question (bool)          │
│ question_type               │
│ engagement_level (TEXT) ⚠️  │ 🆕 'high'/'medium'/'low'
│ topics []                   │
└─────────────────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────────────────┐
│ stream_session_analytics    │
│─────────────────────────────│
│ id (UUID)                   │
│ session_id (FK)             │───────────┐
│ total_messages              │           │
│ questions_count             │           │
│ positive_messages           │           │
│ negative_messages           │           │
│ neutral_messages            │           │
│ avg_sentiment_score         │           │
│ languages_detected (JSON)   │           │
│ topics_discussed (JSON)     │           │
│ engagement_peaks (JSON)     │           │
│ high_engagement_messages    │           │
│ most_active_chatters (JSON) │           │
│ motivational_insights []    │           │
└─────────────────────────────┘           │
         │                                │
         │ 1:N                            │
         ▼                                │
┌─────────────────────────────┐           │
│ stream_top_chatters         │           │
│─────────────────────────────│           │
│ id (UUID)                   │           │
│ session_id (FK)             │───────────┤
│ username                    │           │
│ message_count               │           │
│ question_count              │           │
│ avg_sentiment_score         │           │
│ high_engagement_count       │           │
│ first_message_at            │           │
│ last_message_at             │           │
│ is_recurring (bool)         │ ⭐        │
│ platform                    │           │
│ UNIQUE(session_id, username)│           │
└─────────────────────────────┘           │
                                          │
┌─────────────────────────────┐           │
│ stream_chat_timeline        │           │
│─────────────────────────────│           │
│ id (UUID)                   │           │
│ session_id (FK)             │───────────┤
│ time_bucket (timestamp)     │           │
│ minute_offset               │           │
│ message_count               │           │
│ unique_chatters             │           │
│ question_count              │           │
│ avg_sentiment_score         │           │
│ positive_count              │           │
│ negative_count              │           │
│ neutral_count               │           │
│ high_engagement_count       │           │
│ activity_intensity          │ ⭐        │
│ UNIQUE(session_id,time_bucket)│         │
└─────────────────────────────┘           │
                                          │
┌─────────────────────────────┐           │
│ stream_events               │           │
│─────────────────────────────│           │
│ id (UUID)                   │           │
│ channel_name                │           │
│ channel_email               │           │
│ event_type                  │           │
│ event_data (JSON)           │           │
│ event_timestamp             │           │
│ user_id                     │           │
│ user_name                   │           │
│ user_display_name           │           │
└─────────────────────────────┘

┌─────────────────────────────┐
│ beta_codes                  │
│─────────────────────────────│
│ id (UUID)                   │
│ code (unique)               │
│ used_by (email)             │
│ used_at                     │
│ created_at                  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ unsubscribe_emails          │
│─────────────────────────────│
│ id (UUID)                   │
│ email                       │
│ unsubscribed_at             │
└─────────────────────────────┘
```

### 🔥 Critical Schema Changes (Emergency Refactor)

#### ⚠️ `stream_chat_messages` Table - BREAKING CHANGES

**REMOVED Columns:**

- ❌ `channel_name` (was NOT NULL) - **DOES NOT EXIST IN PRODUCTION**
- ❌ `channel_email` (was NOT NULL) - **DOES NOT EXIST IN PRODUCTION**

**UPDATED Columns:**

- ⚠️ `sentiment` - Changed from `FLOAT` to `TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral'))`
- ⚠️ `engagement_level` - Changed from generic to `TEXT CHECK (engagement_level IN ('high', 'medium', 'low'))`

**Migration Impact:**

```typescript
// ❌ OLD CODE (BROKEN):
const messagesToInsert = messages.map((msg) => ({
  session_id: sessionId,
  channel_name: session.channel_name, // ❌ Column doesn't exist!
  channel_email: session.streamer_email, // ❌ Column doesn't exist!
  sentiment: msg.sentiment, // ❌ Was sending Float!
  engagement_level: 'normal', // ❌ Invalid value!
}))

// ✅ NEW CODE (CORRECT):
const messagesToInsert = messages.map((msg) => {
  // Map sentiment score to string
  let sentimentString: 'positive' | 'negative' | 'neutral' = 'neutral'
  if (msg.sentiment > 0) sentimentString = 'positive'
  else if (msg.sentiment < 0) sentimentString = 'negative'

  // Map engagement level
  let engagementLevelString: 'high' | 'medium' | 'low' = 'medium'
  if (msg.engagementLevel === 'high') engagementLevelString = 'high'
  else if (msg.engagementLevel === 'low') engagementLevelString = 'low'

  return {
    session_id: sessionId,
    username: msg.username,
    message: msg.message,
    timestamp: new Date(msg.timestamp).toISOString(),
    sentiment: sentimentString,
    is_question: msg.isQuestion || false,
    language: msg.language || 'english',
    engagement_level: engagementLevelString,
  }
})
```

**Location of Fix:** `/src/app/api/chat-messages/route.ts` (lines 57-78)

### Key Tables Explained

#### 1. **auth.users** (Supabase managed)

- Handles authentication and user sessions
- Stores Twitch OAuth tokens in user_metadata
- Primary authentication table

#### 2. **subscriptions**

- Manages paid subscriptions via Stripe
- Tracks tier (Starter/Pro/Agency)
- New USD pricing: Starter ($11.99/mo), Pro ($49.99/mo), Agency (custom)
- Links to Stripe Customer Portal

#### 3. **stream_report_sessions**

- Main table for stream sessions
- Created when monitoring starts
- 🆕 **Auto-updated when stream ends** via `stream.offline` EventSub
- Stores stream metadata (title, category, tags, CCV)

#### 4. **stream_chat_messages** 🆕

- Every chat message stored here
- **NO `channel_name` or `channel_email` columns** (common mistake!)
- Includes AI analysis (sentiment as TEXT, language, questions)
- Linked to session for analytics
- Deleted when session is deleted (CASCADE)

#### 5. **stream_session_analytics**

- Aggregated analytics per session
- Generated after stream ends
- Contains sentiment summary, language breakdown, topics

#### 6. **stream_top_chatters**

- Top 10 chatters per session
- Recurring user detection (cross-session analysis)
- Shows engagement metrics per user

#### 7. **stream_chat_timeline**

- 2-minute bucket analysis
- Activity intensity categorization
- Used for timeline visualization in reports

#### 8. **stream_events**

- Twitch EventSub events (subs, follows, bits, raids)
- 🆕 **stream.offline event triggers session closure**
- Displayed in Activity Feed
- Real-time event monitoring

---

## API Architecture

### API Route Structure

```
/api
├── /auth
│   └── /twitch                    # Twitch OAuth initiation
│
├── /account
│   └── /delete                    # Account deletion
│
├── /admin                         # Admin-only endpoints
│   ├── /billing                   # View all subscriptions & MRR
│   ├── /grant-trial               # Grant trial to users
│   ├── /link-accounts             # Link Twitch to email
│   ├── /logs                      # System logs
│   ├── /resend-report             # Resend report manually
│   ├── /sessions                  # View all sessions
│   ├── /setup-raid-subscription   # Setup raid monitoring
│   ├── /users                     # User management
│   │   └── 🆕 POST grant_pro_trial # Grant 7-day Pro trial
│   └── /backfill-subscriptions    # Backfill Stripe data
│
├── /beta-code
│   ├── /generate                  # Generate beta codes
│   └── /validate                  # Validate beta code
│
├── /chat-messages                 # 🆕 FIXED: Store chat messages (no channel fields)
├── /check-deployment              # Health check
├── /check-streamer-authorization  # Check EventSub auth
│
├── /cron                          # Scheduled jobs
│   ├── /check-tier-compliance     # Enforce tier limits
│   ├── /cleanup-stale-sessions    # Clean old sessions
│   └── 🆕 /weekly-report          # Generate weekly digests (Sundays)
│
├── /create-checkout-session       # Stripe checkout
├── /create-portal-session         # Stripe portal
│
├── /export
│   └── /analytics                 # Export analytics as JSON/CSV
│
├── /generate-report               # ⚠️ DEPRECATED: Generate post-stream report
├── /invoices                      # Fetch Stripe invoices
│
├── /kick
│   └── /stream-info               # Fetch Kick stream data
│
├── /link-subscription             # Link existing Stripe sub
├── /link-twitch-account           # Link Twitch to account
│
├── /notify-beta-signup            # Beta signup notification
│
├── /report
│   └── /[sessionId]               # Fetch report data
│
├── /send-beta-code                # Send beta code email
├── /send-welcome-email            # Welcome email
├── /sessions                      # 🆕 List/create/reuse sessions (12hr window)
├── /stream-events                 # Store EventSub events
├── /subscribe-user-events         # Setup EventSub subscriptions
│
├── /test-email                    # Test email sending
├── /test-env                      # Test env vars
├── /test-report                   # Generate test report
│
├── /tier-status                   # Check tier compliance
│
├── /twitch
│   └── /stream-info               # Fetch Twitch stream data
│
├── /unsubscribe                   # Unsubscribe from emails
├── /update-user-tokens            # Update Twitch tokens
│
├── /user
│   └── /kick-username             # Update Kick username
│
├── /user-access                   # Check user access
│
├── /verify-checkout-session       # Verify Stripe checkout
│
└── /webhooks
    ├── /stripe                    # Stripe webhook handler
    └── /twitch-events             # 🆕 Twitch EventSub (auto-closes sessions)
```

### 🆕 API Categories

#### **1. Authentication & User Management**

- `/api/auth/twitch` - Initiate Twitch OAuth
- `/auth/callback` - OAuth callback handler
- `/api/link-twitch-account` - Link Twitch to email account
- `/api/account/delete` - Delete user account

#### **2. Chat Monitoring** 🔄

- `/api/chat-messages` - **FIXED:** Store incoming chat messages (no `channel_name`/`channel_email`)
- `/api/webhooks/twitch-events` - **ENHANCED:** Receive Twitch EventSub webhooks + auto-close sessions
- Kick WebSocket client (backend agent process)

#### **3. Analytics & Reporting** 🔄

- `/api/generate-report` - ⚠️ **DEPRECATED** - Will be removed in next version
- `/api/cron/weekly-report` - **NEW** - Weekly digest generation (Sundays)
- `/api/report/[sessionId]` - Fetch report data
- `/api/sessions` - List user's stream sessions
- `/api/export/analytics` - Export analytics data

#### **4. Subscriptions & Billing**

- `/api/create-checkout-session` - Create Stripe checkout
- `/api/create-portal-session` - Open Stripe portal
- `/api/webhooks/stripe` - Handle Stripe webhooks
- `/api/invoices` - Fetch user invoices
- `/api/tier-status` - Check tier compliance

#### **5. Admin Operations** 🔄

- `/api/admin/users` - **ENHANCED:** Added `grant_pro_trial` action
- `/api/admin/billing` - **UPDATED:** USD pricing, MRR display
- `/api/admin/*` - Various admin tools
- Protected by authentication checks

#### **6. Cron Jobs** 🔄

- `/api/cron/check-tier-compliance` - Daily tier enforcement
- `/api/cron/cleanup-stale-sessions` - Weekly cleanup
- `/api/cron/weekly-report` - **NEW:** Sunday weekly report generation

---

## Authentication & Authorization

### OAuth Flow Details

```
┌──────────────────────────────────────────────────────────────┐
│              TWITCH OAUTH SCOPES REQUESTED                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ user:read:email                                          │
│     → Required: User identification and email                │
│                                                               │
│  ✅ channel:read:subscriptions                               │
│     → EventSub: New subscription events                      │
│                                                               │
│  ✅ moderator:read:followers                                 │
│     → EventSub: New follower events                          │
│                                                               │
│  ✅ bits:read                                                │
│     → EventSub: Bit/cheer events                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Token Management

**Access Token:**

- Stored in Supabase user_metadata
- Used for Twitch API calls (Helix, EventSub)
- Expires after ~4 hours

**Refresh Token:**

- Stored in Supabase user_metadata
- Used to obtain new access tokens
- Updated in `/api/update-user-tokens` when expired

**Session Management:**

- Supabase Auth handles session tokens (JWT)
- Sessions persist across browser sessions
- Protected routes use Supabase client auth check

### Row Level Security (RLS)

All tables have RLS enabled:

```sql
-- Users can only see their own stream sessions
CREATE POLICY "Users can manage own stream sessions"
ON stream_report_sessions
FOR ALL USING (streamer_email = auth.email());

-- Users can only see chat messages from their sessions
CREATE POLICY "Users can access own chat messages"
ON stream_chat_messages
FOR ALL USING (
  session_id IN (
    SELECT id FROM stream_report_sessions
    WHERE streamer_email = auth.email()
  )
);

-- Similar policies for analytics, events, top chatters, timeline
```

**Service Role Key:**

- Used in backend for bypassing RLS when needed
- Used in analytics generation (`/src/lib/analytics.ts`)
- Never exposed to frontend

---

## Real-Time Processing

### 🆕 Twitch EventSub Webhook Flow (Enhanced)

```
┌──────────────────────────────────────────────────────────────┐
│             TWITCH EVENTSUB ARCHITECTURE (v2.0)               │
└──────────────────────────────────────────────────────────────┘

1. Twitch sends webhook POST to:
   https://www.heycasi.com/api/webhooks/twitch-events
         │
         ▼
2. Webhook handler verifies HMAC signature
   • Uses TWITCH_EVENTSUB_SECRET
   • Validates Twitch-Eventsub-Message-Signature header
   • Prevents unauthorized requests
         │
         ▼
3. Check message type:
   • webhook_callback_verification → Return challenge
   • notification → Process event
   • revocation → Log subscription canceled
         │
         ▼
4. Extract event data:
   • Event type (channel.subscribe, channel.follow, stream.offline, etc.)
   • User info (username, user_id, display_name)
   • Event-specific data (tier, message, amount)
         │
         ▼
5. 🆕 SPECIAL HANDLING: stream.offline event
   IF subscription.type === 'stream.offline':
     • Find active session for broadcaster
     • UPDATE stream_report_sessions SET session_end = NOW()
     • Calculate duration_minutes
     • ✅ Session automatically closed
     • RETURN (don't create stream_event record)
         │
         ▼
6. FOR OTHER EVENTS: Store in stream_events table
   • Insert with channel_name, channel_email, event_type
   • Store full event_data as JSON
         │
         ▼
7. Frontend polls /api/stream-events every 10 seconds
         │
         ▼
8. Activity Feed displays events in real-time
```

**Code Reference:** `/src/app/api/webhooks/twitch-events/route.ts` (lines 182-221)

```typescript
// stream.offline handler (NEW)
case 'stream.offline':
  console.log(`🔴 Stream offline event received for broadcaster: ${event.broadcaster_user_login}`)

  // Find the active session for this channel
  const { data: activeSession, error: sessionError } = await supabase
    .from('stream_report_sessions')
    .select('id')
    .eq('channel_name', event.broadcaster_user_login.toLowerCase())
    .is('session_end', null) // Only consider active sessions
    .order('session_start', { ascending: false })
    .limit(1)
    .single()

  if (sessionError || !activeSession) {
    console.error(`❌ Could not find active session for offline stream`)
    return NextResponse.json({ received: true })
  }

  // Update session with end time
  const { error: updateSessionError } = await supabase
    .from('stream_report_sessions')
    .update({ session_end: new Date().toISOString() })
    .eq('id', activeSession.id)

  if (updateSessionError) {
    console.error(`❌ Failed to update session with end time`)
    return NextResponse.json({ received: true })
  }

  console.log(`✅ Session ${activeSession.id} closed for ${event.broadcaster_user_login}`)
  return NextResponse.json({ received: true })
```

### Kick Chat Monitoring (WebSocket)

```
┌──────────────────────────────────────────────────────────────┐
│                    KICK CHAT MONITORING                       │
└──────────────────────────────────────────────────────────────┘

1. Backend agent (long-running process) connects to Kick WebSocket
   • Uses kick-com library
   • Connects to specific channel
         │
         ▼
2. Receives chat messages in real-time
         │
         ▼
3. Processes each message:
   • Extract username, message, timestamp
   • Perform multilingual analysis
   • Detect sentiment, questions, topics
         │
         ▼
4. Store in stream_chat_messages table via API call
   POST /api/chat-messages (uses FIXED schema mapping)
         │
         ▼
5. Messages available for analytics generation
```

---

## Analytics Pipeline

### 🔄 NEW: Weekly Report Generation Flow

```
┌──────────────────────────────────────────────────────────────┐
│            WEEKLY DIGEST REPORT PIPELINE (Sundays)            │
└──────────────────────────────────────────────────────────────┘

TRIGGER: Vercel Cron (every Sunday at 9:00 AM UTC)
         Endpoint: GET /api/cron/weekly-report
         Header: x-vercel-cron-secret (authentication)

         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Fetch All Users                                   │
│  • Query auth.users for all active users                   │
│  • Filter out unsubscribed emails                          │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: For Each User - Fetch Past Week Sessions          │
│  • Query stream_report_sessions                             │
│  • WHERE streamer_email = user.email                        │
│  • AND session_start >= (NOW() - INTERVAL '7 days')        │
│  • AND session_end IS NOT NULL (completed streams only)     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Aggregate Analytics Across All Sessions           │
│  • Total streams this week                                  │
│  • Total messages across all streams                        │
│  • Average sentiment across all streams                     │
│  • Top chatters (cross-session aggregation)                 │
│  • Total viewer hours                                       │
│  • Week-over-week growth metrics                            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Generate Weekly Highlights                        │
│  • Best performing stream (highest engagement)              │
│  • Funniest moment across all streams                       │
│  • Most active community member                             │
│  • New recurring users detected                             │
│  • Stream title performance analysis                        │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Render Weekly Digest Email Template               │
│  • Week summary header (Nov 20-26, 2025)                    │
│  • Key metrics cards (streams, hours, messages)             │
│  • Week-over-week trend indicators                          │
│  • Top 5 community MVPs                                     │
│  • Stream performance breakdown                             │
│  • Recommendations for next week                            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Send Email via Resend API                         │
│  • POST to Resend API with HTML body                        │
│  • From: reports@heycasi.com                                │
│  • Subject: "Your Weekly Streaming Digest - Nov 20-26"     │
│  • Check unsubscribe_emails table first                     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
   ✅ WEEKLY DIGEST DELIVERED TO ALL ACTIVE STREAMERS
```

**Status:** 🚧 Placeholder implementation at `/src/app/api/cron/weekly-report/route.ts`

**TODO:**

- Implement user fetching logic
- Build aggregate analytics queries
- Design weekly digest email template
- Add week-over-week comparison logic
- Test with Vercel Cron locally

### ⚠️ Deprecated: Instant Post-Stream Reports

```
┌──────────────────────────────────────────────────────────────┐
│        DEPRECATED: POST-STREAM REPORT GENERATION              │
│              (Being replaced by weekly digests)               │
└──────────────────────────────────────────────────────────────┘

TRIGGER: ❌ User clicks "Generate Report" (being removed)
         Endpoint: POST /api/generate-report

⚠️ This endpoint still exists but will be removed in v3.0
⚠️ Do not build new features relying on this flow
⚠️ Use weekly report generation instead

         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Fetch Stream Metadata (Twitch Helix API)          │
│  • GET /helix/streams?user_login=USERNAME                   │
│  • Extract: title, game_name, tags, viewer_count           │
│  • Store in stream_report_sessions                          │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Generate Session Analytics                        │
│  • Total messages, questions, sentiment breakdown           │
│  • Language distribution                                    │
│  • Engagement peaks (high engagement messages)              │
│  • Topics discussed                                         │
│  • Store in stream_session_analytics                        │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Generate Top Chatters (Community MVPs)            │
│  • Group messages by username                               │
│  • Calculate per user: msg count, questions, sentiment      │
│  • Query last 10 streams for recurring user detection       │
│  • Rank by message count, take top 10                       │
│  • Store in stream_top_chatters                             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Generate Chat Activity Timeline                   │
│  • Create 2-minute buckets from stream start to end         │
│  • For each bucket:                                         │
│    - Count messages, unique chatters, questions             │
│    - Calculate avg sentiment, pos/neg/neutral counts        │
│    - Determine activity intensity (low/med/high/peak)       │
│  • Store in stream_chat_timeline                            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Generate Chat Highlights                          │
│  • Funniest: Highest positive sentiment (>0.7)              │
│  • Most Thoughtful: Longest question (>30 chars)            │
│  • Most Supportive: Positive + supportive keywords          │
│  • Peak Hype: High engagement during peak activity          │
│  • Return top 1 per category (4 highlights max)             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Render Email Report Template                      │
│  • Fetch all analytics data from database                   │
│  • Render HTML email with inline CSS                        │
│  • Smart timeline selection (6-8 highlights only)           │
│  • Include: MVPs, timeline, highlights, sentiment           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Send Email via Resend API                         │
│  • POST to Resend API with HTML body                        │
│  • From: reports@heycasi.com                                │
│  • Check unsubscribe_emails table first                     │
│  • Mark report_sent = true in stream_report_sessions        │
└─────────────────────────────────────────────────────────────┘
```

### Multilingual Analysis Details

**Supported Languages (13+):**

- English, Spanish, French, German, Italian
- Portuguese, Russian, Japanese, Korean, Chinese
- Arabic, Turkish, Polish

**Analysis Process:**

```typescript
// /src/lib/multilingual.ts

1. Language Detection
   • Pattern matching on characters
   • Common words analysis
   • Returns language + confidence score

2. Sentiment Analysis
   • Positive keywords: "love", "awesome", "great", "lol", "haha"
   • Negative keywords: "hate", "bad", "terrible", "worst"
   • Language-specific keywords (e.g., "jajaja" for Spanish)
   • Emoji analysis: 😀😂❤️ = positive, 😢😡 = negative
   • 🆕 Returns TEXT: 'positive', 'negative', or 'neutral'

3. Question Detection
   • Language-specific question markers
   • English: "?", "how", "what", "why", "when", "where"
   • Spanish: "¿", "cómo", "qué", "por qué"
   • French: "comment", "pourquoi", "qu'est-ce que"
   • German: "wie", "was", "warum", "wann"

4. Engagement Level
   • High: Multiple exclamation marks, caps, emojis
   • Medium: Standard message with some emotion
   • Low: Short message, no emotion indicators
   • 🆕 Returns TEXT: 'high', 'medium', or 'low'
```

---

## External Integrations

### 1. Twitch API Integration

**EventSub (Webhooks):**

```
Purpose: Real-time notifications for stream events
Endpoint: https://www.heycasi.com/api/webhooks/twitch-events
Events:
  • channel.subscribe
  • channel.follow
  • channel.cheer
  • channel.raid
  • 🆕 stream.offline (auto-closes sessions)

Setup Process:
1. User authorizes with required scopes
2. Backend creates EventSub subscriptions via Twitch API
3. Twitch sends webhook verification challenge
4. Backend responds with challenge to confirm subscription
5. Twitch sends event notifications to webhook
6. Backend verifies HMAC signature and stores events
7. 🆕 stream.offline events trigger automatic session closure
```

**Helix API:**

```
Purpose: Fetch stream metadata
Endpoints:
  • GET /helix/streams - Get stream info (title, game, viewers)
  • GET /helix/users - Get user profile

Authentication: App Access Token (client credentials flow)
Rate Limits: 800 requests per minute
```

### 2. Kick API Integration

**WebSocket Chat:**

```
Purpose: Real-time chat monitoring
Library: kick-com npm package
Connection: WebSocket to Kick chat servers

Process:
1. Backend agent connects to Kick WebSocket
2. Joins specific channel's chat room
3. Receives chat messages in real-time
4. 🆕 Sends to /api/chat-messages (FIXED schema mapping)
```

### 3. Resend Email Integration

**Email Delivery:**

```
Purpose: Send weekly digest reports
API Endpoint: https://api.resend.com/emails
From Domain: heycasi.com (fully verified)
From Address: reports@heycasi.com

Email Types:
  • 🆕 Weekly digest reports (HTML) - Sundays
  • ⚠️ Post-stream analytics reports (DEPRECATED)
  • Welcome emails
  • Beta code emails

Rate Limits: 10,000 emails/month (free tier)
```

### 4. Stripe Integration

**Subscription Management:**

```
Purpose: Handle paid subscriptions
Mode: Production (live keys)

Endpoints Used:
  • /v1/checkout/sessions - Create checkout
  • /v1/billing/portal/sessions - Customer portal
  • /v1/invoices - Fetch invoices
  • /v1/customers - Manage customers

Webhooks:
  • /api/webhooks/stripe
  • Events: checkout.session.completed, customer.subscription.*

🆕 Pricing Tiers (USD):
  • Starter: $11.99/mo - Basic analytics
  • Pro: $49.99/mo - Advanced features
  • Agency: Custom pricing - Enterprise features
```

### 5. 🆕 Vercel Cron Integration

**Scheduled Jobs:**

```
Purpose: Automated weekly report generation
Endpoint: GET /api/cron/weekly-report
Schedule: Every Sunday at 9:00 AM UTC
Authentication: x-vercel-cron-secret header

Configuration (vercel.json):
{
  "crons": [
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 9 * * 0"
    }
  ]
}

How it works:
1. Vercel triggers HTTP GET request on schedule
2. Backend validates x-vercel-cron-secret header
3. Fetches all users and their past week's streams
4. Generates aggregate analytics
5. Sends weekly digest emails via Resend
6. Logs execution status
```

---

## Security Architecture

### Security Measures

**1. Authentication:**

- Twitch OAuth 2.0 for user authentication
- Supabase Auth for session management
- JWT tokens for API authorization

**2. Database Security:**

- Row Level Security (RLS) on all tables
- Users can only access their own data
- Service role key used only in backend

**3. API Security:**

- Rate limiting on all endpoints (60 req/min for chat, 3 req/hour for reports)
- Input validation on all user inputs
- Webhook signature verification (Twitch HMAC, Stripe)
- 🆕 Cron endpoint authentication via x-vercel-cron-secret

**4. Environment Variables:**

```
# Never committed to git
# Stored in Vercel environment variables

NEXT_PUBLIC_SUPABASE_URL          # Public
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Public
SUPABASE_SERVICE_ROLE_KEY         # Secret - backend only
NEXT_PUBLIC_TWITCH_CLIENT_ID      # Public
TWITCH_CLIENT_SECRET              # Secret
TWITCH_EVENTSUB_SECRET            # Secret
RESEND_API_KEY                    # Secret
STRIPE_SECRET_KEY                 # Secret
STRIPE_WEBHOOK_SECRET             # Secret
ADMIN_EMAIL                       # Secret
🆕 CRON_SECRET                    # Secret - Vercel cron authentication
```

**5. Content Security:**

- XSS protection via input sanitization
- SQL injection prevented by Supabase parameterized queries
- CORS configured for specific origins

**6. Data Privacy:**

- Chat messages stored only for analytics
- No personal conversations stored beyond stream context
- Users can delete their account and all data
- Unsubscribe mechanism for emails

---

## Deployment Architecture

### Production Environment

```
┌──────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                        │
└──────────────────────────────────────────────────────────────┘

1. Developer pushes code to GitHub (main branch)
         │
         ▼
2. GitHub triggers webhook to Vercel
         │
         ▼
3. Vercel builds Next.js app
   • npm install
   • npm run build
   • Generates .next production build
         │
         ▼
4. Vercel deploys to edge network
   • CDN: Static assets
   • Serverless: API routes
   • Edge: Middleware
   • 🆕 Cron: Scheduled jobs
         │
         ▼
5. Live at https://www.heycasi.com
   • Auto SSL via Let's Encrypt
   • Global CDN
   • Auto scaling
```

### Infrastructure

**Hosting:** Vercel

- Next.js optimized platform
- Auto-scaling serverless functions
- Global edge network (CDN)
- Auto SSL certificates
- GitHub integration for CI/CD
- 🆕 Integrated cron job scheduler

**Database:** Supabase (PostgreSQL)

- Managed PostgreSQL database
- Auto backups
- Row Level Security
- Real-time subscriptions (future use)

**Email:** Resend

- Transactional email delivery
- Domain authentication (SPF, DKIM, DMARC)
- Delivery tracking

**Payments:** Stripe

- PCI compliant payment processing
- Customer portal for self-service
- Webhook notifications for subscription changes

### Monitoring & Logging

**Current Logging:**

- API request/response logging (`/src/lib/apiLogger.ts`)
- Error logging to console
- Stripe webhook event logging
- Admin panel for viewing logs (`/api/admin/logs`)
- 🆕 Cron job execution logging

**Future Improvements:**

- Sentry for error tracking
- LogRocket for session replay
- Analytics dashboard (Plausible/Umami)
- Uptime monitoring (Uptime Robot)

---

## Future Architecture Considerations

### Planned Enhancements

**1. Real-Time Dashboard:**

- WebSocket connections for live chat feed
- Real-time sentiment graph updates
- Live activity feed with animations

**2. Clip Generation:**

- Stream buffer service (HLS segment capture)
- FFmpeg integration for clip creation
- Clip storage in Supabase Storage
- Viral moment detection

**3. Multi-Platform Dashboard:**

- Unified view of Twitch + Kick streams
- Cross-platform analytics comparison
- Combined chat feed

**4. API Access:**

- Public API for developers
- Rate-limited API keys
- Webhook integrations for third-party tools

**5. Scalability:**

- Redis caching for frequently accessed data
- Background job processing (Bull/BullMQ)
- Separate analytics service
- Database read replicas

---

## Developer Onboarding

### Quick Start

**Prerequisites:**

- Node.js 18+
- npm or yarn
- Supabase account
- Twitch Developer account

**Setup:**

```bash
# 1. Clone repo
git clone https://github.com/yourusername/casi-platform.git
cd casi-platform

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in your credentials

# 4. Run database migrations
# Execute SQL files in /database folder in Supabase SQL editor
# ⚠️ IMPORTANT: Use database/schema.sql for correct structure
# ⚠️ DO NOT add channel_name/channel_email to stream_chat_messages!

# 5. Start dev server
npm run dev

# 6. Open http://localhost:3000
```

**Key Files to Review:**

1. `/ARCHITECTURE.md` - This file (updated Nov 27, 2025)
2. `/SESSION_LOG.md` - Development history
3. `/CLAUDE.md` - Development guidelines
4. `/database/schema.sql` - 🆕 CORRECTED database structure
5. `/src/lib/analytics.ts` - Analytics engine
6. `/src/lib/multilingual.ts` - Language processing
7. 🆕 `/src/app/api/chat-messages/route.ts` - FIXED chat ingestion
8. 🆕 `/src/app/api/webhooks/twitch-events/route.ts` - Auto session closure
9. 🆕 `/src/app/api/cron/weekly-report/route.ts` - Weekly report placeholder

---

## Glossary

**CCV** - Average Concurrent Viewers (key metric for streamers)

**EventSub** - Twitch's webhook system for real-time stream events

**RLS** - Row Level Security (PostgreSQL security feature)

**Helix API** - Twitch's latest REST API version

**Service Role Key** - Supabase admin key that bypasses RLS

**HMAC** - Hash-based Message Authentication Code (for webhook verification)

**Session** - A single stream monitoring instance

**Analytics** - Aggregated insights from chat messages

**Community MVPs** - Top chatters in a stream

**Chat Highlights** - Memorable messages (funny, thoughtful, supportive, hype)

**Activity Intensity** - Categorization of chat activity (low/medium/high/peak)

**Recurring User** - User who appeared in previous streams (loyalty indicator)

**🆕 Weekly Digest** - Aggregate report of all streams from past 7 days

**🆕 Emergency Refactor** - Nov 27, 2025 fix for production data ingestion bugs

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Chat messages not saving

**Symptom:** `POST /api/chat-messages` returns 500 error with "column does not exist"

**Cause:** Trying to insert `channel_name` or `channel_email` which don't exist in `stream_chat_messages` table

**Solution:** Use the FIXED schema mapping in `/src/app/api/chat-messages/route.ts` (lines 57-78)

### Issue 2: Sentiment validation errors

**Symptom:** Database rejects INSERT with "sentiment must be positive, negative, or neutral"

**Cause:** Sending Float values like `0.7` instead of TEXT values

**Solution:** Map sentiment scores to strings before insertion (see fixed code above)

### Issue 3: Sessions not closing

**Symptom:** Multiple active sessions for one user, `session_end` remains NULL

**Cause:** Frontend wasn't calling end session API, or stream.offline EventSub not configured

**Solution:** Ensure `stream.offline` EventSub subscription is active for the broadcaster

### Issue 4: Engagement level validation errors

**Symptom:** Database rejects "normal" as engagement_level value

**Cause:** Only 'high', 'medium', 'low' are valid

**Solution:** Map "normal" → "medium" before insertion

---

**End of Architecture Document**

_Last Updated: November 27, 2025_
_Version: 2.0 (Emergency Refactor Edition)_
_Maintainer: Casi Platform Team_

**Changelog:**

- **v2.0 (Nov 27, 2025)**: Emergency refactor - Fixed chat ingestion schema, automated session closure, pivoted to weekly reports
- **v1.0 (Nov 11, 2025)**: Initial architecture documentation
