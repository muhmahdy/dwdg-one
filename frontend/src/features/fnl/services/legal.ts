/* Finance & Legal: the legal request actions. Triage, questions, drafts and versions reviewed one exact version at a time,
   document numbers (never reused), signatures recorded as evidence (the app never signs), and the BAST gate to Finance.
   Every step adds to the request's own history; Undo restores the slice from just before it. From divisions/div-fnl-mcit.js. */
import { go } from '@/app/router/navigation';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { nowStamp, today } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast, type UndoRecipe } from '@/lib/workspace/transaction';
import { registerUpdateText } from '@/features/updates/services/update-text';
import type { Draft } from 'immer';
import type { DateStr, EntityRef, PersonId, Workspace } from '@/types/workspace';
import {
  FNL,
  LST,
  LTYPE,
  allSigned,
  fnlDraft,
  fnlOf,
  gateOf,
  grant,
  invOf,
  isReqL,
  latestV,
  liveNo,
  lrOf,
  rgOf,
  safeUrl,
  sigDone,
  type FnlStore,
  type HistoryRow,
  type LegalRequest,
  type LegalType,
  type RegisterEntry,
  type Vars,
} from './fnl-data';

registerUpdateText({
  'fnl-review': '{who} sent a legal document for your review',
  'fnl-urgent': '{who} asked for an urgent exception',
  'fnl-submitted': '{who} sent a legal request',
  'fnl-assigned': '{who} asked you to draft a legal document',
  'fnl-moved': '{who} updated a legal request of yours',
  'fnl-info': '{who} needs information for your legal request',
  'fnl-answered': '{who} answered your question',
  'fnl-decided': '{who} reviewed your draft',
  'fnl-signed': '{who} recorded the last signature',
  'fnl-gate-check': '{who} recorded every BAST signature. Check the delivery evidence',
  'fnl-exception': '{who} recorded a gate exception in your name',
  'fnl-gate': '{who} sent you a ready-for-invoice gate',
  'fnl-gate-reply': '{who} answered your ready-for-invoice gate',
  'fnl-f-review': '{who} sent a finance request for approval',
  'fnl-f-approved': '{who} approved your finance request. It is not paid yet',
  'fnl-f-returned': '{who} updated your finance request',
  'fnl-pay-ready': '{who} approved a request that is ready for payment',
  'fnl-paid': '{who} recorded a payment on your request',
  'fnl-alloc': '{who} proposed a budget allocation',
  'fnl-alloc-done': '{who} decided on your allocation proposal',
  'fnl-disc': '{who} gave you a period review action',
});

// ---------- shared helpers (also used by finance.ts) ----------
export const tgt = (id: string, name: string, h: string): EntityRef => ({ type: 'link', id, name, h });
export const lLink = (x: { id: string; title: string }) => tgt(x.id, x.title, `fnl-requests/${x.id}`);
export const upd = (db: Draft<Workspace>, to: PersonId | null | undefined, type: string, title: string, h: string) => {
  notify(db, to, type, { type: 'link', id: h, h, name: title });
};
export const hist = (x: { history: HistoryRow[] }, what: string, v?: Vars | null) => {
  x.history.push({ by: getMe()?.id ?? '', at: nowStamp(), what, v: v ?? null });
};
/** Undo restores the store slice from just before the step, appends "Undid" to the record's own history, and logs it (D45). */
export function undoSnap(
  msg: string,
  link: EntityRef,
  find: (s: FnlStore) => { history: HistoryRow[] } | undefined,
): UndoRecipe {
  const snap = getDb().fnl;
  const by = getMe()?.id ?? '';
  return ({ db }) => {
    const kept = find(fnlDraft(db))?.history.slice();
    db.fnl = snap;
    const r = find(fnlDraft(db));
    if (r && kept) r.history = [...kept, { by, at: nowStamp(), what: 'Undid: {m}', v: { m: msg } }];
    logChange(db, FNL, 'undid a change on', link);
  };
}
const legalOf = (db: Draft<Workspace>, id: string) => fnlDraft(db).legal.find((x) => x.id === id);

// ---------- new legal request (drafts survive errors) ----------
export interface NewLegal {
  type: LegalType;
  title: string;
  purpose: string;
  counterpart: string;
  project: string | null;
  requiredBy: DateStr;
  confidential: boolean;
  signatories: string;
  sources: string;
  urgency: string;
}

export const parseSources = (raw: string) =>
  raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [a = '', b = ''] = l.split('|').map((s) => s.trim());
      return b ? { label: a, url: b } : { label: a, url: safeUrl(a) ? a : '' };
    });

export async function submitLegal(f: NewLegal) {
  const m = getMe();
  if (!m) return;
  const x: LegalRequest = {
    id: uid('lgl-'),
    type: f.type,
    title: f.title,
    purpose: f.purpose,
    requester: m.id,
    unit: m.div,
    project: f.project,
    counterpart: f.counterpart,
    requiredBy: f.requiredBy,
    owner: null,
    reviewer: null,
    stage: 'submitted',
    confidential: f.confidential,
    sources: parseSources(f.sources),
    template: '',
    versions: [],
    signatories: f.signatories
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l, i) => {
        const [n = '', r = '', p = ''] = l.split(',').map((s) => s.trim());
        return {
          id: `s${String(i + 1)}`,
          party: p || t('Not given'),
          name: n,
          role: r,
          state: 'pending' as const,
          evidence: '',
          date: null,
          by: null,
          at: null,
          basis: null,
          note: '',
        };
      }),
    number: null,
    urgency: f.urgency ? { state: 'requested', reason: f.urgency, by: m.id, at: nowStamp() } : null,
    info: [],
    priv: [],
    history: [],
    createdBy: m.id,
    createdAt: nowStamp(),
    ...(f.type === 'BAST' ? { gate: { delivery: null, exception: null, sent: null } } : {}),
  };
  hist(x, 'Submitted');
  if (f.urgency) hist(x, 'Asked for an urgent exception');
  const ok = await act(({ db, toast }) => {
    const s = fnlDraft(db);
    s.legal.push(x);
    if (s.drafts[m.id]) s.drafts[m.id] = { ...s.drafts[m.id], legal: {} };
    logChange(db, FNL, 'submitted a legal request', lLink(x));
    if (x.unit && x.unit !== FNL) logChange(db, x.unit, 'sent a legal request to FnL', lLink(x));
    s.grants.legal.forEach((p) => {
      upd(db, p, 'fnl-submitted', x.title, `fnl-requests/${x.id}`);
    });
    if (f.urgency) upd(db, s.grants.legalReview[0], 'fnl-urgent', x.title, `fnl-requests/${x.id}`);
    toast(t('Request submitted to FnL Legal'));
  });
  if (ok) go(`fnl-requests/${x.id}`);
}

/** The draft of a new request lives with the person and survives reloads and failed saves (work_forms). */
export function saveFormDraft(kind: 'legal' | 'finance', values: Record<string, unknown>) {
  const m = getMe();
  if (!m) return Promise.resolve(false);
  return act(({ db }) => {
    const s = fnlDraft(db);
    const mine = (s.drafts[m.id] ??= {});
    mine[kind] = { ...values, _at: nowStamp() };
  });
}
export function clearFormDraft(kind: 'legal' | 'finance') {
  const m = getMe();
  const prev = m ? fnlOf(getDb()).drafts[m.id]?.[kind] : undefined;
  if (!m) return Promise.resolve(false);
  return act(({ db, toast }) => {
    const s = fnlDraft(db);
    s.drafts[m.id] = { ...(s.drafts[m.id] ?? {}), [kind]: {} };
    toast(t('Form cleared'), ({ db: u }) => {
      const x = fnlDraft(u);
      x.drafts[m.id] = { ...(x.drafts[m.id] ?? {}), [kind]: prev ?? {} };
    });
  });
}

// ---------- triage, questions, rejection ----------
export function triage(id: string, owner: PersonId, reviewer: PersonId) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !grant(getDb(), 'legal', m.id) || x0.stage !== 'submitted') return Promise.resolve(false);
  const undo = undoSnap(t('Triage'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x) return;
    x.owner = owner || m.id;
    x.reviewer = (reviewer || fnlDraft(db).grants.legalReview[0]) ?? null;
    x.stage = 'drafting';
    hist(x, 'Triaged; {who} is drafting', { who: db.people.find((p) => p.id === x.owner)?.first ?? '' });
    logChange(db, FNL, 'triaged', lLink(x), 'Submitted', 'Drafting');
    upd(db, x.owner, 'fnl-assigned', x.title, `fnl-requests/${x.id}`);
    upd(db, x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Drafting started'), undo);
  });
}

export function askInfo(id: string, q: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !grant(getDb(), 'legal', m.id)) return Promise.resolve(false);
  const undo = undoSnap(t('Question'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x) return;
    x.info.push({ q, by: m.id, at: nowStamp(), a: '', aAt: null });
    x.prevStage = x.stage;
    x.stage = 'info';
    hist(x, 'Asked for missing information');
    logChange(db, FNL, 'asked for information on', lLink(x));
    upd(db, x.requester, 'fnl-info', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Question sent to {who}', { who: db.people.find((p) => p.id === x.requester)?.first ?? '' }), undo);
  });
}

export function answerInfo(id: string, i: number, a: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !isReqL(x0, m) || !x0.info[i]) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    const q = x?.info[i];
    if (!x || !q) return;
    q.a = a;
    q.aAt = nowStamp();
    x.stage = x.prevStage && x.prevStage !== 'info' ? x.prevStage : 'submitted';
    hist(x, 'Answered the question from Legal');
    logChange(db, FNL, 'answered a question on', lLink(x));
    upd(db, x.owner ?? q.by, 'fnl-answered', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Answer sent'));
  });
}

export function rejectLegal(id: string, why: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !grant(getDb(), 'legal', m.id)) return Promise.resolve(false);
  const undo = undoSnap(t('Rejected'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x) return;
    x.stage = 'rejected';
    x.rejectReason = why;
    hist(x, 'Rejected: {r}', { r: why });
    logChange(db, FNL, 'rejected', lLink(x));
    upd(db, x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Request rejected'), undo);
  });
}

// ---------- urgency (legal_urgent: a warning and an exception, never an automatic rejection) ----------
export function askUrgent(id: string, why: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !isReqL(x0, m)) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x) return;
    x.urgency = { state: 'requested', reason: why, by: m.id, at: nowStamp() };
    hist(x, 'Asked for an urgent exception');
    logChange(db, FNL, 'asked for an urgent exception on', lLink(x));
    upd(db, fnlDraft(db).grants.legalReview[0], 'fnl-urgent', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Exception requested'));
  });
}

export function decideUrgent(id: string, o: 'approved' | 'declined', note: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0?.urgency || !grant(getDb(), 'legalReview', m.id) || isReqL(x0, m)) return Promise.resolve(false);
  const undo = undoSnap(t('Urgent exception'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x?.urgency) return;
    Object.assign(x.urgency, { state: o, decidedBy: m.id, decidedAt: nowStamp(), note });
    hist(x, o === 'approved' ? 'Urgent exception approved' : 'Urgent exception declined');
    logChange(
      db,
      FNL,
      o === 'approved' ? 'approved an urgent exception on' : 'declined an urgent exception on',
      lLink(x),
    );
    upd(db, x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(o === 'approved' ? t('Exception approved. Review still applies.') : t('Exception declined'), undo);
  });
}

// ---------- versions and review of an exact version ----------
export function addVersion(id: string, f: { label: string; url: string; template: string }) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !['drafting', 'revision'].includes(x0.stage)) return Promise.resolve(false);
  const undo = undoSnap(t('Version'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  const v = (latestV(x0)?.v ?? 0) + 1;
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x) return;
    if (!x.versions.length && f.template) x.template = f.template;
    x.versions.push({ v, label: f.label, url: f.url, by: m.id, at: nowStamp(), decision: null });
    x.stage = 'review';
    x.reviewer ??= fnlDraft(db).grants.legalReview[0] ?? null;
    hist(x, 'Version {v} sent for review', { v });
    logChange(db, FNL, 'sent a version for review', lLink(x), 'Drafting', 'In review');
    upd(db, x.reviewer, 'fnl-review', `${x.title}, v${String(v)}`, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Version {v} sent to {who}', { v, who: db.people.find((p) => p.id === x.reviewer)?.first ?? '' }), undo);
  });
}

/** Stale-version guard (flow-legal-draft-review 8): a decision on a replaced version records nothing. */
export function decideVersion(id: string, o: 'approved' | 'revision' | 'rejected', v: number, why: string) {
  const m = getMe();
  const db0 = getDb();
  const x0 = lrOf(db0, id);
  const lv = x0 && latestV(x0);
  if (!m || !x0 || !grant(db0, 'legalReview', m.id) || x0.stage !== 'review') return Promise.resolve(false);
  if (lv?.v !== v) {
    showToast(t('Version {v} was replaced. Nothing was recorded; review the current version.', { v }));
    return Promise.resolve(false);
  }
  if (lv.by === m.id) {
    showToast(t('You wrote this version, so another reviewer decides.'));
    return Promise.resolve(false);
  }
  const undo = undoSnap(t('Review'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    const l = x && latestV(x);
    if (!x || !l) return;
    l.decision = { kind: o, by: m.id, at: nowStamp(), reason: why };
    x.stage = o === 'approved' ? 'approved' : o === 'revision' ? 'revision' : 'rejected';
    if (o === 'rejected') x.rejectReason = why;
    hist(
      x,
      o === 'approved'
        ? 'Version {v} approved for signature'
        : o === 'revision'
          ? 'Revision requested on version {v}'
          : 'Rejected on version {v}',
      { v },
    );
    logChange(
      db,
      FNL,
      o === 'approved' ? 'approved a version for signature' : o === 'revision' ? 'requested a revision on' : 'rejected',
      lLink(x),
      'In review',
      LST[x.stage][0],
    );
    upd(db, x.owner, 'fnl-decided', `${x.title}, v${String(v)}`, `fnl-requests/${x.id}`);
    upd(db, x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(
      o === 'approved'
        ? t('Version {v} approved for signature', { v })
        : o === 'revision'
          ? t('Revision requested')
          : t('Request rejected'),
      undo,
    );
  });
}

// ---------- numbering (legal_numbering, legal_number_void): provisional labels until POL adopts the format ----------
export function issueNumber(id: string) {
  const m = getMe();
  const db0 = getDb();
  const x0 = lrOf(db0, id);
  if (
    !m ||
    !x0 ||
    !grant(db0, 'issue', m.id) ||
    liveNo(db0, x0) ||
    !['approved', 'awaiting', 'signed'].includes(x0.stage)
  )
    return Promise.resolve(false);
  const undo = undoSnap(t('Number'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, toast }) => {
    const s = fnlDraft(db);
    const x = legalOf(db, id);
    if (!x) return;
    const seq = Math.max(0, ...s.register.map((g) => g.seq)) + 1;
    const code = LTYPE[x.type][1];
    const prev = x.number ? rgOf(db, x.number) : undefined;
    const g: RegisterEntry = {
      id: uid('rg-'),
      seq,
      no: `DWDG/FnL/${code}/${today().slice(0, 4)}/${String(seq).padStart(3, '0')}`,
      type: code,
      req: x.id,
      version: latestV(x)?.v ?? 1,
      issuedBy: m.id,
      issuedAt: nowStamp(),
      state: 'issued',
      voidReason: '',
      voidBy: null,
      voidAt: null,
      reissue: null,
      replaces: prev?.id ?? null,
      provisional: true,
    };
    const prevDraft = prev && s.register.find((r) => r.id === prev.id);
    if (prevDraft) prevDraft.reissue = g.id;
    s.register.push(g);
    x.number = g.id;
    hist(x, prev ? 'New number issued' : 'Number issued');
    logChange(db, FNL, 'issued a document number for', lLink(x), null, g.no);
    toast(t('Number {no} issued', { no: g.no }), undo);
  });
}

export function voidNumber(id: string, why: string) {
  const m = getMe();
  const db0 = getDb();
  const x0 = lrOf(db0, id);
  const g0 = x0 && liveNo(db0, x0);
  if (!m || !x0 || !g0 || !grant(db0, 'issue', m.id)) return Promise.resolve(false);
  const undo = undoSnap(t('Void'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    const g = fnlDraft(db).register.find((r) => r.id === g0.id);
    if (!x || !g) return;
    Object.assign(g, { state: 'void', voidReason: why, voidBy: m.id, voidAt: nowStamp() });
    hist(x, 'Number voided: {r}', { r: why });
    logChange(db, FNL, 'voided a document number on', lLink(x), g.no, null);
    ui.form = null;
    toast(t('{no} voided. It stays in the register.', { no: g.no }), undo);
  });
}

// ---------- signatures: recorded evidence, never an e-signature ----------
export function sendForSignature(id: string) {
  const m = getMe();
  const db0 = getDb();
  const x0 = lrOf(db0, id);
  if (!m || x0?.stage !== 'approved' || !liveNo(db0, x0) || !(grant(db0, 'sign', m.id) || x0.owner === m.id))
    return Promise.resolve(false);
  const undo = undoSnap(t('Sent for signature'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, toast }) => {
    const x = legalOf(db, id);
    if (!x) return;
    x.stage = 'awaiting';
    x.signatories.forEach((s) => {
      if (s.state === 'pending') s.state = 'requested';
    });
    hist(x, 'Sent for signature');
    logChange(db, FNL, 'sent for signature', lLink(x), 'Approved for signature', 'Awaiting signatures');
    upd(db, x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`);
    toast(t('Marked as sent for signature'), undo);
  });
}

export function recordSignature(
  id: string,
  sid: string,
  f: { basis: 'copy' | 'attested'; url: string; date: DateStr; note: string },
) {
  const m = getMe();
  const db0 = getDb();
  const x0 = lrOf(db0, id);
  if (!m || !x0 || !grant(db0, 'sign', m.id) || x0.stage !== 'awaiting' || !x0.signatories.some((s) => s.id === sid))
    return Promise.resolve(false);
  const undo = undoSnap(t('Signature'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    const s = x?.signatories.find((y) => y.id === sid);
    if (!x || !s) return;
    Object.assign(s, {
      state: f.basis === 'copy' ? 'signed' : 'attested',
      evidence: f.basis === 'copy' ? f.url : '',
      date: f.date,
      by: m.id,
      at: nowStamp(),
      basis: f.basis,
      note: f.note,
    });
    hist(x, 'Signature recorded for {party}', { party: s.party });
    logChange(db, FNL, 'recorded a signature on', lLink(x));
    const all = allSigned(x);
    if (all) {
      x.stage = 'signed';
      hist(x, 'Every party has signed');
      logChange(db, FNL, 'recorded every signature on', lLink(x), 'Awaiting signatures', 'Signed');
      upd(db, x.requester, 'fnl-signed', x.title, `fnl-requests/${x.id}`);
      if (x.type === 'BAST') upd(db, x.reviewer, 'fnl-gate-check', x.title, `fnl-requests/${x.id}`);
    }
    ui.form = null;
    toast(
      all
        ? t('All signatures recorded. The request is signed.')
        : t('Signature recorded. {a} of {b}.', { a: x.signatories.filter(sigDone).length, b: x.signatories.length }),
      undo,
    );
  });
}

export function declineSignature(id: string, sid: string, note: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !grant(getDb(), 'sign', m.id)) return Promise.resolve(false);
  const undo = undoSnap(t('Signature'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    const s = x?.signatories.find((y) => y.id === sid);
    if (!x || !s) return;
    Object.assign(s, { state: 'declined', by: m.id, at: nowStamp(), note });
    hist(x, '{party} declined to sign', { party: s.party });
    logChange(db, FNL, 'recorded a declined signature on', lLink(x));
    upd(db, x.owner, 'fnl-moved', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Recorded as declined. The request stays unsigned.'), undo);
  });
}

export function registerDocument(id: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || x0?.stage !== 'signed' || !grant(getDb(), 'legal', m.id)) return Promise.resolve(false);
  const undo = undoSnap(t('Registered'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, toast }) => {
    const x = legalOf(db, id);
    if (!x) return;
    x.stage = 'registered';
    hist(x, 'Registered');
    logChange(db, FNL, 'registered and archived', lLink(x), 'Signed', 'Registered');
    toast(t('Registered and archived'), undo);
  });
}

export function addLegalNote(id: string, text: string) {
  const m = getMe();
  if (!m || !lrOf(getDb(), id)) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x) return;
    x.priv.push({ by: m.id, at: nowStamp(), text });
    ui.form = null;
    toast(t('Note saved'));
  });
}

export function cancelLegal(id: string, why: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !(isReqL(x0, m) || grant(getDb(), 'legal', m.id))) return Promise.resolve(false);
  const undo = undoSnap(t('Canceled'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x) return;
    const prev = x.stage;
    x.stage = 'cancelled';
    x.cancel = { reason: why, by: m.id, at: nowStamp() };
    hist(x, 'Canceled: {r}', { r: why });
    logChange(db, FNL, 'canceled', lLink(x), LST[prev][0], 'Canceled');
    upd(db, isReqL(x0, m) ? x.owner : x.requester, 'fnl-moved', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Request canceled'), undo);
  });
}

// ---------- the BAST gate to Finance (legal_bast_gate, flow-legal-handoff) ----------
export function checkDelivery(id: string, url: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !grant(getDb(), 'legalReview', m.id)) return Promise.resolve(false);
  const undo = undoSnap(t('Delivery check'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x?.gate) return;
    x.gate.delivery = { url, by: m.id, at: nowStamp() };
    hist(x, 'Delivery evidence checked');
    logChange(db, FNL, 'checked the delivery evidence for', lLink(x));
    ui.form = null;
    toast(t('Delivery evidence check recorded'), undo);
  });
}

export function recordGateException(id: string, auth: PersonId, why: string) {
  const m = getMe();
  const x0 = lrOf(getDb(), id);
  if (!m || !x0 || !grant(getDb(), 'legalReview', m.id)) return Promise.resolve(false);
  const undo = undoSnap(t('Exception'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = legalOf(db, id);
    if (!x?.gate) return;
    x.gate.exception = { by: auth, recordedBy: m.id, at: nowStamp(), reason: why };
    hist(x, 'Gate exception recorded, approved by {who}', { who: db.people.find((p) => p.id === auth)?.first ?? '' });
    logChange(db, FNL, 'recorded a gate exception on', lLink(x));
    if (auth !== m.id) upd(db, auth, 'fnl-exception', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Exception recorded. It shows on the gate and to Finance.'), undo);
  });
}

export function sendGate(id: string, to: PersonId, need: DateStr) {
  const m = getMe();
  const db0 = getDb();
  const x0 = lrOf(db0, id);
  const inv0 = x0 && invOf(db0, x0.invoice);
  const g = x0 && gateOf(db0, x0);
  if (
    !m ||
    !x0 ||
    !inv0 ||
    !g ||
    !(grant(db0, 'legalReview', m.id) || grant(db0, 'legal', m.id)) ||
    x0.gate?.sent ||
    !(g.ok || g.exception)
  )
    return Promise.resolve(false);
  const undo = undoSnap(t('Gate'), lLink(x0), (s) => s.legal.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const s = fnlDraft(db);
    const x = legalOf(db, id);
    const inv = s.incoming.find((i) => i.id === inv0.id);
    if (!x?.gate || !inv) return;
    const pks = lrOf(db, x.pks);
    const pv = pks?.versions.filter((v) => v.decision?.kind === 'approved').pop()?.v ?? null;
    x.gate.sent = { by: m.id, at: nowStamp(), to };
    hist(x, 'Ready-for-invoice sent to {who}', { who: db.people.find((p) => p.id === to)?.first ?? '' });
    inv.handoff = {
      from: m.id,
      to,
      neededBy: need,
      requestedAt: nowStamp(),
      version: latestV(x)?.v,
      pksVersion: pv,
      agreedDate: null,
      acceptedAt: null,
      returnNote: '',
      exception: g.exception?.reason ?? '',
    };
    inv.state = 'requested';
    inv.history.push({ by: m.id, at: nowStamp(), what: 'Legal sent the gate; waiting for Finance to accept' });
    logChange(db, FNL, 'sent the ready-for-invoice gate to Finance for', lLink(x));
    upd(db, to, 'fnl-gate', inv.title, `fnl-requests/${inv.id}`);
    ui.form = null;
    toast(
      t('Sent to {who}. No invoice or payment was created.', { who: db.people.find((p) => p.id === to)?.first ?? '' }),
      undo,
    );
  });
}
