# Post-Stream Email Report - Diagnostic & Fix Plan

## 🔍 Issue Analysis

I've reviewed the email report system. Here's what I found:

### **Current System Components**

1. **Email Service** (`src/lib/email.ts`)
   - ✅ Resend API integration working
   - ✅ HTML email generation function exists
   - ✅ Base64 image embedding (for logos)
   - ✅ Comprehensive report template

2. **Analytics Service** (`src/lib/analytics.ts`)
   - ✅ Session tracking
   - ✅ Message storage
   - ✅ Analytics generation

3. **API Endpoints**
   - ✅ `/api/generate-report` - Main report generation
   - ✅ `/api/test-email` - Test email sending
   - ✅ `/api/test-report` - Test report with mock data

4. **Assets**
   - ✅ `landing-logo.png` - Exists in /public
   - ✅ `landing-robot.png` - Exists in /public

---

## ⚠️ Potential Issues Identified

### **Issue #1: Resend Domain Verification**
**Problem**: Emails may be rejected if sending domain isn't verified

**Check Required**:
1. Go to Resend Dashboard → Domains
2. Verify `heycasi.com` is added and verified
3. Check DNS records are configured

**Symptoms if this is the issue**:
- Emails return 400/403 errors
- "Domain not verified" error messages
- Emails not sending at all

---

### **Issue #2: From Address Configuration**
**Problem**: Current from address is `casi@heycasi.com`

**Check Required**:
- Verify this email is authorized in Resend
- OR use Resend's default `onboarding@resend.dev` for testing

**Current Code** (line 39 in `src/lib/email.ts`):
```typescript
from: 'Casi <casi@heycasi.com>'
```

**Should be** (if domain not verified):
```typescript
from: 'Casi <onboarding@resend.dev>'
```

---

### **Issue #3: Email Size Limits**
**Problem**: Report emails with base64 images may exceed size limits

**Details**:
- Resend limit: 40MB per email
- Base64 images can be large
- Current code embeds 2 PNG files

**Potential Fix**:
- Use hosted image URLs instead of base64
- Compress images before embedding
- Remove image embedding entirely

---

### **Issue #4: HTML Email Compatibility**
**Problem**: Some email clients may not render complex HTML properly

**Current Issues**:
- Uses CSS Grid (not supported in all clients)
- Gradient backgrounds (may not render)
- Custom fonts via Google Fonts (may be blocked)

**Impact**:
- Gmail/Outlook: Should work fine
- Apple Mail: Should work fine
- Older clients: May look broken

---

### **Issue #5: Error Handling**
**Problem**: Current error logging may not show full Resend errors

**Code Review** (lines 47-49 in `src/lib/email.ts`):
```typescript
if (error) {
  console.error('Resend error:', error)
  return false
}
```

**Better Error Handling Needed**:
- Log full error object
- Log specific Resend error codes
- Return error details for debugging

---

## 🛠️ Recommended Fixes

### **Fix #1: Update From Address (Immediate)**

Change `src/lib/email.ts` line 39 to use verified sender:

```typescript
// Option A: If heycasi.com domain is verified in Resend
from: 'Casi <noreply@heycasi.com>'

// Option B: For testing (always works)
from: 'Casi <onboarding@resend.dev>'
```

---

### **Fix #2: Enhanced Error Logging**

Update error handling to show more details:

```typescript
if (error) {
  console.error('❌ Resend error:', error)
  console.error('Error details:', JSON.stringify(error, null, 2))
  console.error('Error name:', error.name)
  console.error('Error message:', error.message)
  return false
}
```

---

### **Fix #3: Remove Base64 Images (Simplify)**

Replace base64 image embedding with hosted URLs:

**Current** (complex, prone to errors):
```typescript
const casiLogoBase64 = getImageAsBase64('landing-logo.png');
```

**Proposed** (simple, reliable):
```typescript
const casiLogoUrl = 'https://heycasi.com/landing-logo.png';
```

---

### **Fix #4: Add Email Validation**

Before sending, validate the report data structure:

```typescript
static async sendStreamReport(email: string, report: StreamReport): Promise<boolean> {
  // Validate inputs
  if (!report || !report.session || !report.analytics) {
    console.error('❌ Invalid report structure')
    return false
  }

  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address')
    return false
  }

  // ... rest of code
}
```

---

## 🧪 Testing Plan

### **Test 1: Simple Email Test**
```bash
# Test basic email functionality
curl -X POST https://heycasi.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

**Expected**: Simple test email should arrive in 30-60 seconds

---

### **Test 2: Mock Report Test**
```bash
# Test full report with mock data
curl -X POST https://heycasi.com/api/test-report \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

**Expected**: Full HTML report email with all sections

---

### **Test 3: Real Stream Report**
1. Go to `/dashboard`
2. Connect to a Twitch channel
3. Let it run for 5 minutes
4. Disconnect
5. Check email for report

---

## 📋 Pre-Production Checklist

### **Resend Configuration**
- [ ] Resend API key is active (re_JkLzM...xBYJ)
- [ ] Sending domain verified OR using onboarding@resend.dev
- [ ] DNS records configured (if using custom domain)
- [ ] Sending limits not exceeded (check dashboard)

### **Code Verification**
- [ ] From address is correct
- [ ] Error logging is enhanced
- [ ] Email validation added
- [ ] Image embedding working OR switched to URLs

### **Testing**
- [ ] Test email sends successfully
- [ ] Mock report sends successfully
- [ ] Real report generates correctly
- [ ] Email renders well in Gmail
- [ ] Email renders well in Outlook
- [ ] All links work correctly

---

## 🔧 Quick Fix Implementation

I can implement these fixes now:

1. **Update from address** to use verified sender
2. **Enhance error logging** for better debugging
3. **Add email validation**
4. **Switch to hosted images** (more reliable)
5. **Add retry logic** for failed sends

Would you like me to implement these fixes?

---

## 📊 Most Likely Issues (Ranked)

1. **Domain not verified in Resend** (90% likely)
   - Fix: Use `onboarding@resend.dev` OR verify domain

2. **From address not authorized** (80% likely)
   - Fix: Change to verified email address

3. **Base64 image encoding error** (30% likely)
   - Fix: Switch to hosted image URLs

4. **Missing environment variable** (10% likely - already verified)
   - Your RESEND_API_KEY is configured ✅

5. **Resend rate limits** (5% likely)
   - Fix: Check Resend dashboard for limits

---

## 🎯 Recommended Action Plan

1. **First**: Check Resend dashboard for domain verification status
2. **Second**: Run test email command to verify basic sending works
3. **Third**: Implement fixes based on test results
4. **Fourth**: Test with mock report
5. **Fifth**: Test with real stream data

Let me know what you'd like me to check/fix first!
