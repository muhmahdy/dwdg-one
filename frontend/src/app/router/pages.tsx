/* The page registry (the prototype's PAGES table): every page key, the module that owns it, and its component once that
   module is migrated. docs/audit/feature-matrix.md tracks the same list. */
import type { ComponentType } from 'react';
import { MyWorkCrumb, MyWorkPage } from '@/features/work/components/MyWorkPage';
import { ScheduleCrumb, SchedulePage } from '@/features/schedule/components/SchedulePage';
import type { Route } from './routes';

export interface PageDef {
  module: string;
  /** Prototype file that holds the reference implementation. */
  source: string;
  component?: ComponentType<{ route: Route }>;
  /** Breadcrumb for the top bar. */
  crumb?: ComponentType<{ route: Route }>;
}

export const PAGES: Record<string, PageDef> = {
  work: { module: 'work', source: 'screens/work.js', component: MyWorkPage, crumb: MyWorkCrumb },
  operations: { module: 'operations', source: 'screens/work.js' },
  updates: { module: 'updates', source: 'screens/plan.js' },
  projects: { module: 'projects', source: 'screens/plan.js' },
  programs: { module: 'programs', source: 'screens/plan.js' },
  resources: { module: 'resources', source: 'screens/plan.js' },
  changes: { module: 'updates', source: 'screens/plan.js' },
  organisation: { module: 'organisation', source: 'screens/plan.js' },
  settings: { module: 'settings', source: 'screens/plan.js' },
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
