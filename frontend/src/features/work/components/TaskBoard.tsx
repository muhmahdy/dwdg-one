/* Board view over task records (work_work_views): one column per status. Dragging a card changes its status; the card menu
   and the side panel are the non-drag routes. From screens/work.js taskBoard. */
import { useState } from 'react';
import { Avatar } from '@/components/shared/Avatar';
import { openMenu } from '@/components/shared/menus';
import { IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { State, TASK_ORDER, TaskStatusMark } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useUi, useWorkspace } from '@/lib/workspace/hooks';
import type { Task, TaskStatus } from '@/types/workspace';
import { dueLabel } from '../services/due';
import { openBlocker } from '../services/selectors';
import { chooseStatus } from '../services/task-actions';
import { ContextChip } from './ContextChip';
import { Reactions } from './Reactions';
import { openTask } from './TaskRows';
import { TaskTitle } from './TaskTitle';

function Card({ task, owner }: { task: Task; owner: boolean }) {
  const sel = useUi((u) => u.insp?.id === task.id);
  const blocked = useWorkspace((db) => !!openBlocker(db, task.id));
  const d = dueLabel(task);
  return (
    <div
      className={cn(
        'cursor-pointer rounded-[10px] bg-surface px-3 py-2.5 shadow-sheet [&.dragging]:opacity-50',
        sel && 'shadow-[0_0_0_1.5px_var(--ink)]',
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('dragging');
      }}
      tabIndex={0}
      role="button"
      onClick={() => {
        openTask(task.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openTask(task.id);
      }}
    >
      <b className="block text-d13h font-semibold">
        <TaskTitle task={task} />
      </b>
      {blocked && (
        <div className="mt-2 flex items-center gap-1.5 text-d12 text-mute">
          <State label={t('Blocked')} icon="warning" tone="danger" />
        </div>
      )}
      <Reactions kind="task" id={task.id} reactions={task.reactions} className="mt-0.5" />
      <div className="mt-2 flex items-center gap-1.5 text-d12 text-mute">
        {owner ? <Avatar id={task.owner} size="xs" /> : <ContextChip task={task} />}
        <span className={cn('ml-auto text-ink-2 type-num', d.cls === 'late' && 'text-danger')}>{d.txt}</span>
        <IconButton
          aria-label={t('Move to')}
          onClick={(e) => {
            e.stopPropagation();
            openMenu(e.currentTarget, { type: 'move', id: task.id });
          }}
        >
          <Icon name="more" />
        </IconButton>
      </div>
    </div>
  );
}

export function TaskBoard({ tasks, owner = false }: { tasks: Task[]; owner?: boolean }) {
  const [over, setOver] = useState<TaskStatus | null>(null);
  return (
    <>
      <div className="grid auto-cols-[232px] grid-flow-col gap-3 overflow-x-auto">
        {TASK_ORDER.map((s) => {
          const col = tasks.filter((x) => x.status === s);
          return (
            <div
              key={s}
              className={cn(
                'flex flex-col gap-1.5 rounded-sheet bg-fill p-2',
                over === s && 'shadow-[inset_0_0_0_2px_var(--green)]',
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(s);
              }}
              onDragLeave={() => {
                setOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData('text/plain');
                const x = tasks.find((y) => y.id === id);
                if (x && x.status !== s) void chooseStatus(id, s);
              }}
            >
              <div className="flex items-center justify-between px-1.5 pt-1 pb-1.5 text-d13 font-semibold">
                <span>
                  <TaskStatusMark status={s} />
                </span>
                <span className="text-mute type-num">{col.length}</span>
              </div>
              {col.length ? (
                col.map((x) => <Card key={x.id} task={x} owner={owner} />)
              ) : (
                <div className="px-1.5 py-2 text-d12h text-mute">{t('Nothing here')}</div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-mute type-small">{t('Drag a card to change its status, or use its menu.')}</p>
    </>
  );
}
