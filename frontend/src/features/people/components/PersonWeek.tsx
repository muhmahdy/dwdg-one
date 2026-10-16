/* A person's week as busy time (availability_person_inspector). A name appears only when the viewer is entitled to it:
   meetings both attend, meetings of the viewer's own workspace or the whole organization; everything else is Busy or
   Unavailable. Unavailable notes and Google titles are never shown to others. From screens/work.js personWeek. */
import { cn } from '@/lib/cn';
import { t, WD } from '@/lib/i18n';
import { openMeeting } from '@/lib/open';
import { addDays, D, mins, today, weekday } from '@/lib/time';
import { useWorkspace } from '@/lib/workspace/hooks';
import { unavailableOn } from '@/features/schedule/services/availability';
import { meetingWs } from '@/features/schedule/services/meetings';
import { projOf } from '@/features/work/services/selectors';
import type { DateStr, Person } from '@/types/workspace';

const H0 = 7;
const H1 = 21;
/** Pixels per hour. */
const K = 11;
const top = (m: number) => ((Math.max(H0 * 60, Math.min(H1 * 60, m)) - H0 * 60) / 60) * K;

interface Item {
  s: number;
  e: number;
  title: string;
  kind: 'mt' | 'busy' | 'un';
  meeting?: string;
}

const itemClass: Record<Item['kind'], string> = {
  mt: 'cursor-pointer bg-[color-mix(in_srgb,var(--green)_22%,var(--surface))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--green)_50%,transparent)]',
  busy: 'bg-[color-mix(in_srgb,var(--ink)_16%,var(--surface))] [&_span]:text-ink-2',
  un: 'bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--ink)_14%,var(--surface))_0_4px,var(--surface)_4px_8px)] shadow-[inset_0_0_0_1px_var(--line-strong)] [&_span]:text-mute',
};
const swatch: Record<Item['kind'], string> = {
  mt: 'bg-[color-mix(in_srgb,var(--green)_30%,var(--surface))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--green)_50%,transparent)]',
  busy: 'bg-[color-mix(in_srgb,var(--ink)_16%,var(--surface))]',
  un: 'bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--ink)_14%,var(--surface))_0_4px,var(--surface)_4px_8px)] shadow-[inset_0_0_0_1px_var(--line-strong)]',
};

export function PersonWeek({ person, week, viewer }: { person: Person; week: DateStr; viewer: Person }) {
  const db = useWorkspace((w) => w);
  const self = person.id === viewer.id;
  const known = person.gcal || person.hasSchedule;
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const itemsOn = (d: DateStr): Item[] => {
    const out: Item[] = [];
    for (const mt of db.meetings) {
      if (
        mt.date !== d ||
        mt.state === 'cancelled' ||
        !(mt.organizer === person.id || mt.responses[person.id] === 'accepted')
      )
        continue;
      const pr = projOf(db, mt.project);
      const seen =
        self ||
        mt.organizer === viewer.id ||
        !!mt.responses[viewer.id] ||
        (!!viewer.div && meetingWs(db, mt, viewer.div) === viewer.div) ||
        !!pr?.org;
      out.push({
        s: mt.start,
        e: mt.end,
        title: seen ? mt.title : t('Busy'),
        kind: seen ? 'mt' : 'busy',
        ...(seen ? { meeting: mt.id } : {}),
      });
    }
    for (const u of db.unavailable)
      if (u.who === person.id && unavailableOn(u, d))
        out.push({
          s: u.allDay ? 0 : u.start,
          e: u.allDay ? 1440 : u.end,
          title: self ? u.note || t('Unavailable') : t('Unavailable'),
          kind: 'un',
        });
    if (person.gcal)
      for (const g of db.gbusy)
        if (g.who === person.id && g.date === d)
          out.push({ s: g.start, e: g.end, title: self ? g.title : t('Busy'), kind: 'busy' });
    return out;
  };
  return (
    <>
      <div className="relative mt-1 grid grid-cols-[22px_repeat(7,minmax(0,1fr))] gap-[3px]">
        <div className="relative">
          {[8, 12, 16, 20].map((h) => (
            <span
              key={h}
              className="absolute right-0.5 -translate-y-1/2 font-mono text-d10h font-medium text-mute"
              style={{ top: (h - H0) * K + 18 }}
            >
              {String(h).padStart(2, '0')}
            </span>
          ))}
        </div>
        {days.map((d) => (
          <div key={d} className="grid gap-1">
            <span className="text-center text-d10h text-mute">
              {WD()[D(d).getDay()]?.slice(0, 2)}{' '}
              <b
                className={cn(
                  'block font-mono text-d12 font-semibold text-ink-2',
                  d === today() && 'inline-grid size-5 place-items-center rounded-full bg-ink text-on-ink',
                )}
              >
                {D(d).getDate()}
              </b>
            </span>
            <div
              className={cn(
                'relative overflow-hidden rounded-md bg-surface-2 shadow-[inset_0_0_0_1px_var(--line)]',
                weekday(d) > 5 && 'bg-[color-mix(in_srgb,var(--fill)_70%,var(--surface-2))]',
                !known && 'bg-[repeating-linear-gradient(135deg,var(--fill)_0_5px,transparent_5px_10px)]',
              )}
              style={{ height: (H1 - H0) * K }}
            >
              {itemsOn(d).map((it) => (
                <i
                  key={`${it.kind}-${it.s}-${it.e}`}
                  className={cn('absolute inset-x-0.5 overflow-hidden rounded-[3px] not-italic', itemClass[it.kind])}
                  style={{ top: top(it.s), height: Math.max(6, top(it.e) - top(it.s) - 1) }}
                  title={`${it.title}, ${mins(it.s)}–${mins(it.e)}`}
                  {...(it.meeting
                    ? {
                        role: 'button',
                        onClick: () => {
                          if (it.meeting) openMeeting(it.meeting);
                        },
                      }
                    : {})}
                >
                  <span className="block truncate px-[3px] py-px text-[9.5px] leading-[11px]">{it.title}</span>
                </i>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 mb-0.5 flex gap-3 text-d11h text-ink-2 [&_i]:h-2.5 [&_i]:w-3 [&_i]:rounded-[2px] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-[5px]">
        <span>
          <i className={swatch.mt} />
          {t('Shared meeting')}
        </span>
        <span>
          <i className={swatch.busy} />
          {t('Busy')}
        </span>
        <span>
          <i className={swatch.un} />
          {t('Unavailable')}
        </span>
      </div>
    </>
  );
}
