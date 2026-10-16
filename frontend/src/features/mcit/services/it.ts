/* MCIT request actions: IT requests (triage, questions, linked tasks, blockers, resolution confirmed by the requester), content
   briefs (accepted into a content item or returned with a reason), and the accounts register (custodian verified or changed).
   A request never authorizes a deployment or an access change by itself, and a typed password or token is refused before
   saving. From divisions/div-fnl-mcit.js ACT['mc-it-*'], ['mc-b-*'], ['mc-acc-*']. */
import { go } from '@/app/router/navigation';
import { downloadCsv } from '@/lib/download-csv';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { nowStamp, today } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, type UndoRecipe } from '@/lib/workspace/transaction';
import { hist, tgt, upd } from '@/features/fnl/services/legal';
import { addTaskDraft } from '@/features/work/services/task-actions';
import type { DateStr, PersonId, Workspace } from '@/types/workspace';
import { first, iLink, mcUndo } from './content';
import {
  IT,
  MC,
  accOf,
  brOf,
  itOf,
  mcFull,
  mcitDraft,
  mcitOf,
  mg,
  type Brief,
  type ChannelId,
  type ItRequest,
  type ItType,
  type McitStore,
} from './mcit-data';

const itFind = (id: string) => (s: McitStore) => s.it.find((x) => x.id === id);
const reqOf = (db: ReturnType<typeof getDb>, id: string) => itOf(db, id);
const itDraft = (db: Parameters<typeof mcitDraft>[0], id: string) => mcitDraft(db).it.find((x) => x.id === id);
const briefLink = (b: { id: string; title: string }) => tgt(b.id, b.title, `it-requests/${b.id}`);
const accLink = (a: { id: string; service: string }) => tgt(a.id, a.service, 'accounts-register');

/** The draft of a new request lives with the person and survives reloads (work_forms). */
export function saveMcDraft(kind: 'it' | 'brief', values: Record<string, unknown>) {
  const m = getMe();
  if (!m) return Promise.resolve(false);
  return act(({ db }) => {
    const s = mcitDraft(db);
    const mine = (s.drafts[m.id] ??= {});
    mine[kind] = { ...values, _at: nowStamp() };
  });
}
function clearDraft(db: Parameters<typeof mcitDraft>[0], m: PersonId, kind: string) {
  const s = mcitDraft(db);
  s.drafts[m] = { ...(s.drafts[m] ?? {}), [kind]: {} };
}

// ---------- new requests ----------
export interface NewIt {
  title: string;
  type: ItType;
  service: string | null;
  symptom: string;
  expected: string;
  impact: ItRequest['impact'];
  steps: string;
  evidence: string;
}
export async function submitIt(f: NewIt) {
  const m = getMe();
  if (!m) return;
  const x: ItRequest = {
    id: uid('it-'),
    title: f.title,
    type: f.type,
    service: f.service,
    symptom: f.symptom,
    expected: f.expected,
    impact: f.impact,
    steps: f.steps,
    evidence: f.evidence ? { label: t('Screenshot'), url: f.evidence } : null,
    requester: m.id,
    unit: m.div,
    owner: null,
    priority: null,
    stage: 'new',
    tasks: [],
    info: [],
    blocker: null,
    resolution: null,
    confirm: null,
    priv: '',
    history: [],
    createdBy: m.id,
    createdAt: nowStamp(),
  };
  hist(x, 'Submitted');
  const ok = await act(({ db, toast }) => {
    const s = mcitDraft(db);
    s.it.push(x);
    clearDraft(db, m.id, 'it');
    logChange(db, MC, 'received an IT request', iLink(x));
    if (m.div && m.div !== MC) logChange(db, m.div, 'sent an IT request to MCIT', iLink(x));
    s.grants.triage.forEach((p) => {
      upd(db, p, 'mc-it-new', x.title, `it-requests/${x.id}`);
    });
    toast(t('Request sent to IT'));
  });
  if (ok) go(`it-requests/${x.id}`);
}

export interface NewBrief {
  title: string;
  purpose: string;
  audience: string;
  channel: ChannelId;
  deliverable: string;
  desired: DateStr;
  sources: string;
  approver: PersonId | null;
}
export async function submitBrief(f: NewBrief) {
  const m = getMe();
  if (!m) return;
  const b: Brief = {
    id: uid('br-'),
    ...f,
    unit: m.div,
    requester: m.id,
    state: 'submitted',
    content: null,
    returnNote: '',
    createdBy: m.id,
    createdAt: nowStamp(),
  };
  const ok = await act(({ db, toast }) => {
    const s = mcitDraft(db);
    s.briefs.push(b);
    clearDraft(db, m.id, 'brief');
    logChange(db, MC, 'received a content brief', briefLink(b));
    s.grants.review.forEach((p) => {
      upd(db, p, 'mc-brief', b.title, `it-requests/${b.id}`);
    });
    toast(t('Brief sent to MCIT'));
  });
  if (ok) go(`it-requests/${b.id}`);
}

// ---------- briefs ----------
export function returnBrief(id: string, why: string) {
  const m = getMe();
  const b0 = brOf(getDb(), id);
  if (!m || !b0) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const b = mcitDraft(db).briefs.find((x) => x.id === id);
    if (!b) return;
    b.state = 'returned';
    b.returnNote = why;
    b.returnedBy = m.id;
    logChange(db, MC, 'returned a content brief', briefLink(b));
    upd(db, b.requester, 'mc-brief-reply', b.title, `it-requests/${b.id}`);
    ui.form = null;
    toast(t('Returned to {who}', { who: first(db, b.requester) }));
  });
}
export function resubmitBrief(id: string, answer: string) {
  const m = getMe();
  const b0 = brOf(getDb(), id);
  if (!m || b0?.requester !== m.id) return Promise.resolve(false);
  return act(({ db, toast }) => {
    const s = mcitDraft(db);
    const b = s.briefs.find((x) => x.id === id);
    if (!b) return;
    b.sources = `${b.sources}\n${t('Answer')}: ${answer}`;
    b.state = 'submitted';
    b.returnNote = '';
    logChange(db, MC, 'received an updated content brief', briefLink(b));
    upd(db, b.returnedBy ?? s.grants.review[0], 'mc-brief', b.title, `it-requests/${b.id}`);
    toast(t('Brief sent again'));
  });
}

// ---------- IT requests ----------
export function triageIt(id: string, owner: PersonId, priority: ItRequest['priority']) {
  const m = getMe();
  const x0 = reqOf(getDb(), id);
  if (!m || !x0 || !mg(getDb(), 'triage', m.id)) return Promise.resolve(false);
  const undo = mcUndo(t('Triage'), iLink(x0), itFind(id));
  return act(({ db, ui, toast }) => {
    const x = itDraft(db, id);
    if (!x) return;
    const prev = x.stage;
    x.owner = owner !== '' ? owner : m.id;
    x.priority = priority ?? 'medium';
    x.stage = prev === 'reopened' ? 'working' : 'triaged';
    hist(x, 'Triaged and assigned to {who}', { who: first(db, x.owner) });
    logChange(db, MC, 'triaged', iLink(x), IT[prev][0], IT[x.stage][0]);
    upd(db, x.owner, 'mc-it-assigned', x.title, `it-requests/${x.id}`);
    upd(db, x.requester, 'mc-it-moved', x.title, `it-requests/${x.id}`);
    ui.form = null;
    toast(t('Assigned to {who}', { who: first(db, x.owner) }), undo);
  });
}

export function askIt(id: string, q: string) {
  const m = getMe();
  const x0 = reqOf(getDb(), id);
  if (!m || !x0 || !(mg(getDb(), 'triage', m.id) || x0.owner === m.id)) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const x = itDraft(db, id);
    if (!x) return;
    x.info.push({ q, by: m.id, at: nowStamp(), a: '', aAt: null });
    x.prevStage = x.stage;
    x.stage = 'waiting';
    hist(x, 'Asked the requester for information');
    logChange(db, MC, 'asked for information on', iLink(x));
    upd(db, x.requester, 'mc-it-info', x.title, `it-requests/${x.id}`);
    ui.form = null;
    toast(t('Question sent'));
  });
}

export function answerIt(id: string, i: number, a: string) {
  const m = getMe();
  const x0 = reqOf(getDb(), id);
  if (!m || x0?.requester !== m.id || !x0.info[i]) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const x = itDraft(db, id);
    const q = x?.info[i];
    if (!x || !q) return;
    q.a = a;
    q.aAt = nowStamp();
    x.stage = x.prevStage && x.prevStage !== 'waiting' ? x.prevStage : x.owner ? 'working' : 'new';
    hist(x, 'Answered');
    upd(db, x.owner ?? q.by, 'mc-it-moved', x.title, `it-requests/${x.id}`);
    ui.form = null;
    toast(t('Answer sent'));
  });
}

export function addItTask(id: string, f: { title: string; due: DateStr | null }) {
  const m = getMe();
  const x0 = reqOf(getDb(), id);
  if (!m || !x0 || !(mg(getDb(), 'tech', m.id) || mg(getDb(), 'triage', m.id) || x0.owner === m.id))
    return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const x = itDraft(db, id);
    if (!x) return;
    const task = addTaskDraft(db, f.title, {
      owner: x.owner ?? m.id,
      due: f.due,
      div: MC,
      notes: t('From the IT request "{t}".', { t: x.title }),
    });
    if (!task) return;
    x.tasks.push(task.id);
    if (['triaged', 'reopened', 'new'].includes(x.stage)) x.stage = 'working';
    hist(x, 'Task created');
    logChange(db, MC, 'linked a task to', iLink(x));
    if (task.owner !== m.id) notify(db, task.owner, 'tadded', { type: 'task', id: task.id });
    ui.form = null;
    toast(t('Task created and linked'));
  });
}

export function blockIt(id: string, text: string, action: string) {
  const m = getMe();
  const x0 = reqOf(getDb(), id);
  if (!m || !x0) return Promise.resolve(false);
  const undo = mcUndo(t('Blocker'), iLink(x0), itFind(id));
  return act(({ db, ui, toast }) => {
    const x = itDraft(db, id);
    if (!x) return;
    x.blocker = { text, action, by: m.id, at: nowStamp() };
    x.prevStage = x.stage;
    x.stage = 'waiting';
    hist(x, 'Waiting: {r}', { r: action });
    logChange(db, MC, 'recorded a blocker on', iLink(x));
    upd(db, x.requester, 'mc-it-moved', x.title, `it-requests/${x.id}`);
    ui.form = null;
    toast(t('Blocker recorded'), undo);
  });
}
export function unblockIt(id: string) {
  const x0 = reqOf(getDb(), id);
  if (!x0?.blocker) return Promise.resolve(false);
  const undo = mcUndo(t('Blocker'), iLink(x0), itFind(id));
  return act(({ db, toast }) => {
    const x = itDraft(db, id);
    if (!x) return;
    x.blocker = null;
    x.stage = 'working';
    hist(x, 'Blocker cleared');
    logChange(db, MC, 'cleared a blocker on', iLink(x));
    toast(t('Blocker cleared'), undo);
  });
}

export function resolveIt(id: string, f: { text: string; url: string; version: string }) {
  const m = getMe();
  const x0 = reqOf(getDb(), id);
  if (!m || !x0 || !(mg(getDb(), 'tech', m.id) || x0.owner === m.id)) return Promise.resolve(false);
  const undo = mcUndo(t('Resolved'), iLink(x0), itFind(id));
  return act(({ db, ui, toast }) => {
    const x = itDraft(db, id);
    if (!x) return;
    const prev = x.stage;
    x.resolution = { text: f.text, url: f.url, version: f.version, by: m.id, at: nowStamp() };
    x.stage = 'resolved';
    x.confirm = null;
    hist(x, 'Resolved: {r}', { r: f.text });
    logChange(db, MC, 'resolved an IT request', iLink(x), IT[prev][0], 'Resolved');
    upd(db, x.requester, 'mc-it-resolved', x.title, `it-requests/${x.id}`);
    ui.form = null;
    toast(t('Marked resolved. {who} confirms it.', { who: first(db, x.requester) }), undo);
  });
}

export function confirmIt(id: string) {
  const m = getMe();
  const x0 = reqOf(getDb(), id);
  if (!m || x0?.requester !== m.id || x0.stage !== 'resolved') return Promise.resolve(false);
  const undo = mcUndo(t('Confirmed'), iLink(x0), itFind(id));
  return act(({ db, toast }) => {
    const x = itDraft(db, id);
    if (!x) return;
    x.confirm = { kind: 'solved', by: m.id, at: nowStamp(), note: '' };
    x.stage = 'closed';
    hist(x, 'Confirmed solved');
    logChange(db, MC, 'confirmed solved', iLink(x), 'Resolved', 'Closed');
    upd(db, x.owner, 'mc-it-moved', x.title, `it-requests/${x.id}`);
    toast(t('Thanks. The request is closed.'), undo);
  });
}

export function reopenIt(id: string, why: string) {
  const m = getMe();
  const x0 = reqOf(getDb(), id);
  if (!m || x0?.requester !== m.id) return Promise.resolve(false);
  const undo = mcUndo(t('Reopened'), iLink(x0), itFind(id));
  return act(({ db, ui, toast }) => {
    const x = itDraft(db, id);
    if (!x) return;
    x.stage = 'reopened';
    x.resolution = null;
    hist(x, 'Reopened: {r}', { r: why });
    logChange(db, MC, 'reopened', iLink(x), 'Resolved', 'Reopened');
    upd(db, x.owner, 'mc-it-reopened', x.title, `it-requests/${x.id}`);
    ui.form = null;
    toast(t('Reopened. {who} was told.', { who: first(db, x.owner) }), undo);
  });
}

export function cancelIt(id: string) {
  const m = getMe();
  const x0 = reqOf(getDb(), id);
  if (!m || x0?.requester !== m.id) return Promise.resolve(false);
  const undo = mcUndo(t('Canceled'), iLink(x0), itFind(id));
  return act(({ db, toast }) => {
    const x = itDraft(db, id);
    if (!x) return;
    const prev = x.stage;
    x.stage = 'cancelled';
    hist(x, 'Canceled by the requester');
    logChange(db, MC, 'canceled', iLink(x), IT[prev][0], 'Canceled');
    toast(t('Request canceled'), undo);
  });
}

export function exportIt() {
  const db0 = getDb();
  if (!mcFull(getMe())) return Promise.resolve(false);
  const name = (id: PersonId | null) => db0.people.find((p) => p.id === id)?.name ?? '';
  downloadCsv(
    `dwdg-mcit-it-${today()}.csv`,
    ['id', 'title', 'type', 'service', 'requester_unit', 'owner', 'priority', 'state', 'opened', 'resolved'],
    mcitOf(db0).it.map((x) => {
      const a = accOf(db0, x.service);
      return [
        x.id,
        x.title,
        x.type,
        a && !a.hidden ? a.service : '',
        x.unit ?? '',
        name(x.owner),
        x.priority ?? '',
        x.stage,
        x.createdAt,
        x.resolution?.at ?? '',
      ];
    }),
  );
  return act(({ db, toast }) => {
    logChange(db, MC, 'exported IT requests', tgt('it-requests', t('Requests'), 'it-requests'));
    toast(t('IT requests exported. Notes and credentials are never included.'));
  });
}

// ---------- accounts register ----------
/** "Request access" opens a new IT request with the account already chosen (the draft is prefilled). */
export function requestAccess(accId: string) {
  const m = getMe();
  const a = accOf(getDb(), accId);
  if (!m || !a) return Promise.resolve(false);
  return act(({ db }) => {
    const s = mcitDraft(db);
    const mine = (s.drafts[m.id] ??= {});
    mine.it = {
      type: 'access',
      service: a.id,
      title: t('Access to {s}', { s: a.service }),
      expected: t('I can use {s} for my work.', { s: a.service }),
      _at: nowStamp(),
    };
  }).then((ok) => {
    if (ok) go('it-requests/new/it');
    return ok;
  });
}

const mayCustody = (db: Workspace, id: PersonId | undefined) =>
  mg(db, 'custody', id) || !!db.people.find((p) => p.id === id)?.admin;

export function verifyCustodian(id: string) {
  const m = getMe();
  const a0 = accOf(getDb(), id);
  if (!m || !a0 || !mayCustody(getDb(), m.id)) return Promise.resolve(false);
  const prev = { verifiedBy: a0.verifiedBy, verifiedAt: a0.verifiedAt };
  const undo: UndoRecipe = ({ db }) => {
    const a = mcitDraft(db).accounts.find((x) => x.id === id);
    if (a) Object.assign(a, prev);
    logChange(db, MC, 'undid a custodian confirmation on', accLink(a0));
  };
  return act(({ db, toast }) => {
    const a = mcitDraft(db).accounts.find((x) => x.id === id);
    if (!a) return;
    a.verifiedBy = m.id;
    a.verifiedAt = today();
    logChange(db, MC, 'confirmed the custodian of', accLink(a));
    toast(t('Custodian confirmed today'), undo);
  });
}

/** The handover note is read in the form only: no password or code is copied into the record. */
export function changeCustodian(id: string, who: PersonId) {
  const m = getMe();
  const a0 = accOf(getDb(), id);
  if (!m || !a0 || !mayCustody(getDb(), m.id)) return Promise.resolve(false);
  const prev = { custodian: a0.custodian, verifiedBy: a0.verifiedBy, verifiedAt: a0.verifiedAt };
  const undo: UndoRecipe = ({ db }) => {
    const a = mcitDraft(db).accounts.find((x) => x.id === id);
    if (a) Object.assign(a, prev);
    logChange(db, MC, 'undid a custodian change on', accLink(a0));
  };
  return act(({ db, ui, toast }) => {
    const a = mcitDraft(db).accounts.find((x) => x.id === id);
    if (!a) return;
    a.custodian = who;
    a.verifiedBy = m.id;
    a.verifiedAt = today();
    logChange(
      db,
      MC,
      'changed the custodian of',
      accLink(a),
      prev.custodian ? (db.people.find((p) => p.id === prev.custodian)?.name ?? '') : 'Unknown',
      db.people.find((p) => p.id === who)?.name ?? '',
    );
    upd(db, who, 'mc-custody', a.service, 'accounts-register');
    ui.form = null;
    toast(t('Custodian changed. Verify ownership in the provider too.'), undo);
  });
}
