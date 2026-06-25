import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type LogEntry = {
  question_id: string;
  column_index: number;
  clicked_at_ms: number;
  response_value: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      module_session_id: string;
      logs: LogEntry[];
    };

    const { module_session_id, logs } = body;

    if (!module_session_id || !logs || logs.length === 0) {
      return NextResponse.json({ error: "module_session_id dan logs wajib" }, { status: 400 });
    }

    const { data: moduleSession, error: msError } = await supabaseAdmin
      .from("module_sessions")
      .select("id, status")
      .eq("id", module_session_id)
      .eq("module_type", "KECERMATAN")
      .single();

    if (msError || !moduleSession) {
      return NextResponse.json({ error: "Kecermatan module session tidak ditemukan" }, { status: 404 });
    }

    if (moduleSession.status === "COMPLETED" || moduleSession.status === "TIMED_OUT") {
      return NextResponse.json({ error: "Module sudah selesai" }, { status: 409 });
    }

    const { data, error: insertError } = await supabaseAdmin
      .from("kecermatan_logs")
      .insert(
        logs.map((log) => ({
          module_session_id,
          question_id: log.question_id,
          column_index: log.column_index,
          clicked_at_ms: log.clicked_at_ms,
          response_value: log.response_value,
          is_correct: null,
        }))
      )
      .select("id");

    if (insertError) throw insertError;

    return NextResponse.json({ inserted: data?.length ?? 0 });

  } catch (err) {
    console.error("[POST /api/kecermatan/log]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
