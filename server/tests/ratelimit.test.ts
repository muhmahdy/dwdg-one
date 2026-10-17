import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.ts';
import { RULES, createMemoryLimiter } from '../src/lib/ratelimit.ts';
import { PERSON, fakeHub, fakeSpokes } from './helpers.ts';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('memory limiter', () => {
  it('counts hits inside the window and forgets them after it', async () => {
    let t = 1_000;
    const limiter = createMemoryLimiter(() => t);
    expect(await limiter.hit('k', 1000)).toBe(1);
    expect(await limiter.hit('k', 1000)).toBe(2);
    expect(await limiter.count('k', 1000)).toBe(2);
    t += 999;
    expect(await limiter.count('k', 1000)).toBe(2);
    t += 2;
    expect(await limiter.count('k', 1000)).toBe(0);
    expect(await limiter.hit('k', 1000)).toBe(1);
  });

  it('keeps keys apart, and counting does not record', async () => {
    const limiter = createMemoryLimiter(() => 0);
    await limiter.hit('a', 1000);
    expect(await limiter.count('b', 1000)).toBe(0);
    await limiter.count('a', 1000);
    expect(await limiter.count('a', 1000)).toBe(1);
  });

  it('never keeps more than a bounded number of keys', async () => {
    const limiter = createMemoryLimiter(() => 0);
    for (let i = 0; i < 20_050; i++) await limiter.hit(`ip-${i}`, 60_000);
    expect(await limiter.count('ip-0', 60_000)).toBe(0); // the oldest was dropped
    expect(await limiter.count('ip-20049', 60_000)).toBe(1);
  });
});

function make() {
  const hub = fakeHub({
    tokens: { 'tok-a': 'u-a', 'tok-b': 'u-b' },
    people: { 'u-a': PERSON({ id: 'a' }), 'u-b': PERSON({ id: 'b' }) },
  });
  const app = createApp({ config: { corsOrigin: undefined, cronSecret: undefined }, hub, spokes: fakeSpokes(), env: {} });
  const ask = (path: string, token: string, init: RequestInit = {}, address?: string) =>
    app.request(`/api${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...(address ? { 'X-Forwarded-For': address } : {}), ...(init.body ? { 'Content-Type': 'application/json' } : {}) } });
  return { hub, app, ask };
}

describe('per-person limits', () => {
  it(`allows ${RULES.workspace.limit} loads a minute and then answers 429 with Retry-After`, async () => {
    const { ask } = make();
    for (let i = 0; i < RULES.workspace.limit; i++) expect((await ask('/workspace', 'tok-a')).status).toBe(200);
    const res = await ask('/workspace', 'tok-a');
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'rate_limited' });
    expect(res.headers.get('retry-after')).toBe('60');
  });

  it('counts each person on their own', async () => {
    const { ask } = make();
    for (let i = 0; i <= RULES.workspace.limit; i++) await ask('/workspace', 'tok-a');
    expect((await ask('/workspace', 'tok-a')).status).toBe(429);
    expect((await ask('/workspace', 'tok-b')).status).toBe(200);
  });

  it(`allows ${RULES.changes.limit} saves a minute and writes nothing once over`, async () => {
    const { ask, hub } = make();
    const save = () => ask('/changes', 'tok-a', { method: 'POST', body: JSON.stringify({ changes: { tasks: { upsert: [{ id: 't', pos: 0, doc: { id: 't' } }] } } }) });
    for (let i = 0; i < RULES.changes.limit; i++) expect((await save()).status).toBe(200);
    expect((await save()).status).toBe(429);
    expect(hub.calls.applied).toHaveLength(RULES.changes.limit);
  });

  it('limits loads and saves separately', async () => {
    const { ask } = make();
    for (let i = 0; i <= RULES.workspace.limit; i++) await ask('/workspace', 'tok-a');
    const res = await ask('/changes', 'tok-a', { method: 'POST', body: JSON.stringify({ changes: {} }) });
    expect(res.status).toBe(200);
  });
});

describe('refused tokens, per address', () => {
  it('blocks an address after it presents too many tokens that do not check out, and not another address', async () => {
    const { ask } = make();
    for (let i = 0; i < RULES.refused.limit; i++) expect((await ask('/me', 'forged', {}, '203.0.113.9')).status).toBe(401);
    const blocked = await ask('/me', 'tok-a', {}, '203.0.113.9');
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBe('60');
    expect((await ask('/me', 'tok-a', {}, '198.51.100.4')).status).toBe(200);
  });

  it('never counts requests that were accepted, so an office behind one address is not blocked', async () => {
    const { ask } = make();
    for (let i = 0; i < RULES.refused.limit * 3; i++) expect((await ask('/me', 'tok-a', {}, '203.0.113.9')).status).toBe(200);
  });
});
