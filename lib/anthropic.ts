import Anthropic from "@anthropic-ai/sdk";

// Server-only. Never import this into client components.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
