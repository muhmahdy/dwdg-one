import type { Workspace } from '@/types/workspace';
import type { Changes } from './shape-types';

/** Where the workspace is loaded from and saved to: Supabase in production, memory in demo mode and tests. */
export interface WorkspaceRepository {
  load: () => Promise<Workspace>;
  /** Saves every change in one transaction; rejects when anything was refused, so nothing is half-saved. */
  apply: (changes: Changes) => Promise<void>;
}

/** A save that the server refused or could not receive. The message is for logs; people see the shared failure text. */
export class SaveError extends Error {
  override readonly name = 'SaveError';
}
