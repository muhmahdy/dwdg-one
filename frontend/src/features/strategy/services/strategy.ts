/* Strategy & Growth rules and actions: who sees and edits an initiative, the decision packet with its stale-version guard, the
   delivery link to one canonical project, dependency requests to other units, and the outcome review. Approval never creates
   a project or sets a start date. From divisions/div-hr-sng.js. */
import { go } from '@/app/router/navigation';
import { visibleDivs, canCreateProject } from '@/lib/access';
import { t } from '@/lib/i18n';
import { uid } from '@/lib/ids';
import { nowStamp, today } from '@/lib/time';
import { logChange, notify } from '@/lib/workspace/feed';
import { getDb, getMe } from '@/lib/workspace/hooks';
import { act, showToast } from '@/lib/workspace/transaction';
import { isBoard } from '@/lib/roles';
import { registerUpdateText } from '@/features/updates/services/update-text';
import { addTaskDraft } from '@/features/work/services/task-actions';
import { DEPS, HZ, STG } from './sng-data';
import type { Draft } from 'immer';
import type { DateStr, DivisionId, EntityRef, Person, PersonId, Workspace } from '@/types/workspace';
import {
  initiativeOf,
  packetsOf,
  sngDraft,
  type DecisionPacket,
  type DepState,
  type Horizon,
  type Initiative,
  type PacketChoice,
  type PacketOption,
  type SngSource,
  type SngDep,
  type SngObservation,
  type OutcomeState,
  type SngOutcome,
  type Stage,
} from './sng-data';

registerUpdateText({
  'sng-decide': '{who} asked you to decide',
  'sng-decided': '{who} recorded a decision',
  'sng-dep': '{who} asked your unit to commit',
  'sng-dep-reply': '{who} answered a dependency request',
});

const SNG: DivisionId = 'sng';

export const canSng = (m: Person | undefined) => !!m && !isBoard(m) && visibleDivs(m).includes(SNG);
export const unitLead = (m: Person | undefined, unit: DivisionId) =>
  !!m && m.div === unit && ['director', 'codirector', 'vp', 'president'].includes(m.role);
export const canEditInitiative = (m: Person | undefined, i: Initiative) =>
  !!m && (m.admin || i.owner === m.id || i.createdBy === m.id || unitLead(m, SNG));
/** Restricted raw data stays inside SnG; others get a request-access route. */
export const canSeeSource = (m: Person | undefined, s: SngSource) => !s.restricted || m?.div === SNG;

/** Proposed decision authority (strategy_validation, open): the SnG Director for SnG-only work, the VP when other units are affected, the President for organization-wide work. */
export const defaultReviewer = (db: Workspace, i: Initiative): PersonId | undefined =>
  i.affected.length >= 5
    ? 'fadhil'
    : i.affected.length
      ? 'raka'
      : db.people.find((p) => p.div === SNG && p.role === 'director')?.id;

const inLink = (i: Initiative): EntityRef => ({ type: 'link', id: i.id, name: i.title, h: `initiatives/${i.id}` });
const pkLink = (db: Workspace, p: DecisionPacket): EntityRef => ({
  type: 'link',
  id: p.id,
  name: `${initiativeOf(db, p.initiative)?.title ?? ''}, v${p.version}`,
  h: `decisions/${p.id}`,
});
const upd = (db: Draft<Workspace>, to: PersonId | null | undefined, type: string, title: string, h: string) => {
  notify(db, to, type, { type: 'link', id: h, h, name: title });
};
const find = (db: Draft<Workspace>, id: string) => sngDraft(db).initiatives.find((x) => x.id === id);

// ---------- initiatives ----------
export interface NewInitiative {
  title: string;
  objective: string;
  problem: string;
  owner: PersonId;
  horizon: Horizon;
  affected: DivisionId[];
}

/** Creates an initiative; a retry with the same title the same day returns the existing one (flow-strategy-intake 3). */
export async function createInitiative(f: NewInitiative) {
  const m = getMe();
  const db0 = getDb();
  if (!m || !(m.div === SNG || m.admin)) {
    showToast(t('Only SnG members create initiatives.'));
    return null;
  }
  const dup = (db0.sng as { initiatives?: Initiative[] } | undefined)?.initiatives?.find(
    (x) =>
      x.title.toLowerCase() === f.title.toLowerCase() && x.createdBy === m.id && x.createdAt.slice(0, 10) === today(),
  );
  if (dup) {
    go(`initiatives/${dup.id}`);
    showToast(t('That initiative already exists.'));
    return dup.id;
  }
  const i: Initiative = {
    id: uid('in'),
    title: f.title,
    objective: f.objective,
    problem: f.problem,
    hypothesis: '',
    owner: f.owner,
    unit: SNG,
    affected: f.affected,
    horizon: f.horizon,
    stage: 'idea',
    sources: [],
    tasks: [],
    project: null,
    reviewDate: null,
    deps: [],
    metric: null,
    observations: [],
    outcome: null,
    createdBy: m.id,
    createdAt: nowStamp(),
  };
  const ok = await act(({ db, ui, toast }) => {
    sngDraft(db).initiatives.push(i);
    logChange(db, SNG, 'created initiative', inLink(i));
    ui.insp = null;
    toast(t('Initiative created'), ({ db: u }) => {
      const s = sngDraft(u);
      s.initiatives = s.initiatives.filter((v) => v.id !== i.id);
      go('initiatives');
    });
  });
  if (ok) go(`initiatives/${i.id}`);
  return ok ? i.id : null;
}

export const setHorizon = (id: string, horizon: Horizon) => {
  const m = getMe();
  return act(({ db, toast }) => {
    const i = find(db, id);
    if (!i || !canEditInitiative(m, i) || i.horizon === horizon) return;
    const prev = i.horizon;
    i.horizon = horizon;
    logChange(db, SNG, 'moved the horizon of', inLink(i), HZ[prev], HZ[horizon]);
    toast(t('Moved to {h}', { h: t(HZ[horizon]) }), ({ db: u }) => {
      const x = find(u, id);
      if (!x) return;
      x.horizon = prev;
      logChange(u, SNG, 'moved the horizon of', inLink(x), HZ[horizon], HZ[prev]);
    });
  });
};

export const setStage = (id: string, stage: Stage) => {
  const m = getMe();
  return act(({ db, toast }) => {
    const i = find(db, id);
    if (!i || !canEditInitiative(m, i)) return;
    const prev = i.stage;
    i.stage = stage;
    logChange(db, SNG, 'changed the stage of', inLink(i), STG[prev][0], STG[stage][0]);
    toast(t('Stage: {s}', { s: t(STG[stage][0]) }), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.stage = prev;
    });
  });
};

export interface NewSource {
  res: string;
  url: string;
  title: string;
  observed: DateStr | null;
  method: string;
  finding: string;
  interpretation: string;
  uncertainty: string;
  restricted: boolean;
}
export const addSource = (id: string, f: NewSource) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const i = find(db, id);
    if (!i || !m) return;
    const resName = f.res ? db.resources.find((r) => r.id === f.res)?.name : undefined;
    const s: SngSource = {
      id: uid('src'),
      kind: f.res ? 'resource' : 'link',
      res: f.res || null,
      url: f.res ? '' : f.url,
      title: f.title !== '' ? f.title : (resName ?? f.url),
      observed: f.observed,
      method: f.method,
      finding: f.finding,
      interpretation: f.interpretation,
      uncertainty: f.uncertainty,
      restricted: f.restricted,
      addedBy: m.id,
      at: nowStamp(),
    };
    i.sources.push(s);
    logChange(db, SNG, 'added a source to', inLink(i));
    ui.insp = null;
    toast(t('Source added'), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.sources = x.sources.filter((v) => v.id !== s.id);
    });
  });
};

/** An investigation task is a real task in Work; nothing is tracked twice here. */
export const addInvestigationTask = (id: string, title: string, owner: PersonId) => {
  const m = getMe();
  return act(({ db, toast }) => {
    const i = find(db, id);
    if (!i || !title.trim() || !m) return;
    const nt = addTaskDraft(db, title.trim(), { owner, div: SNG });
    if (!nt) return;
    i.tasks.push(nt.id);
    if (nt.owner !== m.id) notify(db, nt.owner, 'tadded', { type: 'task', id: nt.id });
    const tid = nt.id;
    toast(t('Task added to Work'), ({ db: u }) => {
      const tk = u.tasks.find((x) => x.id === tid);
      if (tk) tk.trashed = true;
      const x = find(u, id);
      if (x) x.tasks = x.tasks.filter((v) => v !== tid);
    });
  });
};

// ---------- decision packets ----------
export interface PacketInput {
  question: string;
  options: PacketOption[];
  recommend: number;
  assumptions: string;
  open: string;
  success: string;
  reviewer: PersonId;
}

/** Submits the next version; an older version still pending is superseded, so a decision on it can no longer be recorded. */
export async function submitPacket(initiativeId: string, f: PacketInput) {
  const m = getMe();
  const db0 = getDb();
  const i0 = initiativeOf(db0, initiativeId);
  if (!m || !i0 || !canEditInitiative(m, i0)) return null;
  const old = packetsOf(db0, i0);
  const p: DecisionPacket = {
    id: uid('pk'),
    initiative: i0.id,
    version: (old[0]?.version ?? 0) + 1,
    question: f.question,
    options: f.options,
    recommend: Math.min(f.recommend, f.options.length - 1),
    assumptions: f.assumptions,
    open: f.open,
    success: f.success,
    reviewer: f.reviewer,
    state: 'pending',
    submittedBy: m.id,
    submittedAt: nowStamp(),
    decision: null,
    createdBy: m.id,
    createdAt: nowStamp(),
  };
  const ok = await act(({ db, toast }) => {
    const i = find(db, initiativeId);
    if (!i) return;
    const s = sngDraft(db);
    const prevStates = s.packets.filter((x) => x.initiative === i.id).map((x) => [x.id, x.state] as const);
    const prevStage = i.stage;
    for (const x of s.packets) if (x.initiative === i.id && x.state === 'pending') x.state = 'superseded';
    s.packets.push(p);
    i.stage = 'pending';
    logChange(db, SNG, 'submitted a decision packet for', pkLink(db, p));
    upd(db, p.reviewer, 'sng-decide', `${i.title}, v${p.version}`, `decisions/${p.id}`);
    toast(
      t('Sent to {who} for a decision', { who: db.people.find((x) => x.id === p.reviewer)?.first ?? '' }),
      ({ db: u }) => {
        const ss = sngDraft(u);
        ss.packets = ss.packets.filter((v) => v.id !== p.id);
        for (const [id, st] of prevStates) {
          const x = ss.packets.find((v) => v.id === id);
          if (x) x.state = st;
        }
        const ix = find(u, initiativeId);
        if (ix) ix.stage = prevStage;
        go(`initiatives/${initiativeId}`);
      },
    );
  });
  if (ok) go(`decisions/${p.id}`);
  return ok ? p.id : null;
}

export interface DecisionInput {
  choice: PacketChoice;
  option: number | null;
  rationale: string;
  conditions: string;
  reviewDate: DateStr | null;
  noDate: boolean;
}

/** The decision applies only to the version on screen and only while it is still pending (flow-strategy-decision 6). */
export const decidePacket = (id: string, version: number, f: DecisionInput) => {
  const m = getMe();
  return act(({ db, toast }) => {
    const s = sngDraft(db);
    const p = s.packets.find((x) => x.id === id);
    const i = p && find(db, p.initiative);
    if (!p || !i || !m) return;
    const newest = s.packets.filter((x) => x.initiative === i.id).sort((a, b) => b.version - a.version)[0];
    if (p.state !== 'pending' || version !== p.version || newest?.id !== p.id) {
      showToast(t('This version changed. Nothing was saved; review the current version.'));
      return;
    }
    if (p.reviewer !== m.id) {
      showToast(t('Only the designated reviewer decides.'));
      return;
    }
    const prev = {
      state: p.state,
      decision: p.decision ? { ...p.decision } : null,
      stage: i.stage,
      review: i.reviewDate,
    };
    p.decision = { ...f, by: m.id, at: nowStamp() };
    p.state = f.choice;
    i.stage = f.choice;
    i.reviewDate = f.reviewDate ?? i.reviewDate;
    const verb = { approved: 'approved', hold: 'put on hold', rejected: 'rejected' }[f.choice];
    logChange(db, SNG, verb, pkLink(db, p));
    upd(db, i.owner, 'sng-decided', `${i.title}, v${p.version}`, `initiatives/${i.id}`);
    if (p.submittedBy !== i.owner)
      upd(db, p.submittedBy, 'sng-decided', `${i.title}, v${p.version}`, `initiatives/${i.id}`);
    toast(t('Decision recorded on version {v}', { v: p.version }), ({ db: u }) => {
      const x = sngDraft(u).packets.find((y) => y.id === id);
      const ix = x && find(u, x.initiative);
      if (!x || !ix) return;
      x.state = prev.state;
      x.decision = prev.decision;
      ix.stage = prev.stage;
      ix.reviewDate = prev.review;
      logChange(u, SNG, 'withdrew the decision on', pkLink(u, x));
    });
  });
};

// ---------- delivery ----------
export const linkProject = (id: string, projectId: string) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const i = find(db, id);
    const p = db.projects.find((x) => x.id === projectId);
    if (!i || !p || !canEditInitiative(m, i)) return;
    const prev = i.project;
    const prevName = prev ? db.projects.find((x) => x.id === prev)?.name : null;
    i.project = projectId;
    ui.form = null;
    logChange(db, SNG, 'linked a delivery project to', inLink(i), prevName ?? null, p.name);
    toast(t('Linked to {p}', { p: p.name }), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.project = prev;
    });
  });
};

/** Creates a project without a start date: approval never sets one. */
export const createDeliveryProject = (id: string) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const i = find(db, id);
    if (!i || !m || !canCreateProject(m, SNG)) {
      showToast(t('Only co-directors and above can create projects here.'));
      return;
    }
    const p = {
      id: uid('p'),
      name: i.title,
      div: SNG,
      stage: 'planned' as const,
      lead: i.owner,
      pm: null,
      start: null,
      due: null,
      goal: i.objective,
      scopeIn: [],
      scopeOut: [],
      reason: '',
      team: [],
      org: false,
      createdBy: m.id,
      createdAt: nowStamp(),
    };
    db.projects.push(p);
    i.project = p.id;
    ui.form = null;
    logChange(db, SNG, 'created project', { type: 'project', id: p.id, name: p.name });
    if (p.lead !== m.id) notify(db, p.lead, 'delegated', { type: 'project', id: p.id });
    toast(t('Project created without a start date'), ({ db: u }) => {
      u.projects = u.projects.filter((v) => v.id !== p.id);
      const x = find(u, id);
      if (x) x.project = null;
    });
  });
};

// ---------- dependencies ----------
export interface NewDependency {
  to: PersonId;
  action: string;
  neededBy: DateStr;
  link: string;
}

export const askUnit = (id: string, f: NewDependency) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const i = find(db, id);
    const to = db.people.find((p) => p.id === f.to);
    if (!i || !to?.div || !m) return;
    const d: SngDep = {
      id: uid('dp'),
      to: f.to,
      unit: to.div,
      action: f.action,
      neededBy: f.neededBy,
      state: 'requested',
      link: f.link ? { type: 'project', id: f.link } : null,
      by: m.id,
      at: nowStamp(),
      answeredAt: null,
      note: '',
    };
    i.deps.push(d);
    ui.form = null;
    logChange(db, SNG, 'asked another unit to commit on', inLink(i));
    upd(db, f.to, 'sng-dep', i.title, `initiatives/${i.id}`);
    toast(t('Request sent to {who}', { who: to.first }), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.deps = x.deps.filter((v) => v.id !== d.id);
    });
  });
};

/** Silence never accepts; declining has no penalty. Changes names the request in both workspaces involved. */
export const answerDependency = (initiativeId: string, depId: string, state: DepState, note: string) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const i = find(db, initiativeId);
    const d = i?.deps.find((x) => x.id === depId);
    if (!i || !d || !m) return;
    if ((state === 'accepted' || state === 'returned') && d.to !== m.id) return;
    const prev = { ...d };
    d.state = state;
    d.answeredAt ??= nowStamp();
    if (state === 'returned') d.note = note;
    ui.form = null;
    const verb = DEPS[state][0].toLowerCase();
    logChange(db, SNG, `${verb} a dependency request on`, inLink(i));
    if (d.unit !== SNG)
      logChange(db, d.unit, `${verb} a request from SnG`, {
        type: 'link',
        id: i.id,
        name: d.action,
        h: `initiatives/${i.id}`,
      });
    upd(db, d.by, 'sng-dep-reply', i.title, `initiatives/${i.id}`);
    toast(t(DEPS[state][0]), ({ db: u }) => {
      const x = find(u, initiativeId)?.deps.find((y) => y.id === depId);
      if (x) Object.assign(x, prev);
    });
  });
};

// ---------- outcome review ----------
export const recordObservation = (id: string, f: { value: string; source: string; date: DateStr }) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const i = find(db, id);
    if (!i || !m) return;
    const o: SngObservation = {
      id: uid('ob'),
      value: f.value,
      unit: i.metric?.unit ?? '',
      source: f.source,
      date: f.date,
      by: m.id,
      at: nowStamp(),
    };
    i.observations.push(o);
    ui.form = null;
    logChange(db, SNG, 'recorded an observation for', inLink(i));
    toast(t('Observation recorded'), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.observations = x.observations.filter((v) => v.id !== o.id);
    });
  });
};

export const recordOutcome = (id: string, state: OutcomeState, note: string, next: SngOutcome['next']) => {
  const m = getMe();
  return act(({ db, ui, toast }) => {
    const i = find(db, id);
    if (!i || !m) return;
    if (state === 'observed' && !i.observations.length) {
      showToast(t('Add an observation first, or record the outcome as inconclusive.'));
      return;
    }
    i.outcome = { state, note, next, by: m.id, at: nowStamp() };
    ui.form = null;
    logChange(db, SNG, 'recorded the outcome of', inLink(i));
    toast(t('Outcome recorded'), ({ db: u }) => {
      const x = find(u, id);
      if (x) x.outcome = null;
    });
  });
};
