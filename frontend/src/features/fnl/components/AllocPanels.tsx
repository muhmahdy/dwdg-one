/* The two allocation side panels: one budget line (approve or return, amend with a deficit warning) and proposing a new line.
   From divisions/div-fnl-mcit.js INSP['fm-alloc'] and INSP['fm-alloc-new'] (finance_budget, finance_amend). */
import { useState } from 'react';
import { Link } from 'react-router';
import { DIVS } from '@/app/config/org';
import type { InspectorRef } from '@/app/ui-state';
import { Avatar } from '@/components/shared/Avatar';
import { InspectorHead, PANELS } from '@/components/shared/Inspector';
import { Chip } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { Field, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Empty, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { AST, CATS, COMMIT, FST, alName, alOf, alStats, fmtN, grant, idrT, parseIdr } from '../services/fnl-data';
import { amendAllocation, approveAllocation, proposeAllocation, returnAllocation } from '../services/finance';
import { Acts, ByAt, Ledger, Money, Note, fmtDT, useFieldErrors } from './fnl-parts';

const Title = ({ children }: { children: string }) => <h2 className="mt-3 mb-2.5 type-h2">{children}</h2>;
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

function AmendForm({ id, amount, committed }: { id: string; amount: number; committed: number }) {
  const [v, setV] = useState(fmtN(amount));
  const [why, setWhy] = useState('');
  const [exc, setExc] = useState(false);
  const fe = useFieldErrors();
  const nv = parseIdr(v);
  const def = !Number.isNaN(nv) && nv < committed;
  return (
    <>
      <SectionHeading as="h2">{t('Amend allocation')}</SectionHeading>
      <Field label={t('New amount (Rp)')} htmlFor="fm-am-amt" required help={fe.help('amt')} error={fe.bad('amt')}>
        <input
          id="fm-am-amt"
          className={cn(inputClass, fe.bad('amt') && invalidClass)}
          inputMode="numeric"
          value={v}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setV(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Ledger
        items={[
          [t('Now'), <Money n={amount} />],
          [t('New'), Number.isNaN(nv) ? '–' : <Money n={nv} />],
          [t('Committed'), <Money n={committed} />],
          [t('Headroom after'), Number.isNaN(nv) ? '–' : <Money n={nv - committed} neg={nv < committed} />],
        ]}
      />
      {def && (
        <>
          <Notice
            icon="warning"
            tone="error"
            className="mt-3 mb-3"
            title={<b>{t('Below what is already committed')}</b>}
          >
            <p>
              {t('This creates a deficit of {d}. Paid records stay unchanged. Save only as a recorded exception.', {
                d: idrT(committed - nv),
              })}
            </p>
          </Notice>
          <label className="mb-2.5 flex items-center gap-2 text-d13h">
            <input
              type="checkbox"
              checked={exc}
              onChange={(e) => {
                setExc(e.target.checked);
              }}
            />
            {t('Record as an exception')}
          </label>
        </>
      )}
      <Field
        label={t('Reason')}
        htmlFor="fm-am-why"
        required
        help={fe.help('why', t('Kept in the allocation history.'))}
        error={fe.bad('why')}
      >
        <textarea
          id="fm-am-why"
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
            if (Number.isNaN(nv)) return fe.fail('amt', t('Whole rupiah, more than zero.'));
            if (nv === amount) return fe.fail('amt', t('That is the current amount.'));
            if (nv <= 0) return fe.fail('amt', t('Whole rupiah, more than zero.'));
            if (def && !exc) return fe.fail('amt', t('Tick "Record as an exception" to go below what is committed.'));
            if (!why.trim()) return fe.fail('why', t('Give the reason. It stays in the history.'));
            void amendAllocation(id, nv, why.trim(), exc);
          }}
        >
          {t('Save amendment')}
        </Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

function ReturnForm({ id }: { id: string }) {
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field label={t('Why return it?')} htmlFor="fm-ar-why" required help={fe.help('why')} error={fe.bad('why')}>
        <textarea
          id="fm-ar-why"
          className={cn(textareaClass, 'min-h-16', fe.bad('why') && invalidClass)}
          value={why}
          autoFocus
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
            if (!why.trim()) return fe.fail('why', t('Say why it goes back.'));
            void returnAllocation(id, why.trim());
          }}
        >
          {t('Return')}
        </Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </>
  );
}

function AllocPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const a = alOf(db, insp.id);
  if (!a) return <InspectorHead>{t('Allocation')}</InspectorHead>;
  const st = alStats(db, a);
  const canApprove = a.state === 'proposed' && grant(db, 'budget', m?.id) && a.createdBy !== m?.id;
  return (
    <>
      <InspectorHead>{t('Allocation')}</InspectorHead>
      <Title>{alName(db, a)}</Title>
      <p className="my-2">
        <Chip def={AST[a.state]} pill="pill" />
      </p>
      <Meta className="my-3 grid-cols-[110px_1fr] [&_dd]:min-w-0 [&_dd]:flex-wrap">
        <MetaRow label={t('Created by')}>
          <ByAt id={a.createdBy} at={a.createdAt} />
        </MetaRow>
        <MetaRow label={t('Term')}>{a.term}</MetaRow>
        <MetaRow label={t('Allocated')}>
          <Money n={a.amount} />
        </MetaRow>
        <MetaRow label={t('Source')}>{a.source || t('Not given')}</MetaRow>
        {a.approvedBy && (
          <MetaRow label={t('Approved by')}>
            <ByAt id={a.approvedBy} at={a.approvedAt} />
          </MetaRow>
        )}
        {a.returnNote && (
          <MetaRow label={t('Returned because')}>
            <span className="whitespace-pre-line">{a.returnNote}</span>
          </MetaRow>
        )}
      </Meta>
      {a.state === 'approved' && (
        <Ledger
          items={[
            [t('Committed'), <Money n={st.committed} />],
            [t('Paid'), <Money n={st.paid} />],
            [t('Outstanding'), <Money n={st.outstanding} />],
            [t('Remaining'), <Money n={st.remaining} />],
          ]}
        />
      )}
      {canApprove ? (
        form === 'a-return' ? (
          <ReturnForm id={a.id} />
        ) : (
          <Acts>
            <Button
              variant="primary"
              onClick={() => {
                void approveAllocation(a.id);
              }}
            >
              {t('Approve allocation')}
            </Button>
            <Button onClick={openForm('a-return')}>{t('Return')}</Button>
          </Acts>
        )
      ) : a.state === 'proposed' && grant(db, 'budget', m?.id) ? (
        <Note>{t('You proposed it, so another approver decides.')}</Note>
      ) : (
        a.state === 'proposed' && (
          <Note>{t('Waiting for the allocation approver. An unapproved line is never used as budget.')}</Note>
        )
      )}
      {a.state === 'approved' &&
        grant(db, 'budget', m?.id) &&
        (form === 'a-amend' ? (
          <AmendForm id={a.id} amount={a.amount} committed={st.committed} />
        ) : (
          <Acts>
            <Button onClick={openForm('a-amend')}>{t('Amend allocation')}</Button>
          </Acts>
        ))}
      <SectionHeading as="h2" count={st.reqs.length}>
        {t('Requests on this line')}
      </SectionHeading>
      {st.reqs.length ? (
        <Rows>
          {st.reqs.map((r) => (
            <Link key={r.id} to={`/fnl-requests/${r.id}`} className="block">
              <Row className="gap-2.5">
                <RowText title={<b>{r.purpose}</b>} sub={who.first(r.requester)} />
                <Money n={r.approved != null && COMMIT.includes(r.state) ? r.approved : r.requested} />
                <Chip def={FST[r.state]} pill="" />
              </Row>
            </Link>
          ))}
        </Rows>
      ) : (
        <Note>{t('No requests yet.')}</Note>
      )}
      <SectionHeading as="h2" count={a.history.length}>
        {t('History')}
      </SectionHeading>
      <div className="flex flex-col gap-0.5">
        {[...a.history].reverse().map((h) => (
          <div
            key={h.at}
            className="grid min-h-[34px] grid-cols-[22px_1fr_auto] items-center gap-2.5 px-1.5 py-1 text-d13"
          >
            <Avatar id={h.by} size="xs" className="size-[22px]" />
            <span className="min-w-0 text-ink-2">
              <Money n={h.amount} /> · {h.reason}
            </span>
            <time className="text-d12 whitespace-nowrap text-mute type-num">{fmtDT(h.at)}</time>
          </div>
        ))}
      </div>
    </>
  );
}

function AllocNewPanel() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const [unit, setUnit] = useState('hr');
  const [project, setProject] = useState('');
  const [cat, setCat] = useState('Operations');
  const [amt, setAmt] = useState('');
  const [src, setSrc] = useState('');
  const fe = useFieldErrors();
  if (!grant(db, 'allocate', m?.id)) {
    return (
      <>
        <InspectorHead>{t('Propose allocation')}</InspectorHead>
        <Empty title={t('This page is not available to you')}>
          {t('It may be outside your workspace or it was removed.')}
        </Empty>
      </>
    );
  }
  const projs = db.projects.filter((p) => !['completed', 'cancelled', 'archived'].includes(p.stage));
  return (
    <>
      <InspectorHead>{t('Propose allocation')}</InspectorHead>
      <div className="mt-3 grid gap-3.5">
        <Field label={t('Unit')} htmlFor="fm-na-unit" required>
          <SelectField
            id="fm-na-unit"
            value={unit}
            onChange={setUnit}
            options={DIVS.map((d) => ({ value: d.id, label: d.name }))}
          />
        </Field>
        <Field label={t('Project')} htmlFor="fm-na-proj">
          <SelectField
            id="fm-na-proj"
            value={project}
            onChange={setProject}
            options={[{ value: '', label: t('Whole unit') }, ...projs.map((p) => ({ value: p.id, label: p.name }))]}
          />
        </Field>
        <Field label={t('Category')} htmlFor="fm-na-cat" required>
          <SelectField
            id="fm-na-cat"
            value={cat}
            onChange={setCat}
            options={CATS.map((c) => ({ value: c, label: t(c) }))}
          />
        </Field>
        <Field
          label={t('Amount (Rp)')}
          htmlFor="fm-na-amt"
          required
          help={fe.help('amt', t('Whole rupiah only.'))}
          error={fe.bad('amt')}
        >
          <input
            id="fm-na-amt"
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
        <Field
          label={t('Source')}
          htmlFor="fm-na-src"
          required
          help={fe.help('src', t('Where the figure comes from, for example the annual plan line.'))}
          error={fe.bad('src')}
        >
          <input
            id="fm-na-src"
            className={cn(inputClass, fe.bad('src') && invalidClass)}
            value={src}
            autoComplete="off"
            onChange={(e) => {
              setSrc(e.target.value);
              fe.clear();
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
            if (!src.trim()) return fe.fail('src', t('Say where the figure comes from.'));
            void proposeAllocation({
              unit,
              project: project !== '' ? project : null,
              category: cat,
              amount: n,
              source: src.trim(),
            });
          }}
        >
          {t('Propose')}
        </Button>
      </Acts>
      <Note>{t('An approver other than you decides. Until then it is not budget.')}</Note>
    </>
  );
}

PANELS['fm-alloc'] = AllocPanel;
PANELS['fm-alloc-new'] = AllocNewPanel;
