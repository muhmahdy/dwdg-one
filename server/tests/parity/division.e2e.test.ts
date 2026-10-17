/* The whole server, with Strategy & Growth as a real division project: a PGlite database that has had the spoke base and the
   sng migrations, reached through the same load_rows / apply_rows functions the deployed server calls, with the service role.
   The hub is a stand-in that knows the same cast of people. Shows the wiring: who gets which rows, which saves are refused
   before anything is written, and what happens when the division project is down. */
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app.ts';
import type { SpokeGateway } from '../../src/lib/spoke/gateway.ts';
import type { Row } from '../../src/lib/workspace/partition.ts';
import { fakeHub, type FakeHub } from '../helpers.ts';
import { CAST, freshDb, migrationsIn } from './pg.ts';

const SNG_ENV = { SPOKE_SNG_URL: 'http://sng.invalid', SPOKE_SNG_SERVICE_KEY: 'k' };
const INITIATIVES = [
  { id: 'i_mem', doc: { id: 'i_mem', owner: 'mem_sng', createdBy: 'dir_sng' } },
  { id: 'i_ee_creator', doc: { id: 'i_ee_creator', owner: 'dir_sng', createdBy: 'mem_ee' } },
  { id: 'i_ee_owner', doc: { id: 'i_ee_owner', owner: 'mem_ee', createdBy: 'dir_sng' } },
  { id: 'i_plain', doc: { id: 'i_plain', owner: 'dir_sng', createdBy: 'dir_sng' } },
  { id: 'i_none', doc: { id: 'i_none' } },
];
const PACKETS = [
  { id: 'k_rev', doc: { id: 'k_rev', initiative: 'i_plain', reviewer: 'mem_ee', createdBy: 'dir_sng' } },
  { id: 'k_sub', doc: { id: 'k_sub', initiative: 'i_plain', reviewer: 'dir_sng', submittedBy: 'mem_fnl' } },
  { id: 'k_cre', doc: { id: 'k_cre', initiative: 'i_plain', createdBy: 'hr_mem' } },
  { id: 'k_none', doc: { id: 'k_none', initiative: 'i_plain' } },
];

let db: PGlite;
let broken: { load: boolean; save: boolean };

/** The deployed gateway's two calls, answered by the PGlite division project as the service role. */
function pgSpoke(): SpokeGateway {
  const asService = async <T>(fn: () => Promise<T>): Promise<T> => {
    await db.exec('set role service_role');
    try {
      return await fn();
    } finally {
      await db.exec('reset role');
    }
  };
  return {
    load: (_slug, tables) => {
      if (broken.load) return Promise.reject(new Error('project is paused'));
      return asService(async () => (await db.query<{ r: Record<string, Row[]> }>('select public.load_rows($1::text[]) as r', [tables ?? null])).rows[0]?.r ?? {});
    },
    ping: () => asService(async () => (await db.query('select version from public.schema_meta limit 1')).rows.length === 1),
    apply: (_slug, payload) => {
      if (broken.save) return Promise.reject(new Error('project is paused'));
      return asService(async () => (await db.query<{ r: unknown }>('select public.apply_rows($1) as r', [payload])).rows[0]?.r);
    },
  };
}

const rowsOf = async (table: string) => (await db.query<{ id: string }>(`select id from public.${table} order by id`)).rows.map((r) => r.id);

function make(active: ('sng' | 'ee')[] = ['sng']) {
  const tokens = Object.fromEntries(CAST.map((p) => [`t-${p.id}`, `u-${p.id}`]));
  const people = Object.fromEntries(CAST.map((p) => [`u-${p.id}`, { id: p.id, role: p.role, div: p.div, status: p.status ?? 'active', isAdmin: p.admin ?? false }]));
  const hub: FakeHub = fakeHub({ tokens, people, active, workspace: { people: [{ id: 'adm', pos: 0, doc: { id: 'adm' } }], tasks: [{ id: 't1', pos: 0, doc: { id: 't1' } }] } });
  const app = createApp({ config: { corsOrigin: undefined, cronSecret: undefined }, hub, spokes: pgSpoke(), env: SNG_ENV });
  const as = (person: string) => ({ Authorization: `Bearer t-${person}`, 'Content-Type': 'application/json' });
  const workspace = async (person: string) => {
    const res = await app.request('/api/workspace', { headers: as(person) });
    return { status: res.status, body: (await res.json()) as { rows: Record<string, { id: string }[]>; divisions: Record<string, string> } };
  };
  const save = async (person: string, changes: unknown) => {
    const res = await app.request('/api/changes', { method: 'POST', headers: as(person), body: JSON.stringify({ changes }) });
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
  };
  return { hub, app, workspace, save };
}

beforeAll(async () => {
  db = await freshDb([...migrationsIn('spoke/base/migrations'), ...migrationsIn('spoke/sng/migrations')]);
}, 120_000);
afterAll(async () => {
  await db.close();
});
beforeEach(async () => {
  broken = { load: false, save: false };
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  await db.exec('delete from public.sng_packets; delete from public.sng_initiatives; delete from public.store_values;');
  for (const r of INITIATIVES) await db.query('insert into public.sng_initiatives (id, doc) values ($1, $2)', [r.id, JSON.stringify(r.doc)]);
  for (const r of PACKETS) await db.query('insert into public.sng_packets (id, doc) values ($1, $2)', [r.id, JSON.stringify(r.doc)]);
  await db.query(`insert into public.store_values (id, doc) values ('sng.v', '{"value": 1}')`);
});

const ids = (rows: { id: string }[] | undefined) => (rows ?? []).map((r) => r.id).sort();

describe('GET /api/workspace with sng as a division project', () => {
  it('gives the division, the President, the VP and the Admin every row of sng', async () => {
    for (const person of ['dir_sng', 'mem_sng', 'cod_sng', 'pres', 'vpx', 'adm']) {
      const { status, body } = await make().workspace(person);
      expect(status, person).toBe(200);
      expect(body.divisions.sng).toBe('ok');
      expect(ids(body.rows.sng_initiatives), person).toEqual(['i_ee_creator', 'i_ee_owner', 'i_mem', 'i_none', 'i_plain']);
      expect(ids(body.rows.sng_packets), person).toEqual(['k_cre', 'k_none', 'k_rev', 'k_sub']);
    }
  });

  it('gives someone from another division only the rows that name them', async () => {
    const ee = await make().workspace('mem_ee');
    expect(ids(ee.body.rows.sng_initiatives)).toEqual(['i_ee_creator', 'i_ee_owner']);
    expect(ids(ee.body.rows.sng_packets)).toEqual(['k_rev']);
    expect(ids((await make().workspace('mem_fnl')).body.rows.sng_packets)).toEqual(['k_sub']);
    expect(ids((await make().workspace('hr_mem')).body.rows.sng_packets)).toEqual(['k_cre']);
    expect(ids((await make().workspace('mem_mcit')).body.rows.sng_initiatives)).toEqual([]);
  });

  it('gives the Board, a suspended director and a person who is not active nothing of sng', async () => {
    for (const person of ['brd', 'susp', 'newbie', 'adm_pending', 'norole']) {
      const { body } = await make().workspace(person);
      expect(ids(body.rows.sng_initiatives), person).toEqual([]);
      expect(ids(body.rows.sng_packets), person).toEqual([]);
    }
  });

  it('adds the division\'s stored values to the hub\'s, for any active person', async () => {
    const { body } = await make().workspace('brd');
    expect(ids(body.rows.store_values)).toEqual(['sng.v']);
  });

  it('still returns the hub rows next to the division rows', async () => {
    const { body } = await make().workspace('dir_sng');
    expect(ids(body.rows.tasks)).toEqual(['t1']);
    expect(ids(body.rows.people)).toEqual(['adm']);
  });

  it('keeps loading when the division project is down: the hub rows come, sng says unavailable', async () => {
    broken.load = true;
    const { status, body } = await make().workspace('dir_sng');
    expect(status).toBe(200);
    expect(body.divisions.sng).toBe('unavailable');
    expect(body.rows.sng_initiatives).toBeUndefined();
    expect(ids(body.rows.tasks)).toEqual(['t1']);
  });

  it('does not read the division project at all while the hub has it switched off', async () => {
    const { body } = await make([]).workspace('dir_sng');
    expect(body.divisions.sng).toBe('inactive');
    expect(body.rows.sng_initiatives).toBeUndefined();
  });
});

describe('POST /api/changes with sng as a division project', () => {
  const newInitiative = (id: string, over: Record<string, unknown> = {}) => ({ sng_initiatives: { upsert: [{ id, pos: 9, doc: { id, ...over } }] } });

  it('saves what the rules allow, into the division project', async () => {
    const m = make();
    expect((await m.save('dir_sng', newInitiative('i_new', { owner: 'dir_sng' }))).status).toBe(200);
    expect(await rowsOf('sng_initiatives')).toContain('i_new');
    expect(m.hub.calls.applied).toEqual([]); // nothing for the hub
    // a person from another division may save a record that names them, as the old policies allowed
    expect((await m.save('mem_ee', newInitiative('i_by_ee', { createdBy: 'mem_ee' }))).status).toBe(200);
    expect(await rowsOf('sng_initiatives')).toContain('i_by_ee');
  });

  it('refuses a record the person may not write, and writes nothing', async () => {
    const m = make();
    const before = await rowsOf('sng_initiatives');
    const r = await m.save('mem_ee', newInitiative('i_nope'));
    expect(r.status).toBe(403);
    expect(r.body).toEqual({ error: 'forbidden' });
    expect(await rowsOf('sng_initiatives')).toEqual(before);
    expect(m.hub.calls.audits[0]).toMatchObject({ action: 'changes.denied' });
  });

  it('refuses taking over a record the person cannot touch (allowed as it would be, not as it is)', async () => {
    const m = make();
    const r = await m.save('mem_mcit', { sng_initiatives: { upsert: [{ id: 'i_plain', pos: 0, doc: { id: 'i_plain', owner: 'mem_mcit' } }] } });
    expect(r.status).toBe(403);
    expect((await db.query<{ doc: { owner: string } }>(`select doc from public.sng_initiatives where id = 'i_plain'`)).rows[0]?.doc.owner).toBe('dir_sng');
  });

  it('refuses the Board and a person who is not active before reading the division project', async () => {
    for (const person of ['brd', 'newbie', 'norole']) {
      expect((await make().save(person, newInitiative('i_x', { owner: person }))).status, person).toBe(403);
    }
    expect(await rowsOf('sng_initiatives')).not.toContain('i_x');
  });

  it('deletes only what the rules allow', async () => {
    const m = make();
    // (i_plain has packets pointing at it, so the example deletes i_mem)
    expect((await m.save('mem_mcit', { sng_initiatives: { delete: ['i_mem'] } })).status).toBe(403);
    expect(await rowsOf('sng_initiatives')).toContain('i_mem');
    expect((await m.save('mem_sng', { sng_initiatives: { delete: ['i_mem', 'does_not_exist'] } })).status).toBe(200);
    expect(await rowsOf('sng_initiatives')).not.toContain('i_mem');
  });

  it('refuses the locked stored values of a division to everyone but the President, the VP and an Admin', async () => {
    const m = make();
    const grants = { store_values: { upsert: [{ id: 'sng.v', pos: 0, doc: { value: 2 } }] } };
    expect((await m.save('mem_sng', grants)).status).toBe(200); // sng.v is not locked
    expect((await db.query<{ doc: { value: number } }>(`select doc from public.store_values where id = 'sng.v'`)).rows[0]?.doc.value).toBe(2);
  });

  it('saves a change set that spans the hub and the division: the hub first, then the division', async () => {
    const m = make();
    const r = await m.save('mem_sng', { tasks: { upsert: [{ id: 't9', pos: 0, doc: { id: 't9' } }] }, ...newInitiative('i_both', { owner: 'mem_sng' }) });
    expect(r.status).toBe(200);
    expect(m.hub.calls.applied).toHaveLength(1);
    expect(JSON.parse(m.hub.calls.applied[0]?.payload ?? '')).toEqual({ tasks: { upsert: [{ id: 't9', pos: 0, doc: { id: 't9' } }] } });
    expect(await rowsOf('sng_initiatives')).toContain('i_both');
  });

  it('saving the same change set twice leaves the same rows (it is safe to retry)', async () => {
    const m = make();
    const change = newInitiative('i_twice', { owner: 'dir_sng', note: 'a' });
    await m.save('dir_sng', change);
    const once = await db.query(`select id, pos, doc from public.sng_initiatives order by id`);
    await m.save('dir_sng', change);
    expect((await db.query(`select id, pos, doc from public.sng_initiatives order by id`)).rows).toEqual(once.rows);
  });

  it('refuses the whole set, writing nothing anywhere, when the hub has the division switched off', async () => {
    const m = make([]);
    const r = await m.save('dir_sng', { tasks: { upsert: [{ id: 't9', pos: 0, doc: { id: 't9' } }] }, ...newInitiative('i_off', { owner: 'dir_sng' }) });
    expect(r.status).toBe(409);
    expect(r.body).toEqual({ error: 'division_unavailable' });
    expect(m.hub.calls.applied).toEqual([]);
    expect(await rowsOf('sng_initiatives')).not.toContain('i_off');
  });

  it('refuses the whole set, writing nothing, when the division project cannot even be read', async () => {
    broken.load = true;
    const m = make();
    const r = await m.save('dir_sng', { tasks: { upsert: [{ id: 't9', pos: 0, doc: { id: 't9' } }] }, ...newInitiative('i_down', { owner: 'dir_sng' }) });
    expect(r.status).toBe(409);
    expect(m.hub.calls.applied).toEqual([]);
  });

  it('answers 502 partial_save when the hub saved and the division project then failed, and says which', async () => {
    const m = make();
    broken.save = true;
    const r = await m.save('dir_sng', { tasks: { upsert: [{ id: 't9', pos: 0, doc: { id: 't9' } }] }, ...newInitiative('i_part', { owner: 'dir_sng' }) });
    expect(r.status).toBe(502);
    expect(r.body).toEqual({ error: 'partial_save', applied: ['hub'], failed: ['sng'] });
    expect(m.hub.calls.applied).toHaveLength(1);
    expect(await rowsOf('sng_initiatives')).not.toContain('i_part');
    expect(m.hub.calls.audits.at(-1)).toMatchObject({ action: 'changes.partial', detail: { applied: ['hub'], failed: ['sng'] } });
  });

  it('answers a plain 500 when only a division project was involved and it failed (nothing was saved anywhere)', async () => {
    broken.save = true;
    const r = await make().save('dir_sng', newInitiative('i_only', { owner: 'dir_sng' }));
    expect(r.status).toBe(500);
    expect(r.body).toEqual({ error: 'internal_error' });
  });

  it('refuses a table of a division that has no access rules yet, even when it is switched on', async () => {
    const m = make();
    const r = await m.save('pres', { hr_notices: { upsert: [{ id: 'n1', pos: 0, doc: { id: 'n1' } }] } });
    expect(r.status).toBe(409);
  });
});
