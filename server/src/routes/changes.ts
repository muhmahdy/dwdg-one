import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../app.ts';
import type { Env } from '../config.ts';
import type { DivisionId } from '../generated/partition.ts';
import { HttpError } from '../lib/errors.ts';
import type { HubGateway } from '../lib/hub/gateway.ts';
import { audit } from '../lib/audit.ts';
import { auditAccessChanges, peopleTouched, touchesAccess } from '../lib/access/audit.ts';
import type { PersonSnapshot } from '../lib/hub/gateway.ts';
import { auditSensitiveWrite } from '../lib/access/sensitive.ts';
import { divisionInfo, type DivisionInfo } from '../lib/divisions/status.ts';
import type { SpokeGateway } from '../lib/spoke/gateway.ts';
import { authorizeDivisionChanges } from '../lib/spoke/service.ts';
import { splitChanges } from '../lib/workspace/partition.ts';

const id = z.string().min(1).max(200);
const row = z.object({ id, pos: z.number().int().min(0).max(10_000_000), doc: z.record(z.string(), z.unknown()) }).strict();
const body = z
  .object({
    changes: z.record(
      z.string().max(100),
      z.object({ upsert: z.array(row).max(5000).optional(), delete: z.array(id).max(5000).optional() }).strict(),
    ),
  })
  .strict();

const isCode = (err: unknown, code: string) => err instanceof Error && 'code' in err && (err as { code?: string }).code === code;

/* POST /api/changes  { changes: { table: { upsert: [{id,pos,doc}], delete: [id] } } }
   Saves one change set across the hub and the division projects.
   1. Validate, and sort every table to the project that owns it. Unknown tables are refused.
   2. Every division project the change set touches must be switched on and have access rules, or the WHOLE set is refused
      before anything is written (409 division_unavailable).
   3. Every division row is checked here against the table's access rule (403 forbidden, nothing written).
   4. The hub saves first, as the person, so its row level security can still refuse (and a change of accounts or authority
      is written to the audit log); then the division projects, in
      parallel. Each project is one transaction and a save is idempotent. If a division project fails after the hub (or
      another project) has already saved, the answer is 502 `partial_save` with what was and was not saved, and the
      browser reloads the workspace to show the truth. */
export function changesRoute(hub: HubGateway, spokes: SpokeGateway, env: Env) {
  return new Hono<AppEnv>().post('/', async (c) => {
    const p = c.get('principal');
    if (!p.personId) throw new HttpError(403, 'not_linked');
    if (!p.canWrite) throw new HttpError(403, 'forbidden');
    const token = c.get('token');

    let raw: unknown;
    try {
      raw = await c.req.json();
    } catch {
      throw new HttpError(400, 'invalid_input');
    }
    const parsed = body.parse(raw);
    const split = splitChanges(parsed.changes);
    if (split.unknown.length > 0) throw new HttpError(400, 'invalid_input');

    const targets = Object.keys(split.divisions) as DivisionId[];
    let info: DivisionInfo | null = null;
    if (targets.length > 0) {
      info = await divisionInfo(hub, token, env);
      const statuses = info.statuses;
      const blocked = targets.filter((slug) => statuses[slug] !== 'ok');
      if (blocked.length > 0) {
        await audit(hub, { personId: p.personId, action: 'changes.refused', detail: { reason: 'division_unavailable', divisions: blocked } });
        throw new HttpError(409, 'division_unavailable');
      }
      try {
        await Promise.all(targets.map((slug) => authorizeDivisionChanges(spokes, slug, p, split.divisions[slug] ?? {})));
      } catch (err) {
        if (err instanceof HttpError) {
          await audit(hub, { personId: p.personId, action: 'changes.denied', detail: { divisions: targets } });
          throw err;
        }
        // The division project could not even be read: nothing was written, say so plainly.
        console.error('division_authorize_failed', err instanceof Error ? err.message : 'unknown');
        throw new HttpError(409, 'division_unavailable');
      }
    }

    const applied: string[] = [];
    let hubResult: unknown = null;
    if (Object.keys(split.hub).length > 0) {
      // A change of who may do what is written to the audit log. Read the stored people first, to record what changed.
      const access = touchesAccess(split.hub);
      let before: PersonSnapshot[] | null = [];
      const touched = peopleTouched(split.hub);
      if (access && touched.length > 0) {
        before = await hub.peopleByIds(token, touched).catch((err: unknown) => {
          console.error('access_audit_read_failed', err instanceof Error ? err.message : 'unknown');
          return null;
        });
      }
      try {
        hubResult = await hub.applyChanges(token, JSON.stringify(split.hub));
        applied.push('hub');
        if (access) await auditAccessChanges(hub, p, split.hub, before);
      } catch (err) {
        if (isCode(err, '42501')) await audit(hub, { personId: p.personId, action: 'changes.denied', detail: { tables: Object.keys(split.hub) } });
        throw err;
      }
    }

    const settled = await Promise.allSettled(targets.map((slug) => spokes.apply(slug, JSON.stringify(split.divisions[slug] ?? {}))));
    const failed: string[] = [];
    const results: Record<string, unknown> = {};
    const audits: Promise<void>[] = [];
    settled.forEach((s, i) => {
      const slug = targets[i];
      if (!slug) return;
      if (s.status === 'fulfilled') {
        applied.push(slug);
        results[slug] = s.value;
        // a change to a sensitive division is written to the audit log
        if (info?.sensitive.has(slug)) audits.push(auditSensitiveWrite(hub, p, slug, split.divisions[slug] ?? {}));
      } else {
        failed.push(slug);
        console.error('division_save_failed', slug, s.reason instanceof Error ? s.reason.message : 'unknown');
      }
    });
    await Promise.all(audits);
    if (failed.length > 0) {
      await audit(hub, { personId: p.personId, action: 'changes.partial', detail: { applied, failed } });
      if (applied.length === 0) throw new Error('division save failed');
      return c.json({ error: 'partial_save', applied, failed }, 502);
    }
    return c.json({ ok: true, result: { hub: hubResult, ...results } });
  });
}
