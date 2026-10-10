"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { recordLatihanProgress } from "@/lib/latihan-progress";
import type { SafeQuestion, KepribadianOptionsPayload } from "@/lib/types/safe-question";
import { Badge } from "@/app/components/ui";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { Check } from "@/app/components/icons";
import { ExamBody, ExamDock, QuestionNavigator } from "@/app/components/ExamChrome";
import { KepribadianReview, type KepribadianReviewItem } from "@/app/components/PembahasanSection";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";

export default function LatihanKepribadian({
  questions,
  progressKey,
}: {
  questions: SafeQuestion[];
  progressKey?: string;
}) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.sequence_number - b.sequence_number),
    [questions]
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Capaian terjauh paket ini (lib/latihan-progress.ts) untuk rak tabung di pemilih paket.
  useEffect(() => {
    if (progressKey) recordLatihanProgress(progressKey, Object.keys(answers).length);
  }, [progressKey, answers]);
  const [showFinish, setShowFinish] = useState(false);
  const [finished, setFinished] = useState(false);
  const advanceTimer = useRef<number | null>(null);

  const q = sorted[idx];
  const payload = q?.options_payload as unknown as KepribadianOptionsPayload | undefined;
  const picked = q ? answers[q.id] : undefined;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const goTo = useCallback((index: number) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setIdx(Math.min(sorted.length - 1, Math.max(0, index)));
  }, [sorted.length]);

  const pick = useCallback(
    (key: string) => {
      if (!q) return;
      setAnswers((prev) => ({ ...prev, [q.id]: key }));
      if (idx < sorted.length - 1) {
        if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
        advanceTimer.current = window.setTimeout(() => setIdx((i) => Math.min(sorted.length - 1, i + 1)), 200);
      }
    },
    [q, idx, sorted.length]
  );

  const choiceKeys = useMemo(() => payload?.choices?.map((c) => c.key) ?? [], [payload]);

  useExamKeyboard({
    enabled: Boolean(q) && !finished && !showFinish,
    choiceKeys,
    onChoose: pick,
    onPrev: () => goTo(idx - 1),
    onNext: () => goTo(idx + 1),
  });

  if (!q) return null;

  if (finished) {
    const items: KepribadianReviewItem[] = sorted.map((question) => ({
      question_id: question.id,
      sequence_number: question.sequence_number,
      selected_key: answers[question.id] ?? null,
      payload: question.options_payload as unknown as KepribadianOptionsPayload,
    }));

    return (
      <section className="surface-card mx-auto my-6 w-[calc(100%-2rem)] max-w-3xl space-y-5 px-6 py-8 sm:px-8">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
            <Check className="size-7" strokeWidth={2.5} />
          </span>
          <h2 className="font-heading mt-3 text-2xl text-foreground">Latihan selesai</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Jawaban latihan hanya tersimpan selama halaman ini terbuka.
          </p>
        </div>
        <KepribadianReview items={items} />
        <Button
          variant="primary"
          size="lg"
          block
          onClick={() => {
            setAnswers({});
            setIdx(0);
            setFinished(false);
          }}
        >
          Mulai ulang latihan
        </Button>
      </section>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={showFinish}
        onClose={() => setShowFinish(false)}
        onConfirm={() => {
          setShowFinish(false);
          setFinished(true);
        }}
        title="Selesaikan latihan?"
        confirmLabel="Selesai latihan"
      >
        <div className="inset-panel flex items-baseline justify-between gap-4 px-4 py-3">
          <span className="text-muted-foreground">Terjawab</span>
          <span className="tnum font-semibold text-foreground">
            {answeredCount} dari {sorted.length} pernyataan
          </span>
        </div>
        <p className="text-muted-foreground">
          Anda tetap dapat menyelesaikan latihan meskipun masih ada pernyataan yang belum dijawab.
        </p>
      </ConfirmDialog>

      <ExamBody
        navigator={
          <QuestionNavigator
            itemLabel="Pernyataan"
            questionIds={sorted.map((question) => question.id)}
            answers={answers}
            currentIndex={idx}
            onGoTo={goTo}
            onSubmit={() => {
              if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
              setShowFinish(true);
            }}
            submitLabel="Selesai Latihan"
          />
        }
      >
        <article key={q.id} data-active-question tabIndex={-1} className="enter-rise space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="qnum tnum">Pernyataan {idx + 1}</p>
            {payload?.aspect && <Badge tone="info">{payload.aspect}</Badge>}
          </div>

          <div className="q-card mx-auto w-full max-w-2xl">
            <p className="mx-auto max-w-[46ch] py-4 text-center text-xl font-semibold leading-relaxed text-foreground sm:py-6 sm:text-2xl">
              {payload?.statement}
            </p>
          </div>

          <fieldset className="opts mx-auto max-w-2xl">
            <legend className="sr-only">Seberapa sesuai pernyataan ini dengan Anda</legend>
            {payload?.choices?.map((c) => {
              const isSelected = picked === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => pick(c.key)}
                  aria-pressed={isSelected}
                  className={`opt ${isSelected ? "sel" : ""}`}
                >
                  <span className="mark">{isSelected && <span className="mark-dot" />}</span>
                  <span className="opt-text">{c.text}</span>
                  <kbd className="hidden font-mono text-xs text-faint-foreground sm:block">{c.key}</kbd>
                </button>
              );
            })}
          </fieldset>
        </article>
      </ExamBody>

      <ExamDock
        onPrev={() => goTo(idx - 1)}
        onNext={() => goTo(idx + 1)}
        prevDisabled={idx === 0}
        nextDisabled={idx >= sorted.length - 1}
        prevLabel="Pernyataan sebelumnya"
        nextLabel="Pernyataan berikutnya"
      />
    </>
  );
}
