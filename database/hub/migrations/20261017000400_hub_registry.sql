-- DWDG'ONE hub, migration 4: what the hub adds for the division projects. Hand-written (not generated).
--   divisions         which division projects are switched on, which hold sensitive data, which schema version each runs
--   division_progress a summary per division pushed by the server, so the dashboard never needs a division project
--   audit_log         written by the server only (access to HR and FnL, every access change)

alter table public.divisions
  add column is_active boolean not null default false,
  add column is_sensitive boolean not null default false,
  add column schema_version integer not null default 0;
update public.divisions set is_sensitive = true where id in ('hr', 'fnl');

-- ---------- division_progress ----------
-- Readable by whoever may see the division (app.sees_div: members, President, VP, Board, Admin). Written by the server only.
create table public.division_progress (
  division_id text primary key references public.divisions (id) on delete cascade,
  total_items integer not null default 0,
  done_items integer not null default 0,
  percent numeric(5,2) generated always as (case when total_items = 0 then 0 else round(done_items * 100.0 / total_items, 2) end) stored,
  last_synced_at timestamptz,
  last_error text
);
alter table public.division_progress enable row level security;
create policy division_progress_select on public.division_progress for select to authenticated
  using (app.me_active() and app.sees_div(division_id));
revoke all on public.division_progress from anon, authenticated;
grant select on public.division_progress to authenticated;
grant select, insert, update, delete on public.division_progress to service_role;

-- ---------- audit_log ----------
-- No policy and no grant to the browser's roles: only the service role (the server) can read or write it.
-- person_id is the prototype's person id (text), the same id every other table stores.
create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  person_id text,
  division_id text,
  action text not null,
  detail jsonb
);
create index audit_log_at_idx on public.audit_log (at desc);
create index audit_log_division_idx on public.audit_log (division_id, at desc);
alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;
grant select, insert on public.audit_log to service_role;
