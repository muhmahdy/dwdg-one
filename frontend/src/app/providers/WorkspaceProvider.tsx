/* Loads the workspace once the person is known and wires the transaction engine to the right repository: Supabase
   directly, the server in front of the Supabase projects (`bff`), or the in-memory demo workspace in demo mode (M9). */
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { DEMO_TODAY } from '@/app/config/org';
import { env } from '@/app/config/env';
import { t } from '@/lib/i18n';
import { sessionStore, setSession } from '@/lib/session';
import { bffWorkspaceRepository } from '@/lib/bff/workspace-repository';
import { supabaseWorkspaceRepository } from '@/lib/supabase/workspace-repository';
import { setDemoClock } from '@/lib/time';
import { demoWorkspace } from '@/lib/workspace/demo-seed';
import { useStore } from '@/lib/store';
import { createMemoryRepository } from '@/lib/workspace/memory-repository';
import { configureTransactions, loadWorkspace, workspaceStore } from '@/lib/workspace/transaction';
import { linkedPerson } from '@/features/auth/services/auth';
import { syncBoard } from '@/features/auth/services/session';
import { playCommitEffects } from '@/lib/motion';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

const repository =
  env.dataMode === 'demo'
    ? createMemoryRepository(demoWorkspace)
    : env.dataMode === 'bff'
      ? bffWorkspaceRepository
      : supabaseWorkspaceRepository;
if (env.demo) setDemoClock(DEMO_TODAY);
configureTransactions({ repository, effects: playCommitEffects });

function Loader({ children }: { children: ReactNode }) {
  const [person, setPerson] = useState<string | null | undefined>(env.demo ? null : undefined);
  useEffect(() => {
    if (env.demo) return;
    linkedPerson()
      .then((id) => {
        if (id) setSession({ me: id });
        setPerson(id);
      })
      .catch(() => {
        setPerson(null);
      });
  }, []);
  const query = useQuery({ queryKey: ['workspace', person], queryFn: repository.load, enabled: person !== undefined });
  useEffect(() => {
    if (!query.data) return;
    loadWorkspace(query.data);
    // a reload while signed in as the demo Board account needs its record back
    if (env.demo) void syncBoard(sessionStore.get().me);
  }, [query.data]);
  const loaded = useStore(workspaceStore, (w) => w !== null);
  if (query.isError)
    return (
      <div className="grid h-dvh place-items-center p-6 text-mute" role="alert">
        {t('Could not load the workspace. Check your connection and reload the page.')}
      </div>
    );
  if (!loaded)
    return (
      <div className="grid h-dvh place-items-center p-6" aria-busy="true" aria-label={t('Loading')}>
        <span className="block h-3 w-40 animate-[skel_1.4s_linear_infinite] rounded-[6px] bg-[linear-gradient(90deg,var(--fill)_25%,var(--hover)_50%,var(--fill)_75%)] bg-[length:200%_100%] motion-reduce:animate-none" />
      </div>
    );
  return children;
}

/* A build without Supabase settings and without demo mode cannot load anything. Say so plainly instead of reporting a
   connection problem; this screen only appears on a developer's machine, never in a configured deployment. */
function NotConfigured() {
  return (
    <div className="grid h-dvh place-items-center p-6" role="alert">
      <div className="max-w-[520px] rounded-[10px] bg-surface p-8 shadow-sheet">
        <h1 className="type-h2">Supabase is not configured</h1>
        <p className="mt-2 text-mute">
          This server runs without demo data, so it needs a Supabase project. Either stop it and run{' '}
          <code className="font-mono text-ink">npm run dev:demo</code> to use the demo workspace, or set{' '}
          <code className="font-mono text-ink">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono text-ink">VITE_SUPABASE_PUBLISHABLE_KEY</code> in{' '}
          <code className="font-mono text-ink">frontend/.env.local</code> (see database/README.md).
        </p>
      </div>
    </div>
  );
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  if (!env.demo && (!env.supabaseUrl || !env.supabaseKey)) return <NotConfigured />;
  return (
    <QueryClientProvider client={queryClient}>
      <Loader>{children}</Loader>
    </QueryClientProvider>
  );
}
