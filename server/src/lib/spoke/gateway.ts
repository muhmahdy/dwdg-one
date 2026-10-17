/* Everything the server asks of a division project, behind one interface so tests can stand in for it. Always the service
   role (db(slug)): the division projects have no row level security of their own, so whoever calls this must already have
   checked who is asking (policy/ and spoke/service.ts do). */
import type { Env } from '../../config.ts';
import type { DivisionId } from '../../generated/partition.ts';
import { db } from '../divisions/client.ts';
import { GatewayError } from '../errors.ts';
import type { Row, RowsByTable } from '../workspace/partition.ts';

export interface SpokeGateway {
  /** `{ table: [ {id, pos, doc} ] }` for the named tables, or every registered table when none are named. */
  load: (slug: DivisionId, tables?: readonly string[]) => Promise<Record<string, Row[]>>;
  /** One transaction in the division project. `payload` is JSON text so key order inside records survives. Idempotent. */
  apply: (slug: DivisionId, payload: string) => Promise<unknown>;
  /** Does the project answer? Reads one row of `schema_meta`, which also counts as activity for the free tier's idle pause. */
  ping: (slug: DivisionId) => Promise<boolean>;
}

interface Reply {
  data: unknown;
  error: { message: string; code?: string } | null;
}

function unwrap(reply: Reply): unknown {
  if (reply.error) throw new GatewayError(reply.error.message, reply.error.code);
  return reply.data;
}

export function createSpokeGateway(env: Env = process.env): SpokeGateway {
  return {
    async load(slug, tables) {
      const reply: Reply = await db(slug, env).rpc('load_rows', { p_tables: tables ? [...tables] : null });
      const data = unwrap(reply);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new GatewayError('load_rows returned an unexpected shape');
      return data as RowsByTable;
    },
    async apply(slug, payload) {
      const reply: Reply = await db(slug, env).rpc('apply_rows', { p: payload });
      return unwrap(reply);
    },
    async ping(slug) {
      const reply: Reply = await db(slug, env).from('schema_meta').select('version').limit(1);
      return reply.error === null;
    },
  };
}
