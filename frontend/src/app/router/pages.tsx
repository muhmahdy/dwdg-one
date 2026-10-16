/* The page registry (the prototype's PAGES table): every page key, the module that owns it, and its component once that
   module is migrated. docs/audit/feature-matrix.md tracks the same list. */
import type { ComponentType } from 'react';
import { MyWorkCrumb, MyWorkPage } from '@/features/work/components/MyWorkPage';
import { SettingsCrumb, SettingsPage } from '@/features/settings/components/SettingsPage';
import { ChangesCrumb, ChangesPage, UpdatesCrumb, UpdatesPage } from '@/features/updates/components/UpdatesPage';
import { ScheduleCrumb, SchedulePage } from '@/features/schedule/components/SchedulePage';
import { OperationsCrumb, OperationsPage } from '@/features/operations/components/OperationsPage';
import { OrganisationCrumb, OrganisationPage } from '@/features/organisation/components/OrganisationPage';
import { ProgramsCrumb, ProgramsPage } from '@/features/programs/components/ProgramsPage';
import { ProjectCrumb, ProjectPage } from '@/features/projects/components/ProjectPage';
import { ProjectsCrumb, ProjectsPage } from '@/features/projects/components/ProjectsPage';
import { ResourcesCrumb, ResourcesPage } from '@/features/resources/components/ResourcesPage';
import type { Route } from './routes';

export interface PageDef {
  module: string;
  /** Prototype file that holds the reference implementation. */
  source: string;
  component?: ComponentType<{ route: Route }>;
  /** Breadcrumb for the top bar. */
  crumb?: ComponentType<{ route: Route }>;
}

/** /projects is the register; /projects/:id is one project. */
const ProjectsOrProject = ({ route }: { route: Route }) =>
  route.id ? <ProjectPage route={route} /> : <ProjectsPage />;
const ProjectsOrProjectCrumb = ({ route }: { route: Route }) =>
  route.id ? <ProjectCrumb route={route} /> : <ProjectsCrumb />;

export const PAGES: Record<string, PageDef> = {
  work: { module: 'work', source: 'screens/work.js', component: MyWorkPage, crumb: MyWorkCrumb },
  operations: { module: 'operations', source: 'screens/work.js', component: OperationsPage, crumb: OperationsCrumb },
  updates: { module: 'updates', source: 'screens/plan.js', component: UpdatesPage, crumb: UpdatesCrumb },
  projects: {
    module: 'projects',
    source: 'screens/plan.js',
    component: ProjectsOrProject,
    crumb: ProjectsOrProjectCrumb,
  },
  programs: { module: 'programs', source: 'screens/plan.js', component: ProgramsPage, crumb: ProgramsCrumb },
  resources: { module: 'resources', source: 'screens/plan.js', component: ResourcesPage, crumb: ResourcesCrumb },
  changes: { module: 'updates', source: 'screens/plan.js', component: ChangesPage, crumb: ChangesCrumb },
  organisation: {
    module: 'organisation',
    source: 'screens/plan.js',
    component: OrganisationPage,
    crumb: OrganisationCrumb,
  },
  settings: { module: 'settings', source: 'screens/plan.js', component: SettingsPage, crumb: SettingsCrumb },
  schedule: { module: 'schedule', source: 'screens/schedule.js', component: SchedulePage, crumb: ScheduleCrumb },
  performance: { module: 'performance', source: 'screens/perf.js' },
  attention: { module: 'performance', source: 'screens/perf.js' },
  oversight: { module: 'performance', source: 'screens/perf.js' },
  members: { module: 'accounts', source: 'screens/accounts.js' },
  invites: { module: 'accounts', source: 'screens/accounts.js' },
  invite: { module: 'accounts', source: 'screens/accounts.js' },
  welcome: { module: 'accounts', source: 'screens/accounts.js' },
  appointments: { module: 'accounts', source: 'screens/accounts.js' },
  handover: { module: 'accounts', source: 'screens/accounts.js' },
  attendance: { module: 'hr', source: 'divisions/div-hr-sng.js' },
  monitoring: { module: 'hr', source: 'divisions/div-hr-sng.js' },
  recognition: { module: 'hr', source: 'divisions/div-hr-sng.js' },
  'hr-people': { module: 'hr', source: 'divisions/div-hr-sng.js' },
  initiatives: { module: 'strategy', source: 'divisions/div-hr-sng.js' },
  decisions: { module: 'strategy', source: 'divisions/div-hr-sng.js' },
  relationships: { module: 'external', source: 'divisions/div-ee-cons.js' },
  opportunities: { module: 'external', source: 'divisions/div-ee-cons.js' },
  followups: { module: 'external', source: 'divisions/div-ee-cons.js' },
  engagements: { module: 'consulting', source: 'divisions/div-ee-cons.js' },
  staffing: { module: 'consulting', source: 'divisions/div-ee-cons.js' },
  knowledge: { module: 'consulting', source: 'divisions/div-ee-cons.js' },
  cohorts: { module: 'consulting', source: 'divisions/div-ee-cons.js' },
  'fnl-requests': { module: 'finance-legal', source: 'divisions/div-fnl-mcit.js' },
  budget: { module: 'finance-legal', source: 'divisions/div-fnl-mcit.js' },
  register: { module: 'finance-legal', source: 'divisions/div-fnl-mcit.js' },
  'period-reviews': { module: 'finance-legal', source: 'divisions/div-fnl-mcit.js' },
  content: { module: 'marketing-it', source: 'divisions/div-fnl-mcit.js' },
  'it-requests': { module: 'marketing-it', source: 'divisions/div-fnl-mcit.js' },
  'accounts-register': { module: 'marketing-it', source: 'divisions/div-fnl-mcit.js' },
};
