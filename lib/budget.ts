// All prices in this file are in FPL's native units: tenths of a million
// (e.g. 55 = £5.5m). That's how bootstrap-static and the transfers endpoint
// both represent cost, so keeping everything in this unit avoids constant
// back-and-forth conversion.

export function calculateSellingPrice(purchasePrice: number, currentPrice: number): number {
  if (currentPrice <= purchasePrice) {
    return currentPrice; // no profit made — you get today's price, full stop
  }
  const profit = currentPrice - purchasePrice;
  const keptProfit = Math.floor(profit / 2); // FPL's 50%-of-profit rule, rounded down
  return purchasePrice + keptProfit;
}

// Walks a manager's transfer history to find what they actually paid for
// each player currently in their squad. Transfers are returned oldest-first,
// so if a player was bought, sold, then bought again, the later purchase
// correctly overwrites the earlier one.
export function getPurchasePrices(transfers: any[], squadElementIds: number[]): Map<number, number> {
  const purchasePrices = new Map<number, number>();
  for (const t of transfers) {
    if (squadElementIds.includes(t.element_in)) {
      purchasePrices.set(t.element_in, t.element_in_cost);
    }
  }
  return purchasePrices;
}

// Known gap: a player who's been in the squad since gameweek 1 has no
// transfer record at all (they were never "bought" through a transfer).
// The route below falls back to treating those as break-even (purchase
// price = current price) rather than reconstructing their gameweek-1 price
// — a reasonable approximation per the "approximate first, refine later"
// approach, and rarely off by more than a player's early-season price drift.

export function getAffordableCandidates(
  bootstrap: any,
  positionId: number,
  maxPriceTenths: number,
  excludeElementIds: number[],
  limit = 5
) {
  const positionNames = new Map(bootstrap.element_types.map((t: any) => [t.id, t.singular_name_short]));
  return bootstrap.elements
    .filter((p: any) =>
      p.element_type === positionId &&
      p.now_cost <= maxPriceTenths &&
      !excludeElementIds.includes(p.id) &&
      p.chance_of_playing_next_round !== 0 // drops players already ruled out
    )
    .sort((a: any, b: any) => Number(b.form) - Number(a.form))
    .slice(0, limit)
    .map((p: any) => ({
      name: p.web_name,
      position: positionNames.get(p.element_type), // "GKP" / "DEF" / "MID" / "FWD"
      price: p.now_cost / 10,
      form: p.form,
      totalPoints: p.total_points, // season-to-date, straight from bootstrap-static
      ownership: Number(p.selected_by_percent), // % of all FPL managers who own this player
      team: p.team, // used to attach upcoming fixtures, see the fixtures helper below
    }));
}

// Same shortlist logic as getAffordableCandidates, but filtered for low
// ownership — a genuine "get ahead of the pack" pick, not just a good one.
// 10% is a reasonable differential threshold; tune it if it feels too tight
// or too loose once you see real results.
export function getDifferentialCandidates(
  bootstrap: any,
  positionId: number,
  maxPriceTenths: number,
  excludeElementIds: number[],
  limit = 3,
  ownershipCeiling = 10
) {
  const positionNames = new Map(bootstrap.element_types.map((t: any) => [t.id, t.singular_name_short]));
  return bootstrap.elements
    .filter((p: any) =>
      p.element_type === positionId &&
      p.now_cost <= maxPriceTenths &&
      !excludeElementIds.includes(p.id) &&
      p.chance_of_playing_next_round !== 0 &&
      Number(p.selected_by_percent) <= ownershipCeiling
    )
    .sort((a: any, b: any) => Number(b.form) - Number(a.form))
    .slice(0, limit)
    .map((p: any) => ({
      name: p.web_name,
      position: positionNames.get(p.element_type),
      price: p.now_cost / 10,
      form: p.form,
      ownership: Number(p.selected_by_percent),
      team: p.team,
    }));
}

// The most-owned players overall, for comparing your squad against the
// "template" everyone else is likely running. Not position-filtered — the
// AI route below checks which of these you're missing, across any position.
export function getTemplatePlayers(bootstrap: any, limit = 15) {
  const positionNames = new Map(bootstrap.element_types.map((t: any) => [t.id, t.singular_name_short]));
  return [...bootstrap.elements]
    .sort((a: any, b: any) => Number(b.selected_by_percent) - Number(a.selected_by_percent))
    .slice(0, limit)
    .map((p: any) => ({
      id: p.id,
      name: p.web_name,
      position: positionNames.get(p.element_type),
      ownership: Number(p.selected_by_percent),
    }));
}

// FPL's own 1 (easy) – 5 (hard) difficulty rating already factors in the
// opponent's strength, so this single number stands in for "how that team
// has been performing" — no separate team-strength lookup needed.
export function getUpcomingFixtures(fixtures: any[], teamId: number, fromGameweek: number, lookahead = 3) {
  return fixtures
    .filter((f: any) =>
      f.event >= fromGameweek && f.event < fromGameweek + lookahead &&
      (f.team_h === teamId || f.team_a === teamId)
    )
    .map((f: any) => ({
      gameweek: f.event,
      isHome: f.team_h === teamId,
      difficulty: f.team_h === teamId ? f.team_h_difficulty : f.team_a_difficulty,
    }));
}
