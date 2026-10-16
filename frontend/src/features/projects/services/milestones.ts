/* Milestones (work_milestones): achieved only when someone records it, never because a date passed. From screens/plan.js and
   screens/work.js (ms-achieve, ms-del, ms field changes). */
import { logChange } from '@/lib/workspace/feed';
import { getMe } from '@/lib/workspace/hooks';
import { act } from '@/lib/workspace/transaction';
import { t as tr } from '@/lib/i18n';
import { nowStamp } from '@/lib/time';
import type { Milestone, Person, Workspace } from '@/types/workspace';
import { canEditProject } from './project-rules';

export const canRoadmap = (me: Person | undefined) => !!me && (me.role === 'president' || me.role === 'vp');

/** Roadmap items belong to the President and VPs; other milestones to their owner, the project lead, PM or editors. */
export function canMsEdit(db: Workspace, me: Person, m: Milestone) {
  if (m.roadmap) return canRoadmap(me);
  const p = db.projects.find((x) => x.id === m.project);
  return !!p && (m.owner === me.id || p.lead === me.id || p.pm === me.id || canEditProject(db, me, p));
}

export function achieveMilestone(id: string) {
  return act(({ db, ui, toast }) => {
    const ms = db.milestones.find((v) => v.id === id);
    const me = getMe();
    if (!ms || !me) return;
    const prev = { ...ms };
    ms.state = 'achieved';
    ms.achievedAt = nowStamp();
    ms.achievedBy = me.id;
    ui.menu = null;
    logChange(db, db.projects.find((p) => p.id === ms.project)?.div, 'achieved milestone', {
      type: 'project',
      id: ms.project,
      name: ms.title,
    });
    toast(tr('Milestone recorded as achieved'), ({ db: d }) => {
      const x = d.milestones.find((y) => y.id === id);
      if (x) Object.assign(x, prev);
    });
  });
}

export function deleteMilestone(id: string) {
  return act(({ db, ui, toast }) => {
    ui.menu = null;
    const me = getMe();
    const i = db.milestones.findIndex((v) => v.id === id);
    const m = db.milestones[i];
    if (!m || !me || !canMsEdit(db, me, m)) return;
    const saved = { ...m };
    const linked = db.tasks.filter((t) => t.milestone === id).map((t) => t.id);
    db.milestones.splice(i, 1);
    for (const t of db.tasks) if (t.milestone === id) t.milestone = null;
    if (ui.insp?.id === id) ui.insp = null;
    logChange(db, db.projects.find((p) => p.id === saved.project)?.div, 'deleted milestone', {
      type: 'project',
      id: saved.project,
      name: saved.title,
    });
    toast(tr('Milestone deleted'), ({ db: d }) => {
      d.milestones.splice(i, 0, saved);
      for (const t of d.tasks) if (linked.includes(t.id)) t.milestone = id;
    });
  });
}

/** Links a task to a milestone (it then counts toward it). */
export function linkTaskToMilestone(taskId: string, msId: string) {
  return act(({ db, toast }) => {
    const t = db.tasks.find((x) => x.id === taskId);
    const m = db.milestones.find((x) => x.id === msId);
    if (!t || !m) return;
    const prev = t.milestone;
    t.milestone = m.id;
    toast(tr('{t} now counts toward {m}', { t: t.title, m: m.title }), ({ db: d }) => {
      const x = d.tasks.find((y) => y.id === taskId);
      if (x) x.milestone = prev;
    });
  });
}
