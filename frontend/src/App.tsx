import { createBrowserRouter, RouterProvider } from 'react-router';
import { PreferencesSync } from '@/app/providers/PreferencesSync';
import { WorkspaceProvider } from '@/app/providers/WorkspaceProvider';
import { registerNavigate } from '@/app/router/navigation';
import { PageHost } from '@/app/router/PageHost';
import { MenuLayer } from '@/components/shared/menus';
import '@/components/shared/shell-menus';
import { Toast } from '@/components/shared/Toast';
import { SignIn } from '@/features/auth/components/SignIn';
import { installArtHover } from '@/lib/art/identity';
import { t } from '@/lib/i18n';
import { useMe } from '@/lib/workspace/hooks';

function Root() {
  const me = useMe();
  const signedIn = !!me && me.status === 'active';
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
