"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { recordLatihanProgress } from "@/lib/latihan-progress";
import type { SafeQuestion, KepribadianOptionsPayload } from "@/lib/types/safe-question";
import { Badge } from "@/app/components/ui";
import { Button, ConfirmDialog } from "@/app/components/ui-client";
import { Check } from "@/app/components/icons";
import { ExamBody, ExamDock, QuestionNavigator } from "@/app/components/ExamChrome";
import { PribadiReview, type PribadiReviewItem, type PribadiReviewSummary } from "@/app/components/PribadiReview";
import { useExamKeyboard } from "@/lib/hooks/use-exam-keyboard";

// Latihan PRIBADI: butir Kepribadian (Likert 4) dan Substansi Khusus (A/B) dalam
// satu paket, urut sequence_number. Label aspek bisa disembunyikan peserta
// (pedoman §7.1, tahap tryout mini); preferensinya disimpan per browser.
const ASPECT_PREF = "pribadi-show-aspect";

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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ summary: PribadiReviewSummary; items: PribadiReviewItem[] } | null>(null);
  const finished = result !== null;
  // Komponen ini baru dirender setelah peserta menekan "Mulai" (LatihanGate),
  // jadi selalu di browser — aman membaca localStorage di initializer.
  const [showAspect, setShowAspect] = useState(() => {
    try {
      return localStorage.getItem(ASPECT_PREF) !== "0";
    } catch {
      return true;
    }
  });
  const toggleAspect = () => {
    setShowAspect((v) => {
      try {
        localStorage.setItem(ASPECT_PREF, v ? "0" : "1");
      } catch {}
      return !v;
    });
  };
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

  const submit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/practice/pribadi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: sorted.map((question) => ({ question_id: question.id, selected_key: answers[question.id] ?? null })),
        }),
      });
      if (!res.ok) throw new Error("Pembahasan belum dapat dimuat. Coba selesaikan lagi.");
      const data = (await res.json()) as { summary: PribadiReviewSummary; items: Omit<PribadiReviewItem, "payload">[] };
      const payloadById = new Map(sorted.map((question) => [question.id, question.options_payload as unknown as KepribadianOptionsPayload]));
      setResult({
        summary: data.summary,
        items: data.items.map((item) => ({ ...item, payload: payloadById.get(item.question_id)! }) as PribadiReviewItem),
      });
      window.scrollTo({ top: 0 });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Pembahasan belum dapat dimuat. Coba selesaikan lagi.");
    } finally {
      setSubmitting(false);
    }
  }, [answers, sorted]);

  if (!q) return null;

  if (result) {
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
        <PribadiReview summary={result.summary} items={result.items} />
        <Button
          variant="primary"
          size="lg"
          block
          onClick={() => {
            setAnswers({});
            setIdx(0);
            setResult(null);
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
          void submit();
        }}
        title="Selesaikan latihan?"
        confirmLabel="Selesai latihan"
      >
        <div className="inset-panel flex items-baseline justify-between gap-4 px-4 py-3">
          <span className="text-muted-foreground">Terjawab</span>
          <span className="tnum font-semibold text-foreground">
            {answeredCount} dari {sorted.length} butir
          </span>
        </div>
        <p className="text-muted-foreground">
          Anda tetap dapat menyelesaikan latihan meskipun masih ada butir yang belum dijawab.
        </p>
      </ConfirmDialog>

      <ExamBody
        navigator={
          <QuestionNavigator
            itemLabel="Butir"
            questionIds={sorted.map((question) => question.id)}
            answers={answers}
            currentIndex={idx}
            onGoTo={goTo}
            onSubmit={() => {
              if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
              setShowFinish(true);
            }}
            submitLabel={submitting ? "Memuat pembahasan…" : "Selesai Latihan"}
          />
        }
      >
        <article key={q.id} data-active-question tabIndex={-1} className="enter-rise space-y-5">
          {submitError && (
            <p role="alert" className="rounded-md bg-destructive-soft px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="qnum tnum">Butir {idx + 1}</p>
            <div className="flex flex-wrap items-center gap-2">
              {payload?.subtes === "SK" ? (
                <Badge tone="accent">Substansi Khusus</Badge>
              ) : (
                <>
                  {showAspect && payload?.aspect ? <Badge tone="info">{payload.aspect}</Badge> : <Badge tone="neutral">Kepribadian</Badge>}
                  <button
                    type="button"
                    onClick={toggleAspect}
                    aria-pressed={showAspect}
                    className="text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    {showAspect ? "Sembunyikan aspek" : "Tampilkan aspek"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="q-card mx-auto w-full max-w-2xl">
            <p className="mx-auto max-w-[46ch] py-4 text-center text-xl font-semibold leading-relaxed text-foreground sm:py-6 sm:text-2xl">
              {payload?.statement}
            </p>
          </div>

          <fieldset className="opts mx-auto max-w-2xl">
            <legend className="sr-only">
              {payload?.subtes === "SK" ? "Pilih yang paling sesuai" : "Seberapa sesuai pernyataan ini dengan Anda"}
            </legend>
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
