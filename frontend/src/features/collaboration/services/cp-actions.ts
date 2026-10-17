/* Collaboration actions (D60): add, invite, remove, change a role, and the program partner divisions. Every one tells the
   person and is logged in Activity. From screens/people.js cpAdd, cpRemove, cpSetRole, pgPartnerInvite, pgPartnerEnd. */
import type { Draft } from 'immer';
import { go } from '@/app/router/navigation';
import { logChange, notify } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { t as tr } from '@/lib/i18n';
import { nowStamp } from '@/lib/time';
import type { DivisionId, PersonId, Program, Project, Routine, Workspace } from '@/types/workspace';
import { personOf } from '@/features/work/services/selectors';
import { canEditRt, canSeeRt } from '@/features/operations/services/access';
import { pruneFuture } from '@/features/operations/services/routines';
import { canSeeProject } from '@/features/projects/services/access';
import { canEditProject } from '@/features/projects/services/project-rules';
import { canManageProgram, canSeeProgram } from '@/features/programs/services/programs';
import {
  ROLE,
  canAnswerPartner,
  divName,
  leadersOf,
  pgDivs,
  type CpEntry,
  type CpKind,
  type CpRole,
} from './collaboration';

type Item =
  | { kind: 'project'; x: Draft<Project> }
  | { kind: 'routine'; x: Draft<Routine> }
  | { kind: 'program'; x: Draft<Program> };

const itemOf = (db: Draft<Workspace>, kind: CpKind, id: string): Item | undefined => {
  if (kind === 'project') {
    const x = db.projects.find((p) => p.id === id);
    return x && { kind, x };
  }
  if (kind === 'routine') {
    const x = db.routines?.find((r) => r.id === id);
    return x && { kind, x };
  }
  const x = db.programs?.find((g) => g.id === id);
  return x && { kind, x };
};

const divOf = (i: Item): DivisionId | null => (i.kind === 'routine' ? i.x.unit : i.x.div);
const leadOf = (i: Item): PersonId | null =>
  i.kind === 'project'
    ? i.x.lead
    : i.kind === 'routine'
      ? ((i.x.lead as PersonId | undefined) ?? i.x.createdBy)
      : i.x.owner;
const mgrOf = (i: Item): PersonId | null =>
  i.kind === 'project' ? i.x.pm : ((i.x.manager as PersonId | undefined) ?? null);
const setLead = (i: Item, id: PersonId) => {
  if (i.kind === 'project') i.x.lead = id;
  else if (i.kind === 'routine') i.x.lead = id;
  else i.x.owner = id;
};
const setMgr = (i: Item, id: PersonId | null) => {
  if (i.kind === 'project') i.x.pm = id;
  else i.x.manager = id;
};
const entriesOf = (db: Draft<Workspace>, i: Item): CpEntry[] => {
  if (i.kind === 'project')
    return i.x.team.filter((v) => (v.state === 'joined' || v.state === 'invited') && !!personOf(db as Workspace, v.id));
  if (i.kind === 'routine')
    return [
      ...i.x.owners.map((id) => ({
        id,
        state: 'joined',
        by: (i.x.ownerBy as Record<string, PersonId> | undefined)?.[id] ?? i.x.createdBy,
        at: (i.x.ownerAt as Record<string, string> | undefined)?.[id] ?? i.x.at,
      })),
      ...((i.x.invites as CpEntry[] | undefined) ?? []).filter((v) => v.state === 'invited'),
    ];
  return [];
};
const put = (db: Draft<Workspace>, i: Item, id: PersonId, by: PersonId) => {
  if (i.kind === 'project') {
    i.x.team = i.x.team.filter((v) => v.id !== id);
    i.x.team.push({ id, state: 'joined', by, at: nowStamp(), direct: true });
  } else if (i.kind === 'routine') {
    i.x.invites = ((i.x.invites as CpEntry[] | undefined) ?? []).filter((v) => v.id !== id);
    if (!i.x.owners.includes(id)) i.x.owners.push(id);
    i.x.ownerBy = { ...(i.x.ownerBy ?? {}), [id]: by };
    i.x.ownerAt = { ...(i.x.ownerAt ?? {}), [id]: nowStamp() };
    pruneFuture(db, i.x);
  }
};
const invite = (i: Item, id: PersonId, by: PersonId) => {
  if (i.kind === 'project') {
    i.x.team = i.x.team.filter((v) => v.id !== id);
    i.x.team.push({ id, state: 'invited', by, at: nowStamp() });
  } else if (i.kind === 'routine') {
    i.x.invites = ((i.x.invites as CpEntry[] | undefined) ?? []).filter((v) => v.id !== id);
    (i.x.invites as CpEntry[]).push({ id, state: 'invited', by, at: nowStamp() });
  }
};
const drop = (db: Draft<Workspace>, i: Item, id: PersonId) => {
  if (i.kind === 'project') i.x.team = i.x.team.filter((v) => v.id !== id);
  else if (i.kind === 'routine') {
    i.x.owners = i.x.owners.filter((v) => v !== id);
    i.x.invites = ((i.x.invites as CpEntry[] | undefined) ?? []).filter((v) => v.id !== id);
    pruneFuture(db, i.x);
  }
};

/** May this person change the item and its people (Lead and Manager)? */
export function cpCanManage(db: Workspace, kind: CpKind, id: string): boolean {
  const me = getMe();
  if (!me) return false;
  if (kind === 'project') {
    const p = db.projects.find((x) => x.id === id);
    return !!p && canEditProject(db, me, p);
  }
  if (kind === 'routine') {
    const r = db.routines?.find((x) => x.id === id);
    return !!r && canEditRt(me, r);
  }
  const g = db.programs?.find((x) => x.id === id);
  return !!g && canManageProgram(me, g);
}

const refOf = (kind: CpKind, x: { id: string }) => ({ type: kind, id: x.id });
const changeRef = (kind: CpKind, x: { id: string; name: string }) => ({
  type: kind === 'routine' ? 'task' : 'project',
  id: x.id,
  name: x.name,
});
const snapshot = (i: Item) => structuredClone(i.x);
const restoreItem = (kind: CpKind, id: string, prev: object) => (c: { db: Draft<Workspace> }) => {
  const i = itemOf(c.db, kind, id);
  if (i) Object.assign(i.x, prev);
};

export function cpAdd(kind: CpKind, id: string, who: PersonId) {
  return act(({ db, toast }) => {
    const me = getMe();
    const i = itemOf(db, kind, id);
    const q = personOf(db, who);
    if (!me || !i || !q || !cpCanManage(db, kind, id)) return;
    if (leadOf(i) === who || mgrOf(i) === who || entriesOf(db, i).some((v) => v.id === who)) {
      toast(tr('{who} is already here', { who: q.first }));
      return;
    }
    const direct = !q.div || q.div === divOf(i);
    const prev = snapshot(i);
    if (direct) {
      put(db, i, who, me.id);
      notify(db, who, 'cp-added', refOf(kind, i.x));
    } else {
      invite(i, who, me.id);
      notify(db, who, 'cp-invite', refOf(kind, i.x));
      for (const l of leadersOf(db, q.div)) if (l !== who) notify(db, l, 'cp-fyi', refOf(kind, i.x));
    }
    logChange(
      db,
      divOf(i),
      direct ? 'added a person to' : 'invited someone from another division to',
      changeRef(kind, i.x),
    );
    toast(
      direct ? tr('{who} added', { who: q.first }) : tr('{who} invited. They join after accepting.', { who: q.first }),
      restoreItem(kind, id, prev),
    );
  });
}

export function cpRemove(kind: CpKind, id: string, who: PersonId) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const i = itemOf(db, kind, id);
    if (!me || !i) return;
    const self = who === me.id;
    if ((!self && !cpCanManage(db, kind, id)) || leadOf(i) === who) return;
    const prev = snapshot(i);
    const inv = entriesOf(db, i).find((v) => v.id === who && v.state === 'invited');
    if (mgrOf(i) === who) setMgr(i, null);
    drop(db, i, who);
    if (self) {
      const lead = leadOf(i);
      if (lead) notify(db, lead, 'cp-left', refOf(kind, i.x));
    } else if (!inv) notify(db, who, 'cp-removed', refOf(kind, i.x));
    logChange(
      db,
      divOf(i),
      self ? 'left' : inv ? 'withdrew an invitation to' : 'took a person off',
      changeRef(kind, i.x),
    );
    ui.menu = null;
    const stays =
      kind === 'project'
        ? canSeeProject(db, me, i.x as Project)
        : kind === 'routine'
          ? canSeeRt(db, me, i.x as Routine)
          : canSeeProgram(me, i.x as Program);
    if (self && !stays)
      queueMicrotask(() => {
        go('work');
      });
    toast(
      self
        ? tr('You left {x}', { x: i.x.name })
        : inv
          ? tr('Invitation withdrawn')
          : kind === 'project'
            ? tr('{who} removed from the project', { who: personOf(db, who)?.first ?? '' })
            : tr('{who} taken off', { who: personOf(db, who)?.first ?? '' }),
      restoreItem(kind, id, prev),
    );
  });
}

export function cpSetRole(kind: CpKind, id: string, who: PersonId, role: CpRole) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const i = itemOf(db, kind, id);
    if (!me || !i || !cpCanManage(db, kind, id)) return;
    const prev = snapshot(i);
    if (role === 'lead') {
      const old = leadOf(i);
      setLead(i, who);
      if (mgrOf(i) === who) setMgr(i, null);
      if (kind !== 'routine') drop(db, i, who);
      if (old && old !== who && kind !== 'program') put(db, i, old, me.id);
    } else if (role === 'manager') {
      const old = mgrOf(i);
      setMgr(i, who);
      if (kind !== 'routine') drop(db, i, who);
      if (old && old !== who && kind !== 'program') put(db, i, old, me.id);
    } else {
      if (mgrOf(i) === who) setMgr(i, null);
      if (kind !== 'program') put(db, i, who, me.id);
    }
    notify(db, who, 'cp-role', refOf(kind, i.x));
    logChange(db, divOf(i), 'changed a role in', changeRef(kind, i.x));
    ui.menu = null;
    toast(
      tr('{who} is now {role}', {
        who: personOf(db, who)?.first ?? '',
        role: tr(ROLE[role]).toLowerCase(),
      }),
      restoreItem(kind, id, prev),
    );
  });
}

export function pgPartnerInvite(id: string, d: DivisionId) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const g = db.programs?.find((x) => x.id === id);
    if (!me || !g || !canManageProgram(me, g) || pgDivs(g).includes(d)) return;
    const prev = structuredClone(g.partners ?? []);
    g.partners = (g.partners ?? []).filter((v) => v.div !== d);
    g.partners.push({ div: d, state: 'invited', by: me.id, at: nowStamp() });
    for (const l of leadersOf(db, d)) notify(db, l, 'pg-partner', { type: 'program', id: g.id });
    logChange(db, g.div, 'invited a partner division to', { type: 'project', id: g.id, name: g.name });
    ui.menu = null;
    toast(tr('{d} invited. Their leaders answer for the division.', { d: divName(d) }), ({ db: x }) => {
      const y = x.programs?.find((v) => v.id === id);
      if (y) y.partners = prev;
    });
  });
}

export function pgPartnerEnd(id: string, d: DivisionId) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const g = db.programs?.find((x) => x.id === id);
    const v = g?.partners?.find((e) => e.div === d && e.state !== 'left');
    if (!me || !g || !v || !(canManageProgram(me, g) || canAnswerPartner(me, d))) return;
    const prev = structuredClone(g.partners ?? []);
    const kids = [
      ...db.projects.filter((p) => p.program === g.id && p.div === d),
      ...(db.routines ?? []).filter((r) => r.program === g.id && r.unit === d),
    ];
    const ids = kids.map((k) => k.id);
    v.state = 'left';
    v.endedAt = nowStamp();
    for (const k of kids) k.program = null;
    const tell = canManageProgram(me, g) && me.div !== d ? leadersOf(db, d) : [g.owner];
    for (const l of tell) notify(db, l, 'pg-partner-left', { type: 'program', id: g.id });
    logChange(db, g.div, 'ended a partnership on', { type: 'project', id: g.id, name: g.name });
    ui.menu = null;
    toast(
      kids.length
        ? tr('Partnership ended. {n} items from {d} left the program.', { n: kids.length, d: divName(d) })
        : tr('Partnership ended'),
      ({ db: x }) => {
        const y = x.programs?.find((q) => q.id === id);
        if (y) y.partners = prev;
        for (const p of x.projects) if (ids.includes(p.id)) p.program = id;
        for (const r of x.routines ?? []) if (ids.includes(r.id)) r.program = id;
      },
    );
  });
}
