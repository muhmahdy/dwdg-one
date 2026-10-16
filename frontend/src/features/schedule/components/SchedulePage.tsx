/* Schedule (work_schedule, D23: as easy as Google Calendar): Day, Week and Month over the same records, with the left rail,
   the toolbar, and keyboard shortcuts (T today, D/W/M view, J/N next, K/P previous, C create). From screens/schedule.js. */
import { useEffect } from 'react';
import { openMenu } from '@/components/shared/menus';
import { Button, IconButton, segButtonClass, segClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { MON, MONTH, t, WDL } from '@/lib/i18n';
import { D, nowMin } from '@/lib/time';
import { useMe, useUi } from '@/lib/workspace/hooks';
import { setUi, uiStore } from '@/lib/workspace/transaction';
import { weekDays, type CalView } from '../services/calendar';
import { openComposer } from '../services/composer-state';
import { newDraft } from '../services/drafts';
import {
  getCalDate,
  goToday,
  openDraft,
  setCalDate,
  setCalView,
  stepCalendar,
  useCalDate,
  useCalView,
} from '../services/schedule-ui';
import { CalendarGrid } from './CalendarGrid';
import { MonthGrid } from './MonthGrid';
import { SchedulerRail } from './SchedulerRail';
import './schedule-menus';

export const ScheduleCrumb = () => <b>{t('Schedule')}</b>;

function calTitle(view: CalView, date: string) {
  const a = D(date);
  if (view === 'day') return `${WDL()[a.getDay()]}, ${a.getDate()} ${MONTH()[a.getMonth()]} ${a.getFullYear()}`;
  if (view === 'month') return `${MONTH()[a.getMonth()]} ${a.getFullYear()}`;
  const ds = weekDays(view, date);
  const f = D(ds[0] ?? date);
  const l = D(ds[6] ?? date);
  return f.getMonth() === l.getMonth()
    ? `${MONTH()[f.getMonth()]} ${f.getFullYear()}`
    : `${MON()[f.getMonth()]} – ${MON()[l.getMonth()]} ${l.getFullYear()}`;
}

const VIEWS: [CalView, string, string][] = [
  ['day', 'Day', 'D'],
  ['week', 'Week', 'W'],
  ['month', 'Month', 'M'],
];

/** Starts a new meeting draft in the full editor from the toolbar, for the day in view and the next hour. */
const startCreate = () => {
  const ui = uiStore.get();
  const st = Math.min(Math.ceil(nowMin() / 60) * 60, 20 * 60);
  openDraft(newDraft(getCalDate(ui), st, st + 60, null), true);
};

export function SchedulePage() {
  const me = useMe();
  const view = useCalView();
  const date = useCalDate();
  const panelOpen = useUi((u) => !!u.insp);

  // Google Calendar shortcuts, active only while nothing else is in front of the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el?.closest('input, textarea, select, [contenteditable]');
      const ui = uiStore.get();
      if (typing || e.ctrlKey || e.metaKey || e.altKey || ui.menu || ui.composer || ui.draft || ui.palette) return;
      const k = e.key.toLowerCase();
      const next = { d: 'day', w: 'week', m: 'month' }[k];
      if (next) setCalView(next as CalView);
      else if (k === 't') goToday();
      else if (k === 'j' || k === 'n') stepCalendar(1);
      else if (k === 'k' || k === 'p') stepCalendar(-1);
      else if (k === 'c') startCreate();
      else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      setUi((u) => {
        u.calScroll = null;
      });
    };
  }, []);

  if (!me) return null;
  const nav =
    'inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink';
  return (
    <div
      data-page="schedule"
      className={cn(
        'grid h-full grid-cols-[228px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-5 px-[var(--page-x)] pt-6 pb-3 max-[1100px]:grid-cols-[minmax(0,1fr)] max-[760px]:pt-[18px]',
        panelOpen && 'grid-cols-[minmax(0,1fr)] [&>aside]:hidden',
      )}
    >
      <SchedulerRail />
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="mb-1 flex flex-wrap items-center gap-1.5 gap-y-2 max-[599px]:[&>h1]:order-first max-[599px]:[&>h1]:m-0 max-[599px]:[&>h1]:basis-full">
          <span className="inline-flex items-center gap-0.5">
            <Button onClick={goToday} title={`${t('Today')} (T)`}>
              {t('Today')}
            </Button>
            <button
              type="button"
              className={nav}
              aria-label={t('Previous')}
              title={`${t('Previous')} (K)`}
              onClick={() => {
                stepCalendar(-1);
              }}
            >
              <Icon name="chevron-left" />
            </button>
            <button
              type="button"
              className={nav}
              aria-label={t('Next')}
              title={`${t('Next')} (J)`}
              onClick={() => {
                stepCalendar(1);
              }}
            >
              <Icon name="chevron" />
            </button>
          </span>
          <h1 className="mx-0.5 ml-1.5 min-w-0 truncate whitespace-nowrap type-h2">{calTitle(view, date)}</h1>
          <span className="relative inline-grid">
            <input
              id="cal-jump"
              type="date"
              className="pointer-events-none absolute bottom-0 left-0 size-px opacity-0"
              value={date}
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                if (e.target.value) setCalDate(e.target.value);
              }}
            />
          </span>
          <span className="flex-1 max-[760px]:hidden" />
          <Button
            className="max-[760px]:hidden"
            onClick={() => {
              openComposer();
            }}
          >
            <Icon name="people" />
            {t('Find a time')}
          </Button>
          <IconButton
            className="max-[760px]:hidden"
            aria-haspopup="menu"
            aria-label={t('More schedule options')}
            title={t('More schedule options')}
            onClick={(e) => {
              openMenu(e.currentTarget, { type: 'calmore', alignRight: true, width: 240 });
            }}
          >
            <Icon name="more" />
          </IconButton>
          <div
            className={cn(segClass, 'max-[599px]:order-5 max-[599px]:flex max-[599px]:flex-[1_0_100%]')}
            role="radiogroup"
            aria-label={t('View')}
          >
            {VIEWS.map(([k, label, key]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={view === k}
                title={`${t(label)} (${key})`}
                className={segButtonClass(view === k, 'max-[760px]:px-[9px] max-[599px]:flex-1 roomy:h-8')}
                onClick={() => {
                  setCalView(k);
                }}
              >
                {t(label)}
              </button>
            ))}
          </div>
          <IconButton
            className="hidden max-[760px]:inline-grid max-[760px]:rounded-[10px] max-[760px]:bg-ink max-[760px]:text-on-ink"
            aria-label={t('Create')}
            onClick={startCreate}
          >
            <Icon name="plus" />
          </IconButton>
        </div>
        {view === 'month' ? <MonthGrid /> : <CalendarGrid />}
      </div>
    </div>
  );
}
