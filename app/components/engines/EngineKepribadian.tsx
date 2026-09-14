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
  ExamCompleted,
  ExamHeader,
  ExamLoading,
  OfflineNotice,
  QuestionNavigator,
  ResumeDialog,
  SaveErrorNotice,
  SubmitDialog,
} from "@/app/components/ExamChrome";
import { Badge } from "@/app/components/ui";
import { Button } from "@/app/components/ui-client";
import { ChevronLeft, ChevronRight } from "@/app/components/icons";

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
      />
      {engine.saveError && (
        <SaveErrorNotice message={engine.saveError} onRetry={() => void engine.flushAnswers()} />
      )}

      <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:items-start lg:gap-6">
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
          onSubmit={() => setShowConfirm(true)}
        />

        <main className="min-w-0 flex-1 space-y-4">
          <article key={q?.id} data-active-question tabIndex={-1} className="surface-card enter-rise overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-6">
              <h2 className="tnum text-sm font-semibold text-foreground">Pernyataan {idx + 1}</h2>
              {payload?.aspect && <Badge tone="info">{payload.aspect}</Badge>}
            </div>

            {/* Pernyataan berdiri sendiri sebagai satu-satunya hal yang dibaca,
                jadi ukurannya naik dan lebar barisnya dikunci ke ukuran nyaman
                baca alih-alih memenuhi kartu. */}
            <div className="px-4 py-8 sm:px-6 sm:py-10">
              <p className="mx-auto max-w-[46ch] text-center text-lg font-medium leading-relaxed text-foreground sm:text-xl">
                {payload?.statement}
              </p>
            </div>

            <fieldset className="space-y-2 px-4 pb-5 sm:px-6 sm:pb-6">
              <legend className="sr-only">Seberapa sesuai pernyataan ini dengan Anda</legend>
              {payload?.choices?.map((c) => {
                const isSelected = picked === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => choose(c.key)}
                    aria-pressed={isSelected}
                    className={`flex min-h-12 w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow] duration-150 ease-out sm:gap-4 sm:px-4 ${
                      isSelected
                        ? "border-primary bg-primary/6 shadow-e1"
                        : "border-border hover:border-border-strong hover:bg-surface-inset"
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                        isSelected ? "border-primary bg-primary" : "border-border-strong/60"
                      }`}
                    >
                      {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground">{c.text}</span>
                    <kbd className="hidden font-mono text-xs text-faint-foreground sm:block">
                      {c.key}
                    </kbd>
                  </button>
                );
              })}
            </fieldset>
          </article>

          <nav className="flex gap-3" aria-label="Navigasi pernyataan">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
                store.getState().prev();
              }}
              disabled={idx === 0}
              className="flex-1 sm:flex-none"
            >
              <ChevronLeft className="size-4" />
              Sebelumnya
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
                store.getState().next(sorted.length - 1);
              }}
              disabled={idx >= sorted.length - 1}
              className="flex-1 sm:ml-auto sm:min-w-40 sm:flex-none"
            >
              Pernyataan berikutnya
              <ChevronRight className="size-4" />
            </Button>
          </nav>
        </main>
      </div>
    </div>
  );
}
