/* TnD cohort actions (consulting_tnd, W065, S060, S061): invitations the participant accepts or declines, session attendance
   recorded by the cohort lead, assignment submissions and their review, and outcomes that need real evidence. TnD records
   are learning records, not HR grades. From divisions/div-ee-cons.js. */
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { nowStamp } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import { registerUpdateText } from '@/features/updates/services/update-text';
import { CONS } from '@/features/external/services/ee-data';
import { projOf } from '@/features/work/services/selectors';
import type { Draft } from 'immer';
import type { EntityRef, PersonId, Workspace } from '@/types/workspace';
import { consDraft, consOf } from './cons-data';
import { ATT, type AttState, type OutcomeState } from './cons-rules';
import { coOf, missingFor, partOf, subs, tndLead } from './cohort-rules';

registerUpdateText({
  'tnd-invite': '{who} invited you to a TnD cohort',
  'tnd-yes': '{who} enrolled in your cohort',
  'tnd-no': '{who} declined your cohort invitation',
  'tnd-sub': '{who} submitted an assignment',
  'tnd-reviewed': '{who} reviewed your assignment',
  'tnd-outcome': '{who} recorded your TnD outcome',
});

const coLink = (db: Workspace, c: { id: string; project: string }): EntityRef => ({
  type: 'cons',
  id: c.id,
  name: projOf(db, c.project)?.name ?? c.id,
  h: `cohorts/${c.id}`,
});
const upd = (db: Draft<Workspace>, to: PersonId, type: string, title: string, id: string) => {
  notify(db, to, type, { type: 'link', id: `cohorts/${id}`, h: `cohorts/${id}`, name: title });
};
const find = (db: Draft<Workspace>, id: string) => consDraft(db).cohorts.find((c) => c.id === id);

export function setAttendance(cid: string, meeting: string, p: PersonId, s: AttState) {
  const m = getMe();
  const db0 = getDb();
  const c0 = coOf(db0, cid);
  if (!m || !c0 || !tndLead(db0, c0, m)) return Promise.resolve(false);
  const prev = c0.att[meeting]?.[p];
  return act(({ db, toast }) => {
    const c = find(db, cid);
    if (!c) return;
    c.att[meeting] ??= {};
    c.att[meeting][p] = { s, by: m.id, at: nowStamp() };
    logChange(
      db,
      CONS,
      'recorded session attendance in',
      coLink(db, c),
      prev ? t(ATT[prev.s as AttState][0]) : t('Not yet recorded'),
      t(ATT[s][0]),
    );
    toast(t('{who}: {s}', { who: db.people.find((x) => x.id === p)?.first ?? '', s: t(ATT[s][0]) }), ({ db: u }) => {
      const x = find(u, cid);
      if (!x) return;
      const at = (x.att[meeting] ??= {});
      if (prev) at[p] = prev;
      else x.att[meeting] = Object.fromEntries(Object.entries(at).filter(([k]) => k !== p));
    });
  });
}

export function answerInvitation(cid: string, r: 'accepted' | 'declined') {
  const m = getMe();
  const db0 = getDb();
  const c0 = coOf(db0, cid);
  const x0 = c0 && m && partOf(c0, m.id);
  if (!m || !c0 || x0?.enroll !== 'invited') return Promise.resolve(false);
  return act(({ db, toast }) => {
    const c = find(db, cid);
    const x = c && partOf(c, m.id);
    if (!c || !x) return;
    x.enroll = r;
    x.at = nowStamp();
    logChange(db, CONS, r === 'accepted' ? 'enrolled in' : 'declined to join', coLink(db, c));
    upd(db, c.mentor, r === 'accepted' ? 'tnd-yes' : 'tnd-no', projOf(db, c.project)?.name ?? '', c.id);
    toast(r === 'accepted' ? t('You are enrolled') : t('Invitation declined'), ({ db: u }) => {
      const cx = find(u, cid);
      const px = cx && partOf(cx, m.id);
      if (px) px.enroll = 'invited';
    });
  });
}

export function inviteParticipant(cid: string, p: PersonId) {
  const m = getMe();
  const db0 = getDb();
  const c0 = coOf(db0, cid);
  if (!m || !c0 || !tndLead(db0, c0, m)) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const c = find(db, cid);
    if (!c) return;
    c.participants.push({ p, enroll: 'invited', at: nowStamp() });
    upd(db, p, 'tnd-invite', projOf(db, c.project)?.name ?? '', c.id);
    logChange(db, CONS, 'invited a participant to', coLink(db, c));
    ui.insp = null;
    toast(t('Invitation sent to {who}', { who: db.people.find((x) => x.id === p)?.first ?? '' }), ({ db: u }) => {
      const x = find(u, cid);
      if (x) x.participants = x.participants.filter((z) => z.p !== p);
    });
  });
}

export function submitWork(cid: string, p: PersonId, url: string) {
  const m = getMe();
  const c0 = coOf(getDb(), cid);
  if (!m || !c0 || p !== m.id || !c0.assignments[0]) return Promise.resolve(false);
  const n = subs(c0, p).length + 1;
  return act(({ db, ui, toast }) => {
    const c = find(db, cid);
    const as = c?.assignments[0];
    if (!c || !as) return;
    (as.subs[p] ??= []).push({ v: n, url, at: nowStamp(), review: null });
    upd(db, c.mentor, 'tnd-sub', as.title, c.id);
    logChange(db, CONS, 'submitted an assignment in', coLink(db, c));
    ui.form = null;
    toast(t('Version {v} submitted', { v: n }), ({ db: u }) => {
      const x = find(u, cid)?.assignments[0];
      if (x) x.subs[p] = (x.subs[p] ?? []).filter((z) => z.v !== n);
    });
  });
}

export function reviewWork(cid: string, p: PersonId, choice: 'approved' | 'returned', note: string) {
  const m = getMe();
  const db0 = getDb();
  const c0 = coOf(db0, cid);
  const l0 = c0 && subs(c0, p).at(-1);
  if (!m || !c0 || !l0 || l0.review || !tndLead(db0, c0, m) || p === m.id) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const c = find(db, cid);
    const l = c?.assignments[0]?.subs[p]?.at(-1);
    if (!c || !l) return;
    l.review = { choice, by: m.id, at: nowStamp(), note };
    upd(db, p, 'tnd-reviewed', c.assignments[0]?.title ?? '', c.id);
    logChange(
      db,
      CONS,
      choice === 'approved' ? 'approved an assignment in' : 'returned an assignment in',
      coLink(db, c),
    );
    ui.form = null;
    toast(choice === 'approved' ? t('Approved') : t('Returned with feedback'), ({ db: u }) => {
      const x = find(u, cid)?.assignments[0]?.subs[p]?.at(-1);
      if (x) x.review = null;
    });
  });
}

export function recordOutcome(cid: string, p: PersonId, s: OutcomeState, note: string) {
  const m = getMe();
  const db0 = getDb();
  const c0 = coOf(db0, cid);
  if (!m || !c0 || !tndLead(db0, c0, m)) return Promise.resolve(false);
  if (s === 'completed' && missingFor(db0, c0, p).length) {
    showToast(t('Completion waits for real evidence, never for a date.'));
    return Promise.resolve(false);
  }
  const prev = c0.outcomes[p];
  return act(({ db, ui, toast }) => {
    const c = find(db, cid);
    if (!c) return;
    c.outcomes[p] = { s, by: m.id, at: nowStamp(), note };
    const part = partOf(c, p);
    if (s === 'withdrawn' && part) part.enroll = 'withdrawn';
    logChange(db, CONS, 'recorded a TnD outcome in', coLink(db, c));
    upd(db, p, 'tnd-outcome', projOf(db, c.project)?.name ?? '', c.id);
    ui.form = null;
    ui.tndOut = null;
    toast(
      t('Outcome recorded: {s}', { s: t(s === 'open' ? 'Not determined' : s.charAt(0).toUpperCase() + s.slice(1)) }),
      ({ db: u }) => {
        const x = find(u, cid);
        if (!x) return;
        if (prev) x.outcomes[p] = prev;
        else x.outcomes = Object.fromEntries(Object.entries(x.outcomes).filter(([k]) => k !== p));
      },
    );
  });
}

export function addNeed(f: { from: string; text: string }) {
  const m = getMe();
  const db0 = getDb();
  if (!m || !consOf(db0).cohorts.length) return Promise.resolve(false);
  const n = { id: uid('nd-'), from: f.from, text: f.text, by: m.id, at: nowStamp(), state: 'Open' };
  return act(({ db, ui, toast }) => {
    const c = consDraft(db).cohorts[0];
    if (!c) return;
    c.needs.push(n);
    logChange(db, CONS, 'added a learning need', { type: 'cons', id: n.id, name: f.text.slice(0, 60), h: 'cohorts' });
    ui.insp = null;
    toast(t('Learning need added'), ({ db: u }) => {
      const x = consDraft(u).cohorts[0];
      if (x) x.needs = x.needs.filter((z) => z.id !== n.id);
    });
  });
}
