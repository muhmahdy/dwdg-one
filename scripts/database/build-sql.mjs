// Generates the SQL and table lists from database/schema/schema-spec.mjs.
//   node scripts/database/build-sql.mjs            write the files
// Run it again after editing schema-spec.mjs. The generated SQL is committed so it can be read and reviewed.
//
// Two sets of output, both from the same spec:
//   legacy       database/migrations/*_workspace_tables.sql and *_load_and_save.sql: one database holds everything.
//                Still what the app uses today; unchanged by the hub-and-spoke split.
//   hub + spokes database/hub/migrations/ and database/spoke/<division>/migrations/: the same tables split over one hub
//                project and six division projects (.planning/ERP-MULTI-SUPABASE-MIGRATION-PLAN.md, stage H1).

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DIVISIONS, TABLES, VALUES, VALUE_LOCKED, HUB, SPOKES, HOMES, homeOfTable, tablesOf, valuesOf, lockedValuesOf} from '../../database/schema/schema-spec.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '../../database');
const q = s => `'${String(s).replace(/'/g, "''")}'`;
const write = (file, text) => { fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, text); };

function column(name, spec) {
  const [key, kind] = Array.isArray(spec) ? spec : [spec === 't' ? name : spec, 't'];
  const expr = kind === 'b' ? `(doc->>${q(key)})::boolean` : name === 'email' ? `lower(doc->>${q(key)})` : `doc->>${q(key)}`;
  return {name, key, type: kind === 'b' ? 'boolean' : 'text', expr};
}

// policies: true  -> hub and legacy: row level security with the table's rules.
// policies: false -> spokes: row level security on and NO policy (nothing but the service role can reach the table; the
//                    server in front of the spokes decides who may see which row).
function tableSql(t, {policies = true} = {}) {
  const cols = Object.entries(t.cols).map(([n, s]) => column(n, s));
  const lines = [
    '  id text primary key',
    '  pos integer not null default 0',
    '  doc json not null',
    ...cols.map(c => `  ${c.name} ${c.type} generated always as (${c.expr}) stored`),
    '  updated_at timestamptz not null default now()',
    '  updated_by uuid',
    `  constraint ${t.name}_id_matches_doc check (doc->>'id' is null or doc->>'id' = id)`,
  ];
  const read = `(${t.read})`;
  const w = k => `(${t[k] || t.write || t.read})`;
  const out = [];
  out.push(`-- ${t.name}  <-  db.${t.source}${t.keyed ? ' (object keyed by id)' : ''}`);
  out.push(`create table public.${t.name} (\n${lines.join(',\n')}\n);`);
  cols.filter(c => c.type === 'text').forEach(c => out.push(`create index ${t.name}_${c.name}_idx on public.${t.name} (${c.name});`));
  (t.gin || []).forEach((e, i) => out.push(`create index ${t.name}_doc_gin${i} on public.${t.name} using gin (${e});`));
  out.push(`create trigger ${t.name}_touch before update on public.${t.name} for each row execute function app.touch();`);
  out.push(`alter table public.${t.name} enable row level security;`);
  if (policies) {
    out.push(`create policy ${t.name}_select on public.${t.name} for select to authenticated using (app.me_active() and ${read});`);
    out.push(`create policy ${t.name}_insert on public.${t.name} for insert to authenticated with check (app.can_write() and ${w('ins')});`);
    out.push(`create policy ${t.name}_update on public.${t.name} for update to authenticated using (app.can_write() and ${w('upd')}) with check (app.can_write() and ${w('upd')});`);
    out.push(`create policy ${t.name}_delete on public.${t.name} for delete to authenticated using (app.can_write() and ${w('del')});`);
    out.push(`grant select, insert, update, delete on public.${t.name} to authenticated, service_role;`);
  } else {
    out.push(`revoke all on public.${t.name} from anon, authenticated;`);
    out.push(`grant select, insert, update, delete on public.${t.name} to service_role;`);
  }
  out.push('');
  return out.join('\n');
}

// Foreign keys are added after all tables exist (a table can point at one created later in the file).
// `keep` decides which keys a given database can hold (a key may not point into another project).
const fkAll = list => list.flatMap(t => Object.entries(t.fk || {}).map(([col, target]) => ({table: t.name, col, target})));
const fkStatements = list => list.map(({table, col, target}) =>
  `alter table public.${table} add constraint ${table}_${col}_fk foreign key (${col}) references public.${target} (id) deferrable initially deferred;`).join('\n');

const valuesSql = locked => {
  const l = locked.map(q).join(', ');
  const guard = `(id not in (${l}) or app.is_top_or_admin())`;
  return `-- store_values  <-  single values of db (version numbers, switches, grant lists, numbering policy)
create table public.store_values (
  id text primary key,
  pos integer not null default 0,
  doc json not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create trigger store_values_touch before update on public.store_values for each row execute function app.touch();
alter table public.store_values enable row level security;
create policy store_values_select on public.store_values for select to authenticated using (app.me_active());
create policy store_values_insert on public.store_values for insert to authenticated with check (app.can_write() and ${guard});
create policy store_values_update on public.store_values for update to authenticated using (app.can_write() and ${guard}) with check (app.can_write() and ${guard});
create policy store_values_delete on public.store_values for delete to authenticated using (app.can_write() and ${guard});
grant select, insert, update, delete on public.store_values to authenticated, service_role;
`;
};

// load_workspace / apply_changes / import_workspace / app.apply_rows for a given list of tables.
const loadSaveSql = (allowedTables, intro) => {
  const allowed = allowedTables.map(q).join(', ');
  return `${intro}

-- load_workspace(): { table: [ {id, pos, doc}, ... ] } for every table, in the prototype's list order.
create function public.load_workspace() returns json language plpgsql stable set search_path = '' as $$
declare
  t text;
  rows json;
  parts text[] := '{}';
begin
  foreach t in array array[${allowed}] loop
    execute format('select coalesce(json_agg(json_build_object(''id'', id, ''pos'', pos, ''doc'', doc) order by pos, id), ''[]''::json) from public.%I', t) into rows;
    parts := parts || (to_json(t)::text || ':' || rows::text);
  end loop;
  return ('{' || array_to_string(parts, ',') || '}')::json;
end $$;

-- apply_changes(p): p is JSON text: { table: { "upsert": [ {id, pos, doc}, ... ], "delete": [ id, ... ] }, ... }
-- Text (not json) so that nothing between the app and the table can reorder the keys inside a record.
-- All tables in one transaction: either everything is saved or nothing is. Returns { table: { upserted, deleted } }.
create function public.apply_changes(p text) returns json language plpgsql set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  return app.apply_rows(p::json);
end $$;

-- import_workspace(p): the same, for the data-move script. Only the service role may call it (no sign-in needed).
create function public.import_workspace(p text) returns json language plpgsql set search_path = '' as $$
begin
  return app.apply_rows(p::json);
end $$;

create function app.apply_rows(p json) returns json language plpgsql set search_path = '' as $$
declare
  allowed text[] := array[${allowed}];
  t text;
  spec json;
  ids text[];
  left_over integer;
  res jsonb := '{}'::jsonb;
  up integer;
  del integer;
begin
  for t, spec in select key, value from json_each(p) loop
    if not (t = any (allowed)) then raise exception 'Unknown table %', t using errcode = '22023'; end if;
    up := 0; del := 0;
    if spec->'delete' is not null and json_typeof(spec->'delete') = 'array' then
      select coalesce(array_agg(x), '{}') into ids from json_array_elements_text(spec->'delete') x;
      execute format('delete from public.%I where id = any ($1)', t) using ids;
      get diagnostics del = row_count;
      -- Rows that are visible but were not deleted were refused by a policy: report it instead of silently keeping them.
      execute format('select count(*) from public.%I where id = any ($1)', t) into left_over using ids;
      if left_over > 0 then raise exception 'Not allowed to delete % row(s) of %', left_over, t using errcode = '42501'; end if;
    end if;
    if spec->'upsert' is not null and json_typeof(spec->'upsert') = 'array' then
      execute format(
        'insert into public.%I as x (id, pos, doc) select r->>''id'', coalesce((r->>''pos'')::integer, 0), r->''doc'' from json_array_elements($1) r '
        'on conflict (id) do update set pos = excluded.pos, doc = excluded.doc '
        'where x.doc::text is distinct from excluded.doc::text or x.pos is distinct from excluded.pos', t) using spec->'upsert';
      get diagnostics up = row_count;
    end if;
    res := res || jsonb_build_object(t, jsonb_build_object('upserted', up, 'deleted', del));
  end loop;
  return res::json;
end $$;

revoke all on function public.load_workspace() from public, anon;
revoke all on function public.apply_changes(text) from public, anon;
revoke all on function public.import_workspace(text) from public, anon, authenticated;
revoke all on function app.apply_rows(json) from public, anon;
grant execute on function public.load_workspace() to authenticated, service_role;
grant execute on function public.apply_changes(text) to authenticated;
grant execute on function public.import_workspace(text) to service_role;
grant execute on function app.apply_rows(json) to authenticated, service_role;
`;
};

// =====================================================================================================
// Legacy: one database. Migrations 2 and 3, tables.json and the frontend's typed table list.
// =====================================================================================================
const tables = ['people', ...TABLES.map(t => t.name), 'store_values'];

const header2 = `-- DWDG'ONE on Supabase, migration 2 of 3: workspace tables, indexes and row level security.
-- GENERATED by scripts/database/build-sql.mjs from database/schema/schema-spec.mjs. Edit the spec, not this file.
--
-- Every table has: id (the prototype's own id), pos (position in the prototype's list), doc (the record, json so key order is kept),
-- generated columns (copies of a few doc fields used for foreign keys, indexes and security), updated_at / updated_by.
-- Row level security is on for every table. Rules (also listed in database/policies/RLS_RULES.md):
--   select  : signed-in, active person AND the table's read rule
--   insert  : the person can write (active, not Board) AND the write rule
--   update / delete likewise. The Board is read-only everywhere (screens/accounts.js).
-- Foreign keys are deferrable initially deferred, so one save can contain parent and child rows in any order.
`;
write(path.join(root, 'migrations/20261012000200_workspace_tables.sql'),
  `${header2}\n${TABLES.map(t => tableSql(t)).join('\n')}\n${valuesSql(VALUE_LOCKED)}\n-- ---------- foreign keys ----------\n${fkStatements(fkAll(TABLES))}\n`);

write(path.join(root, 'migrations/20261012000300_load_and_save.sql'), loadSaveSql(tables, `-- DWDG'ONE on Supabase, migration 3 of 3: loading and saving the whole workspace in one call each.
-- GENERATED by scripts/database/build-sql.mjs. Both functions run as the signed-in person (security invoker), so every row
-- is filtered and checked by the policies of migration 2. Nothing here can see or change more than the person could.`));

write(path.join(root, 'schema/generated/tables.json'), JSON.stringify({
  tables,
  sources: Object.fromEntries([['people', 'people'], ...TABLES.map(t => [t.name, t.source])]),
  values: VALUES,
}, null, 2) + '\n');

// The frontend's typed copy of the table mapping (frontend/src/lib/workspace/shape.ts reads it), so the app and the
// database can never disagree about where a record lives.
const shapeOf = t => ({name: t.name, source: t.source, ...(t.keyed ? {keyed: true} : {}), ...(t.wrap ? {wrap: t.wrap} : {}), ...(t.idField ? {idField: t.idField} : {}), ...(t.positional ? {positional: true} : {})});
write(path.join(here, '../../frontend/src/lib/workspace/tables.generated.ts'), `// GENERATED by scripts/database/build-sql.mjs from database/schema/schema-spec.mjs. Do not edit.
import type { TableShape } from './shape-types';

export const TABLES: readonly TableShape[] = ${JSON.stringify([{name: 'people', source: 'people'}, ...TABLES.map(shapeOf)], null, 2)};

export const VALUES: readonly string[] = ${JSON.stringify(VALUES)};

export const VALUES_TABLE = 'store_values';
`);

// =====================================================================================================
// Hub and spokes.
// =====================================================================================================
const STAMP = '20261017';
const hubDir = path.join(root, 'hub/migrations');
const spokeDir = slug => path.join(root, `spoke/${slug}/migrations`);

// --- partition.json: where every table and stored value lives, and which foreign keys had to go ---
const dropped = [];
const keptFk = home => fkAll(tablesOf(home)).filter(f => {
  const ok = homeOfTable(f.target) === home;
  if (!ok) dropped.push({...f, from: home, to: homeOfTable(f.target)});
  return ok;
});
const fkByHome = Object.fromEntries(HOMES.map(h => [h, keptFk(h)]));
write(path.join(root, 'schema/generated/partition.json'), JSON.stringify({
  homes: Object.fromEntries(HOMES.map(h => [h, {
    tables: [...(h === HUB ? ['people'] : []), ...tablesOf(h).map(t => t.name), 'store_values'],
    values: valuesOf(h),
  }])),
  droppedForeignKeys: dropped,
}, null, 2) + '\n');

// --- hub migration 1: the legacy foundation, minus what only the HR spoke needs ---
const legacyFoundation = fs.readFileSync(path.join(root, 'migrations/20261012000100_foundation.sql'), 'utf8').replace(/\r\n/g, '\n');
const hrReviews = /-- A person's assessment can be read by the reviewer named for them in the cycle roster\.\ncreate function app\.hr_reviews[\s\S]*?\nend \$\$;\n\n/;
if (!hrReviews.test(legacyFoundation)) throw new Error('foundation.sql changed: update the hr_reviews cut in build-sql.mjs');
const hubFoundation = legacyFoundation
  .replace(hrReviews, '')
  .replace(/^-- DWDG'ONE on Supabase, migration 1 of 3: foundation\.\n/, `-- DWDG'ONE hub, migration 1: foundation. GENERATED by scripts/database/build-sql.mjs from migrations/20261012000100_foundation.sql
-- (the single-database foundation) without app.hr_reviews, which reads an HR table that lives in the HR project.
`);
if (hubFoundation.includes('create function app.hr_reviews')) throw new Error('hub foundation still mentions hr_reviews');
write(path.join(hubDir, `${STAMP}000100_hub_foundation.sql`), hubFoundation);

// --- hub migration 2: the tables the hub keeps, with the same row level security as today ---
const hubTables = tablesOf(HUB);
write(path.join(hubDir, `${STAMP}000200_hub_tables.sql`), `-- DWDG'ONE hub, migration 2: core work, accounts and authority, performance, global values.
-- GENERATED by scripts/database/build-sql.mjs from database/schema/schema-spec.mjs. Edit the spec, not this file.
-- Same shape and the same row level security as the single-database migration 2, for the tables whose home is the hub.
-- The division tables (hr_, sng_, ee_, cons_, fnl_, mcit_) live in the division projects; see database/spoke/.
-- Foreign keys are deferrable initially deferred, so one save can contain parent and child rows in any order.
\n${hubTables.map(t => tableSql(t)).join('\n')}\n${valuesSql(lockedValuesOf(HUB))}\n-- ---------- foreign keys ----------\n${fkStatements(fkByHome[HUB])}\n`);

// --- hub migration 3: load and save for the hub's tables ---
write(path.join(hubDir, `${STAMP}000300_hub_load_and_save.sql`), loadSaveSql(['people', ...hubTables.map(t => t.name), 'store_values'], `-- DWDG'ONE hub, migration 3: loading and saving the hub's tables in one call each.
-- GENERATED by scripts/database/build-sql.mjs. Both functions run as the signed-in person (security invoker), so every row
-- is filtered and checked by the policies of migration 2. The server in front of the division projects passes the person's own
-- token to these two functions, so the hub keeps enforcing its rules exactly as before.`));

// --- one migration per division: the same standard base (database/spoke/base) plus that division's tables ---
for (const slug of SPOKES) {
  const list = tablesOf(slug);
  const sql = `-- DWDG'ONE division project "${slug}", migration 2: the ${slug} tables.
-- GENERATED by scripts/database/build-sql.mjs from database/schema/schema-spec.mjs. Edit the spec, not this file.
-- Runs after database/spoke/base (the base is identical in every division project).
-- Row level security is on with NO policy: the browser's keys can read nothing here. Only the service role, held by the server,
-- reaches these tables, and the server applies the access rules. Foreign keys stay inside this division; a column that used to
-- point at another division's table keeps the id as plain text.

${list.map(t => tableSql(t, {policies: false})).join('\n')}
-- ---------- foreign keys ----------
${fkStatements(fkByHome[slug])}

-- ---------- let load_rows / apply_rows reach these tables, and record the schema version ----------
insert into public.row_tables (name) values ${list.map(t => `(${q(t.name)})`).join(', ')} on conflict do nothing;
update public.schema_meta set version = 2, updated_at = now();
`;
  write(path.join(spokeDir(slug), `${STAMP}000200_${slug}_tables.sql`), sql);
}

// --- the server's typed copy of the partition (server/src/lib/... reads it), so the server and the database cannot disagree ---
const tableHome = Object.fromEntries(['people', ...TABLES.map(t => t.name)].map(n => [n, homeOfTable(n)]));
write(path.join(here, '../../server/src/generated/partition.ts'), `// GENERATED by scripts/database/build-sql.mjs from database/schema/schema-spec.mjs. Do not edit.
// Where every table lives: the hub or one of the six division projects. \`store_values\` is in every project; which one a row
// belongs to follows its id (see homeOfValue).

export const HUB = 'hub' as const;
export const DIVISION_IDS = ${JSON.stringify(SPOKES)} as const;
export type DivisionId = (typeof DIVISION_IDS)[number];
export type Home = typeof HUB | DivisionId;

export const DIVISION_NAMES: Readonly<Record<DivisionId, string>> = ${JSON.stringify(Object.fromEntries(DIVISIONS.map(d => [d[0], d[1]])), null, 2)};

export const VALUES_TABLE = 'store_values';

/** Stored values only the President, the Vice President or an Admin may change (the policy guard of store_values). */
export const LOCKED_VALUES: readonly string[] = ${JSON.stringify(VALUE_LOCKED)};

/** Home of every data table (\`people\` included, \`store_values\` excluded). */
export const TABLE_HOME: Readonly<Record<string, Home>> = ${JSON.stringify(tableHome, null, 2)};

/** Home of a stored value by its id: \`fnl.grants\` belongs to fnl, \`lookV\` to the hub. */
export function homeOfValue(id: string): Home {
  const prefix = id.split('.')[0] ?? '';
  return id.includes('.') && (DIVISION_IDS as readonly string[]).includes(prefix) ? (prefix as DivisionId) : HUB;
}
`);

// --- hub smoke test: the single-database smoke test without the checks about division tables, plus the hub's own checks ---
// Derived, so it cannot drift from database/tests/rls_smoke.sql. A "unit" is a whole `select t.check(...)` or `insert into
// public.<table>` statement; a unit that names a division table is dropped.
const divisionTable = new RegExp(`\\b(${TABLES.filter(t => t.home !== HUB).map(t => t.name).join('|')})\\b`);
function hubSmoke(sql) {
  const lines = sql.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^(select t\.check\(|insert into public\.)/.test(lines[i])) {
      let j = i;
      while (!lines[j].endsWith(');')) j++;
      if (lines.slice(i, j + 1).some(l => divisionTable.test(l))) { i = j; continue; }
    }
    out.push(lines[i]);
  }
  // fnl.grants is a division value now; the hub's locked value is acct.office.
  const text = out.join('\n').replace(/fnl\.grants/g, 'acct.office');
  const marker = '-- ---------- sign-in: invite only ----------';
  if (!text.includes(marker)) throw new Error('rls_smoke.sql changed: update the marker in build-sql.mjs');
  const extra = fs.readFileSync(path.join(root, 'tests/rls_smoke_hub_extra.sql'), 'utf8').replace(/\r\n/g, '\n');
  return `-- Hub version of rls_smoke.sql. GENERATED by scripts/database/build-sql.mjs: the same checks without the ones about division tables
-- (those tables live in the division projects now), plus checks for division_progress and audit_log (rls_smoke_hub_extra.sql).
--   psql "$HUB_DATABASE_URL" -f database/tests/rls_smoke_hub.sql     (scratch hub project only, never production)
${text.replace(marker, `${extra}${marker}`).replace(/^-- Row level security smoke test\./, '-- Row level security smoke test.')}`;
}
write(path.join(root, 'tests/rls_smoke_hub.sql'), hubSmoke(fs.readFileSync(path.join(root, 'tests/rls_smoke.sql'), 'utf8').replace(/\r\n/g, '\n')));

console.log(`legacy: ${tables.length} tables (people + ${TABLES.length} + store_values), ${VALUES.length} stored values`);
console.log(`hub: ${hubTables.length + 2} tables; spokes: ${SPOKES.map(s => `${s} ${tablesOf(s).length}`).join(', ')}; dropped foreign keys: ${dropped.map(d => `${d.table}.${d.col}`).join(', ') || 'none'}`);
