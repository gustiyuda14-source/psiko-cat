"use client";

import type {
  SafeQuestion,
  KepribadianOptionsPayload,
  RecoverySnapshot,
} from "@/lib/types/safe-question";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useKepribadianStore } from "@/lib/stores/exam-store";
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

type Props = {
  questions: SafeQuestion[];
  moduleSessionId: string;
  sessionId: string;
  timeLimitSeconds?: number;
  startedAt?: string | null;
  initialSnapshot?: RecoverySnapshot | null;
  onComplete?: () => void;
};

export default function EngineKepribadian({
  questions,
  moduleSessionId,
  sessionId,
  timeLimitSeconds = 3600,
  startedAt,
  initialSnapshot,
  onComplete,
}: Props) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.sequence_number - b.sequence_number),
    [questions]
  );

  const engine = useExamEngine({
    store: useKepribadianStore,
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
  const payload = q?.options_payload as unknown as KepribadianOptionsPayload | undefined;
  const picked = q ? state.answers[q.id] : undefined;
  const answeredCount = Object.keys(state.answers).length;
  const advanceTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    },
    []
  );

  // Auto-advance dipertahankan: skala Likert tidak punya jawaban benar/salah,
  // jadi peserta tidak perlu menimbang ulang sebelum lanjut.
  const choose = useCallback(
    (key: string) => {
      if (!q) return;
      engine.handleAnswer(q.id, key);
      if (idx < sorted.length - 1) {
        if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
        advanceTimer.current = window.setTimeout(
          () => store.getState().next(sorted.length - 1),
          200
        );
      }
    },
    [engine, q, idx, sorted.length, store]
  );

  const choiceKeys = useMemo(() => payload?.choices?.map((c) => c.key) ?? [], [payload]);

  useExamKeyboard({
    enabled: mounted && !showResume && !showConfirm && state.status === "running",
    choiceKeys,
    onChoose: choose,
    onPrev: () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      store.getState().prev();
    },
    onNext: () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      store.getState().next(sorted.length - 1);
    },
  });

  if (!mounted) return <ExamLoading label="Menyiapkan pernyataan" />;

  if (state.status === "completed") {
    return (
      <ExamCompleted
        title="Sub-Tes Kepribadian selesai"
        note="Jawaban sudah tersimpan di server. Mengalihkan ke sub-tes berikutnya."
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {isOffline && <OfflineNotice />}

      <ResumeDialog
        open={showResume}
        itemLabel="Pernyataan"
        resumeIndex={resumeIndex}
        onResume={engine.doResume}
        onFreshStart={engine.doFreshStart}
      />

      <SubmitDialog
        open={showConfirm}
        itemLabel="Pernyataan"
        answered={answeredCount}
        total={sorted.length}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          engine.finish();
        }}
      />

      <ExamHeader
        title="Sub-Tes Kepribadian"
        itemLabel="Pernyataan"
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
            itemLabel="Pernyataan"
            questionIds={sorted.map((question) => question.id)}
            answers={state.answers}
            currentIndex={idx}
            secondsLeft={secondsLeft}
            onGoTo={(index) => {
              if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
              store.getState().goTo(index);
            }}
          />
        }
      >
        <article key={q?.id} data-active-question tabIndex={-1} className="enter-rise space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="qnum tnum">Pernyataan {idx + 1}</p>
            {payload?.aspect && <Badge tone="info">{payload.aspect}</Badge>}
          </div>

          {/* Pernyataan berdiri sendiri sebagai satu-satunya hal yang dibaca,
              jadi ukurannya naik dan lebar barisnya dikunci ke ukuran nyaman baca. */}
          <p className="mx-auto max-w-[46ch] py-6 text-center text-lg font-medium leading-relaxed text-foreground sm:py-8 sm:text-xl">
            {payload?.statement}
          </p>

          <fieldset className="opts mx-auto max-w-2xl">
            <legend className="sr-only">Seberapa sesuai pernyataan ini dengan Anda</legend>
            {payload?.choices?.map((c) => {
              const isSelected = picked === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => choose(c.key)}
                  aria-pressed={isSelected}
                  className={`opt ${isSelected ? "sel" : ""}`}
                >
                  <span className="mark">{isSelected && <span className="mark-dot" />}</span>
                  <span className="flex-1 text-sm font-medium">{c.text}</span>
                  <kbd className="hidden font-mono text-xs text-faint-foreground sm:block">{c.key}</kbd>
                </button>
              );
            })}
          </fieldset>
        </article>
      </ExamBody>

      <ExamDock
        onPrev={() => {
          if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
          store.getState().prev();
        }}
        onNext={() => {
          if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
          store.getState().next(sorted.length - 1);
        }}
        prevDisabled={idx === 0}
        nextDisabled={idx >= sorted.length - 1}
        prevLabel="Pernyataan sebelumnya"
        nextLabel="Pernyataan berikutnya"
      />
    </div>
  );
}
