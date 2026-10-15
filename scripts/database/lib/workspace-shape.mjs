// Turns the prototype's `db` object into table rows and back. Pure functions, no network, no dependencies.
// Used by scripts/database/move-data.mjs and database/tests/shape.test.mjs; frontend/src/lib/workspace/shape.ts is the typed twin.
//
// Row = { id, pos, doc }.  decompose(db) -> { tableName: Row[] }   compose(rows) -> db
// compose(decompose(db)) gives back the same data (checked by tests/shape.test.mjs).

import {TABLES, VALUES} from '../../../database/schema/schema-spec.mjs';

export const PEOPLE = {name: 'people', source: 'people', cols: {}};
export const ALL_TABLES = [PEOPLE, ...TABLES];
export const VALUES_TABLE = 'store_values';
export const SCALAR_VALUES = new Set(['v', 'lookV', 'rmSeeded', 'pgSeeded', 'hr.v', 'sng.v', 'ee.v', 'cons.v', 'fnl.v', 'mcit.v', 'acct.v', 'perf.v']);

// Collections that always exist in a saved prototype db. Everything else is created by the prototype on first use
// (a lazily seeded store, routines, programs, pins) and must stay absent until then.
const ALWAYS = new Set(['people', 'tasks', 'offers', 'projects', 'milestones', 'blockers', 'decisions', 'meetings', 'unavailable', 'gbusy', 'resources', 'updates', 'changes']);

const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
function put(o, path, value) {
  const ks = path.split('.');
  ks.slice(0, -1).reduce((a, k) => (a[k] = a[k] || {}), o)[ks[ks.length - 1]] = value;
}
const storeOf = source => (source.includes('.') ? source.split('.')[0] : null);

export function decompose(db) {
  const out = {};
  for (const t of ALL_TABLES) {
    const v = get(db, t.source);
    const rows = [];
    if (v !== undefined && v !== null) {
      if (t.keyed) {
        Object.keys(v).forEach((k, i) => rows.push({id: k, pos: i, doc: t.wrap ? {[t.wrap]: v[k]} : v[k]}));
      } else {
        if (!Array.isArray(v)) throw new Error(`${t.source} should be a list`);
        const key = t.idField || 'id';
        v.forEach((item, i) => {
          if (t.positional) { rows.push({id: String(i).padStart(6, '0'), pos: i, doc: item}); return; }
          if (item == null || item[key] == null || item[key] === '') throw new Error(`${t.source}[${i}] has no ${key}`);
          rows.push({id: String(item[key]), pos: i, doc: item});
        });
      }
    }
    out[t.name] = rows;
  }
  const values = [];
  VALUES.forEach((path, i) => {
    const v = get(db, path);
    if (v === undefined) return;
    values.push({id: path, pos: i, doc: SCALAR_VALUES.has(path) ? {value: v} : v});
  });
  out[VALUES_TABLE] = values;
  return out;
}

export function compose(rowsByTable) {
  const db = {};
  const values = new Map((rowsByTable[VALUES_TABLE] || []).map(r => [r.id, r.doc]));
  const valueOf = path => (values.has(path) ? (SCALAR_VALUES.has(path) ? values.get(path).value : values.get(path)) : undefined);
  for (const path of VALUES) { const v = valueOf(path); if (v !== undefined) put(db, path, v); }
  for (const t of ALL_TABLES) {
    const rows = [...(rowsByTable[t.name] || [])].sort((a, b) => a.pos - b.pos || (a.id < b.id ? -1 : 1));
    const store = storeOf(t.source);
    const present = ALWAYS.has(t.name) || rows.length > 0 || (store ? values.has(`${store}.v`) : false)
      || (t.name === 'routines' && values.has('rmSeeded')) || (t.name === 'programs' && values.has('pgSeeded'));
    if (!present) continue;
    if (t.keyed) {
      const obj = {};
      rows.forEach(r => { obj[r.id] = t.wrap ? r.doc[t.wrap] : r.doc; });
      put(db, t.source, obj);
    } else {
      put(db, t.source, rows.map(r => r.doc));
    }
  }
  return db;
}

// Everything in a db that no table or value covers. Must be empty, otherwise data would be lost on migration.
export function uncovered(db) {
  const covered = new Set([...ALL_TABLES.map(t => t.source), ...VALUES]);
  const stores = new Set(ALL_TABLES.map(t => storeOf(t.source)).filter(Boolean).concat(VALUES.map(storeOf).filter(Boolean)));
  const missing = [];
  for (const k of Object.keys(db)) {
    if (covered.has(k)) continue;
    if (stores.has(k) && db[k] && typeof db[k] === 'object') {
      for (const k2 of Object.keys(db[k])) {
        const p = `${k}.${k2}`;
        const nested = [...covered].some(c => c.startsWith(p + '.'));
        if (!covered.has(p) && !nested) missing.push(p);
      }
    } else missing.push(k);
  }
  return missing;
}

// Foreign keys that the data would break. Used before the migration is applied.
export function fkViolations(rowsByTable) {
  const ids = Object.fromEntries(Object.entries(rowsByTable).map(([n, rows]) => [n, new Set(rows.map(r => r.id))]));
  const bad = [];
  for (const t of TABLES) {
    for (const [col, target] of Object.entries(t.fk || {})) {
      const key = typeof t.cols[col] === 'string' && t.cols[col] !== 't' ? t.cols[col] : Array.isArray(t.cols[col]) ? t.cols[col][0] : col;
      for (const r of rowsByTable[t.name] || []) {
        const v = r.doc[key];
        if (v != null && v !== '' && !(ids[target] && ids[target].has(String(v)))) bad.push(`${t.name}.${col} -> ${target}: ${r.id} has "${v}"`);
      }
    }
  }
  return bad;
}
