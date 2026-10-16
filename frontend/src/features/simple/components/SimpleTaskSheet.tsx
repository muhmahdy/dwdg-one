/* The floating task sheet in the Simple look: a plain title, four status buttons, the owner, a review or blocker box when one
   applies, and the few fields a member edits (title, due date, time, project, notes). From screens/simple.js sTaskSheet. */
import { useState } from 'react';
import { Link } from 'react-router';
import type { InspectorRef } from '@/app/ui-state';
import { Avatar } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SelectField } from '@/components/ui/SelectField';
import { TASK_ORDER, TSTAT } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { dLong, mins } from '@/lib/time';
import { look } from '@/lib/session';
import { useMe, useSession, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { TaskPanel } from '@/features/work/components/task-panel/TaskPanel';
import { canEditTask, isDone, openBlocker, personOf, projOf } from '@/features/work/services/selectors';
import {
  chooseStatus,
  raiseBlocker,
  resolveBlocker,
  reviewTask,
  setTaskField,
  setTaskProject,
  trashTask,
} from '@/features/work/services/task-actions';
import { canSee, groupOf } from './parts';
import type { Task } from '@/types/workspace';

const box = 'mb-5 grid gap-2 rounded-[14px] bg-surface-2 p-4 [&_p]:m-0 [&_p]:text-ink-2 [&_p]:type-small';

function TextField({
  task,
  field,
  label,
  type,
}: {
  task: Task;
  field: 'title' | 'notes';
  label: string;
  type: 'input' | 'area';
}) {
  const [v, setV] = useState(task[field]);
  const [err, setErr] = useState('');
  const save = () => {
    if (v === task[field]) return;
    const r = setTaskField(task.id, field, v);
    if (typeof r === 'string') setErr(r);
    else setErr('');
  };
  return (
    <Field label={label} htmlFor={`f-${field}`} help={err} error={!!err}>
      {type === 'input' ? (
        <input
          id={`f-${field}`}
          className={cn(inputClass, err && invalidClass)}
          value={v}
          autoComplete="off"
          onChange={(e) => {
            setV(e.target.value);
          }}
          onBlur={save}
        />
      ) : (
        <textarea
          id={`f-${field}`}
          className={cn(textareaClass, err && invalidClass)}
          value={v}
          onChange={(e) => {
            setV(e.target.value);
          }}
          onBlur={save}
        />
      )}
    </Field>
  );
}

function BlockerBox({ task }: { task: Task }) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const form = useUi((u) => u.form);
  const b = openBlocker(db, task.id);
  const [text, setText] = useState('');
  const [owner, setOwner] = useState('');
  const [res, setRes] = useState('');
  const [err, setErr] = useState('');
  const edit = !!me && canEditTask(db, me, task);
  const people = db.people.filter((p) => p.status === 'active' && p.id !== me?.id);
  const close = () => {
    setUi((u) => void (u.form = null));
  };
  if (b)
    return (
      <div className={cn(box, 'bg-danger-soft')}>
        <b>
          {t('Blocked')}: {b.text}
        </b>
        <p>{t('Waiting on {who}', { who: personOf(db, b.owner)?.name ?? '' })}</p>
        {form === 'resolve' ? (
          <>
            <Field label={`${t('How was it solved?')} (${t('Optional')})`} htmlFor="bk-res">
              <input
                id="bk-res"
                className={inputClass}
                value={res}
                autoFocus
                autoComplete="off"
                onChange={(e) => {
                  setRes(e.target.value);
                }}
              />
            </Field>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => void resolveBlocker(b.id, res.trim())}>
                {t('It is solved')}
              </Button>
              <Button variant="ghost" onClick={close}>
                {t('Cancel')}
              </Button>
            </div>
          </>
        ) : (
          (b.owner === me?.id || edit) && (
            <div>
              <Button
                onClick={() => {
                  setUi((u) => void (u.form = 'resolve'));
                }}
              >
                {t('Mark as solved')}
              </Button>
            </div>
          )
        )}
      </div>
    );
  if (form !== 'blocker') return null;
  return (
    <div className={box}>
      <Field label={t('What’s blocking this?')} htmlFor="bk-text" help={err} error={!!err}>
        <textarea
          id="bk-text"
          className={cn(textareaClass, err && invalidClass)}
          value={text}
          autoFocus
          onChange={(e) => {
            setText(e.target.value);
            setErr('');
          }}
        />
      </Field>
      <Field label={t('Who can help?')} htmlFor="bk-owner">
        <SelectField
          id="bk-owner"
          people
          value={owner}
          onChange={setOwner}
          options={[{ value: '', label: t('Choose a person') }, ...people.map((p) => ({ value: p.id, label: p.name }))]}
        />
      </Field>
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            if (!text.trim()) {
              setErr(t('Say what is blocking it.'));
              return;
            }
            if (!owner) {
              setErr(t('Choose who can help.'));
              return;
            }
            void raiseBlocker(task.id, { text: text.trim(), owner, severity: 'medium', action: '' });
          }}
        >
          {t('Tell them')}
        </Button>
        <Button variant="ghost" onClick={close}>
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

function ReviewBox({ task }: { task: Task }) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const form = useUi((u) => u.form);
  const [note, setNote] = useState('');
  if (!me || task.status !== 'review' || task.reviewer !== me.id || task.owner === me.id) return null;
  return (
    <div className={box}>
      <b>{t('{who} asked you to review this', { who: personOf(db, task.owner)?.first ?? '' })}</b>
      {task.evidence && (
        <p>
          <a href={task.evidence} target="_blank" rel="noopener noreferrer">
            {t('Open the work')}
          </a>
        </p>
      )}
      {form === 'return' ? (
        <>
          <Field label={t('What needs to change?')} htmlFor="rv-note">
            <textarea
              id="rv-note"
              className={textareaClass}
              value={note}
              autoFocus
              onChange={(e) => {
                setNote(e.target.value);
              }}
            />
          </Field>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => void reviewTask(task.id, false, note)}>
              {t('Send back')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setUi((u) => void (u.form = null));
              }}
            >
              {t('Cancel')}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => void reviewTask(task.id, true)}>
            {t('Approve')}
          </Button>
          <Button
            onClick={() => {
              setUi((u) => void (u.form = 'return'));
            }}
          >
            {t('Ask for changes')}
          </Button>
        </div>
      )}
    </div>
  );
}

function SimpleSheet({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const form = useUi((u) => u.form);
  const task = db.tasks.find((x) => x.id === insp.id);
  if (!task || !me) return <InspectorHead>{t('Task')}</InspectorHead>;
  const edit = canEditTask(db, me, task);
  const pr = projOf(db, task.project);
  const b = openBlocker(db, task.id);
  const order = TASK_ORDER.filter((s) => s !== 'review' || task.status === 'review' || task.reviewer);
  const projOpts = db.projects
    .filter((p) => canSee(db, me, p) && (groupOf(p.stage) !== 'done' || p.id === task.project))
    .sort((a, c) => a.name.localeCompare(c.name));
  return (
    <div className="px-6 pt-5 pb-8 max-[899px]:px-5 max-[899px]:pt-3 max-[899px]:pb-7">
      <InspectorHead>{t('Task')}</InspectorHead>
      <h2 className="mt-2 mb-3 type-h2">{task.title}</h2>
      {task.owner !== me.id && (
        <p className="-mt-1 mb-3 flex items-center gap-2 text-ink-2 type-small">
          <Avatar id={task.owner} size="sm" />
          {t('{who} is doing this', { who: personOf(db, task.owner)?.name ?? '' })}
        </p>
      )}
      <div className="mt-1 mb-5 flex gap-1 rounded-xl bg-fill p-1" role="radiogroup" aria-label={t('Status')}>
        {order.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={task.status === s}
            disabled={!edit}
            className={cn(
              'h-10 flex-1 cursor-pointer rounded-[9px] border-0 bg-transparent text-[16px] font-[550] text-ink-2 max-[899px]:h-11',
              task.status === s && 'bg-surface text-ink shadow-sheet',
            )}
            onClick={() => void chooseStatus(task.id, s)}
          >
            {t(TSTAT[s][0])}
          </button>
        ))}
      </div>
      <ReviewBox task={task} />
      <BlockerBox task={task} />
      {edit ? (
        <>
          <TextField task={task} field="title" label={t('Title')} type="input" />
          <Grid2>
            <Field label={t('Due date')} htmlFor="f-due">
              <DateField
                id="f-due"
                value={task.due ?? ''}
                onChange={(v) => {
                  void setTaskField(task.id, 'due', v);
                }}
              />
            </Field>
            <Field label={t('Time')} htmlFor="f-time">
              <input
                id="f-time"
                className={inputClass}
                defaultValue={task.time != null ? mins(task.time) : ''}
                autoComplete="off"
                onBlur={(e) => {
                  void setTaskField(task.id, 'time', e.target.value);
                }}
              />
            </Field>
          </Grid2>
          <Field label={t('Project')} htmlFor="sproj">
            <SelectField
              id="sproj"
              value={task.project ?? ''}
              onChange={(v) => {
                void setTaskProject(task.id, v || null);
              }}
              options={[
                { value: '', label: t('No project') },
                ...projOpts.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </Field>
          <TextField task={task} field="notes" label={t('Notes')} type="area" />
        </>
      ) : (
        <>
          <dl className="mt-1 mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 [&_dd]:m-0 [&_dt]:text-mute">
            <dt>{t('Due')}</dt>
            <dd>{task.due ? `${dLong(task.due)}${task.time != null ? `, ${mins(task.time)}` : ''}` : t('No date')}</dd>
            <dt>{t('Project')}</dt>
            <dd>
              {pr ? (
                <Link to={`/projects/${pr.id}`} onClick={closeInspector}>
                  {pr.name}
                </Link>
              ) : (
                t('No project')
              )}
            </dd>
          </dl>
          {task.notes && <p className="whitespace-pre-line text-ink-2">{task.notes}</p>}
        </>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {!b && !isDone(task) && edit && form !== 'blocker' && (
          <Button
            onClick={() => {
              setUi((u) => void (u.form = 'blocker'));
            }}
          >
            {t('Something blocking this?')}
          </Button>
        )}
        {(task.owner === me.id || task.createdBy === me.id) && (
          <Button
            variant="danger"
            onClick={() => {
              void trashTask(task.id);
            }}
          >
            {t('Delete')}
          </Button>
        )}
      </div>
    </div>
  );
}

/** The Simple look has its own sheet; the other looks keep the full task panel. */
function TaskSheet({ insp }: { insp: InspectorRef }) {
  const lk = useSession((s) => look(s));
  return lk === 'simple' ? <SimpleSheet insp={insp} /> : <TaskPanel insp={insp} />;
}
PANELS.task = TaskSheet;
