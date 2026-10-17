import { createHash, timingSafeEqual } from 'node:crypto';
import { Hono } from 'hono';
import type { Config, Env } from '../config.ts';
import { HttpError } from '../lib/errors.ts';
import type { HubGateway } from '../lib/hub/gateway.ts';
import { runKeepAlive } from '../lib/cron/keepalive.ts';
import { clientAddress, recordRefusal, refuseIfBlocked, type RateLimiter } from '../lib/ratelimit.ts';
import type { SpokeGateway } from '../lib/spoke/gateway.ts';

/** Compares in constant time, so the answer does not reveal how much of the secret matched. */
function sameSecret(header: string | undefined, secret: string): boolean {
  const digest = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(digest(header ?? ''), digest(`Bearer ${secret}`));
}

/* GET /api/cron/ping  (Authorization: Bearer <CRON_SECRET>). Keeps the free projects awake and refreshes
   division_progress; see lib/cron/keepalive.ts. Switched off (503) while CRON_SECRET is not set. The answer is 200 with
   `ok: false` when something did not answer, so the scheduler can alert on the body. */
export function cronRoute(
  hub: HubGateway,
  spokes: SpokeGateway,
  env: Env,
  config: Pick<Config, 'cronSecret'>,
  limiter: RateLimiter,
  ipHeader = 'x-forwarded-for',
) {
  return new Hono().get('/ping', async (c) => {
    const secret = config.cronSecret;
    if (!secret) throw new HttpError(503, 'cron_disabled');
    const address = clientAddress(c, ipHeader);
    await refuseIfBlocked(limiter, address);
    if (!sameSecret(c.req.header('Authorization'), secret)) {
      await recordRefusal(limiter, address);
      throw new HttpError(401, 'unauthorized');
    }
    return c.json(await runKeepAlive(hub, spokes, env));
  });
}
