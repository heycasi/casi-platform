# Phase 1 Deployment Guide

**Generated:** $(date)

---

## ✅ Pre-Deployment Checklist

- [x] CRON_SECRET generated and added to `.env.local`
- [ ] Database migration SQL ready
- [ ] All Phase 1 code committed
- [ ] Vercel environment variables configured

---

## Step 1: Add Environment Variables to Vercel

### Go to Vercel Dashboard
1. Navigate to: https://vercel.com/dashboard
2. Select your `casi-platform` project
3. Go to **Settings** → **Environment Variables**

### Add These Variables:

```
CRON_SECRET
Value: 1066c2e8fedb490288d69feea4c408f4ad693cac752dfef33d888bf2f39caae2
Environment: Production, Preview, Development
```

```
NEXT_PUBLIC_SITE_URL
Value: https://www.heycasi.com
Environment: Production, Preview, Development
```

### Verify Existing Variables
Make sure these are already there (from your `.env.local`):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_TWITCH_CLIENT_ID`
- ✅ `TWITCH_CLIENT_SECRET`
- ✅ `RESEND_API_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ All `NEXT_PUBLIC_STRIPE_PRICE_*` variables

---

## Step 2: Run Database Migration in Supabase

### Option A: Supabase SQL Editor (Recommended)

1. Go to: https://supabase.com/dashboard/project/lbosugliylbusksphdov
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the SQL from `database/tier-tracking-migration.sql`
5. Click **Run** (bottom right)
6. You should see: **Success. No rows returned**

### Verify Migration Worked

Run this query to check:
```sql
-- Check if new columns exist
SELECT
  tier_name,
  avg_viewer_limit,
  avg_viewers_30d,
  days_over_limit,
  tier_status
FROM subscriptions
LIMIT 1;
```

Expected result: Should show the new columns (even if empty)

---

## Step 3: Commit and Push to GitHub

### In your terminal:

```bash
# Check what files changed
git status

# Add all new files
git add .

# Commit with descriptive message
git commit -m "feat: Phase 1 - Tier tracking, cron jobs, upgrade nudges, analytics export

- Add tier tracking database migration
- Implement daily cron job for tier compliance checking
- Add TierUpgradeNudge component to dashboard
- Create analytics export API (CSV/JSON)
- Add email nudge templates for upgrades
- Configure Vercel cron jobs

Phase 1 launch blockers complete"

# Push to GitHub
git push origin main
```

**Note:** If you're on a different branch, replace `main` with your branch name.

---

## Step 4: Verify Vercel Deployment

### Watch the deployment:

1. Go to: https://vercel.com/dashboard
2. You should see a new deployment starting automatically
3. Click on the deployment to watch the build logs
4. Wait for **"Deployment Complete"** ✅

### If Build Fails:

Common issues:
- **TypeScript errors**: Check the build logs, may need to fix imports
- **Missing dependencies**: Run `npm install` locally
- **Environment variables**: Make sure all are set in Vercel

---

## Step 5: Enable Cron Jobs in Vercel

### After deployment succeeds:

1. Go to your project in Vercel
2. Click **Settings** → **Cron Jobs**
3. You should see: `/api/cron/check-tier-compliance` with schedule `0 2 * * *`
4. Make sure it's **Enabled** (toggle should be on)

If you don't see it:
- Verify `vercel.json` is in your root directory
- Redeploy the project

---

## Step 6: Test the Cron Endpoint Manually

### Test in terminal:

```bash
curl -X POST \
  -H "Authorization: Bearer 1066c2e8fedb490288d69feea4c408f4ad693cac752dfef33d888bf2f39caae2" \
  https://www.heycasi.com/api/cron/check-tier-compliance
```

### Expected Response:

```json
{
  "success": true,
  "timestamp": "2025-10-17T...",
  "subscriptionsChecked": 0,
  "nudgesSent": 0,
  "nudgesFailed": 0,
  "details": {
    "emailsSent": [],
    "emailsFailed": []
  }
}
```

If you get `401 Unauthorized`: Check the CRON_SECRET matches in Vercel

---

## Step 7: Test Analytics Export

### Test CSV Export:

```bash
curl "https://www.heycasi.com/api/export/analytics?email=YOUR_EMAIL&format=csv"
```

### Test JSON Export:

```bash
curl "https://www.heycasi.com/api/export/analytics?email=YOUR_EMAIL&format=json"
```

### Expected Responses:

- **CSV**: Downloads a CSV file
- **JSON**: Returns JSON object with sessions data
- **403 Error**: User doesn't have Pro/Streamer+ subscription (expected for Creator tier)
- **404 Error**: No analytics data found (expected if no sessions yet)

---

## Step 8: Verify Tier Tracking in Database

### Run this query in Supabase SQL Editor:

```sql
-- Check subscription_tier_compliance view
SELECT * FROM subscription_tier_compliance;
```

You should see all active subscriptions with tier compliance data.

### Manually trigger tier status update:

```sql
-- Update tier statuses
SELECT update_tier_status();

-- Check results
SELECT
  email,
  tier_name,
  avg_viewers_30d,
  avg_viewer_limit,
  tier_status,
  days_over_limit
FROM subscriptions
WHERE status = 'active';
```

---

## Step 9: Test Tier Upgrade Nudge in Dashboard

### Manual Test (Optional):

If you want to see the nudge component in action:

1. Update a test subscription to be over limit:

```sql
UPDATE subscriptions
SET
  avg_viewers_30d = 75,
  tier_status = 'over_limit',
  days_over_limit = 10
WHERE email = 'YOUR_TEST_EMAIL'
AND tier_name = 'Creator';
```

2. Visit dashboard: https://www.heycasi.com/dashboard
3. You should see the gold "Your stream is growing!" banner

---

## ✅ Deployment Complete Checklist

- [ ] CRON_SECRET added to Vercel
- [ ] Database migration run successfully
- [ ] Code pushed to GitHub
- [ ] Vercel deployment succeeded
- [ ] Cron jobs enabled in Vercel
- [ ] Cron endpoint tested (returns 200)
- [ ] Analytics export tested (CSV and JSON)
- [ ] Tier tracking verified in database
- [ ] Dashboard upgrade nudge visible (optional test)

---

## 🎉 Success!

Phase 1 is now deployed! The system will:

- ✅ Automatically calculate 30-day average viewers for all users
- ✅ Send upgrade nudge emails after 7 days over limit
- ✅ Display upgrade banners in the dashboard
- ✅ Allow Pro+ users to export analytics

---

## 🚨 Troubleshooting

### Cron Job Not Running

**Check:**
1. Vercel Cron is enabled (Settings → Cron Jobs)
2. `vercel.json` exists in root
3. CRON_SECRET environment variable is set

**Manual Trigger:**
Use the curl command from Step 6

### Emails Not Sending

**Check:**
1. RESEND_API_KEY is set in Vercel
2. Check Resend dashboard for errors
3. Verify email domain is verified in Resend

### Tier Tracking Not Working

**Check:**
1. Database migration completed successfully
2. Subscriptions table has new columns
3. Run `SELECT update_tier_status();` manually

---

## Next Steps

Once Phase 1 is stable:
1. Monitor cron job logs in Vercel
2. Check for any email delivery issues
3. Verify tier tracking is updating correctly
4. Move on to Phase 2 (Account Deletion, Invoices, OBS Overlay)

---

**Need Help?** Check the logs in:
- Vercel Dashboard → Your Project → Logs
- Supabase Dashboard → Logs
- Resend Dashboard → Logs
