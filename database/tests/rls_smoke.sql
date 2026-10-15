-- Row level security smoke test. Plain SQL, no extension needed. Runs inside one transaction and rolls back at the end.
--   psql "$DATABASE_URL" -f supabase/tests/rls_smoke.sql        (against a scratch / local Supabase database, never production)
-- Prints one line per check: ok = true means the policy behaves as the prototype's rule says. Raises at the end if any check failed.
-- It creates its own small cast of people (an admin, the President, a VP, directors and members of several divisions, a Board
-- account, a pending person) and a few rows, then looks at the data "as" each of them.

begin;
create schema t;
create table t.log (n serial, label text, ok boolean);

create function t.uid(p text) returns uuid language sql immutable as $$ select md5('dwdg-test-' || p)::uuid $$;
create function t.as_user(p text) returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', t.uid(p)::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', t.uid(p), 'email', p || '@dwdg.test')::text, true);
  set local role authenticated;
end $$;
create function t.as_anon() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
end $$;
create function t.n(q text) returns integer language plpgsql as $$
declare c integer;
begin execute 'select count(*) from (' || q || ') s' into c; return c; end $$;
create function t.affected(q text) returns integer language plpgsql as $$
declare c integer;
begin execute q; get diagnostics c = row_count; return c; end $$;
create function t.fails(q text) returns boolean language plpgsql as $$
begin execute q; return false; exception when others then return true; end $$;
create function t.check(label text, ok boolean) returns void language sql as $$ insert into t.log (label, ok) values (label, coalesce(ok, false)) $$;
grant usage on schema t to public;
grant all on all tables in schema t to public;
grant all on all sequences in schema t to public;
grant execute on all functions in schema t to public;

-- ---------- cast ----------
create function t.person(p text, d text, r text, adm boolean default false, st text default 'active') returns void language plpgsql as $$
begin
  insert into auth.users (id, email) values (t.uid(p), p || '@dwdg.test');
  insert into public.people (id, pos, doc, auth_user_id, email)
  values (p, 0, json_build_object('id', p, 'name', p, 'first', p, 'div', d, 'role', r, 'admin', adm, 'board', r = 'board', 'status', st), t.uid(p), p || '@dwdg.test');
end $$;
select t.person('adm', 'sng', 'director', true);
select t.person('pres', null, 'president');
select t.person('vpx', null, 'vp');
select t.person('dir_ee', 'ee', 'director');
select t.person('mem_ee', 'ee', 'member');
select t.person('mem_ee2', 'ee', 'member');
select t.person('mem_fnl', 'fnl', 'member');
select t.person('hr_dir', 'hr', 'director');
select t.person('hr_mem', 'hr', 'member');
select t.person('brd', null, 'board');
select t.person('newbie', 'ee', 'member', false, 'pending');

-- ---------- rows (inserted as the owner of the database, like the data-move script) ----------
insert into public.projects (id, doc) values
  ('p_ee',  '{"id":"p_ee","div":"ee","stage":"active","org":false,"lead":"dir_ee","team":[]}'),
  ('p_fnl', '{"id":"p_fnl","div":"fnl","stage":"active","org":false,"lead":null,"team":[]}'),
  ('p_org', '{"id":"p_org","div":"sng","stage":"active","org":true,"team":[]}'),
  ('p_joint','{"id":"p_joint","div":"fnl","stage":"active","org":false,"team":[{"id":"mem_ee","state":"joined"}]}');
insert into public.tasks (id, doc) values
  ('t_ee',  '{"id":"t_ee","div":"ee","owner":"mem_ee","project":"p_ee","status":"todo","assignees":[]}'),
  ('t_fnl', '{"id":"t_fnl","div":"fnl","owner":"mem_fnl","project":"p_fnl","status":"todo","assignees":[]}');
insert into public.fnl_legal (id, doc) values
  ('l_ee',  '{"id":"l_ee","requester":"mem_ee","unit":"ee","stage":"new"}'),
  ('l_fnl', '{"id":"l_fnl","requester":"mem_fnl","unit":"fnl","stage":"new"}');
insert into public.hr_cycles (id, doc) values ('cy1', '{"id":"cy1","state":"open","roster":[{"p":"mem_ee","reviewer":"dir_ee"}]}');
insert into public.hr_assessments (id, doc) values
  ('as_ee', '{"id":"as_ee","cycle":"cy1","person":"mem_ee","state":"open"}'),
  ('as_hr', '{"id":"as_hr","cycle":"cy1","person":"hr_mem","state":"open"}');
insert into public.hr_registers (id, doc) values ('rg1', '{"id":"rg1","unit":"ee","meeting":"m1"}');
insert into public.ee_orgs (id, doc) values ('org1', '{"id":"org1","name":"Client"}');
insert into public.mcit_it (id, doc) values ('it1', '{"id":"it1","requester":"mem_ee","unit":"ee","stage":"new"}');
insert into public.updates (id, doc) values
  ('u_ee',  '{"id":"u_ee","to":"mem_ee","type":"x","actor":"adm"}'),
  ('u_dir', '{"id":"u_dir","to":"dir_ee","type":"x","actor":"adm"}');
insert into public.store_values (id, doc) values ('fnl.grants', '{"legal":[]}'), ('lookV', '{"value":3}');
insert into public.acct_invites (id, doc) values
  ('inv1', '{"id":"inv1","name":"Invitee One","email":"invitee@dwdg.test","div":"ee","role":"member","state":"pending","expires":"2999-01-01","person":null}'),
  ('inv2', '{"id":"inv2","name":"Old","email":"old@dwdg.test","div":"ee","role":"member","state":"revoked","expires":"2999-01-01","person":null}');

-- ---------- projects and work ----------
select t.as_user('mem_ee');
select t.check('member sees own division project, organisation project and a joint project they joined',
  t.n($q$select 1 from public.projects where id in ('p_ee','p_org','p_joint')$q$) = 3);
select t.check('member does not see another division''s project', t.n($q$select 1 from public.projects where id = 'p_fnl'$q$) = 0);
select t.check('member sees own task, not another division''s task', t.n('select 1 from public.tasks') = 1);
select t.as_user('mem_fnl');
select t.check('FnL member sees FnL project + organisation project, not the EE project',
  t.n($q$select 1 from public.projects where id in ('p_fnl','p_org','p_joint')$q$) = 3 and t.n($q$select 1 from public.projects where id = 'p_ee'$q$) = 0);
select t.as_user('vpx');
select t.check('VP sees all projects and all tasks', t.n('select 1 from public.projects') = 4 and t.n('select 1 from public.tasks') = 2);
select t.as_user('adm');
select t.check('Admin sees all projects', t.n('select 1 from public.projects') = 4);
select t.as_user('brd');
select t.check('Board can read projects', t.n('select 1 from public.projects') = 4);
select t.check('Board cannot write ("Board accounts are read-only")',
  t.fails($q$insert into public.tasks (id, doc) values ('t_b', '{"id":"t_b","div":"ee","owner":"brd"}')$q$));

-- ---------- creating projects (canCreateProject: rank 2+ in a division they see) ----------
select t.as_user('mem_ee');
select t.check('member cannot create a project', t.fails($q$insert into public.projects (id, doc) values ('p_new1','{"id":"p_new1","div":"ee","org":false}')$q$));
select t.as_user('dir_ee');
select t.check('director creates a project in own division', not t.fails($q$insert into public.projects (id, doc) values ('p_new2','{"id":"p_new2","div":"ee","org":false}')$q$));
select t.check('director cannot create a project in another division', t.fails($q$insert into public.projects (id, doc) values ('p_new3','{"id":"p_new3","div":"fnl","org":false}')$q$));

-- ---------- division-private data ----------
select t.as_user('mem_ee');
select t.check('member sees only legal requests they made', t.n('select 1 from public.fnl_legal') = 1);
select t.check('EE member sees EE organisations', t.n('select 1 from public.ee_orgs') = 1);
select t.check('EE member sees their own IT request', t.n('select 1 from public.mcit_it') = 1);
select t.as_user('mem_fnl');
select t.check('FnL member sees all legal requests', t.n('select 1 from public.fnl_legal') = 2);
select t.check('FnL member cannot see EE organisations', t.n('select 1 from public.ee_orgs') = 0);
select t.as_user('brd');
select t.check('Board does not see legal requests, HR or EE data', t.n('select 1 from public.fnl_legal') = 0 and t.n('select 1 from public.hr_assessments') = 0 and t.n('select 1 from public.ee_orgs') = 0);
select t.check('Board can read Marketing / IT requests (mcFull)', t.n('select 1 from public.mcit_it') = 1);

-- ---------- HR is private ----------
select t.as_user('mem_ee');
select t.check('member sees their own assessment only', t.n('select 1 from public.hr_assessments') = 1 and t.n($q$select 1 from public.hr_assessments where id = 'as_ee'$q$) = 1);
select t.check('member cannot see HR registers', t.n('select 1 from public.hr_registers') = 0);
select t.as_user('dir_ee');
select t.check('named reviewer sees the assessment of the person they review', t.n($q$select 1 from public.hr_assessments where id = 'as_ee'$q$) = 1 and t.n($q$select 1 from public.hr_assessments where id = 'as_hr'$q$) = 0);
select t.check('unit director sees the register of their unit', t.n('select 1 from public.hr_registers') = 1);
select t.as_user('hr_dir');
select t.check('HR director sees every assessment', t.n('select 1 from public.hr_assessments') = 2);
select t.as_user('hr_mem');
select t.check('HR member sees own assessment, not the others''', t.n('select 1 from public.hr_assessments') = 1);

-- ---------- notifications are personal ----------
select t.as_user('mem_ee');
select t.check('member sees only own notifications', t.n('select 1 from public.updates') = 1);
select t.check('member can send a notification to someone else', not t.fails($q$insert into public.updates (id, doc) values ('u_new','{"id":"u_new","to":"dir_ee","type":"x","actor":"mem_ee"}')$q$));
select t.check('...but cannot read it', t.n($q$select 1 from public.updates where id = 'u_new'$q$) = 0);
select t.as_user('adm');
select t.check('Admin sees all notifications', t.n('select 1 from public.updates') = 3);

-- ---------- people ----------
select t.as_user('newbie');
select t.check('pending person sees only themselves', t.n('select 1 from public.people') = 1);
select t.check('pending person sees no projects or tasks', t.n('select 1 from public.projects') = 0 and t.n('select 1 from public.tasks') = 0);
select t.check('pending person cannot write', t.fails($q$insert into public.tasks (id, doc) values ('t_n','{"id":"t_n","div":"ee","owner":"newbie"}')$q$));
select t.as_user('mem_ee');
select t.check('active person sees the whole directory', t.n('select 1 from public.people') = 11);
select t.check('member cannot change their own role', t.fails($q$update public.people set doc = '{"id":"mem_ee","name":"mem_ee","first":"mem_ee","div":"ee","role":"director","admin":false,"board":false,"status":"active"}' where id = 'mem_ee'$q$));
select t.check('member can edit their own profile fields', not t.fails($q$update public.people set doc = '{"id":"mem_ee","name":"mem_ee","first":"mem_ee","div":"ee","role":"member","admin":false,"board":false,"status":"active","title":"Analyst"}' where id = 'mem_ee'$q$));
select t.check('member cannot edit someone else', t.affected($q$update public.people set doc = '{"id":"mem_fnl","name":"x","div":"fnl","role":"member","admin":false,"board":false,"status":"active"}' where id = 'mem_fnl'$q$) = 0);
select t.as_user('dir_ee');
select t.check('director can pause a member (status only)', not t.fails($q$update public.people set doc = '{"id":"mem_ee2","name":"mem_ee2","first":"mem_ee2","div":"ee","role":"member","admin":false,"board":false,"status":"suspended","title":"Analyst"}' where id = 'mem_ee2'$q$));
select t.check('director cannot promote a member', t.fails($q$update public.people set doc = '{"id":"mem_ee2","name":"mem_ee2","first":"mem_ee2","div":"ee","role":"director","admin":false,"board":false,"status":"suspended"}' where id = 'mem_ee2'$q$));
select t.as_user('hr_dir');
select t.check('HR lead can transfer a member to another division', not t.fails($q$update public.people set doc = '{"id":"hr_mem","name":"hr_mem","first":"hr_mem","div":"fnl","role":"member","admin":false,"board":false,"status":"active"}' where id = 'hr_mem'$q$));

-- ---------- single values ----------
select t.as_user('mem_ee');
select t.check('anyone can read stored values', t.n('select 1 from public.store_values') = 2);
select t.check('member cannot change the grant lists', t.fails($q$update public.store_values set doc = '{"legal":["mem_ee"]}' where id = 'fnl.grants'$q$) or t.affected($q$update public.store_values set doc = '{"legal":["mem_ee"]}' where id = 'fnl.grants'$q$) = 0);
select t.as_user('pres');
select t.check('President can change the grant lists', t.affected($q$update public.store_values set doc = '{"legal":["pres"]}' where id = 'fnl.grants'$q$) = 1);

-- ---------- invitations ----------
select t.as_user('mem_ee');
select t.check('member cannot see invitations', t.n('select 1 from public.acct_invites') = 0);
select t.as_user('hr_dir');
select t.check('HR lead sees invitations', t.n('select 1 from public.acct_invites') = 2);
select t.as_user('brd');
select t.check('Board does not see invitations', t.n('select 1 from public.acct_invites') = 0);

-- ---------- load and save functions ----------
select t.as_user('mem_ee');
select t.check('load_workspace returns only what the person may read',
  (select json_array_length(public.load_workspace()->'tasks') = 1 and json_array_length(public.load_workspace()->'fnl_legal') = 1));
select t.check('apply_changes saves a task in own division', not t.fails($q$select public.apply_changes('{"tasks":{"upsert":[{"id":"t_ee2","pos":5,"doc":{"id":"t_ee2","div":"ee","owner":"mem_ee","project":"p_ee","status":"todo"}}]}}')$q$));
select t.check('apply_changes refuses a task in a division the person is not part of',
  t.fails($q$select public.apply_changes('{"tasks":{"upsert":[{"id":"t_x","pos":5,"doc":{"id":"t_x","div":"fnl","owner":"mem_fnl","status":"todo"}}]}}')$q$));
select t.check('apply_changes refuses to delete a row the person may not delete',
  t.fails($q$select public.apply_changes('{"projects":{"delete":["p_ee"]}}')$q$));
select t.check('apply_changes refuses an unknown table', t.fails($q$select public.apply_changes('{"pg_user":{"delete":["x"]}}')$q$));
select t.check('apply_changes is all-or-nothing',
  t.fails($q$select public.apply_changes('{"tasks":{"upsert":[{"id":"t_ok","pos":6,"doc":{"id":"t_ok","div":"ee","owner":"mem_ee","status":"todo"}},{"id":"t_bad","pos":7,"doc":{"id":"t_bad","div":"fnl","owner":"mem_fnl"}}]}}')$q$)
  and t.n($q$select 1 from public.tasks where id = 't_ok'$q$) = 0);
select t.as_anon();
select t.check('signed-out visitors cannot read tables', t.fails('select 1 from public.tasks'));
select t.check('signed-out visitors cannot call load_workspace', t.fails('select public.load_workspace()'));
select t.check('signed-out visitors can read the invitation preview only',
  (select public.invite_preview('inv1')->>'name') = 'Invitee One' and (select public.invite_preview('inv1')->>'email') is null);

-- ---------- sign-in: invite only ----------
reset role;
select t.check('hook admits a pending invitation', (private.before_user_created('{"user":{"email":"Invitee@dwdg.test"}}'::jsonb)) = '{}'::jsonb);
select t.check('hook admits a person''s e-mail', (private.before_user_created('{"user":{"email":"mem_ee@dwdg.test"}}'::jsonb)) = '{}'::jsonb);
select t.check('hook refuses a revoked invitation', (private.before_user_created('{"user":{"email":"old@dwdg.test"}}'::jsonb)) ? 'error');
select t.check('hook refuses a stranger', (private.before_user_created('{"user":{"email":"who@nowhere.test"}}'::jsonb)) ? 'error');
insert into auth.users (id, email) values (t.uid('invitee'), 'invitee@dwdg.test'), (t.uid('stranger'), 'stranger@dwdg.test');
select t.as_user('invitee');
select t.check('first sign-in with a live invitation creates a pending person',
  (select public.link_current_user()->>'created') = 'true');
select t.check('...who sees only themselves', t.n('select 1 from public.people') = 1);
select t.as_user('stranger');
select t.check('first sign-in without invitation is refused', t.fails('select public.link_current_user()'));
select t.as_user('mem_ee');
select t.check('an already linked person is just returned', (select public.link_current_user()->>'person') = 'mem_ee');

reset role;
select n, ok, label from t.log order by n;
do $$ begin
  if exists (select 1 from t.log where not ok) then
    raise exception 'RLS smoke test failed: %', (select string_agg(label, '; ') from t.log where not ok);
  end if;
end $$;
rollback;
