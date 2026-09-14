import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getModuleAccess,
  getSessionAccess,
  isModuleExpired,
  isModuleSequenceAvailable,
  isTerminalModule,
} from "@/lib/session-access";
import type { RecoverySnapshot } from "@/lib/types/safe-question";

type SyncBody = {
  module_session_id?: unknown;
  current_question_index?: unknown;
  current_column_index?: unknown;
  column_remaining_ms?: unknown;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = (await req.json().catch(() => null)) as SyncBody | null;
    if (
      typeof body?.module_session_id !== "string" ||
      !Number.isInteger(body.current_question_index) ||
      (body.current_question_index as number) < 0 ||
      (body.current_question_index as number) > 499
    ) {
      return NextResponse.json({ error: "Payload sinkronisasi tidak valid" }, { status: 400 });
    }

    const access = await getModuleAccess(sessionId, body.module_session_id, false);
    if (!access.ok) {
      return NextResponse.json({ error: access.message }, { status: access.status });
    }
    if (isTerminalModule(access.moduleSession.status)) {
      return NextResponse.json({ error: "Module sudah selesai" }, { status: 409 });
    }
    if (!(await isModuleSequenceAvailable(access.moduleSession))) {
      return NextResponse.json({ error: "Module sebelumnya belum selesai" }, { status: 409 });
    }
    if (isModuleExpired(access.moduleSession)) {
      return NextResponse.json({ error: "Waktu module sudah berakhir" }, { status: 409 });
    }

    const isKecermatan = access.moduleSession.module_type === "KECERMATAN";
    if (!isKecermatan && (body.current_question_index as number) > 99) {
      return NextResponse.json({ error: "Posisi soal tidak valid" }, { status: 400 });
    }
    const currentColumn = body.current_column_index;
    const remaining = body.column_remaining_ms;
    if (
      (isKecermatan &&
        (!Number.isInteger(currentColumn) ||
          (currentColumn as number) < 1 ||
          (currentColumn as number) > 10 ||
          typeof remaining !== "number" ||
          !Number.isFinite(remaining) ||
          remaining < 0 ||
          remaining > 60_000)) ||
      (!isKecermatan && (currentColumn != null || remaining != null))
    ) {
      return NextResponse.json({ error: "Posisi module tidak valid" }, { status: 400 });
    }

    const now = Date.now();
    const snapshot: RecoverySnapshot = {
      current_question_index: body.current_question_index as number,
      current_column_index: isKecermatan ? (currentColumn as number) : null,
      column_remaining_ms: isKecermatan ? Math.round(remaining as number) : null,
      snapshot_at: now,
    };
    const startedAt = access.moduleSession.started_at ?? new Date(now).toISOString();

    const { error: moduleError } = await supabaseAdmin
      .from("module_sessions")
      .update({
        recovery_snapshot: snapshot,
        status: "IN_PROGRESS",
        started_at: startedAt,
      })
      .eq("id", access.moduleSession.id)
      .in("status", ["NOT_STARTED", "IN_PROGRESS"]);
    if (moduleError) throw moduleError;

    const { error: sessionError } = await supabaseAdmin
      .from("test_sessions")
      .update({ status: "IN_PROGRESS" })
      .eq("id", sessionId)
      .in("status", ["PENDING", "IN_PROGRESS"]);
    if (sessionError) throw sessionError;

    return NextResponse.json({ synced_at: now, started_at: startedAt });
  } catch (err) {
    console.error("[PATCH sync]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const access = await getSessionAccess(sessionId, false);
    if (!access.ok) {
      return NextResponse.json({ error: access.message }, { status: access.status });
    }

    const { data, error } = await supabaseAdmin
      .from("test_sessions")
      .select(
        "id, status, module_sessions(id, module_type, sequence_order, status, time_limit_seconds, recovery_snapshot, started_at)"
      )
      .eq("id", sessionId)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Session tidak ditemukan" }, { status: 404 });
    }
    if (Array.isArray(data.module_sessions)) {
      (data.module_sessions as { sequence_order: number }[]).sort(
        (a, b) => a.sequence_order - b.sequence_order
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET sync]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
