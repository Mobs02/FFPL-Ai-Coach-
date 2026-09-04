@AGENTS.md
# FFPL AI Coach — CLAUDE.md

## Project Context

**What this is:** FFPL AI Coach — Fantasy Premier League team advice and insights for users, generated via AI analysis of their squad/league data.

**Stack:** Next.js (App Router), Supabase (Postgres + Auth), Anthropic API for AI-generated insights, deployed with scheduled cron jobs for data polling.

---

## Coding Conventions (as actually used in this codebase)

**File/folder structure**
- Standard Next.js App Router. Each route is a lowercase folder under `app/` (`dashboard/`, `settings/`, `sign-in/`, `onboarding/`, etc.), each with its own `page.tsx`.
- API routes live in `app/api/<resource>/route.ts`, grouped by domain (`account/`, `ai-insight/`, `auth/`, `cron/`).
- Shared components sit flat at the top of `app/` (not in a `components/` subfolder) — e.g. `AppNav.tsx`, `SiteFooter.tsx`, `SquadView.tsx`, `AddLeagueForm.tsx`.
- Route-specific components live inside that route's own folder instead (e.g. `FeatureIcons.tsx`, `DeferredMotion.tsx` inside `app/welcome/`).
- Non-UI logic is centralized in `lib/` — one file per concern: `fpl.ts` (FPL API), `ai-insight.ts` (Anthropic prompt/generation), `supabase.ts` / `supabase-server.ts` / `supabase-browser.ts` (three separate Supabase clients for three trust contexts), `rate-limit.ts`, `cron-auth.ts`, `api-error.ts`.

**Naming**
- Components: PascalCase filenames matching the exported function name, or co-located as inner functions inside `page.tsx` when page-local (e.g. `AiCard`, `LeagueCard`, `ChipStatusRow` all live inside `dashboard/page.tsx` rather than separate files).
- Routes/folders: lowercase-kebab where multi-word (`forgot-password`, `reset-password`).
- Functions: camelCase (`generateAiInsight`, `getEntryPicks`, `checkRateLimit`).
- CSS classes: kebab-case, prefixed per page/section (`wp-*` for welcome page, `chip-status-*` / `ai-group-*` for dashboard) — not BEM, not Tailwind-utility naming.

**State management**
- No state library — no Redux/Zustand/Jotai/SWR/React Query.
- Plain React `useState`/`useEffect` throughout.
- Data fetching is manual `fetch()` calls (see `authedFetch()` in `dashboard/page.tsx`) into local component state, not a cache layer.

**Styling**
- Mixed, split by area: Tailwind v4 is installed and imported in `globals.css`, but barely used as utility classes in practice.
- The actual UI is driven by hand-written CSS in `app/mockup-theme.css` — a single large stylesheet using CSS custom properties (`--purple`, `--green`, `--ink`, etc.) for the design system, with semantic, hand-named classes per component (`.chip-status-row`, `.ai-group-list`, `.wp-hero`).
- Established workflow: design in static HTML mockups first, then port the CSS as-is rather than rebuilding it in Tailwind utilities.

**Net convention for new work:** put shared components flat in `app/`, page-specific ones in that page's folder; put non-UI logic in `lib/` as one focused file; use `useState`/`fetch` directly rather than reaching for a state library; style with a new semantic class added to `mockup-theme.css` (using CSS variables for colors) rather than Tailwind utility classes.

---

## Codebase Navigation (Graphify)

- Codebase-structure questions ("how does X work", "what connects to Y") go through `graphify query` / `path` / `explain` first, before raw grep or file reads.
- `graphify-out/wiki/index.md` for navigation.
- `GRAPH_REPORT.md` for broad architecture reviews only.
- Run `graphify update .` after code changes to keep the graph current.
