import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import KecerdasanClient from "./KecerdasanClient";
import type { RecoverySnapshot } from "@/lib/types/safe-question";

export default async function KecerdasanPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const ms = await prisma.moduleSession.findFirst({
    where: { test_session_id: sessionId, module_type: "KECERDASAN" },
    select: {
      id: true,
      status: true,
      started_at: true,
      recovery_snapshot: true,
      sequence_order: true,
      test_session_id: true,
    },
  });

  if (!ms) notFound();

  // If completed/timed out, go back to overview
  if (ms.status === "COMPLETED" || ms.status === "TIMED_OUT") {
    redirect(`/test/${sessionId}`);
  }

  // Sequential lock: previous module must be done
  if (ms.sequence_order > 1) {
    const prev = await prisma.moduleSession.findFirst({
      where: { test_session_id: sessionId, sequence_order: ms.sequence_order - 1 },
      select: { status: true },
    });
    if (prev && prev.status !== "COMPLETED" && prev.status !== "TIMED_OUT") {
      redirect(`/test/${sessionId}`);
    }
  }

  const questions = await prisma.question.findMany({
    where: { type: "KECERDASAN", is_active: true },
    orderBy: { sequence_number: "asc" },
    select: {
      id: true,
      type: true,
      sequence_number: true,
      column_index: true,
      options_payload: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  });

  const snapshot = (ms.recovery_snapshot ?? null) as RecoverySnapshot | null;

  return (
    <KecerdasanClient
      questions={questions}
      moduleSessionId={ms.id}
      sessionId={sessionId}
      startedAt={ms.started_at?.toISOString() ?? null}
      snapshot={snapshot}
    />
  );
}
