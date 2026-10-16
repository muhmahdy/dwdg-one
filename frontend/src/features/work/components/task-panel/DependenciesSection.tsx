/* Dependencies (work_dependencies; owner round 7): what this task waits for, and what waits for it. Each link is a card with
   its type; a broken link turns red. A link never moves anything by itself (Fix dates previews the exact shifts).
   From screens/work.js depSection. */
import { openMenu } from '@/components/shared/menus';
import { TaskIcon } from '@/components/shared/art/task-icons';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { DependencyType, Task } from '@/types/workspace';
import { canEditTask } from '../../services/selectors';
import { DEP_T, depOk, predsOf, removeDep, succsOf } from '../../services/task-actions';
import { openTask } from '@/lib/open';

function Card({
  other,
  type,
  succId,
  predId,
  can,
  ok,
}: {
  other: Task;
  type: DependencyType;
  succId: string;
  predId: string;
  can: boolean;
  ok: boolean;
}) {
  return (
    <div
      className={cn(
        'grid gap-1.5 rounded-[10px] bg-surface-2 py-2.5 pr-2.5 pl-3 shadow-[inset_0_0_0_1px_var(--line)]',
        !ok && 'bg-danger-soft shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--danger)_30%,transparent)]',
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <TaskIcon icon={other.icon} size="xs" />
        <a
          className="min-w-0 flex-1 cursor-pointer truncate text-d13h font-[550] text-ink no-underline"
          title={other.title}
          onClick={() => {
            openTask(other.id);
          }}
        >
          {other.title}
        </a>
        {can && (
          <button
            type="button"
            className="inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute opacity-60 hover:bg-hover hover:text-ink hover:opacity-100"
            aria-label={t('Remove link')}
            onClick={() => {
              void removeDep(succId, predId);
            }}
          >
            <Icon name="close" size="xs" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex h-[26px] items-center gap-1.5 rounded-[7px] border-0 bg-surface pr-2 pl-1 text-d12h text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong)] enabled:cursor-pointer disabled:bg-transparent disabled:shadow-none"
          disabled={!can}
          title={t(DEP_T[type][1])}
          onClick={(e) => {
            openMenu(e.currentTarget, { type: 'dep', s: succId, p: predId, width: 300, est: 300 });
          }}
        >
          <b className="inline-grid h-[18px] place-items-center rounded-[5px] bg-fill px-[5px] text-[10.5px] font-bold text-ink type-num">
            {type}
          </b>
          {t(DEP_T[type][0])}
          {can && <Icon name="chevron-down" size="xs" />}
        </button>
        {!ok && (
          <span className="inline-flex items-center gap-1 text-[12px] font-[550] text-danger">
            <Icon name="warning" size="xs" />
            {t('Too early')}
          </span>
        )}
      </div>
    </div>
  );
}

export function DependenciesSection({ task, edit }: { task: Task; edit: boolean }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const preds = predsOf(db, task);
  const succs = succsOf(db, task);
  const head = (label: string, n: number) => (
    <h3 className="mt-0 mb-2 type-h3">
      {label} <span className="ml-1 text-mute type-num">{n}</span>
    </h3>
  );
  return (
    <>
      {head(t('Waits for'), preds.length)}
      <div className="grid gap-1.5">
        {preds.length ? (
          preds.map((d) => (
            <Card
              key={d.id}
              other={d.t}
              type={d.type}
              succId={task.id}
              predId={d.id}
              can={edit}
              ok={depOk(d.t, task, d.type)}
            />
          ))
        ) : (
          <p className="m-0 text-mute type-small">{t('Nothing. It can start any time.')}</p>
        )}
      </div>
      {edit && (
        <button
          type="button"
          className="mt-2 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent px-0 py-2 text-d13 font-semibold text-green-ink"
          onClick={(e) => {
            openMenu(e.currentTarget, { type: 'deppick', id: task.id, width: 320, est: 320 });
          }}
        >
          <Icon name="plus" size="xs" /> {t('Add a task it waits for')}
        </button>
      )}
      {succs.length > 0 && (
        <>
          <div className="mt-4" />
          {head(t('Waiting for this'), succs.length)}
          <div className="grid gap-1.5">
            {succs.map((x) => {
              const ty = x.deps.find((d) => d.id === task.id)?.type ?? 'FS';
              return (
                <Card
                  key={x.id}
                  other={x}
                  type={ty}
                  succId={x.id}
                  predId={task.id}
                  can={canEditTask(db, me, x)}
                  ok={depOk(task, x, ty)}
                />
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
