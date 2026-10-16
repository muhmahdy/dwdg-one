/* The Month view: a grid of days with the first few items of each, "n more" opening the day. From screens/schedule.js monthGrid. */
import { cn } from '@/lib/cn';
import { t, WD } from '@/lib/i18n';
import { addDays, D, dLong, mins, today, weekStart } from '@/lib/time';
import { openMilestone, openTask } from '@/lib/open';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { allDayItems, dayItems } from '../services/calendar';
import { showDay, useCalDate, useLayers } from '../services/schedule-ui';
import { openEvent } from './event-popover';

const chip =
  'block h-5 w-full min-w-0 cursor-pointer overflow-hidden rounded-[5px] border-0 bg-transparent px-1.5 text-left text-d11h text-ellipsis whitespace-nowrap hover:bg-hover';

export function MonthGrid() {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const date = useCalDate();
  const layers = useLayers();
  if (!me) return null;
  const a = D(date);
  const first = new Date(a.getFullYear(), a.getMonth(), 1);
  const start = weekStart(`${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-01`);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const rows = D(cells[35] ?? start).getMonth() === a.getMonth() ? 6 : 5;
  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ ['--rows' as string]: rows }}>
      <div className="grid grid-cols-7 py-1.5 text-center text-mute type-caption">
        {[1, 2, 3, 4, 5, 6, 0].map((i) => (
          <span key={i}>{WD()[i]}</span>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-[repeat(var(--rows),minmax(96px,1fr))] shadow-[inset_0_1px_0_var(--line)] max-[760px]:grid-rows-[repeat(var(--rows),minmax(72px,1fr))]">
        {cells.slice(0, rows * 7).map((d) => {
          const dd = D(d);
          const timed = dayItems(db, me, layers, d);
          const all = allDayItems(db, me, layers, d);
          const items = [
            ...all.map((it) => (
              <button
                key={`a-${it.kind}-${it.id}`}
                type="button"
                className={cn(
                  chip,
                  'flex items-center gap-[5px] bg-fill text-d11h font-semibold',
                  it.kind === 'due' && it.late && 'text-danger',
                )}
                onClick={() => {
                  if (it.kind === 'away') setUi((u) => void (u.insp = { type: 'unavail', id: it.id }));
                  else if (it.kind === 'due') openTask(it.id);
                  else openMilestone(it.id);
                }}
              >
                <span className="truncate">
                  {it.kind === 'away'
                    ? it.unavailable.note || t('Unavailable')
                    : it.kind === 'due'
                      ? it.task.title
                      : it.milestone.title}
                </span>
              </button>
            )),
            ...timed.map((it) => (
              <button
                key={`${it.kind}-${it.id}`}
                type="button"
                className={cn(chip, 'text-ink', it.kind !== 'meeting' && 'text-mute')}
                onClick={(e) => {
                  openEvent(it.kind, it.id, e.currentTarget);
                }}
              >
                <span className="mr-1.5 text-d11 text-mute type-num max-[760px]:hidden">{mins(it.s)}</span>
                {it.kind === 'meeting'
                  ? it.meeting.title
                  : it.kind === 'unavail'
                    ? it.unavailable.note || t('Unavailable')
                    : it.google.title}
              </button>
            )),
          ];
          const out = dd.getMonth() !== a.getMonth();
          return (
            <div
              key={d}
              className={cn(
                'flex min-w-0 flex-col gap-0.5 overflow-hidden p-1 shadow-[inset_1px_0_0_var(--line),inset_0_-1px_0_var(--line)]',
                out && 'bg-surface-2',
              )}
            >
              <button
                type="button"
                className={cn(
                  'size-[26px] cursor-pointer self-center rounded-full border-0 bg-transparent font-sans text-d12 font-medium text-ink-2 hover:bg-hover',
                  out && 'text-faint',
                  d === today() && 'bg-ink text-on-ink hover:bg-ink',
                )}
                aria-label={dLong(d)}
                onClick={(e) => {
                  e.stopPropagation();
                  showDay(d);
                }}
              >
                {dd.getDate()}
              </button>
              {items.slice(0, 3)}
              {items.length > 3 && (
                <button
                  type="button"
                  className="cursor-pointer border-0 bg-transparent px-1.5 text-left text-d11h text-mute"
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
    </div>
  );
}
