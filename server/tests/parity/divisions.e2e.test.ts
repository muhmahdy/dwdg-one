/* The whole chain, for all six divisions (SnG, MCIT, EE, Consulting, HR, Finance & Legal): the app's demo workspace is loaded
   twice. Once into the single-database schema, where the database's own row level security answers (the truth). Once split
   over six real division projects (the spoke migrations in PGlite, reached through load_rows / apply_rows as the service
   role), behind the server. For every person, GET /api/workspace must return exactly the rows the database's policies give
   them, and a save through POST /api/changes must be accepted exactly when the database would store it. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app.ts';
import { DIVISION_IDS, TABLE_HOME, VALUES_TABLE, homeOfValue } from '../../src/generated/partition.ts';
import type { SpokeGateway } from '../../src/lib/spoke/gateway.ts';
import type { Row } from '../../src/lib/workspace/partition.ts';
import { fakeHub } from '../helpers.ts';
import { asUser, freshDb, migrationsIn, uidOf, upsertWorks } from './pg.ts';

const SERVED = ['sng', 'mcit', 'ee', 'cons', 'hr', 'fnl'] as const;
type Rows = Record<string, Row[]>;
interface SeedPerson {
  id: string;
  div: string | null;
  role: string;
  admin?: boolean;
  status?: string;
  [k: string]: unknown;
}

const seedPath = join(import.meta.dirname, '../../../database/seeds/demo-workspace.json');
const seed = JSON.parse(readFileSync(seedPath, 'utf8')) as { people: SeedPerson[]; projects: { id: string; lead?: string; pm?: string }[] };

let truth: PGlite;
const spokeDbs = {} as Record<(typeof SERVED)[number], PGlite>;
let rows: Rows;
const divisionTables = (slug: string) => Object.entries(TABLE_HOME).filter(([, home]) => home === slug).map(([t]) => t);

/** The deployed gateway's two calls, answered by the division's PGlite project as the service role. */
function pgSpokes(): SpokeGateway {
  const asService = async <T>(slug: (typeof SERVED)[number], fn: (db: PGlite) => Promise<T>): Promise<T> => {
    const db = spokeDbs[slug];
    await db.exec('set role service_role');
    try {
      return await fn(db);
    } finally {
      await db.exec('reset role');
    }
  };
  const served = (slug: string) => {
    if (!(SERVED as readonly string[]).includes(slug)) throw new Error(`no project for ${slug}`);
    return slug as (typeof SERVED)[number];
  };
  return {
    load: (slug, tables) =>
      asService(served(slug), async (db) => (await db.query<{ r: Rows }>('select public.load_rows($1::text[]) as r', [tables ?? null])).rows[0]?.r ?? {}),
    ping: (slug) => asService(served(slug), async (db) => (await db.query('select version from public.schema_meta limit 1')).rows.length === 1),
    apply: (slug, payload) => asService(served(slug), async (db) => (await db.query<{ r: unknown }>('select public.apply_rows($1) as r', [payload])).rows[0]?.r),
  };
}

beforeAll(async () => {
  // @ts-expect-error a plain JavaScript module without type declarations
  const shape = (await import('../../../scripts/database/lib/workspace-shape.mjs')) as { decompose: (db: unknown) => Rows };
  rows = shape.decompose(JSON.parse(readFileSync(seedPath, 'utf8')));
  const put = (db: PGlite, table: string, r: Row) => db.query(`insert into public.${table} (id, pos, doc) values ($1, $2, $3)`, [r.id, r.pos, JSON.stringify(r.doc)]);

  truth = await freshDb(migrationsIn('migrations'));
  for (const p of seed.people) {
    await truth.query('insert into auth.users (id, email) values ($1, $2)', [uidOf(p.id), `${p.id}@dwdg.test`]);
    await truth.query('insert into public.people (id, pos, doc, auth_user_id, email) values ($1, 0, $2, $3, $4)', [p.id, JSON.stringify(p), uidOf(p.id), `${p.id}@dwdg.test`]);
  }
  for (const r of rows.programs ?? []) await put(truth, 'programs', r);
  for (const r of rows.projects ?? []) await put(truth, 'projects', r);

  for (const slug of SERVED) {
    spokeDbs[slug] = await freshDb([...migrationsIn('spoke/base/migrations'), ...migrationsIn(`spoke/${slug}/migrations`)]);
  }
  // parents before children: the order the tables are listed in is the order of the spec, which lists parents first
  for (const slug of SERVED) {
    for (const t of divisionTables(slug)) {
      for (const r of rows[t] ?? []) {
        await put(truth, t, r);
        await put(spokeDbs[slug], t, r);
      }
    }
  }
  for (const r of rows[VALUES_TABLE] ?? []) {
    await put(truth, VALUES_TABLE, r);
    const home = homeOfValue(r.id);
    if ((SERVED as readonly string[]).includes(home)) await put(spokeDbs[home as (typeof SERVED)[number]], VALUES_TABLE, r);
  }
}, 240_000);
afterAll(async () => {
  await truth.close();
  for (const db of Object.values(spokeDbs)) await db.close();
});

const people = Object.fromEntries(seed.people.map((p) => [`u-${p.id}`, { id: p.id, role: p.role, div: p.div, status: p.status ?? 'active', isAdmin: p.admin ?? false }]));
const tokens = Object.fromEntries(seed.people.map((p) => [`t-${p.id}`, `u-${p.id}`]));
const led = Object.fromEntries(seed.people.map((p) => [p.id, seed.projects.filter((pr) => pr.lead === p.id || pr.pm === p.id).map((pr) => pr.id)]));
const env = Object.fromEntries(SERVED.flatMap((s) => [[`SPOKE_${s.toUpperCase()}_URL`, 'http://x.invalid'], [`SPOKE_${s.toUpperCase()}_SERVICE_KEY`, 'k']]));

function server() {
  const hub = fakeHub({ tokens, people, led, active: [...SERVED], workspace: {} });
  // this test saves every row of every table for each person, far past a person's real rate: the limits have their own tests
  const unlimited = { hit: () => Promise.resolve(0), count: () => Promise.resolve(0) };
  const app = createApp({ config: { corsOrigin: undefined, cronSecret: undefined }, hub, spokes: pgSpokes(), env, limiter: unlimited });
  const headers = (id: string) => ({ Authorization: `Bearer t-${id}`, 'Content-Type': 'application/json' });
  return {
    workspace: async (id: string) => (await (await app.request('/api/workspace', { headers: headers(id) })).json()) as { rows: Record<string, { id: string }[]>; divisions: Record<string, string> },
    save: async (id: string, changes: unknown) => (await app.request('/api/changes', { method: 'POST', headers: headers(id), body: JSON.stringify({ changes }) })).status,
  };
}

describe('the server over real division projects gives every person what the database gives them', () => {
  const s = server();

  it('serves all six divisions', async () => {
    const w = await s.workspace('mahdy');
    expect(w.divisions).toEqual({ sng: 'ok', mcit: 'ok', ee: 'ok', cons: 'ok', hr: 'ok', fnl: 'ok' });
    expect(Object.keys(w.rows).filter((t) => t !== VALUES_TABLE && TABLE_HOME[t] === undefined)).toEqual([]);
    expect(DIVISION_IDS).toHaveLength(6);
  });

  it.each(seed.people.map((p) => [p.id]))('reads: %s gets exactly the rows the database gives them', async (id) => {
    const w = await s.workspace(id);
    for (const slug of SERVED) {
      for (const t of divisionTables(slug)) {
        const sql = await asUser(truth, id, async () => (await truth.query<{ id: string }>(`select id from public.${t} order by id`)).rows.map((r) => r.id));
        expect((w.rows[t] ?? []).map((r) => r.id).sort(), `${id} ${t}`).toEqual(sql);
      }
    }
    const values = await asUser(truth, id, async () => (await truth.query<{ id: string }>(`select id from public.store_values order by id`)).rows.map((r) => r.id));
    const mine = (w.rows[VALUES_TABLE] ?? []).map((r) => r.id).sort();
    expect(mine, `${id} store_values`).toEqual(values.filter((v) => (SERVED as readonly string[]).includes(homeOfValue(v))));
  });

  // A sample that spans every role and every served division; every row of every served table is saved by each of them.
  const sample = [
    seed.people.find((p) => p.admin),
    seed.people.find((p) => p.role === 'president'),
    seed.people.find((p) => p.role === 'vp'),
    ...SERVED.flatMap((d) => [seed.people.find((p) => p.div === d && p.role === 'director'), seed.people.find((p) => p.div === d && p.role === 'member')]),
    seed.people.find((p) => p.div === 'hr' && p.role === 'member'),
    seed.people.find((p) => p.div === 'fnl' && p.role === 'member'),
    seed.people.find((p) => p.status === 'pending'),
  ].filter((p): p is SeedPerson => p !== undefined);

  it('has a sample that covers every role and served division', () => {
    expect(sample.length).toBeGreaterThanOrEqual(12);
  });

  const tally = { accepted: 0, refused: 0 };
  it.each(sample.map((p) => [p.id]))('saves: %s is accepted by the server exactly when the database would store it', async (id) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const mismatches: string[] = [];
    for (const slug of SERVED) {
      for (const t of divisionTables(slug)) {
        for (const r of rows[t] ?? []) {
          const doc = { ...r.doc, _t: 1 };
          const expected = await upsertWorks(truth, id, t, { id: r.id, doc });
          const status = await s.save(id, { [t]: { upsert: [{ id: r.id, pos: r.pos, doc }] } });
          const accepted = status === 200;
          if (accepted !== expected) mismatches.push(`${t} ${r.id}: database ${expected}, server ${status}`);
          if (accepted) tally.accepted++;
          else tally.refused++;
        }
      }
    }
    expect(mismatches).toEqual([]);
  }, 180_000);

  it('saves: some were accepted and some refused (the comparison can fail)', () => {
    expect(tally.accepted).toBeGreaterThan(0);
    expect(tally.refused).toBeGreaterThan(0);
  });
});
