import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { PreferencesSync } from '@/app/providers/PreferencesSync';
import { WorkspaceProvider } from '@/app/providers/WorkspaceProvider';
import { registerNavigate } from '@/app/router/navigation';
import { PageHost } from '@/app/router/PageHost';
import { MenuLayer } from '@/components/shared/menus';
import '@/features/looks/register';
import '@/features/people/register';
import '@/features/performance/register';
import '@/features/projects/register';
import '@/features/resources/register';
import '@/features/schedule/register';
import '@/features/work/register';
import { ScheduleOverlays } from '@/features/schedule/components/ScheduleOverlays';
import '@/components/shared/shell-menus';
import { Toast } from '@/components/shared/Toast';
import { SignIn } from '@/features/auth/components/SignIn';
import { installArtHover } from '@/lib/art/identity';
import { t } from '@/lib/i18n';
import { maintainWorkspace } from '@/features/operations/services/maintenance';
import { useMe } from '@/lib/workspace/hooks';

function Root() {
  const me = useMe();
  const signedIn = !!me && me.status === 'active';
  const meId = me?.id;
  useEffect(() => {
    if (meId && signedIn) void maintainWorkspace();
  }, [meId, signedIn]);
  return (
    <>
      <a
        className="absolute -top-[60px] left-2 z-50 rounded-ctl bg-surface px-3 py-2 shadow-pop focus:top-2"
        href="#main"
      >
        {t('Skip to content')}
      </a>
      {signedIn ? <PageHost /> : <SignIn />}
      <MenuLayer />
      {signedIn && <ScheduleOverlays />}
      <Toast />
    </>
  );
}

installArtHover();
const router = createBrowserRouter([{ path: '/:page?/:id?/:sub?', element: <Root /> }]);
registerNavigate((to, opts) => void router.navigate(to, opts));

export function App() {
  return (
    <WorkspaceProvider>
      <PreferencesSync>
        <RouterProvider router={router} />
      </PreferencesSync>
    </WorkspaceProvider>
  );
}
