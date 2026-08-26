"use client";

import dynamic from "next/dynamic";

// next/dynamic with ssr:false must be called from inside a Client Component -
// Next.js rejects it directly in a Server Component (welcome/page.tsx). This
// file exists purely to hold that call; the ssr:false itself is required, not
// optional - see the comment in page.tsx for why.
export const PhoneShowcase = dynamic(() => import("./PhoneShowcase").then((m) => m.PhoneShowcase), { ssr: false });
export const SpiralSegment = dynamic(() => import("./SpiralConnector").then((m) => m.SpiralSegment), { ssr: false });
export const Reveal = dynamic(() => import("./Reveal").then((m) => m.Reveal), { ssr: false });
