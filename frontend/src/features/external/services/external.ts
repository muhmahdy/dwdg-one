/* External Engagement actions: relationships, contacts, opportunities, interactions, follow-ups, gated stage changes, proposal
   versions, and the handoff to Consulting (draft by EE, sent to a named receiver, accepted or returned by Consulting). Every
   write goes through `act`; recording an interaction never sends anything. From divisions/div-ee-cons.js. */
import { go } from '@/app/router/navigation';
import { canCreateProject } from '@/lib/access';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { addDays, dShort, nowStamp, today } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import { registerUpdateText } from '@/features/updates/services/update-text';
import { addTaskDraft } from '@/features/work/services/task-actions';
import { projOf, taskOf } from '@/features/work/services/selectors';
import { CONS, consReceivers, eeAuthorities } from './ee-data';
import { consDraft, newEng } from '@/features/consulting/services/cons-data';
import {
  CHANNEL,
  EE,
  OPP,
  REL,
  SHARE,
  branchOf,
  canAnswerHo,
  canConf,
  canSendHo,
  canStage,
  eeDraft,
  eeMember,
  eeOf,
  fuOf,
  hoOf,
  lastProposal,
  oppDef,
  oppOf,
  orgOf,
  staleHo,
  type Channel,
  type Contact,
  type Handoff,
  type HoState,
  type Interaction,
  type IxOutcome,
  type Kind,
  type Opp,
  type OppStage,
  type Org,
  type Proposal,
  type RelStage,
  type ShareKey,
} from './ee-data';
import type { Draft } from 'immer';
import type { DateStr, EntityRef, PersonId, Workspace } from '@/types/workspace';

registerUpdateText({
  'ee-stage': '{who} changed the stage of your opportunity',
  'ee-pic': '{who} made you the PIC',
  'ee-fu': '{who} gave you a follow-up',
  'ee-ho': '{who} sent you a handoff',
  'ee-ho-ok': '{who} accepted your handoff',
  'ee-ho-ret': '{who} returned your handoff',
  'ee-ho-cancel': '{who} canceled a handoff to you',
  'ee-ho-stale': '{who} saved a newer proposal version for your handoff',
});

const link = (type: string, id: string, name: string, h: string): EntityRef => ({ type, id, name, h });
export const oppLink = (o: Opp) => link('ee', o.id, o.title, `opportunities/${o.id}`);
export const orgLink = (o: Org) => link('ee', o.id, o.name, `relationships/${o.id}`);
const hoLink = (h: Handoff) => link('ee', h.id, h.title, `opportunities/${h.opp}`);
const upd = (db: Draft<Workspace>, to: PersonId | null | undefined, type: string, title: string, h: string) => {
  notify(db, to, type, { type: 'link', id: h, h, name: title });
};
const lbl = (isOpp: boolean, o: { stage: string; kind?: Kind }, s: string) =>
  isOpp
    ? s === 'active'
      ? oppDef({ stage: 'active', kind: o.kind ?? 'client' })[0]
      : OPP[s as OppStage][0]
    : REL[s as RelStage][0];

// ---------- relationships and contacts ----------
export interface NewOrg {
  name: string;
  kinds: Kind[];
  sector: string;
  pic: PersonId;
  source: string;
}

export async function createOrg(f: NewOrg) {
  const m = getMe();
  if (!m || !eeMember(m)) return;
  const o: Org = {
    id: uid('org-'),
    name: f.name,
    kinds: f.kinds,
    sector: f.sector,
    pic: f.pic,
    backup: null,
    stage: 'prospect',
    source: f.source,
    aliases: [],
    createdBy: m.id,
    at: nowStamp(),
  };
  const ok = await act(({ db, ui, toast }) => {
    eeDraft(db).orgs.push(o);
    logChange(db, EE, 'created relationship', orgLink(o));
    if (o.pic !== m.id) upd(db, o.pic, 'ee-pic', o.name, `relationships/${o.id}`);
    ui.insp = null;
    toast(t('Relationship created'), ({ db: u }) => {
      const s = eeDraft(u);
      s.orgs = s.orgs.filter((v) => v.id !== o.id);
      logChange(u, EE, 'removed relationship', orgLink(o));
      go('relationships');
    });
  });
  if (ok) go(`relationships/${o.id}`);
}

export const addContact = (
  orgId: string,
  f: { name: string; role: string; email: string; phone: string; use: string },
) => {
  const m = getMe();
  const c: Contact = { id: uid('c-'), org: orgId, ...f, owner: m?.id ?? '', archived: false };
  return act(({ db, ui, toast }) => {
    const o = orgOf(db, orgId);
    if (!o || !eeMember(m)) return;
    eeDraft(db).contacts.push(c);
    logChange(db, EE, 'added a contact to', orgLink(o));
    ui.insp = null;
    toast(t('Contact added'), ({ db: u }) => {
      const x = eeDraft(u).contacts.find((v) => v.id === c.id);
      if (x) x.archived = true;
      logChange(u, EE, 'archived a contact of', orgLink(o));
    });
  });
};

export interface EditOrg {
  pic: PersonId;
  backup: PersonId | null;
  kinds: Kind[];
  aliases: string[];
  source: string;
}

export function updateOrg(id: string, f: EditOrg) {
  const m = getMe();
  const before = orgOf(getDb(), id);
  if (!before || !canStage(before, m)) return Promise.resolve(false);
  if (!f.kinds.length) {
    showToast(t('Choose Partner, Client or both.'));
    return Promise.resolve(false);
  }
  const used = new Set(
    eeOf(getDb())
      .opps.filter((x) => x.org === id)
      .map((x) => x.kind),
  );
  if ([...used].some((k) => !f.kinds.includes(k))) {
    showToast(t('An opportunity still uses that kind. Keep it.'));
    return Promise.resolve(false);
  }
  const prev = structuredClone(before);
  return act(({ db, ui, toast }) => {
    const o = eeDraft(db).orgs.find((x) => x.id === id);
    if (!o) return;
    Object.assign(o, {
      pic: f.pic,
      backup: f.backup === f.pic ? null : f.backup,
      kinds: f.kinds,
      aliases: f.aliases,
      source: f.source,
    });
    logChange(db, EE, 'edited', orgLink(o));
    if (f.pic !== prev.pic) upd(db, f.pic, 'ee-pic', o.name, `relationships/${o.id}`);
    ui.insp = null;
    toast(t('Relationship saved'), ({ db: u }) => {
      const x = eeDraft(u).orgs.find((v) => v.id === id);
      if (!x) return;
      Object.assign(x, prev);
      logChange(u, EE, 'edited', orgLink(x));
    });
  });
}

// ---------- opportunities ----------
export interface NewOpp {
  org: string;
  kind: Kind;
  title: string;
  need: string;
  pic: PersonId;
  nextAction: string;
  nextDate: DateStr | null;
  confidential: boolean;
}

export async function createOpp(f: NewOpp) {
  const m = getMe();
  const db0 = getDb();
  if (!m || !eeMember(m) || !orgOf(db0, f.org)) return;
  const o: Opp = {
    id: uid('opp-'),
    org: f.org,
    kind: f.kind,
    title: f.title,
    need: f.need,
    service: '',
    pic: f.pic,
    backup: null,
    contact: eeOf(db0).contacts.find((c) => c.org === f.org && !c.archived)?.id ?? null,
    stage: 'identified',
    nextAction: f.nextAction,
    nextDate: f.nextDate,
    decision: '',
    estimate: '',
    basis: '',
    confidential: f.confidential,
    proposals: [],
    legal: [],
    handoff: null,
    project: null,
    win: null,
    reason: '',
    reviewDate: null,
    createdBy: m.id,
    at: nowStamp(),
    history: [{ stage: 'identified', by: m.id, at: nowStamp(), reason: '' }],
  };
  const ok = await act(({ db, ui, toast }) => {
    eeDraft(db).opps.push(o);
    logChange(db, EE, 'created opportunity', oppLink(o));
    if (o.pic !== m.id) upd(db, o.pic, 'ee-pic', o.title, `opportunities/${o.id}`);
    ui.insp = null;
    toast(t('Opportunity created'), ({ db: u }) => {
      const s = eeDraft(u);
      s.opps = s.opps.filter((v) => v.id !== o.id);
      logChange(u, EE, 'removed opportunity', oppLink(o));
      go('opportunities');
    });
  });
  if (ok) go(`opportunities/${o.id}`);
}

export interface EditOpp {
  pic: PersonId;
  backup: PersonId | null;
  nextAction: string;
  nextDate: DateStr | null;
  decision: string;
  service: string;
  /** Only the branch and EE leads may change these (the confidential fields). */
  conf: { estimate: string; basis: string; confidential: boolean } | null;
}

export function updateOpp(id: string, f: EditOpp) {
  const m = getMe();
  const before = oppOf(getDb(), id);
  if (!before || !canStage(before, m)) return Promise.resolve(false);
  const prev = structuredClone(before);
  const mayConf = canConf(prev, m);
  return act(({ db, ui, toast }) => {
    const o = eeDraft(db).opps.find((x) => x.id === id);
    if (!o) return;
    Object.assign(o, {
      pic: f.pic,
      backup: f.backup === f.pic ? null : f.backup,
      nextAction: f.nextAction,
      nextDate: f.nextDate,
      decision: f.decision,
      service: f.service,
    });
    if (mayConf && f.conf) Object.assign(o, f.conf);
    logChange(db, EE, 'edited', oppLink(o));
    if (f.pic !== prev.pic) {
      upd(db, f.pic, 'ee-pic', o.title, `opportunities/${o.id}`);
      logChange(
        db,
        EE,
        'changed the PIC of',
        oppLink(o),
        db.people.find((p) => p.id === prev.pic)?.name,
        db.people.find((p) => p.id === f.pic)?.name,
      );
    }
    ui.insp = null;
    toast(t('Opportunity saved'), ({ db: u }) => {
      const x = eeDraft(u).opps.find((v) => v.id === id);
      if (!x) return;
      Object.assign(x, prev);
      logChange(u, EE, 'edited', oppLink(x));
    });
  });
}

export function addProposal(oppId: string, f: { note: string; url: string; reviewer: PersonId | null }) {
  const m = getMe();
  const o0 = oppOf(getDb(), oppId);
  if (!o0 || !canStage(o0, m) || !m) return Promise.resolve(false);
  const p: Proposal = {
    v: o0.proposals.length + 1,
    note: f.note,
    url: f.url,
    by: m.id,
    at: nowStamp(),
    reviewer: f.reviewer,
  };
  return act(({ db, ui, toast }) => {
    const o = eeDraft(db).opps.find((x) => x.id === oppId);
    if (!o) return;
    o.proposals.push(p);
    logChange(
      db,
      EE,
      'saved a proposal version for',
      oppLink(o),
      p.v > 1 ? t('Version {v}', { v: p.v - 1 }) : null,
      t('Version {v}', { v: p.v }),
    );
    const h = hoOf(db, o.handoff);
    if (h && ['requested', 'accepted'].includes(h.state)) upd(db, h.to, 'ee-ho-stale', h.title, `engagements/${h.id}`);
    ui.insp = null;
    toast(t('Version {v} saved', { v: p.v }), ({ db: u }) => {
      const x = eeDraft(u).opps.find((v) => v.id === oppId);
      if (!x) return;
      x.proposals = x.proposals.filter((v) => v.v !== p.v);
      logChange(u, EE, 'removed a proposal version from', oppLink(x), t('Version {v}', { v: p.v }), null);
    });
  });
}

// ---------- stage changes (gated: intent, approved, signed and fulfilled stay separate) ----------
export type StageKind = 'rel' | 'opp';
export interface StageExtra {
  reason?: string;
  reviewDate?: DateStr | null;
  win?: Opp['win'];
}

export const hasContactRecord = (db: Workspace, kind: StageKind, o: { id: string; org?: string }) =>
  eeOf(db).interactions.some((i) => (kind === 'opp' ? i.opp === o.id || i.org === o.org : i.org === o.id));

/** True when the change needs the reason form first (or, for Contacted, a recorded interaction). */
export const stageGated = (db: Workspace, kind: StageKind, o: { id: string; org?: string }, to: string) =>
  (to === 'contacted' && !hasContactRecord(db, kind, o)) ||
  (kind === 'opp' ? ['lost', 'withdrawn', 'hold', 'active'] : ['paused', 'closed']).includes(to);

export function changeStage(kind: StageKind, id: string, to: string, extra: StageExtra = {}) {
  const m = getMe();
  const db0 = getDb();
  const o0 = kind === 'opp' ? oppOf(db0, id) : orgOf(db0, id);
  if (!o0 || !m || o0.stage === to || !canStage(o0, m)) return Promise.resolve(false);
  const isOpp = kind === 'opp';
  const from = o0.stage;
  const prev = { stage: o0.stage, reason: o0.reason, reviewDate: o0.reviewDate, win: 'win' in o0 ? o0.win : null };
  return act(({ db, ui, toast }) => {
    const s = eeDraft(db);
    const o = isOpp ? s.opps.find((x) => x.id === id) : s.orgs.find((x) => x.id === id);
    if (!o) return;
    const apply = (x: Org | Opp, stage: string, reason?: string, reviewDate?: DateStr | null, win?: Opp['win']) => {
      x.stage = stage as never;
      if (reason != null) x.reason = reason;
      if (reviewDate !== undefined) x.reviewDate = reviewDate;
      if (win && 'win' in x) x.win = win;
    };
    apply(o, to, extra.reason, 'reviewDate' in extra ? (extra.reviewDate ?? null) : undefined, extra.win);
    if (isOpp && 'history' in o)
      o.history.push({ stage: to as OppStage, by: m.id, at: nowStamp(), reason: extra.reason ?? '' });
    logChange(
      db,
      EE,
      'changed the stage of',
      isOpp ? oppLink(o as Opp) : orgLink(o as Org),
      lbl(isOpp, o, from),
      lbl(isOpp, o, to),
    );
    if (isOpp && o.pic !== m.id) upd(db, o.pic, 'ee-stage', (o as Opp).title, `opportunities/${o.id}`);
    ui.insp = null;
    ui.form = null;
    toast(t('Stage changed to {s}', { s: t(lbl(isOpp, o, to)) }), ({ db: u }) => {
      const su = eeDraft(u);
      const x = isOpp ? su.opps.find((v) => v.id === id) : su.orgs.find((v) => v.id === id);
      if (!x) return;
      x.stage = prev.stage;
      x.reason = prev.reason ?? '';
      x.reviewDate = prev.reviewDate ?? null;
      if ('win' in x) x.win = prev.win ?? null;
      // Undo appends the reverse step to the stage history (work_undo_archive).
      if ('history' in x) x.history.push({ stage: from as OppStage, by: m.id, at: nowStamp(), reason: t('Undone') });
      logChange(
        u,
        EE,
        'changed the stage of',
        isOpp ? oppLink(x as Opp) : orgLink(x as Org),
        lbl(isOpp, x, to),
        lbl(isOpp, x, from),
      );
    });
  });
}

// ---------- interactions and follow-ups ----------
export interface NewInteraction {
  org: string;
  task: string | null;
  date: DateStr;
  time: string | null;
  channel: Channel;
  outcome: IxOutcome;
  opp: string | null;
  summary: string;
  evidence: string;
  next: { title: string; due: DateStr | null; owner: PersonId } | null;
}

export function logInteraction(f: NewInteraction) {
  const m = getMe();
  const db0 = getDb();
  const o0 = orgOf(db0, f.org);
  if (!m || !o0 || !eeMember(m)) return Promise.resolve(false);
  const t0 = f.task ? taskOf(db0, f.task) : undefined;
  const link0 = f.task ? fuOf(db0, f.task) : undefined;
  const ix: Interaction = {
    id: uid('ix-'),
    org: f.org,
    opp: f.opp,
    contact: null,
    by: m.id,
    date: f.date,
    time: f.time,
    channel: f.channel,
    outcome: f.outcome,
    summary: f.summary,
    evidence: f.evidence,
    followup: null,
    fromTask: t0 ? t0.id : null,
    at: nowStamp(),
  };
  const prevT = t0 ? { status: t0.status, doneAt: t0.doneAt, finishedAt: t0.finishedAt } : null;
  let nextId: string | null = null;
  return act(({ db, ui, toast }) => {
    const s = eeDraft(db);
    s.interactions.push(ix);
    const task = f.task ? db.tasks.find((x) => x.id === f.task) : undefined;
    if (task) {
      task.status = 'done';
      task.doneAt = today();
      task.finishedAt = nowStamp();
      logChange(db, EE, 'completed', { type: 'task', id: task.id, name: task.title });
    }
    if (f.next) {
      const nt = addTaskDraft(db, f.next.title, { owner: f.next.owner, due: f.next.due, div: EE });
      if (nt) {
        nextId = nt.id;
        s.fu.push({ task: nt.id, org: f.org, opp: f.opp, outcome: link0?.outcome ?? '', channel: f.channel });
        ix.followup = nt.id;
        if (nt.owner !== m.id) upd(db, nt.owner, 'ee-fu', nt.title, 'followups');
      }
    }
    logChange(db, EE, task ? 'recorded the outcome of a follow-up with' : 'logged an interaction with', orgLink(o0));
    ui.insp = null;
    ui.ecIxDraft = null;
    toast(task ? t('Outcome recorded') : t('Interaction logged'), ({ db: u }) => {
      const su = eeDraft(u);
      su.interactions = su.interactions.filter((v) => v.id !== ix.id);
      const tk = f.task ? u.tasks.find((x) => x.id === f.task) : undefined;
      if (tk && prevT) Object.assign(tk, prevT);
      const nid = nextId;
      if (nid) {
        const nt = u.tasks.find((x) => x.id === nid);
        if (nt) nt.trashed = true;
        su.fu = su.fu.filter((v) => v.task !== nid);
      }
      logChange(u, EE, 'undid an interaction with', orgLink(o0));
    });
  });
}

export interface NewFollowup {
  org: string;
  title: string;
  outcome: string;
  owner: PersonId;
  channel: Channel;
  due: DateStr | null;
  opp: string | null;
}

export function createFollowup(f: NewFollowup) {
  const m = getMe();
  const o0 = orgOf(getDb(), f.org);
  if (!m || !o0 || !eeMember(m)) return Promise.resolve(false);
  let taskId = '';
  return act(({ db, ui, toast }) => {
    const nt = addTaskDraft(db, f.title, { owner: f.owner, due: f.due, div: EE });
    if (!nt) return;
    taskId = nt.id;
    eeDraft(db).fu.push({ task: nt.id, org: f.org, opp: f.opp, outcome: f.outcome, channel: f.channel });
    if (nt.owner !== m.id) upd(db, nt.owner, 'ee-fu', nt.title, 'followups');
    ui.insp = null;
    toast(t('Follow-up created'), ({ db: u }) => {
      const tk = u.tasks.find((x) => x.id === taskId);
      if (tk) tk.trashed = true;
      const su = eeDraft(u);
      su.fu = su.fu.filter((v) => v.task !== taskId);
      logChange(u, EE, 'removed a follow-up for', orgLink(o0));
    });
  });
}

export function postponeFollowup(taskId: string, to: DateStr, reason: string) {
  const m = getMe();
  const t0 = taskOf(getDb(), taskId);
  if (!t0 || !m) return Promise.resolve(false);
  const from = t0.due;
  const ref = (n: string): EntityRef => ({ type: 'task', id: taskId, name: n });
  return act(({ db, ui, toast }) => {
    const task = db.tasks.find((x) => x.id === taskId);
    if (!task) return;
    eeDraft(db).postpones.push({ task: taskId, from, to, reason, by: m.id, at: nowStamp() });
    task.due = to;
    logChange(db, EE, 'postponed', ref(task.title), from ? dShort(from) : t('No date'), dShort(to));
    ui.insp = null;
    toast(t('Postponed to {d}', { d: dShort(to) }), ({ db: u }) => {
      const tk = u.tasks.find((x) => x.id === taskId);
      if (!tk) return;
      tk.due = from;
      eeDraft(u).postpones.push({ task: taskId, from: to, to: from, reason: t('Undone'), by: m.id, at: nowStamp() });
      logChange(u, EE, 'postponed', ref(tk.title), dShort(to), from ? dShort(from) : t('No date'));
    });
  });
}

// ---------- the handoff to Consulting (blueprint §12) ----------
const hoPush = (h: Draft<Handoff>, state: HoState, note?: string, by: PersonId = getMe()?.id ?? '') => {
  h.history.push({ state, by, at: nowStamp(), note: note ?? '' });
};
const hoChange = (db: Draft<Workspace>, h: Handoff, verb: string) => {
  logChange(db, EE, verb, hoLink(h));
  logChange(db, h.toUnit, verb, link('cons', h.id, h.title, `engagements/${h.id}`));
};
const hoFind = (db: Draft<Workspace>, id: string) => eeDraft(db).handoffs.find((x) => x.id === id);

/** Starts a draft handoff for an opportunity and opens it in the panel. */
export function prepareHandoff(oppId: string) {
  const m = getMe();
  const db0 = getDb();
  const o0 = oppOf(db0, oppId);
  if (!m || !o0 || o0.handoff || !canStage(o0, m)) return Promise.resolve(false);
  const recv = consReceivers(db0);
  const pa = recv.find((p) => branchOf(db0.people.find((x) => x.id === p)) === 'pa') ?? recv[0] ?? null;
  const last = lastProposal(o0);
  const h: Handoff = {
    id: uid('ho-'),
    opp: o0.id,
    title: t('{t}: accept as a Consulting engagement', { t: o0.title }),
    outcome: t('Accept as a Consulting engagement and confirm the PL, PM and reviewer.'),
    from: m.id,
    toUnit: CONS,
    to: pa,
    briefV: last?.v ?? 0,
    neededBy: addDays(today(), 7),
    agreedDate: null,
    shares: ['brief', 'need', 'decision', 'contactRole'],
    unresolved: '',
    state: 'draft',
    project: null,
    reply: '',
    action: '',
    createdBy: m.id,
    at: nowStamp(),
    sentAt: null,
    answeredBy: null,
    answeredAt: null,
    history: [{ state: 'draft', by: m.id, at: nowStamp(), note: '' }],
  };
  return act(({ db, ui }) => {
    const o = eeDraft(db).opps.find((x) => x.id === oppId);
    if (!o) return;
    eeDraft(db).handoffs.push(h);
    o.handoff = h.id;
    logChange(db, EE, 'prepared a handoff for', oppLink(o));
    ui.form = 'ho-edit';
    ui.insp = { type: 'ec-ho', id: h.id };
  });
}

export interface HoForm {
  to: PersonId;
  outcome: string;
  neededBy: DateStr | null;
  unresolved: string;
  shares: ShareKey[];
}

export function saveHandoff(id: string, f: HoForm) {
  const m = getMe();
  const h0 = hoOf(getDb(), id);
  if (!h0 || !canSendHo(getDb(), h0, m)) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const h = hoFind(db, id);
    const o = h && oppOf(db, h.opp);
    if (!h || !o) return;
    Object.assign(h, {
      to: f.to,
      outcome: f.outcome,
      neededBy: f.neededBy,
      unresolved: f.unresolved,
      shares: f.shares,
    });
    if (h.state === 'returned') {
      h.briefV = lastProposal(o)?.v ?? h.briefV;
      h.state = 'requested';
      h.sentAt = nowStamp();
      hoPush(h, 'requested', t('Sent again with the missing information'));
      upd(db, h.to, 'ee-ho', h.title, `engagements/${h.id}`);
      hoChange(db, h, 'sent a handoff again for');
    }
    ui.form = null;
    toast(
      h.state === 'requested'
        ? t('Sent to {who}', { who: db.people.find((p) => p.id === h.to)?.first ?? '' })
        : t('Draft saved'),
    );
  });
}

export function sendHandoff(id: string) {
  const m = getMe();
  const db0 = getDb();
  const h0 = hoOf(db0, id);
  const o0 = h0 && oppOf(db0, h0.opp);
  if (!h0 || !o0 || !canSendHo(db0, h0, m) || h0.state !== 'draft') return Promise.resolve(false);
  if (o0.stage !== 'active') {
    showToast(t('Record the win first. A prospect stage never creates an engagement.'));
    return Promise.resolve(false);
  }
  if (!o0.proposals.length) {
    showToast(t('Save the proposal version you are handing over first.'));
    return Promise.resolve(false);
  }
  if (!h0.to) {
    showToast(t('Name the receiver first.'));
    return Promise.resolve(false);
  }
  const prev = { state: h0.state, briefV: h0.briefV, sentAt: h0.sentAt };
  return act(({ db, ui, toast }) => {
    const h = hoFind(db, id);
    const o = h && oppOf(db, h.opp);
    if (!h || !o) return;
    h.briefV = lastProposal(o)?.v ?? h.briefV;
    h.state = 'requested';
    h.sentAt = nowStamp();
    hoPush(h, 'requested', t('Proposal v{v}', { v: h.briefV }));
    hoChange(db, h, 'sent a handoff for');
    upd(db, h.to, 'ee-ho', h.title, `engagements/${h.id}`);
    ui.form = null;
    toast(t('Sent to {who}', { who: db.people.find((p) => p.id === h.to)?.first ?? '' }), ({ db: u }) => {
      const x = hoFind(u, id);
      if (!x) return;
      Object.assign(x, prev);
      hoPush(x, 'draft', t('Undone'));
      hoChange(u, x, 'withdrew a handoff for');
    });
  });
}

export function resendHandoff(id: string) {
  const m = getMe();
  const db0 = getDb();
  const h0 = hoOf(db0, id);
  if (!h0 || !canSendHo(db0, h0, m) || !staleHo(db0, h0)) return Promise.resolve(false);
  const prev = { state: h0.state, briefV: h0.briefV };
  return act(({ db, toast }) => {
    const h = hoFind(db, id);
    const o = h && oppOf(db, h.opp);
    if (!h || !o) return;
    h.briefV = lastProposal(o)?.v ?? h.briefV;
    h.state = 'requested';
    hoPush(h, 'requested', t('Proposal v{v} sent for acknowledgment', { v: h.briefV }));
    hoChange(db, h, 'sent a newer version of a handoff for');
    upd(db, h.to, 'ee-ho', h.title, `engagements/${h.id}`);
    toast(t('Sent to {who}', { who: db.people.find((p) => p.id === h.to)?.first ?? '' }), ({ db: u }) => {
      const x = hoFind(u, id);
      if (!x) return;
      Object.assign(x, prev);
      hoPush(x, prev.state, t('Undone'));
    });
  });
}

export function cancelHandoff(id: string) {
  const m = getMe();
  const h0 = hoOf(getDb(), id);
  if (!h0 || !canSendHo(getDb(), h0, m) || !['requested', 'returned'].includes(h0.state)) return Promise.resolve(false);
  const prev = h0.state;
  return act(({ db, toast }) => {
    const h = hoFind(db, id);
    if (!h) return;
    h.state = 'cancelled';
    hoPush(h, 'cancelled');
    hoChange(db, h, 'canceled a handoff for');
    if (prev === 'requested') upd(db, h.to, 'ee-ho-cancel', h.title, `engagements/${h.id}`);
    toast(t('Handoff canceled'), ({ db: u }) => {
      const x = hoFind(u, id);
      if (!x) return;
      x.state = prev;
      hoPush(x, prev, t('Undone'));
    });
  });
}

export function returnHandoff(id: string, why: string, action: string) {
  const m = getMe();
  const h0 = hoOf(getDb(), id);
  if (!m || !h0 || !canAnswerHo(h0, m) || h0.state !== 'requested') return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const h = hoFind(db, id);
    if (!h) return;
    Object.assign(h, { state: 'returned', reply: why, action, answeredBy: m.id, answeredAt: nowStamp() });
    hoPush(h, 'returned', why);
    hoChange(db, h, 'returned a handoff for');
    upd(db, h.from, 'ee-ho-ret', h.title, `opportunities/${h.opp}`);
    ui.form = null;
    toast(t('Returned to {who}', { who: db.people.find((p) => p.id === h.from)?.first ?? '' }), ({ db: u }) => {
      const x = hoFind(u, id);
      if (!x) return;
      Object.assign(x, { state: 'requested', reply: '', action: '', answeredBy: null, answeredAt: null });
      hoPush(x, 'requested', t('Undone'));
    });
  });
}

/** Accepting links exactly one engagement (S041: zero duplicate opportunity or project). A repeated accept changes nothing. */
export async function acceptHandoff(id: string, f: { project: string; agreed: DateStr | null; note: string }) {
  const m = getMe();
  const db0 = getDb();
  const h0 = hoOf(db0, id);
  const o0 = h0 && oppOf(db0, h0.opp);
  if (!m || !h0 || !o0 || !canAnswerHo(h0, m)) return false;
  if (h0.state === 'accepted' || h0.state === 'fulfilled') {
    showToast(t('Already accepted. No second engagement was created.'));
    return false;
  }
  if (h0.state !== 'requested') return false;
  if (f.project === 'new' && !canCreateProject(m, CONS)) {
    showToast(t('Only Co-Directors and above create projects. Link an existing one.'));
    return false;
  }
  const createdId = f.project === 'new' ? uid('p-') : null;
  const pid = createdId ?? f.project;
  const ok = await act(({ db, ui, toast }) => {
    const h = hoFind(db, id);
    const o = h && oppOf(db, h.opp);
    if (!h || !o) return;
    if (createdId) {
      db.projects.push({
        id: createdId,
        name: o.title,
        div: CONS,
        stage: 'draft',
        lead: null,
        pm: null,
        start: null,
        due: null,
        goal: o.need,
        scopeIn: [],
        scopeOut: [],
        reason: '',
        team: [],
        org: false,
        createdBy: m.id,
        createdAt: nowStamp(),
      });
      logChange(db, CONS, 'created project', { type: 'project', id: createdId, name: o.title });
    }
    const cs = consDraft(db);
    const eng = (cs.eng[pid] ??= newEng(m.id));
    const prevEng = { client: eng.client, opp: eng.opp, handoff: eng.handoff };
    const prevOpp = o.project;
    Object.assign(h, {
      state: 'accepted',
      project: pid,
      agreedDate: f.agreed ?? h.neededBy,
      reply: f.note,
      answeredBy: m.id,
      answeredAt: nowStamp(),
    });
    hoPush(h, 'accepted', h.reply);
    Object.assign(eng, { client: o.org, opp: o.id, handoff: h.id });
    o.project = pid;
    hoChange(db, h, 'accepted a handoff for');
    upd(db, h.from, 'ee-ho-ok', h.title, `opportunities/${o.id}`);
    if (o.pic !== h.from) upd(db, o.pic, 'ee-ho-ok', h.title, `opportunities/${o.id}`);
    ui.form = null;
    ui.insp = null;
    toast(t('Handoff accepted. {p} is the engagement.', { p: projOf(db, pid)?.name ?? '' }), ({ db: u }) => {
      const x = hoFind(u, id);
      const ox = x && oppOf(u, x.opp);
      if (!x || !ox) return;
      Object.assign(x, { state: 'requested', project: null, agreedDate: null, answeredBy: null, answeredAt: null });
      hoPush(x, 'requested', t('Undone'));
      const e = consDraft(u).eng[pid];
      if (e) Object.assign(e, prevEng);
      ox.project = prevOpp;
      if (createdId) {
        const np = u.projects.find((p) => p.id === createdId);
        if (np) {
          np.stage = 'archived';
          logChange(u, CONS, 'archived project', { type: 'project', id: createdId, name: np.name });
        }
      }
      hoChange(u, x, 'undid the acceptance of a handoff for');
      go('engagements');
    });
  });
  if (ok) go(`engagements/${pid}`);
  return ok;
}

export { eeAuthorities, CHANNEL, SHARE };
