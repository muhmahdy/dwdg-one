/* Appointments (access_appointments, S006, entity_role): leadership roles are dated grants with an actor, a reason and the
   predecessor. A task assignment never promotes anyone. From screens/accounts.js appointmentsPage and INSP['acct-appt']. */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DIVS, divisionOf } from '@/app/config/org';
import type { InspectorRef } from '@/app/ui-state';
import { Avatar, roleLabel, roleText } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, invalidClass, textareaClass } from '@/components/ui/forms';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Chip } from '@/components/ui/StatusBadge';
import { NotAvailable, Page, PageHeader, Restricted, Row, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { baseRank } from '@/lib/roles';
import { dShort, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import type { DivisionId } from '@/types/workspace';
import { GRANT_ST, acctOf, fmtD, grantName, presidentOf, type Grant } from '../services/acct-data';
import { appoint } from '../services/office-actions';
import { OFFICE_KEYS, candidates, canAppoint, canApptView, holders, officeOf } from '../services/rules';
import { AcctCrumb, AcctTabs, ByAt, DeltaList } from './AccountsParts';

export const AppointmentsCrumb = () => (
  <AcctCrumb
    parts={[
      ['members', t('Members')],
      ['', t('Appointments')],
    ]}
  />
);

const openAppointment = (k: string) => {
  setUi((u) => {
    u.form = null;
    u.insp = { type: 'acct-appt', id: k };
  });
};

function OfficeRow({ k }: { k: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const o = officeOf(k);
  const hs = holders(db, k);
  const c = canAppoint(m, k);
  const a = acctOf(db);
  const since = (pid: string, role: string) =>
    a.grants.find((x) => x.person === pid && x.role === role && x.state === 'active');
  const dv = divisionOf(o.unit);
  return (
    <Row className="cursor-default gap-2.5 max-[600px]:flex-wrap">
      <div className="flex w-[210px] flex-none items-center gap-2 max-[600px]:w-full">
        <BrandIcon id={dv ? dv.icon : 'role-vp'} label={false} className="size-4 flex-none" />
        <b>{o.label}</b>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {hs.length ? (
          hs.map((p) => {
            const g = since(p.id, p.role);
            return (
              <span key={p.id} className="inline-flex min-w-0 items-center gap-1.5">
                <Avatar id={p.id} size="xs" />
                <span className="min-w-0 truncate">
                  {p.name}
                  {g?.from && <small className="block text-mute"> {t('since {d}', { d: dShort(g.from) })}</small>}
                </span>
              </span>
            );
          })
        ) : (
          <Chip def={['Vacant', 'circle', 'mute']} pill="pill-o" />
        )}
      </div>
      {c.ok ? (
        <Button
          small
          onClick={() => {
            openAppointment(k);
          }}
        >
          <Icon name="flag" />
          {t('Appoint')}
        </Button>
      ) : (
        <span title={c.why}>
          <Restricted>
            <span className="max-w-[260px] truncate max-[600px]:max-w-full max-[600px]:whitespace-normal">{c.why}</span>
          </Restricted>
        </span>
      )}
    </Row>
  );
}

export function AppointmentsPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const navigate = useNavigate();
  if (!m || !canApptView(m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const a = acctOf(db);
  const pres = presidentOf(db);
  const hist = a.grants.filter((g) => g.by).sort((x, y) => (y.at ?? '').localeCompare(x.at ?? ''));
  const dirs = OFFICE_KEYS.filter((k) => !k.startsWith('cd:'));
  const cds = OFFICE_KEYS.filter((k) => k.startsWith('cd:'));
  return (
    <Page wide>
      <PageHeader
        title={t('Appointments')}
        sub={t(
          'Leadership roles are dated grants with an actor, a reason and the predecessor. A task assignment never promotes anyone.',
        )}
      />
      <AcctTabs cur="appointments" />
      <SectionHeading as="h2">{t('President')}</SectionHeading>
      <Rows>
        <Row
          className="gap-2.5"
          onOpen={() => {
            void navigate('/handover');
          }}
        >
          <div className="flex w-[210px] flex-none items-center gap-2">
            <BrandIcon id="role-president" label={false} className="size-4" />
            <b>{t('President')}</b>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {pres ? (
              <span className="inline-flex items-center gap-1.5">
                <Avatar id={pres.id} size="xs" />
                {pres.name}
              </span>
            ) : (
              <Chip def={['Vacant', 'circle', 'mute']} pill="pill-o" />
            )}
          </div>
          <span className="text-mute type-small">{t('Changes only through a presidency handover')}</span>
          <Icon name="chevron-right" />
        </Row>
      </Rows>
      <SectionHeading as="h2">{t('Vice President and Directors')}</SectionHeading>
      <Rows>
        {dirs.map((k) => (
          <OfficeRow key={k} k={k} />
        ))}
      </Rows>
      <SectionHeading as="h2">{t('Co-Directors')}</SectionHeading>
      <Rows>
        {cds.map((k) => (
          <OfficeRow key={k} k={k} />
        ))}
      </Rows>
      <div className="mt-3.5">
        <Notice icon="info" title={<b>{t('The three-VP structure is a draft')}</b>}>
          <p>
            {t(
              'VP Internal, VP External and VP Consulting stay inactive until a term handover activates them. Today one VP covers all six divisions.',
            )}
          </p>
        </Notice>
      </div>
      <SectionHeading as="h2" count={hist.length}>
        {t('Appointment history')}
      </SectionHeading>
      <Rows>
        {hist.length ? (
          hist.map((g: Grant) => (
            <Row key={g.id} className="cursor-default gap-2.5">
              <Avatar id={g.person} size="sm" />
              <div className="min-w-0 flex-1">
                <b className="block font-semibold">
                  {who.name(g.person)}, {grantName(g)}
                </b>
                <small className="block text-d12h text-mute">
                  {t('From {d}', { d: fmtD(g.from) })}
                  {g.predecessor ? `, ${t('after {who}', { who: who.name(g.predecessor) })}` : ''}
                  {g.reason ? `, ${g.reason}` : ''}
                </small>
              </div>
              <span className="flex-none text-[length:12.5px] text-ink-2 max-[600px]:hidden">
                <ByAt id={g.by} at={g.at} />
              </span>
              <Chip def={GRANT_ST[g.state]} pill="pill-o" />
            </Row>
          ))
        ) : (
          <EmptyLine>
            {t('No appointments recorded in dwdg’ONE yet. Roles from before launch show as recorded at setup.')}
          </EmptyLine>
        )}
      </Rows>
    </Page>
  );
}

function AppointmentPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const k = String(insp.id);
  const [who, setWho] = useState('');
  const [date, setDate] = useState(today());
  const [why, setWhy] = useState('');
  const [after, setAfter] = useState('');
  const [err, setErr] = useState<{ field: 'who' | 'why' | 'after'; text: string } | null>(null);
  const c = canAppoint(m, k);
  if (!m || !c.ok)
    return (
      <>
        <InspectorHead>{t('Appointment')}</InspectorHead>
        <p className="text-mute">{c.ok ? '' : c.why}</p>
      </>
    );
  const o = officeOf(k);
  const cs = candidates(db, k, m);
  const pred = holders(db, k)[0];
  const tgt = db.people.find((p) => p.id === who);
  const dv = divisionOf(o.unit);
  const scope =
    o.role === 'vp'
      ? t(
          'Reporting divisions: all six in the current structure. Appoints Directors in them and can pause access below VP.',
        )
      : t(
          'Leads {d}: projects, programs, routines and the division queue. Can pause access for people below Director in {d}.',
          { d: dv?.short ?? '' },
        );
  const bad = (f: 'who' | 'why' | 'after') => err?.field === f;
  const submit = () => {
    if (!tgt) {
      setErr({ field: 'who', text: t('Choose who is appointed.') });
      return;
    }
    if (!why.trim()) {
      setErr({ field: 'why', text: t('Give the reason, for the record.') });
      return;
    }
    if (pred && !pred.div && !after) {
      setErr({ field: 'after', text: t('Choose a division for {who}.', { who: pred.first }) });
      return;
    }
    setErr(null);
    void appoint({ office: k, person: tgt.id, date, why: why.trim(), after: after as DivisionId | '' });
  };
  return (
    <>
      <InspectorHead>{t('Appointment')}</InspectorHead>
      <h2 className="mt-3 mb-1 type-h2">{o.label}</h2>
      <p className="text-mute type-small">{scope}</p>
      <Field
        label={t('Person')}
        htmlFor="acct-ap-who"
        help={
          bad('who')
            ? err?.text
            : o.unit
              ? t('People in {d}. Moving someone across divisions is a separate HR move.', { d: dv?.short ?? '' })
              : undefined
        }
        error={bad('who')}
      >
        <SelectField
          id="acct-ap-who"
          people
          value={who}
          onChange={(v) => {
            setWho(v);
            setErr(null);
          }}
          options={[
            { value: '', label: t('Choose a person') },
            ...cs.map((p) => ({ value: p.id, label: `${p.name}, ${roleText(p)}` })),
          ]}
        />
      </Field>
      <Field label={t('Effective date')} htmlFor="acct-ap-eff" help={t('A later date is recorded as scheduled.')}>
        <DateField id="acct-ap-eff" value={date} onChange={setDate} />
      </Field>
      <Field label={t('Reason')} htmlFor="acct-ap-why" help={bad('why') ? err?.text : undefined} error={bad('why')}>
        <textarea
          id="acct-ap-why"
          className={cn(textareaClass, bad('why') && invalidClass)}
          placeholder={t('For example: elected at the general meeting on 4 Oct')}
          value={why}
          onChange={(e) => {
            setWhy(e.target.value);
            setErr(null);
          }}
        />
      </Field>
      <SectionHeading>{t('What changes')}</SectionHeading>
      <DeltaList
        items={[
          tgt
            ? {
                kind: 'plus',
                icon: 'plus',
                text: `${t('{who} becomes {o}.', { who: tgt.name, o: o.label })}${baseRank(tgt) >= 2 ? ` ${t('Their {r} role ends.', { r: roleLabel(tgt) })}` : ''}`,
              }
            : { icon: 'circle', text: <span className="text-mute">{t('Choose a person to see the change.')}</span> },
          pred
            ? {
                kind: 'minus',
                icon: 'minus',
                text: `${t('{who}’s grant ends. The history keeps it.', { who: pred.name })} ${pred.div ? t('{who} stays in {d} as a Member.', { who: pred.first, d: divisionOf(pred.div)?.short ?? '' }) : ''}`,
              }
            : { icon: 'info', text: t('The office is vacant now.') },
          { icon: 'lock', text: t('Recorded with you as the actor, the date and the reason.') },
        ]}
      />
      {pred && !pred.div && (
        <Field
          label={t('{who}’s division afterwards', { who: pred.first })}
          htmlFor="acct-ap-after"
          help={bad('after') ? err?.text : t('Not decided by the plan yet. Recorded so the account keeps a workspace.')}
          error={bad('after')}
        >
          <SelectField
            id="acct-ap-after"
            value={after}
            onChange={setAfter}
            options={[
              { value: '', label: t('Choose a division') },
              ...DIVS.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
        </Field>
      )}
      <div className="mt-3 flex gap-2">
        <Button variant="primary" onClick={submit}>
          {tgt ? t('Appoint {who}', { who: tgt.first }) : t('Appoint')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

PANELS['acct-appt'] = (p) => <AppointmentPanel key={String(p.insp.id)} {...p} />;
