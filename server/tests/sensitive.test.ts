/* HR and Finance & Legal hold personal data: whenever one of them hands a person records, or changes them, a line goes to the
   audit log (who, which division, read or write, how many). Someone who is shown nothing leaves no line. The lines hold
   counts and table names only, never the content of a record. */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.ts';
import { PERSON, fakeHub, fakeSpokes, type FakeHub } from './helpers.ts';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

const row = (id: string, doc: Record<string, unknown> = {}) => ({ id, pos: 0, doc: { id, ...doc } });
const ENV = Object.fromEntries(['HR', 'FNL', 'SNG', 'MCIT'].flatMap((d) => [[`SPOKE_${d}_URL`, 'u'], [`SPOKE_${d}_SERVICE_KEY`, 'k']]));

const people = {
  'u-hrdir': PERSON({ id: 'hr_dir', role: 'director', div: 'hr' }),
  'u-hrmem': PERSON({ id: 'hr_mem', role: 'member', div: 'hr' }),
  'u-fnl': PERSON({ id: 'mem_fnl', role: 'member', div: 'fnl' }),
  'u-sng': PERSON({ id: 'mem_sng', role: 'member', div: 'sng' }),
  'u-pres': PERSON({ id: 'pres', role: 'president', div: null }),
  'u-brd': PERSON({ id: 'brd', role: 'board', div: null }),
};
const tokens = Object.fromEntries(Object.keys(people).map((u) => [`t-${u.slice(2)}`, u]));

function make(opts: Parameters<typeof fakeHub>[0] = {}) {
  const hub: FakeHub = fakeHub({ tokens, people, active: ['hr', 'fnl', 'sng', 'mcit'], ...opts });
  const spokes = fakeSpokes({
    hr: { hr_registers: [row('r1', { unit: 'hr' }), row('r2', { unit: 'ee' })], hr_notices: [row('n1', { reg: 'r1', person: 'mem_ee', outcome: 'a private warning' })] },
    fnl: { fnl_register: [row('rg1', { req: 'rq1' })], fnl_payments: [row('py1', { req: 'rq1', by: 'mem_fnl', note: 'bank transfer' })] },
    sng: { sng_initiatives: [row('i1', { owner: 'mem_sng' })] },
    mcit: { mcit_campaigns: [row('c1')] },
  });
  const app = createApp({ config: { corsOrigin: undefined, cronSecret: undefined }, hub, spokes, env: ENV });
  const as = (who: string) => ({ Authorization: `Bearer t-${who}`, 'Content-Type': 'application/json' });
  return {
    hub,
    spokes,
    load: (who: string) => app.request('/api/workspace', { headers: as(who) }),
    save: (who: string, changes: unknown) => app.request('/api/changes', { method: 'POST', headers: as(who), body: JSON.stringify({ changes }) }),
  };
}
const sensitive = (hub: FakeHub) => hub.calls.audits.filter((a) => a.action === 'access.sensitive');

describe('reading a sensitive division', () => {
  it('writes one line per sensitive division that handed the person records, with how many', async () => {
    const { load, hub } = make();
    expect((await load('hrdir')).status).toBe(200);
    expect(sensitive(hub)).toEqual([{ personId: 'hr_dir', divisionId: 'hr', action: 'access.sensitive', detail: { op: 'read', rows: 3 } }]);
  });

  it('writes a line for each sensitive division the President sees into', async () => {
    const { load, hub } = make();
    await load('pres');
    expect(sensitive(hub).map((a) => [a.divisionId, (a.detail as { rows: number }).rows])).toEqual([['hr', 3], ['fnl', 2]]);
  });

  it('writes nothing for a person who is shown nothing of a sensitive division, or for a division that is not sensitive', async () => {
    const { load, hub } = make();
    await load('sng'); // reads sng (not sensitive) and nothing of hr or fnl
    await load('brd'); // the Board sees none of it
    expect(sensitive(hub)).toEqual([]);
  });

  it('counts records, not the stored values of the division', async () => {
    const { load, hub, spokes } = make();
    spokes.data.hr = { ...spokes.data.hr, store_values: [row('hr.v', { value: 1 })], hr_registers: [] , hr_notices: [] };
    await load('hrdir');
    expect(sensitive(hub)).toEqual([]);
  });

  it('treats HR and Finance & Legal as sensitive even when the hub has not marked them, and anything else the hub marks', async () => {
    const plain = make({ sensitive: [] });
    await plain.load('hrdir');
    expect(sensitive(plain.hub).map((a) => a.divisionId)).toEqual(['hr']);
    const marked = make({ sensitive: ['sng'] });
    await marked.load('sng');
    expect(sensitive(marked.hub).map((a) => a.divisionId)).toEqual(['sng']);
  });

  it('puts no record content in the audit log', async () => {
    const { load, hub } = make();
    await load('pres');
    expect(JSON.stringify(hub.calls.audits)).not.toMatch(/private warning|bank transfer/);
  });

  it('still answers when the audit log cannot be written', async () => {
    const { load } = make({ auditFails: true });
    expect((await load('hrdir')).status).toBe(200);
  });
});

describe('changing a sensitive division', () => {
  it('writes a line with the tables and how many records were saved or removed', async () => {
    const { save, hub } = make();
    const res = await save('hrdir', { hr_notices: { upsert: [row('n2', { reg: 'r1', person: 'mem_ee' })], delete: ['n1'] }, hr_registers: { upsert: [row('r3', { unit: 'hr' })] } });
    expect(res.status).toBe(200);
    expect(sensitive(hub)).toEqual([
      { personId: 'hr_dir', divisionId: 'hr', action: 'access.sensitive', detail: { op: 'write', tables: ['hr_notices', 'hr_registers'], upserted: 2, deleted: 1 } },
    ]);
  });

  it('writes a line only when the save went through; a refusal is recorded as a refusal', async () => {
    const { save, hub } = make();
    const res = await save('sng', { hr_notices: { upsert: [row('n9', { reg: 'r1', person: 'mem_ee' })] } });
    expect(res.status).toBe(403);
    expect(sensitive(hub)).toEqual([]);
    expect(hub.calls.audits.map((a) => a.action)).toEqual(['changes.denied']);
  });

  it('does not write a line for a division that is not sensitive', async () => {
    const { save, hub } = make();
    expect((await save('sng', { sng_initiatives: { upsert: [row('i2', { owner: 'mem_sng' })] } })).status).toBe(200);
    expect(sensitive(hub)).toEqual([]);
  });
});
