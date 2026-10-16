/* One legal request: what happens next, triage, questions from Legal, versions reviewed one exact version at a time, the document
   number, signatures recorded as evidence, the BAST gate to Finance, reviewer notes only Legal reads, and the history. From
   divisions/div-fnl-mcit.js legalPage (legal_requester_view, flow-legal-*). */
import { useState } from 'react';
import { Link } from 'react-router';
import { Chip, Locked, Tag } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, invalidClass, inputClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { Steps } from '@/components/ui/Steps';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { plural, t } from '@/lib/i18n';
import { addDays, daysBetween, fmtD, today } from '@/lib/time';
import { useWho } from '@/lib/people';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { projOf } from '@/features/work/services/selectors';
import {
  FNL,
  LSTEPS,
  LSTEP_I,
  LST,
  LTYPE,
  SIG,
  canSeeL,
  daysLeft,
  fnlFull,
  fnlOf,
  gateOf,
  grant,
  invOf,
  isReqL,
  latestV,
  liveNo,
  lPriv,
  lrOf,
  okDate,
  safeUrl,
  shortNotice,
  sigDone,
  unitName,
  type LegalRequest,
  type LegalVersion,
} from '../services/fnl-data';
import {
  addLegalNote,
  addVersion,
  answerInfo,
  askInfo,
  askUrgent,
  cancelLegal,
  checkDelivery,
  declineSignature,
  decideUrgent,
  decideVersion,
  issueNumber,
  recordGateException,
  recordSignature,
  registerDocument,
  rejectLegal,
  sendForSignature,
  sendGate,
  triage,
  voidNumber,
} from '../services/legal';
import {
  Acts,
  Box,
  ByAt,
  HistoryList,
  LinkOut,
  Links,
  NeededTag,
  NextBox,
  Note,
  Who,
  fmtDT,
  useFieldErrors,
} from './fnl-parts';
import { GateChecks, GateChip } from './GateChecks';
import { HandoffCard } from './IncomingPage';

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

/** A textarea with its own error state and a submit button: the many "reason" and "question" forms share it. */
function ReasonForm({
  id,
  label,
  help,
  action,
  variant = 'primary',
  empty,
  required = true,
  onSubmit,
}: {
  id: string;
  label: string;
  help?: string;
  action: string;
  variant?: 'primary' | 'danger';
  empty: string;
  required?: boolean;
  onSubmit: (v: string) => void;
}) {
  const [v, setV] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field label={label} htmlFor={id} required={required} help={fe.help('v', help)} error={fe.bad('v')}>
        <textarea
          id={id}
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
          variant={variant}
          onClick={() => {
            if (!v.trim()) return fe.fail('v', empty);
            onSubmit(v.trim());
          }}
        >
          {action}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

function nextOf(
  db: Parameters<typeof liveNo>[0],
  x: LegalRequest,
  who: ReturnType<typeof useWho>,
): [string | null, string] {
  const lv = latestV(x);
  const sg = x.signatories.filter(sigDone).length;
  const issuer = fnlOf(db).grants.issue[0];
  switch (x.stage) {
    case 'draft':
      return [x.requester, t('Submit when the required fields are complete.')];
    case 'submitted':
      return [null, t('FnL Legal triages the request and names who drafts it.')];
    case 'info':
      return [x.requester, t('Answer the question from Legal. The request waits for you.')];
    case 'drafting':
    case 'revision':
      return [
        x.owner,
        t('{who} prepares the first version.', { who: who.first(x.owner) }).replace(
          t('the first version'),
          x.stage === 'revision' ? t('a new version') : t('the first version'),
        ),
      ];
    case 'review':
      return [x.reviewer, t('{who} reviews version {v}.', { who: who.first(x.reviewer), v: lv?.v ?? 1 })];
    case 'approved':
      return liveNo(db, x)
        ? [x.owner, t('{who} sends the approved version for signature.', { who: who.first(x.owner) })]
        : [issuer ?? null, t('{who} issues the document number.', { who: who.first(issuer) })];
    case 'awaiting':
      return [
        x.owner,
        t('{a} of {b} signatures recorded. It stays here until every party has signed.', {
          a: sg,
          b: x.signatories.length,
        }),
      ];
    case 'signed':
      return [
        x.owner,
        x.type === 'BAST'
          ? t('Check the delivery evidence, then send the gate to Finance.')
          : t('Legal registers and archives it.'),
      ];
    case 'registered':
      return [null, t('Registered. Nothing else is needed.')];
    case 'cancelled':
      return [null, t('Canceled. The history stays.')];
    case 'rejected':
      return [null, t('Rejected. The history stays.')];
  }
}

// ---------- sections ----------
function UrgencySection({ x }: { x: LegalRequest }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  const closed = ['cancelled', 'rejected', 'registered'].includes(x.stage);
  const u = x.urgency;
  const req = isReqL(x, m);
  const rev = grant(db, 'legalReview', m?.id);
  if (!((shortNotice(db, x) || u) && !closed)) return null;
  return (
    <>
      <Notice icon="warning" tone="warn" className="mt-3 mb-3" title={<b>{t('Short notice')}</b>}>
        <p>
          {t(
            'Needed {n} days after it was submitted. H-3 for agreements and H-2 for other letters are survey suggestions, not adopted policy, so the app warns and does not reject.',
            {
              n: Math.max(0, daysBetween(x.createdAt.slice(0, 10), x.requiredBy)),
            },
          )}
        </p>
      </Notice>
      {u ? (
        <Box>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <b>{t('Urgent exception')}</b>
            <Chip
              def={
                u.state === 'approved'
                  ? ['Exception approved', 'check', 'green']
                  : u.state === 'declined'
                    ? ['Exception declined', 'close', 'mute']
                    : ['Waiting for a decision', 'clock', 'warn']
              }
              pill="pill"
            />
          </div>
          <Meta className="mt-3 mb-1.5 max-w-[760px] grid-cols-[110px_1fr]">
            <MetaRow label={t('Asked by')}>
              <ByAt id={u.by} at={u.at} />
            </MetaRow>
            <MetaRow label={t('Reason')}>{u.reason}</MetaRow>
            {u.decidedBy && (
              <MetaRow label={t('Decided by')}>
                <ByAt id={u.decidedBy} at={u.decidedAt} />
              </MetaRow>
            )}
            {u.note && <MetaRow label={t('Decision note')}>{u.note}</MetaRow>}
          </Meta>
          {u.state === 'requested' && rev && !req ? (
            form === 'l-urg' ? (
              <>
                <Field
                  label={t('Decision note')}
                  htmlFor="fm-urg-note"
                  help={fe.help('note', t('Required when you decline. Say what the requester should expect.'))}
                  error={fe.bad('note')}
                >
                  <textarea
                    id="fm-urg-note"
                    className={cn(textareaClass, 'min-h-16', fe.bad('note') && invalidClass)}
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
                      void decideUrgent(x.id, 'approved', note.trim());
                    }}
                  >
                    {t('Approve exception')}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!note.trim()) return fe.fail('note', t('Say what the requester should expect instead.'));
                      void decideUrgent(x.id, 'declined', note.trim());
                    }}
                  >
                    {t('Decline exception')}
                  </Button>
                  <Cancel />
                </Acts>
              </>
            ) : (
              <Acts>
                <Button onClick={openForm('l-urg')}>{t('Decide on the exception')}</Button>
              </Acts>
            )
          ) : (
            u.state === 'requested' && (
              <Note>{t('Decided by the FnL legal reviewer (proposed). Approving does not skip review.')}</Note>
            )
          )}
        </Box>
      ) : req ? (
        form === 'l-urg-ask' ? (
          <ReasonForm
            id="fm-urg-why"
            label={t('Why is it urgent?')}
            action={t('Ask for an exception')}
            empty={t('Say why it is urgent.')}
            onSubmit={(v) => {
              void askUrgent(x.id, v);
            }}
          />
        ) : (
          <Acts>
            <Button onClick={openForm('l-urg-ask')}>{t('Ask for an urgent exception')}</Button>
          </Acts>
        )
      ) : null}
    </>
  );
}

function TriageSection({ x }: { x: LegalRequest }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  const g = fnlOf(db).grants;
  const [owner, setOwner] = useState(x.owner ?? m?.id ?? '');
  const [rev, setRev] = useState(x.reviewer ?? g.legalReview[0] ?? '');
  const name = (id: string) => db.people.find((p) => p.id === id)?.name ?? id;
  if (!(x.stage === 'submitted' && grant(db, 'legal', m?.id))) return null;
  return (
    <>
      <SectionHeading as="h2">{t('Triage')}</SectionHeading>
      <Grid2>
        <Field label={t('Drafted by')} htmlFor="fm-tr-owner">
          <SelectField
            id="fm-tr-owner"
            people
            value={owner}
            onChange={setOwner}
            options={g.legal.map((id) => ({ value: id, label: name(id) }))}
          />
        </Field>
        <Field label={t('Reviewed by')} htmlFor="fm-tr-rev" help={t('An independent reviewer, not the drafter.')}>
          <SelectField
            id="fm-tr-rev"
            people
            value={rev}
            onChange={setRev}
            options={g.legalReview.map((id) => ({ value: id, label: name(id) }))}
          />
        </Field>
      </Grid2>
      {form === 'l-ask' ? (
        <ReasonForm
          id="fm-ask-q"
          label={t('What is missing?')}
          help={t('Be specific. The requester answers on this page.')}
          action={t('Send question')}
          empty={t('Say exactly what is missing.')}
          onSubmit={(v) => {
            void askInfo(x.id, v);
          }}
        />
      ) : form === 'l-reject' ? (
        <ReasonForm
          id="fm-rej-why"
          label={t('Reason')}
          action={t('Reject request')}
          variant="danger"
          empty={t('Give a reason.')}
          onSubmit={(v) => {
            void rejectLegal(x.id, v);
          }}
        />
      ) : (
        <Acts>
          <Button
            variant="primary"
            onClick={() => {
              void triage(x.id, owner, rev);
            }}
          >
            {t('Start drafting')}
          </Button>
          <Button onClick={openForm('l-ask')}>{t('Ask for information')}</Button>
          <Button variant="ghost" onClick={openForm('l-reject')}>
            {t('Reject')}
          </Button>
        </Acts>
      )}
    </>
  );
}

function QuestionsSection({ x }: { x: LegalRequest }) {
  const m = useMe();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const fe = useFieldErrors();
  if (!x.info.length) return null;
  const req = isReqL(x, m);
  return (
    <>
      <SectionHeading as="h2" count={x.info.length}>
        {t('Questions from Legal')}
      </SectionHeading>
      <div className="grid gap-2">
        {x.info.map((q, i) => (
          <Box key={q.at}>
            <p className="text-d13 text-mute">
              <ByAt id={q.by} at={q.at} />
            </p>
            <p className="whitespace-pre-line">{q.q}</p>
            {q.a ? (
              <p className="pt-1.5">
                <b>{t('Answer')}</b> {q.a} <span className="text-d12 text-mute">{fmtDT(q.aAt)}</span>
              </p>
            ) : req && x.stage === 'info' ? (
              <>
                <Field
                  label={t('Your answer')}
                  htmlFor={`fm-ans-${String(i)}`}
                  required
                  help={fe.help(String(i), t('Your draft request stays as it is. Add what is missing here.'))}
                  error={fe.bad(String(i))}
                >
                  <textarea
                    id={`fm-ans-${String(i)}`}
                    className={cn(textareaClass, 'min-h-16', fe.bad(String(i)) && invalidClass)}
                    value={answers[i] ?? ''}
                    onChange={(e) => {
                      setAnswers({ ...answers, [i]: e.target.value });
                      fe.clear();
                    }}
                  />
                </Field>
                <Acts>
                  <Button
                    variant="primary"
                    onClick={() => {
                      const a = (answers[i] ?? '').trim();
                      if (!a) return fe.fail(String(i), t('Write your answer.'));
                      void answerInfo(x.id, i, a);
                    }}
                  >
                    {t('Send answer')}
                  </Button>
                </Acts>
              </>
            ) : (
              <Note>{t('Waiting for the requester.')}</Note>
            )}
          </Box>
        ))}
      </div>
    </>
  );
}

const decChip = (x: LegalRequest, v: LegalVersion, i: number) =>
  v.decision ? (
    <Chip
      def={
        v.decision.kind === 'approved'
          ? ['Approved for signature', 'check', 'green']
          : v.decision.kind === 'rejected'
            ? ['Rejected', 'close', 'danger']
            : ['Revision requested', 'undo', 'warn']
      }
      pill="pill"
    />
  ) : i < x.versions.length - 1 ? (
    <Chip def={['Not reviewed, replaced', 'minus', 'mute']} pill="pill" />
  ) : x.stage === 'review' ? (
    <Chip def={['Waiting for review', 'clock', 'warn']} pill="pill" />
  ) : (
    <Chip def={['Not reviewed', 'circle', 'mute']} pill="pill" />
  );

function VersionForm({ x }: { x: LegalRequest }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [tpl, setTpl] = useState(x.template);
  const fe = useFieldErrors();
  const lv = latestV(x);
  return (
    <>
      <div className="mt-3 grid max-w-[720px] gap-3.5">
        <Field label={t('What changed')} htmlFor="fm-v-label" required help={fe.help('label')} error={fe.bad('label')}>
          <input
            id="fm-v-label"
            className={cn(inputClass, fe.bad('label') && invalidClass)}
            value={label}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setLabel(e.target.value);
              fe.clear();
            }}
          />
        </Field>
        <Field
          label={t('Link to this version')}
          htmlFor="fm-v-url"
          required
          help={fe.help('url', t('The document stays in the team drive. This records which file was reviewed.'))}
          error={fe.bad('url')}
        >
          <input
            id="fm-v-url"
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
        {!x.versions.length && (
          <Field label={t('Template used')} htmlFor="fm-v-tpl">
            <input
              id="fm-v-tpl"
              className={inputClass}
              value={tpl}
              autoComplete="off"
              onChange={(e) => {
                setTpl(e.target.value);
              }}
            />
          </Field>
        )}
      </div>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!label.trim()) return fe.fail('label', t('Say what changed in this version.'));
            if (!safeUrl(url.trim())) return fe.fail('url', t('Paste the https link to this version.'));
            void addVersion(x.id, { label: label.trim(), url: url.trim(), template: tpl.trim() });
          }}
        >
          {t('Send v{v} for review', { v: (lv?.v ?? 0) + 1 })}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

function VersionsSection({ x, seeSrc }: { x: LegalRequest; seeSrc: boolean }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const lv = latestV(x);
  if (['draft', 'submitted', 'info', 'cancelled'].includes(x.stage) && !x.versions.length) return null;
  const rev = grant(db, 'legalReview', m?.id);
  const legal = grant(db, 'legal', m?.id);
  const approvedOld = x.versions.find((v) => v.decision?.kind === 'approved' && v !== lv);
  const canRev = x.stage === 'review' && rev && !!lv && lv.by !== m?.id;
  const canDraft = ['drafting', 'revision'].includes(x.stage) && (x.owner === m?.id || (legal && !x.owner));
  return (
    <>
      <SectionHeading as="h2" count={x.versions.length}>
        {t('Versions')}
      </SectionHeading>
      {approvedOld && x.stage === 'review' && lv && (
        <Notice
          icon="warning"
          tone="warn"
          className="mt-3 mb-3"
          title={<b>{t('A newer version needs its own review')}</b>}
        >
          <p>
            {t('Version {a} was approved. Version {b} changed the document, so that approval does not carry over.', {
              a: approvedOld.v,
              b: lv.v,
            })}
          </p>
        </Notice>
      )}
      {x.versions.length ? (
        <div className="grid gap-[3px]">
          {[...x.versions].reverse().map((v, j) => {
            const i = x.versions.length - 1 - j;
            return (
              <div
                key={v.v}
                className={cn(
                  'grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-ctl px-2.5 py-1.5 max-[760px]:grid-cols-[36px_1fr]',
                  i === x.versions.length - 1 && 'bg-sel-neutral',
                )}
              >
                <span className="text-d13 font-semibold">v{v.v}</span>
                <div className="min-w-0">
                  <b className="text-d14 font-bold">{v.label}</b>
                  <small className="block text-d13 text-mute">
                    {who.name(v.by)}, {fmtDT(v.at)}
                    {seeSrc && v.url && (
                      <>
                        {' · '}
                        <a href={v.url} target="_blank" rel="noopener noreferrer">
                          {t('Open')}
                        </a>
                      </>
                    )}
                  </small>
                  {v.decision && (
                    <small className="block text-d13 text-mute">
                      {t('{who}, {d}', { who: who.name(v.decision.by), d: fmtDT(v.decision.at) })}
                      {v.decision.reason && `: ${v.decision.reason}`}
                    </small>
                  )}
                </div>
                {decChip(x, v, i)}
              </div>
            );
          })}
        </div>
      ) : (
        <Note>{t('No version yet. The drafter adds a link to the draft in the team drive.')}</Note>
      )}
      {canRev ? (
        form === 'l-revise' || form === 'l-rej' ? (
          <ReasonForm
            id="fm-rv-why"
            label={form === 'l-rej' ? t('Reason for rejecting') : t('What must change')}
            help={t('Linked to version {v}.', { v: lv.v })}
            action={form === 'l-rej' ? t('Reject request') : t('Request revision')}
            variant={form === 'l-rej' ? 'danger' : 'primary'}
            empty={t('Say what must change.')}
            onSubmit={(v) => {
              void decideVersion(x.id, form === 'l-rej' ? 'rejected' : 'revision', lv.v, v);
            }}
          />
        ) : (
          <>
            <Acts>
              <Button
                variant="primary"
                onClick={() => {
                  void decideVersion(x.id, 'approved', lv.v, '');
                }}
              >
                <Icon name="check" />
                {t('Approve v{v} for signature', { v: lv.v })}
              </Button>
              <Button onClick={openForm('l-revise')}>{t('Request revision')}</Button>
              <Button variant="ghost" onClick={openForm('l-rej')}>
                {t('Reject')}
              </Button>
            </Acts>
            <Note>{t('Internal approval is not a signature. A counterpart comment is not an approval.')}</Note>
          </>
        )
      ) : (
        x.stage === 'review' &&
        rev &&
        lv?.by === m?.id && <Note>{t('You wrote this version, so another reviewer decides.')}</Note>
      )}
      {canDraft &&
        (form === 'l-ver' ? (
          <VersionForm x={x} />
        ) : (
          <Acts>
            <Button variant="primary" onClick={openForm('l-ver')}>
              <Icon name="upload" />
              {t('Add version {v}', { v: (lv?.v ?? 0) + 1 })}
            </Button>
          </Acts>
        ))}
    </>
  );
}

function NumberSection({ x }: { x: LegalRequest }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const s = fnlOf(db);
  const chain = s.register.filter((g) => g.req === x.id);
  const live = liveNo(db, x);
  if (!(chain.length || ['approved', 'awaiting', 'signed', 'registered'].includes(x.stage))) return null;
  const lv = latestV(x);
  const issuable = ['approved', 'awaiting', 'signed'].includes(x.stage) && !live && grant(db, 'issue', m?.id);
  return (
    <>
      <SectionHeading as="h2">{t('Document number')}</SectionHeading>
      {chain.length > 0 && (
        <Rows>
          {chain.map((g) => (
            <Row key={g.id} className="cursor-default gap-2.5">
              <b className={cn('flex-none text-d13 font-semibold', g.state === 'void' && 'text-mute line-through')}>
                {g.no}
              </b>
              <RowText
                title={null}
                sub={`${t('Version {v}', { v: g.version })}, ${who.name(g.issuedBy)}, ${fmtDT(g.issuedAt)}${g.state === 'void' ? ` · ${t('Void: {r}', { r: g.voidReason })}` : ''}`}
              />
              {g.state === 'void' ? (
                <Chip def={['Void, kept in the register', 'close', 'mute']} pill="pill" />
              ) : (
                <Chip def={['Issued', 'check', 'green']} pill="pill" />
              )}
            </Row>
          ))}
        </Rows>
      )}
      <Note>
        {t(
          'Proposed format {f}. Not adopted yet, so every number here is a provisional label. Numbers are never reused.',
          { f: s.policy.format },
        )}
      </Note>
      {issuable && lv && (
        <Acts>
          <Button
            variant="primary"
            onClick={() => {
              void issueNumber(x.id);
            }}
          >
            {t('Issue number for v{v}', { v: lv.v })}
          </Button>
        </Acts>
      )}
      {live &&
        grant(db, 'issue', m?.id) &&
        x.stage !== 'registered' &&
        (form === 'l-void' ? (
          <ReasonForm
            id="fm-void-why"
            label={t('Why void this number?')}
            help={t('The number stays in the register with this reason. A new number can be issued after.')}
            action={t('Void {no}', { no: live.no })}
            variant="danger"
            empty={t('Give the reason. It stays in the register.')}
            onSubmit={(v) => {
              void voidNumber(x.id, v);
            }}
          />
        ) : (
          <Acts>
            <Button variant="ghost" onClick={openForm('l-void')}>
              {t('Void this number')}
            </Button>
          </Acts>
        ))}
    </>
  );
}

function SignForm({ x, sid }: { x: LegalRequest; sid: string }) {
  const [basis, setBasis] = useState<'copy' | 'attested'>('copy');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Field label={t('Evidence')} htmlFor="fm-sg-basis" help={t('An attestation stays marked as not verified.')}>
        <SelectField
          id="fm-sg-basis"
          value={basis}
          onChange={(v) => {
            setBasis(v as 'copy' | 'attested');
          }}
          options={[
            { value: 'copy', label: t('Signed copy (link)') },
            { value: 'attested', label: t('Attestation without a copy') },
          ]}
        />
      </Field>
      <Field label={t('Link to the signed copy')} htmlFor="fm-sg-url" help={fe.help('url')} error={fe.bad('url')}>
        <input
          id="fm-sg-url"
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
      <Grid2>
        <Field label={t('Signed on')} htmlFor="fm-sg-date" required help={fe.help('date')} error={fe.bad('date')}>
          <DateField
            id="fm-sg-date"
            value={date}
            max={today()}
            onChange={(v) => {
              setDate(v);
              fe.clear();
            }}
          />
        </Field>
        <Field
          label={t('Note')}
          htmlFor="fm-sg-note"
          help={fe.help('note', t('Required for an attestation: who confirmed it and how.'))}
          error={fe.bad('note')}
        >
          <input
            id="fm-sg-note"
            className={cn(inputClass, fe.bad('note') && invalidClass)}
            value={note}
            autoComplete="off"
            onChange={(e) => {
              setNote(e.target.value);
              fe.clear();
            }}
          />
        </Field>
      </Grid2>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (basis === 'copy' && !safeUrl(url.trim()))
              return fe.fail('url', t('Paste the https link to the signed copy.'));
            if (basis === 'attested' && !note.trim())
              return fe.fail('note', t('Say who confirmed the signature and how.'));
            if (!okDate(date) || date > today())
              return fe.fail('date', t('Use the actual signing date, not a future one.'));
            void recordSignature(x.id, sid, { basis, url: url.trim(), date, note: note.trim() });
          }}
        >
          {t('Record signature')}
        </Button>
        <Button
          onClick={() => {
            if (!note.trim()) return fe.fail('note', t('Say what the party said.'));
            void declineSignature(x.id, sid, note.trim());
          }}
        >
          {t('Declined to sign')}
        </Button>
        <Cancel />
      </Acts>
    </Box>
  );
}

function SignaturesSection({ x }: { x: LegalRequest }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  if (!(['approved', 'awaiting', 'signed', 'registered'].includes(x.stage) && x.signatories.length)) return null;
  return (
    <>
      <SectionHeading as="h2" count={`${String(x.signatories.filter(sigDone).length)}/${String(x.signatories.length)}`}>
        {t('Signatures')}
      </SectionHeading>
      <Rows>
        {x.signatories.map((s) => (
          <div key={s.id}>
            <Row className="cursor-default flex-wrap gap-2.5">
              <div className="min-w-0 flex-1">
                <b>{s.name}</b>
                <small className="block text-d13 text-mute">
                  {s.role}, {s.party}
                </small>
                {sigDone(s) ? (
                  <small className="block text-d13 text-mute">
                    {s.evidence && <LinkOut label={t('Signed copy')} url={s.evidence} />}{' '}
                    {t('Signed on {d}', { d: s.date ? fmtD(s.date) : '' })},{' '}
                    {t('recorded by {who}', { who: who.name(s.by) })}
                    {s.note && ` · ${s.note}`}
                  </small>
                ) : (
                  s.state === 'declined' && <small className="block text-d13 text-mute">{s.note}</small>
                )}
              </div>
              <Chip def={SIG[s.state]} pill="pill" />
              {x.stage === 'awaiting' && grant(db, 'sign', m?.id) && s.state === 'requested' && (
                <Button small onClick={openForm(`sig-${s.id}`)}>
                  {t('Record')}
                </Button>
              )}
            </Row>
            {form === `sig-${s.id}` && <SignForm x={x} sid={s.id} />}
          </div>
        ))}
      </Rows>
      <Note>{t('The app records signatures made elsewhere. It does not sign, send or verify documents.')}</Note>
      {x.stage === 'approved' &&
        (grant(db, 'sign', m?.id) || x.owner === m?.id) &&
        (liveNo(db, x) ? (
          <Acts>
            <Button
              variant="primary"
              onClick={() => {
                void sendForSignature(x.id);
              }}
            >
              {t('Mark as sent for signature')}
            </Button>
          </Acts>
        ) : (
          <Note>{t('Issue the number first (proposed order).')}</Note>
        ))}
      {x.stage === 'signed' && grant(db, 'legal', m?.id) && x.type !== 'BAST' && (
        <Acts>
          <Button
            variant="primary"
            onClick={() => {
              void registerDocument(x.id);
            }}
          >
            <Icon name="archive" />
            {t('Register and archive')}
          </Button>
        </Acts>
      )}
    </>
  );
}

/** The ready-for-invoice gate (legal_bast_gate): PKS signed, BAST signed, and the delivery evidence checked by Legal. */
function GateSection({ x }: { x: LegalRequest }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  const g = fnlOf(db).grants;
  const [url, setUrl] = useState('');
  const [auth, setAuth] = useState('daniel');
  const [why, setWhy] = useState('');
  const [to, setTo] = useState(g.invoice[0] ?? '');
  const [need, setNeed] = useState(addDays(today(), 3));
  const fe = useFieldErrors();
  if (x.type !== 'BAST') return null;
  const gate = gateOf(db, x);
  const inv = invOf(db, x.invoice);
  const sent = x.gate?.sent;
  const rev = grant(db, 'legalReview', m?.id);
  const legal = grant(db, 'legal', m?.id);
  const inAwait = ['awaiting', 'signed'].includes(x.stage);
  return (
    <>
      <SectionHeading as="h2" action={<GateChip ok={gate.ok} exception={!!gate.exception} />}>
        {t('Ready-for-invoice gate')}
      </SectionHeading>
      <GateChecks x={x} />
      {!x.gate?.delivery &&
        rev &&
        inAwait &&
        (form === 'g-del' ? (
          <Box>
            <Field
              label={t('Link to the delivery evidence')}
              htmlFor="fm-del-url"
              required
              help={fe.help(
                'url',
                t('For example the session attendance list and the slide pack Consulting handed over.'),
              )}
              error={fe.bad('url')}
            >
              <input
                id="fm-del-url"
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
                  if (!safeUrl(url.trim())) return fe.fail('url', t('Paste the https link to the evidence.'));
                  void checkDelivery(x.id, url.trim());
                }}
              >
                {t('Record check')}
              </Button>
              <Cancel />
            </Acts>
          </Box>
        ) : (
          <Acts>
            <Button onClick={openForm('g-del')}>{t('Record delivery evidence check')}</Button>
          </Acts>
        ))}
      {gate.exception && (
        <Notice icon="warning" tone="warn" className="mt-3 mb-3" title={<b>{t('Sent under an exception')}</b>}>
          <p>
            {t('{who} approved an exception: {r}', {
              who: db.people.find((p) => p.id === gate.exception?.by)?.name ?? '',
              r: gate.exception.reason,
            })}
          </p>
        </Notice>
      )}
      {!gate.ok &&
        !gate.exception &&
        rev &&
        !sent &&
        inAwait &&
        (form === 'g-exc' ? (
          <Box>
            <Field
              label={t('Approving authority')}
              htmlFor="fm-exc-auth"
              help={t('Proposed: the FnL Director or the President.')}
            >
              <SelectField
                id="fm-exc-auth"
                people
                value={auth}
                onChange={setAuth}
                options={['daniel', 'fadhil'].map((id) => ({
                  value: id,
                  label: db.people.find((p) => p.id === id)?.name ?? id,
                }))}
              />
            </Field>
            <Field
              label={t('Reason and scope')}
              htmlFor="fm-exc-why"
              required
              help={fe.help('why', t('Shown on the gate and to Finance.'))}
              error={fe.bad('why')}
            >
              <textarea
                id="fm-exc-why"
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
                variant="danger"
                onClick={() => {
                  if (!why.trim()) return fe.fail('why', t('Give the reason and scope.'));
                  void recordGateException(x.id, auth, why.trim());
                }}
              >
                {t('Record exception')}
              </Button>
              <Cancel />
            </Acts>
          </Box>
        ) : (
          <Acts>
            <Button variant="ghost" onClick={openForm('g-exc')}>
              {t('Record an approved exception')}
            </Button>
          </Acts>
        ))}
      {(gate.ok || gate.exception) &&
        !sent &&
        (rev || legal) &&
        inv &&
        (form === 'g-send' ? (
          <Box>
            <Grid2>
              <Field label={t('Named receiver in Finance')} htmlFor="fm-gs-to">
                <SelectField
                  id="fm-gs-to"
                  people
                  value={to}
                  onChange={setTo}
                  options={g.invoice.map((id) => ({
                    value: id,
                    label: db.people.find((p) => p.id === id)?.name ?? id,
                  }))}
                />
              </Field>
              <Field
                label={t('Needed by')}
                htmlFor="fm-gs-need"
                help={fe.help('need', t('Requested, not agreed, until Finance accepts.'))}
                error={fe.bad('need')}
              >
                <DateField
                  id="fm-gs-need"
                  value={need}
                  onChange={(v) => {
                    setNeed(v);
                    fe.clear();
                  }}
                />
              </Field>
            </Grid2>
            <Acts>
              <Button
                variant="primary"
                onClick={() => {
                  if (!okDate(need)) return fe.fail('need', t('Choose the date Finance is asked to act by.'));
                  void sendGate(x.id, to, need);
                }}
              >
                {t('Send to Finance')}
              </Button>
              <Cancel />
            </Acts>
            <Note>
              {t('Finance gets the agreement, the BAST and this gate decision. No invoice or payment is created.')}
            </Note>
          </Box>
        ) : (
          <Acts>
            <Button variant="primary" onClick={openForm('g-send')}>
              {t('Send ready-for-invoice to Finance')}
            </Button>
          </Acts>
        ))}
      {sent && inv && <HandoffCard inv={inv} />}
    </>
  );
}

function NotesSection({ x }: { x: LegalRequest }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  const [text, setText] = useState('');
  const fe = useFieldErrors();
  const priv = lPriv(db, m);
  return (
    <>
      <SectionHeading as="h2" count={priv ? x.priv.length : undefined}>
        {t('Reviewer notes')}
      </SectionHeading>
      {priv ? (
        <>
          {x.priv.map((n) => (
            <Box key={n.at}>
              <p className="text-d13 text-mute">
                <ByAt id={n.by} at={n.at} />
              </p>
              <p className="whitespace-pre-line">{n.text}</p>
            </Box>
          ))}
          {!x.priv.length && <Note>{t('No notes.')}</Note>}
          {form === 'l-note' ? (
            <>
              <Field
                label={t('Note')}
                htmlFor="fm-note"
                help={fe.help(
                  'v',
                  t('Only FnL Legal can read it. Never shown to the requester, in search or in exports.'),
                )}
                error={fe.bad('v')}
              >
                <textarea
                  id="fm-note"
                  className={cn(textareaClass, 'min-h-16', fe.bad('v') && invalidClass)}
                  value={text}
                  autoFocus
                  onChange={(e) => {
                    setText(e.target.value);
                    fe.clear();
                  }}
                />
              </Field>
              <Acts>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!text.trim()) return fe.fail('v', t('Write the note.'));
                    void addLegalNote(x.id, text.trim());
                  }}
                >
                  {t('Save note')}
                </Button>
                <Cancel />
              </Acts>
            </>
          ) : (
            <Acts>
              <Button variant="ghost" onClick={openForm('l-note')}>
                {t('Add note')}
              </Button>
            </Acts>
          )}
        </>
      ) : (
        <Locked>{t('Restricted to FnL Legal')}</Locked>
      )}
    </>
  );
}

export function LegalPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  useDivisionWorkspace(FNL);
  const x = lrOf(db, id);
  if (!x || !canSeeL(x, m)) return <Unavailable />;
  const req = isReqL(x, m);
  const legal = grant(db, 'legal', m?.id);
  const seeSrc = !x.confidential || req || lPriv(db, m);
  const [nWho, nTxt] = nextOf(db, x, who);
  const closed = ['cancelled', 'rejected', 'registered'].includes(x.stage);
  const proj = x.project ? projOf(db, x.project) : undefined;
  const live = liveNo(db, x);
  const s = fnlOf(db);
  const stepIdx = LSTEP_I[x.stage];
  const linked = [
    ...(x.type === 'PKS'
      ? s.legal
          .filter((y) => y.pks === x.id)
          .map((y) => ({ key: y.id, to: `/fnl-requests/${y.id}`, icon: 'file', label: y.title }))
      : []),
    ...(x.type === 'PKS' && fnlFull(m)
      ? s.incoming
          .filter((i) => i.pks === x.id)
          .map((i) => ({ key: i.id, to: `/fnl-requests/${i.id}`, icon: 'wallet', label: i.title }))
      : []),
  ];
  const cancelable = !closed && !['signed', 'awaiting'].includes(x.stage) && (req || legal);
  return (
    <Page>
      <PageHeader
        title={x.title}
        sub={
          <>
            {t(LTYPE[x.type][0])}
            {x.counterpart ? ` · ${x.counterpart}` : ''}
            {live && (
              <>
                {' · '}
                <b>{live.no}</b>
              </>
            )}
          </>
        }
      >
        <Chip def={LST[x.stage]} pill="pill-o" />
      </PageHeader>
      {stepIdx != null && (
        <Steps
          className="mt-4 mb-1.5 max-w-[760px]"
          labels={LSTEPS.map((l) => t(l))}
          current={x.stage === 'info' ? 0 : stepIdx}
        />
      )}
      <NextBox who={nWho} text={nTxt} />
      {x.cancel && (
        <Notice icon="close" className="mt-3 mb-3" title={<b>{t('Canceled')}</b>}>
          <p>{t('{who}: {r}', { who: who.name(x.cancel.by), r: x.cancel.reason })}</p>
        </Notice>
      )}
      {!x.cancel && x.stage === 'rejected' && x.rejectReason && (
        <Notice icon="close" tone="error" className="mt-3 mb-3" title={<b>{t('Rejected')}</b>}>
          <p>{x.rejectReason}</p>
        </Notice>
      )}
      <UrgencySection x={x} />
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[760px]:grid-cols-1 [&_dd]:min-w-0 [&_dd]:flex-wrap">
        <MetaRow label={t('Created by')}>
          <ByAt id={x.createdBy} at={x.createdAt} />
        </MetaRow>
        {x.requester !== x.createdBy && (
          <MetaRow label={t('Requester')}>
            <Who id={x.requester} />
          </MetaRow>
        )}
        <MetaRow label={t('Requesting unit')}>{unitName(x.unit)}</MetaRow>
        <MetaRow label={t('Responsible')}>
          <Who id={x.owner} />
        </MetaRow>
        <MetaRow label={t('Reviewer')}>
          <Who id={x.reviewer} />
        </MetaRow>
        <MetaRow label={t('Needed by')}>
          <NeededTag d={x.requiredBy} />
          {daysLeft(x) >= 0 && (
            <span className="text-mute type-small">
              {plural(daysLeft(x), '{n} day from today', '{n} days from today')}
            </span>
          )}
        </MetaRow>
        <MetaRow label={t('Purpose')}>
          <span className="whitespace-pre-line">{x.purpose}</span>
        </MetaRow>
        {x.project && (
          <MetaRow label={t('Project')}>
            {proj ? (
              <Link to={`/projects/${proj.id}`}>{proj.name}</Link>
            ) : (
              <span className="text-mute">{t('Removed project')}</span>
            )}
          </MetaRow>
        )}
        {x.opp && (
          <MetaRow label={t('Opportunity')}>
            <Link to={`/opportunities/${x.opp}`}>{t('EE client opportunity')}</Link>
            {x.handoff && (
              <>
                {' · '}
                <Link to={`/opportunities/${x.opp}`}>{t('EE to Consulting handoff')}</Link>
              </>
            )}
          </MetaRow>
        )}
        <MetaRow label={t('Template')}>
          {x.template || <span className="text-mute">{t('Not chosen yet')}</span>}
        </MetaRow>
        <MetaRow label={t('Sources')}>
          {seeSrc ? (
            x.sources.length ? (
              <Links>
                {x.sources.map((src) => (
                  <LinkOut key={src.label + src.url} label={src.label} url={src.url} />
                ))}
              </Links>
            ) : (
              <span className="text-mute">{t('None linked')}</span>
            )
          ) : (
            <Locked>{t('Confidential')}</Locked>
          )}
        </MetaRow>
        {x.confidential && (
          <MetaRow label={t('Confidential')}>
            <Tag className="bg-ink text-on-ink shadow-none">{t('Yes')}</Tag>
          </MetaRow>
        )}
      </Meta>
      {linked.length > 0 && (
        <Links>
          {linked.map((l) => (
            <Link
              key={l.key}
              className="mt-3 inline-flex items-center gap-1.5 rounded-chip bg-fill px-2 py-0.5 text-d13 text-ink-2 no-underline hover:bg-hover"
              to={l.to}
            >
              <Icon name={l.icon} size="xs" />
              {l.label}
            </Link>
          ))}
        </Links>
      )}
      <TriageSection x={x} />
      <QuestionsSection x={x} />
      <VersionsSection x={x} seeSrc={seeSrc} />
      <NumberSection x={x} />
      <SignaturesSection x={x} />
      <GateSection x={x} />
      <NotesSection x={x} />
      <SectionHeading as="h2" count={x.history.length}>
        {t('History')}
      </SectionHeading>
      <HistoryList rows={x.history} />
      {cancelable &&
        (form === 'l-cancel' ? (
          <ReasonForm
            id="fm-cx-why"
            label={t('Reason for canceling')}
            action={t('Cancel request')}
            variant="danger"
            empty={t('Give a reason.')}
            onSubmit={(v) => {
              void cancelLegal(x.id, v);
            }}
          />
        ) : (
          <Acts className="mt-7">
            <Button variant="ghost" onClick={openForm('l-cancel')}>
              {t('Cancel request')}
            </Button>
          </Acts>
        ))}
    </Page>
  );
}
