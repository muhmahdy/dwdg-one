begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;
select plan(21);

-- Disposable fixture. Auth user insert fires the real profile/invitation trigger.
insert into private.bootstrap_settings(key,value)
values('first_admin_email','admin@dwdg.test')
on conflict(key) do update set value=excluded.value;
insert into public.invitations(email,primary_division_code,division_role) values
 ('strategy@dwdg.test','strategy_growth','member'),
 ('hr@dwdg.test','human_resource','member'),
 ('finance@dwdg.test','legal_finance','division_head'),
 ('marketing@dwdg.test','marketing_comms_it','member');
insert into auth.users(id,email,raw_user_meta_data) values
 ('10000000-0000-4000-8000-000000000001','admin@dwdg.test','{"full_name":"Admin"}'),
 ('10000000-0000-4000-8000-000000000002','strategy@dwdg.test','{"full_name":"Strategy"}'),
 ('10000000-0000-4000-8000-000000000003','hr@dwdg.test','{"full_name":"HR"}'),
 ('10000000-0000-4000-8000-000000000004','finance@dwdg.test','{"full_name":"Finance"}'),
 ('10000000-0000-4000-8000-000000000005','marketing@dwdg.test','{"full_name":"Marketing"}');

select is(private.before_user_created('{"user":{"email":"strategy@dwdg.test"}}'::jsonb),
  '{}'::jsonb,'An invited email is allowed by the signup hook');
select ok(private.before_user_created('{"user":{"email":"outsider@dwdg.test"}}'::jsonb)
  ? 'error','An uninvited email is rejected before account creation');

insert into public.projects
  (id,division_code,title,description,lead_id,visibility,start_date,target_date,created_by) values
 ('20000000-0000-4000-8000-000000000001','strategy_growth',
  'Visible division project','Full private detail',
  '10000000-0000-4000-8000-000000000002','division','2026-09-20','2026-10-20',
  '10000000-0000-4000-8000-000000000002'),
 ('20000000-0000-4000-8000-000000000002','strategy_growth',
  'Restricted project','Restricted detail',
  '10000000-0000-4000-8000-000000000001','restricted','2026-09-20','2026-10-20',
  '10000000-0000-4000-8000-000000000002');
insert into public.tasks
  (id,project_id,title,assignee_id,start_date,due_date,created_by)
values('21000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001','Prepare brief',
  '10000000-0000-4000-8000-000000000002',
  '2026-09-21','2026-09-22','10000000-0000-4000-8000-000000000002');
insert into public.hr_journeys
  (id,person_name,journey_kind,stage_code,confidential_notes,created_by)
values('30000000-0000-4000-8000-000000000001','Candidate A',
  'recruitment','screening','Confidential candidate note',
  '10000000-0000-4000-8000-000000000003');
insert into public.finance_budgets
  (id,title,allocated_idr,created_by)
values('40000000-0000-4000-8000-000000000001','Program budget',
  1000000,'10000000-0000-4000-8000-000000000004');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
insert into public.finance_requests
  (id,request_kind,title,amount_idr,budget_id,status,requester_id)
values('50000000-0000-4000-8000-000000000001','expense',
  'Workshop materials',200000,'40000000-0000-4000-8000-000000000001',
  'submitted','10000000-0000-4000-8000-000000000002');
insert into public.finance_requests
  (id,request_kind,title,amount_idr,budget_id,status,requester_id)
values('50000000-0000-4000-8000-000000000002','expense',
  'Large follow-up request',900000,'40000000-0000-4000-8000-000000000001',
  'submitted','10000000-0000-4000-8000-000000000002');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
insert into public.finance_requests
  (id,request_kind,title,amount_idr,budget_id,status,requester_id)
values('50000000-0000-4000-8000-000000000003','expense',
  'Finance head own request',100000,'40000000-0000-4000-8000-000000000001',
  'submitted','10000000-0000-4000-8000-000000000004');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
insert into public.notifications(id,user_id,kind,title) values
 ('60000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002','assignment','Strategy notice');

create function public.test_reject_self_approval()
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.finance_requests set status='approved'
    where id='50000000-0000-4000-8000-000000000003';
  return false;
exception when others then
  return position('other than the requester' in sqlerrm)>0;
end $$;
grant execute on function public.test_reject_self_approval() to authenticated;
create function public.test_reject_overspend()
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.finance_requests set status='approved'
    where id='50000000-0000-4000-8000-000000000002';
  return false;
exception when others then
  return position('remaining budget' in sqlerrm)>0;
end $$;
create function public.test_reject_budget_cut()
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.finance_budgets set allocated_idr=100000
    where id='40000000-0000-4000-8000-000000000001';
  return false;
exception when others then
  return position('approved and paid spending' in sqlerrm)>0;
end $$;
grant execute on function public.test_reject_overspend() to authenticated;
grant execute on function public.test_reject_budget_cut() to authenticated;
create function public.test_atomic_core_conflict()
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  perform public.commit_core_change(jsonb_build_object(
    'projects',jsonb_build_object('updated',jsonb_build_array(
      jsonb_build_object('row',jsonb_build_object(
        'id','20000000-0000-4000-8000-000000000001',
        'description','Should roll back'),'version',1))),
    'tasks',jsonb_build_object('updated',jsonb_build_array(
      jsonb_build_object('row',jsonb_build_object(
        'id','21000000-0000-4000-8000-000000000001',
        'title','Changed'),'version',999)))));
  return false;
exception when others then
  return position('tasks changed' in sqlerrm)>0 and
    (select description='Full private detail' from public.projects
      where id='20000000-0000-4000-8000-000000000001');
end $$;
grant execute on function public.test_atomic_core_conflict() to authenticated;

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000005';
select is((select count(*) from public.project_catalog),1::bigint,
  'Nonmember sees ordinary projects but no restricted title');
select is((select count(*) from public.projects),0::bigint,
  'Nonmember cannot read full project rows');
select is((select count(*) from public.hr_journeys),0::bigint,
  'Non-HR member cannot read candidate notes');
select is((select count(*) from public.finance_budgets),0::bigint,
  'Non-finance member cannot read budget detail');
select is((select count(*) from public.finance_budget_catalog),1::bigint,
  'Requester sees safe budget line choices without amounts');
select is((select count(*) from public.finance_requests),0::bigint,
  'Non-requester cannot read finance requests');

set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000002';
select is((select count(*) from public.projects),1::bigint,
  'Division member sees the ordinary project but not restricted detail');
select is((select count(*) from public.finance_requests),2::bigint,
  'Requester can read their own requests');
select ok(public.test_atomic_core_conflict(),
  'A later version conflict rolls back an earlier project update');
select is((select count(*) from public.notifications),1::bigint,
  'Member can read their own notification');
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000003';
select is((select count(*) from public.hr_journeys),1::bigint,
  'HR member can read candidate records');

set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000004';
select is((select count(*) from public.finance_budgets),1::bigint,
  'Finance head can read budget detail');
select ok(public.test_reject_self_approval(),
  'Even a designated approver cannot approve their own request');
update public.finance_requests set status='approved'
  where id='50000000-0000-4000-8000-000000000001';
select is((select status from public.finance_requests
  where id='50000000-0000-4000-8000-000000000001'),'approved',
  'Designated approver can approve another member request');
select ok(public.test_reject_overspend(),
  'Approval cannot overspend a budget');
select ok(public.test_reject_budget_cut(),
  'Allocation cannot be lowered below committed spending');

reset role;
insert into public.project_access(project_id,user_id,role) values
 ('20000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000005','viewer');
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000005';
select is((select count(*) from public.projects),1::bigint,
  'Explicit project grant reveals restricted full row');
select is((select count(*) from public.project_catalog),2::bigint,
  'Explicit grant also reveals the restricted project summary');

reset role;
update public.profiles set active=false
  where id='10000000-0000-4000-8000-000000000005';
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000005';
select is((select count(*) from public.project_catalog),0::bigint,
  'Deactivated member loses catalog access');

select * from finish();
rollback;
