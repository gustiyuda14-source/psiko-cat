import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getModuleAccess,
  isModuleExpired,
  isModuleSequenceAvailable,
  isTerminalModule,
} from "@/lib/session-access";
import type { KecermatanOptionsPayload } from "@/lib/types/safe-question";

type LogInput = {
  question_id?: unknown;
  clicked_at_ms?: unknown;
  response_value?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      session_id?: unknown;
      module_session_id?: unknown;
      logs?: LogInput[];
    } | null;
    if (
      typeof body?.session_id !== "string" ||
      typeof body.module_session_id !== "string" ||
      !Array.isArray(body.logs) ||
      body.logs.length === 0 ||
      body.logs.length > 100
    ) {
      return NextResponse.json({ error: "Payload log tidak valid" }, { status: 400 });
    }

    const access = await getModuleAccess(body.session_id, body.module_session_id, false);
    if (!access.ok) {
      return NextResponse.json({ error: access.message }, { status: access.status });
    }
    if (access.moduleSession.module_type !== "KECERMATAN") {
      return NextResponse.json({ error: "Module bukan Kecermatan" }, { status: 400 });
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

    const latestByQuestion = new Map<string, LogInput>();
    for (const log of body.logs) {
      if (
        typeof log.question_id !== "string" ||
        typeof log.clicked_at_ms !== "number" ||
        !Number.isSafeInteger(log.clicked_at_ms) ||
        typeof log.response_value !== "string"
      ) {
        return NextResponse.json({ error: "Ada log yang tidak valid" }, { status: 400 });
      }
      latestByQuestion.set(log.question_id, log);
    }

    const questionIds = [...latestByQuestion.keys()];
    const { data: questions, error: questionError } = await supabaseAdmin
      .from("questions")
      .select("id, column_index, package_number, options_payload")
      .in("id", questionIds)
      .eq("type", "KECERMATAN")
      .eq("is_active", true)
      .eq("package_number", access.moduleSession.kecermatan_package_number);
    if (questionError) throw questionError;
    if (questions?.length !== latestByQuestion.size) {
      return NextResponse.json({ error: "Ada soal yang tidak termasuk paket sesi" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("kecermatan_logs")
      .select("question_id")
      .eq("module_session_id", body.module_session_id)
      .in("question_id", questionIds);
    if (existingError) throw existingError;
    const existingIds = new Set((existing ?? []).map((row) => row.question_id));

    const rows = questions.flatMap((question) => {
      if (existingIds.has(question.id)) return [];
      const log = latestByQuestion.get(question.id)!;
      const payload = question.options_payload as KecermatanOptionsPayload;
      if (
        !Number.isInteger(question.column_index) ||
        question.column_index < 1 ||
        question.column_index > 10 ||
        !payload.choices?.includes(log.response_value as "A" | "B" | "C" | "D" | "E")
      ) {
        throw new TypeError(`Log tidak valid untuk soal ${question.id}`);
      }
      return [{
        module_session_id: body.module_session_id as string,
        question_id: question.id,
        column_index: question.column_index,
        clicked_at_ms: log.clicked_at_ms as number,
        response_value: log.response_value as string,
        is_correct: null,
      }];
    });

    if (!access.moduleSession.started_at) {
      const { error } = await supabaseAdmin
        .from("module_sessions")
        .update({ status: "IN_PROGRESS", started_at: new Date().toISOString() })
        .eq("id", body.module_session_id)
        .eq("status", "NOT_STARTED");
      if (error) throw error;
    }
    if (rows.length) {
      const { error } = await supabaseAdmin.from("kecermatan_logs").insert(rows);
      if (error) throw error;
    }
    return NextResponse.json({ inserted: rows.length, duplicates: questionIds.length - rows.length });
  } catch (err) {
    if (err instanceof TypeError && err.message.startsWith("Log tidak valid")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[POST kecermatan log]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    const moduleId = req.nextUrl.searchParams.get("module_session_id");
    if (!sessionId || !moduleId) {
      return NextResponse.json({ error: "ID sesi dan module wajib" }, { status: 400 });
    }
    const access = await getModuleAccess(sessionId, moduleId, false);
    if (!access.ok) {
      return NextResponse.json({ error: access.message }, { status: access.status });
    }
    if (access.moduleSession.module_type !== "KECERMATAN") {
      return NextResponse.json({ error: "Module bukan Kecermatan" }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from("kecermatan_logs")
      .select("question_id, response_value, clicked_at_ms")
      .eq("module_session_id", moduleId)
      .order("clicked_at_ms", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ logs: data ?? [] });
  } catch (err) {
    console.error("[GET kecermatan log]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
