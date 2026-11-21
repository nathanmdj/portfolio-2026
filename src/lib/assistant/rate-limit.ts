/**
 * Sliding-window request limits for the assistant endpoints.
 *
 * This is best-effort protection, not a guarantee: the counters live in the
 * memory of one server instance, so each serverless instance or replica keeps
 * its own budgets and a cold start resets them. With no trusted proxy in
 * front, every address header is the client's to set, and only the site-wide
 * budget still applies. For a hard ceiling, set a spend limit on the API key's
 * workspace and put a shared store (or the platform's firewall rules) in
 * front of these routes as well.
 */

export type RateBudget = {
  limit: number;
  windowMs: number;
};

export type RateDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = {
  check: (key: string, now?: number) => RateDecision;
};

/** Upper bound on tracked clients; the least recently seen are dropped first. */
const MAX_TRACKED_CLIENTS = 5_000;

export function createRateLimiter(
  budget: RateBudget,
  maxKeys: number = MAX_TRACKED_CLIENTS,
): RateLimiter {
  // Map iteration follows insertion order, and every check re-inserts its key,
  // so the first entries are always the clients seen least recently.
  const hits = new Map<string, number[]>();

  function evictOldest() {
    for (const key of hits.keys()) {
      if (hits.size <= maxKeys) return;
      hits.delete(key);
    }
  }

  return {
    check(key, now = Date.now()) {
      const windowStart = now - budget.windowMs;
      const recent = (hits.get(key) ?? []).filter((time) => time > windowStart);
      hits.delete(key);

      if (recent.length >= budget.limit) {
        hits.set(key, recent);
        const retryAfterMs = recent[0] + budget.windowMs - now;
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
      }

      recent.push(now);
      hits.set(key, recent);
      evictOldest();
      return { allowed: true };
    },
  };
}

/**
 * Two budgets per route: one per client address, and one for the whole site
 * that still holds when a client manages to look like many addresses.
 */
export type RouteLimits = {
  perClient: RateLimiter;
  siteWide: RateLimiter;
};

const SITE_WIDE_KEY = "all";

/** Checks the caller's own budget first, so a blocked client does not spend the site's. */
export function checkRouteLimits(limits: RouteLimits, clientKey: string): RateDecision {
  const own = limits.perClient.check(clientKey);
  return own.allowed ? limits.siteWide.check(SITE_WIDE_KEY) : own;
}

/** Chat turns are cheap and come in bursts while someone explores the profile. */
export const chatLimits: RouteLimits = {
  perClient: createRateLimiter({ limit: 20, windowMs: 5 * 60_000 }),
  siteWide: createRateLimiter({ limit: 300, windowMs: 60 * 60_000 }, 1),
};

/** Fit checks run a larger model over a long input, so the budgets are tighter. */
export const fitLimits: RouteLimits = {
  perClient: createRateLimiter({ limit: 5, windowMs: 10 * 60_000 }),
  siteWide: createRateLimiter({ limit: 40, windowMs: 60 * 60_000 }, 1),
};

/** Headers the hosting platform sets itself and a client cannot override. */
const PLATFORM_IP_HEADERS = ["x-vercel-forwarded-for", "x-real-ip"];

/**
 * The address to count a request against. A platform header wins when there
 * is one. Otherwise the last x-forwarded-for entry is used: it is the one the
 * nearest proxy appended, whereas the first entries are whatever the client
 * sent. Behind several proxies that is a proxy address, which makes clients
 * share a budget rather than letting any of them pick their own key.
 */
export function clientIp(request: Request): string {
  for (const header of PLATFORM_IP_HEADERS) {
    const value = request.headers.get(header)?.split(",")[0]?.trim();
    if (value) return value;
  }
  const forwarded = request.headers.get("x-forwarded-for")?.split(",") ?? [];
  return forwarded[forwarded.length - 1]?.trim() || "unknown";
}
