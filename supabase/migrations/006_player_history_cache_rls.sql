-- Security audit fix: player_history_cache was created without RLS, which
-- means Supabase's default grants let anyone holding the public anon key
-- write to it directly via PostgREST. No policy is added (matching the
-- pattern already used by `managers`, which also has no INSERT policy) —
-- the only writer is lib/fpl.ts's backfillLastSeasonPoints(), which uses the
-- service-role client and bypasses RLS entirely. Enabling RLS with zero
-- policies blocks all direct anon/authenticated access while leaving that
-- write path untouched.
--
-- `create table if not exists` here too: migration 003 (which creates this
-- table) turned out to have never actually been run in production — the app
-- degrades silently when the table's missing (a failed select just falls
-- back to an empty result, no crash), so this went unnoticed. Making this
-- migration self-contained means running it alone is enough, regardless of
-- whether 003 was ever applied.
create table if not exists player_history_cache (
  player_id int primary key,
  last_season_points int,
  last_season_minutes int,
  updated_at timestamptz not null default now()
);

alter table player_history_cache enable row level security;
