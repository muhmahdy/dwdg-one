-- DWDG Workspace v0.3. Run with the Supabase CLI before enabling sign-in.
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table private.bootstrap_settings (
  key text primary key,
  value text not null
);

create table public.divisions (
  code text primary key,
  name text not null unique,
  sort_order integer not null unique,
  implementation_status text not null check (implementation_status in ('active','preview')),
  created_at timestamptz not null default now()
);
insert into public.divisions (code,name,sort_order,implementation_status) values
 ('strategy_growth','Strategy & Growth',1,'active'),
 ('legal_finance','Legal & Finance',2,'active'),
 ('human_resource','Human Resource',3,'active'),
 ('marketing_comms_it','Marketing, Communication & IT',4,'active'),
 ('external_engagement','External Engagement',5,'preview'),
 ('consulting','Consulting',6,'preview');

create table public.invitations (
  email text primary key check (email = lower(trim(email))),
  global_role text not null default 'member'
    check (global_role in ('super_admin','executive','member','viewer')),
  primary_division_code text references public.divisions(code),
  division_role text not null default 'member'
    check (division_role in ('division_head','member','viewer')),
  expires_at timestamptz,
  revoked_at timestamptz,
  accepted_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  global_role text not null default 'member'
    check (global_role in ('super_admin','executive','member','viewer')),
  primary_division_code text references public.divisions(code),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  division_code text not null references public.divisions(code),
  role text not null default 'member' check (role in ('division_head','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (user_id,division_code)
);

-- Supabase Auth Database Hook: configure this function as "Before User Created".
-- The deployment must set private.bootstrap_settings.first_admin_email and enable
-- the Google provider; no email or elevated key is hard-coded in the application.
create function private.before_user_created(event jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  signup_email text := lower(trim(event->'user'->>'email'));
begin
  if signup_email is null or signup_email = '' then
    return jsonb_build_object('error',jsonb_build_object('message','An invited email is required.','http_code',403));
  end if;
  if exists (
    select 1 from private.bootstrap_settings
    where key='first_admin_email' and lower(trim(value))=signup_email
  ) or exists (
    select 1 from public.invitations
    where email=signup_email and revoked_at is null
      and (expires_at is null or expires_at>now())
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error',jsonb_build_object('message','This account has not been invited.','http_code',403));
end $$;
revoke execute on function private.before_user_created(jsonb) from public, anon, authenticated;
grant execute on function private.before_user_created(jsonb) to supabase_auth_admin;
grant usage on schema private to supabase_auth_admin;

create function private.create_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  invite public.invitations%rowtype;
  first_admin boolean;
  normalized_email text := lower(trim(new.email));
begin
  select exists (
    select 1 from private.bootstrap_settings
    where key='first_admin_email' and lower(trim(value))=normalized_email
  ) into first_admin;
  select * into invite from public.invitations
    where email=normalized_email and revoked_at is null
      and (expires_at is null or expires_at>now());
  if not first_admin and not found then
    raise exception 'This account has not been invited.';
  end if;
  insert into public.profiles (id,email,full_name,global_role,primary_division_code)
  values (
    new.id, normalized_email,
    coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name',''),
    case when first_admin then 'super_admin' else invite.global_role end,
    invite.primary_division_code
  );
  if invite.primary_division_code is not null then
    insert into public.memberships (user_id,division_code,role)
    values (new.id,invite.primary_division_code,invite.division_role);
  end if;
  update public.invitations set accepted_at=now() where email=normalized_email;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.create_profile();

create function private.active_user()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id=(select auth.uid()) and active)
$$;
create function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles
    where id=(select auth.uid()) and active and global_role='super_admin')
$$;
create function private.is_executive()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles
    where id=(select auth.uid()) and active and global_role in ('super_admin','executive'))
$$;
create function private.member_role(p_division text)
returns text language sql stable security definer set search_path = '' as $$
  select m.role from public.memberships m join public.profiles p on p.id=m.user_id
  where m.user_id=(select auth.uid()) and m.division_code=p_division and p.active
  limit 1
$$;
create function private.can_read_division(p_division text)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and
    (private.is_executive() or private.member_role(p_division) is not null)
$$;
create function private.can_edit_division(p_division text)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and
    (private.is_admin() or private.member_role(p_division) in ('division_head','member'))
$$;
create function private.is_division_head(p_division text)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and
    (private.is_admin() or private.member_role(p_division)='division_head')
$$;
revoke execute on all functions in schema private from public, anon;
grant execute on function private.active_user(), private.is_admin(),
  private.is_executive(), private.member_role(text), private.can_read_division(text),
  private.can_edit_division(text), private.is_division_head(text) to authenticated;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  division_code text not null references public.divisions(code),
  title text not null check (length(trim(title))>0),
  description text not null default '',
  lead_id uuid references public.profiles(id),
  status text not null default 'planned'
    check (status in ('planned','active','paused','blocked','completed','cancelled')),
  visibility text not null default 'division'
    check (visibility in ('division','restricted')),
  start_date date,
  target_date date,
  next_milestone text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version>0),
  check (start_date is null or target_date is null or target_date>=start_date)
);
create index projects_division_idx on public.projects(division_code,status);

-- A deliberately limited catalog for cross-division discovery. Do not put
-- description, budgets, document links, blockers, or private notes here.
create table public.project_catalog (
  project_id uuid primary key references public.projects(id) on delete cascade,
  division_code text not null references public.divisions(code),
  title text not null,
  status text not null,
  target_date date
);
create function private.sync_project_catalog()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.project_catalog(project_id,division_code,title,status,target_date)
  values(new.id,new.division_code,new.title,new.status,new.target_date)
  on conflict(project_id) do update set
    division_code=excluded.division_code,title=excluded.title,
    status=excluded.status,target_date=excluded.target_date;
  return new;
end $$;
create trigger sync_project_catalog after insert or update of division_code,title,status,target_date
on public.projects for each row execute function private.sync_project_catalog();

create table public.project_divisions (
  project_id uuid not null references public.projects(id) on delete cascade,
  division_code text not null references public.divisions(code),
  primary key(project_id,division_code)
);
create table public.project_access (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check(role in ('lead','editor','viewer')),
  granted_by uuid references public.profiles(id),
  primary key(project_id,user_id)
);

create function private.can_read_project(p_project uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and exists (
    select 1 from public.projects p where p.id=p_project and (
      private.is_executive() or p.lead_id=(select auth.uid())
      or exists(select 1 from public.project_access a
        where a.project_id=p.id and a.user_id=(select auth.uid()))
      or (p.visibility='division' and (
        private.member_role(p.division_code) is not null
        or exists(select 1 from public.project_divisions d
          where d.project_id=p.id and private.member_role(d.division_code) is not null)
      ))
    )
  )
$$;
create function private.can_edit_project(p_project uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and exists (
    select 1 from public.projects p where p.id=p_project and (
      private.is_admin() or private.is_division_head(p.division_code)
      or p.lead_id=(select auth.uid())
      or exists(select 1 from public.project_access a
        where a.project_id=p.id and a.user_id=(select auth.uid())
          and a.role in ('lead','editor'))
    )
  )
$$;
grant execute on function private.can_read_project(uuid),private.can_edit_project(uuid) to authenticated;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check(length(trim(title))>0),
  description text not null default '',
  assignee_id uuid references public.profiles(id),
  status text not null default 'todo' check(status in ('todo','progress','blocked','done')),
  priority text not null default 'medium' check(priority in ('low','medium','high')),
  start_date date,
  due_date date,
  completed_at timestamptz,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check(version>0),
  check (start_date is null or due_date is null or due_date>=start_date)
);
create index tasks_project_idx on public.tasks(project_id,due_date);
create index tasks_assignee_idx on public.tasks(assignee_id,status,due_date);
create table public.task_dependencies (
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on_id uuid not null references public.tasks(id) on delete cascade,
  primary key(task_id,depends_on_id),
  check(task_id<>depends_on_id)
);
create table public.project_dependencies (
  project_id uuid not null references public.projects(id) on delete cascade,
  depends_on_id uuid not null references public.projects(id) on delete cascade,
  note text not null default '',
  primary key(project_id,depends_on_id),
  check(project_id<>depends_on_id)
);
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check(length(trim(title))>0),
  due_date date,
  status text not null default 'planned' check(status in ('planned','at_risk','reached')),
  reached_at timestamptz,
  owner_id uuid references public.profiles(id),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);
create table public.blockers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  milestone_id uuid references public.milestones(id) on delete set null,
  title text not null check(length(trim(title))>0),
  description text not null default '',
  severity text not null default 'medium' check(severity in ('low','medium','high')),
  owner_id uuid references public.profiles(id),
  opened_by uuid not null default auth.uid() references public.profiles(id),
  requested_action text not null default '',
  target_resolution_date date,
  resolution_note text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  version integer not null default 1
);
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  division_code text references public.divisions(code),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null check(length(trim(title))>0),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text not null default '',
  agenda text not null default '',
  notes text not null default '',
  status text not null default 'scheduled' check(status in ('scheduled','completed','cancelled')),
  recurrence_rule text,
  organizer_id uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  check(ends_at is null or ends_at>starts_at)
);
create table public.meeting_attendees (
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key(meeting_id,user_id)
);
create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  division_code text references public.divisions(code),
  project_id uuid references public.projects(id) on delete cascade,
  meeting_id uuid references public.meetings(id) on delete set null,
  decision text not null check(length(trim(decision))>0),
  rationale text not null default '',
  decided_at timestamptz not null default now(),
  supersedes_id uuid references public.decisions(id) on delete set null,
  recorded_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  check(project_id is not null or division_code is not null)
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  division_code text references public.divisions(code),
  project_id uuid references public.projects(id) on delete cascade,
  meeting_id uuid references public.meetings(id) on delete set null,
  title text not null check(length(trim(title))>0),
  notes text not null default '',
  external_url text,
  storage_path text unique,
  version_label text,
  sensitivity text not null default 'normal'
    check(sensitivity in ('normal','hr','finance')),
  owner_id uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  check(project_id is not null or division_code is not null),
  check(external_url is not null or storage_path is not null)
);
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  division_code text references public.divisions(code),
  project_id uuid references public.projects(id) on delete cascade,
  kind text not null,
  title text not null,
  actor_id uuid references public.profiles(id),
  target_user_id uuid references public.profiles(id),
  sensitivity text not null default 'normal'
    check(sensitivity in ('normal','hr','finance')),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index activity_events_time_idx on public.activity_events(occurred_at desc);
create index activity_events_division_idx on public.activity_events(division_code,occurred_at desc);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_event_id uuid references public.activity_events(id) on delete cascade,
  kind text not null,
  title text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id,created_at desc);

create table public.workflow_stages (
  division_code text not null references public.divisions(code),
  entity_kind text not null,
  stage_code text not null,
  label text not null,
  position integer not null,
  is_terminal boolean not null default false,
  primary key(division_code,entity_kind,stage_code),
  unique(division_code,entity_kind,position)
);
insert into public.workflow_stages(division_code,entity_kind,stage_code,label,position,is_terminal) values
 ('strategy_growth','initiative','proposed','Proposed',1,false),
 ('strategy_growth','initiative','researching','Researching',2,false),
 ('strategy_growth','initiative','active','Active',3,false),
 ('strategy_growth','initiative','paused','Paused',4,false),
 ('strategy_growth','initiative','completed','Completed',5,true),
 ('legal_finance','financeRequests','draft','Draft',1,false),
 ('legal_finance','financeRequests','submitted','Submitted',2,false),
 ('legal_finance','financeRequests','review','In review',3,false),
 ('legal_finance','financeRequests','approved','Approved',4,false),
 ('legal_finance','financeRequests','rejected','Rejected',5,true),
 ('legal_finance','financeRequests','paid','Paid',6,true),
 ('human_resource','recruitment','applied','Applied',1,false),
 ('human_resource','recruitment','screening','Screening',2,false),
 ('human_resource','recruitment','interview','Interview',3,false),
 ('human_resource','recruitment','offer','Offer',4,false),
 ('human_resource','recruitment','joined','Joined',5,true),
 ('human_resource','recruitment','closed','Closed',6,true),
 ('human_resource','onboarding','not-started','Not started',1,false),
 ('human_resource','onboarding','in-progress','In progress',2,false),
 ('human_resource','onboarding','waiting','Waiting',3,false),
 ('human_resource','onboarding','complete','Complete',4,true),
 ('marketing_comms_it','content','idea','Idea',1,false),
 ('marketing_comms_it','content','producing','Producing',2,false),
 ('marketing_comms_it','content','review','In review',3,false),
 ('marketing_comms_it','content','scheduled','Scheduled',4,false),
 ('marketing_comms_it','content','published','Published',5,true),
 ('marketing_comms_it','itDelivery','planned','Planned',1,false),
 ('marketing_comms_it','itDelivery','building','Building',2,false),
 ('marketing_comms_it','itDelivery','review','Review',3,false),
 ('marketing_comms_it','itDelivery','released','Released',4,true);

create table public.initiatives (
  id uuid primary key default gen_random_uuid(),
  division_code text not null default 'strategy_growth'
    check(division_code='strategy_growth'),
  project_id uuid references public.projects(id) on delete set null,
  title text not null check(length(trim(title))>0),
  description text not null default '',
  owner_id uuid references public.profiles(id),
  horizon text not null default 'next' check(horizon in ('now','next','later')),
  stage_code text not null default 'proposed',
  priority text not null default 'medium' check(priority in ('high','medium','low')),
  next_decision text,
  decision_due_date date,
  research_sources text[] not null default '{}',
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

create table public.finance_budgets (
  id uuid primary key default gen_random_uuid(),
  division_code text not null default 'legal_finance' check(division_code='legal_finance'),
  project_id uuid references public.projects(id) on delete set null,
  title text not null check(length(trim(title))>0),
  category text not null default 'General',
  allocated_idr bigint not null default 0 check(allocated_idr>=0),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);
create table public.finance_approvers (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  granted_by uuid references public.profiles(id),
  granted_at timestamptz not null default now()
);
create function private.can_approve_finance()
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and (
    private.is_division_head('legal_finance')
    or exists(select 1 from public.finance_approvers
      where user_id=(select auth.uid()))
  )
$$;
grant execute on function private.can_approve_finance() to authenticated;
create table public.finance_requests (
  id uuid primary key default gen_random_uuid(),
  division_code text not null default 'legal_finance' check(division_code='legal_finance'),
  budget_id uuid references public.finance_budgets(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  request_kind text not null check(request_kind in ('budget','expense','legal')),
  title text not null check(length(trim(title))>0),
  description text not null default '',
  category text not null default 'General',
  amount_idr bigint not null default 0 check(amount_idr>=0),
  document_id uuid references public.documents(id) on delete set null,
  document_url text,
  due_date date,
  status text not null default 'draft',
  requester_id uuid not null default auth.uid() references public.profiles(id),
  approver_id uuid references public.profiles(id),
  decision_note text,
  decided_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  check(request_kind='expense' or status<>'paid')
);
create index finance_requests_budget_idx on public.finance_requests(budget_id,status);
create table public.finance_request_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.finance_requests(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid references public.profiles(id),
  note text,
  changed_at timestamptz not null default now()
);

create table public.hr_journeys (
  id uuid primary key default gen_random_uuid(),
  division_code text not null default 'human_resource' check(division_code='human_resource'),
  person_name text not null check(length(trim(person_name))>0),
  role_title text,
  linked_user_id uuid references public.profiles(id),
  journey_kind text not null check(journey_kind in ('recruitment','onboarding','development')),
  stage_code text not null default 'applied',
  owner_id uuid references public.profiles(id),
  next_action text,
  next_action_date date,
  confidential_notes text not null default '',
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);
create table public.hr_checklist_items (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.hr_journeys(id) on delete cascade,
  title text not null check(length(trim(title))>0),
  assignee_id uuid references public.profiles(id),
  due_date date,
  completed_at timestamptz,
  position integer not null default 0
);
create table public.marketing_deliverables (
  id uuid primary key default gen_random_uuid(),
  division_code text not null default 'marketing_comms_it'
    check(division_code='marketing_comms_it'),
  project_id uuid references public.projects(id) on delete set null,
  campaign text,
  title text not null check(length(trim(title))>0),
  work_kind text not null check(work_kind in ('campaign','content','communication','it')),
  channel text,
  owner_id uuid references public.profiles(id),
  reviewer_id uuid references public.profiles(id),
  stage_code text not null default 'idea',
  due_date date,
  publish_at timestamptz,
  asset_url text,
  published_url text,
  notes text not null default '',
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);
-- Auxiliary contextual records stay per-record, not in a shared unprotected blob.
-- Primary workflows above have typed tables and independent state guards.
create table public.division_records (
  id uuid primary key default gen_random_uuid(),
  division_code text not null references public.divisions(code),
  record_kind text not null check(record_kind in
    ('strategy_decision','strategy_dependency','hr_assignment','hr_development',
     'marketing_campaign','marketing_it_delivery','marketing_asset')),
  title text not null check(length(trim(title))>0),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);
create index division_records_kind_idx on public.division_records(division_code,record_kind);

create function private.touch_version()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at=now();
  new.version=old.version+1;
  return new;
end $$;
create trigger touch_projects before update on public.projects
  for each row execute function private.touch_version();
create trigger touch_tasks before update on public.tasks
  for each row execute function private.touch_version();
create trigger touch_milestones before update on public.milestones
  for each row execute function private.touch_version();
create trigger touch_meetings before update on public.meetings
  for each row execute function private.touch_version();
create trigger touch_initiatives before update on public.initiatives
  for each row execute function private.touch_version();
create trigger touch_finance_budgets before update on public.finance_budgets
  for each row execute function private.touch_version();
create trigger touch_finance_requests before update on public.finance_requests
  for each row execute function private.touch_version();
create trigger touch_hr_journeys before update on public.hr_journeys
  for each row execute function private.touch_version();
create trigger touch_marketing_deliverables before update on public.marketing_deliverables
  for each row execute function private.touch_version();
create trigger touch_division_records before update on public.division_records
  for each row execute function private.touch_version();

-- PostgreSQL exposes ordinary tables through PostgREST only after grants.
revoke all on all tables in schema public from anon;
grant select,insert,update,delete on all tables in schema public to authenticated;
revoke insert,update,delete on public.divisions,public.project_catalog,
  public.activity_events,public.notifications,public.finance_request_history
  from authenticated;
