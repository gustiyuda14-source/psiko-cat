"use client";

import type {
  SafeQuestion,
  KecerdasanOptionsPayload,
  RecoverySnapshot,
} from "@/lib/types/safe-question";
import { useCallback, useMemo, useState } from "react";
import { useKecerdasanStore } from "@/lib/stores/exam-store";
import { useExamEngine } from "@/lib/hooks/use-exam-engine";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";
import {
  ExamBody,
  ExamCompleted,
  ExamDock,
  ExamHeader,
  ExamLoading,
  OfflineNotice,
  QuestionNavigator,
  ResumeDialog,
  SaveErrorNotice,
  SubmitDialog,
} from "@/app/components/ExamChrome";
import { Badge } from "@/app/components/ui";
import { Check } from "@/app/components/icons";

type Props = {
  questions: SafeQuestion[];
  moduleSessionId: string;
  sessionId: string;
  timeLimitSeconds?: number;
  startedAt?: string | null;
  initialSnapshot?: RecoverySnapshot | null;
  onComplete?: () => void;
};

export default function EngineKecerdasan({
  questions,
  moduleSessionId,
  sessionId,
  timeLimitSeconds = 5400,
  startedAt,
  initialSnapshot,
  onComplete,
}: Props) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.sequence_number - b.sequence_number),
    [questions]
  );

  const engine = useExamEngine({
    store: useKecerdasanStore,
    sessionId,
    moduleSessionId,
    timeLimitSeconds,
    startedAt,
    initialSnapshot,
    totalQuestions: sorted.length,
    onComplete,
  });

  const { mounted, isOffline, showResume, resumeIndex, secondsLeft, state, store } = engine;
  const [showConfirm, setShowConfirm] = useState(false);

  const idx = Math.min(state.currentIndex, sorted.length - 1);
  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KecerdasanOptionsPayload | undefined;
  const picked = q ? state.answers[q.id] : undefined;
  const answeredCount = Object.keys(state.answers).length;
  const multi = Boolean(payload?.is_multi_select);

  /*
    Multi-select disimpan sebagai string kunci yang digabung dan diurutkan
    ("ACD"), jadi memilih berarti toggle satu huruf di dalam string itu.
    Logika ini dipakai bersama oleh klik dan keyboard — kalau dipisah, dua jalur
    input akan menyimpang.
  */
  const choose = useCallback(
    (key: string) => {
      if (!q) return;
      if (!multi) {
        engine.handleAnswer(q.id, key);
        return;
      }
      const current = picked ?? "";
      if (!current.includes(key) && current.length >= 2) return;
      const next = current.includes(key)
        ? current.replace(key, "")
        : (current + key).split("").sort().join("");
      if (!next) return;
      engine.handleAnswer(q.id, next);
    },
    [engine, q, multi, picked]
  );

  const choiceKeys = useMemo(() => payload?.choices?.map((c) => c.key) ?? [], [payload]);

  useExamKeyboard({
    enabled: mounted && !showResume && !showConfirm && state.status === "running",
    choiceKeys,
    onChoose: choose,
    onPrev: () => store.getState().prev(),
    onNext: () => store.getState().next(sorted.length - 1),
  });

  if (!mounted) return <ExamLoading />;

  if (state.status === "completed") {
    return (
      <ExamCompleted
        title="Sub-Tes Kecerdasan selesai"
        note="Jawaban sudah tersimpan di server. Mengalihkan ke sub-tes berikutnya."
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {isOffline && <OfflineNotice />}

      <ResumeDialog
        open={showResume}
        itemLabel="Soal"
        resumeIndex={resumeIndex}
        onResume={engine.doResume}
        onFreshStart={engine.doFreshStart}
      />

      <SubmitDialog
        open={showConfirm}
        itemLabel="Soal"
        answered={answeredCount}
        total={sorted.length}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          engine.finish();
        }}
      />

      <ExamHeader
        title="Sub-Tes Kecerdasan"
        itemLabel="Soal"
        current={idx + 1}
        total={sorted.length}
        answered={answeredCount}
        secondsLeft={secondsLeft}
        saveState={engine.saveState}
        pendingCount={engine.pendingCount}
        onEnd={() => setShowConfirm(true)}
      />
      {engine.saveError && (
        <SaveErrorNotice message={engine.saveError} onRetry={() => void engine.flushAnswers()} />
      )}

      <ExamBody
        navigator={
          <QuestionNavigator
            itemLabel="Soal"
            questionIds={sorted.map((question) => question.id)}
            answers={state.answers}
            currentIndex={idx}
            secondsLeft={secondsLeft}
            onGoTo={(index) => store.getState().goTo(index)}
          />
        }
      >
        {/* key memaksa remount saat soal berganti: satu momen gerak yang
            menandai "ini konten baru", bukan animasi hias di tiap elemen. */}
        <article key={q?.id} data-active-question tabIndex={-1} className="enter-rise space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="qnum tnum">Soal {idx + 1}</p>
            <Badge tone={multi ? "accent" : "neutral"}>
              {multi ? "Boleh lebih dari satu jawaban" : "Satu jawaban"}
            </Badge>
          </div>

          {payload?.instruksi && (
            <p className="text-sm font-semibold text-foreground">{payload.instruksi}</p>
          )}

          {payload?.sub_text && (
            <div className="inset-panel px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {payload.sub_text}
            </div>
          )}

          {payload?.question_text && (
            <p className="max-w-[68ch] text-lg leading-relaxed text-foreground">
              {payload.question_text}
            </p>
          )}

          {payload?.svg_content && (
            <div
              className="flex justify-center overflow-x-auto rounded-md border border-border bg-card p-4"
              dangerouslySetInnerHTML={{ __html: payload.svg_content }}
            />
          )}

          <div className="opts pt-1">
            {payload?.choices?.map((c) => {
              const isSelected = multi ? Boolean(picked?.includes(c.key)) : picked === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => choose(c.key)}
                  aria-pressed={isSelected}
                  className={`opt ${isSelected ? "sel" : ""}`}
                >
                  <span className={`mark ${multi ? "is-square" : ""}`}>
                    {isSelected && multi ? <Check className="size-4" strokeWidth={3} /> : c.key}
                  </span>
                  <span className="text-sm leading-relaxed">{c.text}</span>
                </button>
              );
            })}
          </div>
        </article>
      </ExamBody>

      <ExamDock
        onPrev={() => store.getState().prev()}
        onNext={() => store.getState().next(sorted.length - 1)}
        prevDisabled={idx === 0}
        nextDisabled={idx >= sorted.length - 1}
        prevLabel="Soal sebelumnya"
        nextLabel="Soal berikutnya"
      />
    </div>
  );
}
