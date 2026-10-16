/* The left rail like Google Calendar's: create, a mini month, "Meet with…", the calendar layers, and the sync status
   (owner review O2, D23). From screens/schedule.js miniMonth and the rail markup. */
import { Link } from 'react-router';
import { PeoplePicker, usePeoplePicker } from '@/components/shared/PeoplePicker';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { State } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { MONTH, t, WD } from '@/lib/i18n';
import { addDays, D, dLong, iso, today, weekStart } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { useState } from 'react';
import { weekDays, type Layers } from '../services/calendar';
import { openComposer } from '../services/composer-state';
import { newDraft } from '../services/drafts';
import { connectGoogleCalendar } from '../services/meeting-actions';
import {
  openDraft,
  setCalDate,
  stepMini,
  toggleLayer,
  useCalDate,
  useCalView,
  useLayers,
  useMiniMonth,
} from '../services/schedule-ui';
import { nowMin } from '@/lib/time';

function MiniMonth() {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const view = useCalView();
  const date = useCalDate();
  const mini = useMiniMonth();
  if (!me) return null;
  const base = D(mini ?? date);
  const y = base.getFullYear();
  const mo = base.getMonth();
  const start = weekStart(iso(new Date(y, mo, 1)));
  const sel = weekDays(view, date);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const busy = new Set(
    db.meetings
      .filter((mt) => mt.state !== 'cancelled' && ['accepted', 'pending'].includes(mt.responses[me.id] ?? ''))
      .map((mt) => mt.date),
  );
  const nav =
    'inline-grid size-[26px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink';
  return (
    <div>
      <div className="flex items-center justify-between pr-0.5 pb-1.5 pl-1.5 text-d13">
        <b>
          {MONTH()[mo]} {y}
        </b>
        <span className="flex">
          <button
            type="button"
            className={nav}
            aria-label={t('Previous month')}
            onClick={() => {
              stepMini(-1);
            }}
          >
            <Icon name="chevron-left" size="sm" />
          </button>
          <button
            type="button"
            className={nav}
            aria-label={t('Next month')}
            onClick={() => {
              stepMini(1);
            }}
          >
            <Icon name="chevron" size="sm" />
          </button>
        </span>
      </div>
      <div className="grid grid-cols-7 gap-x-0 gap-y-px text-center">
        {[1, 2, 3, 4, 5, 6, 0].map((i) => (
          <span key={i} className="pt-0.5 pb-1 font-sans text-d10h font-medium text-mute">
            {WD()[i]?.slice(0, 1)}
          </span>
        ))}
        {cells.map((d) => {
          const inSel = sel.includes(d) && view !== 'month';
          return (
            <button
              key={d}
              type="button"
              className={cn(
                'relative h-7 cursor-pointer border-0 bg-transparent font-sans text-d11h font-medium text-ink-2 hover:bg-hover',
                'rounded-full',
                D(d).getMonth() !== mo && 'text-faint',
                inSel && 'rounded-none bg-sel-neutral first-of-type:rounded-l-[14px]',
                d === today() && 'rounded-full bg-ink font-bold text-on-ink hover:bg-ink',
                busy.has(d) &&
                  "after:absolute after:bottom-[3px] after:left-1/2 after:-ml-[1.5px] after:size-[3px] after:rounded-full after:bg-green after:content-['']",
                d === today() && busy.has(d) && 'after:bg-on-ink',
              )}
              aria-label={dLong(d)}
              onClick={() => {
                setCalDate(d);
              }}
            >
              {D(d).getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const LAYER_ROWS: [keyof Layers, string, string][] = [
  ['meetings', 'Meetings', 'bg-sel shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--green)_50%,transparent)]'],
  [
    'away',
    'My unavailable time',
    'bg-[repeating-linear-gradient(135deg,var(--line-strong)_0_3px,transparent_3px_6px)] shadow-[inset_0_0_0_1px_var(--line-strong)]',
  ],
  ['google', 'Google Calendar busy time', 'bg-surface-2 shadow-[inset_0_0_0_1px_var(--line-strong)]'],
  ['due', 'Due dates and milestones', 'bg-surface shadow-[inset_0_0_0_1.5px_var(--ink-2)]'],
];

/** "Meet with…": pick a person and the composer opens with them added. */
function MeetWith() {
  const [q, setQ] = useState('');
  const picker = usePeoplePicker([], (id) => {
    setQ('');
    openComposer('', { manual: [id] });
  });
  return (
    <div className="relative">
      <label className="flex h-[var(--ctl-h)] items-center gap-2 rounded-ctl bg-fill px-2.5 text-d13 text-mute [&_.ic]:size-4">
        <Icon name="people" size="sm" />
        <input
          className="w-full border-0 bg-transparent font-[inherit] text-ink outline-none"
          placeholder={t('Meet with…')}
          autoComplete="off"
          aria-label={t('Find a time with someone')}
          value={q}
          onFocus={() => {
            picker.open(q.trim());
          }}
          onChange={(e) => {
            setQ(e.target.value);
            picker.open(e.target.value.trim());
          }}
          onKeyDown={(e) => {
            picker.onKeyDown(e);
          }}
        />
      </label>
      <div className="absolute top-full left-0 z-[6] mt-1 w-full">
        <PeoplePicker view={picker.view} />
      </div>
    </div>
  );
}

export function SchedulerRail() {
  const me = useMe();
  const layers = useLayers();
  const date = useCalDate();
  if (!me) return null;
  const create = () => {
    const st = Math.min(Math.ceil(nowMin() / 60) * 60, 20 * 60);
    openDraft(newDraft(date, st, st + 60, null), true);
  };
  return (
    <aside
      className="flex min-h-0 flex-col gap-4 overflow-auto pr-0.5 max-[1100px]:hidden"
      aria-label={t('Calendar tools')}
    >
      <Button variant="primary" className="h-11 w-max justify-start rounded-[14px] px-[18px] text-d14" onClick={create}>
        <Icon name="plus" />
        {t('Create')}
      </Button>
      <MiniMonth />
      <MeetWith />
      <h3 className="mt-1 -mb-1.5 border-t border-line-strong pt-3.5 font-sans text-d13 font-semibold">
        {t('My calendars')}
      </h3>
      <div className="grid gap-0.5">
        {LAYER_ROWS.map(([k, label, sw]) => (
          <label
            key={k}
            className="flex min-h-8 cursor-pointer items-center gap-2.5 rounded-ctl px-1.5 text-d13 hover:bg-hover"
          >
            <input
              type="checkbox"
              className="m-0 size-4 accent-ink"
              checked={layers[k]}
              onChange={() => {
                toggleLayer(k);
              }}
            />
            <i className={cn('size-3 flex-none rounded-[3px]', sw)} />
            {t(label)}
          </label>
        ))}
      </div>
      {me.gcal ? (
        <Link className="mt-auto inline-flex no-underline" to="/settings">
          <State label={t('Synced with Google Calendar')} icon="check" tone="green" />
        </Link>
      ) : (
        <Button
          variant="ghost"
          small
          className="mt-auto"
          onClick={() => {
            void connectGoogleCalendar();
          }}
        >
          <Icon name="calendar" />
          {t('Connect Google Calendar')}
        </Button>
      )}
    </aside>
  );
}
