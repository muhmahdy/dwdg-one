/* The WBS as a tree, top down or left to right: boxes for phases, items and milestones. Click a box to open it; + adds a part under it.
   Boxes with parts are summaries: their dates and progress come from the work packages below them. From screens/plan.js wbsTab. */
import type { ReactNode } from 'react';
import { AvatarBubbles } from '@/components/shared/Avatar';
import { ProjectObject } from '@/components/shared/art/objects';
import { TaskIcon } from '@/components/shared/art/task-icons';
import { Icon } from '@/components/ui/Icon';
import { TaskStatusMark } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { pal } from '@/lib/art/identity';
import { t } from '@/lib/i18n';
import { openMilestone, openTask } from '@/lib/open';
import { dShort } from '@/lib/time';
import { useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { isDone, isSummary, taskPeople } from '@/features/work/services/selectors';
import { rangeTxt } from '@/features/work/services/task-actions';
import type { Milestone, Project } from '@/types/workspace';
import { projTasks } from '../services/project-rules';
import { rollup, wbsAdd, wbsTree, type WbsNode } from '../services/wbs';

const box =
  'relative grid w-[190px] cursor-pointer gap-[3px] rounded-xl bg-surface px-3 py-2.5 text-left shadow-[0_0_0_1px_var(--line-strong),0_1px_2px_rgb(22_22_21/8%)] transition-[box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-[0_0_0_1px_var(--line-strong),0_8px_18px_-10px_rgb(22_22_21/30%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0';
const title = 'line-clamp-2 overflow-hidden text-d13 leading-5 font-semibold';

function Card({ n, edit, vertical }: { n: WbsNode; edit: boolean; vertical: boolean }) {
  const db = useWorkspace((w) => w);
  const sel = useUi((u) => u.insp?.id === n.t.id);
  const task = n.t;
  const sum = isSummary(db, task);
  const ru = sum ? rollup(db, task) : null;
  const depth = n.depth;
  const w =
    vertical && depth >= 1 ? (['w-[164px]', 'w-[138px]', 'w-[112px]'][Math.min(depth - 1, 2)] ?? 'w-[112px]') : '';
  return (
    <div
      className={cn(
        box,
        w,
        sum && 'bg-[color-mix(in_srgb,var(--t)_22%,var(--surface))]',
        task.phase &&
          'bg-[color-mix(in_srgb,var(--t)_45%,var(--surface))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--a)_40%,transparent),0_1px_2px_rgb(22_22_21/8%)]',
        sel && 'shadow-[0_0_0_2px_var(--ink)]',
        'group/wn',
      )}
      role="button"
      tabIndex={0}
      data-wid={task.id}
      onClick={() => {
        openTask(task.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) openTask(task.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setUi((u) => {
          u.menu = {
            type: 'wbs',
            id: task.id,
            width: 260,
            est: 470,
            rect: {
              x: e.clientX,
              y: e.clientY,
              top: e.clientY,
              right: e.clientX,
              bottom: e.clientY,
              left: e.clientX,
              width: 0,
              height: 0,
            },
          };
        });
      }}
    >
      <span className="text-d10h text-mute type-num">{n.code}</span>
      <b className={cn(title, task.phase && 'text-d14', !sum && isDone(task) && 'text-mute line-through')}>
        <TaskIcon icon={task.icon} size="xs" />
        {task.title}
      </b>
      <small className="text-d11h text-mute">
        {sum && ru
          ? `${ru.done}/${ru.total} ${t('done')}${ru.s ? `, ${rangeTxt({ s: ru.s, e: ru.e })}` : ''}`
          : task.due
            ? rangeTxt({ s: task.start ?? null, e: task.due })
            : t('No dates yet')}
      </small>
      {sum && ru ? (
        <i className="mt-1 block h-1 overflow-hidden rounded-[2px] bg-[color-mix(in_srgb,var(--ink)_12%,transparent)]">
          <i
            className="block h-full bg-[var(--a)]"
            style={{ width: `${ru.total ? (ru.done / ru.total) * 100 : 0}%` }}
          />
        </i>
      ) : (
        <span className="mt-0.5 flex items-center justify-between gap-1.5">
          <TaskStatusMark status={task.status} />
          <AvatarBubbles ids={taskPeople(task)} size="xs" />
        </span>
      )}
      {edit && (
        <button
          type="button"
          className="absolute top-1.5 right-1.5 grid size-[22px] cursor-pointer place-items-center rounded-md border-0 bg-surface p-0 text-ink-2 opacity-0 shadow-[inset_0_0_0_1px_var(--line-strong)] transition-opacity duration-100 group-focus-within/wn:opacity-100 group-hover/wn:opacity-100 hover:text-green hover:shadow-[inset_0_0_0_1.5px_var(--green)]"
          aria-label={t('Add a part under {t}', { t: task.title })}
          title={t('Add a part under this')}
          onClick={(e) => {
            e.stopPropagation();
            void wbsAdd(task.project ?? '', 'child', task.id);
          }}
        >
          <Icon name="plus" size="xs" />
        </button>
      )}
    </div>
  );
}

function MsCard({ m, vertical, depth }: { m: Milestone; vertical: boolean; depth: number }) {
  const w = vertical && depth >= 2 ? (['w-[164px]', 'w-[138px]'][Math.min(depth - 2, 1)] ?? 'w-[138px]') : 'w-[170px]';
  return (
    <div
      className={cn(
        box,
        w,
        'grid-cols-[auto_1fr] items-center gap-x-2 rounded-[10px] px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--line-strong)]',
      )}
      role="button"
      tabIndex={0}
      data-wms={m.id}
      onClick={() => {
        openMilestone(m.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openMilestone(m.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setUi((u) => {
          u.menu = {
            type: 'wms',
            id: m.id,
            width: 240,
            est: 200,
            rect: {
              x: e.clientX,
              y: e.clientY,
              top: e.clientY,
              right: e.clientX,
              bottom: e.clientY,
              left: e.clientX,
              width: 0,
              height: 0,
            },
          };
        });
      }}
    >
      <i className={cn('row-span-2 size-3 rotate-45 rounded-[2px] bg-ink-2', m.state === 'achieved' && 'bg-green')} />
      <b className={title}>{m.title}</b>
      <small className="col-start-2 text-d11h text-mute">
        {t('Milestone')}
        {m.target ? `, ${dShort(m.target)}` : ''}
      </small>
    </div>
  );
}

export function WbsTree({ p, edit, view }: { p: Project; edit: boolean; view: 'v' | 'h' }) {
  const db = useWorkspace((w) => w);
  const tree = wbsTree(db, p);
  const c = pal(p.look?.p ?? 0);
  const unMs = db.milestones.filter(
    (m) => m.project === p.id && !(m.parent && db.tasks.find((x) => x.id === m.parent && !x.trashed)),
  );
  const ts = projTasks(db, p);
  const done = ts.filter(isDone).length;
  const vertical = view === 'v';
  // level: 0 is the root list, 1 the phases, 2 and deeper the items (stacked in a column in the top-down tree)
  const LN = 'border-[color:var(--ln)]';
  const ul = (level: number, children: ReactNode) => (
    <ul
      className={cn(
        'm-0 list-none p-0',
        vertical
          ? level === 0
            ? 'flex justify-center'
            : level === 1
              ? cn(
                  'relative flex justify-center pt-[22px]',
                  "before:absolute before:top-0 before:left-1/2 before:h-[22px] before:border-l-[1.5px] before:content-['']",
                  `before:${LN}`,
                )
              : 'relative flex flex-col items-stretch justify-start pt-2.5'
          : level === 0
            ? 'relative flex flex-col justify-center pl-0'
            : cn(
                'relative flex flex-col justify-center pl-10',
                "before:absolute before:top-1/2 before:left-0 before:w-5 before:border-t-[1.5px] before:content-['']",
                `before:${LN}`,
              ),
      )}
    >
      {children}
    </ul>
  );
  const li = (level: number, key: string, children: ReactNode, lone = false) => (
    <li
      key={key}
      className={cn(
        'relative list-none',
        vertical
          ? level === 0
            ? 'flex flex-col items-center px-2'
            : level === 1
              ? cn(
                  'flex flex-col items-center px-2 pt-[22px]',
                  "before:absolute before:top-0 before:right-1/2 before:h-[22px] before:w-1/2 before:border-t-[1.5px] before:content-['']",
                  "after:absolute after:top-0 after:left-1/2 after:h-[22px] after:w-1/2 after:border-t-[1.5px] after:border-l-[1.5px] after:content-['']",
                  `before:${LN} after:${LN}`,
                  'first:before:border-0 first:after:rounded-tl-[10px] last:before:rounded-tr-[10px] last:before:border-r-[1.5px] last:after:border-0 only:before:hidden only:after:hidden',
                )
              : cn(
                  'flex flex-col items-start pt-2 pl-7',
                  "before:absolute before:top-[34px] before:left-3 before:w-3.5 before:border-t-[1.5px] before:content-['']",
                  "after:absolute after:-top-2.5 after:bottom-0 after:left-3 after:border-l-[1.5px] after:content-['']",
                  `before:${LN} after:${LN}`,
                  'last:before:border-t-0 last:after:bottom-auto last:after:h-11 last:after:w-3.5 last:after:rounded-bl-lg last:after:border-b-[1.5px]',
                )
          : level === 0
            ? 'flex items-center py-1.5'
            : cn(
                'flex items-center py-1.5',
                "before:absolute before:top-1/2 before:-left-5 before:w-5 before:border-t-[1.5px] before:content-['']",
                "after:absolute after:inset-y-0 after:-left-5 after:border-l-[1.5px] after:content-['']",
                `before:${LN} after:${LN}`,
                'first:after:top-1/2 last:after:bottom-1/2 only:after:hidden',
              ),
      )}
    >
      {vertical && level === 1 && lone && <i className={cn('absolute top-0 left-1/2 h-[22px] border-l-[1.5px]', LN)} />}
      {children}
    </li>
  );
  const lone = tree.length + unMs.length === 1;
  const node = (n: WbsNode, level: number): ReactNode =>
    li(
      level,
      n.t.id,
      <>
        <Card n={n} edit={edit} vertical={vertical} />
        {(n.kids.length > 0 || n.ms.length > 0) &&
          ul(
            level + 1,
            <>
              {n.kids.map((k) => node(k, level + 1))}
              {n.ms.map((m) => li(level + 1, m.id, <MsCard m={m} vertical={vertical} depth={level + 1} />))}
            </>,
          )}
      </>,
      level === 1 && lone,
    );
  return (
    <>
      <div className="overflow-auto rounded-sheet bg-surface-2 px-1 pt-2 pb-4 shadow-[inset_0_0_0_1px_var(--line)]">
        <div
          className="relative w-max min-w-full p-3"
          style={{
            ['--t' as string]: c[3],
            ['--a' as string]: c[1],
            ['--ln' as string]: 'color-mix(in srgb, var(--ink) 22%, transparent)',
          }}
        >
          {ul(
            0,
            li(
              0,
              'root',
              <>
                <div className="relative grid min-w-[200px] cursor-default grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-[3px] rounded-xl bg-ink px-3 py-2.5 text-on-ink">
                  <ProjectObject project={p} size="xs" className="row-span-2" />
                  <b className="text-d13 font-semibold">{p.name}</b>
                  <small className="col-start-2 text-d11h text-[color-mix(in_srgb,var(--on-ink)_70%,transparent)]">
                    {done}/{ts.length} {t('done')}
                  </small>
                </div>
                {ul(
                  1,
                  <>
                    {tree.map((n) => node(n, 1))}
                    {unMs.map((m) => li(1, m.id, <MsCard m={m} vertical={vertical} depth={1} />))}
                  </>,
                )}
              </>,
            ),
          )}
        </div>
      </div>
      <p className="mt-3.5 text-mute type-small">
        {t(
          'Click a box to open it; + adds a part under it. Boxes with parts are summaries: their dates and progress come from the work packages below them. Everything here is on the Timeline in the Work tab.',
        )}
      </p>
    </>
  );
}
