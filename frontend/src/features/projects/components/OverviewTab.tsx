/* Project Overview (work_overview, work_project_tabs: it stays inside Overview, no extra tab): the goal and scope, the brief, links,
   milestones, blockers, decisions and recent changes, and beside them the progress, the next milestone, who works on it and the
   facts. From screens/plan.js projectOverview. */
import { type ReactNode, useState } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass } from '@/components/ui/forms';
import { SectionHeading, SubHeading } from '@/components/ui/Headings';
import { BrandIcon, Icon } from '@/components/ui/Icon';
import { SEV } from '@/components/ui/StatusBadge';
import { rank } from '@/lib/access';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { openDecision, openMilestone, openTask } from '@/lib/open';
import { useWho } from '@/lib/people';
import { ago, dLong, dShort } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { FaceStack } from '@/features/collaboration/components/Faces';
import { InviteNotice, PeopleBlock } from '@/features/collaboration/components/PeopleBlock';
import { cpFaces } from '@/features/collaboration/services/collaboration';
import { ChangeRow, inProject } from '@/features/updates/components/ChangesFeed';
import { PeopleSelect } from '@/features/work/components/task-panel/parts';
import type { Project } from '@/types/workspace';
import { team } from '../services/access';
import { addMilestone, addProjectDecision, lines } from '../services/project-actions';
import { nextMs, projBlockers, projMs, projTasks } from '../services/project-rules';
import { pStats } from '../services/register';
import { BriefSection } from './BriefSection';
import { Bar, DecState, MsState } from './Cells';
import { LinksSection } from './LinksSection';

const row = 'flex min-h-[var(--row-h)] cursor-pointer items-center gap-3 rounded-ctl px-2.5 py-1.5 hover:bg-hover';
const subform = 'my-2.5 grid gap-2.5 rounded-[10px] bg-surface-2 p-3.5 shadow-[inset_0_0_0_1px_var(--line)]';
const linkBtn =
  'inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent px-0 py-2 text-d13 font-semibold text-green-ink';
const empty = (text: string) => <div className="px-2.5 py-3 text-d13h text-mute">{text}</div>;
const Rows = ({ children }: { children: ReactNode }) => <div className="flex flex-col gap-[3px]">{children}</div>;

function Scope({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <SubHeading className="mt-0 mb-1.5">{title}</SubHeading>
      {items.length ? (
        <ul className="m-0 list-disc pl-[18px] text-d13h text-ink-2 [&_li+li]:mt-1">
          {items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-mute type-small">{t('Not written yet')}</p>
      )}
    </div>
  );
}

function AddMilestone({ p }: { p: Project }) {
  const me = useMe();
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState(p.lead ?? me?.id ?? '');
  const [date, setDate] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className={subform}>
      <Field label={t('Milestone')} htmlFor="ms-title" required help={err} error className="mb-0">
        <input
          id="ms-title"
          className={cn(inputClass, err && invalidClass)}
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </Field>
      <Grid2>
        <Field label={t('Owner')} htmlFor="ms-owner" className="mb-0">
          <PeopleSelect id="ms-owner" value={owner} onChange={setOwner} />
        </Field>
        <Field label={t('Target')} htmlFor="ms-date" className="mb-0">
          <DateField id="ms-date" kind="due" label={t('Target')} value={date} onChange={setDate} />
        </Field>
      </Grid2>
      <div className="flex gap-2">
        <Button
          small
          variant="primary"
          onClick={() => {
            if (!title.trim()) {
              setErr(t('Name the milestone.'));
              return;
            }
            void addMilestone(p.id, { title: title.trim(), owner, target: date || null });
          }}
        >
          {t('Add')}
        </Button>
        <Button
          small
          variant="ghost"
          onClick={() => {
            setUi((u) => {
              u.form = null;
            });
          }}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

function AddDecision({ p }: { p: Project }) {
  const me = useMe();
  const [q, setQ] = useState('');
  const [result, setResult] = useState('');
  const [approver, setApprover] = useState(me?.id ?? '');
  const [err, setErr] = useState('');
  const people = useWorkspace((db) => db.people.filter((x) => rank(x) < 2).map((x) => x.id));
  return (
    <div className={subform}>
      <Field label={t('Question')} htmlFor="dc-q" required help={err} error className="mb-0">
        <input
          id="dc-q"
          className={cn(inputClass, err && invalidClass)}
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Proposed result')} htmlFor="dc-r" className="mb-0">
        <input
          id="dc-r"
          className={inputClass}
          value={result}
          onChange={(e) => {
            setResult(e.target.value);
          }}
        />
      </Field>
      <Field label={t('Who decides')} htmlFor="dc-appr" className="mb-0">
        <PeopleSelect id="dc-appr" value={approver} exclude={people} onChange={setApprover} />
      </Field>
      <div className="flex gap-2">
        <Button
          small
          variant="primary"
          onClick={() => {
            if (!q.trim()) {
              setErr(t('Write the question that was decided.'));
              return;
            }
            void addProjectDecision(p.id, { question: q.trim(), result: result.trim(), approver });
          }}
        >
          {t('Record')}
        </Button>
        <Button
          small
          variant="ghost"
          onClick={() => {
            setUi((u) => {
              u.form = null;
            });
          }}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

export function OverviewTab({ p, edit }: { p: Project; edit: boolean }) {
  const who = useWho();
  const form = useUi((u) => u.form);
  const db = useWorkspace((w) => w);
  const ts = projTasks(db, p);
  const s = pStats(db, p);
  const ms = projMs(db, p);
  const nx = nextMs(db, p);
  const bks = projBlockers(db, p);
  const decs = db.decisions.filter((d) => d.project === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tm = team(db, p);
  const collab = [
    ...new Set(
      [
        ...ts.map((x) => x.owner),
        ...db.resources.filter((r) => r.project === p.id).flatMap((r) => [r.owner, ...r.contributors]),
      ].filter((i) => i && i !== p.lead && i !== p.pm && !tm.some((x) => x.id === i)),
    ),
  ];
  const faces = cpFaces(db, 'project', p);
  const extra = collab.filter((i) => !faces.includes(i));
  const acts = db.changes.filter((c) => inProject(db, c, p.id)).slice(0, 5);
  const jointDivs = [
    ...new Set(
      tm
        .filter((x) => x.state === 'joined')
        .map((x) => db.people.find((q) => q.id === x.id)?.div)
        .filter((d) => d && d !== p.div),
    ),
  ];
  const home = divisionOf(p.div);
  const scopeIn = lines(p.scopeIn);
  const scopeOut = lines(p.scopeOut);
  return (
    <>
      <InviteNotice p={p} />
      <div className="mt-[22px] grid grid-cols-[minmax(0,1fr)_300px] gap-8 max-[1000px]:grid-cols-[minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="m-0 mb-1 max-w-[68ch] text-d15 leading-6 text-ink">
            {p.goal || <span className="text-mute">{t('No goal written yet.')}</span>}
          </p>
          {p.reason && (
            <p className="text-mute type-small">
              {t('Stage reason')}: {p.reason}
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
            <Scope title={t('In scope')} items={scopeIn} />
            <Scope title={t('Out of scope')} items={scopeOut} />
          </div>
          <BriefSection p={p} edit={edit} />
          <LinksSection p={p} edit={edit} />

          <SectionHeading as="h2" count={ms.length}>
            {t('Milestones')}
          </SectionHeading>
          <Rows>
            {ms.length
              ? ms.map((x) => (
                  <div
                    key={x.id}
                    className={row}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      openMilestone(x.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') openMilestone(x.id);
                    }}
                  >
                    <Icon name="flag" size="sm" className="text-mute" />
                    <div className="min-w-0 flex-1">
                      {x.title}
                      <small className="block text-d12h text-mute">
                        {who.name(x.owner)}
                        {x === nx ? `, ${t('next')}` : ''}
                      </small>
                    </div>
                    <MsState m={x} />
                    <span className="text-ink-2 type-num">{x.target ? dShort(x.target) : t('No date')}</span>
                  </div>
                ))
              : empty(t('No milestones yet.'))}
          </Rows>
          {edit &&
            (form === 'pms' ? (
              <AddMilestone p={p} />
            ) : (
              <button
                type="button"
                className={linkBtn}
                onClick={() => {
                  setUi((u) => {
                    u.form = 'pms';
                  });
                }}
              >
                <Icon name="plus" size="xs" /> {t('Add a milestone')}
              </button>
            ))}

          <SectionHeading as="h2" count={bks.length}>
            {t('Open blockers')}
          </SectionHeading>
          <Rows>
            {bks.length
              ? bks.map((bk) => {
                  const task = db.tasks.find((x) => x.id === bk.task);
                  const tone =
                    bk.severity === 'high' ? 'text-danger' : bk.severity === 'low' ? 'text-mute' : 'text-warning';
                  const dot =
                    bk.severity === 'high'
                      ? 'bg-danger-soft text-danger'
                      : bk.severity === 'low'
                        ? 'bg-fill text-mute'
                        : 'bg-warning-soft text-warning';
                  return (
                    <div
                      key={bk.id}
                      className={cn(row, 'items-start gap-3 px-3 py-2.5')}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        openTask(bk.task);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') openTask(bk.task);
                      }}
                    >
                      <span
                        className={cn('grid size-7 flex-none place-items-center rounded-full', dot)}
                        aria-hidden="true"
                      >
                        <Icon name="warning" size="sm" />
                      </span>
                      <div className="grid min-w-0 flex-1 gap-0.5">
                        <b className="font-semibold">{bk.text}</b>
                        <small className="text-d12h leading-[18px] text-mute">
                          <span className={cn('font-semibold', tone)}>{t(SEV[bk.severity][0])}</span>.{' '}
                          {t('Needs {who}', { who: who.name(bk.owner) })}
                          {bk.action ? `: ${bk.action}` : ''}
                        </small>
                        <small className="text-d12h leading-[18px] text-mute">
                          {task ? `${t('On')} ${task.title}. ` : ''}
                          {t('Open since {d}', { d: ago(bk.openedAt) })}
                        </small>
                      </div>
                      <Avatar id={bk.owner} size="sm" className="mt-1" />
                    </div>
                  );
                })
              : empty(t('Nothing is blocked.'))}
          </Rows>

          <SectionHeading as="h2" count={decs.length}>
            {t('Decisions')}
          </SectionHeading>
          <Rows>
            {decs.length
              ? decs.map((d) => (
                  <div
                    key={d.id}
                    className={row}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      openDecision(d.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') openDecision(d.id);
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      {d.question}
                      <small className="block text-d12h text-mute">{d.result}</small>
                    </div>
                    <DecState d={d} />
                    <span className="text-ink-2 type-num">{dShort((d.decidedAt ?? d.createdAt).slice(0, 10))}</span>
                  </div>
                ))
              : empty(t('No decisions recorded.'))}
          </Rows>
          {edit &&
            (form === 'pdecision' ? (
              <AddDecision p={p} />
            ) : (
              <button
                type="button"
                className={linkBtn}
                onClick={() => {
                  setUi((u) => {
                    u.form = 'pdecision';
                  });
                }}
              >
                <Icon name="plus" size="xs" /> {t('Record a decision')}
              </button>
            ))}

          <SectionHeading as="h2">{t('Recent changes')}</SectionHeading>
          <div>
            {acts.length ? acts.map((c) => <ChangeRow key={c.id} c={c} flat />) : empty(t('No changes recorded yet.'))}
          </div>
          {acts.length > 0 && (
            <Link className={cn(linkBtn, 'no-underline')} to={`/updates/activity/${p.id}`}>
              {t('See all changes for this project')}
            </Link>
          )}
        </div>

        <aside className="self-start rounded-sheet bg-surface-2 p-[18px] max-[760px]:p-3.5">
          <h2 className="m-0 pb-0.5 type-h3">{t('Progress')}</h2>
          <div className="mt-2 flex items-baseline gap-2">
            <b className="font-mono text-d22 font-semibold">
              {s.done}/{s.total}
            </b>
            <span className="text-mute">{t('tasks completed')}</span>
          </div>
          {s.total > 0 && (
            <div className="mt-2 flex">
              <Bar pct={(s.done / s.total) * 100} />
            </div>
          )}
          <p className="text-mute type-small">{t('Counted from saved tasks. Not a health score.')}</p>
          {nx && (
            <>
              <SectionHeading as="h2">{t('Next milestone')}</SectionHeading>
              <div
                className={row}
                role="button"
                tabIndex={0}
                onClick={() => {
                  openMilestone(nx.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openMilestone(nx.id);
                }}
              >
                <Icon name="flag" size="sm" className="text-mute" />
                <div className="min-w-0 flex-1">
                  <b className="font-semibold">{nx.title}</b>
                  <small className="block text-d12h text-mute">{dLong(nx.target)}</small>
                </div>
              </div>
            </>
          )}
          <PeopleBlock kind="project" x={p} />
          {extra.length > 0 && (
            <p className="mx-1 mt-2 flex items-center gap-2 text-mute type-small">
              {t('Also has work here')}: <FaceStack ids={extra} n={6} />
            </p>
          )}
          <dl className="mt-4 mb-0 grid grid-cols-[96px_1fr] gap-x-2.5 gap-y-3 text-d13 [&_dd]:m-0 [&_dd]:flex [&_dd]:min-w-0 [&_dd]:items-center [&_dd]:gap-[7px] [&_dt]:text-mute">
            <dt>{t('Workspace')}</dt>
            <dd>
              <BrandIcon id={home?.icon ?? ''} label={false} className="size-3.5" />
              {home?.short}
            </dd>
            {jointDivs.length > 0 && (
              <>
                <dt>{t('Also with')}</dt>
                <dd className="flex-wrap gap-x-2.5 gap-y-1">
                  {jointDivs.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1">
                      <BrandIcon id={divisionOf(d as never)?.icon ?? ''} label={false} className="size-3.5" />
                      {divisionOf(d as never)?.short}
                    </span>
                  ))}
                </dd>
              </>
            )}
            <dt>{t('Start')}</dt>
            <dd>{p.start ? dLong(p.start) : <span className="text-mute">{t('Not set')}</span>}</dd>
            <dt>{t('Target')}</dt>
            <dd>{p.due ? dLong(p.due) : <span className="text-mute">{t('Not set')}</span>}</dd>
            <dt>{t('Created')}</dt>
            <dd>
              <Avatar id={p.createdBy} size="xs" />
              {who.stamp(p.createdBy, p.createdAt)}
            </dd>
          </dl>
        </aside>
      </div>
    </>
  );
}
