import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getModuleAccess,
  isModuleExpired,
  isModuleSequenceAvailable,
  isTerminalModule,
} from "@/lib/session-access";
import type {
  KecerdasanOptionsPayload,
  KepribadianOptionsPayload,
} from "@/lib/types/safe-question";

type AnswerInput = { question_id?: unknown; selected_key?: unknown };

function denied(access: { status: number; message: string }) {
  return NextResponse.json({ error: access.message }, { status: access.status });
}

function normalizedSelection(
  value: unknown,
  payload: KecerdasanOptionsPayload | KepribadianOptionsPayload
): string | null {
  if (typeof value !== "string") return null;
  const allowed = new Set((payload.choices ?? []).map((choice) => choice.key));
  const keys = [...new Set(value.toUpperCase().split(""))].sort();
  if (!keys.length || keys.some((key) => !allowed.has(key as "A" | "B" | "C" | "D" | "E"))) {
    return null;
  }
  const multi = "is_multi_select" in payload && payload.is_multi_select === true;
  if (!multi && keys.length !== 1) return null;
  return keys.join("");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: sessionId, moduleId } = await params;
    const access = await getModuleAccess(sessionId, moduleId, false);
    if (!access.ok) return denied(access);

    const body = (await req.json().catch(() => null)) as { answers?: AnswerInput[] } | null;
    if (!Array.isArray(body?.answers) || body.answers.length === 0 || body.answers.length > 100) {
      return NextResponse.json({ error: "answers harus berisi 1–100 jawaban" }, { status: 400 });
    }
    if (isTerminalModule(access.moduleSession.status)) {
      return NextResponse.json({ error: "Module sudah selesai" }, { status: 409 });
    }
    if (isModuleExpired(access.moduleSession)) {
      return NextResponse.json({ error: "Waktu module sudah berakhir" }, { status: 409 });
    }
    if (!(await isModuleSequenceAvailable(access.moduleSession))) {
      return NextResponse.json({ error: "Module sebelumnya belum selesai" }, { status: 409 });
    }
    if (access.moduleSession.module_type === "KECERMATAN") {
      return NextResponse.json({ error: "Gunakan endpoint log Kecermatan" }, { status: 400 });
    }

    const latestByQuestion = new Map<string, AnswerInput>();
    for (const answer of body.answers) {
      if (typeof answer?.question_id !== "string" || !answer.question_id) {
        return NextResponse.json({ error: "question_id tidak valid" }, { status: 400 });
      }
      latestByQuestion.set(answer.question_id, answer);
    }

    const { data: questions, error: questionError } = await supabaseAdmin
      .from("questions")
      .select("id, type, options_payload")
      .in("id", [...latestByQuestion.keys()])
      .eq("type", access.moduleSession.module_type)
      .eq("is_active", true);
    if (questionError) throw questionError;
    if (questions?.length !== latestByQuestion.size) {
      return NextResponse.json({ error: "Ada soal yang tidak termasuk module ini" }, { status: 400 });
    }

    const rows = questions.map((question) => {
      const input = latestByQuestion.get(question.id)!;
      const selectedKey = normalizedSelection(
        input.selected_key,
        question.options_payload as KecerdasanOptionsPayload | KepribadianOptionsPayload
      );
      if (!selectedKey) throw new TypeError(`Pilihan tidak valid untuk soal ${question.id}`);
      return {
        module_session_id: moduleId,
        question_id: question.id,
        selected_key: selectedKey,
        column_index: null,
        answered_at: new Date().toISOString(),
      };
    });

    if (!access.moduleSession.started_at) {
      const { error } = await supabaseAdmin
        .from("module_sessions")
        .update({ status: "IN_PROGRESS", started_at: new Date().toISOString() })
        .eq("id", moduleId)
        .eq("status", "NOT_STARTED");
      if (error) throw error;
    }

    const { error: upsertError } = await supabaseAdmin
      .from("answers")
      .upsert(rows, { onConflict: "module_session_id,question_id" });
    if (upsertError) throw upsertError;
    return NextResponse.json({ saved: rows.length });
  } catch (err) {
    if (err instanceof TypeError && err.message.startsWith("Pilihan tidak valid")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[POST answers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: sessionId, moduleId } = await params;
    const access = await getModuleAccess(sessionId, moduleId, false);
    if (!access.ok) return denied(access);

    const { data: answers, error } = await supabaseAdmin
      .from("answers")
      .select("question_id, selected_key, column_index, answered_at")
      .eq("module_session_id", moduleId)
      .order("answered_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ answers: answers ?? [] });
  } catch (err) {
    console.error("[GET answers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
