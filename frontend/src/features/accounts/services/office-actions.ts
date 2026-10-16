/* Appointments and the presidency (access_appointments S006, access_presidency_transfer S004 normal handover, S005 Admin
   recovery). Roles are dated grants with an actor, a reason and the predecessor; a task never promotes anyone. Exactly one
   President stays active; a stale confirmation changes nothing. From screens/accounts.js. */
import type { Draft } from 'immer';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { nowStamp, today } from '@/lib/time';
import { logChange } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, setUi, showToast } from '@/lib/workspace/transaction';
import { isAdmin } from '@/lib/roles';
import type { DateStr, DivisionId, Person, Workspace } from '@/types/workspace';
import { acctDraft, acctOf, admins, fmtD, openHandover, presidentOf, type Grant, type Handover } from './acct-data';
import { alog, memberLink, meId, notifyLink } from './audit';
import { canAppoint, holders, officeOf } from './rules';

export interface AppointInput {
  office: string;
  person: string;
  date: DateStr;
  why: string;
  /** The division the outgoing holder keeps a workspace in, when they had none. */
  after: DivisionId | '';
}

export async function appoint(f: AppointInput) {
  const me = getMe();
  const c = canAppoint(me, f.office);
  if (!c.ok) {
    showToast(c.why);
    return false;
  }
  const o = officeOf(f.office);
  return act(({ db, ui, toast }) => {
    const a = acctDraft(db);
    const tgt = db.people.find((x) => x.id === f.person);
    if (!me || !tgt) return;
    const pred = holders(db, f.office)[0];
    const g: Grant = {
      id: uid('g'),
      person: tgt.id,
      role: o.role,
      unit: o.unit,
      title: '',
      from: f.date,
      to: null,
      by: me.id,
      at: nowStamp(),
      reason: f.why,
      predecessor: pred?.id ?? null,
      state: f.date > today() ? 'scheduled' : 'active',
    };
    a.grants.push(g);
    const dbPred = pred ? db.people.find((x) => x.id === pred.id) : undefined;
    const snap = [tgt, dbPred]
      .filter((x): x is Draft<Person> => !!x)
      .map((x) => [x.id, { role: x.role, div: x.div, title: x.title }] as const);
    const ended: { grants: string[]; ms: string[] } = { grants: [], ms: [] };
    if (g.state === 'active') {
      for (const x of a.grants)
        if (
          x.id !== g.id &&
          x.state === 'active' &&
          x.role !== 'admin' &&
          (x.person === tgt.id || (pred?.id === x.person && x.role === o.role))
        ) {
          x.state = 'ended';
          x.to = f.date;
          ended.grants.push(x.id);
        }
      if (dbPred) {
        dbPred.role = 'member';
        dbPred.title = '';
        dbPred.div ??= f.after || null;
      }
      tgt.role = o.role;
      tgt.title = '';
      if (o.role === 'vp') {
        tgt.div = null;
        for (const x of a.memberships)
          if (x.person === tgt.id && !x.to) {
            x.to = f.date;
            ended.ms.push(x.id);
          }
      }
      if (o.unit) logChange(db, o.unit, 'appointed a new Director:', memberLink(tgt));
      notifyLink(db, tgt.id, 'acct-appointed', `members/${tgt.id}`, o.label);
      if (pred) notifyLink(db, pred.id, 'acct-appt-ended', `members/${pred.id}`, o.label);
    }
    alog(db, g.state === 'active' ? 'appointed' : 'scheduled an appointment for', tgt, {
      detail: o.label,
      reason: f.why,
      ref: `members/${tgt.id}`,
    });
    ui.insp = null;
    toast(
      g.state === 'active'
        ? t('{who} is now {o}', { who: tgt.first, o: o.label })
        : t('Scheduled for {d}', { d: fmtD(f.date) }),
      ({ db: u }) => {
        for (const [id, v] of snap) {
          const x = u.people.find((y) => y.id === id);
          if (x) Object.assign(x, v);
        }
        const ua = acctDraft(u);
        const gr = ua.grants.find((y) => y.id === g.id);
        if (gr) gr.state = 'reversed';
        for (const y of ua.grants)
          if (ended.grants.includes(y.id)) {
            y.state = 'active';
            y.to = null;
          }
        for (const y of ua.memberships) if (ended.ms.includes(y.id)) y.to = null;
        const x = u.people.find((y) => y.id === tgt.id);
        if (x) {
          alog(u, 'reversed an appointment of', x, { detail: o.label });
          if (o.unit) logChange(u, o.unit, 'reversed an appointment of', memberLink(x));
        }
      },
    );
  });
}

// ---------- presidency ----------
export interface HandoverInput {
  kind: 'normal' | 'recovery';
  to: string;
  date: DateStr;
  after: DivisionId;
  note: string;
  /** Recovery only: what happened to the President's account, why, and the evidence reference. */
  ist: string | null;
  why: string;
  ev: string;
}

export async function startHandover(f: HandoverInput) {
  const m = getMe();
  const db0 = getDb();
  const pres = presidentOf(db0);
  if (!m || !pres) return false;
  if (f.kind === 'normal' && pres.id !== m.id) {
    showToast(t('Only the incumbent President starts a normal handover.'));
    return false;
  }
  if (f.kind === 'recovery' && !isAdmin(m)) {
    showToast(t('Only the Admin starts an emergency recovery.'));
    return false;
  }
  if (openHandover(db0)) {
    showToast(t('A handover is already open. Finish or cancel it first.'));
    return false;
  }
  return act(({ db, ui, toast }) => {
    const a = acctDraft(db);
    const to = db.people.find((x) => x.id === f.to);
    if (!to) return;
    const h: Handover = {
      id: uid('ho'),
      kind: f.kind,
      from: pres.id,
      to: to.id,
      state: 'nominated',
      effective: f.date,
      after: f.after,
      note: f.note.trim(),
      ist: f.ist,
      reason: f.why.trim(),
      ev: f.ev.trim(),
      version: a.office.version,
      createdBy: m.id,
      createdAt: nowStamp(),
      answeredAt: null,
    };
    a.handovers.push(h);
    alog(db, f.kind === 'recovery' ? 'started an emergency presidency recovery naming' : 'nominated a successor:', to, {
      reason: h.reason,
      ref: 'handover',
    });
    notifyLink(db, to.id, f.kind === 'recovery' ? 'acct-ho-rec' : 'acct-ho', 'handover', t('Presidency'));
    ui.form = null;
    toast(t('Sent to {who}. Nothing changes until they answer.', { who: to.first }), ({ db: u }) => {
      const x = acctDraft(u).handovers.find((y) => y.id === h.id);
      if (x) x.state = 'cancelled';
      alog(u, 'canceled a presidency handover for', u.people.find((y) => y.id === to.id) ?? null);
    });
  });
}

export const answerHandover = (id: string, yes: boolean, reply: string) =>
  act(({ db, ui, toast }) => {
    const h = acctDraft(db).handovers.find((x) => x.id === id);
    if (h?.to !== meId() || h.state !== 'nominated') return;
    h.state = yes ? 'accepted' : 'declined';
    h.answeredAt = nowStamp();
    h.reply = reply.trim();
    alog(
      db,
      yes ? 'accepted the presidency nomination' : 'declined the presidency nomination',
      db.people.find((p) => p.id === h.to) ?? null,
      {
        ref: 'handover',
      },
    );
    notifyLink(db, h.createdBy, yes ? 'acct-ho-yes' : 'acct-ho-no', 'handover', t('Presidency'));
    ui.form = null;
    const first = (pid: string) => db.people.find((p) => p.id === pid)?.first ?? '';
    toast(
      yes
        ? t('Accepted. {who} confirms next.', { who: first(h.kind === 'recovery' ? h.createdBy : h.from) })
        : t('Declined. {who} was told.', { who: first(h.createdBy) }),
    );
  });

export const cancelHandover = (id: string) =>
  act(({ db, toast }) => {
    const h = acctDraft(db).handovers.find((x) => x.id === id);
    if (!h) return;
    h.state = 'cancelled';
    alog(db, 'canceled a presidency handover for', db.people.find((p) => p.id === h.to) ?? null, { ref: 'handover' });
    notifyLink(db, h.to, 'acct-ho-no', 'handover', t('Presidency'));
    toast(t('Handover canceled'));
  });

/** Moves the office: ends the old grant, grants the new one, and keeps exactly one active President. */
function applyPresidency(db: Draft<Workspace>, h: Draft<Handover>) {
  const a = acctDraft(db);
  const old = db.people.find((p) => p.id === h.from);
  const neu = db.people.find((p) => p.id === h.to);
  if (!old || !neu) return;
  const date = h.effective <= today() ? h.effective : today();
  for (const g of a.grants)
    if (g.person === old.id && g.role === 'president' && g.state === 'active') {
      g.state = 'ended';
      g.to = date;
    }
  old.role = 'member';
  old.title = '';
  if (h.after) {
    old.div = h.after;
    a.memberships.push({ id: uid('ms'), person: old.id, div: h.after, from: date, to: null, by: meId() });
  }
  for (const g of a.grants)
    if (g.person === neu.id && g.role !== 'admin' && g.state === 'active') {
      g.state = 'ended';
      g.to = date;
    }
  for (const x of a.memberships) if (x.person === neu.id && !x.to) x.to = date;
  neu.role = 'president';
  neu.div = null;
  neu.title = '';
  a.grants.push({
    id: uid('g'),
    person: neu.id,
    role: 'president',
    unit: null,
    title: '',
    from: date,
    to: null,
    by: meId(),
    at: nowStamp(),
    reason: h.kind === 'recovery' ? t('Emergency recovery') : t('Normal handover'),
    predecessor: old.id,
    state: 'active',
  });
  a.office.version += 1;
  h.state = 'confirmed';
  h.confirmedBy = meId();
  h.confirmedAt = nowStamp();
  for (const x of a.handovers) if (x.id !== h.id && ['nominated', 'accepted'].includes(x.state)) x.state = 'superseded';
  alog(
    db,
    h.kind === 'recovery' ? 'completed an emergency presidency recovery for' : 'completed the presidency handover to',
    neu,
    {
      ref: 'handover',
    },
  );
  for (const id of [old.id, neu.id, ...admins(db as Workspace).map((p) => p.id)])
    notifyLink(db, id, 'acct-ho-done', 'handover', t('Presidency'));
}

/** Confirms a handover. A stale or concurrent confirmation changes nothing (the office record number must still match). */
export async function confirmHandover(id: string) {
  const m = getMe();
  const db0 = getDb();
  const h0 = acctOf(db0).handovers.find((x) => x.id === id);
  if (!m || h0?.state !== 'accepted') return false;
  if ((h0.kind === 'normal' && presidentOf(db0)?.id !== m.id) || (h0.kind === 'recovery' && !isAdmin(m))) {
    showToast(t('Only the incumbent or, in recovery, the Admin confirms.'));
    return false;
  }
  if (h0.version !== acctOf(db0).office.version || presidentOf(db0)?.id !== h0.from) {
    await act(({ db }) => {
      const h = acctDraft(db).handovers.find((x) => x.id === id);
      if (h) h.state = 'superseded';
    });
    showToast(t('Out of date: the presidency changed since this started. Nothing was transferred.'));
    return false;
  }
  const first = db0.people.find((p) => p.id === h0.to)?.first ?? '';
  const ok = await act(({ db, toast }) => {
    const h = acctDraft(db).handovers.find((x) => x.id === id);
    if (!h) return;
    applyPresidency(db, h);
    toast(t('{who} is President now', { who: first }));
  });
  if (ok)
    setUi((u) => {
      u.form = null;
    });
  return ok;
}
