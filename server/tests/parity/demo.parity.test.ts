/* The comparison over the app's own demo workspace (database/seeds/demo-workspace.json): its 41 people and the records the
   demo ships for all six divisions (SnG, MCIT, EE, Consulting, HR, Finance & Legal). The gate of stages H3, H5 and H7 in the
   migration plan: for every person, the rows they can read through the server are the rows the database's policies gave
   them, and a save or a delete is allowed by the server exactly when the database allows it. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { resolvePrincipal } from '../../src/lib/auth/principal.ts';
import { mayDelete, mayRead, mayUpsert, policyFor, type Lookup, type RowView } from '../../src/lib/policy/index.ts';
import { fakeHub } from '../helpers.ts';
import { asUser, freshDb, happens, migrationsIn, uidOf, upsertWorks } from './pg.ts';

interface SeedPerson {
  id: string;
  div: string | null;
  role: string;
  admin?: boolean;
  status?: string;
  [k: string]: unknown;
}
type Rows = Record<string, { id: string; pos: number; doc: Record<string, unknown> }[]>;

const seedPath = join(import.meta.dirname, '../../../database/seeds/demo-workspace.json');
const seed = JSON.parse(readFileSync(seedPath, 'utf8')) as {
  people: SeedPerson[];
  projects: { id: string; lead?: string; pm?: string }[];
};

/* Parents before children, because of the foreign keys of the single-database schema. */
const TABLES = [
  'sng_initiatives',
  'sng_packets',
  'mcit_campaigns',
  'mcit_content',
  'mcit_briefs',
  'mcit_it',
  'mcit_accounts',
  'ee_orgs',
  'ee_contacts',
  'ee_interactions',
  'ee_fu',
  'ee_postpones',
  'ee_opps',
  'ee_handoffs',
  'cons_engagements',
  'cons_dlv',
  'cons_staff',
  'cons_kn',
  'cons_cohorts',
  'hr_registers',
  'hr_notices',
  'hr_cycles',
  'hr_assessments',
  'hr_actions',
  'hr_rounds',
  'hr_packets',
  'hr_onboarding_templates',
  'hr_onboarding_instances',
  'fnl_legal',
  'fnl_register',
  'fnl_allocations',
  'fnl_requests',
  'fnl_payments',
  'fnl_incoming',
  'fnl_periods',
];
const PARENT_KEYS = ['org', 'campaign', 'initiative', 'reg', 'cycle', 'assessment', 'round', 'template', 'alloc', 'req'];

let db: PGlite;
let rows: Rows;
let referenced: Set<string>;

beforeAll(async () => {
  // @ts-expect-error a plain JavaScript module without type declarations
  const shape = (await import('../../../scripts/database/lib/workspace-shape.mjs')) as { decompose: (db: unknown) => Rows };
  rows = shape.decompose(JSON.parse(readFileSync(seedPath, 'utf8')));
  referenced = new Set(
    TABLES.flatMap((t) =>
      (rows[t] ?? []).flatMap((r) => PARENT_KEYS.map((k) => r.doc[k]).filter((v): v is string => typeof v === 'string')),
    ),
  );

  db = await freshDb(migrationsIn('migrations'));
  const put = (table: string, r: { id: string; pos: number; doc: unknown }) =>
    db.query(`insert into public.${table} (id, pos, doc) values ($1, $2, $3)`, [r.id, r.pos, JSON.stringify(r.doc)]);
  for (const p of seed.people) {
    await db.query('insert into auth.users (id, email) values ($1, $2)', [uidOf(p.id), `${p.id}@dwdg.test`]);
    await db.query('insert into public.people (id, pos, doc, auth_user_id, email) values ($1, 0, $2, $3, $4)', [
      p.id,
      JSON.stringify(p),
      uidOf(p.id),
      `${p.id}@dwdg.test`,
    ]);
  }
  for (const r of rows.programs ?? []) await put('programs', r);
  for (const r of rows.projects ?? []) await put('projects', r);
  for (const t of TABLES) for (const r of rows[t] ?? []) await put(t, r);
}, 180_000);
afterAll(async () => {
  await db.close();
});

const people = Object.fromEntries(
  seed.people.map((p) => [`u-${p.id}`, { id: p.id, role: p.role, div: p.div, status: p.status ?? 'active', isAdmin: p.admin ?? false }]),
);
const tokens = Object.fromEntries(seed.people.map((p) => [`t-${p.id}`, `u-${p.id}`]));
const ledBy = Object.fromEntries(
  seed.people.map((p) => [p.id, seed.projects.filter((pr) => pr.lead === p.id || pr.pm === p.id).map((pr) => pr.id)]),
);
const principal = (id: string) => resolvePrincipal(fakeHub({ tokens, people, led: ledBy }), `t-${id}`);
const view = (r: { id: string; doc: Record<string, unknown> }): RowView => ({ id: r.id, doc: r.doc });
/** A rule that looks at another row of the division (an assessment and its cycle) finds it among the demo rows. */
const lookup: Lookup = (table, id) => {
  const r = rows[table]?.find((x) => x.id === id);
  return r ? view(r) : undefined;
};

describe('the demo workspace: database and server agree for all 41 people', () => {
  it('has the people and the records the checks need', () => {
    expect(seed.people).toHaveLength(41);
    for (const t of TABLES.filter((n) => n !== 'ee_postpones')) expect(rows[t]?.length, t).toBeGreaterThan(0);
    expect(seed.projects.some((p) => p.lead ?? p.pm)).toBe(true);
  });

  const reads = new Map<string, { all: number; none: number }>();
  it.each(seed.people.map((p) => [p.id]))('reads, every table: %s', async (id) => {
    const p = await principal(id);
    for (const t of TABLES) {
      const policy = policyFor(t);
      if (!policy) throw new Error(`no rule for ${t}`);
      const all = (rows[t] ?? []).map(view);
      const server = all.filter((r) => mayRead(policy, p, r, lookup)).map((r) => r.id).sort();
      const sql = await asUser(db, id, async () =>
        (await db.query<{ id: string }>(`select id from public.${t} order by id`)).rows.map((r) => r.id),
      );
      expect(server, `${id} ${t}`).toEqual(sql);
      const seen = reads.get(t) ?? { all: 0, none: 0 };
      if (sql.length === all.length) seen.all++;
      if (sql.length === 0) seen.none++;
      reads.set(t, seen);
    }
  });

  it('reads: for every table somebody sees all of it and somebody nothing of it (the comparison can fail)', () => {
    for (const t of TABLES) {
      if (!rows[t]?.length) continue;
      expect(reads.get(t)?.all, `${t}: people who see all`).toBeGreaterThan(0);
      expect(reads.get(t)?.none, `${t}: people who see none`).toBeGreaterThan(0);
    }
  });

  const writes = new Map<string, { allowed: number; refused: number }>();
  it.each(seed.people.map((p) => [p.id]))('saves and deletes, every table: %s', async (id) => {
    const p = await principal(id);
    const mismatches: string[] = [];
    for (const t of TABLES) {
      const policy = policyFor(t);
      if (!policy) throw new Error(`no rule for ${t}`);
      const seen = writes.get(t) ?? { allowed: 0, refused: 0 };
      for (const old of (rows[t] ?? []).map(view)) {
        const next = { id: old.id, doc: { ...old.doc, _t: 1 } };
        const saved = await upsertWorks(db, id, t, next);
        const expected = mayUpsert(policy, p, old, next, lookup);
        if (saved !== expected) mismatches.push(`save ${t} ${old.id}: database ${saved}, server ${expected}`);
        if (saved) seen.allowed++;
        else seen.refused++;
        // a row that others point at cannot be deleted whoever asks: the foreign key stops it, not the policy
        if (referenced.has(old.id)) continue;
        const gone = await happens(db, id, `delete from public.${t} where id = $1`, [old.id]);
        if (gone !== mayDelete(policy, p, old, lookup)) mismatches.push(`delete ${t} ${old.id}: database ${gone}, server ${mayDelete(policy, p, old, lookup)}`);
      }
      writes.set(t, seen);
    }
    expect(mismatches).toEqual([]);
  });

  it('saves: for every table some saves happen and some are refused (the comparison can fail)', () => {
    for (const t of TABLES) {
      if (!rows[t]?.length) continue;
      expect(writes.get(t)?.allowed, `${t}: saves that happened`).toBeGreaterThan(0);
      expect(writes.get(t)?.refused, `${t}: saves that were refused`).toBeGreaterThan(0);
    }
  });
});
