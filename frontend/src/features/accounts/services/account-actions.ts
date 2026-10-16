/* Moving, pausing, restoring and ending a membership (flow-membership-transfer, access_revocation, hr_roster_change). Each
   action keeps every record: nothing is deleted, an offer waits for the new person, and Undo appends a reversal. From
   screens/accounts.js applyFlow and acct-restore. */
import { divisionOf } from '@/app/config/org';
import { go } from '@/app/router/navigation';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { nowStamp } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import type { DateStr, DivisionId, Offer } from '@/types/workspace';
import { acctDraft, type AcctAction } from './acct-data';
import { alog, memberLink, notifyLink } from './audit';
import { dutiesOf } from './duties';
import { can } from './rules';

export type FlowKind = 'transfer' | 'pause' | 'leave';

export interface FlowInput {
  kind: FlowKind;
  person: string;
  /** Effective date (move) or last day (leaving). */
  date: DateStr;
  why: string;
  /** Destination division of a move. */
  to?: DivisionId;
  /** Leaving DWDG or alumni. */
  leaving?: 'left' | 'alumni';
  /** When someone looks at a pause again. */
  review?: DateStr | null;
  /** Task id to the leader's choice: keep, open, offer:<id>; review id to open or ask:<id>. */
  choices: Record<string, string>;
}

export const FLOW_TITLE: Record<FlowKind, [title: string, short: string, lead: string]> = {
  transfer: [
    'Move {who} to another division',
    'Move',
    'Choose the destination, then decide each open duty. Nothing changes until you apply.',
  ],
  pause: [
    'Pause {who}’s access',
    'Pause access',
    'Pausing stops sign-in and every function at once. Work, records and history stay as they are.',
  ],
  leave: [
    'End {who}’s membership',
    'End membership',
    'Current access ends on the date you set. Work and authorship stay under their name.',
  ],
};

export async function applyFlow(input: FlowInput) {
  const me = getMe();
  const p0 = getDb().people.find((x) => x.id === input.person);
  if (!me || !p0) return false;
  const c = can(input.kind, me, p0);
  if (!c.ok) {
    showToast(c.why);
    return false;
  }
  const kind = input.kind === 'leave' ? (input.leaving ?? 'left') : input.kind;
  const ok = await act(({ db, toast }) => {
    const p = db.people.find((x) => x.id === input.person);
    if (!p) return;
    const a = acctDraft(db);
    const prev = { div: p.div, status: p.status };
    const d = dutiesOf(db, p.id);
    const made: Offer[] = [];
    const revPrev: [string, string | null][] = [];
    const map: Record<string, string> = {};
    for (const tk of d.tasks) {
      const ch = input.choices[`map:${tk.id}`] ?? (input.kind === 'transfer' ? 'keep' : 'open');
      map[tk.id] = ch.startsWith('offer:') ? 'offer' : ch;
      if (ch.startsWith('offer:')) {
        const to = ch.slice(6);
        const o: Offer = {
          id: uid('o'),
          from: me.id,
          to,
          title: tk.title,
          result: '',
          due: tk.due,
          project: tk.project,
          state: 'pending',
          note: t('Handover from {who}. Nothing changes until you accept.', { who: p.name }),
          task: tk.id,
          at: nowStamp(),
          answeredAt: null,
        };
        db.offers.push(o);
        made.push(o);
        notify(db, to, 'offer', { type: 'offer', id: o.id });
      }
    }
    for (const tk of d.reviews) {
      const ch = input.choices[`rev:${tk.id}`] ?? 'open';
      const live = db.tasks.find((x) => x.id === tk.id);
      if (ch.startsWith('ask:') && live) {
        revPrev.push([tk.id, live.reviewer]);
        live.reviewer = ch.slice(4);
        notify(db, live.reviewer, 'review', { type: 'task', id: tk.id });
      } else map[tk.id] = 'open';
    }
    const rec: AcctAction = {
      id: uid('ac'),
      kind,
      person: p.id,
      from: p.div,
      to: input.kind === 'transfer' ? (input.to ?? null) : null,
      effective: input.date,
      reason: input.why,
      review: input.review ?? null,
      map,
      offers: made.map((o) => o.id),
      by: me.id,
      at: nowStamp(),
      state: 'applied',
    };
    a.actions.unshift(rec);
    const old = a.memberships.find((x) => x.person === p.id && !x.to);
    const link = memberLink(p);
    let msg: string;
    if (input.kind === 'transfer' && input.to) {
      const to = divisionOf(input.to);
      const from = divisionOf(rec.from);
      if (old) old.to = input.date;
      const neu = { id: uid('ms'), person: p.id, div: input.to, from: input.date, to: null, by: me.id };
      a.memberships.push(neu);
      rec.ms = neu.id;
      p.div = input.to;
      alog(db, 'moved the member', p, {
        detail: `${from?.short ?? ''} → ${to?.short ?? ''}`,
        reason: input.why,
        ref: `members/${p.id}`,
      });
      logChange(db, rec.from, 'moved a member out of the workspace:', link);
      logChange(db, rec.to, 'moved a member into the workspace:', link);
      notifyLink(db, p.id, 'acct-moved', 'welcome', to?.name ?? '');
      msg = t('{who} moved to {d}', { who: p.first, d: to?.short ?? '' });
    } else if (input.kind === 'pause') {
      p.status = 'suspended';
      alog(db, 'paused access for', p, { reason: input.why, ref: `members/${p.id}` });
      logChange(db, p.div, 'paused access for', link);
      msg = t('{who}’s access is paused', { who: p.first });
    } else {
      p.status = input.leaving ?? 'left';
      p.departedOn = input.date;
      if (old) old.to = input.date;
      const verb = p.status === 'alumni' ? 'recorded the end of term for' : 'ended the membership of';
      alog(db, verb, p, { reason: input.why, ref: `members/${p.id}` });
      logChange(db, p.div, verb, link);
      msg =
        p.status === 'alumni'
          ? t('{who} is alumni now', { who: p.first })
          : t('{who}’s membership ended', { who: p.first });
    }
    toast(msg, ({ db: u }) => {
      const x = u.people.find((y) => y.id === input.person);
      const ua = acctDraft(u);
      const r = ua.actions.find((y) => y.id === rec.id);
      if (!x) return;
      Object.assign(x, prev);
      if (r) r.state = 'reversed';
      for (const o of u.offers)
        if (made.some((m2) => m2.id === o.id) && o.state === 'pending') {
          o.state = 'withdrawn';
          o.answeredAt = nowStamp();
        }
      for (const [tid, reviewer] of revPrev) {
        const tk = u.tasks.find((y) => y.id === tid);
        if (tk) tk.reviewer = reviewer;
      }
      const o2 = ua.memberships.find((y) => y.id === old?.id);
      if (input.kind === 'transfer') {
        ua.memberships = ua.memberships.filter((y) => y.id !== rec.ms);
        if (o2) o2.to = null;
      }
      if (input.kind === 'leave') {
        delete x.departedOn;
        if (o2) o2.to = null;
      }
      alog(u, 'reversed', x, { detail: t(FLOW_TITLE[input.kind][1]), ref: `members/${x.id}` });
      logChange(u, rec.from ?? x.div, 'reversed an account change for', memberLink(x));
    });
  });
  if (ok) go(`members/${input.person}`);
  return ok;
}

/** Lets a paused member sign in again. Roles that ended meanwhile stay ended. */
export async function restoreAccess(person: string, note: string) {
  const me = getMe();
  const p0 = getDb().people.find((x) => x.id === person);
  if (!me || !p0) return false;
  const c = can('restore', me, p0);
  if (!c.ok) {
    showToast(c.why);
    return false;
  }
  return act(({ db, toast }) => {
    const p = db.people.find((x) => x.id === person);
    if (!p) return;
    const prev = p.status;
    p.status = 'active';
    const a = acctDraft(db);
    const last = a.actions.find((x) => x.person === p.id && x.kind === 'pause' && x.state === 'applied');
    if (last) {
      last.restoredBy = me.id;
      last.restoredAt = nowStamp();
    }
    alog(db, 'restored access for', p, { reason: note, ref: `members/${p.id}` });
    logChange(db, p.div, 'restored access for', memberLink(p));
    toast(t('{who} can sign in again', { who: p.first }), ({ db: u }) => {
      const x = u.people.find((y) => y.id === person);
      if (!x) return;
      x.status = prev;
      alog(u, 'reversed', x, { detail: t('Restore access') });
      logChange(u, x.div, 'reversed an account change for', memberLink(x));
    });
  });
}
