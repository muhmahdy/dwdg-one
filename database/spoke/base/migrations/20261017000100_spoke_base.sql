-- DWDG'ONE division project (spoke), migration 1: the standard base. IDENTICAL in all six division projects.
-- Hand-written (not generated). The tables of a division come in migration 2 (generated, one file per division).
--
-- Security model: every table here has row level security ON and NO policy, and no grant to the browser's roles. The only
-- caller is the server in front of the division projects, with the service role (which skips row level security). The server
-- checks who may see which row. If a publishable key ever leaks, it still reads nothing here.

create schema if not exists app;
revoke all on schema app from public;
grant usage on schema app to service_role;

-- Version of this project's schema, and the row the keep-alive ping reads (the free tier pauses an idle project).
create table public.schema_meta (
  id integer primary key default 1 check (id = 1),
  version integer not null,
  updated_at timestamptz not null default now()
);
insert into public.schema_meta (version) values (1);

-- updated_at / updated_by on every write (same function as the single-database foundation).
create function app.touch() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;

-- The tables load_rows / apply_rows may touch. Each division's tables migration adds its tables here, so these functions are
-- the same text in every project and still cannot be pointed at a table that is not a data table.
create table public.row_tables (name text primary key);

-- Division-owned single values (version numbers, grant lists, numbering policy): the same table as in the single database.
create table public.store_values (
  id text primary key,
  pos integer not null default 0,
  doc json not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create trigger store_values_touch before update on public.store_values for each row execute function app.touch();
insert into public.row_tables (name) values ('store_values');

alter table public.schema_meta enable row level security;
alter table public.row_tables enable row level security;
alter table public.store_values enable row level security;
revoke all on public.schema_meta, public.row_tables, public.store_values from anon, authenticated;
grant select, update on public.schema_meta to service_role;
grant select, insert, delete on public.row_tables to service_role;
grant select, insert, update, delete on public.store_values to service_role;

-- load_rows(tables): { table: [ {id, pos, doc}, ... ] } in the prototype's list order, for the named tables
-- (null = all registered tables). Same output shape as the hub's load_workspace().
create function public.load_rows(p_tables text[] default null) returns json language plpgsql stable set search_path = '' as $$
declare
  t text;
  rows json;
  parts text[] := '{}';
begin
  for t in select name from public.row_tables where p_tables is null or name = any (p_tables) order by name loop
    execute format('select coalesce(json_agg(json_build_object(''id'', id, ''pos'', pos, ''doc'', doc) order by pos, id), ''[]''::json) from public.%I', t) into rows;
    parts := parts || (to_json(t)::text || ':' || rows::text);
  end loop;
  return ('{' || array_to_string(parts, ',') || '}')::json;
end $$;

-- apply_rows(p): p is JSON text: { table: { "upsert": [ {id, pos, doc}, ... ], "delete": [ id, ... ] }, ... }
-- Text (not json) so that nothing between the server and the table can reorder the keys inside a record. All tables in one
-- transaction. Idempotent: saving the same change twice leaves the same rows. Returns { table: { upserted, deleted } }.
create function public.apply_rows(p text) returns json language plpgsql set search_path = '' as $$
declare
  spec json;
  t text;
  ids text[];
  res jsonb := '{}'::jsonb;
  up integer;
  del integer;
begin
  for t, spec in select key, value from json_each(p::json) loop
    if not exists (select 1 from public.row_tables where name = t) then raise exception 'Unknown table %', t using errcode = '22023'; end if;
    up := 0; del := 0;
    if spec->'delete' is not null and json_typeof(spec->'delete') = 'array' then
      select coalesce(array_agg(x), '{}') into ids from json_array_elements_text(spec->'delete') x;
      execute format('delete from public.%I where id = any ($1)', t) using ids;
      get diagnostics del = row_count;
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

-- Only the service role may call them. (New functions are executable by everyone by default, so say no explicitly.)
revoke all on function public.load_rows(text[]) from public, anon, authenticated;
revoke all on function public.apply_rows(text) from public, anon, authenticated;
grant execute on function public.load_rows(text[]) to service_role;
grant execute on function public.apply_rows(text) to service_role;
grant execute on all functions in schema app to service_role;
revoke execute on all functions in schema app from public, anon, authenticated;
