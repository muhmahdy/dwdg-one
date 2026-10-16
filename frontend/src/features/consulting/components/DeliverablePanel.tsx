/* The deliverable panel: its acceptance criteria, the readiness checks, every version with its review, and the actions each
   role has (submit, review, confirm completeness, deliver, record the client's response, waive). Approved internally,
   delivered and accepted by the client are three separate records. From divisions/div-ee-cons.js INSP['cons-dlv']
   (consulting_deliverable, consulting_review, consulting_revision, consulting_stale_ready, S055). */
import { useState } from 'react';
import { Link } from 'react-router';
import type { InspectorRef } from '@/app/ui-state';
import { InspectorHead, PANELS } from '@/components/shared/Inspector';
import { PersonLink } from '@/components/shared/PersonLink';
import { Chip } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { fmtD, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { isBoard } from '@/lib/roles';
import { CHANNEL, CONS, director, type Channel } from '@/features/external/services/ee-data';
import { DeniedPanel, WhoOr, isUrl, useFieldErrors } from '@/features/external/components/ext-parts';
import { isDone, projOf, taskOf } from '@/features/work/services/selectors';
import type { Deliverable, DlvVersion } from '../services/cons-data';
import {
  DLV,
  canSeeEng,
  checks,
  dlvOf,
  dlvState,
  engOf,
  isPL,
  isPM,
  isStale,
  latest,
  ready,
} from '../services/cons-rules';
import {
  confirmCompleteness,
  recordClient,
  recordDelivery,
  reviewVersion,
  submitVersion,
  waiveChecks,
} from '../services/engagements';

const Hint = ({ children }: { children: React.ReactNode }) => <p className="my-2 text-mute type-small">{children}</p>;
const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);
const Acts = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 flex flex-wrap gap-2">{children}</div>
);
const closeForm = () => {
  setUi((u) => {
    u.form = null;
  });
};
const openForm = (f: string) => () => {
  setUi((u) => {
    u.form = f;
  });
};

function SubmitForm({ d }: { d: Deliverable }) {
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const fe = useFieldErrors();
  return (
    <SubForm>
      <Field label={t('What changed')} htmlFor="cs-v-note" required help={fe.help('note')} error={fe.bad('note')}>
        <input
          id="cs-v-note"
          className={cn(inputClass, fe.bad('note') && invalidClass)}
          value={note}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setNote(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('Link to this exact version')}
        htmlFor="cs-v-url"
        required
        help={fe.help(
          'url',
          t('A link to a document edited in place does not freeze it; name the version in the file too.'),
        )}
        error={fe.bad('url')}
      >
        <input
          id="cs-v-url"
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
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!note.trim()) return fe.fail('note', t('Say what changed.'));
            if (!url.trim() || !isUrl(url.trim())) return fe.fail('url', t('Paste the https link to this version.'));
            void submitVersion(d.id, { note: note.trim(), url: url.trim() });
          }}
        >
          {t('Submit version {v}', { v: d.versions.length + 1 })}
        </Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </SubForm>
  );
}

function ReviewForm({ d, v }: { d: Deliverable; v: number }) {
  const who = useWho();
  const [note, setNote] = useState('');
  const fe = useFieldErrors();
  return (
    <SubForm>
      <Field
        label={t('Feedback')}
        htmlFor="cs-r-note"
        help={fe.help(
          'note',
          t('Needed when you request changes. It becomes one linked revision task for {who}.', {
            who: who.first(d.owner),
          }),
        )}
        error={fe.bad('note')}
      >
        <textarea
          id="cs-r-note"
          className={cn(textareaClass, 'min-h-16', fe.bad('note') && invalidClass)}
          rows={3}
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
            void reviewVersion(d.id, 'approved', note.trim());
          }}
        >
          {t('Approve version {v}', { v })}
        </Button>
        <Button
          onClick={() => {
            if (!note.trim()) return fe.fail('note', t('Write what should change. It goes into the revision task.'));
            void reviewVersion(d.id, 'changes', note.trim());
          }}
        >
          {t('Request changes')}
        </Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </SubForm>
  );
}

function DeliverForm({ d, v }: { d: Deliverable; v: number }) {
  const [date, setDate] = useState(today());
  const [ch, setCh] = useState<Channel>('email');
  const [ev, setEv] = useState('');
  const fe = useFieldErrors();
  return (
    <SubForm>
      <Notice icon="info" title={<b>{t('Record what already happened')}</b>}>
        <p>{t('Send or present the deliverable outside dwdg’ONE first. Saving here sends nothing.')}</p>
      </Notice>
      <Grid2>
        <Field label={t('Delivered on')} htmlFor="cs-d-date" required help={fe.help('date')} error={fe.bad('date')}>
          <DateField
            id="cs-d-date"
            value={date}
            max={today()}
            onChange={(x) => {
              setDate(x);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Channel')} htmlFor="cs-d-ch">
          <SelectField
            id="cs-d-ch"
            value={ch}
            onChange={(x) => {
              setCh(x as Channel);
            }}
            options={Object.entries(CHANNEL).map(([k, x]) => ({ value: k, label: t(x) }))}
          />
        </Field>
      </Grid2>
      <Field
        label={t('Evidence link')}
        htmlFor="cs-d-ev"
        help={fe.help('ev', t('For example the sent email or the meeting minutes.'))}
        error={fe.bad('ev')}
      >
        <input
          id="cs-d-ev"
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
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!date) return fe.fail('date', t('Choose the date.'));
            if (date > today())
              return fe.fail('date', t('Record delivery after it happens. A planned date stays planned.'));
            if (!isUrl(ev.trim())) return fe.fail('ev', t('Use an https link.'));
            void recordDelivery(d.id, { date, channel: ch, evidence: ev.trim() });
          }}
        >
          {t('Record delivery of version {v}', { v })}
        </Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </SubForm>
  );
}

function ClientForm({ d }: { d: Deliverable }) {
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const [next, setNext] = useState('');
  const fe = useFieldErrors();
  const go = (choice: 'accepted' | 'rejected') => () => {
    if (!date) return fe.fail('date', t('Choose the date.'));
    if (!note.trim()) return fe.fail('note', t('Write what the client said.'));
    void recordClient(d.id, choice, { date, note: note.trim(), next: next.trim() });
  };
  return (
    <SubForm>
      <Field
        label={t('Response received on')}
        htmlFor="cs-c-date"
        required
        help={fe.help('date')}
        error={fe.bad('date')}
      >
        <DateField
          id="cs-c-date"
          value={date}
          onChange={(x) => {
            setDate(x);
            fe.clear();
          }}
        />
      </Field>
      <Field
        label={t('What the client said')}
        htmlFor="cs-c-note"
        required
        help={fe.help('note')}
        error={fe.bad('note')}
      >
        <textarea
          id="cs-c-note"
          className={cn(textareaClass, 'min-h-16', fe.bad('note') && invalidClass)}
          rows={3}
          value={note}
          autoFocus
          onChange={(e) => {
            setNote(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Next action if rejected')} htmlFor="cs-c-next" help={t('Creates a follow-up task for the PM.')}>
        <input
          id="cs-c-next"
          className={inputClass}
          value={next}
          autoComplete="off"
          onChange={(e) => {
            setNext(e.target.value);
          }}
        />
      </Field>
      <Acts>
        <Button variant="primary" onClick={go('accepted')}>
          {t('Client accepted')}
        </Button>
        <Button onClick={go('rejected')}>{t('Client rejected')}</Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </SubForm>
  );
}

function WaiveForm({ d }: { d: Deliverable }) {
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  return (
    <SubForm>
      <Field
        label={t('Reason for the waiver')}
        htmlFor="cs-w-why"
        required
        help={fe.help('why', t('Visible on the deliverable and in Changes.'))}
        error={fe.bad('why')}
      >
        <textarea
          id="cs-w-why"
          className={cn(textareaClass, 'min-h-16', fe.bad('why') && invalidClass)}
          rows={2}
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
            if (!why.trim()) return fe.fail('why', t('Give the reason.'));
            void waiveChecks(d.id, why.trim());
          }}
        >
          {t('Waive the open checks')}
        </Button>
        <Button variant="ghost" onClick={closeForm}>
          {t('Cancel')}
        </Button>
      </Acts>
    </SubForm>
  );
}

function VersionRow({ v, i, stale }: { v: DlvVersion; i: number; stale: boolean }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const rt = v.review?.task ? taskOf(db, v.review.task) : undefined;
  return (
    <div
      className={cn(
        'grid grid-cols-[44px_1fr_auto] items-center gap-2.5 rounded-ctl px-2.5 py-1.5',
        i === 0 && 'bg-sel-neutral',
      )}
    >
      <span className="text-d13 font-semibold">v{v.v}</span>
      <div className="min-w-0">
        <b className="text-d14 font-bold">{v.note}</b>
        <small className="block text-d13 text-mute">
          {who.stamp(v.by, v.at)}, {t('scope version {s}', { s: v.scopeV })}
        </small>
        {v.review ? (
          <>
            <small className="block text-d13 text-mute">
              <Chip
                def={
                  v.review.choice === 'approved'
                    ? i === 0 && stale
                      ? DLV.stale
                      : ['Approved', 'check', 'green']
                    : DLV.changes
                }
              />{' '}
              {who.stamp(v.review.by, v.review.at)}
              {v.review.note && `: ${v.review.note}`}
            </small>
            {rt && (
              <small className="block text-d13 text-mute">
                {t('Revision task')}:{' '}
                <a
                  className="cursor-pointer underline underline-offset-2"
                  onClick={() => {
                    openTask(rt.id);
                  }}
                >
                  {rt.title}
                </a>{' '}
                {isDone(rt) && `(${t('done')})`}
              </small>
            )}
          </>
        ) : (
          <small className="block text-d13 text-mute">{t('Not reviewed yet')}</small>
        )}
      </div>
      {v.url ? (
        <a
          className="inline-grid size-[30px] place-items-center rounded-ctl text-mute hover:bg-hover hover:text-ink"
          href={v.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('Open version {v}', { v: v.v })}
        >
          <Icon name="external" />
        </a>
      ) : (
        <span />
      )}
    </div>
  );
}

function DeliverablePanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const form = useUi((u) => u.form);
  const d = dlvOf(db, insp.id);
  const p = d ? projOf(db, d.project) : undefined;
  if (!d || !p || !canSeeEng(db, p, m) || !m) return <DeniedPanel head={t('Deliverable')} />;
  const e = engOf(db, p.id);
  if (!e) return <DeniedPanel head={t('Deliverable')} />;
  const st = dlvState(db, d);
  const l = latest(d);
  const c = checks(db, d);
  const rev = e.reviewer;
  const canSubmit = !isBoard(m) && (d.owner === m.id || isPL(p, m)) && !['delivered', 'accepted'].includes(st);
  const canReview = !!l && !l.review && rev === m.id && l.by !== m.id && d.owner !== m.id; // self-review fails (access_review_self_policy, proposed)
  const canPM = !!l && isPM(p, m) && l.review?.choice === 'approved' && e.pmCheck[d.id]?.v !== l.v;
  const isHand = e.clientOwner === m.id || isPM(p, m);
  const canDeliver = isHand && ['approved', 'stale'].includes(st);
  const canClient = isHand && st === 'delivered';
  const ms = d.ms ? db.milestones.find((z) => z.id === d.ms) : undefined;
  const versions = [...d.versions].reverse();
  let acts: React.ReactNode;
  if (form === 'dl-submit') acts = <SubmitForm d={d} />;
  else if (form === 'dl-review' && l) acts = <ReviewForm d={d} v={l.v} />;
  else if (form === 'dl-deliver' && l) acts = <DeliverForm d={d} v={l.v} />;
  else if (form === 'dl-client') acts = <ClientForm d={d} />;
  else if (form === 'dl-waive') acts = <WaiveForm d={d} />;
  else
    acts = (
      <>
        <Acts>
          {canReview && (
            <Button variant="primary" onClick={openForm('dl-review')}>
              {t('Review version {v}', { v: l.v })}
            </Button>
          )}
          {canSubmit && (
            <Button variant={canReview ? 'default' : 'primary'} onClick={openForm('dl-submit')}>
              <Icon name="upload" />
              {l ? t('Submit a new version') : t('Submit version 1')}
            </Button>
          )}
          {canPM && (
            <Button
              onClick={() => {
                void confirmCompleteness(d.id);
              }}
            >
              {t('Confirm completeness')}
            </Button>
          )}
          {canDeliver &&
            (ready(db, d) ? (
              <Button variant="primary" onClick={openForm('dl-deliver')}>
                {t('Record delivery')}
              </Button>
            ) : (
              <Button disabled title={t('Every check must pass, or be waived, first.')}>
                {t('Record delivery')}
              </Button>
            ))}
          {canClient && (
            <Button variant="primary" onClick={openForm('dl-client')}>
              {t('Record client response')}
            </Button>
          )}
          {director(m, CONS) && l && !ready(db, d) && !['delivered', 'accepted'].includes(st) && (
            <Button variant="ghost" onClick={openForm('dl-waive')}>
              {t('Waive')}
            </Button>
          )}
        </Acts>
        {l && !l.review && rev && !canReview && (
          <Hint>
            {rev === m.id
              ? t('You submitted or own this deliverable, so someone else reviews it.')
              : t('Waiting for {who} to review version {v}.', { who: who.first(rev), v: l.v })}
          </Hint>
        )}
        {!rev && <Hint>{t('No reviewer named for this engagement yet.')}</Hint>}
      </>
    );
  const dl = d.delivery;
  const cl = d.client;
  const row = (k: string, v: React.ReactNode) => (
    <div key={k} className="contents">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
  const dlStyle =
    'my-2 grid grid-cols-[150px_1fr] gap-x-2.5 gap-y-3 text-d13 [&_dd]:m-0 [&_dd]:flex-wrap [&_dt]:text-mute';
  return (
    <>
      <InspectorHead>{t('Deliverable')}</InspectorHead>
      <h2 className="mt-3 mb-2.5 type-h2">{d.title}</h2>
      <p className="mt-2 mb-3.5">
        <Chip def={DLV[st]} pill="pill" />
      </p>
      {st === 'stale' && l && (
        <Notice icon="warning" tone="warn" title={<b>{t('Approval is stale')}</b>}>
          <p>
            {t(
              'Scope changed after version {v} was approved. Submit a version for the new scope and review it again.',
              { v: l.v },
            )}
          </p>
        </Notice>
      )}
      <dl className={dlStyle}>
        {row(t('Owner'), <PersonLink id={d.owner} avatarClass="size-[22px]" />)}
        {row(t('Reviewer'), <WhoOr id={rev} label="No reviewer" />)}
        {row(t('Engagement'), <Link to={`/engagements/${p.id}`}>{p.name}</Link>)}
        {ms && row(t('Milestone'), ms.title)}
        {row(t('Created by'), who.stamp(d.by, d.at))}
      </dl>
      <SectionHeading>{t('Acceptance criteria')}</SectionHeading>
      <ul className="m-0 pl-[18px] text-d13h">
        {d.criteria.map((cr) => (
          <li key={cr}>{cr}</li>
        ))}
        {!d.criteria.length && <li className="text-mute">{t('None written')}</li>}
      </ul>
      <SectionHeading count={`${String(c.filter((z) => z[1]).length)}/${String(c.length)}`}>
        {t('Ready to deliver')}
      </SectionHeading>
      <ul className="m-0 mb-2 grid list-none gap-0.5 p-0 text-d13h">
        {c.map(([label, ok]) => (
          <li key={label} className={cn('flex items-start gap-2 px-1 py-1.5 text-ink-2', ok && 'text-ink')}>
            <Icon
              name={ok ? 'check' : 'circle'}
              size="sm"
              className={cn('mt-0.5 flex-none text-mute', ok && 'text-green-ink')}
            />
            <span>{label}</span>
            <span className="sr-only">{ok ? t('Done') : t('Open')}</span>
          </li>
        ))}
      </ul>
      {d.waiver && (
        <div className="my-3 rounded-[10px] bg-surface-2 px-3 py-2.5 text-d13">
          {t('Waived by {who}: {r}', { who: who.stamp(d.waiver.by, d.waiver.at), r: d.waiver.reason })}
        </div>
      )}
      {acts}
      <SectionHeading count={d.versions.length}>{t('Versions')}</SectionHeading>
      {versions.length ? (
        <div className="grid gap-[3px]">
          {versions.map((v, i) => (
            <VersionRow key={v.v} v={v} i={i} stale={isStale(d, e)} />
          ))}
        </div>
      ) : (
        <div className="px-2.5 py-3 text-d13h text-mute">{t('No version submitted yet.')}</div>
      )}
      {dl && (
        <>
          <SectionHeading>{t('Delivery')}</SectionHeading>
          <dl className={dlStyle}>
            {row(t('Version'), `v${String(dl.v)}`)}
            {row(t('Delivered on'), `${fmtD(dl.date)}, ${t(CHANNEL[dl.channel as Channel])}`)}
            {row(t('Recorded by'), who.stamp(dl.by, dl.at))}
            {dl.evidence &&
              row(
                t('Evidence'),
                <a href={dl.evidence} target="_blank" rel="noopener noreferrer">
                  {t('Open')}
                </a>,
              )}
          </dl>
        </>
      )}
      {cl && (
        <>
          <SectionHeading>{t('Client response')}</SectionHeading>
          <dl className={dlStyle}>
            {row(t('Response'), <Chip def={DLV[cl.choice]} />)}
            {row(t('Version'), `v${String(cl.v)}`)}
            {row(t('Received on'), fmtD(cl.date))}
            {row(t('What they said'), cl.note)}
            {row(t('Recorded by'), who.stamp(cl.by, cl.at))}
          </dl>
        </>
      )}
    </>
  );
}

PANELS['cons-dlv'] = (p) => <DeliverablePanel key={String(p.insp.id)} insp={p.insp} />;
