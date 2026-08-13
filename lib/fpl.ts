const FPL_BASE = "https://fantasy.premierleague.com/api";

async function fplFetch(path: string, retries = 2): Promise<any> {
  const res = await fetch(`${FPL_BASE}${path}`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (res.status === 429 && retries > 0) {
    await new Promise((r) => setTimeout(r, 2000));
    return fplFetch(path, retries - 1);
  }
  if (!res.ok) throw new Error(`FPL fetch failed (${res.status}): ${path}`);
  return res.json();
}

// Read once here so every write in the app uses the same value — set
// CURRENT_SEASON in your env vars and this is the one line that needs
// changing at each season rollover.
export const CURRENT_SEASON = process.env.CURRENT_SEASON ?? "2025-26";

export const getBootstrap = () => fplFetch("/bootstrap-static/");
export const getFixtures = () => fplFetch("/fixtures/");
export const getEntry = (managerId: number) => fplFetch(`/entry/${managerId}/`);
export const getEntryHistory = (managerId: number) => fplFetch(`/entry/${managerId}/history/`);
export const getEntryTransfers = (managerId: number) => fplFetch(`/entry/${managerId}/transfers/`);
export const getEntryPicks = (managerId: number, eventId: number) =>
  fplFetch(`/entry/${managerId}/event/${eventId}/picks/`);
export const getLeagueStandings = (leagueId: number, page = 1) =>
  fplFetch(`/leagues-classic/${leagueId}/standings/?page_standings=${page}`);
export const getH2HStandings = (leagueId: number, page = 1) =>
  fplFetch(`/leagues-h2h/${leagueId}/standings/?page_standings=${page}`);

export function getPlayerPhotoUrl(playerCode: number): string {
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerCode}.png`;
}

export function buildSquad(bootstrap: any, picks: any) {
  const playersById = new Map(bootstrap.elements.map((p: any) => [p.id, p]));
  const positionNames = new Map(bootstrap.element_types.map((t: any) => [t.id, t.singular_name_short]));

  return picks.picks.map((pick: any) => {
    const player: any = playersById.get(pick.element);
    return {
      name: player.web_name,
      position: positionNames.get(player.element_type),
      points: pick.multiplier * player.event_points,
      isCaptain: pick.is_captain,
      isBench: pick.position > 11,
      news: player.news || null,
      photoUrl: getPlayerPhotoUrl(player.code),
    };
  });
}

// Loops through standings pages until the given manager is found — the
// standings endpoint only returns 50 entries per page.
export async function findManagerInLeague(leagueId: number, managerId: number) {
  let page = 1;
  let previousPageLastEntry: any = null;
  while (true) {
    const data = await getLeagueStandings(leagueId, page);
    const results = data.standings.results;
    const idx = results.findIndex((r: any) => r.entry === managerId);
    if (idx !== -1) {
      const aheadOfYou = idx > 0 ? results[idx - 1] : previousPageLastEntry;
      return {
        rank: results[idx].rank,
        leagueName: data.league.name,
        top: data.standings.results.slice(0, 3),
        aheadOfYou,
      };
    }
    if (!data.standings.has_next) {
      return { rank: null, leagueName: data.league.name, top: data.standings.results.slice(0, 3), aheadOfYou: null };
    }
    previousPageLastEntry = results.at(-1) ?? null;
    page++;
  }
}
