-- DWDG'ONE on Supabase, migration 1 of 3: foundation.
-- Creates the divisions list, the people table (the link between a Google sign-in and a person in the prototype),
-- the helper functions that every row level security policy uses, and the invite-only sign-in hook.
-- Tables for all other data are in migration 2 (generated from supabase/schema-spec.mjs); the load/save functions are in migration 3.
--
-- Roles in the prototype (core/data.js): president 5, vp 4, director 3, codirector 2, member 1, board 0, plus an `admin` flag that ranks 9.
-- Divisions: ee, mcit, hr, fnl, sng, cons.

create schema if not exists app;
create schema if not exists private;
revoke all on schema app from public;
revoke all on schema private from public;
grant usage on schema app to authenticated, service_role;

-- Same bootstrap idea as database/migrations (v0.3): the first admin's e-mail is a deployment setting, never in code.
create table if not exists private.bootstrap_settings (key text primary key, value text not null);

-- ---------- divisions (the six workspaces; constants in core/data.js) ----------
create table public.divisions (
  id text primary key,
  name text not null unique,
  short text not null,
  icon text not null,
  sort_order integer not null unique
);
insert into public.divisions (id, name, short, icon, sort_order) values
  ('ee',   'External Engagement',          'EE',   'div-ee',   1),
  ('mcit', 'Marketing Communication & IT', 'MCIT', 'div-mcit', 2),
  ('hr',   'Human Resources',              'HR',   'div-hr',   3),
  ('fnl',  'Finance & Legal',              'FnL',  'div-fnl',  4),
  ('sng',  'Strategy & Growth',            'SnG',  'div-sng',  5),
  ('cons', 'Consulting',                   'Cons', 'div-cons', 6);
alter table public.divisions enable row level security;
create policy divisions_select on public.divisions for select to authenticated using (true);
grant select on public.divisions to authenticated, service_role;

-- ---------- people ----------
-- doc is the prototype's person record unchanged. auth_user_id and email are the only columns that are not in doc:
-- they connect a Google account to the person (the prototype has no e-mail on a person).
create table public.people (
  id text primary key,
  pos integer not null default 0,
  doc json not null,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  email text unique check (email = lower(email)),
  div text generated always as (doc->>'div') stored references public.divisions (id) deferrable initially deferred,
  role text generated always as (doc->>'role') stored
    check (role in ('president','vp','director','codirector','member','board')),
  status text generated always as (doc->>'status') stored,
  is_admin boolean generated always as ((doc->>'admin')::boolean) stored,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create index people_div_idx on public.people (div);
create index people_role_idx on public.people (role);

-- ---------- helpers used by policies ----------
-- All are `security definer` with an empty search_path: they read public.people without being blocked by its own policies.
create function app.me_id() returns text language sql stable security definer set search_path = '' as $$
  select id from public.people where auth_user_id = auth.uid() $$;
create function app.me_div() returns text language sql stable security definer set search_path = '' as $$
  select div from public.people where auth_user_id = auth.uid() $$;
create function app.me_role() returns text language sql stable security definer set search_path = '' as $$
  select role from public.people where auth_user_id = auth.uid() $$;
create function app.me_active() returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select status = 'active' from public.people where auth_user_id = auth.uid()), false) $$;
create function app.me_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select status = 'active' and coalesce(is_admin, false) from public.people where auth_user_id = auth.uid()), false) $$;
create function app.me_email() returns text language sql stable set search_path = '' as $$
  select lower(coalesce(auth.jwt()->>'email', '')) $$;

create function app.base_rank(r text) returns integer language sql immutable set search_path = '' as $$
  select case r when 'president' then 5 when 'vp' then 4 when 'director' then 3 when 'codirector' then 2 when 'member' then 1 else 0 end $$;
-- rank(p) in core/app.js: the admin flag outranks everything.
create function app.rank() returns integer language sql stable set search_path = '' as $$
  select case when app.me_admin() then 9 else app.base_rank(app.me_role()) end $$;

create function app.is_board() returns boolean language sql stable set search_path = '' as $$
  select app.me_active() and app.me_role() = 'board' $$;
-- isTop: President or Vice President.
create function app.is_top() returns boolean language sql stable set search_path = '' as $$
  select app.me_active() and app.me_role() in ('president', 'vp') $$;
create function app.is_top_or_admin() returns boolean language sql stable set search_path = '' as $$
  select app.is_top() or app.me_admin() $$;
-- visibleDivs(p): admin, President, VP and Board see every division; everyone else only their own.
create function app.sees_div(d text) returns boolean language sql stable set search_path = '' as $$
  select d is not null and app.me_active()
     and (app.me_admin() or app.me_role() in ('president', 'vp', 'board') or d = app.me_div()) $$;
-- "Board accounts are read-only" (screens/accounts.js can()).
create function app.can_write() returns boolean language sql stable set search_path = '' as $$
  select app.me_active() and not app.is_board() $$;
create function app.is_hr_staff() returns boolean language sql stable set search_path = '' as $$
  select app.me_active() and app.me_div() = 'hr' $$;
-- hrLead: HR Director and Co-Directors.
create function app.hr_lead() returns boolean language sql stable set search_path = '' as $$
  select app.is_hr_staff() and app.base_rank(app.me_role()) >= 2 $$;
-- unitLead(p, unit): same division and rank 2 or more.
create function app.unit_lead(u text) returns boolean language sql stable set search_path = '' as $$
  select u is not null and app.me_active() and app.me_div() = u and app.rank() >= 2 $$;
-- canMembers / reviewer in screens/accounts.js.
create function app.can_members() returns boolean language sql stable set search_path = '' as $$
  select app.me_active() and (app.is_top_or_admin() or app.hr_lead() or app.me_role() = 'director') $$;
create function app.acct_manage() returns boolean language sql stable set search_path = '' as $$
  select app.me_active() and (app.is_top_or_admin() or app.hr_lead()) $$;

-- The next three read tables that are created in migration 2, so they are plpgsql (checked when called, not when created).
-- canSeeProject (screens/plan.js): organisation-wide, my division, lead or PM, in the team, a joint project run by another
-- division but joined by someone from a division I see, or I own one of its tasks.
create function app.can_see_project(pid text) returns boolean language plpgsql stable security definer set search_path = '' as $$
declare me text := app.me_id();
begin
  if not app.me_active() then return false; end if;
  return exists (
    select 1 from public.projects p where p.id = pid and (
      coalesce(p.org, false) or app.sees_div(p.div) or p.lead = me or p.pm = me
      or exists (select 1 from json_array_elements(coalesce(p.doc->'team', '[]'::json)) x
                 where x->>'id' = me and coalesce(x->>'state', '') <> 'declined')
      or exists (select 1 from json_array_elements(coalesce(p.doc->'team', '[]'::json)) x
                 join public.people pp on pp.id = x->>'id'
                 where x->>'state' = 'joined' and pp.div is distinct from p.div and app.sees_div(pp.div))
      or exists (select 1 from public.tasks t where t.project = p.id and t.owner = me and not coalesce(t.trashed, false))));
end $$;
create function app.is_project_lead(pid text) returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  return app.me_active() and exists (select 1 from public.projects p where p.id = pid and (p.lead = app.me_id() or p.pm = app.me_id()));
end $$;
-- A person's assessment can be read by the reviewer named for them in the cycle roster.
create function app.hr_reviews(cyc text, who text) returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  return app.me_active() and exists (
    select 1 from public.hr_cycles c, json_array_elements(coalesce(c.doc->'roster', '[]'::json)) r
    where c.id = cyc and r->>'p' = who and r->>'reviewer' = app.me_id());
end $$;

-- updated_at / updated_by on every write.
create function app.touch() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
create trigger people_touch before update on public.people for each row execute function app.touch();

-- ---------- people: who may change what ----------
-- The row policy decides who may touch a person row; this trigger decides which fields (screens/accounts.js can()):
--   role, division, admin, board and status change only through HR leads and Admin (transfer), President, VP and Admin
--   (appointments), or a Director pausing/restoring someone of equal or lower rank. Nobody changes their own authority.
--   Direct SQL and the service role (auth.uid() is null) are not restricted, which is what the data-move script needs.
create function app.people_guard() returns trigger language plpgsql set search_path = '' as $$
declare
  priv_changed boolean;
begin
  if auth.uid() is null or current_setting('app.linking', true) = 'on' then return new; end if;
  if tg_op = 'INSERT' then
    if not (app.me_admin() or app.hr_lead() or app.is_top()) then
      raise exception 'Not allowed to add people' using errcode = '42501';
    end if;
    return new;
  end if;
  new.auth_user_id := old.auth_user_id;   -- linking is done only by public.link_current_user()
  new.email := old.email;
  priv_changed := (new.doc->>'role') is distinct from (old.doc->>'role')
               or (new.doc->>'div') is distinct from (old.doc->>'div')
               or coalesce((new.doc->>'admin')::boolean, false) is distinct from coalesce((old.doc->>'admin')::boolean, false)
               or coalesce((new.doc->>'board')::boolean, false) is distinct from coalesce((old.doc->>'board')::boolean, false)
               or (new.doc->>'status') is distinct from (old.doc->>'status');
  if not priv_changed then return new; end if;
  if old.id = app.me_id() and not app.me_admin() then
    raise exception 'You cannot change your own authority' using errcode = '42501';
  end if;
  if app.me_admin() or app.is_top() or app.hr_lead() then return new; end if;
  -- Director: only pause / restore (status), never a person above their own rank.
  if app.me_role() = 'director'
     and (new.doc->>'role') is not distinct from (old.doc->>'role')
     and (new.doc->>'div') is not distinct from (old.doc->>'div')
     and coalesce((new.doc->>'admin')::boolean, false) = coalesce((old.doc->>'admin')::boolean, false)
     and app.base_rank(old.role) <= app.base_rank('director') then
    return new;
  end if;
  raise exception 'Not allowed to change this person''s role, division or status' using errcode = '42501';
end $$;
create trigger people_guard before insert or update on public.people for each row execute function app.people_guard();

alter table public.people enable row level security;
-- The whole directory is visible to active people; a person who is not active yet (waiting for approval) sees only themselves.
create policy people_select on public.people for select to authenticated
  using (id = app.me_id() or app.me_active());
create policy people_insert on public.people for insert to authenticated
  with check (app.can_write() and (app.me_admin() or app.hr_lead() or app.is_top()));
-- Everyone edits their own profile; changes to someone else come from Admin, President, VP, HR leads and Directors (people_guard limits the fields).
create policy people_update on public.people for update to authenticated
  using (id = app.me_id() or (app.can_write() and (app.acct_manage() or app.me_role() = 'director')))
  with check (id = app.me_id() or (app.can_write() and (app.acct_manage() or app.me_role() = 'director')));
create policy people_delete on public.people for delete to authenticated
  using (app.me_admin());
grant select, insert, update, delete on public.people to authenticated, service_role;

-- ---------- sign-in: invite only ----------
-- Connects the signed-in Google account to a person. Order: already linked -> same e-mail on a person -> a pending invitation
-- (creates the waiting person the prototype creates when an invitation is accepted).
create function public.link_current_user() returns json language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  mail text := lower(coalesce(auth.jwt()->>'email', ''));
  pid text;
  inv json;
  nextpos integer;
  nm text;
begin
  if uid is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  perform set_config('app.linking', 'on', true);   -- lets people_guard accept the link/insert below (this transaction only)
  select id into pid from public.people where auth_user_id = uid;
  if found then return json_build_object('person', pid, 'created', false); end if;
  select id into pid from public.people where email = mail and auth_user_id is null;
  if found then
    update public.people set auth_user_id = uid where id = pid;
    return json_build_object('person', pid, 'created', false);
  end if;
  select i.doc into inv from public.acct_invites i
   where lower(i.email) = mail and i.state = 'pending'
     and (i.doc->>'expires' is null or i.doc->>'expires' >= to_char(current_date, 'YYYY-MM-DD'))
   order by i.pos limit 1;
  if inv is null then
    raise exception 'This account has not been invited' using errcode = '42501';
  end if;
  nm := coalesce(inv->>'name', mail);
  pid := coalesce(inv->>'person', 'u-' || substr(replace(uid::text, '-', ''), 1, 10));
  select coalesce(max(pos), 0) + 1 into nextpos from public.people;
  insert into public.people (id, pos, doc, auth_user_id, email) values (
    pid, nextpos,
    json_build_object('id', pid, 'name', nm, 'first', split_part(nm, ' ', 1), 'div', inv->>'div', 'role', coalesce(inv->>'role', 'member'),
                      'photo', null, 'title', '', 'admin', false, 'hasSchedule', true, 'gcal', false, 'status', 'pending',
                      'board', false, 'joined', to_char(current_date, 'YYYY-MM-DD'), 'linkedin', null, 'phone', null, 'hidePhone', false),
    uid, mail);
  return json_build_object('person', pid, 'created', true);
end $$;
revoke all on function public.link_current_user() from public, anon;
grant execute on function public.link_current_user() to authenticated;

-- The public invitation page (#/invite/<id>) is shown before sign-in, so it needs a narrow read: name, division, role, state.
create function public.invite_preview(invite_id text) returns json language plpgsql stable security definer set search_path = '' as $$
begin
  return (select json_build_object('id', i.id, 'name', i.doc->>'name', 'div', i.doc->>'div', 'role', i.doc->>'role',
                                   'state', i.doc->>'state', 'expires', i.doc->>'expires')
          from public.acct_invites i where i.id = invite_id);
end $$;
revoke all on function public.invite_preview(text) from public;
grant execute on function public.invite_preview(text) to anon, authenticated;

-- Supabase Auth hook "Before User Created": admit only the first admin, a person that has this e-mail, or a live invitation.
create function private.before_user_created(event jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  signup_email text := lower(trim(event->'user'->>'email'));
begin
  if signup_email is null or signup_email = '' then
    return jsonb_build_object('error', jsonb_build_object('message', 'An invited email is required.', 'http_code', 403));
  end if;
  if exists (select 1 from private.bootstrap_settings where key = 'first_admin_email' and lower(trim(value)) = signup_email)
     or exists (select 1 from public.people where email = signup_email)
     or exists (select 1 from public.acct_invites i
                where lower(i.email) = signup_email and i.state in ('pending', 'accepted')
                  and (i.doc->>'expires' is null or i.doc->>'expires' >= to_char(current_date, 'YYYY-MM-DD'))) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object('message', 'This account has not been invited.', 'http_code', 403));
end $$;
revoke execute on function private.before_user_created(jsonb) from public, anon, authenticated;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.before_user_created(jsonb) to supabase_auth_admin;

-- ---------- function access ----------
grant execute on all functions in schema app to authenticated, service_role;
revoke execute on all functions in schema app from public, anon;
