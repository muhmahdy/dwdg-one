/* The list behind a figure (W098 acceptance 2): every number opens the records it counts, in the side panel. The panel's id is
   "scope:id:metric:period", where scope is p (a person) or d (a division). */
import { setUi } from '@/lib/workspace/transaction';

export const perfKey = (scope: 'p' | 'd', id: string, metric: string, period: string) =>
  `${scope}:${id}:${metric}:${period}`;

export const openPerfList = (key: string) => {
  setUi((u) => {
    u.menu = null;
    u.form = null;
    u.insp = { type: 'perf-list', id: key };
  });
};
