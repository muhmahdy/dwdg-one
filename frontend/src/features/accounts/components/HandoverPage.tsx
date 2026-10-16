/* Presidency (access_presidency_transfer, S004 normal handover, S005 Admin recovery): one President at a time. A normal
   handover belongs to the incumbent; emergency recovery belongs to the Admin and is never shown as the President's own.
   From screens/accounts.js handoverPage and hoCard. */
import { useState } from 'react';
import { DIVS, divisionOf } from '@/app/config/org';
import { Avatar, roleText } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { EmptyLine, SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { Steps } from '@/components/ui/Steps';
import { Chip } from '@/components/ui/StatusBadge';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { rank } from '@/lib/access';
import { isAdmin, isBoard } from '@/lib/roles';
import { today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import type { DivisionId, Person, Workspace } from '@/types/workspace';
import { HO_ST, accDef, acctOf, fmtD, openHandover, presidentOf, type Handover } from '../services/acct-data';
import {
  answerHandover,
  cancelHandover,
  confirmHandover,
  startHandover,
  type HandoverInput,
} from '../services/office-actions';
import { canHoView, canReason } from '../services/rules';
import { AcctCrumb, AcctTabs, ByAt, ReasonRestricted } from './AccountsParts';
import { Restricted } from '@/components/ui/page';

export const HandoverCrumb = () => (
  <AcctCrumb
    parts={[
      ['members', t('Members')],
      ['', t('Presidency')],
    ]}
  />
);

const sheet = 'grid content-start gap-1 rounded-sheet bg-surface p-4 shadow-sheet';
const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);
const area = (cls = '') => cn(textareaClass, cls);

type Problem = { field: string; text: string } | null;

function HandoverForm({
  kind,
  pres,
  pool,
  onDone,
}: {
  kind: 'normal' | 'recovery';
  pres: Person;
  pool: Person[];
  onDone: () => void;
}) {
  const [to, setTo] = useState('');
  const [date, setDate] = useState(today());
  const [after, setAfter] = useState('');
  const [note, setNote] = useState('');
  const [ist, setIst] = useState('');
  const [why, setWhy] = useState('');
  const [ev, setEv] = useState('');
  const [err, setErr] = useState<Problem>(null);
  const bad = (f: string) => err?.field === f;
  const help = (f: string, h?: string) => (bad(f) ? err?.text : h);
  const submit = () => {
    if (kind === 'recovery') {
      if (!ist) {
        setErr({ field: 'ist', text: t('Choose what happened to the President’s account.') });
        return;
      }
      if (ist === 'paused' && pres.status !== 'suspended') {
        setErr({
          field: 'ist',
          text: t('{who}’s account is active. Pause it first, or choose Unavailable and give evidence.', {
            who: pres.first,
          }),
        });
        return;
      }
      if (!why.trim()) {
        setErr({ field: 'why', text: t('Give the reason.') });
        return;
      }
      if (ist !== 'paused' && !ev.trim()) {
        setErr({ field: 'ev', text: t('Add an evidence reference.') });
        return;
      }
    }
    if (!to) {
      setErr({ field: 'to', text: t('Choose the successor.') });
      return;
    }
    if (!after) {
      setErr({ field: 'after', text: t('Choose a division for {who}.', { who: pres.first }) });
      return;
    }
    setErr(null);
    const input: HandoverInput = {
      kind,
      to,
      date,
      after: after as DivisionId,
      note,
      ist: kind === 'recovery' ? ist : null,
      why,
      ev,
    };
    void startHandover(input).then((ok) => {
      if (ok) onDone();
    });
  };
  const successor = (
    <Field label={t('Successor')} htmlFor="acct-ho-to" help={help('to')} error={bad('to')}>
      <SelectField
        id="acct-ho-to"
        people
        value={to}
        onChange={setTo}
        options={[
          { value: '', label: t('Choose a person') },
          ...pool.map((p) => ({ value: p.id, label: `${p.name}, ${roleText(p)}` })),
        ]}
      />
    </Field>
  );
  const effective = (
    <Field label={t('Effective date')} htmlFor="acct-ho-eff">
      <DateField id="acct-ho-eff" value={date} onChange={setDate} />
    </Field>
  );
  const afterField = (
    <Field
      label={t('{who}’s division after the office ends', { who: pres.first })}
      htmlFor="acct-ho-after"
      help={help('after', t('Not decided by the plan yet. Recorded so the account keeps a workspace.'))}
      error={bad('after')}
    >
      <SelectField
        id="acct-ho-after"
        value={after}
        onChange={setAfter}
        options={[{ value: '', label: t('Choose a division') }, ...DIVS.map((d) => ({ value: d.id, label: d.name }))]}
      />
    </Field>
  );
  return (
    <SubForm>
      {kind === 'recovery' ? (
        <>
          <Field label={t('President’s account')} htmlFor="acct-hr-st" help={help('ist')} error={bad('ist')}>
            <SelectField
              id="acct-hr-st"
              value={ist}
              onChange={setIst}
              options={[
                { value: '', label: t('Choose what happened') },
                { value: 'paused', label: t('Access paused') },
                { value: 'deleted', label: t('Account deleted') },
                { value: 'unavailable', label: t('Unavailable') },
              ]}
            />
          </Field>
          <Field label={t('Reason')} htmlFor="acct-hr-why" help={help('why')} error={bad('why')}>
            <textarea
              id="acct-hr-why"
              className={area(bad('why') ? invalidClass : '')}
              placeholder={t('Why the incumbent can’t hand over normally')}
              value={why}
              onChange={(e) => {
                setWhy(e.target.value);
              }}
            />
          </Field>
          <Field
            label={t('Evidence reference')}
            htmlFor="acct-hr-ev"
            help={help('ev', t('Required when the account is deleted or the President is unavailable.'))}
            error={bad('ev')}
          >
            <input
              id="acct-hr-ev"
              className={cn(inputClass, bad('ev') && invalidClass)}
              placeholder={t('Link or document number')}
              value={ev}
              onChange={(e) => {
                setEv(e.target.value);
              }}
            />
          </Field>
          {successor}
          {effective}
          {afterField}
        </>
      ) : (
        <>
          {successor}
          {effective}
          {afterField}
          <Field label={t('Message to the successor')} htmlFor="acct-ho-note" optional>
            <textarea
              id="acct-ho-note"
              className={textareaClass}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
              }}
            />
          </Field>
        </>
      )}
      <div className="flex gap-2">
        <Button variant={kind === 'recovery' ? 'danger' : 'primary'} onClick={submit}>
          {kind === 'recovery' ? t('Start emergency recovery') : t('Send the nomination')}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          {t('Cancel')}
        </Button>
      </div>
    </SubForm>
  );
}

function HandoverCard({ h }: { h: Handover }) {
  const m = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const [declining, setDeclining] = useState(false);
  const [reply, setReply] = useState('');
  const fresh = useUi((u) => !!(u.acctFresh as Record<string, boolean> | undefined)?.[h.id]);
  const rec = h.kind === 'recovery';
  const confirmer = rec ? isAdmin(m) : presidentOf(db)?.id === m?.id;
  const n = h.state === 'nominated' ? 0 : h.state === 'accepted' ? (fresh ? 2 : 1) : 3;
  const labels = [
    rec ? 'Recorded by the Admin' : 'Nominated',
    rec ? 'Successor acknowledged' : 'Successor accepted',
    'Verified and confirmed',
    'Office transferred',
  ].map((l) => t(l));
  const p = (txt: string) => <p className="my-2 text-mute type-small">{txt}</p>;
  let acts: React.ReactNode;
  if (h.state === 'nominated' && h.to === m?.id)
    acts = declining ? (
      <SubForm>
        <Field label={t('Reason')} htmlFor="acct-hd-why" optional>
          <textarea
            id="acct-hd-why"
            className={textareaClass}
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
            }}
          />
        </Field>
        <div className="flex gap-2">
          <Button
            small
            onClick={() => {
              void answerHandover(h.id, false, reply);
            }}
          >
            {t('Decline the nomination')}
          </Button>
          <Button
            variant="ghost"
            small
            onClick={() => {
              setDeclining(false);
            }}
          >
            {t('Cancel')}
          </Button>
        </div>
      </SubForm>
    ) : (
      <>
        <div className="mt-3 flex gap-2">
          <Button
            variant="primary"
            small
            onClick={() => {
              void answerHandover(h.id, true, '');
            }}
          >
            <Icon name="check" />
            {rec ? t('Acknowledge and accept') : t('Accept the nomination')}
          </Button>
          <Button
            variant="ghost"
            small
            onClick={() => {
              setDeclining(true);
            }}
          >
            {t('Decline')}
          </Button>
        </div>
        {p(t('Declining has no penalty. Nothing changes until the handover is confirmed.'))}
      </>
    );
  else if (h.state === 'accepted' && confirmer)
    acts = (
      <>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {fresh ? (
            <Chip def={['Signed in again just now', 'check', 'green']} pill="pill-o" />
          ) : (
            <Button
              small
              onClick={() => {
                setUi((u) => {
                  u.acctFresh = { ...(u.acctFresh as Record<string, boolean> | undefined), [h.id]: true };
                });
              }}
            >
              <Icon name="shield" />
              {t('Sign in again with Google')}
            </Button>
          )}
          <Button
            variant={rec ? 'danger' : 'primary'}
            small
            disabled={!fresh}
            onClick={() => {
              void confirmHandover(h.id);
            }}
          >
            {t('Transfer the presidency to {who}', { who: who.first(h.to) })}
          </Button>
          <Button
            variant="ghost"
            small
            onClick={() => {
              void cancelHandover(h.id);
            }}
          >
            {t('Cancel handover')}
          </Button>
        </div>
        {p(t('Confirming needs a fresh sign-in. Exactly one President stays active; a reversal is a new handover.'))}
      </>
    );
  else if (h.state === 'nominated' && confirmer)
    acts = (
      <>
        {p(t('Waiting for {who} to answer.', { who: who.first(h.to) }))}
        <Button
          variant="ghost"
          small
          onClick={() => {
            void cancelHandover(h.id);
          }}
        >
          {t('Cancel handover')}
        </Button>
      </>
    );
  else
    acts = p(
      h.state === 'nominated'
        ? t('Waiting for {who} to answer.', { who: who.first(h.to) })
        : rec
          ? t('Waiting for the Admin to confirm.')
          : t('Waiting for {who} to confirm.', { who: who.first(h.from) }),
    );
  const istLabel = { paused: 'Access paused', deleted: 'Account deleted', unavailable: 'Unavailable' } as Record<
    string,
    string
  >;
  const end = (label: string, id: string) => (
    <div className="grid gap-1 rounded-[10px] bg-surface-2 p-3">
      <small className="text-mute">{label}</small>
      <span className="inline-flex items-center gap-1.5">
        <Avatar id={id} size="xs" />
        {who.name(id)}
      </span>
    </div>
  );
  return (
    <div className={cn(sheet, 'mt-4')}>
      <div className="flex items-center justify-between gap-2">
        <b>{rec ? t('Emergency recovery') : t('Normal handover')}</b>
        <Chip def={HO_ST[h.state]} pill="pill" />
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        {end(t('Outgoing President'), h.from)}
        <span className="grid place-items-center text-mute">
          <Icon name="arrow" />
        </span>
        {end(t('Successor'), h.to)}
      </div>
      <Steps className="my-3.5" labels={labels} current={n} />
      <Meta className="grid-cols-[148px_1fr] max-[600px]:grid-cols-[112px_1fr]">
        <MetaRow label={t('Started by')}>
          <ByAt id={h.createdBy} at={h.createdAt} />
          {rec && (
            <span className="rounded-chip bg-fill px-1.5 py-0.5 text-d11h font-semibold text-ink-2">
              {t('Admin, recovery actor')}
            </span>
          )}
        </MetaRow>
        <MetaRow label={t('Effective date')}>{fmtD(h.effective)}</MetaRow>
        {rec && <MetaRow label={t('President’s account')}>{t(istLabel[h.ist ?? ''] ?? '')}</MetaRow>}
        {rec && <MetaRow label={t('Reason')}>{canReason(m, h.createdBy) ? h.reason : <ReasonRestricted />}</MetaRow>}
        {rec && h.ev && (
          <MetaRow label={t('Evidence')}>
            {canReason(m, h.createdBy) ? h.ev : <Restricted>{t('Restricted')}</Restricted>}
          </MetaRow>
        )}
        <MetaRow label={t('Outgoing division')}>
          {h.after ? (divisionOf(h.after)?.name ?? '') : <span className="text-mute">{t('Not chosen')}</span>}
        </MetaRow>
        {h.note && <MetaRow label={t('Message')}>{h.note}</MetaRow>}
        {h.answeredAt && (
          <MetaRow label={t('Answered')}>
            <ByAt id={h.to} at={h.answeredAt} />
          </MetaRow>
        )}
        <MetaRow label={t('Office record')}>{String(h.version)}</MetaRow>
      </Meta>
      {acts}
    </div>
  );
}

export function HandoverPage() {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const [form, setForm] = useState<'normal' | 'recovery' | null>(null);
  if (!m || !canHoView(db, m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const a = acctOf(db);
  const pres = presidentOf(db);
  const h = openHandover(db);
  const g = pres
    ? a.grants.find((x) => x.person === pres.id && x.role === 'president' && x.state === 'active')
    : undefined;
  const pool = db.people
    .filter((p) => p.status === 'active' && !isBoard(p) && p.id !== pres?.id)
    .sort((x, y) => rank(y) - rank(x) || x.name.localeCompare(y.name));
  const past = a.handovers
    .filter((x) => x !== h && x.id !== h?.id)
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  const isIncumbent = !!pres && pres.id === m.id;
  const card = (kind: 'normal' | 'recovery', title: string, body: string, allowed: boolean, btn: string) => (
    <div className={sheet}>
      <b>{title}</b>
      <p className="m-0 mb-1.5 text-mute type-small">{body}</p>
      {allowed &&
        pres &&
        (form === kind ? (
          <HandoverForm
            kind={kind}
            pres={pres}
            pool={pool}
            onDone={() => {
              setForm(null);
            }}
          />
        ) : (
          <div className="flex gap-2">
            <Button
              variant={kind === 'recovery' ? 'default' : 'primary'}
              small
              onClick={() => {
                setForm(kind);
              }}
            >
              {btn}
            </Button>
          </div>
        ))}
    </div>
  );
  return (
    <Page>
      <PageHeader
        title={t('Presidency')}
        sub={t(
          'One President at a time. A normal handover belongs to the incumbent; emergency recovery belongs to the Admin.',
        )}
      />
      <AcctTabs cur="handover" />
      <SectionHeading as="h2">{t('Current office')}</SectionHeading>
      <div className="mt-2 mb-1 flex items-center gap-3 rounded-sheet bg-surface-2 px-3.5 py-3">
        {pres && <Avatar id={pres.id} size="lg" />}
        <div className="grid min-w-0 flex-1">
          <b>{pres ? pres.name : t('Vacant')}</b>
          <small className="text-d12h text-mute">
            {t('President')}
            {g?.from ? `, ${t('since {d}', { d: fmtD(g.from) })}` : ''},{' '}
            {t('office record {n}', { n: a.office.version })}
          </small>
        </div>
        {pres && <Chip def={accDef(pres.status)} pill="pill-o" />}
      </div>
      {h ? (
        <HandoverCard h={h} />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 max-[899px]:grid-cols-1">
          {card(
            'normal',
            t('Normal handover'),
            isIncumbent
              ? t(
                  'Nominate a successor. They accept, then you confirm after signing in again. Your other roles are decided separately.',
                )
              : t('Only {who}, the incumbent, can start a normal handover.', {
                  who: pres ? pres.first : t('the President'),
                }),
            !!pres && isIncumbent && pres.status === 'active',
            t('Nominate a successor'),
          )}
          {card(
            'recovery',
            t('Emergency recovery'),
            isAdmin(m)
              ? t(
                  'Use when the President’s account is paused, deleted or unavailable. You are recorded as the recovery actor; it is never shown as the President’s own handover.',
                )
              : t(
                  'Only the Admin can start an emergency recovery, when the President’s account is paused, deleted or unavailable.',
                ),
            isAdmin(m) && !!pres,
            t('Start emergency recovery'),
          )}
        </div>
      )}
      <SectionHeading as="h2" count={past.length}>
        {t('Past handovers')}
      </SectionHeading>
      <Rows>
        {past.length ? (
          past.map((x) => (
            <Row key={x.id} className="cursor-default gap-2.5">
              <Avatar id={x.to} size="sm" />
              <RowText
                title={
                  <b>
                    {who.name(x.from)} → {who.name(x.to)}
                  </b>
                }
                sub={`${t(x.kind === 'recovery' ? 'Emergency recovery' : 'Normal handover')}, ${who.stamp(x.createdBy, x.createdAt)}`}
              />
              <Chip def={HO_ST[x.state]} pill="pill-o" />
            </Row>
          ))
        ) : (
          <EmptyLine>{t('No handovers recorded in dwdg’ONE yet.')}</EmptyLine>
        )}
      </Rows>
    </Page>
  );
}

export type { Workspace };
