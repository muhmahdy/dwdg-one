/* The meeting composer (R046, work_meeting_composer, S026): describe the meeting in a sentence and see everyone's recorded
   availability on lanes. The sentence is read live (people, day, time, length); the green slot can be dragged, nudged with
   the arrow keys, or set from the Start field. A clash needs a second confirm before sending. From screens/schedule.js. */
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { go } from '@/app/router/navigation';
import { Avatar, AvatarBubbles } from '@/components/shared/Avatar';
import { PeoplePicker, usePeoplePicker } from '@/components/shared/PeoplePicker';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { inputClass, textareaClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { visibleDivs } from '@/lib/access';
import { cn } from '@/lib/cn';
import { plural, t, WD } from '@/lib/i18n';
import { addDays, D, dLong, mins, today, toMin, weekStart } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { BUSY_KIND, busyFor, clashOf, coverage, coverageLine, nameList } from '../services/availability';
import {
  CW0,
  CW1,
  EXAMPLES,
  conflicts,
  everyone,
  highlight,
  openStartTimes,
  suggestions,
  type ComposerState,
} from '../services/composer';
import {
  addGuest,
  closeComposer,
  patchComposer,
  removeGuest,
  sendMeeting,
  setComposerField,
} from '../services/composer-state';
import { TZ_LABEL } from '../services/ics';
import { useComposer } from '../services/schedule-ui';

const span = CW1 - CW0;
const pct = (v: number) => ((v - CW0) / span) * 100;
const busyClass: Record<string, string> = {
  meeting: 'bg-line-strong',
  invite: 'bg-transparent shadow-[inset_0_0_0_1.5px_var(--line-strong)]',
  away: 'bg-[repeating-linear-gradient(135deg,var(--line-strong)_0_4px,transparent_4px_8px)]',
  google: 'bg-[color-mix(in_srgb,var(--ink)_24%,transparent)]',
};

function Sentence({ c }: { c: ComposerState }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const mirror = useRef<HTMLSpanElement>(null);
  if (!me) return null;
  return (
    <span className="relative h-8 min-w-0 flex-1 overflow-hidden">
      <span
        ref={mirror}
        className="pointer-events-none absolute top-0 left-0 h-8 font-sans text-d16 leading-8 font-medium whitespace-pre text-ink max-[760px]:text-d15"
        aria-hidden="true"
      >
        {highlight(db, me, c.text, c.people).map((m, i) => (
          <mark
            key={i}
            className={cn(
              'rounded-[4px] text-inherit',
              m.cls === 'p' && 'bg-green-soft text-green-ink shadow-[0_0_0_2px_var(--green-soft)]',
              m.cls === 'd' && 'bg-fill shadow-[0_0_0_2px_var(--fill)]',
              !m.cls && 'bg-transparent',
            )}
          >
            {m.text}
          </mark>
        ))}{' '}
      </span>
      <input
        className="relative h-8 w-full border-0 bg-transparent p-0 font-sans text-d16 leading-8 font-medium text-transparent caret-ink outline-none placeholder:text-mute max-[760px]:text-d15"
        placeholder={t('Describe it: who, which day, how long')}
        autoComplete="off"
        autoFocus
        spellCheck={false}
        aria-label={t('Describe the meeting')}
        value={c.text}
        onFocus={(e) => {
          const n = e.currentTarget.value.length;
          e.currentTarget.setSelectionRange(n, n);
        }}
        onChange={(e) => {
          patchComposer({ text: e.target.value });
        }}
        onScroll={(e) => {
          if (mirror.current) mirror.current.style.transform = `translateX(${-e.currentTarget.scrollLeft}px)`;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            send(c);
          }
        }}
      />
    </span>
  );
}

const send = (c: ComposerState) => {
  const r = sendMeeting(c);
  if (r && r !== 'confirm')
    void r.then((ok) => {
      if (ok && !window.location.pathname.startsWith('/schedule')) go('schedule');
    });
};

function Lane({ pid, c }: { pid: string; c: ComposerState }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const p = db.people.find((x) => x.id === pid);
  const b = busyFor(db, me.id, pid, c.date);
  const checking = c.checking.includes(pid);
  return (
    <div className="mb-1.5 grid grid-cols-[34px_calc(var(--l0)-34px)_1fr_var(--l1)] items-center">
      <Avatar id={pid} />
      <span className="min-w-0 pr-2">
        <b className="block truncate text-d13 font-semibold">{pid === me.id ? t('You') : p?.first}</b>
        <small className="block truncate text-d11 text-mute max-[760px]:hidden">
          {checking ? t('Checking Google Calendar…') : coverageLine(coverage(db, pid))}
        </small>
      </span>
      <div className="relative h-[34px] rounded-lg bg-fill">
        {checking ? (
          <span className="absolute inset-0 animate-[skel_1.4s_linear_infinite] rounded-lg bg-[linear-gradient(90deg,var(--fill)_25%,var(--hover)_50%,var(--fill)_75%)] bg-[length:200%_100%] motion-reduce:animate-none" />
        ) : (
          <>
            {b.list
              .filter((x) => x.e > CW0 && x.s < CW1)
              .map((x) => (
                <i
                  key={`${x.kind}-${x.s}-${x.e}`}
                  className={cn('absolute top-[5px] bottom-[5px] rounded-[5px]', busyClass[x.kind])}
                  style={{
                    left: `${pct(Math.max(x.s, CW0))}%`,
                    width: `${((Math.min(x.e, CW1) - Math.max(x.s, CW0)) / span) * 100}%`,
                  }}
                  title={`${x.label}, ${mins(x.s)}–${mins(x.e)}`}
                />
              ))}
            {b.cov === 'unknown' && (
              <i className="absolute inset-1 grid place-items-center justify-items-end rounded-md bg-surface pr-2.5 text-d11 text-mute not-italic shadow-[inset_0_0_0_1px_var(--line-strong)]">
                {t('Nothing recorded, so availability is unknown')}
              </i>
            )}
          </>
        )}
      </div>
      {pid !== me.id ? (
        <button
          type="button"
          className="inline-grid size-[26px] cursor-pointer place-items-center justify-self-end rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink"
          aria-label={t('Remove {who}', { who: p?.first ?? '' })}
          onClick={() => {
            removeGuest(c, pid);
          }}
        >
          <Icon name="close" size="xs" />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

function WeekStrip({ c }: { c: ComposerState }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const ws0 = weekStart(c.date);
  return (
    <div
      className="mt-3.5 grid grid-cols-7 gap-1.5 max-[760px]:grid-cols-[repeat(7,74px)] max-[760px]:overflow-x-auto"
      role="radiogroup"
      aria-label={t('Days this week')}
    >
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(ws0, i);
        const past = d < today();
        const ok = openStartTimes(db, me, c, d);
        return (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={d === c.date}
            disabled={past}
            aria-label={`${dLong(d)}, ${plural(ok, '{n} open start time', '{n} open start times')}`}
            className={cn(
              'grid cursor-pointer gap-1.5 rounded-[10px] border-0 bg-surface-2 px-2 pt-2 pb-[7px] text-left enabled:hover:bg-hover disabled:cursor-default disabled:opacity-45',
              d === c.date && 'bg-surface shadow-[inset_0_0_0_1.5px_var(--ink)] enabled:hover:bg-surface',
            )}
            onClick={() => {
              const open = suggestions(db, me, { ...c, date: d });
              patchComposer({
                date: d,
                ack: false,
                start: c.touched ? (open.includes(c.start) ? c.start : (open[0] ?? c.start)) : c.start,
              });
            }}
          >
            <span className="text-d11h leading-5 text-mute">
              {WD()[D(d).getDay()]} <b className="font-sans text-d13 font-semibold text-ink">{D(d).getDate()}</b>
            </span>
            <span className="relative h-1.5 overflow-hidden rounded-[3px] bg-green-soft">
              {everyone(me, c).flatMap((pid) =>
                busyFor(db, me.id, pid, d)
                  .list.filter((x) => x.e > CW0 && x.s < CW1)
                  .map((x) => (
                    <i
                      key={`${pid}-${x.s}-${x.e}`}
                      className="absolute top-0 bottom-0 bg-[color-mix(in_srgb,var(--ink-2)_55%,transparent)]"
                      style={{
                        left: `${((Math.max(x.s, CW0) - CW0) / span) * 100}%`,
                        width: `${((Math.min(x.e, CW1) - Math.max(x.s, CW0)) / span) * 100}%`,
                      }}
                    />
                  )),
              )}
            </span>
            <span className={cn('font-sans text-d11 font-semibold text-green-ink', !ok && 'text-mute')}>
              {past ? t('Past') : ok ? plural(ok, '{n} open', '{n} open') : t('Full')}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AddPerson({ c }: { c: ComposerState }) {
  const [q, setQ] = useState('');
  const picker = usePeoplePicker(c.people, (id) => {
    setQ('');
    addGuest(c, id);
  });
  return (
    <span className="relative inline-flex">
      <input
        className="h-[26px] w-[130px] rounded-round border-0 bg-surface px-2.5 text-d13 text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]"
        placeholder={t('Add people')}
        autoComplete="off"
        aria-label={t('Add people')}
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
      <div className="absolute top-8 left-0 z-[6]">
        <PeoplePicker view={picker.view} />
      </div>
    </span>
  );
}

function Slot({ c, bad, clashText }: { c: ComposerState; bad: boolean; clashText: string }) {
  const slot = useRef<HTMLDivElement>(null);
  const set = (start: number) => {
    patchComposer({ start: Math.min(CW1 - c.dur, Math.max(CW0, start)), touched: true, ack: false });
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const lanes = slot.current?.parentElement;
    if (!lanes) return;
    const cs = getComputedStyle(lanes);
    const perMin =
      (lanes.getBoundingClientRect().width -
        parseFloat(cs.getPropertyValue('--l0')) -
        parseFloat(cs.getPropertyValue('--l1'))) /
      span;
    const x0 = e.clientX;
    const s0 = c.start;
    const move = (ev: PointerEvent) => {
      set(s0 + Math.round((ev.clientX - x0) / perMin / 15) * 15);
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      slot.current?.focus();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return (
    <div
      ref={slot}
      tabIndex={0}
      role="slider"
      aria-label={t('Meeting time. Arrow keys move it by 15 minutes, Shift by an hour.')}
      aria-valuemin={CW0}
      aria-valuemax={CW1 - c.dur}
      aria-valuenow={c.start}
      aria-valuetext={`${mins(c.start)}–${mins(c.start + c.dur)}${bad ? `, ${clashText}` : ''}`}
      className={cn(
        'absolute -top-1.5 bottom-0 cursor-grab touch-none rounded-[9px] bg-[rgb(0_194_90/14%)] shadow-[inset_0_0_0_2px_var(--green)] outline-none',
        'focus-visible:shadow-[inset_0_0_0_2px_var(--green),0_0_0_3px_var(--surface),0_0_0_5px_var(--green)]',
        bad && 'bg-[rgb(180_35_24/12%)] shadow-[inset_0_0_0_2px_var(--danger)]',
      )}
      style={{
        left: `calc(var(--l0) + (100% - var(--l0) - var(--l1)) * ${pct(c.start) / 100})`,
        width: `calc((100% - var(--l0) - var(--l1)) * ${c.dur / span})`,
      }}
      onPointerDown={onPointerDown}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        set(c.start + (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 60 : 15));
      }}
    >
      <span
        className={cn(
          'absolute -top-[22px] left-1/2 -translate-x-1/2 rounded-md bg-ink px-[7px] py-0.5 font-mono text-d10h font-semibold whitespace-nowrap text-on-ink',
          bad && 'bg-danger text-white',
        )}
      >
        {mins(c.start)}
        {bad ? `, ${t('clash')}` : ''}
      </span>
    </div>
  );
}

function Body({ c }: { c: ComposerState }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const bad = conflicts(db, me, c, c.start, c.dur);
  const unknown = everyone(me, c).filter((pid) => coverage(db, pid) === 'unknown');
  const sug = suggestions(db, me, c);
  const clashText = bad
    .map((i) => {
      const k = clashOf(db, me.id, i, c.date, c.start, c.start + c.dur)[0]?.kind ?? 'meeting';
      return `${i === me.id ? t('You') : (db.people.find((p) => p.id === i)?.first ?? '')}: ${t(BUSY_KIND[k]).toLowerCase()}`;
    })
    .join('; ');
  const projects = db.projects.filter(
    (p) => visibleDivs(me).includes(p.div) && !['completed', 'cancelled', 'archived'].includes(p.stage),
  );
  const step =
    'inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink';
  const peopleOf = (ids: string[]) => nameList(db, me.id, ids);
  return (
    <>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {c.people.map((pid) => (
          <span
            key={pid}
            className="inline-flex h-[26px] items-center gap-1.5 rounded-round bg-fill pr-2.5 pl-1 text-d12h font-[550]"
          >
            <Avatar id={pid} size="xs" />
            {db.people.find((p) => p.id === pid)?.first}
            <button
              type="button"
              className="-mr-1.5 grid size-[18px] place-items-center rounded-full border-0 bg-transparent text-mute"
              aria-label={t('Remove {who}', { who: db.people.find((p) => p.id === pid)?.first ?? '' })}
              onClick={() => {
                removeGuest(c, pid);
              }}
            >
              <Icon name="close" size="xs" />
            </button>
          </span>
        ))}
        <AddPerson c={c} />
      </div>
      {!c.text && !c.manual.length && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-mute type-small">{t('Try')}</span>
          {EXAMPLES.map((x) => (
            <button
              key={x}
              type="button"
              className="h-[30px] cursor-pointer rounded-lg border-0 bg-surface-2 px-2.5 font-sans text-d12h font-medium whitespace-pre text-ink-2 hover:bg-hover"
              onClick={() => {
                patchComposer({ text: t(x) });
              }}
            >
              {t(x)}
            </button>
          ))}
        </div>
      )}
      <WeekStrip c={c} />
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            className={step}
            aria-label={t('Previous day')}
            onClick={() => {
              patchComposer({ date: addDays(c.date, -1) });
            }}
          >
            <Icon name="chevron-left" />
          </button>
          <DateField
            label={t('Date')}
            value={c.date}
            className="h-8 w-auto min-w-[150px] px-2"
            onChange={(v) => {
              if (v) patchComposer({ date: v });
            }}
          />
          <button
            type="button"
            className={step}
            aria-label={t('Next day')}
            onClick={() => {
              patchComposer({ date: addDays(c.date, 1) });
            }}
          >
            <Icon name="chevron" />
          </button>
        </span>
        <span className="flex items-center gap-1.5">
          <label className="text-mute type-small" htmlFor="c-start">
            {t('Start')}
          </label>
          <input
            id="c-start"
            type="time"
            step={900}
            className={cn(inputClass, 'h-8 w-auto px-2')}
            value={mins(c.start)}
            onChange={(e) => {
              const m = toMin(e.target.value);
              if (m != null)
                patchComposer({ start: Math.max(CW0, Math.min(CW1 - c.dur, Math.round(m / 15) * 15)), touched: true });
            }}
          />
          <span className="inline-flex h-[34px] items-center gap-0.5 rounded-lg px-0.5 shadow-[0_0_0_1px_var(--line-strong)]">
            <button
              type="button"
              className={step}
              aria-label={t('Shorter')}
              onClick={() => {
                patchComposer({
                  dur: Math.max(15, c.dur - 15),
                  start: Math.min(CW1 - Math.max(15, c.dur - 15), c.start),
                });
              }}
            >
              <Icon name="minus" />
            </button>
            <b className="min-w-16 px-1.5 text-center font-mono text-d12h font-semibold">
              {c.dur} {t('min')}
            </b>
            <button
              type="button"
              className={step}
              aria-label={t('Longer')}
              onClick={() => {
                patchComposer({
                  dur: Math.min(240, c.dur + 15),
                  start: Math.min(CW1 - Math.min(240, c.dur + 15), c.start),
                });
              }}
            >
              <Icon name="plus" />
            </button>
          </span>
        </span>
      </div>
      <div className="mt-2.5 mb-1.5 grid grid-cols-[var(--l0)_repeat(14,1fr)_var(--l1)] font-mono text-d10h font-medium text-mute">
        <span />
        {Array.from({ length: span / 60 }, (_, n) => (
          <span key={n}>{String(CW0 / 60 + n).padStart(2, '0')}</span>
        ))}
        <span />
      </div>
      <div className="relative select-none">
        {everyone(me, c).map((pid) => (
          <Lane key={pid} pid={pid} c={c} />
        ))}
        <Slot c={c} bad={bad.length > 0} clashText={clashText} />
      </div>
      <div className="mt-2.5 ml-[var(--l0)] flex flex-wrap gap-3.5 text-mute type-small [&_i]:inline-block [&_i]:h-2.5 [&_i]:w-[18px] [&_i]:rounded-[3px] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-1.5">
        <span>
          <i className={busyClass.meeting} />
          {t('Meeting')}
        </span>
        <span>
          <i className={busyClass.away} />
          {t('Unavailable')}
        </span>
        <span>
          <i className={busyClass.google} />
          Google
        </span>
        <span>
          <i className="bg-[repeating-linear-gradient(135deg,transparent_0_5px,var(--fill)_5px_10px)] shadow-[inset_0_0_0_1px_var(--line-strong)]" />
          {t('Unknown')}
        </span>
      </div>
      <div className="my-3.5 flex flex-wrap items-center gap-2 text-d13 text-mute">
        {sug.length ? (
          <>
            <span>
              {unknown.length ? t('No recorded conflict for people with a schedule at') : t('No recorded conflict at')}
            </span>
            {sug.map((s) => (
              <button
                key={s}
                type="button"
                className={cn(
                  'h-7 cursor-pointer rounded-md border-0 bg-fill px-2.5 font-mono text-d12 font-medium',
                  s === c.start && 'bg-ink text-on-ink',
                )}
                onClick={() => {
                  patchComposer({ start: s, touched: true, ack: false });
                }}
              >
                {mins(s)}
              </button>
            ))}
          </>
        ) : (
          t('No time without a recorded conflict on this day. Try another day.')
        )}
      </div>
      <div className="flex items-center gap-3 rounded-[10px] bg-surface-2 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <b className="block font-semibold">
            {c.title}
            {c.people.length ? ` ${t('with')} ${peopleOf(c.people)}` : ''}
          </b>
          <small className={cn('block text-d12h text-mute', bad.length > 0 && 'text-danger')}>
            {dLong(c.date)}, {mins(c.start)}–{mins(c.start + c.dur)}, {TZ_LABEL}
          </small>
          {bad.length > 0 && (
            <small className="flex items-center gap-1 text-d12h text-danger">
              <Icon name="warning" size="xs" />
              {t('Clashes')}: {clashText}
            </small>
          )}
          {unknown.length > 0 && (
            <small className={cn('block text-d12h text-mute', bad.length > 0 && 'text-danger')}>
              {t('{who}: nothing recorded, so availability is unknown', { who: peopleOf(unknown) })}
            </small>
          )}
        </div>
        <AvatarBubbles ids={c.people} size="xs" />
      </div>
      {c.more ? (
        <div className="mt-3 grid grid-cols-2 gap-2 max-[760px]:grid-cols-1">
          <SelectField
            label={t('Project')}
            value={c.project ?? ''}
            options={[{ value: '', label: t('No project') }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
            onChange={(v) => {
              setComposerField({ project: v || null });
            }}
          />
          <SelectField
            label={t('Note-taker')}
            people
            value={c.notetaker ?? me.id}
            options={everyone(me, c).map((i) => ({
              value: i,
              label: t('Note-taker: {who}', {
                who: i === me.id ? t('you') : (db.people.find((p) => p.id === i)?.name ?? ''),
              }),
            }))}
            onChange={(v) => {
              setComposerField({ notetaker: v });
            }}
          />
          <textarea
            className={cn(textareaClass, 'col-span-full min-h-16')}
            placeholder={t('Agenda, one item per line')}
            aria-label={t('Agenda')}
            value={c.agenda}
            autoFocus
            onChange={(e) => {
              setComposerField({ agenda: e.target.value });
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent py-2 text-d13 font-semibold text-green-ink"
          onClick={() => {
            setComposerField({ more: true });
          }}
        >
          {t('Add agenda, project and note-taker')}
        </button>
      )}
      <div className="mt-3 flex items-center gap-2">
        <label
          className="relative inline-flex h-[34px] flex-none cursor-pointer items-center gap-1.5 rounded-lg px-2 text-d13 font-[550] focus-within:shadow-[var(--focus)]"
          title={t('Google Calendar creates the Meet link when it syncs. Prototype: no link is created.')}
        >
          <input
            type="checkbox"
            className="absolute size-px opacity-0"
            checked={c.meet}
            onChange={(e) => {
              setComposerField({ meet: e.target.checked });
            }}
          />
          <span
            className={cn(
              'relative h-[22px] w-9 flex-none rounded-round bg-line-strong transition-colors',
              c.meet && 'bg-green',
            )}
          >
            <span
              className={cn(
                'absolute top-[3px] left-[3px] size-4 rounded-full bg-surface shadow-[0_1px_2px_rgb(0_0_0/20%)] transition-transform duration-[var(--d-hover)]',
                c.meet && 'translate-x-3.5',
              )}
            />
          </span>
          Meet
        </label>
        <input
          className="h-[34px] min-w-0 flex-1 rounded-lg border-0 bg-surface px-2.5 text-ink shadow-[0_0_0_1px_var(--line-strong)] type-small"
          placeholder={t('Place or link, for example a Google Maps link')}
          aria-label={t('Place or link')}
          value={c.where}
          onChange={(e) => {
            setComposerField({ where: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              send(c);
            }
          }}
        />
        <Button
          variant={bad.length ? 'danger' : 'primary'}
          disabled={!c.people.length}
          onClick={() => {
            send(c);
          }}
        >
          {bad.length && c.ack ? t('Send anyway') : t('Send invitations')}{' '}
          <span className="rounded-[5px] bg-[rgb(255_255_255/14%)] px-1.5 py-px font-mono text-d11 font-medium">⏎</span>
        </Button>
      </div>
      {bad.length > 0 && c.ack && (
        <p className="mt-2 mb-0 text-danger type-small">
          {t('Clashes for {who}. They can still accept or decline; a clash is never treated as a yes.', {
            who: peopleOf(bad),
          })}
        </p>
      )}
    </>
  );
}

export function MeetingComposer() {
  const c = useComposer();
  useEffect(() => {
    if (!c) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeComposer();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [c]);
  if (!c) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-[rgb(22_22_21/18%)] dark:bg-[rgb(0_0_0/45%)]"
        onClick={closeComposer}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label={t('New meeting')}
        className={cn(
          'fixed top-[9vh] left-1/2 z-[31] max-h-[84dvh] w-[min(680px,calc(100vw-24px))] -translate-x-1/2 overflow-x-hidden overflow-y-auto rounded-[10px] bg-surface px-4 pt-3.5 pb-4 shadow-pop',
          '[--l0:170px] [--l1:30px]',
          'max-[760px]:inset-0 max-[760px]:top-0 max-[760px]:h-dvh max-[760px]:max-h-none max-[760px]:w-screen max-[760px]:translate-x-0 max-[760px]:rounded-none max-[760px]:[--l0:110px] max-[760px]:[--l1:26px]',
        )}
      >
        <div className="flex items-center gap-3 px-0.5 pt-0.5 pb-3.5 shadow-[0_1px_0_var(--line)]">
          <span className="grid size-8 flex-none place-items-center rounded-lg bg-green-soft text-green-ink">
            <Icon name="calendar" />
          </span>
          <Sentence c={c} />
          <button
            type="button"
            className="inline-grid size-[30px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink"
            aria-label={t('Close')}
            onClick={closeComposer}
          >
            <Icon name="close" />
          </button>
        </div>
        <Body c={c} />
      </div>
    </>
  );
}
