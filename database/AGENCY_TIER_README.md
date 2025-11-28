# Agency Tier Implementation

This document describes the Agency Organizations feature for Casi Platform ($49.99/mo tier).

## Overview

The Agency tier allows agency managers to:

- Create an organization (e.g., "Team Liquid")
- Invite multiple streamers (talent) to their organization
- View aggregated analytics for all their talent ("God View")
- Manage billing centrally via Stripe

## Database Schema

### Tables

#### `organizations`

Represents agencies or teams that manage multiple streamers.

| Column               | Type      | Description                                      |
| -------------------- | --------- | ------------------------------------------------ |
| `id`                 | UUID      | Primary key                                      |
| `owner_id`           | UUID      | Foreign key to `auth.users` (the agency manager) |
| `name`               | TEXT      | Organization name (e.g., "Team Liquid")          |
| `logo_url`           | TEXT      | Optional logo URL                                |
| `stripe_customer_id` | TEXT      | Stripe customer ID for billing                   |
| `created_at`         | TIMESTAMP | Creation timestamp                               |
| `updated_at`         | TIMESTAMP | Last update timestamp                            |

#### `organization_members`

Links streamers (talent) to organizations.

| Column            | Type      | Description                                |
| ----------------- | --------- | ------------------------------------------ |
| `id`              | UUID      | Primary key                                |
| `organization_id` | UUID      | Foreign key to `organizations`             |
| `user_id`         | UUID      | Foreign key to `auth.users` (the streamer) |
| `role`            | TEXT      | Role: 'owner' or 'talent'                  |
| `joined_at`       | TIMESTAMP | Join timestamp                             |

**Constraints:**

- UNIQUE(organization_id, user_id) - A user can only be in an org once

### Row Level Security (RLS)

#### Organizations

- **Owners** can manage their own organizations (CRUD)
- **Members** can view their organization details (READ only)

#### Organization Members

- **Owners** can manage members in their organization (CRUD)
- **Members** can view other members in their organization (READ only)
- **Users** can always view their own membership record

#### Stream Data Access ("God View")

Organization owners can view stream data for all their talent:

- `stream_report_sessions` - View all sessions for talent members
- `stream_chat_messages` - View all chat messages for talent sessions
- `stream_session_analytics` - View all analytics for talent sessions

**Talent members** can ONLY view their own data, NOT other members' data or organization billing.

## Deployment

### Step 1: Run the Migration

1. Open Supabase SQL Editor
2. Copy and paste the contents of `agency-organizations-migration.sql`
3. Execute the migration

**Verification:**

```sql
-- Verify tables were created
SELECT * FROM organizations;
SELECT * FROM organization_members;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('organizations', 'organization_members');
```

### Step 2: Backfill user_id on stream_report_sessions (Optional)

If you have existing stream sessions that only have `streamer_email`, you may want to backfill the `user_id`:

```sql
-- Example backfill query
UPDATE stream_report_sessions srs
SET user_id = u.id
FROM auth.users u
WHERE srs.streamer_email = u.email
AND srs.user_id IS NULL;
```

## API Endpoints

### 1. Create Organization

**POST** `/api/agency/organization`

Creates a new organization for the authenticated user.

**Request:**

```json
{
  "name": "Team Liquid",
  "logoUrl": "https://example.com/logo.png" // optional
}
```

**Response:**

```json
{
  "success": true,
  "organization": {
    "id": "uuid",
    "owner_id": "uuid",
    "name": "Team Liquid",
    "logo_url": "https://example.com/logo.png",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "message": "Organization created successfully"
}
```

**Authorization:** Requires Bearer token in Authorization header

---

### 2. Get Organization Details

**GET** `/api/agency/organization`

Gets the current user's organization details.

**Response (Owner):**

```json
{
  "organization": {
    "id": "uuid",
    "name": "Team Liquid",
    "owner_id": "uuid",
    "logo_url": "https://...",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "role": "owner",
  "members": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "email": "streamer@example.com",
      "displayName": "StreamerName",
      "role": "talent",
      "joined_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Response (Talent):**

```json
{
  "organization": {
    "id": "uuid",
    "name": "Team Liquid",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "role": "talent",
  "membership": {
    "id": "uuid",
    "joinedAt": "2025-01-01T00:00:00Z"
  }
}
```

**Authorization:** Requires Bearer token

---

### 3. Update Organization

**PATCH** `/api/agency/organization`

Updates organization details (owner only).

**Request:**

```json
{
  "organizationId": "uuid",
  "name": "New Name", // optional
  "logoUrl": "https://..." // optional
}
```

**Response:**

```json
{
  "success": true,
  "organization": {
    /* updated org */
  },
  "message": "Organization updated successfully"
}
```

**Authorization:** Requires Bearer token + must be organization owner

---

### 4. Invite Talent to Organization

**POST** `/api/agency/invite`

Invites a streamer to the organization.

**Request:**

```json
{
  "organizationId": "uuid",
  "email": "streamer@example.com"
}
```

**Response (Success):**

```json
{
  "success": true,
  "member": {
    "id": "uuid",
    "email": "streamer@example.com",
    "userId": "uuid",
    "role": "talent",
    "joinedAt": "2025-01-01T00:00:00Z"
  },
  "message": "streamer@example.com has been successfully added to Team Liquid"
}
```

**Response (User Not Found):**

```json
{
  "error": "User not found",
  "message": "This user has not signed up yet. Please ask them to create an account first."
}
```

**Authorization:** Requires Bearer token + must be organization owner

**Validation:**

- User must already have a Casi account
- User cannot be in multiple organizations
- User cannot be added twice to the same org

---

### 5. Remove Talent from Organization

**DELETE** `/api/agency/invite`

Removes a member from the organization.

**Request:**

```json
{
  "organizationId": "uuid",
  "userId": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Member removed from organization"
}
```

**Authorization:** Requires Bearer token + must be organization owner

**Constraints:**

- Owner cannot remove themselves
- Can only remove talent, not other owners

---

### 6. Get Talent Analytics (God View)

**GET** `/api/agency/talent-analytics?organizationId={id}`

Gets aggregated analytics for all talent in the organization.

**Response:**

```json
{
  "organization": {
    "id": "uuid",
    "name": "Team Liquid",
    "owner_id": "uuid"
  },
  "talentCount": 5,
  "talent": [
    {
      "userId": "uuid",
      "email": "streamer1@example.com",
      "displayName": "StreamerOne",
      "channelName": "streamer_one",
      "stats": {
        "totalSessions": 42,
        "totalMessages": 15000,
        "avgViewers": 150,
        "lastStreamDate": "2025-01-15T20:00:00Z",
        "lastStreamDuration": 180,
        "bestStreamMessages": 5000,
        "bestStreamDate": "2025-01-10T20:00:00Z"
      },
      "recentSessions": [
        /* last 5 sessions */
      ]
    }
  ],
  "organizationTotals": {
    "totalSessions": 210,
    "totalMessages": 75000,
    "avgViewersAcrossAllTalent": 175,
    "activeTalent": 5
  }
}
```

**Authorization:** Requires Bearer token + must be organization owner

---

## Frontend Integration

### Getting User's Auth Token

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get current session
const {
  data: { session },
} = await supabase.auth.getSession()
const token = session?.access_token

// Use token in API calls
const response = await fetch('/api/agency/organization', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
```

### Example: Create Organization Flow

```typescript
async function createOrganization(name: string, logoUrl?: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const response = await fetch('/api/agency/organization', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, logoUrl }),
  })

  return await response.json()
}
```

### Example: Invite Talent

```typescript
async function inviteTalent(organizationId: string, email: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const response = await fetch('/api/agency/invite', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ organizationId, email }),
  })

  return await response.json()
}
```

## Testing

### Manual Testing Checklist

#### As Agency Manager:

- [ ] Create organization
- [ ] Invite talent (existing user)
- [ ] Try to invite talent (non-existing user) - should fail
- [ ] View organization details
- [ ] View talent analytics (God View)
- [ ] Access talent's stream sessions
- [ ] Access talent's chat messages
- [ ] Remove talent from organization
- [ ] Update organization name/logo

#### As Talent Member:

- [ ] View own organization (limited details)
- [ ] View own stream data
- [ ] Try to access other talent's data - should fail
- [ ] Try to view organization billing - should fail
- [ ] Try to manage organization - should fail

#### As Regular User (not in org):

- [ ] Try to access organization endpoints - should fail
- [ ] View only own stream data

### SQL Verification Queries

```sql
-- Check RLS is working for organizations
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-uuid-here';

SELECT * FROM organizations;  -- Should only see own org
SELECT * FROM organization_members;  -- Should only see own memberships

-- Check God View is working
SELECT * FROM stream_report_sessions
WHERE user_id IN (
  SELECT user_id FROM organization_members
  WHERE organization_id = 'org-uuid-here'
);
```

## Billing Integration (TODO)

The Agency tier should be billed at $49.99/mo via Stripe. When a user upgrades to Agency:

1. Create organization record
2. Store `stripe_customer_id` on organization
3. Link Stripe subscription to organization
4. Allow organization owner to manage billing

**Future Enhancement:** Update `subscriptions` table to support organization billing.

## Security Considerations

✅ **Implemented:**

- RLS policies prevent talent from viewing other talent's data
- RLS policies prevent talent from accessing organization billing
- Organization owners have read-only access to talent data
- All endpoints require authentication
- Ownership verification on all mutations

⚠️ **Important:**

- Never expose `stripe_customer_id` to non-owners
- Always verify organization ownership before allowing mutations
- Token validation is handled by Supabase auth

## Future Enhancements

- [ ] Email invitations for non-existing users
- [ ] Organization-level settings and preferences
- [ ] Usage analytics per organization
- [ ] Sub-organization support (nested teams)
- [ ] Talent activity notifications
- [ ] Bulk operations (invite multiple talent at once)
- [ ] Organization-wide reports
- [ ] Export functionality for all talent data
