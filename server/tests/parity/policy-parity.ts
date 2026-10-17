/* The comparison every division's rules go through. For a list of tables with fixture rows it loads the single-database
   schema (the row level security the app has today) into PGlite, inserts the same rows, and for every person in the cast
   checks that the TypeScript rule and the database's policies agree on: which rows can be read, and whether each insert,
   update (allowed on the row as it is AND as it would become) and delete would be allowed.
   Each table also proves it is not comparing two empty answers: some people read and some do not, and some writes
   happen and some are refused. */
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mayDelete, mayRead, mayUpsert, policyFor, type Lookup, type RowView } from '../../src/lib/policy/index.ts';
import { CAST, asUser, freshDb, happens, migrationsIn, principalOf, seedHubFixture, upsertWorks, type Persona } from './pg.ts';

export type Doc = Record<string, unknown>;
export const row = (id: string, doc: Doc = {}): RowView => ({ id, doc: { id, ...doc } });

export interface TableCase {
  name: string;
  /** Fixture rows, inserted in the order the cases are listed (parents of a foreign key first). */
  rows: RowView[];
  /** Rows other rows point at by foreign key: nobody can delete them, the key stops it, not the policy. */
  noDelete?: string[];
  /** New documents, relative to whoever saves them (their id, their division). */
  variants: (me: Persona) => Doc[];
  /** Partial changes made to every existing row: an update must be allowed on the row as it is and as it becomes. */
  changes: (me: Persona) => Doc[];
  /** Every active person may read some of it by design, so "somebody reads nothing" is not required. */
  openToAll?: boolean;
}

export function parityTests(cases: TableCase[]): { db: () => PGlite } {
  let db: PGlite;
  // a rule that looks at another row of the division (an assessment and its cycle) finds it among the fixtures
  const lookup: Lookup = (table, id) => cases.find((c) => c.name === table)?.rows.find((r) => r.id === id);
  beforeAll(async () => {
    db = await freshDb(migrationsIn('migrations'));
    await seedHubFixture(db);
    for (const c of cases) {
      for (const r of c.rows) await db.query(`insert into public.${c.name} (id, doc) values ($1, $2)`, [r.id, JSON.stringify(r.doc)]);
    }
  }, 120_000);
  afterAll(async () => {
    await db.close();
  });

  describe.each(cases.map((c) => [c.name, c] as const))('%s: the database and the server give every person the same access', (_name, c) => {
    const policy = policyFor(c.name);
    const seen = { readers: 0, hidden: 0, allowed: 0, refused: 0 };

    it('has a server rule', () => {
      expect(policy).toBeDefined();
    });

    it.each(CAST.map((p) => [p.id]))('reads: %s', async (id) => {
      if (!policy) throw new Error('no rule');
      const p = await principalOf(id);
      const server = c.rows.filter((r) => mayRead(policy, p, r, lookup)).map((r) => r.id).sort();
      const sql = await asUser(db, id, async () => (await db.query<{ id: string }>(`select id from public.${c.name} order by id`)).rows.map((r) => r.id));
      expect(server).toEqual(sql);
      if (sql.length > 0) seen.readers++;
      if (sql.length < c.rows.length) seen.hidden++;
    });

    it.each(CAST.map((p) => [p.id]))('inserts, updates and deletes: %s', async (id) => {
      if (!policy) throw new Error('no rule');
      const me = CAST.find((p) => p.id === id);
      if (!me) throw new Error(`unknown person ${id}`);
      const p = await principalOf(id);
      const mismatches: string[] = [];
      const check = (what: string, sql: boolean, server: boolean) => {
        if (sql !== server) mismatches.push(`${what}: database ${sql}, server ${server}`);
        if (sql) seen.allowed++;
        else seen.refused++;
      };

      for (const [i, v] of c.variants(me).entries()) {
        const next = row(`new_${i}`, { ...v, _t: 1 });
        check(`save new ${JSON.stringify(v)}`, await upsertWorks(db, id, c.name, next), mayUpsert(policy, p, undefined, next, lookup));
      }
      for (const old of c.rows) {
        for (const change of c.changes(me)) {
          // `_t` makes the record differ, so the save is never a no-op the database skips
          const next = row(old.id, { ...old.doc, ...change, _t: 1 });
          check(`save ${old.id} with ${JSON.stringify(change)}`, await upsertWorks(db, id, c.name, next), mayUpsert(policy, p, old, next, lookup));
        }
        if (c.noDelete?.includes(old.id)) continue;
        check(`delete ${old.id}`, await happens(db, id, `delete from public.${c.name} where id = $1`, [old.id]), mayDelete(policy, p, old, lookup));
      }
      expect(mismatches).toEqual([]);
    });

    it('is not trivial: some people read and some do not, some writes happen and some are refused', () => {
      expect(seen.readers, 'people who can read something').toBeGreaterThan(0);
      expect(seen.readers, 'people who can read something').toBeLessThan(CAST.length);
      if (!c.openToAll) expect(seen.hidden, 'people who cannot read every row').toBeGreaterThan(0);
      expect(seen.allowed, 'writes that happened').toBeGreaterThan(0);
      expect(seen.refused, 'writes that were refused').toBeGreaterThan(0);
    });
  });

  return { db: () => db };
}
