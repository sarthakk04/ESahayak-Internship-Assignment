// utils/rateLimiter.ts
type RateLimitRecord = {
  [key: string]: {
    count: number;
    lastReset: number;
  };
};

// Config
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // max 10 requests per user per window

const store: RateLimitRecord = {};

/**
 * Checks if a key (userId or IP) is allowed to proceed.
 * Returns true if allowed, false if rate limit exceeded.
 */
export function rateLimit(key: string): boolean {
  const now = Date.now();
  if (!store[key]) {
    store[key] = { count: 1, lastReset: now };
    return true;
  }

  const record = store[key];
  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    // Reset the window
    record.count = 1;
    record.lastReset = now;
    return true;
  }

  if (record.count < MAX_REQUESTS) {
    record.count++;
    return true;
  }

  return false; // limit exceeded
}
