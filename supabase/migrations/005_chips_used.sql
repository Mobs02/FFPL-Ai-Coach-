-- Tracks which FPL chips a manager has played this season, so the dashboard
-- can show a used/available row at the top instead of only mentioning chips
-- inline in the AI text. Stored on managers (season-cumulative state), not
-- gameweek_snapshots, since chip usage isn't tied to a single gameweek row.
alter table managers add column chips_used jsonb not null default '[]'::jsonb;
