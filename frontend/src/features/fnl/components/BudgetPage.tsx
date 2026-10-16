/* Budget & transactions: approved allocations, commitments and recorded payments in whole rupiah (the app records money, it
   never moves it); the Board sees approved totals by division only. From divisions/div-fnl-mcit.js budgetPage
   (finance_budget, finance_comparisons). */
import { Link } from 'react-router';
import { DivCrumb, Hint, Chip, Tag } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { DIVS } from '@/app/config/org';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { t } from '@/lib/i18n';
import { openPanel } from '@/lib/open';
import { dShort } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { projOf } from '@/features/work/services/selectors';
import {
  AST,
  FNL,
  TERM,
  alStats,
  fnlFull,
  fnlOf,
  frOf,
  grant,
  idrT,
  isBoardP,
  unitName,
  type Allocation,
} from '../services/fnl-data';
import { exportBudget } from '../services/finance';
import { Ledger, LinkOut, GrantsBox, Money, Note, Who } from './fnl-parts';
import { LinkRow, Tbl, Td, Th } from './fnl-table';

export const BudgetCrumb = () => <DivCrumb d={FNL} parts={[['budget', t('Budget & transactions')]]} />;

function Summary({ tot }: { tot: { alloc: number; c: number; p: number } }) {
  const pct = (n: number) => (tot.alloc ? Math.max(0, Math.min(100, (n / tot.alloc) * 100)).toFixed(1) : '0');
  return (
    <div className="mt-[18px] mb-1.5 rounded-sheet bg-surface shadow-sheet">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <b>{t('Term {t}, approved allocations', { t: TERM })}</b>
        <Money n={tot.alloc} />
      </div>
      <Ledger
        className="mt-3 mb-0"
        items={[
          [t('Paid (recorded)'), <Money n={tot.p} />],
          [t('Committed, not paid'), <Money n={tot.c - tot.p} />],
          [t('Approved commitments'), <Money n={tot.c} />],
          [t('Remaining'), <Money n={tot.alloc - tot.c} />],
        ]}
      />
      <SplitBar
        paid={pct(tot.p)}
        com={pct(tot.c - tot.p)}
        label={t('Paid {p}, committed not paid {c}, of {a}', {
          p: idrT(tot.p),
          c: idrT(tot.c - tot.p),
          a: idrT(tot.alloc),
        })}
        className="mt-2.5"
      />
      <p className="mt-2.5 mb-0 text-mute type-small">
        {t(
          'Committed = approved amounts of approved and paid requests. Paid = recorded payments and corrections. Remaining = allocation minus committed. Proposed basis; POL confirms.',
        )}
      </p>
    </div>
  );
}

/** Paid, then committed-but-unpaid, as a share of the allocation (.split). */
export const SplitBar = ({
  paid,
  com,
  label,
  className,
}: {
  paid: string | number;
  com: string | number;
  label?: string;
  className?: string;
}) => (
  <div
    className={cn('flex h-1.5 overflow-hidden rounded-[3px] bg-fill', className)}
    role={label ? 'img' : undefined}
    aria-label={label}
  >
    <i className="block bg-ink" style={{ width: `${String(paid)}%` }} />
    <i className="block bg-faint" style={{ width: `${String(com)}%` }} />
  </div>
);

function BoardView({ ok, tot }: { ok: Allocation[]; tot: { alloc: number; c: number; p: number } }) {
  const db = useWorkspace((w) => w);
  return (
    <Page wide>
      <PageHeader
        title={t('Budget & transactions')}
        sub={t('Board view: approved totals by division. Requests, payees and evidence stay with FnL.')}
      />
      <Summary tot={tot} />
      <Tbl
        head={
          <>
            <Th>{t('Division')}</Th>
            <Th num>{t('Allocated')}</Th>
            <Th num>{t('Committed')}</Th>
            <Th num>{t('Paid')}</Th>
          </>
        }
      >
        {DIVS.map((d) => {
          const a = ok.filter((x) => x.unit === d.id);
          const s = a.reduce(
            (q, x) => {
              const st = alStats(db, x);
              return { a: q.a + x.amount, c: q.c + st.committed, p: q.p + st.paid };
            },
            { a: 0, c: 0, p: 0 },
          );
          return (
            <tr key={d.id}>
              <Td>
                <b>{d.name}</b>
              </Td>
              {a.length ? (
                <>
                  <Td num>
                    <Money n={s.a} />
                  </Td>
                  <Td num>
                    <Money n={s.c} />
                  </Td>
                  <Td num>
                    <Money n={s.p} />
                  </Td>
                </>
              ) : (
                <Td colSpan={3}>
                  <Tag unknown>{t('No allocation recorded')}</Tag>
                </Td>
              )}
            </tr>
          );
        })}
      </Tbl>
    </Page>
  );
}

function AllocRow({ a }: { a: Allocation }) {
  const db = useWorkspace((w) => w);
  const insp = useUi((u) => u.insp);
  const st = alStats(db, a);
  const w = a.amount ? Math.min(100, (st.paid / a.amount) * 100) : 0;
  const wc = a.amount ? Math.min(100 - w, ((st.committed - st.paid) / a.amount) * 100) : 0;
  const approved = a.state === 'approved';
  const open = () => {
    openPanel('fm-alloc', a.id);
  };
  return (
    <tr
      className={cn('cursor-pointer', insp?.id === a.id && 'sel')}
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter') open();
      }}
    >
      <Td>
        <b>
          {unitName(a.unit)} · {t(a.category)}
        </b>
        <small className="block text-mute">{a.project ? (projOf(db, a.project)?.name ?? '') : t('Whole unit')}</small>
      </Td>
      <Td num>
        <Money n={a.amount} />
      </Td>
      <Td num>{approved ? <Money n={st.committed} /> : '–'}</Td>
      <Td num>{approved ? <Money n={st.paid} /> : '–'}</Td>
      <Td num>{approved ? <Money n={st.outstanding} /> : '–'}</Td>
      <Td num>
        {approved ? (
          <>
            <Money n={st.remaining} neg={(st.remaining ?? 0) < 0} />
            <SplitBar paid={w} com={wc} className="mt-1.5 h-1 w-full min-w-[90px]" />
          </>
        ) : (
          '–'
        )}
      </Td>
      <Td>
        <Chip def={AST[a.state]} pill="pill" />
        {(st.remaining ?? 0) < 0 && (
          <Tag tone="danger" className="ml-1">
            {t('Deficit')}
          </Tag>
        )}
      </Td>
    </tr>
  );
}

export function BudgetPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  useDivisionWorkspace(FNL);
  if (!fnlFull(m) && !isBoardP(m)) {
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  }
  const s = fnlOf(db);
  const als = s.allocations.filter((a) => a.term === TERM);
  const ok = als.filter((a) => a.state === 'approved');
  const tot = ok.reduce(
    (q, a) => {
      const st = alStats(db, a);
      return { alloc: q.alloc + a.amount, c: q.c + st.committed, p: q.p + st.paid };
    },
    { alloc: 0, c: 0, p: 0 },
  );
  if (isBoardP(m)) return <BoardView ok={ok} tot={tot} />;
  const missing = DIVS.filter((d) => !ok.some((a) => a.unit === d.id));
  const txs = [...s.payments].sort((a, b) => b.date.localeCompare(a.date) || b.at.localeCompare(a.at));
  const inc = s.incoming;
  const incE = inc.reduce((q, x) => q + x.expected, 0);
  const incR = inc.reduce((q, x) => q + x.receipts.reduce((r, p) => r + p.amount, 0), 0);
  return (
    <Page wide>
      <PageHeader
        title={t('Budget & transactions')}
        sub={t(
          'Approved allocations, commitments and recorded payments in whole rupiah. The app records money; it never moves it.',
        )}
      >
        <Button
          onClick={() => {
            void exportBudget();
          }}
        >
          <Icon name="download" />
          {t('Export CSV')}
        </Button>
        {grant(db, 'allocate', m?.id) && (
          <Button
            variant="primary"
            onClick={() => {
              openPanel('fm-alloc-new', 'new');
            }}
          >
            <Icon name="plus" />
            {t('Propose allocation')}
          </Button>
        )}
      </PageHeader>
      <Summary tot={tot} />
      <SectionHeading as="h2" count={als.length}>
        {t('Allocations')}
      </SectionHeading>
      <Tbl
        head={
          <>
            <Th>{t('Budget line')}</Th>
            <Th num>{t('Allocated')}</Th>
            <Th num>{t('Committed')}</Th>
            <Th num>{t('Paid')}</Th>
            <Th num>{t('Outstanding')}</Th>
            <Th num>{t('Remaining')}</Th>
            <Th>{t('State')}</Th>
          </>
        }
      >
        {als.map((a) => (
          <AllocRow key={a.id} a={a} />
        ))}
        {missing.map((d) => (
          <tr key={d.id}>
            <Td>
              <b>{d.short}</b>
              <small className="block text-mute">{t('Whole unit')}</small>
            </Td>
            <Td colSpan={5}>
              <Tag unknown>{t('No allocation recorded')}</Tag>{' '}
              <small className="text-mute">
                {t('Unknown, not zero. Requests for this unit cannot be approved against a budget line.')}
              </small>
            </Td>
            <Td />
          </tr>
        ))}
      </Tbl>
      <SectionHeading as="h2" count={txs.length}>
        {t('Recorded transactions')}
      </SectionHeading>
      <Tbl
        head={
          <>
            <Th>{t('Date')}</Th>
            <Th>{t('Request')}</Th>
            <Th>{t('Reference')}</Th>
            <Th>{t('Evidence')}</Th>
            <Th>{t('Recorded by')}</Th>
            <Th num>{t('Amount')}</Th>
          </>
        }
      >
        {txs.map((p) => {
          const r = frOf(db, p.req);
          return (
            <LinkRow key={p.id} to={`fnl-requests/${p.req}`}>
              <Td className="type-num">{dShort(p.date)}</Td>
              <Td>
                <b>{r ? r.purpose : p.req}</b>
                <small className="block text-mute">
                  {p.kind === 'correction' ? t('Correction to {r}', { r: p.of ?? '' }) : p.id}
                </small>
              </Td>
              <Td>{p.ref}</Td>
              <Td>
                {p.evidence ? (
                  <LinkOut label={t('Evidence')} url={p.evidence} />
                ) : (
                  <Tag tone="warn">{t('Evidence missing')}</Tag>
                )}
              </Td>
              <Td>
                <Who id={p.by} />
              </Td>
              <Td num>
                <Money n={p.amount} />
              </Td>
            </LinkRow>
          );
        })}
      </Tbl>
      <Hint>
        {t('Totals: {n} rows, {s}. Each row links to its request; corrections point at the payment they change.', {
          n: txs.length,
          s: idrT(txs.reduce((q, p) => q + p.amount, 0)),
        })}
      </Hint>
      <SectionHeading as="h2" count={inc.length}>
        {t('Incoming, separate basis')}
      </SectionHeading>
      <Ledger
        items={[
          [t('Expected from clients'), <Money n={incE} />],
          [t('Received (recorded)'), <Money n={incR} />],
          [t('Outstanding'), <Money n={incE - incR} />],
        ]}
      />
      <Note>
        {t('Never added to the allocations or the spending above.')}{' '}
        <Link to="/fnl-requests">{t('Open incoming terms')}</Link>
      </Note>
      <GrantsBox grants={s.grants} keys={['allocate', 'budget', 'finReview', 'pay']} />
    </Page>
  );
}
