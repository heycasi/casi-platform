# Setup Scripts

## Twitch EventSub Setup

This script sets up Twitch EventSub webhooks for the Activity Feed feature.

### What it does:
- Subscribes to Twitch events (subs, follows, bits, raids)
- Configures webhooks to send events to your production endpoint
- Automatically handles authentication

### Prerequisites:
✅ Twitch CLI installed (already done)
✅ Webhook secret added to `.env.local` (already done)
✅ You need to add the secret to Vercel (see below)

### Step 1: Add Secret to Vercel

1. Go to: https://vercel.com/heycasi/casi-platform/settings/environment-variables
2. Click **Add New**
3. Add:
   - **Name:** `TWITCH_EVENTSUB_SECRET`
   - **Value:** `d2bd5da65bffed6462aef4f8adbd44a1b7ba5223560a92e85549c91fd9d20854`
   - **Environments:** Check all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your project

### Step 2: Run the Setup Script

From the project root, run:

```bash
./scripts/setup-twitch-eventsub.sh
```

The script will:
1. Ask for your Twitch username
2. Look up your Twitch user ID
3. Subscribe to all required events
4. Show you the results

### That's it! 🎉

Once complete, your Activity Feed will start showing events when:
- Someone subscribes/resubscribes
- Someone follows
- Someone cheers bits
- Someone raids your channel

### Troubleshooting

**Check subscriptions:**
```bash
twitch api get eventsub/subscriptions
```

**Test webhook:**
```bash
curl https://heycasi.com/api/webhooks/twitch-events
# Should return: {"status":"Twitch EventSub webhook endpoint","ready":true}
```

**View logs:**
- Vercel: https://vercel.com/heycasi/casi-platform/logs
- Supabase: Check the `stream_events` table

**Delete all subscriptions (if needed):**
```bash
twitch api get eventsub/subscriptions | grep '"id"' | cut -d'"' -f4 | while read id; do
  twitch api delete eventsub/subscriptions -q id="$id"
done
```
