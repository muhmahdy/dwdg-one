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
import { openMenu } from '@/components/shared/menus';
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
import { achieveMilestone, linkTaskToMilestone } from '@/features/projects/services/milestones';
import { msLateOf, projMs } from '@/features/projects/services/project-rules';
import {
  isUnder,
  moveSib,
  rollup,
  setMsDate,
  wbsDrop,
  wbsFlat,
  wbsIndent,
  type DropMode,
} from '@/features/projects/services/wbs';
import { plural } from '@/lib/i18n';
import { openMilestone } from '@/lib/open';
import { canEditTask, isDone, joinedOf, openBlocker, projOf, taskPeople } from '../services/selectors';
import { addDep, addTaskOnTimeline, depOk, fixPlan, predsOf, rangeTxt, setTaskDates } from '../services/task-actions';
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

/** Where a dragged name would land in the project timeline: beside a row (a line) or inside it (a box). */
interface DropMark {
  mode: DropMode;
  id: string;
  top: number;
  height: number;
  left: number;
  label: string;
}

const RH = 48;

/** As many faces as fit, then +n, on one line (the prototype's .faces). */
function Faces({ ids, cap }: { ids: string[]; cap: number }) {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return null;
  const k = uniq.length <= cap ? uniq.length : Math.max(1, cap - 1);
  const more = uniq.length - k;
  return (
    <span className="mr-0.5 inline-flex flex-none">
      {uniq.slice(0, k).map((i, n) => (
        <Avatar key={i} id={i} size="xs" className={cn('shadow-[0_0_0_1.5px_var(--surface)]', n > 0 && '-ml-[7px]')} />
      ))}
      {more > 0 && (
        <span className="-ml-[7px] inline-grid h-5 min-w-5 place-items-center rounded-[10px] bg-fill px-1 font-mono text-[10px] font-semibold text-ink-2 shadow-[0_0_0_1.5px_var(--surface)]">
          +{more}
        </span>
      )}
    </span>
  );
}
const GC =
  'absolute top-1/2 z-4 -mt-[5px] size-2.5 cursor-crosshair rounded-full bg-surface opacity-0 shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--ink)_45%,transparent)] transition-opacity duration-100 group-hover/grow:opacity-100 group-[.linking]/gantt:opacity-100 hover:bg-green-soft hover:shadow-[inset_0_0_0_2px_var(--green)] motion-reduce:transition-none';

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
  const [gmark, setGmark] = useState<DropMark | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tmpRef = useRef<SVGPathElement>(null);
  const gcolUi = useUi((u) => u.gcol as Record<string, boolean> | undefined);
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
  const pj = project ? projOf(db, project) : undefined;
  const gcol = gcolUi ?? {};
  const pos: Record<string, { x1: number; x2: number; y: number }> = {};
  const rightLinked = new Set<string>();
  const dated = tasks
    .filter((v) => v.due)
    .sort(
      (a, b) =>
        (pj ? (a.order ?? 1e6) - (b.order ?? 1e6) : 0) ||
        (a.start ?? a.due ?? '').localeCompare(b.start ?? b.due ?? '') ||
        (a.due ?? '').localeCompare(b.due ?? ''),
    );
  const undated = pj ? [] : tasks.filter((v) => !v.due);
  if (pj)
    for (const v of dated)
      for (const d of predsOf(db, v)) {
        if (d.type.startsWith('F')) rightLinked.add(d.id);
        if (d.type.endsWith('F')) rightLinked.add(v.id);
      }
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

  const bar = (v: Task, i = 0) => {
    const y = i * RH + RH / 2;
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
      const ppl = taskPeople(v);
      const room = w - 14 - (v.icon ? 20 : 0);
      const faceW = (c: number) => (c ? 20 + (c - 1) * 13 : 0);
      const fit = v.title.length * 6.8 + 16 + (mine ? 10 : faceW(ppl.length)) <= room;
      const cap = fit ? ppl.length : Math.max(1, Math.floor((room - 20) / 13) + 1);
      const lk = p0?.look ?? { f: 0, p: 0 };
      if (pj) pos[v.id] = { x1: l, x2: l + w, y };
      return (
        <>
          {conn(v, l, l + w, y)}
          <div
            {...common}
            className={cn(
              'absolute ml-0.5 flex items-center overflow-clip text-d12h font-[550] whitespace-nowrap text-ink focus-visible:shadow-[var(--focus)]',
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
                  <Faces ids={ppl} cap={cap} />
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
          {side(l + w + (rightLinked.has(v.id) ? 22 : 8), !fit, false)}
        </>
      );
    }
    if (!inR(due)) return edge(due);
    const cx = x(due) + px / 2;
    if (pj) pos[v.id] = { x1: cx - 7, x2: cx + 7, y };
    const c = mine ? (p0 ? pal((p0.look ?? { f: 0, p: 0 }).p)[2] : 'var(--ink-2)') : STC[st];
    return (
      <>
        {conn(v, cx - 7, cx + 7, y)}
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
          if (el.closest('[data-gt], [data-ms], button, a, input')) return;
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

  const projectMs = pj ? projMs(db, pj).filter((m) => m.target) : [];
  // ---------- project mode: the plan with its WBS, milestones and links ----------

  /** The two dots at a bar's ends: drag one onto another bar to link them (which ends you join sets FS, SS, FF or SF). */
  const conn = (v: Task, xs: number, xe: number, y: number) =>
    pj ? (
      <>
        <i
          className={GC}
          data-gc="S"
          style={{ left: xs - 12 }}
          title={t('Drag to another task to link')}
          onPointerDown={(e) => {
            linkDown(e, v, 'S', xs, y);
          }}
        />
        <i
          className={GC}
          data-gc="F"
          style={{ left: xe + 2 }}
          title={t('Drag to another task to link')}
          onPointerDown={(e) => {
            linkDown(e, v, 'F', xe, y);
          }}
        />
      </>
    ) : null;

  const linkDown = (e: React.PointerEvent<HTMLElement>, src: Task, gc: 'S' | 'F', xa: number, ya: number) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const g = ref.current;
    const svg = svgRef.current;
    const tmp = tmpRef.current;
    if (!g || !svg || !tmp) return;
    const dot = e.currentTarget;
    dot.dataset.on = '1';
    g.classList.add('linking');
    let hot: HTMLElement | null = null;
    const clear = (el: HTMLElement | null) => {
      el?.classList.remove('g-target', 'to-s', 'to-f');
    };
    const move = (ev: PointerEvent) => {
      const sr = svg.getBoundingClientRect();
      tmp.setAttribute('d', `M${xa} ${ya} L${ev.clientX - sr.left} ${ev.clientY - sr.top}`);
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const tg = el?.closest<HTMLElement>('[data-gt], [data-ms]') ?? null;
      if (hot && hot !== tg) clear(hot);
      hot = tg && tg.dataset.gt !== src.id ? tg : null;
      if (hot) {
        const r = hot.getBoundingClientRect();
        const s = ev.clientX < r.left + r.width / 2;
        hot.classList.add('g-target', s ? 'to-s' : 'to-f');
        hot.classList.remove(s ? 'to-f' : 'to-s');
      }
    };
    const up = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      tmp.setAttribute('d', '');
      delete dot.dataset.on;
      g.classList.remove('linking');
      if (!hot) return;
      const target = hot;
      clear(target);
      const msId = target.dataset.ms;
      if (msId) {
        if (!canEditTask(db, me, src)) return;
        void linkTaskToMilestone(src.id, msId);
        return;
      }
      const r = target.getBoundingClientRect();
      const end = ev.clientX < r.left + r.width / 2 ? 'S' : 'F';
      void addDep(target.dataset.gt ?? '', src.id, `${gc}${end}`);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  /** Drag a name up or down to reorder it, or onto the right half of another to make it a part of that one. */
  const labelDown = (e: React.PointerEvent<HTMLElement>, id: string) => {
    const body = bodyRef.current;
    const g = ref.current;
    if (!body || !g || e.button !== 0 || (e.target as HTMLElement).closest('button, a')) return;
    const y0 = e.clientY;
    const rowEl = e.currentTarget.closest<HTMLElement>('[data-grow]');
    let on = false;
    let drop: { mode: DropMode; id: string } | null = null;
    const move = (ev: PointerEvent) => {
      if (!on && Math.abs(ev.clientY - y0) < 6) return;
      if (!on) {
        on = true;
        document.body.classList.add('select-none');
        rowEl?.classList.add('opacity-55');
      }
      const gb = body.getBoundingClientRect();
      const hit = [...g.querySelectorAll<HTMLElement>('[data-gdrag]')].find((r) => {
        const b = r.getBoundingClientRect();
        return ev.clientY >= b.top && ev.clientY < b.bottom;
      });
      drop = null;
      setGmark(null);
      const hid = hit?.dataset.gdrag ?? '';
      const target = db.tasks.find((x) => x.id === hid);
      if (!hit || !target || hid === id || isUnder(db, target, id)) return;
      const b = hit.getBoundingClientRect();
      const placed = !!(target.inWbs || target.parent);
      if (placed && ev.clientX > b.left + b.width / 2) {
        drop = { mode: 'in', id: target.id };
        setGmark({
          ...drop,
          top: b.top - gb.top,
          height: b.height,
          left: 0,
          label: t('Make it a part of {t}', { t: target.title }),
        });
      } else {
        const after = ev.clientY > b.top + b.height / 2;
        drop = { mode: after ? 'after' : 'before', id: target.id };
        setGmark({
          ...drop,
          top: (after ? b.bottom : b.top) - gb.top - 1,
          height: 0,
          left: parseFloat(getComputedStyle(hit).paddingLeft) - 4,
          label: '',
        });
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.body.classList.remove('select-none');
      rowEl?.classList.remove('opacity-55');
      setGmark(null);
      if (!on) return;
      dragged.current = true;
      setTimeout(() => {
        dragged.current = false;
      }, 0);
      if (drop) void wbsDrop(id, drop);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  const labelKeys = (id: string) => (e: React.KeyboardEvent) => {
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      void wbsIndent(id, e.key === 'ArrowRight' ? 1 : -1);
    } else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      void moveSib(id, e.key === 'ArrowUp' ? -1 : 1);
    } else if (e.key === 'Enter' && e.target === e.currentTarget) openTask(id);
  };

  const canMs = (m: { owner: string }) =>
    !!pj && (m.owner === me.id || pj.lead === me.id || pj.pm === me.id || me.admin);
  let ri = 0;
  const divider = (i: number) => i > 0 && 'shadow-[inset_0_1px_0_var(--line)]';
  const indent = (depth: number) => ({ paddingLeft: `calc(12px + ${depth} * 18px)` });

  const msRowP = (m: (typeof projectMs)[number], depth = 0) => {
    const i = ri++;
    const linked = db.tasks.filter((x) => x.milestone === m.id && !x.trashed);
    const k = linked.filter(isDone).length;
    const can = canMs(m);
    const done = m.state === 'achieved';
    const late = msLateOf(m);
    const cx = x(m.target) + px / 2;
    if (inR(m.target)) pos[`ms:${m.id}`] = { x1: cx - 8, x2: cx + 8, y: i * RH + RH / 2 };
    return (
      <div
        key={`ms-${m.id}`}
        className={cn(
          'g-ms group/grow relative flex min-w-max bg-[color-mix(in_srgb,var(--fill)_45%,transparent)]',
          divider(i),
        )}
        data-grow=""
      >
        <div className={cn(label, glass, 'gap-2.5')} style={indent(depth)}>
          {done ? (
            <span
              className="grid size-[18px] flex-none scale-[.86] rotate-45 place-items-center rounded-[4px] bg-green text-white shadow-none [&_.ic]:size-3 [&_.ic]:-rotate-45"
              title={t('Achieved')}
            >
              <Icon name="check" size="xs" />
            </span>
          ) : can && m.state !== 'cancelled' ? (
            <button
              type="button"
              className="grid size-[18px] flex-none scale-[.86] rotate-45 cursor-pointer place-items-center rounded-[4px] border-0 bg-surface p-0 shadow-[inset_0_0_0_1.5px_var(--ink-2)] hover:bg-green-soft hover:shadow-[inset_0_0_0_2px_var(--green)]"
              title={t('Record as achieved')}
              aria-label={t('Record {m} as achieved', { m: m.title })}
              onClick={() => {
                void achieveMilestone(m.id);
              }}
            />
          ) : (
            <span className="grid size-[18px] flex-none scale-[.86] rotate-45 place-items-center rounded-[4px] bg-surface shadow-[inset_0_0_0_1.5px_var(--ink-2)]" />
          )}
          <span
            className="grid min-w-0 flex-1 cursor-pointer gap-px"
            role="button"
            tabIndex={0}
            onClick={() => {
              openMilestone(m.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') openMilestone(m.id);
            }}
          >
            <b className="truncate font-semibold">{m.title}</b>
            <small className={cn('text-d11h text-mute', late && 'text-danger')}>
              {plural(linked.length, '{n} task', '{n} tasks')}, {k} {t('done')}
            </small>
          </span>
        </div>
        {track(
          !inR(m.target) ? (
            edge(m.target)
          ) : (
            <>
              <i
                className={cn(
                  'absolute top-1/2 z-3 -mt-2 -ml-2 grid size-4 rotate-45 place-items-center rounded-[2px] bg-ink-2 shadow-[0_0_0_2px_var(--surface)] hover:scale-[1.2] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus-ring [&_.ic]:size-2.5 [&_.ic]:-rotate-45 [&_.ic]:text-white',
                  done && 'bg-green',
                  late && 'bg-danger',
                  can
                    ? 'cursor-ew-resize [&.dragging]:scale-125 [&.dragging]:shadow-[0_0_0_3px_var(--green-soft)]'
                    : 'cursor-pointer',
                )}
                data-ms={m.id}
                tabIndex={0}
                role="button"
                style={{ left: cx }}
                aria-label={`${m.title}, ${dLong(m.target)}`}
                title={`${m.title}, ${dLong(m.target)}${can ? `. ${t('Drag, or use the arrow keys, to move it')}` : ''}`}
                onClick={() => {
                  if (!dragged.current) openMilestone(m.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openMilestone(m.id);
                  else if (can && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                    e.preventDefault();
                    void setMsDate(m.id, addDays(m.target, e.key === 'ArrowRight' ? 1 : -1));
                  }
                }}
                onPointerDown={(e) => {
                  if (!can) return;
                  dragBar(
                    e,
                    px,
                    (_kind, d) => {
                      void setMsDate(m.id, addDays(m.target, d));
                    },
                    dragged,
                  );
                }}
              >
                {done && <Icon name="check" size="xs" />}
              </i>
              <span
                className="pointer-events-none absolute top-1/2 z-3 flex -translate-y-1/2 items-center"
                style={{ left: cx + 14 }}
              >
                <span className={cn('text-d11h text-ink-2 type-num', late && 'text-danger')}>{dShort(m.target)}</span>
              </span>
            </>
          ),
          `ms-${m.id}`,
        )}
      </div>
    );
  };

  const sumRowP = (f: { o: Task; depth: number; code: string }) => {
    const i = ri++;
    const v = f.o;
    const ru = rollup(db, v);
    const col = !!gcol[v.id];
    let bar0: React.ReactNode = null;
    if (ru.s && ru.e && !(ru.e < start || ru.s > end)) {
      const a = ru.s < start ? start : ru.s;
      const b = ru.e > end ? end : ru.e;
      const l = x(a);
      const w = (daysBetween(a, b) + 1) * px - 4;
      bar0 = (
        <>
          <div
            className={cn(
              "absolute top-[18px] h-3 cursor-pointer rounded-[3px] bg-[color-mix(in_srgb,var(--ink)_16%,var(--surface))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--ink)_28%,transparent)] before:absolute before:top-0 before:left-0 before:h-[18px] before:w-[3px] before:rounded-b-[2px] before:bg-[color-mix(in_srgb,var(--ink)_55%,transparent)] before:content-[''] after:absolute after:top-0 after:right-0 after:h-[18px] after:w-[3px] after:rounded-b-[2px] after:bg-[color-mix(in_srgb,var(--ink)_55%,transparent)] after:content-['']",
              v.phase &&
                'bg-[color-mix(in_srgb,var(--green)_14%,var(--surface))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--green)_45%,transparent)] before:bg-green after:bg-green',
            )}
            style={{ left: l, width: w }}
            role="button"
            tabIndex={0}
            title={`${v.title}: ${rangeTxt({ s: ru.s, e: ru.e })}, ${ru.done}/${ru.total} ${t('done')}`}
            onClick={() => {
              openTask(v.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') openTask(v.id);
            }}
          >
            <i
              className={cn(
                'absolute inset-y-0 left-0 rounded-[3px] bg-[color-mix(in_srgb,var(--ink)_55%,transparent)]',
                v.phase && 'bg-green',
              )}
              style={{ width: `${ru.total ? (ru.done / ru.total) * 100 : 0}%` }}
            />
          </div>
          <span
            className="pointer-events-none absolute top-1/2 z-3 flex -translate-y-1/2 items-center"
            style={{ left: l + w + 8 }}
          >
            <span className="text-d11h text-ink-2 type-num">{rangeTxt({ s: ru.s, e: ru.e })}</span>
          </span>
        </>
      );
    }
    return (
      <div
        key={v.id}
        className={cn(
          'group/grow relative flex min-w-max',
          divider(i),
          v.phase && 'bg-[color-mix(in_srgb,var(--fill)_50%,transparent)]',
        )}
        data-grow=""
      >
        <div
          className={cn(
            label,
            glass,
            'cursor-grab gap-1.5',
            v.phase && 'bg-[color-mix(in_srgb,color-mix(in_srgb,var(--fill)_50%,var(--surface))_82%,transparent)]',
          )}
          style={indent(f.depth)}
          tabIndex={0}
          role="button"
          data-gdrag={v.id}
          title={t('Drag up or down to move it, also into or out of a phase, or Alt and the arrow keys')}
          onPointerDown={(e) => {
            labelDown(e, v.id);
          }}
          onClick={() => {
            if (!dragged.current) openTask(v.id);
          }}
          onKeyDown={labelKeys(v.id)}
        >
          <button
            type="button"
            className="grid size-5 flex-none cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent p-0 text-mute hover:bg-hover hover:text-ink"
            aria-expanded={!col}
            aria-label={col ? t('Show the parts') : t('Hide the parts')}
            onClick={(e) => {
              e.stopPropagation();
              setUi((u) => {
                u.gcol = { ...(u.gcol ?? {}), [v.id]: !col };
              });
            }}
          >
            <Icon name={col ? 'chevron' : 'chevron-down'} size="xs" />
          </button>
          <span className="flex-none text-d11 text-mute type-num">{f.code}</span>
          <span className="block min-w-0 flex-1 truncate" title={v.title}>
            <b className="font-[650]">{v.title}</b>
          </span>
          <span className="ml-auto flex-none text-d11 text-mute type-num">
            {ru.done}/{ru.total}
          </span>
        </div>
        {track(bar0, v.id)}
      </div>
    );
  };

  const taskRowP = (v: Task, f: { depth: number; code: string }) => {
    const i = ri++;
    return (
      <div key={v.id} className={cn('group/grow relative flex min-w-max', divider(i))} data-grow="">
        <div
          className={cn(label, glass, 'cursor-grab')}
          style={indent(f.depth)}
          tabIndex={0}
          role="button"
          data-gdrag={v.id}
          title={t('Drag up or down to move it, also into or out of a phase, or Alt and the arrow keys')}
          onPointerDown={(e) => {
            labelDown(e, v.id);
          }}
          onClick={() => {
            if (!dragged.current) openTask(v.id);
          }}
          onKeyDown={labelKeys(v.id)}
        >
          <TaskStatusMark status={v.status} bare className="gap-0" />
          {f.code && <span className="flex-none text-d11 text-mute type-num">{f.code}</span>}
          <span className={cn('block min-w-0 flex-1 truncate', isDone(v) && 'text-mute line-through')} title={v.title}>
            <TaskIcon icon={v.icon} size="xs" className="mr-1.5" />
            {v.title}
          </span>
          <AvatarBubbles ids={taskPeople(v)} size="xs" className="ml-auto" />
        </div>
        {track(
          v.due ? (
            bar(v, i)
          ) : (
            <span className="sticky left-[calc(var(--lw)+12px)] mt-4 inline-block text-d12 text-mute">
              {t('No dates yet. Set them in the task, or drag a new bar.')}
            </span>
          ),
          v.id,
        )}
      </div>
    );
  };

  const rows: React.ReactNode[] = [];
  if (pj) {
    for (const m of projectMs) if (!(m.parent && db.tasks.find((x) => x.id === m.parent))) rows.push(msRowP(m));
    for (const fl of wbsFlat(db, pj, gcol)) {
      if (fl.k === 'ms') {
        if (fl.o.target) rows.push(msRowP(fl.o, fl.depth));
        continue;
      }
      if (fl.k === 'grp') {
        const i = ri++;
        rows.push(
          <div
            key="unplaced"
            className={cn(
              'group/grow relative flex min-w-max bg-[color-mix(in_srgb,var(--fill)_55%,transparent)]',
              divider(i),
            )}
          >
            <div className={cn(label, glass, 'min-h-12 gap-2.5')}>
              <span className="grid h-[18px] w-[22px] place-items-center rounded-[5px] bg-surface text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
                <Icon name="tasks" size="sm" />
              </span>
              <b className="text-d12h font-semibold text-ink-2">{t('Not in the WBS yet')}</b>
            </div>
            {track(null, 'unplaced')}
          </div>,
        );
        continue;
      }
      rows.push(fl.sum ? sumRowP(fl) : taskRowP(fl.o, fl));
    }
  } else if (mine) {
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

  const H = (ri + 1) * RH;
  const fixN = pj
    ? fixPlan(
        db,
        me,
        tasks.filter((v) => v.due),
      ).length
    : 0;
  const path = (xa: number, ya: number, xb: number, yb: number, os: number, is: number) => {
    const a = xa + 10 * os;
    const b = xb - 10 * is;
    let p: number[][];
    if (is > 0 ? a <= b : a >= b)
      p = [
        [xa, ya],
        [a, ya],
        [a, yb],
        [xb, yb],
      ];
    else {
      const my = ya + (yb >= ya ? RH / 2 : -RH / 2);
      p = [
        [xa, ya],
        [a, ya],
        [a, my],
        [b, my],
        [b, yb],
        [xb, yb],
      ];
    }
    return `M${p.map((q) => q.join(' ')).join(' L')}`;
  };
  const links: React.ReactNode[] = [];
  if (pj) {
    for (const v of dated)
      for (const d of predsOf(db, v)) {
        const A0 = pos[d.id];
        const B0 = pos[v.id];
        if (!A0 || !B0) continue;
        const ok = depOk(d.t, v, d.type);
        const dd = path(
          d.type.startsWith('F') ? A0.x2 : A0.x1,
          A0.y,
          d.type.endsWith('S') ? B0.x1 : B0.x2,
          B0.y,
          d.type.startsWith('F') ? 1 : -1,
          d.type.endsWith('S') ? 1 : -1,
        );
        links.push(
          <g key={`${d.id}>${v.id}`}>
            <path
              d={dd}
              fill="none"
              strokeWidth={1.5}
              strokeLinejoin="round"
              stroke={ok ? 'color-mix(in srgb, var(--ink) 45%, transparent)' : 'var(--danger)'}
              strokeDasharray={ok ? undefined : '4 3'}
              markerEnd={`url(#g-ar${ok ? '' : '-bad'})`}
            />
            <path
              d={dd}
              fill="none"
              stroke="transparent"
              strokeWidth={12}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={(e) => {
                setUi((u) => {
                  u.menu = {
                    type: 'dep',
                    s: v.id,
                    p: d.id,
                    width: 300,
                    est: 300,
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
              <title>{`${d.type}: ${v.title} ${t('waits for')} ${d.t.title}`}</title>
            </path>
          </g>,
        );
      }
    for (const v of dated) {
      const m = v.milestone ? pos[`ms:${v.milestone}`] : undefined;
      const A0 = pos[v.id];
      if (!m || !A0) continue;
      links.push(
        <path
          key={`ms-${v.id}`}
          d={path(A0.x2, A0.y, m.x1, m.y, 1, 1)}
          fill="none"
          strokeWidth={1.5}
          strokeLinejoin="round"
          stroke="color-mix(in srgb, var(--ink) 22%, transparent)"
          strokeDasharray="2 3"
          className="opacity-0 transition-opacity duration-150 group-has-[.g-ms:hover]/gantt:opacity-100"
        />,
      );
    }
  }

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
        {pj && fixN > 0 && (
          <>
            <span className="flex-1" />
            <button
              type="button"
              className={cn(
                buttonClass('default', true),
                'text-danger shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--danger)_45%,transparent)]',
              )}
              onClick={(e) => {
                openMenu(e.currentTarget, { type: 'depfix', id: pj.id, alignRight: true, width: 360, est: 320 });
              }}
            >
              <Icon name="warning" size="sm" />
              {plural(fixN, 'Fix {n} date', 'Fix {n} dates')}
            </button>
          </>
        )}
      </div>
      {mine && <Strip tasks={tasks} me={me} gWith={gWith} />}
      <div
        ref={ref}
        className={cn(
          'group/gantt relative mt-1 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-sheet bg-surface shadow-[0_0_0_1px_var(--line-strong)]',
          pj ? '[--lw:300px] max-[760px]:[--lw:170px]' : '[--lw:240px] max-[760px]:[--lw:150px]',
        )}
        onScroll={(e) => {
          const x0 = e.currentTarget.scrollLeft;
          setUi((u) => {
            u.ganttX = x0;
          });
        }}
      >
        <div className="sticky top-0 z-6 flex min-w-max bg-surface shadow-[inset_0_-1px_0_var(--line-strong)]">
          <div className={cn(label, 'min-h-14 items-end bg-surface pb-2 text-mute type-caption', mine && 'pl-[22px]')}>
            {pj ? t('Tasks and milestones') : mine ? t('Your tasks') : t('Task')}
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
        <div className="relative" ref={bodyRef}>
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
          {pj && (
            <svg
              ref={svgRef}
              className="pointer-events-none absolute top-0 left-[var(--lw)] z-2 overflow-visible"
              width={W}
              height={H}
              style={{ width: W, height: H }}
              aria-hidden="true"
            >
              <defs>
                <marker id="g-ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0L8 4L0 8Z" fill="color-mix(in srgb, var(--ink) 45%, transparent)" />
                </marker>
                <marker
                  id="g-ar-bad"
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M0 0L8 4L0 8Z" fill="var(--danger)" />
                </marker>
              </defs>
              {links}
              <path ref={tmpRef} className="fill-none stroke-green stroke-2 [stroke-dasharray:5_4]" d="" />
            </svg>
          )}
          {rows}
          {gmark &&
            (gmark.mode === 'in' ? (
              <i
                className="pointer-events-none absolute inset-x-0 z-7 rounded-md bg-[color-mix(in_srgb,var(--green)_10%,transparent)] shadow-[inset_0_0_0_2px_var(--green)]"
                style={{ top: gmark.top, height: gmark.height }}
              >
                <b className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md bg-green px-2 py-0.5 text-[11.5px] font-semibold whitespace-nowrap text-white not-italic">
                  {gmark.label}
                </b>
              </i>
            ) : (
              <i
                className="pointer-events-none absolute right-0 z-7 h-0.5 bg-green shadow-[0_0_0_1px_var(--surface)]"
                style={{ top: gmark.top, left: gmark.left }}
              />
            ))}
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
              pj
                ? 'Bars run from planned start to due date. Click or drag on empty days to add a task. Drag from the dot at a bar end to another bar to link them: which ends you join sets the type (FS, SS, FF, SF). Right-click to react.'
                : 'Bars run from planned start to due date. Click or drag on empty days to add a task. Right-click to react.',
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
