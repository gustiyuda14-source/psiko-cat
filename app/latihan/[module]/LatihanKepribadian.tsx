"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SafeQuestion, KepribadianOptionsPayload } from "@/lib/types/safe-question";
import { Badge, Meter } from "@/app/components/ui";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { Check, ChevronLeft, ChevronRight } from "@/app/components/icons";
import { QuestionNavigator } from "@/app/components/ExamChrome";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";

export default function LatihanKepribadian({ questions }: { questions: SafeQuestion[] }) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.sequence_number - b.sequence_number),
    [questions]
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
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
    return (
      <section className="surface-card mx-auto max-w-lg space-y-4 px-6 py-8 text-center sm:px-8">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="font-heading text-2xl text-foreground">Latihan selesai</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Anda telah menjawab <span className="tnum font-semibold text-foreground">{answeredCount}</span> dari{" "}
            <span className="tnum font-semibold text-foreground">{sorted.length}</span> pernyataan.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Jawaban latihan hanya tersimpan selama halaman ini terbuka.
        </p>
        <Button
          variant="primary"
          size="lg"
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
    <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-6">
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

      <main className="min-w-0 flex-1 space-y-4">
      <div className="surface-card flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
        <p className="tnum text-sm text-foreground">
          Pernyataan <span className="font-semibold">{idx + 1}</span>
          <span className="text-muted-foreground"> dari {sorted.length}</span>
        </p>
        <div className="flex items-center gap-4">
          <p className="tnum text-xs text-muted-foreground">{answeredCount} terjawab</p>
          <Meter
            value={answeredCount}
            max={sorted.length}
            tone="primary"
            className="w-24"
            label={`${answeredCount} dari ${sorted.length} pernyataan terjawab`}
          />
        </div>
      </div>

      <article key={q.id} data-active-question tabIndex={-1} className="surface-card enter-rise overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-6">
          <h2 className="tnum text-sm font-semibold text-foreground">Pernyataan {idx + 1}</h2>
          {payload?.aspect && <Badge tone="info">{payload.aspect}</Badge>}
        </div>

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
                onClick={() => pick(c.key)}
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
                <kbd className="hidden font-mono text-xs text-faint-foreground sm:block">{c.key}</kbd>
              </button>
            );
          })}
        </fieldset>
      </article>

      <nav className="flex gap-3" aria-label="Navigasi pernyataan latihan">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => goTo(idx - 1)}
          disabled={idx === 0}
          className="flex-1 sm:flex-none"
        >
          <ChevronLeft className="size-4" />
          Sebelumnya
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => goTo(idx + 1)}
          disabled={idx >= sorted.length - 1}
          className="flex-1 sm:ml-auto sm:min-w-40 sm:flex-none"
        >
          Pernyataan berikutnya
          <ChevronRight className="size-4" />
        </Button>
      </nav>
      </main>
    </div>
  );
}
