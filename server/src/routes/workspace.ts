import { Hono } from 'hono';
import type { AppEnv } from '../app.ts';
import type { Env } from '../config.ts';
import { DIVISION_IDS, VALUES_TABLE } from '../generated/partition.ts';
import { HttpError } from '../lib/errors.ts';
import type { HubGateway } from '../lib/hub/gateway.ts';
import { auditSensitiveRead } from '../lib/access/sensitive.ts';
import { divisionInfo } from '../lib/divisions/status.ts';
import type { SpokeGateway } from '../lib/spoke/gateway.ts';
import { loadDivisionRows } from '../lib/spoke/service.ts';
import { keepHubRows } from '../lib/workspace/partition.ts';

/* GET /api/workspace: everything the person may read, as `{ rows, divisions }`.
   `rows` has the same shape as the hub's load_workspace() (`{ table: [ {id, pos, doc} ] }`), so the app builds its
   workspace exactly as before. The hub runs as the person, so its row level security has already filtered those rows.
   Each division project that is connected, switched on and has access rules is read in parallel and its rows are filtered
   here, row by row, by the same rules the database used to apply. A division that cannot be read answers `unavailable`
   and the rest still loads. */
export function workspaceRoute(hub: HubGateway, spokes: SpokeGateway, env: Env) {
  return new Hono<AppEnv>().get('/', async (c) => {
    const p = c.get('principal');
    if (!p.personId) throw new HttpError(403, 'not_linked');
    const token = c.get('token');
    const [all, info] = await Promise.all([hub.loadWorkspace(token), divisionInfo(hub, token, env)]);
    const divisions = info.statuses;
    if (typeof all !== 'object' || all === null || Array.isArray(all)) throw new Error('load_workspace returned an unexpected shape');
    const rows = keepHubRows(all as Record<string, unknown>);

    const live = DIVISION_IDS.filter((slug) => divisions[slug] === 'ok');
    const loaded = await Promise.allSettled(live.map((slug) => loadDivisionRows(spokes, slug, p)));
    const audits: Promise<void>[] = [];
    loaded.forEach((result, i) => {
      const slug = live[i];
      if (!slug) return;
      if (result.status === 'rejected') {
        console.error('division_load_failed', slug, result.reason instanceof Error ? result.reason.message : 'unknown');
        divisions[slug] = 'unavailable';
        return;
      }
      // A sensitive division that hands this person records is written to the audit log (one line per load, not per row).
      if (info.sensitive.has(slug)) {
        const records = Object.entries(result.value).reduce((n, [table, list]) => (table === VALUES_TABLE ? n : n + list.length), 0);
        audits.push(auditSensitiveRead(hub, p, slug, records));
      }
      for (const [table, list] of Object.entries(result.value)) {
        // The stored values of every project share one table; the rest of the tables belong to one project each.
        rows[table] = table === VALUES_TABLE ? [...((rows[table] as unknown[] | undefined) ?? []), ...list] : list;
      }
    });
    await Promise.all(audits);
    return c.json({ rows, divisions });
  });
}
