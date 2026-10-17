/* One incoming client term: expected income on its own basis, the legal gate, the handoff from Legal, the invoice issued outside
   the app and the receipts. Optional until adopted. From divisions/div-fnl-mcit.js incomingPage and handoffCard. */
import { useState } from 'react';
import { Link } from 'react-router';
import { Chip, Tag } from '@/components/shared/division-ui';
import { Button, buttonClass } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { Steps } from '@/components/ui/Steps';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { addDays, dShort, fmtD, today } from '@/lib/time';
import { useWho } from '@/lib/people';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { projOf } from '@/features/work/services/selectors';
import {
  FNL,
  IST,
  fmtN,
  fnlFull,
  gateOf,
  grant,
  idrT,
  invOf,
  lrOf,
  isFutureDate,
  okDate,
  parseIdr,
  safeUrl,
  type IncomingTerm,
} from '../services/fnl-data';
import type { StateDef } from '@/features/external/services/ee-data';
import { acceptGate, recordInvoice, recordReceipt, returnGate } from '../services/finance';
import { GateChecks, GateChip } from './GateChecks';
import { Acts, Box, ByAt, HistoryList, Ledger, LinkOut, Money, Note, Who, useFieldErrors } from './fnl-parts';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);
const openForm = (f: string) => () => {
  setUi((u) => {
    u.form = f;
  });
};
const closeForm = () => {
  setUi((u) => {
    u.form = null;
  });
};

type HandoffState = 'requested' | 'accepted' | 'returned' | 'fulfilled';
const HO_ST: Record<HandoffState, StateDef> = {
  requested: ['Requested', 'upload', 'warn'],
  accepted: ['Accepted', 'check', 'green'],
  returned: ['Returned', 'undo', 'warn'],
  fulfilled: ['Fulfilled', 'check', 'green'],
};
const HO_IDX: Record<HandoffState, number> = { requested: 1, accepted: 2, returned: 1, fulfilled: 3 };

/** Legal's handoff to Finance: who sent what, who must answer, and where it stands. Shown on the BAST and on the incoming term. */
export function HandoffCard({ inv }: { inv: IncomingTerm }) {
  const m = useMe();
  const h = inv.handoff;
  if (!h) return null;
  const st: HandoffState =
    inv.state === 'returned'
      ? 'returned'
      : ['partial', 'received'].includes(inv.state)
        ? 'fulfilled'
        : ['accepted', 'invoiced'].includes(inv.state)
          ? 'accepted'
          : 'requested';
  return (
    <div className="mt-3 max-w-[760px] rounded-sheet bg-surface p-4 shadow-sheet">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <b>{t('Ready for invoice: {t}', { t: inv.title })}</b>
        <Chip def={HO_ST[st]} pill="pill" />
      </div>
      <div className="mt-3.5 grid grid-cols-[1fr_28px_1fr] items-center gap-2 max-[600px]:grid-cols-1">
        <div className="rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13">
          <small className="block text-d13 text-mute">{t('From FnL Legal')}</small>
          <Who id={h.from} />
          <small className="block text-d13 text-mute">
            {t('BAST v{v} and PKS v{p}', { v: h.version ?? '', p: h.pksVersion ?? '' })}
          </small>
        </div>
        <Icon name="right" className="justify-self-center text-mute max-[600px]:rotate-90" />
        <div className="rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13">
          <small className="block text-d13 text-mute">{t('To FnL Finance')}</small>
          <Who id={h.to} />
          <small className="block text-d13 text-mute">
            {h.acceptedAt
              ? t('Accepted {d}', { d: fmtD(h.acceptedAt.slice(0, 10)) })
              : h.returnNote
                ? t('Returned')
                : t('Not answered yet')}
          </small>
        </div>
      </div>
      <Meta className="my-3 grid-cols-[140px_1fr] max-[600px]:grid-cols-[112px_1fr]">
        <MetaRow label={t('Requested by')}>
          <span className="type-num">{fmtD(h.neededBy)}</span>
        </MetaRow>
        <MetaRow label={t('Agreed date')}>
          {h.agreedDate ? (
            <span className="type-num">{fmtD(h.agreedDate)}</span>
          ) : (
            <span className="text-mute">{t('Not agreed yet')}</span>
          )}
        </MetaRow>
        {h.returnNote && (
          <MetaRow label={t('Returned because')}>
            <span className="whitespace-pre-line">{h.returnNote}</span>
          </MetaRow>
        )}
        {h.exception && <MetaRow label={t('Exception')}>{h.exception}</MetaRow>}
      </Meta>
      <Steps labels={[t('Draft'), t('Requested'), t('Accepted'), t('Fulfilled')]} current={HO_IDX[st]} />
      {fnlFull(m) && (
        <Link className={buttonClass('default', true, 'mt-3')} to={`/fnl-requests/${inv.id}`}>
          {t('Open the incoming term')}
        </Link>
      )}
    </div>
  );
}

function ReturnForm({ id }: { id: string }) {
  const [v, setV] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field
        label={t('What is missing')}
        htmlFor="fm-ir-why"
        required
        help={fe.help('v', t('Goes back to the Legal owner.'))}
        error={fe.bad('v')}
      >
        <textarea
          id="fm-ir-why"
          className={cn(textareaClass, 'min-h-16', fe.bad('v') && invalidClass)}
          value={v}
          autoFocus
          onChange={(e) => {
            setV(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!v.trim()) return fe.fail('v', t('Say what is missing.'));
            void returnGate(id, v.trim());
          }}
        >
          {t('Return to Legal')}
        </Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

function AcceptBlock({ x }: { x: IncomingTerm }) {
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const [agreed, setAgreed] = useState(x.handoff?.neededBy ?? '');
  const fe = useFieldErrors();
  if (!x.handoff || x.state !== 'requested') return null;
  if (x.handoff.to !== m?.id)
    return (
      <Note>
        {t('Waiting for {who} to accept or return it. Silence never accepts.', { who: who.first(x.handoff.to) })}
      </Note>
    );
  if (form === 'i-return') return <ReturnForm id={x.id} />;
  return (
    <>
      <Grid2>
        <Field label={t('Agreed date')} htmlFor="fm-ia-date" help={fe.help('d')} error={fe.bad('d')}>
          <DateField
            id="fm-ia-date"
            value={agreed}
            onChange={(v) => {
              setAgreed(v);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            void acceptGate(x.id, okDate(agreed) ? agreed : null);
          }}
        >
          {t('Accept handoff')}
        </Button>
        <Button onClick={openForm('i-return')}>{t('Return for information')}</Button>
      </Acts>
    </>
  );
}

function InvoiceForm({ id }: { id: string }) {
  const [ref, setRef] = useState('');
  const [url, setUrl] = useState('');
  const [on, setOn] = useState(today());
  const [due, setDue] = useState(addDays(today(), 14));
  const fe = useFieldErrors();
  return (
    <Box>
      <Grid2>
        <Field label={t('Invoice reference')} htmlFor="fm-iv-ref" required help={fe.help('ref')} error={fe.bad('ref')}>
          <input
            id="fm-iv-ref"
            className={cn(inputClass, fe.bad('ref') && invalidClass)}
            value={ref}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setRef(e.target.value);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Link')} htmlFor="fm-iv-url" help={fe.help('url')} error={fe.bad('url')}>
          <input
            id="fm-iv-url"
            className={cn(inputClass, fe.bad('url') && invalidClass)}
            placeholder="https://"
            value={url}
            autoComplete="off"
            onChange={(e) => {
              setUrl(e.target.value);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <Grid2>
        <Field label={t('Issued on')} htmlFor="fm-iv-on" required help={fe.help('on')} error={fe.bad('on')}>
          <DateField
            id="fm-iv-on"
            value={on}
            max={today()}
            onChange={(v) => {
              setOn(v);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Due')} htmlFor="fm-iv-due" help={fe.help('due')} error={fe.bad('due')}>
          <DateField
            id="fm-iv-due"
            value={due}
            onChange={(v) => {
              setDue(v);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!ref.trim()) return fe.fail('ref', t('Give the invoice reference.'));
            if (url.trim() && !safeUrl(url.trim())) return fe.fail('url', t('Paste an https link, or leave it empty.'));
            if (!okDate(on)) return fe.fail('on', t('Give the date it was issued.'));
            if (isFutureDate(on)) return fe.fail('on', t('Use the date it was actually issued.'));
            void recordInvoice(id, { ref: ref.trim(), url: url.trim(), on, due: okDate(due) ? due : null });
          }}
        >
          {t('Record invoice')}
        </Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
      <Note>{t('Issue the invoice outside the app first. This records that it was issued.')}</Note>
    </Box>
  );
}

function ReceiptForm({ x, left }: { x: IncomingTerm; left: number }) {
  const [amt, setAmt] = useState(fmtN(left));
  const [date, setDate] = useState(today());
  const [ref, setRef] = useState('');
  const [ev, setEv] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Grid2>
        <Field
          label={t('Amount received (Rp)')}
          htmlFor="fm-rc-amt"
          required
          help={fe.help('amt', t('At most {o}.', { o: idrT(left) }))}
          error={fe.bad('amt')}
        >
          <input
            id="fm-rc-amt"
            className={cn(inputClass, fe.bad('amt') && invalidClass)}
            inputMode="numeric"
            value={amt}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setAmt(e.target.value);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Received on')} htmlFor="fm-rc-date" required help={fe.help('date')} error={fe.bad('date')}>
          <DateField
            id="fm-rc-date"
            value={date}
            max={today()}
            onChange={(v) => {
              setDate(v);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <Grid2>
        <Field label={t('Reference')} htmlFor="fm-rc-ref" required help={fe.help('ref')} error={fe.bad('ref')}>
          <input
            id="fm-rc-ref"
            className={cn(inputClass, fe.bad('ref') && invalidClass)}
            value={ref}
            autoComplete="off"
            onChange={(e) => {
              setRef(e.target.value);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Evidence link')} htmlFor="fm-rc-ev" help={fe.help('ev')} error={fe.bad('ev')}>
          <input
            id="fm-rc-ev"
            className={cn(inputClass, fe.bad('ev') && invalidClass)}
            placeholder="https://"
            value={ev}
            autoComplete="off"
            onChange={(e) => {
              setEv(e.target.value);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            const n = parseIdr(amt);
            if (Number.isNaN(n) || n <= 0) return fe.fail('amt', t('Whole rupiah, more than zero.'));
            if (n > left) return fe.fail('amt', t('More than is still expected: {o}.', { o: idrT(left) }));
            if (!okDate(date)) return fe.fail('date', t('Give the date it was received.'));
            if (isFutureDate(date)) return fe.fail('date', t('Use the date the money actually arrived.'));
            if (!ref.trim()) return fe.fail('ref', t('Give the reference.'));
            if (ev.trim() && !safeUrl(ev.trim())) return fe.fail('ev', t('Paste an https link, or leave it empty.'));
            void recordReceipt(x.id, { amount: n, date, ref: ref.trim(), evidence: ev.trim() });
          }}
        >
          {t('Record receipt')}
        </Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </Box>
  );
}

export function IncomingPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  useDivisionWorkspace(FNL);
  const x = invOf(db, id);
  if (!x || !fnlFull(m)) return <Unavailable />;
  const bast = lrOf(db, x.gateFrom);
  const g = bast ? gateOf(db, bast) : null;
  const rec = x.receipts.reduce((s, p) => s + p.amount, 0);
  const recv = grant(db, 'invoice', m?.id) || grant(db, 'pay', m?.id);
  const proj = x.project ? projOf(db, x.project) : undefined;
  const pks = lrOf(db, x.pks);
  const invoiced = ['accepted', 'invoiced', 'partial', 'received'].includes(x.state);
  const left = x.expected - rec;
  return (
    <Page>
      <PageHeader
        title={x.title}
        sub={
          <>
            {x.client}
            {proj && (
              <>
                {' · '}
                <Link to={`/projects/${proj.id}`}>{proj.name}</Link>
              </>
            )}
          </>
        }
      >
        <Chip def={IST[x.state]} pill="pill-o" />
      </PageHeader>
      <Notice icon="info" className="mt-3 mb-3" title={<b>{t('Incoming money, separate basis')}</b>}>
        <p>
          {t(
            'Expected income is not budget and is never added to spending. It counts as received only when a receipt is recorded.',
          )}
        </p>
      </Notice>
      <Ledger
        items={[
          [t('Expected'), <Money n={x.expected} />],
          [t('Received (recorded)'), <Money n={rec} />],
          [t('Outstanding'), <Money n={left} />],
        ]}
      />
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[760px]:grid-cols-1 [&_dd]:min-w-0 [&_dd]:flex-wrap">
        <MetaRow label={t('Created by')}>
          <ByAt id={x.createdBy} at={x.createdAt} />
        </MetaRow>
        <MetaRow label={t('Collector')}>
          <Who id={x.collector} />
        </MetaRow>
        {x.opp && (
          <MetaRow label={t('Opportunity')}>
            <Link to={`/opportunities/${x.opp}`}>{t('EE client opportunity')}</Link>
          </MetaRow>
        )}
        <MetaRow label={t('Agreement')}>{pks ? <Link to={`/fnl-requests/${pks.id}`}>{pks.title}</Link> : '–'}</MetaRow>
      </Meta>
      {bast && g && (
        <>
          <SectionHeading as="h2" action={<GateChip ok={g.ok} exception={!!g.exception} />}>
            {t('Legal gate')}
          </SectionHeading>
          <GateChecks x={bast} />
          <p className="my-2 text-d13">
            <Link to={`/fnl-requests/${bast.id}`}>{t('Open the BAST request')}</Link>
          </p>
          {x.state === 'gate' && (
            <Notice icon="lock" tone="warn" className="mt-3 mb-3" title={<b>{t('Finance cannot invoice yet')}</b>}>
              <p>
                {t(
                  'Legal sends the gate when the PKS and the BAST are signed and delivery is checked. Nothing is invoiced automatically.',
                )}
              </p>
            </Notice>
          )}
        </>
      )}
      {x.handoff && (
        <>
          <SectionHeading as="h2">{t('Handoff from Legal')}</SectionHeading>
          <HandoffCard inv={x} />
          <AcceptBlock x={x} />
        </>
      )}
      {invoiced && (
        <>
          <SectionHeading as="h2">{t('Invoice')}</SectionHeading>
          {x.invoiceRef ? (
            <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[760px]:grid-cols-1 [&_dd]:min-w-0 [&_dd]:flex-wrap">
              <MetaRow label={t('Reference')}>
                <span className="type-num">{x.invoiceRef}</span>
              </MetaRow>
              <MetaRow label={t('Link')}>
                {x.invoiceUrl ? (
                  <LinkOut label={t('Invoice')} url={x.invoiceUrl} />
                ) : (
                  <span className="text-mute">{t('None')}</span>
                )}
              </MetaRow>
              <MetaRow label={t('Issued on')}>{x.issuedOn ? fmtD(x.issuedOn) : ''}</MetaRow>
              <MetaRow label={t('Due')}>
                {x.due ? (
                  <>
                    {fmtD(x.due)}
                    {x.due < today() && rec < x.expected && (
                      <Tag tone="danger" className="ml-1">
                        {t('Overdue')}
                      </Tag>
                    )}
                  </>
                ) : (
                  <span className="text-mute">{t('Not set')}</span>
                )}
              </MetaRow>
              <MetaRow label={t('Collector')}>
                <Who id={x.collector} />
              </MetaRow>
            </Meta>
          ) : recv ? (
            form === 'i-inv' ? (
              <InvoiceForm id={x.id} />
            ) : (
              <Acts>
                <Button variant="primary" onClick={openForm('i-inv')}>
                  <Icon name="file" />
                  {t('Record the invoice issued')}
                </Button>
              </Acts>
            )
          ) : (
            <Note>{t('Not recorded yet.')}</Note>
          )}
        </>
      )}
      {['invoiced', 'partial', 'received'].includes(x.state) && (
        <>
          <SectionHeading as="h2" count={x.receipts.length}>
            {t('Receipts')}
          </SectionHeading>
          {x.receipts.length ? (
            <Rows>
              {x.receipts.map((p) => (
                <Row key={p.id} className="cursor-default gap-2.5">
                  <span className="w-[52px] flex-none text-ink-2 type-num">{dShort(p.date)}</span>
                  <RowText title={<b>{p.ref}</b>} sub={<RecBy id={p.by} />} />
                  {p.evidence ? (
                    <LinkOut label={t('Evidence')} url={p.evidence} />
                  ) : (
                    <Tag tone="warn">{t('Evidence missing')}</Tag>
                  )}
                  <Money n={p.amount} />
                </Row>
              ))}
            </Rows>
          ) : (
            <Note>{t('Nothing received yet. A due date passing never means received.')}</Note>
          )}
          {recv &&
            rec < x.expected &&
            (form === 'i-rec' ? (
              <ReceiptForm x={x} left={left} />
            ) : (
              <Acts>
                <Button variant="primary" onClick={openForm('i-rec')}>
                  {t('Record a receipt')}
                </Button>
              </Acts>
            ))}
        </>
      )}
      <SectionHeading as="h2" count={x.history.length}>
        {t('History')}
      </SectionHeading>
      <HistoryList rows={x.history} />
    </Page>
  );
}

function RecBy({ id }: { id: string }) {
  const who = useWho();
  return <>{t('recorded by {who}', { who: who.name(id) })}</>;
}
