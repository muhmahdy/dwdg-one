/* The database's helper functions (schema `app`) and their TypeScript twins (src/lib/auth/rules.ts), asked the same
   questions about the same people. They must give the same answer for every person, so a rule ported by hand cannot drift. */
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  acctManage,
  canMembers,
  hrLead,
  isHrStaff,
  isProjectLead,
  isTopOrAdmin,
  seesDiv,
  unitLead,
} from '../../src/lib/auth/rules.ts';
import { CAST, DIVISIONS, PROJECTS, asUser, freshDb, migrationsIn, principalOf, seedHubFixture } from './pg.ts';

let db: PGlite;
beforeAll(async () => {
  db = await freshDb(migrationsIn('migrations'));
  await seedHubFixture(db);
}, 120_000);
afterAll(async () => {
  await db.close();
});

type Answers = Record<string, boolean | number | null>;

async function fromSql(personId: string): Promise<Answers> {
  const cols = [
    'app.me_active() as active',
    'app.me_admin() as admin',
    'app.is_board() as board',
    'app.is_top() as top',
    'app.is_top_or_admin() as top_or_admin',
    'app.rank() as rank',
    'app.base_rank(app.me_role()) as base_rank',
    'app.can_write() as can_write',
    'app.is_hr_staff() as hr_staff',
    'app.hr_lead() as hr_lead',
    'app.can_members() as can_members',
    'app.acct_manage() as acct_manage',
    ...DIVISIONS.map((d) => `app.sees_div('${d}') as sees_${d}`),
    ...DIVISIONS.map((d) => `app.unit_lead('${d}') as unit_lead_${d}`),
    ...PROJECTS.map((p) => `app.is_project_lead('${p.id}') as lead_${p.id}`),
  ];
  const row = await asUser(db, personId, async () => (await db.query<Answers>(`select ${cols.join(', ')}`)).rows[0] ?? {});
  // A policy treats null ("not known") like false, so the comparison does too.
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? false]));
}

async function fromServer(personId: string): Promise<Answers> {
  const p = await principalOf(personId);
  return {
    active: p.active,
    admin: p.admin,
    board: p.board,
    top: p.top,
    top_or_admin: isTopOrAdmin(p),
    rank: p.rank,
    base_rank: p.baseRank,
    can_write: p.canWrite,
    hr_staff: isHrStaff(p),
    hr_lead: hrLead(p),
    can_members: canMembers(p),
    acct_manage: acctManage(p),
    ...Object.fromEntries(DIVISIONS.map((d) => [`sees_${d}`, seesDiv(p, d)])),
    ...Object.fromEntries(DIVISIONS.map((d) => [`unit_lead_${d}`, unitLead(p, d)])),
    ...Object.fromEntries(PROJECTS.map((pr) => [`lead_${pr.id}`, isProjectLead(p, pr.id)])),
  };
}

describe('helper functions: database and server agree', () => {
  it.each(CAST.map((p) => [p.id]))('%s', async (id) => {
    expect(await fromServer(id)).toEqual(await fromSql(id));
  });

  it('the cast covers every role, the Board, an admin, and people who are not active', () => {
    expect(new Set(CAST.map((p) => p.role))).toEqual(new Set(['president', 'vp', 'director', 'codirector', 'member', 'board', null]));
    expect(CAST.some((p) => p.admin)).toBe(true);
    expect(CAST.filter((p) => (p.status ?? 'active') !== 'active').length).toBeGreaterThanOrEqual(3);
  });

  it('sees_div and unit_lead are not trivially true or false (the comparison can fail)', async () => {
    const sql = await fromSql('mem_ee');
    expect(sql.sees_ee).toBe(true);
    expect(sql.sees_sng).toBe(false);
    expect((await fromSql('pres')).sees_sng).toBe(true);
    expect((await fromSql('dir_ee')).unit_lead_ee).toBe(true);
    expect((await fromSql('dir_ee')).lead_p_a).toBe(true);
  });
});
