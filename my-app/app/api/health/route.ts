import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Health‑check endpoint used to keep the Supabase database active.
 * Inserts a row into the `health` table (id, timestamp) to prevent
 * the database from winding down due to inactivity.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    for (let i = 0; i < 10; i++) {
      const { error } = await supabase
        .from("health")
        .insert({ timestamp: new Date().toISOString() });
  
      if (error) {
        console.error("Health check Supabase error:", error);
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (e) {
    console.error("Health check unexpected error:", e);
    return NextResponse.json({ status: "error", message: (e as Error).message }, { status: 500 });
  }
}
