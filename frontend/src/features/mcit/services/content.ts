/* Marketing content actions: a content item with its own executor, reviewer and dates per channel; versions reviewed one exact
   version at a time (a newer version makes an earlier approval stale); scheduling records the plan; publication is recorded per
   channel with evidence, never posted by the app. Every step adds to the item's history; Undo restores the store slice. From
   divisions/div-fnl-mcit.js ACT['mc-c-*']. */
import type { Draft } from 'immer';
import { go } from '@/app/router/navigation';
import { downloadCsv } from '@/lib/download-csv';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { addDays, fmtDT, nowStamp, today } from '@/lib/time';
import { logChange } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, type UndoRecipe } from '@/lib/workspace/transaction';
import { registerUpdateText } from '@/features/updates/services/update-text';
import { hist, tgt, upd } from '@/features/fnl/services/legal';
import { addTaskDraft } from '@/features/work/services/task-actions';
import type { DateStr, EntityRef, PersonId, Workspace } from '@/types/workspace';
import {
  CST,
  MC,
  canMakeContent,
  chName,
  cLatest,
  cmpOf,
  ctOf,
  mcFull,
  mcLead,
  mcitDraft,
  mcitOf,
  mg,
  stale,
  type ChannelId,
  type Content,
  type HistoryRow,
  type McitStore,
} from './mcit-data';

registerUpdateText({
  'mc-review': '{who} sent content for your review',
  'mc-assigned': '{who} gave you a content item',
  'mc-revise': '{who} asked for changes to your content',
  'mc-approved': '{who} approved your content',
  'mc-sched': '{who} scheduled your content',
  'mc-retry': '{who} recorded a failed publication. A retry is needed',
  'mc-date': '{who} moved a planned publication date',
  'mc-cancel': '{who} canceled a content item',
  'mc-brief': '{who} sent a content brief',
  'mc-brief-reply': '{who} answered your content brief',
  'mc-it-new': '{who} sent an IT request',
  'mc-it-assigned': '{who} assigned an IT request to you',
  'mc-it-moved': '{who} updated an IT request',
  'mc-it-info': '{who} needs information for your IT request',
  'mc-it-resolved': '{who} resolved your IT request. Is it solved?',
  'mc-it-reopened': '{who} reopened an IT request',
  'mc-custody': '{who} made you the custodian of an account',
});

// ---------- shared helpers (also used by it.ts) ----------
export const cLink = (c: { id: string; title: string }) => tgt(c.id, c.title, `content/${c.id}`);
export const iLink = (x: { id: string; title: string }) => tgt(x.id, x.title, `it-requests/${x.id}`);

/** Undo restores the MCIT slice from just before the step, appends "Undid" to the record's own history and logs it (D45). */
export function mcUndo(
  msg: string,
  link: EntityRef,
  find: (s: McitStore) => { history: HistoryRow[] } | undefined,
): UndoRecipe {
  const snap = getDb().mcit;
  const by = getMe()?.id ?? '';
  return ({ db }) => {
    const kept = find(mcitDraft(db))?.history.slice();
    db.mcit = snap;
    const r = find(mcitDraft(db));
    if (r && kept) r.history = [...kept, { by, at: nowStamp(), what: 'Undid: {m}', v: { m: msg } }];
    logChange(db, MC, 'undid a change on', link);
  };
}
export const first = (db: Workspace | Draft<Workspace>, id: PersonId | null | undefined) =>
  db.people.find((p) => p.id === id)?.first ?? '';
const contentOf = (db: Draft<Workspace>, id: string) => mcitDraft(db).content.find((x) => x.id === id);
const findContent = (id: string) => (s: McitStore) => s.content.find((x) => x.id === id);
const HHMM = /^\d{2}:\d{2}$/;
export const okTime = (s: string) => HHMM.test(s);

// ---------- create ----------
export interface NewContent {
  title: string;
  channels: ChannelId[];
  plan: DateStr;
  time: string;
  exec: PersonId;
  rev: PersonId;
  due: DateStr;
  asset: string;
  campaign: string | null;
  kind: string;
  brief: string;
  fromBrief: string | null;
}
export async function createContent(f: NewContent) {
  const m = getMe();
  if (!m || !canMakeContent(getDb(), m)) return;
  const c: Content = {
    id: uid('ct-'),
    title: f.title,
    campaign: f.campaign,
    kind: f.kind || t('Post'),
    channels: f.channels.map((ch) => ({ ch, planned: `${f.plan}T${f.time}`, pub: null, failed: null })),
    executor: f.exec,
    reviewer: f.rev,
    due: f.due,
    stage: 'idea',
    approvedV: null,
    versions: [],
    brief: f.brief,
    assets: f.asset ? [{ label: t('Asset'), url: f.asset }] : [],
    task: null,
    corrections: [],
    fromBrief: f.fromBrief,
    history: [],
    createdBy: m.id,
    createdAt: nowStamp(),
  };
  hist(c, 'Created');
  const ok = await act(({ db, toast }) => {
    const s = mcitDraft(db);
    s.content.push(c);
    logChange(db, MC, 'created content', cLink(c));
    upd(db, f.exec, 'mc-assigned', c.title, `content/${c.id}`);
    const b = f.fromBrief ? s.briefs.find((x) => x.id === f.fromBrief) : undefined;
    if (b) {
      b.state = 'accepted';
      b.content = c.id;
      b.acceptedBy = m.id;
      b.acceptedAt = nowStamp();
      upd(db, b.requester, 'mc-brief-reply', b.title, `it-requests/${b.id}`);
      if (b.unit && b.unit !== MC)
        logChange(db, b.unit, 'had a content brief accepted by MCIT', tgt(b.id, b.title, `it-requests/${b.id}`));
    }
    toast(t('Content created. {who} was told.', { who: first(db, f.exec) }));
  });
  if (ok) go(`content/${c.id}`);
}

// ---------- drafting and review ----------
export function startContent(id: string) {
  const c0 = ctOf(getDb(), id);
  const m = getMe();
  if (!m || c0?.stage !== 'idea' || !(c0.executor === m.id || mcLead(m))) return Promise.resolve(false);
  const undo = mcUndo(t('Drafting'), cLink(c0), findContent(id));
  return act(({ db, ui, toast }) => {
    const c = contentOf(db, id);
    if (!c) return;
    c.stage = 'drafting';
    hist(c, 'Drafting started');
    logChange(db, MC, 'started drafting', cLink(c), 'Idea', 'Drafting');
    ui.form = null;
    toast(t('Drafting started'), undo);
  });
}

export function sendContentVersion(id: string, f: { label: string; url: string }) {
  const c0 = ctOf(getDb(), id);
  const m = getMe();
  if (!m || c0?.executor !== m.id) return Promise.resolve(false);
  const undo = mcUndo(t('Version'), cLink(c0), findContent(id));
  return act(({ db, ui, toast }) => {
    const c = contentOf(db, id);
    if (!c) return;
    const v = (cLatest(c)?.v ?? 0) + 1;
    const prev = c.stage;
    c.versions.push({ v, label: f.label, url: f.url, by: m.id, at: nowStamp(), decision: null });
    c.stage = 'review';
    hist(
      c,
      c.approvedV
        ? 'Version {v} sent for review; the version {a} approval does not carry over'
        : 'Version {v} sent for review',
      { v, a: c.approvedV ?? 0 },
    );
    logChange(
      db,
      MC,
      c.approvedV ? 'sent a new version for review' : 'sent a version for review',
      cLink(c),
      CST[prev][0],
      'In review',
    );
    upd(db, c.reviewer, 'mc-review', `${c.title}, v${String(v)}`, `content/${c.id}`);
    ui.form = null;
    toast(
      c.approvedV
        ? t('Version {v} sent. The earlier approval is now stale.', { v })
        : t('Version {v} sent to {who}', { v, who: first(db, c.reviewer) }),
      undo,
    );
  });
}

export function decideContent(id: string, o: 'approved' | 'revision', v: number, why: string) {
  const c0 = ctOf(getDb(), id);
  const m = getMe();
  if (!m || !c0 || !mg(getDb(), 'review', m.id) || c0.stage !== 'review') return Promise.resolve(false);
  const lv0 = cLatest(c0);
  if (lv0?.v !== v) {
    return act(({ toast }) => {
      toast(t('Version {v} was replaced. Nothing was recorded; review the current version.', { v }));
    });
  }
  if (lv0.by === m.id) return Promise.resolve(false);
  const undo = mcUndo(t('Review'), cLink(c0), findContent(id));
  return act(({ db, ui, toast }) => {
    const c = contentOf(db, id);
    const lv = c ? cLatest(c) : undefined;
    if (!c || !lv) return;
    lv.decision = { kind: o, by: m.id, at: nowStamp(), reason: why };
    if (o === 'approved') {
      c.approvedV = v;
      c.stage = c.channels.some((ch) => ch.pub) ? 'scheduled' : 'approved';
      hist(c, 'Version {v} approved', { v });
    } else {
      c.stage = 'revision';
      hist(c, 'Changes requested on version {v}', { v });
      const task = addTaskDraft(db, t('Revise {t} (v{v})', { t: c.title, v }), {
        owner: c.executor,
        due: c.due && c.due >= today() ? c.due : addDays(today(), 2),
        div: MC,
        notes: why,
      });
      if (task) {
        c.revTasks = [...(c.revTasks ?? []), task.id];
        upd(db, c.executor, 'mc-revise', c.title, `content/${c.id}`);
      }
    }
    logChange(
      db,
      MC,
      o === 'approved' ? 'approved a version of' : 'requested changes on',
      cLink(c),
      'In review',
      CST[c.stage][0],
    );
    if (o === 'approved') upd(db, c.executor, 'mc-approved', `${c.title}, v${String(v)}`, `content/${c.id}`);
    ui.form = null;
    if (o === 'approved') toast(t('Version {v} approved', { v }), undo);
    else toast(t('Changes requested. A revision task went to {who}.', { who: first(db, c.executor) }));
  });
}

export function scheduleContent(id: string) {
  const c0 = ctOf(getDb(), id);
  if (!c0 || !mg(getDb(), 'publish', getMe()?.id) || c0.stage !== 'approved' || stale(c0))
    return Promise.resolve(false);
  const undo = mcUndo(t('Scheduled'), cLink(c0), findContent(id));
  return act(({ db, ui, toast }) => {
    const c = contentOf(db, id);
    if (!c) return;
    c.stage = 'scheduled';
    hist(c, 'Scheduled version {v}', { v: c.approvedV ?? 0 });
    logChange(db, MC, 'scheduled', cLink(c), 'Approved', 'Scheduled');
    upd(db, c.executor, 'mc-sched', c.title, `content/${c.id}`);
    ui.form = null;
    toast(t('Scheduled. Record each channel after it is posted.'), undo);
  });
}

// ---------- publication, failure, dates, corrections ----------
export function recordPublication(
  id: string,
  idx: number,
  f: { basis: 'url' | 'attest'; url: string; date: DateStr; time: string; note: string },
) {
  const c0 = ctOf(getDb(), id);
  const m = getMe();
  if (!m || !c0?.channels[idx] || !mg(getDb(), 'publish', m.id) || c0.channels[idx].pub) return Promise.resolve(false);
  if (stale(c0) || !c0.approvedV) {
    return act(({ toast }) => {
      toast(t('The current version is not approved. Only an approved version can be recorded as published.'));
    });
  }
  const undo = mcUndo(t('Publication'), cLink(c0), findContent(id));
  return act(({ db, ui, toast }) => {
    const c = contentOf(db, id);
    const ch = c?.channels[idx];
    if (!c || !ch) return;
    ch.pub = {
      url: f.basis === 'url' ? f.url : '',
      at: `${f.date}T${f.time}`,
      by: m.id,
      basis: f.basis,
      v: c.approvedV,
      note: f.note,
      recordedAt: nowStamp(),
    };
    ch.failed = null;
    hist(c, 'Publication recorded on {ch}', { ch: chName(ch.ch) });
    if (c.channels.every((x) => x.pub)) {
      c.stage = 'published';
      hist(c, 'Published on every channel');
    }
    logChange(db, MC, 'recorded a publication for', cLink(c), null, chName(ch.ch));
    ui.form = null;
    toast(
      c.stage === 'published'
        ? t('Published on every channel')
        : t('Recorded on {ch}. {n} channel still open.', {
            ch: chName(ch.ch),
            n: c.channels.filter((x) => !x.pub).length,
          }),
      undo,
    );
  });
}

export function recordFailure(id: string, idx: number, why: string) {
  const c0 = ctOf(getDb(), id);
  if (!c0?.channels[idx] || !mg(getDb(), 'publish', getMe()?.id)) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const c = contentOf(db, id);
    const ch = c?.channels[idx];
    if (!c || !ch) return;
    const task = addTaskDraft(db, t('Retry {t} on {ch}', { t: c.title, ch: chName(ch.ch) }), {
      owner: c.executor,
      due: addDays(today(), 1),
      div: MC,
      notes: why,
    });
    ch.failed = { reason: why, by: getMe()?.id ?? '', at: nowStamp(), task: task?.id ?? null };
    hist(c, 'Publication failed on {ch}', { ch: chName(ch.ch) });
    logChange(db, MC, 'recorded a failed publication for', cLink(c));
    upd(db, c.executor, 'mc-retry', c.title, `content/${c.id}`);
    ui.form = null;
    toast(t('Failure recorded. A follow-up task went to {who}.', { who: first(db, c.executor) }));
  });
}

export function moveChannelDate(id: string, idx: number, f: { date: DateStr; time: string; why: string }) {
  const c0 = ctOf(getDb(), id);
  if (!c0?.channels[idx] || !mg(getDb(), 'publish', getMe()?.id) || c0.channels[idx].pub) return Promise.resolve(false);
  const undo = mcUndo(t('Planned date'), cLink(c0), findContent(id));
  return act(({ db, ui, toast }) => {
    const c = contentOf(db, id);
    const ch = c?.channels[idx];
    if (!c || !ch) return;
    const from = ch.planned;
    ch.planned = `${f.date}T${f.time}`;
    hist(c, 'Planned date on {ch} moved: {r}', { ch: chName(ch.ch), r: f.why });
    logChange(db, MC, 'moved the planned date of', cLink(c), fmtDT(from), fmtDT(ch.planned));
    upd(db, c.executor, 'mc-date', c.title, `content/${c.id}`);
    upd(db, c.reviewer, 'mc-date', c.title, `content/${c.id}`);
    ui.form = null;
    toast(t('Planned date moved. Approval and history are unchanged.'), undo);
  });
}

export function recordCorrection(id: string, f: { why: string; url: string }) {
  const c0 = ctOf(getDb(), id);
  const m = getMe();
  if (!m || !c0 || !mg(getDb(), 'publish', m.id)) return Promise.resolve(false);
  const undo = mcUndo(t('Correction'), cLink(c0), findContent(id));
  return act(({ db, ui, toast }) => {
    const c = contentOf(db, id);
    if (!c) return;
    c.corrections.push({ reason: f.why, url: f.url, by: m.id, at: nowStamp() });
    hist(c, 'Correction or takedown recorded');
    logChange(db, MC, 'recorded a correction on', cLink(c));
    ui.form = null;
    toast(t('Correction recorded'), undo);
  });
}

export function cancelContent(id: string, why: string) {
  const c0 = ctOf(getDb(), id);
  const m = getMe();
  if (!m || !c0) return Promise.resolve(false);
  const undo = mcUndo(t('Canceled'), cLink(c0), findContent(id));
  return act(({ db, ui, toast }) => {
    const c = contentOf(db, id);
    if (!c) return;
    const prev = c.stage;
    c.stage = 'cancelled';
    c.cancel = { reason: why, by: m.id, at: nowStamp() };
    hist(c, 'Canceled: {r}', { r: why });
    logChange(db, MC, 'canceled', cLink(c), CST[prev][0], 'Canceled');
    upd(db, c.executor, 'mc-cancel', c.title, `content/${c.id}`);
    ui.form = null;
    toast(t('Content canceled'), undo);
  });
}

export function exportContent() {
  const db0 = getDb();
  if (!mcFull(getMe())) return Promise.resolve(false);
  const name = (id: PersonId | null) => db0.people.find((p) => p.id === id)?.name ?? '';
  downloadCsv(
    `dwdg-mcit-content-${today()}.csv`,
    [
      'id',
      'title',
      'campaign',
      'channel',
      'executor',
      'internal_due',
      'planned_publication',
      'actual_publication',
      'evidence_url',
      'approved_version',
      'latest_version',
      'state',
    ],
    mcitOf(db0).content.flatMap((c) =>
      c.channels.map((ch) => [
        c.id,
        c.title,
        cmpOf(db0, c.campaign)?.name ?? '',
        chName(ch.ch),
        name(c.executor),
        c.due ?? '',
        ch.planned,
        ch.pub ? ch.pub.at : 'not recorded',
        ch.pub ? ch.pub.url : '',
        c.approvedV ?? '',
        cLatest(c)?.v ?? '',
        c.stage,
      ]),
    ),
  );
  return act(({ db, toast }) => {
    logChange(db, MC, 'exported content records', tgt('content', t('Content'), 'content'));
    toast(t('Content exported. Planned and actual dates stay in separate columns.'));
  });
}
