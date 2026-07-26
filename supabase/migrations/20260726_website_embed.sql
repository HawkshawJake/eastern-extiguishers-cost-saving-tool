-- Website embed support.
-- Run once against the Supabase project (SQL Editor → New query → Run).

-- 1. One session per slug — the website session lookup relies on it.
create unique index if not exists sessions_slug_key on public.sessions (slug);

-- 2. The standing session that every embedded-calculator lead is filed under.
--    The app creates this automatically on the first website lead, but seeding
--    it here means it shows up in the admin Sessions tab straight away.
insert into public.sessions (name, slug, is_live)
values ('Website', 'website', true)
on conflict (slug) do nothing;

-- 3. Session-scoped lead queries (admin session view, leaderboard, counter).
create index if not exists event_entries_session_id_idx on public.event_entries (session_id);
create index if not exists event_entries_created_at_idx on public.event_entries (created_at desc);

-- 4. The browser no longer talks to Supabase at all — every read and write goes
--    through this app's API routes using the service role key. Lock the tables
--    down so the anon role cannot reach them even if a key leaks.
alter table public.event_entries enable row level security;
alter table public.sessions      enable row level security;
alter table public.config        enable row level security;

-- Removing the old anon policies is handled by 20260726b_drop_anon_policies.sql,
-- which drops them by lookup rather than by guessed name. Run that one too.
