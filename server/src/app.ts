/* The server in front of the hub and the division projects (migration plan stages H2 to H6). Built from its parts so
   tests can hand it a stand-in for the hub and the division projects. Every route is under /api. The browser keeps
   Supabase only for sign-in; everything else goes through here, with the person's own token. */
import type { Context } from 'hono';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { ZodError } from 'zod';
import type { Config, Env } from './config.ts';
import { GatewayError, HttpError, type HttpStatus } from './lib/errors.ts';
import type { HubGateway } from './lib/hub/gateway.ts';
import type { SpokeGateway } from './lib/spoke/gateway.ts';
import { bearerToken, resolvePrincipal, type Principal } from './lib/auth/principal.ts';
import {
  RULES,
  clientAddress,
  createMemoryLimiter,
  limitBy,
  recordRefusal,
  refuseIfBlocked,
  type RateLimiter,
} from './lib/ratelimit.ts';
import { healthRoute } from './routes/health.ts';
import { cronRoute } from './routes/cron.ts';
import { meRoute } from './routes/me.ts';
import { workspaceRoute } from './routes/workspace.ts';
import { changesRoute } from './routes/changes.ts';
import { auditRoute } from './routes/audit.ts';

export interface AppDeps {
  config: Pick<Config, 'corsOrigin' | 'cronSecret'> & { clientIpHeader?: string };
  hub: HubGateway;
  spokes: SpokeGateway;
  /** Where the division settings are read from (tests pass their own). */
  env?: Env;
  /** Counts requests for the rate limits. Memory of this process by default; give it a shared store when several instances run. */
  limiter?: RateLimiter;
}

export interface AppEnv {
  Variables: { principal: Principal; token: string };
}

/** A refusal for the client: a short code, never a message from the database. */
function describe(err: unknown): { status: HttpStatus; code: string } {
  if (err instanceof HttpError) return { status: err.status, code: err.code };
  if (err instanceof ZodError) return { status: 400, code: 'invalid_input' };
  if (err instanceof GatewayError) {
    if (err.code === '42501') return { status: 403, code: 'forbidden' };
    if (err.code === '22023') return { status: 400, code: 'invalid_input' };
  }
  return { status: 500, code: 'internal_error' };
}

export function createApp(deps: AppDeps) {
  const env = deps.env ?? process.env;
  const limiter = deps.limiter ?? createMemoryLimiter();
  const ipHeader = deps.config.clientIpHeader ?? 'x-forwarded-for';
  const app = new Hono<AppEnv>().basePath('/api');

  app.use('*', secureHeaders());
  app.use('*', async (c, next) => {
    await next();
    c.header('Cache-Control', 'no-store');
  });
  if (deps.config.corsOrigin) {
    app.use('*', cors({ origin: deps.config.corsOrigin, allowHeaders: ['Authorization', 'Content-Type'], allowMethods: ['GET', 'POST', 'OPTIONS'] }));
  }
  app.use('*', bodyLimit({ maxSize: 4 * 1024 * 1024, onError: (c) => c.json({ error: 'payload_too_large' }, 413) }));

  app.onError((err, c) => {
    const { status, code } = describe(err);
    // Detail stays in the server log. The client gets the code only.
    if (status === 500) console.error(err);
    if (err instanceof HttpError && err.retryAfter !== undefined) c.header('Retry-After', String(err.retryAfter));
    return c.json({ error: code }, status);
  });
  app.notFound((c) => c.json({ error: 'not_found' }, 404));

  // Open: configuration only, no data and no URLs.
  app.route('/health', healthRoute(env));
  // The scheduled job: its own secret instead of a person's token.
  app.route('/cron', cronRoute(deps.hub, deps.spokes, env, deps.config, limiter, ipHeader));

  // Everything below needs a person: the token is checked with the hub, the role is read from the hub.
  // Addresses that keep presenting tokens that do not check out are slowed down; legitimate users are never counted.
  const signedIn = new Hono<AppEnv>();
  signedIn.use('*', async (c, next) => {
    const address = clientAddress(c, ipHeader);
    await refuseIfBlocked(limiter, address);
    const token = bearerToken(c.req.header('Authorization'));
    try {
      c.set('principal', await resolvePrincipal(deps.hub, token));
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) await recordRefusal(limiter, address);
      throw err;
    }
    c.set('token', token ?? '');
    await next();
  });
  const perPerson = (name: string) => (c: Context<AppEnv>) => `${name}:${c.get('principal').authUserId}`;
  signedIn.use('/workspace', limitBy(limiter, RULES.workspace, perPerson('workspace')));
  signedIn.use('/changes', limitBy(limiter, RULES.changes, perPerson('changes')));
  signedIn.use('/audit', limitBy(limiter, RULES.audit, perPerson('audit')));
  signedIn.route('/me', meRoute(deps.hub, env));
  signedIn.route('/workspace', workspaceRoute(deps.hub, deps.spokes, env));
  signedIn.route('/changes', changesRoute(deps.hub, deps.spokes, env));
  signedIn.route('/audit', auditRoute(deps.hub));
  app.route('/', signedIn);

  return app;
}
