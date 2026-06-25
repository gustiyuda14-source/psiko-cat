"use client";

import { useRouter } from "next/navigation";
import EngineKepribadian from "@/app/components/engines/EngineKepribadian";
import type { SafeQuestion, RecoverySnapshot } from "@/lib/types/safe-question";

type Props = {
  questions: SafeQuestion[];
  moduleSessionId: string;
  sessionId: string;
  startedAt: string | null;
  snapshot: RecoverySnapshot | null;
};

export default function KepribadianClient({
  questions,
  moduleSessionId,
  sessionId,
  startedAt,
  snapshot,
}: Props) {
  const router = useRouter();
  return (
    <EngineKepribadian
      questions={questions}
      moduleSessionId={moduleSessionId}
      sessionId={sessionId}
      startedAt={startedAt}
      initialSnapshot={snapshot}
      onComplete={() => router.push(`/test/${sessionId}`)}
    />
  );
}
