/* The meeting panel: details, replies, outcomes (minutes, decisions, follow-ups) and the .ics download
   (work_meeting_outcomes, integration-calendar). From screens/schedule.js INSP.meeting. */
import { useState } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/shared/Avatar';
import { TaskIcon } from '@/components/shared/art/task-icons';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { openMenu } from '@/components/shared/menus';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass } from '@/components/ui/forms';
import { EmptyLine, PanelRule, SectionHeading, SubHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { State } from '@/components/ui/StatusBadge';
import { rank, visibleDivs } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openDecision, openOffer, openPerson, openResource } from '@/lib/open';
import { useWho } from '@/lib/people';
import { dLong, mins, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import type { InspectorRef } from '@/app/ui-state';
import type { Decision, Offer } from '@/types/workspace';
import { Reactions } from '@/features/work/components/Reactions';
import { TaskRow } from '@/features/work/components/TaskRow';
import { PeopleSelect, Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { overlaps, unavailableOn } from '../../services/availability';
import { draftFromMeeting } from '../../services/drafts';
import { downloadIcs, TZ_LABEL } from '../../services/ics';
import { addDecision, addFollowup, cancelMeeting, markHeld, writeMinutes } from '../../services/meeting-actions';
import { meetingWs, rsvp } from '../../services/meetings';
import { openDraft } from '../../services/schedule-ui';
import { WhereText } from '../WhereText';

const RESP: Record<string, [string, string, 'green' | 'mute' | 'ink2']> = {
  accepted: ['Going', 'check', 'green'],
  declined: ['Declined', 'close', 'mute'],
  pending: ['No reply yet', 'clock', 'ink2'],
};
const MEETING_STATE: Record<string, [string, string, 'ink2' | 'green' | 'danger']> = {
  planned: ['Planned', 'calendar', 'ink2'],
  held: ['Held', 'check', 'green'],
  cancelled: ['Canceled', 'close', 'danger'],
};
const DECISION_STATE: Record<string, [string, string, 'warn' | 'green' | 'danger']> = {
  awaiting: ['Awaiting decision', 'clock', 'warn'],
  approved: ['Approved', 'check', 'green'],
  rejected: ['Rejected', 'close', 'danger'],
};
const OFFER_STATE: Record<string, [string, string, 'ink2' | 'green' | 'mute' | 'warn']> = {
  pending: ['Waiting for an answer', 'clock', 'ink2'],
  accepted: ['Accepted', 'check', 'green'],
  declined: ['Declined', 'close', 'mute'],
  changes: ['Changes requested', 'undo', 'warn'],
  withdrawn: ['Withdrawn', 'close', 'mute'],
};

const listRow = 'flex cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover min-h-[var(--row-h)]';
const subform = 'my-2.5 rounded-[10px] bg-surface-2 p-3.5 shadow-[inset_0_0_0_1px_var(--line)] [&_.mb-3\\.5]:mb-2.5';

function DecisionRow({ d }: { d: Decision }) {
  const st = DECISION_STATE[d.state] ?? DECISION_STATE.awaiting;
  return (
    <div
      className={listRow}
      role="button"
      tabIndex={0}
      onClick={() => {
        openDecision(d.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openDecision(d.id);
      }}
    >
      <div className="min-w-0 flex-1">
        {d.question}
        <small className="block text-d12h text-mute">{d.result}</small>
      </div>
      {st && <State label={t(st[0])} icon={st[1]} tone={st[2]} />}
    </div>
  );
}

function OfferRow({ o }: { o: Offer }) {
  const who = useWho();
  const st = OFFER_STATE[o.state] ?? OFFER_STATE.pending;
  return (
    <div
      className={listRow}
      role="button"
      tabIndex={0}
      onClick={() => {
        openOffer(o.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openOffer(o.id);
      }}
    >
      <Avatar id={o.to} size="xs" />
      <div className="min-w-0 flex-1">
        {o.title}
        <small className="block text-d12h text-mute">{t('Offered to {who}', { who: who.first(o.to) })}</small>
      </div>
      {st && <State label={t(st[0])} icon={st[1]} tone={st[2]} />}
    </div>
  );
}

function DecisionForm({ meetingId, onDone }: { meetingId: string; onDone: () => void }) {
  const me = useMe();
  const people = useWorkspace((w) => w.people);
  const [q, setQ] = useState('');
  const [r, setR] = useState('');
  const [who, setWho] = useState(me?.id ?? '');
  const [error, setError] = useState('');
  if (!me) return null;
  const save = () => {
    const res = addDecision(meetingId, q, r, who);
    if (typeof res === 'string') setError(res);
  };
  return (
    <div className={subform}>
      <Field label={t('Question')} htmlFor="dc-q" required help={error} error>
        <input
          id="dc-q"
          className={inputClass}
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setError('');
          }}
        />
      </Field>
      <Field label={t('Proposed result')} htmlFor="dc-r">
        <input
          id="dc-r"
          className={inputClass}
          value={r}
          onChange={(e) => {
            setR(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Who decides')} htmlFor="dc-appr" help={t('If someone else decides, it waits for their answer.')}>
        <PeopleSelect
          id="dc-appr"
          value={who}
          exclude={people.filter((p) => rank(p) < 2).map((p) => p.id)}
          onChange={setWho}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="primary" small onClick={save}>
          {t('Record')}
        </Button>
        <Button variant="ghost" small onClick={onDone}>
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

function FollowupForm({ meetingId, people, onDone }: { meetingId: string; people: string[]; onDone: () => void }) {
  const me = useMe();
  const who = useWho();
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState(me?.id ?? '');
  const [due, setDue] = useState('');
  const [error, setError] = useState('');
  if (!me) return null;
  const save = () => {
    const res = addFollowup(meetingId, title, owner, due || null);
    if (typeof res === 'string') setError(res);
  };
  return (
    <div className={subform}>
      <Field label={t('Follow-up')} htmlFor="fu-title" required help={error} error>
        <input
          id="fu-title"
          className={inputClass}
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Who')} htmlFor="fu-owner">
          <SelectField
            id="fu-owner"
            value={owner}
            people
            options={people.map((i) => ({ value: i, label: i === me.id ? t('Me') : who.name(i) }))}
            onChange={setOwner}
          />
        </Field>
        <Field label={t('Due')} htmlFor="fu-due" optional>
          <DateField id="fu-due" kind="due" label={t('Due')} value={due} onChange={setDue} />
        </Field>
      </Grid2>
      <p className="mb-2 text-mute type-small">
        {t('For someone else this is sent as an offer. Nothing is assigned until they accept.')}
      </p>
      <div className="flex gap-2">
        <Button variant="primary" small onClick={save}>
          {t('Add')}
        </Button>
        <Button variant="ghost" small onClick={onDone}>
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

export function MeetingPanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const [form, setForm] = useState<'' | 'decision' | 'followup' | 'cancel'>('');
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const mt = db.meetings.find((m) => m.id === insp.id);
  if (!mt || !me) return <InspectorHead>{t('Meeting')}</InspectorHead>;
  const mine = mt.responses[me.id];
  const org = mt.organizer === me.id;
  const taker = (mt.notetaker || mt.organizer) === me.id;
  const project = db.projects.find((p) => p.id === mt.project);
  const st = MEETING_STATE[mt.state] ?? MEETING_STATE.planned;
  const fallback = me.div ?? 'sng';
  if (!mine && !org && !visibleDivs(me).includes(meetingWs(db, mt, fallback)))
    return (
      <>
        <InspectorHead>{t('Meeting')}</InspectorHead>
        <div className="grid justify-items-start gap-2 p-7">
          <b className="type-h3">{t('You do not have access to this meeting')}</b>
          <p className="m-0 max-w-[44ch] text-mute">{t('Ask the organizer if you need it.')}</p>
        </div>
      </>
    );
  const googleGuests = Object.keys(mt.responses).filter((i) => db.people.find((p) => p.id === i)?.gcal).length;
  const decisions = db.decisions.filter((d) => d.meeting === mt.id);
  const followups = db.tasks.filter((x) => x.meeting === mt.id && !x.trashed);
  const offers = db.offers.filter((o) => o.meeting === mt.id && o.state !== 'accepted');
  const minutes = mt.minutes ? db.resources.find((r) => r.id === mt.minutes) : undefined;
  const people = [...new Set([mt.organizer, ...Object.keys(mt.responses)])];
  const clash = db.unavailable.some(
    (u) =>
      u.who === me.id &&
      unavailableOn(u, mt.date) &&
      overlaps(mt.start, mt.end, u.allDay ? 0 : u.start, u.allDay ? 1440 : u.end),
  );
  const showOutcomes = mt.state === 'held' || !!minutes || decisions.length > 0 || followups.length > 0;
  const link =
    'inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent px-0 py-2 text-d13 font-semibold text-green-ink';
  const actions = 'mt-[18px] flex flex-wrap gap-2';
  const cancel = () => {
    const r = cancelMeeting(mt.id, reason);
    if (typeof r === 'string') setReasonError(r);
  };
  return (
    <>
      <InspectorHead>{t('Meeting')}</InspectorHead>
      <h2 className="group/th mt-3 flex items-start gap-2.5 type-h2 [&>span]:min-w-0">
        {org ? (
          <button
            type="button"
            className={cn(
              '-mt-[3px] grid size-[34px] flex-none cursor-pointer place-items-center rounded-[10px] border-0 bg-fill text-mute hover:bg-hover [&_.ic]:size-5',
              !mt.icon &&
                'order-2 ml-auto inline-flex h-[26px] w-auto items-center gap-1 rounded-[7px] bg-transparent pr-2 pl-1.5 text-d12 font-medium opacity-0 transition-opacity duration-[120ms] group-hover/th:opacity-100 hover:bg-fill hover:text-ink focus-visible:opacity-100 touch:opacity-100 [&_.ic]:size-[15px]',
            )}
            aria-label={mt.icon ? t('Change icon') : t('Add an icon')}
            onClick={(e) => {
              openMenu(e.currentTarget, { type: 'ticon', kind: 'meeting', id: mt.id, width: 308, est: 430 });
            }}
          >
            {mt.icon ? (
              <TaskIcon icon={mt.icon} className="m-0 size-5" />
            ) : (
              <>
                <Icon name="smile" />
                <span>{t('Icon')}</span>
              </>
            )}
          </button>
        ) : (
          <TaskIcon icon={mt.icon} className="mt-[3px] size-6" />
        )}
        <span>{mt.title}</span>
      </h2>
      <Reactions kind="meeting" id={mt.id} reactions={mt.reactions} big />
      {st && (
        <div className="mt-2.5">
          <State label={t(st[0])} icon={st[1]} tone={st[2]} pill="pill-o" />
        </div>
      )}
      {mt.state === 'cancelled' && mt.reason && (
        <p className="text-mute type-small">
          {t('Reason')}: {mt.reason}
        </p>
      )}
      <div className="mt-3.5">
        <Meta>
          <MetaRow label={t('When')}>
            {dLong(mt.date)},{' '}
            <span className="type-num">
              {mins(mt.start)}–{mins(mt.end)}
            </span>
          </MetaRow>
          <MetaRow label={t('Time zone')}>{TZ_LABEL}</MetaRow>
          <MetaRow label={t('Where')}>
            <WhereText where={mt.where} />
          </MetaRow>
          <MetaRow label={t('Organizer')}>
            <Avatar id={mt.organizer} size="xs" />
            {who.name(mt.organizer)}
          </MetaRow>
          <MetaRow label={t('Note-taker')}>
            <Avatar id={mt.notetaker || mt.organizer} size="xs" />
            {who.name(mt.notetaker || mt.organizer)}
          </MetaRow>
          {project && (
            <MetaRow label={t('Project')}>
              <Link className="underline" to={`/projects/${project.id}`} onClick={closeInspector}>
                {project.name}
              </Link>
            </MetaRow>
          )}
          <MetaRow label={t('Created')}>{who.stamp(mt.organizer, mt.createdAt)}</MetaRow>
        </Meta>
      </div>
      {mt.agenda && (
        <>
          <SubHeading>{t('Agenda')}</SubHeading>
          <ol className="m-0 mt-1 list-decimal pl-5 text-d13h [&_li+li]:mt-[3px]">
            {mt.agenda
              .split('\n')
              .filter(Boolean)
              .map((a, i) => (
                <li key={i}>{a}</li>
              ))}
          </ol>
        </>
      )}
      {mine === 'pending' && (
        <Notice
          tone="info"
          icon="calendar"
          title={<b>{t('{who} invited you', { who: who.first(mt.organizer) })}</b>}
          className="mt-3.5"
        >
          <p>{clash ? t('This overlaps your unavailable time.') : t('Nothing is accepted until you reply.')}</p>
          <div className="mt-2.5 flex gap-1.5">
            <Button
              variant="primary"
              small
              onClick={() => {
                void rsvp(mt.id, 'accepted');
              }}
            >
              {t('Accept')}
            </Button>
            <Button
              small
              onClick={() => {
                void rsvp(mt.id, 'declined');
              }}
            >
              {t('Decline')}
            </Button>
          </div>
        </Notice>
      )}
      <PanelRule />
      <SubHeading className="mt-0" count={Object.keys(mt.responses).length}>
        {t('Guests')}
      </SubHeading>
      <div className="mt-1 grid gap-1.5">
        {Object.entries(mt.responses).map(([pid, r]) => {
          const rs = RESP[r] ?? RESP.pending;
          return (
            <div key={pid} className="flex items-center gap-2 text-d13">
              <Avatar id={pid} size="sm" />
              <a
                className="cursor-pointer no-underline"
                onClick={() => {
                  openPerson(pid);
                }}
              >
                {who.name(pid)}
              </a>
              {pid === mt.organizer && <small className="text-mute">{t('organizer')}</small>}
              <span className="ml-auto">{rs && <State label={t(rs[0])} icon={rs[1]} tone={rs[2]} />}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-mute type-small">
        {googleGuests
          ? t('Also in Google Calendar for {n} guests who connected it. Prototype: sync is simulated.', {
              n: googleGuests,
            })
          : t('No guest has connected Google Calendar.')}
      </p>
      {showOutcomes && (
        <>
          <PanelRule />
          <SectionHeading plain className="mt-0">
            {t('Outcomes')}
          </SectionHeading>
          <Meta>
            <MetaRow label={t('Minutes')}>
              {minutes ? (
                <>
                  <Icon name="note" size="xs" />
                  <a
                    className="cursor-pointer underline"
                    onClick={() => {
                      openResource(minutes.id);
                    }}
                  >
                    {minutes.name}
                  </a>
                </>
              ) : taker || org ? (
                <Button
                  small
                  onClick={() => {
                    void writeMinutes(mt.id);
                  }}
                >
                  <Icon name="note" />
                  {t('Write minutes')}
                </Button>
              ) : (
                <span className="text-mute">{t('Not written yet')}</span>
              )}
            </MetaRow>
          </Meta>
          <SubHeading count={decisions.length}>{t('Decisions')}</SubHeading>
          <div>
            {decisions.length ? (
              decisions.map((d) => <DecisionRow key={d.id} d={d} />)
            ) : (
              <EmptyLine>{t('None recorded')}</EmptyLine>
            )}
          </div>
          {form === 'decision' ? (
            <DecisionForm
              meetingId={mt.id}
              onDone={() => {
                setForm('');
              }}
            />
          ) : (
            (org || taker) && (
              <button
                type="button"
                className={link}
                onClick={() => {
                  setForm('decision');
                }}
              >
                <Icon name="plus" size="xs" /> {t('Record a decision')}
              </button>
            )
          )}
          <SubHeading count={followups.length + offers.length}>{t('Follow-ups')}</SubHeading>
          <div>
            {followups.map((x) => (
              <TaskRow key={x.id} task={x} owner noCtx />
            ))}
            {offers.map((o) => (
              <OfferRow key={o.id} o={o} />
            ))}
            {!followups.length && !offers.length && <EmptyLine>{t('None yet')}</EmptyLine>}
          </div>
          {form === 'followup' ? (
            <FollowupForm
              meetingId={mt.id}
              people={people}
              onDone={() => {
                setForm('');
              }}
            />
          ) : (
            (!!mine || org) && (
              <button
                type="button"
                className={link}
                onClick={() => {
                  setForm('followup');
                }}
              >
                <Icon name="plus" size="xs" /> {t('Add a follow-up')}
              </button>
            )
          )}
        </>
      )}
      {form === 'cancel' && (
        <div className={subform}>
          <Field
            label={t('Why is it canceled?')}
            htmlFor="mc-reason"
            required
            help={reasonError || t('Guests see this reason.')}
            error={!!reasonError}
          >
            <input
              id="mc-reason"
              className={inputClass}
              autoFocus
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError('');
              }}
            />
          </Field>
          <div className="flex gap-2">
            <Button variant="danger" small onClick={cancel}>
              {t('Cancel meeting')}
            </Button>
            <Button
              variant="ghost"
              small
              onClick={() => {
                setForm('');
              }}
            >
              {t('Keep it')}
            </Button>
          </div>
        </div>
      )}
      <div className={actions}>
        {org && mt.state === 'planned' && (
          <>
            <Button
              onClick={() => {
                openDraft(draftFromMeeting(mt), true);
              }}
            >
              <Icon name="edit" />
              {t('Edit')}
            </Button>
            {mt.date <= today() && (
              <Button
                onClick={() => {
                  void markHeld(mt.id);
                }}
              >
                <Icon name="check" />
                {t('Mark as held')}
              </Button>
            )}
            {form !== 'cancel' && (
              <Button
                variant="danger"
                onClick={() => {
                  setForm('cancel');
                }}
              >
                <Icon name="close" />
                {t('Cancel meeting')}
              </Button>
            )}
          </>
        )}
        {mine === 'accepted' && !org && mt.state === 'planned' && (
          <Button
            variant="ghost"
            onClick={() => {
              void rsvp(mt.id, 'declined');
            }}
          >
            {t('Decline')}
          </Button>
        )}
        {mine === 'declined' && mt.state === 'planned' && (
          <Button
            onClick={() => {
              void rsvp(mt.id, 'accepted');
            }}
          >
            {t('Accept after all')}
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            downloadIcs(mt);
          }}
        >
          <Icon name="download" />
          {t('Download .ics')}
        </Button>
      </div>
    </>
  );
}

PANELS.meeting = MeetingPanel;
