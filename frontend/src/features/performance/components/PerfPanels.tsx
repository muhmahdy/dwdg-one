/* Side panels of the Performance module: the records behind a figure (perf-list), an escalation (perf-esc) and the form that
   sends a blocker to the President (perf-esc-new). From screens/perf.js INSP entries. */
import { useState } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import type { InspectorRef } from '@/app/ui-state';
import { Avatar, roleText } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { ProjectObject } from '@/components/shared/art/objects';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { Steps } from '@/components/ui/Steps';
import { Stage, State, TaskStatusMark } from '@/components/ui/StatusBadge';
import { Empty, Row, RowText, Rows } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openMilestone, openOffer, openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { isBoard, isPres, isTopOrAdmin, isVP } from '@/lib/roles';
import { dLong, dShort, today } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { MsState } from '@/features/projects/components/Cells';
import { Meta, MetaRow, SevTag } from '@/features/work/components/task-panel/parts';
import { isDone, projOf, taskOf } from '@/features/work/services/selectors';
import { attDef, regTitle } from '@/features/hr/services/hr-data';
import type { Blocker, Task } from '@/types/workspace';
import {
  ESC_ST,
  acknowledge,
  escalationsOf,
  nextOwnerChoices,
  resolveEscalation,
  returnForInfo,
  sendAgain,
  sendEscalation,
  withdrawEscalation,
  type Escalation,
} from '../services/escalations';
import { METRIC, attFacts, divFacts, periodOf, taskFacts } from '../services/facts';
import { canSeePerson, activePeople, hrAll } from '../services/scope';
import { Chip } from './PerfParts';

const h2 = 'mt-3 mb-1 type-h2';
const quiet = 'text-mute type-small';

const NotYours = ({ head, children }: { head: string; children?: string }) => (
  <>
    <InspectorHead>{head}</InspectorHead>
    <Empty title={t('This is not available to you')}>{children ?? t('It may be outside your scope.')}</Empty>
  </>
);

// ---------- the list behind a figure ----------
function TaskLine({ task }: { task: Task }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const p = projOf(db, task.project);
  const done = isDone(task);
  const dd = (task.doneAt ?? '').slice(0, 10);
  return (
    <Row
      onOpen={() => {
        openTask(task.id);
      }}
    >
      <Avatar id={task.owner} size="sm" />
      <RowText
        title={<b>{task.title}</b>}
        sub={`${p ? `${p.name}, ` : ''}${
          done ? t('done {d}', { d: dShort(dd) }) : task.due ? t('due {d}', { d: dShort(task.due) }) : t('No date')
        }${task.due && done ? `, ${t('due {d}', { d: dShort(task.due) })}` : ''}, ${t('created by {who}', { who: who.first(task.createdBy) })}`}
      />
      {done ? (
        <TaskStatusMark status="done" />
      ) : task.due && task.due < today() ? (
        <State label={t('Overdue')} icon="warning" tone="danger" />
      ) : (
        <TaskStatusMark status={task.status} />
      )}
    </Row>
  );
}

function BlockerLine({ b }: { b: Blocker }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const tk = taskOf(db, b.task);
  return (
    <Row
      onOpen={() => {
        openTask(b.task);
      }}
    >
      <Avatar id={b.owner} size="sm" />
      <RowText
        title={<b>{b.text}</b>}
        sub={`${tk?.title ?? ''}, ${t('{who} can unblock it', { who: who.first(b.owner) })}, ${t('raised by {who} {d}', { who: who.first(b.openedBy), d: dShort(b.openedAt.slice(0, 10)) })}`}
      />
      <SevTag severity={b.severity} />
    </Row>
  );
}

const NoRecords = () => <Empty title={t('None recorded')}>{t('Nothing in the records matches.')}</Empty>;

function PerfListPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const [scope, id = '', metric = '', pk] = String(insp.id).split(':');
  const P = periodOf(pk);
  if (!m) return null;
  const head = t(METRIC[metric] ?? 'Records');
  const ok =
    scope === 'p'
      ? canSeePerson(db, m, id)
      : isBoard(m) || isTopOrAdmin(m) || hrAll(m) || (m.role === 'director' && m.div === id);
  if (!ok) return <NotYours head={head} />;
  const whoTxt = scope === 'p' ? who.name(id) : (divisionOf(id)?.name ?? '');
  const right = ['overdue', 'blockers', 'signoff', 'projects', 'msLate'].includes(metric);
  let list: React.ReactNode = null;
  if (metric === 'att') {
    const af = attFacts(db, id, P);
    list = af?.regs.length ? (
      <>
        <Rows>
          {af.regs.map((r) => {
            const def = attDef(r.st);
            return (
              <Link key={r.g.id} to={`/attendance/${r.g.id}`} className="no-underline">
                <Row>
                  <Icon name="calendar" />
                  <RowText
                    title={<b>{regTitle(db, r.g)}</b>}
                    sub={
                      r.final
                        ? t('Finalized {d}', { d: dShort((r.g.finalAt ?? '').slice(0, 10)) })
                        : t('Register not finalized yet')
                    }
                  />
                  <Chip def={def} />
                </Row>
              </Link>
            );
          })}
        </Rows>
        <p className={quiet}>{t('Absence reasons are private and never shown here.')}</p>
      </>
    ) : (
      <Empty title={t('Unknown')}>{t('No register in this period expects this person.')}</Empty>
    );
  } else if (scope === 'd' && ['done', 'overdue', 'blockers', 'projects', 'msLate'].includes(metric)) {
    const f = divFacts(db, id, P);
    let rows: React.ReactNode[] = [];
    if (metric === 'projects')
      rows = f.projects.map((p) => (
        <Link key={p.id} to={`/projects/${p.id}`} className="no-underline">
          <Row>
            <ProjectObject project={p} size="sm" />
            <RowText title={<b>{p.name}</b>} sub={`${t('Lead')}: ${p.lead ? who.first(p.lead) : t('Not named')}`} />
            <Stage stage={p.stage} />
          </Row>
        </Link>
      ));
    else if (metric === 'msLate')
      rows = f.msLate.map((ms) => (
        <Row
          key={ms.id}
          onOpen={() => {
            openMilestone(ms.id);
          }}
        >
          <Icon name="flag" />
          <RowText title={<b>{ms.title}</b>} sub={`${projOf(db, ms.project)?.name ?? ''}, ${dShort(ms.target)}`} />
          <MsState m={ms} />
        </Row>
      ));
    else if (metric === 'blockers') rows = f.blockers.map((b) => <BlockerLine key={b.id} b={b} />);
    else rows = (metric === 'done' ? f.done : f.overdue).map((x) => <TaskLine key={x.id} task={x} />);
    list = rows.length ? <Rows>{rows}</Rows> : <NoRecords />;
  } else if (scope === 'p') {
    const tf = taskFacts(db, id, P);
    let rows: React.ReactNode[] = [];
    if (metric === 'offers')
      rows = tf.offers.map((o) => (
        <Row
          key={o.id}
          onOpen={() => {
            openOffer(o.id);
          }}
        >
          <Avatar id={o.from} size="sm" />
          <RowText
            title={<b>{o.title}</b>}
            sub={t('From {who}, accepted {d}', {
              who: who.first(o.from),
              d: dShort((o.answeredAt ?? '').slice(0, 10)),
            })}
          />
          <State label={t('Accepted')} icon="check" tone="green" />
        </Row>
      ));
    else if (metric === 'blockers') rows = tf.blockers.map((b) => <BlockerLine key={b.id} b={b} />);
    else {
      const src = (tf as unknown as Record<string, Task[] | undefined>)[metric] ?? [];
      rows = src.map((x) => <TaskLine key={x.id} task={x} />);
    }
    list = rows.length ? <Rows>{rows}</Rows> : <NoRecords />;
  }
  return (
    <>
      <InspectorHead>{head}</InspectorHead>
      <h2 className={h2}>{whoTxt}</h2>
      <p className={quiet}>{right ? t('Right now') : P.label}</p>
      {list}
      <p className={cn(quiet, 'mt-3')}>
        {t('Read from the same records the division uses. Nothing here is typed in by hand.')}
      </p>
    </>
  );
}

// ---------- an escalation ----------
const STEPS = ['requested', 'acknowledged', 'resolved'] as const;

function EscSteps({ e }: { e: Escalation }) {
  const i = e.state === 'returned' ? 0 : STEPS.indexOf(e.state as (typeof STEPS)[number]);
  return <Steps labels={STEPS.map((s) => t(ESC_ST[s][0]))} current={i} />;
}

const Quote = ({ children }: { children: React.ReactNode }) => (
  <p className="my-2 rounded-[10px] bg-surface-2 px-3.5 py-3 text-ink-2">{children}</p>
);

const SubForm = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3.5 rounded-[10px] bg-surface-2 p-3.5">{children}</div>
);

type EscForm = 'esc-ack' | 'esc-ret' | 'esc-res' | 'esc-again' | null;

function EscalationActions({ e, initial }: { e: Escalation; initial: EscForm }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const b = db.blockers.find((v) => v.id === e.blocker);
  const [form, setForm] = useState<EscForm>(initial);
  const [next, setNext] = useState(b?.owner ?? '');
  const [date, setDate] = useState(e.neededBy ?? '');
  const [text, setText] = useState(form === 'esc-again' ? e.reason : '');
  const [err, setErr] = useState<string | null>(null);
  if (!m || isBoard(m)) return null;
  const canTo = e.to === m.id;
  const canFrom = e.from === m.id;
  const open = (f: EscForm) => {
    setForm(f);
    setErr(null);
    setText(f === 'esc-again' ? e.reason : '');
  };
  const run = async (need: string, msg: string, go: () => Promise<boolean>) => {
    if (!need.trim()) {
      setErr(msg);
      return;
    }
    if (await go()) {
      setForm(null);
      setErr(null);
    }
  };
  const cancel = (
    <Button
      variant="ghost"
      onClick={() => {
        open(null);
      }}
    >
      {t('Cancel')}
    </Button>
  );
  const area = (id: string, label: string, rows: number, msg: string) => (
    <Field label={label} htmlFor={id} help={err} error={!!err}>
      <textarea
        id={id}
        className={cn(textareaClass, err && invalidClass)}
        rows={rows}
        value={text}
        autoFocus
        onChange={(ev) => {
          setText(ev.target.value);
          setErr(null);
        }}
        aria-describedby={err ? msg : undefined}
      />
    </Field>
  );
  if (canTo && e.state === 'requested') {
    if (form === 'esc-ack')
      return (
        <SubForm>
          <Field label={t('Responsible for the next step')} htmlFor="esc-next">
            <SelectField
              id="esc-next"
              people
              value={next}
              onChange={setNext}
              options={nextOwnerChoices(db, e).map((p) => ({ value: p.id, label: `${p.name}, ${roleText(p)}` }))}
            />
          </Field>
          <Field label={t('Next step by')} htmlFor="esc-date">
            <DateField id="esc-date" value={date} onChange={setDate} />
          </Field>
          {area('esc-reply', t('What happens next'), 3, t('Say what happens next.'))}
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                if (!next) {
                  setErr(t('Choose who takes the next step.'));
                  return;
                }
                void run(text, t('Say what happens next.'), () => acknowledge(e.id, next, date || null, text.trim()));
              }}
            >
              <Icon name="check" />
              {t('Acknowledge')}
            </Button>
            {cancel}
          </div>
        </SubForm>
      );
    if (form === 'esc-ret')
      return (
        <SubForm>
          {area('esc-ret', t('What information is missing?'), 3, t('Say what information is missing.'))}
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                void run(text, t('Say what information is missing.'), () => returnForInfo(e.id, text.trim()));
              }}
            >
              {t('Return to {who}', { who: who.first(e.from) })}
            </Button>
            {cancel}
          </div>
        </SubForm>
      );
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => {
            open('esc-ack');
          }}
        >
          <Icon name="check" />
          {t('Acknowledge and name the next step')}
        </Button>
        <Button
          onClick={() => {
            open('esc-ret');
          }}
        >
          <Icon name="undo" />
          {t('Return for information')}
        </Button>
      </div>
    );
  }
  if (canTo && e.state === 'acknowledged') {
    if (form === 'esc-res')
      return (
        <SubForm>
          {area('esc-res', t('Resolution'), 3, t('Write what was resolved.'))}
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                void run(text, t('Write what was resolved.'), () => resolveEscalation(e.id, text.trim()));
              }}
            >
              {t('Record resolution')}
            </Button>
            {cancel}
          </div>
        </SubForm>
      );
    return (
      <div className="mt-3.5 flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            open('esc-res');
          }}
        >
          <Icon name="check" />
          {t('Record resolution')}
        </Button>
      </div>
    );
  }
  if (canFrom && e.state === 'returned') {
    if (form === 'esc-again')
      return (
        <SubForm>
          {area('esc-again', t('Reason, with the missing information'), 4, t('Say why this needs the President.'))}
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                void run(text, t('Say why this needs the President.'), () => sendAgain(e.id, text.trim()));
              }}
            >
              {t('Send again')}
            </Button>
            {cancel}
          </div>
        </SubForm>
      );
    return (
      <div className="mt-3.5 flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            open('esc-again');
          }}
        >
          {t('Add the information and send again')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            void withdrawEscalation(e.id);
          }}
        >
          {t('Withdraw')}
        </Button>
      </div>
    );
  }
  if (canFrom && e.state === 'requested')
    return (
      <div className="mt-3.5 flex gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            void withdrawEscalation(e.id);
          }}
        >
          {t('Withdraw')}
        </Button>
      </div>
    );
  return null;
}

function EscalationPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const e = escalationsOf(db).find((x) => x.id === insp.id);
  if (!m || !e || !(isTopOrAdmin(m) || isBoard(m))) return <NotYours head={t('Escalation')} />;
  const tk = taskOf(db, e.ref.id);
  const b = db.blockers.find((v) => v.id === e.blocker);
  const initial = (typeof insp.form === 'string' ? insp.form : null) as EscForm;
  return (
    <>
      <InspectorHead>{t('Escalation')}</InspectorHead>
      <h2 className={h2}>{e.title}</h2>
      <div className="mt-1.5">
        <Chip def={ESC_ST[e.state]} />
      </div>
      <div className="pt-3.5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 rounded-[10px] bg-surface-2 p-3">
            <Avatar id={e.from} size="xs" /> <b>{who.name(e.from)}</b>
            <small className="col-span-full text-d12h text-mute">
              {t('Sent')}, {who.stamp(e.from, e.createdAt)}
            </small>
          </div>
          <span aria-hidden="true" className="grid place-items-center text-mute">
            <Icon name="right" />
          </span>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 rounded-[10px] bg-surface-2 p-3">
            <Avatar id={e.to} size="xs" /> <b>{who.name(e.to)}</b>
            <small className="col-span-full text-d12h text-mute">
              {e.neededBy ? t('Needed by {d}', { d: dLong(e.neededBy) }) : t('No date asked')}
            </small>
          </div>
        </div>
        <div className="mt-3">
          <EscSteps e={e} />
        </div>
      </div>
      <SectionHeading>{t('Reason')}</SectionHeading>
      <Quote>{e.reason}</Quote>
      {e.reply && (
        <>
          <SectionHeading>{e.state === 'returned' ? t('Returned with') : t('Reply')}</SectionHeading>
          <Quote>{e.reply}</Quote>
        </>
      )}
      {e.resolution && (
        <>
          <SectionHeading>{t('Resolution')}</SectionHeading>
          <Quote>{e.resolution}</Quote>
        </>
      )}
      <div className="mt-3.5">
        <Meta>
          <MetaRow label={t('Source')}>
            {tk ? (
              <a
                className="cursor-pointer"
                onClick={() => {
                  openTask(tk.id);
                }}
              >
                {tk.title}
              </a>
            ) : (
              <span className="text-mute">{t('Removed')}</span>
            )}
          </MetaRow>
          {b && (
            <MetaRow label={t('Blocker')}>
              <SevTag severity={b.severity} /> {b.state === 'open' ? t('still open') : t('resolved')}
            </MetaRow>
          )}
          <MetaRow label={t('Division')}>{divisionOf(e.div)?.name ?? ''}</MetaRow>
          {e.nextOwner && (
            <MetaRow label={t('Next step')}>
              <Avatar id={e.nextOwner} size="xs" />
              {who.first(e.nextOwner)}
              {e.nextDate && <span className="text-mute type-num">{dShort(e.nextDate)}</span>}
            </MetaRow>
          )}
          {e.answeredBy && e.answeredAt && (
            <MetaRow label={t('Answered')}>{who.stamp(e.answeredBy, e.answeredAt)}</MetaRow>
          )}
          <MetaRow label={t('Created')}>
            <Avatar id={e.createdBy} size="xs" />
            {who.stamp(e.createdBy, e.createdAt)}
          </MetaRow>
        </Meta>
      </div>
      <EscalationActions key={`${e.id}:${e.state}:${initial ?? ''}`} e={e} initial={initial} />
      <p className={cn(quiet, 'mt-3')}>
        {t(
          'An escalation never changes the blocker or the task by itself. The people responsible still record what they did.',
        )}
      </p>
    </>
  );
}

// ---------- escalate a blocker ----------
function EscalateNewPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const [reason, setReason] = useState('');
  const [need, setNeed] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const b = db.blockers.find((v) => v.id === insp.id);
  if (!b || !isVP(m))
    return <NotYours head={t('Escalate')}>{t('Only the VP escalates to the President in this proposal.')}</NotYours>;
  const tk = taskOf(db, b.task);
  const pres = activePeople(db).find(isPres);
  return (
    <>
      <InspectorHead>{t('Escalate to the President')}</InspectorHead>
      <h2 className={h2}>{b.text}</h2>
      <p className={quiet}>{tk?.title ?? ''}</p>
      <Field label={t('Send to')}>
        <div className="flex min-h-[34px] items-center gap-2">
          {pres ? (
            <>
              <Avatar id={pres.id} size="sm" /> <b>{pres.name}</b>
            </>
          ) : (
            <span className="text-mute">{t('No President named')}</span>
          )}
        </div>
      </Field>
      <Field label={t('Why it needs the President')} htmlFor="esc-reason" help={err} error={!!err}>
        <textarea
          id="esc-reason"
          className={cn(textareaClass, err && invalidClass)}
          rows={4}
          autoFocus
          value={reason}
          placeholder={t('What is decided above the division, and what you already tried')}
          onChange={(ev) => {
            setReason(ev.target.value);
            setErr(null);
          }}
        />
      </Field>
      <Field
        label={t('Needed by')}
        htmlFor="esc-need"
        optional
        help={t('A requested date is not agreed until the President acknowledges it.')}
      >
        <DateField id="esc-need" value={need} onChange={setNeed} />
      </Field>
      <div className="flex gap-2">
        <Button
          variant="primary"
          disabled={!pres}
          onClick={() => {
            if (!reason.trim()) {
              setErr(t('Say why this needs the President.'));
              return;
            }
            void sendEscalation(b.id, reason.trim(), need || null);
          }}
        >
          {t('Send to {who}', { who: pres?.first ?? '' })}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

PANELS['perf-list'] = PerfListPanel;
PANELS['perf-esc'] = EscalationPanel;
PANELS['perf-esc-new'] = EscalateNewPanel;
