import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

type MemoryStore = Map<string, number[]>;

function getMemoryStore(): MemoryStore {
  const g = globalThis as unknown as { __adminLoginRateLimit?: MemoryStore };
  if (!g.__adminLoginRateLimit) {
    g.__adminLoginRateLimit = new Map();
  }
  return g.__adminLoginRateLimit;
}

function allowInMemory(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const store = getMemoryStore();
  let timestamps = store.get(ip) ?? [];
  timestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_ATTEMPTS) {
    const oldest = timestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  timestamps.push(now);
  store.set(ip, timestamps);
  return { ok: true };
}

let upstashLimiter: Ratelimit | null | undefined;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      upstashLimiter = null;
      return null;
    }
    const redis = new Redis({ url, token });
    upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS, '15 m'),
      prefix: 'ratelimit:admin-login',
    });
  }
  return upstashLimiter;
}

export type LoginRateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; source: 'memory' | 'upstash' };

/**
 * Limits login attempts per IP. Prefer Upstash when UPSTASH_* env vars are set (works across serverless instances).
 * Falls back to in-memory per instance (weaker on multi-instance; still reduces brute force).
 */
export async function checkAdminLoginRateLimit(ip: string): Promise<LoginRateLimitResult> {
  const limiter = getUpstashLimiter();
  if (limiter) {
    const { success, reset, pending } = await limiter.limit(ip);
    if (pending) {
      await pending.catch(() => undefined);
    }
    if (!success) {
      const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return { ok: false, retryAfterSec, source: 'upstash' };
    }
    return { ok: true };
  }

  const mem = allowInMemory(ip);
  if (!mem.ok) {
    return { ok: false, retryAfterSec: mem.retryAfterSec, source: 'memory' };
  }
  return { ok: true };
}
