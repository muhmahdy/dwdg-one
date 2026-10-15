/* Renders the current page inside the shell for the chosen look, applying the route gates of core/app.js render():
   a page planned for a later release goes to My Work with "Coming in a later release" (Changes goes to Updates →
   Activity instead), and the Simple look keeps its own nine destinations. */
import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { ComfortableShell } from '@/layouts/ComfortableShell';
import { look } from '@/lib/session';
import { t } from '@/lib/i18n';
import { useSession, useUi } from '@/lib/workspace/hooks';
import { showToast } from '@/lib/workspace/transaction';
import { Inspector } from '@/components/shared/Inspector';
import { PAGES } from './pages';
import { recordVisit, rememberScroll } from './page-history';
import { inShip, SIMPLE_PAGES, useRoute, type Route } from './routes';

function MigrationPending({ route }: { route: Route }) {
  const def = PAGES[route.page];
  return (
    <div className="p-8" data-testid="migration-pending">
      <h1 className="type-title">{route.page}</h1>
      <p className="mt-2 text-mute">
        Not migrated yet. Reference implementation: <code>frontend/prototype/{def?.source}</code> (module{' '}
        <code>{def?.module}</code>).
      </p>
    </div>
  );
}

export function PageHost() {
  const route = useRoute();
  const location = useLocation();
  const session = useSession((s) => s);
  const insp = useUi((u) => u.insp);
  const lk = look(session);
  const def = PAGES[route.page];

  const later = !!def && !inShip(route.page, session.preview);
  useEffect(() => {
    if (later && route.page !== 'changes') showToast(t('Coming in a later release'));
  }, [later, route.page]);

  // Page history: a new route or side-panel item is a new step; the page keeps its scroll while it stays the same.
  useLayoutEffect(() => {
    const scroller = document.getElementById('scroller');
    recordVisit(location.pathname, insp, 0);
    return () => {
      rememberScroll(location.pathname, insp, scroller?.scrollTop ?? 0);
    };
  }, [location.pathname, insp]);

  if (later)
    return (
      <Navigate
        replace
        to={route.page === 'changes' ? `/updates/activity${route.id ? `/${route.id}` : ''}` : '/work'}
      />
    );
  if (lk === 'simple' && def && !SIMPLE_PAGES.includes(route.page)) return <Navigate replace to="/work" />;
  if (!def) return <Navigate replace to="/work" />;

  const Page = def.component;
  const content: ReactNode = Page ? <Page route={route} /> : <MigrationPending route={route} />;
  const crumb = def.crumb ? <def.crumb route={route} /> : <b>{route.page}</b>;
  return (
    <ComfortableShell crumb={crumb} inspector={insp ? <Inspector /> : null}>
      {content}
    </ComfortableShell>
  );
}
