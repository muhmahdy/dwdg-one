import type { Workspace } from '@/types/workspace';
import type { WorkspaceRepository } from './repository';
import { SaveError } from './repository';
import type { Changes } from './shape-types';

/* Demo mode and tests: the workspace lives in memory, seeded from database/seeds/demo-workspace.json. Saves succeed
   unless a test asks the next one to fail, which exercises the rollback path. */
export function createMemoryRepository(seed: () => Promise<Workspace>) {
  let failNext = false;
  const saved: Changes[] = [];
  const repo: WorkspaceRepository & { failNextSave: () => void; saved: Changes[] } = {
    load: seed,
    apply: (changes) => {
      if (failNext) {
        failNext = false;
        return Promise.reject(new SaveError('Simulated save failure'));
      }
      saved.push(changes);
      return Promise.resolve();
    },
    failNextSave: () => {
      failNext = true;
    },
    saved,
  };
  return repo;
}
