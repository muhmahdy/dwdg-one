/* Rate limits. A limiter counts hits per key in a time window; the middleware turns "too many" into 429 `rate_limited`
   with a Retry-After. The default limiter lives in this process's memory, which is right for one server process and a
   fair brake on a serverless host only while an instance stays warm: a deployment with several instances should give
   createApp() a limiter backed by a shared store (Upstash Redis), which needs only these two methods. */
import type { Context, Env as HonoEnv, MiddlewareHandler } from 'hono';
import { HttpError } from './errors.ts';

export interface RateLimiter {
  /** Records one hit and returns how many hits the key has in the last `windowMs`. */
  hit: (key: string, windowMs: number) => Promise<number>;
  /** How many hits the key has in the last `windowMs`, without recording one. */
  count: (key: string, windowMs: number) => Promise<number>;
}

const MAX_KEYS = 20_000;

export function createMemoryLimiter(now: () => number = Date.now): RateLimiter {
  const hits = new Map<string, number[]>();
  const recent = (key: string, windowMs: number): number[] => {
    const cutoff = now() - windowMs;
    const list = (hits.get(key) ?? []).filter((t) => t > cutoff);
    if (list.length > 0) hits.set(key, list);
    else hits.delete(key);
    return list;
  };
  return {
    hit: (key, windowMs) => {
      const list = recent(key, windowMs);
      list.push(now());
      hits.set(key, list);
      // Keys come from the outside (an address per visitor): never let the table grow without bound.
      if (hits.size > MAX_KEYS) {
        const oldest = hits.keys().next().value;
        if (oldest !== undefined) hits.delete(oldest);
      }
      return Promise.resolve(list.length);
    },
    count: (key, windowMs) => Promise.resolve(recent(key, windowMs).length),
  };
}

export interface Rule {
  limit: number;
  windowMs: number;
}

/* What each kind of request may do, per person (or per address for failed sign-ins). A person using the app makes a
   request per action, a burst when they drag things around; these leave room for that and stop a script. */
export const RULES = {
  changes: { limit: 240, windowMs: 60_000 },
  workspace: { limit: 30, windowMs: 60_000 },
  audit: { limit: 30, windowMs: 60_000 },
  /** Requests with a token or secret that was refused, per address. */
  refused: { limit: 30, windowMs: 60_000 },
} satisfies Record<string, Rule>;

/* The caller's address, from the header the host in front of the server sets (CLIENT_IP_HEADER; X-Forwarded-For by default,
   where the first entry is the client). Only trust a header that the host overwrites: a visitor can send any header to a server
   that is reachable directly. It is used for one thing, the brake on refused tokens, so a forged address buys nothing more. */
export function clientAddress(c: { req: { header: (name: string) => string | undefined } }, header = 'x-forwarded-for'): string {
  const raw = c.req.header(header);
  const value = (header === 'x-forwarded-for' ? raw?.split(',')[0] : raw)?.trim();
  return value && value.length > 0 ? value : 'unknown';
}

const tooMany = (windowMs: number) => new HttpError(429, 'rate_limited', Math.ceil(windowMs / 1000));

/** Counts a hit for `key(c)` and answers 429 once the key is over the rule. */
export function limitBy<E extends HonoEnv>(limiter: RateLimiter, rule: Rule, key: (c: Context<E>) => string): MiddlewareHandler<E> {
  return async (c, next) => {
    if ((await limiter.hit(key(c), rule.windowMs)) > rule.limit) throw tooMany(rule.windowMs);
    await next();
  };
}

/* Counts only the requests that were refused (a token or secret that did not check out) and blocks an address that
   piles them up, so guessing is slowed down without penalising everyone who shares an office network. */
export async function refuseIfBlocked(limiter: RateLimiter, address: string): Promise<void> {
  if ((await limiter.count(`refused:${address}`, RULES.refused.windowMs)) >= RULES.refused.limit) throw tooMany(RULES.refused.windowMs);
}
export async function recordRefusal(limiter: RateLimiter, address: string): Promise<void> {
  await limiter.hit(`refused:${address}`, RULES.refused.windowMs);
}
