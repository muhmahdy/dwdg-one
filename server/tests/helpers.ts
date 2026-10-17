import type { AuditEntry, AuditRow, HubGateway, PersonRecord, PersonSnapshot, ProgressRow } from '../src/lib/hub/gateway.ts';
import { GatewayError } from '../src/lib/errors.ts';
import type { DivisionId } from '../src/generated/partition.ts';
import type { SpokeGateway } from '../src/lib/spoke/gateway.ts';
import type { Row } from '../src/lib/workspace/partition.ts';

export interface FakeHub extends HubGateway {
  calls: { applied: { token: string; payload: string }[]; audits: AuditEntry[]; loads: string[]; progress: ProgressRow[][]; auditReads: { limit: number; division?: string }[] };
  /** Make the next applyChanges fail with this Postgres code. */
  failApplyWith: (code: string | undefined) => void;
}

export interface FakeOptions {
  /** token -> auth user id */
  tokens?: Record<string, string>;
  /** auth user id -> person */
  people?: Record<string, PersonRecord>;
  active?: DivisionId[];
  /** Divisions the hub marks as holding personal data. */
  sensitive?: DivisionId[];
  /** person id -> projects they lead or manage */
  led?: Record<string, string[]>;
  workspace?: unknown;
  auditFails?: boolean;
  /** People as stored in the hub, for the access audit (id -> document). */
  stored?: Record<string, Record<string, unknown>>;
  /** Makes reading stored people fail. */
  storedFails?: boolean;
  /** Tasks per division: [total, done]. */
  tasks?: Record<string, [number, number]>;
  /** Make the hub itself not answer a ping. */
  hubDown?: boolean;
  taskCountsFail?: boolean;
  saveProgressFails?: boolean;
  auditRows?: AuditRow[];
}

export const PERSON = (over: Partial<PersonRecord> = {}): PersonRecord => ({
  id: 'mem_ee',
  role: 'member',
  div: 'ee',
  status: 'active',
  isAdmin: false,
  ...over,
});

export function fakeHub(o: FakeOptions = {}): FakeHub {
  const tokens = o.tokens ?? { 'token-ee': 'u-ee' };
  const people = o.people ?? { 'u-ee': PERSON() };
  let applyFailure: string | undefined | null = null;
  const calls: FakeHub['calls'] = { applied: [], audits: [], loads: [], progress: [], auditReads: [] };
  return {
    calls,
    failApplyWith(code) {
      applyFailure = code;
    },
    verifyToken(token) {
      const id = tokens[token];
      return Promise.resolve(id ? { id, email: `${id}@dwdg.test` } : null);
    },
    findPerson(_token, authUserId) {
      return Promise.resolve(people[authUserId] ?? null);
    },
    ledProjects(_token, personId) {
      return Promise.resolve(new Set(o.led?.[personId] ?? []));
    },
    divisionFlags() {
      return Promise.resolve({ active: new Set(o.active ?? []), sensitive: new Set(o.sensitive ?? []) });
    },
    loadWorkspace(token) {
      calls.loads.push(token);
      return Promise.resolve(o.workspace ?? {});
    },
    applyChanges(token, payload) {
      if (applyFailure !== null) {
        const code = applyFailure;
        applyFailure = null;
        return Promise.reject(new GatewayError('new row violates row-level security policy for table "tasks"', code));
      }
      calls.applied.push({ token, payload });
      return Promise.resolve({ tasks: { upserted: 1, deleted: 0 } });
    },
    audit(entry) {
      if (o.auditFails) return Promise.reject(new GatewayError('relation "audit_log" does not exist', '42P01'));
      calls.audits.push(entry);
      return Promise.resolve();
    },
    ping() {
      return Promise.resolve(!o.hubDown);
    },
    peopleByIds(_token, ids) {
      if (o.storedFails) return Promise.reject(new GatewayError('boom'));
      const stored = o.stored ?? {};
      return Promise.resolve(ids.flatMap((id): PersonSnapshot[] => (stored[id] ? [{ id, doc: stored[id] }] : [])));
    },
    taskCounts() {
      if (o.taskCountsFail) return Promise.reject(new GatewayError('boom'));
      return Promise.resolve(Object.fromEntries(Object.entries(o.tasks ?? {}).map(([d, [total, done]]) => [d, { total, done }])));
    },
    saveProgress(rows) {
      if (o.saveProgressFails) return Promise.reject(new GatewayError('boom'));
      calls.progress.push([...rows]);
      return Promise.resolve();
    },
    readAudit(query) {
      calls.auditReads.push(query);
      return Promise.resolve(o.auditRows ?? []);
    },
  };
}

export interface FakeSpokes extends SpokeGateway {
  /** slug -> table -> rows */
  data: Record<string, Record<string, Row[]>>;
  calls: { loads: { slug: string; tables: readonly string[] | undefined }[]; applied: { slug: string; payload: string }[] };
  /** Make every call to this division fail (a paused project). */
  breakDivision: (slug: DivisionId) => void;
  /** Make only saving to this division fail. */
  breakSavesTo: (slug: DivisionId) => void;
  /** Make only the ping of this division fail. */
  breakPing: (slug: DivisionId) => void;
}

/** A division project in memory: load_rows and apply_rows with the same meaning as the SQL functions. */
export function fakeSpokes(data: Record<string, Record<string, Row[]>> = {}): FakeSpokes {
  const broken = new Set<string>();
  const brokenSaves = new Set<string>();
  const brokenPings = new Set<string>();
  const calls: FakeSpokes['calls'] = { loads: [], applied: [] };
  return {
    data,
    calls,
    breakDivision: (slug) => broken.add(slug),
    breakSavesTo: (slug) => brokenSaves.add(slug),
    breakPing: (slug) => brokenPings.add(slug),
    ping: (slug) => Promise.resolve(!broken.has(slug) && !brokenPings.has(slug)),
    load(slug, tables) {
      calls.loads.push({ slug, tables });
      if (broken.has(slug)) return Promise.reject(new GatewayError('project is paused', 'PGRST000'));
      const mine = data[slug] ?? {};
      const names = tables ?? Object.keys(mine);
      return Promise.resolve(Object.fromEntries(names.map((t) => [t, structuredClone(mine[t] ?? [])])));
    },
    apply(slug, payload) {
      if (broken.has(slug) || brokenSaves.has(slug)) return Promise.reject(new GatewayError('project is paused', 'PGRST000'));
      calls.applied.push({ slug, payload });
      const mine = (data[slug] ??= {});
      const changes = JSON.parse(payload) as Record<string, { upsert?: Row[]; delete?: string[] }>;
      for (const [table, c] of Object.entries(changes)) {
        const rows = (mine[table] ??= []);
        for (const id of c.delete ?? []) {
          const i = rows.findIndex((r) => r.id === id);
          if (i >= 0) rows.splice(i, 1);
        }
        for (const r of c.upsert ?? []) {
          const i = rows.findIndex((x) => x.id === r.id);
          if (i >= 0) rows[i] = r;
          else rows.push(r);
        }
      }
      return Promise.resolve({});
    },
  };
}
