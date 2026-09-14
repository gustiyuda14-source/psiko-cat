import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getModuleAccess,
  isModuleExpired,
  isModuleSequenceAvailable,
  isTerminalModule,
} from "@/lib/session-access";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const { id: sessionId, moduleId } = await params;
    const access = await getModuleAccess(sessionId, moduleId, false);
    if (!access.ok) {
      return NextResponse.json({ error: access.message }, { status: access.status });
    }
    if (isTerminalModule(access.moduleSession.status)) return NextResponse.json({ ok: true });
    if (!(await isModuleSequenceAvailable(access.moduleSession))) {
      return NextResponse.json({ error: "Module sebelumnya belum selesai" }, { status: 409 });
    }

    const status = isModuleExpired(access.moduleSession) ? "TIMED_OUT" : "COMPLETED";

    const { error } = await supabaseAdmin
      .from("module_sessions")
      .update({ status, completed_at: new Date().toISOString() })
      .eq("id", moduleId)
      .in("status", ["NOT_STARTED", "IN_PROGRESS"]);
    if (error) throw error;
    return NextResponse.json({ ok: true, status });
  } catch (err) {
    console.error("[POST complete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
