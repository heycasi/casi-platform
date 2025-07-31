# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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