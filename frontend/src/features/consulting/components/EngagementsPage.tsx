/* Engagements: the Consulting portfolio (handoff inbox, counts that link to their sources, one row per engagement) and one
   engagement page with roles, scope, deliverables, client updates, risks, duties, staffing and the Knowledge it uses. Every
   number comes from the same task, blocker and review records the project shows; there is no second progress form.
   From divisions/div-ee-cons.js engPage and engDetail (consulting_portfolio, blueprint §10). */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar } from '@/components/shared/Avatar';
import { Chip, DivCrumb, Hint, Tag, td, th, tblClass, tblScroll, trLink } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { Field, invalidClass, textareaClass } from '@/components/ui/forms';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { Stage, State } from '@/components/ui/StatusBadge';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openPanel, openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { dShort, fmtD, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Ctx, DueCell, WhoOr, foreign } from '@/features/external/components/ext-parts';
import { OpportunitiesPage } from '@/features/external/components/OpportunitiesPage';
import { StageButton } from '@/features/external/components/RelationshipsPage';
import {
  CHANNEL,
  CONS,
  EE,
  HO,
  canSeeHo,
  director,
  eeOf,
  hoOf,
  oppOf,
  orgOf,
  seeDiv,
} from '@/features/external/services/ee-data';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { isDone, projOf, taskOf } from '@/features/work/services/selectors';
import { STAGE_ORDER } from '@/components/ui/StatusBadge';
import { consOf, newEng, type ScopeVersion } from '../services/cons-data';
import {
  DLV,
  LANE,
  LEVEL,
  SCOPE,
  canRunEng,
  canSeeArt,
  canSeeEng,
  checks,
  cohortOfProject,
  consCD,
  dlvOf,
  dlvState,
  engOf,
  engProjects,
  gaps,
  latest,
  nextMsOf,
  projBlk,
  projDlv,
  projOpenTasks,
  pubV,
  scopeNow,
  staffSt,
  type LaneId,
} from '../services/cons-rules';
import { decideScope } from '../services/engagements';
import { branchOf } from '@/features/external/services/ee-data';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function EngagementsCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const parts: [string, string][] = [['engagements', t('Engagements')]];
  const p = route.id && !route.id.startsWith('ho-') ? projOf(db, route.id) : undefined;
  if (p) parts.push(['', p.name]);
  return <DivCrumb d={CONS} parts={parts} />;
}

const Tile = ({ n, label, to }: { n: React.ReactNode; label: string; to: string }) => (
  <Link
    className="grid gap-0.5 rounded-ctl bg-surface-2 px-3.5 py-3 text-ink no-underline hover:bg-hover"
    to={`/${to}`}
  >
    <b className="text-[length:20px]! leading-[26px] font-semibold type-num">{n}</b>
    <span className="text-d12h text-mute">{label}</span>
  </Link>
);

function Portfolio() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  const who = useWho();
  useDivisionWorkspace(CONS);
  if (!seeDiv(m, CONS)) return <Unavailable />;
  const cs = consOf(db);
  const ps = engProjects(db).sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage));
  const hos = eeOf(db)
    .handoffs.filter((h) => h.toUnit === CONS && h.state !== 'draft' && canSeeHo(h, m))
    .sort((a, b) => (b.sentAt ?? '').localeCompare(a.sentAt ?? ''));
  const waiting = hos.filter((h) => h.state === 'requested');
  const toReview = cs.dlv.filter((d) => dlvState(db, d) === 'submitted');
  const staffOpen = cs.staff.filter((s) => s.state === 'open');
  const knRev = cs.kn.filter((a) => a.versions.some((v) => v.state === 'review'));
  const nextS = db.meetings
    .filter((x) => x.project && cohortOfProject(db, x.project) && x.state === 'planned' && x.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const first = toReview[0];
  return (
    <Page wide>
      <PageHeader
        title={t('Engagements')}
        sub={t(
          'Every Consulting engagement from its own records: roles, scope, deliverables, blockers and client follow-ups. No second progress form.',
        )}
      />
      <div className="mt-[18px] mb-1 grid grid-cols-5 gap-2 max-[1023px]:grid-cols-3 max-[600px]:grid-cols-2">
        <Tile n={waiting.length} label={t('Handoffs waiting')} to="engagements" />
        <Tile
          n={toReview.length}
          label={t('Deliverables waiting for review')}
          to={first ? `engagements/${first.project}/${first.id}` : 'engagements'}
        />
        <Tile n={staffOpen.length} label={t('Open staffing requests')} to="staffing" />
        <Tile n={knRev.length} label={t('Knowledge reviews waiting')} to="knowledge" />
        <Tile
          n={nextS ? dShort(nextS.date) : '–'}
          label={nextS ? t('Next TnD session') : t('No TnD session planned')}
          to="cohorts"
        />
      </div>
      <SectionHeading as="h2" count={hos.length}>
        {t('Handoffs to Consulting')}
      </SectionHeading>
      <Rows>
        {hos.map((h) => {
          const o = oppOf(db, h.opp);
          return (
            <Row
              key={h.id}
              className="gap-2.5"
              onOpen={() => {
                openPanel('ec-ho', h.id);
              }}
            >
              <Avatar id={h.from} size="sm" />
              <RowText
                title={<b>{h.title}</b>}
                sub={`${t('From {who}, EE', { who: who.first(h.from) })}, ${t('to {who}', { who: who.first(h.to) })}${h.neededBy ? `, ${t('needed by {d}', { d: dShort(h.neededBy) })}` : ''}${o ? `, ${t('proposal v{v}', { v: h.briefV })}` : ''}`}
              />
              <Chip def={HO[h.state]} pill="pill-o" />
            </Row>
          );
        })}
        {!hos.length && <EmptyLine>{t('No handoffs sent to Consulting yet.')}</EmptyLine>}
      </Rows>
      <SectionHeading as="h2" count={ps.length}>
        {t('Portfolio')}
      </SectionHeading>
      {ps.length ? (
        <div className={tblScroll}>
          <table className={tblClass}>
            <thead>
              <tr>
                <th className={th}>{t('Engagement')}</th>
                <th className={th}>{t('Stage')}</th>
                <th className={th}>{t('PL')}</th>
                <th className={th}>{t('PM')}</th>
                <th className={th}>{t('Reviewer')}</th>
                <th className={th}>{t('Delivery lane')}</th>
                <th className={th}>{t('Next milestone')}</th>
                <th className={cn(th, 'text-right')}>{t('Overdue')}</th>
                <th className={cn(th, 'text-right')}>{t('Blockers')}</th>
                <th className={cn(th, 'text-right')}>{t('Decisions')}</th>
                <th className={th}>{t('Readiness')}</th>
                <th className={th}>{t('Client follow-up')}</th>
              </tr>
            </thead>
            <tbody>
              {ps.map((p) => {
                const e = engOf(db, p.id) ?? newEng('');
                const g = gaps(p, e);
                const ds = projDlv(db, p.id);
                const ok = ds.filter((d) => ['approved', 'delivered', 'accepted'].includes(dlvState(db, d))).length;
                const ms = nextMsOf(db, p.id);
                const late = projOpenTasks(db, p.id).filter((x) => x.due && x.due < today()).length;
                const blk = projBlk(db, p.id).length;
                const dec = e.scope.filter((s) => s.state === 'proposed').length;
                const cu = e.updates
                  .map((u) => (u.next ? taskOf(db, u.next) : undefined))
                  .filter((x): x is NonNullable<typeof x> => !!x && !isDone(x))
                  .sort((a, b) => (a.due ?? '9').localeCompare(b.due ?? '9'))[0];
                const org = e.client ? orgOf(db, e.client) : undefined;
                const go = () => {
                  void navigate(`/engagements/${p.id}`);
                };
                return (
                  <tr
                    key={p.id}
                    className={trLink}
                    tabIndex={0}
                    role="link"
                    onClick={go}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter') go();
                    }}
                  >
                    <td className={cn(td, '[&_small]:text-d12')}>
                      <b>{p.name}</b>
                      <small className="text-mute">{org ? org.name : t('Internal')}</small>
                    </td>
                    <td className={td}>
                      <Stage stage={p.stage} />
                      {g.length > 0 && (
                        <>
                          {' '}
                          <State label={t('Setup needed')} icon="settings" tone="warn" />
                        </>
                      )}
                    </td>
                    <td className={td}>
                      <WhoOr id={p.lead} label="No PL" />
                    </td>
                    <td className={td}>
                      <WhoOr id={p.pm} label="No PM" />
                    </td>
                    <td className={td}>
                      <WhoOr id={e.reviewer} label="No reviewer" />
                    </td>
                    <td className={td}>
                      {e.lane && e.lane in LANE ? (
                        t(LANE[e.lane as LaneId])
                      ) : (
                        <span className="text-mute">{t('Not set')}</span>
                      )}
                    </td>
                    <td className={td}>
                      {ms ? (
                        <span className="inline-flex max-w-[280px] items-center gap-2">
                          <span className="min-w-0 truncate">{ms.title}</span>
                          <span className="type-num">{dShort(ms.target)}</span>
                        </span>
                      ) : (
                        <span className="text-mute">{t('None')}</span>
                      )}
                    </td>
                    <td className={cn(td, 'text-right')}>
                      {late ? <State label={String(late)} icon="clock" tone="warn" /> : '0'}
                    </td>
                    <td className={cn(td, 'text-right')}>
                      {blk ? <State label={String(blk)} icon="warning" tone="danger" /> : '0'}
                    </td>
                    <td className={cn(td, 'text-right')}>{dec}</td>
                    <td className={td}>
                      {ds.length ? (
                        t('{a} of {b} approved', { a: ok, b: ds.length })
                      ) : (
                        <span className="text-mute">{t('No deliverables')}</span>
                      )}
                    </td>
                    <td className={td}>
                      {cu ? (
                        <span className="inline-flex max-w-[280px] items-center gap-2">
                          <span className="min-w-0 truncate">{cu.title}</span>
                          <DueCell task={cu} />
                        </span>
                      ) : (
                        <span className="text-mute">{t('None')}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title={t('No engagements yet')}>
          {t('Accept a handoff from EE or create a project in Consulting.')}
        </Empty>
      )}
      <Hint>
        {t(
          'Counts come from the same task, blocker and review records the project shows. Task completion alone never completes an engagement.',
        )}
      </Hint>
    </Page>
  );
}

// ---------- one engagement ----------
const Quiet = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 grid max-w-[900px] gap-2 rounded-ctl bg-surface-2 px-4 py-3.5">{children}</div>
);

function ScopeBox({ s, goal }: { s: ScopeVersion | null; goal: string }) {
  const who = useWho();
  if (!s)
    return (
      <Notice icon="warning" tone="warn" className="mt-3 mb-3" title={<b>{t('No approved scope yet')}</b>}>
        <p>{t('Deliverables can’t be ready until a scope version is approved.')}</p>
      </Notice>
    );
  return (
    <Quiet>
      <div>
        <b>{t('Scope version {v}', { v: s.v })}</b>
        <span className="ml-1 inline-block">
          <Chip def={SCOPE.approved} pill="pill-o" />
        </span>
      </div>
      <p className="m-0">{s.goal ?? goal}</p>
      <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
        <div>
          <small className="text-d12 text-mute">{t('In scope')}</small>
          <ul className="mt-1 mb-0 list-disc pl-[18px]">
            {(s.in ?? []).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <small className="text-d12 text-mute">{t('Out of scope')}</small>
          <ul className="mt-1 mb-0 list-disc pl-[18px]">
            {(s.out ?? []).map((x) => (
              <li key={x}>{x}</li>
            ))}
            {!(s.out ?? []).length && <li className="text-mute">{t('None listed')}</li>}
          </ul>
        </div>
      </div>
      {s.criteria && (
        <p className="m-0">
          <small className="text-mute">{t('Acceptance criteria')}</small>
          <br />
          {s.criteria}
        </p>
      )}
      <small className="text-mute">
        {t('Proposed by {who}', { who: who.stamp(s.by, s.at) })}
        {s.decidedBy && s.decidedAt && `. ${t('Approved by {who}', { who: who.stamp(s.decidedBy, s.decidedAt) })}`}
      </small>
    </Quiet>
  );
}

function PendingScope({ s, pid }: { s: ScopeVersion; pid: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const [why, setWhy] = useState('');
  const [err, setErr] = useState(false);
  const canDecide = !!m && s.by !== m.id && (director(m, CONS) || branchOf(m) === 'pa');
  const rows: [string, React.ReactNode][] = [];
  if (s.reason) rows.push([t('Reason'), s.reason]);
  if (s.impact) rows.push([t('Impact'), s.impact]);
  if (s.affects.length) rows.push([t('Affects'), s.affects.map((id) => dlvOf(db, id)?.title ?? '').join(', ')]);
  rows.push([t('Proposed by'), who.stamp(s.by, s.at)]);
  const open = form === `scope-${String(s.v)}`;
  return (
    <Quiet>
      <div>
        <b>{s.change ? t('Change to version {v}', { v: s.v }) : t('Scope version {v}', { v: s.v })}</b>
        <span className="ml-1 inline-block">
          <Chip def={SCOPE[s.state]} pill="pill-o" />
        </span>
      </div>
      <p className="m-0">{s.change ?? s.goal}</p>
      <dl className="m-0 grid grid-cols-[120px_1fr] gap-x-2.5 gap-y-3 text-d13 [&_dd]:m-0 [&_dt]:text-mute">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {canDecide ? (
        open ? (
          <div className="pt-2.5">
            <Field
              label={t('Rationale')}
              htmlFor="cs-sc-why"
              required
              help={err ? t('Give the rationale.') : undefined}
              error={err}
            >
              <textarea
                id="cs-sc-why"
                className={cn(textareaClass, 'min-h-16', err && invalidClass)}
                rows={2}
                value={why}
                autoFocus
                onChange={(e) => {
                  setWhy(e.target.value);
                  setErr(false);
                }}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {(['approved', 'rejected'] as const).map((c) => (
                <Button
                  key={c}
                  variant={c === 'approved' ? 'primary' : 'default'}
                  onClick={() => {
                    if (!why.trim()) {
                      setErr(true);
                      return;
                    }
                    void decideScope(pid, s.v, c, why.trim());
                  }}
                >
                  {c === 'approved' ? t('Approve') : t('Reject')}
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={() => {
                  setUi((u) => {
                    u.form = null;
                  });
                }}
              >
                {t('Cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button
              small
              variant="primary"
              onClick={() => {
                setUi((u) => {
                  u.form = `scope-${String(s.v)}`;
                });
              }}
            >
              {t('Decide')}
            </Button>
          </div>
        )
      ) : (
        <p className="m-0 text-mute type-small">
          {s.by === m?.id
            ? t('Someone else decides your own change.')
            : t('Waiting for the Consulting Director or the Project Associates Co-Director.')}
        </p>
      )}
    </Quiet>
  );
}

function EngagementPage({ pid, sub }: { pid: string; sub?: string | undefined }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const navigate = useNavigate();
  const insp = useUi((u) => u.insp);
  const p = projOf(db, pid);
  const allowed = !!p && p.div === CONS && canSeeEng(db, p, m);
  useEffect(() => {
    if (allowed && sub && dlvOf(db, sub)) {
      setUi((u) => {
        u.insp ??= { type: 'cons-dlv', id: sub };
      });
    }
    // Opens the deliverable once when the page is reached by its own link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, sub, allowed]);
  useDivisionWorkspace(seeDiv(m, CONS) ? CONS : EE);
  if (!p || !allowed) return <Unavailable />;
  const e = engOf(db, pid) ?? newEng(p.createdBy);
  const cs = consOf(db);
  const g = gaps(p, e);
  const run = canRunEng(p, m);
  const org = e.client ? orgOf(db, e.client) : undefined;
  const o = e.opp ? oppOf(db, e.opp) : undefined;
  const h = hoOf(db, e.handoff);
  const sn = scopeNow(e);
  const pend = e.scope.filter((s) => s.state === 'proposed');
  const ds = projDlv(db, pid);
  const blks = projBlk(db, pid);
  const uses = cs.kn.filter((a) => a.uses.some((u) => u.type === 'project' && u.id === pid));
  const staffs = cs.staff.filter((s) => s.project === pid);
  const seeEE = seeDiv(m, EE);
  const addBtn = (label: string, f: () => void) => (
    <Button small variant="ghost" onClick={f}>
      <Icon name="plus" />
      {label}
    </Button>
  );
  return (
    <Page wide>
      <PageHeader
        title={p.name}
        sub={
          org ? seeEE ? <Link to={`/relationships/${org.id}`}>{org.name}</Link> : org.name : t('Internal engagement')
        }
      >
        <Stage stage={p.stage} small={false} />
        {g.length > 0 && <State label={t('Setup needed')} icon="settings" tone="warn" pill="pill" />}
        <Link
          className="inline-flex h-[var(--ctl-h)] items-center gap-2 rounded-ctl bg-surface px-3.5 font-[550] text-ink no-underline shadow-[0_0_0_1px_var(--line-strong)] hover:bg-hover"
          to={`/projects/${p.id}`}
        >
          <Icon name="projects" />
          {t('Open project')}
        </Link>
        {run && (
          <>
            <Button
              onClick={() => {
                setUi((u) => {
                  u.csExp = 'internal';
                });
                openPanel('cons-export', pid);
              }}
            >
              <Icon name="download" />
              {t('Export')}
            </Button>
            <Button
              onClick={() => {
                openPanel('cons-close', pid);
              }}
            >
              {t('Close engagement')}
            </Button>
          </>
        )}
      </PageHeader>
      {e.closure ? (
        <Notice
          icon="check"
          tone="done"
          title={<b>{t('Closed by {who}', { who: who.stamp(e.closure.by, e.closure.at) })}</b>}
        >
          <p>{e.closure.outcome}</p>
        </Notice>
      ) : (
        g.length > 0 && (
          <Notice
            icon="settings"
            tone="warn"
            className="mt-3 mb-3"
            title={<b>{t('Setup needed: {g}', { g: g.map((x) => t(x)).join(', ') })}</b>}
            actions={
              run && consCD(m) && !e.start ? (
                <Button
                  small
                  variant="primary"
                  onClick={() => {
                    openPanel('cons-start', pid);
                  }}
                >
                  {t('Record start decision')}
                </Button>
              ) : undefined
            }
          >
            <p>
              {t(
                'Creating the project was not a client authorization. The engagement stays in setup until these are recorded.',
              )}
            </p>
          </Notice>
        )
      )}
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[600px]:grid-cols-[112px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('Origin')}>
          {o ? (
            <>
              {seeEE ? <Link to={`/opportunities/${o.id}`}>{o.title}</Link> : o.title}
              {h && (
                <button
                  type="button"
                  className="ml-2.5 cursor-pointer border-0 bg-transparent p-0"
                  onClick={() => {
                    openPanel('ec-ho', h.id);
                  }}
                >
                  <Chip def={HO[h.state]} pill="pill-o" />
                </button>
              )}
            </>
          ) : (
            <span className="text-mute">{t('No handoff')}</span>
          )}
        </MetaRow>
        <MetaRow label={t('Project Leader')}>
          <WhoOr id={p.lead} label="No PL" />
        </MetaRow>
        <MetaRow label={t('Project Manager')}>
          <WhoOr id={p.pm} label="No PM" />
        </MetaRow>
        <MetaRow label={t('Reviewer')}>
          <WhoOr id={e.reviewer} label="No reviewer" />
        </MetaRow>
        <MetaRow label={t('Client updates by')}>
          <WhoOr id={e.clientOwner} label="Not named" />
        </MetaRow>
        <MetaRow label={t('Delivery lane')}>
          {run ? (
            <StageButton menu="cs-lane" id={pid} label={t('Delivery lane')}>
              {e.lane && e.lane in LANE ? (
                <Ctx pill>{t(LANE[e.lane as LaneId])}</Ctx>
              ) : (
                <Tag unknown>{t('Not set')}</Tag>
              )}
            </StageButton>
          ) : e.lane && e.lane in LANE ? (
            t(LANE[e.lane as LaneId])
          ) : (
            <span className="text-mute">{t('Not set')}</span>
          )}
        </MetaRow>
        <MetaRow label={t('Start decision')}>
          {e.start ? (
            <>
              {who.stamp(e.start.by, e.start.at)} {e.start.note && <small>{e.start.note}</small>}
            </>
          ) : (
            <Tag unknown>{t('Not recorded')}</Tag>
          )}
        </MetaRow>
        <MetaRow label={t('Created by')}>{who.stamp(p.createdBy, p.createdAt)}</MetaRow>
      </Meta>
      {run && consCD(m) && (
        <div className="mt-2 flex gap-2">
          <Button
            small
            onClick={() => {
              openPanel('cons-roles', pid);
            }}
          >
            <Icon name="people" />
            {t('Edit roles')}
          </Button>
        </div>
      )}
      <p className="my-2 text-mute type-small">
        {t('Project Leader and Project Manager are project roles. They never change anyone’s division or rank.')}
      </p>
      <SectionHeading
        as="h2"
        count={e.scope.length}
        action={
          run &&
          addBtn(t('Propose a change'), () => {
            openPanel('cons-scope', pid);
          })
        }
      >
        {t('Scope')}
      </SectionHeading>
      <ScopeBox s={sn} goal={p.goal} />
      {pend.map((s) => (
        <PendingScope key={s.v} s={s} pid={pid} />
      ))}
      {e.scope
        .filter((s) => s.state === 'rejected')
        .map((s) => (
          <p key={s.v} className="my-2 text-mute type-small">
            {t('Version {v} rejected by {who}: {r}', {
              v: s.v,
              who: s.decidedBy && s.decidedAt ? who.stamp(s.decidedBy, s.decidedAt) : '',
              r: s.rationale ?? '',
            })}
          </p>
        ))}
      <SectionHeading
        as="h2"
        count={ds.length}
        action={
          run &&
          addBtn(t('Add deliverable'), () => {
            openPanel('cons-dlv-new', pid);
          })
        }
      >
        {t('Deliverables')}
      </SectionHeading>
      <Rows>
        {ds.map((d) => {
          const st = dlvState(db, d);
          const l = latest(d);
          const c = checks(db, d);
          const n = c.filter((x) => x[1]).length;
          return (
            <Row
              key={d.id}
              selected={insp?.type === 'cons-dlv' && insp.id === d.id}
              className="gap-2.5 max-[600px]:flex-wrap"
              onOpen={() => {
                openPanel('cons-dlv', d.id);
              }}
            >
              <Avatar id={d.owner} size="sm" />
              <RowText
                title={<b>{d.title}</b>}
                sub={l ? t('Version {v}, {who}', { v: l.v, who: who.stamp(l.by, l.at) }) : t('No version submitted')}
              />
              <Tag title={t('Readiness checks passed')}>{t('{a} of {b} checks', { a: n, b: c.length })}</Tag>
              <Chip def={DLV[st]} pill="pill-o" />
            </Row>
          );
        })}
        {!ds.length && <EmptyLine>{t('No deliverables defined.')}</EmptyLine>}
      </Rows>
      <p className="my-2 text-mute type-small">
        {t('Approved internally, delivered to the client and accepted by the client are three separate records.')}
      </p>
      <SectionHeading
        as="h2"
        count={e.updates.length}
        action={
          run &&
          addBtn(t('Record client update'), () => {
            openPanel('cons-cu', pid);
          })
        }
      >
        {t('Client updates')}
      </SectionHeading>
      {e.updates.length ? (
        <div className="flex flex-col">
          {[...e.updates]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((u, i) => {
              const tk = u.next ? taskOf(db, u.next) : undefined;
              return (
                <div
                  key={u.id}
                  className={cn('grid grid-cols-[64px_1fr] gap-3 px-2.5 py-3', i > 0 && 'border-t border-line')}
                >
                  <span className="leading-[1.3] text-ink-2 type-num">{dShort(u.date)}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-d13 text-mute">
                        {t((CHANNEL as Record<string, string | undefined>)[u.channel] ?? 'Other')}
                      </span>
                      {u.version && <Tag>{u.version}</Tag>}
                    </div>
                    <p className="mt-1.5 mb-1">{u.summary}</p>
                    <small className="text-d12 text-mute">
                      {u.feedback && `${t('Client feedback: {f}', { f: u.feedback })}. `}
                      {u.pending && `${t('Pending: {p}', { p: u.pending })}. `}
                      {t('Recorded by {who}', { who: who.stamp(u.by, u.at) })}
                      {tk && (
                        <>
                          {`. ${t('Next')}: `}
                          <a
                            className="cursor-pointer underline underline-offset-2"
                            onClick={() => {
                              openTask(tk.id);
                            }}
                          >
                            {tk.title}
                          </a>{' '}
                          {isDone(tk) && `(${t('done')})`}
                        </>
                      )}
                    </small>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <EmptyLine>{t('No client update recorded.')}</EmptyLine>
      )}
      <SectionHeading
        as="h2"
        count={e.risks.length + blks.length}
        action={
          run &&
          addBtn(t('Add risk'), () => {
            openPanel('cons-risk', pid);
          })
        }
      >
        {t('Risks and blockers')}
      </SectionHeading>
      <Rows>
        {blks.map((b) => (
          <Row
            key={b.id}
            className="gap-2.5"
            onOpen={() => {
              openTask(b.task);
            }}
          >
            <Icon name="warning" />
            <RowText
              title={<b>{b.text}</b>}
              sub={`${t('Blocker on {t}', { t: taskOf(db, b.task)?.title ?? '' })}. ${t('Owner {who}', { who: who.first(b.owner) })}`}
            />
            <Chip def={['Blocking', 'warning', 'danger']} pill="pill-o" />
          </Row>
        ))}
        {e.risks.map((x) => (
          <Row key={x.id} className="cursor-default flex-wrap gap-2.5">
            <Icon name="flag" />
            <div className="min-w-0 flex-1">
              <b>{x.title}</b>
              <small className="block text-d12h whitespace-normal text-mute">
                {`${t('Impact {i}, likelihood {l}', {
                  i: x.impact ? t(LEVEL[x.impact]) : t('Not rated'),
                  l: x.likelihood ? t(LEVEL[x.likelihood]) : t('Not rated'),
                })}. ${t('Trigger: {t}', { t: x.trigger || t('None') })}. ${t('Mitigation: {t}', { t: x.mitigation || t('None') })}`}
              </small>
            </div>
            <WhoOr id={x.owner} label="No owner" />
            <span className="text-mute type-num">{x.review ? dShort(x.review) : ''}</span>
            {x.blocker ? (
              <Chip def={['Raised as blocker', 'warning', 'danger']} pill="pill-o" />
            ) : run ? (
              <Button
                small
                onClick={() => {
                  openPanel('cons-blk', `${pid}|${x.id}`);
                }}
              >
                {t('Raise as blocker')}
              </Button>
            ) : (
              <Chip def={['Potential', 'info', 'ink2']} pill="pill-o" />
            )}
          </Row>
        ))}
        {!e.risks.length && !blks.length && <EmptyLine>{t('No risks or blockers recorded.')}</EmptyLine>}
      </Rows>
      <p className="my-2 text-mute type-small">
        {t(
          'A risk is a possible problem with a human rating. A blocker is a present obstacle on a task. Neither is a predicted score.',
        )}
      </p>
      <SectionHeading as="h2" count={e.obligations.length}>
        {t('Legal and finance')}
      </SectionHeading>
      <Rows>
        {e.obligations.map((ob) => {
          const st = foreign(db, ob.ref)?.state;
          return (
            <Row key={ob.id} className="cursor-default gap-2.5">
              <Icon name="file" />
              <RowText
                title={
                  <b>
                    <Link to={`/${ob.h}`}>{ob.label}</Link>
                  </b>
                }
                sub={`${ob.unit}. ${typeof st === 'string' ? t('State in FnL: {s}', { s: st }) : t('State kept by FnL; not recorded here.')}`}
              />
              {ob.resolution ? (
                <Chip
                  def={
                    ob.resolution.kind === 'resolved' ? ['Resolved', 'check', 'green'] : ['Handed over', 'right', 'ink']
                  }
                  pill="pill-o"
                />
              ) : (
                <Chip def={['Open', 'circle', 'warn']} pill="pill-o" />
              )}
            </Row>
          );
        })}
        {!e.obligations.length && <EmptyLine>{t('No legal or finance duty linked.')}</EmptyLine>}
      </Rows>
      <p className="my-2 text-mute type-small">
        {t('Delivery never proves a signed BAST or money received. The invoice waits for FnL’s BAST gate.')}
      </p>
      <SectionHeading as="h2" count={staffs.length}>
        {t('Team and staffing')}
      </SectionHeading>
      <Rows>
        {staffs.map((s) => (
          <Row
            key={s.id}
            className="gap-2.5"
            onOpen={() => {
              void navigate(`/staffing/${s.id}`);
            }}
          >
            <Icon name="person" />
            <RowText title={<b>{s.role}</b>} sub={`${fmtD(s.from)} – ${fmtD(s.to)}`} />
            <Chip def={staffSt(s)} pill="pill-o" />
          </Row>
        ))}
        {!staffs.length && <EmptyLine>{t('No staffing requests.')}</EmptyLine>}
      </Rows>
      {uses.length > 0 && (
        <>
          <SectionHeading as="h2" count={uses.length}>
            {t('Knowledge used')}
          </SectionHeading>
          <Rows>
            {uses
              .filter((a) => canSeeArt(a, m))
              .map((a) => {
                const u = a.uses.find((x) => x.type === 'project' && x.id === pid);
                const pub = pubV(a);
                return (
                  <Row
                    key={a.id}
                    className="gap-2.5"
                    onOpen={() => {
                      void navigate(`/knowledge/${a.id}`);
                    }}
                  >
                    <Icon name="documents" />
                    <RowText
                      title={<b>{a.title}</b>}
                      sub={`${t('Uses version {v}', { v: u?.v ?? 0 })}${pub && u && pub.v > u.v ? `. ${t('Version {v} is newer; this engagement keeps version {u}.', { v: pub.v, u: u.v })}` : ''}`}
                    />
                  </Row>
                );
              })}
          </Rows>
        </>
      )}
    </Page>
  );
}

export function EngagementsPage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const id = route.id;
  const isHo = !!id?.startsWith('ho-');
  const found = isHo ? hoOf(db, id) : undefined;
  const h = found && canSeeHo(found, m) ? found : undefined;
  const visible = h !== undefined;
  useEffect(() => {
    if (h)
      setUi((u) => {
        u.insp ??= { type: 'ec-ho', id: h.id };
      });
    // Opens the handoff once when the page is reached by its own link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, visible]);
  if (isHo) {
    if (!h) return <Unavailable />;
    if (!seeDiv(m, CONS)) return <OpportunitiesPage route={{ page: 'opportunities', id: h.opp }} />;
    return <Portfolio />;
  }
  if (id) return <EngagementPage pid={id} sub={route.sub} />;
  return <Portfolio />;
}
