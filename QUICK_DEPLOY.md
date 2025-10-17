# Quick Deploy Reference

## 🔑 Critical Info

**CRON_SECRET:** `1066c2e8fedb490288d69feea4c408f4ad693cac752dfef33d888bf2f39caae2`

**Supabase Project:** https://supabase.com/dashboard/project/lbosugliylbusksphdov

**Vercel Project:** https://vercel.com/dashboard (select casi-platform)

---

## 📝 9-Step Checklist

1. ⚙️ **Vercel**: Add `CRON_SECRET` and `NEXT_PUBLIC_SITE_URL` env vars
2. 💾 **Supabase**: Run `database/tier-tracking-migration.sql` in SQL Editor
3. 🔍 **Verify**: Check new columns exist with test query
4. 📦 **Git**: `git add . && git commit && git push`
5. 🚀 **Vercel**: Wait for deployment to complete
6. ⏰ **Vercel**: Enable cron job in Settings → Cron Jobs
7. 🧪 **Test**: Curl the cron endpoint
8. 🧪 **Test**: Curl the analytics export endpoint
9. ✅ **Done**: Monitor logs for 24 hours

---

## 🧪 Quick Test Commands

### Test Cron:
```bash
curl -X POST -H "Authorization: Bearer 1066c2e8fedb490288d69feea4c408f4ad693cac752dfef33d888bf2f39caae2" https://www.heycasi.com/api/cron/check-tier-compliance
```

### Test Analytics Export:
```bash
curl "https://www.heycasi.com/api/export/analytics?email=YOUR_EMAIL&format=json"
```

### Verify Database:
```sql
SELECT * FROM subscription_tier_compliance;
```

---

## 🆘 Quick Fixes

**401 Error on Cron:** CRON_SECRET mismatch in Vercel
**Build Failed:** Check TypeScript errors in Vercel logs
**No Cron Job:** Verify `vercel.json` is in root and redeploy
**No Emails:** Check RESEND_API_KEY in Vercel

---

See `DEPLOYMENT_GUIDE.md` for detailed instructions
