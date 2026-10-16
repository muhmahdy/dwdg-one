/* Move, pause or end a membership: one preview page (flow-transfer-preview, flow-revoke-preview). Choose the details, see what
   changes, decide each open duty, then apply. Nothing changes until Apply. From screens/accounts.js flowPage. */
import { useState } from 'react';
import { Link } from 'react-router';
import { DIVS, divisionOf } from '@/app/config/org';
import { Avatar, roleText } from '@/components/shared/Avatar';
import { Button, buttonClass } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, Segmented, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { EmptyLine, SectionHeading, SubHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField, type Choice } from '@/components/ui/SelectField';
import { Chip } from '@/components/ui/StatusBadge';
import { NotAvailable, Page, PageHeader } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { isBoard } from '@/lib/roles';
import { dShort, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { taskDiv } from '@/features/work/services/selectors';
import type { DivisionId, Person, Task, Workspace } from '@/types/workspace';
import { FLOW_TITLE, applyFlow, type FlowKind } from '../services/account-actions';
import { accDef, fmtD } from '../services/acct-data';
import { dutiesOf, dutyCount } from '../services/duties';
import { can, canMembers, inView } from '../services/rules';
import { AcctCrumb, DeltaList, Duty } from './AccountsParts';

export function FlowCrumb({ id, kind }: { id: string; kind: FlowKind }) {
  const p = useWorkspace((db) => db.people.find((x) => x.id === id));
  return (
    <AcctCrumb
      parts={[
        ['members', t('Members')],
        [p ? `members/${p.id}` : '', p ? p.name : t('Person')],
        ['', t(FLOW_TITLE[kind][1])],
      ]}
    />
  );
}

const ctxOf = (db: Workspace, tk: Task) => {
  const p = db.projects.find((x) => x.id === tk.project);
  return p ? p.name : tk.div ? (divisionOf(tk.div)?.short ?? '') : '';
};

type Choices = Record<string, string>;

function DutyBlock({
  kind,
  p,
  choices,
  setChoice,
}: {
  kind: FlowKind;
  p: Person;
  choices: Choices;
  setChoice: (k: string, v: string) => void;
}) {
  const db = useWorkspace((w) => w);
  const d = dutiesOf(db, p.id);
  const pool = (dv: DivisionId | null | undefined, ex: string[] = []): Person[] =>
    db.people
      .filter(
        (x) => x.status === 'active' && !isBoard(x) && x.id !== p.id && !ex.includes(x.id) && (!dv || x.div === dv),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  const stays =
    kind === 'transfer'
      ? t('Kept. Roles across divisions stay as explicit collaboration; review them with the lead.')
      : t('Unresolved until the lead or Director names a successor.');
  if (!dutyCount(d))
    return <EmptyLine>{t('{who} has no open duties recorded in dwdg’ONE.', { who: p.first })}</EmptyLine>;
  const taskOpts = (tk: Task): Choice[] => [
    ...(kind === 'transfer' ? [{ value: 'keep', label: t('Keep with {who}', { who: p.first }) }] : []),
    { value: 'open', label: t('Leave unresolved, visible to leads') },
    ...pool(taskDiv(db, tk) ?? p.div).map((x) => ({
      value: `offer:${x.id}`,
      label: t('Offer to {who}', { who: x.name }),
    })),
  ];
  const revOpts = (tk: Task): Choice[] => [
    { value: 'open', label: t('Leave unresolved, visible to leads') },
    ...pool(taskDiv(db, tk), [tk.owner]).map((x) => ({
      value: `ask:${x.id}`,
      label: t('Ask {who} to review', { who: x.name }),
    })),
  ];
  const sel = (k: string, def: string, opts: Choice[]) => (
    <SelectField
      small
      className="w-60 flex-none max-[600px]:w-full"
      value={choices[k] ?? def}
      onChange={(v) => {
        setChoice(k, v);
      }}
      options={opts}
    />
  );
  const list = (title: string, n: number, rows: React.ReactNode) =>
    n > 0 && (
      <>
        <SubHeading count={n}>{title}</SubHeading>
        <div className="mb-2 grid gap-[3px]">{rows}</div>
      </>
    );
  const plain = (title: string, sub: string, h?: string) => (
    <Duty key={title + sub} title={h ? <Link to={`/${h}`}>{title}</Link> : title} sub={sub} />
  );
  return (
    <>
      {list(
        t('Tasks {who} is responsible for', { who: p.first }),
        d.tasks.length,
        d.tasks.map((tk) => (
          <Duty
            key={tk.id}
            title={tk.title}
            sub={`${ctxOf(db, tk)}${tk.due ? `, ${t('due {d}', { d: dShort(tk.due) })}` : ''}`}
          >
            {sel(`map:${tk.id}`, kind === 'transfer' ? 'keep' : 'open', taskOpts(tk))}
          </Duty>
        )),
      )}
      {list(
        t('Reviews waiting for {who}', { who: p.first }),
        d.reviews.length,
        d.reviews.map((tk) => (
          <Duty
            key={tk.id}
            title={tk.title}
            sub={t('Review for {who}', { who: db.people.find((x) => x.id === tk.owner)?.name ?? '' })}
          >
            {sel(`rev:${tk.id}`, 'open', revOpts(tk))}
          </Duty>
        )),
      )}
      {list(
        t('Tasks {who} shares', { who: p.first }),
        d.shared.length,
        d.shared.map((tk) =>
          plain(
            tk.title,
            t('Responsible: {who}. The responsible person stays the same.', {
              who: db.people.find((x) => x.id === tk.owner)?.name ?? '',
            }),
          ),
        ),
      )}
      {list(
        t('Projects {who} leads or manages', { who: p.first }),
        d.projects.length,
        d.projects.map((x) => plain(x.name, stays, `projects/${x.id}`)),
      )}
      {list(
        t('Decisions waiting for {who}', { who: p.first }),
        d.decisions.length,
        d.decisions.map((x) => plain(x.question, stays)),
      )}
      {list(
        t('Routines {who} runs', { who: p.first }),
        d.routines.length,
        d.routines.map((x) => plain(x.name, stays, `operations/${x.id}`)),
      )}
      {list(
        t('Resources {who} looks after', { who: p.first }),
        d.resources.length,
        d.resources.map((x) => plain(x.name, stays)),
      )}
      {list(
        t('Offers waiting for {who}’s answer', { who: p.first }),
        d.offersIn.length,
        d.offersIn.map((o) =>
          plain(
            o.title,
            t('From {who}. Still unanswered; it never counts as accepted.', {
              who: db.people.find((x) => x.id === o.from)?.name ?? '',
            }),
          ),
        ),
      )}
      <p className="text-mute type-small">
        {t('Nothing is completed, deleted or reassigned on its own. An offer waits until the new person accepts it.')}
      </p>
    </>
  );
}

export function FlowPage({ id, kind }: { id: string; kind: FlowKind }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const p = db.people.find((x) => x.id === id);
  const others = DIVS.filter((d) => d.id !== p?.div);
  const [to, setTo] = useState<DivisionId | ''>(others[0]?.id ?? '');
  const [date, setDate] = useState(today());
  const [why, setWhy] = useState('');
  const [rev, setRev] = useState('');
  const [leaving, setLeaving] = useState<'left' | 'alumni'>('left');
  const [choices, setChoices] = useState<Choices>({});
  const [err, setErr] = useState<{ field: 'why' | 'date'; text: string } | null>(null);
  if (!m || !p || isBoard(p) || !canMembers(m) || !inView(m, p))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const c = can(kind, m, p);
  const title = t(FLOW_TITLE[kind][0], { who: p.first });
  if (!c.ok)
    return (
      <Page>
        <PageHeader title={title} />
        <Notice icon="lock" tone="error" title={<b>{t('You can’t do this')}</b>}>
          <p>{c.why}</p>
          <div className="mt-2">
            <Link className={buttonClass('default', true)} to={`/members/${p.id}`}>
              {t('Back')}
            </Link>
          </div>
        </Notice>
        <p className="mt-[18px] text-mute type-small">{t('Nothing was changed.')}</p>
      </Page>
    );
  const dest = divisionOf(to);
  const here = divisionOf(p.div);
  const danger = kind !== 'transfer';
  const verb =
    kind === 'transfer'
      ? t('Move {who} to {d}', { who: p.first, d: dest?.short ?? '' })
      : kind === 'pause'
        ? t('Pause {who}’s access', { who: p.first })
        : leaving === 'alumni'
          ? t('Make {who} alumni', { who: p.first })
          : t('End {who}’s membership', { who: p.first });
  const bad = (field: 'why' | 'date') => err?.field === field;
  const apply = () => {
    if (kind === 'pause' && !why.trim()) {
      setErr({ field: 'why', text: t('Say why access must stop.') });
      return;
    }
    if (kind === 'leave' && !why.trim()) {
      setErr({ field: 'why', text: t('Give a reason for the record.') });
      return;
    }
    if ((kind === 'transfer' || kind === 'leave') && date > today()) {
      setErr({
        field: 'date',
        text: t('The prototype’s day is fixed at {d}. Choose today or earlier.', { d: fmtD(today()) }),
      });
      return;
    }
    setErr(null);
    void applyFlow({
      kind,
      person: p.id,
      date,
      why: why.trim(),
      ...(kind === 'transfer' && to ? { to } : {}),
      ...(kind === 'leave' ? { leaving } : {}),
      review: rev || null,
      choices,
    });
  };
  const whyField = (multi: boolean, label: string, help?: string, optional = false) => (
    <Field label={label} htmlFor="acct-why" optional={optional} help={bad('why') ? err?.text : help} error={bad('why')}>
      {multi ? (
        <textarea
          id="acct-why"
          className={cn(textareaClass, bad('why') && invalidClass)}
          placeholder={t('What happened and why access must stop now')}
          value={why}
          onChange={(e) => {
            setWhy(e.target.value);
          }}
        />
      ) : (
        <input
          id="acct-why"
          className={cn(inputClass, bad('why') && invalidClass)}
          placeholder={kind === 'leave' ? t('Private') : t('For the record')}
          value={why}
          onChange={(e) => {
            setWhy(e.target.value);
          }}
        />
      )}
    </Field>
  );
  const dateField = (label: string) => (
    <Field
      label={label}
      htmlFor="acct-eff"
      help={bad('date') ? err?.text : undefined}
      error={bad('date')}
      className="mb-[22px]"
    >
      <DateField id="acct-eff" value={date} onChange={setDate} />
    </Field>
  );
  return (
    <Page>
      <Link
        className="mb-2 inline-flex items-center gap-1 py-2 text-[length:14px] font-semibold text-mute no-underline"
        to={`/members/${p.id}`}
      >
        <Icon name="left" className="size-3" />
        {p.name}
      </Link>
      <PageHeader title={title} sub={t(FLOW_TITLE[kind][2])} />
      <div className="mt-2 mb-1 flex items-center gap-3 rounded-sheet bg-surface-2 px-3.5 py-3">
        <Avatar id={p.id} size="lg" />
        <div className="grid min-w-0 flex-1">
          <b>{p.name}</b>
          <small className="text-d12h text-mute">{roleText(p)}</small>
        </div>
        <Chip def={accDef(p.status)} pill="pill-o" />
      </div>
      <SectionHeading as="h2">{t('Details')}</SectionHeading>
      <div className="max-w-[640px]">
        {kind === 'transfer' && (
          <>
            <Grid2>
              <Field label={t('From')} htmlFor="acct-from" className="mb-[22px]">
                <input
                  id="acct-from"
                  className={cn(inputClass, 'text-ink opacity-100')}
                  value={here?.name ?? ''}
                  disabled
                />
              </Field>
              <Field label={t('To')} htmlFor="acct-to" className="mb-[22px]">
                <SelectField
                  id="acct-to"
                  value={to}
                  onChange={(v) => {
                    setTo(v as DivisionId);
                  }}
                  options={others.map((d) => ({ value: d.id, label: d.name }))}
                />
              </Field>
            </Grid2>
            <Grid2>
              {dateField(t('Effective date'))}
              {whyField(false, t('Reason'), undefined, true)}
            </Grid2>
          </>
        )}
        {kind === 'pause' && (
          <>
            {whyField(
              true,
              t('Reason'),
              t('Only the Admin, the President, HR leads and you can read this. It never appears in Changes.'),
            )}
            <Grid2>
              <Field label={t('Effective')} htmlFor="acct-from">
                <input id="acct-from" className={inputClass} value={t('Now')} disabled />
              </Field>
              <Field label={t('Review by')} htmlFor="acct-rev" optional help={t('When someone looks at this again.')}>
                <DateField id="acct-rev" value={rev} onChange={setRev} />
              </Field>
            </Grid2>
          </>
        )}
        {kind === 'leave' && (
          <>
            <div className="mt-1 mb-3">
              <Segmented<'left' | 'alumni'>
                label={t('Kind')}
                value={leaving}
                onChange={setLeaving}
                options={[
                  ['left', t('Leaving DWDG')],
                  ['alumni', t('Alumni, end of term')],
                ]}
              />
            </div>
            <Grid2>
              {dateField(t('Last day'))}
              {whyField(false, t('Reason'), t('Only HR leads, the Admin and the President read this.'))}
            </Grid2>
          </>
        )}
      </div>
      <SectionHeading as="h2">{t('What changes for {who}', { who: p.first })}</SectionHeading>
      <DeltaList
        items={
          kind === 'transfer'
            ? [
                {
                  kind: 'minus',
                  icon: 'minus',
                  text: t('Loses the {d} workspace: its projects, operations, resources and Changes.', {
                    d: here?.name ?? '',
                  }),
                },
                { kind: 'plus', icon: 'plus', text: t('Gets the {d} workspace as a Member.', { d: dest?.name ?? '' }) },
                {
                  icon: 'check',
                  text: t(
                    'Keeps the same person record, the consultant function, accepted tasks you keep below and shared project roles.',
                  ),
                },
                {
                  icon: 'lock',
                  text: t('Attendance, assessments and authorship stay recorded under {d}.', { d: here?.short ?? '' }),
                },
              ]
            : kind === 'pause'
              ? [
                  {
                    kind: 'minus',
                    icon: 'lock',
                    text: t('Can’t sign in or use any function from now. An open session stops at its next action.'),
                  },
                  {
                    icon: 'check',
                    text: t(
                      'Tasks, records and history stay. Nothing is completed, deleted or reassigned automatically.',
                    ),
                  },
                  {
                    icon: 'external',
                    text: t(
                      'Google Drive files shared with them need removing there; dwdg’ONE can’t revoke a shared link.',
                    ),
                  },
                ]
              : [
                  { kind: 'minus', icon: 'logout', text: t('Current access ends on the last day.') },
                  { icon: 'check', text: t('Their name stays on everything they did. History is never erased.') },
                  ...(leaving === 'alumni'
                    ? [
                        {
                          icon: 'info',
                          text: t(
                            'Alumni read-only access is a separate grant that is not decided yet, so none is given now.',
                          ),
                        },
                      ]
                    : []),
                  {
                    icon: 'external',
                    text: t('Accounts and files they own outside dwdg’ONE need a handover at the provider.'),
                  },
                ]
        }
      />
      <SectionHeading as="h2" count={dutyCount(dutiesOf(db, p.id))}>
        {t('Open duties')}
      </SectionHeading>
      <DutyBlock
        kind={kind}
        p={p}
        choices={choices}
        setChoice={(k, v) => {
          setChoices((cur) => ({ ...cur, [k]: v }));
        }}
      />
      <div className="mt-[22px]">
        <Notice
          icon={danger ? 'warning' : 'info'}
          tone={danger ? 'warn' : 'info'}
          title={<b>{t('Review, then apply')}</b>}
        >
          <p>
            {kind === 'transfer'
              ? t('{who} and both workspaces see a move entry. Private details are not shown.', { who: p.first })
              : t(
                  'The account audit records you as the actor, with the reason. Changes shows only that access changed.',
                )}
          </p>
        </Notice>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant={danger ? 'danger' : 'primary'} onClick={apply}>
            {verb}
          </Button>
          <Link className={buttonClass('ghost')} to={`/members/${p.id}`}>
            {t('Cancel')}
          </Link>
        </div>
      </div>
    </Page>
  );
}
