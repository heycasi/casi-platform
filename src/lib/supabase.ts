// src/lib/supabase.ts - Supabase Client Configuration
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Database type definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          twitch_user_id?: string
          twitch_username?: string
          display_name?: string
          avatar_url?: string
          created_at: string
          last_active: string
          status: 'active' | 'suspended' | 'cancelled'
          metadata: Record<string, any>
        }
        Insert: {
          id?: string
          email: string
          twitch_user_id?: string
          twitch_username?: string
          display_name?: string
          avatar_url?: string
          created_at?: string
          last_active?: string
          status?: 'active' | 'suspended' | 'cancelled'
          metadata?: Record<string, any>
        }
        Update: {
          email?: string
          twitch_user_id?: string
          twitch_username?: string
          display_name?: string
          avatar_url?: string
          last_active?: string
          status?: 'active' | 'suspended' | 'cancelled'
          metadata?: Record<string, any>
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'creator' | 'pro' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete'
          stripe_subscription_id?: string
          stripe_customer_id?: string
          viewer_limit: number
          current_period_start?: string
          current_period_end?: string
          trial_end?: string
          created_at: string
          updated_at: string
          metadata: Record<string, any>
        }
        Insert: {
          id?: string
          user_id: string
          tier: 'creator' | 'pro' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete'
          stripe_subscription_id?: string
          stripe_customer_id?: string
          viewer_limit: number
          current_period_start?: string
          current_period_end?: string
          trial_end?: string
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any>
        }
        Update: {
          tier?: 'creator' | 'pro' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete'
          stripe_subscription_id?: string
          stripe_customer_id?: string
          viewer_limit?: number
          current_period_start?: string
          current_period_end?: string
          trial_end?: string
          updated_at?: string
          metadata?: Record<string, any>
        }
      }
      stream_sessions: {
        Row: {
          id: string
          user_id: string
          channel_name: string
          started_at: string
          ended_at?: string
          peak_viewers: number
          total_messages: number
          total_questions: number
          avg_sentiment: number
          languages_detected: string[]
          session_data: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          channel_name: string
          started_at?: string
          ended_at?: string
          peak_viewers?: number
          total_messages?: number
          total_questions?: number
          avg_sentiment?: number
          languages_detected?: string[]
          session_data?: Record<string, any>
          created_at?: string
        }
        Update: {
          channel_name?: string
          ended_at?: string
          peak_viewers?: number
          total_messages?: number
          total_questions?: number
          avg_sentiment?: number
          languages_detected?: string[]
          session_data?: Record<string, any>
        }
      }
      pricing_tiers: {
        Row: {
          id: string
          name: string
          description?: string
          price_monthly: number
          price_yearly?: number
          viewer_limit: number
          stripe_price_id_monthly?: string
          stripe_price_id_yearly?: string
          features: Record<string, any>
          is_active: boolean
          created_at: string
        }
      }
    }
  }
}

// Environment variables validation
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Client-side Supabase client
export const createClientSupabase = () =>
  createClientComponentClient<Database>()

// Server-side Supabase client
export const createServerSupabase = () =>
  createServerComponentClient<Database>({ cookies })

// Service role client (for server-side operations)
export const createServiceSupabase = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
  }
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Default client for client components
export const supabase = createClientSupabase()

// Utility functions
export const supabaseHelpers = {
  // Get user's current subscription
  async getCurrentSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        pricing_tiers (
          name,
          price_monthly,
          features
        )
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return { data, error }
  },

  // Check if user can stream (within viewer limits)
  async canUserStream(userId: string, currentViewers: number) {
    const { data: subscription, error } = await this.getCurrentSubscription(userId)
    
    if (error || !subscription) {
      return { canStream: false, reason: 'No active subscription' }
    }

    // -1 means unlimited (enterprise)
    if (subscription.viewer_limit === -1) {
      return { canStream: true, reason: 'Unlimited plan' }
    }

    if (currentViewers <= subscription.viewer_limit) {
      return { canStream: true, reason: 'Within limits' }
    }

    return { 
      canStream: false, 
      reason: `Viewer limit exceeded (${currentViewers}/${subscription.viewer_limit})`,
      subscription 
    }
  },

  // Track stream session
  async createStreamSession(userId: string, channelName: string) {
    const { data, error } = await supabase
      .from('stream_sessions')
      .insert({
        user_id: userId,
        channel_name: channelName,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  // End stream session
  async endStreamSession(sessionId: string, finalStats: {
    peak_viewers?: number
    total_messages?: number
    total_questions?: number
    avg_sentiment?: number
  }) {
    const { data, error } = await supabase
      .from('stream_sessions')
      .update({
        ended_at: new Date().toISOString(),
        ...finalStats
      })
      .eq('id', sessionId)
      .select()
      .single()

    return { data, error }
  },

  // Log chat message for analysis
  async logChatMessage(sessionId: string, message: {
    username: string
    message: string
    is_question?: boolean
    sentiment?: number
    priority?: 'low' | 'medium' | 'high'
    language?: string
  }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        ...message,
        timestamp: new Date().toISOString()
      })

    return { data, error }
  },

  // Get user analytics
  async getUserAnalytics(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    return { data, error }
  }
}
