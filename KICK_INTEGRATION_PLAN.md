# Kick Integration Plan - Multi-Platform Dashboard

## 🎯 **Goal**
Add Kick.com chat support alongside Twitch in a unified dashboard with platform-specific styling.

---

## 🎨 **Design Vision**

### **Visual Differentiation**
- **Twitch messages**: Purple theme (#6441A5) + Twitch icon
- **Kick messages**: Green theme (#53FC18) + Kick icon
- **Unified dashboard**: Switch between platforms or view both simultaneously

### **UI Mockup**
```
┌─────────────────────────────────────────┐
│ Connected to: [🟣 Twitch: millzaatv]    │
│               [🟢 Kick: millzaatv]      │
├─────────────────────────────────────────┤
│ 💬 Live Chat Feed                       │
│                                         │
│ [🟣] @user123: Great stream! (positive) │
│ [🟢] @kickfan: Love this game (positive)│
│ [🟣] @viewer42: What settings? (question)│
│ [🟢] @kickuser: gg (neutral)            │
└─────────────────────────────────────────┘
```

---

## 📋 **Technical Requirements**

### **1. Kick Chat Connection**

**WebSocket Endpoint:**
```
wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false
```

**Connection Flow:**
```javascript
// Similar to Twitch IRC, but uses Pusher protocol
const kickWs = new WebSocket('wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c')

kickWs.onopen = () => {
  // Subscribe to channel's chatroom
  kickWs.send(JSON.stringify({
    event: 'pusher:subscribe',
    data: {
      auth: '',
      channel: `chatrooms.${chatroomId}.v2`
    }
  }))
}

kickWs.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.event === 'App\\Events\\ChatMessageEvent') {
    // Parse message
    const message = JSON.parse(data.data)
    handleKickMessage(message)
  }
}
```

**Key Differences from Twitch:**
| Aspect | Twitch | Kick |
|--------|--------|------|
| Protocol | IRC | Pusher WebSocket |
| Auth | Anonymous (justinfan) | Public channels = no auth |
| Message Format | IRC PRIVMSG | JSON events |
| Chatroom ID | Channel name | Numeric chatroom_id |

---

### **2. Get Kick Chatroom ID**

**API Endpoint:**
```
GET https://kick.com/api/v2/channels/{username}
```

**Response:**
```json
{
  "id": 123456,
  "user": {
    "username": "millzaatv"
  },
  "chatroom": {
    "id": 789012,  // ← Need this for WebSocket
    "chat_mode": "public"
  },
  "livestream": {
    "is_live": true,
    "viewer_count": 1234
  }
}
```

**Implementation:**
```typescript
async function getKickChatroomId(username: string): Promise<number> {
  const response = await fetch(`https://kick.com/api/v2/channels/${username}`)
  const data = await response.json()
  return data.chatroom.id
}
```

---

### **3. Database Schema Changes**

**Add platform field to existing tables:**

```sql
-- Add platform column to stream_report_sessions
ALTER TABLE stream_report_sessions
ADD COLUMN platform VARCHAR(20) DEFAULT 'twitch'
CHECK (platform IN ('twitch', 'kick'));

-- Add platform column to stream_chat_messages
ALTER TABLE stream_chat_messages
ADD COLUMN platform VARCHAR(20) DEFAULT 'twitch'
CHECK (platform IN ('twitch', 'kick'));

-- Add index for efficient filtering
CREATE INDEX idx_messages_platform ON stream_chat_messages(platform, session_id);

-- Add platform column to stream_events
ALTER TABLE stream_events
ADD COLUMN platform VARCHAR(20) DEFAULT 'twitch'
CHECK (platform IN ('twitch', 'kick'));
```

---

### **4. Component Architecture**

**File Structure:**
```
src/
├── lib/
│   ├── chat/
│   │   ├── twitch.ts          ← Twitch WebSocket logic
│   │   ├── kick.ts            ← Kick WebSocket logic (NEW)
│   │   ├── chatManager.ts     ← Unified manager (NEW)
│   │   └── types.ts           ← Shared types (NEW)
│   └── multilingual.ts        ← Existing (works for both)
│
├── components/
│   ├── ChatMessage.tsx        ← Platform-aware styling (UPDATE)
│   ├── PlatformSelector.tsx   ← Choose Twitch/Kick (NEW)
│   └── ActivityFeed.tsx       ← Platform filtering (UPDATE)
│
└── app/
    └── dashboard/
        └── page.tsx           ← Multi-platform support (UPDATE)
```

---

### **5. Code Implementation Plan**

#### **Step 1: Create Kick WebSocket Client**

`src/lib/chat/kick.ts`:
```typescript
export class KickChatClient {
  private ws: WebSocket | null = null
  private chatroomId: number

  constructor(username: string) {
    this.chatroomId = await this.getChatroomId(username)
  }

  async connect() {
    this.ws = new WebSocket('wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c')

    this.ws.onopen = () => {
      this.subscribe()
    }

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data)
    }
  }

  private subscribe() {
    this.ws?.send(JSON.stringify({
      event: 'pusher:subscribe',
      data: {
        auth: '',
        channel: `chatrooms.${this.chatroomId}.v2`
      }
    }))
  }

  private handleMessage(data: string) {
    const message = JSON.parse(data)

    if (message.event === 'App\\Events\\ChatMessageEvent') {
      const chatData = JSON.parse(message.data)
      return {
        username: chatData.sender.username,
        message: chatData.content,
        timestamp: new Date(chatData.created_at),
        platform: 'kick'
      }
    }
  }

  private async getChatroomId(username: string): Promise<number> {
    const response = await fetch(`https://kick.com/api/v2/channels/${username}`)
    const data = await response.json()
    return data.chatroom.id
  }
}
```

#### **Step 2: Unified Chat Manager**

`src/lib/chat/chatManager.ts`:
```typescript
import { TwitchChatClient } from './twitch'
import { KickChatClient } from './kick'

export class ChatManager {
  private clients: Map<string, TwitchChatClient | KickChatClient> = new Map()

  async connectPlatform(platform: 'twitch' | 'kick', username: string) {
    const client = platform === 'twitch'
      ? new TwitchChatClient(username)
      : new KickChatClient(username)

    await client.connect()
    this.clients.set(platform, client)
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.clients.forEach(client => {
      client.on('message', callback)
    })
  }

  disconnect(platform: 'twitch' | 'kick') {
    const client = this.clients.get(platform)
    client?.disconnect()
    this.clients.delete(platform)
  }
}
```

#### **Step 3: Platform-Aware Message Component**

`src/components/ChatMessage.tsx`:
```typescript
interface ChatMessageProps {
  message: ChatMessage
  platform: 'twitch' | 'kick'
}

export function ChatMessage({ message, platform }: ChatMessageProps) {
  const platformStyles = {
    twitch: {
      color: '#6441A5',
      icon: '🟣',
      bgColor: 'rgba(100, 65, 165, 0.1)'
    },
    kick: {
      color: '#53FC18',
      icon: '🟢',
      bgColor: 'rgba(83, 252, 24, 0.1)'
    }
  }

  const style = platformStyles[platform]

  return (
    <div style={{
      background: style.bgColor,
      borderLeft: `4px solid ${style.color}`,
      padding: '12px',
      borderRadius: '8px'
    }}>
      <span style={{ fontSize: '12px', marginRight: '8px' }}>
        {style.icon}
      </span>
      <strong style={{ color: style.color }}>@{message.username}</strong>
      <span>: {message.message}</span>
      {message.sentiment && (
        <span style={{ marginLeft: '8px', opacity: 0.7 }}>
          {message.sentiment === 'positive' ? '😊' :
           message.sentiment === 'negative' ? '😠' : '😐'}
        </span>
      )}
    </div>
  )
}
```

#### **Step 4: Platform Selector Component**

`src/components/PlatformSelector.tsx`:
```typescript
export function PlatformSelector({
  selectedPlatforms,
  onToggle
}: {
  selectedPlatforms: Set<'twitch' | 'kick'>
  onToggle: (platform: 'twitch' | 'kick') => void
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
      <button
        onClick={() => onToggle('twitch')}
        style={{
          background: selectedPlatforms.has('twitch')
            ? 'linear-gradient(135deg, #6441A5, #9147FF)'
            : 'rgba(100, 65, 165, 0.2)',
          border: '1px solid #6441A5',
          padding: '10px 20px',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        🟣 Twitch
      </button>

      <button
        onClick={() => onToggle('kick')}
        style={{
          background: selectedPlatforms.has('kick')
            ? 'linear-gradient(135deg, #53FC18, #7FFF3F)'
            : 'rgba(83, 252, 24, 0.2)',
          border: '1px solid #53FC18',
          padding: '10px 20px',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        🟢 Kick
      </button>
    </div>
  )
}
```

---

## 🔄 **Dashboard Integration Flow**

### **User Experience:**

1. **Platform Selection:**
   ```
   [ ] Enter Twitch username: ___________ [Connect 🟣]
   [ ] Enter Kick username:   ___________ [Connect 🟢]
   ```

2. **Multi-Platform View:**
   ```
   Connected Platforms:
   🟣 Twitch: millzaatv (1,234 viewers)
   🟢 Kick: millzaatv (567 viewers)

   Filter: [All] [🟣 Twitch] [🟢 Kick]
   ```

3. **Unified Analytics:**
   ```
   Total Messages: 1,234
   ├─ 🟣 Twitch: 892 (72%)
   └─ 🟢 Kick: 342 (28%)

   Questions: 45
   ├─ 🟣 Twitch: 32
   └─ 🟢 Kick: 13
   ```

---

## 📊 **Post-Stream Reports**

### **Report with Multi-Platform Data:**

```
Subject: 🎮 Your Multi-Platform Stream Report - millzaatv

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Stream Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Messages: 2,456
🟣 Twitch: 1,678 (68%)
🟢 Kick: 778 (32%)

Peak Viewers: 1,589
🟣 Twitch: 1,234
🟢 Kick: 355

Questions: 87
🟣 Twitch: 62
🟢 Kick: 25

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ Top Questions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[🟣] @user123: What settings are you using?
[🟢] @kickfan: How do you aim so well?
[🟣] @viewer42: What's your sensitivity?
```

---

## 🚧 **Implementation Phases**

### **Phase 1: Foundation (Week 1)**
- [ ] Create Kick WebSocket client (`kick.ts`)
- [ ] Add platform column to database
- [ ] Build unified ChatManager
- [ ] Test Kick connection with single channel

### **Phase 2: UI Integration (Week 2)**
- [ ] Add platform selector to dashboard
- [ ] Create platform-aware message styling
- [ ] Implement filter toggles (All/Twitch/Kick)
- [ ] Add platform icons and colors

### **Phase 3: Analytics (Week 3)**
- [ ] Update analytics to aggregate by platform
- [ ] Modify report generation for multi-platform
- [ ] Add platform breakdown to email reports
- [ ] Update charts to show platform comparison

### **Phase 4: Testing & Polish (Week 4)**
- [ ] Test with real Kick streams
- [ ] Handle edge cases (connection drops, rate limits)
- [ ] Add platform-specific settings
- [ ] Performance optimization for dual connections

---

## 🔧 **Development Environment Setup**

### **Test Without Production Impact:**

1. **Create Feature Branch:**
```bash
git checkout -b feature/kick-integration
```

2. **Add Kick Test Configuration:**
```typescript
// .env.local
KICK_TEST_CHANNEL=millzaatv
ENABLE_KICK=true  // Feature flag
```

3. **Isolated Testing:**
```typescript
// Only enable Kick in dev mode
const isKickEnabled = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_KICK === 'true'
```

4. **Test with Real Kick Streams:**
- Find a live Kick channel
- Connect via admin panel
- Verify messages flowing
- Test analytics generation

---

## 💰 **Cost Impact**

**Additional Resources Needed:**
- **WebSocket connections**: 1 per platform (minimal cost)
- **API calls**: Kick chatroom ID lookup (1 per connection)
- **Database storage**: Same as Twitch (platform column adds negligible space)

**Estimated Additional Cost:** $0-2/month for 1,000 users (both platforms)

---

## 🎯 **Competitive Advantage**

### **Unique Value Props:**

1. **Multi-Platform Streamers:**
   - Many streamers dual-stream to Twitch + Kick
   - Unified view saves them from checking 2 dashboards

2. **Platform Comparison:**
   - Which platform has better engagement?
   - Where do viewers ask more questions?
   - Platform-specific audience insights

3. **Migration Support:**
   - Streamers moving from Twitch → Kick
   - Historical comparison of platform performance

---

## 📝 **Next Steps to Start Development**

### **Step 1: Quick Prototype (1-2 hours)**
```bash
# Create feature branch
git checkout -b feature/kick-integration

# Create basic Kick client
mkdir src/lib/chat
touch src/lib/chat/kick.ts

# Test connection to a live Kick channel
# No database changes yet - just console.log messages
```

### **Step 2: Test Connection (30 mins)**
```typescript
// Simple test in dashboard
const testKick = async () => {
  const ws = new WebSocket('wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c')

  ws.onopen = () => {
    console.log('🟢 Connected to Kick')
    // Subscribe to a chatroom
    ws.send(JSON.stringify({
      event: 'pusher:subscribe',
      data: { channel: 'chatrooms.12345.v2' }
    }))
  }

  ws.onmessage = (e) => {
    console.log('🟢 Kick message:', e.data)
  }
}
```

### **Step 3: Parallel Development**
- Work on Kick in feature branch
- Keep Twitch stable in main
- Merge when Kick is fully tested

---

## 🎨 **Visual Design Reference**

**Color Palette:**
```css
/* Twitch */
--twitch-primary: #6441A5
--twitch-secondary: #9147FF
--twitch-bg: rgba(100, 65, 165, 0.1)

/* Kick */
--kick-primary: #53FC18
--kick-secondary: #7FFF3F
--kick-bg: rgba(83, 252, 24, 0.1)

/* Gradients */
--twitch-gradient: linear-gradient(135deg, #6441A5, #9147FF)
--kick-gradient: linear-gradient(135deg, #53FC18, #7FFF3F)
```

**Icons:**
- Twitch: 🟣 or <TwitchIcon />
- Kick: 🟢 or <KickIcon />

---

## ✅ **Success Criteria**

- [ ] Connect to both Twitch and Kick simultaneously
- [ ] Display messages with platform-specific styling
- [ ] Filter messages by platform
- [ ] Generate analytics per platform
- [ ] Send reports with multi-platform breakdown
- [ ] Handle connection failures gracefully
- [ ] No performance degradation with dual connections
- [ ] User can toggle platforms on/off

---

**Ready to start prototyping?** Let me know and I'll create the basic Kick WebSocket client! 🚀
