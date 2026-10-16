/* One finance request: the amounts, the budget line it draws on, the review (an independent approver, never the requester),
   payments recorded after they happen outside the app, signed corrections, and the history. From divisions/div-fnl-mcit.js
   financePage (flow-finance-submit, -review, -payment). */
import { useState } from 'react';
import { Link } from 'react-router';
import { Chip, Locked, Tag } from '@/components/shared/division-ui';
import { Button, buttonClass } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Steps } from '@/components/ui/Steps';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openPanel } from '@/lib/open';
import { useWho } from '@/lib/people';
import { dShort, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { projOf } from '@/features/work/services/selectors';
import {
  COMMIT,
  FNL,
  FST,
  FSTEPS,
  FSTEP_I,
  alName,
  alOf,
  alStats,
  canSeeF,
  commit,
  fPriv,
  fmtN,
  fnlOf,
  frOf,
  grant,
  idrT,
  netPaid,
  owed,
  parseIdr,
  paysOf,
  safeUrl,
  unitName,
  okDate,
  type FinanceRequest,
} from '../services/fnl-data';
import {
  approveFinance,
  cancelFinance,
  decideDuplicate,
  recordCorrection,
  recordPayment,
  rejectFinance,
  resubmitFinance,
  returnFinance,
  startReview,
} from '../services/finance';
import {
  Acts,
  Box,
  ByAt,
  HistoryList,
  LinkOut,
  Links,
  Money,
  NeededTag,
  NextBox,
  Note,
  Who,
  fmtDT,
  useFieldErrors,
  Ledger,
} from './fnl-parts';

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
const Cancel = ({ label }: { label?: string }) => (
  <Button variant="ghost" onClick={closeForm}>
    {label ?? t('Cancel')}
  </Button>
);
const TextArea = ({
  id,
  value,
  onChange,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) => (
  <textarea
    id={id}
    className={cn(textareaClass, 'min-h-16', error && invalidClass)}
    value={value}
    autoFocus
    onChange={(e) => {
      onChange(e.target.value);
    }}
  />
);

function ApproveForm({ x }: { x: FinanceRequest }) {
  const [amt, setAmt] = useState(fmtN(x.requested));
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Grid2>
        <Field
          label={t('Approved amount (Rp)')}
          htmlFor="fm-ap-amt"
          required
          help={fe.help(
            'amt',
            t('Can be lower than requested. A higher amount needs a new version from the requester.'),
          )}
          error={fe.bad('amt')}
        >
          <input
            id="fm-ap-amt"
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
        <Field label={t('Note to the requester')} htmlFor="fm-ap-note">
          <input
            id="fm-ap-note"
            className={inputClass}
            value={note}
            autoComplete="off"
            onChange={(e) => {
              setNote(e.target.value);
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
            if (n > x.requested)
              return fe.fail(
                'amt',
                t('More than requested ({r}). Ask for a new version instead.', { r: idrT(x.requested) }),
              );
            void approveFinance(x.id, x.version, n, note.trim());
          }}
        >
          {t('Approve version {v}', { v: x.version })}
        </Button>
        <Cancel />
      </Acts>
      <Note>{t('Approval records a commitment. It is not a payment and moves no money.')}</Note>
    </Box>
  );
}

function WhyForm({ reject, id }: { reject: boolean; id: string }) {
  const [v, setV] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Field
        label={reject ? t('Reason for rejecting') : t('What is missing')}
        htmlFor="fm-rt-why"
        required
        help={fe.help('v')}
        error={fe.bad('v')}
      >
        <TextArea
          id="fm-rt-why"
          value={v}
          error={fe.bad('v')}
          onChange={(s) => {
            setV(s);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant={reject ? 'danger' : 'primary'}
          onClick={() => {
            if (!v.trim()) return fe.fail('v', reject ? t('Give a reason.') : t('Say what is missing.'));
            if (reject) void rejectFinance(id, v.trim());
            else void returnFinance(id, v.trim());
          }}
        >
          {reject ? t('Reject request') : t('Return to requester')}
        </Button>
        <Cancel />
      </Acts>
    </Box>
  );
}

function ReviewSection({ x }: { x: FinanceRequest }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  const open = ['submitted', 'review'].includes(x.state);
  const req = x.requester === m?.id;
  if (!open) return null;
  if (grant(db, 'finReview', m?.id) && req)
    return (
      <Notice icon="lock" className="mt-3 mb-3" title={<b>{t('You requested this')}</b>}>
        <p>{t('Someone else approves it. Self-approval is denied (proposed separation rule).')}</p>
      </Notice>
    );
  if (!grant(db, 'finReview', m?.id)) return null;
  return (
    <>
      <SectionHeading as="h2">{t('Review')}</SectionHeading>
      {x.state === 'submitted' && (
        <Acts>
          <Button
            onClick={() => {
              void startReview(x.id);
            }}
          >
            {t('Start review')}
          </Button>
        </Acts>
      )}
      {form === 'f-approve' ? (
        <ApproveForm x={x} />
      ) : form === 'f-return' || form === 'f-reject' ? (
        <WhyForm reject={form === 'f-reject'} id={x.id} />
      ) : (
        <Acts>
          <Button variant="primary" onClick={openForm('f-approve')}>
            <Icon name="check" />
            {t('Approve')}
          </Button>
          <Button onClick={openForm('f-return')}>{t('Return for information')}</Button>
          <Button variant="ghost" onClick={openForm('f-reject')}>
            {t('Reject')}
          </Button>
        </Acts>
      )}
    </>
  );
}

function EditSection({ x }: { x: FinanceRequest }) {
  const [amt, setAmt] = useState(fmtN(x.requested));
  const [ref, setRef] = useState(x.ref);
  const [ev, setEv] = useState(x.evidence.at(0)?.url ?? '');
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <SectionHeading as="h2">{x.state === 'draft' ? t('Your draft') : t('Answer and submit again')}</SectionHeading>
      {x.state === 'returned' && (
        <Notice icon="undo" tone="warn" className="mt-3 mb-3" title={<b>{t('Returned for information')}</b>}>
          <p>{x.returnNote}</p>
        </Notice>
      )}
      <div className="mt-3 grid max-w-[720px] gap-3.5">
        <Grid2>
          <Field
            label={t('Amount (Rp)')}
            htmlFor="fm-ed-amt"
            required
            help={fe.help('amt', t('Whole rupiah only.'))}
            error={fe.bad('amt')}
          >
            <input
              id="fm-ed-amt"
              className={cn(inputClass, fe.bad('amt') && invalidClass)}
              inputMode="numeric"
              value={amt}
              autoComplete="off"
              onChange={(e) => {
                setAmt(e.target.value);
                fe.clear();
              }}
            />
          </Field>
          <Field label={t('Receipt or quotation number')} htmlFor="fm-ed-ref">
            <input
              id="fm-ed-ref"
              className={inputClass}
              value={ref}
              autoComplete="off"
              onChange={(e) => {
                setRef(e.target.value);
              }}
            />
          </Field>
        </Grid2>
        <Field label={t('Evidence link')} htmlFor="fm-ed-ev" help={fe.help('ev')} error={fe.bad('ev')}>
          <input
            id="fm-ed-ev"
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
        <Field label={t('Note for Finance')} htmlFor="fm-ed-note">
          <textarea
            id="fm-ed-note"
            className={cn(textareaClass, 'min-h-16')}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
            }}
          />
        </Field>
      </div>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            const n = parseIdr(amt);
            if (Number.isNaN(n) || n <= 0) return fe.fail('amt', t('Whole rupiah, more than zero.'));
            if (ev.trim() && !safeUrl(ev.trim())) return fe.fail('ev', t('Paste an https link, or leave it empty.'));
            void resubmitFinance(x.id, { amount: n, ref: ref.trim(), evidence: ev.trim(), note: note.trim() });
          }}
        >
          {x.state === 'draft' ? t('Submit request') : t('Submit version {v}', { v: x.version + 1 })}
        </Button>
      </Acts>
    </>
  );
}

function PayForm({ x }: { x: FinanceRequest }) {
  const db = useWorkspace((w) => w);
  const left = owed(db, x);
  const [amt, setAmt] = useState(fmtN(left));
  const [date, setDate] = useState(today());
  const [ref, setRef] = useState('');
  const [ev, setEv] = useState('');
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Grid2>
        <Field
          label={t('Amount paid (Rp)')}
          htmlFor="fm-py-amt"
          required
          help={fe.help('amt', t('At most {o}, the amount still owed.', { o: idrT(left) }))}
          error={fe.bad('amt')}
        >
          <input
            id="fm-py-amt"
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
        <Field label={t('Paid on')} htmlFor="fm-py-date" required help={fe.help('date')} error={fe.bad('date')}>
          <DateField
            id="fm-py-date"
            value={date}
            onChange={(v) => {
              setDate(v);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <Grid2>
        <Field
          label={t('Transfer or receipt reference')}
          htmlFor="fm-py-ref"
          required
          help={fe.help('ref', t('The same reference twice is refused, so a retry never pays twice.'))}
          error={fe.bad('ref')}
        >
          <input
            id="fm-py-ref"
            className={cn(inputClass, fe.bad('ref') && invalidClass)}
            value={ref}
            autoComplete="off"
            onChange={(e) => {
              setRef(e.target.value);
              fe.clear();
            }}
          />
        </Field>
        <Field
          label={t('Evidence link')}
          htmlFor="fm-py-ev"
          help={fe.help('ev', t('Missing evidence stays flagged until it is added.'))}
          error={fe.bad('ev')}
        >
          <input
            id="fm-py-ev"
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
      <Field label={t('Note')} htmlFor="fm-py-note">
        <input
          id="fm-py-note"
          className={inputClass}
          value={note}
          autoComplete="off"
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            const n = parseIdr(amt);
            if (Number.isNaN(n) || n <= 0) return fe.fail('amt', t('Whole rupiah, more than zero.'));
            if (n > left) return fe.fail('amt', t('More than is still owed: {o}.', { o: idrT(left) }));
            if (!okDate(date)) return fe.fail('date', t('Give the date it was paid.'));
            if (!ref.trim()) return fe.fail('ref', t('Give the transfer or receipt reference.'));
            if (ev.trim() && !safeUrl(ev.trim())) return fe.fail('ev', t('Paste an https link, or leave it empty.'));
            void recordPayment(x.id, { amount: n, date, ref: ref.trim(), evidence: ev.trim(), note: note.trim() });
          }}
        >
          {t('Record payment')}
        </Button>
        <Cancel />
      </Acts>
      <Note>{t('Record a payment only after it was made outside the app.')}</Note>
    </Box>
  );
}

function CorrectionForm({ x }: { x: FinanceRequest }) {
  const db = useWorkspace((w) => w);
  const originals = paysOf(db, x).filter((p) => p.kind === 'payment');
  const [of, setOf] = useState(originals[0]?.id ?? '');
  const [diff, setDiff] = useState('');
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Grid2>
        <Field label={t('Payment to correct')} htmlFor="fm-cr-of" required>
          <SelectField
            id="fm-cr-of"
            value={of}
            onChange={setOf}
            options={originals.map((p) => ({ value: p.id, label: `${p.id} · ${idrT(p.amount)} · ${dShort(p.date)}` }))}
          />
        </Field>
        <Field
          label={t('Difference (Rp)')}
          htmlFor="fm-cr-amt"
          required
          help={fe.help('amt', t('Plus or minus. The original payment stays as it was.'))}
          error={fe.bad('amt')}
        >
          <input
            id="fm-cr-amt"
            className={cn(inputClass, fe.bad('amt') && invalidClass)}
            inputMode="numeric"
            placeholder="+108.000 or −20.000"
            value={diff}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setDiff(e.target.value);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <Field label={t('Reason')} htmlFor="fm-cr-why" required help={fe.help('why')} error={fe.bad('why')}>
        <textarea
          id="fm-cr-why"
          className={cn(textareaClass, 'min-h-16', fe.bad('why') && invalidClass)}
          value={why}
          onChange={(e) => {
            setWhy(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            const raw = diff.trim();
            const sign: 1 | -1 = /^[-−–]/.test(raw) ? -1 : 1;
            const n = parseIdr(raw.replace(/^[-−–+]\s*/, ''));
            if (Number.isNaN(n) || n === 0) return fe.fail('amt', t('Whole rupiah, plus or minus, not zero.'));
            if (!why.trim()) return fe.fail('why', t('Say why the payment changes.'));
            void recordCorrection(x.id, { of, sign, amount: n, why: why.trim() });
          }}
        >
          {t('Record correction')}
        </Button>
        <Cancel />
      </Acts>
    </Box>
  );
}

function PaymentsSection({ x, priv }: { x: FinanceRequest; priv: boolean }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  if (!COMMIT.includes(x.state)) return null;
  const pays = paysOf(db, x);
  const canPay = grant(db, 'pay', m?.id) && ['approved', 'partial'].includes(x.state);
  return (
    <>
      <SectionHeading as="h2" count={pays.length}>
        {t('Payments')}
      </SectionHeading>
      {pays.length ? (
        <Rows>
          {pays.map((p) => (
            <Row key={p.id} className="cursor-default gap-2.5">
              <span className="w-[52px] flex-none text-ink-2 type-num">{dShort(p.date)}</span>
              <RowText
                className="whitespace-normal"
                title={
                  <b>
                    {p.kind === 'correction'
                      ? t('Correction to {r}', { r: p.of ?? '' })
                      : t('Payment {id}', { id: p.id })}
                  </b>
                }
                sub={`${priv ? p.ref : ''}${p.note ? ` · ${p.note}` : ''} · ${t('recorded by {who}', { who: who.name(p.by) })}, ${fmtDT(p.at)}`}
              />
              {priv &&
                (p.evidence ? (
                  <LinkOut label={t('Evidence')} url={p.evidence} />
                ) : (
                  <Tag tone="warn">{t('Evidence missing')}</Tag>
                ))}
              <Money n={p.amount} />
            </Row>
          ))}
        </Rows>
      ) : (
        <Note>{t('No payment recorded. Approved is not paid.')}</Note>
      )}
      {canPay &&
        (form === 'f-pay' ? (
          <PayForm x={x} />
        ) : (
          <Acts>
            <Button variant="primary" onClick={openForm('f-pay')}>
              <Icon name="wallet" />
              {t('Record payment')}
            </Button>
          </Acts>
        ))}
      {grant(db, 'pay', m?.id) &&
        pays.some((p) => p.kind === 'payment') &&
        x.state !== 'reconciled' &&
        (form === 'f-corr' ? (
          <CorrectionForm x={x} />
        ) : (
          <Acts>
            <Button variant="ghost" onClick={openForm('f-corr')}>
              {t('Record a correction')}
            </Button>
          </Acts>
        ))}
    </>
  );
}

function DuplicateBox({ x }: { x: FinanceRequest }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const dup = x.dup ? frOf(db, x.dup.of) : undefined;
  if (!x.dup || !dup) return null;
  if (x.dup.state !== 'flagged')
    return (
      <p className="my-2 text-mute type-small">
        {x.dup.state === 'cleared'
          ? t('Checked: not a duplicate of {r} ({who}).', { r: dup.purpose, who: who.name(x.dup.by) })
          : t('Canceled as a duplicate of {r}.', { r: dup.purpose })}
      </p>
    );
  return (
    <Notice
      icon="warning"
      tone="warn"
      className="mt-3 mb-3"
      title={<b>{t('Possible duplicate')}</b>}
      actions={
        <>
          <Link className={buttonClass('default', true)} to={`/fnl-requests/${dup.id}`}>
            {t('Compare')}
          </Link>
          <DupActs id={x.id} />
        </>
      }
    >
      <p>
        {t('Same amount and reference as {r}. Nothing is deleted; a finance reviewer decides.', { r: dup.purpose })}
      </p>
    </Notice>
  );
}

function DupActs({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  if (!grant(db, 'finReview', m?.id)) return null;
  return (
    <>
      <Button
        small
        onClick={() => {
          void decideDuplicate(id, 'cleared');
        }}
      >
        {t('Not a duplicate')}
      </Button>
      <Button
        small
        variant="danger"
        onClick={() => {
          void decideDuplicate(id, 'confirmed');
        }}
      >
        {t('Same claim: cancel this one')}
      </Button>
    </>
  );
}

export function FinancePage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  useDivisionWorkspace(FNL);
  const x = frOf(db, id);
  if (!x || !canSeeF(x, m)) return <Unavailable />;
  const s = fnlOf(db);
  const req = x.requester === m?.id;
  const al = alOf(db, x.alloc);
  const st = al ? alStats(db, al) : null;
  const priv = fPriv(db, x, m);
  const paid = netPaid(db, x);
  const open = ['submitted', 'review'].includes(x.state);
  const payer = s.grants.pay[0];
  const next: [string | null, string] = (
    {
      draft: [x.requester, t('Submit when the amount, budget line and evidence are ready.')],
      submitted: [null, t('An independent approver in Finance reviews it.')],
      review: [
        x.reviewing?.by ?? null,
        t('{who} is reviewing it.', { who: db.people.find((p) => p.id === x.reviewing?.by)?.name.split(' ')[0] ?? '' }),
      ],
      returned: [x.requester, t('Add what Finance asked for and submit again. A changed amount needs a new review.')],
      approved: [payer ?? null, t('Approved, not paid. Finance records the payment after it is made outside the app.')],
      partial: [payer ?? null, t('Partly paid. {o} is still owed.', { o: idrT(owed(db, x)) })],
      paid: [s.grants.period[0] ?? null, t('Paid in full. The period review checks it against the evidence.')],
      reconciled: [null, t('Reconciled in a period review.')],
      rejected: [null, t('Rejected. The history stays.')],
      cancelled: [null, t('Canceled. The history stays.')],
    } satisfies Record<FinanceRequest['state'], [string | null, string]>
  )[x.state];
  const stepIdx = FSTEP_I[x.state];
  const proj = x.project ? projOf(db, x.project) : undefined;
  const cancelable = req && ['draft', 'submitted', 'returned'].includes(x.state);
  return (
    <Page>
      <PageHeader title={x.purpose} sub={`${alName(db, al)} · ${t('Version {v}', { v: x.version })}`}>
        <Chip def={FST[x.state]} pill="pill-o" />
      </PageHeader>
      {stepIdx != null && (
        <Steps
          className="mt-4 mb-1.5 max-w-[760px]"
          labels={FSTEPS.map((l) => t(l))}
          current={Math.min(stepIdx, 4) + (x.state === 'reconciled' ? 1 : 0)}
        />
      )}
      <NextBox who={next[0]} text={next[1]} />
      {['rejected', 'cancelled'].includes(x.state) && x.reason && (
        <Notice
          icon="close"
          tone={x.state === 'rejected' ? 'error' : undefined}
          className="mt-3 mb-3"
          title={<b>{t(FST[x.state][0])}</b>}
        >
          <p>{x.reason}</p>
        </Notice>
      )}
      <DuplicateBox x={x} />
      <Ledger
        items={[
          [t('Requested'), <Money n={x.requested} />],
          [
            t('Approved'),
            x.approved != null && COMMIT.includes(x.state) ? (
              <Money n={x.approved} />
            ) : (
              <span className="text-mute">{t('Not approved')}</span>
            ),
          ],
          [t('Paid (recorded)'), <Money n={paid} />],
          [t('Outstanding'), commit(x) ? <Money n={owed(db, x)} /> : <span className="text-mute">–</span>],
        ]}
      />
      {al && st && (open || x.state === 'approved') && (
        <Box>
          <b>
            {t('Budget line')}: {alName(db, al)}
          </b>
          <Ledger
            items={[
              [
                t('Allocated'),
                al.state === 'approved' ? (
                  <Money n={al.amount} />
                ) : (
                  <span className="text-mute">{t('Not approved')}</span>
                ),
              ],
              [t('Committed'), <Money n={st.committed} />],
              [t('Remaining'), st.remaining == null ? '–' : <Money n={st.remaining} />],
              [
                t('Remaining if approved'),
                open && st.remaining != null ? <Money n={st.remaining - x.requested} /> : '–',
              ],
            ]}
          />
        </Box>
      )}
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[760px]:grid-cols-1 [&_dd]:min-w-0 [&_dd]:flex-wrap">
        <MetaRow label={t('Created by')}>
          <ByAt id={x.createdBy} at={x.createdAt} />
        </MetaRow>
        <MetaRow label={t('Requester')}>
          <Who id={x.requester} />
        </MetaRow>
        <MetaRow label={t('Unit')}>{unitName(x.unit)}</MetaRow>
        {x.project && (
          <MetaRow label={t('Project')}>
            {proj ? (
              <Link to={`/projects/${proj.id}`}>{proj.name}</Link>
            ) : (
              <span className="text-mute">{t('Removed project')}</span>
            )}
          </MetaRow>
        )}
        <MetaRow label={t('Budget line')}>
          {al ? (
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-left text-d13h text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
              onClick={() => {
                openPanel('fm-alloc', al.id);
              }}
            >
              {alName(db, al)}
            </button>
          ) : (
            <Tag unknown>{t('No allocation')}</Tag>
          )}
        </MetaRow>
        <MetaRow label={t('Category')}>{t(x.category)}</MetaRow>
        <MetaRow label={t('Needed by')}>
          <NeededTag d={x.neededBy} />
        </MetaRow>
        <MetaRow label={t('Payee')}>{priv ? x.payee || t('Not given') : <Locked>{t('Restricted')}</Locked>}</MetaRow>
        <MetaRow label={t('Method')}>{priv ? t(x.method) : <Locked>{t('Restricted')}</Locked>}</MetaRow>
        <MetaRow label={t('Reference')}>{priv ? x.ref || t('Not given') : <Locked>{t('Restricted')}</Locked>}</MetaRow>
        <MetaRow label={t('Evidence')}>
          {priv ? (
            x.evidence.length ? (
              <Links>
                {x.evidence.map((e) => (
                  <LinkOut key={e.url} label={e.label} url={e.url} />
                ))}
              </Links>
            ) : (
              <Tag tone="warn">{t('No evidence linked')}</Tag>
            )
          ) : (
            <Locked>{t('Restricted')}</Locked>
          )}
        </MetaRow>
        {x.review && (
          <MetaRow label={t(x.state === 'rejected' ? 'Rejected by' : 'Approved by')}>
            <ByAt id={x.review.by} at={x.review.at} />
            {x.review.note && <span className="ml-1.5 type-small">{x.review.note}</span>}
          </MetaRow>
        )}
      </Meta>
      {req && ['draft', 'returned'].includes(x.state) && <EditSection x={x} />}
      <ReviewSection x={x} />
      <PaymentsSection x={x} priv={priv} />
      <SectionHeading as="h2" count={x.history.length}>
        {t('History')}
      </SectionHeading>
      <HistoryList rows={x.history} />
      {cancelable &&
        (form === 'f-cancel' ? (
          <CancelForm id={x.id} />
        ) : (
          <Acts className="mt-7">
            <Button variant="ghost" onClick={openForm('f-cancel')}>
              {t('Cancel request')}
            </Button>
          </Acts>
        ))}
    </Page>
  );
}

function CancelForm({ id }: { id: string }) {
  const [v, setV] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field label={t('Reason for canceling')} htmlFor="fm-fx-why" required help={fe.help('v')} error={fe.bad('v')}>
        <TextArea
          id="fm-fx-why"
          value={v}
          error={fe.bad('v')}
          onChange={(s) => {
            setV(s);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="danger"
          onClick={() => {
            if (!v.trim()) return fe.fail('v', t('Give a reason.'));
            void cancelFinance(id, v.trim());
          }}
        >
          {t('Cancel request')}
        </Button>
        <Cancel label={t('Keep it')} />
      </Acts>
    </>
  );
}
