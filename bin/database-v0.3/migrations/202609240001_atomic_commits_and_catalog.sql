-- Transactional UI commits and deliberately limited cross-division catalogs.
-- Existing rows with missing assignments or dates require an explicit decision;
-- never invent the current user or today's date when loading them.
do $$ begin
  if exists(select 1 from public.projects where lead_id is null or start_date is null or target_date is null)
    or exists(select 1 from public.tasks where assignee_id is null or start_date is null or due_date is null) then
    raise exception 'Resolve unassigned/undated projects and tasks before this migration.';
  end if;
end $$;
alter table public.projects alter column lead_id set not null;
alter table public.projects alter column start_date set not null;
alter table public.projects alter column target_date set not null;
alter table public.tasks alter column assignee_id set not null;
alter table public.tasks alter column start_date set not null;
alter table public.tasks alter column due_date set not null;

-- Restricted projects are absent from the discovery catalog unless the caller
-- can already read the underlying project. No details or documents are copied.
alter table public.project_catalog add column visibility text not null default 'division'
  check (visibility in ('division','restricted'));
update public.project_catalog c set visibility=p.visibility
  from public.projects p where p.id=c.project_id;
create or replace function private.sync_project_catalog()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.project_catalog
    (project_id,division_code,title,status,target_date,visibility)
  values(new.id,new.division_code,new.title,new.status,new.target_date,new.visibility)
  on conflict(project_id) do update set
    division_code=excluded.division_code,title=excluded.title,
    status=excluded.status,target_date=excluded.target_date,
    visibility=excluded.visibility;
  return new;
end $$;
drop trigger sync_project_catalog on public.projects;
create trigger sync_project_catalog
  after insert or update of division_code,title,status,target_date,visibility
  on public.projects for each row execute function private.sync_project_catalog();
drop policy catalog_read on public.project_catalog;
create policy catalog_read on public.project_catalog for select to authenticated
  using (private.active_user() and
    (visibility='division' or private.can_read_project(project_id)));

-- Requesters need a safe selector for budget lines, even though the ledger,
-- allocations, commitments and finance documents remain Finance-only.
create table public.finance_budget_catalog (
  budget_id uuid primary key references public.finance_budgets(id) on delete cascade,
  title text not null,
  category text not null
);
insert into public.finance_budget_catalog(budget_id,title,category)
  select id,title,category from public.finance_budgets;
create function private.sync_finance_budget_catalog()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.finance_budget_catalog(budget_id,title,category)
  values(new.id,new.title,new.category)
  on conflict(budget_id) do update set
    title=excluded.title,category=excluded.category;
  return new;
end $$;
create trigger sync_finance_budget_catalog
  after insert or update of title,category on public.finance_budgets
  for each row execute function private.sync_finance_budget_catalog();
alter table public.finance_budget_catalog enable row level security;
revoke all on public.finance_budget_catalog from public,anon;
grant select on public.finance_budget_catalog to authenticated;
revoke insert,update,delete on public.finance_budget_catalog from authenticated;
create policy budget_catalog_read on public.finance_budget_catalog
  for select to authenticated using (private.active_user());

-- This helper is invoker-rights. It keeps normal table RLS, integrity triggers,
-- version checks and activity events in force while both public commit RPCs
-- execute all requested changes in one PostgreSQL transaction.
create function private.apply_versioned_row(
  p_table text,p_action text,p_row jsonb,p_id uuid,p_version integer
) returns void language plpgsql security invoker set search_path = '' as $$
declare
  allowed text[];
  keys text[];
  columns_sql text;
  values_sql text;
  count_changed integer;
begin
  case p_table
    when 'projects' then allowed:=array['id','division_code','title','description',
      'lead_id','status','visibility','start_date','target_date','next_milestone'];
    when 'tasks' then allowed:=array['id','project_id','title','description',
      'assignee_id','status','priority','start_date','due_date','completed_at'];
    when 'meetings' then allowed:=array['id','division_code','project_id','title',
      'starts_at','ends_at','location','notes','status'];
    when 'initiatives' then allowed:=array['id','title','description','owner_id',
      'project_id','horizon','stage_code','priority','decision_due_date','research_sources'];
    when 'finance_budgets' then allowed:=array['id','title','project_id','category','allocated_idr'];
    when 'finance_requests' then allowed:=array['id','title','request_kind','budget_id',
      'project_id','category','amount_idr','requester_id','status','document_url',
      'description','due_date'];
    when 'hr_journeys' then allowed:=array['id','person_name','role_title',
      'linked_user_id','journey_kind','stage_code','owner_id','next_action_date',
      'confidential_notes'];
    when 'marketing_deliverables' then allowed:=array['id','title','work_kind',
      'campaign','stage_code','channel','owner_id','publish_at','asset_url',
      'published_url','notes'];
    when 'division_records' then allowed:=array['id','division_code',
      'record_kind','title','payload'];
    else raise exception 'Unsupported table in workspace commit.';
  end case;
  if p_action not in ('create','update','delete') then
    raise exception 'Unsupported workspace change.';
  end if;
  if p_action='delete' then
    if p_id is null or p_version is null then raise exception 'A version is required.'; end if;
    execute format('delete from public.%I where id=$1 and version=$2',p_table)
      using p_id,p_version;
  else
    if jsonb_typeof(p_row)<>'object' or nullif(p_row->>'id','') is null then
      raise exception 'A workspace row needs an ID.';
    end if;
    keys:=array(select jsonb_object_keys(p_row));
    if not(keys <@ allowed) then raise exception 'Unsupported workspace row field.'; end if;
    if p_action='create' then
      select string_agg(format('%I',field),',' order by field),
             string_agg(format('v.%I',field),',' order by field)
        into columns_sql,values_sql from unnest(keys) field;
      execute format('insert into public.%I(%s) select %s from jsonb_populate_record(null::public.%I,$1) v',
        p_table,columns_sql,values_sql,p_table) using p_row;
    else
      if p_id is null or p_version is null or p_row->>'id'<>p_id::text then
        raise exception 'A matching row ID and version are required.';
      end if;
      select string_agg(format('%I',field),',' order by field),
             string_agg(format('v.%I',field),',' order by field)
        into columns_sql,values_sql from unnest(keys) field where field<>'id';
      if columns_sql is null then raise exception 'No editable fields supplied.'; end if;
      execute format('update public.%I set (%s)=(select %s from jsonb_populate_record(null::public.%I,$1) v) where id=$2 and version=$3',
        p_table,columns_sql,values_sql,p_table) using p_row,p_id,p_version;
    end if;
  end if;
  get diagnostics count_changed = row_count;
  if count_changed<>1 then
    raise exception '% changed or access was denied. Your draft is preserved; refresh and retry.',p_table;
  end if;
end $$;
revoke execute on function private.apply_versioned_row(text,text,jsonb,uuid,integer)
  from public,anon;
grant execute on function private.apply_versioned_row(text,text,jsonb,uuid,integer)
  to authenticated;

create function public.commit_core_change(p_change jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare item jsonb; entry jsonb;
begin
  if not private.active_user() then raise exception 'Sign in is required.'; end if;
  if jsonb_typeof(p_change)<>'object' then raise exception 'Invalid workspace change.'; end if;
  for item in select value from jsonb_array_elements(coalesce(p_change#>'{meetings,deleted}','[]'::jsonb)) loop
    perform private.apply_versioned_row('meetings','delete',null,(item->>'id')::uuid,(item->>'version')::integer);
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_change#>'{tasks,deleted}','[]'::jsonb)) loop
    perform private.apply_versioned_row('tasks','delete',null,(item->>'id')::uuid,(item->>'version')::integer);
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_change#>'{projects,deleted}','[]'::jsonb)) loop
    perform private.apply_versioned_row('projects','delete',null,(item->>'id')::uuid,(item->>'version')::integer);
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_change#>'{projects,created}','[]'::jsonb)) loop
    perform private.apply_versioned_row('projects','create',item,null,null);
  end loop;
  for entry in select value from jsonb_array_elements(coalesce(p_change#>'{projects,updated}','[]'::jsonb)) loop
    item:=entry->'row';
    perform private.apply_versioned_row('projects','update',item,(item->>'id')::uuid,(entry->>'version')::integer);
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_change#>'{tasks,created}','[]'::jsonb)) loop
    perform private.apply_versioned_row('tasks','create',item,null,null);
  end loop;
  for entry in select value from jsonb_array_elements(coalesce(p_change#>'{tasks,updated}','[]'::jsonb)) loop
    item:=entry->'row';
    perform private.apply_versioned_row('tasks','update',item,(item->>'id')::uuid,(entry->>'version')::integer);
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_change->'dependencies','[]'::jsonb)) loop
    delete from public.task_dependencies where task_id=(item->>'task_id')::uuid;
    if item->>'depends_on_id' is not null then
      insert into public.task_dependencies(task_id,depends_on_id)
        values((item->>'task_id')::uuid,(item->>'depends_on_id')::uuid);
    end if;
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_change#>'{meetings,created}','[]'::jsonb)) loop
    perform private.apply_versioned_row('meetings','create',item,null,null);
  end loop;
  for entry in select value from jsonb_array_elements(coalesce(p_change#>'{meetings,updated}','[]'::jsonb)) loop
    item:=entry->'row';
    perform private.apply_versioned_row('meetings','update',item,(item->>'id')::uuid,(entry->>'version')::integer);
  end loop;
  if exists(select 1 from public.task_dependencies d
    join public.tasks a on a.id=d.task_id
    join public.tasks b on b.id=d.depends_on_id
    where a.project_id<>b.project_id) then
    raise exception 'Task dependencies must remain in one project.';
  end if;
  return jsonb_build_object('committed',true);
end $$;
revoke execute on function public.commit_core_change(jsonb) from public,anon;
grant execute on function public.commit_core_change(jsonb) to authenticated;

create function public.commit_division_change(p_change jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare item jsonb; stage jsonb; n integer; current_stages jsonb;
begin
  if not private.active_user() then raise exception 'Sign in is required.'; end if;
  if jsonb_typeof(p_change)<>'object' then raise exception 'Invalid division change.'; end if;
  -- Add missing stage IDs before records reference them. Final ordering and
  -- removals happen after record moves, within this same transaction.
  for item in select value from jsonb_array_elements(coalesce(p_change->'stages','[]'::jsonb)) loop
    if not private.is_division_head(item->>'divisionCode') then
      raise exception 'Only a division head may edit workflow stages.';
    end if;
    perform 1 from public.workflow_stages
      where division_code=item->>'divisionCode'
        and entity_kind=item->>'entityKind' for update;
    select coalesce(jsonb_agg(jsonb_build_object('id',stage_code,'label',label)
      order by position),'[]'::jsonb) into current_stages
      from public.workflow_stages where division_code=item->>'divisionCode'
        and entity_kind=item->>'entityKind';
    if current_stages is distinct from item->'previous' then
      raise exception 'Workflow changed elsewhere. Your draft is preserved; refresh and retry.';
    end if;
    n:=0;
    for stage in select value from jsonb_array_elements(item->'items') loop
      n:=n+1;
      insert into public.workflow_stages
        (division_code,entity_kind,stage_code,label,position)
      values(item->>'divisionCode',item->>'entityKind',stage->>'id',
        stage->>'label',-1000000-n)
      on conflict(division_code,entity_kind,stage_code) do nothing;
    end loop;
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_change->'operations','[]'::jsonb)) loop
    if item->>'action'='transition' then
      if item->>'table'<>'finance_requests' then
        raise exception 'Only finance requests use approval transitions.';
      end if;
      perform public.transition_finance_request(
        (item->>'id')::uuid,item->>'status',(item->>'version')::integer,null);
    else
      perform private.apply_versioned_row(
        item->>'table',item->>'action',item->'row',
        nullif(item->>'id','')::uuid,nullif(item->>'version','')::integer);
    end if;
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_change->'stages','[]'::jsonb)) loop
    perform public.replace_workflow_group(
      item->>'divisionCode',item->>'entityKind',item->'items');
  end loop;
  return jsonb_build_object('committed',true);
end $$;
revoke execute on function public.commit_division_change(jsonb) from public,anon;
grant execute on function public.commit_division_change(jsonb) to authenticated;
