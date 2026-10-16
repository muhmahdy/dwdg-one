/* The task timeline (Gantt v2, owner review O6; measure-timeline, timeline_unscheduled), from screens/work.js ganttV2.
   A bar runs from planned start to due; a due-only task is a marker; undated work is listed below. My Work groups bars by
   project in each project's colours. Drag a bar or flag to move it, drag a bar's end to change its dates, or use the arrow
   keys (Shift changes the due date only); click or drag across empty days to add a task there. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { go } from '@/app/router/navigation';
import { Avatar, AvatarBubbles } from '@/components/shared/Avatar';
import { ProjectObject } from '@/components/shared/art/objects';
import { IdentityTile } from '@/components/shared/art/IdentityTile';
import { TaskIcon } from '@/components/shared/art/task-icons';
import { buttonClass, segButtonClass, segClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TaskStatusMark } from '@/components/ui/StatusBadge';
import { famMode, pal } from '@/lib/art/identity';
import { cn } from '@/lib/cn';
import { MON, MONTH, t, WD } from '@/lib/i18n';
import { addDays, D, daysBetween, dLong, dShort, today, weekday, weekStart } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi, uiStore } from '@/lib/workspace/transaction';
import type { Person, Task, Workspace } from '@/types/workspace';
import { canEditTask, isDone, joinedOf, openBlocker, projOf } from '../services/selectors';
import { addTaskOnTimeline, setTaskDates } from '../services/task-actions';
import { FLAG_D } from '@/components/ui/DateGlyph';
import { dragAcrossDays, dragBar } from './gantt-drag';
import { reactTarget } from './react-context-menu';
import { Reactions } from './Reactions';
import { TaskRow } from './TaskRow';
import { openTask } from '@/lib/open';

/** Days shown and pixels per day for each range. */
export const GR = { '1w': [21, 56], '2w': [28, 40], '1m': [49, 28], '3m': [105, 14] } as const;
type Range = keyof typeof GR;
const RANGES: [Range, string][] = [
  ['1w', '1 week'],
  ['2w', '2 weeks'],
  ['1m', '1 month'],
  ['3m', '3 months'],
];
export const gStart = () => addDays(weekStart(today()), -7);
/** New dates after moving a bar (or one of its ends) by d days. */
export const gShift = (x: Task, kind: 'move' | 'start' | 'due', d: number): [string | null, string | null] => {
  const due = x.due ?? today();
  if (kind === 'start') return [x.start ? addDays(x.start, d) : null, due];
  if (kind === 'due') {
    const e = addDays(due, d);
    return [x.start ?? null, x.start && e < x.start ? x.start : e];
  }
  return [x.start ? addDays(x.start, d) : null, addDays(due, d)];
};

const collab = (x: Task, me: string) => [
  ...new Set([x.owner, ...joinedOf(x), ...x.mentions, x.reviewer].filter((i): i is string => !!i && i !== me)),
];
const stateOf = (db: Workspace, x: Task) =>
  isDone(x)
    ? 'completed'
    : openBlocker(db, x.id)
      ? 'blocked'
      : x.status === 'review'
        ? 'review'
        : x.status === 'doing'
          ? 'active'
          : 'neutral';
const STC: Record<string, string> = {
  completed: 'var(--st-completed)',
  blocked: 'var(--danger)',
  review: 'var(--st-review-mark)',
  active: 'var(--st-active)',
  neutral: 'var(--st-neutral)',
};

interface Ghost {
  row: string;
  first: number;
  last: number;
  naming: boolean;
}

export function TaskTimeline({
  tasks,
  mine = false,
  project = null,
}: {
  tasks: Task[];
  mine?: boolean;
  project?: string | null;
}) {
  const me = useMe();
  const dragged = useRef(false);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const rangeUi = useUi((u) => u.range);
  const gWith = useUi((u) => u.gWith as string | null | undefined) ?? null;
  const db = useWorkspace((w) => w);
  const ref = useRef<HTMLDivElement>(null);
  const rg: Range = rangeUi in GR ? (rangeUi as Range) : '1m';
  const [n, px] = GR[rg];
  const start = gStart();
  const end = addDays(start, n - 1);
  const td = today();

  // Open on today (or where the person left it); Today and a range change put it back on today.
  const atToday = useUi((u) => u.ganttX == null);
  useLayoutEffect(() => {
    const g = ref.current;
    if (g)
      g.scrollLeft =
        (uiStore.get().ganttX as number | null | undefined) ?? Math.max(0, daysBetween(start, td) * px - 3 * px);
  }, [rg, start, td, px, atToday]);

  // The mouse wheel scrolls the timeline sideways until its edge, then the page scrolls as usual (owner review O6).
  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    const wheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('.lane-label') || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY))
        return;
      const max = g.scrollWidth - g.clientWidth;
      if (max <= 0 || (e.deltaY < 0 && g.scrollLeft <= 0) || (e.deltaY > 0 && g.scrollLeft >= max - 1)) return;
      e.preventDefault();
      g.scrollLeft += e.deltaY;
    };
    g.addEventListener('wheel', wheel, { passive: false });
    return () => {
      g.removeEventListener('wheel', wheel);
    };
  }, []);

  if (!me) return null;
  const days = Array.from({ length: n }, (_, i) => addDays(start, i));
  const W = n * px;
  const x = (d: string) => daysBetween(start, d) * px;
  const inR = (d: string) => d >= start && d <= end;
  const dated = tasks
    .filter((v) => v.due)
    .sort(
      (a, b) =>
        (a.start ?? a.due ?? '').localeCompare(b.start ?? b.due ?? '') || (a.due ?? '').localeCompare(b.due ?? ''),
    );
  const undated = tasks.filter((v) => !v.due);
  const months: [string, number][] = [];
  days.forEach((d, i) => {
    if (!i || D(d).getDate() === 1) months.push([d, i]);
  });
  const mLab = (d: string, w: number) => {
    const m = D(d).getMonth();
    const y = D(d).getFullYear();
    return w >= 140 ? `${MONTH()[m]} ${y}` : w >= 72 ? `${MON()[m]} ${y}` : w >= 30 ? MON()[m] : '';
  };
  const setRange = (r: Range) => {
    setUi((u) => {
      u.range = r;
      u.ganttX = null;
    });
  };

  const jump = (d: string) => {
    const i = daysBetween(start, d);
    if (i >= 0 && i < n && ref.current) ref.current.scrollLeft = Math.max(0, i * px - 3 * px);
    else setRange('3m');
  };
  const edge = (d: string) => (
    <button
      type="button"
      className={cn(
        'absolute top-3 h-6 rounded-md border-0 bg-fill px-2 font-mono text-[11px] font-medium text-mute',
        d < start ? 'left-1.5' : 'right-1.5',
      )}
      title={dLong(d)}
      onClick={() => {
        jump(d);
      }}
    >
      {d < start ? `← ${dShort(d)}` : `${dShort(d)} →`}
    </button>
  );

  const keys = (v: Task, can: boolean) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openTask(v.id);
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && can) {
      e.preventDefault();
      const [s0, d0] = gShift(v, e.shiftKey ? 'due' : 'move', e.key === 'ArrowRight' ? 1 : -1);
      void setTaskDates(v.id, s0, d0);
    }
  };

  const bar = (v: Task) => {
    const due = v.due ?? today();
    const st = stateOf(db, v);
    const late = !isDone(v) && due < td;
    const can = canEditTask(db, me, v);
    const p0 = projOf(db, v.project);
    const dim = mine && gWith && !collab(v, me.id).includes(gWith);
    const what = `${v.title}. ${v.start ? `${dLong(v.start)} – ${dLong(due)}` : `${t('Due')} ${dLong(due)}`}${late ? `, ${t('overdue')}` : ''}`;
    const hint = can
      ? t('Use the arrow keys to move it.')
      : t('Only {who} or the project lead can change this task', {
          who: db.people.find((p) => p.id === v.owner)?.first ?? t('Someone'),
        });
    const people = mine ? collab(v, me.id) : [];
    const hasReactions = Object.values(v.reactions).some((r) => r.length > 0);
    const side = (left: number, title: boolean, date: boolean) =>
      title || late || date || people.length > 0 || hasReactions ? (
        <span
          className="pointer-events-none absolute top-1/2 z-3 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap"
          style={{ left }}
        >
          {date && (
            <span className={cn('inline-flex items-center gap-0.5 text-d11h text-ink-2', late && 'text-danger')}>
              <TaskIcon icon={v.icon} size="xs" />
              <span className="type-num">{dShort(due)}</span>
            </span>
          )}
          {title && (
            <span className="max-w-[320px] overflow-hidden text-d12h font-[550] text-ellipsis text-ink-2">
              {v.title}
            </span>
          )}
          {late && <b className="text-d11h font-semibold text-danger">{t('overdue')}</b>}
          {people.length > 0 && <AvatarBubbles ids={people} size="xs" className="pointer-events-auto" />}
          <Reactions kind="task" id={v.id} reactions={v.reactions} className="pointer-events-auto m-0 flex-nowrap" />
        </span>
      ) : null;
    const common = {
      tabIndex: 0,
      role: 'button',
      'aria-label': what,
      title: `${what}. ${hint}`,
      'data-gt': v.id,
      ...reactTarget('task', v.id),
      onClick: () => {
        if (dragged.current) return;
        openTask(v.id);
      },
      onKeyDown: keys(v, can),
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (!can) return;
        dragBar(
          e,
          px,
          (kind, d) => {
            const [s0, d0] = gShift(v, kind, d);
            void setTaskDates(v.id, s0, d0);
          },
          dragged,
        );
      },
    } as const;
    const handle = (side: 'start' | 'due') =>
      can ? (
        <i
          data-gk={side}
          className={cn(
            'absolute inset-y-0 z-2 w-2 cursor-ew-resize hover:bg-[color-mix(in_srgb,var(--c)_30%,transparent)]',
            side === 'start' ? 'left-0' : 'right-0',
          )}
        />
      ) : null;
    if (v.start && v.start <= due) {
      if (due < start || v.start > end) return edge(due < start ? due : v.start);
      const l = x(v.start);
      const w = (daysBetween(v.start, due) + 1) * px - 4;
      const fit = v.title.length * 6.8 + 26 <= w - 14 - (v.icon ? 20 : 0);
      const lk = p0?.look ?? { f: 0, p: 0 };
      return (
        <>
          <div
            {...common}
            className={cn(
              'absolute ml-0.5 flex items-center overflow-hidden text-d12h font-[550] whitespace-nowrap text-ink focus-visible:shadow-[var(--focus)]',
              mine
                ? 'top-[9px] h-[30px] rounded-full bg-fill px-1 shadow-[0_1px_2px_rgb(22_22_21/14%),inset_0_0_0_1px_rgb(0_0_0/8%)] transition-[transform,box-shadow] hover:-translate-y-px motion-reduce:transition-none'
                : 'top-2.5 h-7 gap-1.5 rounded-[7px] bg-[color-mix(in_srgb,var(--c)_16%,var(--surface))] pr-2 pl-1 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--c)_45%,transparent)]',
              mine &&
                !p0 &&
                'bg-[repeating-linear-gradient(135deg,var(--fill)_0_6px,var(--surface-2)_6px_12px)] shadow-[inset_0_0_0_1px_var(--line-strong)]',
              mine && st === 'completed' && 'opacity-65 saturate-[.2]',
              late && (mine ? 'shadow-[0_0_0_2px_var(--danger)]' : 'shadow-[inset_0_0_0_1.5px_var(--danger)]'),
              can
                ? 'cursor-grab [&.dragging]:z-5 [&.dragging]:cursor-grabbing [&.dragging]:shadow-pop'
                : 'cursor-pointer',
              dim && 'opacity-[.22] grayscale',
            )}
            style={{ left: l, width: w, ['--c' as string]: STC[st] }}
          >
            {handle('start')}
            {mine && p0 && (
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                <IdentityTile
                  seed={`project:${p0.id}`}
                  mode={famMode(lk.f)}
                  palette={lk.p}
                  className="absolute inset-0 size-full rounded-none shadow-none"
                />
              </span>
            )}
            <span
              className={cn(
                'sticky z-1 inline-flex min-w-0 items-center gap-1.5 overflow-hidden',
                mine ? 'left-[calc(var(--lw)+4px)]' : 'left-[246px] max-[760px]:left-[156px]',
              )}
            >
              {mine ? (
                (fit || v.icon) && (
                  <span
                    className={cn(
                      'inline-flex h-[22px] max-w-full items-center gap-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] text-d12 font-semibold text-ink shadow-[0_1px_2px_rgb(22_22_21/16%)]',
                      fit ? 'px-[9px]' : 'px-[5px]',
                    )}
                  >
                    <TaskIcon icon={v.icon} size="xs" />
                    {fit && <span className="overflow-hidden text-ellipsis">{v.title}</span>}
                  </span>
                )
              ) : (
                <>
                  <TaskIcon icon={v.icon} size="xs" />
                  {fit && (
                    <span
                      className={cn('overflow-hidden text-ellipsis', st === 'completed' && 'text-mute line-through')}
                    >
                      {v.title}
                    </span>
                  )}
                </>
              )}
            </span>
            {mine && isDone(v) && (
              <span className="absolute top-1/2 right-1.5 z-1 -mt-[9px] grid size-[18px] place-items-center rounded-full bg-green text-white [&_.ic]:size-3">
                <Icon name="check" size="xs" />
              </span>
            )}
            {handle('due')}
          </div>
          {side(l + w + 8, !fit, false)}
        </>
      );
    }
    if (!inR(due)) return edge(due);
    const cx = x(due) + px / 2;
    const c = mine ? (p0 ? pal((p0.look ?? { f: 0, p: 0 }).p)[2] : 'var(--ink-2)') : STC[st];
    return (
      <>
        <div
          {...common}
          className={cn(
            'absolute flex items-center gap-1.5',
            mine ? 'top-[11px] -translate-x-[13px]' : 'top-3 -translate-x-[7px]',
            can ? 'cursor-grab' : 'cursor-pointer',
            dim && 'opacity-[.22] grayscale',
          )}
          style={{ left: cx, ['--c' as string]: c }}
        >
          {mine ? (
            <i
              className={cn(
                'grid size-[26px] place-items-center rounded-full bg-surface text-[var(--c)] shadow-[0_0_0_1.5px_var(--c),0_1px_3px_rgb(22_22_21/18%)] [&_svg]:size-[15px]',
                late && 'text-danger shadow-[0_0_0_2px_var(--danger)]',
                st === 'completed' && 'bg-green text-white shadow-none',
              )}
            >
              {isDone(v) ? (
                <Icon name="check" size="sm" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={FLAG_D} />
                </svg>
              )}
            </i>
          ) : (
            <i
              className={cn(
                'size-3.5 flex-none rounded-full bg-surface shadow-[inset_0_0_0_3px_var(--c)]',
                late && 'shadow-[inset_0_0_0_3px_var(--danger)]',
                st === 'completed' && 'bg-st-completed shadow-none',
              )}
            />
          )}
        </div>
        {side(cx + (mine ? 18 : 12), false, true)}
      </>
    );
  };

  const label =
    'lane-label sticky left-0 z-5 flex min-h-12 w-[var(--lw)] flex-none items-center gap-2 px-3 text-d13h shadow-[1px_0_0_var(--line-strong)] select-none';
  const glass =
    'bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-[16px] backdrop-saturate-[1.4] group-hover/grow:bg-[color-mix(in_srgb,color-mix(in_srgb,var(--ink)_5%,var(--surface))_80%,transparent)]';
  const commitGhost = (g: Ghost, text: string) => {
    setGhost(null);
    const name = text.trim();
    if (!name) return;
    void addTaskOnTimeline(name, addDays(start, g.first), addDays(start, g.last), project);
  };
  const track = (children: React.ReactNode, row: string, className?: string) => {
    const g = ghost?.row === row ? ghost : null;
    const a = g ? Math.min(g.first, g.last) : 0;
    const len = g ? Math.abs(g.last - g.first) + 1 : 0;
    return (
      <div
        className={cn('relative min-h-12 flex-none cursor-cell', className)}
        style={{ width: W }}
        onPointerDown={(e) => {
          const el = e.target as HTMLElement;
          if (el.closest('[data-gt], button, a, input')) return;
          dragAcrossDays(
            e,
            px,
            (first, last) => {
              setGhost({ row, first, last, naming: false });
            },
            (first, last) => {
              setGhost({ row, first, last, naming: true });
            },
          );
        }}
      >
        {children}
        {g && (
          <div
            className={cn(
              'absolute top-2 z-6 flex h-8 min-w-6 items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--green)_10%,var(--surface))] px-1.5 shadow-[inset_0_0_0_1.5px_var(--green)]',
              g.naming && 'min-w-[300px] bg-surface shadow-[inset_0_0_0_1.5px_var(--green),var(--e-pop)]',
            )}
            style={{ left: a * px, width: len * px - 4 }}
          >
            {g.naming && (
              <GhostInput
                from={addDays(start, a)}
                to={addDays(start, a + len - 1)}
                onDone={(text) => {
                  commitGhost(g, text);
                }}
                onCancel={() => {
                  setGhost(null);
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };
  const taskRow = (v: Task, i: number) => (
    <div key={v.id} className={cn('group/grow relative flex min-w-max', i > 0 && 'shadow-[inset_0_1px_0_var(--line)]')}>
      <div
        className={cn(label, glass, 'cursor-pointer', mine && 'pl-[22px]')}
        tabIndex={0}
        role="button"
        onClick={() => {
          openTask(v.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') openTask(v.id);
        }}
      >
        <TaskStatusMark status={v.status} bare className="gap-0" />
        <span className={cn('block min-w-0 flex-1 truncate', isDone(v) && 'text-mute line-through')} title={v.title}>
          <TaskIcon icon={v.icon} size="xs" className="mr-1.5" />
          {v.title}
        </span>
      </div>
      {track(bar(v), v.id)}
    </div>
  );

  const rows: React.ReactNode[] = [];
  if (mine) {
    const groups = [...new Set(dated.map((v) => v.project ?? ''))].sort(
      (a, b) => Number(!a) - Number(!b) || (projOf(db, a)?.name ?? '').localeCompare(projOf(db, b)?.name ?? ''),
    );
    for (const k of groups) {
      const p0 = projOf(db, k);
      const ts = dated.filter((v) => (v.project ?? '') === k);
      rows.push(
        <div
          key={`g-${k}`}
          className={cn(
            'group/grow relative flex min-w-max bg-[color-mix(in_srgb,var(--fill)_55%,transparent)]',
            rows.length > 0 && 'shadow-[inset_0_1px_0_var(--line)]',
          )}
        >
          <div
            className={cn(
              label,
              'min-h-10 gap-2.5 bg-[color-mix(in_srgb,color-mix(in_srgb,var(--fill)_55%,var(--surface))_82%,transparent)] backdrop-blur-[16px]',
              p0 && 'cursor-pointer',
            )}
            {...(p0
              ? {
                  tabIndex: 0,
                  role: 'link',
                  onClick: () => {
                    go(`projects/${p0.id}`);
                  },
                }
              : {})}
          >
            {p0 ? (
              <ProjectObject project={p0} size="xs" />
            ) : (
              <span className="grid h-[18px] w-[22px] place-items-center rounded-[5px] bg-surface text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
                <Icon name="person" size="sm" />
              </span>
            )}
            <b className="min-w-0 flex-1 truncate text-d13 font-[650]">
              {p0 ? p0.name : t('Personal and division tasks')}
            </b>
            <span className="text-mute type-num">{ts.length}</span>
          </div>
          {track(
            p0?.due && inR(p0.due) && (
              <i
                className="absolute top-2 bottom-2 -ml-px w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--ink-2)_0_3px,transparent_3px_6px)] opacity-50"
                style={{ left: x(p0.due) + px / 2 }}
                title={t('Project target {d}', { d: dLong(p0.due) })}
              />
            ),
            `g-${k}`,
            'min-h-10',
          )}
        </div>,
      );
      ts.forEach((v) => rows.push(taskRow(v, 1)));
    }
  } else dated.forEach((v, i) => rows.push(taskRow(v, i)));
  rows.push(
    <div key="add" className="group/grow relative flex min-w-max shadow-[inset_0_1px_0_var(--line)]">
      <div className={cn(label, glass, 'cursor-default text-mute [&_.ic]:text-mute')}>
        <Icon name="plus" size="sm" />
        <span className="block min-w-0 flex-1 truncate">{t('Add a task')}</span>
      </div>
      {track(
        <span className="pointer-events-none sticky left-[calc(var(--lw)+12px)] mt-[15px] inline-block text-d12 text-faint group-hover/grow:text-mute">
          {t('Click or drag across days to add a task')}
        </span>,
        'add',
      )}
    </div>,
  );

  return (
    <>
      <div className="mt-3.5 mb-2 flex flex-wrap items-center gap-3 gap-y-2">
        <div className={segClass} role="radiogroup" aria-label={t('Range')}>
          {RANGES.map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={rg === k}
              className={segButtonClass(rg === k)}
              onClick={() => {
                setRange(k);
              }}
            >
              {t(l)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={buttonClass('default', true)}
          onClick={() => {
            setRange(rg);
          }}
        >
          {t('Today')}
        </button>
        <span className="text-mute type-small">
          {dShort(start)} – {dShort(end)}
        </span>
      </div>
      {mine && <Strip tasks={tasks} me={me} gWith={gWith} />}
      <div
        ref={ref}
        className="group/gantt relative mt-1 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-sheet bg-surface shadow-[0_0_0_1px_var(--line-strong)] [--lw:240px] max-[760px]:[--lw:150px]"
        onScroll={(e) => {
          const x0 = e.currentTarget.scrollLeft;
          setUi((u) => {
            u.ganttX = x0;
          });
        }}
      >
        <div className="sticky top-0 z-6 flex min-w-max bg-surface shadow-[inset_0_-1px_0_var(--line-strong)]">
          <div className={cn(label, 'min-h-14 items-end bg-surface pb-2 text-mute type-caption', mine && 'pl-[22px]')}>
            {mine ? t('Your tasks') : t('Task')}
          </div>
          <div className="relative min-h-14 flex-none" style={{ width: W }}>
            <div className="relative h-[26px]">
              {months.map(([d, i], k) => {
                const w = ((months[k + 1]?.[1] ?? n) - i) * px;
                return (
                  <span
                    key={d}
                    className="absolute top-1.5 overflow-clip pl-2 text-d12 font-semibold whitespace-nowrap shadow-[inset_1px_0_0_var(--line-strong)]"
                    style={{ left: i * px, width: w }}
                  >
                    <b className="sticky left-[calc(var(--lw)+8px)] font-semibold">{mLab(d, w)}</b>
                  </span>
                );
              })}
            </div>
            <div className="flex h-[30px]">
              {days.map((d) => (
                <span
                  key={d}
                  className={cn(
                    'relative z-0 grid flex-none place-items-center content-center font-mono text-d11 leading-[1.1] font-medium text-mute',
                    weekday(d) > 5 && 'text-faint',
                    d === td &&
                      "text-on-ink before:absolute before:-z-1 before:size-6 before:rounded-full before:bg-ink before:content-['']",
                  )}
                  style={{ width: px }}
                >
                  {px >= 40 && (
                    <small className="block font-sans text-d10 font-medium">{WD()[D(d).getDay()]?.slice(0, 2)}</small>
                  )}
                  {px >= 24 || weekday(d) === 1 ? D(d).getDate() : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-[var(--lw)] z-0"
            style={{
              width: W,
              backgroundImage: `repeating-linear-gradient(to right, transparent 0 ${px - 1}px, var(--line) ${px - 1}px ${px}px)`,
            }}
          >
            {days.map((d, i) =>
              weekday(d) > 5 ? (
                <i
                  key={d}
                  className="absolute inset-y-0 bg-[color-mix(in_srgb,var(--fill)_70%,transparent)]"
                  style={{ left: i * px, width: px }}
                />
              ) : null,
            )}
            {inR(td) && (
              <>
                {mine && (
                  <i
                    className="absolute inset-y-0 bg-[color-mix(in_srgb,var(--green)_8%,transparent)]"
                    style={{ left: x(td), width: px }}
                  />
                )}
                <i className="absolute inset-y-0 z-0 -ml-px w-0.5 bg-green" style={{ left: x(td) + px / 2 }} />
              </>
            )}
          </div>
          {rows}
        </div>
      </div>
      {undated.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 type-h3">
            {t('No date')} <span className="ml-1 text-mute type-num">{undated.length}</span>
          </h2>
          <div>
            {undated.map((v) => (
              <TaskRow key={v.id} task={v} />
            ))}
          </div>
        </>
      )}
      <p className="mt-3.5 text-mute type-small">
        {mine
          ? t(
              'Each bar wears its project’s pattern; flags are due dates. Pick a face above to see what you share with them. Click or drag on empty days to add a task. Right-click to react.',
            )
          : t(
              'Bars run from planned start to due date. Click or drag on empty days to add a task. Right-click to react.',
            )}
      </p>
    </>
  );
}

/** My Work's strip: due this week, overdue, in progress, and the people you work with as a filter. */
function Strip({ tasks, me, gWith }: { tasks: Task[]; me: Person; gWith: string | null }) {
  const names = useWorkspace((db) => Object.fromEntries(db.people.map((p) => [p.id, p.name])));
  const td = today();
  const wk = addDays(weekStart(td), 6);
  const open = tasks.filter((v) => !isDone(v));
  const people = [...new Set(tasks.flatMap((v) => collab(v, me.id)))];
  const overdue = open.filter((v) => v.due && v.due < td).length;
  const k = (nn: number, l: string, bad = false) => (
    <div className="flex items-baseline gap-1.5 rounded-xl bg-surface-2 px-3.5 py-2 shadow-[inset_0_0_0_1px_var(--line)]">
      <b className={cn('text-[19px]! leading-none type-num', bad && 'text-danger')}>{nn}</b>
      <span className="text-d13 text-ink-2">{l}</span>
    </div>
  );
  return (
    <div className="mt-1.5 mb-3 flex flex-wrap items-center gap-2">
      {k(open.filter((v) => v.due && v.due >= td && v.due <= wk).length, t('due this week'))}
      {k(overdue, t('overdue'), overdue > 0)}
      {k(open.filter((v) => v.status === 'doing').length, t('in progress'))}
      {people.length > 0 && (
        <div className="ml-auto flex items-center gap-0.5 rounded-full bg-surface-2 py-1 pr-1.5 pl-3 shadow-[inset_0_0_0_1px_var(--line)]">
          <span className="mr-1.5 text-d12h text-ink-2">{t('Working with')}</span>
          {people.map((id) => (
            <button
              key={id}
              type="button"
              className={cn(
                'grid cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0.5 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none',
                gWith === id && 'shadow-[0_0_0_2px_var(--green)]',
              )}
              title={
                gWith === id ? t('Show all tasks') : t('Show tasks with {who}', { who: names[id] ?? t('Someone') })
              }
              aria-pressed={gWith === id}
              onClick={() => {
                setUi((u) => {
                  u.gWith = u.gWith === id ? null : id;
                });
              }}
            >
              <Avatar id={id} size="sm" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** The name field inside the ghost bar: Enter adds the task, Escape or leaving the field (with nothing typed) cancels. */
function GhostInput({
  from,
  to,
  onDone,
  onCancel,
}: {
  from: string;
  to: string;
  onDone: (text: string) => void;
  onCancel: () => void;
}) {
  const finished = useRef(false);
  const finish = (text: string) => {
    if (finished.current) return;
    finished.current = true;
    onDone(text);
  };
  return (
    <>
      <input
        className="h-[26px] min-w-[200px] flex-1 border-0 bg-transparent text-[13px] outline-none"
        placeholder={t('Task name, then Enter')}
        aria-label={t('New task from {a} to {b}', { a: dLong(from), b: dLong(to) })}
        autoFocus
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
            finish(e.currentTarget.value);
          } else if (e.key === 'Escape') {
            finished.current = true;
            onCancel();
          }
        }}
        onBlur={(e) => {
          const text = e.currentTarget.value;
          setTimeout(() => {
            finish(text);
          }, 120);
        }}
      />
      <small className="flex-none text-[11px] text-mute type-num">
        {from === to ? dShort(from) : `${dShort(from)} – ${dShort(to)}`}
      </small>
    </>
  );
}
