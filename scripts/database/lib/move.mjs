// Moves a workspace into the hub and the six division projects, and proves nothing was lost. The thinking lives here; the
// command (move-data.mjs) and the tests supply the targets, so the same code runs against Supabase and against PGlite.
//
//   rows            { table: [ {id, pos, doc} ] } as decompose() gives them (all tables of the workspace)
//   partitionRows   cuts them along the hub / division line (database/schema/generated/partition.json)
//   a Target        { apply(payloadText), load(), setEmails?(map) } for ONE project: the hub or a division
//
// One project is one transaction; there is none across projects, so a run that stops half way is simply run again: saving
// is idempotent. Nothing is ever deleted by this code. Rows already in a target that are not in the source are reported.

import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {TABLES} from '../../../database/schema/schema-spec.mjs';
import {ALL_TABLES, VALUES_TABLE} from './workspace-shape.mjs';

export const PROJECTS = ['hub', 'ee', 'mcit', 'hr', 'fnl', 'sng', 'cons'];
const partition = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../../../database/schema/generated/partition.json', import.meta.url)), 'utf8'));

export const tablesOf = project => partition.homes[project].tables.filter(t => t !== VALUES_TABLE);
/** `legacy` is the single-database layout of today: every table in one project. */
export const tablesIn = project => (project === 'legacy' ? ALL_TABLES.map(t => t.name) : tablesOf(project));
const valuesHome = new Map(PROJECTS.flatMap(p => partition.homes[p].values.map(v => [v, p])));
export const homeOfValue = id => valuesHome.get(id);

/** Cuts the rows of a whole workspace into one set per project. Throws for a stored value that belongs nowhere. */
export function partitionRows(rows) {
  const out = Object.fromEntries(PROJECTS.map(p => [p, {}]));
  for (const p of PROJECTS) for (const t of tablesOf(p)) out[p][t] = rows[t] ?? [];
  for (const p of PROJECTS) out[p][VALUES_TABLE] = [];
  for (const r of rows[VALUES_TABLE] ?? []) {
    const home = homeOfValue(r.id);
    if (!home) throw new Error(`The stored value "${r.id}" belongs to no project.`);
    out[home][VALUES_TABLE].push(r);
  }
  const known = new Set([...PROJECTS.flatMap(tablesOf), VALUES_TABLE]);
  const stray = Object.keys(rows).filter(t => rows[t].length > 0 && !known.has(t));
  if (stray.length) throw new Error(`These tables belong to no project: ${stray.join(', ')}`);
  return out;
}

/** Row counts per project and table, for the check-only report. Empty tables are left out. */
export function planOf(parts) {
  return Object.fromEntries(PROJECTS.map(p => [p, Object.fromEntries(Object.entries(parts[p]).filter(([, r]) => r.length).map(([t, r]) => [t, r.length]))]));
}

/**
 * The references that cannot be kept by a foreign key any more because they cross from one project to another (today
 * sng_initiatives.project -> projects). Returns the ones that point at a record that does not exist.
 */
export function danglingCrossReferences(rows) {
  const bad = [];
  for (const d of partition.droppedForeignKeys) {
    const spec = TABLES.find(t => t.name === d.table);
    const col = spec?.cols[d.col];
    const key = Array.isArray(col) ? col[0] : col && col !== 't' ? col : d.col;
    const ids = new Set((rows[d.target] ?? []).map(r => r.id));
    for (const r of rows[d.table] ?? []) {
      const v = r.doc[key];
      if (v != null && v !== '' && !ids.has(String(v))) bad.push(`${d.table}.${d.col} -> ${d.target}: ${r.id} has "${v}", which is not in ${d.from === 'hub' ? 'the hub' : `the ${d.to} project`}`);
    }
  }
  return bad;
}

/** A row as it is compared: its id, position and record, key order included (the record is stored as JSON text, so it must come back as it went). */
export const exact = r => JSON.stringify({id: r.id, pos: r.pos, doc: r.doc});

/** What a project holds now, compared with what it should hold. Only the project's own tables are looked at. */
export function compareProject(project, sent, found) {
  const problems = [];
  const counts = {};
  for (const t of [...tablesIn(project), VALUES_TABLE]) {
    const want = new Map((sent[t] ?? []).map(r => [r.id, exact(r)]));
    const have = new Map((found[t] ?? []).map(r => [r.id, exact(r)]));
    const extra = [...have.keys()].filter(id => !want.has(id)).length;
    counts[t] = {sent: want.size, found: have.size, extra};
    if (want.size !== have.size) problems.push(`COUNT ${t}: sent ${want.size}, found ${have.size}`);
    for (const [id, text] of want) {
      if (!have.has(id)) problems.push(`MISSING ${t} ${id}`);
      else if (have.get(id) !== text) problems.push(`DIFFERENT ${t} ${id}`);
    }
    for (const id of have.keys()) if (!want.has(id)) problems.push(`EXTRA ${t} ${id}`);
  }
  return {ok: problems.length === 0, counts, problems};
}

/** Rows a target holds that the source does not have. A move never deletes, so these stay unless someone removes them. */
export function extraRows(project, sent, before) {
  const extra = [];
  for (const t of [...tablesIn(project), VALUES_TABLE]) {
    const want = new Set((sent[t] ?? []).map(r => r.id));
    for (const r of before[t] ?? []) if (!want.has(r.id)) extra.push(`${t} ${r.id}`);
  }
  return extra;
}

/**
 * Moves one project's rows: look at what the target holds, write everything in one transaction, read it back, compare.
 * Resolves to {project, ok, written, problems, extra}. With `apply: false` nothing is written (the target is only read).
 */
export async function moveProject({project, rows, target, apply, allowExtra = false, emails = null}) {
  const result = {project, ok: false, written: 0, problems: [], extra: []};
  const before = await target.load();
  result.extra = extraRows(project, rows, before);
  if (result.extra.length && !allowExtra && apply) {
    result.problems.push(`The target already holds ${result.extra.length} row(s) that the source does not have (for example ${result.extra.slice(0, 3).join(', ')}). Nothing was written. Look at them, or add --allow-extra to move anyway.`);
    return result;
  }
  const payload = Object.fromEntries([...tablesIn(project), VALUES_TABLE].filter(t => (rows[t] ?? []).length).map(t => [t, {upsert: rows[t]}]));
  if (apply) {
    if (Object.keys(payload).length) await target.apply(JSON.stringify(payload));
    result.written = Object.values(payload).reduce((n, p) => n + p.upsert.length, 0);
    if (emails && Object.keys(emails).length) {
      if (!target.setEmails) throw new Error(`The ${project} project cannot take e-mail addresses; they belong to the hub.`);
      await target.setEmails(emails);
    }
  }
  const verdict = compareProject(project, rows, apply ? await target.load() : before);
  // Rows the source does not have are reported above; they only count as a failure when the move was not told to accept them.
  // (a COUNT line that rows of the project's own, not in the source, explain is dropped with them)
  const tolerate = allowExtra || !apply;
  const explainedByExtras = line => { const m = /^COUNT (\S+): sent (\d+), found (\d+)$/.exec(line); const c = m && verdict.counts[m[1]]; return Boolean(c) && c.found - c.extra === c.sent; };
  const wanted = verdict.problems.filter(p => !(tolerate && (p.startsWith('EXTRA') || explainedByExtras(p))));
  result.problems.push(...wanted);
  result.counts = verdict.counts;
  result.ok = apply ? wanted.length === 0 : true;
  return result;
}

/** `--target hub`, `spoke:hr`, `all`, `legacy` (the single database), or a comma list of projects. */
export function parseTargets(arg) {
  if (!arg) return null;
  if (arg === 'all') return [...PROJECTS];
  if (arg === 'legacy') return ['legacy'];
  const list = arg.split(',').map(s => s.trim()).filter(Boolean).map(s => (s.startsWith('spoke:') ? s.slice(6) : s));
  const bad = list.filter(p => !PROJECTS.includes(p));
  if (!list.length || bad.length) throw new Error(`Unknown target: ${bad.join(', ') || arg}. Use hub, spoke:<ee|mcit|hr|fnl|sng|cons>, a comma list, all, or legacy.`);
  return [...new Set(list)];
}

/** The URL and service key of a project: SUPABASE_URL_<P> and SUPABASE_SERVICE_KEY_<P>; the hub also answers to the old SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. */
export function credentialsFor(project, env) {
  const P = project.toUpperCase();
  const old = project === 'hub' || project === 'legacy'; // the old names stay valid for the hub and for the single database
  const url = env[`SUPABASE_URL_${P}`] || (old ? env.SUPABASE_URL : undefined);
  const key = env[`SUPABASE_SERVICE_KEY_${P}`] || (old ? env.SUPABASE_SERVICE_ROLE_KEY : undefined);
  if (!url || !key) throw new Error(`Set SUPABASE_URL_${P} and SUPABASE_SERVICE_KEY_${P}${old ? ' (or the old SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)' : ''} in scripts/.env.local.`);
  return {url: url.replace(/\/+$/, ''), key};
}

/** Two projects must never share an address: that would put one division's data into another project. */
export function assertDistinctProjects(creds) {
  const seen = new Map();
  for (const [project, {url}] of Object.entries(creds)) {
    if (seen.has(url)) throw new Error(`The ${project} project and the ${seen.get(url)} project have the same address (${new URL(url).hostname}). Check scripts/.env.local.`);
    seen.set(url, project);
  }
}

/** A target that talks to a real Supabase project with its service key. The hub uses import_workspace / load_workspace, a division apply_rows / load_rows. */
export async function supabaseTarget(project, {url, key}) {
  const {createClient} = await import('@supabase/supabase-js');
  const client = createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}});
  const hub = project === 'hub' || project === 'legacy'; // the hub and the single database answer to the same functions
  const call = async (fn, args) => {
    const {data, error} = await client.rpc(fn, args);
    if (error) throw new Error(`${project}: ${fn} failed: ${error.message}`);
    return data;
  };
  return {
    apply: payload => call(hub ? 'import_workspace' : 'apply_rows', {p: payload}),
    load: async () => {
      const all = await call(hub ? 'load_workspace' : 'load_rows', hub ? undefined : {p_tables: null});
      return all ?? {};
    },
    setEmails: async map => {
      for (const [id, email] of Object.entries(map)) {
        const r = await client.from('people').update({email: String(email).trim().toLowerCase()}).eq('id', id);
        if (r.error) throw new Error(`Could not set the e-mail of ${id}: ${r.error.message}`);
      }
    },
  };
}
