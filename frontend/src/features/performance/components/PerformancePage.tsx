/* The Performance page by route: the team (or the Board's division summary), one person, or one division. */
import type { Route } from '@/app/router/routes';
import { NotAvailable, Page } from '@/components/ui/page';
import { t } from '@/lib/i18n';
import { useMe, useWorkspace } from '@/lib/workspace/hooks';
import { teamOf } from '../services/scope';
import { BoardSummary, DivisionCrumb, DivisionDetail } from './DivisionPages';
import { PersonCrumb, PersonPage } from './PersonPage';
import { PerfCrumb, TeamPage } from './TeamPage';

export function PerformancePage({ route }: { route: Route }) {
  const db = useWorkspace((w) => w);
  const m = useMe();
  if (!m) return null;
  if (route.id === 'div' && route.sub) return <DivisionDetail id={route.sub} />;
  if (route.id) return <PersonPage id={route.id} />;
  const team = teamOf(db, m);
  if (team.kind === 'board') return <BoardSummary />;
  if (team.kind === 'self') return <PersonPage id={m.id} />;
  if (team.kind === 'none')
    return (
      <Page>
        <NotAvailable />
      </Page>
    );
  return <TeamPage team={team} />;
}

export function PerformanceCrumb({ route }: { route: Route }) {
  if (route.id === 'div' && route.sub) return <DivisionCrumb id={route.sub} />;
  if (route.id) return <PersonCrumb id={route.id} />;
  return <PerfCrumb parts={[['', t('Performance')]]} />;
}
