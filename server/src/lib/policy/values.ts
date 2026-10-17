/* store_values: single values of the workspace (version numbers, switches, grant lists, numbering policy).
   Any active person reads them. Writing needs a person who can write, and the locked values (grant lists, numbering policy,
   office version) only the President, the VP or an Admin. database/schema/schema-spec.mjs VALUE_LOCKED. */
import { LOCKED_VALUES } from '../../generated/partition.ts';
import { isTopOrAdmin } from '../auth/rules.ts';
import type { TablePolicy } from './types.ts';

export const store_values: TablePolicy = {
  read: () => true,
  write: (p, r) => !LOCKED_VALUES.includes(r.id) || isTopOrAdmin(p),
};
