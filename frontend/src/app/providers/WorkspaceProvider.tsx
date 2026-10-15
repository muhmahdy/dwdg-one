/* Loads the workspace once the person is known and wires the transaction engine to the right repository:
   Supabase in production, the in-memory demo workspace in demo mode (decision M9). */
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { DEMO_TODAY } from '@/app/config/org';
import { env } from '@/app/config/env';
import { t } from '@/lib/i18n';
import { setSession } from '@/lib/session';
import { supabaseWorkspaceRepository } from '@/lib/supabase/workspace-repository';
import { setDemoClock } from '@/lib/time';
import { demoWorkspace } from '@/lib/workspace/demo-seed';
import { useStore } from '@/lib/store';
import { createMemoryRepository } from '@/lib/workspace/memory-repository';
import { configureTransactions, loadWorkspace, workspaceStore } from '@/lib/workspace/transaction';
import { linkedPerson } from '@/features/auth/services/auth';
import { playCommitEffects } from '@/lib/motion';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

const repository = env.demo ? createMemoryRepository(demoWorkspace) : supabaseWorkspaceRepository;
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
    if (query.data) loadWorkspace(query.data);
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

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Loader>{children}</Loader>
    </QueryClientProvider>
  );
}
