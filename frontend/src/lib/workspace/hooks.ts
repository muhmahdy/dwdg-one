import type { UiState } from '@/app/ui-state';
import { currentWs } from '@/lib/access';
import { sessionStore, type Session } from '@/lib/session';
import { useStore } from '@/lib/store';
import type { Person, Workspace } from '@/types/workspace';
import { uiStore, workspaceStore } from './transaction';

/** Reads a slice of the loaded workspace. Only call below <WorkspaceGate>, where the workspace is loaded. */
export function useWorkspace<S>(selector: (db: Workspace) => S, equal?: (a: S, b: S) => boolean): S {
  return useStore(
    workspaceStore,
    (db) => {
      if (!db) throw new Error('useWorkspace used before the workspace loaded');
      return selector(db);
    },
    equal,
  );
}

export const useUi = <S>(selector: (ui: UiState) => S, equal?: (a: S, b: S) => boolean) =>
  useStore(uiStore, selector, equal);
export const useSession = <S>(selector: (s: Session) => S, equal?: (a: S, b: S) => boolean) =>
  useStore(sessionStore, selector, equal);

/** The signed-in person, or undefined while signed out or not yet approved. */
export function useMe(): Person | undefined {
  const id = useSession((s) => s.me);
  return useStore(workspaceStore, (db) => (db && id ? db.people.find((p) => p.id === id) : undefined));
}

/** The workspace (division) being viewed. */
export function useWs() {
  const me = useMe();
  const remembered = useSession((s) => s.ws);
  return currentWs(me, remembered);
}

/** Non-hook reads for actions and event handlers. */
export const getDb = (): Workspace => {
  const db = workspaceStore.get();
  if (!db) throw new Error('The workspace is not loaded');
  return db;
};
export const getMe = (): Person | undefined => {
  const id = sessionStore.get().me;
  return id ? workspaceStore.get()?.people.find((p) => p.id === id) : undefined;
};
