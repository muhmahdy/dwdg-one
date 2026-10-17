/* The six division projects and whether this server has the settings to reach them (migration plan §5, spec §4).
   A division is usable only when BOTH its URL and its service key are set. A missing one is not an error: the division is
   simply "not connected", and nothing else is affected. Names are built from a whitelist, never from request input. */
import type { Env } from '../../config.ts';
import { DIVISION_IDS, DIVISION_NAMES, type DivisionId } from '../../generated/partition.ts';

export type { DivisionId };
export const DIVISIONS = DIVISION_IDS.map((slug) => ({ slug, name: DIVISION_NAMES[slug] }));

export function isDivisionSlug(s: string): s is DivisionId {
  return (DIVISION_IDS as readonly string[]).includes(s);
}

const envKey = (slug: DivisionId) => slug.toUpperCase().replace(/-/g, '_');

export function getDivisionEnv(slug: DivisionId, env: Env = process.env): { url: string; key: string } | null {
  const k = envKey(slug);
  const url = env[`SPOKE_${k}_URL`];
  const key = env[`SPOKE_${k}_SERVICE_KEY`];
  return url && key ? { url, key } : null;
}

export function isConfigured(slug: DivisionId, env: Env = process.env): boolean {
  return getDivisionEnv(slug, env) !== null;
}

export function configuredDivisions(env: Env = process.env) {
  return DIVISIONS.filter((d) => isConfigured(d.slug, env));
}
