"use client";

import { useState } from "react";
import { PlayerPhoto } from "./PlayerPhoto";

type SquadPlayer = {
  name: string;
  position: string;
  points: number;
  isCaptain: boolean;
  isBench: boolean;
  news: string | null;
  photoUrl: string;
};

const POSITION_ORDER = ["GKP", "DEF", "MID", "FWD"];

function Shirt({ player, bench }: { player: SquadPlayer; bench?: boolean }) {
  const isGk = player.position === "GKP";
  return (
    <div className="shirt">
      {player.isCaptain && <span className="cap-badge">C</span>}
      <PlayerPhoto src={player.photoUrl} alt={player.name} isGk={isGk} bench={bench} />
      <div className="p-name">{player.name}</div>
      <div className={`p-pts ${bench ? "bench-item" : ""}`}>{player.points}</div>
    </div>
  );
}

function ListRow({ player, bench }: { player: SquadPlayer; bench?: boolean }) {
  const isGk = player.position === "GKP";
  return (
    <div className={`squad-list-row ${bench ? "bench-item" : ""}`}>
      <PlayerPhoto src={player.photoUrl} alt={player.name} isGk={isGk} bench={bench} />
      <div className="squad-list-name">
        {player.name}
        {player.isCaptain && <span className="cap-badge squad-list-cap">C</span>}
      </div>
      <span className="squad-list-pos">{player.position}</span>
      <span className="squad-list-pts">{player.points}</span>
    </div>
  );
}

export function SquadView({
  starters,
  bench,
  gameweek,
}: {
  starters: SquadPlayer[];
  bench: SquadPlayer[];
  gameweek: number;
}) {
  const [view, setView] = useState<"pitch" | "list">("pitch");

  return (
    <div className="pitch-card">
      <div className="pitch-card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>Your team — gameweek {gameweek}</span>
        <div className="view-toggle" role="group" aria-label="Squad view">
          <button type="button" className={view === "pitch" ? "active" : ""} onClick={() => setView("pitch")}>
            Pitch
          </button>
          <button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
            List
          </button>
        </div>
      </div>

      {view === "pitch" ? (
        <>
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
        </>
      ) : (
        <div className="squad-list">
          {POSITION_ORDER.map((pos) => {
            const players = starters.filter((p) => p.position === pos);
            if (players.length === 0) return null;
            return (
              <div key={pos}>
                {players.map((p) => (
                  <ListRow key={p.name} player={p} />
                ))}
              </div>
            );
          })}
          {bench.length > 0 && (
            <>
              <p className="bench-label" style={{ margin: "10px 0 4px" }}>Substitutes</p>
              {bench.map((p) => (
                <ListRow key={p.name} player={p} bench />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
