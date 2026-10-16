/* Side panel for a support action (hr_development): agreed from an assessment's needs, separate from grading and never a
   disciplinary step. New (`new:<assessment>`) or an existing action. From divisions/div-hr-sng.js INSP['hr-act']. */
import { useState } from 'react';
import type { InspectorRef } from '@/app/ui-state';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { PersonLink } from '@/components/shared/PersonLink';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { Empty } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { hrLead } from '@/lib/roles';
import { fmtD } from '@/lib/time';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { Meta, MetaRow } from '@/features/work/components/task-panel/parts';
import { taskOf } from '@/features/work/services/selectors';
import { hrOf } from '../services/hr-data';
import { makeActionTask, markActionDone, saveSupportAction } from '../services/monitoring';
import { Chip } from './HrParts';

export const openAction = (id: string) => {
  setUi((u) => {
    u.menu = null;
    u.form = null;
    u.insp = { type: 'hr-act', id };
  });
};

const h2 = 'mt-3 mb-1 type-h2';
const quiet = 'text-mute type-small';

function NewAction({ assessment }: { assessment: string }) {
  const db = useWorkspace((w) => w);
  const who = useWho();
  const a = hrOf(db)?.assessments.find((v) => v.id === assessment);
  const [goal, setGoal] = useState('');
  const [owner, setOwner] = useState('');
  const [due, setDue] = useState('');
  const [tnd, setTnd] = useState(false);
  const [tndNote, setTndNote] = useState('');
  const [err, setErr] = useState<{ f: 'goal' | 'owner' | 'due'; text: string } | null>(null);
  if (!a) return <InspectorHead>{t('Support action')}</InspectorHead>;
  const bad = (f: 'goal' | 'owner' | 'due') => err?.f === f;
  const save = () => {
    if (!goal.trim()) {
      setErr({ f: 'goal', text: t('Name the goal.') });
      return;
    }
    if (!owner) {
      setErr({ f: 'owner', text: t('Choose an owner.') });
      return;
    }
    if (!due) {
      setErr({ f: 'due', text: t('Choose a due date.') });
      return;
    }
    setErr(null);
    void saveSupportAction({ assessment: a.id, goal: goal.trim(), owner, due, tnd, tndNote: tndNote.trim() });
  };
  return (
    <>
      <InspectorHead>{t('Support action')}</InspectorHead>
      <h2 className={h2}>{t('Support for {who}', { who: who.first(a.person) })}</h2>
      <p className={quiet}>
        {t('Agreed from the assessed needs. Separate from grading and never a disciplinary step.')}
      </p>
      <Field
        label={t('Goal')}
        htmlFor="hr-a-goal"
        required
        help={bad('goal') ? err?.text : t('Shown on the linked task, so keep private notes out of it.')}
        error={bad('goal')}
      >
        <input
          id="hr-a-goal"
          className={cn(inputClass, bad('goal') && invalidClass)}
          value={goal}
          autoFocus
          onChange={(e) => {
            setGoal(e.target.value);
          }}
        />
      </Field>
      <Grid2>
        <Field
          label={t('Owner')}
          htmlFor="hr-a-owner"
          required
          help={bad('owner') ? err?.text : undefined}
          error={bad('owner')}
        >
          <SelectField
            id="hr-a-owner"
            people
            value={owner}
            onChange={setOwner}
            options={[
              { value: '', label: t('Choose a person') },
              ...db.people
                .filter((p) => p.status === 'active' && p.id !== a.person && p.role !== 'board')
                .map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </Field>
        <Field
          label={t('Due date')}
          htmlFor="hr-a-due"
          required
          help={bad('due') ? err?.text : undefined}
          error={bad('due')}
        >
          <DateField id="hr-a-due" value={due} onChange={setDue} />
        </Field>
      </Grid2>
      <label className="mt-1.5 mb-3 flex cursor-pointer items-center gap-2 text-[length:13.5px]">
        <input
          type="checkbox"
          className="m-0 size-4 accent-ink"
          checked={tnd}
          onChange={(e) => {
            setTnd(e.target.checked);
          }}
        />
        {t('Refer to TnD (Consulting)')}
      </label>
      <Field label={t('Referral note')} htmlFor="hr-a-tndn" optional>
        <input
          id="hr-a-tndn"
          className={inputClass}
          value={tndNote}
          onChange={(e) => {
            setTndNote(e.target.value);
          }}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="primary" onClick={save}>
          {t('Save action')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

function ActionPanel({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  const who = useWho();
  const [done, setDone] = useState(false);
  const [out, setOut] = useState('');
  const [err, setErr] = useState(false);
  const id = String(insp.id);
  if (id.startsWith('new:')) return <NewAction assessment={id.slice(4)} />;
  const act = hrOf(db)?.actions.find((v) => v.id === id);
  if (!m || !act || !(hrLead(m) || act.owner === m.id || act.person === m.id))
    return (
      <>
        <InspectorHead>{t('Support action')}</InspectorHead>
        <Empty title={t('This record is not available to you')}>{t('It may be outside your workspace.')}</Empty>
      </>
    );
  const canClose = act.state === 'open' && (act.owner === m.id || hrLead(m));
  const tk = act.task ? taskOf(db, act.task) : undefined;
  return (
    <>
      <InspectorHead>{t('Support action')}</InspectorHead>
      <h2 className={h2}>{act.goal}</h2>
      <p>
        <Chip def={act.state === 'open' ? ['Open', 'circle', 'ink2'] : ['Done', 'check', 'green']} pill="pill" />
      </p>
      <Meta className="mt-3.5 mb-1.5 grid-cols-[110px_1fr]">
        <MetaRow label={t('For')}>
          <PersonLink id={act.person} />
        </MetaRow>
        <MetaRow label={t('Owner')}>
          <PersonLink id={act.owner} />
        </MetaRow>
        <MetaRow label={t('Due')}>{fmtD(act.due)}</MetaRow>
        <MetaRow label={t('TnD referral')}>{act.tnd ? act.tndNote || t('Yes') : t('No')}</MetaRow>
        <MetaRow label={t('Created by')}>{who.stamp(act.createdBy, act.createdAt)}</MetaRow>
        <MetaRow label={t('Task')}>
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
            <span className="text-mute">{t('None')}</span>
          )}
        </MetaRow>
        {act.outcome && <MetaRow label={t('Outcome')}>{act.outcome}</MetaRow>}
      </Meta>
      <p className={quiet}>{t('Training participation creates no grade, promotion or ban.')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {!act.task && (act.owner === m.id || hrLead(m)) && (
          <Button
            onClick={() => {
              void makeActionTask(act.id);
            }}
          >
            <Icon name="tasks" />
            {t('Make it a task')}
          </Button>
        )}
        {canClose && (
          <Button
            onClick={() => {
              setDone(true);
            }}
          >
            {t('Record outcome')}
          </Button>
        )}
      </div>
      {done && (
        <div className="mt-3 rounded-[10px] bg-surface-2 p-3.5">
          <Field
            label={t('What happened?')}
            htmlFor="hr-a-out"
            help={err ? t('Describe the outcome.') : undefined}
            error={err}
          >
            <textarea
              id="hr-a-out"
              className={cn(textareaClass, 'min-h-16', err && invalidClass)}
              value={out}
              autoFocus
              onChange={(e) => {
                setOut(e.target.value);
                setErr(false);
              }}
            />
          </Field>
          <div className="flex gap-2">
            <Button
              small
              variant="primary"
              onClick={() => {
                if (!out.trim()) {
                  setErr(true);
                  return;
                }
                void markActionDone(act.id, out.trim()).then(() => {
                  setDone(false);
                });
              }}
            >
              {t('Mark done')}
            </Button>
            <Button
              small
              variant="ghost"
              onClick={() => {
                setDone(false);
              }}
            >
              {t('Cancel')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

PANELS['hr-act'] = (p) => <ActionPanel key={String(p.insp.id)} {...p} />;
