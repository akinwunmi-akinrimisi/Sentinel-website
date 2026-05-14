import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

interface RateLimitResult {
  success: boolean
  remaining: number
  retryAfterSeconds: number
}

let limiter: Ratelimit | null = null

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    // Local dev without KV — return null so callers no-op the check.
    return null
  }
  limiter = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: false,
    prefix: 'rl:proposal',
  })
  return limiter
}

/**
 * Rate-limits a request by `identifier` (typically the request IP). Returns
 * `{ success: true }` if the request is allowed, `{ success: false, retryAfterSeconds }`
 * if rejected. If Vercel KV credentials are not configured (local dev), the
 * limiter no-ops and every request is allowed — this is intentional, the
 * production environment is the only place rate limiting matters.
 */
export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const lim = getLimiter()
  if (!lim) {
    return { success: true, remaining: Number.POSITIVE_INFINITY, retryAfterSeconds: 0 }
  }

  const result = await lim.limit(identifier)
  const retryAfterSeconds = result.success
    ? 0
    : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))

  return {
    success: result.success,
    remaining: result.remaining,
    retryAfterSeconds,
  }
}
