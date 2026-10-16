/* Records saved by earlier versions can lack fields added later (the prototype read them with `|| []`). Filling them once
   when the workspace loads lets the rest of the code treat the Task type as complete. */
import type { Task, Workspace } from '@/types/workspace';

const taskDefaults = (): Pick<
  Task,
  | 'start'
  | 'deps'
  | 'assignees'
  | 'parent'
  | 'inWbs'
  | 'phase'
  | 'remarks'
  | 'order'
  | 'icon'
  | 'reactions'
  | 'links'
  | 'mentions'
> => ({
  start: null,
  deps: [],
  assignees: [],
  parent: null,
  inWbs: false,
  phase: false,
  remarks: '',
  order: null,
  icon: null,
  reactions: {},
  links: [],
  mentions: [],
});

export function withDefaults(w: Workspace): Workspace {
  const stale = w.tasks.some((x) => Object.keys(taskDefaults()).some((k) => !(k in x)));
  if (!stale) return w;
  return { ...w, tasks: w.tasks.map((x) => ({ ...taskDefaults(), ...x })) };
}
