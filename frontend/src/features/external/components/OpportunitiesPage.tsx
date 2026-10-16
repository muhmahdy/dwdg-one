/* Opportunities: the Partner and Client pipeline as a table or a board, and one opportunity with its stage track, proposal
   versions, linked legal requests, follow-ups, interactions, stage history and the handoff to Consulting. A stage is never a
   signature, a payment or an accepted engagement. From divisions/div-ee-cons.js oppPage and oppDetail. */
import { Link, useNavigate } from 'react-router';
import { divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar } from '@/components/shared/Avatar';
import { Chip, DivCrumb, Hint, Locked, Tag, th, tblClass, tblScroll, trLink } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/forms';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { Stage } from '@/components/ui/StatusBadge';
import { Steps } from '@/components/ui/Steps';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openPanel } from '@/lib/open';
import { useWho } from '@/lib/people';
import { dShort, fmtD, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { canSeeProject } from '@/features/projects/services/access';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { projOf } from '@/features/work/services/selectors';
import {
  EE,
  HO,
  KIND,
  OPP,
  OPP_FLOW,
  OPP_SIDE,
  canConf,
  canStage,
  contactOf,
  eeMember,
  eeOf,
  hoOf,
  oppDef,
  oppIx,
  oppOf,
  orgOf,
  seeDiv,
  type Kind,
  type Opp,
  type OppStage,
} from '../services/ee-data';
import { FollowupRow, HandoffCard, IxList, LastIxCell, LegalCell, WhoOr, openFollowups, eeTd } from './ext-parts';
import { StageButton } from './RelationshipsPage';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function OpportunitiesCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const o = route.id ? oppOf(db, route.id) : undefined;
  if (o)
    return (
      <DivCrumb
        d={EE}
        parts={[
          ['opportunities', t('Opportunities')],
          ['', o.title],
        ]}
      />
    );
  return <DivCrumb d={EE} parts={[['opportunities', t('Opportunities')]]} />;
}

const stageDef = (s: OppStage, kind: Kind | 'all') =>
  s === 'active' && kind === 'partner' ? oppDef({ stage: 'active', kind: 'partner' }) : OPP[s];

function OppCard({ o }: { o: Opp }) {
  const db = useWorkspace((w) => w);
  const navigate = useNavigate();
  const go = () => {
    void navigate(`/opportunities/${o.id}`);
  };
  return (
    <div
      className="grid cursor-pointer gap-1.5 rounded-[10px] bg-surface px-3 py-2.5 shadow-sheet hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      tabIndex={0}
      role="link"
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter') go();
      }}
    >
      <b className="text-d13 font-semibold">{o.title}</b>
      <small className="mt-0.5 block text-d13 text-mute">{orgOf(db, o.org)?.name}</small>
      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-d13">
        <Avatar id={o.pic} size="xs" />
        <span className="min-w-0 flex-1 truncate">{o.nextAction || t('No next action')}</span>
        {o.nextDate && <span className="type-num">{dShort(o.nextDate)}</span>}
      </div>
      {OPP_SIDE.includes(o.stage) && o.reason && (
        <small className="block text-d13 whitespace-normal text-ink-2">{o.reason}</small>
      )}
    </div>
  );
}

function OpportunityList() {
  const db = useWorkspace((w) => w);
  const navigate = useNavigate();
  const k = useUi<Kind | 'all'>((u) => (u.ecKind === 'partner' || u.ecKind === 'client' ? u.ecKind : 'all'));
  const v = useUi((u) => (u.ecOppView === 'board' ? 'board' : 'table'));
  useDivisionWorkspace(EE);
  const list = eeOf(db).opps.filter((o) => k === 'all' || o.kind === k);
  return (
    <Page wide>
      <PageHeader
        title={t('Opportunities')}
        sub={t('Partner and Client opportunities. A stage is never a signature, a payment or an accepted engagement.')}
      >
        <Segmented<Kind | 'all'>
          label={t('Branch')}
          value={k}
          onChange={(x) => {
            setUi((u) => {
              u.ecKind = x;
            });
          }}
          options={[
            ['all', t('All')],
            ['partner', t('Partner')],
            ['client', t('Client')],
          ]}
        />
        <Segmented<'table' | 'board'>
          label={t('View')}
          value={v}
          onChange={(x) => {
            setUi((u) => {
              u.ecOppView = x;
            });
          }}
          options={[
            [
              'table',
              <span key="t" className="inline-flex items-center gap-1.5">
                <Icon name="list" size="sm" />
                {t('Table')}
              </span>,
            ],
            [
              'board',
              <span key="b" className="inline-flex items-center gap-1.5">
                <Icon name="board" size="sm" />
                {t('Board')}
              </span>,
            ],
          ]}
        />
      </PageHeader>
      {!list.length ? (
        <Empty title={t('No opportunities yet')}>{t('Create one from a relationship after a real discussion.')}</Empty>
      ) : v === 'board' ? (
        <div className="mt-4 grid auto-cols-[280px] grid-flow-col items-start gap-4 overflow-x-auto pb-2">
          {[...OPP_FLOW, ...OPP_SIDE].map((s) => {
            const cs = list.filter((o) => o.stage === s);
            return (
              <div
                key={s}
                className={cn(
                  'flex min-h-[120px] flex-col gap-2 rounded-sheet p-1.5',
                  OPP_SIDE.includes(s) ? 'bg-transparent shadow-[inset_0_0_0_1px_var(--line)]' : 'bg-surface-2',
                )}
              >
                <div className="flex items-center justify-between px-1.5 pt-1 pb-1.5 text-d13 font-semibold">
                  <Chip def={stageDef(s, k)} />
                  <span className="text-mute type-num">{cs.length}</span>
                </div>
                {cs.length ? (
                  cs.map((o) => <OppCard key={o.id} o={o} />)
                ) : (
                  <p className="mx-1.5 my-1 text-mute type-small">{t('Nothing here')}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={tblScroll}>
          <table className={tblClass}>
            <thead>
              <tr>
                <th className={th}>{t('Opportunity')}</th>
                <th className={th}>{t('Kind')}</th>
                <th className={th}>{t('Stage')}</th>
                <th className={th}>{t('PIC')}</th>
                <th className={th}>{t('Backup')}</th>
                <th className={th}>{t('Last interaction')}</th>
                <th className={th}>{t('Next action')}</th>
                <th className={th}>{t('Agreement')}</th>
                <th className={th}>{t('Handoff')}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => {
                const h = hoOf(db, o.handoff);
                const go = () => {
                  void navigate(`/opportunities/${o.id}`);
                };
                return (
                  <tr
                    key={o.id}
                    className={trLink}
                    tabIndex={0}
                    role="link"
                    onClick={go}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') go();
                    }}
                  >
                    <td className={eeTd}>
                      <b>{o.title}</b>
                      <small className="text-mute">{orgOf(db, o.org)?.name}</small>
                    </td>
                    <td className={eeTd}>
                      <Tag>{t(KIND[o.kind])}</Tag>
                    </td>
                    <td className={eeTd}>
                      <Chip def={oppDef(o)} pill="pill-o" />
                    </td>
                    <td className={eeTd}>
                      <WhoOr id={o.pic} label="No PIC" />
                    </td>
                    <td className={eeTd}>
                      <WhoOr id={o.backup} label="No backup" />
                    </td>
                    <td className={eeTd}>
                      <LastIxCell orgId={o.org} />
                    </td>
                    <td className={eeTd}>
                      {o.nextAction ? (
                        <span className="inline-flex max-w-[280px] items-center gap-2">
                          <span className="min-w-0 truncate">{o.nextAction}</span>
                          {o.nextDate ? (
                            <span className={cn('type-num', o.nextDate < today() && 'text-danger')}>
                              {dShort(o.nextDate)}
                            </span>
                          ) : (
                            <Tag unknown>{t('No date')}</Tag>
                          )}
                        </span>
                      ) : (
                        <span className="text-mute">{t('None')}</span>
                      )}
                    </td>
                    <td className={eeTd}>
                      <LegalCell ids={o.legal} />
                    </td>
                    <td className={eeTd}>
                      {h ? <Chip def={HO[h.state]} pill="pill-o" /> : <span className="text-mute">{t('None')}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Hint>{t('Amounts are optional estimates with their basis. There is no weighted revenue forecast.')}</Hint>
    </Page>
  );
}

function OpportunityPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const navigate = useNavigate();
  useDivisionWorkspace(EE);
  const o = oppOf(db, id);
  const org = o ? orgOf(db, o.org) : undefined;
  if (!o || !org) return <Unavailable />;
  const edit = canStage(o, m);
  const conf = canConf(o, m);
  const c = o.contact ? contactOf(db, o.contact) : undefined;
  const fus = openFollowups(db, (x) => x.opp === o.id);
  const h = hoOf(db, o.handoff);
  const ix = oppIx(db, o.id);
  const side = OPP_SIDE.includes(o.stage);
  const at = OPP_FLOW.indexOf(o.stage);
  const p = o.project ? projOf(db, o.project) : undefined;
  const sd = (s: OppStage) => (s === 'active' ? oppDef({ stage: 'active', kind: o.kind }) : OPP[s]);
  return (
    <Page wide>
      <PageHeader
        title={o.title}
        sub={
          <span className="flex flex-wrap items-center gap-1.5">
            <Link to={`/relationships/${org.id}`}>{org.name}</Link> <Tag>{t(KIND[o.kind])}</Tag>
          </span>
        }
      >
        {edit ? (
          <StageButton menu="ec-opp-st" id={o.id} label={t('Stage: {s}. Change', { s: t(oppDef(o)[0]) })}>
            <Chip def={oppDef(o)} pill="pill" />
          </StageButton>
        ) : (
          <Chip def={oppDef(o)} pill="pill" />
        )}
        {edit && (
          <Button
            onClick={() => {
              openPanel('ec-opp-edit', o.id);
            }}
          >
            <Icon name="edit" />
            {t('Edit')}
          </Button>
        )}
        {eeMember(m) && (
          <>
            <Button
              onClick={() => {
                openPanel('ec-fu-new', undefined, { org: org.id, opp: o.id });
              }}
            >
              <Icon name="clock" />
              {t('New follow-up')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setUi((u) => {
                  u.ecIxDraft = null;
                });
                openPanel('ec-ix', org.id, { org: org.id, opp: o.id });
              }}
            >
              <Icon name="edit" />
              {t('Log interaction')}
            </Button>
          </>
        )}
      </PageHeader>
      {side ? (
        <div className="mt-3.5 mb-1 flex flex-wrap items-center gap-2.5 text-d13">
          <Chip def={OPP[o.stage]} pill="pill" />
          <span>{o.reason}</span>
          {o.stage === 'hold' && (
            <small className="text-mute">
              {o.reviewDate ? t('Review on {d}', { d: fmtD(o.reviewDate) }) : t('No review date, on purpose')}
            </small>
          )}
        </div>
      ) : (
        <Steps className="mt-3.5 mb-1 max-w-[900px]" labels={OPP_FLOW.map((s) => t(sd(s)[0]))} current={at} />
      )}
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[600px]:grid-cols-[112px_1fr] [&_dd]:flex-wrap">
        <MetaRow label={t('PIC')}>
          <WhoOr id={o.pic} label="No PIC" />
        </MetaRow>
        <MetaRow label={t('Backup')}>
          <WhoOr id={o.backup} label="No backup" />
        </MetaRow>
        <MetaRow label={t('Contact')}>
          {c ? (
            <>
              {c.name} <small>{c.role}</small>
              {!conf && <> {<Locked>{t('Details restricted')}</Locked>}</>}
            </>
          ) : (
            <span className="text-mute">{t('Not named')}</span>
          )}
        </MetaRow>
        <MetaRow label={t('Need')}>{conf || !o.confidential ? o.need : <Locked>{t('Confidential')}</Locked>}</MetaRow>
        <MetaRow label={t('Service')}>{o.service}</MetaRow>
        <MetaRow label={t('Decision needed')}>
          {o.decision || <span className="text-mute">{t('None recorded')}</span>}
        </MetaRow>
        <MetaRow label={t('Next action')}>
          {o.nextAction ? (
            <>
              {o.nextAction}{' '}
              {o.nextDate ? <span className="type-num">{fmtD(o.nextDate)}</span> : <Tag unknown>{t('No date')}</Tag>}
            </>
          ) : (
            <span className="text-mute">{t('None')}</span>
          )}
        </MetaRow>
        <MetaRow label={t('Estimate')}>
          {!o.estimate ? (
            <span className="text-mute">{t('None given')}</span>
          ) : conf ? (
            <>
              {o.estimate} {o.basis && <small>{t('Basis: {b}', { b: o.basis })}</small>}
            </>
          ) : (
            <Locked>{t('Confidential')}</Locked>
          )}
        </MetaRow>
        <MetaRow label={t('Created by')}>{who.stamp(o.createdBy, o.at)}</MetaRow>
        {o.win && (
          <MetaRow label={t('Win recorded')}>
            {`${who.stamp(o.win.by, o.win.at)}, ${t('authorized by {who}', { who: who.name(o.win.auth) })}`}
          </MetaRow>
        )}
      </Meta>
      {o.stage === 'active' && (
        <Notice icon="info" className="mt-3 mb-3" title={<b>{t('Won is not signed or paid')}</b>}>
          <p>
            {t('The agreement, the handover record and any payment are recorded by FnL. Nothing here changes them.')}
          </p>
        </Notice>
      )}
      {o.kind === 'client' && <HandoffCard o={o} h={h} />}
      <SectionHeading
        as="h2"
        count={o.proposals.length}
        action={
          edit && (
            <Button
              small
              variant="ghost"
              onClick={() => {
                openPanel('ec-prop', o.id);
              }}
            >
              <Icon name="plus" />
              {t('Add version')}
            </Button>
          )
        }
      >
        {t('Proposal versions')}
      </SectionHeading>
      {o.proposals.length ? (
        <div className="grid gap-[3px]">
          {[...o.proposals].reverse().map((pr, i) => (
            <div
              key={pr.v}
              className={cn(
                'grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-ctl px-2.5 py-1.5',
                i === 0 && 'bg-sel-neutral',
              )}
            >
              <span className="text-d13 font-semibold">v{pr.v}</span>
              <div className="min-w-0">
                <b className="text-d14 font-bold">{pr.note}</b>
                <small className="block text-d13 text-mute">
                  {who.stamp(pr.by, pr.at)}
                  {pr.reviewer && `, ${t('reviewed by {who}', { who: who.first(pr.reviewer) })}`}
                </small>
              </div>
              {pr.url ? (
                <a
                  className="inline-grid size-[30px] place-items-center rounded-ctl text-mute hover:bg-hover hover:text-ink"
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('Open version {v}', { v: pr.v })}
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
        <EmptyLine>{t('No proposal yet.')}</EmptyLine>
      )}
      <SectionHeading as="h2">{t('Agreement')}</SectionHeading>
      <div className="grid gap-1.5">
        {o.legal.length ? (
          <LegalCell ids={o.legal} />
        ) : (
          <span className="text-mute">{t('No legal request linked.')}</span>
        )}
        <p className="m-0 text-mute type-small">
          {t('Agreement state is linked evidence from FnL Legal, never read from this stage.')}
        </p>
      </div>
      {o.project && (
        <>
          <SectionHeading as="h2">{t('Delivery project')}</SectionHeading>
          <Rows>
            {p && m && canSeeProject(db, m, p) ? (
              <Row
                className="gap-2.5"
                onOpen={() => {
                  void navigate(`/projects/${p.id}`);
                }}
              >
                <Icon name="projects" />
                <RowText
                  title={<b>{p.name}</b>}
                  sub={`${divisionOf(p.div)?.name ?? ''}, ${t('lead {who}', { who: who.first(p.lead) })}`}
                />
                <Stage stage={p.stage} />
              </Row>
            ) : (
              <Row className="cursor-default gap-2.5">
                <Icon name="lock" />
                <RowText title={<b>{t('A project you can’t open')}</b>} sub={t('Linked, but outside your access.')} />
              </Row>
            )}
          </Rows>
        </>
      )}
      <SectionHeading as="h2" count={fus.length}>
        {t('Open follow-ups')}
      </SectionHeading>
      <Rows>
        {fus.map((x) => (
          <FollowupRow key={x.task} x={x} />
        ))}
        {!fus.length && <EmptyLine>{t('No open follow-up.')}</EmptyLine>}
      </Rows>
      <SectionHeading as="h2" count={ix.length}>
        {t('Interactions')}
      </SectionHeading>
      <IxList ix={ix} />
      <SectionHeading as="h2" count={o.history.length}>
        {t('Stage history')}
      </SectionHeading>
      <div className="flex flex-col gap-0.5">
        {[...o.history].reverse().map((x, i) => (
          <div key={`${x.at}${String(i)}`} className="flex min-h-9 flex-wrap items-center gap-2 px-2.5 py-1 text-d13">
            <Chip def={sd(x.stage)} pill="pill-o" />
            <small className="text-mute">
              {who.stamp(x.by, x.at)}
              {x.reason && `. ${x.reason}`}
            </small>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function OpportunitiesPage({ route }: { route: Route }) {
  const m = useMe();
  if (!seeDiv(m, EE)) return <Unavailable />;
  return route.id ? <OpportunityPage id={route.id} /> : <OpportunityList />;
}
