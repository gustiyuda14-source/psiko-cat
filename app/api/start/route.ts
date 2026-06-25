import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MODULES = [
  { type: "KECERDASAN", time_limit_seconds: 5400 },
  { type: "KECERMATAN", time_limit_seconds: 600 },
  { type: "KEPRIBADIAN", time_limit_seconds: 3600 },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; email?: string; phone?: string };
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name dan email wajib diisi" }, { status: 400 });
    }

    // Upsert user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .upsert({ name, email, phone: phone ?? null }, { onConflict: "email" })
      .select("id")
      .single();

    if (userError || !user) {
      throw userError ?? new Error("Failed to upsert user");
    }

    // Create test session
    const { data: testSession, error: sessionError } = await supabaseAdmin
      .from("test_sessions")
      .insert({ user_id: user.id, status: "PENDING" })
      .select("id")
      .single();

    if (sessionError || !testSession) {
      throw sessionError ?? new Error("Failed to create test session");
    }

    // Create module sessions
    const { error: modulesError } = await supabaseAdmin
      .from("module_sessions")
      .insert(
        MODULES.map((m, i) => ({
          test_session_id: testSession.id,
          module_type: m.type,
          sequence_order: i + 1,
          status: "NOT_STARTED",
          time_limit_seconds: m.time_limit_seconds,
        }))
      );

    if (modulesError) throw modulesError;

    // Fetch created module sessions ordered
    const { data: moduleSessions, error: fetchError } = await supabaseAdmin
      .from("module_sessions")
      .select("id, module_type, sequence_order")
      .eq("test_session_id", testSession.id)
      .order("sequence_order", { ascending: true });

    if (fetchError) throw fetchError;

    return NextResponse.json(
      { session_id: testSession.id, module_sessions: moduleSessions },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string; meta?: unknown };
    console.error("[POST /api/start]", { code: e?.code, message: e?.message, meta: e?.meta });
    return NextResponse.json(
      { error: "Internal server error", code: e?.code, detail: e?.message },
      { status: 500 }
    );
  }
}
