import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type AnswerInput = {
  question_id: string;
  selected_key: "A" | "B" | "C" | "D" | "E";
  column_index?: number;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: session_id, moduleId: module_session_id } = await params;
    const body = await req.json() as { answers: AnswerInput[] };

    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json({ error: "answers array wajib diisi" }, { status: 400 });
    }

    const { data: moduleSession, error: msError } = await supabaseAdmin
      .from("module_sessions")
      .select("id, status")
      .eq("id", module_session_id)
      .eq("test_session_id", session_id)
      .single();

    if (msError || !moduleSession) {
      return NextResponse.json({ error: "Module session tidak ditemukan" }, { status: 404 });
    }

    if (moduleSession.status === "COMPLETED" || moduleSession.status === "TIMED_OUT") {
      return NextResponse.json({ error: "Module sudah selesai, tidak bisa menambah jawaban" }, { status: 409 });
    }

    const { error: upsertError } = await supabaseAdmin
      .from("answers")
      .upsert(
        body.answers.map((a) => ({
          module_session_id,
          question_id: a.question_id,
          selected_key: a.selected_key,
          column_index: a.column_index ?? null,
          answered_at: new Date().toISOString(),
        })),
        { onConflict: "module_session_id,question_id" }
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({ saved: body.answers.length });

  } catch (err) {
    console.error("[POST /api/sessions/[id]/modules/[moduleId]/answers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: session_id, moduleId: module_session_id } = await params;

    const { data: moduleSession, error: msError } = await supabaseAdmin
      .from("module_sessions")
      .select("id")
      .eq("id", module_session_id)
      .eq("test_session_id", session_id)
      .single();

    if (msError || !moduleSession) {
      return NextResponse.json({ error: "Module session tidak ditemukan" }, { status: 404 });
    }

    const { data: answers, error: answersError } = await supabaseAdmin
      .from("answers")
      .select("question_id, selected_key, column_index, answered_at")
      .eq("module_session_id", module_session_id)
      .order("answered_at", { ascending: true });

    if (answersError) throw answersError;

    return NextResponse.json({ answers });

  } catch (err) {
    console.error("[GET /api/sessions/[id]/modules/[moduleId]/answers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
