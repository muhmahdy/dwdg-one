/* Which division projects the server could reach when the workspace was loaded (migration plan, stage H2). Only the
   `bff` data mode fills this in; in demo and `supabase` mode the store stays empty and every division counts as connected. */
import { createStore, useStore } from '@/lib/store';
import type { DivisionId } from '@/types/workspace';

export type DivisionStatus =
  /** Connected and its records are served. */
  | 'ok'
  /** The server has no settings for this division project yet. */
  | 'not_configured'
  /** Settings exist but the division has not been switched on. */
  | 'inactive'
  /** Switched on, but the server cannot serve it right now. */
  | 'unavailable';

export type DivisionStatuses = Partial<Record<DivisionId, DivisionStatus>>;

export const divisionStatusStore = createStore<DivisionStatuses>({});

/** True when this division's records are not available to the app. */
export function isDivisionOffline(statuses: DivisionStatuses, d: DivisionId): boolean {
  const s = statuses[d];
  return s !== undefined && s !== 'ok';
}

export const useDivisionOffline = (d: DivisionId | null) =>
  useStore(divisionStatusStore, (s) => (d ? isDivisionOffline(s, d) : false));
