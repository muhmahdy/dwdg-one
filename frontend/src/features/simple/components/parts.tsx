/* The Simple look's building pieces (core/simple.css .f-*): white cards on a cool canvas, big touch targets, plain words.
   Section cards, task rows with a round check, the kind switch (Programs, Projects, Operations), the Cards or Timeline switch,
   the four status groups members see. From screens/simple.js. */
import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ProgramObject, ProjectObject, RoutineObject } from '@/components/shared/art/objects';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { visibleDivs } from '@/lib/access';
import { t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { dShort } from '@/lib/time';
import { setSession } from '@/lib/session';
import { useMe, useSession, useWorkspace } from '@/lib/workspace/hooks';
import { dueLabel } from '@/features/work/services/due';
import { canEditTask, isDone, openBlocker, personOf, projOf } from '@/features/work/services/selectors';
import { toggleTask } from '@/features/work/services/task-actions';
import { canSeeProject } from '@/features/projects/services/access';
import { rtOf } from '@/features/operations/services/routines';
import type { Person, Project, ProjectStage, Task } from '@/types/workspace';

// Members see four status groups; the nine stages stay in the data and on the full project page.
export type GroupKey = 'progress' | 'planned' | 'hold' | 'done';
export const SGROUPS: [GroupKey, string, ProjectStage[]][] = [
  ['progress', 'In progress', ['active', 'review']],
  ['planned', 'Planned', ['draft', 'planned']],
  ['hold', 'On hold', ['hold']],
  ['done', 'Done', ['completed', 'cancelled', 'archived']],
];
export const SGROUP_STAGE: Record<GroupKey, ProjectStage> = {
  progress: 'active',
  planned: 'planned',
  hold: 'hold',
  done: 'completed',
};
export const groupOf = (st: ProjectStage): GroupKey =>
  (SGROUPS.find((g) => g[2].includes(st)) ?? SGROUPS[0])?.[0] ?? 'progress';
export const groupLabel = (k: GroupKey) => t(SGROUPS.find((g) => g[0] === k)?.[1] ?? '');
const ST_CLASS: Record<GroupKey, string> = {
  progress: 'text-st-active',
  planned: 'text-st-planned',
  hold: 'text-st-hold',
  done: 'text-st-completed',
};
export const StatusWord = ({ stage }: { stage: ProjectStage }) => (
  <span
    className={cn(
      'text-[14px] leading-5 font-semibold whitespace-nowrap max-[899px]:text-[15px]',
      ST_CLASS[groupOf(stage)],
    )}
  >
    {groupLabel(groupOf(stage))}
  </span>
);

export const byDue = (a: Task, b: Task) =>
  (a.due ?? '9').localeCompare(b.due ?? '9') || (a.time ?? 1e4) - (b.time ?? 1e4);
export const canSee = (db: Parameters<typeof canSeeProject>[0], m: Person, p: Project) =>
  visibleDivs(m).includes(p.div) || canSeeProject(db, m, p);

export const Card = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('overflow-hidden rounded-2xl bg-surface shadow-sheet', className)}>{children}</div>
);

export const Section = ({
  title,
  n,
  late,
  action,
  hint,
  children,
}: {
  title: string;
  n?: number | undefined;
  late?: boolean;
  action?: ReactNode;
  hint?: string;
  children: ReactNode;
}) => (
  <section className="mt-7">
    <h2
      className={cn(
        'mx-1 mb-2.5 flex items-baseline gap-2 type-h3',
        late ? 'text-danger' : 'text-ink',
        hint && 'max-[899px]:block',
      )}
    >
      {title}
      {n != null && <span className="font-medium text-mute">{n}</span>}
      {hint && (
        <span className="ml-1 text-[length:var(--fs-small,14px)] font-normal text-mute max-[899px]:mt-0.5 max-[899px]:ml-0 max-[899px]:block">
          {hint}
        </span>
      )}
      {action && <span className="ml-auto">{action}</span>}
    </h2>
    <Card>{children}</Card>
  </section>
);

export const Empty = ({ title, children }: { title: string; children?: ReactNode }) => (
  <Card className="mt-7 px-5 py-8 text-center">
    <b className="type-h3">{title}</b>
    {children && <p className="mt-1.5 mb-0 text-mute type-small">{children}</p>}
  </Card>
);

export const PageHead = ({ title, sub, children }: { title: string; sub: ReactNode; children?: ReactNode }) => (
  <header className="mb-5 flex items-end justify-between gap-4">
    <div>
      <h1 className="m-0 tracking-[-0.02em] type-title">{title}</h1>
      <p className="mt-1 mb-0 text-mute type-small">{sub}</p>
    </div>
    {children}
  </header>
);

export const Page = ({ children, narrow }: { children: ReactNode; narrow?: boolean }) => (
  <div className={cn('mx-auto max-w-[1120px]', narrow && 'max-w-[720px]')}>{children}</div>
);

/** The small picture in front of a task's project or operation. */
function TaskArt({ task }: { task: Task }) {
  const db = useWorkspace((w) => w);
  const rt = task.routine ? rtOf(db, task.routine) : undefined;
  const p = projOf(db, task.project);
  if (rt) return <RoutineObject routine={rt} size="xs" className="size-[18px]" />;
  return p ? <ProjectObject project={p} size="xs" /> : null;
}

export function TaskRow({
  task,
  owner,
  noProject,
  first,
}: {
  task: Task;
  owner?: boolean;
  noProject?: boolean;
  first?: boolean;
}) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const d = dueLabel(task);
  const done = isDone(task);
  const blocked = !done && !!openBlocker(db, task.id);
  const edit = !!me && canEditTask(db, me, task);
  const pr = projOf(db, task.project);
  const rt = task.routine ? rtOf(db, task.routine) : undefined;
  const where = owner
    ? (personOf(db, task.owner)?.name ?? '')
    : !noProject && rt
      ? rt.name === task.title
        ? t('Operation')
        : rt.name
      : !noProject && pr
        ? pr.name
        : '';
  const when = task.due && d.txt !== t('Today') ? d.txt : '';
  const late = d.cls === 'late' && !done;
  const flag = blocked ? (
    <b className="font-semibold text-danger">{t('Blocked')}</b>
  ) : task.status === 'review' && !done ? (
    <b className="font-semibold text-st-review">{t('In review')}</b>
  ) : null;
  return (
    <div
      className={cn(
        'relative flex min-h-16 cursor-pointer items-center gap-2 py-2.5 pr-4 pl-2 text-inherit no-underline transition-colors hover:bg-hover',
        !first &&
          'before:absolute before:top-0 before:right-0 before:left-[60px] before:h-px before:bg-line before:content-[""]',
      )}
      tabIndex={0}
      role="button"
      onClick={() => {
        openTask(task.id);
      }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          openTask(task.id);
        }
      }}
    >
      <button
        type="button"
        className={cn(
          'group/ck grid size-11 flex-none cursor-pointer place-items-center border-0 bg-transparent p-0 disabled:cursor-default disabled:opacity-45',
        )}
        aria-label={done ? t('Mark not done') : t('Mark done')}
        disabled={!edit}
        onClick={(e) => {
          e.stopPropagation();
          void toggleTask(task.id, e.currentTarget);
        }}
      >
        <Icon
          name="check"
          className={cn(
            'size-7 rounded-full [stroke-width:2.4] p-[5px] shadow-[inset_0_0_0_2px_var(--line-strong)]',
            done ? 'bg-green-ink text-surface shadow-none' : 'text-transparent group-hover/ck:text-mute',
          )}
        />
      </button>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className={cn('[overflow-wrap:anywhere] type-body', done && 'text-mute line-through decoration-faint')}>
          {task.title}
        </span>
        {(flag !== null || where !== '' || when !== '') && (
          <span className="text-mute type-small">
            {!noProject && !owner && (rt !== undefined || pr !== undefined) && (
              <span className="mr-1.5 inline-flex align-[-4px]">
                <TaskArt task={task} />
              </span>
            )}
            {[
              flag,
              where !== '' && where,
              when !== '' && (
                <span key="w" className={late ? 'text-danger' : ''}>
                  {when}
                </span>
              ),
            ]
              .filter(Boolean)
              .map((x, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  {x}
                </span>
              ))}
          </span>
        )}
      </div>
    </div>
  );
}

export const MoreButton = ({ children, on, onClick }: { children: ReactNode; on: boolean; onClick: () => void }) => (
  <button
    type="button"
    className="mx-auto mt-6 block h-11 cursor-pointer rounded-full border-0 bg-fill px-5 text-[length:16px] font-[550] text-ink-2 hover:bg-sel-neutral"
    aria-expanded={on}
    onClick={onClick}
  >
    {children}
  </button>
);

const KINDS: [string, string, string][] = [
  ['programs', 'program', 'Programs'],
  ['projects', 'projects', 'Projects'],
  ['operations', 'routine', 'Operations'],
];
/** The switch inside the Work tab: three big pills, each with its kind's own mark (a stack, a folder, a ring). */
export function KindSwitch({ cur }: { cur: string }) {
  return (
    <nav
      className="mb-5 flex w-fit max-w-full gap-1.5 overflow-x-auto rounded-full bg-ink/5 p-1 max-[899px]:w-full"
      aria-label={t('Work')}
    >
      {KINDS.map(([k, ic, l]) => (
        <Link
          key={k}
          to={`/${k}`}
          className={cn(
            'inline-flex h-[42px] items-center gap-2 rounded-full px-[18px] text-[15px] font-[550] whitespace-nowrap text-ink-2 no-underline hover:text-ink max-[899px]:flex-1 max-[899px]:justify-center max-[899px]:px-2.5',
            k === cur && 'bg-surface text-ink shadow-sheet',
          )}
          aria-current={k === cur ? 'page' : undefined}
        >
          <Icon name={ic} className="size-5" selected={k === cur} />
          <span>{t(l)}</span>
        </Link>
      ))}
    </nav>
  );
}
/** The Work tab opens the kind the member used last (programs, projects or operations). */
export const useRememberKind = (k: string) => {
  useEffect(() => {
    setSession({ sKind: k });
  }, [k]);
};

type ViewKey = 'cards' | 'timeline';
export const useSimpleView = (k: string): ViewKey =>
  useSession((s) => ((s.sView as Record<string, string> | undefined)?.[k] === 'timeline' ? 'timeline' : 'cards'));

/** Cards or Timeline, remembered per page kind. */
export function ViewSeg({ k, first = 'Cards' }: { k: string; first?: string }) {
  const v = useSimpleView(k);
  const cur = useSession((s) => s.sView as Record<string, string> | undefined);
  return (
    <div className="inline-flex gap-0.5 rounded-full bg-ink/5 p-[3px]" role="radiogroup" aria-label={t('View')}>
      {(
        [
          ['cards', first, 'board'],
          ['timeline', 'Timeline', 'gantt'],
        ] as const
      ).map(([x, l, ic]) => (
        <button
          key={x}
          type="button"
          role="radio"
          aria-checked={v === x}
          className={cn(
            'inline-flex h-[34px] cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-3.5 text-[14px] font-[550] text-ink-2',
            v === x && 'bg-surface text-ink shadow-sheet',
          )}
          onClick={() => {
            setSession({ sView: { ...(cur ?? {}), [k]: x } });
          }}
        >
          <Icon name={ic} className="size-[17px]" />
          {t(l)}
        </button>
      ))}
    </div>
  );
}

export const Person_ = ({ id }: { id: string }) => {
  const db = useWorkspace((w) => w);
  const p = personOf(db, id);
  return <>{p?.name ?? ''}</>;
};

export { ProgramObject, ProjectObject, RoutineObject, dShort };
