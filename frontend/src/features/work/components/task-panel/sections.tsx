/* The task panel's form parts: the essentials (title, due, time, notes), Planning, Review and sign-off, and Details.
   Same fields as the prototype's panel; each field saves when it changes (data-bind change handler). */
import { openMeeting, openResource } from '@/lib/open';
import { useState, type ReactNode } from 'react';
import { Avatar } from '@/components/shared/Avatar';
import { DateField } from '@/components/ui/DateField';
import { Segmented, Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SelectField } from '@/components/ui/SelectField';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { dLong, dShort, mins } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { Task } from '@/types/workspace';
import { RepeatLine } from '@/features/operations/components/RoutineTaskBox';
import { rtOf } from '@/features/operations/services/routines';
import { unitLeads, isDone, projOf, taskDiv } from '../../services/selectors';
import { canManageSignoff, isHandIn, signerFor } from '../../services/signoff';
import { repeatTask, setSigner, setSignoffMode, setTaskField, type TaskField } from '../../services/task-actions';
import { Meta, MetaRow, PeopleSelect } from './parts';

/** Text/date fields that save when they change. `commit` returns an error message when the value is refused. */
function useField(task: Task, field: TaskField) {
  const [error, setError] = useState('');
  const commit = (value: string) => {
    const r = setTaskField(task.id, field, value);
    setError(typeof r === 'string' ? r : '');
  };
  return { error, commit, fail: setError };
}

const optional = true;

export function Essentials({ task, edit, summary }: { task: Task; edit: boolean; summary: boolean }) {
  const title = useField(task, 'title');
  const due = useField(task, 'due');
  const time = useField(task, 'time');
  const notes = useField(task, 'notes');
  if (!edit)
    return (
      <>
        <Meta>
          <MetaRow label={t('Due')}>
            {task.due ? (
              `${dLong(task.due)}${task.time != null ? `, ${mins(task.time)}` : ''}`
            ) : (
              <span className="text-mute">{t('No date')}</span>
            )}
          </MetaRow>
        </Meta>
        {task.notes && <p className="mt-3 whitespace-pre-line type-small">{task.notes}</p>}
      </>
    );
  return (
    <>
      <Field label={t('Title')} htmlFor="f-title">
        <input
          id="f-title"
          className={inputClass}
          defaultValue={task.title}
          key={`${task.id}:${task.title}`}
          onBlur={(e) => {
            if (e.target.value !== task.title) title.commit(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
      </Field>
      {!summary && (
        <Grid2>
          <Field label={t('Due date')} htmlFor="f-due" optional={optional}>
            <DateField id="f-due" kind="due" label={t('Due date')} value={task.due ?? ''} onChange={due.commit} />
          </Field>
          <Field label={t('Time')} htmlFor="f-time" optional={optional}>
            <input
              id="f-time"
              type="time"
              className={inputClass}
              value={task.time != null ? mins(task.time) : ''}
              disabled={!task.due}
              onChange={(e) => {
                time.commit(e.target.value);
              }}
            />
          </Field>
        </Grid2>
      )}
      <Field label={t('Notes')} htmlFor="f-notes" optional={optional}>
        <textarea
          id="f-notes"
          className={textareaClass}
          defaultValue={task.notes}
          key={`${task.id}:n:${task.notes}`}
          onBlur={(e) => {
            if (e.target.value !== task.notes) notes.commit(e.target.value);
          }}
        />
      </Field>
    </>
  );
}

export function PlanningSection({ task }: { task: Task }) {
  const me = useMe();
  const start = useField(task, 'start');
  const routine = useWorkspace((db) => rtOf(db, task.routine));
  const [repeat, setRepeat] = useState('');
  const canRepeat = !task.project && task.owner === me?.id;
  return (
    <>
      <Field
        label={t('Planned start')}
        htmlFor="f-start"
        optional={t('Optional, for the timeline')}
        help={start.error}
        error
      >
        <DateField
          id="f-start"
          kind="start"
          label={t('Planned start')}
          className={start.error ? invalidClass : undefined}
          value={task.start ?? ''}
          max={task.due ?? undefined}
          disabled={!task.due}
          onChange={(v) => {
            if (v && task.due && v > task.due) {
              start.fail(t('The start cannot be after the due date.'));
              return;
            }
            start.commit(v);
          }}
        />
      </Field>
      {canRepeat &&
        (routine ? (
          <Field label={t('Repeats')}>
            <RepeatLine routine={routine} />
          </Field>
        ) : (
          <Field label={t('Repeat')} htmlFor="f-repeat" optional>
            <SelectField
              id="f-repeat"
              value={repeat}
              options={[
                { value: '', label: t('Does not repeat') },
                { value: 'weekly', label: t('Every week') },
                { value: '2w', label: t('Every 2 weeks') },
                { value: 'monthly', label: t('Every month') },
              ]}
              onChange={(v) => {
                setRepeat(v);
                if (v === 'weekly' || v === '2w' || v === 'monthly') void repeatTask(task.id, v);
              }}
            />
          </Field>
        ))}
    </>
  );
}

/** Sign-off: who checks the work before it counts as done, and whether that is needed at all. */
function SignoffField({ task }: { task: Task }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  if (!me) return null;
  const signer = signerFor(db, task);
  const manage = canManageSignoff(db, me, task);
  const routine = rtOf(db, task.routine);
  const project = projOf(db, task.project);
  const doneLine =
    isDone(task) && task.signedBy ? (
      <p className="mx-0 mt-2 mb-0 flex items-center gap-1.5 text-d12h text-green-ink">
        {t('Signed off by {who}, {d}', { who: who.name(task.signedBy), d: dShort((task.signedAt ?? '').slice(0, 10)) })}
      </p>
    ) : null;
  const label = <>{t('Sign-off')}</>;
  if (!manage) {
    if (signer && !isDone(task))
      return (
        <Field label={label}>
          <p className="m-0 flex items-center gap-2 text-d13h">
            <Avatar id={signer} size="xs" />
            <span>
              {task.owner === me.id
                ? t('{who} checks it before it counts as done.', { who: who.name(signer) })
                : t('{who} signs off.', { who: who.name(signer) })}
            </span>
          </p>
        </Field>
      );
    return doneLine ? <Field label={label}>{doneLine}</Field> : null;
  }
  const unit = taskDiv(db, task);
  const pool = [
    ...new Set(
      [signer, task.createdBy, project?.lead, project?.pm, ...(unit ? unitLeads(db, unit) : []), me.id].filter(
        (id): id is string => !!id && id !== task.owner && db.people.some((p) => p.id === id),
      ),
    ),
  ];
  return (
    <Field
      label={label}
      help={
        signer
          ? t('When {who} finishes, it waits for this sign-off before it counts as done.', {
              who: who.first(task.owner),
            })
          : t('It counts as done as soon as {who} ticks it.', { who: who.first(task.owner) })
      }
    >
      {!routine && (
        <Segmented
          value={signer ? 'on' : 'off'}
          options={[
            ['on', t('Needed')],
            ['off', t('Not needed')],
          ]}
          onChange={(k) => {
            void setSignoffMode(task.id, k);
          }}
        />
      )}
      {signer && (
        <SelectField
          className="mt-2"
          label={t('Who signs off')}
          value={signer}
          people
          options={pool.map((id) => ({ value: id, label: who.name(id) }))}
          onChange={(v) => {
            void setSigner(task.id, v);
          }}
        />
      )}
      {doneLine}
    </Field>
  );
}

export function ReviewSection({ task, edit }: { task: Task; edit: boolean }) {
  const me = useMe();
  const evidence = useField(task, 'evidence');
  const who = useWho();
  const db = useWorkspace((w) => w);
  if (!edit)
    return task.reviewer ? (
      <Meta>
        <MetaRow label={t('Reviewer')}>
          <Avatar id={task.reviewer} size="xs" />
          {who.name(task.reviewer)}
        </MetaRow>
      </Meta>
    ) : null;
  const hasSigner = !!signerFor(db, task);
  return (
    <>
      {!isHandIn(db, task) && (
        <Field
          label={t('Evidence link')}
          htmlFor="f-ev"
          optional
          help={evidence.error || t('A link to the finished work, for whoever reviews it.')}
          error={!!evidence.error}
        >
          <input
            id="f-ev"
            className={cn(inputClass, evidence.error && invalidClass)}
            placeholder="https://"
            defaultValue={task.evidence}
            key={`${task.id}:ev:${task.evidence}`}
            onBlur={(e) => {
              if (e.target.value !== task.evidence) evidence.commit(e.target.value);
            }}
          />
        </Field>
      )}
      {hasSigner || task.signedBy || (me && canManageSignoff(db, me, task)) ? (
        <SignoffField task={task} />
      ) : task.status === 'review' || task.reviewer ? (
        <Field label={t('Reviewer')} htmlFor="f-rev">
          <PeopleSelect
            id="f-rev"
            value={task.reviewer}
            exclude={[task.owner]}
            blank={t('No reviewer')}
            onChange={(id) => {
              void setTaskField(task.id, 'reviewer', id);
            }}
          />
        </Field>
      ) : null}
    </>
  );
}

export function DetailsSection({ task, children }: { task: Task; children?: ReactNode }) {
  const who = useWho();
  const db = useWorkspace((w) => w);
  const offer = task.offer ? db.offers.find((o) => o.id === task.offer) : undefined;
  const meeting = task.meeting ? db.meetings.find((m) => m.id === task.meeting) : undefined;
  const links = task.links.map((id) => db.resources.find((r) => r.id === id)).filter((r) => !!r);
  return (
    <Meta>
      {offer?.answeredAt && (
        <MetaRow label={t('Agreed')}>
          {t('Offered by {who}, accepted {d}', {
            who: who.first(offer.from),
            d: dShort(offer.answeredAt.slice(0, 10)),
          })}
        </MetaRow>
      )}
      {meeting && (
        <MetaRow label={t('From meeting')}>
          <a
            className="cursor-pointer underline"
            onClick={() => {
              openMeeting(meeting.id);
            }}
          >
            {meeting.title}, {dShort(meeting.date)}
          </a>
        </MetaRow>
      )}
      {links.length > 0 && (
        <MetaRow label={t('Linked')}>
          <span>
            {links.map((r, i) => (
              <span key={r.id}>
                {i > 0 && ', '}
                <a
                  className="cursor-pointer underline"
                  onClick={() => {
                    openResource(r.id);
                  }}
                >
                  {r.name}
                </a>
              </span>
            ))}
          </span>
        </MetaRow>
      )}
      <MetaRow label={t('Created')}>
        <Avatar id={task.createdBy} size="xs" />
        {who.stamp(task.createdBy, task.createdAt)}
      </MetaRow>
      {children}
    </Meta>
  );
}
