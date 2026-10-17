import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.ts';
import { RULES } from '../src/lib/ratelimit.ts';
import { runKeepAlive } from '../src/lib/cron/keepalive.ts';
import { fakeHub, fakeSpokes } from './helpers.ts';

const SECRET = 'cron-secret-value';
const ENV = { SPOKE_SNG_URL: 'u', SPOKE_SNG_SERVICE_KEY: 'k', SPOKE_HR_URL: 'u', SPOKE_HR_SERVICE_KEY: 'k' };
const TASKS: Record<string, [number, number]> = { ee: [10, 4], mcit: [0, 0], hr: [5, 5], fnl: [2, 1], sng: [8, 2], cons: [3, 0] };

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

function make(opts: Parameters<typeof fakeHub>[0] = {}, config: { cronSecret: string | undefined } = { cronSecret: SECRET }) {
  const hub = fakeHub({ tasks: TASKS, ...opts });
  const spokes = fakeSpokes();
  const app = createApp({ config: { corsOrigin: undefined, ...config }, hub, spokes, env: ENV });
  const ping = (auth?: string, address?: string) =>
    app.request('/api/cron/ping', { headers: { ...(auth ? { Authorization: auth } : {}), ...(address ? { 'X-Forwarded-For': address } : {}) } });
  return { hub, spokes, app, ping };
}

describe('GET /api/cron/ping: who may call it', () => {
  it('is switched off while no secret is set', async () => {
    const { ping } = make({}, { cronSecret: undefined });
    const res = await ping(`Bearer ${SECRET}`);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'cron_disabled' });
  });

  it.each([[undefined], ['Bearer wrong'], [`Bearer ${SECRET}x`], [SECRET], ['Basic abc']])('refuses %s with 401 and does nothing', async (auth) => {
    const { ping, hub } = make();
    const res = await ping(auth);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
    expect(hub.calls.progress).toEqual([]);
  });

  it('does not take a person\'s access token as the secret', async () => {
    const { ping } = make({ tokens: { 'token-ee': 'u-ee' } });
    expect((await ping('Bearer token-ee')).status).toBe(401);
  });

  it('slows an address down after too many wrong secrets, even before it tries the right one', async () => {
    const { ping } = make();
    for (let i = 0; i < RULES.refused.limit; i++) expect((await ping('Bearer wrong', '203.0.113.7')).status).toBe(401);
    const res = await ping(`Bearer ${SECRET}`, '203.0.113.7');
    expect(res.status).toBe(429);
    expect((await ping(`Bearer ${SECRET}`, '198.51.100.1')).status).toBe(200);
  });
});

describe('GET /api/cron/ping: what it does', () => {
  it('asks the hub and every connected division, and saves each division\'s task counts', async () => {
    const { ping, hub } = make();
    const res = await ping(`Bearer ${SECRET}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      hub: true,
      divisions: { ee: 'not_configured', mcit: 'not_configured', hr: 'ok', fnl: 'not_configured', sng: 'ok', cons: 'not_configured' },
      progressSaved: true,
    });
    const rows = hub.calls.progress[0] ?? [];
    expect(rows.map((r) => r.division_id)).toEqual(['ee', 'mcit', 'hr', 'fnl', 'sng', 'cons']);
    expect(rows.find((r) => r.division_id === 'ee')).toMatchObject({ total_items: 10, done_items: 4, last_error: null });
    expect(rows.find((r) => r.division_id === 'mcit')).toMatchObject({ total_items: 0, done_items: 0 });
    expect(rows.every((r) => typeof r.last_synced_at === 'string')).toBe(true);
  });

  it('reports a division that does not answer, and says so in its progress line, without stopping the rest', async () => {
    const { ping, hub, spokes } = make();
    spokes.breakPing('hr');
    const body = (await (await ping(`Bearer ${SECRET}`)).json()) as { ok: boolean; divisions: Record<string, string> };
    expect(body.ok).toBe(false);
    expect(body.divisions).toMatchObject({ hr: 'failed', sng: 'ok' });
    const rows = hub.calls.progress[0] ?? [];
    expect(rows.find((r) => r.division_id === 'hr')).toMatchObject({ last_error: 'unreachable', total_items: 5 });
    expect(rows.find((r) => r.division_id === 'sng')).toMatchObject({ last_error: null });
  });

  it('still wakes the division projects when the hub is down, and saves nothing', async () => {
    const { ping, hub } = make({ hubDown: true });
    const body = (await (await ping(`Bearer ${SECRET}`)).json()) as { ok: boolean; hub: boolean; divisions: Record<string, string> };
    expect(body).toMatchObject({ ok: false, hub: false, divisions: { hr: 'ok', sng: 'ok' }, progressSaved: false });
    expect(hub.calls.progress).toEqual([]);
  });

  it('saves the lines without counts, marked, when the tasks cannot be counted', async () => {
    const { ping, hub } = make({ taskCountsFail: true });
    const body = (await (await ping(`Bearer ${SECRET}`)).json()) as { ok: boolean; progressSaved: boolean };
    expect(body).toMatchObject({ ok: false, progressSaved: true });
    const rows = hub.calls.progress[0] ?? [];
    expect(rows.every((r) => r.last_error === 'sync_failed' && !('total_items' in r))).toBe(true);
  });

  it('is not ok when the numbers could not be saved', async () => {
    const { ping } = make({ saveProgressFails: true });
    expect(await (await ping(`Bearer ${SECRET}`)).json()).toMatchObject({ ok: false, progressSaved: false });
  });
});

describe('runKeepAlive', () => {
  it('stamps every line with the time it was made', async () => {
    const hub = fakeHub({ tasks: TASKS });
    await runKeepAlive(hub, fakeSpokes(), {}, () => new Date('2026-10-17T03:00:00.000Z'));
    expect(hub.calls.progress[0]?.every((r) => r.last_synced_at === '2026-10-17T03:00:00.000Z')).toBe(true);
  });
});
