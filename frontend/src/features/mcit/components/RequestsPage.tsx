/* Requests to MCIT: the IT queue and content briefs from every unit (marketing_it_requests, flow-it-support, blueprint §6), plus
   publication requests from HR. A member sees their own requests; the Board sees none. From divisions/div-fnl-mcit.js
   itRequestsPage. */
import { Link } from 'react-router';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Chip, DivCrumb } from '@/components/shared/division-ui';
import { Button, buttonClass } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Empty, NotAvailable, Page, PageHeader, Row, RowText, Rows, tabClass } from '@/components/ui/page';
import { t } from '@/lib/i18n';
import { dShort, fmtD } from '@/lib/time';
import { useWho } from '@/lib/people';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { hrOf } from '@/features/hr/services/hr-data';
import { isBoardP, unitLead, unitName } from '@/features/fnl/services/fnl-data';
import { GrantsBox, NeededTag, Who } from '@/features/fnl/components/fnl-parts';
import { LinkRow, Tbl, Td, Th } from '@/features/fnl/components/fnl-table';
import { exportIt } from '../services/it';
import {
  BST,
  IT,
  ITYPE,
  MC,
  PRIO,
  accOf,
  brOf,
  chName,
  itOf,
  mcFull,
  mcitOf,
  seeAcc,
  type Brief,
  type ItRequest,
} from '../services/mcit-data';
import { BriefPage } from './BriefPage';
import { ItPage } from './ItPage';
import { NewRequestPage } from './NewRequestPage';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function ItRequestsCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const parts: [string, string][] = [['it-requests', t('Requests')]];
  if (route.id === 'new') parts.push(['', route.sub === 'brief' ? t('New content brief') : t('New IT request')]);
  else if (route.id) {
    const x = itOf(db, route.id) ?? brOf(db, route.id);
    if (x) parts.push(['', x.title]);
  }
  return <DivCrumb d={MC} parts={parts} />;
}

function ItRow({ x }: { x: ItRequest }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const acc = accOf(db, x.service);
  return (
    <LinkRow to={`it-requests/${x.id}`}>
      <Td>
        <b>{x.title}</b>
        <small className="text-mute">{t(ITYPE[x.type])}</small>
      </Td>
      <Td>{acc && seeAcc(acc, m) ? acc.service : <span className="text-mute">{t('Not listed')}</span>}</Td>
      <Td>
        <Who id={x.requester} /> <small className="text-mute">{unitName(x.unit)}</small>
      </Td>
      <Td>
        <Who id={x.owner} />
      </Td>
      <Td>{x.priority ? t(PRIO[x.priority]) : <span className="text-mute">{t('Not triaged')}</span>}</Td>
      <Td className="type-num">{dShort(x.createdAt.slice(0, 10))}</Td>
      <Td>
        <Chip def={IT[x.stage]} pill="pill" />
      </Td>
    </LinkRow>
  );
}
function BriefRow({ x }: { x: Brief }) {
  return (
    <LinkRow to={`it-requests/${x.id}`}>
      <Td>
        <b>{x.title}</b>
        <small className="text-mute">{x.deliverable}</small>
      </Td>
      <Td>
        <Who id={x.requester} /> <small className="text-mute">{unitName(x.unit)}</small>
      </Td>
      <Td>{chName(x.channel)}</Td>
      <Td>
        <NeededTag d={x.desired} />
      </Td>
      <Td>
        <Chip def={BST[x.state]} pill="pill" />
      </Td>
    </LinkRow>
  );
}
const ItHead = () => (
  <>
    <Th>{t('Request')}</Th>
    <Th>{t('Service')}</Th>
    <Th>{t('Requested by')}</Th>
    <Th>{t('Owner')}</Th>
    <Th>{t('Priority')}</Th>
    <Th>{t('Opened')}</Th>
    <Th>{t('State')}</Th>
  </>
);
const BriefHead = () => (
  <>
    <Th>{t('Brief')}</Th>
    <Th>{t('Requested by')}</Th>
    <Th>{t('Channel')}</Th>
    <Th>{t('Wanted by')}</Th>
    <Th>{t('State')}</Th>
  </>
);

function AccountsLink() {
  return (
    <p className="my-2 inline-flex items-center gap-1 text-d13">
      <Icon name="shield" size="sm" />
      <Link to="/accounts-register">{t('Find who looks after an account and how to get access')}</Link>
    </p>
  );
}

function List() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const view = useUi((u) => u.view.mcreq ?? 'it');
  useDivisionWorkspace(MC);
  if (!m) return <Unavailable />;
  const s = mcitOf(db);
  const full = mcFull(m);
  const newBtns = !isBoardP(m) && (
    <>
      <Link className={buttonClass('default', false, 'no-underline')} to="/it-requests/new/brief">
        <Icon name="sparkles" />
        {t('Content brief')}
      </Link>
      <Link className={buttonClass('primary', false, 'no-underline')} to="/it-requests/new/it">
        <Icon name="settings" />
        {t('IT request')}
      </Link>
    </>
  );
  if (!full) {
    const mi = s.it.filter((x) => x.requester === m.id || unitLead(m, x.unit));
    const mb = s.briefs.filter((x) => x.requester === m.id || unitLead(m, x.unit));
    return (
      <Page wide>
        <PageHeader
          title={t('Requests to MCIT')}
          sub={t(
            'Ask IT for help with an account, the website or a tool, or ask Marketing for content. Never type passwords here.',
          )}
        >
          {newBtns}
        </PageHeader>
        <AccountsLink />
        {mi.length > 0 && (
          <>
            <SectionHeading as="h2" count={mi.length}>
              {t('Your IT requests')}
            </SectionHeading>
            <Tbl head={<ItHead />}>
              {mi.map((x) => (
                <ItRow key={x.id} x={x} />
              ))}
            </Tbl>
          </>
        )}
        {mb.length > 0 && (
          <>
            <SectionHeading as="h2" count={mb.length}>
              {t('Your content briefs')}
            </SectionHeading>
            <Tbl head={<BriefHead />}>
              {mb.map((x) => (
                <BriefRow key={x.id} x={x} />
              ))}
            </Tbl>
          </>
        )}
        {!mi.length && !mb.length && (
          <Empty title={t('You have no requests yet')}>{t('Start an IT request or a content brief.')}</Empty>
        )}
      </Page>
    );
  }
  const its = [...s.it].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const hrRows = (hrOf(db)?.packets ?? []).filter((pk) => pk.state !== 'draft');
  const tabs: [string, string, number][] = [
    ['it', 'IT', its.filter((x) => !['closed', 'cancelled'].includes(x.stage)).length],
    [
      'briefs',
      'Briefs',
      s.briefs.filter((b) => b.state === 'submitted').length + hrRows.filter((pk) => pk.state === 'requested').length,
    ],
  ];
  return (
    <Page wide>
      <PageHeader
        title={t('Requests')}
        sub={t(
          'IT help and content briefs from every unit. A request never authorizes a deployment or an access change by itself.',
        )}
      >
        {newBtns}
      </PageHeader>
      <AccountsLink />
      <div className="mt-[18px] mb-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-6 shadow-[inset_0_-1px_0_var(--line)]" role="tablist">
          {tabs.map(([k, l, n]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={view === k}
              className={tabClass(view === k)}
              onClick={() => {
                setUi((u) => {
                  u.view.mcreq = k;
                });
              }}
            >
              {t(l)} <span className="ml-2 text-mute type-num">{n}</span>
            </button>
          ))}
        </div>
        {view === 'it' && (
          <Button
            small
            onClick={() => {
              void exportIt();
            }}
          >
            <Icon name="download" />
            {t('Export CSV')}
          </Button>
        )}
      </div>
      {view === 'it' ? (
        <Tbl head={<ItHead />}>
          {its.map((x) => (
            <ItRow key={x.id} x={x} />
          ))}
        </Tbl>
      ) : (
        <>
          <Tbl head={<BriefHead />}>
            {s.briefs.map((x) => (
              <BriefRow key={x.id} x={x} />
            ))}
          </Tbl>
          {hrRows.length > 0 && (
            <>
              <SectionHeading as="h2" count={hrRows.length}>
                {t('Publication requests from HR')}
              </SectionHeading>
              <Rows>
                {hrRows.map((pk) => (
                  <Link key={pk.id} to={`/recognition/${pk.round}`} className="block">
                    <Row className="gap-2.5">
                      <Icon name="heart" />
                      <RowText
                        title={<b>{pk.title}</b>}
                        className="whitespace-normal"
                        sub={t(
                          'Named receiver {who}. Needed by {d}. HR keeps grades and reasons; only the approved packet comes to MCIT.',
                          {
                            who: who.first(pk.receiver),
                            d: fmtD(pk.neededBy),
                          },
                        )}
                      />
                      <Chip
                        def={
                          BST[
                            pk.state === 'fulfilled' || pk.state === 'accepted'
                              ? 'accepted'
                              : pk.state === 'returned'
                                ? 'returned'
                                : 'submitted'
                          ]
                        }
                      />
                    </Row>
                  </Link>
                ))}
              </Rows>
            </>
          )}
        </>
      )}
      <GrantsBox grants={s.grants} keys={['triage', 'tech', 'review']} />
    </Page>
  );
}

export function ItRequestsPage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  if (route.id === 'new') return <NewRequestPage kind={route.sub} />;
  if (route.id) {
    const x = itOf(db, route.id);
    if (x) return <ItPage id={x.id} />;
    const b = brOf(db, route.id);
    if (b) return <BriefPage id={b.id} />;
    return <Unavailable />;
  }
  return <List />;
}
