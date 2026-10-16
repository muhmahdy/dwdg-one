/* The generic task row (.row.trow) used outside My Work: in panels, project lists and the timeline's "No date" list.
   From screens/work.js taskRow. */
import { reactTarget } from './react-context-menu';
import { AvatarBubbles } from '@/components/shared/Avatar';
import { TaskCheck } from '@/components/ui/Checkbox';
import { State, TaskStatusMark } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import type { Task } from '@/types/workspace';
import { dueLabel } from '../services/due';
import { canEditTask, isDone, joinedOf, openBlocker, personOf, taskPeople } from '../services/selectors';
import { toggleTask } from '../services/task-actions';
import { ContextChip } from './ContextChip';
import { Reactions } from './Reactions';
import { openTask } from '@/lib/open';
import { TaskTitle } from './TaskTitle';

export const rowClass = (sel = false, extra?: string) =>
  cn(
    'group/row flex min-h-[var(--row-h)] cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover focus-visible:outline-offset-[-2px] roomy:py-[7px]',
    sel && 'bg-sel hover:bg-sel',
    extra,
  );

export function TaskRow({ task, owner = false, noCtx = false }: { task: Task; owner?: boolean; noCtx?: boolean }) {
  const me = useMe();
  const sel = useUi((u) => u.insp?.type === 'task' && u.insp.id === task.id);
  const can = useWorkspace((db) => !!me && canEditTask(db, me, task));
  const blocked = useWorkspace((db) => !!openBlocker(db, task.id));
  const ownerName = useWorkspace((db) => personOf(db, task.owner)?.name ?? t('Someone'));
  const ownerFirst = useWorkspace((db) => personOf(db, task.owner)?.first ?? t('Someone'));
  const d = dueLabel(task);
  const done = isDone(task);
  return (
    <div
      className={rowClass(sel)}
      tabIndex={0}
      role="button"
      {...reactTarget('task', task.id)}
      onClick={() => {
        openTask(task.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openTask(task.id);
      }}
    >
      <TaskCheck
        on={done}
        id={task.id}
        label={done ? t('Mark not done') : t('Mark done')}
        disabled={!can}
        title={can ? undefined : t('Only {who} or the project lead can change this task', { who: ownerFirst })}
        onToggle={(el) => void toggleTask(task.id, el)}
      />
      <div className={cn('min-w-0 flex-1 fade-end', done && 'text-mute line-through')}>
        <TaskTitle task={task} />
        {owner && <small className="block text-d12h text-mute">{ownerName}</small>}
        <Reactions kind="task" id={task.id} reactions={task.reactions} className="mt-[3px]" />
      </div>
      {!done && blocked ? (
        <State label={t('Blocked')} icon="warning" tone="danger" />
      ) : task.status === 'doing' || task.status === 'review' ? (
        <TaskStatusMark status={task.status} />
      ) : null}
      {!noCtx && <ContextChip task={task} />}
      {(owner || joinedOf(task).length > 0) && <AvatarBubbles ids={taskPeople(task)} size="xs" />}
      <span
        className={cn(
          'min-w-16 flex-none text-right whitespace-nowrap text-ink-2 type-num',
          d.cls === 'late' && 'text-danger',
          d.cls === 'none' && 'text-mute',
        )}
      >
        {d.txt}
      </span>
    </div>
  );
}
