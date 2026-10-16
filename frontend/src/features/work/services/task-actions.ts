/* Task actions (work_task_lifecycle, work_task_fields, work_blockers, access_member_edit, access_delegation, work_reactions_icons,
   work_dependencies), from screens/work.js and screens/handin.js. Each exported action is one transaction (act). The helpers
   taking an ActionContext run inside a transaction so several steps save together, as the prototype's DBCommit did. */
import type { Draft } from 'immer';
import { getMe } from '@/lib/workspace/hooks';
import { logChange, notify } from '@/lib/workspace/feed';
import { act, type ActionContext } from '@/lib/workspace/transaction';
import { uid } from '@/lib/ids';
import { plural, t as tr } from '@/lib/i18n';
import { addDays, daysBetween, dLong, dShort, nowStamp, today, toMin } from '@/lib/time';
import { sessionStore } from '@/lib/session';
import type {
  DependencyType,
  Person,
  PersonId,
  Routine,
  Task,
  TaskIcon,
  TaskStatus,
  Workspace,
} from '@/types/workspace';
import { TSTAT } from '@/components/ui/StatusBadge';
import { canEditTask, isDone, personOf, projOf, taskDiv, taskOf, unitLeads } from './selectors';
import {
  canSignOff,
  lastSub,
  linkLabel,
  needsHandIn,
  signerFor,
  type Rating,
  type Submission,
  RATING,
} from './signoff';
import { parseQuick } from './quick-add';
import { cadText, ensureRoutines, pruneFuture } from '@/features/operations/services/routines';
import { currentWs } from '@/lib/access';

type Ctx = ActionContext;
const W = (db: Draft<Workspace>) => db as Workspace;
const meOrThrow = (): Person => {
  const m = getMe();
  if (!m) throw new Error('Not signed in');
  return m;
};
const firstName = (db: Workspace, id: PersonId | null | undefined) => personOf(db, id)?.first ?? tr('Someone');
const statusWord = (s: TaskStatus) => tr(TSTAT[s][0]);
const ref = (x: Task) => ({ type: 'task', id: x.id, name: x.title });
const find = (db: Draft<Workspace>, id: string) => db.tasks.find((x) => x.id === id);

// ---------- creating ----------

export interface NewTask {
  owner?: PersonId;
  due?: string | null;
  time?: number | null;
  project?: string | null;
  milestone?: string | null;
  div?: Task['div'];
  notes?: string;
  offer?: string | null;
  meeting?: string | null;
  links?: string[];
  mentions?: PersonId[];
}

/** Adds a task to the draft (screens/work.js addTask). The creator stays responsible unless an owner is given. */
export function addTaskDraft(db: Draft<Workspace>, title: string, extra: NewTask = {}): Task | null {
  title = title.trim();
  if (!title) return null;
  const m = meOrThrow();
  const ws = currentWs(m, sessionStore.get().ws);
  const t: Task = {
    id: uid('t'),
    title,
    owner: extra.owner ?? m.id,
    due: extra.due ?? null,
    time: extra.time ?? null,
    status: 'todo',
    reviewer: null,
    project: extra.project ?? null,
    milestone: extra.milestone ?? null,
    div: extra.div ?? projOf(W(db), extra.project)?.div ?? m.div ?? ws,
    notes: extra.notes ?? '',
    evidence: '',
    doneAt: null,
    createdBy: m.id,
    createdAt: nowStamp(),
    offer: extra.offer ?? null,
    meeting: extra.meeting ?? null,
    links: extra.links ?? [],
    mentions: extra.mentions ?? [],
    trashed: false,
    start: null,
    deps: [],
    assignees: [],
    parent: null,
    inWbs: false,
    phase: false,
    remarks: '',
    order: null,
    icon: null,
    reactions: {},
  };
  db.tasks.unshift(t);
  logChange(db, taskDiv(W(db), t), 'created task', ref(t));
  return db.tasks[0] ?? null;
}

/** Quick add (work_task_fields): @people, a day word and a time are understood; the chip date wins over a day word. */
export function quickAddTask(
  text: string,
  chipDue: string | null,
  at: { project?: string | null; milestone?: string | null } = {},
) {
  return act(({ db, toast }) => {
    const q = parseQuick(W(db), text);
    const due = chipDue ?? q.due;
    const t = addTaskDraft(db, q.title, {
      due,
      time: due ? q.time : null,
      mentions: q.mentions,
      project: at.project ?? null,
      milestone: at.milestone ?? null,
    });
    if (!t) return;
    const id = t.id;
    toast(due ? tr('Task added, due {d}', { d: dLong(due) }) : tr('Task added'), ({ db: d }) => {
      d.tasks = d.tasks.filter((x) => x.id !== id);
    });
  });
}

/** A task made by clicking or dragging across days on the timeline: it gets that start and due date (and the project, if any). */
export function addTaskOnTimeline(text: string, start: string, due: string, project: string | null) {
  return act(({ db, toast }) => {
    const q = parseQuick(W(db), text);
    const t = addTaskDraft(db, q.title || text, { project, due, mentions: q.mentions });
    if (!t) return;
    t.start = start;
    const id = t.id;
    toast(
      tr('Task added, {d}', { d: start === due ? dLong(start) : `${dShort(start)} – ${dShort(due)}` }),
      ({ db: d }) => {
        d.tasks = d.tasks.filter((x) => x.id !== id);
      },
    );
  });
}

// ---------- status ----------

interface StatusOpt {
  silent?: boolean;
}

/** The base status change (setStatus0): reviewer defaults, Done date, notifications, Changes entry and the Undo toast. */
function setStatusBase(ctx: Ctx, t: Draft<Task>, s: TaskStatus, opt: StatusOpt = {}) {
  const { db } = ctx;
  const m = meOrThrow();
  if (!canEditTask(W(db), m, t)) {
    ctx.toast(tr('Only {who} or the project lead can change this task', { who: firstName(W(db), t.owner) }));
    return;
  }
  const prev = { status: t.status, doneAt: t.doneAt, reviewer: t.reviewer };
  if (s === 'review' && !t.reviewer) {
    const p = projOf(W(db), t.project);
    t.reviewer = [p?.lead, t.createdBy, p?.pm].find((x) => !!x && x !== t.owner) ?? null;
  }
  t.status = s;
  t.doneAt = s === 'done' ? today() : null;
  if (s === 'review' && t.reviewer) notify(db, t.reviewer, 'review', { type: 'task', id: t.id });
  if (prev.status === 'review' && t.reviewer === m.id && t.owner !== m.id)
    notify(db, t.owner, s === 'done' ? 'approved' : 'returned', { type: 'task', id: t.id });
  logChange(
    db,
    taskDiv(W(db), t),
    s === 'done' ? 'completed' : prev.status === 'done' ? 'reopened' : 'changed status of',
    ref(t),
    statusWord(prev.status),
    statusWord(s),
  );
  if (!opt.silent) {
    const id = t.id;
    ctx.toast(
      s === 'done'
        ? tr('Task completed')
        : prev.status === 'done'
          ? tr('Task reopened')
          : tr('Moved to {s}', { s: statusWord(s) }),
      ({ db: d }) => {
        const x = find(d, id);
        if (x) Object.assign(x, prev);
      },
    );
  }
}

/** Status change with sign-off (D35): a doer's "done" becomes "In review" with the signer; the signer's "done" signs it off. */
export function setStatusIn(ctx: Ctx, t: Draft<Task>, s: TaskStatus, opt: StatusOpt = {}) {
  const { db } = ctx;
  const m = meOrThrow();
  const sg = signerFor(W(db), t);
  if (s === 'done' && sg && !canSignOff(W(db), m, t)) {
    if (!canEditTask(W(db), m, t)) {
      setStatusBase(ctx, t, s, opt);
      return;
    }
    if (t.status === 'review') {
      ctx.toast(tr('Waiting for {who} to sign off.', { who: firstName(W(db), t.reviewer ?? sg) }));
      return;
    }
    const prev = { status: t.status, reviewer: t.reviewer, doneBy: t.doneBy ?? null, finishedAt: t.finishedAt ?? null };
    t.reviewer = sg;
    t.doneBy = m.id;
    t.finishedAt = nowStamp();
    setStatusBase(ctx, t, 'review', { silent: true });
    const id = t.id;
    ctx.toast(tr('Sent to {who} to sign off', { who: firstName(W(db), sg) }), ({ db: d }) => {
      const x = find(d, id);
      if (x) Object.assign(x, prev);
      d.updates = d.updates.filter((u) => !(u.type === 'review' && u.ref.id === id && u.to === sg && !u.read));
    });
    return;
  }
  if (s === 'done' && sg && canSignOff(W(db), m, t)) {
    const prev = {
      status: t.status,
      doneAt: t.doneAt,
      reviewer: t.reviewer,
      signedBy: t.signedBy ?? null,
      signedAt: t.signedAt ?? null,
      doneBy: t.doneBy ?? null,
    };
    t.reviewer = m.id;
    t.signedBy = m.id;
    t.signedAt = nowStamp();
    t.doneBy = t.doneBy ?? t.owner;
    setStatusBase(ctx, t, 'done', { silent: true });
    if (!opt.silent) {
      const id = t.id;
      ctx.toast(tr('Signed off'), ({ db: d }) => {
        const x = find(d, id);
        if (x) Object.assign(x, prev);
      });
    }
    return;
  }
  if (s !== 'done' && isDone(t) && t.signedBy) {
    t.signedBy = null;
    t.signedAt = null;
  }
  setStatusBase(ctx, t, s, opt);
}

export function setStatus(id: string, s: TaskStatus, origin?: HTMLElement | null) {
  return act(
    (ctx) => {
      const t = find(ctx.db, id);
      if (t && t.status !== s) setStatusIn(ctx, t, s);
    },
    { origin },
  );
}

/** The checkbox: done or back to in progress. A task someone gave you opens its hand-in form instead (D58). */
export function toggleTask(id: string, origin?: HTMLElement | null) {
  return act(
    (ctx) => {
      const t = find(ctx.db, id);
      if (!t) return;
      const m = meOrThrow();
      if (needsHandIn(W(ctx.db), m, t)) {
        ctx.ui.insp = { type: 'task', id, focusHandIn: true };
        ctx.ui.form = null;
        return;
      }
      setStatusIn(ctx, t, isDone(t) ? 'doing' : 'done');
    },
    { origin },
  );
}

/** Choosing a status (panel, board menu): Completed on a task to hand in opens the panel instead. */
export function chooseStatus(id: string, s: TaskStatus) {
  return act((ctx) => {
    ctx.ui.menu = null;
    const t = find(ctx.db, id);
    if (!t || t.status === s) return;
    if (s === 'done' && needsHandIn(W(ctx.db), meOrThrow(), t)) {
      ctx.ui.insp = { type: 'task', id };
      return;
    }
    setStatusIn(ctx, t, s);
  });
}

export function trashTask(id: string) {
  return act(({ db, ui, toast }) => {
    const t = find(db, id);
    if (!t) return;
    t.trashed = true;
    logChange(db, taskDiv(W(db), t), 'moved to trash', ref(t));
    ui.insp = null;
    toast(tr('Task moved to trash'), ({ db: d }) => {
      const x = find(d, id);
      if (x) x.trashed = false;
    });
  });
}

/** The reviewer approves (review-approve) or sends it back with a note (review-return). */
export function reviewTask(id: string, approve: boolean, note = '') {
  return act((ctx) => {
    const t = find(ctx.db, id);
    if (!t) return;
    if (approve) {
      t.reviewChoice = 'approved';
      t.reviewedAt = nowStamp();
      setStatusIn(ctx, t, 'done');
    } else {
      t.returnNote = note.trim();
      t.reviewChoice = 'returned';
      t.reviewedAt = nowStamp();
      ctx.ui.form = null;
      setStatusIn(ctx, t, 'doing');
    }
  });
}

// ---------- fields edited in the task panel ----------

export type TaskField = 'title' | 'due' | 'time' | 'notes' | 'start' | 'evidence' | 'reviewer';

/** Saves one panel field (the prototype's data-bind change handler). Returns an error message when the value is refused. */
export function setTaskField(id: string, field: TaskField, value: string): Promise<boolean> | string {
  if (field === 'evidence' && value && !value.startsWith('https://'))
    return tr('Use a full link starting with https://');
  return act(({ db, toast }) => {
    const t = find(db, id);
    if (!t) return;
    const before = t[field];
    if (field === 'time') t.time = toMin(value);
    else if (field === 'start' && value && t.due && value > t.due) return;
    else if (field === 'due' || field === 'reviewer' || field === 'start') t[field] = value || null;
    else t[field] = value;
    if (field === 'due' && !t.due) {
      t.time = null;
      t.start = null;
    }
    if (field === 'due' && t.start && t.due && t.due < t.start) t.start = null;
    if (field === 'reviewer' && t.reviewer && t.status === 'review')
      notify(db, t.reviewer, 'review', { type: 'task', id: t.id });
    if (field === 'title' || field === 'due')
      logChange(
        db,
        taskDiv(W(db), t),
        'edited',
        ref(t),
        field === 'due' ? (typeof before === 'string' && before ? dShort(before) : tr('No date')) : null,
        field === 'due' ? (t.due ? dShort(t.due) : tr('No date')) : null,
      );
    toast(tr('Saved'));
  });
}

/** Move or stretch dates: exactly one task changes, start never after due, date-only stays date-only (timeline_date_validation). */
export function setTaskDatesIn(ctx: Ctx, t: Draft<Task>, start: string | null, due: string | null) {
  if (start && due && start > due) {
    ctx.toast(tr('The start cannot be after the due date.'));
    return;
  }
  const prev = { start: t.start ?? null, due: t.due };
  if (prev.start === start && prev.due === due) return;
  t.start = start;
  t.due = due;
  const fmt = (s: string | null, d: string | null) => (s ? `${dShort(s)} – ${d ? dShort(d) : ''}` : d ? dShort(d) : '');
  logChange(ctx.db, taskDiv(W(ctx.db), t), 'edited', ref(t), fmt(prev.start, prev.due), fmt(start, due));
  const id = t.id;
  ctx.toast(tr('Dates changed to {d}', { d: fmt(start, due) }), ({ db: d }) => {
    const x = find(d, id);
    if (x) Object.assign(x, prev);
  });
}

export const setTaskDates = (id: string, start: string | null, due: string | null) =>
  act((ctx) => {
    const t = find(ctx.db, id);
    if (t) setTaskDatesIn(ctx, t, start, due);
  });

// ---------- blockers ----------

export function raiseBlocker(
  id: string,
  b: { text: string; owner: PersonId; severity: 'low' | 'medium' | 'high'; action: string },
) {
  return act(({ db, ui, toast }) => {
    const t = find(db, id);
    if (!t) return;
    const bid = uid('b');
    db.blockers.push({
      id: bid,
      task: t.id,
      project: t.project ?? '',
      text: b.text,
      owner: b.owner,
      severity: b.severity,
      action: b.action,
      state: 'open',
      openedBy: meOrThrow().id,
      openedAt: nowStamp(),
      resolution: '',
      resolvedAt: null,
    });
    notify(db, b.owner, 'blocker', { type: 'task', id: t.id });
    logChange(db, taskDiv(W(db), t), 'raised a blocker on', ref(t));
    ui.form = null;
    toast(tr('Blocker raised. {who} was told.', { who: firstName(W(db), b.owner) }), ({ db: d }) => {
      d.blockers = d.blockers.filter((x) => x.id !== bid);
    });
  });
}

export function resolveBlocker(blockerId: string, resolution: string) {
  return act(({ db, ui, toast }) => {
    const b = db.blockers.find((x) => x.id === blockerId);
    const t = b && find(db, b.task);
    if (!b || !t) return;
    const m = meOrThrow();
    b.state = 'resolved';
    b.resolution = resolution;
    b.resolvedAt = nowStamp();
    (b as Draft<typeof b> & { resolvedBy?: string }).resolvedBy = m.id;
    if (t.owner !== m.id) notify(db, t.owner, 'unblocked', { type: 'task', id: t.id });
    logChange(db, taskDiv(W(db), t), 'resolved a blocker on', ref(t));
    ui.form = null;
    toast(tr('Blocker resolved'), ({ db: d }) => {
      const x = d.blockers.find((y) => y.id === blockerId);
      if (x) {
        x.state = 'open';
        x.resolvedAt = null;
      }
    });
  });
}

// ---------- offers (access_delegation: the recipient decides; silence never accepts) ----------

export interface OfferDraft {
  to: PersonId;
  title: string;
  result: string;
  due: string | null;
  project: string | null;
  note: string;
  fromTask: string | null;
}

export function sendOffer(o: OfferDraft) {
  return act(({ db, ui, toast }) => {
    const m = meOrThrow();
    const id = uid('o');
    db.offers.push({
      id,
      from: m.id,
      to: o.to,
      title: o.title,
      result: o.result,
      due: o.due,
      project: o.project,
      state: 'pending',
      note: o.note,
      task: o.fromTask,
      at: nowStamp(),
      answeredAt: null,
    });
    notify(db, o.to, 'offer', { type: 'offer', id });
    const td = personOf(W(db), o.to)?.div;
    if (td && td !== m.div)
      for (const i of unitLeads(W(db), td)) if (i !== o.to) notify(db, i, 'offer-fyi', { type: 'offer', id });
    ui.insp = { type: 'offer', id };
    toast(
      tr('Sent to {who}. Nothing is assigned until they accept.', { who: firstName(W(db), o.to) }),
      ({ db: d, ui: u }) => {
        d.offers = d.offers.filter((v) => v.id !== id);
        d.updates = d.updates.filter((x) => !(x.ref.type === 'offer' && x.ref.id === id));
        u.insp = null;
      },
    );
  });
}

export function answerOffer(id: string, r: 'accepted' | 'declined' | 'changes', reply = '') {
  return act(({ db, ui, toast }) => {
    const o = db.offers.find((v) => v.id === id);
    if (!o) return;
    o.state = r;
    o.answeredAt = nowStamp();
    if (r === 'changes') o.reply = reply;
    if (r === 'accepted') {
      if (o.task) {
        const t = find(db, o.task);
        if (t) {
          t.owner = o.to;
          t.offer = o.id;
          t.givenBy = o.from;
          t.givenAt = nowStamp();
        }
      } else {
        const t = addTaskDraft(db, o.title, {
          owner: o.to,
          due: o.due,
          project: o.project,
          notes: o.result ? `${tr('Expected result')}: ${o.result}` : '',
          offer: o.id,
          links: o.resource ? [o.resource] : [],
          meeting: o.meeting ?? null,
          div: projOf(W(db), o.project)?.div ?? personOf(W(db), o.from)?.div ?? null,
        });
        if (t) {
          t.createdBy = o.from;
          t.givenBy = o.from;
          t.givenAt = nowStamp();
          o.task = t.id;
        }
      }
    }
    notify(db, o.from, r === 'accepted' ? 'offer-accepted' : r === 'declined' ? 'offer-declined' : 'offer-changes', {
      type: 'offer',
      id: o.id,
    });
    ui.form = null;
    if (r === 'accepted' && o.task) ui.insp = { type: 'task', id: o.task };
    toast(
      r === 'accepted'
        ? tr('Accepted. It is in your tasks now.')
        : r === 'declined'
          ? tr('Declined. {who} was told.', { who: firstName(W(db), o.from) })
          : tr('Sent your questions to {who}', { who: firstName(W(db), o.from) }),
    );
  });
}

export function withdrawOffer(id: string) {
  return act(({ db, toast }) => {
    const o = db.offers.find((v) => v.id === id);
    if (o?.from !== meOrThrow().id) return;
    const prev = { ...o };
    o.state = 'withdrawn';
    o.answeredAt = nowStamp();
    notify(db, o.to, 'offer-withdrawn', { type: 'offer', id: o.id });
    toast(tr('Offer withdrawn. {who} was told.', { who: firstName(W(db), o.to) }), ({ db: d }) => {
      const x = d.offers.find((v) => v.id === id);
      if (x) Object.assign(x, prev);
      d.updates = d.updates.filter((u) => !(u.type === 'offer-withdrawn' && u.ref.id === id));
    });
  });
}

export function resendOffer(id: string, v: { title: string; result: string; due: string | null; note: string }) {
  return act(({ db, ui, toast }) => {
    const o = db.offers.find((x) => x.id === id);
    if (o?.from !== meOrThrow().id || o.state !== 'changes') return;
    const prev = { ...o };
    Object.assign(o, {
      title: v.title.trim(),
      result: v.result,
      due: v.due,
      note: v.note,
      state: 'pending',
      revisedAt: nowStamp(),
      round: (o.round ?? 1) + 1,
    });
    notify(db, o.to, 'offer-revised', { type: 'offer', id: o.id });
    ui.form = null;
    toast(tr('Sent to {who} again', { who: firstName(W(db), o.to) }), ({ db: d }) => {
      const x = d.offers.find((y) => y.id === id);
      if (x) Object.assign(x, prev);
    });
  });
}

// ---------- shared responsibility (owner round 8, request R13) ----------

/** Someone from the task's own division joins at once; someone from another division is asked first. */
export function addAssigneeIn(ctx: Ctx, t: Draft<Task>, id: PersonId) {
  const { db } = ctx;
  const q = personOf(W(db), id);
  if (!q || t.owner === id || t.assignees.some((a) => a.id === id && a.state !== 'declined')) return;
  t.assignees = t.assignees.filter((a) => a.id !== id);
  const direct = !q.div || q.div === taskDiv(W(db), t);
  t.assignees.push({ id, state: direct ? 'joined' : 'invited', by: meOrThrow().id, at: nowStamp(), direct });
  notify(db, id, direct ? 'tadded' : 'tasked', { type: 'task', id: t.id });
  logChange(db, taskDiv(W(db), t), direct ? 'added a person to' : 'asked a person to share', ref(t));
  const tid = t.id;
  ctx.toast(
    direct ? tr('{who} added', { who: q.first }) : tr('{who} asked. They share it after accepting.', { who: q.first }),
    ({ db: d }) => {
      const x = find(d, tid);
      if (x) x.assignees = x.assignees.filter((v) => v.id !== id);
    },
  );
}

export const addAssignee = (taskId: string, id: PersonId) =>
  act((ctx) => {
    const t = find(ctx.db, taskId);
    if (t) addAssigneeIn(ctx, t, id);
  });

export function removeAssignee(taskId: string, id: PersonId) {
  return act(({ db, toast }) => {
    const t = find(db, taskId);
    const a = t?.assignees.find((v) => v.id === id);
    if (!t || !a || !canEditTask(W(db), meOrThrow(), t)) return;
    const saved = { ...a };
    t.assignees = t.assignees.filter((v) => v.id !== id);
    if (a.state === 'joined') notify(db, a.id, 'tresp-removed', { type: 'task', id: t.id });
    logChange(db, taskDiv(W(db), t), 'removed a person from', ref(t));
    toast(tr('{who} removed', { who: firstName(W(db), id) }), ({ db: d }) => {
      d.tasks.find((x) => x.id === taskId)?.assignees.push(saved);
    });
  });
}

/** Answer a request to share a task (tassign). */
export function answerAssignment(taskId: string, yes: boolean) {
  return act(({ db, toast }) => {
    const t = find(db, taskId);
    const m = meOrThrow();
    const a = t?.assignees.find((v) => v.id === m.id && v.state === 'invited');
    if (!t || !a) return;
    const prev = { ...a };
    a.state = yes ? 'joined' : 'declined';
    a.answeredAt = nowStamp();
    notify(db, a.by, yes ? 'tasked-yes' : 'tasked-no', { type: 'task', id: t.id });
    if (t.owner !== a.by) notify(db, t.owner, yes ? 'tasked-yes' : 'tasked-no', { type: 'task', id: t.id });
    toast(yes ? tr('You now share {t}', { t: t.title }) : tr('Declined'), ({ db: d }) => {
      const x = d.tasks.find((y) => y.id === taskId)?.assignees.find((v) => v.id === m.id);
      if (x) Object.assign(x, prev);
    });
  });
}

// ---------- reactions and icons (owner round 7) ----------

export type Reactable = 'task' | 'meeting';

/** One reaction per person per item; tapping your own again removes it. The item's owner is told once. */
export function react(kind: Reactable, id: string, emoji: string) {
  return act(({ db, ui }) => {
    const me = meOrThrow().id;
    const x = kind === 'meeting' ? db.meetings.find((v) => v.id === id) : find(db, id);
    if (!x) return;
    const r = x.reactions;
    const had = (r[emoji] ?? []).includes(me);
    for (const k of Object.keys(r)) {
      r[k] = (r[k] ?? []).filter((p) => p !== me);
      if (!r[k].length) Reflect.deleteProperty(r, k);
    }
    if (!had) (r[emoji] ??= []).push(me);
    const owner = kind === 'meeting' ? (x as Draft<Workspace['meetings'][number]>).organizer : (x as Draft<Task>).owner;
    if (!had && owner !== me) {
      db.updates = db.updates.filter(
        (u) => !(u.to === owner && u.actor === me && u.type === `react-${kind}` && u.ref.id === id && !u.read),
      );
      notify(db, owner, `react-${kind}`, { type: kind, id });
    }
    ui.menu = null;
  });
}

export function setItemIcon(kind: 'task' | 'meeting' | 'routine', id: string, icon: TaskIcon | null) {
  return act(({ db, ui }) => {
    // The routine builder's unsaved draft has the id 'draft'.
    if (kind === 'routine' && id === 'draft') {
      const d = ui.rtDraft as { icon: TaskIcon | null } | null | undefined;
      if (d) d.icon = icon ? { ...icon } : null;
      return;
    }
    const x =
      kind === 'meeting'
        ? db.meetings.find((v) => v.id === id)
        : kind === 'routine'
          ? db.routines?.find((v) => v.id === id)
          : find(db, id);
    if (!x) return;
    x.icon = icon ? { ...icon } : null;
    // A new icon on a routine also shows on its runs nobody has finished.
    if (kind === 'routine')
      for (const t of db.tasks) if (t.routine === id && !isDone(t)) t.icon = icon ? { ...icon } : null;
  });
}

// ---------- dependencies (work_dependencies; owner round 7) ----------

export const DEP_T: Record<DependencyType, [string, string]> = {
  FS: ['Finish to start', 'Starts after it finishes'],
  SS: ['Start to start', 'Starts when it starts'],
  FF: ['Finish to finish', 'Finishes when it finishes'],
  SF: ['Start to finish', 'Finishes after it starts'],
};
export const tS = (t: Task) => t.start ?? t.due;
export const tE = (t: Task) => t.due;
export const predsOf = (db: Workspace, t: Task) =>
  t.deps.flatMap((d) => {
    const x = taskOf(db, d.id);
    return x && !x.trashed ? [{ id: d.id, type: d.type, t: x }] : [];
  });
export const succsOf = (db: Workspace, t: Task) =>
  db.tasks.filter((x) => !x.trashed && x.deps.some((d) => d.id === t.id));
function depNeed(pred: Task, succ: Task, type: DependencyType) {
  const pe = tE(pred);
  const se = tE(succ);
  if (!pe || !se) return null;
  if (type === 'FS') return { f: 's', min: addDays(pe, 1) };
  if (type === 'SS') return { f: 's', min: tS(pred) ?? pe };
  if (type === 'FF') return { f: 'e', min: pe };
  return { f: 'e', min: tS(pred) ?? pe };
}
export const depOk = (pred: Task, succ: Task, type: DependencyType) => {
  const n = depNeed(pred, succ, type);
  return !n || ((n.f === 's' ? tS(succ) : tE(succ)) ?? '') >= n.min;
};
export function waitsFor(db: Workspace, a: Task, b: Task, seen = new Set<string>()): boolean {
  if (a.id === b.id) return true;
  if (seen.has(a.id)) return false;
  seen.add(a.id);
  return predsOf(db, a).some((d) => waitsFor(db, d.t, b, seen));
}

export function addDep(succId: string, predId: string, type: DependencyType) {
  return act(({ db, toast }) => {
    const succ = find(db, succId);
    const pred = find(db, predId);
    if (!succ || !pred) return;
    if (!canEditTask(W(db), meOrThrow(), succ)) {
      toast(tr('Only {who} or the project lead can change this task', { who: firstName(W(db), succ.owner) }));
      return;
    }
    if (succ.id === pred.id) {
      toast(tr('A task cannot wait for itself.'));
      return;
    }
    if (waitsFor(W(db), pred, succ)) {
      toast(tr('That would make a loop: {a} already waits for {b}.', { a: pred.title, b: succ.title }));
      return;
    }
    const prev = succ.deps.map((d) => ({ ...d }));
    const old = succ.deps.find((d) => d.id === pred.id);
    if (old) old.type = type;
    else succ.deps.push({ id: pred.id, type });
    logChange(db, taskDiv(W(db), succ), 'linked', ref(succ), null, `${tr(DEP_T[type][0])}: ${pred.title}`);
    toast(
      depOk(pred, succ, type)
        ? tr('{b} now waits for {a}', { a: pred.title, b: succ.title })
        : tr('Linked. {b} is now too early; use Fix dates.', { b: succ.title }),
      ({ db: d }) => {
        const x = find(d, succId);
        if (x) x.deps = prev;
      },
    );
  });
}

export function removeDep(succId: string, predId: string) {
  return act(({ db, toast }) => {
    const succ = find(db, succId);
    if (!succ || !canEditTask(W(db), meOrThrow(), succ)) return;
    const prev = succ.deps.map((d) => ({ ...d }));
    succ.deps = prev.filter((d) => d.id !== predId);
    logChange(db, taskDiv(W(db), succ), 'unlinked', ref(succ));
    toast(tr('Link removed'), ({ db: d }) => {
      const x = find(d, succId);
      if (x) x.deps = prev;
    });
  });
}

/** The smallest forward shift for each task that starts or ends too early, in dependency order; duration is kept. */
export function fixPlan(db: Workspace, me: Person, tasks: Task[]) {
  const tmp = new Map<string, { s: string | null; e: string | null }>();
  const get = (t: Task) => tmp.get(t.id) ?? { s: t.start ?? null, e: t.due };
  const S = (t: Task) => get(t).s ?? get(t).e;
  const E = (t: Task) => get(t).e;
  const order: Task[] = [];
  const seen = new Set<string>();
  const visit = (t: Task) => {
    if (seen.has(t.id)) return;
    seen.add(t.id);
    for (const d of predsOf(db, t)) visit(d.t);
    order.push(t);
  };
  tasks.forEach(visit);
  const ids = new Set(tasks.map((t) => t.id));
  const out: { t: Task; from: { s: string | null; e: string | null }; to: { s: string | null; e: string } }[] = [];
  for (const t of order) {
    const e0 = E(t);
    if (!ids.has(t.id) || !e0) continue;
    let shift = 0;
    for (const d of predsOf(db, t)) {
      const pe = E(d.t);
      if (!pe) continue;
      const pair: Record<DependencyType, [string | null, string | null]> = {
        FS: [S(t), addDays(pe, 1)],
        SS: [S(t), S(d.t)],
        FF: [E(t), pe],
        SF: [E(t), S(d.t)],
      };
      const [cur, min] = pair[d.type];
      if (cur && min && cur < min) shift = Math.max(shift, daysBetween(cur, min));
    }
    if (shift > 0 && canEditTask(db, me, t)) {
      const g = get(t);
      const to = { s: g.s ? addDays(g.s, shift) : null, e: addDays(e0, shift) };
      out.push({ t, from: { ...g }, to });
      tmp.set(t.id, to);
    }
  }
  return out;
}

export const rangeTxt = (r: { s: string | null; e: string | null }) =>
  r.s && r.s !== r.e ? `${dShort(r.s)} – ${r.e ? dShort(r.e) : ''}` : r.e ? dShort(r.e) : '';

export function applyFixPlan(tasks: Task[]) {
  return act(({ db, ui, toast }) => {
    ui.menu = null;
    const plan = fixPlan(
      W(db),
      meOrThrow(),
      tasks.map((t) => find(db, t.id) ?? t).filter((t) => !!t.due),
    );
    if (!plan.length) return;
    for (const x of plan) {
      const t = find(db, x.t.id);
      if (!t) continue;
      t.start = x.to.s;
      t.due = x.to.e;
      logChange(db, taskDiv(W(db), t), 'edited', ref(t), rangeTxt(x.from), rangeTxt(x.to));
    }
    toast(plural(plan.length, '{n} task moved', '{n} tasks moved'), ({ db: d }) => {
      for (const x of plan) {
        const t = find(d, x.t.id);
        if (t) {
          t.start = x.from.s;
          t.due = x.from.e;
        }
      }
    });
  });
}

// ---------- hand in and assess (D58) ----------

export interface HandInDraft {
  links: string[];
  note: string;
}

const hiSnap = (t: Task) =>
  structuredClone({
    status: t.status,
    doneAt: t.doneAt,
    reviewer: t.reviewer,
    doneBy: t.doneBy ?? null,
    finishedAt: t.finishedAt ?? null,
    signedBy: t.signedBy ?? null,
    signedAt: t.signedAt ?? null,
    evidence: t.evidence,
    rating: t.rating ?? null,
    returnNote: t.returnNote ?? '',
    reviewChoice: t.reviewChoice ?? null,
    reviewedAt: t.reviewedAt ?? null,
    submissions: (t.submissions as Submission[] | undefined) ?? [],
  });
const dropUpdate = (d: Draft<Workspace>, type: string, id: string, to: string | null | undefined) => {
  d.updates = d.updates.filter((u) => !(u.type === type && u.ref.id === id && u.to === to && !u.read));
};

/** Returns an error message for an invalid hand-in, 'confirm' when there are no links yet, or the save. */
export function handIn(id: string, draft: HandInDraft, force: boolean): string | Promise<boolean> {
  const urls = draft.links.map((v) => v.trim()).filter(Boolean);
  if (urls.some((u) => !/^https:\/\/\S+\.\S+/.test(u))) return tr('Use full links that start with https://');
  if (!urls.length && !force) return 'confirm';
  return act((ctx) => {
    const { db } = ctx;
    const t = find(db, id);
    const m = meOrThrow();
    if (!t || !needsHandIn(W(db), m, t)) return;
    const sg = signerFor(W(db), t);
    const prev = hiSnap(t);
    const sub: Submission = {
      id: uid('sub'),
      at: nowStamp(),
      by: m.id,
      links: urls.map((url) => ({ url, label: linkLabel(url) })),
      note: draft.note.trim(),
    };
    t.submissions = [...((t.submissions as Submission[] | undefined) ?? []), sub];
    t.evidence = urls[0] ?? '';
    t.returnNote = '';
    t.reviewer = sg;
    t.doneBy = m.id;
    t.finishedAt = sub.at;
    setStatusBase(ctx, t, 'review', { silent: true });
    ctx.toast(tr('Handed in to {who}', { who: firstName(W(db), sg) }), ({ db: d }) => {
      const x = find(d, id);
      if (x) Object.assign(x, prev);
      dropUpdate(d, 'review', id, sg);
    });
  });
}

export function unsubmit(id: string) {
  return act((ctx) => {
    const { db } = ctx;
    const t = find(db, id);
    const cur = t && lastSub(t);
    if (!t || !cur || cur.review || t.owner !== meOrThrow().id || t.status !== 'review') return;
    const prev = hiSnap(t);
    const who = t.reviewer;
    const sub = (t.submissions as Submission[]).find((s) => s.id === cur.id);
    if (sub) sub.withdrawn = nowStamp();
    dropUpdate(db, 'review', id, who);
    setStatusBase(ctx, t, 'doing', { silent: true });
    ctx.toast(tr('Unsubmitted. You can change your work and hand it in again.'), ({ db: d }) => {
      const x = find(d, id);
      if (x) Object.assign(x, prev);
    });
  });
}

/** The giver accepts with a rating, or returns with a comment. Returns an error message when something is missing. */
export function assessHandIn(
  id: string,
  accept: boolean,
  rating: Rating | null,
  comment: string,
): string | Promise<boolean> {
  if (accept && !rating) return tr('Choose a rating before you accept.');
  return act((ctx) => {
    const { db } = ctx;
    const t = find(db, id);
    const m = meOrThrow();
    const cur = t && lastSub(t);
    if (!t || !cur || !canSignOff(W(db), m, t)) return;
    if (!accept && !comment.trim()) return;
    const prev = hiSnap(t);
    const sub = (t.submissions as Submission[]).find((s) => s.id === cur.id);
    if (!sub) return;
    if (accept && rating) {
      sub.review = { by: m.id, at: nowStamp(), result: 'accepted', rating, comment: comment.trim() };
      t.rating = rating;
      t.reviewChoice = 'approved';
      t.reviewedAt = sub.review.at;
      setStatusIn(ctx, t, 'done', { silent: true });
      ctx.toast(tr('Accepted and rated {r}', { r: tr(RATING[rating][0]) }), ({ db: d }) => {
        const x = find(d, id);
        if (x) Object.assign(x, prev);
        dropUpdate(d, 'approved', id, t.owner);
      });
    } else {
      sub.review = { by: m.id, at: nowStamp(), result: 'returned', rating: null, comment: comment.trim() };
      t.returnNote = comment.trim();
      t.reviewChoice = 'returned';
      t.reviewedAt = sub.review.at;
      t.reviewer = m.id;
      setStatusBase(ctx, t, 'doing', { silent: true });
      const owner = t.owner;
      ctx.toast(tr('Returned to {who}', { who: firstName(W(db), owner) }), ({ db: d }) => {
        const x = find(d, id);
        if (x) Object.assign(x, prev);
        dropUpdate(d, 'returned', id, owner);
      });
    }
  });
}

// ---------- sign-off settings on a task ----------

export function setSignoffMode(id: string, mode: 'on' | 'off') {
  return act(({ db, toast }) => {
    const t = find(db, id);
    if (!t) return;
    const prev = t.signoffMode;
    t.signoffMode = mode;
    toast(mode === 'on' ? tr('Sign-off needed') : tr('No sign-off needed'), ({ db: d }) => {
      const x = find(d, id);
      if (x) x.signoffMode = prev;
    });
  });
}

export function setSigner(id: string, signer: PersonId) {
  return act(({ db }) => {
    const t = find(db, id);
    if (!t) return;
    t.signer = signer;
    if (t.status === 'review') {
      t.reviewer = signer;
      notify(db, signer, 'review', { type: 'task', id: t.id });
    }
  });
}

// ---------- repeating a personal task (D31) ----------

export function repeatTask(id: string, cadence: 'weekly' | '2w' | 'monthly') {
  return act(({ db, toast }) => {
    const t = find(db, id);
    const m = meOrThrow();
    if (!t) return;
    const st = t.due ?? today();
    const r: Routine = {
      id: uid('rt'),
      name: t.title,
      unit: null,
      personal: true,
      project: null,
      cadence,
      every: cadence === 'weekly' ? 7 : 14,
      start: st,
      dueOffset: 0,
      time: t.time ?? null,
      owners: [m.id],
      rotate: false,
      checklist: [],
      paused: false,
      skips: [],
      createdBy: m.id,
      at: nowStamp(),
      icon: t.icon ?? undefined,
    };
    const prev = { due: t.due, routine: t.routine ?? null, occ: t.occ ?? null };
    t.due = st;
    t.routine = r.id;
    t.occ = st;
    (db.routines ??= []).push(r);
    ensureRoutines(db, currentWs(m, sessionStore.get().ws));
    toast(tr('Repeats: {c}', { c: cadText(r) }), ({ db: d }) => {
      d.tasks = d.tasks.filter((x) => x.id === id || x.routine !== r.id);
      d.routines = (d.routines ?? []).filter((x) => x.id !== r.id);
      const x = find(d, id);
      if (x) Object.assign(x, prev);
    });
  });
}

/** A personal repeat stops: upcoming runs nobody started go away; past ones stay. */
export function stopRepeating(routineId: string) {
  return act(({ db, toast }) => {
    const r = db.routines?.find((x) => x.id === routineId);
    if (!r) return;
    const before = new Map(db.tasks.map((x) => [x.id, x]));
    r.paused = true;
    pruneFuture(db, r);
    const removed = [...before.values()]
      .filter((x) => !db.tasks.some((y) => y.id === x.id))
      .map((x) => structuredClone(x as Task));
    toast(tr('Stopped repeating. Past ones stay.'), ({ db: d }) => {
      const x = d.routines?.find((y) => y.id === routineId);
      if (x) x.paused = false;
      d.tasks.push(...removed);
    });
  });
}
