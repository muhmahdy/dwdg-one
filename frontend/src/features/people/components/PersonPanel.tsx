/* The person panel (D33: from a mention, an avatar or a name): who they are, how to reach them, their week as busy time, and
   the open work between you. Workload evidence without private notes (availability_person_inspector). From screens/work.js
   INSP.person. */
import { useState } from 'react';
import { divisionOf } from '@/app/config/org';
import { Avatar, IdentityLine, roleLabel } from '@/components/shared/Avatar';
import { InspectorHead, PANELS } from '@/components/shared/Inspector';
import { Button, IconButton } from '@/components/ui/Button';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { Field, inputClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { State } from '@/components/ui/StatusBadge';
import { t } from '@/lib/i18n';
import { openOffer } from '@/lib/open';
import { addDays, dLong, dShort, today, weekStart } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import type { InspectorRef } from '@/app/ui-state';
import { openComposer } from '@/features/schedule/services/composer-state';
import { TaskRow } from '@/features/work/components/TaskRow';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { personWork } from '../services/person-work';
import { setProfileField } from '../services/profile';
import { PersonWeek } from './PersonWeek';

const link =
  'inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent px-0 py-2 text-d13 font-semibold text-green-ink';
const nav =
  'inline-grid size-[26px] place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink';

function ProfileForm({ onDone }: { onDone: () => void }) {
  const me = useMe();
  const [linkedin, setLinkedin] = useState(me?.linkedin ?? '');
  const [phone, setPhone] = useState(me?.phone ?? '');
  if (!me) return null;
  return (
    <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5 shadow-[inset_0_0_0_1px_var(--line)]">
      <Field label="LinkedIn" htmlFor="pf-li" optional>
        <input
          id="pf-li"
          className={inputClass}
          placeholder="linkedin.com/in/…"
          value={linkedin}
          onChange={(e) => {
            setLinkedin(e.target.value);
          }}
          onBlur={() => {
            if (linkedin.trim() !== (me.linkedin ?? '')) void setProfileField('linkedin', linkedin);
          }}
        />
      </Field>
      <Field label={t('Phone')} htmlFor="pf-ph" optional>
        <input
          id="pf-ph"
          className={inputClass}
          placeholder="+62…"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
          }}
          onBlur={() => {
            if (phone.trim() !== (me.phone ?? '')) void setProfileField('phone', phone);
          }}
        />
      </Field>
      <label className="mt-1 mb-3.5 flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          className="mt-[3px] accent-ink"
          checked={!!me.hidePhone}
          onChange={(e) => {
            void setProfileField('hidePhone', e.target.checked);
          }}
        />
        <span className="grid gap-0.5">
          <b>{t('Hide my phone from others')}</b>
          <small className="text-d12h text-mute">{t('Only you see it.')}</small>
        </span>
      </label>
      <Button small onClick={onDone}>
        {t('Done')}
      </Button>
    </div>
  );
}

function PersonPanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const week = useUi((u) => (u.pweek as string | undefined) ?? weekStart(today()));
  const [editing, setEditing] = useState(false);
  const p = db.people.find((x) => x.id === insp.id);
  if (!p || !me) return <InspectorHead>{t('Person')}</InspectorHead>;
  const self = p.id === me.id;
  const { between, offers, other } = personWork(db, p, me);
  const home = divisionOf(p.div);
  const shiftWeek = (n: number) => {
    setUi((u) => {
      u.pweek = addDays((u.pweek as string | undefined) ?? weekStart(today()), n);
    });
  };
  const linkedin = p.linkedin ? p.linkedin.replace(/^https?:\/\/(www\.)?/, '') : '';
  const showPhone = p.phone && (!p.hidePhone || self);
  return (
    <>
      <InspectorHead>{t('Person')}</InspectorHead>
      <div className="mb-3 flex items-center gap-3.5">
        <Avatar id={p.id} size="xl" />
        <div>
          <h2 className="m-0 type-h2">{p.name}</h2>
          <p className="mx-0 mt-0.5 mb-0 flex items-center gap-1.5 text-d13 text-ink-2">
            <IdentityLine person={p} />
            <span>{roleLabel(p)}</span>
            {p.admin && (
              <span className="rounded-full bg-ink px-[7px] py-px font-sans text-d10h font-semibold text-on-ink">
                {t('Admin')}
              </span>
            )}
            {p.role === 'board' && (
              <span className="rounded-full bg-ink px-[7px] py-px font-sans text-d10h font-semibold text-on-ink">
                {t('Board')}
              </span>
            )}
          </p>
          <p className="mx-0 mt-0.5 mb-0 text-mute type-small">
            {home ? home.name : t('Presidency')}
            {p.title ? `, ${p.title}` : ''}
          </p>
        </div>
      </div>
      {self && editing && (
        <ProfileForm
          onDone={() => {
            setEditing(false);
          }}
        />
      )}
      <div className="mt-1">
        <Meta>
          <MetaRow label="LinkedIn">
            {linkedin ? (
              <a
                className="no-underline hover:underline"
                href={`https://${linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkedin}
              </a>
            ) : (
              <span className="text-mute">{t('Not shared')}</span>
            )}
          </MetaRow>
          <MetaRow label={t('Phone')}>
            {showPhone && p.phone ? (
              <>
                <a className="no-underline type-num hover:underline" href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}>
                  {p.phone}
                </a>
                {self && p.hidePhone && <span className="text-mute type-small">{t('hidden from others')}</span>}
              </>
            ) : (
              <span className="text-mute">{t('Not shared')}</span>
            )}
          </MetaRow>
          <MetaRow label={t('Joined')}>
            {p.joined ? dLong(p.joined) : <span className="text-mute">{t('Not recorded')}</span>}
          </MetaRow>
        </Meta>
      </div>
      {self && !editing && (
        <button
          type="button"
          className={link}
          onClick={() => {
            setEditing(true);
          }}
        >
          <Icon name="edit" size="xs" /> {t('Edit my LinkedIn and phone')}
        </button>
      )}
      {!self && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setUi((u) => void (u.insp = { type: 'new-offer', to: p.id, fromTask: null }));
            }}
          >
            <Icon name="people" />
            {t('Ask for a task')}
          </Button>
          <Button
            onClick={() => {
              setUi((u) => void (u.insp = null));
              openComposer('', { manual: [p.id] });
            }}
          >
            <Icon name="calendar" />
            {t('Find a time')}
          </Button>
        </div>
      )}
      <SectionHeading className="flex items-center gap-2">
        {self ? t('Your week') : t('{who}’s week', { who: p.first })}
        <span className="ml-auto inline-flex items-center gap-0.5 text-d11h font-normal text-ink-2 type-num">
          <IconButton
            className={nav}
            aria-label={t('Previous week')}
            onClick={() => {
              shiftWeek(-7);
            }}
          >
            <Icon name="left" size="sm" />
          </IconButton>
          {dShort(week)} – {dShort(addDays(week, 6))}
          <IconButton
            className={nav}
            aria-label={t('Next week')}
            onClick={() => {
              shiftWeek(7);
            }}
          >
            <Icon name="right" size="sm" />
          </IconButton>
        </span>
      </SectionHeading>
      <PersonWeek person={p} week={week} viewer={me} />
      <p className="mt-2 text-mute type-small">
        {self
          ? t(
              'Others see names only for what they share with you; the rest shows as Busy. Your private notes and Google titles stay yours.',
            )
          : p.gcal || p.hasSchedule
            ? t('Names appear only for what you share with {who}. Everything else shows as Busy or Unavailable.', {
                who: p.first,
              })
            : t('{who} has no schedule recorded, so this week is unknown, not free.', { who: p.first })}
      </p>
      {!self && (
        <>
          <SectionHeading count={between.length + offers.length}>{t('Between you two')}</SectionHeading>
          <div>
            {offers.map((o) => (
              <div
                key={o.id}
                className="flex min-h-[var(--row-h)] cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover"
                role="button"
                tabIndex={0}
                onClick={() => {
                  openOffer(o.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openOffer(o.id);
                }}
              >
                <Avatar id={o.from} size="xs" />
                <div className="min-w-0 flex-1">
                  {o.title}
                  <small className="block text-d12h text-mute">
                    {o.from === me.id ? t('You asked {who}', { who: p.first }) : t('{who} asked you', { who: p.first })}
                  </small>
                </div>
                <State label={t('Waiting for an answer')} icon="clock" tone="ink2" />
              </div>
            ))}
            {between.map((x) => (
              <TaskRow key={x.id} task={x} owner noCtx />
            ))}
            {!between.length && !offers.length && <EmptyLine>{t('Nothing open between you.')}</EmptyLine>}
          </div>
        </>
      )}
      <SectionHeading count={other.length}>
        {self ? t('Your open tasks') : t('Other open tasks you can see')}
      </SectionHeading>
      <div>
        {other.slice(0, 6).map((x) => (
          <TaskRow key={x.id} task={x} />
        ))}
        {!other.length && <EmptyLine>{t('None')}</EmptyLine>}
      </div>
      <p className="mt-2 text-mute type-small">{t('Task count alone never means busy or free.')}</p>
    </>
  );
}

PANELS.person = PersonPanel;
