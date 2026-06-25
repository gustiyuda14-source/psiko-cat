import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { runSessionCalculate } from "@/lib/scoring/runner";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: session_id } = await params;

    const { data: testSession, error: tsError } = await supabaseAdmin
      .from("test_sessions")
      .select("id, status")
      .eq("id", session_id)
      .single();

    if (tsError || !testSession) {
      return NextResponse.json({ error: "Session tidak ditemukan" }, { status: 404 });
    }

    if (testSession.status === "COMPLETED" || testSession.status === "DISQUALIFIED") {
      return NextResponse.json({ error: "Session sudah dihitung" }, { status: 409 });
    }

    const result = await runSessionCalculate(session_id);

    if (!result) {
      return NextResponse.json({ error: "Gagal menghitung" }, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (err) {
    console.error("[POST /api/sessions/[id]/calculate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
