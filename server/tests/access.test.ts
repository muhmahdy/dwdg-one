/* Changes of who may do what are written to the audit log: the fields of a person that carry authority, and the account and
   authority tables. And the audit log is readable only by the Admin and the President. */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.ts';
import { PERSON, fakeHub, fakeSpokes, type FakeHub } from './helpers.ts';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

const ACTOR = PERSON({ id: 'hr_dir', role: 'director', div: 'hr' });
const stored = {
  mem_ee: { id: 'mem_ee', name: 'Eka', div: 'ee', role: 'member', admin: false, board: false, status: 'active', title: 'Analyst' },
  old_one: { id: 'old_one', name: 'Old', div: 'cons', role: 'codirector', admin: false, board: false, status: 'active' },
};

function make(opts: Parameters<typeof fakeHub>[0] = {}) {
  const hub: FakeHub = fakeHub({
    tokens: { t: 'u-actor', 'tok-pres': 'u-pres', 'tok-adm': 'u-adm', 'tok-mem': 'u-mem' },
    people: {
      'u-actor': ACTOR,
      'u-pres': PERSON({ id: 'pres', role: 'president', div: null }),
      'u-adm': PERSON({ id: 'adm', role: 'director', div: 'sng', isAdmin: true }),
      'u-mem': PERSON({ id: 'mem', role: 'member' }),
    },
    stored,
    ...opts,
  });
  const app = createApp({ config: { corsOrigin: undefined, cronSecret: undefined }, hub, spokes: fakeSpokes(), env: {} });
  const save = (changes: unknown) =>
    app.request('/api/changes', { method: 'POST', headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' }, body: JSON.stringify({ changes }) });
  return { hub, app, save };
}
const row = (id: string, doc: Record<string, unknown>) => ({ id, pos: 0, doc: { id, ...doc } });
const actions = (hub: FakeHub) => hub.calls.audits.map((a) => a.action);

describe('people: a change of authority is audited, anything else is not', () => {
  it('records a change of role with the old and the new value, and who did it', async () => {
    const { save, hub } = make();
    expect((await save({ people: { upsert: [row('mem_ee', { ...stored.mem_ee, role: 'director' })] } })).status).toBe(200);
    expect(hub.calls.audits).toEqual([{ personId: 'hr_dir', action: 'access.person.changed', detail: { person: 'mem_ee', changes: { role: ['member', 'director'] } } }]);
  });

  it('records every authority field that changed in one line', async () => {
    const { save, hub } = make();
    await save({ people: { upsert: [row('mem_ee', { ...stored.mem_ee, div: 'hr', admin: true, status: 'paused' })] } });
    expect(hub.calls.audits[0]?.detail).toEqual({ person: 'mem_ee', changes: { div: ['ee', 'hr'], admin: [false, true], status: ['active', 'paused'] } });
  });

  it('says nothing when only a profile field changed', async () => {
    const { save, hub } = make();
    await save({ people: { upsert: [row('mem_ee', { ...stored.mem_ee, title: 'Lead analyst', phone: '123' })] } });
    expect(hub.calls.audits).toEqual([]);
  });

  it('records a new person with the authority they start with, and a removed one with what they had', async () => {
    const { save, hub } = make();
    await save({ people: { upsert: [row('newbie', { div: 'ee', role: 'member', status: 'pending', name: 'Nia' })], delete: ['old_one'] } });
    expect(hub.calls.audits).toEqual([
      { personId: 'hr_dir', action: 'access.person.added', detail: { person: 'newbie', role: 'member', div: 'ee', admin: null, board: null, status: 'pending' } },
      { personId: 'hr_dir', action: 'access.person.removed', detail: { person: 'old_one', role: 'codirector', div: 'cons', admin: false, board: false, status: 'active' } },
    ]);
  });

  it('never writes a name, a phone number or an address into the audit log', async () => {
    const { save, hub } = make();
    await save({ people: { upsert: [row('mem_ee', { ...stored.mem_ee, role: 'director', phone: '081234', email: 'eka@example.org' })] } });
    const text = JSON.stringify(hub.calls.audits);
    expect(text).not.toMatch(/081234|example\.org|Eka/);
  });

  it('still records that a person was written when their stored record cannot be read', async () => {
    const { save, hub } = make({ storedFails: true });
    expect((await save({ people: { upsert: [row('mem_ee', { ...stored.mem_ee, role: 'director' })] } })).status).toBe(200);
    expect(hub.calls.audits).toEqual([{ personId: 'hr_dir', action: 'access.person.written', detail: { person: 'mem_ee' } }]);
  });
});

describe('account and authority tables are audited', () => {
  it('records a grant with the people it names, and an invitation without its e-mail address', async () => {
    const { save, hub } = make();
    await save({
      acct_grants: { upsert: [row('g1', { person: 'mem_ee', role: 'lead', unit: 'ee' })], delete: ['g0'] },
      acct_invites: { upsert: [row('inv1', { email: 'new@example.org', div: 'ee', role: 'member', state: 'pending' })] },
    });
    expect(hub.calls.audits).toEqual([
      { personId: 'hr_dir', action: 'access.change', detail: { table: 'acct_invites', upserted: ['inv1'], deleted: [] } },
      { personId: 'hr_dir', action: 'access.change', detail: { table: 'acct_grants', upserted: ['g1'], deleted: ['g0'], people: ['mem_ee'] } },
    ]);
    expect(JSON.stringify(hub.calls.audits)).not.toContain('example.org');
  });

  it('covers memberships and handovers, but not the app\'s own journal (acct_log)', async () => {
    const { save, hub } = make();
    await save({
      acct_memberships: { upsert: [row('m1', { person: 'mem_ee', div: 'cons' })] },
      acct_handovers: { upsert: [row('h1', { from: 'a', to: 'b' })] },
      acct_log: { upsert: [row('l1', { actor: 'hr_dir' })] },
    });
    expect(actions(hub)).toEqual(['access.change', 'access.change']);
    expect(hub.calls.audits.map((a) => (a.detail as { table: string }).table)).toEqual(['acct_memberships', 'acct_handovers']);
  });

  it('says nothing about ordinary work, and does not even read the stored people', async () => {
    const { save, hub } = make();
    const spy = vi.spyOn(hub, 'peopleByIds');
    await save({ tasks: { upsert: [row('t1', { div: 'ee' })] }, updates: { upsert: [row('u1', {})] } });
    expect(hub.calls.audits).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('records nothing when the hub refuses the change', async () => {
    const { save, hub } = make();
    hub.failApplyWith('42501');
    expect((await save({ acct_grants: { upsert: [row('g1', { person: 'mem_ee' })] } })).status).toBe(403);
    expect(actions(hub)).toEqual(['changes.denied']);
  });

  it('does not let a failing audit log change the answer', async () => {
    const { save } = make({ auditFails: true });
    expect((await save({ acct_grants: { upsert: [row('g1', { person: 'mem_ee' })] } })).status).toBe(200);
  });
});

describe('GET /api/audit', () => {
  const ask = (app: ReturnType<typeof make>['app'], token: string, query = '') => app.request(`/api/audit${query}`, { headers: { Authorization: `Bearer ${token}` } });
  const rows = [{ id: 2, at: '2026-10-17T01:00:00Z', person_id: 'hr_dir', division_id: null, action: 'access.change', detail: { table: 'acct_grants' } }];

  it('lets the President and an Admin read it, newest first, 50 lines by default', async () => {
    const { app, hub } = make({ auditRows: rows });
    for (const token of ['tok-pres', 'tok-adm']) {
      const res = await ask(app, token);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ rows });
    }
    expect(hub.calls.auditReads).toEqual([{ limit: 50 }, { limit: 50 }]);
  });

  it('refuses everybody else, including a director who changed access themselves', async () => {
    const { app, hub } = make({ auditRows: rows });
    expect((await ask(app, 't')).status).toBe(403);
    expect((await ask(app, 'tok-mem')).status).toBe(403);
    expect((await ask(app, 'forged')).status).toBe(401);
    expect(hub.calls.auditReads).toEqual([]);
  });

  it('passes a limit and a division on, and refuses nonsense', async () => {
    const { app, hub } = make({ auditRows: rows });
    expect((await ask(app, 'tok-adm', '?limit=5&division=hr')).status).toBe(200);
    expect(hub.calls.auditReads).toEqual([{ limit: 5, division: 'hr' }]);
    for (const bad of ['?limit=0', '?limit=500', '?limit=abc', '?division=moon', '?division=hub']) {
      const res = await ask(app, 'tok-adm', bad);
      expect(res.status, bad).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid_input' });
    }
  });
});
