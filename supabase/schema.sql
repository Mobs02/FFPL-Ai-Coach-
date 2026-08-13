-- Phase 3 — Accounts, database, and security
-- Run this in Supabase's SQL editor (Project → SQL Editor → New query).

create table managers (
  id uuid primary key references auth.users(id) on delete cascade,
  fpl_manager_id int not null unique,
  league_ids int[] default '{}',
  email_reminders_enabled boolean not null default true,
  last_manual_regenerate_at timestamptz,
  created_at timestamptz not null default now()
);

create table gameweek_snapshots (
  id bigint generated always as identity primary key,
  manager_id uuid not null references managers(id) on delete cascade,
  season text not null default '2025-26',
  gameweek int not null,
  total_points int not null,
  gameweek_points int not null,
  overall_rank int not null,
  free_transfers int not null default 1,
  squad_json jsonb,
  captured_at timestamptz not null default now(),
  unique (manager_id, gameweek, season)
);

create table league_snapshots (
  id bigint generated always as identity primary key,
  manager_id uuid not null references managers(id) on delete cascade,
  league_id int not null,
  league_name text,
  league_type text not null default 'classic',
  season text not null default '2025-26',
  gameweek int not null,
  your_rank int,
  standings_json jsonb,
  captured_at timestamptz not null default now(),
  unique (manager_id, league_id, gameweek, season)
);

create table ai_recommendations (
  id bigint generated always as identity primary key,
  manager_id uuid not null references managers(id) on delete cascade,
  season text not null default '2025-26',
  gameweek int not null,
  content text not null,
  headline text,
  created_at timestamptz not null default now(),
  unique (manager_id, gameweek, season)
);

alter table managers enable row level security;
alter table gameweek_snapshots enable row level security;
alter table league_snapshots enable row level security;
alter table ai_recommendations enable row level security;

create policy "Users see their own data" on managers for select using (auth.uid() = id);
create policy "Users see their own league standings" on league_snapshots for select using (auth.uid() = manager_id);
create policy "Users see their own snapshots" on gameweek_snapshots for select using (auth.uid() = manager_id);
create policy "Users see their own insights" on ai_recommendations for select using (auth.uid() = manager_id);
