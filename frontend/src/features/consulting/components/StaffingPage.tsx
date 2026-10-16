/* Staffing: requests for people from any division with their offers, and one request with the candidates a PL, PM or Co-Director
   may offer it to. Nobody is staffed until they accept, and their division never changes. Candidates show only declared
   availability and permitted TnD completion: never HR scores. From divisions/div-ee-cons.js staffPage and staffDetail
   (consulting_project_associates, access_member_scope, S010, S054). */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar, roleText } from '@/components/shared/Avatar';
import { Chip, DivCrumb, Hint, Tag, td, th, tblClass, tblScroll, trLink } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { SectionHeading, EmptyLine } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { State } from '@/components/ui/StatusBadge';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows, SearchField } from '@/components/ui/page';
import { Field, Grid2, inputClass, invalidClass } from '@/components/ui/forms';
import { DateField } from '@/components/ui/DateField';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openPanel } from '@/lib/open';
import { useWho } from '@/lib/people';
import { addDays, dShort, fmtD, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { CONS, activeIds, seeDiv } from '@/features/external/services/ee-data';
import { DeniedPanel, WhoOr, useFieldErrors } from '@/features/external/components/ext-parts';
import { canSeeProject } from '@/features/projects/services/access';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { answerOffer, withdrawOffer } from '@/features/work/services/task-actions';
import { projOf } from '@/features/work/services/selectors';
import { consOf } from '../services/cons-data';
import { OFFER_ST, canRunEng, canStaff, engProjects, offersOf, staffOf, staffSt } from '../services/cons-rules';
import { tndSummary } from '../services/cohort-rules';
import { createStaffRequest, fillStaffing, offerStaffing } from '../services/staffing';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function StaffingCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const s = route.id ? staffOf(db, route.id) : undefined;
  const parts: [string, string][] = [['staffing', t('Staffing')]];
  if (s) parts.push(['', s.role]);
  return <DivCrumb d={CONS} parts={parts} />;
}

function StaffList() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  useDivisionWorkspace(CONS);
  const full = seeDiv(m, CONS);
  const cs = consOf(db);
  const mine = cs.staff.filter((s) => offersOf(db, s).some((o) => o.to === m?.id));
  if (!full && !mine.length) return <Unavailable />;
  const list = full ? cs.staff : mine;
  const mayCreate = full && engProjects(db).some((p) => canRunEng(p, m));
  return (
    <Page wide>
      <PageHeader
        title={t('Staffing')}
        sub={
          full
            ? t('Ask members from any division. Nobody is staffed until they accept, and their division never changes.')
            : t('Staffing offers sent to you. You see your own offer only.')
        }
      >
        {mayCreate && (
          <Button
            variant="primary"
            onClick={() => {
              openPanel('cons-staff-new');
            }}
          >
            <Icon name="plus" />
            {t('New staffing request')}
          </Button>
        )}
      </PageHeader>
      {list.length ? (
        <div className={tblScroll}>
          <table className={tblClass}>
            <thead>
              <tr>
                <th className={th}>{t('Role')}</th>
                <th className={th}>{t('Period')}</th>
                <th className={th}>{t('Skills asked')}</th>
                <th className={th}>{full ? t('Offers') : t('Your offer')}</th>
                <th className={th}>{t('State')}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const p = projOf(db, s.project);
                const os = offersOf(db, s);
                const mineO = os.find((o) => o.to === m?.id);
                const go = () => {
                  void navigate(`/staffing/${s.id}`);
                };
                return (
                  <tr
                    key={s.id}
                    className={trLink}
                    tabIndex={0}
                    role="link"
                    onClick={go}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') go();
                    }}
                  >
                    <td className={cn(td, '[&_small]:text-d12')}>
                      <b>{s.role}</b>
                      <small className="text-mute">{p?.name}</small>
                    </td>
                    <td className={cn(td, 'type-num')}>
                      {dShort(s.from)} – {dShort(s.to)}
                    </td>
                    <td className={cn(td, 'max-w-[360px] min-w-[220px] text-d13 whitespace-normal text-ink-2')}>
                      {s.skills}
                    </td>
                    <td className={td}>
                      {full ? (
                        (() => {
                          const parts = (['accepted', 'pending', 'declined'] as const)
                            .map((k) => [k, os.filter((o) => o.state === k).length] as const)
                            .filter(([, n]) => n > 0);
                          return parts.length ? (
                            <span className="inline-flex flex-wrap gap-2">
                              {parts.map(([k, n]) => (
                                <State
                                  key={k}
                                  label={`${String(n)} ${t(OFFER_ST[k]?.[0] ?? k).toLowerCase()}`}
                                  icon={OFFER_ST[k]?.[1] ?? 'circle'}
                                  tone={OFFER_ST[k]?.[2] ?? 'mute'}
                                />
                              ))}
                            </span>
                          ) : (
                            <span className="text-mute">{t('No offers yet')}</span>
                          );
                        })()
                      ) : mineO ? (
                        <Chip def={OFFER_ST[mineO.state] ?? OFFER_ST.pending ?? ['', 'circle', 'mute']} pill="pill-o" />
                      ) : null}
                    </td>
                    <td className={td}>
                      <Chip def={staffSt(s)} pill="pill-o" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title={t('No staffing requests')}>
          {t('A PL, PM or Consulting Co-Director asks for people from an engagement.')}
        </Empty>
      )}
      <Hint>
        {t(
          'Staffing shows declared availability and permitted TnD completion only. HR monitoring scores and private notes are never shown here.',
        )}
      </Hint>
    </Page>
  );
}

function StaffDetail({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const [q, setQ] = useState('');
  useDivisionWorkspace(CONS);
  const s = staffOf(db, id);
  const p = s ? projOf(db, s.project) : undefined;
  if (!s || !p || !m) return <Unavailable />;
  const full = seeDiv(m, CONS);
  const os = offersOf(db, s).filter((o) => full || o.to === m.id);
  if (!full && !os.length) return <Unavailable />;
  const can = canStaff(db, s, m) && s.state === 'open';
  const offered = new Set(
    offersOf(db, s)
      .filter((o) => ['pending', 'accepted', 'changes'].includes(o.state))
      .map((o) => o.to),
  );
  const needle = q.toLowerCase();
  const cands = can
    ? activeIds(db, (pp) => pp.id !== m.id && !offered.has(pp.id) && pp.id !== p.lead)
        .map((pid) => db.people.find((x) => x.id === pid))
        .filter((pp): pp is NonNullable<typeof pp> => !!pp)
        .filter(
          (pp) =>
            !needle ||
            pp.name.toLowerCase().includes(needle) ||
            (divisionOf(pp.div ?? 'sng')?.short ?? '').toLowerCase().includes(needle),
        )
        .slice(0, 12)
    : [];
  const mine = os.find((o) => o.to === m.id);
  return (
    <Page wide>
      <PageHeader
        title={s.role}
        sub={canSeeProject(db, m, p) ? <Link to={`/projects/${p.id}`}>{p.name}</Link> : p.name}
      >
        <Chip def={staffSt(s)} pill="pill" />
        {can && (
          <Button
            onClick={() => {
              void fillStaffing(s.id);
            }}
          >
            {t('Mark filled')}
          </Button>
        )}
      </PageHeader>
      {mine?.state === 'pending' && (
        <Notice
          icon="person"
          className="mt-3 mb-3"
          title={<b>{t('Your division stays {d}', { d: divisionOf(m.div ?? 'sng')?.name ?? '' })}</b>}
        >
          <p>{t('Accepting adds one task in My Work and access to this engagement only. Declining has no penalty.')}</p>
        </Notice>
      )}
      {mine?.state === 'accepted' && (
        <Notice icon="check" tone="done" className="mt-3 mb-3" title={<b>{t('You accepted this role')}</b>}>
          <p>{t('It is one task in your My Work. Your division and role did not change.')}</p>
        </Notice>
      )}
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[600px]:grid-cols-[112px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('Period')}>{`${fmtD(s.from)} – ${fmtD(s.to)}`}</MetaRow>
        <MetaRow label={t('Skills asked')}>{s.skills}</MetaRow>
        <MetaRow label={t('Asked by')}>{who.stamp(s.by, s.at)}</MetaRow>
        {full && (
          <MetaRow label={t('Project Leader')}>
            <WhoOr id={p.lead} label="No PL" />
          </MetaRow>
        )}
      </Meta>
      <SectionHeading as="h2" count={os.length}>
        {full ? t('Offers') : t('Your offer')}
      </SectionHeading>
      <Rows>
        {os.map((o) => {
          const pp = db.people.find((x) => x.id === o.to);
          return (
            <Row key={o.id} className="cursor-default gap-2.5 max-[600px]:flex-wrap">
              <Avatar id={o.to} />
              <RowText
                title={<b>{pp?.name}</b>}
                sub={`${pp ? roleText(pp) : ''}. ${o.to === m.id || full ? (o.reply ? t('Reply: {r}', { r: o.reply }) : o.answeredAt ? t('Answered {d}', { d: dShort(o.answeredAt.slice(0, 10)) }) : t('Sent {d}', { d: dShort(o.at.slice(0, 10)) })) : ''}`}
              />
              <Chip def={OFFER_ST[o.state] ?? OFFER_ST.pending ?? ['', 'circle', 'mute']} pill="pill-o" />
              {o.to === m.id && o.state === 'pending' && (
                <span className="inline-flex flex-none gap-1.5">
                  <Button
                    small
                    variant="ghost"
                    onClick={() => {
                      void answerOffer(o.id, 'declined');
                    }}
                  >
                    {t('Decline')}
                  </Button>
                  <Button
                    small
                    variant="primary"
                    onClick={() => {
                      void answerOffer(o.id, 'accepted');
                    }}
                  >
                    {t('Accept')}
                  </Button>
                </span>
              )}
              {can && o.state === 'pending' && (
                <Button
                  small
                  variant="ghost"
                  onClick={() => {
                    void withdrawOffer(o.id);
                  }}
                >
                  {t('Withdraw')}
                </Button>
              )}
            </Row>
          );
        })}
        {!os.length && <EmptyLine>{t('No offers yet.')}</EmptyLine>}
      </Rows>
      {can && (
        <>
          <SectionHeading as="h2">{t('Find people in any division')}</SectionHeading>
          <SearchField
            label={t('Search by name or division')}
            className="my-3.5 mb-1.5 w-[min(420px,100%)]"
            placeholder={t('Search by name or division')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
            }}
          />
          <Rows>
            {cands.map((pp) => {
              const done = tndSummary(db, pp.id);
              return (
                <Row key={pp.id} className="cursor-default gap-2.5 max-[600px]:flex-wrap">
                  <Avatar id={pp.id} />
                  <RowText title={<b>{pp.name}</b>} sub={roleText(pp)} />
                  <span className="inline-flex max-w-[46%] flex-wrap justify-end gap-1 max-[600px]:max-w-full max-[600px]:justify-start">
                    {pp.hasSchedule || pp.gcal ? (
                      <Tag>{t('Availability declared')}</Tag>
                    ) : (
                      <Tag unknown>{t('Availability unknown')}</Tag>
                    )}
                    {done.length ? (
                      done.map((x) => (
                        <span
                          key={x}
                          className="inline-flex h-6 items-center rounded-chip bg-green-soft px-2 text-d12 font-semibold text-green-ink"
                        >
                          {x}
                        </span>
                      ))
                    ) : (
                      <Tag>{t('No TnD record')}</Tag>
                    )}
                  </span>
                  <Button
                    small
                    onClick={() => {
                      void offerStaffing(s.id, pp.id);
                    }}
                  >
                    {t('Offer')}
                  </Button>
                </Row>
              );
            })}
            {!cands.length && <EmptyLine>{t('No one else matches.')}</EmptyLine>}
          </Rows>
          <p className="my-2 text-mute type-small">
            {t(
              'Evidence shown: role, declared availability and permitted TnD completion. HR scores and private notes are never shown. Task counts never mean busy.',
            )}
          </p>
        </>
      )}
    </Page>
  );
}

export function StaffingPage({ route }: { route: Route }) {
  return route.id ? <StaffDetail id={route.id} /> : <StaffList />;
}

// ---------- the new request panel ----------
function StaffNewPanel() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const ps = engProjects(db).filter((p) => canRunEng(p, m) && !['completed', 'cancelled'].includes(p.stage));
  const [pid, setPid] = useState(ps[0]?.id ?? '');
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(addDays(today(), 14));
  const fe = useFieldErrors();
  if (!ps.length) return <DeniedPanel head={t('New staffing request')} />;
  return (
    <>
      <InspectorHead>{t('New staffing request')}</InspectorHead>
      <Field label={t('Engagement')} htmlFor="cs-sr-p" required>
        <SelectField
          id="cs-sr-p"
          value={pid}
          onChange={setPid}
          options={ps.map((p) => ({ value: p.id, label: p.name }))}
        />
      </Field>
      <Field
        label={t('Role')}
        htmlFor="cs-sr-r"
        required
        help={fe.help('role', t('For example: Co-facilitator, session 2.'))}
        error={fe.bad('role')}
      >
        <input
          id="cs-sr-r"
          className={cn(inputClass, fe.bad('role') && invalidClass)}
          value={role}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setRole(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Skills asked')}
        htmlFor="cs-sr-s"
        required
        help={fe.help('skills', t('Skills and evidence you can check, never a grade.'))}
        error={fe.bad('skills')}
      >
        <input
          id="cs-sr-s"
          className={cn(inputClass, fe.bad('skills') && invalidClass)}
          value={skills}
          autoComplete="off"
          onChange={(e) => {
            setSkills(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('From')} htmlFor="cs-sr-f" required>
          <DateField id="cs-sr-f" value={from} onChange={setFrom} />
        </Field>
        <Field label={t('To')} htmlFor="cs-sr-t" required help={fe.help('to')} error={fe.bad('to')}>
          <DateField
            id="cs-sr-t"
            value={to}
            onChange={(v) => {
              setTo(v);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <div className="mt-1 flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            if (!role.trim()) return fe.fail('role', t('Name the role.'));
            if (!skills.trim()) return fe.fail('skills', t('Say which skills you need.'));
            if (!from || !to || to < from) return fe.fail('to', t('The period must end after it starts.'));
            void createStaffRequest({ project: pid, role: role.trim(), skills: skills.trim(), from, to });
          }}
        >
          {t('Create request')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}
PANELS['cons-staff-new'] = StaffNewPanel;
