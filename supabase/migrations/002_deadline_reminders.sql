-- Phase 12b — Deadline email reminders
-- Run this in Supabase's SQL editor (Project → SQL Editor → New query).
-- schema.sql was already applied, so this is a standalone addition.

create table deadline_reminders_sent (
  manager_id uuid not null references managers(id) on delete cascade,
  gameweek int not null,
  season text not null default '2026-27',
  sent_at timestamptz not null default now(),
  primary key (manager_id, gameweek, season)
);

alter table deadline_reminders_sent enable row level security;
create policy "Users see their own reminder history" on deadline_reminders_sent for select using (auth.uid() = manager_id);
