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
import { Check, ChevronLeft, ChevronRight } from "@/app/components/icons";

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
      />
      {engine.saveError && (
        <SaveErrorNotice message={engine.saveError} onRetry={() => void engine.flushAnswers()} />
      )}

      <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:items-start lg:gap-6">
        <QuestionNavigator
          itemLabel="Soal"
          questionIds={sorted.map((question) => question.id)}
          answers={state.answers}
          currentIndex={idx}
          secondsLeft={secondsLeft}
          onGoTo={(index) => store.getState().goTo(index)}
          onSubmit={() => setShowConfirm(true)}
        />

        <main className="min-w-0 flex-1 space-y-4">
          {/* key memaksa remount saat soal berganti: satu momen gerak yang
              menandai "ini konten baru", bukan animasi hias di tiap elemen. */}
          <article key={q?.id} data-active-question tabIndex={-1} className="surface-card enter-rise overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-6">
              <h2 className="tnum text-sm font-semibold text-foreground">Soal {idx + 1}</h2>
              <Badge tone={multi ? "accent" : "neutral"}>
                {multi ? "Boleh lebih dari satu jawaban" : "Satu jawaban"}
              </Badge>
            </div>

            <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
              {payload?.instruksi && (
                <p className="text-sm font-semibold text-foreground">{payload.instruksi}</p>
              )}

              {payload?.sub_text && (
                <div className="inset-panel px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {payload.sub_text}
                </div>
              )}

              {payload?.question_text && (
                <p className="max-w-[68ch] text-base leading-relaxed text-foreground">
                  {payload.question_text}
                </p>
              )}

              {payload?.svg_content && (
                <div
                  className="flex justify-center overflow-x-auto rounded-md border border-border bg-card p-4"
                  dangerouslySetInnerHTML={{ __html: payload.svg_content }}
                />
              )}

              <div className="space-y-2 pt-1">
                {payload?.choices?.map((c) => {
                  const isSelected = multi ? Boolean(picked?.includes(c.key)) : picked === c.key;
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
                        className={`flex size-9 shrink-0 items-center justify-center text-sm font-bold transition-colors duration-150 ${
                          multi ? "rounded-[6px]" : "rounded-full"
                        } ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "border border-border-strong/45 bg-surface-inset text-muted-foreground"
                        }`}
                      >
                        {isSelected && multi ? <Check className="size-4" strokeWidth={3} /> : c.key}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground">{c.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          {/* Maju adalah aksi yang dominan: peserta hampir selalu bergerak ke
              depan, jadi Sebelumnya turun ke sekunder. Sebelumnya keduanya
              identik dan tidak memandu apa pun. */}
          <nav className="flex gap-3" aria-label="Navigasi soal">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => store.getState().prev()}
              disabled={idx === 0}
              className="flex-1 sm:flex-none"
            >
              <ChevronLeft className="size-4" />
              Sebelumnya
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => store.getState().next(sorted.length - 1)}
              disabled={idx >= sorted.length - 1}
              className="flex-1 sm:ml-auto sm:min-w-40 sm:flex-none"
            >
              Soal berikutnya
              <ChevronRight className="size-4" />
            </Button>
          </nav>
        </main>
      </div>
    </div>
  );
}
