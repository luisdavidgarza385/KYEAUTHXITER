/**
 * In-memory rate limiter using globalThis for persistence across hot reloads.
 * For production with multiple instances, replace with Redis (Upstash).
 */

interface RateEntry {
  count: number;
  resetAt: number;
  blocked: boolean;
  blockUntil: number;
}

const KEY = "__securex_rate_limit__";
if (!(globalThis as any)[KEY]) {
  (globalThis as any)[KEY] = new Map<string, RateEntry>();
}
const store: Map<string, RateEntry> = (globalThis as any)[KEY];

// Clean up old entries every 5 minutes
if (!(globalThis as any).__rl_cleanup__) {
  (globalThis as any).__rl_cleanup__ = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt && now > entry.blockUntil) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
  /** Block duration in seconds after exceeding limit */
  blockSec: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Check rate limit for a given key (e.g. IP address + route).
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // ─── Currently hard-blocked ───
  if (entry?.blocked && now < entry.blockUntil) {
    const retryAfterSec = Math.ceil((entry.blockUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  // ─── Window expired or no entry → fresh start ───
  if (!entry || now > entry.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSec * 1000,
      blocked: false,
      blockUntil: 0,
    });
    return { allowed: true, remaining: config.limit - 1, retryAfterSec: 0 };
  }

  // ─── Increment count ───
  entry.count += 1;

  if (entry.count > config.limit) {
    entry.blocked = true;
    entry.blockUntil = now + config.blockSec * 1000;
    store.set(key, entry);
    return { allowed: false, remaining: 0, retryAfterSec: config.blockSec };
  }

  store.set(key, entry);
  return { allowed: true, remaining: config.limit - entry.count, retryAfterSec: 0 };
}

// ─── Preset configs ───

/** Strict: login / forgot-password brute force protection */
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  limit: 8,
  windowSec: 60,
  blockSec: 15 * 60, // 15 min block after 8 failed attempts
};

/** Register: prevent spam account creation */
export const REGISTER_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowSec: 60,
  blockSec: 30 * 60, // 30 min block
};

/** General API: prevent data scraping */
export const API_RATE_LIMIT: RateLimitConfig = {
  limit: 60,
  windowSec: 60,
  blockSec: 5 * 60,
};

/** PayPal: prevent order spam */
export const PAYPAL_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowSec: 60,
  blockSec: 10 * 60,
};
