/* Reading and writing division records on behalf of a person. The division project hands over everything (service role);
   this is where each row is checked against the table's access rule (policy/). A table without a rule is invisible and
   read-only-nothing: it is simply not served. */
import { homeOfValue, VALUES_TABLE, type DivisionId } from '../../generated/partition.ts';
import type { Principal } from '../auth/principal.ts';
import { HttpError } from '../errors.ts';
import { mayDelete, mayRead, mayUpsert, policyFor, type Lookup, type RowView } from '../policy/index.ts';
import type { Changes, Row, RowsByTable } from '../workspace/partition.ts';
import type { SpokeGateway } from './gateway.ts';

/** Finds a row of the division by table and id in what was loaded. Unfiltered: a rule may look at a row its person cannot read. */
function lookupIn(rows: RowsByTable): Lookup {
  const index = new Map<string, Map<string, RowView>>();
  for (const [table, list] of Object.entries(rows)) index.set(table, new Map(list.map((r): [string, RowView] => [r.id, { id: r.id, doc: r.doc }])));
  return (table, id) => index.get(table)?.get(id);
}

/** The rows of a division this person may read, by table. */
export async function loadDivisionRows(spokes: SpokeGateway, slug: DivisionId, p: Principal): Promise<RowsByTable> {
  const all = await spokes.load(slug);
  const lookup = lookupIn(all);
  const out: RowsByTable = {};
  for (const [table, rows] of Object.entries(all)) {
    const policy = policyFor(table);
    if (!policy) continue;
    out[table] = rows.filter(
      (r) => (table !== VALUES_TABLE || homeOfValue(r.id) === slug) && mayRead(policy, p, { id: r.id, doc: r.doc }, lookup),
    );
  }
  return out;
}

/* Checks every row of a change set for one division, before anything is written. An update must be allowed on the row as it
   is (which the person must also be able to read) AND as it will be; a delete on the row as it is; an insert on the new row
   (the database's policies, one by one). A rule that looks at another table (an assessment and its cycle) gets that table
   loaded with the rest. Throws 403 `forbidden` for the first row that is not allowed. */
export async function authorizeDivisionChanges(
  spokes: SpokeGateway,
  slug: DivisionId,
  p: Principal,
  changes: Changes,
): Promise<void> {
  const tables = new Set(Object.keys(changes));
  for (const table of Object.keys(changes)) for (const needed of policyFor(table)?.needs ?? []) tables.add(needed);
  const current = await spokes.load(slug, [...tables]);
  const lookup = lookupIn(current);
  for (const [table, c] of Object.entries(changes)) {
    const policy = policyFor(table);
    if (!policy) throw new HttpError(403, 'forbidden');
    const before = new Map((current[table] ?? []).map((r): [string, Row] => [r.id, r]));
    const mine = (r: { id: string }) => table !== VALUES_TABLE || homeOfValue(r.id) === slug;
    for (const next of c.upsert ?? []) {
      const old = before.get(next.id);
      if (!mine(next) || !mayUpsert(policy, p, old, next, lookup)) throw new HttpError(403, 'forbidden');
    }
    for (const id of c.delete ?? []) {
      const old = before.get(id);
      if (old && (!mine(old) || !mayDelete(policy, p, old, lookup))) throw new HttpError(403, 'forbidden');
    }
  }
}
