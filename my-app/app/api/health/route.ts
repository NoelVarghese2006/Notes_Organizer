import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Health‑check endpoint used to verify the app can reach Supabase.
 * It performs a minimal query (`SELECT id FROM profiles LIMIT 1`).
 * Returns JSON `{ status: "ok", sampleUserId: string | null }` on success.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Health check Supabase error:", error);
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    const sampleUserId = data && data.length > 0 ? data[0].id : null;
    return NextResponse.json({ status: "ok", sampleUserId });
  } catch (e) {
    console.error("Health check unexpected error:", e);
    return NextResponse.json({ status: "error", message: (e as Error).message }, { status: 500 });
  }
}
