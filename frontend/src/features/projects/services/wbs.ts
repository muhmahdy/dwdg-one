/* WBS model (owner round 10; work_subtasks, request R15), from screens/work.js. One tree of task records. A phase, or any item
   with parts under it, is a summary: its dates and progress roll up from its work packages (the leaves). Tasks made in the
   Work tab are work packages outside the tree until someone places them. Codes (1, 1.2, 1.2.3) follow sibling order. */
import type { Draft } from 'immer';
import { logChange } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act, type ActionContext } from '@/lib/workspace/transaction';
import { uid } from '@/lib/ids';
import { plural, t as tr } from '@/lib/i18n';
import { dLong, dShort, today } from '@/lib/time';
import type { Milestone, Project, Task, Workspace } from '@/types/workspace';
import { canEditTask, isDone, isSummary } from '@/features/work/services/selectors';
import { addTaskDraft, tS } from '@/features/work/services/task-actions';
import { canEditProject } from './project-rules';

const W = (db: Draft<Workspace>) => db as Workspace;

export const sortSibs = <T extends Task>(a: T[]) =>
  a.sort(
    (p, q) =>
      (p.order ?? 1e6) - (q.order ?? 1e6) ||
      (tS(p) ?? '9').localeCompare(tS(q) ?? '9') ||
      (p.createdAt || '').localeCompare(q.createdAt || ''),
  );

export const kidsOf = (db: Workspace, p: Project, pid: string | null) =>
  sortSibs(
    db.tasks.filter((t) => t.project === p.id && !t.trashed && (t.parent ?? null) === pid && (pid !== null || t.inWbs)),
  );

export const unplaced = (db: Workspace, p: Project) =>
  db.tasks.filter((t) => t.project === p.id && !t.trashed && !t.parent && !t.inWbs && !isSummary(db, t));

export function descLeaves(db: Workspace, t: Task): Task[] {
  const out: Task[] = [];
  const walk = (id: string) => {
    for (const c of db.tasks) {
      if (c.parent !== id || c.trashed) continue;
      if (isSummary(db, c)) walk(c.id);
      else out.push(c);
    }
  };
  walk(t.id);
  return out;
}

export function rollup(db: Workspace, t: Task) {
  const ls = descLeaves(db, t);
  const d = ls.filter((x) => x.due);
  return {
    s: d.length ? (d.map((x) => tS(x) ?? '').sort()[0] ?? null) : null,
    e: d.length
      ? (d
          .map((x) => x.due ?? '')
          .sort()
          .pop() ?? null)
      : null,
    done: ls.filter(isDone).length,
    total: ls.length,
  };
}

export interface WbsNode {
  t: Task;
  code: string;
  depth: number;
  kids: WbsNode[];
  ms: Milestone[];
}

export function wbsTree(db: Workspace, p: Project): WbsNode[] {
  const build = (pid: string | null, prefix: string, depth: number): WbsNode[] =>
    kidsOf(db, p, pid).map((t, i) => {
      const code = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
      return { t, code, depth, kids: build(t.id, code, depth + 1), ms: db.milestones.filter((m) => m.parent === t.id) };
    });
  return build(null, '', 0);
}

export function wbsCodes(db: Workspace, p: Project): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (ns: WbsNode[]) => {
    for (const n of ns) {
      out[n.t.id] = n.code;
      walk(n.kids);
    }
  };
  walk(wbsTree(db, p));
  return out;
}

export type FlatRow =
  | { k: 't'; o: Task; depth: number; code: string; sum: boolean }
  | { k: 'ms'; o: Milestone; depth: number }
  | { k: 'grp' };

/** The tree as rows, skipping collapsed branches, then the work packages not placed yet. */
export function wbsFlat(db: Workspace, p: Project, collapsed: Record<string, boolean> = {}): FlatRow[] {
  const out: FlatRow[] = [];
  const walk = (ns: WbsNode[]) => {
    for (const n of ns) {
      out.push({ k: 't', o: n.t, depth: n.depth, code: n.code, sum: isSummary(db, n.t) });
      if (!collapsed[n.t.id]) {
        walk(n.kids);
        for (const m of n.ms) out.push({ k: 'ms', o: m, depth: n.depth + 1 });
      }
    }
  };
  walk(wbsTree(db, p));
  const un = unplaced(db, p);
  if (un.length) {
    out.push({ k: 'grp' });
    for (const t of sortSibs(un)) out.push({ k: 't', o: t, depth: 0, code: '', sum: false });
  }
  return out;
}

export const isUnder = (db: Workspace, t: Task | undefined, ancestorId: string) => {
  for (
    let a = t?.parent ? db.tasks.find((x) => x.id === t.parent) : undefined;
    a;
    a = a.parent ? db.tasks.find((x) => x.id === a.parent) : undefined
  )
    if (a.id === ancestorId) return true;
  return false;
};

// ---------- structure changes (each one transaction, Undo restores the tree) ----------

type Snap = [id: string, parent: string | null, order: number | null, inWbs: boolean, trashed: boolean][];
const snap = (db: Workspace, p: Project): Snap =>
  db.tasks.filter((x) => x.project === p.id).map((x) => [x.id, x.parent, x.order, x.inWbs, x.trashed]);
const restore = (s: Snap) => (ctx: ActionContext) => {
  for (const [id, parent, order, inWbs, trashed] of s) {
    const x = ctx.db.tasks.find((y) => y.id === id);
    if (x) Object.assign(x, { parent, order, inWbs, trashed });
  }
};

const siblings = (db: Draft<Workspace>, projectId: string, parent: string | null, inWbs: boolean, except?: string) =>
  sortSibs(
    db.tasks.filter(
      (x) =>
        x.project === projectId &&
        !x.trashed &&
        x.id !== except &&
        (x.parent ?? null) === parent &&
        (parent ? true : x.inWbs === inWbs),
    ) as Task[],
  );

const canMove = (db: Workspace, p: Project, t: Task) => {
  const me = getMe();
  return !!me && (canEditProject(db, me, p) || canEditTask(db, me, t));
};

/** Move one place up (-1) or down (+1) among its siblings. */
export function moveSib(id: string, dir: number) {
  return act((ctx) => {
    const { db } = ctx;
    const t = db.tasks.find((x) => x.id === id);
    const p = t && db.projects.find((x) => x.id === t.project);
    if (!t || !p) return;
    const sibs = siblings(db, p.id, t.parent ?? null, t.inWbs);
    const i = sibs.findIndex((x) => x.id === t.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sibs.length) return;
    const s0 = snap(W(db), p);
    const [m] = sibs.splice(i, 1);
    if (m) sibs.splice(j, 0, m);
    sibs.forEach((x, k) => {
      const d = db.tasks.find((y) => y.id === x.id);
      if (d) d.order = k;
    });
    ctx.toast(tr('Moved'), restore(s0));
  });
}

/** One level down (under the item above) or one level up (after its parent). */
export function wbsIndent(id: string, dir: 1 | -1) {
  return act((ctx) => {
    const { db } = ctx;
    const t = db.tasks.find((x) => x.id === id);
    const p = t && db.projects.find((x) => x.id === t.project);
    if (!t || !p) return;
    const s0 = snap(W(db), p);
    if (dir > 0) {
      const sibs = siblings(db, p.id, t.parent ?? null, true);
      const i = sibs.findIndex((x) => x.id === t.id);
      if (i < 1) {
        ctx.toast(tr('There is nothing above it to go under.'));
        return;
      }
      const np = sibs[i - 1];
      if (!np) return;
      t.parent = np.id;
      t.inWbs = true;
      const ks = sortSibs(db.tasks.filter((x) => x.parent === np.id && !x.trashed && x.id !== t.id) as Task[]);
      [...ks, t].forEach((x, k) => {
        const d = db.tasks.find((y) => y.id === x.id);
        if (d) d.order = k;
      });
    } else {
      if (!t.parent) {
        ctx.toast(tr('It is already a phase.'));
        return;
      }
      const par = db.tasks.find((x) => x.id === t.parent);
      if (!par) return;
      t.parent = par.parent ?? null;
      t.inWbs = true;
      const sibs = siblings(db, p.id, par.parent ?? null, true, t.id);
      sibs.splice(sibs.findIndex((x) => x.id === par.id) + 1, 0, t as Task);
      sibs.forEach((x, k) => {
        const d = db.tasks.find((y) => y.id === x.id);
        if (d) d.order = k;
      });
    }
    ctx.toast(dir > 0 ? tr('Moved one level down') : tr('Moved one level up'), restore(s0));
  });
}

export type DropMode = 'before' | 'after' | 'in';

/** The timeline and table drop rule: the left half puts the task beside a row, the right half inside it as its last part. */
export function wbsDrop(id: string, drop: { mode: DropMode; id: string }) {
  return act((ctx) => {
    const { db } = ctx;
    const t = db.tasks.find((x) => x.id === id);
    const ref = db.tasks.find((x) => x.id === drop.id);
    const p = t && db.projects.find((x) => x.id === t.project);
    if (!t || !ref || !p) return;
    if (!canMove(W(db), p, t)) {
      ctx.toast(tr('Only the project lead, PM or the task owner can move this.'));
      return;
    }
    if (ref.id === t.id || isUnder(W(db), ref, t.id)) {
      ctx.toast(tr('A part cannot go inside itself.'));
      return;
    }
    const s0 = snap(W(db), p);
    if (drop.mode === 'in') {
      t.parent = ref.id;
      t.inWbs = true;
      const ks = sortSibs(db.tasks.filter((x) => x.parent === ref.id && !x.trashed && x.id !== t.id) as Task[]);
      [...ks, t].forEach((x, k) => {
        const d = db.tasks.find((y) => y.id === x.id);
        if (d) d.order = k;
      });
      ctx.toast(tr('Now a part of {t}', { t: ref.title }), restore(s0));
      return;
    }
    const parent = ref.parent ?? null;
    const inW = !!(ref.inWbs || ref.parent);
    const sibs = siblings(db, p.id, parent, inW, t.id);
    sibs.splice(sibs.findIndex((x) => x.id === ref.id) + (drop.mode === 'after' ? 1 : 0), 0, t as Task);
    t.parent = parent;
    t.inWbs = inW;
    sibs.forEach((x, k) => {
      const d = db.tasks.find((y) => y.id === x.id);
      if (d) d.order = k;
    });
    ctx.toast(tr('Moved'), restore(s0));
  });
}

/** Adds a phase, a part under an item, or an item below one. Returns the new task id through the panel. */
export function wbsAdd(projectId: string, mode: 'phase' | 'child' | 'below', refId?: string) {
  return act((ctx) => {
    const { db } = ctx;
    const p = db.projects.find((x) => x.id === projectId);
    const me = getMe();
    if (!p || !me) return;
    if (!canEditProject(W(db), me, p)) {
      ctx.toast(tr('Only the project lead, PM or a co-director can change the WBS.'));
      return;
    }
    const ref = refId ? db.tasks.find((x) => x.id === refId) : undefined;
    const s0 = snap(W(db), p);
    const t = addTaskDraft(db, mode === 'phase' ? tr('New phase') : tr('New item'), { project: p.id });
    if (!t) return;
    t.owner = ref && !isSummary(W(db), ref) ? ref.owner : (p.lead ?? me.id);
    t.inWbs = true;
    if (mode === 'phase') {
      t.phase = true;
      t.parent = null;
      t.order = kidsOf(W(db), p, null).filter((x) => x.id !== t.id).length;
    } else if (mode === 'child' && ref) {
      t.parent = ref.id;
      const ks = sortSibs(db.tasks.filter((x) => x.parent === ref.id && !x.trashed && x.id !== t.id) as Task[]);
      [...ks, t].forEach((x, k) => {
        const d = db.tasks.find((y) => y.id === x.id);
        if (d) d.order = k;
      });
    } else if (ref) {
      t.parent = ref.parent ?? null;
      const sibs = siblings(db, p.id, t.parent, true, t.id);
      sibs.splice(sibs.findIndex((x) => x.id === ref.id) + 1, 0, t);
      sibs.forEach((x, k) => {
        const d = db.tasks.find((y) => y.id === x.id);
        if (d) d.order = k;
      });
    }
    ctx.ui.wbsFocus = t.id;
    const id = t.id;
    ctx.toast(mode === 'phase' ? tr('Phase added') : tr('Added to the WBS'), (c) => {
      c.db.tasks = c.db.tasks.filter((x) => x.id !== id);
      restore(s0)(c);
    });
  });
}

/** Moves an item and everything under it to the trash; milestones pinned under it come loose. */
export function wbsDelete(id: string) {
  return act((ctx) => {
    const { db, ui } = ctx;
    const t = db.tasks.find((x) => x.id === id);
    const p = t && db.projects.find((x) => x.id === t.project);
    const me = getMe();
    if (!t || !p || !me || !canEditProject(W(db), me, p)) return;
    const s0 = snap(W(db), p);
    const all = [t, ...db.tasks.filter((x) => isUnder(W(db), x as Task, t.id))];
    const msPrev = db.milestones
      .filter((m) => all.some((x) => x.id === m.parent))
      .map((m) => [m.id, m.parent ?? null] as const);
    for (const x of all) x.trashed = true;
    for (const [mid] of msPrev) {
      const m = db.milestones.find((y) => y.id === mid);
      if (m) m.parent = null;
    }
    if (ui.insp && all.some((x) => x.id === ui.insp?.id)) ui.insp = null;
    logChange(db, p.div, 'moved to trash', { type: 'task', id: t.id, name: t.title });
    ctx.toast(plural(all.length, '{n} item moved to trash', '{n} items moved to trash'), (c) => {
      for (const [mid, parent] of msPrev) {
        const m = c.db.milestones.find((y) => y.id === mid);
        if (m) m.parent = parent;
      }
      restore(s0)(c);
    });
  });
}

/** Saves the order of the project timeline after a drag (reorderGantt). */
export function reorderTasks(ids: string[], from: number, dest: number) {
  return act((ctx) => {
    const list = ids.slice();
    const [m] = list.splice(from, 1);
    if (!m) return;
    list.splice(dest, 0, m);
    const prev = ids.map((id) => [id, ctx.db.tasks.find((x) => x.id === id)?.order ?? null] as const);
    list.forEach((id, i) => {
      const x = ctx.db.tasks.find((y) => y.id === id);
      if (x) x.order = i;
    });
    ctx.toast(tr('Order changed'), (c) => {
      for (const [id, o] of prev) {
        const x = c.db.tasks.find((y) => y.id === id);
        if (x) x.order = o;
      }
    });
  });
}

// ---------- milestones on the plan ----------

export const msLate = (x: Milestone) =>
  !!x.target && x.target < today() && x.state !== 'achieved' && x.state !== 'cancelled';

export function setMsDate(id: string, d: string) {
  return act(({ db, toast }) => {
    const m = db.milestones.find((x) => x.id === id);
    const p = m && db.projects.find((x) => x.id === m.project);
    if (!m || !p || m.target === d) return;
    const prev = m.target;
    m.target = d;
    logChange(db, p.div, 'edited', { type: 'project', id: p.id, name: m.title }, dShort(prev), dShort(d));
    toast(tr('Milestone moved to {d}', { d: dLong(d) }), ({ db: dd }) => {
      const x = dd.milestones.find((y) => y.id === id);
      if (x) x.target = prev;
    });
  });
}

export function addMilestoneTo(projectId: string, underTaskId: string | null) {
  return act(({ db, ui, toast }) => {
    const p = db.projects.find((x) => x.id === projectId);
    const me = getMe();
    if (!p || !me) return;
    if (!canEditProject(W(db), me, p)) {
      toast(tr('Only the project lead, PM or a co-director can change the WBS.'));
      return;
    }
    const t = underTaskId ? db.tasks.find((x) => x.id === underTaskId) : undefined;
    const host = t
      ? isSummary(W(db), t)
        ? t
        : t.parent
          ? db.tasks.find((x) => x.id === t.parent)
          : undefined
      : undefined;
    const ru = host ? rollup(W(db), host) : null;
    const id = uid('ms');
    db.milestones.push({
      id,
      project: p.id,
      title: tr('New milestone'),
      owner: p.lead ?? me.id,
      target: ru?.e ?? t?.due ?? p.due ?? today(),
      state: 'active',
      achievedAt: null,
      parent: host ? host.id : null,
    });
    logChange(db, p.div, 'added milestone', { type: 'project', id: p.id, name: tr('New milestone') });
    ui.menu = null;
    ui.insp = { type: 'ms', id, focusTitle: true };
    toast(tr('Milestone added'), ({ db: d, ui: u }) => {
      d.milestones = d.milestones.filter((x) => x.id !== id);
      u.insp = null;
    });
  });
}
