/**
 * API Logger Utility
 *
 * Centralized logging for API events and errors across all services
 * Logs to the api_logs table for monitoring in the admin panel
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type LogLevel = 'success' | 'warning' | 'error'
export type ServiceType = 'Twitch' | 'Resend' | 'Supabase' | 'Stripe' | 'API' | 'Auth' | 'Webhook'

export interface ApiLogOptions {
  service: ServiceType
  eventType: string
  level: LogLevel
  message: string
  userEmail?: string
  userId?: string
  endpoint?: string
  statusCode?: number
  metadata?: any
}

/**
 * Log an API event or error
 *
 * @example
 * await logApiEvent({
 *   service: 'Twitch',
 *   eventType: 'oauth_callback',
 *   level: 'success',
 *   message: 'User authenticated successfully',
 *   userEmail: 'user@example.com',
 *   endpoint: '/api/auth/twitch',
 *   statusCode: 200
 * })
 */
export async function logApiEvent(options: ApiLogOptions): Promise<void> {
  try {
    const { error } = await supabase.from('api_logs').insert({
      service: options.service,
      event_type: options.eventType,
      level: options.level,
      message: options.message,
      user_email: options.userEmail || null,
      user_id: options.userId || null,
      endpoint: options.endpoint || null,
      status_code: options.statusCode || null,
      metadata: options.metadata || {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Failed to log API event:', error)
    }
  } catch (error) {
    // Don't throw - logging failures shouldn't break the application
    console.error('Error in logApiEvent:', error)
  }
}

/**
 * Log a successful API operation
 */
export async function logSuccess(
  service: ServiceType,
  eventType: string,
  message: string,
  options?: Partial<ApiLogOptions>
): Promise<void> {
  return logApiEvent({
    service,
    eventType,
    level: 'success',
    message,
    ...options,
  })
}

/**
 * Log an API warning
 */
export async function logWarning(
  service: ServiceType,
  eventType: string,
  message: string,
  options?: Partial<ApiLogOptions>
): Promise<void> {
  return logApiEvent({
    service,
    eventType,
    level: 'warning',
    message,
    ...options,
  })
}

/**
 * Log an API error
 */
export async function logError(
  service: ServiceType,
  eventType: string,
  message: string,
  options?: Partial<ApiLogOptions>
): Promise<void> {
  return logApiEvent({
    service,
    eventType,
    level: 'error',
    message,
    ...options,
  })
}

/**
 * Log errors from catch blocks with automatic error extraction
 *
 * @example
 * try {
 *   // some operation
 * } catch (error) {
 *   await logCatchError('Twitch', 'fetch_user_data', error, {
 *     userEmail: 'user@example.com',
 *     endpoint: '/api/twitch/user'
 *   })
 * }
 */
export async function logCatchError(
  service: ServiceType,
  eventType: string,
  error: any,
  options?: Partial<ApiLogOptions>
): Promise<void> {
  const errorMessage = error?.message || error?.toString() || 'Unknown error'
  const errorStack = error?.stack

  return logApiEvent({
    service,
    eventType,
    level: 'error',
    message: errorMessage,
    metadata: {
      stack: errorStack,
      error: error,
      ...options?.metadata,
    },
    ...options,
  })
}
