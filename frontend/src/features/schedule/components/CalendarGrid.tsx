/* The Day and Week calendar (D23, as easy as Google Calendar): hours down the side, the all-day row above, items side by
   side. Click or drag across empty time to create; drag your own items to move or resize them, or select one and use the
   arrow keys (arrows move 15 minutes, Shift resizes, Left and Right change day). Others' meetings and Google busy time open
   on click and stay put. From screens/schedule.js. */
import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Avatar } from '@/components/shared/Avatar';
import { TaskIcon } from '@/components/shared/art/task-icons';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { t, WD } from '@/lib/i18n';
import { addDays, D, dLong, mins, nowMin, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { openTask, openMilestone } from '@/lib/open';
import { setUi, uiStore } from '@/lib/workspace/transaction';
import type { Meeting, Person } from '@/types/workspace';
import { overlaps, unavailableOn } from '../services/availability';
import {
  allDayItems,
  CAL,
  dayItems,
  weekDays,
  yToMin,
  yTop,
  type AllDayItem,
  type DayItem,
} from '../services/calendar';
import { newDraft } from '../services/drafts';
import { moveMeeting, moveUnavailable } from '../services/meeting-actions';
import { openDraft, setCalDate, showDay, useCalDate, useCalView, useLayers } from '../services/schedule-ui';
import { openEvent } from './event-popover';

const SLOT = 15;
/** Pixels of movement before a press on an item becomes a drag. */
const SLOP = 4;

const dayHeadClass =
  'grid cursor-pointer justify-items-center gap-1 rounded-[10px] border-0 bg-transparent px-0 pt-2.5 pb-2 [&_b]:grid [&_b]:size-10 [&_b]:place-items-center [&_b]:rounded-full [&_b]:font-normal [&_b]:text-[24px] [&_b]:leading-none [&_b]:text-ink-2 [&_span]:text-d12 [&_span]:font-medium [&_span]:text-mute';

interface Drag {
  kind: 'meeting' | 'unavail';
  id: string;
  date: string;
  s: number;
  e: number;
}
interface Ghost {
  date: string;
  s: number;
  e: number;
}

function allDayButton(it: AllDayItem, onOpen: () => void) {
  const base =
    'flex h-6 w-full min-w-0 cursor-pointer items-center gap-[5px] overflow-hidden rounded-md border-0 px-2 text-left text-d12 font-semibold whitespace-nowrap text-ellipsis';
  if (it.kind === 'away')
    return (
      <button
        key={it.id}
        type="button"
        className={cn(
          base,
          'bg-[repeating-linear-gradient(135deg,var(--fill)_0_6px,var(--surface-2)_6px_12px)] text-mute',
        )}
        onClick={onOpen}
      >
        <span className="min-w-0 truncate">{it.unavailable.note || t('Unavailable')}</span>
      </button>
    );
  if (it.kind === 'due')
    return (
      <button
        key={it.id}
        type="button"
        className={cn(
          base,
          'bg-surface text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong)]',
          it.late && 'text-danger',
        )}
        title={t('Due, not a time block')}
        onClick={onOpen}
      >
        <Icon name="check" size="xs" />
        {it.task.time != null && <span className="text-d11 text-mute type-num compact:text-[11px]!">{mins(it.task.time)}</span>}
        <span className="min-w-0 truncate">{it.task.title}</span>
      </button>
    );
  return (
    <button
      key={it.id}
      type="button"
      className={cn(base, 'bg-surface text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]')}
      onClick={onOpen}
    >
      <Icon name="flag" size="xs" />
      <span className="min-w-0 truncate">{it.milestone.title}</span>
    </button>
  );
}

function EventBody({ it, me, h }: { it: DayItem; me: Person; h: number }) {
  const db = useWorkspace((w) => w);
  const short = h < 40;
  const flag =
    'mr-[5px] inline-block rounded-[4px] bg-danger px-[5px] align-[1px] font-sans text-d10 leading-[15px] font-bold roomy:leading-[18px] text-white not-italic';
  let title: React.ReactNode = null;
  let sub = '';
  let extra: React.ReactNode = null;
  if (it.kind === 'meeting') {
    const mt = it.meeting;
    const pending = mt.responses[me.id] === 'pending';
    const clash = db.unavailable.some((u) => {
      const [s, e] = u.allDay ? [0, 1440] : [u.start, u.end];
      return u.who === me.id && unavailableOn(u, mt.date) && overlaps(mt.start, mt.end, s, e);
    });
    const rx = Object.keys(mt.reactions).slice(0, 3).join('');
    title = (
      <>
        {clash && <em className={flag}>{t('Clash')}</em>}
        <TaskIcon icon={mt.icon} size="xs" />
        {mt.title}
        {rx && <span className="ml-1 text-d11 tracking-[-1px]">{rx}</span>}
      </>
    );
    sub = `${mins(mt.start)}–${mins(mt.end)}${pending ? `, ${t('reply needed')}` : ''}${clash ? `, ${t('clashes with your unavailable time')}` : ''}`;
    if (h >= 76)
      extra = (
        <>
          {mt.where && (
            <small className="block truncate text-d11h text-ink-2">
              {/^https?:/.test(mt.where) ? (mt.where.replace(/^https?:\/\//, '').split('/')[0] ?? mt.where) : mt.where}
            </small>
          )}
          <span className="absolute bottom-[5px] left-2 flex [&_.av]:size-[18px] [&_.av]:text-[8.5px] [&_.av+.av]:-ml-[5px]">
            {Object.keys(mt.responses)
              .filter((i) => i !== me.id)
              .slice(0, 4)
              .map((i) => (
                <Avatar key={i} id={i} size="xs" className="shadow-[0_0_0_1.5px_var(--sel)]" />
              ))}
          </span>
        </>
      );
  } else if (it.kind === 'unavail') {
    title = it.unavailable.note || t('Unavailable');
    sub = `${mins(it.unavailable.start)}–${mins(it.unavailable.end)}${it.unavailable.weekly ? `, ${t('every week')}` : ''}`;
  } else {
    title = (
      <>
        <i
          className="mr-[5px] inline-grid size-[13px] place-items-center rounded-[3px] bg-fill align-[1px] font-sans text-[8.5px] leading-none font-bold text-ink-2 not-italic"
          aria-hidden="true"
        >
          G
        </i>
        {it.google.title}
      </>
    );
    sub = `${mins(it.google.start)}–${mins(it.google.end)}, Google`;
  }
  return (
    <>
      <b
        className={cn(
          'font-semibold',
          short
            ? 'min-w-[3em] flex-[1_1_auto] truncate'
            : 'line-clamp-3 block overflow-hidden leading-[15px] text-ellipsis',
        )}
      >
        {title}
      </b>
      <small
        className={cn(
          'text-d11h text-ink-2 roomy:leading-5',
          short ? 'flex-[0_1_auto] truncate @max-[120.5px]:hidden' : 'block truncate',
          it.kind === 'meeting' && it.meeting.responses[me.id] === 'pending' && 'text-mute',
        )}
      >
        {sub}
      </small>
      {extra}
    </>
  );
}

export function CalendarGrid() {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const view = useCalView();
  const date = useCalDate();
  const layers = useLayers();
  const grid = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // Opens at 07:30 (or where the person left it); the position is kept while they move between days and weeks.
  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollTop = uiStore.get().calScroll ?? CAL.hr * 1.5;
  }, []);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const moved = useRef(false);
  if (!me) return null;
  const days = weekDays(view, date);
  const byDay = new Map(days.map((d) => [d, dayItems(db, me, layers, d)]));
  const td = today();
  const nm = nowMin();
  const columnAt = (x: number) =>
    [...(grid.current?.querySelectorAll<HTMLElement>('[data-col]') ?? [])].find((c) => {
      const r = c.getBoundingClientRect();
      return x >= r.left && x < r.right;
    });
  const yIn = (col: HTMLElement, y: number) => y - col.getBoundingClientRect().top;

  const itemOf = (kind: 'meeting' | 'unavail', id: string): Meeting | { start: number; end: number } | undefined =>
    kind === 'meeting' ? db.meetings.find((m) => m.id === id) : db.unavailable.find((u) => u.id === id);

  const commitMove = (kind: 'meeting' | 'unavail', id: string, s: number, e: number, d: string) => {
    if (kind === 'meeting') void moveMeeting(id, s, e, d);
    else void moveUnavailable(id, s, e, d);
    if (!days.includes(d)) setCalDate(d);
  };

  const onColumnPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const col = e.currentTarget;
    const target = e.target as HTMLElement;
    const evEl = target.closest<HTMLElement>('[data-ev]');
    if (evEl && evEl.dataset.move !== '1') return;
    e.preventDefault();
    const x0 = e.clientX;
    const y0 = e.clientY;
    moved.current = false;

    if (evEl) {
      const kind = evEl.dataset.ev as 'meeting' | 'unavail';
      const id = evEl.dataset.id ?? '';
      const item = itemOf(kind, id);
      if (!item) return;
      const resize = target.dataset.rs === '1';
      const dur = item.end - item.start;
      const grab = yToMin(yIn(col, y0)) - item.start;
      let cur: Drag = { kind, id, date: col.dataset.date ?? date, s: item.start, e: item.end };
      const move = (ev: PointerEvent) => {
        if (!moved.current && Math.hypot(ev.clientX - x0, ev.clientY - y0) < SLOP) return;
        moved.current = true;
        const c = resize ? col : (columnAt(ev.clientX) ?? col);
        if (resize) cur = { ...cur, e: Math.max(cur.s + SLOT, yToMin(yIn(c, ev.clientY))) };
        else {
          const s = Math.max(CAL.H0 * 60, Math.min(CAL.H1 * 60 - dur, yToMin(yIn(c, ev.clientY)) - grab));
          cur = { ...cur, s, e: s + dur, date: c.dataset.date ?? cur.date };
        }
        setDrag(cur);
      };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        setDrag(null);
        if (!moved.current) {
          openEvent(kind, id, evEl);
          return;
        }
        commitMove(kind, id, cur.s, cur.e, cur.date);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      return;
    }

    // A new block starts in the 15-minute slot under the cursor (rounding could start it below the click).
    const floor = (y: number) =>
      Math.min(Math.max(CAL.H0 * 60, CAL.H0 * 60 + Math.floor(((y / CAL.hr) * 60) / SLOT) * SLOT), CAL.H1 * 60 - 30);
    const s0 = floor(yIn(col, y0));
    const dateAt = col.dataset.date ?? date;
    let ns = s0;
    let ne = s0 + 60;
    setGhost({ date: dateAt, s: ns, e: ne });
    const move = (ev: PointerEvent) => {
      if (!moved.current && Math.abs(ev.clientY - y0) < SLOP) return;
      moved.current = true;
      const cur = yToMin(yIn(col, ev.clientY));
      ns = Math.min(s0, cur);
      ne = Math.max(s0 + SLOT, cur);
      setGhost({ date: dateAt, s: ns, e: ne });
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const r = col.getBoundingClientRect();
      const top = r.top + yTop(ns);
      const left = r.right + 12 + 420 > window.innerWidth ? r.left - 432 : r.right + 12;
      setGhost(null);
      openDraft(newDraft(dateAt, ns, ne, { x: left, y: top }), false);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  const onEventKey = (e: ReactKeyboardEvent<HTMLDivElement>, it: DayItem, d: string) => {
    const el = e.currentTarget;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEvent(it.kind, it.id, el);
      return;
    }
    if (!it.mine || it.kind === 'gbusy' || !e.key.startsWith('Arrow')) return;
    e.preventDefault();
    let ns = it.s;
    let ne = it.e;
    let nd = d;
    const step = e.key === 'ArrowUp' ? -SLOT : e.key === 'ArrowDown' ? SLOT : 0;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') nd = addDays(d, e.key === 'ArrowLeft' ? -1 : 1);
    else if (e.shiftKey) ne = Math.max(ns + SLOT, Math.min(1440, ne + step));
    else {
      ns = Math.max(0, Math.min(1440 - (ne - ns), ns + step));
      ne = ns + (it.e - it.s);
    }
    commitMove(it.kind, it.id, ns, ne, nd);
    setTimeout(() => {
      grid.current?.querySelector<HTMLElement>(`[data-ev="${it.kind}"][data-id="${it.id}"]`)?.focus();
    }, 0);
  };

  const column = (d: string) => {
    const items = (byDay.get(d) ?? []).filter((it) => !(drag?.kind === it.kind && drag.id === it.id));
    const dragging = drag?.date === d ? drag : null;
    const dragItem =
      dragging && [...byDay.values()].flat().find((x) => x.kind === dragging.kind && x.id === dragging.id);
    const render = (it: DayItem, over?: Drag) => {
      const s = Math.max(over?.s ?? it.s, CAL.H0 * 60);
      const e = Math.min(over?.e ?? it.e, CAL.H1 * 60);
      if (e <= s) return null;
      const h = yTop(e) - yTop(s);
      const meeting = it.kind === 'meeting' ? it.meeting : null;
      const pending = meeting?.responses[me.id] === 'pending';
      const clash =
        !!meeting &&
        db.unavailable.some((u) => {
          const [us, ue] = u.allDay ? [0, 1440] : [u.start, u.end];
          return u.who === me.id && unavailableOn(u, meeting.date) && overlaps(meeting.start, meeting.end, us, ue);
        });
      const left = over
        ? '2px'
        : it.casc
          ? `${2 + it.level * 16}px`
          : `calc(2px + (100% - 10px) / ${it.n} * ${it.col})`;
      const width = over
        ? 'calc(100% - 10px)'
        : it.casc
          ? `calc(100% - 10px - ${it.level * 16}px)`
          : `calc((100% - 10px) / ${it.n})`;
      const aria =
        it.kind === 'meeting'
          ? `${it.meeting.title}, ${dLong(it.meeting.date)} ${mins(it.meeting.start)}–${mins(it.meeting.end)}${pending ? `, ${t('reply needed')}` : ''}${it.mine ? '' : `, ${t('organized by {who}', { who: db.people.find((p) => p.id === it.meeting.organizer)?.name ?? '' })}`}`
          : it.kind === 'unavail'
            ? `${t('Unavailable')}, ${mins(it.unavailable.start)}–${mins(it.unavailable.end)}`
            : `${it.google.title}, ${t('from Google Calendar')}`;
      const hint = it.mine
        ? t('Drag to move, drag the bottom edge to resize, or use the arrow keys')
        : it.kind === 'gbusy'
          ? t('From Google Calendar. Edit it there.')
          : t('Organized by someone else, so it stays put');
      const full =
        it.kind === 'meeting'
          ? it.meeting.title
          : it.kind === 'unavail'
            ? it.unavailable.note || t('Unavailable')
            : it.google.title;
      return (
        <div
          key={`${it.kind}:${it.id}`}
          data-ev={it.kind}
          data-id={it.id}
          data-move={it.mine ? '1' : '0'}
          {...(it.kind === 'meeting' ? { 'data-react': `meeting:${it.id}` } : {})}
          tabIndex={0}
          role="button"
          aria-label={aria}
          title={`${full}\n${mins(it.s)}–${mins(it.e)}\n${hint}`}
          className={cn(
            'absolute overflow-hidden rounded-[7px] bg-sel px-[7px] py-[3px] text-d12 leading-[15px] text-ink shadow-[0_0_0_1px_var(--surface)] focus-visible:z-4 focus-visible:shadow-[var(--focus)] @max-[120.5px]:px-[5px]',
            h < 40 && 'flex items-baseline gap-1.5',
            pending && 'bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--line-strong),0_0_0_1px_var(--surface)]',
            it.kind === 'unavail' &&
              'bg-[repeating-linear-gradient(135deg,var(--fill)_0_6px,var(--surface-2)_6px_12px)] text-mute [&_small]:text-mute',
            it.kind === 'gbusy' &&
              'bg-surface-2 text-ink-2 shadow-[inset_0_0_0_1px_var(--line-strong),0_0_0_1px_var(--surface)]',
            meeting?.state === 'held' && '[&_b]:text-ink-2',
            clash && 'shadow-[inset_0_0_0_1.5px_var(--danger),0_0_0_1px_var(--surface)]',
            it.mine && 'cursor-grab touch-none',
            over && 'z-3 cursor-grabbing opacity-90 shadow-pop',
          )}
          style={{ top: yTop(s), height: h - 2, left, width, zIndex: over ? 3 : (it.level || 0) + 1 }}
          onKeyDown={(e) => {
            onEventKey(e, it, d);
          }}
          onClick={(e) => {
            if (!it.mine) openEvent(it.kind, it.id, e.currentTarget);
          }}
        >
          <EventBody it={over ? { ...it, s, e } : it} me={me} h={h} />
          {it.mine && (
            <i className="absolute inset-x-0 bottom-0 h-[7px] cursor-ns-resize" data-rs="1" aria-hidden="true" />
          )}
        </div>
      );
    };
    return (
      <div
        key={d}
        data-col
        data-date={d}
        className="@container relative bg-[repeating-linear-gradient(to_bottom,transparent_0_calc(var(--hr)-1px),var(--line)_calc(var(--hr)-1px)_var(--hr))] shadow-[inset_1px_0_0_var(--line)]"
        onPointerDown={onColumnPointerDown}
      >
        {items.map((it) => render(it))}
        {dragging && dragItem && render(dragItem, dragging)}
        {ghost?.date === d && (
          <div
            className="pointer-events-none absolute z-3 overflow-hidden rounded-[7px] bg-green px-[7px] py-[3px] text-d12 leading-[15px] text-[#0B2B17] shadow-pop"
            style={{ top: yTop(ghost.s), height: yTop(ghost.e) - yTop(ghost.s) - 2, left: 2, right: 8 }}
          >
            <b className="block font-semibold">{t('(No title)')}</b>
            <small className="block text-d11h text-[#0B2B17]">
              {mins(ghost.s)}–{mins(ghost.e)}
            </small>
          </div>
        )}
        {d === td && nm > CAL.H0 * 60 && nm < CAL.H1 * 60 && (
          <div
            className="absolute inset-x-0 z-2 h-0.5 bg-green before:absolute before:-top-[5px] before:-left-1.5 before:size-3 before:rounded-full before:bg-green before:shadow-[0_0_0_2px_var(--surface)] before:content-['']"
            style={{ top: yTop(nm) }}
          />
        )}
      </div>
    );
  };

  const cols = `grid-cols-[var(--gut)_repeat(var(--days),minmax(0,1fr))] max-[760px]:grid-cols-[44px_repeat(var(--days),minmax(56px,1fr))]`;
  return (
    <div
      className="flex min-h-0 flex-1 flex-col [--gut:60px]"
      style={{ ['--hr' as string]: `${CAL.hr}px`, ['--days' as string]: days.length }}
      ref={grid}
    >
      <div className={cn('mr-2 grid', cols)}>
        <span className="self-end pr-3 pb-2.5 text-right font-sans text-d11 font-medium text-mute compact:leading-[14px]">GMT+7</span>
        {days.map((d) => (
          <button
            key={d}
            type="button"
            className={cn(
              dayHeadClass,
              'hover:[&_b]:bg-hover',
              d === td &&
                '[&_b]:bg-ink [&_b]:font-medium [&_b]:text-on-ink hover:[&_b]:bg-ink [&_span]:font-semibold [&_span]:text-ink',
            )}
            {...(view === 'week'
              ? {
                  title: t('Open this day'),
                  onClick: () => {
                    showDay(d);
                  },
                }
              : { tabIndex: -1 })}
          >
            <span>{WD()[D(d).getDay()]}</span>
            <b>{D(d).getDate()}</b>
          </button>
        ))}
      </div>
      <div className={cn('mr-2 grid min-h-8 items-center pt-0.5 pb-2 shadow-[inset_0_-1px_0_var(--line)]', cols)}>
        <span className="pr-3 text-right font-sans text-d11 font-medium text-mute">{t('All day')}</span>
        {days.map((d) => {
          const items = allDayItems(db, me, layers, d);
          return (
            <div key={d} className="flex min-w-0 flex-col gap-0.5 pr-1 pl-0.5">
              {items.slice(0, 3).map((it) =>
                allDayButton(it, () => {
                  if (it.kind === 'away') setUi((u) => void (u.insp = { type: 'unavail', id: it.id }));
                  else if (it.kind === 'due') openTask(it.id);
                  else openMilestone(it.id);
                }),
              )}
              {items.length > 3 && (
                <button
                  type="button"
                  className="h-6 cursor-pointer rounded-md border-0 bg-transparent px-2 text-left text-d12 font-medium text-mute"
                  onClick={() => {
                    showDay(d);
                  }}
                >
                  {t('{n} more', { n: items.length - 3 })}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div
        ref={scroller}
        className="mt-1 min-h-[280px] flex-1 [scrollbar-gutter:stable] overflow-auto max-[760px]:h-[calc(100dvh-230px)]"
        id="calscroll"
        onScroll={(e) => {
          const top = e.currentTarget.scrollTop;
          setUi((u) => {
            u.calScroll = top;
          });
        }}
      >
        <div
          className={cn('relative grid shadow-[inset_0_1px_0_var(--line),inset_0_-1px_0_var(--line)]', cols)}
          style={{ height: CAL.hr * (CAL.H1 - CAL.H0) }}
        >
          <div className="relative">
            {Array.from({ length: CAL.H1 - CAL.H0 }, (_, n) =>
              n ? (
                <span
                  key={n}
                  className="absolute right-3 -translate-y-1/2 bg-surface px-0.5 font-mono text-d11 font-medium text-mute"
                  style={{ top: n * CAL.hr }}
                >
                  {String(CAL.H0 + n).padStart(2, '0')}:00
                </span>
              ) : null,
            )}
          </div>
          {/* eslint-disable-next-line react-hooks/refs -- the column's handlers read refs only on pointer events */}
          {days.map(column)}
        </div>
      </div>
    </div>
  );
}
