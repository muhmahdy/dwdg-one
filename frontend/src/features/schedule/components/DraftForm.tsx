/* The form behind the quick card and the full editor (D23): a meeting, an unavailable block, or a task due that day, with live
   known conflicts for the chosen time (work_meeting_composer acceptance 1). From screens/schedule.js draftForm. */
import { useState, type ReactNode } from 'react';
import { Avatar, IdentityLine } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { inputClass, textareaClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { SelectField, type Choice } from '@/components/ui/SelectField';
import { State } from '@/components/ui/StatusBadge';
import { visibleDivs } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t, WDL } from '@/lib/i18n';
import { D, mins } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { BUSY_KIND, clashOf, coverage, overlaps } from '../services/availability';
import { openComposer } from '../services/composer-state';
import type { DraftKind, MeetingDraft } from '../services/drafts';
import { saveDraft } from '../services/meeting-actions';
import { TZ_LABEL } from '../services/ics';
import { closeDraft, openDraft, patchDraft } from '../services/schedule-ui';

const timeChoices = (from = 0, to = 1425): Choice[] => {
  const out: Choice[] = [];
  for (let m = from; m <= to; m += 15) out.push({ value: String(m), label: mins(m) });
  return out;
};

const KINDS: [DraftKind, string][] = [
  ['event', 'Meeting'],
  ['busy', 'Unavailable'],
  ['task', 'Task'],
];

const row = 'mt-3 flex items-start gap-3 [&>.ic]:mt-[9px] [&>.ic]:flex-none [&>.ic]:text-mute';
const note = 'mt-1.5 mr-0 mb-0 ml-[30px] type-small text-mute';

/** Known conflicts for the chosen time: for an unavailable block, meetings it overlaps; for a meeting, each guest. */
function Availability({ d }: { d: MeetingDraft }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const who = useWorkspace((w) => Object.fromEntries(w.people.map((p) => [p.id, p.first])));
  if (!me) return null;
  if (d.kind === 'busy') {
    const hit = db.meetings.filter(
      (mt) =>
        mt.date === d.date &&
        mt.state !== 'cancelled' &&
        mt.responses[me.id] === 'accepted' &&
        overlaps(d.allDay ? 0 : d.start, d.allDay ? 1440 : d.end, mt.start, mt.end),
    );
    return hit.length ? (
      <p className="mt-2 mr-0 mb-0 ml-[30px] flex items-start gap-1.5 text-warning type-small">
        <Icon name="warning" size="xs" className="mt-0.5" />
        {t('Overlaps {what}. The meeting stays; tell the organizer if you cannot attend.', {
          what: hit.map((mt) => `${mt.title} ${mins(mt.start)}`).join(', '),
        })}
      </p>
    ) : null;
  }
  if (d.kind !== 'event' || !d.guests.length) return null;
  return (
    <div className="mt-2 grid gap-1">
      {d.guests.map((g) => {
        const c = clashOf(db, me.id, g, d.date, d.start, d.end, d.id);
        const cov = coverage(db, g);
        const first = c[0];
        return (
          <div key={g} className="flex items-center gap-2 text-d13">
            <Avatar id={g} size="xs" />
            <span>{who[g]}</span>
            <span className="ml-auto">
              {first ? (
                <State label={t(BUSY_KIND[first.kind])} icon="warning" tone="danger" />
              ) : cov === 'unknown' ? (
                <span className="inline-flex h-6 items-center rounded-chip bg-[repeating-linear-gradient(135deg,transparent_0_5px,var(--fill)_5px_10px)] px-2 text-d12 font-semibold text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
                  {t('Unknown')}
                </span>
              ) : (
                <State label={t('No recorded conflict')} icon="check" tone="green" />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Guests: chips, and a field that suggests people as you type. */
function Guests({ d }: { d: MeetingDraft }) {
  const me = useMe();
  const people = useWorkspace((w) => w.people);
  const [q, setQ] = useState('');
  if (!me) return null;
  const matches = q.trim()
    ? people
        .filter(
          (p) =>
            p.status === 'active' &&
            p.id !== me.id &&
            !d.guests.includes(p.id) &&
            p.name.toLowerCase().includes(q.trim().toLowerCase()),
        )
        .slice(0, 5)
    : [];
  const add = (id: string) => {
    patchDraft({ guests: [...d.guests, id] });
    setQ('');
  };
  return (
    <div className="relative flex-1">
      {d.guests.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {d.guests.map((g) => {
            const p = people.find((x) => x.id === g);
            return (
              <span
                key={g}
                className="inline-flex h-[26px] items-center gap-1.5 rounded-round bg-fill pr-2.5 pl-1 text-d12h font-[550]"
              >
                <Avatar id={g} size="xs" />
                {p?.first}
                <button
                  type="button"
                  className="-mr-1.5 grid size-[18px] place-items-center rounded-full border-0 bg-transparent text-mute"
                  aria-label={t('Remove {who}', { who: p?.first ?? '' })}
                  onClick={() => {
                    patchDraft({ guests: d.guests.filter((x) => x !== g) });
                  }}
                >
                  <Icon name="close" size="xs" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <input
        className={inputClass}
        placeholder={t('Add people')}
        autoComplete="off"
        aria-label={t('Add people')}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
        }}
        onKeyDown={(e) => {
          const first = matches[0];
          if (e.key === 'Enter' && first) {
            e.preventDefault();
            e.stopPropagation();
            add(first.id);
          }
        }}
      />
      {matches.length > 0 && (
        <div className="mt-1 grid gap-0.5">
          {matches.map((p) => (
            <div
              key={p.id}
              className="flex h-[38px] cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 text-d13h hover:bg-hover"
              role="button"
              tabIndex={0}
              onClick={() => {
                add(p.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add(p.id);
              }}
            >
              <Avatar id={p.id} size="xs" />
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              <IdentityLine person={p} />
            </div>
          ))}
        </div>
      )}
      <Availability d={d} />
      {d.guests.length > 0 && (
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent py-2 text-d13 font-semibold text-green-ink"
          onClick={() => {
            closeDraft();
            openComposer(d.title, {
              manual: [...d.guests],
              date: d.date,
              dur: Math.max(15, d.end - d.start),
              start: d.start,
              touched: true,
              where: d.where,
              agenda: d.agenda,
              project: d.project,
            });
          }}
        >
          {t('Find a time with everyone')}
        </button>
      )}
    </div>
  );
}

function When({ d }: { d: MeetingDraft }) {
  const compact = 'h-[34px] w-auto min-w-0 px-2';
  const startChoices = timeChoices();
  const endChoices = timeChoices(d.start + 15, 1440);
  const moveStart = (s: number) => {
    // A new start keeps the length, like Google Calendar.
    const dur = Math.max(15, d.end - d.start);
    patchDraft({ start: s, end: Math.min(1440, s + dur) });
  };
  if (d.kind === 'task')
    return (
      <>
        <DateField
          label={t('Due date')}
          value={d.date}
          onChange={(v) => {
            if (v) patchDraft({ date: v });
          }}
          className={cn(compact, 'min-w-[150px]')}
        />
        <SelectField
          label={t('Time')}
          className={compact}
          value={d.timed ? String(d.start) : '-1'}
          options={[{ value: '-1', label: t('No time') }, ...startChoices]}
          onChange={(v) => {
            const s = Number(v);
            patchDraft(s < 0 ? { timed: false } : { timed: true, start: s });
          }}
        />
      </>
    );
  return (
    <>
      <DateField
        label={t('Date')}
        value={d.date}
        onChange={(v) => {
          if (v) patchDraft({ date: v });
        }}
        className={cn(compact, 'min-w-[150px]')}
      />
      {!(d.kind === 'busy' && d.allDay) && (
        <>
          <SelectField
            label={t('Start')}
            className={compact}
            value={String(d.start)}
            options={startChoices}
            onChange={(v) => {
              moveStart(Number(v));
            }}
          />
          <span className="text-d13 text-mute">{t('to')}</span>
          <SelectField
            label={t('End')}
            className={compact}
            value={String(d.end)}
            options={endChoices}
            onChange={(v) => {
              patchDraft({ end: Number(v) });
            }}
          />
        </>
      )}
    </>
  );
}

export function DraftForm({ d, full, children }: { d: MeetingDraft; full: boolean; children?: ReactNode }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const projects = db.projects.filter(
    (p) => visibleDivs(me).includes(p.div) && !['completed', 'cancelled', 'archived'].includes(p.stage),
  );
  const save = () => {
    void saveDraft(d);
  };
  const place =
    d.kind === 'busy' ? t('Private note, for example Class') : d.kind === 'task' ? t('Task title') : t('Add title');
  return (
    <>
      <input
        className={cn(
          'w-full border-0 bg-transparent px-0 pt-1 pb-2 font-sans text-d20 font-medium text-ink shadow-[inset_0_-1px_0_var(--line-strong)] outline-none focus:shadow-[inset_0_-2px_0_var(--focus-ring)]',
          full && 'text-d22',
        )}
        placeholder={place}
        autoComplete="off"
        autoFocus
        value={d.title}
        onChange={(e) => {
          patchDraft({ title: e.target.value });
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            save();
          }
        }}
      />
      {!d.id && (
        <div
          className="mt-3 mb-1 inline-flex gap-0.5 rounded-[10px] bg-fill p-[3px]"
          role="radiogroup"
          aria-label={t('Type')}
        >
          {KINDS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={d.kind === k}
              className={cn(
                'h-7 rounded-[7px] border-0 bg-transparent px-3 text-d13 font-[550] text-mute roomy:h-8',
                d.kind === k && 'bg-surface text-ink shadow-sheet',
              )}
              onClick={() => {
                patchDraft({ kind: k, ...(k === 'busy' && d.end - d.start < 15 ? { end: d.start + 60 } : {}) });
              }}
            >
              {t(label)}
            </button>
          ))}
        </div>
      )}
      <div className={row}>
        <Icon name="clock" />
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          <When d={d} />
        </div>
      </div>
      {(d.kind === 'event' || d.kind === 'busy') && <p className={note}>{t('Times in {tz}', { tz: TZ_LABEL })}</p>}
      {d.kind === 'task' && (
        <p className={note}>{t('A task shows on its due date in the all-day row. It never blocks out hours.')}</p>
      )}
      {d.kind === 'busy' && (
        <>
          <div className={row}>
            <Icon name="undo" />
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              <label className="mr-2 inline-flex cursor-pointer items-center gap-2 text-d13">
                <input
                  type="checkbox"
                  className="size-4 accent-ink"
                  checked={d.allDay}
                  onChange={(e) => {
                    patchDraft({ allDay: e.target.checked });
                  }}
                />
                {t('All day')}
              </label>
              <SelectField
                label={t('Repeat')}
                className="h-[34px] w-auto min-w-0 px-2"
                value={d.repeat ? '1' : '0'}
                options={[
                  { value: '0', label: t('Does not repeat') },
                  { value: '1', label: t('Every week on {day}', { day: WDL()[D(d.date).getDay()] ?? '' }) },
                ]}
                onChange={(v) => {
                  patchDraft({ repeat: v === '1' });
                }}
              />
            </div>
          </div>
          <p className={note}>{t('Others see only that you are unavailable. Your note stays private.')}</p>
          <Availability d={d} />
        </>
      )}
      {d.kind === 'event' && (
        <>
          <div className={row}>
            <Icon name="people" />
            <Guests d={d} />
          </div>
          <div className={row}>
            <Icon name="link" />
            <input
              className={cn(inputClass, 'flex-1')}
              placeholder={t('Place or link, for example a Google Maps link')}
              aria-label={t('Place or link')}
              value={d.where}
              onChange={(e) => {
                patchDraft({ where: e.target.value });
              }}
            />
          </div>
        </>
      )}
      {d.kind === 'task' && <Availability d={d} />}
      {d.kind === 'event' && full && (
        <>
          <div className={row}>
            <Icon name="projects" />
            <SelectField
              label={t('Project')}
              className="h-[34px] w-auto min-w-0"
              value={d.project ?? ''}
              options={[
                { value: '', label: t('No project') },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
              onChange={(v) => {
                patchDraft({ project: v || null });
              }}
            />
          </div>
          <div className={row}>
            <Icon name="note" />
            <SelectField
              label={t('Note-taker')}
              className="h-[34px] w-auto min-w-0"
              people
              value={d.notetaker ?? me.id}
              options={[me.id, ...d.guests].map((i) => ({
                value: i,
                label: t('Note-taker: {who}', {
                  who: i === me.id ? t('you') : (db.people.find((p) => p.id === i)?.name ?? ''),
                }),
              }))}
              onChange={(v) => {
                patchDraft({ notetaker: v });
              }}
            />
          </div>
          <div className={row}>
            <Icon name="list" />
            <textarea
              className={cn(textareaClass, 'flex-1')}
              placeholder={t('Agenda, one item per line')}
              aria-label={t('Agenda')}
              value={d.agenda}
              onChange={(e) => {
                patchDraft({ agenda: e.target.value });
              }}
            />
          </div>
        </>
      )}
      {children}
      <div className="mt-[18px] flex justify-end gap-2">
        {!full && d.kind === 'event' && (
          <Button
            variant="ghost"
            onClick={() => {
              openDraft(d, true);
            }}
          >
            {t('More options')}
          </Button>
        )}
        <Button variant="primary" onClick={save}>
          {t('Save')}
        </Button>
      </div>
    </>
  );
}
