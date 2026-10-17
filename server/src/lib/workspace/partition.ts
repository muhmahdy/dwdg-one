/* Cuts a workspace or a change set along the hub / division line. The table list comes from the database spec
   (src/generated/partition.ts), so the server and the database cannot disagree about where a table lives. */
import { HUB, TABLE_HOME, VALUES_TABLE, homeOfValue, type DivisionId, type Home } from '../../generated/partition.ts';

export interface Row {
  id: string;
  pos: number;
  doc: Record<string, unknown>;
}
export type RowsByTable = Record<string, Row[]>;
export type Changes = Record<string, { upsert?: Row[]; delete?: string[] }>;

/** The home of a table, or undefined when no such table exists. */
export function homeOfTable(table: string): Home | undefined {
  return table === VALUES_TABLE ? HUB : TABLE_HOME[table];
}

/** Keeps only what the hub owns: its tables, and the stored values whose id belongs to the hub. */
export function keepHubRows(rows: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [table, list] of Object.entries(rows)) {
    if (table === VALUES_TABLE) {
      out[table] = Array.isArray(list) ? (list as { id: string }[]).filter((r) => homeOfValue(r.id) === HUB) : [];
    } else if (TABLE_HOME[table] === HUB) {
      out[table] = list;
    }
  }
  return out;
}

export interface SplitChanges {
  hub: Changes;
  /** Division projects that the change set touches, with what goes to each. */
  divisions: Partial<Record<DivisionId, Changes>>;
  /** Table names that do not exist. */
  unknown: string[];
}

/** Sorts every table's changes (and the stored values, row by row) to the project that owns them. */
export function splitChanges(changes: Changes): SplitChanges {
  const result: SplitChanges = { hub: {}, divisions: {}, unknown: [] };
  const bucket = (home: Home, table: string) => {
    const target = home === HUB ? result.hub : (result.divisions[home] ??= {});
    return (target[table] ??= {});
  };
  const upsert = (home: Home, table: string, row: Row) => {
    (bucket(home, table).upsert ??= []).push(row);
  };
  const remove = (home: Home, table: string, id: string) => {
    (bucket(home, table).delete ??= []).push(id);
  };
  for (const [table, c] of Object.entries(changes)) {
    if (table === VALUES_TABLE) {
      for (const r of c.upsert ?? []) upsert(homeOfValue(r.id), table, r);
      for (const id of c.delete ?? []) remove(homeOfValue(id), table, id);
      continue;
    }
    const home = TABLE_HOME[table];
    if (!home) {
      result.unknown.push(table);
      continue;
    }
    for (const r of c.upsert ?? []) upsert(home, table, r);
    for (const id of c.delete ?? []) remove(home, table, id);
  }
  return result;
}
