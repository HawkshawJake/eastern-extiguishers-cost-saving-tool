-- Follow-up to 20260726_website_embed.sql.
--
-- That migration enabled RLS but tried to remove the old anon policies by name,
-- and the names were wrong, so they survived. The leftovers still allowed the
-- anon key to insert into event_entries and read config directly, bypassing the
-- app's validation and rate limiting. This drops every policy on the three
-- tables regardless of name.
--
-- Nothing in the app relies on these: the browser no longer talks to Supabase,
-- and the service role bypasses RLS entirely.

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('event_entries', 'sessions', 'config')
  loop
    execute format(
      'drop policy %I on public.%I',
      policy_record.policyname,
      policy_record.tablename
    );
    raise notice 'dropped policy % on %', policy_record.policyname, policy_record.tablename;
  end loop;
end $$;

alter table public.event_entries enable row level security;
alter table public.sessions      enable row level security;
alter table public.config        enable row level security;

-- Belt and braces: force RLS so it applies even to the tables' owner role.
-- The service role used by the app bypasses RLS regardless.
alter table public.event_entries force row level security;
alter table public.sessions      force row level security;
alter table public.config        force row level security;

-- Confirm nothing is left. Expect zero rows.
select tablename, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('event_entries', 'sessions', 'config');
