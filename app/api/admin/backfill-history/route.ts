// Call this once per season, manually, right after the new season's
// bootstrap-static data is live. Not worth scheduling — it only needs to
// run once a season.
import { NextResponse } from "next/server";
import { getBootstrap, backfillLastSeasonPoints } from "@/lib/fpl";
import { isValidCronSecret } from "@/lib/cron-auth";

export async function GET(request: Request) {
  if (!isValidCronSecret(request.headers.get("authorization"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const bootstrap = await getBootstrap();
  await backfillLastSeasonPoints(bootstrap);
  return NextResponse.json({ ok: true });
}
