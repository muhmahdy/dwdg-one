/* Escalations: the VP forwards a blocker to the President, who acknowledges, returns or resolves it (blueprint §4, §12 handoff
   contract). States: requested -> acknowledged / returned -> resolved, plus withdrawn. Who may escalate and the threshold are
   open policy; proposed: the VP. An escalation never changes the blocker or the task by itself. From screens/perf.js. */
import type { Draft } from 'immer';
import { rank } from '@/lib/access';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { nowStamp } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, setUi, type UndoRecipe } from '@/lib/workspace/transaction';
import { registerUpdateText } from '@/features/updates/services/update-text';
import { taskDiv, taskOf } from '@/features/work/services/selectors';
import { isBoard, isPres, isVP } from '@/lib/roles';
import type { DateStr, DivisionId, EntityRef, PersonId, Stamp, Workspace } from '@/types/workspace';
import { activePeople } from './scope';

export type EscState = 'requested' | 'acknowledged' | 'returned' | 'resolved' | 'withdrawn';

export interface Escalation {
  id: string;
  kind: 'blocker';
  ref: { type: 'task'; id: string };
  blocker: string;
  div: DivisionId;
  title: string;
  from: PersonId;
  to: PersonId;
  reason: string;
  neededBy: DateStr | null;
  state: EscState;
  reply: string;
  nextOwner: PersonId | null;
  nextDate: DateStr | null;
  resolution: string;
  answeredBy: PersonId | null;
  answeredAt: Stamp | null;
  resolvedAt: Stamp | null;
  createdBy: PersonId;
  createdAt: Stamp;
}

/** Label, icon, tone for each state. */
export const ESC_ST: Record<EscState, [string, string, 'warn' | 'ink' | 'green' | 'mute']> = {
  requested: ['Waiting for the President', 'clock', 'warn'],
  acknowledged: ['Acknowledged', 'check', 'ink'],
  returned: ['Returned for information', 'undo', 'warn'],
  resolved: ['Resolved', 'check', 'green'],
  withdrawn: ['Withdrawn', 'close', 'mute'],
};

registerUpdateText({
  'perf-esc': '{who} escalated an item to you',
  'perf-esc-ack': '{who} acknowledged your escalation',
  'perf-esc-ret': '{who} returned your escalation for more information',
  'perf-esc-done': '{who} recorded a resolution on your escalation',
  'perf-esc-next': '{who} made you responsible for the next step',
});

export const escalationsOf = (db: Workspace): Escalation[] =>
  (db.perf as { escalations?: Escalation[] } | undefined)?.escalations ?? [];

/** The escalation list inside a draft, created on first use. */
const store = (db: Draft<Workspace>): Escalation[] => {
  const p = db.perf as { v: number; escalations?: Escalation[] } | undefined;
  if (p?.v !== 1 || !p.escalations) db.perf = { v: 1, escalations: [] };
  return (db.perf as unknown as { escalations: Escalation[] }).escalations;
};

const escTarget = (e: Escalation): EntityRef => ({ type: 'link', id: e.id, name: e.title, h: `attention/${e.id}` });

const notifyEsc = (db: Draft<Workspace>, to: PersonId | null, type: string, e: Escalation) => {
  notify(db, to, type, escTarget(e));
};

const firstOf = (db: Workspace, id: PersonId | null | undefined) => db.people.find((p) => p.id === id)?.first ?? '';

/** Who can take over the next step: leaders and people of the escalated division. */
export const nextOwnerChoices = (db: Workspace, e: Escalation) =>
  activePeople(db).filter((p) => !p.div || rank(p) >= 3 || p.div === e.div);

/** The VP sends a blocker to the President. Returns the new id, or null when it was not saved. */
export async function sendEscalation(blockerId: string, reason: string, neededBy: DateStr | null) {
  const me = getMe();
  const db0 = getDb();
  const b = db0.blockers.find((v) => v.id === blockerId);
  const pres = activePeople(db0).find(isPres);
  if (!me || !isVP(me) || !b || !pres) return null;
  const tk = taskOf(db0, b.task);
  const e: Escalation = {
    id: uid('esc-'),
    kind: 'blocker',
    ref: { type: 'task', id: b.task },
    blocker: b.id,
    div: (tk && taskDiv(db0, tk)) ?? me.div ?? 'mcit',
    title: b.text,
    from: me.id,
    to: pres.id,
    reason,
    neededBy,
    state: 'requested',
    reply: '',
    nextOwner: null,
    nextDate: null,
    resolution: '',
    answeredBy: null,
    answeredAt: null,
    resolvedAt: null,
    createdBy: me.id,
    createdAt: nowStamp(),
  };
  const ok = await act(({ db, ui, toast }) => {
    store(db).push(e);
    notifyEsc(db, pres.id, 'perf-esc', e);
    logChange(db, e.div, 'escalated to the President', escTarget(e));
    ui.insp = { type: 'perf-esc', id: e.id };
    ui.form = null;
    toast(t('Sent to {who}. Nothing changes until they answer.', { who: pres.first }), ({ db: d }) => {
      const list = store(d);
      const i = list.findIndex((v) => v.id === e.id);
      if (i >= 0) list.splice(i, 1);
      d.updates = d.updates.filter((u) => u.ref.h !== `attention/${e.id}`);
      logChange(d, e.div, 'withdrew an escalation', escTarget(e));
      setUi((u) => {
        u.insp = null;
      });
    });
  });
  return ok ? e.id : null;
}

/** Edits one escalation in place, with one Undo that restores what it held before. */
function update(
  id: string,
  can: (e: Escalation, meId: PersonId) => boolean,
  apply: (e: Draft<Escalation>, db: Draft<Workspace>, meId: PersonId) => void,
  message: (db: Workspace, e: Escalation) => string | null,
  undoVerb: string | null,
) {
  const me = getMe();
  if (!me || isBoard(me)) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const e = store(db).find((v) => v.id === id);
    if (!e || !can(e, me.id)) return;
    const prev = { ...e };
    apply(e, db, me.id);
    ui.form = null;
    const text = message(db, e);
    if (text) {
      const undo: UndoRecipe = ({ db: d }) => {
        const x = store(d).find((v) => v.id === id);
        if (!x) return;
        Object.assign(x, prev);
        if (undoVerb) logChange(d, x.div, undoVerb, escTarget(x));
      };
      toast(text, undo);
    }
  });
}

export const acknowledge = (id: string, next: PersonId, date: DateStr | null, reply: string) =>
  update(
    id,
    (e, me) => e.to === me && e.state === 'requested',
    (e, db, me) => {
      Object.assign(e, {
        state: 'acknowledged',
        nextOwner: next,
        nextDate: date,
        reply,
        answeredBy: me,
        answeredAt: nowStamp(),
      });
      notifyEsc(db, e.from, 'perf-esc-ack', e);
      notifyEsc(db, next, 'perf-esc-next', e);
      logChange(db, e.div, 'acknowledged an escalation', escTarget(e));
    },
    (db, e) => t('Acknowledged. {who} was told.', { who: firstOf(db, e.from) }),
    'undid acknowledging an escalation',
  );

export const returnForInfo = (id: string, why: string) =>
  update(
    id,
    (e, me) => e.to === me,
    (e, db, me) => {
      Object.assign(e, { state: 'returned', reply: why, answeredBy: me, answeredAt: nowStamp() });
      notifyEsc(db, e.from, 'perf-esc-ret', e);
      logChange(db, e.div, 'returned an escalation', escTarget(e));
    },
    (db, e) => t('Returned to {who}', { who: firstOf(db, e.from) }),
    'undid returning an escalation',
  );

export const resolveEscalation = (id: string, resolution: string) =>
  update(
    id,
    (e, me) => e.to === me,
    (e, db) => {
      Object.assign(e, { state: 'resolved', resolution, resolvedAt: nowStamp() });
      notifyEsc(db, e.from, 'perf-esc-done', e);
      logChange(db, e.div, 'recorded a resolution on an escalation', escTarget(e));
    },
    () => t('Resolution recorded'),
    'undid a resolution on an escalation',
  );

export const sendAgain = (id: string, reason: string) =>
  update(
    id,
    (e, me) => e.from === me,
    (e, db) => {
      Object.assign(e, { state: 'requested', reason });
      notifyEsc(db, e.to, 'perf-esc', e);
      logChange(db, e.div, 'sent an escalation again', escTarget(e));
    },
    (db, e) => t('Sent to {who} again', { who: firstOf(db, e.to) }),
    null,
  );

export const withdrawEscalation = (id: string) =>
  update(
    id,
    (e, me) => e.from === me,
    (e, db) => {
      e.state = 'withdrawn';
      logChange(db, e.div, 'withdrew an escalation', escTarget(e));
    },
    () => t('Escalation withdrawn'),
    'restored an escalation',
  );
