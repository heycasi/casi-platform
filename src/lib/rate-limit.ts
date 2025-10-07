// Simple in-memory rate limiter for API routes
// For production, consider Redis-based solution like Upstash

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export class RateLimiter {
  private interval: number
  private uniqueTokenPerInterval: number

  constructor(config: RateLimitConfig) {
    this.interval = config.interval
    this.uniqueTokenPerInterval = config.uniqueTokenPerInterval
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now()
    const key = `rate_limit:${identifier}`

    if (!store[key] || store[key].resetTime < now) {
      // Create new or reset expired entry
      store[key] = {
        count: 1,
        resetTime: now + this.interval
      }

      return {
        success: true,
        remaining: this.uniqueTokenPerInterval - 1,
        reset: store[key].resetTime
      }
    }

    // Increment count
    store[key].count++

    if (store[key].count > this.uniqueTokenPerInterval) {
      return {
        success: false,
        remaining: 0,
        reset: store[key].resetTime
      }
    }

    return {
      success: true,
      remaining: this.uniqueTokenPerInterval - store[key].count,
      reset: store[key].resetTime
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // Strict for auth endpoints - 5 requests per minute
  auth: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 5
  }),

  // Moderate for payment endpoints - 10 requests per minute
  payment: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 10
  }),

  // Generous for general API - 30 requests per minute
  api: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 30
  }),

  // Very strict for report generation - 3 per hour
  report: new RateLimiter({
    interval: 60 * 60 * 1000,
    uniqueTokenPerInterval: 3
  })
}

// Helper to get client identifier from request
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown'

  return ip
}
