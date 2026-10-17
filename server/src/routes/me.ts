import { Hono } from 'hono';
import type { AppEnv } from '../app.ts';
import type { Env } from '../config.ts';
import type { HubGateway } from '../lib/hub/gateway.ts';
import { divisionStatuses } from '../lib/divisions/status.ts';

/** GET /api/me: who the server believes is asking, as read from the hub, and which divisions it can serve. */
export function meRoute(hub: HubGateway, env: Env) {
  return new Hono<AppEnv>().get('/', async (c) => {
    const p = c.get('principal');
    return c.json({
      linked: p.personId !== null,
      person: p.personId && {
        id: p.personId,
        role: p.role,
        div: p.div,
        status: p.status,
        active: p.active,
        admin: p.admin,
        rank: p.rank,
      },
      divisions: await divisionStatuses(hub, c.get('token'), env),
    });
  });
}
