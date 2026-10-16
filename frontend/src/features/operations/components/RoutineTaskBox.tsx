/* What an operation's run shows in the task panel: which operation it belongs to, whose turn it is, the checklist, and how a
   member asks to skip or move a run. From screens/work.js rtTaskBox / rtAskBox / repeatField. */
import { useState } from 'react';
import { go } from '@/app/router/navigation';
import { Avatar } from '@/components/shared/Avatar';
import { RoutineObject } from '@/components/shared/art/objects';
import { closeInspector } from '@/components/shared/Inspector';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Field, inputClass, Segmented } from '@/components/ui/forms';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { useWho } from '@/lib/people';
import { addDays, dShort } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { canEditTask, isDone } from '@/features/work/services/selectors';
import type { Routine, Task } from '@/types/workspace';
import { canEditRt } from '../services/access';
import { cadText, nextTurn, openAsks, rtOf, runDate } from '../services/routines';
import { askLeader, sendRunAsk, skipRun, toggleStep, withdrawRunAsk } from '../services/run-actions';
import { stopRepeating } from '@/features/work/services/task-actions';

const openOperation = (id: string) => {
  closeInspector();
  go(`operations/${id}`);
};
const link = 'cursor-pointer underline';

function RunAskBox({ task, routine }: { task: Task; routine: Routine }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const [form, setForm] = useState(false);
  const [kind, setKind] = useState<'skip' | 'move'>('skip');
  const [why, setWhy] = useState('');
  const [to, setTo] = useState(addDays(runDate(task), 1));
  const [err, setErr] = useState('');
  if (!me || routine.personal || canEditRt(me, routine) || isDone(task) || task.owner !== me.id) return null;
  const lead = askLeader(db, task.id);
  const open = openAsks(routine).find((a) => a.occ === task.occ);
  if (open)
    return (
      <p className="m-0 flex items-start gap-1.5 text-d12h text-ink-2">
        <Icon name="clock" size="xs" className="mt-0.5 flex-none" />
        <span>
          {open.kind === 'skip'
            ? t('You asked to skip this run.')
            : t('You asked to move this run to {d}.', { d: dShort(open.to ?? open.occ) })}{' '}
          {t('Waiting for {who}.', { who: who.first(lead) })}{' '}
          <a
            className={link}
            onClick={() => {
              void withdrawRunAsk(routine.id, open.id);
            }}
          >
            {t('Withdraw')}
          </a>
        </span>
      </p>
    );
  if (!form)
    return (
      <p className="m-0 type-small">
        <a
          className={link}
          onClick={() => {
            setForm(true);
          }}
        >
          {t('Can’t make it? Ask to skip or move this run')}
        </a>
      </p>
    );
  const send = () => {
    const r = sendRunAsk(task.id, kind, why, kind === 'move' ? to : null);
    if (typeof r === 'string') setErr(r);
  };
  return (
    <div className="grid gap-2.5 border-t border-line pt-2.5 [&_.field]:m-0">
      <Segmented
        value={kind}
        options={[
          ['skip', t('Skip it')],
          ['move', t('Move it')],
        ]}
        onChange={setKind}
      />
      {kind === 'move' && (
        <Field label={t('Move to')} htmlFor="ask-to">
          <input
            id="ask-to"
            type="date"
            className={inputClass}
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
            }}
          />
        </Field>
      )}
      <Field label={t('Why?')} htmlFor="ask-why" required help={err} error>
        <input
          id="ask-why"
          className={cn(inputClass, err && 'shadow-[0_0_0_1.5px_var(--danger)]')}
          placeholder={t('For example: midterm exams that week')}
          value={why}
          onChange={(e) => {
            setWhy(e.target.value);
            setErr('');
          }}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="primary" small onClick={send}>
          {t('Send to {who}', { who: who.first(lead) })}
        </Button>
        <Button
          variant="ghost"
          small
          onClick={() => {
            setForm(false);
          }}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

export function RoutineTaskBox({ task }: { task: Task }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const r = rtOf(db, task.routine);
  if (!r || !me) return null;
  const list = task.checklist ?? [];
  const done = list.filter((c) => c.done).length;
  const can = canEditTask(db, me, task);
  const nx = nextTurn(db, r, task.occ);
  return (
    <div className="mb-3.5 grid gap-2 rounded-xl bg-surface-2 p-3 shadow-[inset_0_0_0_1px_var(--line)] [&_p]:m-0">
      <div className="flex items-center gap-2 text-[13px]">
        <RoutineObject routine={r} size="xs" />
        <span>
          {t('Part of')}{' '}
          <a
            className="cursor-pointer font-semibold"
            onClick={() => {
              openOperation(r.id);
            }}
          >
            {r.name}
          </a>
        </span>
        <small className="ml-auto text-mute type-num">{task.occ ? dShort(task.occ) : ''}</small>
      </div>
      {nx && (
        <p className="flex flex-wrap items-center gap-1.5 text-[13px]">
          <Avatar id={task.owner} size="xs" />
          {task.owner === me.id ? t('Your turn') : t('{who}’s turn', { who: who.first(task.owner) })}, {t('then')}
          <Avatar id={nx} size="xs" />
          <b>{nx === me.id ? t('you') : who.first(nx)}</b>
        </p>
      )}
      {list.length > 0 && (
        <>
          <div className="grid gap-0.5">
            {list.map((c, i) => (
              <label
                key={i}
                className={cn(
                  'flex cursor-pointer items-center gap-2 px-0.5 py-1 text-d13h',
                  c.done && 'text-mute line-through',
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 accent-green"
                  checked={!!c.done}
                  disabled={!can}
                  onChange={(e) => {
                    void toggleStep(task.id, i, e.target.checked);
                  }}
                />
                <span>{c.text ?? c.t}</span>
              </label>
            ))}
          </div>
          <small className="text-mute type-small">{t('{d} of {n} steps', { d: done, n: list.length })}</small>
        </>
      )}
      <p className="text-mute type-small">
        {t('Finishing this one never finishes the others.')}
        {canEditRt(me, r) && !isDone(task) && task.occ && (
          <>
            {' '}
            <a
              className={link}
              onClick={() => {
                void skipRun(r.id, task.occ ?? '');
              }}
            >
              {t('Skip this one')}
            </a>
          </>
        )}
      </p>
      <RunAskBox task={task} routine={r} />
    </div>
  );
}

/** The Repeat field in Planning: how a personal task repeats, or a link to its operation. */
export function RepeatLine({ routine }: { routine: Routine }) {
  return (
    <p className="m-0 flex items-center gap-1.5 type-small [&_.ic]:size-[15px] [&_.ic]:text-green">
      <Icon name="routine" />
      {cadText(routine)}
      {routine.personal && (
        <a
          className="ml-1.5 cursor-pointer underline"
          onClick={() => {
            void stopRepeating(routine.id);
          }}
        >
          {t('Stop repeating')}
        </a>
      )}{' '}
      <a
        className="ml-1.5 cursor-pointer underline"
        onClick={() => {
          openOperation(routine.id);
        }}
      >
        {t('Open')}
      </a>
    </p>
  );
}
