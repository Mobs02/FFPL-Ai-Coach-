-- Phase 14 — 👍/👎 feedback on AI recommendations, so suggestion quality is
-- trackable over a season instead of just anecdotal.
alter table ai_recommendations add column feedback text check (feedback in ('up', 'down'));
