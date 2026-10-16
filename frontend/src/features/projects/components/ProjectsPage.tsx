/* Projects register v3 (owner, 6 Oct round 6; work_projects_register). Scope tabs: this workspace, shared with it, organisation-wide,
   and all divisions for the President, VP and Admin. Sort by stage (grouped), target date, start date or name. Grid is the default
   view; Rows and Timeline are the others. Comfortable folds the scope, stage and sort into one filter menu behind the search field
   (R025). From screens/plan.js projectsRegister. */
import { divisionOf } from '@/app/config/org';
import { openMenu } from '@/components/shared/menus';
import { Button, IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { LineGlyph } from '@/components/shared/art/task-icons';
import { PG_D } from '@/features/programs/services/programs';
import { Stage, STAGE_ORDER } from '@/components/ui/StatusBadge';
import { Page, PageHeader, SearchField, Toolbar, tabClass } from '@/components/ui/page';
import { canCreateProject } from '@/lib/access';
import { cn } from '@/lib/cn';
import { plural, t } from '@/lib/i18n';
import { look, setSession } from '@/lib/session';
import { useMe, useSession, useUi, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { go } from '@/app/router/navigation';
import { ProgramGroups, useGroupByProgram } from '@/features/programs/components/ProgramGroups';
import { canCreateProgram } from '../services/project-rules';
import { isHigh, scopeList, sortBy, type Scope, type SortKey } from '../services/register';
import { useView, ViewSwitch, type View } from '@/features/work/components/ViewSwitch';
import { CardGrid, EmptyProjects, ProjectCard, ProjectRow, RegisterTimeline, RowHeads, RowsBox } from './ProjectViews';
import type { Project } from '@/types/workspace';

const PVIEWS: [View, string, string][] = [
  ['list', 'Rows', 'list'],
  ['grid', 'Grid', 'board'],
  ['timeline', 'Timeline', 'gantt'],
];

export const ProjectsCrumb = () => {
  const ws = useWs();
  return (
    <>
      {divisionOf(ws)?.short}
      <i className="mx-1.5 text-faint not-italic">/</i>
      <b>{t('Projects')}</b>
    </>
  );
};

const scopesFor = (high: boolean, short: string): [Scope, string][] => [
  ['ws', short],
  ['shared', t('Shared with {d}', { d: short })],
  ['org', t('Organization-wide')],
  ...(high ? ([['all', t('All divisions')]] as [Scope, string][]) : []),
];

export const useScope = (): Scope => {
  const me = useMe();
  const raw = useSession((s) => s.pscope as string | undefined);
  return raw && raw !== 'routines' && (raw !== 'all' || isHigh(me)) ? (raw as Scope) : 'ws';
};
export const useSort = (): SortKey => useSession((s) => (s.psort as SortKey | undefined) ?? 'stage');

export function StageGroup({
  k,
  count,
  collapsed,
  children,
}: {
  k: Project['stage'];
  count: number;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <h2 className="mt-[22px] mb-1.5 flex items-center justify-between gap-1 pl-1.5 type-h3 comfortable:mx-1.5 comfortable:mt-[26px] comfortable:mb-2.5 comfortable:p-0 comfortable:[font:600_15px_var(--font)] compact:border-t compact:border-line-strong compact:pt-3.5">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-ctl border-0 bg-transparent py-1 pr-2 pl-1 font-[inherit] text-inherit hover:bg-hover comfortable:[&_.st]:text-d15"
          aria-expanded={!collapsed}
          onClick={() => {
            setSession((s) => {
              const c = { ...((s.pcol as Record<string, number> | undefined) ?? { cancelled: 1, archived: 1 }) };
              c[k] = c[k] ? 0 : 1;
              return { ...s, pcol: c };
            });
          }}
        >
          <Icon name={collapsed ? 'chevron' : 'chevron-down'} size="sm" className="text-mute" />
          <Stage stage={k} />
        </button>
        <span className="pr-3 text-mute type-caption comfortable:text-d14">
          {plural(count, '{n} project', '{n} projects')}
        </span>
      </h2>
      {!collapsed && children}
    </>
  );
}

export function ProjectsPage() {
  const me = useMe();
  const w = useWs();
  const lk = useSession((s) => look(s));
  const view = useView('projects', 'grid');
  const sc = useScope();
  const so = useSort();
  const q = useUi((u) => u.q);
  const stage = useUi((u) => u.stage);
  const sel = useUi((u) => u.sel as string | undefined);
  const byProgram = useGroupByProgram('projects');
  const col = useSession((s) => (s.pcol as Record<string, number> | undefined) ?? { cancelled: 1, archived: 1 });
  const db = useWorkspace((x) => x);
  if (!me) return null;
  const comfortable = lk === 'comfortable';
  const query = q.toLowerCase();
  const list = scopeList(db, sc, me, w)
    .filter((p) => (stage === 'all' || p.stage === stage) && (!query || p.name.toLowerCase().includes(query)))
    .sort(sortBy(so));
  const short = divisionOf(w)?.short ?? '';
  const scopes = scopesFor(isHigh(me), short);
  const title =
    sc === 'ws'
      ? (divisionOf(w)?.name ?? '')
      : sc === 'all'
        ? t('All divisions')
        : (scopes.find((x) => x[0] === sc)?.[1] ?? '');
  const filtered = stage !== 'all' || !!q;
  const block = (ps: Project[]) =>
    view === 'grid' ? (
      <CardGrid>
        {ps.map((p) => (
          <ProjectCard key={p.id} p={p} w={w} scoped={sc !== 'ws'} selected={sel === p.id} />
        ))}
      </CardGrid>
    ) : (
      <div className="flex flex-col gap-[3px] comfortable:overflow-hidden comfortable:rounded-card comfortable:bg-surface comfortable:shadow-card">
        {ps.map((p) => (
          <ProjectRow key={p.id} p={p} w={w} scoped={sc !== 'ws'} selected={sel === p.id} />
        ))}
      </div>
    );
  let body;
  if (!list.length)
    body = (
      <EmptyProjects
        title={!filtered ? (sc === 'ws' ? t('No projects yet') : t('Nothing here yet')) : t('No projects match')}
      >
        {!filtered
          ? sc === 'shared'
            ? t(
                'Projects run by another division that your people joined, or that the whole organization can see, appear here.',
              )
            : sc === 'org'
              ? t('Projects the whole organization can see appear here.')
              : canCreateProject(me, w)
                ? t('Start one with New project.')
                : t('Co-directors and above create projects. You can still add your own tasks in My Work.')
          : t('Clear the search or choose All stages.')}
      </EmptyProjects>
    );
  else if (byProgram)
    body = (
      <ProgramGroups
        items={list}
        kind="project"
        w={w}
        block={view === 'timeline' ? (ps) => <RegisterTimeline list={ps} /> : block}
      />
    );
  else if (view === 'timeline') body = <RegisterTimeline list={list} />;
  else {
    const groups = STAGE_ORDER.map((k) => [k, list.filter((p) => p.stage === k)] as const).filter(
      ([, ps]) => ps.length,
    );
    body = (
      <>
        {view === 'list' && <RowHeads />}
        {so === 'stage'
          ? groups.map(([k, ps]) => (
              <StageGroup key={k} k={k} count={ps.length} collapsed={!!col[k]}>
                {block(ps)}
              </StageGroup>
            ))
          : block(list)}
      </>
    );
    if (view === 'list') body = <RowsBox>{body}</RowsBox>;
  }
  const dot = sc !== 'ws' || stage !== 'all' || so !== 'stage' || byProgram;
  return (
    <Page wide canvas={comfortable} data-page="projects">
      <PageHeader
        title={t('Projects')}
        sub={`${title}, ${plural(list.length, '{n} project', '{n} projects')}`}
        className={cn(comfortable && 'px-1')}
      >
        {canCreateProgram(me, w) && (
          <Button
            onClick={() => {
              go('programs/new');
            }}
          >
            <LineGlyph d={PG_D} />
            {t('New program')}
          </Button>
        )}
        {canCreateProject(me, w) && (
          <Button variant="primary" onClick={newProject}>
            <Icon name="plus" />
            {t('New project')}
          </Button>
        )}
      </PageHeader>
      {comfortable ? (
        <div className="mt-[18px] mb-1 flex flex-nowrap items-center gap-3">
          <label className="flex h-[46px] max-w-[460px] min-w-0 flex-[1_1_200px] items-center gap-2.5 rounded-[23px] bg-surface pr-[5px] pl-4 text-mute shadow-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring">
            <Icon name="search" />
            <input
              className="h-full min-w-0 flex-1 border-0 bg-transparent font-[inherit] text-d15 text-ink outline-none"
              placeholder={t('Find a project')}
              aria-label={t('Find a project')}
              value={q}
              onChange={(e) => {
                const v = e.target.value;
                setUi((u) => {
                  u.q = v;
                });
              }}
            />
            <IconButton
              className="relative size-9 rounded-[18px] bg-pill text-ink-2"
              aria-haspopup="menu"
              aria-label={t('Filter and sort')}
              onClick={(e) => {
                openMenu(e.currentTarget, { type: 'pfilter', width: 280, est: 480 });
              }}
            >
              <Icon name="filter" />
              {dot && (
                <i
                  className="absolute top-1.5 right-1.5 size-2 rounded-full bg-ink shadow-[0_0_0_2px_var(--cs-pill)]"
                  aria-hidden="true"
                />
              )}
            </IconButton>
          </label>
          <ViewSwitch
            scope="projects"
            views={PVIEWS}
            fallback="grid"
            className="ml-auto h-[46px] rounded-[23px] bg-[rgb(22_22_21/5%)] p-1 [&>button]:h-[38px] [&>button]:rounded-[19px] [&>button]:px-3.5 max-[760px]:[&>button]:gap-0 max-[760px]:[&>button]:text-[0px] [&>button[aria-checked=true]]:bg-surface [&>button[aria-checked=true]]:shadow-card"
          />
        </div>
      ) : (
        <>
          <div
            className="mt-0.5 mb-3.5 flex gap-6 shadow-[inset_0_-1px_0_var(--line)] max-[760px]:overflow-x-auto max-[760px]:whitespace-nowrap"
            role="tablist"
            aria-label={t('Which projects')}
          >
            {scopes.map(([k, l]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={sc === k}
                className={tabClass(sc === k)}
                onClick={() => {
                  setSession({ pscope: k });
                }}
              >
                {l}
                <span className="ml-1.5 text-faint type-num">{scopeList(db, k, me, w).length}</span>
              </button>
            ))}
          </div>
          <Toolbar className="mt-4 max-[760px]:flex-wrap">
            <SearchField
              label={t('Find a project')}
              className="w-[300px]"
              value={q}
              onChange={(e) => {
                const v = e.target.value;
                setUi((u) => {
                  u.q = v;
                });
              }}
            />
            <Button
              aria-haspopup="menu"
              onClick={(e) => {
                openMenu(e.currentTarget, { type: 'stage' });
              }}
            >
              <Stage stage={stage as Project['stage'] | 'all'} />
              <Icon name="chevron-down" size="sm" />
            </Button>
            <Button
              aria-haspopup="menu"
              onClick={(e) => {
                openMenu(e.currentTarget, { type: 'pviewopts' });
              }}
            >
              <Icon name="sort" size="sm" />
              {t('View options')}
              {(byProgram || so !== 'stage') && <i className="size-2 rounded-full bg-ink" aria-hidden="true" />}
              <Icon name="chevron-down" size="sm" />
            </Button>
            <span className="flex-1 max-[760px]:hidden" />
            <ViewSwitch scope="projects" views={PVIEWS} fallback="grid" />
          </Toolbar>
        </>
      )}
      {body}
    </Page>
  );
}

const newProject = () => {
  setUi((u) => {
    u.menu = null;
    u.insp = { type: 'new-project' };
  });
  go('projects');
};
