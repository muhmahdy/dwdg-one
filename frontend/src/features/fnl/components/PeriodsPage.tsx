/* Period reviews: each month's allocations, commitments, payments, what is still owed and missing evidence. A closed review
   keeps its snapshot; a later correction makes a new one. From divisions/div-fnl-mcit.js periodsPage and periodPage
   (finance_period_snapshot, flow-finance-reconcile). */
import { useState } from 'react';
import { Link } from 'react-router';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Chip, DivCrumb, Hint, Tag } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { Field, Grid2, inputClass, invalidClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { dShort, fmtD } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { projOf } from '@/features/work/services/selectors';
import {
  FNL,
  FST,
  PST,
  RCK,
  fnlFull,
  fnlOf,
  frOf,
  grant,
  idrT,
  isBoardP,
  netPaid,
  owed,
  periodRows,
  periodTotals,
  prOf,
  type Payment,
  type Period,
} from '../services/fnl-data';
import {
  closePeriod,
  compareBank,
  exportPeriod,
  flagRow,
  markActionDone,
  matchRow,
  saveSnapshot,
} from '../services/finance';
import { Ledger, Acts, Box, ByAt, GrantsBox, LinkOut, Money, Note, Who, fmtDT, useFieldErrors } from './fnl-parts';
import { LinkRow, Tbl, Td, Th } from './fnl-table';

export function PeriodsCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const parts: [string, string][] = [['period-reviews', t('Period reviews')]];
  const p = route.id ? prOf(db, route.id) : undefined;
  if (p) parts.push(['', p.name]);
  return <DivCrumb d={FNL} parts={parts} />;
}

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);
const closeForm = () => {
  setUi((u) => {
    u.form = null;
  });
};

function FlagForm({ p, x }: { p: Period; x: Payment }) {
  const db = useWorkspace((w) => w);
  const s = fnlOf(db);
  const owners = [...new Set([...s.grants.pay, ...s.grants.periodPrep])];
  const [action, setAction] = useState('');
  const [owner, setOwner] = useState(owners.includes('citra') ? 'citra' : (owners[0] ?? ''));
  const fe = useFieldErrors();
  return (
    <tr>
      <td colSpan={6}>
        <Box>
          <Grid2>
            <Field label={t('Next action')} htmlFor="fm-pd-act" required help={fe.help('a')} error={fe.bad('a')}>
              <input
                id="fm-pd-act"
                className={cn(inputClass, fe.bad('a') && invalidClass)}
                value={action}
                autoComplete="off"
                autoFocus
                onChange={(e) => {
                  setAction(e.target.value);
                  fe.clear();
                }}
              />
            </Field>
            <Field label={t('Owner')} htmlFor="fm-pd-own">
              <SelectField
                id="fm-pd-own"
                people
                value={owner}
                onChange={setOwner}
                options={owners.map((id) => ({ value: id, label: db.people.find((q) => q.id === id)?.name ?? id }))}
              />
            </Field>
          </Grid2>
          <Acts>
            <Button
              variant="primary"
              onClick={() => {
                if (!action.trim()) return fe.fail('a', t('Say what happens next.'));
                void flagRow(p.id, x.id, action.trim(), owner);
              }}
            >
              {t('Record discrepancy')}
            </Button>
            <Button variant="ghost" onClick={closeForm}>
              {t('Cancel')}
            </Button>
          </Acts>
        </Box>
      </td>
    </tr>
  );
}

function PayRow({ p, x, board, canPrep }: { p: Period; x: Payment; board: boolean; canPrep: boolean }) {
  const db = useWorkspace((w) => w);
  const form = useUi((u) => u.form);
  const r = frOf(db, x.req);
  const c = p.checks[x.id] ?? 'unchecked';
  const d = p.discrepancies?.[x.id];
  const who = useWho();
  return (
    <>
      <tr>
        <Td className="type-num">{dShort(x.date)}</Td>
        <Td>
          <Link to={`/fnl-requests/${x.req}`}>
            <b>{r ? r.purpose : x.req}</b>
          </Link>
          <small className="block text-mute">
            {x.kind === 'correction' ? t('Correction to {r}', { r: x.of ?? '' }) : x.id}
          </small>
        </Td>
        <Td num>
          <Money n={x.amount} />
        </Td>
        <Td>
          {board ? (
            ''
          ) : x.evidence ? (
            <LinkOut label={t('Evidence')} url={x.evidence} />
          ) : (
            <Tag tone="warn">{t('Evidence missing')}</Tag>
          )}
        </Td>
        <Td>
          <Chip def={RCK[c]} pill="pill" />
          {d && (
            <small className="block text-mute">
              {d.action}, {who.first(d.owner)}
            </small>
          )}
        </Td>
        <Td>
          {canPrep && p.state !== 'closed' && !board && (
            <span className="inline-flex gap-1">
              <Button
                small
                disabled={!x.evidence}
                title={x.evidence ? undefined : t('Attach evidence first')}
                onClick={() => {
                  void matchRow(p.id, x.id);
                }}
              >
                {t('Matches')}
              </Button>
              <Button
                small
                variant="ghost"
                onClick={() => {
                  setUi((u) => {
                    u.form = `p-d-${x.id}`;
                  });
                }}
              >
                {t('Discrepancy')}
              </Button>
            </span>
          )}
        </Td>
      </tr>
      {form === `p-d-${x.id}` && <FlagForm p={p} x={x} />}
    </>
  );
}

function SnapshotRows({ p }: { p: Period }) {
  const who = useWho();
  return (
    <div className="grid gap-[3px] [&_small]:block!">
      {[...p.snapshots].reverse().map((s, i) => (
        <div
          key={s.v}
          className={cn(
            'grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-ctl px-2.5 py-1.5 max-[760px]:grid-cols-[36px_1fr]',
            i === 0 && 'bg-sel-neutral',
          )}
        >
          <span className="text-d13 font-semibold">{t('S{v}', { v: s.v })}</span>
          <div className="min-w-0">
            <b className="text-d14 font-bold">
              <Money n={s.totals.paid} /> {t('paid')} · <Money n={s.totals.outstanding} /> {t('outstanding')}
            </b>
            <small className="block text-d13 text-mute">
              {who.name(s.by)}, {fmtDT(s.at)} · {t('{n} rows', { n: s.ids.length })}
            </small>
            {s.note && <small className="block text-d13 text-mute">{s.note}</small>}
          </div>
          {i === 0 ? (
            <Chip def={['Current basis', 'check', 'green']} pill="pill" />
          ) : (
            <Chip def={['Past basis, kept', 'archive', 'mute']} pill="pill" />
          )}
        </div>
      ))}
    </div>
  );
}

function PeriodPage({ p }: { p: Period }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const board = isBoardP(m);
  const prep = grant(db, 'periodPrep', m?.id) || grant(db, 'period', m?.id);
  const revw = grant(db, 'period', m?.id) && p.preparedBy !== m?.id;
  const tot = periodTotals(db, p);
  const rows = periodRows(db, p).sort((a, b) => a.date.localeCompare(b.date));
  const unchecked = rows.filter((x) => (p.checks[x.id] ?? 'unchecked') === 'unchecked').length;
  const disc = rows.filter((x) => p.checks[x.id] === 'discrepancy').length;
  const owedRows = tot.reqs.filter((r) => owed(db, r) > 0);
  const last = p.snapshots.at(-1);
  const drift = !!last && (last.totals.paid !== tot.paid || last.totals.committed !== tot.committed);
  const proj = p.project ? projOf(db, p.project) : undefined;
  const open = p.unresolved.filter((u) => u.state === 'open').length;
  return (
    <Page wide>
      <PageHeader title={p.name} sub={`${fmtD(p.from)} – ${fmtD(p.to)}`}>
        <Chip def={PST[p.state]} pill="pill-o" />
        {!board && (
          <Button
            onClick={() => {
              void exportPeriod(p.id);
            }}
          >
            <Icon name="download" />
            {t('Export CSV')}
          </Button>
        )}
      </PageHeader>
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[760px]:grid-cols-1 [&_dd]:min-w-0 [&_dd]:flex-wrap">
        <MetaRow label={t('Created by')}>
          <ByAt id={p.createdBy} at={p.createdAt} />
        </MetaRow>
        <MetaRow label={t('Prepared by')}>
          <Who id={p.preparedBy} />
        </MetaRow>
        <MetaRow label={t('Reviewer')}>
          <Who id={p.reviewer} />
        </MetaRow>
        {p.project && (
          <MetaRow label={t('Project')}>{proj ? <Link to={`/projects/${proj.id}`}>{proj.name}</Link> : ''}</MetaRow>
        )}
      </Meta>
      {p.bank !== 'done' ? (
        <Notice
          icon="warning"
          tone="warn"
          className="mt-3 mb-3"
          title={<b>{t('Bank and cash reconciliation incomplete')}</b>}
          actions={
            !board &&
            grant(db, 'period', m?.id) &&
            p.state !== 'closed' && (
              <Button
                small
                onClick={() => {
                  void compareBank(p.id);
                }}
              >
                {t('Bank statement compared')}
              </Button>
            )
          }
        >
          <p>{t('The rows below are compared with receipts only. This is not full accounting proof.')}</p>
        </Notice>
      ) : (
        <Notice icon="check" tone="done" className="mt-3 mb-3" title={<b>{t('Bank statement compared')}</b>} />
      )}
      <SectionHeading as="h2">{t('Totals from the rows, now')}</SectionHeading>
      <Ledger
        items={[
          [t('Allocated by period end'), <Money n={tot.alloc} />],
          [t('Approved commitments'), <Money n={tot.committed} />],
          [t('Paid (recorded)'), <Money n={tot.paid} />],
          [t('Outstanding'), <Money n={tot.outstanding} />],
        ]}
      />
      {drift && (
        <Notice icon="info" className="mt-3 mb-3" title={<b>{t('Totals changed since the last snapshot')}</b>}>
          <p>{t('A correction or payment changed this period. The earlier snapshot stays as the past basis.')}</p>
        </Notice>
      )}
      {!board && (
        <>
          <SectionHeading as="h2" count={rows.length}>
            {t('Payments and corrections in this period')}
          </SectionHeading>
          {rows.length ? (
            <Tbl
              head={
                <>
                  <Th>{t('Date')}</Th>
                  <Th>{t('Request')}</Th>
                  <Th num>{t('Amount')}</Th>
                  <Th>{t('Evidence')}</Th>
                  <Th>{t('Check')}</Th>
                  <Th />
                </>
              }
            >
              {rows.map((x) => (
                <PayRow key={x.id} p={p} x={x} board={board} canPrep={prep} />
              ))}
            </Tbl>
          ) : (
            <Note>{t('No payments recorded in this period.')}</Note>
          )}
          <Note>
            {t('Row total {s} matches paid {p}.', {
              s: idrT(rows.reduce((q, x) => q + x.amount, 0)),
              p: idrT(tot.paid),
            })}{' '}
            {disc > 0 && plural(disc, '{n} discrepancy is open.', '{n} discrepancies are open.')}
          </Note>
          <SectionHeading as="h2" count={owedRows.length}>
            {t('Still owed at period end')}
          </SectionHeading>
          {owedRows.length ? (
            <Rows>
              {owedRows.map((r) => (
                <Link key={r.id} to={`/fnl-requests/${r.id}`} className="block">
                  <Row className="gap-2.5">
                    <RowText
                      title={<b>{r.purpose}</b>}
                      sub={t('Approved {a}, paid {p}', { a: idrT(r.approved ?? 0), p: idrT(netPaid(db, r)) })}
                    />
                    <Money n={owed(db, r)} />
                    <Chip def={FST[r.state]} />
                  </Row>
                </Link>
              ))}
            </Rows>
          ) : (
            <Note>{t('Nothing owed.')}</Note>
          )}
        </>
      )}
      <SectionHeading as="h2" count={p.snapshots.length}>
        {t('Snapshots')}
      </SectionHeading>
      {p.snapshots.length ? <SnapshotRows p={p} /> : <Note>{t('No snapshot yet.')}</Note>}
      {!board && grant(db, 'period', m?.id) && (
        <>
          <Acts>
            {p.state !== 'closed' ? (
              <>
                <Button
                  variant="primary"
                  disabled={unchecked > 0}
                  onClick={() => {
                    void saveSnapshot(p.id);
                  }}
                >
                  {t('Save snapshot')}
                </Button>
                {last && (
                  <Button
                    disabled={unchecked > 0 || drift}
                    onClick={() => {
                      void closePeriod(p.id);
                    }}
                  >
                    {t('Close period')}
                  </Button>
                )}
              </>
            ) : (
              drift && (
                <Button
                  variant="primary"
                  onClick={() => {
                    void saveSnapshot(p.id);
                  }}
                >
                  {t('Save a new snapshot after the correction')}
                </Button>
              )
            )}
          </Acts>
          {unchecked > 0 && (
            <Note>
              {plural(
                unchecked,
                '{n} row is not checked yet. Every row needs a result before a snapshot.',
                '{n} rows are not checked yet. Every row needs a result before a snapshot.',
              )}
            </Note>
          )}
          {!revw && <Note>{t('You prepared this period; the reviewer should be someone else (proposed).')}</Note>}
        </>
      )}
      <SectionHeading as="h2" count={open}>
        {t('Unresolved actions')}
      </SectionHeading>
      {p.unresolved.length ? (
        <Rows>
          {p.unresolved.map((u) => (
            <Row key={u.id} className="cursor-default gap-2.5">
              <RowText
                title={<b>{u.text}</b>}
                sub={t('Owner {who}, due {d}', { who: who.first(u.owner), d: u.due ? dShort(u.due) : t('Not set') })}
              />
              <Chip def={u.state === 'open' ? ['Open', 'circle', 'warn'] : ['Done', 'check', 'green']} pill="pill" />
              {u.state === 'open' && !board && (u.owner === m?.id || grant(db, 'period', m?.id)) && (
                <Button
                  small
                  onClick={() => {
                    void markActionDone(p.id, u.id);
                  }}
                >
                  {t('Mark done')}
                </Button>
              )}
            </Row>
          ))}
        </Rows>
      ) : (
        <Note>{t('None.')}</Note>
      )}
    </Page>
  );
}

export function PeriodsPage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  useDivisionWorkspace(FNL);
  if (!fnlFull(m) && !isBoardP(m)) return <Unavailable />;
  if (route.id) {
    const p = prOf(db, route.id);
    return p ? <PeriodPage p={p} /> : <Unavailable />;
  }
  const s = fnlOf(db);
  const proj = projOf(db, 'p-close');
  return (
    <Page wide>
      <PageHeader
        title={t('Period reviews')}
        sub={t(
          'Each month: allocations, commitments, payments, what is still owed and missing evidence. Closed reviews keep their snapshot; a later correction makes a new one.',
        )}
      />
      <Tbl
        head={
          <>
            <Th>{t('Period')}</Th>
            <Th>{t('Prepared by')}</Th>
            <Th>{t('Reviewer')}</Th>
            <Th>{t('Latest snapshot')}</Th>
            <Th num>{t('Open actions')}</Th>
            <Th>{t('Bank')}</Th>
            <Th>{t('State')}</Th>
          </>
        }
      >
        {[...s.periods].reverse().map((p) => {
          const sn = p.snapshots.at(-1);
          return (
            <LinkRow key={p.id} to={`period-reviews/${p.id}`}>
              <Td>
                <b>{p.name}</b>
                <small className="block text-mute">
                  {dShort(p.from)} – {dShort(p.to)}
                </small>
              </Td>
              <Td>
                <Who id={p.preparedBy} />
              </Td>
              <Td>
                <Who id={p.reviewer} />
              </Td>
              <Td>
                {sn ? (
                  <>
                    {t('Snapshot {v}', { v: sn.v })} <small className="text-mute">{fmtDT(sn.at)}</small>
                  </>
                ) : (
                  <span className="text-mute">{t('None yet')}</span>
                )}
              </Td>
              <Td num>{p.unresolved.filter((u) => u.state === 'open').length}</Td>
              <Td>
                <Chip
                  def={
                    p.bank === 'done' ? ['Bank compared', 'check', 'green'] : ['Bank not compared', 'warning', 'warn']
                  }
                />
              </Td>
              <Td>
                <Chip def={PST[p.state]} pill="pill" />
              </Td>
            </LinkRow>
          );
        })}
      </Tbl>
      <Hint>
        {t('The September close also runs as the project {p}.', { p: proj?.name ?? '' })}{' '}
        <Link to="/projects/p-close">{t('Open project')}</Link>
      </Hint>
      <GrantsBox grants={s.grants} keys={['periodPrep', 'period']} />
    </Page>
  );
}
