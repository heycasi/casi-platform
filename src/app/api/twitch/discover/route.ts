import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getAppAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Missing Twitch client credentials')
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' })
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) throw new Error('Failed to get app token')
  return data.access_token
}

async function fetchJSON(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

function extractEmail(description: string | undefined): string | null {
  if (!description) return null
  const m = description.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return m ? m[0] : null
}

export async function POST(req: NextRequest) {
  try {
    const { game, first = 20 } = await req.json()
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!
    const token = await getAppAccessToken()
    const headers = { 'Client-Id': clientId, 'Authorization': `Bearer ${token}` }

    // 1) Discover live streams for a game (or top streams if no game)
    const streamsUrl = game
      ? `https://api.twitch.tv/helix/streams?first=${Math.min(first, 100)}&game_name=${encodeURIComponent(game)}`
      : `https://api.twitch.tv/helix/streams?first=${Math.min(first, 100)}`
    const streamsRes = await fetchJSON(streamsUrl, headers)
    const streams = streamsRes.data || []

    // Collect user_ids and game_ids
    const userIds: string[] = Array.from(new Set(streams.map((s: any) => s.user_id)))
    const gameIds: string[] = Array.from(new Set(streams.map((s: any) => s.game_id)))

    // 2) Users (to get bios/description)
    const usersRes = await fetchJSON(`https://api.twitch.tv/helix/users?id=${userIds.join('&id=')}`, headers)
    const users = usersRes.data || []
    const userMap: Record<string, any> = {}
    users.forEach((u: any) => { userMap[u.id] = u })

    // 3) Games map
    let gameMap: Record<string, any> = {}
    if (gameIds.length > 0) {
      const gamesRes = await fetchJSON(`https://api.twitch.tv/helix/games?id=${gameIds.join('&id=')}`, headers)
      const games = gamesRes.data || []
      games.forEach((g: any) => { gameMap[g.id] = g })
    }

    // 4) Optionally get recent stats via analytics-like proxies (Twitch API does not expose avg viewers directly).
    // For a simple approximation, we can use current viewer_count as a proxy; deeper stats would require third-party or periodic snapshots.

    const rows = await Promise.all(streams.map(async (s: any) => {
      const u = userMap[s.user_id]
      const g = gameMap[s.game_id]
      const email = extractEmail(u?.description)
      return {
        user_id: s.user_id,
        login: u?.login || s.user_login,
        display_name: u?.display_name,
        game_id: s.game_id,
        game_name: g?.name || s.game_name,
        description: u?.description,
        email,
        current_viewer_count: s.viewer_count,
        avg_viewer_count: null,
        last_seen_at: new Date().toISOString()
      }
    }))

    // Upsert into Supabase
    if (rows.length > 0) {
      await supabase.from('twitch_streamers').upsert(rows, { onConflict: 'user_id' })
    }

    return NextResponse.json({ count: rows.length, records: rows })
  } catch (e: any) {
    console.error('discover error', e)
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 })
  }
}


