/* Turns the in-memory workspace into table rows and back, and finds the rows one change touched.
   Typed twin of scripts/database/lib/workspace-shape.mjs; the table mapping itself is generated from the schema spec. */
import type { Workspace } from '@/types/workspace';
import type { Changes, Row, RowsByTable, TableShape } from './shape-types';
import { TABLES, VALUES, VALUES_TABLE } from './tables.generated';

type Bag = Record<string, unknown>;

const SCALAR_VALUES = new Set([
  'v',
  'lookV',
  'rmSeeded',
  'pgSeeded',
  'hr.v',
  'sng.v',
  'ee.v',
  'cons.v',
  'fnl.v',
  'mcit.v',
  'acct.v',
  'perf.v',
]);
// Collections that always exist. Everything else is created on first use and must stay absent until then.
const ALWAYS = new Set([
  'people',
  'tasks',
  'offers',
  'projects',
  'milestones',
  'blockers',
  'decisions',
  'meetings',
  'unavailable',
  'gbusy',
  'resources',
  'updates',
  'changes',
]);

const isBag = (v: unknown): v is Bag => typeof v === 'object' && v !== null && !Array.isArray(v);

export function getPath(o: unknown, path: string): unknown {
  let cur = o;
  for (const k of path.split('.')) {
    if (!isBag(cur)) return undefined;
    cur = cur[k];
  }
  return cur;
}

function putPath(o: Bag, path: string, value: unknown): void {
  const keys = path.split('.');
  const last = keys.pop() ?? path;
  let cur = o;
  for (const k of keys) {
    const next = cur[k];
    if (isBag(next)) cur = next;
    else {
      const created: Bag = {};
      cur[k] = created;
      cur = created;
    }
  }
  cur[last] = value;
}

const storeOf = (source: string) => (source.includes('.') ? (source.split('.')[0] ?? null) : null);

/** A row plus the record it came from; `raw` keeps the in-memory identity that diff() compares. */
interface SourcedRow extends Row {
  raw: unknown;
}

const plain = ({ id, pos, doc }: SourcedRow): Row => ({ id, pos, doc });

function rowsOf(t: TableShape, v: unknown): SourcedRow[] {
  if (v === undefined || v === null) return [];
  if (t.keyed) {
    if (!isBag(v)) throw new Error(`${t.source} should be an object`);
    return Object.keys(v).map((k, i) => ({ id: k, pos: i, raw: v[k], doc: t.wrap ? { [t.wrap]: v[k] } : v[k] }));
  }
  if (!Array.isArray(v)) throw new Error(`${t.source} should be a list`);
  const key = t.idField ?? 'id';
  return v.map((item: unknown, i) => {
    if (t.positional) return { id: String(i).padStart(6, '0'), pos: i, raw: item, doc: item };
    const id = isBag(item) ? item[key] : undefined;
    if (typeof id !== 'string' && typeof id !== 'number') throw new Error(`${t.source}[${i}] has no ${key}`);
    return { id: String(id), pos: i, raw: item, doc: item };
  });
}

function valueRow(db: unknown, path: string, i: number): Row | null {
  const v = getPath(db, path);
  if (v === undefined) return null;
  return { id: path, pos: i, doc: SCALAR_VALUES.has(path) ? { value: v } : v };
}

export function decompose(db: Workspace): RowsByTable {
  const out: RowsByTable = {};
  for (const t of TABLES) out[t.name] = rowsOf(t, getPath(db, t.source)).map(plain);
  out[VALUES_TABLE] = VALUES.map((p, i) => valueRow(db, p, i)).filter((r): r is Row => r !== null);
  return out;
}

export function compose(rowsByTable: RowsByTable): Workspace {
  const db: Bag = {};
  const values = new Map((rowsByTable[VALUES_TABLE] ?? []).map((r) => [r.id, r.doc]));
  const valueOf = (path: string) => {
    if (!values.has(path)) return undefined;
    const doc = values.get(path);
    return SCALAR_VALUES.has(path) && isBag(doc) ? doc.value : doc;
  };
  for (const path of VALUES) {
    const v = valueOf(path);
    if (v !== undefined) putPath(db, path, v);
  }
  for (const t of TABLES) {
    const rows = [...(rowsByTable[t.name] ?? [])].sort((a, b) => a.pos - b.pos || (a.id < b.id ? -1 : 1));
    const store = storeOf(t.source);
    const present =
      ALWAYS.has(t.name) ||
      rows.length > 0 ||
      (store !== null && values.has(`${store}.v`)) ||
      (t.name === 'routines' && values.has('rmSeeded')) ||
      (t.name === 'programs' && values.has('pgSeeded'));
    if (!present) continue;
    if (t.keyed) {
      const obj: Bag = {};
      for (const r of rows) obj[r.id] = t.wrap && isBag(r.doc) ? r.doc[t.wrap] : r.doc;
      putPath(db, t.source, obj);
    } else
      putPath(
        db,
        t.source,
        rows.map((r) => r.doc),
      );
  }
  return db as unknown as Workspace;
}

/* The rows that differ between two workspaces. The store is immutable (Immer), so an untouched collection or record
   keeps its identity: collections with the same reference are skipped, and inside a changed collection only records
   that are new objects or moved position are sent. */
export function diff(before: Workspace, after: Workspace): Changes {
  const changes: Changes = {};
  for (const t of TABLES) {
    const a = getPath(before, t.source);
    const b = getPath(after, t.source);
    if (a === b) continue;
    const oldRows = new Map(rowsOf(t, a).map((r) => [r.id, r]));
    const newRows = rowsOf(t, b);
    const upsert = newRows.filter((r) => {
      const o = oldRows.get(r.id);
      return !o || o.raw !== r.raw || o.pos !== r.pos;
    });
    const seen = new Set(newRows.map((r) => r.id));
    const del = [...oldRows.keys()].filter((id) => !seen.has(id));
    if (upsert.length || del.length)
      changes[t.name] = {
        ...(upsert.length ? { upsert: upsert.map(plain) } : {}),
        ...(del.length ? { delete: del } : {}),
      };
  }
  const valueUpserts = VALUES.flatMap((path, i) => {
    if (getPath(before, path) === getPath(after, path)) return [];
    const row = valueRow(after, path, i);
    return row ? [row] : [];
  });
  if (valueUpserts.length) changes[VALUES_TABLE] = { upsert: valueUpserts };
  return changes;
}

export const isEmptyChange = (c: Changes) => Object.keys(c).length === 0;
