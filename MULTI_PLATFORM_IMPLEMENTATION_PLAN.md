# Multi-Platform Dashboard Implementation Plan

## ✅ Status: Kick Integration Working!

- Kick WebSocket client successfully tested
- Messages flowing from live Kick channels
- Ready to integrate into main dashboard

---

## 🎯 Vision

**Goal:** Unified dashboard that supports streamers who stream to:

1. **Twitch only** - Dashboard works exactly as it does now
2. **Kick only** - Dashboard works with Kick chat instead
3. **Both platforms simultaneously** - Unified view with platform differentiation

---

## 🎨 Design Specifications

### Platform Visual Differentiation

**Twitch Messages:**

- Color: Purple (#6441A5)
- Icon: 🟣 (at start of each message)
- Border: Purple left border on message cards

**Kick Messages:**

- Color: Green (#53FC18)
- Icon: 🟢 (at start of each message)
- Border: Green left border on message cards

### UI Examples

**Single Platform (Current Behavior):**

```
💬 Live Chat
─────────────────────────
🟣 @user123: Great stream!
🟣 @viewer42: What settings?
🟣 @fan99: GG
```

**Dual Platform (New):**

```
💬 Live Chat - All Platforms
─────────────────────────
🟣 @user123: Great stream! (Twitch)
🟢 @kickfan: Love this! (Kick)
🟣 @viewer42: What settings? (Twitch)
🟢 @banksy_viewer: gg (Kick)
```

### Stats Panel

**Single Platform:**

```
Total Messages: 1,234
Questions: 45
Positive: 89%
```

**Dual Platform:**

```
Total Messages: 1,234
├─ 🟣 Twitch: 892 (72%)
└─ 🟢 Kick: 342 (28%)

Questions: 45
├─ 🟣 Twitch: 32
└─ 🟢 Kick: 13

Sentiment (Combined): 89% Positive
```

---

## 🔐 Authentication System

### Current State

- ✅ Twitch OAuth working
- User authenticates with Twitch account
- Dashboard connects to their Twitch chat

### Multi-Platform Authentication Plan

#### Option 1: Link Additional Platforms (RECOMMENDED)

```
User Flow:
1. User signs up/logs in with Twitch (primary account)
2. In settings, they can "Link Kick Account" (optional)
3. When streaming, dashboard auto-detects which platforms are live
4. Connects to all linked platforms that are currently live
```

**Pros:**

- One Casi account
- Easy to manage
- Works for single or dual streamers

**Cons:**

- Need to implement Kick OAuth (if they have one)
- OR use username-based connection for Kick (simpler)

#### Option 2: Username-Based Kick Connection (SIMPLER)

```
User Flow:
1. User logs in with Twitch (primary)
2. In settings: "Kick Username" field (optional)
3. If filled, dashboard connects to both platforms
4. No OAuth needed for Kick (read-only access)
```

**Pros:**

- No Kick OAuth needed
- Simpler implementation
- Works immediately

**Cons:**

- User must manually enter Kick username
- Can't verify they own the Kick channel

### Recommended Approach: **Option 2** (Username-Based)

**Why:**

- Kick WebSocket is public (no auth needed to read chat)
- We only need to READ messages, not send
- Faster to implement
- User-friendly

---

## 📊 Database Schema Updates

### Add Platform Support to Existing Tables

```sql
-- 1. Add platform column to stream_report_sessions
ALTER TABLE stream_report_sessions
ADD COLUMN platforms TEXT[] DEFAULT ARRAY['twitch'];

-- 2. Add platform to stream_chat_messages
ALTER TABLE stream_chat_messages
ADD COLUMN platform VARCHAR(20) DEFAULT 'twitch'
CHECK (platform IN ('twitch', 'kick'));

-- Add index for filtering
CREATE INDEX idx_messages_platform ON stream_chat_messages(platform, session_id);

-- 3. Add Kick username to users
ALTER TABLE users
ADD COLUMN kick_username VARCHAR(255);

-- 4. Add platform column to stream_events
ALTER TABLE stream_events
ADD COLUMN platform VARCHAR(20) DEFAULT 'twitch'
CHECK (platform IN ('twitch', 'kick'));
```

### Session Management

**Single Platform Session:**

```javascript
{
  session_id: "abc123",
  user_id: "user1",
  platforms: ["twitch"],
  twitch_channel: "millzaatv",
  kick_channel: null,
  started_at: "2025-10-26T12:00:00Z"
}
```

**Dual Platform Session:**

```javascript
{
  session_id: "abc123",
  user_id: "user1",
  platforms: ["twitch", "kick"],
  twitch_channel: "millzaatv",
  kick_channel: "millzaatv",
  started_at: "2025-10-26T12:00:00Z"
}
```

---

## 🔧 Technical Implementation

### Phase 1: Settings Page (Add Kick Username)

**File:** `src/app/settings/page.tsx`

Add field:

```typescript
<input
  type="text"
  placeholder="Kick username (optional)"
  value={kickUsername}
  onChange={(e) => setKickUsername(e.target.value)}
/>
```

Save to database:

```typescript
await supabase.from('users').update({ kick_username: kickUsername }).eq('id', user.id)
```

### Phase 2: Update Dashboard to Support Multi-Platform

**File:** `src/app/dashboard/page.tsx`

#### Current State:

```typescript
const [twitchClient, setTwitchClient] = useState<TwitchClient>()
```

#### New State:

```typescript
const [twitchClient, setTwitchClient] = useState<TwitchClient>()
const [kickClient, setKickClient] = useState<KickChatClient>()
const [messages, setMessages] = useState<UnifiedMessage[]>()

interface UnifiedMessage {
  id: string
  username: string
  message: string
  timestamp: number
  platform: 'twitch' | 'kick'
  sentiment?: string
  isQuestion?: boolean
}
```

#### Connection Logic:

```typescript
useEffect(() => {
  const connectPlatforms = async () => {
    // Connect to Twitch (always, since they auth'd with Twitch)
    const twitch = new TwitchClient(userTwitchUsername)
    await twitch.connect()
    setTwitchClient(twitch)

    // Connect to Kick if username is set
    if (userKickUsername) {
      const kick = new KickChatClient(userKickUsername)
      await kick.connect()
      setKickClient(kick)
    }

    // Unified message handler
    const handleMessage = (msg: UnifiedMessage) => {
      setMessages((prev) => [...prev, msg].sort((a, b) => a.timestamp - b.timestamp))
    }

    twitch.onMessage((msg) => handleMessage({ ...msg, platform: 'twitch' }))
    if (kick) {
      kick.onMessage((msg) => handleMessage({ ...msg, platform: 'kick' }))
    }
  }

  connectPlatforms()
}, [])
```

### Phase 3: Platform-Aware Message Component

**File:** `src/components/ChatMessage.tsx` (new file)

```typescript
interface ChatMessageProps {
  message: UnifiedMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const platformConfig = {
    twitch: {
      color: '#6441A5',
      icon: '🟣',
      name: 'Twitch'
    },
    kick: {
      color: '#53FC18',
      icon: '🟢',
      name: 'Kick'
    }
  }

  const config = platformConfig[message.platform]

  return (
    <div style={{
      borderLeft: `4px solid ${config.color}`,
      padding: '12px',
      marginBottom: '8px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{config.icon}</span>
        <strong style={{ color: config.color }}>
          @{message.username}
        </strong>
        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
          {config.name}
        </span>
        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div style={{ marginTop: '8px', marginLeft: '28px' }}>
        {message.message}
      </div>
      {message.sentiment && (
        <div style={{ marginLeft: '28px', marginTop: '4px', fontSize: '0.8rem' }}>
          Sentiment: {message.sentiment}
        </div>
      )}
    </div>
  )
}
```

### Phase 4: Platform-Aware Analytics

**Update:** `src/lib/analytics.ts`

```typescript
// Group messages by platform
const messagesByPlatform = messages.reduce(
  (acc, msg) => {
    if (!acc[msg.platform]) acc[msg.platform] = []
    acc[msg.platform].push(msg)
    return acc
  },
  {} as Record<'twitch' | 'kick', Message[]>
)

// Calculate stats per platform
const stats = {
  total: messages.length,
  twitch: {
    count: messagesByPlatform.twitch?.length || 0,
    questions: messagesByPlatform.twitch?.filter((m) => m.isQuestion).length || 0,
    sentiment: calculateSentiment(messagesByPlatform.twitch || []),
  },
  kick: {
    count: messagesByPlatform.kick?.length || 0,
    questions: messagesByPlatform.kick?.filter((m) => m.isQuestion).length || 0,
    sentiment: calculateSentiment(messagesByPlatform.kick || []),
  },
}
```

---

## 🧪 Testing Scenarios

### Test 1: Twitch Only (Current Functionality)

- User has NO Kick username set
- Dashboard connects to Twitch only
- All messages show with purple styling
- Everything works as it does now

### Test 2: Kick Only

- User has Kick username, NO Twitch channel
- Dashboard connects to Kick only
- All messages show with green styling
- Stats/analytics work the same

### Test 3: Dual Platform (The Big One!)

- User has BOTH Twitch and Kick usernames set
- Both channels are LIVE simultaneously
- Dashboard shows unified chat feed
- Messages interleaved by timestamp
- Purple for Twitch, Green for Kick
- Stats show breakdown by platform

### Test 4: One Platform Live, One Offline

- User has both set up
- Only Twitch is live (or only Kick)
- Dashboard connects to whichever is live
- No errors for offline platform

---

## 📧 Post-Stream Reports Update

**Current Email:**

```
Subject: Your Stream Report - millzaatv

Total Messages: 1,234
Questions: 45
Sentiment: 89% Positive
```

**Multi-Platform Email:**

```
Subject: Your Multi-Platform Stream Report - millzaatv

🎮 STREAM OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Messages: 1,234
🟣 Twitch: 892 (72%)
🟢 Kick: 342 (28%)

Questions: 45
🟣 Twitch: 32
🟢 Kick: 13

Overall Sentiment: 89% Positive
🟣 Twitch: 91% Positive
🟢 Kick: 85% Positive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TOP QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[🟣] @user123: What settings are you using?
[🟢] @kickfan: How do you aim so well?
[🟣] @viewer42: What's your sensitivity?
```

---

## 🚀 Implementation Order

### Week 1: Foundation

1. ✅ Test Kick integration (DONE!)
2. Add Kick username field to settings page
3. Update database schema (add platform columns)
4. Create UnifiedMessage type/interface

### Week 2: Dashboard Integration

5. Update dashboard to handle dual connections
6. Create ChatMessage component with platform styling
7. Implement ChatManager for unified message handling
8. Test with single platform (Twitch only)

### Week 3: Analytics & Testing

9. Update analytics to support multi-platform
10. Test dual platform scenario
11. Update post-stream report generator
12. Edge case testing (offline channels, errors, etc.)

### Week 4: Polish & Deploy

13. UI refinements
14. Performance testing
15. Documentation
16. Deploy to production

---

## 🎯 Success Criteria

- [ ] Twitch-only users see no changes (backward compatible)
- [ ] Kick-only users can use dashboard with Kick chat
- [ ] Dual-platform users see unified chat with clear differentiation
- [ ] Messages from both platforms interleave correctly by timestamp
- [ ] Analytics aggregate data from both platforms
- [ ] Post-stream reports show platform breakdown
- [ ] No errors when one platform is offline
- [ ] Performance remains good with dual connections

---

## 💡 Future Enhancements (Not in Scope Yet)

- YouTube Live support
- TikTok Live support
- Platform-specific analytics (which platform has more engagement?)
- Filter view by platform (show only Twitch or only Kick)
- Platform comparison metrics

---

## ✅ Next Steps

Ready to start implementation? First step:

**Add Kick username field to settings page**

This will let users opt-in to Kick integration. Once that's done, we can start building the multi-platform dashboard.

Shall we start with the settings page?
