-- Admin utilities and read models. Never expose a service-role key to the browser.
create function public.admin_set_profile_access(
  p_user_id uuid,p_global_role text,p_active boolean
) returns public.profiles language plpgsql security definer set search_path = '' as $$
declare result public.profiles;
begin
  if not private.is_admin() then raise exception 'Only a Super Admin may change account access.'; end if;
  if p_global_role not in ('super_admin','executive','member','viewer') then
    raise exception 'Unknown role.';
  end if;
  if p_user_id=(select auth.uid()) and (not p_active or p_global_role<>'super_admin') then
    raise exception 'Do not remove your own administrator access.';
  end if;
  update public.profiles
    set global_role=p_global_role,active=p_active,updated_at=now()
    where id=p_user_id returning * into result;
  if not found then raise exception 'Member not found.'; end if;
  return result;
end $$;
revoke execute on function public.admin_set_profile_access(uuid,text,boolean)
  from public,anon;
grant execute on function public.admin_set_profile_access(uuid,text,boolean)
  to authenticated;

create view public.finance_budget_summary
with (security_invoker=true) as
select b.id,b.title,b.project_id,b.category,b.allocated_idr,
  coalesce(sum(case when r.request_kind='budget' and r.status in ('approved','paid')
    then r.amount_idr else 0 end),0)::bigint as approved_extra_idr,
  coalesce(sum(case when r.request_kind='expense' and r.status='approved'
    then r.amount_idr else 0 end),0)::bigint as committed_idr,
  coalesce(sum(case when r.request_kind='expense' and r.status='paid'
    then r.amount_idr else 0 end),0)::bigint as paid_idr,
  (b.allocated_idr
    +coalesce(sum(case when r.request_kind='budget' and r.status in ('approved','paid')
      then r.amount_idr else 0 end),0)
    -coalesce(sum(case when r.request_kind='expense' and r.status in ('approved','paid')
      then r.amount_idr else 0 end),0))::bigint as remaining_idr
from public.finance_budgets b
left join public.finance_requests r on r.budget_id=b.id
group by b.id,b.title,b.project_id,b.category,b.allocated_idr;
grant select on public.finance_budget_summary to authenticated;

-- Count-only HR overview for approved cross-division summary surfaces.
create function public.hr_journey_counts()
returns table(journey_kind text,stage_code text,record_count bigint)
language plpgsql security definer set search_path = '' as $$
begin
  if not private.active_user() then raise exception 'Sign in is required.'; end if;
  return query select h.journey_kind,h.stage_code,count(*)::bigint
    from public.hr_journeys h group by h.journey_kind,h.stage_code;
end $$;
revoke execute on function public.hr_journey_counts() from public,anon;
grant execute on function public.hr_journey_counts() to authenticated;

create function private.guard_stage_delete()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.division_code='legal_finance' and old.entity_kind='financeRequests'
     and old.stage_code in ('draft','submitted','approved','rejected','paid') then
    raise exception 'Core approval stages cannot be removed; rename or reorder them instead.';
  end if;
  if (old.division_code='strategy_growth' and old.entity_kind='initiative'
      and exists(select 1 from public.initiatives where stage_code=old.stage_code))
    or (old.division_code='human_resource' and
      exists(select 1 from public.hr_journeys
        where stage_code=old.stage_code and
          (case when journey_kind='recruitment' then 'recruitment'
            else 'onboarding' end)=old.entity_kind))
    or (old.division_code='marketing_comms_it' and
      exists(select 1 from public.marketing_deliverables
        where stage_code=old.stage_code and
          (case when work_kind='it' then 'itDelivery'
            else 'content' end)=old.entity_kind))
    or (old.division_code='legal_finance' and old.entity_kind='financeRequests'
      and exists(select 1 from public.finance_requests where status=old.stage_code)) then
    raise exception 'Move records out of this stage before deleting it.';
  end if;
  return old;
end $$;
create trigger guard_stage_delete before delete on public.workflow_stages
  for each row execute function private.guard_stage_delete();

create function public.replace_workflow_group(
  p_division_code text,p_entity_kind text,p_stages jsonb
) returns setof public.workflow_stages
language plpgsql security definer set search_path = '' as $$
declare item jsonb; seen text[] := '{}'; v_code text; v_label text;
begin
  if not private.is_division_head(p_division_code) then
    raise exception 'Only a division head may edit workflow stages.';
  end if;
  if jsonb_typeof(p_stages)<>'array' or jsonb_array_length(p_stages)=0 then
    raise exception 'Keep at least one workflow stage.';
  end if;
  for item in select value from jsonb_array_elements(p_stages) loop
    v_code=trim(item->>'id'); v_label=trim(item->>'label');
    if v_code is null or v_code='' or v_label is null or v_label='' or
       v_code=any(seen) then raise exception 'Stage IDs and labels must be unique and nonempty.'; end if;
    seen=array_append(seen,v_code);
  end loop;
  -- Move existing positions out of the positive range before reordering.
  update public.workflow_stages set position=-1000-position
    where division_code=p_division_code and entity_kind=p_entity_kind;
  delete from public.workflow_stages
    where division_code=p_division_code and entity_kind=p_entity_kind
      and stage_code<>all(seen);
  for item in
    select value || jsonb_build_object('_position',ordinality)
      from jsonb_array_elements(p_stages) with ordinality
  loop
    insert into public.workflow_stages
      (division_code,entity_kind,stage_code,label,position)
    values(p_division_code,p_entity_kind,item->>'id',item->>'label',
      (item->>'_position')::integer)
    on conflict(division_code,entity_kind,stage_code)
      do update set label=excluded.label,position=excluded.position;
  end loop;
  return query select * from public.workflow_stages
    where division_code=p_division_code and entity_kind=p_entity_kind
    order by position;
end $$;
revoke execute on function public.replace_workflow_group(text,text,jsonb)
  from public,anon;
grant execute on function public.replace_workflow_group(text,text,jsonb)
  to authenticated;

create table public.legacy_imports (
  id uuid primary key,
  imported_by uuid not null references public.profiles(id),
  project_count integer not null,
  task_count integer not null,
  meeting_count integer not null,
  imported_at timestamptz not null default now()
);
alter table public.legacy_imports enable row level security;
grant select on public.legacy_imports to authenticated;
create policy legacy_imports_admin_read on public.legacy_imports for select to authenticated
  using (private.is_admin());

-- This RPC is one transaction. The dry run validates the same member mapping
-- and source links without inserting. A repeated import ID cannot duplicate data.
create function public.import_legacy_workspace(
  p_data jsonb,p_member_map jsonb,p_dry_run boolean default true,
  p_import_id uuid default gen_random_uuid()
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  item jsonb; legacy_id text; mapped_id uuid; mapped_project uuid;
  project_map jsonb := '{}'::jsonb; task_map jsonb := '{}'::jsonb;
  task_project_map jsonb := '{}'::jsonb;
  division text; counts jsonb; starts_at timestamptz;
  v_project_count integer; v_task_count integer; v_meeting_count integer;
begin
  if not private.is_admin() then raise exception 'Only a Super Admin may import a backup.'; end if;
  if p_data->>'version'<>'1' or jsonb_typeof(p_data->'members')<>'array'
    or jsonb_typeof(p_data->'projects')<>'array'
    or jsonb_typeof(p_data->'tasks')<>'array'
    or jsonb_typeof(p_data->'events')<>'array' then
    raise exception 'Invalid DWDG v1 backup.';
  end if;
  v_project_count=jsonb_array_length(p_data->'projects');
  v_task_count=jsonb_array_length(p_data->'tasks');
  v_meeting_count=jsonb_array_length(p_data->'events');
  for item in select value from jsonb_array_elements(p_data->'members') loop
    legacy_id=item->>'id';
    if p_member_map->>legacy_id is null then
      raise exception 'A legacy member has not been mapped: %',legacy_id;
    end if;
    mapped_id=(p_member_map->>legacy_id)::uuid;
    if not exists(select 1 from public.profiles where id=mapped_id and active) then
      raise exception 'Mapped member is not an active account: %',legacy_id;
    end if;
  end loop;
  for item in select value from jsonb_array_elements(p_data->'projects') loop
    legacy_id=item->>'id';
    division=case item->>'division'
      when 'Strategy & Growth' then 'strategy_growth'
      when 'Legal & Finance' then 'legal_finance'
      when 'Human Resource' then 'human_resource'
      when 'Marketing, Communication & IT' then 'marketing_comms_it'
      when 'Marketing, Communication, & IT' then 'marketing_comms_it'
      when 'External Engagement' then 'external_engagement'
      when 'Client Engagement' then 'external_engagement'
      when 'Consulting' then 'consulting'
      else null end;
    if division is null then raise exception 'Unknown division: %',item->>'division'; end if;
    if p_member_map->>(item->>'owner') is null then
      raise exception 'Project has an unmapped lead: %',legacy_id;
    end if;
    mapped_id=gen_random_uuid();
    project_map=jsonb_set(project_map,array[legacy_id],to_jsonb(mapped_id::text));
    if not p_dry_run then
      insert into public.projects
        (id,division_code,title,description,lead_id,start_date,target_date,created_by)
      values(mapped_id,division,item->>'name',coalesce(item->>'description',''),
        (p_member_map->>(item->>'owner'))::uuid,
        (item->>'start')::date,(item->>'end')::date,(select auth.uid()));
    end if;
  end loop;
  for item in select value from jsonb_array_elements(p_data->'tasks') loop
    legacy_id=item->>'id';
    if project_map->>(item->>'projectId') is null then
      raise exception 'Task refers to a missing project: %',legacy_id;
    end if;
    if p_member_map->>(item->>'assignee') is null then
      raise exception 'Task has an unmapped assignee: %',legacy_id;
    end if;
    mapped_id=gen_random_uuid();
    task_map=jsonb_set(task_map,array[legacy_id],to_jsonb(mapped_id::text));
    task_project_map=jsonb_set(task_project_map,array[legacy_id],
      to_jsonb(item->>'projectId'));
    if not p_dry_run then
      insert into public.tasks
        (id,project_id,title,description,assignee_id,status,priority,
         start_date,due_date,completed_at,created_by)
      values(mapped_id,(project_map->>(item->>'projectId'))::uuid,
        item->>'title',coalesce(item->>'description',''),
        (p_member_map->>(item->>'assignee'))::uuid,
        coalesce(item->>'status','todo'),coalesce(item->>'priority','medium'),
        (item->>'start')::date,(item->>'end')::date,
        case when item->>'completedAt' is not null
          then ((item->>'completedAt')::date::timestamp at time zone 'Asia/Jakarta')
          else null end,(select auth.uid()));
    end if;
  end loop;
  for item in select value from jsonb_array_elements(p_data->'tasks') loop
    if nullif(item->>'dependsOn','') is not null then
      if task_map->>(item->>'dependsOn') is null then
        raise exception 'Task refers to a missing dependency: %',item->>'id';
      end if;
      if task_project_map->>(item->>'dependsOn')<>item->>'projectId' then
        raise exception 'Task dependency crosses projects: %',item->>'id';
      end if;
      if not p_dry_run then
        insert into public.task_dependencies(task_id,depends_on_id)
        values((task_map->>(item->>'id'))::uuid,
          (task_map->>(item->>'dependsOn'))::uuid);
      end if;
    end if;
  end loop;
  for item in select value from jsonb_array_elements(p_data->'events') loop
    if nullif(item->>'projectId','') is not null and
      project_map->>(item->>'projectId') is null then
      raise exception 'Meeting refers to a missing project: %',item->>'id';
    end if;
    starts_at=((item->>'date')||'T'||(item->>'time')||':00')::timestamp
      at time zone 'Asia/Jakarta';
    if not p_dry_run then
      mapped_project=case when nullif(item->>'projectId','') is null then null
        else (project_map->>(item->>'projectId'))::uuid end;
      -- Project-less legacy events stay personal unless the importing admin
      -- has a primary division, in which case they become division meetings.
      division=case when mapped_project is null
        then (select primary_division_code from public.profiles where id=(select auth.uid()))
        else null end;
      insert into public.meetings
        (division_code,project_id,title,starts_at,ends_at,location,notes,organizer_id)
      values(division,mapped_project,item->>'title',starts_at,
        starts_at+make_interval(mins=>coalesce((item->>'duration')::integer,45)),
        coalesce(item->>'location',''),coalesce(item->>'notes',''),(select auth.uid()));
    end if;
  end loop;
  counts=jsonb_build_object('projects',v_project_count,'tasks',v_task_count,
    'meetings',v_meeting_count,'dryRun',p_dry_run,
    'renamedDivision','Client Engagement -> External Engagement');
  if not p_dry_run then
    insert into public.legacy_imports(id,imported_by,project_count,task_count,meeting_count)
    values(p_import_id,(select auth.uid()),v_project_count,v_task_count,v_meeting_count);
  end if;
  return counts;
end $$;
revoke execute on function public.import_legacy_workspace(jsonb,jsonb,boolean,uuid)
  from public,anon;
grant execute on function public.import_legacy_workspace(jsonb,jsonb,boolean,uuid)
  to authenticated;

-- Realtime sends only rows that pass subscription authorization/RLS.
do $$
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    alter publication supabase_realtime add table public.projects;
    alter publication supabase_realtime add table public.tasks;
    alter publication supabase_realtime add table public.meetings;
    alter publication supabase_realtime add table public.activity_events;
    alter publication supabase_realtime add table public.notifications;
    alter publication supabase_realtime add table public.initiatives;
    alter publication supabase_realtime add table public.finance_requests;
    alter publication supabase_realtime add table public.hr_journeys;
    alter publication supabase_realtime add table public.marketing_deliverables;
    alter publication supabase_realtime add table public.division_records;
  end if;
end $$;
