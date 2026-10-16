/* My Work rows (owner: one line per task). Comfortable (D57, R009): a quiet checkbox, the title as a sentence with its people
   inline, one chip in the project's own colours and a time pill; state shows only when it needs action. Compact: the original
   dense grid row with reactions, state, context, people and due. From screens/work.js r9Row / mwRow. */
import { useLayoutEffect, useRef } from 'react';
import { divisionOf } from '@/app/config/org';
import { AvatarBubbles } from '@/components/shared/Avatar';
import { ProjectObject } from '@/components/shared/art/objects';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { TaskCheck } from '@/components/ui/Checkbox';
import { State, TaskStatusMark } from '@/components/ui/StatusBadge';
import { TimePill } from '@/components/ui/TimePill';
import { pal } from '@/lib/art/identity';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useMe, useSession, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { look } from '@/lib/session';
import { setUi } from '@/lib/workspace/transaction';
import type { Task, Workspace } from '@/types/workspace';
import { cadShort, rtOf } from '@/features/operations/services/routines';
import { dueLabel } from '../services/due';
import { canEditTask, isDone, joinedOf, openBlocker, projOf, taskDiv } from '../services/selectors';
import { lastSub, subsOf } from '../services/signoff';
import { toggleTask } from '../services/task-actions';
import { PersonMention, TaskTitle } from './TaskTitle';
import { Reactions } from './Reactions';

export const openTask = (id: string) => {
  setUi((u) => {
    u.palette = false;
    u.menu = null;
    u.form = null;
    u.insp = { type: 'task', id };
  });
};

/** The state that needs action, if any: Blocked, Handed in / In review, Returned (needState). */
function NeedState({ task }: { task: Task }) {
  const blocked = useWorkspace((db) => !!openBlocker(db, task.id));
  if (isDone(task)) return null;
  if (blocked) return <State label={t('Blocked')} icon="warning" tone="danger" />;
  if (task.status === 'review')
    return subsOf(task).length ? (
      <State label={t('Handed in')} icon="check" tone="green" />
    ) : (
      <TaskStatusMark status="review" />
    );
  const s = lastSub(task);
  if (s?.review?.result === 'returned') return <State label={t('Returned')} icon="undo" tone="warn" />;
  return null;
}

/** The project chip in the project's own colours; a routine shows its cadence, a personal task its division. */
export function ProjectChip({ task }: { task: Task }) {
  const info = useWorkspace((db: Workspace) => {
    const r = rtOf(db, task.routine);
    if (r) return { kind: 'rt' as const, label: cadShort(r) };
    const pr = projOf(db, task.project);
    if (pr) return { kind: 'pr' as const, project: pr };
    const d = divisionOf(taskDiv(db, task));
    return d ? { kind: 'div' as const, icon: d.icon, label: d.short } : null;
  });
  if (!info) return null;
  const base =
    'inline-flex h-7 max-w-[180px] flex-none items-center gap-1.5 rounded-ctl pr-2.5 pl-[5px] text-[13px] leading-none font-semibold [&>span]:truncate @max-[560px]/cs-tasks:max-w-full';
  if (info.kind === 'pr') {
    const c = pal(info.project.look?.p ?? 0);
    return (
      <span
        className={cn(
          base,
          'bg-[color-mix(in_srgb,var(--pc-bg)_62%,var(--surface))] text-[var(--pc-fg)]',
          'dark:bg-[color-mix(in_srgb,var(--pc-bg)_18%,transparent)] dark:text-[color-mix(in_srgb,var(--pc-bg)_85%,white)]',
        )}
        style={{ ['--pc-bg' as string]: c[3], ['--pc-fg' as string]: c[2] }}
      >
        <ProjectObject project={info.project} size="xs" className="h-[17px] w-5" />
        <span>{info.project.name}</span>
      </span>
    );
  }
  return (
    <span
      className={cn(
        base,
        info.kind === 'rt' && 'text-[15px]',
        'bg-[color-mix(in_srgb,var(--cs-pill)_62%,var(--surface))] text-ink-2 [&_.ic]:ml-0.5 [&_.ic]:size-4 [&_svg]:ml-0.5 [&_svg]:size-4',
      )}
    >
      {info.kind === 'rt' ? <Icon name="routine" /> : <BrandIcon id={info.icon} label={false} />}
      <span>{info.label}</span>
    </span>
  );
}

/** Long titles fade out at the right edge instead of an ellipsis (R009); only titles that really overflow fade. */
function useFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => el.classList.toggle('is-fading', el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  });
  return ref;
}

const rowFocus = 'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring';

function WithPeople({ task }: { task: Task }) {
  const me = useMe();
  const people = useWorkspace((db) =>
    [...new Set([...joinedOf(task), task.owner])]
      .filter((i) => i && i !== me?.id && !task.mentions.includes(i))
      .map((i) => db.people.find((p) => p.id === i))
      .filter((p) => !!p),
  );
  if (!people.length) return null;
  return (
    <span className="text-ink-2">
      {' '}
      {t('with')}{' '}
      {people.slice(0, 2).map((p, i) => (
        <span key={p.id}>
          {i > 0 && ' '}
          <PersonMention id={p.id} first={p.first} className={mentionR9} />
        </span>
      ))}
    </span>
  );
}

const mentionR9 = 'gap-[5px] font-[inherit] text-ink underline decoration-mute decoration-dotted underline-offset-4';

/** Comfortable row (R009). */
export function R9Row({ task, more }: { task: Task; more: number | undefined }) {
  const me = useMe();
  const sel = useUi((u) => u.insp?.type === 'task' && u.insp.id === task.id);
  const can = useWorkspace((db) => !!me && canEditTask(db, me, task));
  const fade = useFade<HTMLSpanElement>();
  const d = dueLabel(task);
  const done = isDone(task);
  return (
    <div
      className={cn(
        'flex min-h-12 cursor-pointer items-center gap-3 px-4 py-1.5 hover:bg-hover',
        'max-[760px]:items-start max-[760px]:py-2.5 @max-[560px]/cs-tasks:items-start @max-[560px]/cs-tasks:py-2.5',
        sel && 'bg-hover',
        rowFocus,
      )}
      tabIndex={0}
      role="button"
      onClick={() => {
        openTask(task.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTask(task.id);
        }
      }}
    >
      <TaskCheck
        on={done}
        id={task.id}
        label={done ? t('Mark not done') : t('Mark done')}
        disabled={!can}
        className="max-[760px]:mt-0.5 @max-[560px]/cs-tasks:mt-0.5"
        onToggle={(el) => void toggleTask(task.id, el)}
      />
      <span className="flex min-w-0 flex-1 items-center gap-2.5 max-[760px]:flex-wrap max-[760px]:gap-y-1 @max-[560px]/cs-tasks:flex-wrap @max-[560px]/cs-tasks:gap-y-1">
        <span
          ref={fade}
          className={cn(
            'min-w-0 flex-[0_1_auto] overflow-hidden text-[16px] leading-6 font-normal whitespace-nowrap text-ink',
            '[&.is-fading]:[mask-image:linear-gradient(90deg,#000_calc(100%-36px),transparent)]',
            'max-[760px]:basis-full max-[760px]:text-[17px] max-[760px]:whitespace-normal max-[760px]:[&.is-fading]:[mask-image:none]',
            '@max-[560px]/cs-tasks:basis-full @max-[560px]/cs-tasks:[overflow-wrap:anywhere] @max-[560px]/cs-tasks:whitespace-normal @max-[560px]/cs-tasks:[&.is-fading]:[mask-image:none]',
            done && 'text-mute line-through decoration-line-strong',
          )}
        >
          <TaskTitle task={task} noIcon mentionClass={mentionR9} />
          <WithPeople task={task} />
        </span>
        <NeedState task={task} />
        <ProjectChip task={task} />
        {!!more && <span className="flex-none text-[14px] text-mute">+{more}</span>}
      </span>
      {task.due && <TimePill tone={d.cls}>{d.txt}</TimePill>}
    </div>
  );
}

/** Compact row: the original dense grid. */
export function CompactRow({ task, more }: { task: Task; more: number | undefined }) {
  const me = useMe();
  const sel = useUi((u) => u.insp?.type === 'task' && u.insp.id === task.id);
  const can = useWorkspace((db) => !!me && canEditTask(db, me, task));
  const blocked = useWorkspace((db) => !!openBlocker(db, task.id));
  const ctx = useWorkspace((db) => {
    const r = rtOf(db, task.routine);
    if (r) return { rt: true, label: cadShort(r), icon: '' };
    const pr = projOf(db, task.project);
    const dv = divisionOf(taskDiv(db, task));
    return dv ? { rt: false, label: pr ? pr.name : dv.short, icon: dv.icon } : null;
  });
  const others = [...new Set([task.owner, ...joinedOf(task)])].filter((i) => i && i !== me?.id);
  const d = dueLabel(task);
  const done = isDone(task);
  return (
    <div
      className={cn(
        'grid h-[38px] cursor-pointer grid-cols-[24px_minmax(0,1fr)_minmax(0,168px)_24px_50px_minmax(54px,max-content)] items-center gap-2.5 rounded-[9px] px-2 text-d13h hover:bg-hover',
        '@max-[600px]/mywork:h-auto @max-[600px]/mywork:min-h-[38px] @max-[600px]/mywork:grid-cols-[24px_minmax(0,1fr)_20px_minmax(50px,max-content)] @max-[600px]/mywork:py-1.5',
        sel && 'bg-sel hover:bg-sel',
        rowFocus,
      )}
      tabIndex={0}
      role="button"
      onClick={() => {
        openTask(task.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTask(task.id);
        }
      }}
    >
      <TaskCheck
        on={done}
        id={task.id}
        review={task.status === 'review'}
        label={done ? t('Mark not done') : t('Mark done')}
        disabled={!can}
        onToggle={(el) => void toggleTask(task.id, el)}
      />
      <span className="flex min-w-0 items-center gap-2 @max-[600px]/mywork:flex-wrap @max-[600px]/mywork:gap-y-[3px]">
        <span className={cn('min-w-0 truncate @max-[600px]/mywork:flex-[1_0_100%]', done && 'text-mute line-through')}>
          <TaskTitle task={task} />
        </span>
        <MiniReactions reactions={task.reactions} />
        {!done && blocked ? (
          <State label={t('Blocked')} icon="warning" tone="danger" className="flex-none" />
        ) : task.status === 'doing' || task.status === 'review' ? (
          <TaskStatusMark status={task.status} className="flex-none" />
        ) : null}
      </span>
      {ctx ? (
        <span className="flex min-w-0 items-center gap-1.5 text-d12 text-mute @max-[600px]/mywork:hidden [&_.ic]:size-[13px] [&_svg]:size-[13px] [&_svg]:flex-none [&>span]:truncate">
          {ctx.rt ? <Icon name="routine" /> : <BrandIcon id={ctx.icon} label={false} />}
          <span>{ctx.label}</span>
        </span>
      ) : (
        <span />
      )}
      <span className="font-mono text-d11 font-medium text-mute">{more ? `+${more}` : ''}</span>
      <span className="flex justify-end @max-[600px]/mywork:hidden">
        {others.length > 0 && <AvatarBubbles ids={others} size="xs" />}
      </span>
      <span
        className={cn(
          'w-auto text-right font-mono text-d12h font-medium whitespace-nowrap text-ink-2',
          d.cls === 'late' && 'text-danger',
          d.cls === 'none' && 'text-mute',
        )}
      >
        {d.txt}
      </span>
    </div>
  );
}

function MiniReactions({ reactions }: { reactions: Record<string, string[]> }) {
  const r = Object.entries(reactions).filter(([, v]) => v.length);
  if (!r.length) return null;
  return (
    <span className="inline-flex flex-none gap-1 text-[12px]">
      {r.slice(0, 3).map(([e, v]) => (
        <i key={e} className="not-italic">
          {e}
          {v.length > 1 && <b className="ml-px font-mono text-[10.5px] font-semibold text-mute">{v.length}</b>}
        </i>
      ))}
    </span>
  );
}

/** The row for the current look. */
export function MyWorkRow({ task, more }: { task: Task; more: number | undefined }) {
  const lk = useSession((s) => look(s));
  return lk === 'comfortable' ? <R9Row task={task} more={more} /> : <CompactRow task={task} more={more} />;
}

export { Reactions };
