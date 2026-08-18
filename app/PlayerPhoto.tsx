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
    return <div className={`jersey ${isGk ? "gk" : ""} ${bench ? "bench-item" : ""}`} />;
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
