/**
 * Simple in-memory rate limiter for API routes
 *
 * For production with multiple instances, use a distributed rate limiter like:
 * - @upstash/ratelimit with Redis
 * - rate-limiter-flexible with Redis/Memcached
 *
 * This implementation is suitable for single-instance deployments.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  })
}, 5 * 60 * 1000)

interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = identifier

  let entry = rateLimitStore.get(key)

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  // Check if over limit
  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP from request headers
 * Works with Vercel, Cloudflare, and standard proxies
 */
export function getClientIp(request: Request): string {
  const headers = request.headers

  // Vercel
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Real IP header
  const xRealIp = headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp
  }

  return 'unknown'
}

/**
 * Create a rate-limited response with proper headers
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetTime.toString(),
        'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
      },
    }
  )
}

// Preset configurations for common use cases
export const RateLimitPresets = {
  /** Strict: 5 requests per minute (for sensitive operations like password reset) */
  strict: { limit: 5, windowSeconds: 60 },
  /** Standard: 20 requests per minute (for normal API operations) */
  standard: { limit: 20, windowSeconds: 60 },
  /** Relaxed: 100 requests per minute (for read-heavy operations) */
  relaxed: { limit: 100, windowSeconds: 60 },
  /** Login: 10 attempts per 15 minutes */
  login: { limit: 10, windowSeconds: 900 },
  /** Impersonate: 5 requests per minute */
  impersonate: { limit: 5, windowSeconds: 60 },
} as const
