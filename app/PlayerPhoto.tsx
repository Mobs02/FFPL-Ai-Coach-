"use client";

import { useState } from "react";

export function PlayerPhoto({
  src,
  alt,
  isGk,
  bench,
}: {
  src: string;
  alt: string;
  isGk?: boolean;
  bench?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`jersey ${isGk ? "gk" : ""} ${bench ? "bench-item" : ""}`} title={alt}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="8" r="4" />
          <path d="M12 13c-4.4 0-8 2.5-8 6v1h16v-1c0-3.5-3.6-6-8-6Z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`player-photo ${isGk ? "gk" : ""} ${bench ? "bench-item" : ""}`}
      onError={() => setFailed(true)}
    />
  );
}
