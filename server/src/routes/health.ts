import { Hono } from 'hono';
import type { Env } from '../config.ts';
import { DIVISIONS, isConfigured } from '../lib/divisions/registry.ts';

/** GET /api/health: is the server up, and which division projects it has settings for. No network calls, no secrets. */
export function healthRoute(env: Env) {
  return new Hono().get('/', (c) =>
    c.json({
      ok: true,
      divisions: Object.fromEntries(DIVISIONS.map((d) => [d.slug, { configured: isConfigured(d.slug, env) }])),
    }),
  );
}
