import type { Principal } from '../auth/principal.ts';

/** One stored record: the row's id and its document. The generated columns of the database are read from the document. */
export interface RowView {
  id: string;
  doc: Record<string, unknown>;
}

/** Finds a stored row of the same division by table and id, whoever may read it (the database's security definer helpers do the same). */
export type Lookup = (table: string, id: string) => RowView | undefined;
export const noLookup: Lookup = () => undefined;

/* The access rule of one table, written as in database/schema/schema-spec.mjs.
   Reading needs an active person AND `read`. Writing needs a person who can write (active, not the Board) AND `write`
   (the read rule when a table has none of its own), on the row as it is now (update, delete) and as it will be (insert,
   update). That is exactly what the database's four policies per table say. A rule that has to look at another row of the
   division (an assessment is read by the reviewer named in its cycle) says which tables it needs in `needs`, so they are
   loaded with it. */
export interface TablePolicy {
  read: (p: Principal, row: RowView, lookup: Lookup) => boolean;
  write?: (p: Principal, row: RowView, lookup: Lookup) => boolean;
  needs?: readonly string[];
}

export const mayRead = (policy: TablePolicy, p: Principal, row: RowView, lookup: Lookup = noLookup): boolean =>
  p.active && policy.read(p, row, lookup);

export const mayWrite = (policy: TablePolicy, p: Principal, row: RowView, lookup: Lookup = noLookup): boolean =>
  p.canWrite && (policy.write ?? policy.read)(p, row, lookup);

/* A row that is already stored can be changed or deleted only if the person may also READ it: the database finds the row
   through the select policy first, so a row the person cannot see is as good as absent (a hand-off still in draft that its
   receiver may write to but not see is the one case in the schema where write is wider than read). */
export const mayChange = (policy: TablePolicy, p: Principal, existing: RowView, lookup: Lookup = noLookup): boolean =>
  mayRead(policy, p, existing, lookup) && mayWrite(policy, p, existing, lookup);

/* Saving a record (the app only ever upserts, `insert ... on conflict do update`). The database checks the record as it will be
   against the write rule AND the read rule, whether it is new or not, and a record that already exists must also be one the
   person may change. Only where write is wider than read (a draft hand-off) does the read rule add anything. */
export const mayUpsert = (
  policy: TablePolicy,
  p: Principal,
  existing: RowView | undefined,
  next: RowView,
  lookup: Lookup = noLookup,
): boolean =>
  mayWrite(policy, p, next, lookup) &&
  mayRead(policy, p, next, lookup) &&
  (existing === undefined || mayChange(policy, p, existing, lookup));

/** Removing a stored record. */
export const mayDelete = mayChange;
