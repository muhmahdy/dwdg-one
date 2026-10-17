/* A real Postgres (PGlite, in this process) for the parity tests: the database's own helper functions and row level
   security policies run next to the server's TypeScript rules, over the same people and rows, and must agree.
   Supabase pieces the migrations lean on (roles, auth.users, auth.uid(), auth.jwt()) are stood in for here. */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { resolvePrincipal, type Principal } from '../../src/lib/auth/principal.ts';
import { fakeHub } from '../helpers.ts';

const repo = join(import.meta.dirname, '../../../database');
export const read = (f: string) => readFileSync(join(repo, f), 'utf8').replace(/\r\n/g, '\n');
export const migrationsIn = (d: string) =>
  readdirSync(join(repo, d))
    .sort()
    .map((f) => `${d}/${f}`);

const STUBS = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; create role supabase_auth_admin nologin;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema public, auth to anon, authenticated, service_role;
grant select on auth.users to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to authenticated, service_role;
alter default privileges in schema public grant all on sequences to authenticated, service_role;
alter default privileges in schema public grant execute on functions to authenticated, service_role;
`;

export async function freshDb(files: string[]): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(STUBS);
  for (const f of files) await db.exec(read(f));
  return db;
}

export const uidOf = (p: string): string => {
  const h = createHash('md5').update(`dwdg-test-${p}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

export interface Persona {
  id: string;
  div: string | null;
  role: string | null;
  admin?: boolean;
  status?: string;
}

/** Everyone the checks look at: every role, several divisions, a Board account, people who are not active. */
export const CAST: Persona[] = [
  { id: 'adm', div: 'sng', role: 'director', admin: true },
  { id: 'pres', div: null, role: 'president' },
  { id: 'vpx', div: null, role: 'vp' },
  { id: 'brd', div: null, role: 'board' },
  { id: 'dir_sng', div: 'sng', role: 'director' },
  { id: 'cod_sng', div: 'sng', role: 'codirector' },
  { id: 'mem_sng', div: 'sng', role: 'member' },
  { id: 'mem_sng2', div: 'sng', role: 'member' },
  { id: 'dir_ee', div: 'ee', role: 'director' },
  { id: 'mem_ee', div: 'ee', role: 'member' },
  { id: 'mem_fnl', div: 'fnl', role: 'member' },
  { id: 'hr_dir', div: 'hr', role: 'director' },
  { id: 'hr_cod', div: 'hr', role: 'codirector' },
  { id: 'hr_mem', div: 'hr', role: 'member' },
  { id: 'mem_mcit', div: 'mcit', role: 'member' },
  { id: 'cod_cons', div: 'cons', role: 'codirector' },
  { id: 'newbie', div: 'ee', role: 'member', status: 'pending' },
  { id: 'susp', div: 'sng', role: 'director', status: 'suspended' },
  { id: 'adm_pending', div: 'sng', role: 'director', admin: true, status: 'pending' },
  // Active, but the record names no role: a policy that says `not is_board()` is then null, which refuses.
  { id: 'norole', div: 'sng', role: null },
  { id: 'norole_mcit', div: 'mcit', role: null }, // reads Marketing & IT: its rule has no `not is_board()`
];

export const DIVISIONS = ['ee', 'mcit', 'hr', 'fnl', 'sng', 'cons'] as const;

/** Projects with a lead or manager, for `is_project_lead`. */
export const PROJECTS = [
  { id: 'p_a', doc: { id: 'p_a', div: 'ee', stage: 'active', org: false, lead: 'dir_ee', team: [] } },
  { id: 'p_b', doc: { id: 'p_b', div: 'ee', stage: 'active', org: false, pm: 'mem_ee', team: [] } },
  { id: 'p_c', doc: { id: 'p_c', div: 'fnl', stage: 'active', org: false, team: [] } },
];

const personDoc = (p: Persona) => ({
  id: p.id,
  name: p.id,
  first: p.id,
  div: p.div,
  role: p.role,
  admin: p.admin ?? false,
  board: p.role === 'board',
  status: p.status ?? 'active',
});

/** The people and projects of the single-database schema, inserted as the owner of the database. */
export async function seedHubFixture(db: PGlite): Promise<void> {
  for (const p of CAST) {
    await db.query('insert into auth.users (id, email) values ($1, $2)', [uidOf(p.id), `${p.id}@dwdg.test`]);
    await db.query('insert into public.people (id, pos, doc, auth_user_id, email) values ($1, 0, $2, $3, $4)', [
      p.id,
      JSON.stringify(personDoc(p)),
      uidOf(p.id),
      `${p.id}@dwdg.test`,
    ]);
  }
  for (const pr of PROJECTS) await db.query('insert into public.projects (id, doc) values ($1, $2)', [pr.id, JSON.stringify(pr.doc)]);
}

/** Runs `fn` as a signed-in person (role `authenticated`, their token subject), then undoes everything it did. */
export async function asUser<T>(db: PGlite, personId: string, fn: () => Promise<T>): Promise<T> {
  await db.exec('begin');
  try {
    await db.query(`select set_config('request.jwt.claim.sub', $1, true)`, [uidOf(personId)]);
    await db.query(`select set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify({ sub: uidOf(personId), email: `${personId}@dwdg.test` }),
    ]);
    await db.exec('set local role authenticated');
    return await fn();
  } finally {
    await db.exec('rollback');
  }
}

/** A statement that either works (true) or is refused by a policy or a trigger (false). A refused UPDATE or DELETE that
    simply sees no row counts as refused too: the change did not happen. */
export async function happens(db: PGlite, personId: string, sql: string, params: unknown[] = []): Promise<boolean> {
  return asUser(db, personId, async () => {
    try {
      const r = await db.query(sql, params);
      return (r.affectedRows ?? 0) === 1;
    } catch {
      return false;
    }
  });
}

const led = (id: string) => PROJECTS.filter((p) => 'lead' in p.doc && p.doc.lead === id || 'pm' in p.doc && p.doc.pm === id).map((p) => p.id);

/** The server's view of a person: resolvePrincipal over a stand-in hub that knows the same cast. */
export async function principalOf(personId: string): Promise<Principal> {
  const people = Object.fromEntries(
    CAST.map((p) => [
      `u-${p.id}`,
      { id: p.id, role: p.role, div: p.div, status: p.status ?? 'active', isAdmin: p.admin ?? false },
    ]),
  );
  const tokens = Object.fromEntries(CAST.map((p) => [`t-${p.id}`, `u-${p.id}`]));
  const ledBy = Object.fromEntries(CAST.map((p) => [p.id, led(p.id)]));
  return resolvePrincipal(fakeHub({ tokens, people, led: ledBy }), `t-${personId}`);
}

/** Saves one record the way the app does, through apply_changes (an upsert), as the person. True when the database stored it. */
export async function upsertWorks(db: PGlite, personId: string, table: string, r: { id: string; doc: Record<string, unknown> }): Promise<boolean> {
  return asUser(db, personId, async () => {
    try {
      const res = await db.query<{ r: Record<string, { upserted: number }> }>('select public.apply_changes($1) as r', [
        JSON.stringify({ [table]: { upsert: [{ id: r.id, pos: 0, doc: r.doc }] } }),
      ]);
      return res.rows[0]?.r[table]?.upserted === 1;
    } catch {
      return false;
    }
  });
}
