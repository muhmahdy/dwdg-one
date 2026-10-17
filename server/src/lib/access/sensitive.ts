/* Divisions that hold personal data (HR, Finance & Legal): every time one of them gives a person records, or changes
   them, a line goes to the audit log. A person who is shown nothing of a sensitive division leaves no line, so the log is
   about who SAW or CHANGED personal data and does not fill with everyone opening the app. Refused attempts are written
   as `changes.denied` by the save route. */
import type { DivisionId } from '../../generated/partition.ts';
import type { Principal } from '../auth/principal.ts';
import { audit } from '../audit.ts';
import type { HubGateway } from '../hub/gateway.ts';
import type { Changes } from '../workspace/partition.ts';

/** Always treated as sensitive, even if the hub has not been told (an old hub without the flag, a flag switched off by mistake). */
export const SENSITIVE_DEFAULT: readonly DivisionId[] = ['hr', 'fnl'];

export function sensitiveDivisions(flagged: ReadonlySet<DivisionId>): ReadonlySet<DivisionId> {
  return new Set([...SENSITIVE_DEFAULT, ...flagged]);
}

/** `rows` is how many records of the division (not counting its stored values) were handed to the person. */
export async function auditSensitiveRead(hub: HubGateway, p: Principal, slug: DivisionId, rows: number): Promise<void> {
  if (rows === 0) return;
  await audit(hub, { personId: p.personId, divisionId: slug, action: 'access.sensitive', detail: { op: 'read', rows } });
}

export async function auditSensitiveWrite(hub: HubGateway, p: Principal, slug: DivisionId, changes: Changes): Promise<void> {
  const upserted = Object.values(changes).reduce((n, c) => n + (c.upsert?.length ?? 0), 0);
  const deleted = Object.values(changes).reduce((n, c) => n + (c.delete?.length ?? 0), 0);
  await audit(hub, {
    personId: p.personId,
    divisionId: slug,
    action: 'access.sensitive',
    detail: { op: 'write', tables: Object.keys(changes), upserted, deleted },
  });
}
