/* Side panels of the Projects module: the new / edit project form, a milestone, and a decision.
   From screens/plan.js projectForm, INSP.ms, INSP.decision. */
import { useState } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import type { InspectorRef } from '@/app/ui-state';
import { Avatar } from '@/components/shared/Avatar';
import { InspectorHead, PANELS, closeInspector } from '@/components/shared/Inspector';
import { TaskIcon } from '@/components/shared/art/task-icons';
import { Button, IconButton } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { SectionHeading } from '@/components/ui/Headings';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { TaskStatusMark } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openMeeting, openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { dLong } from '@/lib/time';
import { useMe, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { Meta, MetaRow, PeopleSelect } from '@/features/work/components/task-panel/parts';
import { isDone, isSummary } from '@/features/work/services/selectors';
import type { Milestone, ProjectStage } from '@/types/workspace';
import { canMsEdit, canRoadmap, achieveMilestone, deleteMilestone, linkTaskToMilestone } from '../services/milestones';
import {
  decide,
  leadCandidates,
  lines,
  saveProject,
  setMilestoneField,
  setRoadmap,
  unlinkTaskFromMilestone,
} from '../services/project-actions';
import { canEditProject, projTasks } from '../services/project-rules';
import { isHigh } from '../services/register';
import { wbsCodes, wbsTree, type WbsNode } from '../services/wbs';
import { DecState, MsState } from './Cells';

const h2 = 'mt-3 mb-2 type-h2';

function NewProjectPanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const ws = useWs();
  const db = useWorkspace((w) => w);
  const p = typeof insp.id === 'string' ? db.projects.find((x) => x.id === insp.id) : undefined;
  const div = p?.div ?? ws;
  const [name, setName] = useState(p?.name ?? '');
  const [goal, setGoal] = useState(p?.goal ?? '');
  const [scopeIn, setScopeIn] = useState(p ? lines(p.scopeIn).join('\n') : '');
  const [scopeOut, setScopeOut] = useState(p ? lines(p.scopeOut).join('\n') : '');
  const [lead, setLead] = useState(p?.lead ?? '');
  const [pm, setPm] = useState(p?.pm ?? '');
  const [start, setStart] = useState(p?.start ?? '');
  const [due, setDue] = useState(p?.due ?? '');
  const [stage, setStage] = useState<ProjectStage>('planned');
  const [org, setOrg] = useState(!!p?.org);
  const [errors, setErrors] = useState<{ name?: string; due?: string }>({});
  if (!me) return null;
  const pool = leadCandidates(db, div).map((q) => q.id);
  const exclude = db.people.filter((q) => !pool.includes(q.id)).map((q) => q.id);
  const submit = () => {
    const e = {
      name: name.trim() ? undefined : t('Give the project a name.'),
      due: start && due && due < start ? t('Target must be after the start.') : undefined,
    };
    setErrors(e);
    if (e.name || e.due) return;
    if (p && !canEditProject(db, me, p)) return;
    void saveProject(
      p?.id ?? null,
      {
        name: name.trim(),
        goal: goal.trim(),
        scopeIn: lines(scopeIn),
        scopeOut: lines(scopeOut),
        lead: lead || null,
        pm: pm || null,
        start: start || null,
        due: due || null,
        ...(isHigh(me) ? { org } : {}),
      },
      { stage, div },
    );
  };
  return (
    <>
      <InspectorHead>{p ? t('Edit project') : t('New project')}</InspectorHead>
      <h2 className={h2}>{p ? p.name : t('Start a project in {d}', { d: divisionOf(div)?.short ?? '' })}</h2>
      <Field label={t('Name')} htmlFor="p-name" required help={errors.name} error>
        <input
          id="p-name"
          className={cn(inputClass, errors.name && invalidClass)}
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Goal')} htmlFor="p-goal">
        <textarea
          id="p-goal"
          className={textareaClass}
          placeholder={t('What will be true when this is done?')}
          value={goal}
          onChange={(e) => {
            setGoal(e.target.value);
          }}
        />
      </Field>
      <Field label={t('In scope')} htmlFor="p-in" optional={t('One per line')}>
        <textarea
          id="p-in"
          className={cn(textareaClass, 'min-h-[60px]')}
          value={scopeIn}
          onChange={(e) => {
            setScopeIn(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Out of scope')} htmlFor="p-out" optional={t('One per line')}>
        <textarea
          id="p-out"
          className={cn(textareaClass, 'min-h-[60px]')}
          value={scopeOut}
          onChange={(e) => {
            setScopeOut(e.target.value);
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Lead')} htmlFor="p-lead">
          <PeopleSelect id="p-lead" value={lead} exclude={exclude} blank={t('No lead yet')} onChange={setLead} />
        </Field>
        <Field label={t('PM')} htmlFor="p-pm" optional={t('Optional')}>
          <PeopleSelect id="p-pm" value={pm} exclude={exclude} blank={t('None')} onChange={setPm} />
        </Field>
      </Grid2>
      <Grid2>
        <Field label={t('Start')} htmlFor="p-start">
          <DateField id="p-start" kind="start" label={t('Start')} value={start} onChange={setStart} />
        </Field>
        <Field label={t('Target')} htmlFor="p-due" help={errors.due} error>
          <DateField id="p-due" kind="due" label={t('Target')} value={due} onChange={setDue} />
        </Field>
      </Grid2>
      {!p && (
        <Field label={t('Stage')} htmlFor="p-stage">
          <SelectField
            id="p-stage"
            value={stage}
            onChange={(v) => {
              setStage(v as ProjectStage);
            }}
            options={(['planned', 'draft', 'active'] as const).map((k) => ({
              value: k,
              label: t(k === 'planned' ? 'Planned' : k === 'draft' ? 'Draft' : 'Active'),
            }))}
          />
        </Field>
      )}
      {isHigh(me) && (
        <label className="mb-3.5 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-[3px] accent-ink"
            checked={org}
            onChange={(e) => {
              setOrg(e.target.checked);
            }}
          />
          <span>
            <b className="block font-semibold">{t('Organization-wide')}</b>
            <small className="text-mute">
              {t('Everyone in DWDG can see this project. The workspace still runs it.')}
            </small>
          </span>
        </label>
      )}
      <div className="mt-[18px] flex gap-2">
        <Button variant="primary" onClick={submit}>
          {p ? t('Save') : t('Create project')}
        </Button>
        <Button variant="ghost" onClick={closeInspector}>
          {t('Cancel')}
        </Button>
      </div>
    </>
  );
}

const flatten = (ns: WbsNode[], db: Parameters<typeof isSummary>[0]): WbsNode[] =>
  ns.flatMap((n) => [...(isSummary(db, n.t) ? [n] : []), ...flatten(n.kids, db)]);

function MilestonePanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const ms: Milestone | undefined = db.milestones.find((v) => v.id === insp.id);
  const [title, setTitle] = useState(ms?.title ?? '');
  if (!me) return null;
  if (!ms) return <InspectorHead>{t('Milestone')}</InspectorHead>;
  const p = db.projects.find((x) => x.id === ms.project);
  if (!p) return <InspectorHead>{t('Milestone')}</InspectorHead>;
  const ts = db.tasks.filter((x) => x.milestone === ms.id && !x.trashed);
  const can = canMsEdit(db, me, ms);
  const codes = wbsCodes(db, p);
  const nodes = flatten(wbsTree(db, p), db);
  const cand = projTasks(db, p).filter((x) => x.milestone !== ms.id);
  return (
    <>
      <InspectorHead>{t('Milestone')}</InspectorHead>
      {can ? (
        <Field label={t('Name')} htmlFor="ms-t">
          <input
            id="ms-t"
            className={inputClass}
            autoFocus={!!insp.focusTitle}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            onBlur={() => {
              if (title.trim() && title.trim() !== ms.title) void setMilestoneField(ms.id, 'title', title);
              else setTitle(ms.title);
            }}
          />
        </Field>
      ) : (
        <h2 className={h2}>{ms.title}</h2>
      )}
      <MsState m={ms} />
      {canRoadmap(me) ? (
        <label className="mt-3 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-[3px] accent-ink"
            checked={!!ms.roadmap}
            onChange={(e) => {
              void setRoadmap(ms.id, e.target.checked);
            }}
          />
          <span>
            <b className="block font-semibold">{t('Show on the batch roadmap')}</b>
            <small className="text-mute">
              {t('Everyone sees it at the top of My Work. Only the President and VPs can change roadmap items.')}
            </small>
          </span>
        </label>
      ) : (
        ms.roadmap && (
          <p className="mt-2 flex items-center gap-1.5 text-mute type-small">
            <Icon name="flag" size="xs" />
            {t('On the batch roadmap, set by the President and VPs')}
          </p>
        )
      )}
      {can ? (
        <>
          <div className="mt-3">
            <Grid2>
              <Field label={t('Target')} htmlFor="ms-due">
                <DateField
                  id="ms-due"
                  kind="due"
                  label={t('Target')}
                  value={ms.target}
                  onChange={(v) => {
                    void setMilestoneField(ms.id, 'target', v);
                  }}
                />
              </Field>
              <Field label={t('Owner')} htmlFor="ms-own">
                <PeopleSelect
                  id="ms-own"
                  value={ms.owner}
                  onChange={(v) => {
                    void setMilestoneField(ms.id, 'owner', v);
                  }}
                />
              </Field>
            </Grid2>
          </div>
          <Field label={t('Place in the WBS')} htmlFor="ms-par">
            <SelectField
              id="ms-par"
              value={ms.parent ?? ''}
              onChange={(v) => {
                void setMilestoneField(ms.id, 'parent', v);
              }}
              options={[
                { value: '', label: t('Not placed') },
                ...nodes.map((n) => ({ value: n.t.id, label: `${n.code} ${n.t.title}` })),
              ]}
            />
          </Field>
        </>
      ) : (
        <div className="mt-3.5">
          <Meta>
            <MetaRow label={t('Project')}>
              <Link to={`/projects/${p.id}`}>{p.name}</Link>
            </MetaRow>
            <MetaRow label={t('Owner')}>
              <Avatar id={ms.owner} size="xs" />
              {who.name(ms.owner)}
            </MetaRow>
            <MetaRow label={t('Target')}>{ms.target ? dLong(ms.target) : t('No date')}</MetaRow>
          </Meta>
        </div>
      )}
      {ms.achievedAt && (
        <p className="text-mute type-small">
          {t('Achieved')} {dLong(ms.achievedAt.slice(0, 10))}
          {ms.achievedBy ? `, ${who.first(ms.achievedBy)}` : ''}
        </p>
      )}
      <SectionHeading count={`${ts.filter(isDone).length}/${ts.length}`}>{t('Linked tasks')}</SectionHeading>
      <div className="grid gap-1.5">
        {ts.map((x) => (
          <div key={x.id} className="flex items-center gap-2 text-d13">
            <TaskIcon icon={x.icon} size="xs" />
            <a
              className="min-w-0 flex-1 cursor-pointer no-underline"
              onClick={() => {
                openTask(x.id);
              }}
            >
              {codes[x.id] && <span className="text-mute type-num">{codes[x.id]} </span>}
              {x.title}
            </a>
            <TaskStatusMark status={x.status} />
            {can && (
              <IconButton
                className="size-6"
                aria-label={t('Unlink {t}', { t: x.title })}
                onClick={() => {
                  void unlinkTaskFromMilestone(x.id);
                }}
              >
                <Icon name="close" size="xs" />
              </IconButton>
            )}
          </div>
        ))}
        {!ts.length && <p className="m-0 text-mute type-small">{t('No tasks count toward it yet.')}</p>}
      </div>
      {can && cand.length > 0 && (
        <div className="mt-2">
          <SelectField
            value=""
            label={t('Link a task')}
            onChange={(v) => {
              if (v) void linkTaskToMilestone(v, ms.id);
            }}
            options={[
              { value: '', label: t('Link a task…') },
              ...cand.map((x) => ({ value: x.id, label: `${codes[x.id] ? `${codes[x.id]} ` : ''}${x.title}` })),
            ]}
          />
        </div>
      )}
      <p className="my-3 text-mute type-small">
        {t('A milestone is achieved only when someone records it. Passing the date marks it overdue, never done.')}
      </p>
      <div className="mt-[18px] flex flex-wrap gap-2">
        {can && ms.state !== 'achieved' && ms.state !== 'cancelled' && (
          <Button
            variant="primary"
            onClick={() => {
              void achieveMilestone(ms.id);
            }}
          >
            <Icon name="check" />
            {t('Record as achieved')}
          </Button>
        )}
        {can && (
          <Button
            variant="danger"
            onClick={() => {
              void deleteMilestone(ms.id);
            }}
          >
            <Icon name="trash" />
            {t('Delete milestone')}
          </Button>
        )}
      </div>
    </>
  );
}

function DecisionPanel({ insp }: { insp: InspectorRef }) {
  const me = useMe();
  const who = useWho();
  const db = useWorkspace((w) => w);
  const d = db.decisions.find((v) => v.id === insp.id);
  if (!me) return null;
  if (!d) return <InspectorHead>{t('Decision')}</InspectorHead>;
  const p = db.projects.find((x) => x.id === d.project);
  const mt = d.meeting ? db.meetings.find((x) => x.id === d.meeting) : undefined;
  return (
    <>
      <InspectorHead>{t('Decision')}</InspectorHead>
      <h2 className={h2}>{d.question}</h2>
      <DecState d={d} />
      <p className="my-3.5 max-w-[60ch] border-l-2 border-line-strong pl-3 text-ink-2">
        {d.result || <span className="text-mute">{t('No proposed result written.')}</span>}
      </p>
      <Meta>
        <MetaRow label={t('Decides')}>
          <Avatar id={d.approver} size="xs" />
          {who.name(d.approver)}
        </MetaRow>
        {d.decidedAt && <MetaRow label={t('Decided')}>{who.stamp(d.approver, d.decidedAt)}</MetaRow>}
        {p && (
          <MetaRow label={t('Project')}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link>
          </MetaRow>
        )}
        {mt && (
          <MetaRow label={t('Meeting')}>
            <a
              className="cursor-pointer"
              onClick={() => {
                openMeeting(mt.id);
              }}
            >
              {mt.title}
            </a>
          </MetaRow>
        )}
        <MetaRow label={t('Created')}>
          <Avatar id={d.createdBy} size="xs" />
          {who.stamp(d.createdBy, d.createdAt)}
        </MetaRow>
      </Meta>
      {d.state === 'awaiting' && d.approver === me.id && (
        <>
          <div className="mt-[18px] flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                void decide(d.id, 'approved');
              }}
            >
              <Icon name="check" />
              {t('Approve')}
            </Button>
            <Button
              onClick={() => {
                void decide(d.id, 'rejected');
              }}
            >
              {t('Reject')}
            </Button>
          </div>
          <p className="mt-3 text-mute type-small">
            {t('Your answer is recorded with your name and the time. A comment saying approved does not count.')}
          </p>
        </>
      )}
    </>
  );
}

PANELS['new-project'] = NewProjectPanel;
PANELS.ms = MilestonePanel;
PANELS.decision = DecisionPanel;
