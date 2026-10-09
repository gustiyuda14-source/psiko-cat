import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSessionAccess } from "@/lib/session-access";
import { SIMULASI_PACKAGE } from "@/lib/test-config";

type ModulePayload = {
  moduleSessionId: string;
  answers: Record<string, string>;
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const {
    sessionId,
    kecerdasan,
    kepribadian,
    kecermatan,
  } = body as {
    sessionId?: string;
    kecerdasan?: ModulePayload;
    kepribadian?: ModulePayload;
    kecermatan?: ModulePayload;
  };

  const rescued: Record<string, number> = {};

  if (!sessionId) return NextResponse.json({ error: "sessionId wajib" }, { status: 400 });
  for (const payload of [kecerdasan, kepribadian]) {
    if (
      payload &&
      (typeof payload.moduleSessionId !== "string" ||
        !payload.answers ||
        Array.isArray(payload.answers) ||
        typeof payload.answers !== "object" ||
        Object.keys(payload.answers).length > 100)
    ) {
      return NextResponse.json({ error: "Payload pemulihan tidak valid" }, { status: 400 });
    }
  }
  const access = await getSessionAccess(sessionId, false);
  if (!access.ok) {
    return NextResponse.json({ error: access.message }, { status: access.status });
  }
  if (access.testSession.status !== "PENDING" && access.testSession.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "Hasil yang sudah final hanya dapat diperbaiki melalui admin" },
      { status: 409 }
    );
  }

  async function rescueModule(
    payload: ModulePayload | undefined,
    moduleType: "KECERDASAN" | "KEPRIBADIAN"
  ) {
    if (!payload?.moduleSessionId || !payload.answers) return;

    const entries = Object.entries(payload.answers);
    if (!entries.length) return;

    // Verify module_session belongs to the authenticated user
    const { data: ms } = await supabaseAdmin
      .from("module_sessions")
      .select("id, status, module_type, test_session_id, test_sessions!inner(user_id)")
      .eq("id", payload.moduleSessionId)
      .eq("test_session_id", sessionId)
      .eq("module_type", moduleType)
      .single();

    const owner = (ms?.test_sessions as unknown as { user_id: string } | null)?.user_id;
    const userId = session?.sub;
    if (
      !ms ||
      !userId ||
      owner !== userId ||
      ms.status === "COMPLETED" ||
      ms.status === "TIMED_OUT"
    ) return;

    const questionIds = entries.map(([questionId]) => questionId);
    const { data: questions, error: questionError } = await supabaseAdmin
      .from("questions")
      .select("id")
      .in("id", questionIds)
      .eq("type", moduleType)
      .eq("package_number", SIMULASI_PACKAGE[moduleType])
      .eq("is_active", true);
    if (questionError || questions?.length !== new Set(questionIds).size) return;
    if (entries.some(([, key]) => !/^[A-E]{1,5}$/.test(key))) return;

    const { error } = await supabaseAdmin
      .from("answers")
      .upsert(
        entries.map(([question_id, selected_key]) => ({
          module_session_id: payload.moduleSessionId,
          question_id,
          selected_key,
          answered_at: new Date().toISOString(),
        })),
        { onConflict: "module_session_id,question_id" }
      );

    if (!error) rescued[payload.moduleSessionId] = entries.length;
  }

  await rescueModule(kecerdasan, "KECERDASAN");
  await rescueModule(kepribadian, "KEPRIBADIAN");

  return NextResponse.json({
    rescued,
    total_rescued: Object.values(rescued).reduce((a, b) => a + b, 0),
    kecermatan_requires_admin: Boolean(kecermatan && Object.keys(kecermatan.answers).length),
    recalculated: null,
  });
}
