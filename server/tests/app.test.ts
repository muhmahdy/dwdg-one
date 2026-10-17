import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.ts';
import { PERSON, fakeHub, fakeSpokes, type FakeHub } from './helpers.ts';

interface MeBody {
  linked: boolean;
  person: Record<string, unknown> | null;
  divisions: Record<string, string>;
}
interface WorkspaceBody {
  rows: Record<string, { id: string }[]>;
  divisions: Record<string, string>;
}
const json = async <T>(res: Response) => (await res.json()) as T;
const row = (id: string, doc: Record<string, unknown> = { id }) => ({ id, pos: 0, doc });
const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
const post = (app: ReturnType<typeof make>['app'], body: unknown, token = 'token-ee') =>
  app.request('/api/changes', {
    method: 'POST',
    headers: { ...auth(token), 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

function make(opts: Parameters<typeof fakeHub>[0] = {}, env: Record<string, string> = {}) {
  const hub: FakeHub = fakeHub(opts);
  const spokes = fakeSpokes();
  return { hub, spokes, app: createApp({ config: { corsOrigin: undefined, cronSecret: undefined }, hub, spokes, env }) };
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('GET /api/health', () => {
  it('needs no sign-in and reveals only which divisions are configured', async () => {
    const { app } = make({}, { SPOKE_HR_URL: 'https://secret-hr.example', SPOKE_HR_SERVICE_KEY: 'sk-secret' });
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(JSON.parse(text)).toMatchObject({ ok: true, divisions: { hr: { configured: true }, ee: { configured: false } } });
    expect(text).not.toContain('secret');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });
});

describe('sign-in gate', () => {
  it.each([['/api/me'], ['/api/workspace']])('%s refuses a request without a valid token', async (path) => {
    const { app, hub } = make();
    for (const headers of [{}, auth('forged'), { Authorization: 'Basic abc' }]) {
      const res = await app.request(path, { headers });
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'unauthenticated' });
    }
    expect(hub.calls.loads).toEqual([]);
  });

  it('refuses a save without a valid token and writes nothing', async () => {
    const { app, hub } = make();
    expect((await post(app, { changes: {} }, 'forged')).status).toBe(401);
    expect(hub.calls.applied).toEqual([]);
  });

  it('answers 404 with a plain code for an unknown path', async () => {
    const { app } = make();
    const res = await app.request('/api/nope', { headers: auth('token-ee') });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_found' });
  });
});

describe('GET /api/me', () => {
  it('returns the person as the hub knows them and the division statuses', async () => {
    const { app } = make({ active: ['sng', 'hr'] }, { SPOKE_SNG_URL: 'u', SPOKE_SNG_SERVICE_KEY: 'k', SPOKE_EE_URL: 'u', SPOKE_EE_SERVICE_KEY: 'k' });
    const body = await json<MeBody>(await app.request('/api/me', { headers: auth('token-ee') }));
    expect(body).toMatchObject({ linked: true, person: { id: 'mem_ee', role: 'member', div: 'ee', active: true, admin: false, rank: 1 } });
    // sng: configured, switched on and it has access rules, so it is served; ee: configured but not switched on; hr: switched on but no settings
    expect(body.divisions).toEqual({ ee: 'inactive', mcit: 'not_configured', hr: 'not_configured', fnl: 'not_configured', sng: 'ok', cons: 'not_configured' });
  });

  it('serves every division once it is configured and switched on, because every division has its access rules', async () => {
    const env = Object.fromEntries(['EE', 'MCIT', 'HR', 'FNL', 'SNG', 'CONS'].flatMap((d) => [[`SPOKE_${d}_URL`, 'u'], [`SPOKE_${d}_SERVICE_KEY`, 'k']]));
    const { app } = make({ active: ['ee', 'mcit', 'hr', 'fnl', 'sng', 'cons'] }, env);
    const body = await json<MeBody>(await app.request('/api/me', { headers: auth('token-ee') }));
    expect(body.divisions).toEqual({ ee: 'ok', mcit: 'ok', hr: 'ok', fnl: 'ok', sng: 'ok', cons: 'ok' });
  });

  it('says so when the sign-in is not linked to a person yet', async () => {
    const { app } = make({ tokens: { t: 'u-new' }, people: {} });
    const body = await json<MeBody>(await app.request('/api/me', { headers: auth('t') }));
    expect(body).toMatchObject({ linked: false, person: null });
  });
});

describe('GET /api/workspace', () => {
  const workspace = {
    people: [row('mem_ee')],
    tasks: [row('t1')],
    hr_assessments: [row('as1')],
    fnl_legal: [row('l1')],
    store_values: [row('lookV'), row('fnl.grants')],
  };

  it('returns the hub rows as the person (their token goes to the hub) and drops every division table', async () => {
    const { app, hub } = make({ workspace });
    const res = await app.request('/api/workspace', { headers: auth('token-ee') });
    expect(res.status).toBe(200);
    const body = await json<WorkspaceBody>(res);
    expect(Object.keys(body.rows).sort()).toEqual(['people', 'store_values', 'tasks']);
    expect(body.rows.store_values?.map((r) => r.id)).toEqual(['lookV']);
    expect(body.divisions.hr).toBe('not_configured');
    expect(hub.calls.loads).toEqual(['token-ee']);
  });

  it('refuses a sign-in that is not linked to a person', async () => {
    const { app } = make({ tokens: { t: 'u-new' }, people: {}, workspace });
    const res = await app.request('/api/workspace', { headers: auth('t') });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'not_linked' });
  });

  it('keeps record key order exactly as the hub sent it', async () => {
    const doc = { zeta: 1, alpha: [3, 2, 1], name: 'x', id: 't1' };
    const { app } = make({ workspace: { tasks: [row('t1', doc)] } });
    const text = await (await app.request('/api/workspace', { headers: auth('token-ee') })).text();
    expect(text).toContain(JSON.stringify(doc));
  });
});

describe('POST /api/changes', () => {
  it('passes a hub change set to the hub with the person\'s token, key order kept', async () => {
    const { app, hub } = make();
    const doc = { zeta: 1, alpha: 2, id: 't1', div: 'ee' };
    const res = await post(app, { changes: { tasks: { upsert: [{ id: 't1', pos: 3, doc }], delete: ['t0'] }, updates: { upsert: [row('u1')] } } });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(hub.calls.applied).toHaveLength(1);
    expect(hub.calls.applied[0]?.token).toBe('token-ee');
    const sent = hub.calls.applied[0]?.payload ?? '';
    expect(sent).toContain(JSON.stringify(doc));
    expect(JSON.parse(sent)).toEqual({ tasks: { upsert: [{ id: 't1', pos: 3, doc }], delete: ['t0'] }, updates: { upsert: [row('u1')] } });
  });

  it('refuses the WHOLE change set when it touches a division project, and writes nothing', async () => {
    const { app, hub } = make();
    const res = await post(app, { changes: { tasks: { upsert: [row('t1')] }, hr_notices: { upsert: [row('n1')] } } });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'division_unavailable' });
    expect(hub.calls.applied).toEqual([]);
    expect(hub.calls.audits[0]).toMatchObject({ personId: 'mem_ee', action: 'changes.refused', detail: { divisions: ['hr'] } });
  });

  it('routes a division stored value away from the hub too', async () => {
    const { app, hub } = make();
    const res = await post(app, { changes: { store_values: { upsert: [row('fnl.grants', { legal: [] })] } } });
    expect(res.status).toBe(409);
    expect(hub.calls.applied).toEqual([]);
  });

  it('rejects unknown tables and malformed bodies with 400 and a generic code', async () => {
    const { app, hub } = make();
    for (const body of [
      { changes: { pg_user: { delete: ['x'] } } },
      { changes: { tasks: { upsert: [{ id: 't1', pos: 0, doc: 'text' }] } } },
      { changes: { tasks: { upsert: [{ id: '', pos: 0, doc: {} }] } } },
      { changes: { tasks: { upsert: [{ id: 't1', pos: -1, doc: {} }] } } },
      { changes: { tasks: { extra: 1 } } },
      { changes: {}, more: true },
      { nothing: true },
      'not json',
    ]) {
      const res = await post(app, body);
      expect(res.status, JSON.stringify(body)).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid_input' });
    }
    expect(hub.calls.applied).toEqual([]);
  });

  it('refuses a Board account and a person who is not active, before asking the hub', async () => {
    const board = make({ tokens: { b: 'u-b' }, people: { 'u-b': PERSON({ id: 'brd', role: 'board' }) } });
    expect((await post(board.app, { changes: { tasks: { upsert: [row('t1')] } } }, 'b')).status).toBe(403);
    const pending = make({ tokens: { p: 'u-p' }, people: { 'u-p': PERSON({ status: 'pending' }) } });
    expect((await post(pending.app, { changes: { tasks: { upsert: [row('t1')] } } }, 'p')).status).toBe(403);
    expect(board.hub.calls.applied).toEqual([]);
    expect(pending.hub.calls.applied).toEqual([]);
  });

  it("turns the hub's refusal (42501) into a plain 403 and records it, without leaking the database message", async () => {
    const { app, hub } = make();
    hub.failApplyWith('42501');
    const res = await post(app, { changes: { tasks: { upsert: [row('t1')] } } });
    expect(res.status).toBe(403);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ error: 'forbidden' });
    expect(text).not.toContain('row-level security');
    expect(hub.calls.audits[0]).toMatchObject({ action: 'changes.denied', detail: { tables: ['tasks'] } });
  });

  it('answers 500 internal_error for anything else, with the detail only in the server log', async () => {
    const { app, hub } = make();
    hub.failApplyWith('XX000');
    const res = await post(app, { changes: { tasks: { upsert: [row('t1')] } } });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'internal_error' });
    expect(console.error).toHaveBeenCalled();
  });

  it('still refuses when the audit log cannot be written (an audit problem never changes the answer)', async () => {
    const { app } = make({ auditFails: true });
    const res = await post(app, { changes: { hr_notices: { upsert: [row('n1')] } } });
    expect(res.status).toBe(409);
  });

  it('refuses a body over the size limit', async () => {
    const { app, hub } = make();
    const big = 'x'.repeat(4 * 1024 * 1024 + 10);
    const res = await post(app, `{"changes":{"tasks":{"upsert":[{"id":"t","pos":0,"doc":{"a":"${big}"}}]}}}`);
    expect(res.status).toBe(413);
    expect(hub.calls.applied).toEqual([]);
  });
});

describe('CORS', () => {
  it('is off unless an origin is configured', async () => {
    const { app } = make();
    const res = await app.request('/api/health', { headers: { Origin: 'https://evil.example' } });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('allows only the configured origin', async () => {
    const hub = fakeHub();
    const app = createApp({ config: { corsOrigin: 'https://app.example', cronSecret: undefined }, hub, spokes: fakeSpokes(), env: {} });
    const ok = await app.request('/api/health', { headers: { Origin: 'https://app.example' } });
    expect(ok.headers.get('access-control-allow-origin')).toBe('https://app.example');
    const other = await app.request('/api/health', { headers: { Origin: 'https://evil.example' } });
    expect(other.headers.get('access-control-allow-origin')).not.toBe('https://evil.example');
  });
});
