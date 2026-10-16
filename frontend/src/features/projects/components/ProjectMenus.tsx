/* Menus of the Projects register and project page: which projects, stage filter, sort and grouping (one filter menu in
   Comfortable, R025), and the stage of one project. From screens/plan.js MENUS.pfilter, stage, pviewopts, psort, pstage. */
import { divisionOf } from '@/app/config/org';
import type { MenuRef } from '@/app/ui-state';
import { LineGlyph } from '@/components/shared/art/task-icons';
import { MENUS, MenuHeading, MenuItem, MenuRule, Tick, closeMenu } from '@/components/shared/menus';
import { Stage } from '@/components/ui/StatusBadge';
import { t } from '@/lib/i18n';
import { setSession } from '@/lib/session';
import { useMe, useUi, useWorkspace, useWs } from '@/lib/workspace/hooks';
import { setUi } from '@/lib/workspace/transaction';
import { toggleGroupByProgram, useGroupByProgram } from '@/features/programs/components/ProgramGroups';
import { PG_D } from '@/features/programs/services/programs';
import type { ProjectStage } from '@/types/workspace';
import { setProjectStage, stageNeedsForm } from '../services/project-actions';
import { PSORT, isHigh, scopeList, type Scope } from '../services/register';
import { useScope, useSort } from './ProjectsPage';

const FILTER_STAGES: (ProjectStage | 'all')[] = ['all', 'draft', 'planned', 'active', 'review', 'completed'];
const MORE_STAGES: ProjectStage[] = ['hold', 'cancelled', 'archived'];

function StageFilter() {
  const stage = useUi((u) => u.stage);
  const pick = (k: string) => {
    setUi((u) => {
      u.stage = k;
      u.menu = null;
    });
  };
  return (
    <>
      {FILTER_STAGES.map((k) => (
        <MenuItem
          key={k}
          role="menuitemradio"
          on={k === stage}
          extra={k === stage ? <Tick /> : null}
          onSelect={() => {
            pick(k);
          }}
        >
          <Stage stage={k} small={false} />
        </MenuItem>
      ))}
      <MenuRule />
      {MORE_STAGES.map((k) => (
        <MenuItem
          key={k}
          role="menuitemradio"
          on={k === stage}
          onSelect={() => {
            pick(k);
          }}
        >
          <Stage stage={k} small={false} />
        </MenuItem>
      ))}
    </>
  );
}

function SortItems() {
  const so = useSort();
  return (
    <>
      {PSORT.map(([k, l]) => (
        <MenuItem
          key={k}
          role="menuitemradio"
          on={k === so}
          extra={k === so ? <Tick /> : null}
          onSelect={() => {
            setSession({ psort: k });
            closeMenu();
          }}
        >
          {t(l)}
        </MenuItem>
      ))}
    </>
  );
}

function ViewOptions() {
  const by = useGroupByProgram('projects');
  return (
    <>
      <MenuHeading>{t('Sort by')}</MenuHeading>
      <SortItems />
      <MenuRule />
      <MenuItem
        role="menuitemradio"
        on={by}
        icon={<LineGlyph d={PG_D} />}
        extra={by ? <Tick /> : null}
        onSelect={() => {
          toggleGroupByProgram('projects');
        }}
      >
        {t('Group by program')}
      </MenuItem>
    </>
  );
}

function Filter() {
  const me = useMe();
  const w = useWs();
  const sc = useScope();
  const db = useWorkspace((x) => x);
  if (!me) return null;
  const short = divisionOf(w)?.short ?? '';
  const scopes: [Scope, string][] = [
    ['ws', short],
    ['shared', t('Shared with {d}', { d: short })],
    ['org', t('Organization-wide')],
    ...(isHigh(me) ? ([['all', t('All divisions')]] as [Scope, string][]) : []),
  ];
  return (
    <>
      <MenuHeading>{t('Which projects')}</MenuHeading>
      {scopes.map(([k, l]) => (
        <MenuItem
          key={k}
          role="menuitemradio"
          on={sc === k}
          extra={
            <>
              <small>{scopeList(db, k, me, w).length}</small>
              {sc === k && <Tick />}
            </>
          }
          onSelect={() => {
            setSession({ pscope: k });
            closeMenu();
          }}
        >
          {l}
        </MenuItem>
      ))}
      <MenuRule />
      <MenuHeading>{t('Stage')}</MenuHeading>
      <StageFilter />
      <MenuRule />
      <ViewOptions />
    </>
  );
}

const STAGES_ORDER: ProjectStage[] = [
  'draft',
  'planned',
  'active',
  'review',
  'completed',
  'hold',
  'cancelled',
  'archived',
];

function ProjectStageMenu({ menu }: { menu: MenuRef }) {
  const p = useWorkspace((db) => db.projects.find((x) => x.id === menu.id));
  const db = useWorkspace((x) => x);
  if (!p) return null;
  const choose = (k: ProjectStage) => {
    closeMenu();
    if (k === p.stage) return;
    if (stageNeedsForm(db, p, k)) {
      setUi((u) => {
        u.form = `stage-${k}`;
      });
      return;
    }
    void setProjectStage(p.id, k, '');
  };
  return (
    <>
      {STAGES_ORDER.map((k) => (
        <MenuItem
          key={k}
          role="menuitemradio"
          on={k === p.stage}
          extra={k === p.stage ? <Tick /> : null}
          onSelect={() => {
            choose(k);
          }}
        >
          <Stage stage={k} small={false} />
        </MenuItem>
      ))}
    </>
  );
}

MENUS.pfilter = Filter;
MENUS.stage = StageFilter;
MENUS.pviewopts = ViewOptions;
MENUS.psort = SortItems;
MENUS.pstage = ProjectStageMenu;
