import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import KepribadianClient from "./KepribadianClient";
import type { RecoverySnapshot } from "@/lib/types/safe-question";

export default async function KepribadianPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const { data: ms } = await supabaseAdmin
    .from("module_sessions")
    .select("id, status, started_at, recovery_snapshot, sequence_order, test_session_id")
    .eq("test_session_id", sessionId)
    .eq("module_type", "KEPRIBADIAN")
    .maybeSingle();

  if (!ms) notFound();

  if (ms.status === "COMPLETED" || ms.status === "TIMED_OUT") {
    redirect(`/test/${sessionId}`);
  }

  if (ms.sequence_order > 1) {
    const { data: prev } = await supabaseAdmin
      .from("module_sessions")
      .select("status")
      .eq("test_session_id", sessionId)
      .eq("sequence_order", ms.sequence_order - 1)
      .maybeSingle();
    if (prev && prev.status !== "COMPLETED" && prev.status !== "TIMED_OUT") {
      redirect(`/test/${sessionId}`);
    }
  }

  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, type, sequence_number, column_index, options_payload, is_active, created_at, updated_at")
    .eq("type", "KEPRIBADIAN")
    .eq("is_active", true)
    .order("sequence_number", { ascending: true });

  const snapshot = (ms.recovery_snapshot ?? null) as RecoverySnapshot | null;

  return (
    <KepribadianClient
      questions={questions ?? []}
      moduleSessionId={ms.id}
      sessionId={sessionId}
      startedAt={ms.started_at ?? null}
      snapshot={snapshot}
    />
  );
}
