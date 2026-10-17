/* Every change of who may do what is written to the hub's audit_log, with who made it. The hub's rules (RLS and the
   people guard) still decide whether the change is allowed; this records what happened. Two kinds of change count:
   the account and authority tables, and the fields of a person that carry authority (role, division, admin, board, status).
   Nothing personal beyond ids and those fields is written: no names, no e-mail addresses. */
import type { Principal } from '../auth/principal.ts';
import { audit } from '../audit.ts';
import type { HubGateway, PersonSnapshot } from '../hub/gateway.ts';
import type { Changes } from '../workspace/partition.ts';

/** Tables of accounts and authority. `acct_log` is left out: it is the app's own journal and every one of these writes adds to it. */
export const ACCESS_TABLES = ['acct_invites', 'acct_grants', 'acct_memberships', 'acct_actions', 'acct_handovers', 'acct_hidden'] as const;

/** The fields the database's people guard protects. */
export const AUTHORITY_FIELDS = ['role', 'div', 'admin', 'board', 'status'] as const;

type Doc = Record<string, unknown>;
const field = (doc: Doc | undefined, key: string): unknown => doc?.[key] ?? null;
const authority = (doc: Doc | undefined) => Object.fromEntries(AUTHORITY_FIELDS.map((k) => [k, field(doc, k)]));

/** The ids of the people a change set writes to or removes, so their stored records can be read first. */
export function peopleTouched(changes: Changes): string[] {
  const c = changes.people;
  return [...new Set([...(c?.upsert ?? []).map((r) => r.id), ...(c?.delete ?? [])])];
}

/** Does this change set touch anything that grants or removes authority? */
export function touchesAccess(changes: Changes): boolean {
  const rows = (t: string) => (changes[t]?.upsert?.length ?? 0) + (changes[t]?.delete?.length ?? 0);
  return rows('people') > 0 || ACCESS_TABLES.some((t) => rows(t) > 0);
}

export async function auditAccessChanges(
  hub: HubGateway,
  p: Principal,
  changes: Changes,
  before: readonly PersonSnapshot[] | null,
): Promise<void> {
  const by = { personId: p.personId };
  const stored = new Map((before ?? []).map((s) => [s.id, s.doc]));

  for (const row of changes.people?.upsert ?? []) {
    const old = stored.get(row.id);
    if (before === null) {
      // The stored record could not be read: say that a person was written, without guessing what changed.
      await audit(hub, { ...by, action: 'access.person.written', detail: { person: row.id } });
    } else if (!old) {
      await audit(hub, { ...by, action: 'access.person.added', detail: { person: row.id, ...authority(row.doc) } });
    } else {
      const changed = Object.fromEntries(
        AUTHORITY_FIELDS.filter((k) => field(old, k) !== field(row.doc, k)).map((k) => [k, [field(old, k), field(row.doc, k)]]),
      );
      if (Object.keys(changed).length > 0) {
        await audit(hub, { ...by, action: 'access.person.changed', detail: { person: row.id, changes: changed } });
      }
    }
  }
  for (const id of changes.people?.delete ?? []) {
    const old = stored.get(id);
    await audit(hub, { ...by, action: 'access.person.removed', detail: { person: id, ...(old ? authority(old) : {}) } });
  }

  for (const table of ACCESS_TABLES) {
    const upserted = changes[table]?.upsert ?? [];
    const deleted = changes[table]?.delete ?? [];
    if (upserted.length + deleted.length === 0) continue;
    const people = [...new Set(upserted.map((r) => r.doc.person).filter((v): v is string => typeof v === 'string'))];
    await audit(hub, {
      ...by,
      action: 'access.change',
      detail: { table, upserted: upserted.map((r) => r.id), deleted, ...(people.length > 0 ? { people } : {}) },
    });
  }
}
