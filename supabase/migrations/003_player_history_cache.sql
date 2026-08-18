-- Phase 6 — AI recommendations: last-season points cache
-- Run this in Supabase's SQL editor (Project → SQL Editor → New query).

create table player_history_cache (
  player_id int primary key,
  last_season_points int,
  last_season_minutes int,
  updated_at timestamptz not null default now()
);
