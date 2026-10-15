/** Where one table's records live inside the in-memory workspace (see database/schema/schema-spec.mjs). */
export interface TableShape {
  readonly name: string;
  /** Dotted path in the workspace, e.g. `tasks` or `hr.registers`. */
  readonly source: string;
  /** The collection is an object keyed by id (e.g. `cons.eng` keyed by project id) instead of a list. */
  readonly keyed?: true;
  /** Each keyed value is a list stored as `{[wrap]: list}`. */
  readonly wrap?: string;
  /** List items whose id field is not called `id` (e.g. `ee.fu` keyed by `task`). */
  readonly idField?: string;
  /** List items without any id: the row id is the zero-padded position. */
  readonly positional?: true;
}

/** One stored record: the database row behind it. */
export interface Row {
  id: string;
  pos: number;
  doc: unknown;
}

export type RowsByTable = Record<string, Row[]>;

/** The payload of `apply_changes()`: per table, rows to upsert and ids to delete. */
export type Changes = Record<string, { upsert?: Row[]; delete?: string[] }>;
