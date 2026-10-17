import type { DivisionId } from '../../generated/partition.ts';
import type { Principal } from '../auth/principal.ts';
import { seesDiv } from '../auth/rules.ts';

/* schema-spec.mjs `NB`: `not app.is_board()`. It is null, so a refusal, for an active person whose record names no valid
   role; hence the role check. */
export const notBoard = (p: Principal): boolean => p.role !== null && !p.board;

/* schema-spec.mjs `division(d, extra)`: the division's private data. Members of the division, the President, the VP and the
   Admin (sees_div), or whoever `extra` names for the row, and never the Board (NB). */
export const division = (p: Principal, d: DivisionId, extra = false): boolean => notBoard(p) && (seesDiv(p, d) || extra);

/* schema-spec.mjs `has(key)`: `jsonb_exists(doc::jsonb->key, me)`. PostgreSQL's `?` says yes when the text is an element of an
   array, a key of an object, or equal to a string value; and it is null (so no) for a person who is not linked. */
export function jsonbHas(value: unknown, key: string | null): boolean {
  if (key === null || value === undefined || value === null) return false;
  if (typeof value === 'string') return value === key;
  if (Array.isArray(value)) return value.some((v) => v === key);
  if (typeof value === 'object') return Object.hasOwn(value, key);
  return false;
}
