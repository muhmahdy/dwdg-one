/* Actions on the runs of an operation (routine): tick a step, skip a run, and the member's request to skip or move a run that
   the leader decides (recorded with name and time). From screens/work.js rt-skip, rtck, rt-ask-*. */
import type { Draft } from 'immer';
import { currentWs } from '@/lib/access';
import { uid } from '@/lib/ids';
import { addDays, dLong, dShort, nowStamp } from '@/lib/time';
import { t as tr } from '@/lib/i18n';
import { sessionStore } from '@/lib/session';
import { logChange, notify } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { canEditTask, isDone, unitLeads } from '@/features/work/services/selectors';
import { signerFor } from '@/features/work/services/signoff';
import type { Workspace } from '@/types/workspace';
import { canEditRt } from './access';
import type { RunAsk } from './routines';

const W = (db: Draft<Workspace>) => db as Workspace;

/** Ticks one step of a run's checklist. Only whoever can edit the run may. */
export function toggleStep(taskId: string, index: number, done: boolean) {
  return act(({ db }) => {
    const me = getMe();
    const t = db.tasks.find((x) => x.id === taskId);
    const c = t?.checklist?.[index];
    if (!t || !c || !me || !canEditTask(W(db), me, t)) return;
    c.done = done;
  });
}

/** Skips one run: the next one is unchanged. The run is removed unless somebody already finished it. */
export function skipRun(routineId: string, occ: string) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const r = db.routines?.find((x) => x.id === routineId);
    if (!r || !me || !canEditRt(me, r)) return;
    const t = db.tasks.find((x) => x.routine === routineId && x.occ === occ);
    const before = db.tasks.slice();
    r.skips = [...r.skips, occ];
    if (t && !isDone(t)) db.tasks = db.tasks.filter((x) => x !== t);
    if (t && ui.insp?.id === t.id) ui.insp = null;
    logChange(db, r.unit ?? currentWs(me, sessionStore.get().ws), 'skipped a run of', {
      type: 'task',
      id: t?.id ?? r.id,
      name: r.name,
    });
    toast(tr('Skipped {d}. The next one is unchanged.', { d: dShort(occ) }), ({ db: d }) => {
      const x = d.routines?.find((v) => v.id === routineId);
      if (x) x.skips = x.skips.filter((v) => v !== occ);
      d.tasks = before;
    });
  });
}

/** What a run's doer sees when asking: who decides. */
export const askLeader = (db: Workspace, taskId: string) => {
  const t = db.tasks.find((x) => x.id === taskId);
  const r = t?.routine ? db.routines?.find((x) => x.id === t.routine) : undefined;
  return (t && signerFor(db, t)) ?? (r?.unit ? unitLeads(db, r.unit)[0] : undefined);
};

/** A member asks to skip or move their run; the leader is told. Returns an error message when something is missing. */
export function sendRunAsk(
  taskId: string,
  kind: 'skip' | 'move',
  reason: string,
  to: string | null,
): string | Promise<boolean> {
  if (!reason.trim()) return tr('Say why, so your leader can decide.');
  if (kind === 'move' && !to) return '';
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const t = db.tasks.find((x) => x.id === taskId);
    const r = t?.routine ? db.routines?.find((x) => x.id === t.routine) : undefined;
    if (!t || !r || t.owner !== me?.id) return;
    const lead = askLeader(W(db), t.id);
    const ask: RunAsk = {
      id: uid('ask'),
      occ: t.occ ?? '',
      task: t.id,
      kind,
      to: kind === 'move' ? to : null,
      by: me.id,
      reason: reason.trim(),
      at: nowStamp(),
      state: 'open',
    };
    r.asks = [...((r.asks as RunAsk[] | undefined) ?? []), ask];
    if (lead) notify(db, lead, 'run-ask', { type: 'task', id: t.id });
    ui.form = null;
    ui.askKind = null;
    toast(
      tr('Sent to {who}', { who: W(db).people.find((p) => p.id === lead)?.first ?? tr('Someone') }),
      ({ db: d }) => {
        const x = d.routines?.find((v) => v.id === r.id);
        if (x) x.asks = (x.asks as RunAsk[]).filter((a) => a.id !== ask.id);
        d.updates = d.updates.filter((u) => !(u.type === 'run-ask' && u.ref.id === taskId));
      },
    );
  });
}

export function withdrawRunAsk(routineId: string, askId: string) {
  return act(({ db, toast }) => {
    const me = getMe();
    const a = (db.routines?.find((x) => x.id === routineId)?.asks as RunAsk[] | undefined)?.find((x) => x.id === askId);
    if (!a || a.by !== me?.id || a.state !== 'open') return;
    a.state = 'withdrawn';
    toast(tr('Request withdrawn'), ({ db: d }) => {
      const x = (d.routines?.find((v) => v.id === routineId)?.asks as RunAsk[] | undefined)?.find(
        (v) => v.id === askId,
      );
      if (x) x.state = 'open';
    });
  });
}

/** The leader approves or declines a request. Approving a skip removes the run; approving a move changes its date. */
export function decideRunAsk(routineId: string, askId: string, yes: boolean) {
  return act(({ db, toast }) => {
    const me = getMe();
    const r = db.routines?.find((x) => x.id === routineId);
    const a = (r?.asks as RunAsk[] | undefined)?.find((x) => x.id === askId);
    if (!r || !a || !me || a.state !== 'open' || !canEditRt(me, r)) return;
    const t = db.tasks.find((x) => x.id === a.task);
    const beforeTasks = db.tasks.slice();
    const prevTask = t ? { moved: t.moved, due: t.due } : null;
    const prevSkips = r.skips.slice();
    a.state = yes ? 'approved' : 'declined';
    a.decidedBy = me.id;
    a.decidedAt = nowStamp();
    if (yes && a.kind === 'skip') {
      r.skips = [...r.skips, a.occ];
      if (t && !isDone(t)) db.tasks = db.tasks.filter((x) => x !== t);
    }
    if (yes && a.kind === 'move' && t && a.to) {
      t.moved = a.to;
      t.due = addDays(a.to, r.dueOffset || 0);
    }
    notify(db, a.by, yes ? 'run-ask-ok' : 'run-ask-no', { type: 'task', id: a.task });
    logChange(
      db,
      r.unit,
      yes
        ? a.kind === 'skip'
          ? 'approved skipping a run of'
          : 'approved moving a run of'
        : 'declined a request about',
      { type: 'task', id: a.task, name: r.name },
    );
    toast(yes ? tr('Approved') : tr('Declined'), ({ db: d }) => {
      const rr = d.routines?.find((v) => v.id === routineId);
      const x = (rr?.asks as RunAsk[] | undefined)?.find((v) => v.id === askId);
      if (x) {
        x.state = 'open';
        x.decidedBy = null;
        x.decidedAt = null;
      }
      if (rr) rr.skips = prevSkips;
      d.tasks = beforeTasks;
      const back = d.tasks.find((v) => v.id === a.task);
      if (back && prevTask) Object.assign(back, prevTask);
    });
  });
}

/** Text for a request: who asks, for which day. */
export const askLine = (who: string, a: RunAsk) =>
  a.kind === 'skip'
    ? tr('{who} asks to skip {d}', { who, d: dLong(a.occ) })
    : tr('{who} asks to move {d} to {to}', { who, d: dLong(a.occ), to: dLong(a.to ?? a.occ) });
