# Casi Email Templates Setup Guide

This folder contains branded email templates for Supabase Auth emails.

## Setup Instructions

### 1. Configure Custom SMTP in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **Auth** → **SMTP Settings**
3. Enable **Custom SMTP**
4. Configure with these settings:

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP Username: resend
SMTP Password: [Your RESEND_API_KEY from .env]
Sender Email: casi@heycasi.com
Sender Name: Casi
```

### 2. Update Email Templates

Navigate to **Authentication** → **Email Templates** in Supabase Dashboard.

#### A. Confirm Signup Template
- Select: **Confirm signup**
- Copy content from: `supabase-confirmation.html`
- Paste into the template editor
- Click **Save**

#### B. Magic Link Template
- Select: **Magic Link**
- Copy content from: `supabase-magic-link.html`
- Paste into the template editor
- Click **Save**

#### C. Reset Password Template
- Select: **Reset Password**
- Copy content from: `supabase-password-reset.html`
- Paste into the template editor
- Click **Save**

### 3. Configure Redirect URLs

In **Authentication** → **URL Configuration**:

```
Site URL: https://www.heycasi.com
Redirect URLs:
  - https://www.heycasi.com/auth/callback
  - https://www.heycasi.com/auth/reset-password
  - https://www.heycasi.com/dashboard
```

## Template Variables

These templates use Supabase's built-in variables:

- `{{ .ConfirmationURL }}` - Auto-generated confirmation/reset link
- `{{ .Email }}` - User's email address (optional)
- `{{ .Token }}` - Auth token (optional)

## Testing

After setup, test each flow:

1. **Sign up** - Check you receive branded confirmation email
2. **Password reset** - Test reset flow from account page
3. **Magic link** - Test passwordless login (if enabled)

## Notes

- All templates use the Casi gradient: `#6932FF → #932FFE`
- Logo is loaded from: `https://www.heycasi.com/landing-logo.png`
- Templates are mobile-responsive
- Font: Poppins (loaded from Google Fonts)

## Troubleshooting

**Emails not sending?**
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for failed sends
- Ensure casi@heycasi.com is verified in Resend

**Logo not showing?**
- Ensure `/public/landing-logo.png` is deployed
- Check image is publicly accessible
- Try using full URL instead of relative path

**Wrong sender name/email?**
- Update in Supabase SMTP settings
- Clear browser cache
- Test with a new email address
