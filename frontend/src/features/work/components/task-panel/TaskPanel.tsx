/* The task panel (work_task_lifecycle, work_task_fields, work_blockers, access_member_edit): status, what needs action
   (review, returned work, blocker, hand-in), the essentials, and the rest in collapsible sections that open by themselves
   when something waits on someone (D55). From screens/work.js INSP.task. */
import { useState } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/shared/Avatar';
import { TaskIcon } from '@/components/shared/art/task-icons';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { openMenu } from '@/components/shared/menus';
import { Button } from '@/components/ui/Button';
import { Disclosure } from '@/components/ui/Disclosure';
import { Field, Segmented, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { TASK_ORDER, TaskStatusMark } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { dShort } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { RoutineTaskBox } from '@/features/operations/components/RoutineTaskBox';
import { TASK_PANEL_EXTRAS } from './extras';
import { wbsSummaryNote } from './summary-note';
import type { InspectorRef } from '@/app/ui-state';
import type { Task } from '@/types/workspace';
import { canEditTask, isDone, isSummary, openBlocker, projOf } from '../../services/selectors';
import { canSignOff } from '../../services/signoff';
import {
  chooseStatus,
  depOk,
  predsOf,
  raiseBlocker,
  resolveBlocker,
  reviewTask,
  trashTask,
} from '../../services/task-actions';
import { Reactions } from '../Reactions';
import { PersonMention, TaskTitle } from '../TaskTitle';
import { DependenciesSection } from './DependenciesSection';
import { HandInBox } from './HandInBox';
import { PeopleSelect, SevTag } from './parts';
import { ResponsibleSection } from './ResponsibleSection';
import { DetailsSection, Essentials, PlanningSection, ReviewSection } from './sections';
import { setUi } from '@/lib/workspace/transaction';

/** The icon button beside the title: the icon, or a quiet "Icon" button until the title is hovered. */
function IconButton({ task, edit }: { task: Task; edit: boolean }) {
  if (!edit) return <TaskIcon icon={task.icon} className="mt-[3px] size-6" />;
  return (
    <button
      type="button"
      className={cn(
        '-mt-[3px] grid size-[34px] flex-none cursor-pointer place-items-center rounded-[10px] border-0 bg-fill text-mute hover:bg-hover [&_.ic]:size-5',
        !task.icon &&
          'order-2 ml-auto inline-flex h-[26px] w-auto items-center gap-1 rounded-[7px] bg-transparent pr-2 pl-1.5 text-[12px] font-medium opacity-0 transition-opacity duration-[120ms] group-hover/th:opacity-100 hover:bg-fill hover:text-ink focus-visible:opacity-100 touch:opacity-100 [&_.ic]:size-[15px]',
      )}
      aria-label={task.icon ? t('Change icon') : t('Add an icon')}
      onClick={(e) => {
        openMenu(e.currentTarget, { type: 'ticon', kind: 'task', id: task.id, width: 308, est: 430 });
      }}
    >
      {task.icon ? (
        <TaskIcon icon={task.icon} className="m-0 size-5" />
      ) : (
        <>
          <Icon name="smile" />
          <span>{t('Icon')}</span>
        </>
      )}
    </button>
  );
}

function ReviewNotice({ task }: { task: Task }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const [returning, setReturning] = useState(false);
  const [note, setNote] = useState('');
  if (!me || task.status !== 'review') return null;
  const reviewer = (task.reviewer === me.id || canSignOff(db, me, task)) && task.owner !== me.id;
  if (!reviewer)
    return (
      <p className="mb-3.5 text-mute type-small">
        {task.reviewer
          ? t('Waiting for {who} to review.', { who: who.first(task.reviewer) })
          : t('Choose a reviewer below.')}
      </p>
    );
  return (
    <Notice
      tone="info"
      icon="search"
      title={<b>{t('{who} asked you to review this', { who: who.first(task.owner) })}</b>}
    >
      {task.evidence ? (
        <p>
          <a className="underline" href={task.evidence} target="_blank" rel="noopener">
            {t('Open the submitted work')}
          </a>
        </p>
      ) : (
        <p>{t('No evidence link was added.')}</p>
      )}
      {returning ? (
        <>
          <Field label={t('What needs to change?')} htmlFor="rv-note" className="mt-2.5">
            <textarea
              id="rv-note"
              className={textareaClass}
              autoFocus
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
              }}
            />
          </Field>
          <div className="mt-[18px] flex gap-2">
            <Button
              variant="primary"
              small
              onClick={() => {
                void reviewTask(task.id, false, note);
              }}
            >
              {t('Send back')}
            </Button>
            <Button
              variant="ghost"
              small
              onClick={() => {
                setReturning(false);
              }}
            >
              {t('Cancel')}
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-[18px] flex flex-wrap gap-2">
          <Button
            variant="primary"
            small
            onClick={() => {
              void reviewTask(task.id, true);
            }}
          >
            <Icon name="check" />
            {t('Approve')}
          </Button>
          <Button
            small
            onClick={() => {
              setReturning(true);
            }}
          >
            {t('Ask for changes')}
          </Button>
        </div>
      )}
    </Notice>
  );
}

type Severity = 'low' | 'medium' | 'high';

function BlockerArea({
  task,
  reporting,
  setReporting,
}: {
  task: Task;
  reporting: boolean;
  setReporting: (v: boolean) => void;
}) {
  const me = useMe();
  const who = useWho();
  const b = useWorkspace((db) => openBlocker(db, task.id));
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState('');
  const [form, setForm] = useState<{ text: string; owner: string; severity: Severity; action: string }>({
    text: '',
    owner: '',
    severity: 'medium',
    action: '',
  });
  const [errors, setErrors] = useState<{ text?: string; owner?: string }>({});
  if (!me) return null;
  if (b)
    return (
      <Notice tone="error" icon="warning" title={<b>{b.text}</b>}>
        <p>
          {t('Needs {who}', { who: who.name(b.owner) })}
          {b.action ? `: ${b.action}` : ''}
        </p>
        <p className="type-small">
          <SevTag severity={b.severity} /> {t('Raised by {who}', { who: who.stamp(b.openedBy, b.openedAt) })}
        </p>
        {resolving ? (
          <>
            <Field label={t('How was it resolved?')} htmlFor="bk-res" optional className="mt-2.5">
              <input
                id="bk-res"
                className={inputClass}
                autoFocus
                value={resolution}
                onChange={(e) => {
                  setResolution(e.target.value);
                }}
              />
            </Field>
            <div className="mt-[18px] flex gap-2">
              <Button
                variant="primary"
                small
                onClick={() => {
                  void resolveBlocker(b.id, resolution.trim());
                }}
              >
                {t('Mark resolved')}
              </Button>
              <Button
                variant="ghost"
                small
                onClick={() => {
                  setResolving(false);
                }}
              >
                {t('Cancel')}
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-[18px]">
            <Button
              small
              onClick={() => {
                setResolving(true);
              }}
            >
              {t('Resolve')}
            </Button>
          </div>
        )}
      </Notice>
    );
  if (!reporting) return null;
  const raise = () => {
    const e = {
      text: form.text.trim() ? undefined : t('Say what is blocking the work.'),
      owner: form.owner ? undefined : t('Choose who can unblock it.'),
    };
    setErrors(e);
    if (e.text || e.owner) return;
    void raiseBlocker(task.id, {
      text: form.text.trim(),
      owner: form.owner,
      severity: form.severity,
      action: form.action.trim(),
    });
  };
  return (
    <div className="mb-3.5 rounded-[10px] bg-surface-2 p-3.5 shadow-[inset_0_0_0_1px_var(--line)] [&_.mb-3\.5]:mb-2.5">
      <b className="mb-2.5 block type-h3">{t('Report a blocker')}</b>
      <Field label={t('What is blocking the work?')} htmlFor="bk-text" required help={errors.text} error>
        <textarea
          id="bk-text"
          className={cn(textareaClass, errors.text && invalidClass)}
          autoFocus
          value={form.text}
          onChange={(e) => {
            setForm({ ...form, text: e.target.value });
          }}
        />
      </Field>
      <Field label={t('Who can unblock it?')} htmlFor="bk-owner" required help={errors.owner} error>
        <PeopleSelect
          id="bk-owner"
          value={form.owner}
          exclude={[me.id]}
          blank={t('Choose a person')}
          className={errors.owner ? invalidClass : undefined}
          onChange={(id) => {
            setForm({ ...form, owner: id });
          }}
        />
      </Field>
      <Field label={t('Severity')}>
        <Segmented
          value={form.severity}
          options={[
            ['low', t('Low')],
            ['medium', t('Medium')],
            ['high', t('High')],
          ]}
          onChange={(severity) => {
            setForm({ ...form, severity });
          }}
        />
      </Field>
      <Field label={t('What do you need from them?')} htmlFor="bk-action">
        <input
          id="bk-action"
          className={inputClass}
          value={form.action}
          onChange={(e) => {
            setForm({ ...form, action: e.target.value });
          }}
        />
      </Field>
      <div className="mt-4.5 flex flex-wrap gap-2">
        <Button variant="primary" onClick={raise}>
          {t('Raise blocker')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setReporting(false);
          }}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

export function TaskPanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const [reporting, setReporting] = useState(false);
  const task = db.tasks.find((x) => x.id === insp.id);
  if (!task || !me) return <InspectorHead>{t('Task')}</InspectorHead>;
  const edit = canEditTask(db, me, task);
  const summary = isSummary(db, task);
  const project = projOf(db, task.project);
  const milestone = db.milestones.find((m) => m.id === task.milestone);
  const blocker = openBlocker(db, task.id);
  const preds = task.project && !summary ? predsOf(db, task) : [];
  const badDep = preds.some((d) => !depOk(d.t, task, d.type));
  const asks = task.assignees.filter((a) => a.state === 'invited').length;
  const giver = task.givenBy ?? (!task.routine && task.createdBy !== task.owner ? task.createdBy : null);
  const giverAt = task.givenAt ?? task.createdAt;
  const mentions = task.mentions.filter((id) => db.people.some((p) => p.id === id));
  const showReview = edit || !!task.reviewer;
  return (
    <>
      <InspectorHead>{t('Task')}</InspectorHead>
      <h2 className="group/th mt-3 flex items-start gap-2.5 type-h2 [&>span]:min-w-0">
        <IconButton task={task} edit={edit} />
        <span>
          <TaskTitle task={task} noIcon />
        </span>
      </h2>
      <Reactions kind="task" id={task.id} reactions={task.reactions} big />
      {summary ? (
        wbsSummaryNote(db, task)
      ) : (
        <div
          className="mt-2.5 mb-3.5 grid grid-cols-2 gap-1 rounded-[10px] bg-fill p-1"
          role="radiogroup"
          aria-label={t('Status')}
        >
          {TASK_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={task.status === s}
              disabled={!edit}
              className={cn(
                'flex min-h-[34px] cursor-pointer items-center rounded-[7px] border-0 bg-transparent px-2.5 whitespace-nowrap enabled:hover:bg-hover disabled:cursor-default disabled:opacity-70',
                task.status === s &&
                  'bg-surface shadow-[0_1px_2px_rgb(22_22_21/12%),0_0_0_1px_var(--line)] enabled:hover:bg-surface',
              )}
              onClick={() => {
                void chooseStatus(task.id, s);
              }}
            >
              <TaskStatusMark status={s} />
            </button>
          ))}
        </div>
      )}
      {task.routine && <RoutineTaskBox task={task} />}
      <HandInBox key={task.id} task={task} />
      <ReviewNotice task={task} />
      {task.returnNote && task.status === 'doing' && (
        <Notice
          tone="warn"
          icon="undo"
          title={<b>{t('Changes requested by {who}', { who: who.first(task.reviewer) })}</b>}
        >
          <p>{task.returnNote}</p>
        </Notice>
      )}
      <BlockerArea task={task} reporting={reporting} setReporting={setReporting} />
      {giver && (
        <p className="mt-0.5 mb-2 flex items-center gap-2 text-[14px] text-ink-2 [&_b]:font-semibold [&_b]:text-ink">
          <Avatar id={giver} size="xs" />
          <span>
            {t('Given by {who}', { who: '' })}
            <b>{who.name(giver)}</b>
            {giverAt ? `, ${dShort(giverAt.slice(0, 10))}` : ''}
          </span>
        </p>
      )}
      <p className="mt-0.5 mb-3.5 flex items-center gap-2 text-ink-2 type-small [&_a]:font-[550] [&_a]:text-ink">
        <Icon name="projects" size="sm" />
        {project ? (
          <span>
            <Link to={`/projects/${project.id}`} onClick={closeInspector}>
              {project.name}
            </Link>
            {milestone ? `, ${milestone.title}` : ''}
          </span>
        ) : (
          <span>{t('Personal task, no project')}</span>
        )}
      </p>
      <Essentials task={task} edit={edit} summary={summary} />
      {edit && !summary && (
        <Disclosure id="planning" title={t('Planning')} count={task.start ? dShort(task.start) : ''}>
          <PlanningSection task={task} />
        </Disclosure>
      )}
      <Disclosure
        id="people"
        title={t('People')}
        count={1 + task.assignees.filter((a) => a.state !== 'declined').length}
        attention={asks > 0}
      >
        <ResponsibleSection task={task} edit={edit} />
        {mentions.length > 0 && (
          <dl className="mx-0 mt-3 mb-0 grid grid-cols-[96px_1fr] gap-x-2.5 text-d13">
            <dt className="text-mute">{t('Mentioned')}</dt>
            <dd className="m-0 inline-flex flex-wrap gap-x-2.5 gap-y-1">
              {mentions.map((id) => (
                <PersonMention key={id} id={id} first={who.first(id)} />
              ))}
            </dd>
          </dl>
        )}
      </Disclosure>
      {showReview && (
        <Disclosure
          id="review"
          title={t('Review and sign-off')}
          count={task.reviewer ? who.first(task.reviewer) : ''}
          attention={task.status === 'review'}
        >
          <ReviewSection task={task} edit={edit} />
        </Disclosure>
      )}
      {task.project && !summary && (
        <Disclosure id="deps" title={t('Dependencies')} count={preds.length || ''} attention={badDep}>
          <DependenciesSection task={task} edit={edit} />
        </Disclosure>
      )}
      <Disclosure id="details" title={t('Details')}>
        <DetailsSection task={task} />
      </Disclosure>
      <div className="mt-[18px] flex flex-wrap gap-2">
        {!blocker && !isDone(task) && !reporting && (
          <Button
            onClick={() => {
              setReporting(true);
            }}
          >
            <Icon name="warning" />
            {t('Report a blocker')}
          </Button>
        )}
        {task.owner === me.id && !isDone(task) && (
          <Button
            onClick={() => {
              setUi((u) => {
                u.insp = { type: 'new-offer', fromTask: task.id, to: null };
              });
            }}
          >
            <Icon name="people" />
            {t('Ask someone else')}
          </Button>
        )}
        {(task.owner === me.id || task.createdBy === me.id) && (
          <Button
            variant="danger"
            onClick={() => {
              void trashTask(task.id);
            }}
          >
            <Icon name="trash" />
            {t('Move to trash')}
          </Button>
        )}
      </div>
      {TASK_PANEL_EXTRAS.map((Section, i) => (
        <Section key={i} task={task} />
      ))}
    </>
  );
}

PANELS.task = TaskPanel;
