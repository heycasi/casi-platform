# Casi Platform

**Real-time Streaming Analytics for Twitch & Kick**

Casi is an AI-powered analytics platform that helps streamers understand their audience through real-time chat analysis, sentiment tracking, and comprehensive post-stream reports.

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://www.heycasi.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)

---

## 🚀 Features

- **Real-Time Chat Monitoring** - Live chat ingestion and analysis during streams
- **AI-Powered Analytics** - Sentiment analysis in 13+ languages
- **Community Insights** - Top chatters with recurring user detection
- **Chat Activity Timeline** - Visualized engagement patterns throughout streams
- **Chat Highlights** - Memorable moments (funny, thoughtful, supportive, hype)
- **Post-Stream Reports** - Comprehensive email reports with actionable insights
- **Multi-Platform Support** - Twitch (live) + Kick (in development)
- **Activity Feed** - Real-time stream events (subs, follows, bits, raids)

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture with diagrams
- **[SESSION_LOG.md](./SESSION_LOG.md)** - Development history and feature timeline
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and testing methodology
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions

---

## 🛠️ Technology Stack

**Frontend:**

- Next.js 14 (App Router)
- TypeScript
- React 18
- Custom CSS (Casi branding: #6932FF, #932FFE, #5EEAD4)

**Backend:**

- Next.js API Routes (serverless)
- Node.js 18+
- TypeScript
- Custom rate limiting & validation

**Database:**

- PostgreSQL (Supabase)
- Row Level Security (RLS)
- Real-time subscriptions

**Integrations:**

- Twitch API (OAuth, EventSub, Helix)
- Kick API (WebSocket)
- Resend (Email delivery)
- Stripe (Payments)

**Hosting:**

- Vercel (auto-deploy from GitHub)
- Global CDN
- Serverless functions

---

## 🚦 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Twitch Developer account
- Resend API key
- Stripe account (for payments)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/casi-platform.git
cd casi-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your credentials (see Environment Variables section)

# 4. Run database migrations
# Execute SQL files in /database folder in your Supabase SQL editor
# Start with: schema.sql, then other migrations in chronological order

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twitch
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_EVENTSUB_SECRET=your_eventsub_secret

# Email
RESEND_API_KEY=your_resend_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Admin
ADMIN_EMAIL=your_admin_email
```

---

## 📦 Project Structure

```
casi-platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── webhooks/      # Twitch/Stripe webhooks
│   │   │   ├── admin/         # Admin endpoints
│   │   │   └── ...            # Other API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── login/             # Login page
│   │   ├── pricing/           # Pricing page
│   │   └── ...                # Other pages
│   ├── components/            # React components
│   └── lib/                   # Utility libraries
│       ├── analytics.ts       # Analytics engine
│       ├── multilingual.ts    # Language processing
│       ├── email.ts           # Email templates
│       └── ...                # Other utilities
├── database/                  # SQL migrations
├── scripts/                   # Utility scripts
├── public/                    # Static assets
├── ARCHITECTURE.md            # System architecture docs
├── SESSION_LOG.md             # Development history
└── README.md                  # This file
```

---

## 🔄 Development Workflow

### Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint

# Testing
node scripts/test-email-system.js        # Test email delivery
node scripts/send-millzaatv-report.js    # Test report generation
```

### Multi-Machine Development

This project is developed across multiple machines. Always sync before starting work:

```bash
# At start of session
git pull && npm install

# At end of session
git add .
git commit -m "your message"
git push
```

---

## 🚀 Deployment

This repo is configured for automatic deployment to Vercel.

### Vercel Setup

1. **Create a Vercel project**
   - Import this GitHub repo into Vercel (New Project → Import Git Repository)
   - Vercel will auto-detect Next.js

2. **Get Vercel credentials**
   - In Vercel, go to Project Settings → General to find:
     - `ORG_ID`
     - `PROJECT_ID`
   - Create a Vercel token: Account Settings → Tokens → Create

3. **Add GitHub repository secrets**
   - Go to GitHub repo Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`
     - `VERCEL_TOKEN`

4. **Add environment variables in Vercel**
   - Go to Vercel Project Settings → Environment Variables
   - Add all variables from `.env.local`

5. **GitHub Actions workflow**
   - Workflow file: `.github/workflows/vercel-deploy.yml`
   - Pull Requests: builds and deploys a preview
   - `main` branch: builds and deploys to production
   - Can also trigger manually via "Run workflow"

### Production URL

**Live Site:** https://www.heycasi.com

---

## 📊 Database Schema

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete database schema with ERD.

**Key Tables:**

- `auth.users` - User authentication (Supabase managed)
- `stripe_subscriptions` - Subscription management
- `stream_report_sessions` - Stream sessions
- `stream_chat_messages` - Chat messages with AI analysis
- `stream_session_analytics` - Aggregated analytics
- `stream_top_chatters` - Community MVPs
- `stream_chat_timeline` - Activity timeline (2-min buckets)
- `stream_events` - Twitch EventSub events

**Run Migrations:**
Execute SQL files in `/database` folder in your Supabase SQL editor:

1. `schema.sql` - Base schema
2. `add-analytics-enhancements.sql` - Latest analytics features
3. Other migration files as needed

---

## 🔐 Security

- **Authentication:** Twitch OAuth 2.0 via Supabase Auth
- **Authorization:** Row Level Security (RLS) on all tables
- **API Security:** Rate limiting (5-30 req/min per endpoint)
- **Webhook Verification:** HMAC signature verification for Twitch and Stripe
- **Input Validation:** Custom validation library on all user inputs
- **Environment Variables:** Never committed to git, stored in Vercel

---

## 📈 Analytics Features

### Real-Time Processing

- Multilingual sentiment analysis (13+ languages)
- Question detection with language-aware patterns
- Engagement scoring (high/medium/low)
- Topic extraction

### Post-Stream Reports

- Stream metadata (title, category, tags, CCV)
- Community MVPs (top 10 chatters with recurring user detection)
- Chat Activity Timeline (smart highlights, not all buckets)
- Chat Highlights (funny, thoughtful, supportive, hype)
- Sentiment trends and language distribution
- Actionable insights and recommendations

### Delivery

- HTML email reports via Resend
- Unsubscribe mechanism
- Automatic sending after stream ends

---

## 🎯 Roadmap

See [ROADMAP.html](./ROADMAP.html) for visual product roadmap.

**Current Phase (Available Now):**

- ✅ Real-time chat monitoring (Twitch)
- ✅ AI sentiment analysis (13+ languages)
- ✅ Community MVPs with recurring users
- ✅ Chat activity timeline
- ✅ Chat highlights
- ✅ Post-stream email reports

**Next Phase:**

- Multi-platform dashboard
- Stream title performance analysis
- Advanced trend analysis
- Export & reporting tools

**Future:**

- OBS overlay integration
- AI response suggestions
- Automated engagement tools
- Viral clip detection

---

## 🤝 Contributing

This is currently a private repository. For questions or contributions, contact the maintainer.

---

## 📝 License

Proprietary - All rights reserved

---

## 📞 Support

- **Documentation:** See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Issues:** Contact admin
- **Email:** support@heycasi.com

---

## 🎨 Branding

**Casi Brand Colors:**

- Primary Purple: `#6932FF`
- Secondary Purple: `#932FFE`
- Accent Teal: `#5EEAD4`

**Typography:**

- Headlines: Bold, gradient text
- Body: Clean, readable sans-serif

---

**Built with ❤️ by the Casi team**

_Last Updated: November 11, 2025_
