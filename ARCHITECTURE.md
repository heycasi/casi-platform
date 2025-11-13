# Casi Platform - System Architecture

**Version:** 1.0
**Last Updated:** November 11, 2025
**Platform:** Next.js 14 + Supabase + Vercel

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

Casi is a **real-time streaming analytics platform** that helps Twitch and Kick streamers understand their audience through AI-powered chat analysis. The platform monitors live chat, performs multilingual sentiment analysis, detects questions, and generates comprehensive post-stream reports.

### Core Value Proposition

- **Real-time Chat Monitoring** - Live chat ingestion and analysis during streams
- **AI-Powered Analytics** - Sentiment analysis, question detection, engagement scoring (13+ languages)
- **Community Insights** - Top chatters, recurring users, chat activity timelines
- **Actionable Reports** - Post-stream email reports with highlights and recommendations
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
│  │  • Vercel (Hosting & deployment)                    │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Inline CSS with Casi brand colors (#6932FF, #932FFE, #5EEAD4)
- **UI Components:** Custom React components
- **State Management:** React hooks + URL params
- **Authentication:** Supabase Auth (Twitch OAuth)

### Backend

- **Framework:** Next.js API Routes (serverless functions)
- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **API Design:** RESTful + Webhooks
- **Rate Limiting:** Custom rate limiter (5-30 req/min)
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

### 2. Data Flow: Stream Monitoring → Analytics → Report

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
         │     /api/chat-messages (Kick)                │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │         MULTILINGUAL ANALYSIS                │
         │  • Language detection (13+ languages)        │
         │  • Sentiment analysis (pos/neg/neutral)      │
         │  • Question detection                        │
         │  • Engagement scoring (high/med/low)         │
         │  • Topic extraction                          │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │          STORE IN DATABASE                   │
         │  • stream_chat_messages                      │
         │  • stream_events                             │
         │  • stream_report_sessions                    │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │      WHEN STREAM ENDS (Manual Trigger)       │
         │      /api/generate-report                    │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │         ANALYTICS GENERATION                 │
         │  1. Stream metadata (Twitch Helix API)       │
         │  2. Chat sentiment aggregation               │
         │  3. Top chatters (recurring detection)       │
         │  4. Chat activity timeline (2-min buckets)   │
         │  5. Chat highlights (funny/thoughtful/hype)  │
         │  6. Engagement peaks & insights              │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │      STORE ANALYTICS IN DATABASE             │
         │  • stream_session_analytics                  │
         │  • stream_top_chatters                       │
         │  • stream_chat_timeline                      │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │       EMAIL REPORT GENERATION                │
         │  • Fetch all analytics data                  │
         │  • Render HTML email template                │
         │  • Send via Resend API                       │
         └──────────────────────────────────────────────┘
                                  │
                                  ▼
         ┌──────────────────────────────────────────────┐
         │      STREAMER RECEIVES EMAIL                 │
         │  ✅ Stream summary                           │
         │  ✅ Community MVPs                           │
         │  ✅ Chat activity timeline                   │
         │  ✅ Chat highlights                          │
         │  ✅ Sentiment trends                         │
         └──────────────────────────────────────────────┘
```

### 3. Authentication Flow

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

### Entity Relationship Diagram

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
│ stripe_subscriptions│            │
│─────────────────────│            │
│ id (UUID)           │            │
│ user_id (FK)        │────────────┘
│ stripe_customer_id  │
│ stripe_subscription │
│ tier                │
│ status              │
│ viewer_limit        │
│ messages_this_month │
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
│ session_end                 │           │
│ stream_title                │ NEW       │
│ stream_category             │ NEW       │
│ stream_tags []              │ NEW       │
│ avg_viewer_count            │ NEW       │
│ total_messages              │           │
│ unique_chatters             │           │
│ report_generated (bool)     │           │
│ report_sent (bool)          │           │
└─────────────────────────────┘           │
         │                                │
         │ 1:N                            │
         ▼                                │
┌─────────────────────────────┐           │
│ stream_chat_messages        │           │
│─────────────────────────────│           │
│ id (UUID)                   │           │
│ session_id (FK)             │───────────┘
│ username                    │
│ message                     │
│ timestamp                   │
│ language                    │
│ language_confidence         │
│ sentiment (pos/neg/neutral) │
│ sentiment_score             │
│ sentiment_reason            │
│ is_question (bool)          │
│ question_type               │
│ engagement_level            │
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
│ stream_top_chatters (NEW)   │           │
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
│ stream_chat_timeline (NEW)  │           │
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
│ session_id (FK)             │───────────┘
│ channel_name                │
│ channel_email               │
│ event_type                  │
│ event_data (JSON)           │
│ event_timestamp             │
│ user_id                     │
│ user_name                   │
│ user_display_name           │
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

### Key Tables Explained

#### 1. **auth.users** (Supabase managed)

- Handles authentication and user sessions
- Stores Twitch OAuth tokens in user_metadata
- Primary authentication table

#### 2. **stripe_subscriptions**

- Manages paid subscriptions via Stripe
- Tracks tier (free/streamer/streamer+/studio)
- Enforces viewer limits and message quotas
- Links to Stripe Customer Portal

#### 3. **stream_report_sessions**

- Main table for stream sessions
- Created when monitoring starts
- Updated when stream ends
- Stores stream metadata (title, category, tags, CCV)

#### 4. **stream_chat_messages**

- Every chat message stored here
- Includes AI analysis (sentiment, language, questions)
- Linked to session for analytics
- Deleted when session is deleted (CASCADE)

#### 5. **stream_session_analytics**

- Aggregated analytics per session
- Generated after stream ends
- Contains sentiment summary, language breakdown, topics

#### 6. **stream_top_chatters** (NEW - Nov 2025)

- Top 10 chatters per session
- Recurring user detection (cross-session analysis)
- Shows engagement metrics per user

#### 7. **stream_chat_timeline** (NEW - Nov 2025)

- 2-minute bucket analysis
- Activity intensity categorization
- Used for timeline visualization in reports

#### 8. **stream_events**

- Twitch EventSub events (subs, follows, bits, raids)
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
│   ├── /billing                   # View all subscriptions
│   ├── /grant-trial               # Grant trial to users
│   ├── /link-accounts             # Link Twitch to email
│   ├── /logs                      # System logs
│   ├── /resend-report             # Resend report manually
│   ├── /sessions                  # View all sessions
│   ├── /setup-raid-subscription   # Setup raid monitoring
│   ├── /users                     # User management
│   └── /backfill-subscriptions    # Backfill Stripe data
│
├── /beta-code
│   ├── /generate                  # Generate beta codes
│   └── /validate                  # Validate beta code
│
├── /chat-messages                 # Store chat messages
├── /check-deployment              # Health check
├── /check-streamer-authorization  # Check EventSub auth
│
├── /cron                          # Scheduled jobs
│   ├── /check-tier-compliance     # Enforce tier limits
│   └── /cleanup-stale-sessions    # Clean old sessions
│
├── /create-checkout-session       # Stripe checkout
├── /create-portal-session         # Stripe portal
│
├── /export
│   └── /analytics                 # Export analytics as JSON/CSV
│
├── /generate-report               # Generate post-stream report
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
├── /sessions                      # List user sessions
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
    └── /twitch-events             # Twitch EventSub webhook
```

### API Categories

#### **1. Authentication & User Management**

- `/api/auth/twitch` - Initiate Twitch OAuth
- `/auth/callback` - OAuth callback handler
- `/api/link-twitch-account` - Link Twitch to email account
- `/api/account/delete` - Delete user account

#### **2. Chat Monitoring**

- `/api/chat-messages` - Store incoming chat messages
- `/api/webhooks/twitch-events` - Receive Twitch EventSub webhooks
- Kick WebSocket client (backend agent process)

#### **3. Analytics & Reporting**

- `/api/generate-report` - Generate post-stream analytics
- `/api/report/[sessionId]` - Fetch report data
- `/api/sessions` - List user's stream sessions
- `/api/export/analytics` - Export analytics data

#### **4. Subscriptions & Billing**

- `/api/create-checkout-session` - Create Stripe checkout
- `/api/create-portal-session` - Open Stripe portal
- `/api/webhooks/stripe` - Handle Stripe webhooks
- `/api/invoices` - Fetch user invoices
- `/api/tier-status` - Check tier compliance

#### **5. Admin Operations**

- `/api/admin/*` - Various admin tools
- Protected by authentication checks

#### **6. Cron Jobs**

- `/api/cron/check-tier-compliance` - Daily tier enforcement
- `/api/cron/cleanup-stale-sessions` - Weekly cleanup

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

### Twitch EventSub Webhook Flow

```
┌──────────────────────────────────────────────────────────────┐
│                 TWITCH EVENTSUB ARCHITECTURE                  │
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
   • Event type (channel.subscribe, channel.follow, etc.)
   • User info (username, user_id, display_name)
   • Event-specific data (tier, message, amount)
         │
         ▼
5. Store in stream_events table
   • Insert with session_id, channel_name, event_type
   • Store full event_data as JSON
         │
         ▼
6. Frontend polls /api/stream-events every 10 seconds
         │
         ▼
7. Activity Feed displays events in real-time
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
   POST /api/chat-messages
         │
         ▼
5. Messages available for analytics generation
```

---

## Analytics Pipeline

### Analytics Generation Flow

```
┌──────────────────────────────────────────────────────────────┐
│          POST-STREAM ANALYTICS GENERATION PIPELINE            │
└──────────────────────────────────────────────────────────────┘

TRIGGER: User clicks "Generate Report" in dashboard
         OR
         Manual script: node scripts/send-millzaatv-report.js

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
         │
         ▼
   ✅ REPORT DELIVERED TO STREAMER INBOX
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
```

---

## External Integrations

### 1. Twitch API Integration

**EventSub (Webhooks):**

```
Purpose: Real-time notifications for stream events
Endpoint: https://www.heycasi.com/api/webhooks/twitch-events
Events: channel.subscribe, channel.follow, channel.cheer, channel.raid

Setup Process:
1. User authorizes with required scopes
2. Backend creates EventSub subscriptions via Twitch API
3. Twitch sends webhook verification challenge
4. Backend responds with challenge to confirm subscription
5. Twitch sends event notifications to webhook
6. Backend verifies HMAC signature and stores events
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
4. Sends to /api/chat-messages for storage and analysis
```

### 3. Resend Email Integration

**Email Delivery:**

```
Purpose: Send post-stream reports
API Endpoint: https://api.resend.com/emails
From Domain: heycasi.com (fully verified)
From Address: reports@heycasi.com

Email Types:
  • Post-stream analytics reports (HTML)
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

Pricing Tiers:
  • Free: $0/mo - 100 viewers
  • Streamer: $9/mo - 500 viewers
  • Streamer+: $19/mo - 2000 viewers
  • Studio: $49/mo - 10000 viewers
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

- Rate limiting on all endpoints (5-30 req/min)
- Input validation on all user inputs
- Webhook signature verification (Twitch HMAC, Stripe)

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

# 5. Start dev server
npm run dev

# 6. Open http://localhost:3000
```

**Key Files to Review:**

1. `/ARCHITECTURE.md` - This file
2. `/SESSION_LOG.md` - Development history
3. `/CLAUDE.md` - Development guidelines
4. `/database/schema.sql` - Database structure
5. `/src/lib/analytics.ts` - Analytics engine
6. `/src/lib/multilingual.ts` - Language processing

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

---

**End of Architecture Document**

_Last Updated: November 11, 2025_
_Version: 1.0_
_Maintainer: Casi Platform Team_
