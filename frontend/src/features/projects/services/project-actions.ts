/* Project actions (work_projects_register, work_project_lifecycle, work_milestones, work_decisions): stage changes with their
   rules, create and edit, milestones and decisions. From screens/plan.js. */
import { go } from '@/app/router/navigation';
import { canCreateProject, rank } from '@/lib/access';
import { logChange, notify } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { uid } from '@/lib/ids';
import { plural, t as tr } from '@/lib/i18n';
import { nowStamp } from '@/lib/time';
import { STAGES } from '@/components/ui/StatusBadge';
import type { DivisionId, Person, PersonId, Project, ProjectStage, Workspace } from '@/types/workspace';
import { canMsEdit } from './milestones';
import { canEditProject, projBlockers, projTasks } from './project-rules';

export const lines = (s: string[] | string | null | undefined) =>
  (Array.isArray(s) ? s : (s ?? '').split('\n')).map((v) => v.trim()).filter(Boolean);

/** Why a project cannot be completed yet: no lead, an open blocker, or a task waiting for review (work_project_lifecycle). */
export function completionBlocks(db: Workspace, p: Project): string[] {
  const out: string[] = [];
  if (!p.lead) out.push(tr('The project has no lead.'));
  const b = projBlockers(db, p).length;
  if (b) out.push(plural(b, '{n} blocker is still open.', '{n} blockers are still open.'));
  if (projTasks(db, p).some((x) => x.status === 'review')) out.push(tr('A task is still waiting for review.'));
  return out;
}

/** Whether choosing this stage needs a reason or is refused until something is resolved. */
export const stageNeedsForm = (db: Workspace, p: Project, k: ProjectStage) =>
  k === 'hold' || k === 'cancelled' || (k === 'completed' && completionBlocks(db, p).length > 0);

export function setProjectStage(id: string, k: ProjectStage, reason: string) {
  return act(({ db, ui, toast }) => {
    const p = db.projects.find((x) => x.id === id);
    if (!p || p.stage === k) return;
    const prev = { stage: p.stage, reason: p.reason };
    p.stage = k;
    p.reason = reason;
    ui.menu = null;
    ui.form = null;
    logChange(
      db,
      p.div,
      'changed stage of',
      { type: 'project', id: p.id, name: p.name },
      STAGES[prev.stage][0],
      STAGES[k][0],
    );
    toast(tr('Stage changed to {s}', { s: tr(STAGES[k][0]) }), ({ db: d }) => {
      const y = d.projects.find((x) => x.id === id);
      if (y) Object.assign(y, prev);
    });
  });
}

export interface ProjectValues {
  name: string;
  goal: string;
  scopeIn: string[];
  scopeOut: string[];
  lead: PersonId | null;
  pm: PersonId | null;
  start: string | null;
  due: string | null;
  org?: boolean;
}

/** Creates a project (resolves to its id) or saves changes to one (resolves to null). */
export async function saveProject(
  id: string | null,
  v: ProjectValues,
  extra: { stage: ProjectStage; div: DivisionId },
): Promise<string | null> {
  const out: { id: string | null } = { id: null };
  await act(({ db, ui, toast }) => {
    const me = getMe();
    if (!me) return;
    if (id) {
      const p = db.projects.find((x) => x.id === id);
      if (!p || !canEditProject(db, me, p)) return;
      const prev = { ...p };
      Object.assign(p, v);
      logChange(db, p.div, 'edited project', { type: 'project', id: p.id, name: p.name });
      ui.insp = null;
      toast(tr('Project saved'), ({ db: d }) => {
        const y = d.projects.find((x) => x.id === id);
        if (y) Object.assign(y, prev);
      });
      return;
    }
    if (!canCreateProject(me, extra.div)) {
      toast(tr('Only co-directors and above can create projects here.')); // access_project_creation_cd
      return;
    }
    const p: Project = {
      id: uid('p'),
      div: extra.div,
      stage: extra.stage,
      reason: '',
      team: [],
      org: false,
      createdBy: me.id,
      createdAt: nowStamp(),
      ...v,
    };
    db.projects.push(p);
    out.id = p.id;
    logChange(db, p.div, 'created project', { type: 'project', id: p.id, name: p.name });
    if (p.lead && p.lead !== me.id) notify(db, p.lead, 'delegated', { type: 'project', id: p.id });
    ui.insp = null;
    toast(tr('Project created'), ({ db: d }) => {
      d.projects = d.projects.filter((x) => x.id !== p.id);
    });
  });
  if (out.id) go(`projects/${out.id}`);
  return out.id;
}

export function addMilestone(projectId: string, v: { title: string; owner: PersonId; target: string | null }) {
  return act(({ db, ui, toast }) => {
    const p = db.projects.find((x) => x.id === projectId);
    if (!p) return;
    const id = uid('ms');
    db.milestones.push({
      id,
      project: p.id,
      title: v.title,
      owner: v.owner,
      target: v.target ?? '',
      state: 'active',
      achievedAt: null,
    });
    logChange(db, p.div, 'added milestone', { type: 'project', id: p.id, name: v.title });
    ui.form = null;
    toast(tr('Milestone added'), ({ db: d }) => {
      d.milestones = d.milestones.filter((x) => x.id !== id);
    });
  });
}

export type MsField = 'title' | 'target' | 'owner' | 'parent';

export function setMilestoneField(id: string, field: MsField, value: string) {
  return act(({ db, toast }) => {
    const me = getMe();
    const m = db.milestones.find((x) => x.id === id);
    if (!m || !me || !canMsEdit(db, me, m)) return;
    const p = db.projects.find((x) => x.id === m.project);
    const prev = { ...m };
    if (field === 'title') {
      const v = value.trim();
      if (!v || v === m.title) return;
      m.title = v;
    } else if (field === 'target') {
      if (!value) return;
      m.target = value;
    } else if (field === 'owner') m.owner = value;
    else m.parent = value || null;
    if (p) logChange(db, p.div, 'edited', { type: 'project', id: p.id, name: m.title });
    toast(tr('Milestone saved'), ({ db: d }) => {
      const y = d.milestones.find((x) => x.id === id);
      if (y) Object.assign(y, prev);
    });
  });
}

export function unlinkTaskFromMilestone(taskId: string) {
  return act(({ db, toast }) => {
    const t = db.tasks.find((x) => x.id === taskId);
    if (!t) return;
    const pv = t.milestone;
    t.milestone = null;
    toast(tr('Unlinked'), ({ db: d }) => {
      const y = d.tasks.find((x) => x.id === taskId);
      if (y) y.milestone = pv;
    });
  });
}

export function setRoadmap(id: string, on: boolean) {
  return act(({ db, toast }) => {
    const me = getMe();
    const m = db.milestones.find((x) => x.id === id);
    if (!m || !me || !(me.role === 'president' || me.role === 'vp')) return;
    const was = !!m.roadmap;
    m.roadmap = on;
    toast(on ? tr('Shown on the batch roadmap') : tr('Removed from the batch roadmap'), ({ db: d }) => {
      const y = d.milestones.find((x) => x.id === id);
      if (y) y.roadmap = was;
    });
  });
}

/** Answer a decision that asked for you (Approve or Reject), recorded with your name and the time. */
export function decide(id: string, result: 'approved' | 'rejected') {
  return act(({ db, toast }) => {
    const d = db.decisions.find((x) => x.id === id);
    if (!d) return;
    const prev = { ...d };
    d.state = result;
    d.decidedAt = nowStamp();
    notify(db, d.createdBy, 'decided', { type: 'decision', id: d.id });
    const p = db.projects.find((x) => x.id === d.project);
    logChange(db, p?.div ?? null, result === 'approved' ? 'approved a decision on' : 'rejected a decision on', {
      type: d.project ? 'project' : 'meeting',
      id: d.project || (d.meeting ?? ''),
      name: d.question,
    });
    toast(result === 'approved' ? tr('Approved and recorded') : tr('Rejected and recorded'), ({ db: x }) => {
      const y = x.decisions.find((v) => v.id === id);
      if (y) Object.assign(y, prev);
    });
  });
}

export function addProjectDecision(projectId: string, v: { question: string; result: string; approver: PersonId }) {
  return act(({ db, ui, toast }) => {
    const me = getMe();
    const p = db.projects.find((x) => x.id === projectId);
    if (!me || !p) return;
    const self = v.approver === me.id;
    const d = {
      id: uid('d'),
      project: p.id,
      meeting: null,
      question: v.question,
      result: v.result,
      approver: v.approver,
      state: self ? 'approved' : 'awaiting',
      decidedAt: self ? nowStamp() : null,
      createdBy: me.id,
      createdAt: nowStamp(),
    };
    db.decisions.push(d);
    if (!self) notify(db, v.approver, 'decision', { type: 'decision', id: d.id });
    logChange(db, p.div, 'recorded a decision on', { type: 'project', id: p.id, name: p.name });
    ui.form = null;
    toast(
      self
        ? tr('Decision recorded')
        : tr('Sent to {who} to decide', { who: db.people.find((x) => x.id === v.approver)?.first ?? '' }),
      ({ db: x }) => {
        x.decisions = x.decisions.filter((y) => y.id !== d.id);
      },
    );
  });
}

/** People who may lead or manage in a project's division (active, same division or Presidency). */
export const leadCandidates = (db: Workspace, div: DivisionId) =>
  db.people.filter((q) => q.status === 'active' && (q.div === div || !q.div));

export const canDecide = (p: Person) => rank(p) >= 2;
