"use client";

import { useRouter } from "next/navigation";
import EngineKecerdasan from "@/app/components/engines/EngineKecerdasan";
import type { SafeQuestion, RecoverySnapshot } from "@/lib/types/safe-question";

type Props = {
  questions: SafeQuestion[];
  moduleSessionId: string;
  sessionId: string;
  startedAt: string | null;
  snapshot: RecoverySnapshot | null;
};

export default function KecerdasanClient({
  questions,
  moduleSessionId,
  sessionId,
  startedAt,
  snapshot,
}: Props) {
  const router = useRouter();
  return (
    <EngineKecerdasan
      questions={questions}
      moduleSessionId={moduleSessionId}
      sessionId={sessionId}
      startedAt={startedAt}
      initialSnapshot={snapshot}
      onComplete={() => router.push(`/test/${sessionId}`)}
    />
  );
}
