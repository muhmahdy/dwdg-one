/* Collaboration (owner, 11 Oct, D60): one way of working together for projects, programs and operations, from screens/people.js.
   - Lead and Manager change the item and its people; Members do the work and can leave.
   - People from the item's own division (or the Presidency) are added at once and told. Someone from another division is
     invited and joins after accepting; their division's leaders get a note.
   - Programs add whole divisions as partners: a partner division's leaders accept for it.
   Records: projects keep lead, pm, team[]; routines keep owners[] (the rotation) and gain lead, manager, invites[]; programs keep
   owner and gain manager, partners[]. */
import type { Draft } from 'immer';
import { rank } from '@/lib/access';
import { divisionOf } from '@/app/config/org';
import { logChange, notify } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { t as tr } from '@/lib/i18n';
import { nowStamp } from '@/lib/time';
import type { DivisionId, Person, PersonId, Program, Project, Routine, Workspace } from '@/types/workspace';
import { isDone, personOf, unitLeads } from '@/features/work/services/selectors';
import { pruneFuture } from '@/features/operations/services/routines';
import { lastSub } from '@/features/work/services/signoff';

export type CpKind = 'project' | 'routine' | 'program';
export type CpRole = 'lead' | 'manager' | 'member';
export const ROLE: Record<CpRole, string> = { lead: 'Lead', manager: 'Manager', member: 'Member' };

export interface CpEntry {
  id: PersonId;
  state: string;
  by: PersonId;
  at?: string;
  direct?: boolean;
  answeredAt?: string;
}

export const homeDiv = (db: Workspace, id: PersonId | null | undefined) => personOf(db, id)?.div ?? null;
export const divName = (d: DivisionId | null | undefined) => (d ? (divisionOf(d)?.short ?? d) : tr('Presidency'));
export const leadersOf = (db: Workspace, d: DivisionId | null | undefined) => (d ? unitLeads(db, d) : []);

// ---------- programs: partner divisions ----------
export const pgPartners = (g: Program) =>
  (g.partners ?? []).filter((v) => v.state === 'joined' || v.state === 'invited');
export const pgDivs = (g: Program): DivisionId[] => [
  g.div,
  ...(g.partners ?? []).filter((v) => v.state === 'joined').map((v) => v.div),
];
export const canAnswerPartner = (me: Person, d: DivisionId) => me.admin || (me.div === d && rank(me) >= 2);

/** One adapter per kind of item (the prototype's CP table). */
export interface CpAdapter<X> {
  div: (x: X) => DivisionId | null;
  lead: (x: X) => PersonId | null;
  mgr: (x: X) => PersonId | null;
  entries: (db: Workspace, x: X) => CpEntry[];
}

const project: CpAdapter<Project> = {
  div: (x) => x.div,
  lead: (x) => x.lead,
  mgr: (x) => x.pm,
  entries: (db, x) => x.team.filter((v) => (v.state === 'joined' || v.state === 'invited') && !!personOf(db, v.id)),
};
const routine: CpAdapter<Routine> = {
  div: (x) => x.unit,
  lead: (x) => (x.lead as PersonId | undefined) ?? x.createdBy,
  mgr: (x) => (x.manager as PersonId | undefined) ?? null,
  entries: (_db, x) => [
    ...x.owners.map((id) => ({
      id,
      state: 'joined',
      by: (x.ownerBy as Record<string, PersonId> | undefined)?.[id] ?? x.createdBy,
      at: (x.ownerAt as Record<string, string> | undefined)?.[id] ?? x.at,
    })),
    ...((x.invites as CpEntry[] | undefined) ?? []).filter((v) => v.state === 'invited'),
  ],
};
const program: CpAdapter<Program> = {
  div: (x) => x.div,
  lead: (x) => x.owner,
  mgr: (x) => (x.manager as PersonId | undefined) ?? null,
  entries: () => [],
};
export const CP = { project, routine, program };

/** Everyone working on an item, joined only, lead first: the face stacks on headers, cards and rows. */
export function cpFaces(db: Workspace, kind: CpKind, x: Project | Routine | Program): PersonId[] {
  const A = CP[kind] as CpAdapter<typeof x>;
  return [
    ...new Set([
      A.lead(x),
      A.mgr(x),
      ...A.entries(db, x)
        .filter((v) => v.state === 'joined')
        .map((v) => v.id),
    ]),
  ].filter((id): id is PersonId => !!id && !!personOf(db, id));
}

export function cpRole(db: Workspace, kind: CpKind, x: Project | Routine | Program, id: PersonId): CpRole | null {
  const A = CP[kind] as CpAdapter<typeof x>;
  if (A.lead(x) === id) return 'lead';
  if (A.mgr(x) === id) return 'manager';
  return A.entries(db, x).some((v) => v.id === id && v.state === 'joined') ? 'member' : null;
}

/** Divisions involved, the home division first. */
export function cpDivs(db: Workspace, kind: CpKind, x: Project | Routine | Program): DivisionId[] {
  if (kind === 'program') return pgDivs(x as Program);
  const home = (CP[kind] as CpAdapter<typeof x>).div(x);
  return [...new Set([home, ...cpFaces(db, kind, x).map((id) => homeDiv(db, id))])].filter((d): d is DivisionId => !!d);
}

// ---------- what is waiting for me to answer ----------

export interface CpInvite {
  kind: 'project' | 'routine' | 'partner';
  id: string;
  name: string;
  by: PersonId;
  div: DivisionId | null;
}

export function cpInviteList(db: Workspace, me: Person): CpInvite[] {
  const out: CpInvite[] = [];
  for (const p of db.projects)
    for (const v of p.team)
      if (v.id === me.id && v.state === 'invited')
        out.push({ kind: 'project', id: p.id, name: p.name, by: v.by, div: null });
  for (const r of db.routines ?? [])
    for (const v of (r.invites as CpEntry[] | undefined) ?? [])
      if (v.id === me.id && v.state === 'invited')
        out.push({ kind: 'routine', id: r.id, name: r.name, by: v.by, div: null });
  for (const g of db.programs ?? [])
    for (const v of g.partners ?? [])
      if (v.state === 'invited' && v.div === me.div && canAnswerPartner(me, v.div))
        out.push({ kind: 'partner', id: g.id, name: g.name, by: v.by ?? '', div: v.div });
  return out;
}

// ---------- what I am waiting for from others (delegation, D60) ----------

export type WaitItem =
  | {
      k: 'task';
      at: string;
      id: string;
      title: string;
      who: PersonId;
      status: 'review' | 'doing' | 'todo';
      returned: boolean;
      due: string | null;
    }
  | { k: 'offer'; at: string; id: string; title: string; who: PersonId; changes: boolean }
  | { k: 'inv'; at: string; kind: 'project' | 'routine'; id: string; name: string; who: PersonId }
  | { k: 'partner'; at: string; id: string; name: string; div: DivisionId };

export function waitingOnOthers(db: Workspace, me: Person): WaitItem[] {
  const out: WaitItem[] = [];
  for (const t of db.tasks)
    if (
      !t.trashed &&
      !isDone(t) &&
      !t.routine &&
      t.owner !== me.id &&
      (t.givenBy === me.id || (!t.givenBy && t.createdBy === me.id))
    ) {
      const s = lastSub(t);
      out.push({
        k: 'task',
        at: t.due ?? '9',
        id: t.id,
        title: t.title,
        who: t.owner,
        status: t.status === 'review' ? 'review' : t.status === 'doing' ? 'doing' : 'todo',
        returned: !!s?.review && s.review.result === 'returned' && t.status !== 'review',
        due: t.due,
      });
    }
  for (const o of db.offers)
    if (o.from === me.id && (o.state === 'pending' || o.state === 'changes'))
      out.push({ k: 'offer', at: o.due ?? '9', id: o.id, title: o.title, who: o.to, changes: o.state === 'changes' });
  for (const p of db.projects)
    for (const v of p.team)
      if (v.by === me.id && v.state === 'invited' && personOf(db, v.id))
        out.push({ k: 'inv', at: '9', kind: 'project', id: p.id, name: p.name, who: v.id });
  for (const r of db.routines ?? [])
    for (const v of (r.invites as CpEntry[] | undefined) ?? [])
      if (v.by === me.id && v.state === 'invited')
        out.push({ k: 'inv', at: '9', kind: 'routine', id: r.id, name: r.name, who: v.id });
  for (const g of db.programs ?? [])
    for (const v of g.partners ?? [])
      if (v.by === me.id && v.state === 'invited')
        out.push({ k: 'partner', at: '9', id: g.id, name: g.name, div: v.div });
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

// ---------- answering ----------

const changeRef = (kind: CpKind, x: { id: string; name: string }) => ({
  type: kind === 'routine' ? 'task' : 'project',
  id: x.id,
  name: x.name,
});

/** Accept or decline an invitation to a project or operation. */
export function cpAnswer(kind: 'project' | 'routine', id: string, yes: boolean) {
  return act(({ db, toast }) => {
    const me = getMe();
    if (!me) return;
    if (kind === 'project') {
      const x = db.projects.find((p) => p.id === id);
      const v = x?.team.find((e) => e.id === me.id && e.state === 'invited');
      if (!x || !v) return;
      const prev = structuredClone(x.team);
      if (yes) {
        x.team = x.team.filter((e) => e.id !== me.id);
        x.team.push({ id: me.id, state: 'joined', by: v.by, at: nowStamp(), direct: true, answeredAt: nowStamp() });
      } else {
        v.state = 'declined';
        v.answeredAt = nowStamp();
      }
      notify(db, v.by, yes ? 'cp-yes' : 'cp-no', { type: 'project', id: x.id });
      logChange(db, x.div, yes ? 'joined' : 'declined to join', changeRef('project', x));
      toast(yes ? tr('You joined {x}', { x: x.name }) : tr('Invitation declined'), ({ db: d }) => {
        const y = d.projects.find((p) => p.id === id);
        if (y) y.team = prev;
      });
      return;
    }
    const x = db.routines?.find((r) => r.id === id);
    const inv = ((x?.invites as CpEntry[] | undefined) ?? []).find((e) => e.id === me.id && e.state === 'invited');
    if (!x || !inv) return;
    const prev = structuredClone({ owners: x.owners, invites: x.invites, ownerBy: x.ownerBy, ownerAt: x.ownerAt });
    if (yes) {
      x.invites = ((x.invites as CpEntry[] | undefined) ?? []).filter((v) => v.id !== me.id);
      if (!x.owners.includes(me.id)) x.owners.push(me.id);
      x.ownerBy = { ...(x.ownerBy ?? {}), [me.id]: inv.by };
      x.ownerAt = { ...(x.ownerAt ?? {}), [me.id]: nowStamp() };
      pruneFuture(db, x);
    } else {
      const e = (x.invites as Draft<CpEntry>[]).find((v) => v.id === me.id);
      if (e) {
        e.state = 'declined';
        e.answeredAt = nowStamp();
      }
    }
    notify(db, inv.by, yes ? 'cp-yes' : 'cp-no', { type: 'routine', id: x.id });
    logChange(db, x.unit, yes ? 'joined' : 'declined to join', changeRef('routine', x));
    toast(yes ? tr('You joined {x}', { x: x.name }) : tr('Invitation declined'), ({ db: d }) => {
      const y = d.routines?.find((r) => r.id === id);
      if (y) Object.assign(y, prev);
    });
  });
}

export function pgPartnerAnswer(id: string, d: DivisionId, yes: boolean) {
  return act(({ db, toast }) => {
    const me = getMe();
    const g = db.programs?.find((x) => x.id === id);
    const v = g?.partners?.find((e) => e.div === d && e.state === 'invited');
    if (!me || !g || !v || !canAnswerPartner(me, d)) return;
    const prev = structuredClone(g.partners);
    v.state = yes ? 'joined' : 'declined';
    v.answeredAt = nowStamp();
    v.answeredBy = me.id;
    notify(db, v.by, yes ? 'pg-partner-yes' : 'pg-partner-no', { type: 'program', id: g.id });
    logChange(db, g.div, yes ? 'became a partner of' : 'declined to partner on', changeRef('program', g));
    toast(
      yes ? tr('{d} is now a partner of {p}', { d: divName(d), p: g.name }) : tr('Invitation declined'),
      ({ db: dd }) => {
        const y = dd.programs?.find((x) => x.id === id);
        if (y) y.partners = prev;
      },
    );
  });
}
