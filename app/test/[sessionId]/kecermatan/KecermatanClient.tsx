"use client";

import { useRouter } from "next/navigation";
import EngineKecermatan from "@/app/components/engines/EngineKecermatan";
import type { SafeQuestion, RecoverySnapshot } from "@/lib/types/safe-question";

type Props = {
  questions: SafeQuestion[];
  moduleSessionId: string;
  sessionId: string;
  snapshot: RecoverySnapshot | null;
};

export default function KecermatanClient({
  questions,
  moduleSessionId,
  sessionId,
  snapshot,
}: Props) {
  const router = useRouter();
  return (
    <EngineKecermatan
      questions={questions}
      moduleSessionId={moduleSessionId}
      sessionId={sessionId}
      initialSnapshot={snapshot}
      onComplete={() => router.push(`/test/${sessionId}`)}
    />
  );
}
