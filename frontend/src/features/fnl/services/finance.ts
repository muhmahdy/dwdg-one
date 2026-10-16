/* Finance & Legal: finance requests (an independent approver decides, approval is never payment), payments and signed
   corrections, incoming client terms (a separate basis), allocations with their amendments, period reviews with snapshots,
   and scoped CSV exports. The app records money; it never moves it. From divisions/div-fnl-mcit.js. */
import { go } from '@/app/router/navigation';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { nowStamp, today } from '@/lib/time';
import { logChange } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import type { DateStr, PersonId } from '@/types/workspace';
import {
  FNL,
  FST,
  TERM,
  alOf,
  alName,
  alStats,
  commit,
  fPriv,
  fnlDraft,
  fnlFull,
  fnlOf,
  frOf,
  grant,
  idrT,
  invOf,
  lrOf,
  netPaid,
  owed,
  paysOf,
  periodRows,
  periodTotals,
  prOf,
  rgOf,
  type FinanceRequest,
} from './fnl-data';
import { downloadCsv } from '@/lib/download-csv';
import { hist, tgt, undoSnap, upd } from './legal';

const fLink = (x: { id: string; purpose: string }) => tgt(x.id, x.purpose, `fnl-requests/${x.id}`);
const finOf = (db: Parameters<typeof fnlDraft>[0], id: string) => fnlDraft(db).requests.find((x) => x.id === id);
const firstOther = (list: PersonId[] | undefined, me: PersonId | undefined) => (list ?? []).find((id) => id !== me);
const first = (db: { people: { id: string; first: string }[] }, id: PersonId | null | undefined) =>
  db.people.find((p) => p.id === id)?.first ?? '';

// ---------- new finance request ----------
export interface NewFinance {
  purpose: string;
  amount: number;
  alloc: string;
  category: string;
  need: DateStr | null;
  payee: string;
  ref: string;
  evidence: string;
}

export async function submitFinance(f: NewFinance) {
  const m = getMe();
  const db0 = getDb();
  if (!m) return;
  const al = alOf(db0, f.alloc);
  const x: FinanceRequest = {
    id: uid('fr-'),
    requester: m.id,
    unit: m.div ?? al?.unit ?? null,
    project: al?.project ?? null,
    alloc: f.alloc,
    category: f.category || 'Events',
    purpose: f.purpose,
    requested: f.amount,
    approved: null,
    state: 'submitted',
    payee: f.payee,
    method: 'Bank transfer',
    neededBy: f.need,
    evidence: f.evidence ? [{ label: t('Evidence'), url: f.evidence }] : [],
    ref: f.ref,
    version: 1,
    review: null,
    returnNote: '',
    reason: '',
    dup: null,
    reconciledIn: null,
    history: [],
    createdBy: m.id,
    createdAt: nowStamp(),
    submittedAt: nowStamp(),
  };
  const dup = f.ref
    ? fnlOf(db0).requests.find(
        (r) =>
          !['cancelled', 'rejected'].includes(r.state) &&
          r.requested === f.amount &&
          r.ref.toLowerCase() === f.ref.toLowerCase(),
      )
    : undefined;
  if (dup) x.dup = { of: dup.id, state: 'flagged', by: null, at: null, note: '' };
  hist(x, 'Submitted');
  const ok = await act(({ db, toast }) => {
    const s = fnlDraft(db);
    s.requests.push(x);
    if (s.drafts[m.id]) s.drafts[m.id] = { ...s.drafts[m.id], finance: {} };
    logChange(db, FNL, 'submitted a finance request', fLink(x));
    s.grants.finReview.forEach((p) => {
      upd(db, p, 'fnl-f-review', x.purpose, `fnl-requests/${x.id}`);
    });
    toast(dup ? t('Submitted. Finance will check a possible duplicate.') : t('Request submitted to Finance'));
  });
  if (ok) go(`fnl-requests/${x.id}`);
}

// ---------- review, approval, return ----------
export function startReview(id: string) {
  const m = getMe();
  const db0 = getDb();
  const x0 = frOf(db0, id);
  if (!m || !x0 || !grant(db0, 'finReview', m.id) || x0.requester === m.id || x0.state !== 'submitted')
    return Promise.resolve(false);
  const undo = undoSnap(t('Review'), fLink(x0), (s) => s.requests.find((x) => x.id === id));
  return act(({ db, toast }) => {
    const x = finOf(db, id);
    if (!x) return;
    x.state = 'review';
    x.reviewing = { by: m.id, at: nowStamp() };
    hist(x, 'Review started');
    logChange(db, FNL, 'started reviewing', fLink(x), 'Submitted', 'Under review');
    toast(t('Review started'), undo);
  });
}

export function approveFinance(id: string, version: number, amt: number, note: string) {
  const m = getMe();
  const db0 = getDb();
  const x0 = frOf(db0, id);
  if (!m || !x0 || !['submitted', 'review'].includes(x0.state)) return Promise.resolve(false);
  if (x0.requester === m.id || !grant(db0, 'finReview', m.id)) {
    showToast(t('You requested this, so someone else approves it.')); // access_review_self_policy: default deny
    return Promise.resolve(false);
  }
  if (version !== x0.version) {
    showToast(t('The requester sent a new version. Review it again.'));
    return Promise.resolve(false);
  }
  const undo = undoSnap(t('Approval'), fLink(x0), (s) => s.requests.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = finOf(db, id);
    if (!x) return;
    const prev = x.state;
    x.approved = amt;
    x.state = 'approved';
    x.review = { by: m.id, at: nowStamp(), amount: amt, version: x.version, note };
    hist(x, amt === x.requested ? 'Approved {a}' : 'Approved {a} of {b}', { a: idrT(amt), b: idrT(x.requested) });
    logChange(db, FNL, 'approved a finance request', fLink(x), FST[prev][0], 'Approved, not paid');
    upd(db, x.requester, 'fnl-f-approved', x.purpose, `fnl-requests/${x.id}`);
    const p = firstOther(fnlDraft(db).grants.pay, m.id);
    if (p) upd(db, p, 'fnl-pay-ready', x.purpose, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Approved {a}. Not paid until a payment is recorded.', { a: idrT(amt) }), undo);
  });
}

export function returnFinance(id: string, why: string) {
  const m = getMe();
  const db0 = getDb();
  const x0 = frOf(db0, id);
  if (!m || !x0 || !grant(db0, 'finReview', m.id) || x0.requester === m.id) return Promise.resolve(false);
  const undo = undoSnap(t('Returned'), fLink(x0), (s) => s.requests.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = finOf(db, id);
    if (!x) return;
    const prev = x.state;
    x.state = 'returned';
    x.returnNote = why;
    hist(x, 'Returned for information');
    logChange(db, FNL, 'returned a finance request', fLink(x), FST[prev][0], 'Returned for information');
    upd(db, x.requester, 'fnl-f-returned', x.purpose, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Returned to {who}', { who: first(db, x.requester) }), undo);
  });
}

export function rejectFinance(id: string, why: string) {
  const m = getMe();
  const db0 = getDb();
  const x0 = frOf(db0, id);
  if (!m || !x0 || !grant(db0, 'finReview', m.id) || x0.requester === m.id) return Promise.resolve(false);
  const undo = undoSnap(t('Rejected'), fLink(x0), (s) => s.requests.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = finOf(db, id);
    if (!x) return;
    const prev = x.state;
    x.state = 'rejected';
    x.reason = why;
    x.review = { by: m.id, at: nowStamp(), amount: 0, version: x.version, decision: 'rejected' };
    hist(x, 'Rejected');
    logChange(db, FNL, 'rejected a finance request', fLink(x), FST[prev][0], 'Rejected');
    upd(db, x.requester, 'fnl-f-returned', x.purpose, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Request rejected'), undo);
  });
}

export function resubmitFinance(id: string, f: { amount: number; ref: string; evidence: string; note: string }) {
  const m = getMe();
  const x0 = frOf(getDb(), id);
  if (!m || x0?.requester !== m.id || !['draft', 'returned'].includes(x0.state)) return Promise.resolve(false);
  const undo = undoSnap(t('Submitted'), fLink(x0), (s) => s.requests.find((x) => x.id === id));
  return act(({ db, toast }) => {
    const x = finOf(db, id);
    if (!x) return;
    const wasRet = x.state === 'returned';
    if (wasRet && (f.amount !== x.requested || f.evidence)) x.version++;
    x.requested = f.amount;
    x.ref = f.ref || x.ref;
    if (f.evidence) x.evidence = [{ label: t('Evidence'), url: f.evidence }];
    x.state = 'submitted';
    x.submittedAt = nowStamp();
    hist(x, wasRet ? 'Answered and submitted again{n}' : 'Submitted', { n: f.note ? `: ${f.note}` : '' });
    logChange(db, FNL, wasRet ? 'submitted again' : 'submitted a finance request', fLink(x));
    fnlDraft(db).grants.finReview.forEach((p) => {
      upd(db, p, 'fnl-f-review', x.purpose, `fnl-requests/${x.id}`);
    });
    toast(t('Request submitted to Finance'), undo);
  });
}

// ---------- payments and corrections (retry-safe: the same reference twice never pays twice) ----------
export function recordPayment(
  id: string,
  f: { amount: number; date: DateStr; ref: string; evidence: string; note: string },
) {
  const m = getMe();
  const db0 = getDb();
  const x0 = frOf(db0, id);
  if (!m || !x0 || !grant(db0, 'pay', m.id) || !['approved', 'partial'].includes(x0.state))
    return Promise.resolve(false);
  const same = paysOf(db0, x0).find((p) => p.kind === 'payment' && p.ref.toLowerCase() === f.ref.toLowerCase());
  if (same) {
    showToast(t('Already recorded as {id}. Nothing was added.', { id: same.id }));
    return Promise.resolve(false);
  }
  const undo = undoSnap(t('Payment'), fLink(x0), (s) => s.requests.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const s = fnlDraft(db);
    const x = finOf(db, id);
    if (!x) return;
    const prev = x.state;
    s.payments.push({
      id: uid('py-'),
      req: x.id,
      kind: 'payment',
      amount: f.amount,
      date: f.date,
      ref: f.ref,
      evidence: f.evidence,
      by: m.id,
      at: nowStamp(),
      note: f.note,
    });
    x.state = owed(db, x) === 0 ? 'paid' : 'partial';
    hist(x, 'Payment recorded: {a}', { a: idrT(f.amount) });
    logChange(db, FNL, 'recorded a payment on', fLink(x), FST[prev][0], FST[x.state][0]);
    upd(db, x.requester, 'fnl-paid', x.purpose, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(
      x.state === 'paid'
        ? t('Payment recorded. Paid in full.')
        : t('Payment recorded. {o} still owed.', { o: idrT(owed(db, x)) }),
      undo,
    );
  });
}

export function recordCorrection(id: string, f: { of: string; sign: 1 | -1; amount: number; why: string }) {
  const m = getMe();
  const db0 = getDb();
  const x0 = frOf(db0, id);
  if (!m || !x0 || !grant(db0, 'pay', m.id)) return Promise.resolve(false);
  const net = netPaid(db0, x0) + f.sign * f.amount;
  if (net < 0 || net > (x0.approved ?? 0)) {
    showToast(t('Paid would become {n}, outside 0 to the approved {a}.', { n: idrT(net), a: idrT(x0.approved ?? 0) }));
    return Promise.resolve(false);
  }
  const undo = undoSnap(t('Correction'), fLink(x0), (s) => s.requests.find((x) => x.id === id));
  const orig = fnlOf(db0).payments.find((p) => p.id === f.of);
  return act(({ db, ui, toast }) => {
    const s = fnlDraft(db);
    const x = finOf(db, id);
    if (!x) return;
    const prev = x.state;
    s.payments.push({
      id: uid('py-'),
      req: x.id,
      kind: 'correction',
      of: f.of,
      amount: f.sign * f.amount,
      date: orig?.date ?? today(),
      ref: orig?.ref ?? '',
      evidence: orig?.evidence ?? '',
      by: m.id,
      at: nowStamp(),
      note: f.why,
    });
    x.state = owed(db, x) === 0 ? 'paid' : 'partial';
    hist(x, 'Correction recorded against {p}', { p: f.of });
    logChange(db, FNL, 'recorded a correction on', fLink(x), FST[prev][0], FST[x.state][0]);
    ui.form = null;
    toast(t('Correction recorded. The original payment is unchanged.'), undo);
  });
}

export function decideDuplicate(id: string, o: 'cleared' | 'confirmed') {
  const m = getMe();
  const db0 = getDb();
  const x0 = frOf(db0, id);
  if (!m || !x0?.dup || !grant(db0, 'finReview', m.id)) return Promise.resolve(false);
  const undo = undoSnap(t('Duplicate check'), fLink(x0), (s) => s.requests.find((x) => x.id === id));
  return act(({ db, toast }) => {
    const x = finOf(db, id);
    if (!x?.dup) return;
    Object.assign(x.dup, { state: o, by: m.id, at: nowStamp() });
    if (o === 'confirmed') {
      x.state = 'cancelled';
      x.reason = t('Duplicate of {r}', { r: frOf(db, x.dup.of)?.purpose ?? x.dup.of });
      hist(x, 'Canceled as a duplicate');
    } else hist(x, 'Checked: not a duplicate');
    logChange(db, FNL, o === 'confirmed' ? 'canceled a duplicate request' : 'cleared a duplicate flag on', fLink(x));
    upd(db, x.requester, 'fnl-f-returned', x.purpose, `fnl-requests/${x.id}`);
    toast(o === 'confirmed' ? t('Canceled as a duplicate. Both records stay.') : t('Duplicate flag cleared'), undo);
  });
}

export function cancelFinance(id: string, why: string) {
  const m = getMe();
  const x0 = frOf(getDb(), id);
  if (!m || x0?.requester !== m.id) return Promise.resolve(false);
  const undo = undoSnap(t('Canceled'), fLink(x0), (s) => s.requests.find((x) => x.id === id));
  return act(({ db, ui, toast }) => {
    const x = finOf(db, id);
    if (!x) return;
    const prev = x.state;
    x.state = 'cancelled';
    x.reason = why;
    hist(x, 'Canceled: {r}', { r: why });
    logChange(db, FNL, 'canceled a finance request', fLink(x), FST[prev][0], 'Canceled');
    ui.form = null;
    toast(t('Request canceled'), undo);
  });
}

// ---------- incoming client terms ----------
const iLink = (x: { id: string; title: string }) => tgt(x.id, x.title, `fnl-requests/${x.id}`);
const incOf = (db: Parameters<typeof fnlDraft>[0], id: string) => fnlDraft(db).incoming.find((x) => x.id === id);
const incUndo = (id: string, msg: string) => {
  const x0 = invOf(getDb(), id);
  return undoSnap(msg, iLink(x0 ?? { id, title: '' }), (s) => s.incoming.find((x) => x.id === id));
};

export function acceptGate(id: string, agreed: DateStr | null) {
  const m = getMe();
  const x0 = invOf(getDb(), id);
  if (!m || x0?.handoff?.to !== m.id || x0.state !== 'requested') return Promise.resolve(false);
  const undo = incUndo(id, t('Handoff'));
  return act(({ db, ui, toast }) => {
    const x = incOf(db, id);
    if (!x?.handoff) return;
    const ag = agreed ?? x.handoff.neededBy;
    Object.assign(x.handoff, { acceptedAt: nowStamp(), agreedDate: ag });
    x.state = 'accepted';
    x.history.push({ by: m.id, at: nowStamp(), what: 'Finance accepted the gate' });
    logChange(db, FNL, 'accepted the ready-for-invoice gate for', iLink(x));
    upd(db, x.handoff.from, 'fnl-gate-reply', x.title, `fnl-requests/${x.id}`);
    ui.form = null;
    toast(t('Accepted. Agreed date {d}.', { d: ag }), undo);
  });
}

export function returnGate(id: string, why: string) {
  const m = getMe();
  const x0 = invOf(getDb(), id);
  if (!m || x0?.handoff?.to !== m.id) return Promise.resolve(false);
  const undo = incUndo(id, t('Handoff'));
  return act(({ db, ui, toast }) => {
    const x = incOf(db, id);
    if (!x?.handoff) return;
    x.handoff.returnNote = why;
    x.state = 'returned';
    const b = lrOf(db, x.gateFrom);
    const bd = b && fnlDraft(db).legal.find((l) => l.id === b.id);
    if (bd?.gate) {
      bd.gate.sent = null;
      bd.history.push({ by: m.id, at: nowStamp(), what: 'Finance returned the gate: {r}', v: { r: why } });
    }
    x.history.push({ by: m.id, at: nowStamp(), what: 'Returned to Legal' });
    logChange(db, FNL, 'returned the ready-for-invoice gate for', iLink(x));
    upd(db, x.handoff.from, 'fnl-gate-reply', x.title, `fnl-requests/${x.gateFrom}`);
    ui.form = null;
    toast(t('Returned to Legal'), undo);
  });
}

export function recordInvoice(id: string, f: { ref: string; url: string; on: DateStr; due: DateStr | null }) {
  const m = getMe();
  const db0 = getDb();
  const x0 = invOf(db0, id);
  if (!m || !x0 || !(grant(db0, 'invoice', m.id) || grant(db0, 'pay', m.id)) || x0.state !== 'accepted')
    return Promise.resolve(false);
  const undo = incUndo(id, t('Invoice'));
  return act(({ db, ui, toast }) => {
    const x = incOf(db, id);
    if (!x) return;
    Object.assign(x, { invoiceRef: f.ref, invoiceUrl: f.url, issuedOn: f.on, due: f.due, state: 'invoiced' });
    x.history.push({ by: m.id, at: nowStamp(), what: 'Invoice issued outside the app was recorded' });
    logChange(db, FNL, 'recorded an invoice for', iLink(x));
    ui.form = null;
    toast(t('Invoice recorded'), undo);
  });
}

export function recordReceipt(id: string, f: { amount: number; date: DateStr; ref: string; evidence: string }) {
  const m = getMe();
  const db0 = getDb();
  const x0 = invOf(db0, id);
  if (
    !m ||
    !x0 ||
    !(grant(db0, 'invoice', m.id) || grant(db0, 'pay', m.id)) ||
    !['invoiced', 'partial'].includes(x0.state)
  )
    return Promise.resolve(false);
  if (x0.receipts.some((p) => p.ref.toLowerCase() === f.ref.toLowerCase())) {
    showToast(t('That reference is already recorded. Nothing was added.'));
    return Promise.resolve(false);
  }
  const undo = incUndo(id, t('Receipt'));
  return act(({ db, ui, toast }) => {
    const x = incOf(db, id);
    if (!x) return;
    const rec = x.receipts.reduce((s, p) => s + p.amount, 0);
    x.receipts.push({
      id: uid('rc-'),
      amount: f.amount,
      date: f.date,
      ref: f.ref,
      evidence: f.evidence,
      by: m.id,
      at: nowStamp(),
    });
    x.state = rec + f.amount >= x.expected ? 'received' : 'partial';
    x.history.push({ by: m.id, at: nowStamp(), what: 'Receipt recorded: {a}', v: { a: idrT(f.amount) } });
    logChange(db, FNL, 'recorded a receipt for', iLink(x));
    ui.form = null;
    toast(t('Receipt recorded'), undo);
  });
}

// ---------- budget: allocations ----------
const aLink = (a: { id: string }, name: string) => tgt(a.id, name, 'budget');
const allocOf = (db: Parameters<typeof fnlDraft>[0], id: string) => fnlDraft(db).allocations.find((x) => x.id === id);

export function proposeAllocation(f: {
  unit: string;
  project: string | null;
  category: string;
  amount: number;
  source: string;
}) {
  const m = getMe();
  if (!m || !grant(getDb(), 'allocate', m.id)) return Promise.resolve(false);
  const a = {
    id: uid('al-'),
    term: TERM,
    unit: f.unit as never,
    project: f.project,
    category: f.category || 'Operations',
    amount: f.amount,
    state: 'proposed' as const,
    source: f.source,
    approvedBy: null,
    approvedAt: null,
    history: [{ amount: f.amount, by: m.id, at: nowStamp(), reason: 'First allocation' }],
    createdBy: m.id,
    createdAt: nowStamp(),
    returnNote: '',
  };
  return act(({ db, ui, toast }) => {
    const s = fnlDraft(db);
    s.allocations.push(a);
    const name = alName(db, a);
    logChange(db, FNL, 'proposed an allocation', aLink(a, name));
    s.grants.budget.forEach((p) => {
      upd(db, p, 'fnl-alloc', name, 'budget');
    });
    ui.insp = { type: 'fm-alloc', id: a.id };
    toast(t('Allocation proposed'), ({ db: u, ui: x }) => {
      const su = fnlDraft(u);
      su.allocations = su.allocations.filter((v) => v.id !== a.id);
      x.insp = null;
      logChange(u, FNL, 'withdrew an allocation proposal', aLink(a, name));
    });
  });
}

export function approveAllocation(id: string) {
  const m = getMe();
  const db0 = getDb();
  const a0 = alOf(db0, id);
  if (!m || a0?.state !== 'proposed' || !grant(db0, 'budget', m.id) || a0.createdBy === m.id)
    return Promise.resolve(false);
  const prev = structuredClone(a0);
  return act(({ db, toast }) => {
    const a = allocOf(db, id);
    if (!a) return;
    Object.assign(a, { state: 'approved', approvedBy: m.id, approvedAt: nowStamp() });
    const name = alName(db, a);
    logChange(db, FNL, 'approved an allocation', aLink(a, name), 'Waiting for approval', 'Approved');
    upd(db, a.createdBy, 'fnl-alloc-done', name, 'budget');
    toast(t('Allocation approved'), ({ db: u }) => {
      const x = allocOf(u, id);
      if (!x) return;
      Object.assign(x, prev);
      logChange(u, FNL, 'undid an allocation approval', aLink(x, name));
    });
  });
}

export function returnAllocation(id: string, why: string) {
  const m = getMe();
  const db0 = getDb();
  const a0 = alOf(db0, id);
  if (!m || !a0 || !grant(db0, 'budget', m.id) || a0.createdBy === m.id) return Promise.resolve(false);
  const prev = structuredClone(a0);
  return act(({ db, ui, toast }) => {
    const a = allocOf(db, id);
    if (!a) return;
    Object.assign(a, { state: 'returned', returnNote: why });
    const name = alName(db, a);
    logChange(db, FNL, 'returned an allocation proposal', aLink(a, name));
    upd(db, a.createdBy, 'fnl-alloc-done', name, 'budget');
    ui.form = null;
    toast(t('Returned'), ({ db: u }) => {
      const x = allocOf(u, id);
      if (x) Object.assign(x, prev);
    });
  });
}

export function amendAllocation(id: string, amt: number, why: string, exception: boolean) {
  const m = getMe();
  const db0 = getDb();
  const a0 = alOf(db0, id);
  if (!m || !a0 || !grant(db0, 'budget', m.id) || a0.state !== 'approved') return Promise.resolve(false);
  const c = alStats(db0, a0).committed;
  if (amt < c && !exception) return Promise.resolve(false);
  const prev = structuredClone(a0);
  return act(({ db, ui, toast }) => {
    const a = allocOf(db, id);
    if (!a) return;
    const from = a.amount;
    a.amount = amt;
    a.history.push({
      amount: amt,
      by: m.id,
      at: nowStamp(),
      reason: amt < c ? `${why} (${t('exception: below commitments')})` : why,
    });
    ui.fmAmend = null;
    ui.form = null;
    const name = alName(db, a);
    logChange(db, FNL, 'amended an allocation', aLink(a, name), idrT(from), idrT(amt));
    toast(t('Allocation amended. Paid records are unchanged.'), ({ db: u }) => {
      const x = allocOf(u, id);
      if (!x) return;
      Object.assign(x, prev);
      x.history.push({ amount: from, by: m.id, at: nowStamp(), reason: t('Undid the amendment') });
      logChange(u, FNL, 'undid an allocation amendment', aLink(x, name));
    });
  });
}

// ---------- period reviews ----------
const pLink = (p: { id: string; name: string }) => tgt(p.id, p.name, `period-reviews/${p.id}`);
const perOf = (db: Parameters<typeof fnlDraft>[0], id: string) => fnlDraft(db).periods.find((x) => x.id === id);
const mayPrep = (m: { id: string }) => grant(getDb(), 'periodPrep', m.id) || grant(getDb(), 'period', m.id);

export function matchRow(pid: string, xid: string) {
  const m = getMe();
  const db0 = getDb();
  const p0 = prOf(db0, pid);
  const row = fnlOf(db0).payments.find((q) => q.id === xid);
  if (!m || !p0 || !row || !mayPrep(m) || p0.state === 'closed') return Promise.resolve(false);
  if (!row.evidence) {
    showToast(t('Attach evidence first. Missing evidence stays a discrepancy.'));
    return Promise.resolve(false);
  }
  const undo = undoSnap(t('Check'), pLink(p0), () => undefined);
  return act(({ db, toast }) => {
    const p = perOf(db, pid);
    if (!p) return;
    p.checks[xid] = 'matched';
    if (p.discrepancies)
      p.discrepancies = Object.fromEntries(Object.entries(p.discrepancies).filter(([k]) => k !== xid));
    p.unresolved.forEach((r) => {
      if (r.row === xid) r.state = 'done';
    });
    logChange(db, FNL, 'checked a payment in', pLink(p));
    toast(t('Marked as matching the evidence'), undo);
  });
}

export function flagRow(pid: string, xid: string, action: string, owner: PersonId) {
  const m = getMe();
  const p0 = prOf(getDb(), pid);
  if (!m || !p0 || !mayPrep(m)) return Promise.resolve(false);
  const undo = undoSnap(t('Discrepancy'), pLink(p0), () => undefined);
  return act(({ db, ui, toast }) => {
    const p = perOf(db, pid);
    if (!p) return;
    p.checks[xid] = 'discrepancy';
    p.discrepancies = { ...(p.discrepancies ?? {}), [xid]: { action, owner, by: m.id, at: nowStamp() } };
    p.unresolved.push({ id: uid('ur-'), row: xid, text: action, owner, due: null, state: 'open' });
    logChange(db, FNL, 'recorded a discrepancy in', pLink(p));
    upd(db, owner, 'fnl-disc', p.name, `period-reviews/${p.id}`);
    ui.form = null;
    toast(t('Discrepancy recorded with an owner'), undo);
  });
}

export function compareBank(pid: string) {
  const m = getMe();
  const p0 = prOf(getDb(), pid);
  if (!m || !p0 || !grant(getDb(), 'period', m.id)) return Promise.resolve(false);
  const undo = undoSnap(t('Bank'), pLink(p0), () => undefined);
  return act(({ db, toast }) => {
    const p = perOf(db, pid);
    if (!p) return;
    p.bank = 'done';
    p.bankBy = m.id;
    p.bankAt = nowStamp();
    logChange(db, FNL, 'recorded the bank comparison for', pLink(p));
    toast(t('Bank comparison recorded'), undo);
  });
}

export function saveSnapshot(pid: string) {
  const m = getMe();
  const db0 = getDb();
  const p0 = prOf(db0, pid);
  if (!m || !p0 || !grant(db0, 'period', m.id)) return Promise.resolve(false);
  const rows = periodRows(db0, p0);
  if (p0.state !== 'closed' && rows.some((x) => (p0.checks[x.id] ?? 'unchecked') === 'unchecked')) {
    showToast(t('Every row needs a result before a snapshot.'));
    return Promise.resolve(false);
  }
  const undo = undoSnap(t('Snapshot'), pLink(p0), () => undefined);
  return act(({ db, toast }) => {
    const p = perOf(db, pid);
    if (!p) return;
    const tt = periodTotals(db, p);
    const v = p.snapshots.length + 1;
    p.snapshots.push({
      v,
      at: nowStamp(),
      by: m.id,
      totals: { alloc: tt.alloc, committed: tt.committed, paid: tt.paid, outstanding: tt.outstanding },
      ids: [...tt.reqs.map((r) => r.id), ...rows.map((x) => x.id)],
      note:
        p.state === 'closed'
          ? t('After a correction; the earlier snapshot stays as the past basis.')
          : p.bank === 'done'
            ? ''
            : t('Bank reconciliation incomplete.'),
    });
    if (p.state === 'open') p.state = 'review';
    logChange(db, FNL, 'saved a snapshot of', pLink(p), null, `S${String(v)}`);
    toast(t('Snapshot {v} saved', { v }), undo);
  });
}

export function closePeriod(pid: string) {
  const m = getMe();
  const p0 = prOf(getDb(), pid);
  if (!m || !p0 || !grant(getDb(), 'period', m.id) || !p0.snapshots.length) return Promise.resolve(false);
  const undo = undoSnap(t('Closed'), pLink(p0), () => undefined);
  return act(({ db, toast }) => {
    const p = perOf(db, pid);
    if (!p) return;
    p.state = 'closed';
    p.closedBy = m.id;
    p.closedAt = nowStamp();
    logChange(db, FNL, 'closed the period', pLink(p), 'In review', 'Closed with snapshot');
    p.unresolved
      .filter((r) => r.state === 'open')
      .forEach((r) => {
        upd(db, r.owner, 'fnl-disc', p.name, `period-reviews/${p.id}`);
      });
    toast(t('Period closed. Open actions stay with their owners.'), undo);
  });
}

export function markActionDone(pid: string, uid2: string) {
  const m = getMe();
  const p0 = prOf(getDb(), pid);
  const r0 = p0?.unresolved.find((q) => q.id === uid2);
  if (!m || !p0 || !r0 || !(r0.owner === m.id || grant(getDb(), 'period', m.id))) return Promise.resolve(false);
  return act(({ db, toast }) => {
    const p = perOf(db, pid);
    const r = p?.unresolved.find((q) => q.id === uid2);
    if (!p || !r) return;
    r.state = 'done';
    r.doneBy = m.id;
    r.doneAt = nowStamp();
    logChange(db, FNL, 'resolved an open action in', pLink(p));
    toast(t('Action marked done'), ({ db: u }) => {
      const x = perOf(u, pid)?.unresolved.find((q) => q.id === uid2);
      if (x) x.state = 'open';
    });
  });
}

// ---------- exports (scoped; restricted fields only for the grants that may read them) ----------
export function exportBudget() {
  const db0 = getDb();
  const m = getMe();
  if (!fnlFull(m)) return Promise.resolve(false);
  downloadCsv(
    `dwdg-fnl-requests-${today()}.csv`,
    [
      'id',
      'purpose',
      'unit',
      'budget_line',
      'category',
      'state',
      'requested_idr',
      'approved_idr',
      'paid_idr',
      'outstanding_idr',
      'evidence',
      'as_of',
    ],
    fnlOf(db0)
      .requests.filter((r) => r.state !== 'draft')
      .map((r) => [
        r.id,
        r.purpose,
        r.unit ?? '',
        r.alloc ?? '',
        r.category,
        r.state,
        r.requested,
        commit(r) || '',
        commit(r) ? netPaid(db0, r) : '',
        commit(r) ? owed(db0, r) : '',
        fPriv(db0, r, m) ? r.evidence.map((e) => e.url).join(' ') : 'restricted',
        nowStamp(),
      ]),
  );
  return act(({ db, toast }) => {
    logChange(db, FNL, 'exported finance requests', tgt('budget', t('Budget & transactions'), 'budget'));
    toast(t('Export downloaded. Restricted evidence is left out for viewers without the grant.'));
  });
}

export function exportRegister() {
  const db0 = getDb();
  if (!fnlFull(getMe())) return Promise.resolve(false);
  downloadCsv(
    `dwdg-fnl-register-${today()}.csv`,
    [
      'number',
      'state',
      'void_reason',
      'replaces',
      'type',
      'request',
      'document',
      'version',
      'request_state',
      'issued_by',
      'issued_at',
    ],
    [...fnlOf(db0).register]
      .sort((a, b) => a.seq - b.seq)
      .map((g) => {
        const x = lrOf(db0, g.req);
        return [
          g.no,
          g.state,
          g.voidReason,
          (g.replaces ? rgOf(db0, g.replaces)?.no : '') ?? '',
          g.type,
          g.req,
          x?.title ?? '',
          g.version,
          x?.stage ?? '',
          db0.people.find((p) => p.id === g.issuedBy)?.name ?? '',
          g.issuedAt,
        ];
      }),
  );
  return act(({ db, toast }) => {
    logChange(db, FNL, 'exported the document register', tgt('register', t('Documents & register'), 'register'));
    toast(t('Register exported'));
  });
}

export function exportPeriod(pid: string) {
  const db0 = getDb();
  const p = prOf(db0, pid);
  if (!p || !fnlFull(getMe())) return Promise.resolve(false);
  const tt = periodTotals(db0, p);
  downloadCsv(
    `dwdg-fnl-${p.id}.csv`,
    ['row', 'request', 'kind', 'date', 'amount_idr', 'reference', 'evidence', 'check'],
    [
      ...periodRows(db0, p).map((x) => [
        x.id,
        x.req,
        x.kind,
        x.date,
        x.amount,
        x.ref,
        x.evidence || 'missing',
        p.checks[x.id] ?? 'unchecked',
      ]),
      ['total', '', '', '', tt.paid, '', '', ''],
      ['basis', 'committed', '', '', tt.committed, '', '', ''],
      ['basis', 'outstanding', '', '', tt.outstanding, '', '', ''],
      ['basis', 'bank_reconciliation', '', '', '', '', p.bank, ''],
    ],
  );
  return act(({ db, toast }) => {
    logChange(db, FNL, 'exported the period review', pLink(p));
    toast(t('Period exported'));
  });
}
