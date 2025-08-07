# 🎮 Stream Reports Setup Guide

This guide will help you set up the end-of-stream summary reporting feature for Casi Platform.

## 📋 Overview

The stream reports system provides:
- **Real-time data collection** during streams
- **Automated report generation** when streams end
- **Email delivery** of comprehensive analytics
- **Rich HTML reports** with insights and recommendations

## 🗄️ Database Setup

### 1. Run the Database Schema

Execute the SQL schema in your Supabase dashboard:

```bash
# Apply the database schema
psql -h your-db-host -d your-db-name -f database/schema.sql
```

Or copy and paste the contents of `database/schema.sql` into your Supabase SQL editor.

### 2. Enable Row Level Security

The schema includes RLS policies that ensure users can only access their own data.

## ⚙️ Environment Variables

### 1. Copy Environment File

```bash
cp .env.example .env.local
```

### 2. Configure Required Variables

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Service (new)
RESEND_API_KEY=your_resend_api_key
```

### 3. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (heycasi.com)
3. Create an API key
4. Add it to your `.env.local`

**Cost**: Free tier includes 3,000 emails/month (sufficient for 100+ streamers)

## 📦 Install Dependencies

```bash
npm install resend
```

## 🚀 Deployment Steps

### 1. Deploy Database Changes

- Go to your Supabase dashboard
- Navigate to SQL Editor
- Run the contents of `database/schema.sql`

### 2. Deploy Code Changes

```bash
# Build and deploy
npm run build
npm run start
```

### 3. Test Email Setup (Optional)

Create a test API route to verify email configuration:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

## 📊 How It Works

### 1. Stream Session Tracking

When users connect to a Twitch channel:
- A new `stream_sessions` record is created
- Real-time chat messages are stored with analysis
- Session statistics are updated continuously

### 2. Report Generation

When users disconnect or stream ends:
- Analytics are generated from stored chat data
- A comprehensive report is created
- The report is emailed to the streamer

### 3. Report Contents

Each report includes:
- **Stream Overview**: Duration, messages, peak viewers
- **Sentiment Analysis**: Mood tracking and positive/negative ratios
- **Engagement Peaks**: Timestamps of highest activity
- **Top Questions**: Most engaging questions from chat
- **Language Breakdown**: International audience insights
- **AI Recommendations**: Personalized improvement suggestions

## 💰 Cost Breakdown

### Expected Monthly Costs

- **100 streamers**: ~$5-10/month
- **1,000 streamers**: ~$25-50/month
- **10,000 streamers**: ~$100-200/month

### Cost Components

1. **Database Storage**: ~1-2MB per 4-hour stream
2. **Email Delivery**: $0.0004 per report (Resend)
3. **Processing**: Minimal (handled by existing infrastructure)

## 🔧 Configuration Options

### Email Customization

Modify `src/lib/email.ts` to customize:
- Report design and layout
- Branding and colors
- Content sections
- Metrics displayed

### Analytics Tuning

Adjust `src/lib/analytics.ts` for:
- Engagement threshold settings
- Language detection sensitivity
- Topic categorization
- Insight generation rules

## 🧪 Testing

### Test Stream Session

1. Start a stream session in the dashboard
2. Connect to a live Twitch channel
3. Let it run for a few minutes
4. Disconnect to trigger report generation
5. Check email for the report

### Debug Mode

Add console logging to track report generation:

```javascript
// In src/app/api/generate-report/route.ts
console.log('Report generation started for session:', sessionId)
console.log('Analytics generated:', analytics)
console.log('Email sent successfully:', emailSent)
```

## 🚨 Troubleshooting

### Common Issues

1. **Reports not generating**
   - Check Supabase connection
   - Verify session creation logs
   - Ensure WebSocket disconnect triggers properly

2. **Emails not sending**
   - Verify RESEND_API_KEY is set
   - Check domain verification in Resend
   - Review email service logs

3. **Database errors**
   - Confirm RLS policies are applied
   - Check user authentication
   - Verify table permissions

### Support

For issues:
1. Check browser console for errors
2. Review Supabase logs
3. Check Resend delivery logs
4. Ensure environment variables are set

## 🔄 Future Enhancements

### Potential Improvements

1. **PDF Export**: Add PDF generation for offline reports
2. **Dashboard Integration**: Display reports within the platform
3. **Webhooks**: Send reports to Discord/Slack
4. **Advanced Analytics**: More detailed sentiment tracking
5. **A/B Testing**: Compare stream performance over time

### Monitoring

Consider adding:
- Report generation success rates
- Email delivery statistics
- Performance metrics
- User feedback collection

---

## ✅ Checklist

- [ ] Database schema applied
- [ ] Environment variables configured
- [ ] Resend API key obtained and verified
- [ ] Dependencies installed
- [ ] Test email sent successfully
- [ ] First stream report generated and received

Your stream reporting system is now ready! 🎉