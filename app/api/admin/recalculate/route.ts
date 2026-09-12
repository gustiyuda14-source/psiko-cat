import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { runSessionCalculate } from "@/lib/scoring/runner";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { session_id, recalculate_all } = body as {
    session_id?: string;
    recalculate_all?: boolean;
  };

  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (recalculate_all) {
    const { data: sessions, error } = await supabaseAdmin
      .from("test_sessions")
      .select("id, status")
      .in("status", ["COMPLETED", "DISQUALIFIED"]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const results: Array<{ id: string; result: unknown }> = [];
    for (const s of sessions ?? []) {
      try {
        const result = await runSessionCalculate(s.id, true);
        results.push({ id: s.id, result });
      } catch (e) {
        results.push({ id: s.id, result: { error: String(e) } });
      }
    }
    return NextResponse.json({ recalculated: results.length, results });
  }

  if (!session_id) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  try {
    const result = await runSessionCalculate(session_id, true);
    return NextResponse.json({ session_id, result });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
