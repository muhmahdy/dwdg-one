/* The scheduled job (GitHub Actions calls /api/cron/ping once or twice a week). Two things, in one go:
   1. Activity. A free Supabase project that sees nothing for a week is paused, so the job asks the hub and every
      connected division project one small question, and reports the ones that did not answer.
   2. The dashboard's numbers. Each division's open and finished tasks are counted in the hub and saved as
      `division_progress`, so the dashboard reads one small table and never a division project. A division that did not
      answer gets `last_error`, which the screens turn into "paused / unreachable". */
import type { Env } from '../../config.ts';
import { DIVISION_IDS, type DivisionId } from '../../generated/partition.ts';
import { isConfigured } from '../divisions/registry.ts';
import type { HubGateway, ProgressRow } from '../hub/gateway.ts';
import type { SpokeGateway } from '../spoke/gateway.ts';

export type PingResult = 'ok' | 'failed' | 'not_configured';

export interface KeepAliveResult {
  /** True only when the hub answered, every connected division answered, and the numbers were counted and saved. */
  ok: boolean;
  hub: boolean;
  divisions: Record<DivisionId, PingResult>;
  progressSaved: boolean;
}

export async function runKeepAlive(
  hub: HubGateway,
  spokes: SpokeGateway,
  env: Env,
  now: () => Date = () => new Date(),
): Promise<KeepAliveResult> {
  const hubUp = await hub.ping().catch(() => false);
  const answered = await Promise.all(
    DIVISION_IDS.map(async (slug): Promise<[DivisionId, PingResult]> => {
      if (!isConfigured(slug, env)) return [slug, 'not_configured'];
      return [slug, await spokes.ping(slug).then((up): PingResult => (up ? 'ok' : 'failed'), (): PingResult => 'failed')];
    }),
  );
  const divisions = Object.fromEntries(answered) as Record<DivisionId, PingResult>;

  let progressSaved = false;
  let counted = false;
  if (hubUp) {
    const counts = await hub.taskCounts().catch(() => null);
    counted = counts !== null;
    const at = now().toISOString();
    const rows: ProgressRow[] = DIVISION_IDS.map((slug) => ({
      division_id: slug,
      ...(counts ? { total_items: counts[slug]?.total ?? 0, done_items: counts[slug]?.done ?? 0 } : {}),
      last_synced_at: at,
      last_error: divisions[slug] === 'failed' ? 'unreachable' : counts ? null : 'sync_failed',
    }));
    progressSaved = await hub.saveProgress(rows).then(
      () => true,
      () => false,
    );
  }
  const ok = hubUp && counted && progressSaved && Object.values(divisions).every((r) => r !== 'failed');
  return { ok, hub: hubUp, divisions, progressSaved };
}
