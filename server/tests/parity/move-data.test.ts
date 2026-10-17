/* The data move (scripts/database/move-data.mjs and lib/move.mjs) run for real: the app's demo workspace is cut into the hub and
   the six division projects, written through the very functions the deployed projects have (import_workspace and
   load_workspace in the hub, apply_rows and load_rows in a division), read back and compared row by row. The projects are
   PGlite databases that have had the real migrations. The step that talks to Supabase over HTTP is checked against a
   stand-in that records what it was asked. */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { freshDb, migrationsIn } from './pg.ts';

interface Row {
  id: string;
  pos: number;
  doc: Record<string, unknown>;
}
type Rows = Record<string, Row[]>;
interface Target {
  apply: (payload: string) => Promise<unknown>;
  load: () => Promise<Rows>;
  setEmails?: (map: Record<string, string>) => Promise<void>;
}
interface Result {
  project: string;
  ok: boolean;
  written: number;
  problems: string[];
  extra: string[];
  counts?: Record<string, { sent: number; found: number }>;
}
interface MoveLib {
  PROJECTS: string[];
  partitionRows: (rows: Rows) => Record<string, Rows>;
  planOf: (parts: Record<string, Rows>) => Record<string, Record<string, number>>;
  danglingCrossReferences: (rows: Rows) => string[];
  compareProject: (project: string, sent: Rows, found: Rows) => { ok: boolean; problems: string[] };
  moveProject: (o: { project: string; rows: Rows; target: Target; apply: boolean; allowExtra?: boolean; emails?: Record<string, string> | null }) => Promise<Result>;
  parseTargets: (arg: string | undefined) => string[] | null;
  credentialsFor: (project: string, env: Record<string, string | undefined>) => { url: string; key: string };
  assertDistinctProjects: (creds: Record<string, { url: string; key: string }>) => void;
  supabaseTarget: (project: string, c: { url: string; key: string }) => Promise<Target>;
}

const root = join(import.meta.dirname, '../../..');
let lib: MoveLib;
let rows: Rows;
let workspace: unknown;
const hubDb = {} as { hub: PGlite };
const spokes = {} as Record<string, PGlite>;
let legacy: PGlite;

const asService = async <T>(db: PGlite, fn: () => Promise<T>): Promise<T> => {
  await db.exec('set role service_role');
  try {
    return await fn();
  } finally {
    await db.exec('reset role');
  }
};

/** A project as the move command sees it: the same functions it calls on Supabase, answered by PGlite as the service role. */
function pgTarget(project: string, db: PGlite): Target {
  const hubLike = project === 'hub' || project === 'legacy';
  return {
    apply: (payload) => asService(db, async () => (await db.query(`select public.${hubLike ? 'import_workspace' : 'apply_rows'}($1) as r`, [payload])).rows),
    load: () =>
      asService(db, async () => (await db.query<{ r: Rows }>(hubLike ? 'select public.load_workspace() as r' : 'select public.load_rows(null) as r')).rows[0]?.r ?? {}),
    ...(hubLike
      ? {
          setEmails: async (map: Record<string, string>) => {
            for (const [id, email] of Object.entries(map)) await db.query('update public.people set email = $2 where id = $1', [id, email.trim().toLowerCase()]);
          },
        }
      : {}),
  };
}
/** A value that must be there: a missing one fails the test with a name instead of hiding behind an assertion. */
function need<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`The test needs ${what}.`);
  return value;
}
/** The rows of one project from a cut workspace. */
const part = (parts: Record<string, Rows>, project: string): Rows => need(parts[project], `the rows of ${project}`);
const cut = (project: string): Rows => part(lib.partitionRows(rows), project);
const spoke = (slug: string): PGlite => need(spokes[slug], `the ${slug} project`);
const targetOf = (project: string): Target => pgTarget(project, project === 'hub' ? hubDb.hub : project === 'legacy' ? legacy : spoke(project));

beforeAll(async () => {
  // @ts-expect-error plain JavaScript modules without type declarations
  lib = (await import('../../../scripts/database/lib/move.mjs')) as MoveLib;
  // @ts-expect-error plain JavaScript modules without type declarations
  const shape = (await import('../../../scripts/database/lib/workspace-shape.mjs')) as { decompose: (db: unknown) => Rows };
  workspace = JSON.parse(readFileSync(join(root, 'database/seeds/demo-workspace.json'), 'utf8'));
  rows = shape.decompose(workspace);
  hubDb.hub = await freshDb(migrationsIn('hub/migrations'));
  for (const slug of ['ee', 'mcit', 'hr', 'fnl', 'sng', 'cons']) spokes[slug] = await freshDb([...migrationsIn('spoke/base/migrations'), ...migrationsIn(`spoke/${slug}/migrations`)]);
  legacy = await freshDb(migrationsIn('migrations'));
}, 240_000);
afterAll(async () => {
  await hubDb.hub.close();
  for (const db of Object.values(spokes)) await db.close();
  await legacy.close();
});

const total = (r: Rows) => Object.values(r).reduce((n, l) => n + l.length, 0);

describe('cutting a workspace into the seven projects', () => {
  it('puts every row in exactly one project, and keeps the division tables out of the hub', () => {
    const parts = lib.partitionRows(rows);
    expect(Object.keys(parts)).toEqual(['hub', 'ee', 'mcit', 'hr', 'fnl', 'sng', 'cons']);
    expect(Object.values(parts).reduce((n, p) => n + total(p), 0)).toBe(total(rows));
    expect(Object.keys(parts.hub ?? {}).filter((t) => /^(hr|sng|ee|cons|fnl|mcit)_/.test(t))).toEqual([]);
    expect(Object.keys(parts.hr ?? {}).filter((t) => t !== 'store_values')).toEqual(expect.arrayContaining(['hr_assessments', 'hr_cycles']));
    expect(Object.keys(parts.hr ?? {}).every((t) => t === 'store_values' || t.startsWith('hr_'))).toBe(true);
  });

  it('sends each stored value to the project it belongs to', () => {
    const parts = lib.partitionRows(rows);
    const ids = (p: string) => (parts[p]?.store_values ?? []).map((r) => r.id).sort();
    expect(ids('fnl')).toEqual(expect.arrayContaining(['fnl.grants', 'fnl.policy']));
    expect(ids('mcit')).toEqual(expect.arrayContaining(['mcit.grants']));
    expect(ids('hub')).toEqual(expect.arrayContaining(['acct.office', 'lookV']));
    expect(ids('hub').some((id) => /^(fnl|hr|sng|ee|cons|mcit)\./.test(id))).toBe(false);
  });

  it('counts rows per project and table, leaving empty tables out', () => {
    const plan = lib.planOf(lib.partitionRows(rows));
    expect(plan.sng).toEqual({ sng_initiatives: 8, sng_packets: 8, store_values: 1 });
    expect(plan.hr?.hr_assessments).toBe(19);
    expect(Object.values(plan).every((p) => Object.values(p).every((n) => n > 0))).toBe(true);
  });

  it('refuses a stored value or a table that belongs to no project', () => {
    expect(() => lib.partitionRows({ ...rows, store_values: [...(rows.store_values ?? []), { id: 'moon.v', pos: 99, doc: { value: 1 } }] })).toThrow(/belongs to no project/);
    expect(() => lib.partitionRows({ ...rows, pg_user: [{ id: 'x', pos: 0, doc: {} }] })).toThrow(/belong to no project/);
  });

  it('finds a reference between projects that points at nothing, which no foreign key can catch any more', () => {
    expect(lib.danglingCrossReferences(rows)).toEqual([]);
    const init = rows.sng_initiatives?.[0];
    if (!init) throw new Error('no initiative');
    const bad = { ...rows, sng_initiatives: [{ ...init, doc: { ...init.doc, project: 'p-does-not-exist' } }, ...(rows.sng_initiatives ?? []).slice(1)] };
    expect(lib.danglingCrossReferences(bad)).toEqual([expect.stringContaining('sng_initiatives.project -> projects')]);
  });
});

describe('looking first, with nothing written', () => {
  it('on empty projects says what a move would add, and leaves every project empty', async () => {
    const parts = lib.partitionRows(rows);
    for (const p of lib.PROJECTS) {
      const r = await lib.moveProject({ project: p, rows: part(parts, p), target: targetOf(p), apply: false });
      expect(r.ok).toBe(true);
      expect(r.written).toBe(0);
      expect(r.problems.filter((x) => x.startsWith('MISSING')).length, p).toBe(total(part(parts, p)));
    }
    expect(Number((await spokes.hr?.query<{ n: string }>('select count(*) as n from public.hr_assessments'))?.rows[0]?.n)).toBe(0);
    expect(Number((await hubDb.hub.query<{ n: string }>('select count(*) as n from public.people')).rows[0]?.n)).toBe(0);
  });
});

describe('moving all seven projects', () => {
  let results: Result[];
  beforeAll(async () => {
    const parts = lib.partitionRows(rows);
    results = [];
    for (const p of lib.PROJECTS) results.push(await lib.moveProject({ project: p, rows: part(parts, p), target: targetOf(p), apply: true }));
  }, 120_000);

  it('moves and verifies every project, writing as many rows as the plan says', () => {
    expect(results.map((r) => [r.project, r.ok])).toEqual(lib.PROJECTS.map((p) => [p, true]));
    const plan = lib.planOf(lib.partitionRows(rows));
    for (const r of results) expect(r.written, r.project).toBe(Object.values(plan[r.project] ?? {}).reduce((a, n) => a + n, 0));
    expect(results.reduce((n, r) => n + r.written, 0)).toBe(total(rows));
  });

  it('left each project with its own rows, counted by an independent query', async () => {
    const n = async (db: PGlite, table: string) => Number((await db.query<{ n: string }>(`select count(*) as n from public.${table}`)).rows[0]?.n);
    expect(await n(hubDb.hub, 'people')).toBe(rows.people?.length);
    expect(await n(hubDb.hub, 'tasks')).toBe(rows.tasks?.length);
    expect(await n(spoke('hr'), 'hr_assessments')).toBe(19);
    expect(await n(spoke('fnl'), 'fnl_requests')).toBe(10);
    expect(await n(spoke('sng'), 'sng_initiatives')).toBe(8);
    expect(await n(spoke('cons'), 'cons_kn')).toBe(4);
  });

  it('kept every record exactly as it was, key order included', async () => {
    const doc = rows.sng_initiatives?.[0]?.doc;
    if (!doc) throw new Error('no initiative');
    const stored = await spokes.sng?.query<{ doc: string }>('select doc::text as doc from public.sng_initiatives where id = $1', [rows.sng_initiatives?.[0]?.id]);
    expect(stored?.rows[0]?.doc).toBe(JSON.stringify(doc));
  });

  it('puts the stored values where they belong and nowhere else', async () => {
    const ids = async (db: PGlite) => (await db.query<{ id: string }>('select id from public.store_values order by id')).rows.map((r) => r.id);
    expect(await ids(spoke('fnl'))).toEqual(expect.arrayContaining(['fnl.grants']));
    expect((await ids(spoke('fnl'))).every((id) => id.startsWith('fnl.'))).toBe(true);
    expect((await ids(hubDb.hub)).some((id) => id.startsWith('fnl.'))).toBe(false);
  });

  it('now looks the same as the source: a second look finds nothing to add or change', async () => {
    const parts = lib.partitionRows(rows);
    for (const p of lib.PROJECTS) {
      const r = await lib.moveProject({ project: p, rows: part(parts, p), target: targetOf(p), apply: false });
      expect(r.problems, p).toEqual([]);
    }
  });

  it('is safe to run again: the same move twice leaves the same rows', async () => {
    const parts = lib.partitionRows(rows);
    for (const p of ['hub', 'hr']) {
      const again = await lib.moveProject({ project: p, rows: part(parts, p), target: targetOf(p), apply: true });
      expect(again.ok, p).toBe(true);
    }
  });

  it('notices a record that was changed, a row that went missing, and a record whose keys came back in another order', () => {
    const parts = lib.partitionRows(rows);
    const packets = parts.sng?.sng_packets ?? [];
    const first = need(packets[0], 'a packet');
    const changed = packets.map((r) => (r.id === first.id ? { ...r, doc: { ...r.doc, question: 'something else' } } : r));
    expect(lib.compareProject('sng', { sng_packets: changed }, { sng_packets: packets }).problems).toContain(`DIFFERENT sng_packets ${first.id}`);
    expect(lib.compareProject('sng', { sng_packets: packets }, { sng_packets: packets.slice(1) }).problems).toEqual([`COUNT sng_packets: sent ${packets.length}, found ${packets.length - 1}`, `MISSING sng_packets ${first.id}`]);
    const reordered = packets.map((r) => (r.id === first.id ? { ...r, doc: Object.fromEntries(Object.entries(r.doc).reverse()) } : r));
    expect(lib.compareProject('sng', { sng_packets: packets }, { sng_packets: reordered }).problems).toEqual([`DIFFERENT sng_packets ${first.id}`]);
    expect(lib.compareProject('sng', { sng_packets: packets }, { sng_packets: packets }).problems).toEqual([]);
  });
});

describe('a project that already holds other rows', () => {
  beforeEach(async () => {
    await spokes.cons?.query(`delete from public.cons_dlv where id = 'stray'`);
  });

  it('is left alone unless told otherwise, and the stray rows are named', async () => {
    await spokes.cons?.query(`insert into public.cons_dlv (id, doc) values ('stray', '{"id":"stray"}')`);
    const parts = lib.partitionRows(rows);
    const cons = part(parts, 'cons');
    const changed: Rows = { ...cons, cons_kn: (cons.cons_kn ?? []).map((r, i) => (i === 0 ? { ...r, doc: { ...r.doc, note: 'new' } } : r)) };
    const refused = await lib.moveProject({ project: 'cons', rows: changed, target: targetOf('cons'), apply: true });
    expect(refused.ok).toBe(false);
    expect(refused.extra).toEqual(['cons_dlv stray']);
    expect(refused.problems[0]).toMatch(/Nothing was written/);
    expect(refused.written).toBe(0);
    const stored = await spokes.cons?.query<{ doc: Record<string, unknown> }>('select doc from public.cons_kn where id = $1', [cons.cons_kn?.[0]?.id]);
    expect(stored?.rows[0]?.doc.note).toBeUndefined(); // the change was not made

    const accepted = await lib.moveProject({ project: 'cons', rows: changed, target: targetOf('cons'), apply: true, allowExtra: true });
    expect(accepted.problems).toEqual([]);
    expect(accepted.ok).toBe(true);
    expect(accepted.extra).toEqual(['cons_dlv stray']);
    const after = await spokes.cons?.query<{ n: string }>(`select count(*) as n from public.cons_dlv where id = 'stray'`);
    expect(Number(after?.rows[0]?.n)).toBe(1); // a move never deletes
    await lib.moveProject({ project: 'cons', rows: cons, target: targetOf('cons'), apply: true, allowExtra: true });
  });

  it('only reports them when just looking', async () => {
    await spokes.cons?.query(`insert into public.cons_dlv (id, doc) values ('stray', '{"id":"stray"}')`);
    const r = await lib.moveProject({ project: 'cons', rows: cut('cons'), target: targetOf('cons'), apply: false });
    expect(r.ok).toBe(true);
    expect(r.extra).toEqual(['cons_dlv stray']);
  });
});

describe('when something goes wrong', () => {
  it('a project that fails to save rejects, and the others are not affected; a second run finishes the job', async () => {
    const hr = cut('hr');
    await spokes.hr?.exec('delete from public.hr_actions; delete from public.hr_assessments; delete from public.hr_notices; delete from public.hr_packets; delete from public.hr_onboarding_instances');
    const failing: Target = { ...targetOf('hr'), apply: () => Promise.reject(new Error('hr: apply_rows failed: connection reset')) };
    await expect(lib.moveProject({ project: 'hr', rows: hr, target: failing, apply: true })).rejects.toThrow(/connection reset/);
    const sng = await lib.moveProject({ project: 'sng', rows: cut('sng'), target: targetOf('sng'), apply: true });
    expect(sng.ok).toBe(true);
    const retry = await lib.moveProject({ project: 'hr', rows: hr, target: targetOf('hr'), apply: true });
    expect(retry.ok).toBe(true);
  });

  it('a project that reads back differently is reported as failed, not as moved', async () => {
    const sng = cut('sng');
    const lying: Target = { ...targetOf('sng'), load: async () => ({ ...(await targetOf('sng').load()), sng_packets: [] }) };
    const r = await lib.moveProject({ project: 'sng', rows: sng, target: lying, apply: true });
    expect(r.ok).toBe(false);
    expect(r.problems.some((p) => p.startsWith('MISSING sng_packets'))).toBe(true);
  });

  it('e-mail addresses go to the hub only, lower-cased', async () => {
    const hub = cut('hub');
    const first = need(rows.people?.[0]?.id, 'a person');
    const r = await lib.moveProject({ project: 'hub', rows: hub, target: targetOf('hub'), apply: true, emails: { [first]: '  Eka@Example.ORG ' } });
    expect(r.ok).toBe(true);
    expect((await hubDb.hub.query<{ email: string }>('select email from public.people where id = $1', [first])).rows[0]?.email).toBe('eka@example.org');
    await expect(lib.moveProject({ project: 'sng', rows: cut('sng'), target: targetOf('sng'), apply: true, emails: { [first]: 'x@y.z' } })).rejects.toThrow(/belong to the hub/);
  });
});

describe('the single database of today (--target legacy)', () => {
  it('still takes the whole workspace in one project, and verifies it', async () => {
    const r = await lib.moveProject({ project: 'legacy', rows, target: targetOf('legacy'), apply: true });
    expect(r.ok).toBe(true);
    expect(r.written).toBe(total(rows));
    expect(Number((await legacy.query<{ n: string }>('select count(*) as n from public.hr_assessments')).rows[0]?.n)).toBe(19);
  });
});

describe('choosing projects and finding their addresses', () => {
  it('reads --target', () => {
    expect(lib.parseTargets(undefined)).toBeNull();
    expect(lib.parseTargets('all')).toEqual(lib.PROJECTS);
    expect(lib.parseTargets('hub')).toEqual(['hub']);
    expect(lib.parseTargets('spoke:hr, spoke:fnl')).toEqual(['hr', 'fnl']);
    expect(lib.parseTargets('legacy')).toEqual(['legacy']);
    expect(() => lib.parseTargets('spoke:moon')).toThrow(/Unknown target: moon/);
    expect(() => lib.parseTargets('')).not.toThrow();
  });

  it('finds the address and key of a project, with the old names for the hub only', () => {
    const env = { SUPABASE_URL_HR: 'https://hr.example/', SUPABASE_SERVICE_KEY_HR: 'k-hr', SUPABASE_URL: 'https://old.example', SUPABASE_SERVICE_ROLE_KEY: 'k-old' };
    expect(lib.credentialsFor('hr', env)).toEqual({ url: 'https://hr.example', key: 'k-hr' });
    expect(lib.credentialsFor('hub', env)).toEqual({ url: 'https://old.example', key: 'k-old' });
    expect(lib.credentialsFor('legacy', env)).toEqual({ url: 'https://old.example', key: 'k-old' });
    expect(() => lib.credentialsFor('fnl', env)).toThrow(/SUPABASE_URL_FNL and SUPABASE_SERVICE_KEY_FNL/);
    expect(() => lib.credentialsFor('fnl', env)).not.toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it('refuses two projects at the same address', () => {
    expect(() => { lib.assertDistinctProjects({ hub: { url: 'https://a.example', key: 'k' }, hr: { url: 'https://b.example', key: 'k' } }); }).not.toThrow();
    expect(() => { lib.assertDistinctProjects({ hub: { url: 'https://a.example', key: 'k' }, hr: { url: 'https://a.example', key: 'k2' } }); }).toThrow(/same address \(a\.example\)/);
  });
});

describe('talking to Supabase', () => {
  interface Seen { path: string; body: string; apikey: string | undefined; authorization: string | undefined }
  let server: Server;
  let base = '';
  const seen: Seen[] = [];
  beforeAll(async () => {
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (d: Buffer) => {
        body += d.toString();
      });
      req.on('end', () => {
        seen.push({ path: req.url ?? '', body, apikey: req.headers.apikey as string | undefined, authorization: req.headers.authorization });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{}');
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => {
    server.close();
  });

  it('calls the hub\'s import and load functions, and a division\'s apply and load functions, with that project\'s own service key', async () => {
    seen.length = 0;
    const hub = await lib.supabaseTarget('hub', { url: base, key: 'key-hub' });
    const hr = await lib.supabaseTarget('hr', { url: base, key: 'key-hr' });
    await hub.apply('{"tasks":{"upsert":[]}}');
    await hub.load();
    await hr.apply('{"hr_notices":{"upsert":[]}}');
    await hr.load();
    expect(seen.map((s) => s.path)).toEqual(['/rest/v1/rpc/import_workspace', '/rest/v1/rpc/load_workspace', '/rest/v1/rpc/apply_rows', '/rest/v1/rpc/load_rows']);
    expect(JSON.parse(seen[0]?.body ?? '')).toEqual({ p: '{"tasks":{"upsert":[]}}' });
    expect(JSON.parse(seen[2]?.body ?? '')).toEqual({ p: '{"hr_notices":{"upsert":[]}}' });
    expect(JSON.parse(seen[3]?.body ?? '')).toEqual({ p_tables: null });
    expect(seen.map((s) => s.apikey)).toEqual(['key-hub', 'key-hub', 'key-hr', 'key-hr']);
    expect(seen.every((s, i) => s.authorization === `Bearer ${i < 2 ? 'key-hub' : 'key-hr'}`)).toBe(true);
  });
});

describe('the command', () => {
  const run = (...args: string[]) => spawnSync('node', [join(root, 'scripts/database/move-data.mjs'), ...args], { encoding: 'utf8', env: { PATH: process.env.PATH ?? '' } });

  it('checks the demo workspace without any connection, and says what it holds per project', () => {
    const r = run('--demo');
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/sng\s+sng_initiatives\s+8/);
    expect(r.stdout).toMatch(/every table and stored value has exactly one project/);
    expect(r.stdout).toMatch(/Check only/);
  });

  it('will not move anything without an explicit target, and says so', () => {
    const r = run('--demo', '--apply');
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/--apply needs an explicit --target/);
  });

  it('names the missing settings of a project rather than failing obscurely, and refuses an unknown target', () => {
    expect(run('--demo', '--target', 'spoke:hr').stderr).toMatch(/SUPABASE_URL_HR and SUPABASE_SERVICE_KEY_HR/);
    expect(run('--demo', '--target', 'moon').stderr).toMatch(/Unknown target: moon/);
  });

  it('refuses two projects at the same address before connecting to either', () => {
    const r = spawnSync('node', [join(root, 'scripts/database/move-data.mjs'), '--demo', '--target', 'hub,spoke:hr'], {
      encoding: 'utf8',
      env: { PATH: process.env.PATH ?? '', SUPABASE_URL_HUB: 'https://same.example', SUPABASE_SERVICE_KEY_HUB: 'a', SUPABASE_URL_HR: 'https://same.example', SUPABASE_SERVICE_KEY_HR: 'b' },
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/same address/);
  });
});
