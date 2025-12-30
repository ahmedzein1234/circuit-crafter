import { Context, Next } from 'hono';
import type { Env } from '../types/env';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix: string;     // Prefix for KV key
  keyGenerator?: (c: Context<Env>) => string; // Custom key generator
}

interface RateLimitData {
  count: number;
  resetAt: number;
}

// Default key generator uses IP address
function defaultKeyGenerator(c: Context<Env>): string {
  // Try to get real IP from Cloudflare headers
  const cfConnectingIp = c.req.header('CF-Connecting-IP');
  const xForwardedFor = c.req.header('X-Forwarded-For');
  const xRealIp = c.req.header('X-Real-IP');

  return cfConnectingIp || xForwardedFor?.split(',')[0]?.trim() || xRealIp || 'unknown';
}

// Create rate limiter middleware factory
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyPrefix,
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async function rateLimitMiddleware(c: Context<Env>, next: Next) {
    const identifier = keyGenerator(c);
    const key = `ratelimit:${keyPrefix}:${identifier}`;

    try {
      // Get current rate limit data from KV
      const cached = await c.env.CACHE.get(key);
      const now = Date.now();

      let data: RateLimitData;

      if (cached) {
        data = JSON.parse(cached);

        // Check if window has expired
        if (now >= data.resetAt) {
          // Reset for new window
          data = {
            count: 1,
            resetAt: now + windowMs,
          };
        } else {
          // Increment count
          data.count += 1;
        }
      } else {
        // First request in this window
        data = {
          count: 1,
          resetAt: now + windowMs,
        };
      }

      // Calculate remaining requests and time
      const remaining = Math.max(0, maxRequests - data.count);
      const resetSeconds = Math.ceil((data.resetAt - now) / 1000);

      // Set rate limit headers
      c.header('X-RateLimit-Limit', String(maxRequests));
      c.header('X-RateLimit-Remaining', String(remaining));
      c.header('X-RateLimit-Reset', String(Math.ceil(data.resetAt / 1000)));

      // Check if rate limit exceeded
      if (data.count > maxRequests) {
        c.header('Retry-After', String(resetSeconds));

        return c.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again in ${resetSeconds} seconds.`,
            retryAfter: resetSeconds,
          },
          429
        );
      }

      // Update KV with new count
      const ttlSeconds = Math.ceil(windowMs / 1000);
      await c.env.CACHE.put(key, JSON.stringify(data), {
        expirationTtl: ttlSeconds,
      });

      await next();
    } catch (error) {
      // If rate limiting fails, log and allow request (fail open)
      console.error('Rate limit error:', error);
      await next();
    }
  };
}

// Pre-configured rate limiters for common use cases

// Strict rate limiter for auth endpoints (5 requests per minute)
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 5,
  keyPrefix: 'auth',
});

// General API rate limiter (100 requests per minute)
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 100,
  keyPrefix: 'api',
});

// Strict rate limiter for password reset (3 requests per hour)
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  keyPrefix: 'password-reset',
});

// User-specific rate limiter (uses user ID instead of IP)
export function createUserRateLimiter(windowMs: number, maxRequests: number) {
  return createRateLimiter({
    windowMs,
    maxRequests,
    keyPrefix: 'user',
    keyGenerator: (c: Context<Env>) => {
      const user = c.get('user');
      return user?.id || defaultKeyGenerator(c);
    },
  });
}

// Circuit creation rate limiter (10 per hour per user)
export const circuitCreationRateLimiter = createUserRateLimiter(
  60 * 60 * 1000,  // 1 hour
  10
);

// Comment rate limiter (20 per minute per user)
export const commentRateLimiter = createUserRateLimiter(
  60 * 1000,       // 1 minute
  20
);
