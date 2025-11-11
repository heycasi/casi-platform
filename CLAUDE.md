# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 IMPORTANT: Multi-Machine Development Workflow

**This project is developed across TWO machines (PC + MacBook).**

### At the START of EVERY session:

1. **ALWAYS remind the user to sync**: Ask if they've run `git pull && npm install`
2. If they haven't, prompt them to run `/start` slash command or run it manually
3. Only proceed with work after confirming the sync is complete

### At the END of sessions (when user says "done" or similar):

1. Remind them to commit and push changes
2. Suggest using `/done` slash command to automate this

### Quick Commands Available:

- `/start` - Syncs repo and installs dependencies before starting work
- `/done` - Commits and pushes changes when ending work session

**Never skip the sync reminder at session start - merge conflicts are costly!**

## 🧪 CRITICAL: Testing & Debugging Methodology

**STOP WASTING TIME WITH INCREMENTAL DEBUGGING!**

### Before Making ANY Changes:

1. **Analyze the COMPLETE System** - Don't just look at one column, one file, or one error
   - Read ALL related schema files (database migrations)
   - Check EVERY constraint (NOT NULL, UNIQUE, CHECK, FOREIGN KEY)
   - Review ALL API endpoints that touch the affected tables
   - Use the Task tool with subagent_type=Explore for comprehensive analysis

2. **Identify ALL Potential Issues** - Not just the current error
   - Build a complete list of required columns and their constraints
   - Check for undocumented columns that might exist in production
   - Identify every scenario where the same error could occur
   - Document assumptions about the database state

3. **Fix Everything Comprehensively** - One complete solution
   - Make fixes defensive (use IF EXISTS, exception handling)
   - Handle edge cases and variations (e.g., both viewer_limit AND avg_viewer_limit)
   - Include verification queries to check the final state
   - Write SQL that's idempotent and safe to run multiple times

4. **Test ALL Possible Scenarios** - Before deployment
   - Success case (happy path)
   - All documented error cases
   - Edge cases (null values, missing columns, type mismatches)
   - Concurrent scenarios if relevant
   - Document test scenarios in commit messages

### Real Example from Beta Code Debugging:

**❌ BAD APPROACH (What We Did Initially):**

- Error: "tier NOT NULL constraint violation"
- Fix: Add tier_name field
- Deploy → New error: "viewer_limit NOT NULL constraint violation"
- Fix: Add viewer_limit field
- **Result:** Multiple deploy cycles, wasted time, user frustration

**✅ GOOD APPROACH (What We Should Do):**

- Error: "tier NOT NULL constraint violation"
- **STOP**: Analyze ALL subscriptions table columns and constraints
- Identify: tier, viewer_limit, stripe_customer_id, stripe_subscription_id, etc.
- Fix: Create comprehensive migration handling ALL NOT NULL columns
- Deploy ONCE with complete solution
- **Result:** One deploy, issue fully resolved

### Database Schema Changes Checklist:

When working with database operations (INSERT, UPDATE, migrations):

- [ ] Read ALL migration files to build complete schema
- [ ] Query production database to see actual current state
- [ ] Identify ALL NOT NULL columns
- [ ] Check for columns with no defaults
- [ ] Look for UNIQUE constraints that might conflict
- [ ] Verify foreign key relationships
- [ ] Check for CHECK constraints
- [ ] Document differences between migration files and production
- [ ] Create SQL that handles all variations
- [ ] Include verification queries at the end

### Tools to Use for Comprehensive Analysis:

1. **Task tool with subagent_type=Explore** - For broad codebase exploration
2. **Grep with multiple patterns** - Search for all constraint types
3. **Database schema queries** - Check actual production state:
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'your_table'
   ORDER BY ordinal_position;
   ```

### Remember:

- **Time spent on comprehensive analysis upfront saves 10x time in debugging**
- **One complete fix is better than five incremental fixes**
- **Production bugs waste the user's time - that's the most expensive cost**

## Project Overview

Casi Platform is a Next.js application for real-time streaming analytics with AI-powered chat analysis for streamers. The platform includes Twitch authentication, waitlist management, and multilingual chat analysis capabilities.

## Commands

- **Development server**: `npm run dev` (starts Next.js dev server)
- **Build**: `npm run build` (creates production build)
- **Start production**: `npm start` (starts production server)
- **Lint**: `npm run lint` (runs Next.js linter)

## Architecture

### Core Technologies

- **Next.js 14** with App Router (src/app/ directory structure)
- **TypeScript** for type safety
- **Supabase** for database and authentication
- **React 18** with client-side state management

### Key Components

- **Landing Page** (`src/app/page.tsx`): Waitlist signup with Supabase integration, live counter, and responsive design
- **Authentication Flow**: Twitch OAuth via `/api/auth/twitch/route.ts` with callback handling at `/auth/callback/page.tsx`
- **Multilingual Support** (`src/lib/multilingual.ts`): Comprehensive language detection and sentiment analysis for 13+ languages including question detection and sentiment scoring
- **Dashboard** (`src/app/dashboard/page.tsx`): Protected route for authenticated users

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_TWITCH_CLIENT_ID`: Twitch application client ID
- `TWITCH_CLIENT_SECRET`: Twitch application secret (server-side only)

### Database Structure

- **waitlist** table: Stores email signups with source tracking and user agent data
- Authentication handled through Supabase with Twitch provider integration

### Code Patterns

- All pages use TypeScript with proper type definitions
- Client components marked with 'use client' directive
- API routes follow Next.js 13+ App Router patterns
- Error handling with try-catch blocks and user-friendly messages
- Responsive design with inline styles and media queries

### Deployment Notes

- Production URL hardcoded as 'https://heycasi.com' for Twitch OAuth redirect
- SSL certificates present in `/certificates/` for local HTTPS development
- Static assets in `/public/` including landing page images

## Supabase Setup Guidance

- When setting up the project, you will need to create the necessary tables and authentication providers in Supabase
- For this project's functionality, ensure you have configured:
  - Twitch OAuth provider in Supabase Authentication settings
  - A `waitlist` table with appropriate columns for email tracking
