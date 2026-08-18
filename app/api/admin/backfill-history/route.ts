// Call this once per season, manually, right after the new season's
// bootstrap-static data is live. Not worth scheduling — it only needs to
// run once a season.
import { NextResponse } from "next/server";
import { getBootstrap, backfillLastSeasonPoints } from "@/lib/fpl";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const bootstrap = await getBootstrap();
  await backfillLastSeasonPoints(bootstrap);
  return NextResponse.json({ ok: true });
}
