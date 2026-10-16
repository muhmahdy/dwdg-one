/* Unavailable time, Google busy time and the full meeting editor in the side panel (availability_declared,
   integration-calendar, D23). Unavailable time is private: others see only that you are unavailable, and the note stays yours.
   From screens/schedule.js INSP.unavail / INSP.gbusy / INSP['event-edit']. */
import { useState } from 'react';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { cn } from '@/lib/cn';
import { t, WDL } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { D, dLong, dShort, mins, today, toMin, weekday } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { InspectorRef } from '@/app/ui-state';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { overlaps } from '../../services/availability';
import { TZ_LABEL } from '../../services/ics';
import { deleteUnavailable, saveUnavailable, type UnavailableDraft } from '../../services/meeting-actions';
import { useCalDate, useDraft } from '../../services/schedule-ui';
import { DraftForm } from '../DraftForm';

function UnavailablePanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const calDate = useCalDate();
  const own = insp.id ? db.unavailable.find((u) => u.id === insp.id) : undefined;
  const [u, setU] = useState<UnavailableDraft>(() =>
    own
      ? {
          date: own.date ?? own.from ?? calDate,
          start: own.start,
          end: own.end,
          allDay: !!own.allDay,
          weekly: own.weekly,
          note: own.note,
        }
      : { date: today(), start: 13 * 60, end: 15 * 60, allDay: false, weekly: false, note: '' },
  );
  const [error, setError] = useState('');
  if (!me || (insp.id && !own)) return <InspectorHead>{t('Unavailable time')}</InspectorHead>;
  const patch = (p: Partial<UnavailableDraft>) => {
    setU((x) => ({ ...x, ...p }));
    setError('');
  };
  const hit = db.meetings.filter(
    (mt) =>
      mt.state !== 'cancelled' &&
      mt.responses[me.id] === 'accepted' &&
      (u.weekly ? weekday(mt.date) === weekday(u.date) && mt.date >= u.date : mt.date === u.date) &&
      overlaps(u.allDay ? 0 : u.start, u.allDay ? 1440 : u.end, mt.start, mt.end),
  );
  const save = () => {
    const r = saveUnavailable(own?.id ?? null, u);
    if (typeof r === 'string') setError(r);
  };
  const check = 'mb-1 flex cursor-pointer items-center gap-2 text-d13';
  return (
    <>
      <InspectorHead>{own ? t('Unavailable time') : t('Mark unavailable')}</InspectorHead>
      <h2 className="mt-3 mb-2 type-h2">{own ? own.note || t('Unavailable') : t('When are you unavailable?')}</h2>
      <p className="-mt-1 mb-3.5 text-mute type-small">
        {t('Others see only that you are unavailable. The note stays private to you. This is not a leave request.')}
      </p>
      <Field label={u.weekly ? t('Starting') : t('Date')} htmlFor="ua-date">
        <DateField
          id="ua-date"
          label={t('Date')}
          value={u.date}
          onChange={(v) => {
            if (v) patch({ date: v });
          }}
        />
      </Field>
      <label className={check}>
        <input
          type="checkbox"
          className="size-4 accent-ink"
          checked={u.allDay}
          onChange={(e) => {
            patch({ allDay: e.target.checked });
          }}
        />
        {t('All day')}
      </label>
      {!u.allDay && (
        <Grid2>
          <Field label={t('From')} htmlFor="ua-s">
            <input
              id="ua-s"
              type="time"
              step={900}
              className={inputClass}
              value={mins(u.start)}
              onChange={(e) => {
                const m = toMin(e.target.value);
                if (m != null) patch({ start: m });
              }}
            />
          </Field>
          <Field label={t('To')} htmlFor="ua-e" help={error} error>
            <input
              id="ua-e"
              type="time"
              step={900}
              className={cn(inputClass, error && invalidClass)}
              value={mins(Math.min(u.end, 1439))}
              onChange={(e) => {
                const m = toMin(e.target.value);
                if (m != null) patch({ end: m });
              }}
            />
          </Field>
        </Grid2>
      )}
      <label className={check}>
        <input
          type="checkbox"
          className="size-4 accent-ink"
          checked={u.weekly}
          onChange={(e) => {
            patch({ weekly: e.target.checked });
          }}
        />
        {t('Repeat every week on {day}', { day: WDL()[D(u.date).getDay()] ?? '' })}
      </label>
      <Field label={t('Private note')} htmlFor="ua-note" optional className="mt-3">
        <input
          id="ua-note"
          className={inputClass}
          placeholder={t('Class, lab, part-time work')}
          value={u.note}
          onChange={(e) => {
            patch({ note: e.target.value });
          }}
        />
      </Field>
      <p className="text-mute type-small">{t('Times in {tz}', { tz: TZ_LABEL })}</p>
      {hit.length > 0 && (
        <Notice tone="warn" icon="warning" title={<b>{t('Overlaps meetings you accepted')}</b>}>
          <p>
            {hit.map((mt) => (
              <span key={mt.id} className="block">
                {mt.title}, {dShort(mt.date)} {mins(mt.start)}
              </span>
            ))}
          </p>
          <p>{t('Those meetings stay as they are. Tell the organizer if you cannot attend.')}</p>
        </Notice>
      )}
      <div className="mt-[18px] flex flex-wrap gap-2">
        <Button variant="primary" onClick={save}>
          {t('Save')}
        </Button>
        {own ? (
          <Button
            variant="danger"
            onClick={() => {
              void deleteUnavailable(own.id);
            }}
          >
            <Icon name="trash" />
            {t('Remove')}
          </Button>
        ) : (
          <Button variant="ghost" onClick={closeInspector}>
            {t('Cancel')}
          </Button>
        )}
      </div>
      {own && (
        <div className="mt-[18px]">
          <Meta>
            <MetaRow label={t('Created')}>
              {own.createdAt ? (
                who.stamp(own.who, own.createdAt)
              ) : (
                <span className="text-mute">{t('Not recorded')}</span>
              )}
            </MetaRow>
          </Meta>
        </div>
      )}
    </>
  );
}

function GooglePanel({ insp }: { insp: InspectorRef }) {
  const g = useWorkspace((db) => db.gbusy.find((x) => x.id === insp.id));
  if (!g) return <InspectorHead>{t('Google Calendar')}</InspectorHead>;
  return (
    <>
      <InspectorHead>{t('From Google Calendar')}</InspectorHead>
      <h2 className="mt-3 mb-2 type-h2">{g.title}</h2>
      <Meta>
        <MetaRow label={t('When')}>
          {dLong(g.date)},{' '}
          <span className="type-num">
            {mins(g.start)}–{mins(g.end)}
          </span>
        </MetaRow>
      </Meta>
      <p className="mt-3 text-mute type-small">
        {t(
          'Only you see this title. Others see that you are busy. Edit it in Google Calendar; the change comes back here.',
        )}
      </p>
    </>
  );
}

function EventEditPanel() {
  const d = useDraft();
  return (
    <>
      <InspectorHead>{d?.id ? t('Edit meeting') : t('New')}</InspectorHead>
      <div className="mt-3">{d && <DraftForm d={d} full />}</div>
    </>
  );
}

PANELS.unavail = UnavailablePanel;
PANELS.gbusy = GooglePanel;
PANELS['event-edit'] = EventEditPanel;
