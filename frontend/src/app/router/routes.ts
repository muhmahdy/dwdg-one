/* Routes keep the prototype's shape: /<page>/<id>/<sub>, one page key per destination (engineering-routing).
   Ship 1 (owner, 11 Oct, D58): pages planned for later releases stay in the code but leave navigation, search and routing
   until an Admin turns on Release preview in Settings. The Simple look (D56) has its own nine destinations. */
import { useParams } from 'react-router';

export interface Route {
  page: string;
  id?: string | undefined;
  sub?: string | undefined;
}

export const LATER = new Set([
  'changes',
  'oversight',
  'hr-people',
  'initiatives',
  'decisions',
  'relationships',
  'opportunities',
  'followups',
  'engagements',
  'staffing',
  'knowledge',
  'cohorts',
  'fnl-requests',
  'budget',
  'register',
  'period-reviews',
  'content',
  'it-requests',
  'accounts-register',
]);

export const SIMPLE_PAGES = [
  'work',
  'projects',
  'schedule',
  'settings',
  'updates',
  'operations',
  'programs',
  'attention',
  'performance',
];

export const inShip = (page: string, preview: boolean | undefined) => !LATER.has(page) || !!preview;

export const path = (r: Route) => `/${[r.page, r.id, r.sub].filter(Boolean).join('/')}`;

export function useRoute(): Route {
  const p = useParams();
  return { page: p.page ?? 'work', id: p.id, sub: p.sub };
}
