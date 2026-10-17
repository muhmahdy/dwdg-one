/* Everything the server asks of the hub project, behind one interface so tests can stand in for it.
   Reads and writes of the core tables run AS THE PERSON: their own token goes to the hub, so the hub's row level security
   keeps deciding what they may see and change, exactly as before the split. The service role is used only for the audit log
   and the health check, which no person may touch. */
import { createClient } from '@supabase/supabase-js';
import type { Config } from '../../config.ts';
import { GatewayError } from '../errors.ts';
import { DIVISION_IDS, type DivisionId } from '../../generated/partition.ts';

export interface AuthUser {
  id: string;
  email: string | null;
}

/** The row of `people` linked to a sign-in. */
export interface PersonRecord {
  id: string;
  role: string | null;
  div: string | null;
  status: string | null;
  isAdmin: boolean;
}

export interface AuditEntry {
  personId?: string | null;
  divisionId?: string | null;
  action: string;
  detail?: Record<string, unknown>;
}

/** One division's line on the dashboard (`division_progress`). Counts come from the hub's tasks. */
export interface ProgressRow {
  division_id: string;
  total_items?: number;
  done_items?: number;
  last_synced_at?: string;
  last_error?: string | null;
}

export interface AuditRow {
  id: number;
  at: string;
  person_id: string | null;
  division_id: string | null;
  action: string;
  detail: unknown;
}

/** A stored person, as far as the access audit needs: the id and the record. */
export interface PersonSnapshot {
  id: string;
  doc: Record<string, unknown>;
}

export interface DivisionFlags {
  active: ReadonlySet<DivisionId>;
  sensitive: ReadonlySet<DivisionId>;
}

export interface HubGateway {
  /** Asks the hub's Auth service whether the token is genuine. Null when it is not. */
  verifyToken: (token: string) => Promise<AuthUser | null>;
  findPerson: (token: string, authUserId: string) => Promise<PersonRecord | null>;
  /** Ids of the projects this person leads or manages (`projects.lead` or `.pm`), as far as the hub lets them see. */
  ledProjects: (token: string, personId: string) => Promise<ReadonlySet<string>>;
  /** What the hub says about each division: switched on (`is_active`) and holding personal data (`is_sensitive`). Both empty when the hub does not have the columns yet. */
  divisionFlags: (token: string) => Promise<DivisionFlags>;
  /** `{ table: [ {id, pos, doc} ] }` for every table the person may read. */
  loadWorkspace: (token: string) => Promise<unknown>;
  /** One transaction in the hub. `payload` is JSON text so key order inside records survives. */
  applyChanges: (token: string, payload: string) => Promise<unknown>;
  audit: (entry: AuditEntry) => Promise<void>;
  ping: () => Promise<boolean>;
  /** The people with these ids that the person may see (`people` as the person). */
  peopleByIds: (token: string, ids: readonly string[]) => Promise<PersonSnapshot[]>;
  /** Open and finished tasks per division, trashed ones left out (service role). */
  taskCounts: () => Promise<Record<string, { total: number; done: number }>>;
  /** Upserts division_progress lines; a column that is left out keeps its value (service role). */
  saveProgress: (rows: readonly ProgressRow[]) => Promise<void>;
  /** Newest first (service role). */
  readAudit: (query: { limit: number; division?: string }) => Promise<AuditRow[]>;
}

const noSession = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } as const;

interface ApiError {
  message: string;
  code?: string;
}
interface Reply<T> {
  data: T | null;
  error: ApiError | null;
}

function unwrap<T>(reply: Reply<T>): T | null {
  if (reply.error) throw new GatewayError(reply.error.message, reply.error.code);
  return reply.data;
}

export function createHubGateway(config: Config): HubGateway {
  const anon = createClient(config.hubUrl, config.hubPublishableKey, { auth: noSession });
  const admin = createClient(config.hubUrl, config.hubServiceKey, { auth: noSession });
  const asPerson = (token: string) =>
    createClient(config.hubUrl, config.hubPublishableKey, {
      auth: noSession,
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

  return {
    async verifyToken(token) {
      const { data, error } = await anon.auth.getUser(token);
      if (error) return null;
      return { id: data.user.id, email: data.user.email ?? null };
    },
    async findPerson(token, authUserId) {
      const reply: Reply<{ id: string; role: string | null; div: string | null; status: string | null; is_admin: boolean | null }> =
        await asPerson(token).from('people').select('id, role, div, status, is_admin').eq('auth_user_id', authUserId).maybeSingle();
      const p = unwrap(reply);
      return p ? { id: p.id, role: p.role, div: p.div, status: p.status, isAdmin: p.is_admin === true } : null;
    },
    async ledProjects(token, personId) {
      const reply: Reply<{ id: string }[]> = await asPerson(token)
        .from('projects')
        .select('id')
        .or(`lead.eq.${personId},pm.eq.${personId}`);
      return new Set(unwrap(reply)?.map((r) => r.id) ?? []);
    },
    async divisionFlags(token) {
      const reply: Reply<{ id: string; is_active?: boolean; is_sensitive?: boolean }[]> = await asPerson(token)
        .from('divisions')
        .select('id, is_active, is_sensitive');
      // The hub may not have the columns yet (single-database schema): then no division is switched on.
      if (reply.error) return { active: new Set(), sensitive: new Set() };
      const rows = reply.data ?? [];
      const flagged = (key: 'is_active' | 'is_sensitive') => {
        const ids = rows.filter((d) => d[key] === true).map((d) => d.id);
        return new Set(DIVISION_IDS.filter((d) => ids.includes(d)));
      };
      return { active: flagged('is_active'), sensitive: flagged('is_sensitive') };
    },
    async loadWorkspace(token) {
      const reply: Reply<unknown> = await asPerson(token).rpc('load_workspace');
      return unwrap(reply);
    },
    async applyChanges(token, payload) {
      const reply: Reply<unknown> = await asPerson(token).rpc('apply_changes', { p: payload });
      return unwrap(reply);
    },
    async audit(entry) {
      const reply: Reply<unknown> = await admin.from('audit_log').insert({
        person_id: entry.personId ?? null,
        division_id: entry.divisionId ?? null,
        action: entry.action,
        detail: entry.detail ?? null,
      });
      unwrap(reply);
    },
    async ping() {
      const reply: Reply<unknown> = await admin.from('divisions').select('id').limit(1);
      return reply.error === null;
    },
    async peopleByIds(token, ids) {
      const found: PersonSnapshot[] = [];
      for (let i = 0; i < ids.length; i += 100) {
        const reply: Reply<PersonSnapshot[]> = await asPerson(token).from('people').select('id, doc').in('id', ids.slice(i, i + 100));
        found.push(...(unwrap(reply) ?? []));
      }
      return found;
    },
    async taskCounts() {
      const counts: Record<string, { total: number; done: number }> = {};
      for (const division of DIVISION_IDS) {
        const count = async (done: boolean) => {
          let q = admin.from('tasks').select('id', { count: 'exact', head: true }).eq('div', division).or('trashed.is.null,trashed.eq.false');
          if (done) q = q.eq('status', 'done');
          const reply: { count: number | null; error: ApiError | null } = await q;
          if (reply.error) throw new GatewayError(reply.error.message, reply.error.code);
          return reply.count ?? 0;
        };
        counts[division] = { total: await count(false), done: await count(true) };
      }
      return counts;
    },
    async saveProgress(rows) {
      const reply: Reply<unknown> = await admin.from('division_progress').upsert([...rows], { onConflict: 'division_id' });
      unwrap(reply);
    },
    async readAudit(query) {
      let q = admin.from('audit_log').select('id, at, person_id, division_id, action, detail').order('at', { ascending: false }).limit(query.limit);
      if (query.division) q = q.eq('division_id', query.division);
      const reply: Reply<AuditRow[]> = await q;
      return unwrap(reply) ?? [];
    },
  };
}
