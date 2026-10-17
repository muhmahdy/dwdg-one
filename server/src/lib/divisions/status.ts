/* Which division projects this server can serve right now. The browser shows "not connected" for anything but `ok`
   (spec §4.2: a division is active only when its settings are present AND the hub has switched it on). */
import type { Env } from '../../config.ts';
import type { HubGateway } from '../hub/gateway.ts';
import { DIVISION_IDS, type DivisionId } from '../../generated/partition.ts';
import { sensitiveDivisions } from '../access/sensitive.ts';
import { hasPolicies } from '../policy/index.ts';
import { isConfigured } from './registry.ts';

export type DivisionStatus =
  /** Connected, switched on, and its rows are served. */
  | 'ok'
  /** This server has no URL or key for it. */
  | 'not_configured'
  /** Settings are present but the hub has not switched the division on. */
  | 'inactive'
  /** Connected and switched on, but the server cannot serve its rows (no access rules for it yet, or the project is paused). */
  | 'unavailable';

/* A division's rows are served only when every one of its tables has an access rule in this server (policy/). Until then a
   connected division is reported `unavailable` and none of its rows leave the server. */

export interface DivisionInfo {
  statuses: Record<DivisionId, DivisionStatus>;
  /** The divisions that hold personal data: what the hub marks, and at least HR and Finance & Legal. */
  sensitive: ReadonlySet<DivisionId>;
}

export async function divisionInfo(hub: HubGateway, token: string, env: Env = process.env): Promise<DivisionInfo> {
  const flags = await hub.divisionFlags(token);
  const statuses = Object.fromEntries(
    DIVISION_IDS.map((slug): [DivisionId, DivisionStatus] => [
      slug,
      !isConfigured(slug, env) ? 'not_configured' : !flags.active.has(slug) ? 'inactive' : hasPolicies(slug) ? 'ok' : 'unavailable',
    ]),
  ) as Record<DivisionId, DivisionStatus>;
  return { statuses, sensitive: sensitiveDivisions(flags.sensitive) };
}

export async function divisionStatuses(hub: HubGateway, token: string, env: Env = process.env): Promise<Record<DivisionId, DivisionStatus>> {
  return (await divisionInfo(hub, token, env)).statuses;
}
