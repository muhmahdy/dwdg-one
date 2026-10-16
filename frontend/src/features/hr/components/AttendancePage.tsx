/* Weekly attendance: the list of registers (and your own attendance), and one register with its roster, statuses, absence
   notes and the finalize step. From divisions/div-hr-sng.js attendancePage and registerPage. */
import { Link, useNavigate } from 'react-router';
import { divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { PersonLink } from '@/components/shared/PersonLink';
import { MENUS, MenuItem, closeMenu, openMenu } from '@/components/shared/menus';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { State } from '@/components/ui/StatusBadge';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { openMeeting } from '@/lib/open';
import { useWho } from '@/lib/people';
import { isBoard } from '@/lib/roles';
import { dLong, dShort, mins, span2 } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import {
  ATT_CHOICES,
  HR_ATT,
  NCAT,
  NOUT,
  attStatus,
  canReadReason,
  canRecord,
  canSeeReg,
  cycleFor,
  finalizeRegister,
  hrAtt,
  inReg,
  isHeld,
  lastEntry,
  noticeOf,
  regCorrections,
  regMeeting,
  regOf,
  regState,
  regWhen,
  registerTitle,
  setAttendance,
} from '../services/attendance';
import { hrOf, type HrRegister } from '../services/hr-data';
import { Chip, DivCrumb, Hint, Locked, SmallNote, td, th, tblClass, tblScroll, trLink } from './HrParts';
import type { Workspace } from '@/types/workspace';

export function AttendanceCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const g = route.id ? regOf(db, route.id) : undefined;
  if (route.id && g)
    return (
      <DivCrumb
        d="hr"
        parts={[
          ['attendance', t('Attendance')],
          ['', registerTitle(db, g)],
        ]}
      />
    );
  return <DivCrumb d="hr" parts={[['attendance', t('Attendance')]]} />;
}

const meetingLabel = (db: Workspace, g: HrRegister) => regMeeting(db, g)?.title ?? t('Removed meeting');

function MyRow({ g }: { g: HrRegister }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  if (!m) return null;
  const mt = regMeeting(db, g);
  const st = attStatus(g, m.id);
  const n = noticeOf(db, g, m.id);
  const canNote = !g.finalAt && g.expected.includes(m.id) && mt?.state !== 'cancelled';
  return (
    <Row
      className="gap-2.5 max-[760px]:flex-wrap"
      onOpen={() => {
        void navigate(`/attendance/${g.id}`);
      }}
    >
      <span className="w-[52px] flex-none text-ink-2 type-num">{mt ? dShort(mt.date) : ''}</span>
      <RowText
        className="max-[760px]:basis-3/5"
        title={<b>{meetingLabel(db, g)}</b>}
        sub={`${g.guests.includes(m.id) ? t('Guest') : g.notRequired.includes(m.id) ? t('Not required') : t('Expected')}${n ? `, ${t('absence note sent {d}', { d: dShort(n.at.slice(0, 10)) })}` : ''}`}
      />
      {n && <Chip def={NOUT[n.outcome]} pill="pill-o" />}
      <Chip def={hrAtt(st)} pill="pill-o" />
      {canNote && !n && (
        <Button
          small
          className="flex-none"
          onClick={(e) => {
            e.stopPropagation();
            openNote(g.id);
          }}
        >
          {t('Send absence note')}
        </Button>
      )}
    </Row>
  );
}

export const openNote = (id: string) => {
  setUi((u) => {
    u.menu = null;
    u.insp = { type: 'hr-note', id };
  });
};

function RegisterTable({ regs }: { regs: HrRegister[] }) {
  const db = useWorkspace((w) => w);
  const navigate = useNavigate();
  const h = hrOf(db);
  return (
    <div className={tblScroll}>
      <table className={tblClass}>
        <thead>
          <tr>
            <th className={th}>{t('Meeting')}</th>
            <th className={th}>{t('When')}</th>
            <th className={th}>{t('Unit')}</th>
            <th className={th}>{t('Officer')}</th>
            <th className={cn(th, 'text-right')}>{t('Recorded')}</th>
            <th className={th}>{t('Absence notes')}</th>
            <th className={th}>{t('State')}</th>
          </tr>
        </thead>
        <tbody>
          {regs.map((g) => {
            const mt = regMeeting(db, g);
            const rec = g.expected.filter((p) => attStatus(g, p) !== 'unknown').length;
            const pend = h?.notices.filter((n) => n.reg === g.id && n.outcome === 'pending').length ?? 0;
            return (
              <tr
                key={g.id}
                className={trLink}
                tabIndex={0}
                role="link"
                onClick={() => {
                  void navigate(`/attendance/${g.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void navigate(`/attendance/${g.id}`);
                }}
              >
                <td className={td}>
                  <b>{meetingLabel(db, g)}</b>
                </td>
                <td className={cn(td, 'type-num')}>{mt ? `${dLong(mt.date)} ${mins(mt.start)}` : ''}</td>
                <td className={td}>{divisionOf(g.unit)?.short}</td>
                <td className={td}>
                  <PersonLink id={g.officer} />
                </td>
                <td className={cn(td, 'text-right')}>
                  {t('{a} of {b}', { a: rec, b: g.expected.length })}
                  {g.guests.length > 0 && (
                    <small className="text-mute"> {plural(g.guests.length, '+{n} guest', '+{n} guests')}</small>
                  )}
                </td>
                <td className={td}>
                  {pend ? (
                    <State
                      label={plural(pend, '{n} notice to review', '{n} notices to review')}
                      icon="info"
                      tone="warn"
                    />
                  ) : (
                    <span className="text-mute">0</span>
                  )}
                </td>
                <td className={td}>
                  <Chip def={regState(db, g)} pill="pill-o" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AttendanceList() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  if (!m) return null;
  const h = hrOf(db);
  const all = h?.registers ?? [];
  const regs = all.filter((g) => canSeeReg(m, g)).sort((a, b) => regWhen(db, b).localeCompare(regWhen(db, a)));
  const mine = all.filter((g) => inReg(g, m.id)).sort((a, b) => regWhen(db, b).localeCompare(regWhen(db, a)));
  return (
    <Page wide>
      <PageHeader
        title={t('Weekly attendance')}
        sub={t('One register per actual meeting. Not yet recorded is never the same as absent.')}
      />
      {mine.length > 0 && (
        <>
          <SectionHeading as="h2" count={mine.length}>
            {t('Your attendance')}
          </SectionHeading>
          <Rows>
            {mine.map((g) => (
              <MyRow key={g.id} g={g} />
            ))}
          </Rows>
          <Hint>
            {t(
              'Your absence explanation is read only by you and the HR leads. Rosters, minutes and search never show it.',
            )}
          </Hint>
        </>
      )}
      {regs.length > 0 ? (
        <>
          <SectionHeading as="h2" count={regs.length}>
            {t('Registers')}
          </SectionHeading>
          <RegisterTable regs={regs} />
          <Hint>
            {t(
              'Registers link the meeting in Schedule by its ID. Members who were not invited are not expected and are never marked absent.',
            )}
          </Hint>
        </>
      ) : (
        !mine.length && (
          <Empty title={t('No attendance recorded for you yet')}>
            {t('When you are expected at a weekly meeting, your status and any absence note appear here.')}
          </Empty>
        )
      )}
    </Page>
  );
}

const attGrid =
  'grid grid-cols-[minmax(150px,1.2fr)_168px_minmax(150px,1fr)_140px_30px] items-center gap-2 min-h-12 rounded-ctl px-1.5 py-1 text-d13 max-[760px]:min-h-0 max-[760px]:grid-cols-[minmax(0,1fr)_auto_30px] max-[760px]:[grid-template-areas:"who_st_go"_"n_n_n"_"r_r_r"] max-[760px]:gap-y-1 max-[760px]:px-1.5 max-[760px]:py-2';

function RegisterRows({ g, ids }: { g: HrRegister; ids: string[] }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const insp = useUi((u) => u.insp);
  if (!m) return null;
  const rec = canRecord(m, g);
  const held = isHeld(db, g);
  return (
    <>
      {ids.map((p) => {
        const st = attStatus(g, p);
        const n = noticeOf(db, g, p);
        const e = lastEntry(g, p);
        const corr = !!g.finalAt && (g.entries[p] ?? []).some((x) => x.at > (g.finalAt ?? ''));
        const selected = insp?.type === 'hr-entry' && insp.id === `${g.id}|${p}`;
        const chip = <Chip def={hrAtt(st)} pill="pill-o" />;
        return (
          <div key={p} className={cn(attGrid, 'hover:bg-hover', selected && 'bg-sel-neutral hover:bg-sel-neutral')}>
            <span className="min-w-0 overflow-hidden max-[760px]:[grid-area:who]">
              <PersonLink id={p} full />
            </span>
            <span className="max-[760px]:[grid-area:st]">
              {rec && held && !g.notRequired.includes(p) ? (
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-0.5 rounded-round border-0 bg-transparent p-0 text-mute"
                  aria-haspopup="menu"
                  aria-label={t('Status of {who}: {s}. Change', { who: who.name(p), s: t(hrAtt(st)[0]) })}
                  onClick={(ev) => {
                    if (g.finalAt) openEntry(g.id, p);
                    else openMenu(ev.currentTarget, { type: 'hr-att', id: `${g.id}|${p}` });
                  }}
                >
                  {chip}
                  <Icon name="chevron-down" size="xs" />
                </button>
              ) : (
                chip
              )}
            </span>
            <span className={cn('max-[760px]:pl-[34px] max-[760px]:[grid-area:n]', !n && 'max-[760px]:hidden')}>
              {n ? (
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  <Chip def={NOUT[n.outcome]} pill="pill" />
                  {canReadReason(m, n) ? (
                    <small className="text-d12h text-mute">{t(NCAT[n.category] ?? n.category)}</small>
                  ) : (
                    <Locked>{t('Reason restricted')}</Locked>
                  )}
                </span>
              ) : (
                <span className="text-mute">{t('None')}</span>
              )}
            </span>
            <span className="whitespace-nowrap max-[760px]:pl-[34px] max-[760px]:text-[length:12px] max-[760px]:text-mute max-[760px]:[grid-area:r]">
              {e ? (
                <span>
                  {who.first(e.by)} <span className="text-mute type-num">{e.at.slice(11, 16)}</span>
                  {corr && (
                    <span className="ml-1 inline-flex h-6 items-center rounded-chip px-2 text-[length:12px] font-semibold text-mute shadow-[inset_0_0_0_1px_var(--line-strong)]">
                      {t('Corrected')}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-mute">-</span>
              )}
            </span>
            <button
              type="button"
              className="inline-grid size-[30px] cursor-pointer place-items-center rounded-ctl border-0 bg-transparent text-mute opacity-60 hover:opacity-100 max-[760px]:[grid-area:go]"
              aria-label={t('Details for {who}', { who: who.name(p) })}
              onClick={() => {
                openEntry(g.id, p);
              }}
            >
              <Icon name="chevron-right" />
            </button>
          </div>
        );
      })}
    </>
  );
}

export const openEntry = (gid: string, p: string) => {
  setUi((u) => {
    u.menu = null;
    u.hrCorr = null;
    u.insp = { type: 'hr-entry', id: `${gid}|${p}` };
  });
};

function RegisterPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const m = useMe();
  const g = regOf(db, id);
  if (!m || !g) return <NotAvailableHr />;
  const self = inReg(g, m.id);
  const full = canSeeReg(m, g);
  if (!full && !self) return <NotAvailableHr />;
  const mt = regMeeting(db, g);
  const rec = canRecord(m, g);
  const held = isHeld(db, g);
  const mine = (ids: string[]) => (full ? ids : ids.filter((p) => p === m.id));
  const unknown = g.expected.filter((p) => attStatus(g, p) === 'unknown');
  const notExpected = full
    ? db.people.filter((p) => p.status === 'active' && p.div === g.unit && !inReg(g, p.id)).map((p) => p.id)
    : [];
  const counts = [...ATT_CHOICES, 'notreq', 'unknown']
    .map((s) => [s, g.expected.filter((p) => attStatus(g, p) === s).length] as const)
    .filter((x) => x[1]);
  const cy = cycleFor(db, regWhen(db, g));
  const corrections = regCorrections(g);
  const finalize = rec && (
    <Button
      small
      variant="primary"
      onClick={() => {
        void finalizeRegister(g.id);
      }}
    >
      {t('Finalize register')}
    </Button>
  );
  const banner = g.finalAt ? (
    <Notice
      icon="check"
      tone="done"
      title={<b>{t('Finalized by {who}', { who: g.finalBy && g.finalAt ? who.stamp(g.finalBy, g.finalAt) : '' })}</b>}
    >
      <p>
        {corrections
          ? plural(
              corrections,
              '{n} correction since then. Each keeps the earlier status, who recorded it and when.',
              '{n} corrections since then. Each keeps the earlier status, who recorded it and when.',
            )
          : t('Changes now need a correction with a reason.')}
      </p>
    </Notice>
  ) : !held ? (
    <Notice icon="calendar" title={<b>{t('The meeting has not been held yet')}</b>}>
      <p>{t('Statuses can be recorded once it is held. Expected members can send an absence note now.')}</p>
    </Notice>
  ) : unknown.length ? (
    <Notice
      icon="warning"
      tone="warn"
      title={
        <b>
          {plural(
            unknown.length,
            '{n} expected member is not yet recorded',
            '{n} expected members are not yet recorded',
          )}
        </b>
      }
      actions={finalize || undefined}
    >
      <p>{t('They stay Not yet recorded. Nothing becomes an absence on its own.')}</p>
    </Notice>
  ) : (
    <Notice icon="check" title={<b>{t('Every expected member has a status')}</b>} actions={finalize || undefined}>
      <p>{t('Check the absence notes, then finalize.')}</p>
    </Notice>
  );
  const canNote =
    self && g.expected.includes(m.id) && !g.finalAt && !noticeOf(db, g, m.id) && !!mt && mt.state !== 'cancelled';
  const head = (
    <div className={cn(attGrid, 'min-h-7 text-mute type-caption max-[760px]:hidden')}>
      <span>{t('Member')}</span>
      <span>{t('Status')}</span>
      <span>{t('Absence note')}</span>
      <span>{t('Recorded by')}</span>
      <span />
    </div>
  );
  const expected = mine(g.expected);
  return (
    <Page wide>
      <PageHeader
        title={mt ? mt.title : t('Removed meeting')}
        sub={mt ? `${dLong(mt.date)} ${mins(mt.start)} – ${mins(mt.end)}${mt.where ? `, ${mt.where}` : ''}` : ''}
      >
        <Chip def={regState(db, g)} pill="pill" />
        {canNote && (
          <Button
            onClick={() => {
              openNote(g.id);
            }}
          >
            <Icon name="note" />
            {t('Send absence note')}
          </Button>
        )}
        {mt && (
          <Button
            onClick={() => {
              openMeeting(mt.id);
            }}
          >
            <Icon name="calendar" />
            {t('Open meeting')}
          </Button>
        )}
      </PageHeader>
      <Meta className="mt-4 mb-3 max-w-[720px] grid-cols-[140px_1fr] max-[760px]:grid-cols-[110px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('Organizer')}>{mt ? <PersonLink id={mt.organizer} /> : '-'}</MetaRow>
        <MetaRow label={t('Officer')}>
          <PersonLink id={g.officer} />
        </MetaRow>
        <MetaRow label={t('Unit')}>{divisionOf(g.unit)?.name}</MetaRow>
        <MetaRow label={t('Created by')}>
          {g.createdBy && g.createdAt ? who.stamp(g.createdBy, g.createdAt) : ''}
        </MetaRow>
        {cy && full && (
          <MetaRow label={t('Monitoring cycle')}>
            <Link to={`/monitoring/${cy.id}`}>{span2(cy.start, cy.end)}</Link>
          </MetaRow>
        )}
      </Meta>
      {full && banner}
      {full && counts.length > 0 && (
        <p className="mt-3.5 mb-0 flex flex-wrap gap-x-4 gap-y-2.5" aria-label={t('Summary')}>
          {counts.map(([s, n]) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <Chip def={hrAtt(s)} pill="pill" />
              <b className="type-num">{n}</b>
            </span>
          ))}
        </p>
      )}
      <SectionHeading as="h2" count={expected.length}>
        {t('Expected')}
      </SectionHeading>
      <div className="flex flex-col gap-[3px]" role="table">
        {head}
        <RegisterRows g={g} ids={expected} />
      </div>
      {mine(g.guests).length > 0 && (
        <>
          <SectionHeading as="h2" count={mine(g.guests).length}>
            {t('Guests')}
          </SectionHeading>
          <SmallNote>{t('Guests are listed apart and never count as expected members.')}</SmallNote>
          <div className="flex flex-col gap-[3px]">
            <RegisterRows g={g} ids={mine(g.guests)} />
          </div>
        </>
      )}
      {mine(g.notRequired).length > 0 && (
        <>
          <SectionHeading as="h2" count={mine(g.notRequired).length}>
            {t('Not required')}
          </SectionHeading>
          <div className="flex flex-col gap-[3px]">
            <RegisterRows g={g} ids={mine(g.notRequired)} />
          </div>
        </>
      )}
      {notExpected.length > 0 && (
        <>
          <SectionHeading as="h2" count={notExpected.length}>
            {t('Not expected')}
          </SectionHeading>
          <SmallNote>
            {t(
              '{unit} members who were not invited to this occurrence. They are not expected, so they are never marked absent.',
              {
                unit: divisionOf(g.unit)?.short ?? '',
              },
            )}
          </SmallNote>
          <div className="my-1.5 flex flex-wrap gap-1.5">
            {notExpected.map((p) => (
              <PersonLink key={p} id={p} />
            ))}
          </div>
        </>
      )}
      <Hint>{t('Shared minutes and the attendance summary never show absence reasons.')}</Hint>
    </Page>
  );
}

function NotAvailableHr() {
  return (
    <Page>
      <NotAvailable />
    </Page>
  );
}

export function AttendancePage({ route }: { route: Route }) {
  const m = useMe();
  useDivisionWorkspace('hr');
  if (!m) return null;
  if (isBoard(m)) return <NotAvailableHr />;
  return route.id ? <RegisterPage id={route.id} /> : <AttendanceList />;
}

/** The status menu of one person in a register. */
function AttMenu({ menu }: { menu: { id?: string | undefined } }) {
  const db = useWorkspace((w) => w);
  const [gid = '', p = ''] = String(menu.id).split('|');
  const g = regOf(db, gid);
  if (!g) return null;
  const cur = attStatus(g, p);
  return (
    <>
      {ATT_CHOICES.map((s) => (
        <MenuItem
          key={s}
          role="menuitemradio"
          on={s === cur}
          extra={s === cur ? <Icon name="check" size="sm" /> : undefined}
          onSelect={() => {
            closeMenu();
            if (g.finalAt) {
              setUi((u) => {
                u.hrCorr = s;
                u.insp = { type: 'hr-entry', id: `${gid}|${p}` };
              });
              return;
            }
            void setAttendance(gid, p, s);
          }}
        >
          <Chip def={HR_ATT[s] ?? hrAtt(s)} />
        </MenuItem>
      ))}
      <hr className="mx-0 my-[5px] h-px border-0 bg-line" />
      <MenuItem
        icon="info"
        onSelect={() => {
          closeMenu();
          openEntry(gid, p);
        }}
      >
        {t('History and notes')}
      </MenuItem>
    </>
  );
}
MENUS['hr-att'] = AttMenu;
