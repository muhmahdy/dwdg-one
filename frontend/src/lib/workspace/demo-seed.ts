import seed from '../../../../database/seeds/demo-workspace.json';
import type { Workspace } from '@/types/workspace';

/** The demo workspace (decision M9): development and automated tests only, never loaded into a real project. */
export const demoWorkspace = (): Workspace => structuredClone(seed) as unknown as Workspace;
