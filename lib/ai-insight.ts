import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { getBootstrap, getEntryHistory, getEntryPicks, getEntryTransfers, getFixtures, CURRENT_SEASON } from "@/lib/fpl";
import {
  calculateSellingPrice,
  getPurchasePrices,
  getAffordableCandidates,
  getDifferentialCandidates,
  getTemplatePlayers,
  getUpcomingFixtures,
} from "@/lib/budget";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateAiInsight({
  managerId,
  fplManagerId,
  gameweek,
}: {
  managerId: string;
  fplManagerId: number;
  gameweek: number;
}) {
  const bootstrap = await getBootstrap();
  const [entryHistory, transfers, picks, fixtures, latestSnapshot, historyCache, leagueSnapshots] = await Promise.all([
    getEntryHistory(fplManagerId),
    getEntryTransfers(fplManagerId),
    getEntryPicks(fplManagerId, gameweek),
    getFixtures(),
    supabase.from("gameweek_snapshots").select("free_transfers").eq("manager_id", managerId).order("gameweek", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("player_history_cache").select("player_id, last_season_points"),
    supabase.from("league_snapshots").select("league_name, your_rank, standings_json").eq("manager_id", managerId).eq("season", CURRENT_SEASON).order("gameweek", { ascending: false }),
  ]);

  const freeTransfers = latestSnapshot.data?.free_transfers ?? 1;
  const lastSeasonById = new Map((historyCache.data ?? []).map((r: any) => [r.player_id, r.last_season_points]));

  // Rival Scout: one row per league (already deduped to latest gameweek by
  // the query above's ordering — take the first per league_name).
  const rivalContext = leagueSnapshots.data ?? [];

  const bankTenths = entryHistory.current.find((gw: any) => gw.event === gameweek)?.bank ?? 0;
  const squadElementIds = picks.picks.map((p: any) => p.element);
  const purchasePrices = getPurchasePrices(transfers, squadElementIds);
  const playersById = new Map(bootstrap.elements.map((p: any) => [p.id, p]));

  const squadWithBudget = picks.picks.map((pick: any) => {
    const player: any = playersById.get(pick.element);
    const purchasePrice = purchasePrices.get(pick.element) ?? player.now_cost; // fallback for day-1 squad members
    return {
      name: player.web_name,
      position: player.element_type,
      sellingPrice: calculateSellingPrice(purchasePrice, player.now_cost) / 10,
      form: player.form,
      ownership: Number(player.selected_by_percent), // Template Radar — % of managers who own this player
      isBench: pick.position > 11, // picks 1–11 are the starting XI, 12–15 are the bench
      upcomingFixtures: getUpcomingFixtures(fixtures, player.team, gameweek), // next 3 gameweeks, difficulty rated
      lastSeasonPoints: lastSeasonById.get(player.id) ?? null,
    };
  });

  // Template Radar: the most-owned players overall, minus whoever you already
  // have — tells the AI (and you) what "the template" looks like without you.
  const templatePlayers = getTemplatePlayers(bootstrap, 15).filter((p: any) => !squadElementIds.includes(p.id));

  // Build a short list of affordable candidates per position, using each
  // player's own selling price plus the bank as their individual budget.
  const candidatesByPosition: Record<number, any[]> = {};
  const differentialsByPosition: Record<number, any[]> = {}; // Differential Radar
  for (const posId of [1, 2, 3, 4]) {
    const positionSquad = squadWithBudget.filter((p: any) => p.position === posId);
    const maxBudget = bankTenths + Math.max(...positionSquad.map((p: any) => p.sellingPrice * 10), 0);
    candidatesByPosition[posId] = getAffordableCandidates(bootstrap, posId, maxBudget, squadElementIds).map((c: any) => ({
      ...c,
      upcomingFixtures: getUpcomingFixtures(fixtures, c.team, gameweek),
      lastSeasonPoints: lastSeasonById.get(c.id) ?? null,
    }));
    differentialsByPosition[posId] = getDifferentialCandidates(bootstrap, posId, maxBudget, squadElementIds).map((c: any) => ({
      ...c,
      upcomingFixtures: getUpcomingFixtures(fixtures, c.team, gameweek),
    }));
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5", // check docs.claude.com for the current model name before deploying
    max_tokens: 1400,
    system:
      "You are a Fantasy Premier League analyst. Base every suggestion strictly on the " +
      "squad, budget, candidate, and fixture data provided — never invent prices, stats, " +
      "ownership percentages, or fixture difficulty. When suggesting a transfer, always " +
      "show the exact cost math: selling price plus bank must cover the buying price of " +
      "whoever you suggest. If a suggested transfer would exceed the free transfers " +
      "available, say so explicitly and state the -4 point cost — never suggest a hit " +
      "silently. Weigh each player's upcoming fixture difficulty (1 easy – 5 hard) " +
      "alongside their form and points when ranking options. A player's upcomingFixtures " +
      "array reveals blank and double gameweeks — factor both into reasoning when they " +
      "occur. lastSeasonPoints is background context only, weighted well below current " +
      "form. For differentials, only call out a candidate if their form and fixtures " +
      "genuinely justify it — a low-ownership player with poor form isn't a differential " +
      "worth recommending, just an unpopular one. If fewer than 5 sensible transfer " +
      "options exist, give fewer rather than padding the list with weak ones.",
    messages: [
      {
        role: "user",
        content:
          `Bank: £${(bankTenths / 10).toFixed(1)}m\n` +
          `Free transfers available: ${freeTransfers}\n` +
          `Full squad with selling prices, form, ownership %, bench status, fixture ` +
          `difficulty, and last season's points (background context only): ${JSON.stringify(squadWithBudget)}\n` +
          `Affordable replacement candidates by position, each with form, season points, ` +
          `ownership %, and fixture difficulty: ${JSON.stringify(candidatesByPosition)}\n` +
          `Low-ownership differential candidates by position (10% or less owned), each ` +
          `affordable and with fixture difficulty: ${JSON.stringify(differentialsByPosition)}\n` +
          `The most-owned players overall that you do NOT currently have (the "template" ` +
          `you're missing): ${JSON.stringify(templatePlayers)}\n` +
          `Your rank and the manager directly ahead of you, in each of your leagues: ` +
          `${JSON.stringify(rivalContext)}\n\n` +
          "Start your reply with a single line beginning 'HEADLINE: ' summarizing your single " +
          "top suggestion in under 15 words (e.g. 'HEADLINE: Sell Marín for Håkansson, frees " +
          "£5.5m, costs nothing.') — this is used in a deadline email teaser, so it needs to " +
          "stand alone without the rest of the context. Leave a blank line, then continue with " +
          "the full breakdown: suggest up to 5 transfer options that fit within budget (selling " +
          "price + bank ≥ buying price), ranked by how strongly you'd recommend each considering " +
          "both form and the fixture run. For every option, state the cost math, the incoming " +
          "player's position, season points total, and a one-sentence reason that references " +
          "their fixture difficulty specifically. Then compare the bench to the starting XI, " +
          "position by position — if any bench player's form and fixtures clearly outperform " +
          "a starter in the same position, say who should come in and who should sit, with " +
          "reasoning. Add a short 'Differential watch' note — one low-ownership player worth " +
          "considering if their form and fixtures back it up, or say there isn't a strong one " +
          "this week rather than forcing a pick. Add a one-line 'Template check' noting any " +
          "widely-owned player you're missing who's genuinely in form, if relevant. If you're " +
          "meaningfully behind the manager directly above you in a league, mention it briefly " +
          "and note whether this gameweek's suggestions would help close that gap. Finish with " +
          "a captain pick and a vice-captain pick for next gameweek, justified by their fixture " +
          "difficulty as well as form.",
      },
    ],
  });

  const text = message.content.find((b) => b.type === "text")?.text ?? "";
  const headline = text.match(/^HEADLINE:\s*(.+)$/m)?.[1]?.trim() ?? null;
  const content = text.replace(/^HEADLINE:.*\n\n?/, ""); // strip the headline line so it isn't duplicated in the dashboard view
  await supabase.from("ai_recommendations").upsert(
    { manager_id: managerId, season: CURRENT_SEASON, gameweek, content, headline },
    { onConflict: "manager_id,gameweek,season" },
  );

  return { insight: content, headline };
}
