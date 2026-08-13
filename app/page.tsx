import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { AddLeagueForm } from "./AddLeagueForm";
import { SignOutButton } from "./SignOutButton";

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
  squad: SquadPlayer[];
  error?: string;
};

type LeagueEntry = {
  leagueId: number;
  leagueName: string;
  yourRank: number | null;
  top: { entry_name: string; player_name: string; rank: number; total: number }[];
};

type LeaguesResponse = { leagues: LeagueEntry[]; error?: string };

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

function PlayerCard({ player }: { player: SquadPlayer }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-black/10 bg-white p-2 text-center dark:border-white/10 dark:bg-zinc-900">
      <img src={player.photoUrl} alt={player.name} className="h-14 w-11 object-cover" />
      <span className="text-xs font-medium">
        {player.name}
        {player.isCaptain && <span className="ml-1 text-[#37003c] dark:text-purple-300">(C)</span>}
      </span>
      <span className="text-xs text-zinc-500">{player.points} pts</span>
      {player.news && <span className="text-[10px] text-amber-600">{player.news}</span>}
    </div>
  );
}

export default async function Dashboard() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: manager } = await supabase.from("managers").select("id").eq("id", user.id).maybeSingle();
  if (!manager) redirect("/onboarding");

  const [team, leagues] = await Promise.all([
    authedFetch<TeamResponse>("/api/team"),
    authedFetch<LeaguesResponse>("/api/leagues"),
  ]);

  const starters = team.squad?.filter((p) => !p.isBench) ?? [];
  const bench = team.squad?.filter((p) => p.isBench) ?? [];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#37003c] dark:text-purple-200">Squad HQ</h1>
        <SignOutButton />
      </div>

      {team.error ? (
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">{team.error}</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-[#37003c] p-4 text-center text-white">
              <div className="text-2xl font-bold">{team.gameweekPoints}</div>
              <div className="text-xs opacity-80">GW{team.gameweek} points</div>
            </div>
            <div className="rounded-lg bg-[#37003c] p-4 text-center text-white">
              <div className="text-2xl font-bold">{team.totalPoints}</div>
              <div className="text-xs opacity-80">Total points</div>
            </div>
            <div className="rounded-lg bg-[#37003c] p-4 text-center text-white">
              <div className="text-2xl font-bold">{team.overallRank.toLocaleString()}</div>
              <div className="text-xs opacity-80">Overall rank</div>
            </div>
          </div>

          <h2 className="mb-2 text-lg font-semibold">Starting XI</h2>
          <div className="mb-6 flex flex-col gap-4">
            {POSITION_ORDER.map((pos) => {
              const players = starters.filter((p) => p.position === pos);
              if (players.length === 0) return null;
              return (
                <div key={pos} className="flex flex-wrap justify-center gap-2">
                  {players.map((p) => (
                    <PlayerCard key={p.name} player={p} />
                  ))}
                </div>
              );
            })}
          </div>

          <h2 className="mb-2 text-lg font-semibold">Bench</h2>
          <div className="mb-8 flex flex-wrap gap-2">
            {bench.map((p) => (
              <PlayerCard key={p.name} player={p} />
            ))}
          </div>
        </>
      )}

      <h2 className="mb-2 text-lg font-semibold">Leagues</h2>
      <div className="mb-4 flex flex-col gap-3">
        {leagues.leagues?.map((league) => (
          <div key={league.leagueId} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-medium">{league.leagueName}</span>
              <span className="text-sm text-zinc-500">Your rank: {league.yourRank ?? "—"}</span>
            </div>
            <ol className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {league.top.map((entry) => (
                <li key={entry.rank}>
                  {entry.rank}. {entry.entry_name} ({entry.player_name}) — {entry.total}
                </li>
              ))}
            </ol>
          </div>
        ))}
        {(!leagues.leagues || leagues.leagues.length === 0) && (
          <p className="text-sm text-zinc-500">No leagues added yet.</p>
        )}
      </div>

      <AddLeagueForm />
    </main>
  );
}
