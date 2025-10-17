# Viral Clip Detection & Auto-Clipping - Technical Specification

## 🎯 Feature Overview

**Name:** Viral Clip Detection & Auto-Clipping
**Phase:** Phase 2 (1-2 Months)
**Priority:** HIGH
**Tiers:** Pro, Streamer+

### Value Proposition
Automatically capture viral moments from streams by detecting chat engagement spikes and allowing manual triggers. Creates shareable clips without streamers needing to react in the moment.

---

## 📋 Functional Requirements

### 1. Trigger Methods

#### A. Manual Chat Commands
- **Commands:** `!clip`, `clip it`, `!clipit`
- **Response:** Silent clip creation (no chat spam)
- **Permissions:** All viewers can trigger (with rate limits)

#### B. Automatic Sentiment Detection
- **Trigger Conditions:**
  - Sentiment score > 75% positive
  - Chat velocity increase > 300% vs. baseline
  - Combined engagement spike (messages + sentiment)

#### C. Manual Dashboard Button
- **Location:** Real-time dashboard
- **Action:** Instant clip of last 2 minutes
- **Confirmation:** Visual feedback + clip preview

### 2. Clip Specifications

#### Duration
- **Default:** 120 seconds (last 2 minutes)
- **Configurable:** 30s, 60s, 90s, 120s (Pro+)
- **Buffer:** 5 second padding at end

#### Quality
- **Resolution:** Match stream quality (up to 1080p)
- **Format:** MP4 (H.264)
- **Framerate:** Match source (30/60fps)

### 3. Duplicate Prevention System

#### Cooldown Mechanism
```javascript
// Prevent clips within 90 seconds of each other
const CLIP_COOLDOWN_MS = 90000; // 90 seconds

// Track last clip timestamp per stream session
const clipTimestamps = new Map<string, number>();

function canCreateClip(streamId: string): boolean {
  const lastClipTime = clipTimestamps.get(streamId);
  if (!lastClipTime) return true;

  const timeSinceLastClip = Date.now() - lastClipTime;
  return timeSinceLastClip >= CLIP_COOLDOWN_MS;
}
```

#### Chat Pattern Hash Detection
```javascript
// Prevent duplicate sentiment spikes from same chat pattern
import crypto from 'crypto';

function generateChatPatternHash(messages: string[]): string {
  // Get last 50 messages
  const recentMessages = messages.slice(-50);

  // Normalize and concatenate
  const pattern = recentMessages
    .map(msg => msg.toLowerCase().trim())
    .join('|');

  // Create hash
  return crypto.createHash('md5').update(pattern).digest('hex');
}

// Store recent hashes to prevent duplicate auto-clips
const recentPatternHashes = new Set<string>();

function isDuplicatePattern(hash: string): boolean {
  if (recentPatternHashes.has(hash)) return true;

  recentPatternHashes.add(hash);

  // Clear old hashes after 5 minutes
  setTimeout(() => recentPatternHashes.delete(hash), 300000);

  return false;
}
```

#### Queue Management
```javascript
// Maximum clips per stream session
const MAX_CLIPS_PER_SESSION = 20; // Pro: 20, Streamer+: Unlimited

// Maximum clips per hour
const MAX_CLIPS_PER_HOUR = 10;

// Clip queue with priority
interface ClipRequest {
  id: string;
  streamId: string;
  timestamp: number;
  triggerType: 'manual' | 'auto' | 'command';
  priority: number; // manual=3, command=2, auto=1
}

const clipQueue: ClipRequest[] = [];

function enqueueClip(request: ClipRequest): boolean {
  // Check rate limits
  if (!canCreateClip(request.streamId)) {
    return false;
  }

  // Add to queue with priority
  clipQueue.push(request);
  clipQueue.sort((a, b) => b.priority - a.priority);

  // Process queue
  processClipQueue();

  return true;
}
```

---

## 🏗️ Technical Architecture

### 1. Database Schema

```sql
-- Clips table
CREATE TABLE stream_clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_session_id UUID REFERENCES stream_report_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Clip metadata
  clip_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 120,

  -- Trigger information
  trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('manual', 'auto', 'command')),
  trigger_user_id UUID REFERENCES auth.users(id), -- For command triggers
  trigger_timestamp TIMESTAMPTZ NOT NULL,

  -- Engagement metrics at time of clip
  sentiment_score NUMERIC(5,2),
  chat_velocity INTEGER, -- messages per minute
  engagement_score NUMERIC(5,2),

  -- Prevention tracking
  pattern_hash VARCHAR(32),

  -- Metadata
  title TEXT,
  description TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clips_stream_session ON stream_clips(stream_session_id);
CREATE INDEX idx_clips_user ON stream_clips(user_id);
CREATE INDEX idx_clips_trigger_timestamp ON stream_clips(trigger_timestamp);
CREATE INDEX idx_clips_pattern_hash ON stream_clips(pattern_hash);

-- Clip rate limiting tracking
CREATE TABLE clip_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_session_id UUID REFERENCES stream_report_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  last_clip_timestamp TIMESTAMPTZ NOT NULL,
  clips_in_last_hour INTEGER DEFAULT 0,
  total_clips_in_session INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE stream_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clips"
  ON stream_clips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create clips for their streams"
  ON stream_clips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public clips are viewable by anyone"
  ON stream_clips FOR SELECT
  USING (is_public = true);
```

### 2. API Endpoints

#### `/api/clips/create`
```typescript
// POST /api/clips/create
interface CreateClipRequest {
  streamSessionId: string;
  triggerType: 'manual' | 'auto' | 'command';
  triggerUserId?: string; // For command triggers
  duration?: number; // Optional: 30, 60, 90, 120
}

interface CreateClipResponse {
  success: boolean;
  clipId?: string;
  clipUrl?: string;
  error?: string;
  cooldownRemaining?: number; // If rate limited
}
```

#### `/api/clips/check-eligibility`
```typescript
// GET /api/clips/check-eligibility?streamSessionId=xxx
interface ClipEligibilityResponse {
  canClip: boolean;
  reason?: string;
  cooldownRemaining?: number;
  clipsRemaining?: number; // For Pro tier limits
}
```

#### `/api/clips/list`
```typescript
// GET /api/clips/list?streamSessionId=xxx
interface ClipListResponse {
  clips: Array<{
    id: string;
    clipUrl: string;
    thumbnailUrl: string;
    duration: number;
    triggerType: string;
    sentimentScore: number;
    createdAt: string;
    title?: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
}
```

### 3. Stream Buffer Service

```typescript
// lib/stream-buffer.ts
import { createClient } from '@supabase/supabase-js';

interface StreamBuffer {
  streamId: string;
  segments: VideoSegment[];
  maxDuration: number; // 120 seconds
}

interface VideoSegment {
  timestamp: number;
  url: string; // HLS segment URL
  duration: number;
}

class StreamBufferService {
  private buffers: Map<string, StreamBuffer> = new Map();

  // Initialize buffer for a stream
  async startBuffer(streamId: string) {
    this.buffers.set(streamId, {
      streamId,
      segments: [],
      maxDuration: 120
    });

    // Start capturing HLS segments
    await this.captureHLSSegments(streamId);
  }

  // Capture HLS segments from Twitch
  private async captureHLSSegments(streamId: string) {
    const streamUrl = await this.getTwitchStreamUrl(streamId);

    // Use HLS.js or similar to capture segments
    // Store segments in rolling buffer (last 120 seconds)
    // Implementation depends on platform (Twitch/YouTube/Kick)
  }

  // Get buffer for clip creation
  async getBuffer(streamId: string, duration: number): Promise<VideoSegment[]> {
    const buffer = this.buffers.get(streamId);
    if (!buffer) throw new Error('Stream buffer not found');

    // Get last N seconds of segments
    const now = Date.now();
    const cutoff = now - (duration * 1000);

    return buffer.segments.filter(seg => seg.timestamp >= cutoff);
  }

  // Clean up buffer when stream ends
  async stopBuffer(streamId: string) {
    this.buffers.delete(streamId);
  }
}

export const streamBuffer = new StreamBufferService();
```

### 4. Clip Creation Service

```typescript
// lib/clip-creator.ts
import { streamBuffer } from './stream-buffer';
import { uploadToCloudStorage } from './storage';

interface ClipCreationOptions {
  streamSessionId: string;
  duration: number;
  triggerType: 'manual' | 'auto' | 'command';
  triggerUserId?: string;
  sentimentScore?: number;
  chatVelocity?: number;
}

class ClipCreator {
  async createClip(options: ClipCreationOptions): Promise<string> {
    const { streamSessionId, duration } = options;

    // 1. Get stream buffer segments
    const segments = await streamBuffer.getBuffer(streamSessionId, duration);

    // 2. Stitch segments together using FFmpeg
    const videoFile = await this.stitchSegments(segments);

    // 3. Generate thumbnail
    const thumbnail = await this.generateThumbnail(videoFile);

    // 4. Upload to cloud storage (AWS S3 / Cloudflare R2)
    const clipUrl = await uploadToCloudStorage(videoFile, 'clips');
    const thumbnailUrl = await uploadToCloudStorage(thumbnail, 'thumbnails');

    // 5. Save to database
    const clipId = await this.saveClipToDatabase({
      ...options,
      clipUrl,
      thumbnailUrl,
    });

    return clipId;
  }

  private async stitchSegments(segments: VideoSegment[]): Promise<Buffer> {
    // Use FFmpeg to stitch HLS segments into MP4
    // ffmpeg -i "concat:segment1.ts|segment2.ts|..." -c copy output.mp4

    const ffmpeg = require('fluent-ffmpeg');

    return new Promise((resolve, reject) => {
      // Implementation using fluent-ffmpeg
    });
  }

  private async generateThumbnail(videoFile: Buffer): Promise<Buffer> {
    // Extract frame at 50% mark
    // ffmpeg -i input.mp4 -ss 00:01:00 -vframes 1 thumbnail.jpg

    const ffmpeg = require('fluent-ffmpeg');

    return new Promise((resolve, reject) => {
      // Implementation
    });
  }

  private async saveClipToDatabase(data: any): Promise<string> {
    const supabase = createClient(/* ... */);

    const { data: clip, error } = await supabase
      .from('stream_clips')
      .insert({
        stream_session_id: data.streamSessionId,
        clip_url: data.clipUrl,
        thumbnail_url: data.thumbnailUrl,
        duration_seconds: data.duration,
        trigger_type: data.triggerType,
        trigger_user_id: data.triggerUserId,
        trigger_timestamp: new Date().toISOString(),
        sentiment_score: data.sentimentScore,
        chat_velocity: data.chatVelocity,
        pattern_hash: data.patternHash,
      })
      .select()
      .single();

    if (error) throw error;

    return clip.id;
  }
}

export const clipCreator = new ClipCreator();
```

### 5. Real-time Sentiment Monitor

```typescript
// lib/clip-monitor.ts
import { analyzeMultilingualChat } from './multilingual';
import { clipCreator } from './clip-creator';

interface ChatMessage {
  id: string;
  text: string;
  timestamp: number;
  userId: string;
}

class ClipMonitor {
  private messageBuffers: Map<string, ChatMessage[]> = new Map();
  private baselineVelocity: Map<string, number> = new Map();

  async processChatMessage(streamId: string, message: ChatMessage) {
    // Add to buffer
    if (!this.messageBuffers.has(streamId)) {
      this.messageBuffers.set(streamId, []);
    }

    const buffer = this.messageBuffers.get(streamId)!;
    buffer.push(message);

    // Keep only last 5 minutes
    const fiveMinutesAgo = Date.now() - 300000;
    const recentMessages = buffer.filter(m => m.timestamp > fiveMinutesAgo);
    this.messageBuffers.set(streamId, recentMessages);

    // Check for clip trigger
    await this.checkForClipTrigger(streamId, recentMessages);
  }

  private async checkForClipTrigger(streamId: string, messages: ChatMessage[]) {
    // Calculate current sentiment
    const recentText = messages.slice(-20).map(m => m.text);
    const sentiment = await analyzeMultilingualChat(recentText);

    // Calculate chat velocity (messages per minute)
    const oneMinuteAgo = Date.now() - 60000;
    const recentCount = messages.filter(m => m.timestamp > oneMinuteAgo).length;
    const velocity = recentCount;

    // Get baseline velocity (average over session)
    const baseline = this.baselineVelocity.get(streamId) || 10;

    // Check trigger conditions
    const sentimentSpike = sentiment.sentimentScore > 0.75;
    const velocitySpike = velocity > (baseline * 3);

    if (sentimentSpike && velocitySpike) {
      // Generate pattern hash
      const patternHash = this.generatePatternHash(messages.slice(-50));

      // Check if duplicate
      if (this.isDuplicatePattern(streamId, patternHash)) {
        return; // Skip duplicate
      }

      // Create auto-clip
      await clipCreator.createClip({
        streamSessionId: streamId,
        duration: 120,
        triggerType: 'auto',
        sentimentScore: sentiment.sentimentScore,
        chatVelocity: velocity,
      });
    }

    // Update baseline velocity (rolling average)
    this.updateBaselineVelocity(streamId, velocity);
  }

  private generatePatternHash(messages: ChatMessage[]): string {
    const pattern = messages
      .map(m => m.text.toLowerCase().trim())
      .join('|');

    const crypto = require('crypto');
    return crypto.createHash('md5').update(pattern).digest('hex');
  }

  private isDuplicatePattern(streamId: string, hash: string): boolean {
    // Implementation with Set and timeout cleanup
    return false; // Placeholder
  }

  private updateBaselineVelocity(streamId: string, currentVelocity: number) {
    const current = this.baselineVelocity.get(streamId) || currentVelocity;
    const updated = (current * 0.9) + (currentVelocity * 0.1); // Weighted average
    this.baselineVelocity.set(streamId, updated);
  }
}

export const clipMonitor = new ClipMonitor();
```

---

## 🔧 Implementation Steps

### Phase 1: Foundation (Week 1-2)
- [ ] Create database schema (stream_clips, clip_rate_limits tables)
- [ ] Implement StreamBufferService for HLS segment capture
- [ ] Build ClipCreator service with FFmpeg integration
- [ ] Set up cloud storage (S3/R2) for clip hosting

### Phase 2: Triggers & Detection (Week 3-4)
- [ ] Implement chat command detection (!clip, clip it)
- [ ] Build ClipMonitor for sentiment spike detection
- [ ] Create duplicate prevention system (hash + cooldown)
- [ ] Implement rate limiting and queue management

### Phase 3: API & UI (Week 5-6)
- [ ] Create REST API endpoints (/api/clips/*)
- [ ] Build dashboard UI for clip management
- [ ] Add manual clip button to real-time dashboard
- [ ] Implement clip preview and sharing

### Phase 4: Testing & Optimization (Week 7-8)
- [ ] Load testing with high chat velocity
- [ ] Optimize FFmpeg performance
- [ ] Test duplicate prevention accuracy
- [ ] Monitor cloud storage costs and optimize

---

## 📊 Success Metrics

### Technical Metrics
- **Clip Creation Time:** < 30 seconds from trigger to available
- **Duplicate Prevention Rate:** > 95% accuracy
- **False Positive Rate:** < 5% (auto-clips that aren't viral)
- **System Uptime:** 99.9% availability

### User Metrics
- **Clips per Stream:** Average 5-8 clips per stream
- **Clip Share Rate:** > 40% of clips shared to social media
- **User Satisfaction:** > 4.5/5 rating for clip quality
- **Feature Adoption:** > 60% of Pro users use clipping

---

## 💰 Cost Estimation

### Infrastructure Costs
- **Cloud Storage:** ~$0.023/GB/month (S3 Standard)
  - Average clip: 50MB
  - 1,000 clips/month = ~$1.15/month

- **FFmpeg Processing:** ~$0.05 per minute of video processed
  - 2-minute clips = $0.10 per clip
  - 1,000 clips/month = ~$100/month

- **Bandwidth:** ~$0.09/GB
  - 50MB clip download = $0.0045
  - 10,000 views = ~$45/month

### Estimated Monthly Cost (1,000 active users)
- Storage: $1,150
- Processing: $10,000
- Bandwidth: $4,500
- **Total: ~$15,650/month**

### Revenue Coverage (Pro tier: £37/month)
- Need 423 Pro subscribers to break even
- Target: 30% of users on Pro+ tiers = 300 users
- Additional 123 users needed or reduce costs by 29%

---

## 🚧 Known Limitations & Future Enhancements

### Current Limitations
1. **Platform Support:** Initially Twitch only (YouTube/Kick later)
2. **Clip Duration:** Fixed options (not custom duration)
3. **No Editing:** Clips are as-is (no trim/edit)
4. **Storage Limits:** Pro: 20 clips/session, Streamer+: Unlimited

### Future Enhancements
1. **Clip Editing:** Trim, add text overlays, transitions
2. **Auto-Highlights:** AI-generated highlight reels
3. **Social Auto-Post:** Direct publish to TikTok/Twitter/Instagram
4. **Collaborative Clipping:** Mods can create clips
5. **Clip Analytics:** View counts, engagement metrics
6. **VOD Clipping:** Clip from past streams, not just live

---

## 🔐 Security & Privacy

### Data Protection
- [ ] Clips are private by default (user must make public)
- [ ] DMCA compliance (takedown system)
- [ ] Age-restricted content filtering
- [ ] User consent for chat-triggered clips

### Rate Limiting
- [ ] Per-user clip limits (prevent abuse)
- [ ] IP-based rate limiting for API
- [ ] Cooldown enforcement (90s minimum)
- [ ] Queue overflow protection

### Storage Security
- [ ] Signed URLs for clip access (time-limited)
- [ ] Encryption at rest (S3 SSE)
- [ ] CDN with DDoS protection
- [ ] Automatic DMCA scanning (future)

---

## 📚 Documentation Requirements

### User Documentation
- [ ] How to use !clip command
- [ ] Understanding auto-clip triggers
- [ ] Managing your clips library
- [ ] Sharing clips to social media
- [ ] Troubleshooting clip issues

### Developer Documentation
- [ ] API reference for /api/clips/*
- [ ] Webhook events for clip creation
- [ ] Integration guide for third-party apps
- [ ] FFmpeg optimization guide

---

## ✅ Acceptance Criteria

### Minimum Viable Feature (MVP)
- ✅ Users can trigger clips via !clip command
- ✅ Auto-clips created on sentiment spikes
- ✅ Duplicate prevention works (90s cooldown)
- ✅ Clips accessible in dashboard
- ✅ Share links work on social media

### Full Feature (v1.0)
- ✅ All MVP criteria
- ✅ Thumbnail generation
- ✅ Multi-platform support (Twitch + YouTube)
- ✅ Clip analytics (views, shares)
- ✅ Rate limiting prevents abuse
- ✅ Mobile-friendly clip viewing

---

*Last Updated: October 12, 2025*
*Status: Planning & Specification Phase*
*Target Release: Phase 2 (1-2 Months)*
