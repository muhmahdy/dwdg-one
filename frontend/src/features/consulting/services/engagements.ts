/* Consulting engagement actions: start decision, project roles, scope proposals and decisions, deliverables with versions,
   review, readiness, delivery and the client's response, client updates, risks and blockers, closure, and the export text.
   Approved internally, delivered and accepted by the client are three separate records. From divisions/div-ee-cons.js. */
import { logChange, notify } from '@/lib/workspace/feed';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { addDays, nowStamp, today } from '@/lib/time';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import { registerUpdateText } from '@/features/updates/services/update-text';
import {
  CHANNEL,
  CONS,
  activeIds,
  branchOf,
  director,
  eeDraft,
  oppOf,
  type Channel,
} from '@/features/external/services/ee-data';
import { addTaskDraft } from '@/features/work/services/task-actions';
import { projOf, taskOf } from '@/features/work/services/selectors';
import {
  consDraft,
  type Article,
  type ClientUpdate,
  type Deliverable,
  type EngRisk,
  type Level,
  type ScopeVersion,
} from './cons-data';
import {
  DLV,
  canRunEng,
  consCD,
  dlvOf,
  dlvState,
  engOf,
  gaps,
  isPL,
  isPM,
  isStale,
  latest,
  projBlk,
  projDlv,
  projOpenTasks,
  ready,
  scopeNow,
  scopeV,
  type LaneId,
  LANE,
} from './cons-rules';
import type { Draft } from 'immer';
import type { DateStr, EntityRef, PersonId, Workspace } from '@/types/workspace';

registerUpdateText({
  'cons-dlv-review': '{who} sent a deliverable for your review',
  'cons-dlv-ok': '{who} approved your deliverable',
  'cons-dlv-ret': '{who} asked for changes to your deliverable',
  'cons-dlv-owner': '{who} made you the owner of a deliverable',
  'cons-scope': '{who} asked you to decide a scope change',
  'cons-scope-ok': '{who} approved your scope change',
  'cons-scope-no': '{who} rejected your scope change',
  'cons-stale': '{who} changed the scope; your approval is stale',
  'cons-role': '{who} gave you a role on an engagement',
  'cons-delivered': '{who} recorded a delivery to your client',
  'cons-duty': '{who} handed a duty to you',
});

const link = (type: string, id: string, name: string, h: string): EntityRef => ({ type, id, name, h });
export const engLink = (p: { id: string; name: string }) => link('cons', p.id, p.name, `engagements/${p.id}`);
const dlvLink = (d: Deliverable) => link('cons', d.id, d.title, `engagements/${d.project}/${d.id}`);
const upd = (db: Draft<Workspace>, to: PersonId | null | undefined, type: string, title: string, h: string) => {
  notify(db, to, type, { type: 'link', id: h, h, name: title });
};
const find = (db: Draft<Workspace>, id: string) => consDraft(db).dlv.find((d) => d.id === id);
const engD = (db: Draft<Workspace>, pid: string) => consDraft(db).eng[pid];
const projD = (db: Draft<Workspace>, pid: string) => db.projects.find((p) => p.id === pid);
const changed = (db: Draft<Workspace>, p: { id: string; name: string }, verb: string) => {
  logChange(db, CONS, verb, engLink(p));
};

// ---------- lane, start decision, roles ----------
export function setLane(pid: string, lane: LaneId | null) {
  const m = getMe();
  const db0 = getDb();
  const p0 = projOf(db0, pid);
  const prev = engOf(db0, pid)?.lane ?? null;
  if (!p0 || !canRunEng(p0, m) || prev === lane) return Promise.resolve(false);
  const lbl = (l: string | null) => (l && l in LANE ? t(LANE[l as LaneId]) : t('Not set'));
  return act(({ db, toast }) => {
    const e = engD(db, pid);
    const p = projD(db, pid);
    if (!e || !p) return;
    e.lane = lane;
    logChange(db, CONS, 'set the delivery lane of', engLink(p), lbl(prev), lbl(lane));
    toast(t('Delivery lane saved'), ({ db: u }) => {
      const x = engD(u, pid);
      if (x) x.lane = prev;
    });
  });
}

export function recordStart(pid: string, note: string) {
  const m = getMe();
  const db0 = getDb();
  const p0 = projOf(db0, pid);
  const e0 = engOf(db0, pid);
  if (!m || !p0 || !e0 || !consCD(m) || gaps(p0, e0).some((z) => z !== 'Start decision')) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const e = engD(db, pid);
    const p = projD(db, pid);
    if (!e || !p) return;
    e.start = { by: m.id, at: nowStamp(), note };
    changed(db, p, 'recorded the start decision for');
    ui.insp = null;
    toast(t('Start decision recorded'), ({ db: u }) => {
      const x = engD(u, pid);
      if (x) x.start = null;
      changed(u, p, 'removed the start decision for');
    });
  });
}

export interface Roles {
  pl: PersonId | null;
  pm: PersonId | null;
  reviewer: PersonId | null;
  clientOwner: PersonId | null;
}

export function saveRoles(pid: string, r: Roles) {
  const m = getMe();
  const db0 = getDb();
  const p0 = projOf(db0, pid);
  const e0 = engOf(db0, pid);
  if (!p0 || !e0 || !consCD(m)) return Promise.resolve(false);
  const prev = { lead: p0.lead, pm: p0.pm, reviewer: e0.reviewer, clientOwner: e0.clientOwner };
  return act(({ db, ui, toast }) => {
    const e = engD(db, pid);
    const p = projD(db, pid);
    if (!e || !p) return;
    p.lead = r.pl;
    p.pm = r.pm;
    e.reviewer = r.reviewer;
    e.clientOwner = r.clientOwner;
    [
      [r.pl, prev.lead],
      [r.pm, prev.pm],
      [r.reviewer, prev.reviewer],
      [r.clientOwner, prev.clientOwner],
    ].forEach(([n, o]) => {
      if (n && n !== o) upd(db, n, 'cons-role', p.name, `engagements/${p.id}`);
    });
    changed(db, p, 'changed roles on');
    ui.insp = null;
    toast(t('Roles saved'), ({ db: u }) => {
      const x = engD(u, pid);
      const px = projD(u, pid);
      if (!x || !px) return;
      px.lead = prev.lead;
      px.pm = prev.pm;
      x.reviewer = prev.reviewer;
      x.clientOwner = prev.clientOwner;
      changed(u, px, 'changed roles on');
    });
  });
}

// ---------- scope ----------
export function proposeScope(pid: string, f: { change: string; reason: string; impact: string; affects: string[] }) {
  const m = getMe();
  const db0 = getDb();
  const p0 = projOf(db0, pid);
  const e0 = engOf(db0, pid);
  if (!m || !p0 || !e0 || !canRunEng(p0, m)) return Promise.resolve(false);
  const s: ScopeVersion = {
    v: Math.max(0, ...e0.scope.map((z) => z.v)) + 1,
    change: f.change,
    reason: f.reason,
    impact: f.impact,
    state: 'proposed',
    by: m.id,
    at: nowStamp(),
    decidedBy: null,
    decidedAt: null,
    affects: f.affects,
  };
  return act(({ db, ui, toast }) => {
    const e = engD(db, pid);
    const p = projD(db, pid);
    if (!e || !p) return;
    e.scope.push(s);
    changed(db, p, 'proposed a scope change for');
    activeIds(
      db,
      (z) =>
        z.div === CONS && (z.role === 'director' || z.role === 'vp' || z.role === 'president' || branchOf(z) === 'pa'),
    ).forEach((z) => {
      upd(db, z, 'cons-scope', `${p.name}, ${t('scope version {v}', { v: s.v })}`, `engagements/${p.id}`);
    });
    ui.insp = null;
    toast(t('Scope change sent for decision'), ({ db: u }) => {
      const x = engD(u, pid);
      if (x) x.scope = x.scope.filter((z) => z.v !== s.v);
      changed(u, p, 'withdrew a scope change for');
    });
  });
}

export function decideScope(pid: string, v: number, choice: 'approved' | 'rejected', why: string) {
  const m = getMe();
  const db0 = getDb();
  const p0 = projOf(db0, pid);
  const e0 = engOf(db0, pid);
  const s0 = e0?.scope.find((z) => z.v === v);
  if (!m || !p0 || !e0 || s0?.state !== 'proposed' || s0.by === m.id) return Promise.resolve(false);
  const prev = structuredClone(s0);
  const base = scopeNow(e0);
  return act(({ db, ui, toast }) => {
    const e = engD(db, pid);
    const p = projD(db, pid);
    const s = e?.scope.find((z) => z.v === v);
    if (!e || !p || !s) return;
    s.state = choice;
    s.decidedBy = m.id;
    s.decidedAt = nowStamp();
    s.rationale = why;
    if (choice === 'approved' && s.change) {
      s.goal = base?.goal ?? p.goal;
      s.in = [...(base?.in ?? []), s.change];
      s.out = base?.out ?? [];
      s.criteria = base?.criteria ?? '';
    }
    changed(db, p, choice === 'approved' ? 'approved a scope change for' : 'rejected a scope change for');
    upd(db, s.by, choice === 'approved' ? 'cons-scope-ok' : 'cons-scope-no', p.name, `engagements/${p.id}`);
    if (choice === 'approved')
      s.affects.forEach((id) => {
        const d = find(db, id);
        if (d && isStale(d, e)) upd(db, d.owner, 'cons-stale', d.title, `engagements/${p.id}/${d.id}`);
      });
    ui.form = null;
    toast(
      choice === 'approved'
        ? t('Scope version {v} approved', { v })
        : t('Scope change rejected. The current scope stays.'),
      ({ db: u }) => {
        const x = engD(u, pid)?.scope.find((z) => z.v === v);
        if (!x) return;
        Object.assign(x, prev);
        if (!prev.rationale) delete x.rationale;
        if (!prev.goal) {
          delete x.goal;
          delete x.in;
          delete x.out;
          delete x.criteria;
        }
        changed(u, p, 'reopened a scope change for');
      },
    );
  });
}

// ---------- deliverables ----------
export function addDeliverable(pid: string, f: { title: string; owner: PersonId; criteria: string[] }) {
  const m = getMe();
  const p0 = projOf(getDb(), pid);
  if (!m || !p0 || !canRunEng(p0, m)) return Promise.resolve(false);
  const d: Deliverable = {
    id: uid('dl-'),
    project: pid,
    title: f.title,
    owner: f.owner,
    ms: null,
    criteria: f.criteria,
    by: m.id,
    at: nowStamp(),
    versions: [],
    delivery: null,
    client: null,
    waiver: null,
  };
  return act(({ db, ui, toast }) => {
    const p = projD(db, pid);
    if (!p) return;
    consDraft(db).dlv.push(d);
    changed(db, p, 'added a deliverable to');
    if (d.owner !== m.id) upd(db, d.owner, 'cons-dlv-owner', d.title, `engagements/${pid}/${d.id}`);
    ui.insp = { type: 'cons-dlv', id: d.id };
    toast(t('Deliverable added'), ({ db: u, ui: x }) => {
      const s = consDraft(u);
      s.dlv = s.dlv.filter((z) => z.id !== d.id);
      changed(u, p, 'removed a deliverable from');
      x.insp = null;
    });
  });
}

export function submitVersion(id: string, f: { note: string; url: string }) {
  const m = getMe();
  const d0 = dlvOf(getDb(), id);
  const e0 = engOf(getDb(), d0?.project);
  if (!m || !d0 || !e0) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const d = find(db, id);
    const e = d && engD(db, d.project);
    if (!d || !e) return;
    const v = {
      v: d.versions.length + 1,
      by: m.id,
      at: nowStamp(),
      url: f.url,
      note: f.note,
      scopeV: scopeV(e),
      review: null,
    };
    d.versions.push(v);
    logChange(
      db,
      CONS,
      'submitted a version of',
      dlvLink(d),
      v.v > 1 ? t('Version {v}', { v: v.v - 1 }) : null,
      t('Version {v}', { v: v.v }),
    );
    if (e.reviewer)
      upd(
        db,
        e.reviewer,
        'cons-dlv-review',
        `${d.title}, ${t('version {v}', { v: v.v })}`,
        `engagements/${d.project}/${d.id}`,
      );
    ui.form = null;
    toast(t('Version {v} submitted', { v: v.v }), ({ db: u }) => {
      const x = find(u, id);
      if (!x) return;
      x.versions = x.versions.filter((z) => z.v !== v.v);
      logChange(u, CONS, 'withdrew a version of', dlvLink(x));
    });
  });
}

/** Requested changes become exactly one linked revision task (consulting_revision, S055 acceptance 2). */
export function reviewVersion(id: string, choice: 'approved' | 'changes', note: string) {
  const m = getMe();
  const db0 = getDb();
  const d0 = dlvOf(db0, id);
  const e0 = engOf(db0, d0?.project);
  const l0 = d0 && latest(d0);
  if (!m || !d0 || !e0 || !l0 || l0.review || e0.reviewer !== m.id || l0.by === m.id || d0.owner === m.id)
    return Promise.resolve(false);
  let taskId: string | null = null;
  return act(({ db, ui, toast }) => {
    const d = find(db, id);
    const l = d && latest(d);
    if (!d || !l) return;
    if (choice === 'changes') {
      const task = addTaskDraft(db, t('Revise {t}: version {v}', { t: d.title, v: l.v }), {
        owner: d.owner,
        due: addDays(today(), 3),
        project: d.project,
        div: CONS,
        notes: note,
      });
      taskId = task?.id ?? null;
    }
    l.review = { choice, by: m.id, at: nowStamp(), note, task: taskId };
    logChange(
      db,
      CONS,
      choice === 'approved' ? 'approved' : 'requested changes on',
      dlvLink(d),
      null,
      t('Version {v}', { v: l.v }),
    );
    upd(
      db,
      d.owner,
      choice === 'approved' ? 'cons-dlv-ok' : 'cons-dlv-ret',
      `${d.title}, ${t('version {v}', { v: l.v })}`,
      `engagements/${d.project}/${d.id}`,
    );
    ui.form = null;
    toast(
      choice === 'approved'
        ? t('Version {v} approved', { v: l.v })
        : t('Changes requested. One revision task was created for {who}.', {
            who: db.people.find((x) => x.id === d.owner)?.first ?? '',
          }),
      ({ db: u }) => {
        const x = find(u, id);
        const lx = x && latest(x);
        if (!x || !lx) return;
        lx.review = null;
        if (taskId) {
          const tk = u.tasks.find((z) => z.id === taskId);
          if (tk) tk.trashed = true;
        }
        logChange(u, CONS, 'reopened the review of', dlvLink(x));
      },
    );
  });
}

export function confirmCompleteness(id: string) {
  const m = getMe();
  const db0 = getDb();
  const d0 = dlvOf(db0, id);
  const p0 = d0 && projOf(db0, d0.project);
  const l0 = d0 && latest(d0);
  if (!m || !d0 || !p0 || !l0 || !isPM(p0, m)) return Promise.resolve(false);
  const prev = engOf(db0, d0.project)?.pmCheck[id];
  return act(({ db, toast }) => {
    const d = find(db, id);
    const e = d && engD(db, d.project);
    const l = d && latest(d);
    if (!d || !e || !l) return;
    e.pmCheck[id] = { v: l.v, by: m.id, at: nowStamp() };
    logChange(db, CONS, 'confirmed completeness of', dlvLink(d));
    toast(t('Completeness confirmed for version {v}', { v: l.v }), ({ db: u }) => {
      const x = engD(u, d.project);
      if (!x) return;
      if (prev) x.pmCheck[id] = prev;
      else x.pmCheck = Object.fromEntries(Object.entries(x.pmCheck).filter(([k]) => k !== id));
    });
  });
}

export function waiveChecks(id: string, reason: string) {
  const m = getMe();
  const d0 = dlvOf(getDb(), id);
  if (!m || !d0 || !director(m, CONS)) return Promise.resolve(false);
  return act(({ db, ui, toast }) => {
    const d = find(db, id);
    const l = d && latest(d);
    if (!d || !l) return;
    d.waiver = { v: l.v, by: m.id, at: nowStamp(), reason };
    logChange(db, CONS, 'waived readiness checks on', dlvLink(d));
    ui.form = null;
    toast(t('Checks waived'), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.waiver = null;
    });
  });
}

export function recordDelivery(id: string, f: { date: DateStr; channel: Channel; evidence: string }) {
  const m = getMe();
  const db0 = getDb();
  const d0 = dlvOf(db0, id);
  if (!m || !d0) return Promise.resolve(false);
  if (!ready(db0, d0)) {
    showToast(t('Every check must pass, or be waived, first.'));
    return Promise.resolve(false);
  }
  const prev = d0.delivery;
  return act(({ db, ui, toast }) => {
    const d = find(db, id);
    const e = d && engD(db, d.project);
    const l = d && latest(d);
    if (!d || !e || !l) return;
    d.delivery = { v: l.v, date: f.date, channel: f.channel, evidence: f.evidence, by: m.id, at: nowStamp() };
    logChange(db, CONS, 'recorded delivery of', dlvLink(d), null, t('Version {v}', { v: l.v }));
    const o = e.opp ? oppOf(db, e.opp) : undefined;
    if (o) upd(db, o.pic, 'cons-delivered', d.title, `engagements/${d.project}/${d.id}`);
    ui.form = null;
    toast(t('Delivery recorded. Client acceptance is still a separate record.'), ({ db: u }) => {
      const x = find(u, id);
      if (!x) return;
      x.delivery = prev;
      logChange(u, CONS, 'removed the delivery record of', dlvLink(x));
    });
  });
}

export function recordClient(
  id: string,
  choice: 'accepted' | 'rejected',
  f: { date: DateStr; note: string; next: string },
) {
  const m = getMe();
  const db0 = getDb();
  const d0 = dlvOf(db0, id);
  const p0 = d0 && projOf(db0, d0.project);
  if (!m || !d0 || !p0 || !d0.delivery) return Promise.resolve(false);
  const prev = d0.client;
  let taskId: string | null = null;
  return act(({ db, ui, toast }) => {
    const d = find(db, id);
    const p = d && projD(db, d.project);
    if (!d || !p || !d.delivery) return;
    if (choice === 'rejected' && f.next) {
      const task = addTaskDraft(db, f.next, {
        owner: p.pm ?? m.id,
        due: addDays(today(), 3),
        project: p.id,
        div: CONS,
      });
      taskId = task?.id ?? null;
    }
    d.client = { choice, v: d.delivery.v, date: f.date, note: f.note, next: taskId, by: m.id, at: nowStamp() };
    logChange(
      db,
      CONS,
      choice === 'accepted' ? 'recorded client acceptance of' : 'recorded client rejection of',
      dlvLink(d),
    );
    ui.form = null;
    toast(
      choice === 'accepted'
        ? t('Client acceptance recorded')
        : t('Client rejection recorded. The deliverable stays unresolved.'),
      ({ db: u }) => {
        const x = find(u, id);
        if (!x) return;
        x.client = prev;
        if (taskId) {
          const tk = u.tasks.find((z) => z.id === taskId);
          if (tk) tk.trashed = true;
        }
      },
    );
  });
}

// ---------- client updates, risks, blockers ----------
export function addClientUpdate(
  pid: string,
  f: {
    date: DateStr;
    channel: Channel;
    summary: string;
    version: string | null;
    feedback: string;
    pending: string;
    next: { title: string; owner: PersonId; due: DateStr | null } | null;
  },
) {
  const m = getMe();
  const p0 = projOf(getDb(), pid);
  if (!m || !p0 || !canRunEng(p0, m)) return Promise.resolve(false);
  const u: ClientUpdate = {
    id: uid('cu-'),
    date: f.date,
    channel: f.channel,
    summary: f.summary,
    version: f.version,
    feedback: f.feedback,
    pending: f.pending,
    next: null,
    by: m.id,
    at: nowStamp(),
  };
  let taskId: string | null = null;
  return act(({ db, ui, toast }) => {
    const e = engD(db, pid);
    const p = projD(db, pid);
    if (!e || !p) return;
    if (f.next) {
      const task = addTaskDraft(db, f.next.title, { owner: f.next.owner, due: f.next.due, project: pid, div: CONS });
      taskId = task?.id ?? null;
    }
    u.next = taskId;
    e.updates.push(u);
    changed(db, p, 'recorded a client update for');
    ui.insp = null;
    toast(t('Client update recorded'), ({ db: x }) => {
      const ex = engD(x, pid);
      if (ex) ex.updates = ex.updates.filter((z) => z.id !== u.id);
      if (taskId) {
        const tk = x.tasks.find((z) => z.id === taskId);
        if (tk) tk.trashed = true;
      }
    });
  });
}

export function addRisk(
  pid: string,
  f: {
    title: string;
    impact: Level | null;
    likelihood: Level | null;
    mitigation: string;
    owner: PersonId;
    trigger: string;
    review: DateStr | null;
  },
) {
  const m = getMe();
  const p0 = projOf(getDb(), pid);
  if (!m || !p0 || !canRunEng(p0, m)) return Promise.resolve(false);
  const r = { id: uid('rk-'), ...f, blocker: null, by: m.id, at: nowStamp() } as EngRisk;
  return act(({ db, ui, toast }) => {
    const e = engD(db, pid);
    const p = projD(db, pid);
    if (!e || !p) return;
    e.risks.push(r);
    changed(db, p, 'added a risk to');
    ui.insp = null;
    toast(t('Risk added'), ({ db: u }) => {
      const x = engD(u, pid);
      if (x) x.risks = x.risks.filter((z) => z.id !== r.id);
    });
  });
}

export function raiseBlocker(pid: string, rid: string, f: { task: string; action: string }) {
  const m = getMe();
  const db0 = getDb();
  const r0 = engOf(db0, pid)?.risks.find((z) => z.id === rid);
  if (!m || !r0) return Promise.resolve(false);
  const b = {
    id: uid('b'),
    task: f.task,
    project: pid,
    text: r0.title,
    owner: r0.owner ?? m.id,
    severity: r0.impact === 'high' ? 'high' : r0.impact === 'low' ? 'low' : 'medium',
    action: f.action,
    state: 'open',
    openedBy: m.id,
    openedAt: nowStamp(),
    resolution: '',
    resolvedAt: null,
  } as const;
  return act(({ db, ui, toast }) => {
    const r = engD(db, pid)?.risks.find((z) => z.id === rid);
    if (!r) return;
    db.blockers.push({ ...b });
    r.blocker = b.id;
    logChange(db, CONS, 'raised a blocker on', { type: 'task', id: f.task, name: taskOf(db, f.task)?.title ?? '' });
    notify(db, b.owner, 'blocker', { type: 'task', id: f.task });
    ui.insp = null;
    toast(t('Blocker raised on one task'), ({ db: u }) => {
      u.blockers = u.blockers.filter((z) => z.id !== b.id);
      const x = engD(u, pid)?.risks.find((z) => z.id === rid);
      if (x) x.blocker = null;
    });
  });
}

// ---------- closure and export ----------
/** Closure (consulting_close, S057): outcomes evidenced, blockers resolved, and every legal or finance duty resolved or handed to a named owner. */
export function closeEngagement(
  pid: string,
  f: { outcome: string; lessons: string; toKnowledge: boolean; duties: Record<string, string> },
) {
  const m = getMe();
  const db0 = getDb();
  const p0 = projOf(db0, pid);
  const e0 = engOf(db0, pid);
  if (!m || !p0 || !e0 || !canRunEng(p0, m)) return Promise.resolve(false);
  if (projDlv(db0, pid).some((d) => dlvState(db0, d) !== 'accepted') || projBlk(db0, pid).length)
    return Promise.resolve(false);
  const artId = f.lessons && f.toKnowledge ? uid('kn-') : null;
  return act(({ db, ui, toast }) => {
    const e = engD(db, pid);
    const p = projD(db, pid);
    if (!e || !p) return;
    const prev = { obl: structuredClone(e.obligations), stage: p.stage };
    e.obligations.forEach((ob) => {
      const v = f.duties[ob.id] ?? '';
      ob.resolution =
        v === 'resolved'
          ? { kind: 'resolved', by: m.id, at: nowStamp() }
          : { kind: 'handed', to: v.slice(3), by: m.id, at: nowStamp() };
      if (ob.resolution.to) upd(db, ob.resolution.to, 'cons-duty', ob.label, ob.h);
    });
    let art: Article | null = null;
    if (artId) {
      const owner = activeIds(db, (z) => branchOf(z) === 'kn')[0] ?? m.id;
      art = {
        id: artId,
        title: t('Lessons from {p}', { p: p.name }),
        kind: 'lesson',
        topics: [],
        audience: 'cons',
        named: [],
        author: m.id,
        owner,
        source: t('Retrospective of {p}', { p: p.name }),
        perm: t('Sanitized before review. No client names, files or links.'),
        nextReview: null,
        at: nowStamp(),
        versions: [
          {
            v: 1,
            by: m.id,
            at: nowStamp(),
            note: f.lessons,
            url: '',
            state: 'review',
            reviewer: null,
            reviewedAt: null,
            reviewNote: '',
          },
        ],
        uses: [],
        reports: [],
      };
      consDraft(db).kn.push(art);
      upd(db, art.owner, 'kn-review', art.title, `knowledge/${art.id}`);
    }
    e.closure = { by: m.id, at: nowStamp(), outcome: f.outcome, lessons: f.lessons, kn: art?.id ?? null };
    p.stage = 'completed';
    const h = e.handoff ? eeDraft(db).handoffs.find((x) => x.id === e.handoff) : undefined;
    const closedHandoff = !!h && h.state === 'accepted';
    if (h && closedHandoff) {
      h.state = 'fulfilled';
      h.history.push({ state: 'fulfilled', by: m.id, at: nowStamp(), note: t('Engagement closed') });
    }
    changed(db, p, 'closed engagement');
    ui.insp = null;
    toast(t('Engagement closed'), ({ db: u }) => {
      const x = engD(u, pid);
      const px = projD(u, pid);
      if (!x || !px) return;
      x.closure = null;
      x.obligations = prev.obl;
      px.stage = prev.stage;
      if (artId) {
        const s = consDraft(u);
        s.kn = s.kn.filter((z) => z.id !== artId);
      }
      const hx = x.handoff ? eeDraft(u).handoffs.find((y) => y.id === x.handoff) : undefined;
      if (hx && closedHandoff && hx.state === 'fulfilled') {
        hx.state = 'accepted';
        hx.history.push({ state: 'accepted', by: m.id, at: nowStamp(), note: t('Undone') });
      }
      changed(u, px, 'reopened engagement');
    });
  });
}

export function markClientReportReviewed(pid: string) {
  const m = getMe();
  const p0 = projOf(getDb(), pid);
  if (!m || !p0 || !(isPL(p0, m) || director(m, CONS))) return Promise.resolve(false);
  return act(({ db, toast }) => {
    const e = engD(db, pid);
    const p = projD(db, pid);
    if (!e || !p) return;
    e.report = { by: m.id, at: nowStamp() };
    changed(db, p, 'reviewed the client report for');
    toast(t('Client report marked reviewed'), ({ db: u }) => {
      const x = engD(u, pid);
      if (x) x.report = null;
    });
  });
}

/** The text the Export panel copies. The internal summary and the client report differ by field (consulting_export). */
export function exportText(db: Workspace, pid: string, kind: 'internal' | 'client') {
  const p = projOf(db, pid);
  const e = engOf(db, pid);
  if (!p || !e) return '';
  const who = (id: PersonId | null | undefined) => db.people.find((x) => x.id === id)?.name ?? '';
  const s = scopeNow(e);
  const lines = [
    p.name,
    `${t('Scope')}: ${s ? `v${s.v}. ${s.goal ?? ''}` : t('No approved scope')}`,
    `${t('PL')}: ${who(p.lead)}, ${t('PM')}: ${who(p.pm)}, ${t('Reviewer')}: ${who(e.reviewer)}`,
  ];
  projDlv(db, pid).forEach((d) => {
    const l = latest(d);
    lines.push(`- ${d.title}${l ? ` v${l.v}` : ''}: ${t(DLV[dlvState(db, d)][0])}`);
  });
  e.updates.forEach((u) =>
    lines.push(`${u.date} ${t((CHANNEL as Record<string, string | undefined>)[u.channel] ?? 'Other')}: ${u.summary}`),
  );
  if (kind === 'internal') {
    projOpenTasks(db, pid).forEach((x) => {
      lines.push(
        `[${t('Task')}] ${x.title} (${db.people.find((y) => y.id === x.owner)?.first ?? ''}${x.due ? `, ${x.due}` : ''})`,
      );
    });
    projBlk(db, pid).forEach((b) => lines.push(`[${t('Blocker')}] ${b.text}`));
    e.risks.forEach((r) => lines.push(`[${t('Risk')}] ${r.title}`));
  }
  return lines.join('\n');
}
