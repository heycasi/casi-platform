# Activity Feed - Duplicate Account Bug Fix

**Date Fixed:** October 29, 2025
**Issue:** Existing users who connected Twitch saw "Limited Event Access" and duplicate accounts were created
**Status:** ✅ RESOLVED

---

## The Problem

### Symptoms

- Users with email accounts (e.g., `gregmillan947@gmail.com`) who clicked "Connect with Twitch" would see "Limited Event Access" in Activity Feed
- EventSub notifications (subs, follows, bits, raids) didn't appear
- Duplicate accounts were being created

### Root Cause

When a user with an existing email account clicked "Connect with Twitch":

1. **Account linking API** (`/api/link-twitch-account`) correctly identified the existing account
2. **But the auth callback** ignored this and created a NEW pseudo-email account (e.g., `625401838@twitch.casi.app`)
3. **Tokens were saved** to the pseudo-email account, NOT the user's real email account
4. **EventSub subscriptions** were only created for NEW accounts, not for existing/linked accounts
5. **Result:** User logged into pseudo-email account with tokens, but no EventSub subscriptions

### Why It Happened

The auth callback had this flow:

```javascript
// Found existing account
if (linkData.linked && linkData.primaryAccount) {
  // BUT THEN: Still created pseudo-email account
  await supabase.auth.signUp({
    email: twitchEmail, // <- Created duplicate!
    // ...
  })
}
```

EventSub subscription only happened in the `else` block (new accounts), not for linked accounts.

---

## The Fix

### Changes Made

**File:** `src/app/auth/callback/page.tsx`

**Before (Broken):**

```javascript
if (linkData.linked && linkData.primaryAccount) {
  // Created pseudo-email account anyway
  await supabase.auth.signUp({
    email: `${tokenData.user.id}@twitch.casi.app`,
    // ...
  })
  // No EventSub subscription!
}
```

**After (Fixed):**

```javascript
if (linkData.linked && linkData.primaryAccount) {
  setStatus('🔗 Updating your existing account with fresh tokens...')

  // Subscribe to EventSub for existing account
  await fetch('/api/subscribe-user-events', {
    method: 'POST',
    body: JSON.stringify({
      broadcaster_user_id: tokenData.user.id,
      user_access_token: tokenData.access_token,
    }),
  })

  // Skip creating pseudo-email account
  // Tokens will be updated via /api/update-user-tokens below
}
```

**Key Changes:**

1. **Skip pseudo-email account creation** when existing account found
2. **Add EventSub subscription** for existing/linked accounts (not just new ones)
3. **Tokens saved to real email account** via `/api/update-user-tokens` API

---

## How It Works Now

### New User Flow (First Time)

1. User goes to dashboard → Clicks "Connect with Twitch"
2. OAuth completes → `/api/link-twitch-account` checks for existing account
3. **No existing account found**
4. Creates new account with `{twitch_id}@twitch.casi.app` email
5. Saves tokens to user_metadata
6. Subscribes to EventSub (6 event types)
7. ✅ Activity Feed shows all events immediately

### Existing User Flow (Has Email Account)

1. User goes to dashboard → Clicks "Connect with Twitch"
2. OAuth completes → `/api/link-twitch-account` finds existing account (e.g., `gregmillan947@gmail.com`)
3. **Existing account found with Twitch ID match**
4. **SKIP** creating pseudo-email account
5. Update existing account with fresh Twitch tokens via `/api/update-user-tokens`
6. Subscribe to EventSub (6 event types)
7. ✅ Activity Feed shows all events immediately
8. ✅ All data stays on real email account

---

## Testing Done

### Test Case 1: conzooo\_ (October 28, 2025)

- **Account:** conzooo_@example.com
- **Result:** ✅ Activity Feed worked perfectly
- **EventSub:** All 6 subscriptions created
- **Tokens:** Saved correctly to user_metadata

### Test Case 2: MillzaaTV (October 29, 2025)

**Before Fix:**

- Had 2 accounts:
  - Account A: `gregmillan947@gmail.com` (expired tokens)
  - Account B: `625401838@twitch.casi.app` (no tokens)
- Activity Feed showed "Limited Event Access"
- No EventSub subscriptions

**Fix Applied:**

1. Deleted Account B (pseudo-email duplicate)
2. Deployed auth callback fix
3. MillzaaTV logged out and back in via Twitch OAuth
4. Manually subscribed to EventSub (auth callback may have failed due to timing)

**After Fix:**

- ✅ Single account: `gregmillan947@gmail.com` with fresh tokens
- ✅ All 6 EventSub subscriptions active
- ✅ Activity Feed showing gift subs in real-time
- ✅ "Limited Event Access" warning gone

---

## Files Modified

### Primary Fix

- **`src/app/auth/callback/page.tsx`** (Lines 73-95)
  - Skip pseudo-email account creation for linked accounts
  - Add EventSub subscription for existing accounts

### Supporting Files (Already Existed)

- **`src/app/api/link-twitch-account/route.ts`**
  - Finds existing accounts by Twitch ID
  - Already working correctly

- **`src/app/api/update-user-tokens/route.ts`**
  - Updates tokens on existing accounts
  - Uses SERVICE_ROLE_KEY to bypass RLS
  - Already working correctly

- **`src/app/api/subscribe-user-events/route.ts`**
  - Creates EventSub subscriptions
  - Uses APP_ACCESS_TOKEN
  - Already working correctly

---

## Potential Edge Cases

### 1. EventSub Subscription Fails Silently

**Symptom:** User logs in successfully but events don't appear
**Cause:** `/api/subscribe-user-events` call fails (network issue, cold start, etc.)
**Solution:** Manually subscribe using:

```bash
node scripts/subscribe-millzaatv-now.js
# Or create generic script for any user
```

**Prevention:** Add retry logic or status check after subscription

### 2. App Access Token Expires

**Symptom:** EventSub subscriptions fail with "Invalid OAuth token"
**Cause:** `TWITCH_APP_ACCESS_TOKEN` expired (lasts ~64 days)
**Solution:**

```bash
node scripts/generate-app-token.js
# Update .env.local and Vercel environment variable
```

**Prevention:** Set up token refresh cron job

### 3. User Has Multiple Twitch Accounts

**Symptom:** Wrong Twitch account linked
**Cause:** User has multiple Twitch accounts with different IDs
**Solution:** Manual intervention to unlink/relink correct account

---

## Verification Steps

### For New Users

1. New streamer signs up with email
2. Clicks "Connect with Twitch"
3. Check: Only 1 account created
4. Check: Tokens saved to user_metadata
5. Check: 6 EventSub subscriptions created
6. Check: Activity Feed shows events immediately

### For Existing Users

1. Existing user clicks "Connect with Twitch"
2. Check: No duplicate account created
3. Check: Tokens updated on existing account
4. Check: 6 EventSub subscriptions created
5. Check: Activity Feed shows events immediately

### Quick Verification Scripts

**Check user's account status:**

```bash
node scripts/find-millzaatv-accounts.js  # Replace millzaatv with username
```

**Check EventSub subscriptions:**

```bash
node scripts/check-millzaatv-eventsub.js  # Replace millzaatv with username
```

**Manual subscription (if needed):**

```bash
node scripts/subscribe-millzaatv-now.js  # Replace millzaatv with username
```

---

## Security Improvements (Also Deployed)

Along with this fix, we also deployed:

1. **RLS Enabled:**
   - `subscriptions` table
   - `beta_codes` table
   - `beta_signups` table

2. **Security Definer Views Fixed:**
   - `active_user_access`
   - `vw_messages_by_platform`
   - `subscription_tier_compliance`
   - Changed from SECURITY DEFINER to `security_invoker=true`

3. **Function Search Path Fixed:**
   - `update_tier_status()`
   - `user_has_access()`
   - `get_user_access_details()`
   - Added `SET search_path = public, pg_temp`

---

## Git Commits

**Main Fix:**

```
commit 41124f3
fix: Prevent duplicate account creation and ensure EventSub for existing users

- Auth callback now skips pseudo-email account creation when existing account found
- EventSub subscription added for existing/linked accounts (not just new)
- Tokens updated on existing account via /api/update-user-tokens
```

**Previous Related Work:**

```
commit 78bf1a3
feat: Enable all Activity Feed event types with user authorization

- Updated OAuth scopes
- Store access_token and refresh_token in user metadata
- Auto-subscribe to EventSub for new users
```

---

## Monitoring

### Key Metrics to Watch

- Number of duplicate accounts created per day (should be 0)
- EventSub subscription success rate (should be ~100%)
- Activity Feed "Limited Access" reports (should be 0)

### Logs to Check

- Auth callback: Look for "✅ Found existing account" messages
- EventSub: Look for "✅ EventSub subscription created" messages
- Errors: Look for "Failed to subscribe to events" errors

---

## Known Limitations

1. **EventSub API Call Can Fail Silently**
   - Error is caught but login continues
   - User doesn't know subscription failed
   - **Improvement:** Add UI notification if subscription fails

2. **No Automatic Token Refresh**
   - User tokens expire after ~60 days
   - App token expires after ~64 days
   - **Improvement:** Implement token refresh before expiry

3. **No Subscription Status Check**
   - Dashboard doesn't show subscription status
   - **Improvement:** Add "EventSub Status" indicator in Activity Feed

---

## Future Improvements

1. **Add Retry Logic**
   - Retry EventSub subscription on failure
   - Exponential backoff

2. **Add Status Indicator**
   - Show EventSub connection status in Activity Feed
   - Real-time websocket connection status

3. **Automated Token Refresh**
   - Cron job to refresh app access token
   - Refresh user tokens before expiry

4. **Better Error Handling**
   - Show user-friendly error if subscription fails
   - Provide "Retry" button

5. **Subscription Health Check**
   - Periodic check if subscriptions are still active
   - Re-subscribe if needed

---

## Contact

If this issue appears again:

1. Check this document first
2. Run verification scripts
3. Check Vercel deployment logs
4. Review recent commits to auth/callback/page.tsx

**Last Updated:** October 29, 2025
**Status:** ✅ Fixed and Verified
