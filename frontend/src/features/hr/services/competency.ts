/* The competency matrix (HR brief: "Competency Matrix", target 100% of analysts; Consulting brief: "maintained jointly with
   HR" for team formation). One profile per member with a level per competency of the framework. HR keeps it; Consulting reads
   it when it staffs an engagement and sees only who is ready (Independent or above), never the lower levels. Access is the
   same as database/schema/schema-spec.mjs `hr_competencies` and server/src/lib/policy/hr.ts. */
import { t } from '@/lib/i18n';
import { isBoard, isTopOrAdmin, hrStaff } from '@/lib/roles';
import { nowStamp } from '@/lib/time';
import { logChange } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { visibleDivs } from '@/lib/access';
import type { EntityRef, Person, PersonId, Workspace } from '@/types/workspace';
import { FRAMEWORK, READY } from './competency-framework';
import { hrDraft, type HrCompetency } from './hr-data';

export { FRAMEWORK, LEVELS, READY } from './competency-framework';

export const compId = (pid: PersonId) => `cm-${pid}`;

/** Every saved profile the viewer may read (none while nobody has been rated yet). */
export const compsOf = (db: Workspace): HrCompetency[] =>
  (db.hr as { competencies?: HrCompetency[] } | undefined)?.competencies ?? [];

export const profileOf = (db: Workspace, pid: PersonId | null | undefined) =>
  pid ? compsOf(db).find((c) => c.person === pid) : undefined;

/** A level that was really recorded (0 to 4); anything else counts as not rated. */
export const levelOf = (c: HrCompetency | undefined, k: string): number | null => {
  const v = c?.levels[k];
  return typeof v === 'number' && v >= 0 && v <= 4 ? v : null;
};

/** A profile counts once at least one competency has a level. */
export const isRated = (c: HrCompetency | undefined) => FRAMEWORK.competencies.some((x) => levelOf(c, x.k) !== null);

/** The people the matrix covers: active members, the Board excluded. */
export const matrixPeople = (db: Workspace) => db.people.filter((p) => p.status === 'active' && !isBoard(p));

/** The matrix page and changes to it: HR, the President, the VP and the Admin (the table's write rule). */
export const canEditComps = (m: Person | undefined) => !!m && !isBoard(m) && (hrStaff(m) || isTopOrAdmin(m));
export const canSeeMatrix = canEditComps;

/** Reading other people's profiles: the editors and Consulting (staffing), never the Board. */
export const canReadComps = (m: Person | undefined) =>
  canEditComps(m) || (!!m && !isBoard(m) && visibleDivs(m).includes('cons'));

/** Competencies of a staffing request this member is ready for (level Independent or above). */
export const readyFor = (db: Workspace, pid: PersonId, keys: readonly string[]) => {
  const c = profileOf(db, pid);
  return keys.filter((k) => (levelOf(c, k) ?? -1) >= READY);
};

/** How many members are at Independent or above, per competency. */
export const readyCounts = (db: Workspace, people: Person[]) =>
  Object.fromEntries(
    FRAMEWORK.competencies.map((x) => [
      x.k,
      people.filter((p) => (levelOf(profileOf(db, p.id), x.k) ?? -1) >= READY).length,
    ]),
  );

const link = (db: Workspace, pid: PersonId): EntityRef => ({
  type: 'link',
  id: compId(pid),
  name: db.people.find((p) => p.id === pid)?.name ?? '',
  h: `competencies/${pid}`,
});

/** Keeps only real levels of the framework's competencies. */
const cleanLevels = (levels: Record<string, number | null | undefined>) => {
  const out: Record<string, number> = {};
  for (const x of FRAMEWORK.competencies) {
    const v = levels[x.k];
    if (typeof v === 'number' && v >= 0 && v <= 4) out[x.k] = Math.round(v);
  }
  return out;
};

/** Saves a member's profile. The earlier levels stay in the history (newest first, ten kept); Undo puts the old profile back. */
export function saveProfile(
  pid: PersonId,
  f: { levels: Record<string, number | null | undefined>; sectors: string; evidence: string },
) {
  const m = getMe();
  const db0 = getDb();
  if (!m || !canEditComps(m) || !db0.people.some((p) => p.id === pid)) return Promise.resolve(false);
  const before = profileOf(db0, pid);
  const kept = before ? (JSON.parse(JSON.stringify(before)) as HrCompetency) : null;
  const levels = cleanLevels(f.levels);
  return act(({ db, toast }) => {
    const h = hrDraft(db);
    h.competencies ??= [];
    const list = h.competencies;
    const at = nowStamp();
    const old = list.find((c) => c.person === pid);
    if (old) {
      old.history = [{ levels: { ...old.levels }, by: old.by, at: old.at }, ...old.history].slice(0, 10);
      old.levels = levels;
      old.sectors = f.sectors;
      old.evidence = f.evidence;
      old.by = m.id;
      old.at = at;
    } else {
      list.push({
        id: compId(pid),
        person: pid,
        levels,
        sectors: f.sectors,
        evidence: f.evidence,
        by: m.id,
        at,
        history: [],
      });
    }
    const verb = old ? 'updated the competency profile of' : 'recorded the competency profile of';
    logChange(db, 'hr', verb, link(db, pid));
    toast(t('Competency profile saved'), ({ db: u }) => {
      const hu = hrDraft(u);
      const l = hu.competencies ?? [];
      const i = l.findIndex((c) => c.person === pid);
      if (i < 0) return;
      if (kept) l[i] = kept;
      else l.splice(i, 1);
    });
  });
}
