-- Proposals: one editable, approvable proposal per captured lead (event_entries row).
-- Run this in the Supabase SQL editor once. Safe to re-run.

create table if not exists proposals (
  id              uuid primary key default gen_random_uuid(),
  entry_id        uuid not null unique references event_entries(id) on delete cascade,
  status          text not null default 'draft',          -- 'draft' | 'approved'
  -- Contact & site details
  contact_name    text,
  contact_role    text,
  site_address    text,
  num_sites       int,
  install_date    date,
  -- Pricing
  discount_pct    numeric default 0,                       -- % off P50 unit pricing
  price_overrides jsonb   default '{}'::jsonb,             -- { p50_type_id: unit_price }
  comparison_years int    default 8,
  -- Narrative & terms
  cover_note      text,
  valid_until     date,
  payment_terms   text,
  warranty_notes  text,
  -- Meta
  prepared_by     text,
  reference       text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Service-role key (used by the API routes) bypasses RLS, matching the rest of
-- this app. Enable RLS with no public policy so the anon key cannot read leads' data.
alter table proposals enable row level security;
