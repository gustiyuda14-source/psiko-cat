import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { RecoverySnapshot } from "@/lib/types/safe-question";

type SyncBody = {
  module_session_id: string;
  current_question_index: number;
  current_column_index: number | null;
  column_remaining_ms: number | null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: session_id } = await params;
    const body = await req.json() as SyncBody;
    const { module_session_id, current_question_index, current_column_index, column_remaining_ms } = body;

    if (!module_session_id || current_question_index === undefined) {
      return NextResponse.json({ error: "module_session_id dan current_question_index wajib" }, { status: 400 });
    }

    const { data: moduleSession, error: msError } = await supabaseAdmin
      .from("module_sessions")
      .select("id, started_at")
      .eq("id", module_session_id)
      .eq("test_session_id", session_id)
      .single();

    if (msError || !moduleSession) {
      return NextResponse.json({ error: "Module session tidak ditemukan" }, { status: 404 });
    }

    const snapshot: RecoverySnapshot = {
      current_question_index,
      current_column_index: current_column_index ?? null,
      column_remaining_ms: column_remaining_ms ?? null,
      snapshot_at: Date.now(),
    };

    const { error: msUpdateError } = await supabaseAdmin
      .from("module_sessions")
      .update({
        recovery_snapshot: snapshot,
        status: "IN_PROGRESS",
        started_at: moduleSession.started_at ?? new Date().toISOString(),
      })
      .eq("id", module_session_id);

    if (msUpdateError) throw msUpdateError;

    const { error: tsUpdateError } = await supabaseAdmin
      .from("test_sessions")
      .update({ status: "IN_PROGRESS" })
      .eq("id", session_id);

    if (tsUpdateError) throw tsUpdateError;

    return NextResponse.json({ synced_at: snapshot.snapshot_at });

  } catch (err) {
    console.error("[PATCH /api/sessions/[id]/sync]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: session_id } = await params;

    const { data: testSession, error } = await supabaseAdmin
      .from("test_sessions")
      .select(`
        id, status, user_id,
        module_sessions (
          id, module_type, sequence_order, status, time_limit_seconds, recovery_snapshot, started_at
        )
      `)
      .eq("id", session_id)
      .single();

    if (error || !testSession) {
      return NextResponse.json({ error: "Session tidak ditemukan" }, { status: 404 });
    }

    // Sort module_sessions by sequence_order (PostgREST join doesn't guarantee order)
    if (Array.isArray(testSession.module_sessions)) {
      (testSession.module_sessions as { sequence_order: number }[]).sort(
        (a, b) => a.sequence_order - b.sequence_order
      );
    }

    return NextResponse.json(testSession);

  } catch (err) {
    console.error("[GET /api/sessions/[id]/sync]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
