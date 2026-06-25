import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: session_id, moduleId: module_session_id } = await params;

    const { data: ms, error: msError } = await supabaseAdmin
      .from("module_sessions")
      .select("id")
      .eq("id", module_session_id)
      .eq("test_session_id", session_id)
      .single();

    if (msError || !ms) {
      return NextResponse.json({ error: "Module session tidak ditemukan" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("module_sessions")
      .update({ status: "COMPLETED", completed_at: new Date().toISOString() })
      .eq("id", module_session_id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /complete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
