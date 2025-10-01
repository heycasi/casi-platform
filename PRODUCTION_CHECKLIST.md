# Casi Platform - Production Deployment Checklist

## ✅ Completed (Development)
- [x] Stripe test mode integration
- [x] Pricing page with checkout flow
- [x] Payment success page
- [x] Payment cancellation handling
- [x] Test mode price IDs configured

## 📋 Before Going to Production

### 1. Stripe Configuration

#### A. Create Live Mode Products & Prices
1. Go to Stripe Dashboard → Products
2. Switch to **Live Mode** (toggle in top-right)
3. Create 3 products with the following pricing:
   - **Creator Plan**: £19/month, £190/year
   - **Pro Plan**: £37/month, £370/year
   - **Streamer+ Plan**: £75/month, £750/year
4. Copy the live price IDs

#### B. Update Environment Variables
Update `.env.local` (or your production env) with live keys:
```bash
# Change to LIVE mode keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."

# Update with LIVE price IDs
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_STREAMER_MONTHLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_STREAMER_YEARLY="price_..."

# Update site URL to production
NEXT_PUBLIC_SITE_URL=https://heycasi.com
```

#### C. Set Up Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://heycasi.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add to environment variables:
```bash
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 2. Supabase Database Setup

#### A. Run Subscription Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database/stripe-subscriptions-schema.sql`
3. Run the SQL to create:
   - `subscriptions` table
   - `subscription_events` table
   - Indexes and RLS policies

#### B. Run Stream Analytics Schema (if not done)
1. In Supabase SQL Editor
2. Copy contents of `database/schema.sql`
3. Run the SQL to create:
   - `stream_report_sessions` table
   - `stream_chat_messages` table
   - `stream_session_analytics` table
   - `stream_report_deliveries` table

#### C. Verify Tables
Run this command to verify:
```bash
npm run migrate:verify
```

### 3. Environment Variables Checklist

Ensure all production environment variables are set:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Twitch OAuth
NEXT_PUBLIC_TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...

# Email (Resend)
RESEND_API_KEY=re_...

# Stripe LIVE MODE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Live Price IDs
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_STREAMER_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_STREAMER_YEARLY=price_...

# Site URL
NEXT_PUBLIC_SITE_URL=https://heycasi.com
```

### 4. Testing Before Production

#### A. Test Webhook Locally (Optional)
1. Install Stripe CLI: `stripe login`
2. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Test a checkout and verify webhook events are received

#### B. Test Production Build
```bash
npm run build
npm start
```
Visit `http://localhost:3000` and test:
- Pricing page loads
- Checkout flow works
- Success page displays

### 5. Deployment Steps

1. **Push code to repository**
   ```bash
   git add .
   git commit -m "Add Stripe payment integration"
   git push origin main
   ```

2. **Deploy to hosting platform** (Vercel recommended)
   - Connect repository
   - Add all environment variables in dashboard
   - Deploy

3. **Verify production deployment**
   - Visit https://heycasi.com/pricing
   - Test with real card (small amount)
   - Verify success page loads
   - Check Supabase for subscription record
   - Check Stripe Dashboard for subscription

### 6. Post-Deployment Monitoring

- [ ] Monitor Stripe Dashboard for payments
- [ ] Check Supabase logs for any errors
- [ ] Verify webhook events are being received
- [ ] Test subscription cancellation flow
- [ ] Monitor error tracking (consider adding Sentry)

## 🔒 Security Considerations

- [ ] All API keys are in environment variables (never in code)
- [ ] Supabase RLS policies are enabled
- [ ] Stripe webhook signature is verified
- [ ] HTTPS is enforced on production domain
- [ ] Service role key is only used server-side

## 📊 Database Tables

### Required Tables:
1. **subscriptions** - Tracks active Stripe subscriptions
2. **subscription_events** - Audit log of subscription changes
3. **stream_report_sessions** - Stream session data
4. **stream_chat_messages** - Chat message analytics
5. **stream_session_analytics** - Session summaries
6. **stream_report_deliveries** - Report email delivery log
7. **waitlist** - Email signups (should already exist)

## 🚀 Going Live Checklist

- [ ] Live Stripe products created
- [ ] Live Stripe prices configured
- [ ] Webhook endpoint added in Stripe
- [ ] Database tables created in Supabase
- [ ] All environment variables updated
- [ ] Code deployed to production
- [ ] Test purchase completed successfully
- [ ] Webhook events verified
- [ ] Success/cancel pages working
- [ ] Customer can access dashboard after purchase

## 📝 Notes

- Keep test mode enabled during final testing
- Switch to live mode only when ready to accept real payments
- Monitor first few transactions closely
- Consider adding email notifications for failed payments
- Set up Stripe billing portal for customer self-service

## 🆘 Troubleshooting

**Webhook not receiving events:**
- Check webhook URL in Stripe Dashboard
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check server logs for errors
- Test with Stripe CLI locally first

**Subscription not created in database:**
- Check Supabase logs
- Verify RLS policies allow service role
- Check webhook handler errors

**Payment succeeds but customer can't access features:**
- Verify subscription status in database
- Check user authentication
- Verify subscription lookup logic in dashboard
