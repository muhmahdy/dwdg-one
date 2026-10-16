/* The project page: a header (picture, name, stage, lead, dates, program, who works on it) and five tabs: Overview, WBS, Work,
   Resources, People (work_project_tabs). From screens/plan.js projectPage and stageForm. */
import { useState } from 'react';
import { Link } from 'react-router';
import { divisionOf } from '@/app/config/org';
import type { Route } from '@/app/router/routes';
import { Avatar } from '@/components/shared/Avatar';
import { openMenu } from '@/components/shared/menus';
import { ProjectObject } from '@/components/shared/art/objects';
import { Button } from '@/components/ui/Button';
import { Field, inputClass, invalidClass } from '@/components/ui/forms';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { Stage } from '@/components/ui/StatusBadge';
import { NotAvailable, Page, TabLinks } from '@/components/ui/page';
import { cn } from '@/lib/cn';
import { t } from '@/lib/i18n';
import { dShort } from '@/lib/time';
import { shallow } from '@/lib/store';
import { useMe, useUi, useWorkspace } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { CpGlance } from '@/features/collaboration/components/Faces';
import { InviteNotice, PeopleBlock } from '@/features/collaboration/components/PeopleBlock';
import { cpFaces } from '@/features/collaboration/services/collaboration';
import { ArtEdit } from '@/features/looks/components/Looks';
import { PinButton } from '@/features/pins/components/PinButton';
import { ProgramChip } from '@/features/programs/components/ProgramChip';
import { ProjectResources } from '@/features/resources/components/ResourcesPage';
import { QuickAdd } from '@/features/work/components/QuickAdd';
import { TaskBoard } from '@/features/work/components/TaskBoard';
import { TaskRow } from '@/features/work/components/TaskRow';
import { TaskTimeline } from '@/features/work/components/TaskTimeline';
import { ViewSwitch, useView } from '@/features/work/components/ViewSwitch';
import { isDone } from '@/features/work/services/selectors';
import type { Project, ProjectStage } from '@/types/workspace';
import { canSeeProject } from '../services/access';
import { completionBlocks, setProjectStage } from '../services/project-actions';
import { canEditProject, projTasks } from '../services/project-rules';
import { OverviewTab } from './OverviewTab';
import { WbsTab } from './WbsTab';

type Tab = 'overview' | 'wbs' | 'work' | 'resources' | 'people';
const TABS: [Tab, string, string][] = [
  ['overview', 'Overview', 'The brief, scope, milestones, people and decisions'],
  ['wbs', 'WBS', 'Work breakdown: the project split into phases and work packages'],
  ['work', 'Work', 'Every task in the project, as a list, a board or a timeline'],
  ['resources', 'Resources', 'Notes, links and folders for this project'],
  ['people', 'People', 'Who works on this project, their roles and divisions'],
];

export function ProjectCrumb({ route }: { route: Route }) {
  const p = useWorkspace((db) => db.projects.find((x) => x.id === route.id));
  if (!p) return <Link to="/projects">{t('Projects')}</Link>;
  return (
    <>
      <Link to="/projects" className="no-underline">
        {divisionOf(p.div)?.short} {t('Projects')}
      </Link>
      <i className="mx-1.5 text-faint not-italic">/</i>
      <b>{p.name}</b>
    </>
  );
}

function PersonChip({ id, label }: { id: string; label: string }) {
  const first = useWorkspace((db) => db.people.find((q) => q.id === id)?.first ?? '');
  return (
    <span className="inline-flex h-[21px] items-center gap-1.5 align-top font-[550]">
      <Avatar id={id} size="xs" />
      {t(label, { who: first })}
    </span>
  );
}

/** Hold and cancel need a reason; completing needs a lead and no open blocker or pending review (work_project_lifecycle). */
function StageForm({ p, k }: { p: Project; k: ProjectStage }) {
  const blocks = useWorkspace((db) => completionBlocks(db, p));
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const close = () => {
    setUi((u) => {
      u.form = null;
    });
  };
  if (k === 'completed')
    return (
      <Notice tone="warn" icon="warning" title={<b>{t('This project cannot be completed yet')}</b>} className="mt-3.5">
        <p>{blocks.join(' ')}</p>
        <p>{t('Resolve these first. A share of finished tasks alone never closes a project.')}</p>
        <div className="mt-2">
          <Button small onClick={close}>
            {t('OK')}
          </Button>
        </div>
      </Notice>
    );
  return (
    <div className="mt-3.5 mb-2.5 grid gap-2.5 rounded-[10px] bg-surface-2 p-3.5 shadow-[inset_0_0_0_1px_var(--line)]">
      <Field
        label={t('Why is it {stage}?', { stage: t(k === 'hold' ? 'On hold' : 'Canceled').toLowerCase() })}
        htmlFor="st-reason"
        required
        help={err}
        error
        className="mb-0"
      >
        <input
          id="st-reason"
          className={cn(inputClass, err && invalidClass)}
          autoFocus
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
          }}
        />
      </Field>
      <div className="flex gap-2">
        <Button
          small
          variant="primary"
          onClick={() => {
            if (!reason.trim()) {
              setErr(t('Give a reason.'));
              return;
            }
            void setProjectStage(p.id, k, reason.trim());
          }}
        >
          {t('Change stage')}
        </Button>
        <Button small variant="ghost" onClick={close}>
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
}

function WorkTab({ p }: { p: Project }) {
  const view = useView('proj');
  const showDone = useUi((u) => u.showDone);
  const ts = useWorkspace((db) => projTasks(db, p), shallow);
  const open = ts.filter((x) => !isDone(x)).sort((a, b) => (a.due ?? '9').localeCompare(b.due ?? '9'));
  const done = ts.filter(isDone);
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <QuickAdd inCard={false} bar project={p.id} />
        <ViewSwitch scope="proj" />
      </div>
      {view === 'board' ? (
        <TaskBoard tasks={ts} owner />
      ) : view === 'timeline' ? (
        <TaskTimeline tasks={ts} project={p.id} />
      ) : (
        <>
          <div className="flex flex-col gap-[3px]">
            {open.length ? (
              open.map((x) => <TaskRow key={x.id} task={x} owner noCtx />)
            ) : (
              <div className="px-2.5 py-3.5 text-d13h text-mute">{t('No open tasks.')}</div>
            )}
          </div>
          {done.length > 0 && (
            <>
              <button
                type="button"
                className="mt-2 inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent px-2.5 py-2 text-d13 text-mute hover:text-ink"
                onClick={() => {
                  setUi((u) => {
                    u.showDone = !u.showDone;
                  });
                }}
              >
                <Icon name="check" size="sm" />
                {showDone ? t('Hide {n} completed', { n: done.length }) : t('Show {n} completed', { n: done.length })}
              </button>
              {showDone && (
                <div className="flex flex-col gap-[3px]">
                  {done.map((x) => (
                    <TaskRow key={x.id} task={x} owner noCtx />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

export function ProjectPage({ route }: { route: Route }) {
  const me = useMe();
  const db = useWorkspace((w) => w);
  const form = useUi((u) => u.form);
  const p = db.projects.find((x) => x.id === route.id);
  if (!me || !p || !canSeeProject(db, me, p)) return <NotAvailable />;
  const tab: Tab = TABS.some(([k]) => k === route.sub) ? (route.sub as Tab) : 'overview';
  const edit = canEditProject(db, me, p);
  const counts: Partial<Record<Tab, number>> = {
    work: projTasks(db, p).length,
    resources: db.resources.filter((r) => r.project === p.id && !r.archived).length,
    people: cpFaces(db, 'project', p).length,
  };
  return (
    <Page wide data-page="project" className="proj">
      <div className="flex items-center gap-3.5 max-[480px]:flex-wrap" data-art-host="">
        <span className="mr-1">
          <ArtEdit kind="project" x={p}>
            <ProjectObject project={p} size="hero" />
          </ArtEdit>
        </span>
        <div className="min-w-0 flex-1 max-[480px]:basis-full">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <h1 className="m-0 min-w-0 flex-[1_1_260px] type-title comfortable:tracking-[-0.01em]">{p.name}</h1>
            <div className="flex flex-none flex-wrap items-start gap-2 pt-1">
              <PinButton kind="project" id={p.id} />
              {edit && (
                <Button
                  small
                  onClick={() => {
                    setUi((u) => {
                      u.insp = { type: 'new-project', id: p.id };
                    });
                  }}
                >
                  <Icon name="edit" />
                  {t('Edit details')}
                </Button>
              )}
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-d13 text-mute">
            {edit ? (
              <Button
                small
                variant="ghost"
                className="-ml-1.5 px-1.5"
                aria-haspopup="menu"
                aria-label={t('Change stage')}
                onClick={(e) => {
                  openMenu(e.currentTarget, { type: 'pstage', id: p.id });
                }}
              >
                <Stage stage={p.stage} />
                <Icon name="chevron-down" size="sm" />
              </Button>
            ) : (
              <Stage stage={p.stage} />
            )}
            {p.lead ? <PersonChip id={p.lead} label="Lead {who}" /> : <span>{t('No lead')}</span>}
            {p.pm && <PersonChip id={p.pm} label="PM {who}" />}
            <span className="type-num">
              {p.start ? dShort(p.start) : '?'} – {p.due ? dShort(p.due) : t('no target')}
            </span>
            <ProgramChip kind="project" x={p} />
            <Link
              to={`/projects/${p.id}/people`}
              className="inline-flex items-center gap-2 no-underline"
              title={t('People')}
            >
              <CpGlance kind="project" x={p} />
            </Link>
          </div>
        </div>
      </div>
      {form?.startsWith('stage-') && <StageForm p={p} k={form.slice(6) as ProjectStage} />}
      <TabLinks
        className="mt-[18px]"
        label={t('Project')}
        tabs={TABS.map(([k, l, tip]) => ({
          to: `/projects/${p.id}/${k}`,
          label: t(l),
          on: tab === k,
          count: counts[k] ?? null,
          title: t(tip),
        }))}
      />
      <div className="mt-1.5">
        {tab === 'overview' && <OverviewTab p={p} edit={edit} />}
        {tab === 'wbs' && <WbsTab p={p} edit={edit} />}
        {tab === 'work' && <WorkTab p={p} />}
        {tab === 'resources' && <ProjectResources p={p} />}
        {tab === 'people' && (
          <>
            <InviteNotice p={p} />
            <PeopleBlock kind="project" x={p} />
            <p className="mx-1 mt-2.5 text-mute type-small">
              {t(
                'Lead and Manager change the project and its people. Members do the work and can leave at any time. People from another division join after accepting.',
              )}
            </p>
          </>
        )}
      </div>
    </Page>
  );
}
