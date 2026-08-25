import { NextResponse } from "next/server";

// Logs the real error server-side and returns a generic message to the
// client — raw Postgres/Supabase error text (constraint names, schema
// hints) has no business reaching an API response.
export function serverErrorResponse(context: string, error: { message: string }) {
  console.error(`[${context}]`, error.message);
  return NextResponse.json({ error: "Something went wrong. Please try again shortly." }, { status: 500 });
}
