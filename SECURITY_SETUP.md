# Casi Platform - Security & Backend Setup Guide

## 🔒 Security Features Implemented

### 1. **Rate Limiting**
Protects API endpoints from abuse and DDoS attacks.

**Configuration** (`src/lib/rate-limit.ts`):
- **Auth endpoints**: 5 requests/minute (prevents brute force)
- **Payment endpoints**: 10 requests/minute (prevents spam)
- **Report generation**: 3 requests/hour (prevents resource abuse)
- **General API**: 30 requests/minute (standard protection)

**Headers returned**:
- `X-RateLimit-Remaining`: Requests left in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

### 2. **Input Validation**
All user inputs are validated and sanitized (`src/lib/validation.ts`).

**Validations include**:
- ✅ Email format and length
- ✅ Channel names (Twitch username rules)
- ✅ UUIDs for database queries
- ✅ Stripe price IDs
- ✅ Authorization codes
- ✅ URLs with domain whitelisting
- ✅ Numeric ranges

### 3. **Row Level Security (RLS)**
Database-level access control in Supabase.

**Policies**:
- Users can only access their own stream data
- Subscription data restricted to owner
- Service role bypass for webhooks
- Auth-based filtering on all tables

### 4. **API Route Protection**

**Protected endpoints**:
- ✅ `/api/auth/twitch` - Rate limited + validation
- ✅ `/api/create-checkout-session` - Rate limited + validation
- ✅ `/api/generate-report` - Rate limited + validation
- ✅ `/api/webhooks/stripe` - Signature verification

### 5. **Environment Security**
- All secrets stored in environment variables
- No sensitive data in codebase
- Service role key only used server-side
- Webhook signatures verified

---

## 🗄️ Database Requirements

### Required Tables (7 total)

#### **Stream Analytics Tables**
1. **`stream_report_sessions`** - Stream session tracking
2. **`stream_chat_messages`** - Chat analytics with sentiment
3. **`stream_session_analytics`** - Session summaries
4. **`stream_report_deliveries`** - Email delivery logs

#### **Subscription Tables**
5. **`subscriptions`** - Stripe subscription data
6. **`subscription_events`** - Subscription audit log

#### **Marketing Table**
7. **`waitlist`** - Email signups (should already exist)

### Setup Instructions

```bash
# 1. Verify current setup
npm run verify:supabase

# 2. If tables are missing, run migrations in Supabase SQL Editor:
#    - database/schema.sql (stream analytics)
#    - database/stripe-subscriptions-schema.sql (payments)

# 3. Verify again
npm run verify:supabase
```

---

## 🔑 Environment Variables

### Required Variables (17 total)

```bash
# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Keep secret!

# === Twitch OAuth ===
NEXT_PUBLIC_TWITCH_CLIENT_ID=abc123...
TWITCH_CLIENT_SECRET=xyz789...  # Keep secret!

# === Email (Resend) ===
RESEND_API_KEY=re_...  # Keep secret!

# === Stripe ===
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_SECRET_KEY=sk_test_... or sk_live_...  # Keep secret!
STRIPE_WEBHOOK_SECRET=whsec_...  # Keep secret!

# === Stripe Price IDs (6 total) ===
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_STREAMER_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_STREAMER_YEARLY=price_...

# === Site Configuration ===
NEXT_PUBLIC_SITE_URL=https://heycasi.com
```

### Verification

```bash
# Verify all environment variables
npm run verify:env

# This will:
# - Check all required variables are present
# - Validate formats (URLs, keys, etc.)
# - Show Stripe mode (test vs live)
# - Create .env.local template if missing
```

---

## 🚀 Quick Setup Checklist

### Step 1: Environment Variables
```bash
npm run verify:env
```
- [ ] All 17 variables present
- [ ] Formats validated
- [ ] Stripe mode confirmed (test/live)

### Step 2: Database Setup
```bash
npm run verify:supabase
```
- [ ] All 7 tables exist
- [ ] RLS policies enabled

### Step 3: Supabase Authentication
**Manual verification required**:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Twitch** OAuth provider
3. Add credentials:
   - Client ID: `NEXT_PUBLIC_TWITCH_CLIENT_ID`
   - Client Secret: `TWITCH_CLIENT_SECRET`
4. Set redirect URL: `https://heycasi.com/auth/callback`
5. Configure email templates (optional but recommended)

### Step 4: Stripe Webhook
**Manual setup required**:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://heycasi.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### Step 5: Complete Verification
```bash
npm run verify:all
```
- [ ] Environment variables ✅
- [ ] Database tables ✅
- [ ] Twitch OAuth configured ✅
- [ ] Stripe webhook configured ✅

---

## 🛡️ Security Best Practices

### Current Status

#### ✅ **Implemented**
- Rate limiting on all critical endpoints
- Input validation and sanitization
- Row Level Security (RLS) in database
- Stripe webhook signature verification
- Environment-based secret management
- OAuth-based authentication
- Server-side service role key usage

#### ⚠️ **Recommended Additions**

1. **HTTPS Enforcement**
   - Verify in production (Vercel handles this automatically)

2. **CORS Configuration**
   - Add explicit CORS headers if needed
   - Currently using Next.js defaults

3. **Session Management**
   - Configure Supabase session timeout
   - Current: Default settings

4. **Monitoring & Logging**
   - Consider adding Sentry for error tracking
   - Monitor Supabase logs
   - Monitor Stripe Dashboard

5. **Data Backup**
   - Enable Supabase daily backups (free on Pro plan)
   - Export critical data regularly

---

## 🔧 Troubleshooting

### Rate Limit Issues

**Problem**: Users getting "Too many requests" errors

**Solutions**:
1. Check if it's legitimate traffic spike
2. Adjust limits in `src/lib/rate-limit.ts`
3. Consider Redis-based solution for production (e.g., Upstash)

### Validation Errors

**Problem**: Valid inputs being rejected

**Solutions**:
1. Check validation rules in `src/lib/validation.ts`
2. Review error logs for specific validation failures
3. Adjust regex patterns if needed

### Database Access Issues

**Problem**: Users can't access their data

**Solutions**:
1. Verify RLS policies are correct
2. Check user authentication status
3. Ensure `auth.uid()` matches user_id in tables

### Webhook Failures

**Problem**: Stripe webhooks not being received

**Solutions**:
1. Verify webhook URL in Stripe Dashboard
2. Check `STRIPE_WEBHOOK_SECRET` is correct
3. Test locally with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Check server logs for signature verification errors

---

## 📊 Current Setup Status

**From verification script**:

✅ **Database Tables**: 6/7 tables exist
- Missing: `subscription_events` (non-critical for MVP)

✅ **Authentication**: Twitch OAuth configured

⚠️ **Manual Verification Needed**:
1. Supabase Authentication provider setup
2. Stripe webhook configuration
3. Email templates in Supabase

---

## 🎯 Production Deployment

Before going live:

1. **Switch Stripe to Live Mode**
   ```bash
   # Update these in .env.local:
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   # Update all 6 price IDs to live mode IDs
   ```

2. **Update Webhook URLs**
   - Stripe webhook: Production URL
   - Twitch OAuth redirect: Production URL

3. **Final Verification**
   ```bash
   npm run verify:all
   npm run build  # Test build
   ```

4. **Deploy & Test**
   - Deploy to Vercel
   - Test authentication flow
   - Test payment flow (small amount)
   - Verify webhook events

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Twitch OAuth**: https://dev.twitch.tv/docs/authentication
- **Next.js Security**: https://nextjs.org/docs/advanced-features/security-headers

---

## 📝 Notes

- Rate limiting is in-memory (resets on server restart)
- For production scale, consider Redis-based rate limiting
- RLS policies are enforced at database level (secure even if API is compromised)
- All sensitive operations require authentication
- Stripe webhooks create Supabase accounts automatically for new subscribers
