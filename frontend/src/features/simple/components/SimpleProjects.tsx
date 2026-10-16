/* Projects in the Simple look: four status groups instead of nine stages, big cards with progress, one page per project with its
   tasks, people and links, and the project sheet. A project's tabs (planning, work breakdown) stay on the full page. From
   screens/simple.js sProjects, sProjectPage, INSP['s-project']. */
import { useState } from 'react';
import { Link } from 'react-router';
import { divisionOf, DIVS } from '@/app/config/org';
import type { InspectorRef } from '@/app/ui-state';
import { Avatar } from '@/components/shared/Avatar';
import { InspectorHead, PANELS } from '@/components/shared/Inspector';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Field, Grid2, inputClass, invalidClass, textareaClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { SelectField } from '@/components/ui/SelectField';
import { NotAvailable, Page as DsPage } from '@/components/ui/page';
import { canCreateProject, visibleDivs } from '@/lib/access';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { dLong, dShort, today } from '@/lib/time';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { QuickAdd } from '@/features/work/components/QuickAdd';
import { TaskTimeline } from '@/features/work/components/TaskTimeline';
import { isDone, personOf, projOf } from '@/features/work/services/selectors';
import { RegisterTimeline } from '@/features/projects/components/ProjectViews';
import { canEditProject, projBlockers, projTasks } from '@/features/projects/services/project-rules';
import { lines, saveProject, setProjectStage } from '@/features/projects/services/project-actions';
import { pStats } from '@/features/projects/services/register';
import { team } from '@/features/projects/services/access';
import type { DivisionId, PersonId, Project } from '@/types/workspace';
import {
  Card,
  Empty,
  KindSwitch,
  MoreButton,
  Page,
  PageHead,
  ProjectObject,
  SGROUPS,
  SGROUP_STAGE,
  Section,
  StatusWord,
  TaskRow,
  ViewSeg,
  byDue,
  canSee,
  groupOf,
  useRememberKind,
  useSimpleView,
  type GroupKey,
} from './parts';

const divName = (id: string | null | undefined) => divisionOf(id)?.name ?? t('Organization');

function ProgressBar({ p }: { p: Project }) {
  const db = useWorkspace((w) => w);
  const s = pStats(db, p);
  return (
    <div className="flex items-center gap-3 text-ink-2 type-small">
      {s.total ? (
        <>
          <span className="h-1.5 max-w-[220px] flex-1 overflow-hidden rounded-[3px] bg-fill" aria-hidden="true">
            <i
              className="block h-full rounded-[3px] bg-green-ink"
              style={{ width: `${String(Math.round((s.done / s.total) * 100))}%` }}
            />
          </span>
          <span>{t('{d} of {n} tasks done', { d: s.done, n: s.total })}</span>
        </>
      ) : (
        <span className="text-mute">{t('No tasks yet')}</span>
      )}
    </div>
  );
}

function ProjectCard({ p }: { p: Project }) {
  const db = useWorkspace((w) => w);
  const late = !!p.due && p.due < today() && groupOf(p.stage) !== 'done';
  const bl = projBlockers(db, p).length;
  const lead = p.lead ? personOf(db, p.lead) : undefined;
  return (
    <Link
      to={`/projects/${p.id}`}
      className="flex flex-col gap-3.5 rounded-2xl bg-surface p-5 text-inherit no-underline shadow-sheet transition-shadow hover:shadow-pop"
    >
      <div className="flex items-center justify-between gap-3">
        <ProjectObject project={p} size="sm" />
        <h3 className="m-0 min-w-0 flex-1 type-h3">{p.name}</h3>
        <StatusWord stage={p.stage} />
      </div>
      {p.goal && <p className="m-0 line-clamp-2 text-ink-2 type-small">{p.goal}</p>}
      <ProgressBar p={p} />
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5 type-small">
        {lead ? (
          <span className="inline-flex items-center gap-2 text-ink">
            <Avatar id={lead.id} size="sm" className="size-7" />
            {lead.name}
          </span>
        ) : (
          <span className="text-mute">{t('No lead yet')}</span>
        )}
        <span className={late ? 'text-danger' : 'text-mute'}>
          {p.due ? t('Due {d}', { d: dShort(p.due) }) : t('No due date')}
        </span>
      </div>
      {bl > 0 && (
        <span className="-mt-1 text-[14px] leading-5 font-semibold text-danger">
          {plural(bl, '{n} task is blocked', '{n} tasks are blocked')}
        </span>
      )}
    </Link>
  );
}

export function SimpleProjects() {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const view = useSimpleView('projects');
  const [g, setG] = useState<GroupKey>('progress');
  const [q, setQ] = useState('');
  const [dsel, setDsel] = useState('all');
  useRememberKind('projects');
  if (!me) return null;
  const divs = visibleDivs(me);
  const many = divs.length > 1;
  const creatable = DIVS.map((d) => d.id).filter((d) => canCreateProject(me, d));
  const all = db.projects.filter(
    (p) =>
      canSee(db, me, p) && (dsel === 'all' || p.div === dsel) && (!q || p.name.toLowerCase().includes(q.toLowerCase())),
  );
  const n = Object.fromEntries(SGROUPS.map(([k]) => [k, all.filter((p) => groupOf(p.stage) === k).length])) as Record<
    GroupKey,
    number
  >;
  const list = all.filter((p) => groupOf(p.stage) === g).sort((a, b) => (a.due ?? '9').localeCompare(b.due ?? '9'));
  const sub = many ? (dsel === 'all' ? t('All divisions') : divName(dsel)) : divName(me.div);
  return (
    <Page>
      <KindSwitch cur="projects" />
      <PageHead title={t('Projects')} sub={`${t('Work with a goal and an end date')}, ${sub}`}>
        {creatable.length > 0 && (
          <Button
            variant="primary"
            onClick={() => {
              setUi((u) => void (u.insp = { type: 's-project' }));
            }}
          >
            <Icon name="plus" />
            {t('New project')}
          </Button>
        )}
      </PageHead>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        {view === 'cards' ? (
          <div
            className="-m-0.5 flex [scrollbar-width:none] gap-2 overflow-x-auto p-0.5"
            role="tablist"
            aria-label={t('Status')}
          >
            {SGROUPS.map(([k, l]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={g === k}
                className={cn(
                  'inline-flex h-11 flex-none cursor-pointer items-center gap-2 rounded-full border-0 bg-surface px-[18px] text-[16px] font-[550] whitespace-nowrap text-ink-2 shadow-sheet',
                  g === k && 'bg-ink text-on-ink shadow-none',
                )}
                onClick={() => {
                  setG(k);
                }}
              >
                {t(l)}
                <span className={cn('font-medium', g === k ? 'opacity-70' : 'text-mute')}>{n[k]}</span>
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <ViewSeg k="projects" />
      </div>
      <div className="mt-3.5 mb-5 flex gap-2.5 max-[899px]:flex-col">
        <label className="flex h-12 flex-1 items-center gap-2.5 rounded-[14px] bg-surface px-4 text-mute shadow-sheet [&_.ic]:size-5">
          <Icon name="search" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-ink outline-none type-body"
            placeholder={t('Search projects')}
            aria-label={t('Search projects')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
            }}
          />
        </label>
        {many && (
          <SelectField
            value={dsel}
            className="h-12 max-w-[280px] max-[899px]:max-w-none"
            onChange={setDsel}
            options={[
              { value: 'all', label: t('All divisions') },
              ...divs.map((d) => ({ value: d, label: divName(d) })),
            ]}
          />
        )}
      </div>
      {view === 'timeline' ? (
        <Card className="overflow-hidden px-4 py-3.5">
          <RegisterTimeline list={all.filter((p) => groupOf(p.stage) !== 'done')} />
        </Card>
      ) : list.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 max-[899px]:grid-cols-[minmax(0,1fr)] max-[899px]:gap-3">
          {list.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <Empty title={q ? t('No projects match your search') : t('No projects here')}>
          {t('Try another status above, or search for a name.')}
        </Empty>
      )}
    </Page>
  );
}

export function SimpleProject({ id }: { id: string }) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const view = useSimpleView('project');
  const [showDone, setShowDone] = useState(false);
  useRememberKind('projects');
  const p = projOf(db, id);
  if (!p || !me || !canSee(db, me, p))
    return (
      <DsPage>
        <NotAvailable />
      </DsPage>
    );
  const edit = canEditProject(db, me, p);
  const ts = projTasks(db, p);
  const open = ts.filter((x) => !isDone(x)).sort(byDue);
  const done = ts.filter(isDone);
  const people = [
    ...new Set(
      [
        p.lead,
        p.pm,
        ...team(db, p)
          .filter((x) => x.state === 'joined')
          .map((x) => x.id),
      ].filter((x): x is PersonId => !!x),
    ),
  ];
  const links = db.resources.filter((r) => r.project === p.id && !r.archived && r.kind === 'link' && r.url);
  const late = !!p.due && p.due < today() && groupOf(p.stage) !== 'done';
  const canAdd = edit || people.includes(me.id) || visibleDivs(me).includes(p.div);
  const tl = view === 'timeline';
  const host = (u: string) => {
    try {
      return new URL(u).hostname;
    } catch {
      return u;
    }
  };
  return (
    <Page narrow={!tl}>
      <Link
        className="-mt-3 mr-0 mb-1 -ml-2 inline-flex h-11 items-center gap-0.5 rounded-[10px] px-2 text-[16px] font-[550] text-ink-2 no-underline hover:bg-hover [&>.ic]:size-5"
        to="/projects"
      >
        <Icon name="chevron-left" />
        {t('Projects')}
      </Link>
      <Card className="mb-4 grid gap-4 overflow-visible p-6 max-[899px]:p-5">
        <div className="flex items-center gap-3">
          <ProjectObject project={p} size="hero" />
          <h1 className="m-0 min-w-0 flex-1 tracking-[-0.02em] type-title">{p.name}</h1>
          {edit && (
            <Button
              onClick={() => {
                setUi((u) => void (u.insp = { type: 's-project', id: p.id }));
              }}
            >
              {t('Edit')}
            </Button>
          )}
        </div>
        {p.goal && <p className="m-0 text-ink-2 type-body">{p.goal}</p>}
        <dl className="m-0 grid grid-cols-3 gap-3 border-y border-line py-4 max-[600px]:grid-cols-1 [&_dd]:m-0 [&_dd]:mt-1.5 [&_dt]:text-mute [&_dt]:type-small">
          <div>
            <dt>{t('Status')}</dt>
            <dd>
              {edit ? (
                <SelectField
                  value={groupOf(p.stage)}
                  className="w-auto"
                  onChange={(v) => {
                    const k = v as GroupKey;
                    if (groupOf(p.stage) !== k) void setProjectStage(p.id, SGROUP_STAGE[k], '');
                  }}
                  options={SGROUPS.map(([k, l]) => ({ value: k, label: t(l) }))}
                />
              ) : (
                <StatusWord stage={p.stage} />
              )}
            </dd>
          </div>
          <div>
            <dt>{t('Lead')}</dt>
            <dd>
              {p.lead ? (
                <span className="inline-flex items-center gap-2">
                  <Avatar id={p.lead} size="sm" className="size-7" />
                  {personOf(db, p.lead)?.name}
                </span>
              ) : (
                t('No lead yet')
              )}
            </dd>
          </div>
          <div>
            <dt>{t('Due')}</dt>
            <dd className={late ? 'text-danger' : ''}>{p.due ? dLong(p.due) : t('No due date')}</dd>
          </div>
        </dl>
        <ProgressBar p={p} />
        <Link
          to={`/projects/${p.id}/overview`}
          className="flex min-h-14 items-center gap-3 rounded-xl bg-surface-2 px-3.5 py-2.5 text-ink no-underline hover:bg-hover [&>.ic]:size-5 [&>.ic]:text-mute"
        >
          <Icon name="projects" />
          <span className="grid flex-1 gap-0.5">
            <b>{t('See the full plan')}</b>
            <small className="text-mute type-small">
              {t('Brief, milestones, work breakdown, timeline and resources')}
            </small>
          </span>
          <Icon name="chevron" />
        </Link>
      </Card>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <span />
        <ViewSeg k="project" first="Tasks" />
      </div>
      {tl ? (
        <Card className="overflow-hidden px-4 py-3.5">
          <TaskTimeline tasks={ts} project={p.id} />
        </Card>
      ) : (
        <>
          {canAdd && (
            <Card>
              <QuickAdd inCard project={p.id} />
            </Card>
          )}
          {open.length ? (
            <Section title={t('To do')} n={open.length}>
              {open.map((x, i) => (
                <TaskRow key={x.id} task={x} owner noProject first={i === 0} />
              ))}
            </Section>
          ) : (
            <Empty title={t('Nothing left to do')}>{canAdd ? t('Add the first task above.') : undefined}</Empty>
          )}
          {done.length > 0 && (
            <>
              <MoreButton
                on={showDone}
                onClick={() => {
                  setShowDone(!showDone);
                }}
              >
                {showDone
                  ? t('Hide completed tasks')
                  : plural(done.length, 'Show {n} completed task', 'Show {n} completed tasks')}
              </MoreButton>
              {showDone && (
                <Section title={t('Completed')} n={done.length}>
                  {done.map((x, i) => (
                    <TaskRow key={x.id} task={x} owner noProject first={i === 0} />
                  ))}
                </Section>
              )}
            </>
          )}
        </>
      )}
      {people.length > 0 && (
        <Section title={t('People')}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 px-5 py-4">
            {people.map((pid) => {
              const x = personOf(db, pid);
              return (
                <span key={pid} className="inline-flex items-center gap-2 text-ink">
                  <Avatar id={pid} className="size-10 text-[15px]" />
                  <span className="grid">
                    <b>{x?.name}</b>
                    <small className="text-mute type-small">{pid === p.lead ? t('Lead') : x?.title}</small>
                  </span>
                </span>
              );
            })}
          </div>
        </Section>
      )}
      {links.length > 0 && (
        <Section title={t('Links')}>
          {links.map((r, i) => (
            <a
              key={r.id}
              className={cn(
                'relative flex min-h-16 items-center gap-2 py-2.5 pr-4 pl-5 text-inherit no-underline hover:bg-hover',
                i > 0 &&
                  'before:absolute before:top-0 before:right-0 before:left-5 before:h-px before:bg-line before:content-[""]',
              )}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="type-body">{r.name}</span>
                <span className="text-mute type-small">{host(r.url)}</span>
              </span>
              <Icon name="chevron" className="size-5 text-faint" />
            </a>
          ))}
        </Section>
      )}
    </Page>
  );
}

// ---------- the project sheet ----------
function ProjectSheet({ insp }: { insp: InspectorRef }) {
  const db = useWorkspace((w) => w);
  const me = useMe();
  const ws = useUi((u) => u.sdiv as string | undefined);
  const p = insp.id ? projOf(db, insp.id) : undefined;
  const divs = DIVS.map((d) => d.id).filter((d) => !!me && canCreateProject(me, d));
  const [name, setName] = useState(p?.name ?? '');
  const [goal, setGoal] = useState(p?.goal ?? '');
  const [div, setDiv] = useState<string>(divs.includes((ws ?? '') as DivisionId) ? (ws ?? '') : (divs[0] ?? ''));
  const [lead, setLead] = useState(p?.lead ?? '');
  const [due, setDue] = useState(p?.due ?? '');
  const [grp, setGrp] = useState('planned');
  const [err, setErr] = useState<{ k: string; msg: string } | null>(null);
  if (!me) return null;
  const people = db.people.filter((x) => x.status === 'active');
  const bad = (k: string) => err?.k === k;
  const save = () => {
    if (!name.trim()) {
      setErr({ k: 'name', msg: t('Give the project a name.') });
      return;
    }
    if (p) {
      if (p.start && due && due < p.start) {
        setErr({ k: 'due', msg: t('The due date must be after the start.') });
        return;
      }
      void saveProject(
        p.id,
        {
          name: name.trim(),
          goal: goal.trim(),
          scopeIn: lines(p.scopeIn),
          scopeOut: lines(p.scopeOut),
          lead: lead || null,
          pm: p.pm ?? null,
          start: p.start ?? null,
          due: due || null,
          ...(p.org ? { org: p.org } : {}),
        },
        { stage: p.stage, div: p.div },
      );
      return;
    }
    if (!div || !canCreateProject(me, div as DivisionId)) return;
    void saveProject(
      null,
      {
        name: name.trim(),
        goal: goal.trim(),
        scopeIn: [],
        scopeOut: [],
        lead: lead || null,
        pm: null,
        start: null,
        due: due || null,
      },
      { stage: SGROUP_STAGE[grp === 'progress' ? 'progress' : 'planned'], div: div as DivisionId },
    );
  };
  return (
    <div className="px-6 pt-5 pb-8 max-[899px]:px-5 max-[899px]:pt-3 max-[899px]:pb-7">
      <InspectorHead>{p ? t('Edit project') : t('New project')}</InspectorHead>
      <h2 className="mt-2 mb-3 type-h2">{p ? p.name : t('New project')}</h2>
      <Field label={t('Name')} htmlFor="sp-name" help={bad('name') ? (err?.msg ?? '') : ''} error={bad('name')}>
        <input
          id="sp-name"
          className={cn(inputClass, bad('name') && invalidClass)}
          value={name}
          autoFocus
          autoComplete="off"
          onChange={(e) => {
            setName(e.target.value);
            setErr(null);
          }}
        />
      </Field>
      <Field label={`${t('Goal')} (${t('Optional')})`} htmlFor="sp-goal">
        <textarea
          id="sp-goal"
          className={textareaClass}
          placeholder={t('What will be true when this is done?')}
          value={goal}
          onChange={(e) => {
            setGoal(e.target.value);
          }}
        />
      </Field>
      {!p && divs.length > 1 && (
        <Field label={t('Division')} htmlFor="sp-div">
          <SelectField
            id="sp-div"
            value={div}
            onChange={setDiv}
            options={divs.map((d) => ({ value: d, label: divName(d) }))}
          />
        </Field>
      )}
      <Field label={t('Lead')} htmlFor="sp-lead">
        <SelectField
          id="sp-lead"
          people
          value={lead}
          onChange={setLead}
          options={[{ value: '', label: t('No lead yet') }, ...people.map((x) => ({ value: x.id, label: x.name }))]}
        />
      </Field>
      <Grid2>
        <Field label={t('Due date')} htmlFor="sp-due" help={bad('due') ? (err?.msg ?? '') : ''} error={bad('due')}>
          <DateField
            id="sp-due"
            value={due}
            onChange={(v) => {
              setDue(v);
              setErr(null);
            }}
          />
        </Field>
        {!p && (
          <Field label={t('Status')} htmlFor="sp-g">
            <SelectField
              id="sp-g"
              value={grp}
              onChange={setGrp}
              options={[
                { value: 'planned', label: t('Planned') },
                { value: 'progress', label: t('In progress') },
              ]}
            />
          </Field>
        )}
      </Grid2>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary" onClick={save}>
          {p ? t('Save') : t('Create project')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setUi((u) => void (u.insp = null));
          }}
        >
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}
PANELS['s-project'] = ProjectSheet;
