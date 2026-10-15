import type { Workspace } from '@/types/workspace';

/** The demo workspace (decision M9): development and automated tests only. The import sits behind a compile-time check,
    so production builds (VITE_DEMO_MODE unset) contain neither the demo people nor a chunk to fetch them. */
export async function demoWorkspace(): Promise<Workspace> {
  if (import.meta.env.VITE_DEMO_MODE !== 'true' && import.meta.env.MODE !== 'test') throw new Error('Demo data is not part of this build');
  const seed = await import('../../../../database/seeds/demo-workspace.json');
  return structuredClone(seed.default) as unknown as Workspace;
}
