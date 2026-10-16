/* Requests: the Legal, Finance and Incoming queues in one division (one queue per specialist, blueprint §8), the Board's
   counts-only view, a member's own requests, and the new legal or finance request form whose draft survives errors and
   reloads. From divisions/div-fnl-mcit.js fnlRequestsPage and newFnlPage. */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Route } from '@/app/router/routes';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Chip, DivCrumb, Tag } from '@/components/shared/division-ui';
import { Button, buttonClass } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Segmented, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Empty, NotAvailable, Page, PageHeader, tabClass } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { visibleDivs } from '@/lib/access';
import { today, daysBetween } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import {
  AGREEMENT,
  CATS,
  COMMIT,
  FNL,
  FST,
  IST,
  LST,
  LTYPE,
  alName,
  alOf,
  commit,
  fnlFull,
  fnlOf,
  frOf,
  invOf,
  isBoardP,
  isReqL,
  liveNo,
  lrOf,
  netPaid,
  owed,
  parseIdr,
  safeUrl,
  shortNotice,
  unitLead,
  unitName,
  okDate,
  type LegalType,
} from '../services/fnl-data';
import { clearFormDraft, saveFormDraft, submitLegal } from '../services/legal';
import { submitFinance } from '../services/finance';
import { FinancePage } from './FinancePage';
import { IncomingPage } from './IncomingPage';
import { LegalPage } from './LegalPage';
import { LinkRow, Tbl, Td, Th } from './fnl-table';
import { GrantsBox, Money, NeededTag, Who, useFieldErrors } from './fnl-parts';

const Unavailable = () => (
  <Page>
    <NotAvailable />
  </Page>
);

export function RequestsCrumb({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const parts: [string, string][] = [['fnl-requests', t('Requests')]];
  if (route.id === 'new') parts.push(['', route.sub === 'finance' ? t('New finance request') : t('New legal request')]);
  else if (route.id) {
    const x = lrOf(db, route.id);
    const f = frOf(db, route.id);
    const i = invOf(db, route.id);
    if (x) parts.push(['', x.title]);
    else if (f) parts.push(['', f.purpose]);
    else if (i) parts.push(['', i.title]);
  }
  return <DivCrumb d={FNL} parts={parts} />;
}

const LegalHead = () => (
  <>
    <Th>{t('Request')}</Th>
    <Th>{t('Requested by')}</Th>
    <Th>{t('Needed by')}</Th>
    <Th>{t('Responsible')}</Th>
    <Th>{t('Number')}</Th>
    <Th>{t('State')}</Th>
  </>
);
const FinHead = () => (
  <>
    <Th>{t('Request')}</Th>
    <Th>{t('Requested by')}</Th>
    <Th num>{t('Requested')}</Th>
    <Th num>{t('Approved')}</Th>
    <Th num>{t('Paid')}</Th>
    <Th num>{t('Outstanding')}</Th>
    <Th>{t('State')}</Th>
  </>
);

function List() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const view = useUi((u) => u.view.fnlreq ?? 'legal');
  const filter = useUi((u) => u.view.fnlf ?? 'open');
  useDivisionWorkspace(FNL);
  if (!m) return <Unavailable />;
  const s = fnlOf(db);
  if (isBoardP(m)) {
    const open = (n: number) => String(n);
    return (
      <Page>
        <PageHeader
          title={t('Finance & Legal requests')}
          sub={t('Board view: counts only. Request details stay with FnL and the requester.')}
        />
        <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr]">
          <MetaRow label={t('Open legal requests')}>
            <span className="type-num">
              {open(s.legal.filter((x) => !['registered', 'cancelled', 'rejected', 'draft'].includes(x.stage)).length)}
            </span>
          </MetaRow>
          <MetaRow label={t('Open finance requests')}>
            <span className="type-num">
              {open(
                s.requests.filter((x) => ['submitted', 'review', 'returned', 'approved', 'partial'].includes(x.state))
                  .length,
              )}
            </span>
          </MetaRow>
        </Meta>
      </Page>
    );
  }
  const full = fnlFull(m);
  const mineL = s.legal.filter((x) => isReqL(x, m) || (!full && unitLead(m, x.unit)));
  const mineF = s.requests.filter((x) => x.requester === m.id);
  const newBtns = (
    <>
      <Link className={buttonClass('default', false, 'no-underline')} to="/fnl-requests/new/legal">
        <Icon name="file" />
        {t('Legal request')}
      </Link>
      <Link className={buttonClass('primary', false, 'no-underline')} to="/fnl-requests/new/finance">
        <Icon name="wallet" />
        {t('Finance request')}
      </Link>
    </>
  );
  const lRow = (x: (typeof s.legal)[number]) => (
    <LinkRow key={x.id} to={`fnl-requests/${x.id}`}>
      <Td>
        <b>{x.title}</b>
        <small className="text-mute">
          {t(LTYPE[x.type][0])}
          {x.counterpart ? `, ${x.counterpart}` : ''}
        </small>
      </Td>
      <Td>
        <Who id={x.requester} /> <small className="text-mute">{unitName(x.unit)}</small>
      </Td>
      <Td>
        <NeededTag d={x.requiredBy} />
        {shortNotice(db, x) && (
          <Tag tone="warn" className="ml-1">
            {t('Short notice')}
          </Tag>
        )}
      </Td>
      <Td>
        <Who id={x.owner} />
      </Td>
      <Td>{liveNo(db, x) ? <b>{liveNo(db, x)?.no}</b> : <span className="text-mute">–</span>}</Td>
      <Td>
        <Chip def={LST[x.stage]} pill="pill-o" />
      </Td>
    </LinkRow>
  );
  const fRow = (x: (typeof s.requests)[number]) => (
    <LinkRow key={x.id} to={`fnl-requests/${x.id}`}>
      <Td>
        <b>{x.purpose}</b>
        <small className="text-mute">{alName(db, alOf(db, x.alloc))}</small>
      </Td>
      <Td>
        <Who id={x.requester} />
      </Td>
      <Td num>
        <Money n={x.requested} />
      </Td>
      <Td num>
        {x.approved != null && COMMIT.includes(x.state) ? (
          <Money n={x.approved} />
        ) : (
          <span className="text-mute">–</span>
        )}
      </Td>
      <Td num>{commit(x) ? <Money n={netPaid(db, x)} /> : <span className="text-mute">–</span>}</Td>
      <Td num>{commit(x) ? <Money n={owed(db, x)} /> : <span className="text-mute">–</span>}</Td>
      <Td>
        <Chip def={FST[x.state]} pill="pill-o" />
        {x.dup?.state === 'flagged' && (
          <Tag tone="warn" className="ml-1">
            {t('Possible duplicate')}
          </Tag>
        )}
      </Td>
    </LinkRow>
  );
  if (!full)
    return (
      <Page wide>
        <PageHeader
          title={t('Requests to Finance & Legal')}
          sub={t(
            'Ask Legal for a document or Finance for money. You see your own requests and what happens next; reviewer notes stay with FnL.',
          )}
        >
          {newBtns}
        </PageHeader>
        {mineL.length || mineF.length ? (
          <>
            <SectionHeading as="h2" count={mineL.length + mineF.length}>
              {t('Your requests')}
            </SectionHeading>
            {mineL.length > 0 && <Tbl head={<LegalHead />}>{mineL.map(lRow)}</Tbl>}
            {mineF.length > 0 && <Tbl head={<FinHead />}>{mineF.map(fRow)}</Tbl>}
          </>
        ) : (
          <Empty title={t('You have no requests yet')}>
            {t('Start a legal or finance request. Drafts are kept until you submit.')}
          </Empty>
        )}
      </Page>
    );
  const openL = (x: (typeof s.legal)[number]) => !['registered', 'cancelled', 'rejected'].includes(x.stage);
  const openF = (x: (typeof s.requests)[number]) => !['reconciled', 'cancelled', 'rejected', 'paid'].includes(x.state);
  const lList = s.legal
    .filter((x) => x.stage !== 'draft' || isReqL(x, m))
    .filter((x) => filter === 'all' || (filter === 'open' ? openL(x) : !openL(x)))
    .sort((a, b) => a.requiredBy.localeCompare(b.requiredBy));
  const fList = s.requests
    .filter((x) => x.state !== 'draft' || x.requester === m.id)
    .filter((x) => filter === 'all' || (filter === 'open' ? openF(x) : !openF(x)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tabs: [string, string, number][] = [
    ['legal', 'Legal', s.legal.filter(openL).length],
    ['finance', 'Finance', s.requests.filter(openF).length],
    ['incoming', 'Incoming', s.incoming.length],
  ];
  return (
    <Page wide>
      <PageHeader
        title={t('Requests')}
        sub={t(
          'Legal and Finance queues in one division. Approval, numbering, signatures and payments are separate grants.',
        )}
      >
        {newBtns}
      </PageHeader>
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
                  u.view.fnlreq = k;
                });
              }}
            >
              {t(l)} <span className="ml-2 text-mute type-num">{n}</span>
            </button>
          ))}
        </div>
        {view !== 'incoming' && (
          <Segmented<string>
            label={t('Show')}
            value={filter}
            onChange={(k) => {
              setUi((u) => {
                u.view.fnlf = k;
              });
            }}
            options={[
              ['open', t('Open')],
              ['done', t('Done')],
              ['all', t('All')],
            ]}
          />
        )}
      </div>
      {view === 'legal' ? (
        lList.length ? (
          <Tbl head={<LegalHead />}>{lList.map(lRow)}</Tbl>
        ) : (
          <Empty title={t('Nothing here')}>{t('No legal requests match this filter.')}</Empty>
        )
      ) : view === 'finance' ? (
        fList.length ? (
          <Tbl head={<FinHead />}>{fList.map(fRow)}</Tbl>
        ) : (
          <Empty title={t('Nothing here')}>{t('No finance requests match this filter.')}</Empty>
        )
      ) : (
        <>
          <Notice icon="info" className="mt-3 mb-3" title={<b>{t('Incoming money is a separate basis')}</b>}>
            <p>
              {t(
                'Expected client income is never budget and never mixed with spending. A term opens only after the legal gate (proposed, P1).',
              )}
            </p>
          </Notice>
          <Tbl
            head={
              <>
                <Th>{t('Term')}</Th>
                <Th num>{t('Expected')}</Th>
                <Th num>{t('Received')}</Th>
                <Th num>{t('Outstanding')}</Th>
                <Th>{t('State')}</Th>
              </>
            }
          >
            {s.incoming.map((x) => {
              const rec = x.receipts.reduce((a, p) => a + p.amount, 0);
              return (
                <LinkRow key={x.id} to={`fnl-requests/${x.id}`}>
                  <Td>
                    <b>{x.title}</b>
                    <small className="text-mute">{x.client}</small>
                  </Td>
                  <Td num>
                    <Money n={x.expected} />
                  </Td>
                  <Td num>
                    <Money n={rec} />
                  </Td>
                  <Td num>
                    <Money n={x.expected - rec} />
                  </Td>
                  <Td>
                    <Chip def={IST[x.state]} pill="pill-o" />
                  </Td>
                </LinkRow>
              );
            })}
          </Tbl>
        </>
      )}
      <GrantsBox
        grants={s.grants}
        keys={
          view === 'legal'
            ? ['legal', 'legalReview', 'issue', 'sign']
            : view === 'finance'
              ? ['finReview', 'pay']
              : ['invoice', 'pay']
        }
      />
    </Page>
  );
}

// ---------- a new legal or finance request ----------
type DraftValues = Record<string, unknown>;
const str = (d: DraftValues, k: string, def = '') => (typeof d[k] === 'string' ? d[k] : def);

function NewRequest({ kind }: { kind: 'legal' | 'finance' }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const navigate = useNavigate();
  const saved = (m && fnlOf(db).drafts[m.id]?.[kind]) ?? {};
  const [d, setD] = useState<DraftValues>(saved);
  const fe = useFieldErrors();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useDivisionWorkspace(FNL);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );
  if (!m || isBoardP(m)) return <Unavailable />;
  const set = (k: string, v: unknown) => {
    const next = { ...d, [k]: v };
    setD(next);
    fe.clear();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void saveFormDraft(kind, next);
    }, 700);
  };
  const projs = db.projects.filter(
    (p) => visibleDivs(m).includes(p.div) || p.team.some((x) => x.id === m.id && x.state === 'joined'),
  );
  const stamp = typeof saved._at === 'string' ? saved._at.slice(11, 16) : '';
  const ty = str(d, 'type', 'PKS') as LegalType;
  const agr = AGREEMENT.includes(ty);
  const rb = str(d, 'requiredBy');
  const lead = agr ? fnlOf(db).policy.leadAgreement : fnlOf(db).policy.leadOther;
  const short = !!rb && daysBetween(today(), rb) < lead;
  const submit = () => {
    clearTimeout(timer.current);
    if (kind === 'legal') {
      const title = str(d, 'title').trim();
      const purpose = str(d, 'purpose').trim();
      const cp = str(d, 'counterpart').trim();
      const sig = str(d, 'signatories').trim();
      const src = str(d, 'sources').trim();
      if (!title) return fe.fail('title', t('Give the document a title.'));
      if (!purpose) return fe.fail('purpose', t('Say what the document must achieve.'));
      if ((agr || ty === 'LTR') && !cp) return fe.fail('counterpart', t('Name the counterpart for this type.'));
      if (!okDate(rb)) return fe.fail('requiredBy', t('Choose the date you need it by.'));
      if (agr && !sig) return fe.fail('signatories', t('List who signs. One per line: name, role, party.'));
      const bad = src
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .some((l) => {
          const [a = '', b = ''] = l.split('|').map((s) => s.trim());
          const url = b || a;
          return b ? !safeUrl(b) : /^https?:/i.test(a) && !safeUrl(url);
        });
      if (bad) return fe.fail('sources', t('Links must start with https://.'));
      void submitLegal({
        type: ty,
        title,
        purpose,
        counterpart: cp,
        project: str(d, 'project') || null,
        requiredBy: rb,
        confidential: d.conf === true,
        signatories: sig,
        sources: src,
        urgency: short ? str(d, 'urgency').trim() : '',
      });
    } else {
      const purpose = str(d, 'purpose').trim();
      const amt = parseIdr(str(d, 'amount'));
      const alloc = str(d, 'alloc');
      const ev = str(d, 'evidence').trim();
      if (!purpose) return fe.fail('purpose', t('Say what the money is for.'));
      if (isNaN(amt) || amt <= 0)
        return fe.fail('amount', t('Enter a positive whole rupiah amount, for example 90.000.'));
      if (!alloc) return fe.fail('alloc', t('Choose the budget line it comes from.'));
      if (ev && !safeUrl(ev)) return fe.fail('evidence', t('Links must start with https://.'));
      void submitFinance({
        purpose,
        amount: amt,
        alloc,
        category: str(d, 'category', 'Events'),
        need: str(d, 'need') || null,
        payee: str(d, 'payee').trim(),
        ref: str(d, 'ref').trim(),
        evidence: ev,
      });
    }
  };
  const inp = (k: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      id={`fm-${kind}-${k}`}
      className={cn(inputClass, fe.bad(k) && invalidClass)}
      value={str(d, k)}
      autoComplete="off"
      onChange={(e) => {
        set(k, e.target.value);
      }}
      {...extra}
    />
  );
  const area = (k: string, placeholder?: string) => (
    <textarea
      id={`fm-${kind}-${k}`}
      className={cn(textareaClass, 'min-h-16', fe.bad(k) && invalidClass)}
      value={str(d, k)}
      {...(placeholder ? { placeholder } : {})}
      onChange={(e) => {
        set(k, e.target.value);
      }}
    />
  );
  const als = fnlOf(db).allocations.filter((a) => a.state === 'approved');
  return (
    <Page>
      <PageHeader
        title={kind === 'legal' ? t('New legal request') : t('New finance request')}
        sub={
          kind === 'legal'
            ? t('FnL Legal triages it, drafts the document and asks for review. You see the next step at every stage.')
            : t(
                'An independent approver decides. Approval is not payment; Finance records the payment after it happens outside the app.',
              )
        }
      >
        <Segmented<'legal' | 'finance'>
          label={t('Request type')}
          value={kind}
          onChange={(k) => {
            void navigate(`/fnl-requests/new/${k}`);
          }}
          options={[
            ['legal', t('Legal')],
            ['finance', t('Finance')],
          ]}
        />
      </PageHeader>
      <div className="mt-[18px] grid max-w-[720px] gap-3.5">
        {kind === 'legal' ? (
          <>
            <Field label={t('Document type')} htmlFor="fm-legal-type" required>
              <SelectField
                id="fm-legal-type"
                value={ty}
                onChange={(v) => {
                  set('type', v);
                }}
                options={(Object.keys(LTYPE) as LegalType[]).map((k) => ({ value: k, label: t(LTYPE[k][0]) }))}
              />
            </Field>
            <Field
              label={t('Title')}
              htmlFor="fm-legal-title"
              required
              help={fe.help('title', t('For example: Cooperation agreement with the client'))}
              error={fe.bad('title')}
            >
              {inp('title')}
            </Field>
            <Field
              label={t('Purpose')}
              htmlFor="fm-legal-purpose"
              required
              help={fe.help('purpose', t('What the document must achieve.'))}
              error={fe.bad('purpose')}
            >
              {area('purpose')}
            </Field>
            <div className="grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
              <Field
                label={t('Counterpart')}
                htmlFor="fm-legal-counterpart"
                required={agr || ty === 'LTR'}
                help={fe.help(
                  'counterpart',
                  agr || ty === 'LTR' ? t('Required for this type.') : t('Leave empty for internal documents.'),
                )}
                error={fe.bad('counterpart')}
              >
                {inp('counterpart')}
              </Field>
              <Field label={t('Project')} htmlFor="fm-legal-project">
                <SelectField
                  id="fm-legal-project"
                  value={str(d, 'project')}
                  onChange={(v) => {
                    set('project', v);
                  }}
                  options={[
                    { value: '', label: t('No project') },
                    ...projs.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
              <Field
                label={t('Needed by')}
                htmlFor="fm-legal-rb"
                required
                help={fe.help('requiredBy')}
                error={fe.bad('requiredBy')}
              >
                <DateField
                  id="fm-legal-rb"
                  value={rb}
                  onChange={(v) => {
                    set('requiredBy', v);
                  }}
                />
              </Field>
              <Field label={t('Confidential')} htmlFor="fm-legal-conf">
                <label className="inline-flex min-h-[var(--ctl-h)] cursor-pointer items-center gap-2 text-d13h">
                  <input
                    id="fm-legal-conf"
                    type="checkbox"
                    className="size-4 accent-ink"
                    checked={d.conf === true}
                    onChange={(e) => {
                      set('conf', e.target.checked);
                    }}
                  />
                  {t('Only the requester and FnL Legal see the sources')}
                </label>
              </Field>
            </div>
            <Field
              label={t('Signatories')}
              htmlFor="fm-legal-signatories"
              required={agr}
              help={fe.help(
                'signatories',
                agr
                  ? t('Required for agreements. One per line: name, role, party.')
                  : t('One per line: name, role, party.'),
              )}
              error={fe.bad('signatories')}
            >
              {area('signatories', t('One per line: name, role, party'))}
            </Field>
            <Field
              label={t('Sources (KAK, proposal, earlier versions)')}
              htmlFor="fm-legal-sources"
              help={fe.help('sources', t('Links only. Files stay in your drive.'))}
              error={fe.bad('sources')}
            >
              {area('sources', t('One per line: label | https://link'))}
            </Field>
            {short && (
              <>
                <Notice icon="warning" tone="warn" className="mt-3 mb-3" title={<b>{t('Short notice')}</b>}>
                  <p>
                    {t(
                      'The survey suggested H-3 for agreements and H-2 for other letters. It is not adopted policy, so nothing is rejected automatically. Say why it is urgent; FnL decides.',
                    )}
                  </p>
                </Notice>
                <Field label={t('Why is it urgent?')} htmlFor="fm-legal-urgency">
                  {area('urgency')}
                </Field>
              </>
            )}
          </>
        ) : (
          <>
            <Field
              label={t('Purpose')}
              htmlFor="fm-finance-purpose"
              required
              help={fe.help('purpose', t('What the money is for.'))}
              error={fe.bad('purpose')}
            >
              {inp('purpose')}
            </Field>
            <div className="grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
              <Field
                label={t('Amount (Rp)')}
                htmlFor="fm-finance-amount"
                required
                help={fe.help('amount', t('Whole rupiah only.'))}
                error={fe.bad('amount')}
              >
                {inp('amount', { inputMode: 'numeric', placeholder: '90.000' })}
              </Field>
              <Field label={t('Needed by')} htmlFor="fm-finance-need">
                <DateField
                  id="fm-finance-need"
                  value={str(d, 'need')}
                  onChange={(v) => {
                    set('need', v);
                  }}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
              <Field
                label={t('Budget line')}
                htmlFor="fm-finance-alloc"
                required
                help={fe.help('alloc', t('Only approved allocations are listed.'))}
                error={fe.bad('alloc')}
              >
                <SelectField
                  id="fm-finance-alloc"
                  value={str(d, 'alloc')}
                  onChange={(v) => {
                    set('alloc', v);
                  }}
                  options={[
                    { value: '', label: t('Choose a budget line') },
                    ...als.map((a) => ({ value: a.id, label: alName(db, a) })),
                  ]}
                />
              </Field>
              <Field label={t('Category')} htmlFor="fm-finance-category" required>
                <SelectField
                  id="fm-finance-category"
                  value={str(d, 'category', 'Events')}
                  onChange={(v) => {
                    set('category', v);
                  }}
                  options={CATS.map((c) => ({ value: c, label: t(c) }))}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
              <Field
                label={t('Payee')}
                htmlFor="fm-finance-payee"
                help={t('Name only. Bank details are never stored here.')}
              >
                {inp('payee')}
              </Field>
              <Field
                label={t('Receipt or quotation number')}
                htmlFor="fm-finance-ref"
                help={t('Used to spot possible duplicates.')}
              >
                {inp('ref')}
              </Field>
            </div>
            <Field
              label={t('Evidence link')}
              htmlFor="fm-finance-evidence"
              help={fe.help(
                'evidence',
                t('A Drive link to the receipt or quotation. Without it Finance may return the request.'),
              )}
              error={fe.bad('evidence')}
            >
              {inp('evidence', { placeholder: 'https://' })}
            </Field>
          </>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={submit}>
          {t('Submit request')}
        </Button>
        <Button
          onClick={() => {
            void saveFormDraft(kind, d);
          }}
        >
          {t('Save draft')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setD({});
            void clearFormDraft(kind);
          }}
        >
          {t('Clear form')}
        </Button>
        {stamp && <span className="text-mute type-caption">{t('Draft saved {t}', { t: stamp })}</span>}
      </div>
    </Page>
  );
}

export function RequestsPage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  if (route.id === 'new') return <NewRequest kind={route.sub === 'finance' ? 'finance' : 'legal'} />;
  if (route.id) {
    const l = lrOf(db, route.id);
    if (l) return <LegalPage id={l.id} />;
    const f = frOf(db, route.id);
    if (f) return <FinancePage id={f.id} />;
    const i = invOf(db, route.id);
    if (i) return <IncomingPage id={i.id} />;
    return <Unavailable />;
  }
  return <List />;
}
