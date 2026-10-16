/* One IT request: triage and an owner, questions to the requester, linked work, blockers, a resolution the requester confirms
   (or reopens), IT-only notes and the history. A request never authorizes a deployment or an access change by itself.
   From divisions/div-fnl-mcit.js itPage. */
import { useState } from 'react';
import { Link } from 'react-router';
import { useDivisionWorkspace } from '@/app/router/use-division-workspace';
import { Avatar } from '@/components/shared/Avatar';
import { Chip, Locked, Tag } from '@/components/shared/division-ui';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { SelectField } from '@/components/ui/SelectField';
import { TaskStatusMark } from '@/components/ui/StatusBadge';
import { Steps } from '@/components/ui/Steps';
import { NotAvailable, Page, PageHeader, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { addDays, dShort, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { taskOf } from '@/features/work/services/selectors';
import { isBoardP, safeUrl, unitName } from '@/features/fnl/services/fnl-data';
import {
  Acts,
  Box,
  ByAt,
  HistoryList,
  LinkOut,
  NextBox,
  Note,
  Who,
  fmtDT,
  useFieldErrors,
} from '@/features/fnl/components/fnl-parts';
import {
  addItTask,
  answerIt,
  askIt,
  blockIt,
  cancelIt,
  confirmIt,
  reopenIt,
  resolveIt,
  triageIt,
  unblockIt,
} from '../services/it';
import {
  IMPACT,
  IT,
  ITYPE,
  MC,
  PRIO,
  accOf,
  hasSecret,
  itOf,
  itPriv,
  mcitOf,
  mg,
  canSeeIt,
  seeAcc,
  type ItRequest,
  type Priority,
} from '../services/mcit-data';

const SECRET_MSG = 'This looks like a password or code. Remove it; IT never needs it here.';
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
const Cancel = () => (
  <Button variant="ghost" onClick={closeForm}>
    {t('Cancel')}
  </Button>
);
const Txt = ({
  id,
  value,
  onChange,
  bad,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  bad: boolean;
}) => (
  <textarea
    id={id}
    className={cn(textareaClass, 'min-h-16', bad && invalidClass)}
    value={value}
    autoFocus
    onChange={(e) => {
      onChange(e.target.value);
    }}
  />
);

function TriageSection({ x }: { x: ItRequest }) {
  const db = useWorkspace((w) => w);
  const form = useUi((u) => u.form);
  const s = mcitOf(db);
  const owners = [...new Set([...s.grants.tech, ...s.grants.triage])];
  const [owner, setOwner] = useState(x.owner ?? s.grants.tech[0] ?? '');
  const [prio, setPrio] = useState<Priority>(x.priority ?? 'medium');
  const [q, setQ] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <SectionHeading as="h2">{t('Triage')}</SectionHeading>
      <Grid2>
        <Field label={t('Owner')} htmlFor="mc-t-owner">
          <SelectField
            id="mc-t-owner"
            people
            value={owner}
            onChange={setOwner}
            options={owners.map((id) => ({ value: id, label: db.people.find((p) => p.id === id)?.name ?? id }))}
          />
        </Field>
        <Field label={t('Priority')} htmlFor="mc-t-prio" help={t('Priority is not a response-time promise.')}>
          <SelectField
            id="mc-t-prio"
            value={prio}
            onChange={(v) => {
              setPrio(v as Priority);
            }}
            options={(Object.keys(PRIO) as Priority[]).map((k) => ({ value: k, label: t(PRIO[k]) }))}
          />
        </Field>
      </Grid2>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            void triageIt(x.id, owner, prio);
          }}
        >
          {t('Assign')}
        </Button>
        <Button onClick={openForm('i-ask')}>{t('Ask for information')}</Button>
      </Acts>
      {form === 'i-ask' && (
        <>
          <Field
            label={t('What do you need to know?')}
            htmlFor="mc-ask-q"
            required
            help={fe.help('q')}
            error={fe.bad('q')}
          >
            <Txt
              id="mc-ask-q"
              value={q}
              bad={fe.bad('q')}
              onChange={(v) => {
                setQ(v);
                fe.clear();
              }}
            />
          </Field>
          <Acts>
            <Button
              variant="primary"
              onClick={() => {
                if (!q.trim()) return fe.fail('q', t('Say what you need to know.'));
                void askIt(x.id, q.trim());
              }}
            >
              {t('Send question')}
            </Button>
            <Cancel />
          </Acts>
        </>
      )}
    </>
  );
}

function Answer({ x, i }: { x: ItRequest; i: number }) {
  const [a, setA] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field
        label={t('Your answer')}
        htmlFor={`mc-ans-${String(i)}`}
        required
        help={fe.help('a', t('Never paste passwords or codes.'))}
        error={fe.bad('a')}
      >
        <Txt
          id={`mc-ans-${String(i)}`}
          value={a}
          bad={fe.bad('a')}
          onChange={(v) => {
            setA(v);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!a.trim()) return fe.fail('a', t('Write your answer.'));
            if (hasSecret(a)) return fe.fail('a', t(SECRET_MSG));
            void answerIt(x.id, i, a.trim());
          }}
        >
          {t('Send answer')}
        </Button>
      </Acts>
    </>
  );
}

function TaskForm({ id }: { id: string }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(addDays(today(), 2));
  const fe = useFieldErrors();
  return (
    <Box>
      <Grid2>
        <Field label={t('Task')} htmlFor="mc-k-title" required help={fe.help('t')} error={fe.bad('t')}>
          <input
            id="mc-k-title"
            className={cn(inputClass, fe.bad('t') && invalidClass)}
            value={title}
            autoComplete="off"
            autoFocus
            onChange={(e) => {
              setTitle(e.target.value);
              fe.clear();
            }}
          />
        </Field>
        <Field label={t('Due')} htmlFor="mc-k-due">
          <DateField id="mc-k-due" value={due} onChange={setDue} />
        </Field>
      </Grid2>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!title.trim()) return fe.fail('t', t('Name the task.'));
            void addItTask(id, { title: title.trim(), due: due || null });
          }}
        >
          {t('Create task')}
        </Button>
        <Cancel />
      </Acts>
      <Note>{t('One task, linked here. It shows in the owner’s My Work.')}</Note>
    </Box>
  );
}

function BlockForm({ id }: { id: string }) {
  const [text, setText] = useState('');
  const [action, setAction] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Field
        label={t('What blocks the work')}
        htmlFor="mc-b-text"
        required
        help={fe.help('text')}
        error={fe.bad('text')}
      >
        <Txt
          id="mc-b-text"
          value={text}
          bad={fe.bad('text')}
          onChange={(v) => {
            setText(v);
            fe.clear();
          }}
        />
      </Field>
      <Field label={t('Action needed')} htmlFor="mc-b-act" required help={fe.help('action')} error={fe.bad('action')}>
        <input
          id="mc-b-act"
          className={cn(inputClass, fe.bad('action') && invalidClass)}
          value={action}
          autoComplete="off"
          onChange={(e) => {
            setAction(e.target.value);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!text.trim()) return fe.fail('text', t('Say what blocks the work.'));
            if (!action.trim()) return fe.fail('action', t('Name the action needed.'));
            void blockIt(id, text.trim(), action.trim());
          }}
        >
          {t('Record blocker')}
        </Button>
        <Cancel />
      </Acts>
    </Box>
  );
}

function ResolveForm({ id }: { id: string }) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [ver, setVer] = useState('');
  const fe = useFieldErrors();
  return (
    <Box>
      <Field
        label={t('What was done')}
        htmlFor="mc-r-text"
        required
        help={fe.help('text', t('Changes to live systems follow the release steps outside this request.'))}
        error={fe.bad('text')}
      >
        <Txt
          id="mc-r-text"
          value={text}
          bad={fe.bad('text')}
          onChange={(v) => {
            setText(v);
            fe.clear();
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Evidence link')} htmlFor="mc-r-url" help={fe.help('url')} error={fe.bad('url')}>
          <input
            id="mc-r-url"
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
        <Field label={t('Version or change reference')} htmlFor="mc-r-ver">
          <input
            id="mc-r-ver"
            className={inputClass}
            value={ver}
            autoComplete="off"
            onChange={(e) => {
              setVer(e.target.value);
            }}
          />
        </Field>
      </Grid2>
      <Acts>
        <Button
          variant="primary"
          onClick={() => {
            if (!text.trim()) return fe.fail('text', t('Say what was done.'));
            if (url.trim() && !safeUrl(url.trim())) return fe.fail('url', t('Links must start with https://.'));
            if (hasSecret(text)) return fe.fail('text', t(SECRET_MSG));
            void resolveIt(id, { text: text.trim(), url: url.trim(), version: ver.trim() });
          }}
        >
          {t('Mark resolved')}
        </Button>
        <Cancel />
      </Acts>
    </Box>
  );
}

function ReopenForm({ id }: { id: string }) {
  const [why, setWhy] = useState('');
  const fe = useFieldErrors();
  return (
    <>
      <Field
        label={t('What still happens')}
        htmlFor="mc-o-why"
        required
        help={fe.help('why', t('New facts help IT. The request keeps its history.'))}
        error={fe.bad('why')}
      >
        <Txt
          id="mc-o-why"
          value={why}
          bad={fe.bad('why')}
          onChange={(v) => {
            setWhy(v);
            fe.clear();
          }}
        />
      </Field>
      <Acts>
        <Button
          variant="danger"
          onClick={() => {
            if (!why.trim()) return fe.fail('why', t('Say what still happens.'));
            if (hasSecret(why)) return fe.fail('why', t(SECRET_MSG));
            void reopenIt(id, why.trim());
          }}
        >
          {t('Reopen')}
        </Button>
        <Cancel />
      </Acts>
    </>
  );
}

export function ItPage({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const form = useUi((u) => u.form);
  useDivisionWorkspace(MC);
  const x = itOf(db, id);
  if (!x || !canSeeIt(x, m))
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  const s = mcitOf(db);
  const req = x.requester === m?.id;
  const tri = mg(db, 'triage', m?.id);
  const tech = mg(db, 'tech', m?.id) || x.owner === m?.id;
  const board = isBoardP(m);
  const acc = accOf(db, x.service);
  const first = (pid: string | null | undefined) => db.people.find((p) => p.id === pid)?.first ?? '';
  const nextMap: Record<ItRequest['stage'], [string | null, string]> = {
    new: [s.grants.triage[0] ?? null, t('IT triages it and names an owner. No response time is promised.')],
    triaged: [x.owner, t('{who} plans the work.', { who: first(x.owner) })],
    working: [x.owner, t('{who} is working on it.', { who: first(x.owner) })],
    waiting: [
      x.blocker ? x.owner : x.requester,
      x.blocker ? t('Blocked: {r}', { r: x.blocker.action }) : t('Waiting for your answer.'),
    ],
    resolved: [x.requester, t('{who} confirms it is solved or reopens it.', { who: first(x.requester) })],
    closed: [null, t('Closed after the requester confirmed it.')],
    reopened: [x.owner, t('Reopened with new facts. {who} looks again.', { who: first(x.owner) })],
    cancelled: [null, t('Canceled. The history stays.')],
  };
  const next = nextMap[x.stage];
  const tasks = x.tasks.map((tid) => taskOf(db, tid)).filter((tk): tk is NonNullable<typeof tk> => !!tk);
  const stepIdx = { new: 0, reopened: 2, triaged: 1, working: 2, waiting: 2, resolved: 3, closed: 5, cancelled: 0 }[
    x.stage
  ];
  const canWork = (tech || tri) && !board;
  return (
    <Page>
      <PageHeader title={x.title} sub={`${t(ITYPE[x.type])}${acc && seeAcc(acc, m) ? ` · ${acc.service}` : ''}`}>
        <Chip def={IT[x.stage]} pill="pill-o" />
      </PageHeader>
      <Steps
        className="mt-4 mb-1.5 max-w-[760px]"
        labels={[t('New'), t('Triaged'), t('Working'), t('Resolved'), t('Closed')]}
        current={stepIdx}
      />
      <NextBox who={next[0]} text={next[1]} />
      {x.blocker ? (
        <Notice
          icon="warning"
          tone="warn"
          className="mt-3 mb-3"
          title={<b>{t('Blocked')}</b>}
          actions={
            canWork && (
              <Button
                small
                onClick={() => {
                  void unblockIt(x.id);
                }}
              >
                {t('Blocker cleared')}
              </Button>
            )
          }
        >
          <p>{x.blocker.text}</p>
          <p>
            {t('Next action: {a}', { a: x.blocker.action })} ·{' '}
            {db.people.find((p) => p.id === x.blocker?.by)?.name ?? ''}, {fmtDT(x.blocker.at)}
          </p>
        </Notice>
      ) : (
        canWork &&
        ['triaged', 'working', 'reopened'].includes(x.stage) &&
        (form === 'i-blk' ? (
          <BlockForm id={x.id} />
        ) : (
          <Acts>
            <Button variant="ghost" onClick={openForm('i-blk')}>
              {t('Record a blocker')}
            </Button>
          </Acts>
        ))
      )}
      <Meta className="mt-4 mb-1.5 max-w-[760px] grid-cols-[150px_1fr] max-[760px]:grid-cols-1 [&_dd]:min-w-0 [&_dd]:flex-wrap">
        <MetaRow label={t('Created by')}>
          <ByAt id={x.createdBy} at={x.createdAt} />
        </MetaRow>
        <MetaRow label={t('Requester')}>
          <Who id={x.requester} />
        </MetaRow>
        <MetaRow label={t('Unit')}>{unitName(x.unit)}</MetaRow>
        <MetaRow label={t('Owner')}>
          <Who id={x.owner} />
        </MetaRow>
        <MetaRow label={t('Priority')}>
          {x.priority ? t(PRIO[x.priority]) : <span className="text-mute">{t('Not triaged')}</span>}
        </MetaRow>
        <MetaRow label={t('Service')}>
          {acc && seeAcc(acc, m) ? (
            <>
              <Link to="/accounts-register">{acc.service}</Link> · {t('custodian')}{' '}
              {acc.custodian ? <Who id={acc.custodian} /> : <Tag unknown>{t('Unknown')}</Tag>}
            </>
          ) : (
            <span className="text-mute">{t('Not listed')}</span>
          )}
        </MetaRow>
        <MetaRow label={t('Who is affected')}>{t(IMPACT[x.impact])}</MetaRow>
        <MetaRow label={t('What happens')}>
          <span className="whitespace-pre-line">{x.symptom}</span>
        </MetaRow>
        <MetaRow label={t('What should happen')}>
          <span className="whitespace-pre-line">{x.expected}</span>
        </MetaRow>
        {x.steps && (
          <MetaRow label={t('Steps to see it')}>
            <span className="whitespace-pre-line">{x.steps}</span>
          </MetaRow>
        )}
        {x.evidence && (
          <MetaRow label={t('Evidence')}>
            <LinkOut label={x.evidence.label} url={x.evidence.url} />
          </MetaRow>
        )}
      </Meta>
      {['new', 'reopened'].includes(x.stage) && tri && !board && <TriageSection x={x} />}
      {x.info.length > 0 && (
        <>
          <SectionHeading as="h2" count={x.info.length}>
            {t('Questions')}
          </SectionHeading>
          {x.info.map((q, i) => (
            <Box key={q.at}>
              <p className="text-d13 text-mute">
                <ByAt id={q.by} at={q.at} />
              </p>
              <p className="whitespace-pre-line">{q.q}</p>
              {q.a ? (
                <p className="pt-1.5">
                  <b>{t('Answer')}</b> <span className="whitespace-pre-line">{q.a}</span>
                </p>
              ) : req && !board ? (
                <Answer x={x} i={i} />
              ) : (
                <Note>{t('Waiting for the requester.')}</Note>
              )}
            </Box>
          ))}
        </>
      )}
      {!['new', 'cancelled'].includes(x.stage) && (
        <>
          <SectionHeading as="h2" count={tasks.length}>
            {t('Linked work')}
          </SectionHeading>
          {tasks.length ? (
            <Rows>
              {tasks.map((tk) => (
                <Row
                  key={tk.id}
                  className="gap-2.5"
                  onOpen={() => {
                    openTask(tk.id);
                  }}
                >
                  <Avatar id={tk.owner} size="sm" />
                  <RowText
                    title={<b>{tk.title}</b>}
                    sub={`${first(tk.owner)}${tk.due ? ` · ${dShort(tk.due)}` : ''}`}
                  />
                  <TaskStatusMark status={tk.status} />
                </Row>
              ))}
            </Rows>
          ) : (
            <Note>{t('No task linked yet.')}</Note>
          )}
          {(tech || tri) &&
            !board &&
            !['closed', 'resolved'].includes(x.stage) &&
            (form === 'i-task' ? (
              <TaskForm id={x.id} />
            ) : (
              <Acts>
                <Button onClick={openForm('i-task')}>
                  <Icon name="plus" />
                  {t('Create linked task')}
                </Button>
              </Acts>
            ))}
        </>
      )}
      {x.resolution && (
        <>
          <SectionHeading as="h2">{t('Resolution')}</SectionHeading>
          <Box>
            <p className="whitespace-pre-line">{x.resolution.text}</p>
            <Meta className="mt-3 grid-cols-[110px_1fr]">
              <MetaRow label={t('Recorded by')}>
                <ByAt id={x.resolution.by} at={x.resolution.at} />
              </MetaRow>
              {x.resolution.url && (
                <MetaRow label={t('Evidence')}>
                  <LinkOut label={t('Fix evidence')} url={x.resolution.url} />
                </MetaRow>
              )}
              {x.resolution.version && <MetaRow label={t('Version')}>{x.resolution.version}</MetaRow>}
            </Meta>
            <Note>{t('A closed request is not a security test result.')}</Note>
          </Box>
        </>
      )}
      {tech &&
        !board &&
        ['working', 'triaged', 'reopened'].includes(x.stage) &&
        !x.blocker &&
        (form === 'i-res' ? (
          <ResolveForm id={x.id} />
        ) : (
          <Acts>
            <Button variant="primary" onClick={openForm('i-res')}>
              <Icon name="check" />
              {t('Mark resolved')}
            </Button>
          </Acts>
        ))}
      {x.stage === 'resolved' && req ? (
        <>
          <SectionHeading as="h2">{t('Is it solved?')}</SectionHeading>
          {form === 'i-reopen' ? (
            <ReopenForm id={x.id} />
          ) : (
            <Acts>
              <Button
                variant="primary"
                onClick={() => {
                  void confirmIt(x.id);
                }}
              >
                <Icon name="check" />
                {t('Yes, it is solved')}
              </Button>
              <Button onClick={openForm('i-reopen')}>{t('No, reopen it')}</Button>
            </Acts>
          )}
        </>
      ) : (
        x.confirm && (
          <p className="my-2 text-d13">
            <Chip def={['Confirmed solved', 'check', 'green']} /> <ByAt id={x.confirm.by} at={x.confirm.at} />
            {x.confirm.note && ` · ${x.confirm.note}`}
          </p>
        )
      )}
      <SectionHeading as="h2">{t('IT notes')}</SectionHeading>
      {itPriv(db, m) ? (
        x.priv ? (
          <p className="whitespace-pre-line">{x.priv}</p>
        ) : (
          <Note>{t('No notes.')}</Note>
        )
      ) : (
        <Locked>{t('Restricted to IT')}</Locked>
      )}
      <SectionHeading as="h2" count={x.history.length}>
        {t('History')}
      </SectionHeading>
      <HistoryList rows={x.history} />
      {req && ['new', 'triaged'].includes(x.stage) && (
        <Acts className="mt-7">
          <Button
            variant="ghost"
            onClick={() => {
              void cancelIt(x.id);
            }}
          >
            {t('Cancel request')}
          </Button>
        </Acts>
      )}
    </Page>
  );
}
