import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { AddLeagueForm } from "./AddLeagueForm";

type SquadPlayer = {
  name: string;
  position: string;
  points: number;
  isCaptain: boolean;
  isBench: boolean;
  news: string | null;
  photoUrl: string;
};

type TeamResponse = {
  gameweek: number;
  totalPoints: number;
  overallRank: number;
  gameweekPoints: number;
  freeTransfers: number;
  squad: SquadPlayer[];
  capturedAt: string;
  error?: string;
};

type LeagueStandingEntry = { entry_name: string; player_name: string; rank: number; total: number };
type LeagueEntry = {
  leagueId: number;
  leagueName: string;
  yourRank: number | null;
  top: LeagueStandingEntry[];
  aheadOfYou: LeagueStandingEntry | null;
};
type LeaguesResponse = { leagues: LeagueEntry[]; error?: string };

type HistoryPoint = { gameweek: number; total_points: number; overall_rank: number; captured_at: string };
type HistoryResponse = { history: HistoryPoint[]; error?: string };

// Forwards the incoming request's session cookie to our own API routes —
// required since a server-side fetch to an absolute URL doesn't carry the
// browser's cookies automatically.
async function authedFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${path}`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  return res.json();
}

const POSITION_ORDER = ["GKP", "DEF", "MID", "FWD"];

function minutesAgo(iso: string) {
  return Math.round((Date.now() - new Date(iso).getTime()) / 60000);
}

function Shirt({ player, bench }: { player: SquadPlayer; bench?: boolean }) {
  const isGk = player.position === "GKP";
  return (
    <div className="shirt">
      {player.isCaptain && <span className="cap-badge">C</span>}
      <div className={`jersey ${isGk ? "gk" : ""} ${bench ? "bench-item" : ""}`} />
      <div className="p-name">{player.name}</div>
      <div className={`p-pts ${bench ? "bench-item" : ""}`}>{player.points}</div>
    </div>
  );
}

function LeagueCard({ league, totalPoints }: { league: LeagueEntry; totalPoints: number }) {
  type Row = { rank: number; label: string; total: number; isYou: boolean };

  const rows: Row[] = league.top.map((e) => ({
    rank: e.rank,
    label: e.rank === league.yourRank ? "You" : e.entry_name,
    total: e.total,
    isYou: e.rank === league.yourRank,
  }));

  const alreadyHasYou = rows.some((r) => r.isYou);
  if (!alreadyHasYou && league.aheadOfYou && league.aheadOfYou.rank !== league.yourRank) {
    rows.push({ rank: league.aheadOfYou.rank, label: league.aheadOfYou.entry_name, total: league.aheadOfYou.total, isYou: false });
  }
  if (!alreadyHasYou && league.yourRank != null) {
    rows.push({ rank: league.yourRank, label: "You", total: totalPoints, isYou: true });
  }
  rows.sort((a, b) => a.rank - b.rank);

  return (
    <div className="side-card">
      <h3>{league.leagueName}</h3>
      {rows.length > 0 ? (
        <table className="league-table">
          <tbody>
            {rows.map((r) => (
              <tr key={r.rank} className={r.isYou ? "you" : ""}>
                <td>
                  {r.rank}. {r.label}
                </td>
                <td>{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="league-note">Standings will appear once the next poll runs.</p>
      )}
    </div>
  );
}

function RankTrend({ history }: { history: HistoryPoint[] }) {
  if (history.length < 2) return null;

  const ranks = history.map((h) => h.overall_rank);
  const min = Math.min(...ranks);
  const max = Math.max(...ranks);
  const span = max - min || 1;
  const w = 260;
  const h = 70;
  const points = history
    .map((point, i) => {
      const x = (i / (history.length - 1)) * w;
      // lower rank is better, so invert the y axis
      const y = 10 + ((point.overall_rank - min) / span) * (h - 20);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const improving = ranks.at(-1)! <= ranks[0];

  return (
    <div className="side-card">
      <h3>Rank trend</h3>
      <svg className="trend-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="#37003c" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="league-note">{improving ? "Climbing" : "Slipping"} over your last {history.length} gameweeks</p>
    </div>
  );
}

export default async function Dashboard() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: manager } = await supabase.from("managers").select("id").eq("id", user.id).maybeSingle();
  if (!manager) redirect("/onboarding");

  const [team, leagues, history] = await Promise.all([
    authedFetch<TeamResponse>("/api/team"),
    authedFetch<LeaguesResponse>("/api/leagues"),
    authedFetch<HistoryResponse>("/api/history"),
  ]);

  const starters = (team.squad ?? []).filter((p) => !p.isBench);
  const bench = (team.squad ?? []).filter((p) => p.isBench);

  return (
    <div className="wrap">
      <header className="app-header">
        <div className="navrow">
          <div className="brand">
            <div className="brand-mark">HQ</div>
            Squad HQ
          </div>
          {!team.error && <div className="gw-pill">Gameweek {team.gameweek}</div>}
        </div>
        <div className="status-row">
          {!team.error && <span className="status-chip">{team.freeTransfers} free transfer{team.freeTransfers === 1 ? "" : "s"}</span>}
          {!team.error && <span className="status-chip fresh">Updated {minutesAgo(team.capturedAt)}m ago</span>}
          <a href="/settings" className="status-chip" style={{ textDecoration: "none" }}>
            Settings
          </a>
        </div>
      </header>

      {team.error ? (
        <div className="section">
          <p style={{ fontSize: 13.5, color: "#6b5a70" }}>{team.error}</p>
        </div>
      ) : (
        <>
          <div className="stats-strip">
            <div>
              <p className="stat-label">Gameweek points</p>
              <p className="stat-value">{team.gameweekPoints}</p>
            </div>
            <div>
              <p className="stat-label">Overall rank</p>
              <p className="stat-value">{team.overallRank.toLocaleString()}</p>
            </div>
            <div>
              <p className="stat-label">Total points</p>
              <p className="stat-value">{team.totalPoints}</p>
            </div>
          </div>

          <div className="content">
            <div className="pitch-card">
              <div className="pitch-card-header">Your team — gameweek {team.gameweek}</div>
              <div className="pitch">
                {POSITION_ORDER.map((pos) => {
                  const players = starters.filter((p) => p.position === pos);
                  if (players.length === 0) return null;
                  return (
                    <div key={pos} className="pitch-row">
                      {players.map((p) => (
                        <Shirt key={p.name} player={p} />
                      ))}
                    </div>
                  );
                })}
              </div>
              {bench.length > 0 && (
                <div className="bench-strip">
                  <p className="bench-label">Substitutes</p>
                  <div className="bench-row">
                    {bench.map((p) => (
                      <Shirt key={p.name} player={p} bench />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sidebar">
              {leagues.leagues?.map((league) => (
                <LeagueCard key={league.leagueId} league={league} totalPoints={team.totalPoints} />
              ))}
              <RankTrend history={history.history ?? []} />
            </div>
          </div>
        </>
      )}

      <div className="section">
        <h2>Your leagues</h2>
        {leagues.leagues?.length ? (
          leagues.leagues.map((league) => (
            <div key={league.leagueId} className="setting-row">
              <div className="row-label">{league.leagueName}</div>
              <div className="row-value">Rank {league.yourRank ?? "—"}</div>
            </div>
          ))
        ) : (
          <p className="league-note" style={{ margin: 0 }}>
            No leagues added yet.
          </p>
        )}
        <div className="add-league-row">
          <AddLeagueForm />
        </div>
      </div>

      <footer className="app-footer">Not affiliated with the Premier League or Fantasy Premier League.</footer>
    </div>
  );
}
