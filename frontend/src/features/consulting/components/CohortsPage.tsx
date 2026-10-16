/* Cohorts: TnD programs and their cohorts, one cohort with its sessions and participants, and the participant panel (attendance,
   assignment, outcome and what staffing sees). Invited, attended, submitted and completed are separate records; TnD outcomes
   are learning records, not HR grades. From divisions/div-ee-cons.js coPage, coDetail, INSP['tnd-*'] (consulting_tnd, W065,
   S060, S061). */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { divisionOf } from '@/app/config/org';
import type { InspectorRef, MenuRef } from '@/app/ui-state';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar, roleText } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { PersonLink } from '@/components/shared/PersonLink';
import { Chip, DivCrumb, Hint, td, th, tblClass, tblScroll } from '@/components/shared/division-ui';
import { MENUS, MenuItem, Tick, closeMenu, openMenu } from '@/components/shared/menus';
import { Button } from '@/components/ui/Button';
import { Field, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openMeeting, openPanel } from '@/lib/open';
import { isBoard } from '@/lib/roles';
import { useWho } from '@/lib/people';
import { dLong, dShort, fmtD, mins } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { CONS, activeIds, seeDiv } from '@/features/external/services/ee-data';
import { DeniedPanel, WhoOr, isUrl, useFieldErrors } from '@/features/external/components/ext-parts';
import { canSeeProject } from '@/features/projects/services/access';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { projOf } from '@/features/work/services/selectors';
import { consOf, type Cohort } from '../services/cons-data';
import { ATT, ENROLL, OUTC, SUB, artOf, type OutcomeState } from '../services/cons-rules';
import {
  attSt,
  coOf,
  meetingOf,
  missingFor,
  outSt,
  partOf,
  sessLabel,
  subSt,
  subs,
  tndLead,
} from '../services/cohort-rules';
import {
  addNeed,
  answerInvitation,
  inviteParticipant,
  recordOutcome,
  reviewWork,
  setAttendance,
  submitWork,
} from '../services/cohorts';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function CohortsCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const c = route.id ? coOf(db, route.id) : undefined;
  const parts: [string, string][] = [['cohorts', t('Cohorts')]];
  if (c) parts.push(['', projOf(db, c.project)?.name ?? c.id]);
  return <DivCrumb d={CONS} parts={parts} />;
}

function CohortList() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  useDivisionWorkspace(CONS);
  const who = useWho();
  const full = seeDiv(m, CONS);
  const all = consOf(db).cohorts;
  const mine = all.filter((c) => !!m && partOf(c, m.id));
  if (!m || (!full && !mine.length)) return <Unavailable />;
  const list = full ? all : mine;
  const progs = [...new Set(list.map((c) => c.program))]
    .map((id) => (db.programs ?? []).find((g) => g.id === id))
    .filter((g): g is NonNullable<typeof g> => !!g);
  const needs = full ? all.flatMap((c) => c.needs) : [];
  return (
    <Page wide>
      <PageHeader
        title={t('Cohorts')}
        sub={t('TnD programs and their cohorts. Invited, attended, submitted and completed are separate records.')}
      >
        {full && (
          <Button
            onClick={() => {
              openPanel('tnd-need');
            }}
          >
            <Icon name="plus" />
            {t('Add a learning need')}
          </Button>
        )}
      </PageHeader>
      {progs.map((g) => (
        <div
          key={g.id}
          className="mt-4 mb-1 flex max-w-[900px] items-center justify-between gap-3 rounded-ctl bg-surface-2 px-4 py-3.5 max-[600px]:flex-col max-[600px]:items-start"
        >
          <div>
            <b>{g.name}</b>
            <small className="mt-0.5 block text-d13 text-ink-2">{g.goal}</small>
            <small className="mt-0.5 block text-d13 text-mute">
              {t('Owner {who}', { who: who.first(g.owner) })}
              {g.start && g.end && `, ${fmtD(g.start)} – ${fmtD(g.end)}`}
            </small>
          </div>
          <Link
            className="inline-flex h-[var(--ctl-h-sm)] items-center gap-1.5 rounded-ctl bg-surface px-2.5 font-[550] text-ink no-underline shadow-[0_0_0_1px_var(--line-strong)]"
            to={`/programs/${g.id}`}
          >
            <Icon name="projects" />
            {t('Open program')}
          </Link>
        </div>
      ))}
      <SectionHeading as="h2" count={list.length}>
        {t('Cohorts')}
      </SectionHeading>
      <div className={tblScroll}>
        <table className={tblClass}>
          <thead>
            <tr>
              <th className={th}>{t('Cohort')}</th>
              <th className={th}>{t('Mentor')}</th>
              <th className={cn(th, 'text-right')}>{t('Sessions held')}</th>
              <th className={cn(th, 'text-right')}>{t('Enrolled')}</th>
              <th className={th}>{t('Next session')}</th>
              <th className={cn(th, 'text-right')}>{full ? t('Outcomes decided') : t('Your outcome')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const p = projOf(db, c.project);
              const held = c.sessions.filter((id) => meetingOf(db, id)?.state === 'held').length;
              const nx = c.sessions
                .map((id) => meetingOf(db, id))
                .filter((x): x is NonNullable<typeof x> => !!x && x.state === 'planned')
                .sort((a, b) => a.date.localeCompare(b.date))[0];
              const en = c.participants.filter((x) => x.enroll === 'accepted').length;
              const inv = c.participants.filter((x) => x.enroll === 'invited').length;
              const det = Object.values(c.outcomes).filter((o) => o.s !== 'open').length;
              const go = () => {
                void navigate(`/cohorts/${c.id}`);
              };
              return (
                <tr
                  key={c.id}
                  className="group/tr cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
                  tabIndex={0}
                  role="link"
                  onClick={go}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') go();
                  }}
                >
                  <td className={td}>
                    <b>{p ? p.name : c.id}</b>
                  </td>
                  <td className={td}>
                    <PersonLink id={c.mentor} avatarClass="size-[22px]" />
                  </td>
                  <td className={cn(td, 'text-right')}>{t('{a} of {b}', { a: held, b: c.sessions.length })}</td>
                  <td className={cn(td, 'text-right')}>
                    {en}
                    {inv > 0 && <small className="ml-1 text-mute">{t('+{n} invited', { n: inv })}</small>}
                  </td>
                  <td className={td}>
                    {nx ? (
                      <span className="type-num">
                        {dLong(nx.date)} {mins(nx.start)}
                      </span>
                    ) : (
                      <span className="text-mute">{t('None planned')}</span>
                    )}
                  </td>
                  <td className={cn(td, 'text-right')}>
                    {full ? (
                      t('{a} of {b}', { a: det, b: c.participants.length })
                    ) : (
                      <Chip def={OUTC[outSt(c, m.id)]} pill="pill-o" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {full && (
        <>
          <SectionHeading as="h2" count={needs.length}>
            {t('Learning needs')}
          </SectionHeading>
          <Rows>
            {needs.map((n) => (
              <Row key={n.id} className="cursor-default gap-2.5">
                <Avatar id={n.by} size="sm" />
                <RowText title={<b>{n.text}</b>} sub={`${n.from}. ${who.stamp(n.by, n.at)}`} />
                <span
                  className={cn(
                    'inline-flex h-6 items-center rounded-chip px-2 text-d12 font-semibold shadow-[inset_0_0_0_1px_var(--line-strong)]',
                    n.state === 'Open' ? 'text-warning' : 'text-mute',
                  )}
                >
                  {t(n.state)}
                </span>
              </Row>
            ))}
            {!needs.length && <EmptyLine>{t('No learning needs recorded.')}</EmptyLine>}
          </Rows>
        </>
      )}
      <Hint>
        {t(
          'TnD outcomes are learning records. They are not HR grades and never make anyone eligible for staffing on their own.',
        )}
      </Hint>
    </Page>
  );
}

function AttCell({
  c,
  mt,
  pid,
  run,
}: {
  c: Cohort;
  mt: NonNullable<ReturnType<typeof meetingOf>>;
  pid: string;
  run: boolean;
}) {
  const who = useWho();
  const st = attSt(c, mt.id, pid);
  if (partOf(c, pid)?.enroll !== 'accepted') return <span className="text-mute">{t('Not enrolled')}</span>;
  if (mt.state !== 'held') return <span className="text-mute">{t('Not held yet')}</span>;
  if (!run) return <Chip def={ATT[st]} pill="pill-o" />;
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-0.5 rounded-round border-0 bg-transparent p-0 text-mute"
      aria-haspopup="menu"
      aria-label={t('{s} for {who}: {a}. Change', { s: mt.title, who: who.name(pid), a: t(ATT[st][0]) })}
      onClick={(e) => {
        openMenu(e.currentTarget, { type: 'tnd-att', id: `${c.id}|${mt.id}|${pid}` });
      }}
    >
      <Chip def={ATT[st]} pill="pill-o" />
      <Icon name="chevron-down" size="xs" />
    </button>
  );
}

function CohortDetail({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const insp = useUi((u) => u.insp);
  useDivisionWorkspace(CONS);
  const c = coOf(db, id);
  if (!c || !m) return <Unavailable />;
  const full = seeDiv(m, CONS);
  const self = partOf(c, m.id);
  if (!full && !self) return <Unavailable />;
  const p = projOf(db, c.project);
  const g = (db.programs ?? []).find((z) => z.id === c.program);
  const run = tndLead(db, c, m);
  const ss = c.sessions.map((sid) => meetingOf(db, sid)).filter((x): x is NonNullable<typeof x> => !!x);
  const shown = full ? c.participants : self ? [self] : [];
  return (
    <Page wide>
      <PageHeader title={p ? p.name : c.id} sub={g ? <Link to={`/programs/${g.id}`}>{g.name}</Link> : ''}>
        {p && canSeeProject(db, m, p) && (
          <Link
            className="inline-flex h-[var(--ctl-h)] items-center gap-2 rounded-ctl bg-surface px-3.5 font-[550] text-ink no-underline shadow-[0_0_0_1px_var(--line-strong)] hover:bg-hover"
            to={`/projects/${p.id}`}
          >
            <Icon name="projects" />
            {t('Open project')}
          </Link>
        )}
        {run && (
          <Button
            variant="primary"
            onClick={() => {
              openPanel('tnd-inv', c.id);
            }}
          >
            <Icon name="plus" />
            {t('Invite participant')}
          </Button>
        )}
      </PageHeader>
      {self?.enroll === 'invited' && (
        <Notice
          icon="calendar"
          className="mt-3 mb-3"
          title={<b>{t('You are invited to this cohort')}</b>}
          actions={
            <>
              <Button
                small
                variant="ghost"
                onClick={() => {
                  void answerInvitation(c.id, 'declined');
                }}
              >
                {t('Decline')}
              </Button>
              <Button
                small
                variant="primary"
                onClick={() => {
                  void answerInvitation(c.id, 'accepted');
                }}
              >
                {t('Accept')}
              </Button>
            </>
          }
        >
          <p>{t('Accepting enrolls you. It does not mark any attendance.')}</p>
        </Notice>
      )}
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[600px]:grid-cols-[112px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('Mentor')}>
          <PersonLink id={c.mentor} avatarClass="size-[22px]" />
        </MetaRow>
        <MetaRow label={t('Lead')}>{p ? <WhoOr id={p.lead} label="Not named" /> : '-'}</MetaRow>
        <MetaRow label={t('Completion rule')}>{c.rule}</MetaRow>
        {p && <MetaRow label={t('Created by')}>{who.stamp(p.createdBy, p.createdAt)}</MetaRow>}
      </Meta>
      <SectionHeading as="h2" count={ss.length}>
        {t('Sessions')}
      </SectionHeading>
      <Rows>
        {ss.map((mt) => {
          const rec = c.participants.filter(
            (x) => x.enroll === 'accepted' && attSt(c, mt.id, x.p) !== 'unknown',
          ).length;
          const en = c.participants.filter((x) => x.enroll === 'accepted').length;
          return (
            <Row
              key={mt.id}
              className="gap-2.5"
              onOpen={() => {
                openMeeting(mt.id);
              }}
            >
              <Icon name="calendar" />
              <RowText
                title={<b>{mt.title}</b>}
                sub={`${dLong(mt.date)} ${mins(mt.start)}–${mins(mt.end)}, ${mt.where}`}
              />
              {mt.state === 'held' && <span className="type-small">{t('{a} of {b} recorded', { a: rec, b: en })}</span>}
              <Chip
                def={
                  mt.state === 'held'
                    ? ['Held', 'check', 'ink']
                    : mt.state === 'cancelled'
                      ? ['Canceled', 'close', 'mute']
                      : ['Planned', 'calendar', 'ink2']
                }
                pill="pill-o"
              />
            </Row>
          );
        })}
      </Rows>
      <SectionHeading as="h2" count={shown.length}>
        {full ? t('Participants') : t('Your record')}
      </SectionHeading>
      <div className={tblScroll}>
        <table className={tblClass}>
          <thead>
            <tr>
              <th className={th}>{t('Person')}</th>
              <th className={th}>{t('Enrollment')}</th>
              {ss.map((mt) => (
                <th key={mt.id} className={th}>
                  {sessLabel(mt)}
                </th>
              ))}
              <th className={th}>{t('Assignment')}</th>
              <th className={th}>{t('Outcome')}</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {shown.map((x) => {
              const pp = db.people.find((z) => z.id === x.p);
              return (
                <tr
                  key={x.p}
                  className={cn(insp?.type === 'tnd-p' && insp.id === `${c.id}|${x.p}` && 'bg-sel-neutral')}
                >
                  <td className={cn(td, '[&_small]:text-d12')}>
                    <PersonLink id={x.p} full />
                    <small className="text-mute">{pp?.div ? (divisionOf(pp.div)?.short ?? '') : ''}</small>
                  </td>
                  <td className={td}>
                    <Chip def={ENROLL[x.enroll]} pill="pill-o" />
                  </td>
                  {ss.map((mt) => (
                    <td key={mt.id} className={td}>
                      <AttCell c={c} mt={mt} pid={x.p} run={run} />
                    </td>
                  ))}
                  <td className={td}>
                    <Chip def={SUB[subSt(c, x.p)]} pill="pill-o" />
                  </td>
                  <td className={td}>
                    <Chip def={OUTC[outSt(c, x.p)]} pill="pill-o" />
                  </td>
                  <td className={td}>
                    <button
                      type="button"
                      className="inline-grid size-[30px] cursor-pointer place-items-center rounded-ctl border-0 bg-transparent text-mute hover:bg-hover hover:text-ink"
                      aria-label={t('Details for {who}', { who: pp?.name ?? '' })}
                      onClick={() => {
                        setUi((u) => {
                          u.tndOut = null;
                        });
                        openPanel('tnd-p', `${c.id}|${x.p}`);
                      }}
                    >
                      <Icon name="chevron-right" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Hint>
        {t(
          'Session attendance here is TnD’s own record, separate from HR’s weekly meeting attendance. Staffing sees only “Completed”, never evaluator notes.',
        )}
      </Hint>
    </Page>
  );
}

export function CohortsPage({ route }: { route: Route }) {
  const m = useMe();
  if (!m || isBoard(m)) return <Unavailable />;
  return route.id ? <CohortDetail id={route.id} /> : <CohortList />;
}

// ---------- the attendance menu ----------
function AttMenu({ menu }: { menu: MenuRef }) {
  const db = useWorkspace((w) => w);
  const [cid = '', mt = '', p = ''] = String(menu.id).split('|');
  const c = coOf(db, cid);
  if (!c) return null;
  const cur = attSt(c, mt, p);
  return (
    <>
      {(['present', 'excused', 'absent'] as const).map((s) => (
        <MenuItem
          key={s}
          role="menuitemradio"
          on={s === cur}
          extra={s === cur ? <Tick /> : undefined}
          onSelect={() => {
            closeMenu();
            void setAttendance(cid, mt, p, s);
          }}
        >
          <Chip def={ATT[s]} />
        </MenuItem>
      ))}
    </>
  );
}
MENUS['tnd-att'] = AttMenu;

// ---------- the participant panel ----------
const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);
const Acts = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 flex flex-wrap gap-2">{children}</div>
);
const closeForm = () => {
  setUi((u) => {
    u.form = null;
  });
};
const openForm = (f: string) => () => {
  setUi((u) => {
    u.form = f;
  });
};

function ParticipantPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const outPick = useUi((u) => (typeof u.tndOut === 'string' ? (u.tndOut as OutcomeState) : 'incomplete'));
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [outNote, setOutNote] = useState('');
  const fe = useFieldErrors();
  const [cid = '', pid = ''] = String(insp.id).split('|');
  const c = coOf(db, cid);
  const part = c && partOf(c, pid);
  if (!c || !part || !m) return <DeniedPanel head={t('Participant')} />;
  const run = tndLead(db, c, m);
  const self = pid === m.id;
  if (!run && !self && !seeDiv(m, CONS)) return <DeniedPanel head={t('Participant')} />;
  const pp = db.people.find((z) => z.id === pid);
  const sb = subs(c, pid);
  const l = sb[sb.length - 1];
  const as = c.assignments[0];
  const miss = missingFor(db, c, pid);
  const o = c.outcomes[pid];
  const canRev = run && !!l && !l.review && m.id !== pid;
  const use = as?.uses ? artOf(db, as.uses) : undefined;
  let acts: React.ReactNode;
  if (form === 'tnd-sub')
    acts = (
      <SubForm>
        <Field label={t('Link to your work')} htmlFor="tnd-su" required help={fe.help('url')} error={fe.bad('url')}>
          <input
            id="tnd-su"
            className={cn(inputClass, fe.bad('url') && invalidClass)}
            placeholder="https://"
            value={url}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setUrl(e.target.value);
              fe.clear();
            }}
          />
        </Field>
        <Acts>
          <Button
            variant="primary"
            onClick={() => {
              if (!url.trim() || !isUrl(url.trim())) return fe.fail('url', t('Paste the https link to your work.'));
              void submitWork(c.id, pid, url.trim());
            }}
          >
            {t('Submit version {v}', { v: sb.length + 1 })}
          </Button>
          <Button variant="ghost" onClick={closeForm}>
            {t('Cancel')}
          </Button>
        </Acts>
      </SubForm>
    );
  else if (form === 'tnd-rev')
    acts = (
      <SubForm>
        <Field
          label={t('Feedback')}
          htmlFor="tnd-rn"
          help={fe.help('note', t('Required when returning.'))}
          error={fe.bad('note')}
        >
          <textarea
            id="tnd-rn"
            className={cn(textareaClass, 'min-h-16', fe.bad('note') && invalidClass)}
            rows={3}
            value={note}
            autoFocus
            onChange={(e) => {
              setNote(e.target.value);
              fe.clear();
            }}
          />
        </Field>
        <Acts>
          <Button
            variant="primary"
            onClick={() => {
              void reviewWork(c.id, pid, 'approved', note.trim());
            }}
          >
            {t('Approve')}
          </Button>
          <Button
            onClick={() => {
              if (!note.trim()) return fe.fail('note', t('Write what to improve.'));
              void reviewWork(c.id, pid, 'returned', note.trim());
            }}
          >
            {t('Return')}
          </Button>
          <Button variant="ghost" onClick={closeForm}>
            {t('Cancel')}
          </Button>
        </Acts>
      </SubForm>
    );
  else if (form === 'tnd-out')
    acts = (
      <SubForm>
        <div className="inline-flex gap-0.5 rounded-[10px] bg-fill p-[3px]" role="radiogroup" aria-label={t('Outcome')}>
          {(['completed', 'incomplete', 'exempt', 'withdrawn'] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={outPick === k}
              disabled={k === 'completed' && miss.length > 0}
              className={cn(
                'h-7 rounded-[7px] border-0 bg-transparent px-3 text-d13 font-[550] text-mute disabled:cursor-not-allowed disabled:opacity-45 roomy:h-8',
                outPick === k && 'bg-surface text-ink shadow-sheet',
              )}
              onClick={() => {
                setUi((u) => {
                  u.tndOut = k;
                });
              }}
            >
              {t(OUTC[k][0])}
            </button>
          ))}
        </div>
        {miss.length > 0 && (
          <p className="my-2 text-mute type-small">{t('Completed needs: {m}', { m: miss.join('; ') })}</p>
        )}
        <Field
          label={t('Evidence and reason')}
          htmlFor="tnd-on"
          required
          help={fe.help('note', t('Private to TnD. Staffing sees only the outcome word.'))}
          error={fe.bad('note')}
        >
          <textarea
            id="tnd-on"
            className={cn(textareaClass, 'min-h-16', fe.bad('note') && invalidClass)}
            rows={2}
            value={outNote}
            autoFocus
            onChange={(e) => {
              setOutNote(e.target.value);
              fe.clear();
            }}
          />
        </Field>
        <Acts>
          <Button
            variant="primary"
            onClick={() => {
              if (!outNote.trim()) return fe.fail('note', t('Give the evidence and reason.'));
              void recordOutcome(c.id, pid, outPick, outNote.trim());
            }}
          >
            {t('Record outcome')}
          </Button>
          <Button variant="ghost" onClick={closeForm}>
            {t('Cancel')}
          </Button>
        </Acts>
      </SubForm>
    );
  else
    acts = (
      <Acts>
        {self && part.enroll === 'accepted' && subSt(c, pid) !== 'approved' && as && (
          <Button variant="primary" onClick={openForm('tnd-sub')}>
            <Icon name="upload" />
            {t('Submit work')}
          </Button>
        )}
        {canRev && (
          <Button variant="primary" onClick={openForm('tnd-rev')}>
            {t('Review version {v}', { v: l.v })}
          </Button>
        )}
        {run && part.enroll !== 'invited' && <Button onClick={openForm('tnd-out')}>{t('Record outcome')}</Button>}
      </Acts>
    );
  const done = outSt(c, pid) === 'completed';
  return (
    <>
      <InspectorHead>{t('Participant')}</InspectorHead>
      <h2 className="mt-3 mb-2.5 type-h2">{pp?.name}</h2>
      <p className="my-2 text-mute type-small">
        {pp ? roleText(pp) : ''}. {t('Their division does not change.')}
      </p>
      <p className="my-2 flex gap-2">
        <Chip def={ENROLL[part.enroll]} pill="pill" />
        <Chip def={OUTC[outSt(c, pid)]} pill="pill" />
      </p>
      {part.reason && <p className="my-3 rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13">{part.reason}</p>}
      {acts}
      <SectionHeading>{t('Attendance')}</SectionHeading>
      <dl className="my-2 grid grid-cols-[150px_1fr] gap-x-2.5 gap-y-3 text-d13 [&_dd]:m-0 [&_dt]:text-mute">
        {c.sessions.map((sid) => {
          const mt = meetingOf(db, sid);
          return mt ? (
            <div key={sid} className="contents">
              <dt>{sessLabel(mt)}</dt>
              <dd>
                {mt.state === 'held' ? (
                  <Chip def={ATT[attSt(c, sid, pid)]} />
                ) : (
                  <span className="text-mute">{t('Not held yet')}</span>
                )}
              </dd>
            </div>
          ) : null;
        })}
      </dl>
      {as && (
        <>
          <SectionHeading count={sb.length}>{as.title}</SectionHeading>
          <p className="my-2 text-mute type-small">
            {t('Due {d}', { d: fmtD(as.due) })}
            {use && `. ${t('Uses {t}, version {v}', { t: use.title, v: as.usesV ?? 0 })}`}
          </p>
          {sb.length ? (
            <div className="grid gap-[3px]">
              {[...sb].reverse().map((v, i) => (
                <div
                  key={v.v}
                  className={cn(
                    'grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-ctl px-2.5 py-1.5',
                    i === 0 && 'bg-sel-neutral',
                  )}
                >
                  <span className="text-d13 font-semibold">v{v.v}</span>
                  <div className="min-w-0">
                    <b className="text-d14 font-bold">{dShort(v.at.slice(0, 10))}</b>
                    {v.review ? (
                      <small className="block text-d13 text-mute">
                        <Chip def={SUB[v.review.choice as keyof typeof SUB]} /> {who.stamp(v.review.by, v.review.at)}
                        {v.review.note && (run || self) && `: ${v.review.note}`}
                      </small>
                    ) : (
                      <small className="block text-d13 text-mute">{t('Not reviewed yet')}</small>
                    )}
                  </div>
                  {v.url ? (
                    <a
                      className="inline-grid size-[30px] place-items-center rounded-ctl text-mute hover:bg-hover hover:text-ink"
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('Open version {v}', { v: v.v })}
                    >
                      <Icon name="external" />
                    </a>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-2.5 py-3 text-d13h text-mute">
              {t('Nothing submitted. This stays Not submitted, never zero.')}
            </div>
          )}
        </>
      )}
      {o && o.s !== 'open' && (
        <>
          <SectionHeading>{t('Outcome')}</SectionHeading>
          <dl className="my-2 grid grid-cols-[150px_1fr] gap-x-2.5 gap-y-3 text-d13 [&_dd]:m-0 [&_dt]:text-mute">
            <dt>{t('Outcome')}</dt>
            <dd>
              <Chip def={OUTC[o.s as OutcomeState]} />
            </dd>
            <dt>{t('Recorded by')}</dt>
            <dd>{who.stamp(o.by, o.at)}</dd>
            {(run || self) && (
              <>
                <dt>{t('Evidence')}</dt>
                <dd>{o.note}</dd>
              </>
            )}
          </dl>
        </>
      )}
      <SectionHeading>{t('What staffing sees')}</SectionHeading>
      <p className="my-2 type-small">
        {done ? (
          t('Completed {c}', { c: projOf(db, c.project)?.name ?? '' })
        ) : (
          <span className="text-mute">{t('Nothing yet. Only a completed outcome is shared.')}</span>
        )}
      </p>
    </>
  );
}
PANELS['tnd-p'] = (p) => <ParticipantPanel key={String(p.insp.id)} insp={p.insp} />;

// ---------- invite and learning need ----------
function InvitePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const c = coOf(db, insp.id);
  const [p, setP] = useState('');
  const fe = useFieldErrors();
  if (!c || !tndLead(db, c, m)) return <DeniedPanel head={t('Invite participant')} />;
  const ids = activeIds(db, (x) => !partOf(c, x.id) && x.id !== c.mentor);
  return (
    <>
      <InspectorHead>{t('Invite participant')}</InspectorHead>
      <p className="my-2 text-mute type-small">
        {t('Anyone in any division. Inviting does not enroll them; they accept or decline.')}
      </p>
      <Field label={t('Person')} htmlFor="tnd-iv" required help={fe.help('p')} error={fe.bad('p')}>
        <SelectField
          id="tnd-iv"
          people
          value={p}
          onChange={(v) => {
            setP(v);
            fe.clear();
          }}
          options={[
            { value: '', label: t('Choose a person') },
            ...ids.map((id) => ({ value: id, label: db.people.find((x) => x.id === id)?.name ?? id })),
          ]}
        />
      </Field>
      <div className="mt-1 flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            if (!p) return fe.fail('p', t('Choose a person.'));
            void inviteParticipant(c.id, p);
          }}
        >
          {t('Send invitation')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}
PANELS['tnd-inv'] = InvitePanel;

function NeedPanel() {
  const m = useMe();
  const [from, setFrom] = useState('');
  const [text, setText] = useState('');
  const fe = useFieldErrors();
  if (!seeDiv(m, CONS)) return <DeniedPanel head={t('Add a learning need')} />;
  return (
    <>
      <InspectorHead>{t('Add a learning need')}</InspectorHead>
      <Field label={t('From')} htmlFor="tnd-nf" required help={fe.help('from')} error={fe.bad('from')}>
        <input
          id="tnd-nf"
          className={cn(inputClass, fe.bad('from') && invalidClass)}
          placeholder={t('For example: HR referral, engagement feedback')}
          value={from}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setFrom(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Need')}
        htmlFor="tnd-nt"
        required
        help={fe.help('text', t('The evidence and the outcome wanted.'))}
        error={fe.bad('text')}
      >
        <textarea
          id="tnd-nt"
          className={cn(textareaClass, 'min-h-16', fe.bad('text') && invalidClass)}
          rows={3}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <div className="mt-1 flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            if (!from.trim()) return fe.fail('from', t('Say where the need comes from.'));
            if (!text.trim()) return fe.fail('text', t('Describe the need.'));
            void addNeed({ from: from.trim(), text: text.trim() });
          }}
        >
          {t('Add need')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}
PANELS['tnd-need'] = NeedPanel;
