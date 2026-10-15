-- Explicit access rules. Authenticated does not imply access: an active profile does.
alter table public.divisions enable row level security;
alter table public.invitations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.project_catalog enable row level security;
alter table public.project_divisions enable row level security;
alter table public.project_access enable row level security;
alter table public.tasks enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.project_dependencies enable row level security;
alter table public.milestones enable row level security;
alter table public.blockers enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_attendees enable row level security;
alter table public.decisions enable row level security;
alter table public.documents enable row level security;
alter table public.activity_events enable row level security;
alter table public.notifications enable row level security;
alter table public.workflow_stages enable row level security;
alter table public.initiatives enable row level security;
alter table public.finance_budgets enable row level security;
alter table public.finance_approvers enable row level security;
alter table public.finance_requests enable row level security;
alter table public.finance_request_history enable row level security;
alter table public.hr_journeys enable row level security;
alter table public.hr_checklist_items enable row level security;
alter table public.marketing_deliverables enable row level security;
alter table public.division_records enable row level security;

create policy divisions_read on public.divisions for select to authenticated
  using (private.active_user());
create policy invitations_admin on public.invitations for all to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy profiles_read on public.profiles for select to authenticated
  using (private.active_user());
create policy profiles_name_update on public.profiles for update to authenticated
  using (private.active_user() and id=(select auth.uid()))
  with check (private.active_user() and id=(select auth.uid()));
revoke update on public.profiles from authenticated;
grant update(full_name) on public.profiles to authenticated;
create policy memberships_read on public.memberships for select to authenticated
  using (private.active_user() and
    (user_id=(select auth.uid()) or private.is_executive() or
     private.is_division_head(division_code)));
create policy memberships_admin on public.memberships for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- Membership and catalog visibility are distinct. Full rows remain protected.
create policy catalog_read on public.project_catalog for select to authenticated
  using (private.active_user());
create policy projects_read on public.projects for select to authenticated
  using (private.can_read_project(id));
create policy projects_insert on public.projects for insert to authenticated
  with check (private.can_edit_division(division_code) and created_by=(select auth.uid()));
create policy projects_update on public.projects for update to authenticated
  using (private.can_edit_project(id))
  with check (private.can_edit_project(id));
create policy projects_delete on public.projects for delete to authenticated
  using (private.can_edit_project(id));
create function private.can_manage_project_access(p_project uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and exists (
    select 1 from public.projects p where p.id=p_project and
      (private.is_admin() or private.is_division_head(p.division_code)
        or p.lead_id=(select auth.uid()))
  )
$$;
revoke execute on function private.can_manage_project_access(uuid) from public,anon;
grant execute on function private.can_manage_project_access(uuid) to authenticated;
create policy project_divisions_read on public.project_divisions for select to authenticated
  using (private.can_read_project(project_id));
create policy project_divisions_write on public.project_divisions for all to authenticated
  using (private.can_manage_project_access(project_id))
  with check (private.can_manage_project_access(project_id));
create policy project_access_read on public.project_access for select to authenticated
  using (private.can_read_project(project_id));
create policy project_access_write on public.project_access for all to authenticated
  using (private.can_manage_project_access(project_id))
  with check (private.can_manage_project_access(project_id));

create policy tasks_read on public.tasks for select to authenticated
  using (private.can_read_project(project_id));
create policy tasks_write on public.tasks for all to authenticated
  using (private.can_edit_project(project_id) or
    (private.can_read_project(project_id) and assignee_id=(select auth.uid())))
  with check (private.can_edit_project(project_id) or
    (private.can_read_project(project_id) and assignee_id=(select auth.uid())));
create policy task_dependencies_read on public.task_dependencies for select to authenticated
  using (exists(select 1 from public.tasks t
    where t.id=task_id and private.can_read_project(t.project_id)));
create policy task_dependencies_write on public.task_dependencies for all to authenticated
  using (exists(select 1 from public.tasks t
    where t.id=task_id and private.can_edit_project(t.project_id)))
  with check (exists(select 1 from public.tasks t
    where t.id=task_id and private.can_edit_project(t.project_id)));
create policy project_dependencies_read on public.project_dependencies for select to authenticated
  using (private.can_read_project(project_id));
create policy project_dependencies_write on public.project_dependencies for all to authenticated
  using (private.can_edit_project(project_id))
  with check (private.can_edit_project(project_id));
create policy milestones_read on public.milestones for select to authenticated
  using (private.can_read_project(project_id));
create policy milestones_write on public.milestones for all to authenticated
  using (private.can_edit_project(project_id))
  with check (private.can_edit_project(project_id));
create policy blockers_read on public.blockers for select to authenticated
  using (private.can_read_project(project_id));
create policy blockers_write on public.blockers for all to authenticated
  using (private.can_edit_project(project_id) or
    (private.can_read_project(project_id) and owner_id=(select auth.uid())))
  with check (private.can_edit_project(project_id) or
    (private.can_read_project(project_id) and owner_id=(select auth.uid())));

create function private.can_read_meeting(p_meeting uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and exists(select 1 from public.meetings m where m.id=p_meeting and
    (m.organizer_id=(select auth.uid()) or
     (m.project_id is not null and private.can_read_project(m.project_id)) or
     (m.division_code is not null and private.can_read_division(m.division_code))))
$$;
create function private.can_edit_meeting(p_meeting uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and exists(select 1 from public.meetings m where m.id=p_meeting and
    (private.is_admin() or m.organizer_id=(select auth.uid()) or
     (m.project_id is not null and private.can_edit_project(m.project_id)) or
     (m.division_code is not null and private.is_division_head(m.division_code))))
$$;
grant execute on function private.can_read_meeting(uuid),private.can_edit_meeting(uuid)
  to authenticated;
create policy meetings_read on public.meetings for select to authenticated
  using (private.can_read_meeting(id));
create policy meetings_insert on public.meetings for insert to authenticated
  with check (organizer_id=(select auth.uid()) and private.active_user() and
    ((project_id is not null and private.can_read_project(project_id)) or
     (division_code is not null and private.can_read_division(division_code)) or
     (project_id is null and division_code is null)));
create policy meetings_change on public.meetings for all to authenticated
  using (private.can_edit_meeting(id))
  with check (private.active_user() and
    (private.is_admin() or organizer_id=(select auth.uid()) or
     (project_id is not null and private.can_edit_project(project_id)) or
     (division_code is not null and private.is_division_head(division_code))) and
    ((project_id is not null and private.can_read_project(project_id)) or
     (division_code is not null and private.can_read_division(division_code)) or
     (project_id is null and division_code is null and organizer_id=(select auth.uid()))));
create policy attendees_read on public.meeting_attendees for select to authenticated
  using (private.can_read_meeting(meeting_id));
create policy attendees_write on public.meeting_attendees for all to authenticated
  using (private.can_edit_meeting(meeting_id))
  with check (private.can_edit_meeting(meeting_id));
create policy decisions_read on public.decisions for select to authenticated
  using ((project_id is not null and private.can_read_project(project_id)) or
    (division_code is not null and private.can_read_division(division_code)));
create policy decisions_insert on public.decisions for insert to authenticated
  with check (recorded_by=(select auth.uid()) and
    ((project_id is not null and private.can_edit_project(project_id)) or
     (division_code is not null and private.can_edit_division(division_code))));
create policy decisions_update on public.decisions for update to authenticated
  using (private.active_user() and
    (private.is_admin() or recorded_by=(select auth.uid())))
  with check (private.active_user() and
    (private.is_admin() or recorded_by=(select auth.uid())));
create policy decisions_delete on public.decisions for delete to authenticated
  using (private.is_admin());
create function private.guard_decision_scope()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.id<>old.id or new.recorded_by<>old.recorded_by or
     new.project_id is distinct from old.project_id or
     new.division_code is distinct from old.division_code then
    raise exception 'Record a new decision to change its scope or author.';
  end if;
  return new;
end $$;
create trigger guard_decision_scope before update on public.decisions
  for each row execute function private.guard_decision_scope();

create function private.can_read_sensitive(p_class text)
returns boolean language sql stable security definer set search_path = '' as $$
  select case p_class
    when 'hr' then private.is_admin() or private.member_role('human_resource') is not null
    when 'finance' then private.is_executive() or
      private.member_role('legal_finance') is not null or private.can_approve_finance()
    else true end
$$;
create function private.can_read_document(p_document uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.documents d where d.id=p_document and
    private.active_user() and private.can_read_sensitive(d.sensitivity) and
    ((d.project_id is not null and private.can_read_project(d.project_id)) or
     (d.division_code is not null and private.can_read_division(d.division_code)) or
     (d.sensitivity='finance' and private.can_approve_finance())))
$$;
create function private.can_edit_document(p_document uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.active_user() and exists(select 1 from public.documents d where d.id=p_document and
    private.can_read_sensitive(d.sensitivity) and
    (private.is_admin() or d.owner_id=(select auth.uid()) or
     (d.project_id is not null and private.can_edit_project(d.project_id)) or
     (d.division_code is not null and private.is_division_head(d.division_code))))
$$;
grant execute on function private.can_read_sensitive(text),private.can_read_document(uuid),
  private.can_edit_document(uuid) to authenticated;
create policy documents_read on public.documents for select to authenticated
  using (private.can_read_document(id));
create policy documents_insert on public.documents for insert to authenticated
  with check (owner_id=(select auth.uid()) and private.can_read_sensitive(sensitivity) and
    ((project_id is not null and private.can_edit_project(project_id)) or
     (division_code is not null and private.can_edit_division(division_code))));
create policy documents_change on public.documents for all to authenticated
  using (private.can_edit_document(id))
  with check (private.can_edit_document(id));
create function private.guard_document_scope()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.id<>old.id or new.owner_id<>old.owner_id or
     new.project_id is distinct from old.project_id or
     new.division_code is distinct from old.division_code or
     new.sensitivity<>old.sensitivity or
     new.storage_path is distinct from old.storage_path then
    raise exception 'Document scope, sensitivity, and owner cannot be changed.';
  end if;
  return new;
end $$;
create trigger guard_document_scope before update on public.documents
  for each row execute function private.guard_document_scope();

create policy activity_read on public.activity_events for select to authenticated
  using (private.active_user() and
    (target_user_id=(select auth.uid()) or
      (private.can_read_sensitive(sensitivity) and
        ((project_id is not null and private.can_read_project(project_id)) or
         (division_code is not null and private.can_read_division(division_code))))));
create policy notifications_read on public.notifications for select to authenticated
  using (user_id=(select auth.uid()) and private.active_user());
create policy notifications_update on public.notifications for update to authenticated
  using (user_id=(select auth.uid()) and private.active_user())
  with check (user_id=(select auth.uid()) and private.active_user());
revoke update on public.notifications from authenticated;
grant update(read_at) on public.notifications to authenticated;

create policy stages_read on public.workflow_stages for select to authenticated
  using (private.active_user());
create policy stages_write on public.workflow_stages for all to authenticated
  using (private.is_division_head(division_code))
  with check (private.is_division_head(division_code));
create policy initiatives_read on public.initiatives for select to authenticated
  using (private.can_read_division('strategy_growth') or
    (project_id is not null and private.can_read_project(project_id)));
create policy initiatives_write on public.initiatives for all to authenticated
  using (private.can_edit_division('strategy_growth'))
  with check (private.can_edit_division('strategy_growth'));

-- Finance details do not appear in the cross-division catalog.
create policy budgets_read on public.finance_budgets for select to authenticated
  using (private.can_read_sensitive('finance'));
create policy budgets_write on public.finance_budgets for all to authenticated
  using (private.is_division_head('legal_finance'))
  with check (private.is_division_head('legal_finance'));
create policy finance_approvers_read on public.finance_approvers for select to authenticated
  using (private.active_user() and
    (private.can_approve_finance() or user_id=(select auth.uid())));
create policy finance_approvers_write on public.finance_approvers for all to authenticated
  using (private.is_division_head('legal_finance'))
  with check (private.is_division_head('legal_finance'));
create policy requests_read on public.finance_requests for select to authenticated
  using (private.active_user() and
    (private.can_read_sensitive('finance') or requester_id=(select auth.uid())));
create policy requests_insert on public.finance_requests for insert to authenticated
  with check (private.active_user() and requester_id=(select auth.uid())
    and status in ('draft','submitted'));
create policy requests_update on public.finance_requests for update to authenticated
  using (private.active_user() and
    (private.can_approve_finance() or requester_id=(select auth.uid())))
  with check (private.active_user() and
    (private.can_approve_finance() or requester_id=(select auth.uid())));
create policy requests_delete on public.finance_requests for delete to authenticated
  using (private.active_user() and requester_id=(select auth.uid()) and status='draft');
create policy request_history_read on public.finance_request_history for select to authenticated
  using (private.active_user() and exists(select 1 from public.finance_requests r
    where r.id=request_id and (private.can_read_sensitive('finance') or
      r.requester_id=(select auth.uid()))));

-- HR candidate details and notes are never exposed to another division.
create policy hr_journeys_read on public.hr_journeys for select to authenticated
  using (private.can_read_sensitive('hr'));
create policy hr_journeys_write on public.hr_journeys for all to authenticated
  using (private.can_edit_division('human_resource'))
  with check (private.can_edit_division('human_resource'));
create policy hr_checklist_read on public.hr_checklist_items for select to authenticated
  using (private.can_read_sensitive('hr'));
create policy hr_checklist_write on public.hr_checklist_items for all to authenticated
  using (private.can_edit_division('human_resource'))
  with check (private.can_edit_division('human_resource'));
create policy marketing_read on public.marketing_deliverables for select to authenticated
  using (private.can_read_division('marketing_comms_it') or
    (project_id is not null and private.can_read_project(project_id)));
create policy marketing_write on public.marketing_deliverables for all to authenticated
  using (private.can_edit_division('marketing_comms_it'))
  with check (private.can_edit_division('marketing_comms_it'));
create policy division_records_read on public.division_records for select to authenticated
  using (case when division_code='human_resource'
    then private.can_read_sensitive('hr')
    else private.can_read_division(division_code) end);
create policy division_records_write on public.division_records for all to authenticated
  using (private.can_edit_division(division_code))
  with check (private.can_edit_division(division_code));

create function private.validate_division_record()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (new.record_kind like 'strategy_%' and new.division_code<>'strategy_growth')
    or (new.record_kind like 'hr_%' and new.division_code<>'human_resource')
    or (new.record_kind like 'marketing_%' and new.division_code<>'marketing_comms_it') then
    raise exception 'Record type does not belong to this division.';
  end if;
  if tg_op='UPDATE' and (new.id<>old.id or new.division_code<>old.division_code
     or new.record_kind<>old.record_kind or new.created_by<>old.created_by) then
    raise exception 'Record identity cannot be changed.';
  end if;
  return new;
end $$;
create trigger validate_division_record before insert or update
  on public.division_records for each row execute function private.validate_division_record();

create function private.validate_stage()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_division text; v_kind text; v_stage text;
begin
  if tg_table_name='initiatives' then
    v_division='strategy_growth'; v_kind='initiative'; v_stage=new.stage_code;
  elsif tg_table_name='hr_journeys' then
    v_division='human_resource';
    v_kind=case when new.journey_kind='recruitment' then 'recruitment' else 'onboarding' end;
    v_stage=new.stage_code;
  elsif tg_table_name='marketing_deliverables' then
    v_division='marketing_comms_it';
    v_kind=case when new.work_kind='it' then 'itDelivery' else 'content' end;
    v_stage=new.stage_code;
  else return new; end if;
  if not exists(select 1 from public.workflow_stages s
    where s.division_code=v_division and s.entity_kind=v_kind and s.stage_code=v_stage) then
    raise exception 'Choose an existing workflow stage.';
  end if;
  return new;
end $$;
create trigger validate_initiative_stage before insert or update of stage_code
  on public.initiatives for each row execute function private.validate_stage();
create trigger validate_hr_stage before insert or update of stage_code,journey_kind
  on public.hr_journeys for each row execute function private.validate_stage();
create trigger validate_marketing_stage before insert or update of stage_code,work_kind
  on public.marketing_deliverables for each row execute function private.validate_stage();

-- Prevent direct role, ownership, division, and status escalation through generic updates.
create function private.guard_project_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.division_code<>old.division_code and not private.is_admin() then
    raise exception 'Project owning division cannot be changed here.';
  end if;
  if new.created_by<>old.created_by or new.id<>old.id then
    raise exception 'Project identity cannot be changed.';
  end if;
  return new;
end $$;
create trigger guard_project_update before update on public.projects
  for each row execute function private.guard_project_update();

create function private.guard_task_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.id<>old.id or new.created_by<>old.created_by then
    raise exception 'Task identity cannot be changed.';
  end if;
  if new.project_id<>old.project_id and
     (not private.can_edit_project(old.project_id)
      or not private.can_edit_project(new.project_id)) then
    raise exception 'Only a project editor may move a task between projects.';
  end if;
  return new;
end $$;
create trigger guard_task_update before update on public.tasks
  for each row execute function private.guard_task_update();

create function private.guard_finance_request()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_allocated bigint;
  v_other_balance bigint;
begin
  if not exists(select 1 from public.workflow_stages s
    where s.division_code='legal_finance' and s.entity_kind='financeRequests'
      and s.stage_code=new.status) then
    raise exception 'Choose an existing finance workflow stage.';
  end if;
  if tg_op='INSERT' then
    if new.requester_id<>(select auth.uid()) then
      raise exception 'Requester must be the signed-in member.';
    end if;
    if new.status not in ('draft','submitted') then
      raise exception 'New requests must begin as draft or submitted.';
    end if;
    if new.request_kind<>'legal' and new.budget_id is null then
      raise exception 'Choose a budget line for a financial request.';
    end if;
    new.approver_id=null;
    new.decided_at=null;
    new.paid_at=null;
    return new;
  end if;
  if new.request_kind<>'legal' and new.budget_id is null then
    raise exception 'Choose a budget line for a financial request.';
  end if;
  if new.requester_id<>old.requester_id or new.id<>old.id then
    raise exception 'Request identity cannot be changed.';
  end if;
  if new.status=old.status and
     (new.approver_id is distinct from old.approver_id or
      new.decided_at is distinct from old.decided_at or
      new.paid_at is distinct from old.paid_at) then
    raise exception 'Decision metadata is set by the approval transition.';
  end if;
  if old.status in ('approved','rejected','paid') and
     (new.title,new.description,new.request_kind,new.category,new.amount_idr,
       new.budget_id,new.project_id,new.document_id,new.document_url)
       is distinct from
     (old.title,old.description,old.request_kind,old.category,old.amount_idr,
       old.budget_id,old.project_id,old.document_id,old.document_url) then
    raise exception 'Decided requests cannot be edited.';
  end if;
  if new.status<>old.status then
    if new.status='submitted' then
      if old.status<>'draft' or new.requester_id<>(select auth.uid()) then
        raise exception 'Only the requester may submit a draft.';
      end if;
      new.approver_id=null;
      new.decided_at=null;
      new.paid_at=null;
    elsif new.status in ('approved','rejected') then
      if old.status in ('draft','approved','rejected','paid') or
         not private.can_approve_finance()
         or new.requester_id=(select auth.uid()) then
        raise exception 'A designated approver other than the requester must decide this request.';
      end if;
      if new.status='approved' and new.request_kind='expense' then
        select allocated_idr into v_allocated from public.finance_budgets
          where id=new.budget_id for update;
        if not found then raise exception 'The budget line is unavailable.'; end if;
        select coalesce(sum(case
          when request_kind='budget' then amount_idr
          when request_kind='expense' then -amount_idr
          else 0 end),0) into v_other_balance
          from public.finance_requests
          where budget_id=new.budget_id and id<>new.id
            and status in ('approved','paid');
        if v_allocated+v_other_balance-new.amount_idr<0 then
          raise exception 'Approval would exceed the remaining budget.';
        end if;
      end if;
      new.approver_id=(select auth.uid());
      new.decided_at=now();
      new.paid_at=null;
    elsif new.status='paid' then
      if old.status<>'approved' or new.request_kind<>'expense'
         or not private.can_approve_finance()
         or new.requester_id=(select auth.uid()) then
        raise exception 'A designated approver other than the requester must mark this expense paid.';
      end if;
      new.decided_at=old.decided_at;
      new.paid_at=now();
    elsif new.status not in ('draft','submitted') then
      if old.status in ('draft','approved','rejected','paid') or
         not private.can_approve_finance() or
         new.requester_id=(select auth.uid()) then
        raise exception 'Only another designated approver may advance review.';
      end if;
      new.approver_id=(select auth.uid());
      new.decided_at=null;
      new.paid_at=null;
    else
      raise exception 'Invalid request status transition.';
    end if;
    insert into public.finance_request_history(request_id,from_status,to_status,actor_id,note)
      values(new.id,old.status,new.status,(select auth.uid()),new.decision_note);
  elsif old.status<>'draft' and not private.can_approve_finance() then
    raise exception 'Only Finance may edit a submitted request.';
  end if;
  return new;
end $$;
create trigger guard_finance_request_insert before insert on public.finance_requests
  for each row execute function private.guard_finance_request();
create trigger guard_finance_request_update before update on public.finance_requests
  for each row execute function private.guard_finance_request();
create function private.guard_budget_allocation()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_request_balance bigint;
begin
  if new.allocated_idr<old.allocated_idr then
    select coalesce(sum(case
      when request_kind='budget' then amount_idr
      when request_kind='expense' then -amount_idr
      else 0 end),0) into v_request_balance
      from public.finance_requests
      where budget_id=new.id and status in ('approved','paid');
    if new.allocated_idr+v_request_balance<0 then
      raise exception 'Allocation cannot fall below approved and paid spending.';
    end if;
  end if;
  return new;
end $$;
create trigger guard_budget_allocation before update on public.finance_budgets
  for each row execute function private.guard_budget_allocation();
create function public.transition_finance_request(
  p_request_id uuid,p_status text,p_expected_version integer,p_note text default null
) returns public.finance_requests
language plpgsql security invoker set search_path = '' as $$
declare result public.finance_requests;
begin
  update public.finance_requests
     set status=p_status,decision_note=p_note
   where id=p_request_id and version=p_expected_version
   returning * into result;
  if not found then raise exception 'Request changed or is unavailable. Refresh and retry.'; end if;
  return result;
end $$;
grant execute on function public.transition_finance_request(uuid,text,integer,text)
  to authenticated;

create function private.validate_task_dependency()
returns trigger language plpgsql security definer set search_path = '' as $$
declare a_project uuid; b_project uuid;
begin
  select project_id into a_project from public.tasks where id=new.task_id;
  select project_id into b_project from public.tasks where id=new.depends_on_id;
  if a_project<>b_project then
    raise exception 'Task dependencies must belong to one project.';
  end if;
  if exists (
    with recursive chain(id) as (
      select new.depends_on_id
      union
      select d.depends_on_id from public.task_dependencies d
        join chain c on c.id=d.task_id
    )
    select 1 from chain where id=new.task_id
  ) then
    raise exception 'Task dependency cycle is not allowed.';
  end if;
  return new;
end $$;
create trigger validate_task_dependency before insert or update
  on public.task_dependencies for each row execute function private.validate_task_dependency();

create function private.record_meaningful_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_division text; v_project uuid; v_kind text; v_title text;
  v_target uuid; v_sensitivity text := 'normal';
  v_event uuid;
begin
  if tg_table_name='projects' then
    if tg_op='INSERT' then v_kind='project_created'; v_title='Project created: '||new.title;
    elsif new.status is distinct from old.status then
      v_kind='project_status_changed'; v_title='Project status: '||new.title;
    else return new; end if;
    v_project=new.id; v_division=new.division_code;
  elsif tg_table_name='tasks' then
    if tg_op='INSERT' then
      v_kind='task_assigned'; v_title='Task assigned: '||new.title;
      v_target=new.assignee_id;
    elsif new.status='done' and old.status<>'done' then
      v_kind='task_completed'; v_title='Task completed: '||new.title;
    elsif new.assignee_id is distinct from old.assignee_id then
      v_kind='task_assigned'; v_title='Task assigned: '||new.title;
      v_target=new.assignee_id;
    elsif new.due_date is distinct from old.due_date then
      v_kind='task_due_changed'; v_title='Task rescheduled: '||new.title;
      v_target=new.assignee_id;
    else return new; end if;
    v_project=new.project_id;
    select division_code into v_division from public.projects where id=v_project;
  elsif tg_table_name='milestones' then
    if tg_op<>'UPDATE' or new.status<>'reached' or old.status='reached' then return new; end if;
    v_kind='milestone_reached'; v_title='Milestone reached: '||new.title;
    v_project=new.project_id;
    select division_code into v_division from public.projects where id=v_project;
  elsif tg_table_name='blockers' then
    if tg_op='INSERT' then
      v_kind='blocker_opened'; v_title='Blocker opened: '||new.title; v_target=new.owner_id;
    elsif new.resolved_at is not null and old.resolved_at is null then
      v_kind='blocker_resolved'; v_title='Blocker resolved: '||new.title;
    else return new; end if;
    v_project=new.project_id;
    select division_code into v_division from public.projects where id=v_project;
  elsif tg_table_name='decisions' then
    v_kind='decision_recorded'; v_title='Decision recorded';
    v_project=new.project_id; v_division=new.division_code;
  elsif tg_table_name='documents' then
    v_kind='document_added'; v_title='Document added: '||new.title;
    v_project=new.project_id; v_division=new.division_code;
    v_sensitivity=new.sensitivity;
  elsif tg_table_name='meetings' then
    if tg_op<>'UPDATE' or new.status<>'completed' or old.status='completed' then return new; end if;
    v_kind='meeting_completed'; v_title='Meeting completed: '||new.title;
    v_project=new.project_id; v_division=new.division_code;
  elsif tg_table_name='finance_requests' then
    if tg_op<>'UPDATE' or new.status=old.status then return new; end if;
    v_kind='finance_'||new.status; v_title='Request '||new.status||': '||new.title;
    v_division='legal_finance'; v_sensitivity='finance'; v_target=new.requester_id;
  elsif tg_table_name='initiatives' then
    if tg_op='INSERT' then v_kind='initiative_created';
    elsif new.stage_code is distinct from old.stage_code then v_kind='initiative_stage_changed';
    else return new; end if;
    v_title='Initiative updated: '||new.title;
    v_project=new.project_id; v_division='strategy_growth';
  elsif tg_table_name='hr_journeys' then
    if tg_op='INSERT' then v_kind='hr_journey_started';
    elsif new.stage_code is distinct from old.stage_code then v_kind='hr_stage_changed';
    else return new; end if;
    v_title='HR journey updated'; v_division='human_resource'; v_sensitivity='hr';
  elsif tg_table_name='marketing_deliverables' then
    if tg_op='INSERT' then v_kind='deliverable_created';
    elsif new.stage_code is distinct from old.stage_code then v_kind='deliverable_stage_changed';
    else return new; end if;
    v_title='Delivery updated: '||new.title;
    v_project=new.project_id; v_division='marketing_comms_it';
  elsif tg_table_name='division_records' then
    if tg_op='INSERT' then v_kind='division_record_created';
    elsif new.payload is distinct from old.payload then v_kind='division_record_updated';
    else return new; end if;
    v_title='Updated: '||new.title;
    v_division=new.division_code;
    if v_division='human_resource' then v_sensitivity='hr'; end if;
  else return new;
  end if;
  insert into public.activity_events
    (division_code,project_id,kind,title,actor_id,target_user_id,sensitivity)
    values(v_division,v_project,v_kind,v_title,(select auth.uid()),v_target,v_sensitivity)
    returning id into v_event;
  if v_target is not null and v_target is distinct from (select auth.uid()) then
    insert into public.notifications(user_id,activity_event_id,kind,title)
      values(v_target,v_event,v_kind,v_title);
  end if;
  return new;
end $$;
create trigger event_project after insert or update on public.projects
  for each row execute function private.record_meaningful_change();
create trigger event_task after insert or update on public.tasks
  for each row execute function private.record_meaningful_change();
create trigger event_milestone after update on public.milestones
  for each row execute function private.record_meaningful_change();
create trigger event_blocker after insert or update on public.blockers
  for each row execute function private.record_meaningful_change();
create trigger event_decision after insert on public.decisions
  for each row execute function private.record_meaningful_change();
create trigger event_document after insert on public.documents
  for each row execute function private.record_meaningful_change();
create trigger event_meeting after update on public.meetings
  for each row execute function private.record_meaningful_change();
create trigger event_finance after update on public.finance_requests
  for each row execute function private.record_meaningful_change();
create trigger event_initiative after insert or update on public.initiatives
  for each row execute function private.record_meaningful_change();
create trigger event_hr after insert or update on public.hr_journeys
  for each row execute function private.record_meaningful_change();
create trigger event_marketing after insert or update on public.marketing_deliverables
  for each row execute function private.record_meaningful_change();
create trigger event_division_record after insert or update on public.division_records
  for each row execute function private.record_meaningful_change();

-- Browser uploads first create a document row, then upload a private object
-- at that row's storage_path. The same document policy gates read and delete.
insert into storage.buckets(id,name,public,file_size_limit)
values('workspace-files','workspace-files',false,10485760)
on conflict(id) do update set public=false,file_size_limit=10485760;
create policy workspace_files_read on storage.objects for select to authenticated
  using(bucket_id='workspace-files' and exists(
    select 1 from public.documents d where d.storage_path=name
      and private.can_read_document(d.id)));
create policy workspace_files_insert on storage.objects for insert to authenticated
  with check(bucket_id='workspace-files' and exists(
    select 1 from public.documents d where d.storage_path=name
      and d.owner_id=(select auth.uid()) and private.can_edit_document(d.id)));
create policy workspace_files_delete on storage.objects for delete to authenticated
  using(bucket_id='workspace-files' and exists(
    select 1 from public.documents d where d.storage_path=name
      and private.can_edit_document(d.id)));
