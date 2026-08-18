"use client";

import { useState } from "react";

export function AiFeedback({ recommendationId, initialFeedback }: { recommendationId: number; initialFeedback: string | null }) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [sending, setSending] = useState(false);

  async function vote(value: "up" | "down") {
    if (sending || feedback === value) return;
    setSending(true);
    const previous = feedback;
    setFeedback(value); // optimistic — this is a low-stakes vote, not worth blocking the UI on
    const res = await fetch("/api/ai-insight/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recommendationId, feedback: value }),
    });
    setSending(false);
    if (!res.ok) setFeedback(previous);
  }

  return (
    <div className="ai-feedback">
      <span>Was this helpful?</span>
      <button
        type="button"
        className={`ai-feedback-btn ${feedback === "up" ? "active" : ""}`}
        onClick={() => vote("up")}
        disabled={sending}
        aria-label="Thumbs up"
      >
        👍
      </button>
      <button
        type="button"
        className={`ai-feedback-btn ${feedback === "down" ? "active" : ""}`}
        onClick={() => vote("down")}
        disabled={sending}
        aria-label="Thumbs down"
      >
        👎
      </button>
    </div>
  );
}
