import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MODULE_ORDER = [
  { type: "KECERDASAN",  time_limit_seconds: 5400 },
  { type: "KEPRIBADIAN", time_limit_seconds: 3600 },
  { type: "KECERMATAN",  time_limit_seconds: 600  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id } = body as { user_id?: string };

    if (!user_id) {
      return NextResponse.json({ error: "user_id wajib diisi" }, { status: 400 });
    }

    // Check user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Create test session
    const { data: testSession, error: sessionError } = await supabaseAdmin
      .from("test_sessions")
      .insert({ user_id, status: "PENDING" })
      .select("id, status")
      .single();

    if (sessionError || !testSession) {
      throw sessionError ?? new Error("Failed to create test session");
    }

    // Create module sessions
    const { error: modulesError } = await supabaseAdmin
      .from("module_sessions")
      .insert(
        MODULE_ORDER.map((m, idx) => ({
          test_session_id: testSession.id,
          module_type: m.type,
          sequence_order: idx + 1,
          status: "NOT_STARTED",
          time_limit_seconds: m.time_limit_seconds,
        }))
      );

    if (modulesError) throw modulesError;

    // Fetch module sessions ordered
    const { data: moduleSessions, error: fetchError } = await supabaseAdmin
      .from("module_sessions")
      .select("id, module_type, sequence_order, time_limit_seconds")
      .eq("test_session_id", testSession.id)
      .order("sequence_order", { ascending: true });

    if (fetchError) throw fetchError;

    return NextResponse.json({
      session_id: testSession.id,
      status: testSession.status,
      module_sessions: moduleSessions,
    }, { status: 201 });

  } catch (err) {
    console.error("[POST /api/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
