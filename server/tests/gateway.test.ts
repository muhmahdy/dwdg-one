/* The real gateway (supabase-js) against a small HTTP stand-in for Supabase Auth and PostgREST. It proves what the unit
   tests with a fake gateway cannot: which endpoints are called, and above all WHOSE key goes with each call. */
import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.ts';
import { createHubGateway } from '../src/lib/hub/gateway.ts';
import { fakeSpokes } from './helpers.ts';

interface Seen {
  method: string;
  url: string;
  authorization: string | undefined;
  apikey: string | undefined;
  accept: string | undefined;
  body: string;
}

const PUBLISHABLE = 'pk-public';
const SERVICE = 'sk-service-role';
const seen: Seen[] = [];
let server: Server;
let baseUrl = '';
let personRow: object | null;
/** The method of the request being answered (the stand-in answers one at a time). */
let lastMethod = '';
const req = (_url: string) => lastMethod;
let rpcError: { code: string; message: string } | null;

const read = (req: IncomingMessage) =>
  new Promise<string>((resolve) => {
    let b = '';
    req.on('data', (d: Buffer) => {
      b += d.toString();
    });
    req.on('end', () => {
      resolve(b);
    });
  });

/** Tasks the stand-in "holds": per division, [total, done]. A count query reads them from the filter in the URL. */
const TASKS: Record<string, [number, number]> = { ee: [7, 3], hr: [0, 0], sng: [2, 2] };

/** What the stand-in answers for a request: [status, JSON body, extra headers]. */
function answer(url: string, authorization: string | undefined): [number, unknown, Record<string, string>?] {
  if (url.startsWith('/rest/v1/tasks')) {
    const query = decodeURIComponent(url);
    const division = /div=eq\.(\w+)/.exec(query)?.[1] ?? '';
    const [total, done] = TASKS[division] ?? [0, 0];
    const n = query.includes('status=eq.done') ? done : total;
    return [200, undefined, { 'Content-Range': n === 0 ? '*/0' : `0-${n - 1}/${n}` }];
  }
  if (url.startsWith('/rest/v1/division_progress')) return [201, undefined];
  if (url.startsWith('/auth/v1/user')) {
    return authorization === 'Bearer good-token'
      ? [200, { id: 'auth-1', aud: 'authenticated', email: 'mem@dwdg.test', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }]
      : [401, { code: 401, error_code: 'bad_jwt', msg: 'invalid JWT' }];
  }
  // PostgREST answers a GET with a list; supabase-js maybeSingle() turns [] into null and [row] into the row.
  if (url.startsWith('/rest/v1/people')) return [200, personRow ? [personRow] : []];
  if (url.startsWith('/rest/v1/projects')) return [200, [{ id: 'p_led' }]];
  if (url.startsWith('/rest/v1/divisions')) return [200, [{ id: 'ee', is_active: true, is_sensitive: false }, { id: 'hr', is_active: false, is_sensitive: true }, { id: 'zz', is_active: true, is_sensitive: true }]];
  if (url.startsWith('/rest/v1/rpc/load_workspace')) return [200, { tasks: [{ id: 't1', pos: 0, doc: { id: 't1' } }] }];
  if (url.startsWith('/rest/v1/rpc/apply_changes')) return rpcError ? [403, rpcError] : [200, { tasks: { upserted: 1, deleted: 0 } }];
  if (url.startsWith('/rest/v1/audit_log')) return req(url) === 'GET' ? [200, [{ id: 9, at: '2026-10-17T00:00:00Z', person_id: 'adm', division_id: 'hr', action: 'x', detail: null }]] : [201, undefined];
  return [404, { message: 'nope' }];
}

beforeAll(async () => {
  server = createServer((req, res) => {
    void read(req).then((body) => {
      const url = req.url ?? '';
      seen.push({
        method: req.method ?? '',
        url,
        authorization: req.headers.authorization,
        apikey: req.headers.apikey as string | undefined,
        accept: req.headers.accept,
        body,
      });
      lastMethod = req.method ?? '';
      const [status, payload, headers] = answer(url, req.headers.authorization);
      res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
      res.end(payload === undefined ? '' : JSON.stringify(payload));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => {
  server.close();
});
beforeEach(() => {
  seen.length = 0;
  personRow = { id: 'mem_ee', role: 'member', div: 'ee', status: 'active', is_admin: false };
  rpcError = null;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

const gateway = () => createHubGateway({ hubUrl: baseUrl, hubPublishableKey: PUBLISHABLE, hubServiceKey: SERVICE, port: 0, corsOrigin: undefined, cronSecret: undefined, clientIpHeader: 'x-forwarded-for' });

describe('hub gateway', () => {
  it('checks the token with the Auth service and accepts only a genuine one', async () => {
    const hub = gateway();
    expect(await hub.verifyToken('good-token')).toEqual({ id: 'auth-1', email: 'mem@dwdg.test' });
    expect(await hub.verifyToken('forged')).toBeNull();
  });

  it("reads the person AS the person: their token as Authorization, the publishable key as apikey, never the service key", async () => {
    const person = await gateway().findPerson('good-token', 'auth-1');
    expect(person).toEqual({ id: 'mem_ee', role: 'member', div: 'ee', status: 'active', isAdmin: false });
    const call = seen.find((s) => s.url.startsWith('/rest/v1/people'));
    expect(call?.authorization).toBe('Bearer good-token');
    expect(call?.apikey).toBe(PUBLISHABLE);
    expect(call?.url).toContain('auth_user_id=eq.auth-1');
  });

  it('returns null for a sign-in with no person yet', async () => {
    personRow = null;
    expect(await gateway().findPerson('good-token', 'auth-1')).toBeNull();
  });

  it('lists the projects a person leads, as the person', async () => {
    expect([...(await gateway().ledProjects('good-token', 'mem_ee'))]).toEqual(['p_led']);
    const call = seen.find((s) => s.url.startsWith('/rest/v1/projects'));
    expect(call?.authorization).toBe('Bearer good-token');
    expect(decodeURIComponent(call?.url ?? '')).toContain('or=(lead.eq.mem_ee,pm.eq.mem_ee)');
  });

  it('reads which divisions are switched on and which hold personal data, ignoring ids that are not divisions', async () => {
    const flags = await gateway().divisionFlags('good-token');
    expect([...flags.active]).toEqual(['ee']);
    expect([...flags.sensitive]).toEqual(['hr']);
  });

  it('loads and saves through the hub functions as the person, with the payload as text', async () => {
    const hub = gateway();
    expect(await hub.loadWorkspace('good-token')).toMatchObject({ tasks: [{ id: 't1' }] });
    await hub.applyChanges('good-token', '{"tasks":{"upsert":[]}}');
    const load = seen.find((s) => s.url.includes('rpc/load_workspace'));
    const save = seen.find((s) => s.url.includes('rpc/apply_changes'));
    expect(load?.authorization).toBe('Bearer good-token');
    expect(save?.authorization).toBe('Bearer good-token');
    expect(JSON.parse(save?.body ?? '')).toEqual({ p: '{"tasks":{"upsert":[]}}' });
  });

  it('surfaces a refusal from the hub with its Postgres code', async () => {
    rpcError = { code: '42501', message: 'Not allowed to delete 1 row(s) of projects' };
    await expect(gateway().applyChanges('good-token', '{}')).rejects.toMatchObject({ code: '42501' });
  });

  it('writes the audit log with the service key, and only that', async () => {
    await gateway().audit({ personId: 'mem_ee', divisionId: 'fnl', action: 'access.sensitive', detail: { min: 'viewer' } });
    const call = seen.find((s) => s.url.startsWith('/rest/v1/audit_log'));
    expect(call?.authorization).toBe(`Bearer ${SERVICE}`);
    expect(JSON.parse(call?.body ?? '')).toEqual({ person_id: 'mem_ee', division_id: 'fnl', action: 'access.sensitive', detail: { min: 'viewer' } });
    // and the person's calls never carried it
    expect(seen.filter((s) => !s.url.startsWith('/rest/v1/audit_log')).every((s) => s.authorization !== `Bearer ${SERVICE}`)).toBe(true);
  });
});

describe('hub gateway: progress, audit and people', () => {
  it('counts open and finished tasks of every division, trashed ones left out, with the service key', async () => {
    const counts = await gateway().taskCounts();
    expect(counts).toMatchObject({ ee: { total: 7, done: 3 }, hr: { total: 0, done: 0 }, sng: { total: 2, done: 2 }, cons: { total: 0, done: 0 } });
    const calls = seen.filter((s) => s.url.startsWith('/rest/v1/tasks'));
    expect(calls).toHaveLength(12);
    expect(calls.every((c) => c.method === 'HEAD' && c.authorization === `Bearer ${SERVICE}`)).toBe(true);
    expect(decodeURIComponent(calls[0]?.url ?? '')).toContain('or=(trashed.is.null,trashed.eq.false)');
  });

  it('saves progress lines as an upsert on the division, leaving out the columns it was not given', async () => {
    await gateway().saveProgress([{ division_id: 'ee', total_items: 7, done_items: 3, last_error: null }, { division_id: 'hr', last_error: 'unreachable' }]);
    const call = seen.find((s) => s.url.startsWith('/rest/v1/division_progress'));
    expect(call?.method).toBe('POST');
    expect(call?.url).toContain('on_conflict=division_id');
    expect(call?.authorization).toBe(`Bearer ${SERVICE}`);
    expect(JSON.parse(call?.body ?? '')).toEqual([{ division_id: 'ee', total_items: 7, done_items: 3, last_error: null }, { division_id: 'hr', last_error: 'unreachable' }]);
  });

  it('reads the newest audit lines, optionally for one division, with the service key', async () => {
    const rows = await gateway().readAudit({ limit: 20, division: 'hr' });
    expect(rows).toHaveLength(1);
    const url = decodeURIComponent(seen.find((s) => s.url.startsWith('/rest/v1/audit_log'))?.url ?? '');
    expect(url).toContain('order=at.desc');
    expect(url).toContain('limit=20');
    expect(url).toContain('division_id=eq.hr');
    expect(seen.find((s) => s.url.startsWith('/rest/v1/audit_log'))?.authorization).toBe(`Bearer ${SERVICE}`);
  });

  it('reads stored people as the person, a hundred ids at a time', async () => {
    const ids = Array.from({ length: 230 }, (_, i) => `p${i}`);
    await gateway().peopleByIds('good-token', ids);
    const calls = seen.filter((s) => s.url.startsWith('/rest/v1/people'));
    expect(calls).toHaveLength(3);
    expect(calls.every((c) => c.authorization === 'Bearer good-token')).toBe(true);
    expect(decodeURIComponent(calls[2]?.url ?? '')).toContain('id=in.(p200');
  });
});

describe('whole server on the real gateway', () => {
  it('serves /api/workspace and /api/changes for a signed-in person, with only that person\'s token reaching the hub', async () => {
    const config = { hubUrl: baseUrl, hubPublishableKey: PUBLISHABLE, hubServiceKey: SERVICE, port: 0, corsOrigin: undefined, cronSecret: undefined, clientIpHeader: 'x-forwarded-for' };
    const app = createApp({ config, hub: createHubGateway(config), spokes: fakeSpokes(), env: {} });
    const headers = { Authorization: 'Bearer good-token', 'Content-Type': 'application/json' };

    const ws = await app.request('/api/workspace', { headers });
    expect(ws.status).toBe(200);
    expect(await ws.json()).toMatchObject({ rows: { tasks: [{ id: 't1' }] }, divisions: { ee: 'not_configured' } });

    const doc = { zeta: 1, alpha: 2, id: 't1' };
    const save = await app.request('/api/changes', { method: 'POST', headers, body: JSON.stringify({ changes: { tasks: { upsert: [{ id: 't1', pos: 0, doc }] } } }) });
    expect(save.status).toBe(200);
    const sent = JSON.parse(seen.find((s) => s.url.includes('rpc/apply_changes'))?.body ?? '') as { p: string };
    expect(sent.p).toContain(JSON.stringify(doc));

    expect((await app.request('/api/workspace', { headers: { Authorization: 'Bearer forged' } })).status).toBe(401);
    expect(seen.every((s) => s.authorization !== `Bearer ${SERVICE}`)).toBe(true);
  });
});
