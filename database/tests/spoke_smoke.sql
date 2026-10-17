-- Division project (spoke) smoke test. Plain SQL. Runs inside one transaction and rolls back at the end.
--   psql "$SPOKE_DATABASE_URL" -f database/tests/spoke_smoke.sql     (a scratch or new division project, never one holding real data)
-- Run it after the base migration and that division's tables migration. It works for any division: it reads the list of
-- tables from public.row_tables. Prints one line per check; raises at the end if any check failed.
--
-- What it proves: the browser's roles (anon, authenticated) can read and write nothing here, not even through load_rows /
-- apply_rows, while the service role (held only by the server) can save, load, repeat a save harmlessly and delete.

begin;
create schema t;
create table t.log (n serial, label text, ok boolean);
grant usage on schema t to public;
grant all on all tables in schema t to public;
grant all on all sequences in schema t to public;

create function t.check(label text, ok boolean) returns void language sql as $$ insert into t.log (label, ok) values (label, coalesce(ok, false)) $$;
grant execute on function t.check(text, boolean) to public;

-- true when `q`, run as `r`, is refused for lack of privilege (not for any other reason).
create function t.denied(r text, q text) returns boolean language plpgsql as $$
begin
  execute format('set local role %I', r);
  begin
    execute q;
  exception when insufficient_privilege then
    reset role; return true;
  end;
  reset role; return false;
end $$;
grant execute on function t.denied(text, text) to public;

-- ---------- the browser's roles get nothing ----------
do $$
declare r text; tbl text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    for tbl in select name from public.row_tables union select 'row_tables' union select 'schema_meta' loop
      perform t.check(r || ' cannot read ' || tbl, t.denied(r, format('select 1 from public.%I', tbl)));
      perform t.check(r || ' cannot write ' || tbl, t.denied(r, format('insert into public.%I default values', tbl)));
    end loop;
    perform t.check(r || ' cannot call load_rows', t.denied(r, 'select public.load_rows()'));
    perform t.check(r || ' cannot call apply_rows', t.denied(r, $q$select public.apply_rows('{}')$q$));
  end loop;
end $$;

-- ---------- the service role does the work ----------
set local role service_role;
do $$
declare
  first_table text := (select name from public.row_tables where name <> 'store_values' order by name limit 1);
  res json;
  loaded json;
  doc text := '{"id":"r1","zeta":1,"alpha":[3,2,1],"name":"x"}';
  refused boolean;
begin
  res := public.apply_rows(json_build_object(first_table, json_build_object('upsert', json_build_array(json_build_object('id', 'r1', 'pos', 0, 'doc', doc::json))))::text);
  perform t.check('first save upserts one row in ' || first_table, (res->first_table->>'upserted') = '1');
  res := public.apply_rows(json_build_object(first_table, json_build_object('upsert', json_build_array(json_build_object('id', 'r1', 'pos', 0, 'doc', doc::json))))::text);
  perform t.check('the same save again changes nothing', (res->first_table->>'upserted') = '0');
  loaded := public.load_rows(array[first_table]);
  perform t.check('load_rows returns the row with its key order kept', (loaded->first_table->0->'doc')::text = doc);
  perform t.check('load_rows without a list returns every registered table', (select count(*) from json_object_keys(public.load_rows())) = (select count(*) from public.row_tables));
  res := public.apply_rows(json_build_object(first_table, json_build_object('delete', json_build_array('r1', 'missing')))::text);
  perform t.check('delete removes the row and ignores a missing id', (res->first_table->>'deleted') = '1');
  refused := false;
  begin perform public.apply_rows('{"pg_user":{"delete":["x"]}}'); exception when others then refused := true; end;
  perform t.check('apply_rows refuses a table that is not registered', refused);
  refused := false;
  begin perform public.apply_rows('{"row_tables":{"delete":["store_values"]}}'); exception when others then refused := true; end;
  perform t.check('apply_rows cannot touch the registry itself', refused);
  refused := false;
  begin perform public.apply_rows(json_build_object(first_table, json_build_object('upsert', json_build_array(json_build_object('id', 'a', 'pos', 0, 'doc', json_build_object('id', 'b')))))::text); exception when others then refused := true; end;
  perform t.check('a record whose id differs from its row id is refused', refused);
end $$;
reset role;

select t.check('the schema version is 2 (base 1, division tables 2)', (select version from public.schema_meta) = 2);

select n, ok, label from t.log order by n;
do $$ begin
  if exists (select 1 from t.log where not ok) then
    raise exception 'Spoke smoke test failed: %', (select string_agg(label, '; ') from t.log where not ok);
  end if;
end $$;
rollback;
