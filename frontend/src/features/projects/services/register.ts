/* The Projects register (work_projects_register, measure-project-row): which projects a person sees under each scope, how they
   sort, and the facts shown on each row (progress, next milestone, what needs attention). Only facts from saved records, never
   a made-up health or risk score (work_blockers). From screens/plan.js. */
import { STAGE_ORDER } from '@/components/ui/StatusBadge';
import { today } from '@/lib/time';
import type { DivisionId, Person, Project, Workspace } from '@/types/workspace';
import { isDone } from '@/features/work/services/selectors';
import { jointIn } from './access';
import { ENDED, msLateOf, nextMs, projBlockers, projMs, projTasks } from './project-rules';

export type Scope = 'ws' | 'shared' | 'org' | 'all';
export type SortKey = 'stage' | 'due' | 'start' | 'name';
export const PSORT: [SortKey, string][] = [
  ['stage', 'Stage'],
  ['due', 'Target date'],
  ['start', 'Start date'],
  ['name', 'Name'],
];

export const isHigh = (m: Person | undefined) => !!m && (m.admin || m.role === 'president' || m.role === 'vp');

/** Scope tabs: this workspace, shared with it (joint work or organisation-wide projects run by another division), organisation-wide, and all divisions. */
export const scopeList = (db: Workspace, k: Scope, m: Person, w: DivisionId) =>
  db.projects.filter((p) =>
    k === 'ws'
      ? p.div === w
      : k === 'shared'
        ? p.div !== w && (jointIn(db, p, w) || p.org)
        : k === 'org'
          ? p.org
          : isHigh(m),
  );

export const sortBy = (so: SortKey): ((a: Project, b: Project) => number) => {
  switch (so) {
    case 'stage':
      return (a, b) =>
        STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage) || (a.due ?? '9').localeCompare(b.due ?? '9');
    case 'due':
      return (a, b) => (a.due ?? '9').localeCompare(b.due ?? '9') || a.name.localeCompare(b.name);
    case 'start':
      return (a, b) => (a.start ?? '9').localeCompare(b.start ?? '9') || a.name.localeCompare(b.name);
    case 'name':
      return (a, b) => a.name.localeCompare(b.name);
  }
};

export function pStats(db: Workspace, p: Project) {
  const ts = projTasks(db, p);
  return { done: ts.filter(isDone).length, total: ts.length };
}

export const isLate = (p: Project) => !!p.due && p.due < today() && !ENDED.includes(p.stage);

export function attention(db: Workspace, p: Project) {
  const blockers = projBlockers(db, p);
  return {
    blockers,
    lateMs: projMs(db, p).filter(msLateOf).length,
    lateTasks: projTasks(db, p).filter((t) => !isDone(t) && !!t.due && t.due < today()).length,
  };
}

export { nextMs };
