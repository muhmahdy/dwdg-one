-- ---------- hub only: division progress and the audit log ----------
-- Spliced into rls_smoke_hub.sql by scripts/database/build-sql.mjs (before the sign-in checks). Uses the cast of rls_smoke.sql.
reset role;
insert into public.division_progress (division_id, total_items, done_items) values ('ee', 4, 1), ('fnl', 2, 2);
select t.as_user('mem_ee');
select t.check('member sees the progress of their own division only', t.n('select 1 from public.division_progress') = 1 and t.n($q$select 1 from public.division_progress where division_id = 'ee'$q$) = 1);
select t.check('percent is worked out by the database', (select percent from public.division_progress where division_id = 'ee') = 25);
select t.check('member cannot write progress', t.fails($q$insert into public.division_progress (division_id, total_items) values ('hr', 1)$q$) and t.fails($q$update public.division_progress set done_items = 4 where division_id = 'ee'$q$));
select t.as_user('vpx');
select t.check('VP sees the progress of every division', t.n('select 1 from public.division_progress') = 2);
select t.as_user('brd');
select t.check('Board sees division summaries', t.n('select 1 from public.division_progress') = 2);
select t.as_user('newbie');
select t.check('pending person sees no progress', t.n('select 1 from public.division_progress') = 0);
select t.as_user('mem_ee');
select t.check('nobody signed in can read or write the audit log', t.fails('select 1 from public.audit_log') and t.fails($q$insert into public.audit_log (action) values ('x')$q$));
select t.as_anon();
select t.check('signed-out visitors cannot read progress or the audit log', t.fails('select 1 from public.division_progress') and t.fails('select 1 from public.audit_log'));
reset role;
set local role service_role;
select t.check('the service role writes and reads the audit log', t.affected($q$insert into public.audit_log (person_id, division_id, action, detail) values ('mem_ee', 'fnl', 'access.sensitive', '{"min":"viewer"}')$q$) = 1 and t.n('select 1 from public.audit_log') = 1);
select t.check('the service role writes division progress', t.affected($q$update public.division_progress set done_items = 3 where division_id = 'ee'$q$) = 1);
reset role;
select t.check('divisions start switched off, HR and FnL are marked sensitive',
  (select count(*) from public.divisions where not is_active) = 6 and (select string_agg(id, ',' order by id) from public.divisions where is_sensitive) = 'fnl,hr');

