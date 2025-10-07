// Input validation utilities

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Email validation
export function validateEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required')
  }

  const trimmed = email.trim().toLowerCase()

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmed)) {
    throw new ValidationError('Invalid email format')
  }

  // Check length
  if (trimmed.length > 320) {
    throw new ValidationError('Email is too long')
  }

  return trimmed
}

// Channel name validation (Twitch usernames)
export function validateChannelName(channelName: string): string {
  if (!channelName || typeof channelName !== 'string') {
    throw new ValidationError('Channel name is required')
  }

  const trimmed = channelName.trim().toLowerCase()

  // Twitch username rules: 4-25 characters, alphanumeric + underscore
  const channelRegex = /^[a-z0-9_]{4,25}$/

  if (!channelRegex.test(trimmed)) {
    throw new ValidationError(
      'Invalid channel name. Must be 4-25 characters (letters, numbers, underscore only)'
    )
  }

  return trimmed
}

// UUID validation
export function validateUUID(uuid: string): string {
  if (!uuid || typeof uuid !== 'string') {
    throw new ValidationError('UUID is required')
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(uuid)) {
    throw new ValidationError('Invalid UUID format')
  }

  return uuid
}

// Stripe price ID validation
export function validateStripePriceId(priceId: string): string {
  if (!priceId || typeof priceId !== 'string') {
    throw new ValidationError('Price ID is required')
  }

  // Stripe price IDs start with 'price_'
  if (!priceId.startsWith('price_')) {
    throw new ValidationError('Invalid Stripe price ID format')
  }

  if (priceId.length < 10 || priceId.length > 100) {
    throw new ValidationError('Invalid price ID length')
  }

  return priceId
}

// Sanitize string input (basic XSS prevention)
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
}

// Validate plan name
export function validatePlanName(planName: string): string {
  const validPlans = ['Creator', 'Pro', 'Streamer+']

  if (!validPlans.includes(planName)) {
    throw new ValidationError(`Invalid plan name. Must be one of: ${validPlans.join(', ')}`)
  }

  return planName
}

// Validate billing interval
export function validateBillingInterval(interval: string): string {
  const validIntervals = ['month', 'year']

  if (!validIntervals.includes(interval)) {
    throw new ValidationError(`Invalid billing interval. Must be one of: ${validIntervals.join(', ')}`)
  }

  return interval
}

// Validate Twitch authorization code
export function validateAuthCode(code: string): string {
  if (!code || typeof code !== 'string') {
    throw new ValidationError('Authorization code is required')
  }

  // Twitch auth codes are typically 30 characters
  if (code.length < 10 || code.length > 100) {
    throw new ValidationError('Invalid authorization code format')
  }

  // Only alphanumeric characters
  if (!/^[a-zA-Z0-9]+$/.test(code)) {
    throw new ValidationError('Invalid authorization code format')
  }

  return code
}

// Validate URL
export function validateUrl(url: string, allowedDomains?: string[]): string {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('URL is required')
  }

  try {
    const urlObj = new URL(url)

    // Only allow http/https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new ValidationError('Invalid URL protocol')
    }

    // Check allowed domains if specified
    if (allowedDomains && allowedDomains.length > 0) {
      const hostname = urlObj.hostname
      if (!allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))) {
        throw new ValidationError(`URL domain not allowed. Must be one of: ${allowedDomains.join(', ')}`)
      }
    }

    return url
  } catch (err) {
    if (err instanceof ValidationError) {
      throw err
    }
    throw new ValidationError('Invalid URL format')
  }
}

// Validate numeric ranges
export function validateNumber(
  value: any,
  min?: number,
  max?: number
): number {
  const num = Number(value)

  if (isNaN(num)) {
    throw new ValidationError('Invalid number')
  }

  if (min !== undefined && num < min) {
    throw new ValidationError(`Number must be at least ${min}`)
  }

  if (max !== undefined && num > max) {
    throw new ValidationError(`Number must be at most ${max}`)
  }

  return num
}
