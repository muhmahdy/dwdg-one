/* Rhythm: every operation on one shared time axis. A beat is one run, carrying the person whose turn it was and what was recorded
   (done, done late, overdue, skipped). No scores, only what happened. Dense cadences (every few days) become dots so beats never
   pile up. From screens/work.js rhythm, beatsRow, obLegend, runWord, runTip. */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { go } from '@/app/router/navigation';
import { Avatar } from '@/components/shared/Avatar';
import { RoutineObject } from '@/components/shared/art/objects';
import { State } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { MON, plural, t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { D, addDays, daysBetween, dLong, dShort, today, weekStart } from '@/lib/time';
import { useWorkspace } from '@/lib/workspace/hooks';
import type { Routine, Task } from '@/types/workspace';
import { canEditRt } from '../services/access';
import { cadShort, openAsks, rtBeats, stepDays, type Beat, type RunState } from '../services/routines';
import { useMe } from '@/lib/workspace/hooks';

/** What happened to a run, in a word (a status mark). */
export function RunWord({ b }: { b: { st: RunState; t?: Task | undefined } }) {
  const x = b.t;
  if (b.st === 'done') return <State label={t('Done')} icon="check" tone="green" />;
  if (b.st === 'late' && x?.due && x.doneAt)
    return (
      <State
        label={plural(daysBetween(x.due, x.doneAt), 'Done {n} day late', 'Done {n} days late')}
        icon="clock"
        tone="warn"
      />
    );
  if (b.st === 'miss' && x?.due)
    return (
      <State
        label={plural(daysBetween(x.due, today()), 'Overdue {n} day', 'Overdue {n} days')}
        icon="warning"
        tone="danger"
      />
    );
  if (b.st === 'now' && x)
    return (
      <State
        label={x.due === today() ? t('Due today') : t('Due {d}', { d: dShort(x.due ?? '') })}
        icon="clock"
        tone="ink"
      />
    );
  if (b.st === 'skip') return <State label={t('Skipped')} icon="minus" tone="mute" />;
  if (b.st === 'rev') return <State label={t('Waiting for sign-off')} icon="search" tone="warn" />;
  return <State label={t('Coming up')} icon="calendar" tone="mute" />;
}

const runTip = (b: Beat) =>
  b.st === 'done'
    ? t('Done')
    : b.st === 'late' && b.t?.due && b.t.doneAt
      ? plural(daysBetween(b.t.due, b.t.doneAt), 'Done {n} day late', 'Done {n} days late')
      : b.st === 'miss'
        ? t('Overdue')
        : b.st === 'now'
          ? t('Open now')
          : b.st === 'skip'
            ? t('Skipped')
            : b.st === 'rev'
              ? t('Waiting for sign-off')
              : t('Coming up');

const RING: Record<RunState, string> = {
  done: 'var(--green)',
  late: 'var(--warning-mark)',
  miss: 'var(--danger)',
  now: 'var(--ink)',
  rev: 'var(--st-review-mark)',
  up: 'var(--line-strong)',
  plan: 'var(--line-strong)',
  skip: 'var(--line-strong)',
};
const BADGE: Partial<Record<RunState, string>> = {
  done: 'M5 12.5l4.5 4.5L19 7',
  late: 'M12 6v6l4 2',
  miss: 'M12 5v9 M12 19v.01',
};

function BeatBadge({ st }: { st: RunState }) {
  const d = BADGE[st];
  if (!d) return null;
  return (
    <i className="absolute -right-1 -bottom-1 grid size-3.5 place-items-center rounded-full bg-[var(--r)] shadow-[0_0_0_2px_var(--surface)] [.sm_&]:-right-[3px] [.sm_&]:-bottom-[3px] [.sm_&]:size-[11px]">
      <svg
        viewBox="0 0 24 24"
        className="size-2.5"
        fill="none"
        stroke="#fff"
        strokeWidth={st === 'late' ? 3 : 3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={d} />
      </svg>
    </i>
  );
}

function BeatsRow({ r, lo, hi, ppd }: { r: Routine; lo: string; hi: string; ppd: number }) {
  const db = useWorkspace((w) => w);
  const beats = rtBeats(db, r, lo, hi);
  const span = daysBetween(lo, hi) + 1;
  const pc = (d: string) => ((daysBetween(lo, d) + 0.5) / span) * 100;
  const gap = stepDays(r) * (ppd || 9);
  const size = gap >= 40 ? '' : gap >= 27 ? 'sm' : 'dense';
  const dense = size === 'dense';
  const who = (id: string | null) => db.people.find((p) => p.id === id)?.name ?? '';
  return (
    <div className={cn('relative h-[62px]', size)}>
      <i className="absolute inset-x-0 top-1/2 -mt-px h-0.5 rounded-[1px] bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]" />
      {beats.map((b) => {
        const lbl = `${dLong(b.d)}, ${b.owner ? `${who(b.owner)}, ` : ''}${runTip(b)}`;
        const open = () => {
          if (b.t) openTask(b.t.id);
          else go(`operations/${r.id}`);
        };
        const skip = b.st === 'skip';
        const small = dense || size === 'sm';
        return (
          <button
            key={`${b.d}-${b.st}`}
            type="button"
            className={cn(
              'group/bt absolute top-1/2 z-1 grid cursor-pointer place-items-center rounded-full border-0 bg-surface p-0 transition-transform duration-[140ms] hover:z-4 hover:scale-[1.14] focus-visible:z-4 focus-visible:scale-[1.14] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring max-[760px]:-m-[11px_0_0_-11px] max-[760px]:size-[22px]',
              skip
                ? '-mt-2 -ml-2 size-4 shadow-[0_0_0_2px_var(--surface),inset_0_0_0_1.5px_var(--line-strong)] after:h-[1.6px] after:w-[9px] after:-rotate-45 after:rounded-[1px] after:bg-mute after:content-[""]'
                : small
                  ? '-mt-[11px] -ml-[11px] size-[22px] shadow-[0_0_0_1.5px_var(--surface),0_0_0_3px_var(--r)]'
                  : '-mt-3.5 -ml-3.5 size-7 shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--r)]',
              dense && !skip && '-mt-1.5 -ml-1.5 size-3 shadow-[inset_0_0_0_2px_var(--r)]',
              dense && (b.st === 'done' || b.st === 'late' || b.st === 'miss') && 'bg-[var(--r)]',
              b.st === 'plan' &&
                'shadow-[0_0_0_2px_var(--surface)] outline outline-[1.5px] outline-offset-1 outline-line-strong outline-dashed',
            )}
            style={{ left: `${pc(b.d)}%`, ['--r' as string]: RING[b.st] }}
            aria-label={lbl}
            onClick={open}
          >
            {b.owner && !dense && !skip && (
              <Avatar
                id={b.owner}
                size="xs"
                className={cn(
                  'pointer-events-none size-[26px] max-[760px]:size-5',
                  small && 'size-5',
                  (b.st === 'up' || b.st === 'plan') && 'opacity-50 grayscale-[.4]',
                )}
              />
            )}
            {!dense && !skip && <BeatBadge st={b.st} />}
            <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 hidden -translate-x-1/2 gap-px rounded-[9px] bg-ink px-2.5 py-[7px] text-left text-[12px] leading-[1.35] whitespace-nowrap text-on-ink shadow-pop group-hover/bt:grid group-focus-visible/bt:grid">
              <b className="font-[650]">{dLong(b.d)}</b>
              {b.owner && <span>{who(b.owner)}</span>}
              <em className="not-italic opacity-70">{runTip(b)}</em>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function RhythmLegend() {
  const items: [RunState, string][] = [
    ['done', 'Done'],
    ['late', 'Done late'],
    ['miss', 'Overdue'],
    ['now', 'Open now'],
    ['rev', 'Waiting for sign-off'],
    ['plan', 'Coming up'],
    ['skip', 'Skipped'],
  ];
  return (
    <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 text-d12 text-mute">
      {items.map(([k, l]) => (
        <span key={k} className="inline-flex items-center gap-2">
          <i
            className={cn(
              'relative inline-block size-3.5 rounded-full bg-surface',
              k === 'done' && 'bg-[var(--r)]',
              k === 'late' && 'bg-[var(--r)]',
              k === 'miss' && 'bg-[var(--r)]',
              k === 'plan' && 'outline outline-[1.5px] outline-offset-1 outline-line-strong outline-dashed',
              k === 'skip' && 'size-3 shadow-[inset_0_0_0_1.5px_var(--line-strong)]',
              k !== 'plan' && k !== 'skip' && 'shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--r)]',
            )}
            style={{ ['--r' as string]: RING[k] }}
          />
          {t(l)}
        </span>
      ))}
    </div>
  );
}

export interface RhythmItem {
  r: Routine;
  /** A group heading shown above this row. */
  head?: ReactNode;
  paused?: boolean;
}

export function Rhythm({
  items,
  solo = false,
  lo: lo0,
  weeks: weeks0,
}: {
  items: RhythmItem[];
  solo?: boolean;
  lo?: string;
  weeks?: number;
}) {
  const me = useMe();
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(typeof window === 'undefined' ? 1200 : window.innerWidth);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const upd = () => {
      setW(el.clientWidth);
    };
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);
  const narrow = w < 700;
  const lo = narrow ? addDays(weekStart(today()), -14) : (lo0 ?? addDays(weekStart(today()), -28));
  const weeks = narrow ? 6 : (weeks0 ?? 12);
  const hi = addDays(lo, weeks * 7 - 1);
  const span = weeks * 7;
  const pc = (d: string) => (daysBetween(lo, d) / span) * 100;
  const cw = weekStart(today());
  const lab = solo ? 0 : narrow ? 118 : 236;
  const ppd = Math.max(160, w - lab - (solo ? 32 : 0)) / span;
  return (
    <div ref={box} className={cn('relative', solo ? '[--lab:0px]' : narrow ? '[--lab:118px]' : '[--lab:236px]')}>
      <div
        className={cn(
          'sticky top-0 z-3 grid h-[46px] grid-cols-[var(--lab)_minmax(0,1fr)] items-center bg-surface',
          solo && 'static grid-cols-[minmax(0,1fr)] bg-transparent',
        )}
      >
        {!solo && <span className="text-d12 font-semibold text-mute">{t('Routine')}</span>}
        <div className="relative h-full">
          {Array.from({ length: weeks }, (_, i) => {
            const d = addDays(lo, i * 7);
            const x = D(d);
            const newM = i === 0 || x.getDate() <= 7;
            return (
              <span
                key={d}
                className="absolute top-1 bottom-1.5 grid grid-rows-[1fr_auto] justify-items-center font-mono text-[11px] font-medium text-mute max-[760px]:text-[9.5px]"
                style={{ left: `${pc(d)}%`, width: `${100 / weeks}%` }}
              >
                <b className="self-start font-sans text-[11px] font-[650] text-ink-2">
                  {newM ? MON()[x.getMonth()] : ''}
                </b>
                <span
                  className={cn(
                    'rounded-[5px] px-[5px] leading-[17px]',
                    d === cw && 'bg-green font-semibold text-white',
                  )}
                >
                  {x.getDate()}
                </span>
              </span>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute top-[46px] right-0 bottom-0 left-[var(--lab)]">
        {Array.from({ length: weeks }, (_, i) => {
          const d = addDays(lo, i * 7);
          return (
            <i
              key={d}
              className={cn(
                'absolute inset-y-0',
                d === cw
                  ? 'rounded-[10px] bg-[color-mix(in_srgb,var(--green)_10%,transparent)]'
                  : i % 2
                    ? 'bg-[color-mix(in_srgb,var(--ink)_2.2%,transparent)]'
                    : '',
              )}
              style={{ left: `${pc(d)}%`, width: `${100 / weeks}%` }}
            />
          );
        })}
      </div>
      {items.map(({ r, head, paused }) => (
        <div key={r.id}>
          {head}
          <div
            className={cn(
              'relative grid min-h-[62px] grid-cols-[var(--lab)_minmax(0,1fr)] items-center border-t border-line',
              solo && 'grid-cols-[minmax(0,1fr)] border-t-0',
            )}
          >
            {!solo && (
              <Link
                to={`/operations/${r.id}`}
                className={cn(
                  'group/obn flex min-w-0 items-center gap-2.5 py-2.5 pr-3.5 text-inherit no-underline',
                  paused && 'opacity-60',
                )}
              >
                <RoutineObject routine={r} size="sm" />
                <span className="grid min-w-0">
                  <b className="truncate text-d14 font-semibold group-hover/obn:underline group-hover/obn:underline-offset-[3px] max-[760px]:line-clamp-2 max-[760px]:text-d13 max-[760px]:whitespace-normal">
                    {r.name}
                  </b>
                  <small className="text-d12 text-mute max-[760px]:hidden">
                    {r.paused ? (
                      <span className="font-semibold text-warning">{t('Paused')}</span>
                    ) : me && openAsks(r).length && canEditRt(me, r) ? (
                      <span className="font-[650] text-green-ink">
                        {plural(openAsks(r).length, '{n} request', '{n} requests')}
                      </span>
                    ) : (
                      cadShort(r)
                    )}
                  </small>
                </span>
              </Link>
            )}
            <div className={cn(r.paused && 'opacity-45')}>
              <BeatsRow r={r} lo={lo} hi={hi} ppd={ppd} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
